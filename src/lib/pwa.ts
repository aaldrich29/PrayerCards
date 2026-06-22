// PWA install helpers. Centralizes the Chromium `beforeinstallprompt` capture,
// install/standalone detection, and an iOS check (Safari has no programmatic
// install, so there we fall back to manual "Add to Home Screen" instructions).

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

if (typeof window !== 'undefined') {
  // Chrome fires this when the app is installable. Stash it (and stop the
  // default mini-infobar) so we can prompt on our own terms — from the banner
  // or the Settings button — instead of whenever the browser decides.
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    notify();
  });
  // Once installed the prompt is spent; clear it so UI reflects "installed".
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notify();
  });
}

/** Subscribe to changes in install availability (for useSyncExternalStore). */
export function subscribeInstall(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** The captured prompt event, or null when no native prompt is available. */
export function getDeferredPrompt(): BeforeInstallPromptEvent | null {
  return deferredPrompt;
}

/** Trigger the native Chromium install prompt, if one was captured. */
export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredPrompt) return 'unavailable';
  await deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  // The event can only be used once.
  deferredPrompt = null;
  notify();
  return outcome;
}

/** True when running as an installed app (standalone display mode). */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari exposes its own flag rather than display-mode.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** True on iOS/iPadOS, where install is manual via the Share sheet. */
export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  // iPadOS 13+ masquerades as a Mac; detect it via touch support.
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

// --- Auto-prompt gating (persisted across visits) ---------------------------

const SNOOZE_KEY = 'pc-install-snooze';
const VISITS_KEY = 'pc-install-visits';

/** Timestamp (ms) before which the auto-banner should stay hidden. */
export function installSnoozedUntil(): number {
  const v = Number(localStorage.getItem(SNOOZE_KEY) ?? 0);
  return Number.isFinite(v) ? v : 0;
}

/** Suppress the auto-banner for the given number of days. */
export function snoozeInstall(days: number): void {
  localStorage.setItem(SNOOZE_KEY, String(Date.now() + days * 86400000));
}

/** Count this page load as a visit; returns the new total. */
export function recordVisit(): number {
  const n = visitCount() + 1;
  localStorage.setItem(VISITS_KEY, String(n));
  return n;
}

export function visitCount(): number {
  const v = Number(localStorage.getItem(VISITS_KEY) ?? 0);
  return Number.isFinite(v) ? v : 0;
}
