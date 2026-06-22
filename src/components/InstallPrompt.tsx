import { useEffect, useState, useSyncExternalStore } from 'react';
import {
  getDeferredPrompt,
  subscribeInstall,
  promptInstall,
  isStandalone,
  isIOS,
  installSnoozedUntil,
  snoozeInstall,
  recordVisit,
  visitCount,
} from '../lib/pwa';

// How long to wait after the first interaction before surfacing the banner, so
// it never interrupts the moment someone lands or taps something.
const DWELL_MS = 8000;
// How long to stay quiet after the user dismisses (or declines) the prompt.
const SNOOZE_DAYS = 14;

/** Reactive install state, shared by the banner and the Settings shortcut. */
export function useInstall() {
  const deferred = useSyncExternalStore(subscribeInstall, getDeferredPrompt, () => null);
  return {
    canPrompt: !!deferred, // Chromium native prompt is available
    ios: isIOS(), // needs manual Add to Home Screen
    standalone: isStandalone(), // already installed
    install: promptInstall,
  };
}

/**
 * Gentle, self-gating install nudge. It only appears once the user has actually
 * used the app — not on first load, not every visit — and goes quiet for two
 * weeks once dismissed. On iOS it points to the Share-sheet flow instead.
 */
export function InstallPrompt() {
  const { canPrompt, ios, standalone } = useInstall();
  const [show, setShow] = useState(false);
  const [iosOpen, setIosOpen] = useState(false);

  // Count this page load as a visit (once per mount).
  useEffect(() => {
    recordVisit();
  }, []);

  useEffect(() => {
    if (standalone) return; // already installed
    if (!canPrompt && !ios) return; // browser can't install it
    if (visitCount() < 2) return; // not on someone's very first session
    if (Date.now() < installSnoozedUntil()) return; // recently dismissed

    let timer: number | undefined;
    const onFirstInteraction = () => {
      timer = window.setTimeout(() => setShow(true), DWELL_MS);
    };
    window.addEventListener('pointerdown', onFirstInteraction, { once: true });
    return () => {
      window.removeEventListener('pointerdown', onFirstInteraction);
      if (timer) window.clearTimeout(timer);
    };
  }, [canPrompt, ios, standalone]);

  function dismiss() {
    snoozeInstall(SNOOZE_DAYS);
    setShow(false);
  }

  async function onInstall() {
    const outcome = await promptInstall();
    if (outcome !== 'accepted') snoozeInstall(SNOOZE_DAYS);
    setShow(false);
  }

  if (iosOpen) return <IOSInstructions onClose={() => setIosOpen(false)} />;
  if (!show) return null;

  return (
    // Sits above the bottom tab bar; opaque + z-50 so it cleanly covers the
    // floating add button while shown.
    <div className="fixed inset-x-0 bottom-20 z-50 mx-auto max-w-md px-3">
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="text-2xl leading-none">🙏</div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">Install Prayer Cards</p>
            <p className="mt-0.5 text-xs text-muted">
              Add it to your home screen for full-screen, offline access — and a tap away every day.
            </p>
          </div>
          <button onClick={dismiss} className="shrink-0 text-faint" aria-label="Dismiss">
            ✕
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={dismiss} className="flex-1 rounded-xl bg-surface2 py-2 text-sm font-medium text-muted">
            Not now
          </button>
          {canPrompt ? (
            <button onClick={onInstall} className="flex-1 rounded-xl bg-accent py-2 text-sm font-semibold text-accentink">
              Install
            </button>
          ) : (
            <button
              onClick={() => {
                setIosOpen(true);
                setShow(false);
              }}
              className="flex-1 rounded-xl bg-accent py-2 text-sm font-semibold text-accentink"
            >
              Show me how
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Settings shortcut: install now, or learn how, depending on the platform. */
export function InstallSettings() {
  const { canPrompt, ios, standalone, install } = useInstall();
  const [iosOpen, setIosOpen] = useState(false);

  return (
    <>
      {standalone ? (
        <p className="text-sm text-muted">Prayer Cards is installed on this device. 🎉</p>
      ) : canPrompt ? (
        <>
          <p className="mb-3 text-sm text-muted">Install Prayer Cards as an app for full-screen, offline access.</p>
          <button
            onClick={() => void install()}
            className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-accentink"
          >
            Install app
          </button>
        </>
      ) : ios ? (
        <>
          <p className="mb-3 text-sm text-muted">Add Prayer Cards to your Home Screen for full-screen, offline access.</p>
          <button
            onClick={() => setIosOpen(true)}
            className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-accentink"
          >
            How to install
          </button>
        </>
      ) : (
        <p className="text-sm text-muted">
          To install, open your browser&rsquo;s menu and choose{' '}
          <strong className="text-ink">Install app</strong> or{' '}
          <strong className="text-ink">Add to Home Screen</strong>.
        </p>
      )}
      {iosOpen && <IOSInstructions onClose={() => setIosOpen(false)} />}
    </>
  );
}

/** Bottom sheet walking iOS users through the Share-sheet install. */
export function IOSInstructions({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        className="safe-bottom w-full max-w-md rounded-t-3xl border-t border-border bg-bg p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />
        <h2 className="mb-1 text-lg font-semibold text-ink">Add to Home Screen</h2>
        <p className="mb-4 text-sm text-muted">In Safari, install Prayer Cards in three taps:</p>
        <ol className="space-y-3">
          <Step n={1}>
            Tap the <strong className="text-ink">Share</strong> button in Safari&rsquo;s toolbar — a square with an arrow
            pointing up.
          </Step>
          <Step n={2}>
            Scroll down and tap <strong className="text-ink">Add to Home Screen</strong>.
          </Step>
          <Step n={3}>
            Tap <strong className="text-ink">Add</strong> in the top-right corner.
          </Step>
        </ol>
        <button onClick={onClose} className="mt-6 w-full rounded-xl bg-accent py-3 text-sm font-semibold text-accentink">
          Got it
        </button>
      </div>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3 text-sm text-muted">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accentink">
        {n}
      </span>
      <span>{children}</span>
    </li>
  );
}
