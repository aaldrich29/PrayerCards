import { useSyncStore, type SyncStatus } from '../lib/sync';
import { formatRelative } from '../lib/dates';

const STATUS_LABEL: Record<SyncStatus, string> = {
  idle: 'Connected',
  connecting: 'Connecting…',
  syncing: 'Syncing…',
  synced: 'Synced',
  error: 'Sync error',
  offline: 'Offline',
};

export function SyncSection() {
  const { configured, linked, status, lastSyncedAt, error, link, unlink, syncNow } = useSyncStore();

  return (
    <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-400">Google Drive sync</h2>
      <p className="mb-3 text-sm text-slate-400">
        Optional. Back up to your <em>own</em> Google Drive so you can use multiple devices and never lose data. Your
        data is stored in a private app folder — we never see it.
      </p>

      {!configured ? (
        <div className="rounded-xl bg-slate-800/60 p-3 text-xs leading-relaxed text-slate-400">
          Sync isn't configured for this build. To enable it, create a Google OAuth client ID and provide it as
          <code className="mx-1 rounded bg-slate-700 px-1 text-slate-200">VITE_GOOGLE_CLIENT_ID</code>. Until then the
          app works fully offline using on-device storage.
        </div>
      ) : !linked ? (
        <button
          onClick={() => void link()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-medium text-slate-800"
        >
          <GoogleGlyph />
          Sign in with Google
        </button>
      ) : (
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dot status={status} />
              <span className="text-sm text-slate-200">{STATUS_LABEL[status]}</span>
            </div>
            {lastSyncedAt && <span className="text-xs text-slate-500">updated {formatRelative(lastSyncedAt)}</span>}
          </div>
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
          <div className="mt-3 flex gap-3">
            <button onClick={() => void syncNow()} className="flex-1 rounded-xl bg-slate-800 py-2.5 text-sm text-slate-200">
              Sync now
            </button>
            <button onClick={unlink} className="flex-1 rounded-xl bg-slate-800 py-2.5 text-sm text-slate-400">
              Disconnect
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function Dot({ status }: { status: SyncStatus }) {
  const color =
    status === 'error'
      ? 'bg-red-400'
      : status === 'syncing' || status === 'connecting'
        ? 'bg-amber-400'
        : status === 'synced'
          ? 'bg-emerald-400'
          : 'bg-slate-500';
  return <span className={`h-2.5 w-2.5 rounded-full ${color}`} />;
}

function GoogleGlyph() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z" />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
