/**
 * Sync orchestration between the local store and Google Drive.
 * Strategy (v1): last-write-wins by AppData.updatedAt.
 *  - On link / load: compare local vs Drive; newer one wins.
 *  - On any local change while linked: debounced push to Drive.
 */
import { create } from 'zustand';
import { useAppStore } from '../store/useAppStore';
import { isConfigured, getAccessToken, signOut } from './auth';
import { findFile, downloadFile, createFile, updateFile, type DriveFile } from './drive';
import { mergeAppData } from './merge';

const LINKED_KEY = 'prayer-cards-linked';
const PUSH_DEBOUNCE_MS = 3000;

export type SyncStatus = 'idle' | 'connecting' | 'syncing' | 'synced' | 'error' | 'offline';

interface SyncState {
  linked: boolean;
  status: SyncStatus;
  lastSyncedAt?: number;
  error?: string;
  configured: boolean;
  link: () => Promise<void>;
  unlink: () => void;
  syncNow: () => Promise<void>;
}

let fileId: string | null = null;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let suppressPush = false; // avoid echoing a freshly-pulled state back to Drive
let subscribed = false;

export const useSyncStore = create<SyncState>((set, get) => ({
  linked: localStorage.getItem(LINKED_KEY) === '1',
  status: 'idle',
  configured: isConfigured(),

  link: async () => {
    if (!isConfigured()) {
      set({ status: 'error', error: 'Google sign-in is not configured.' });
      return;
    }
    set({ status: 'connecting', error: undefined });
    try {
      await getAccessToken(true); // interactive popup
      localStorage.setItem(LINKED_KEY, '1');
      set({ linked: true });
      await reconcile(set);
      startAutoPush();
    } catch (e) {
      set({ status: 'error', error: errMsg(e) });
    }
  },

  unlink: () => {
    signOut();
    localStorage.removeItem(LINKED_KEY);
    fileId = null;
    set({ linked: false, status: 'idle', lastSyncedAt: undefined, error: undefined });
  },

  syncNow: async () => {
    if (!get().linked) return;
    try {
      await reconcile(set);
    } catch (e) {
      set({ status: 'error', error: errMsg(e) });
    }
  },
}));

/**
 * Merge local and remote (per-record, never a blind whole-document overwrite —
 * see `mergeAppData`), then write the merged result both ways so neither side
 * loses data the other doesn't have.
 */
async function reconcile(set: (p: Partial<SyncState>) => void): Promise<void> {
  set({ status: 'syncing', error: undefined });
  const local = useAppStore.getState().getData();
  const remoteFile = await findFile(false);

  if (!remoteFile) {
    const created = await createFile(local);
    fileId = created.id;
    set({ status: 'synced', lastSyncedAt: Date.now() });
    return;
  }

  fileId = remoteFile.id;
  const remote = await downloadFile(remoteFile.id);
  const merged = mergeAppData(local, remote);

  suppressPush = true;
  useAppStore.getState().replaceData(merged);
  suppressPush = false;

  await updateFile(fileId, merged);
  set({ status: 'synced', lastSyncedAt: Date.now() });
}

async function pushNow(): Promise<DriveFile | void> {
  const data = useAppStore.getState().getData();
  if (fileId) return updateFile(fileId, data);
  const created = await createFile(data);
  fileId = created.id;
  return created;
}

function schedulePush() {
  if (suppressPush) return;
  if (!useSyncStore.getState().linked) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(async () => {
    try {
      useSyncStore.setState({ status: 'syncing' });
      await pushNow();
      useSyncStore.setState({ status: 'synced', lastSyncedAt: Date.now(), error: undefined });
    } catch (e) {
      useSyncStore.setState({ status: 'error', error: errMsg(e) });
    }
  }, PUSH_DEBOUNCE_MS);
}

function startAutoPush() {
  if (subscribed) return;
  subscribed = true;
  useAppStore.subscribe((state, prev) => {
    if (state.updatedAt !== prev.updatedAt) schedulePush();
  });
}

/** Called once on app start: silently reconnect if previously linked. */
export async function initSync(): Promise<void> {
  const s = useSyncStore.getState();
  if (!s.linked || !isConfigured()) return;
  try {
    useSyncStore.setState({ status: 'connecting' });
    await getAccessToken(false); // silent (no popup) if session still valid
    await reconcile((p) => useSyncStore.setState(p));
    startAutoPush();
  } catch {
    // Silent token failed (e.g. expired session). Leave linked; user can tap to reconnect.
    useSyncStore.setState({ status: 'idle' });
  }
}

function errMsg(e: unknown): string {
  if (!navigator.onLine) return 'You appear to be offline.';
  return e instanceof Error ? e.message : 'Sync failed.';
}
