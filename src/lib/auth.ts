/**
 * Client-side Google OAuth via Google Identity Services (GIS) token model.
 * Runs entirely in the browser (popup) — no client secret, no backend.
 * We request only the `drive.appdata` scope: a private, app-owned folder in the
 * user's Drive that the app can read/write but is invisible in their Drive UI.
 */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const GIS_SRC = 'https://accounts.google.com/gsi/client';
// If GIS never calls back (popup lost on a mobile tab switch, etc.), don't hang forever.
// This is now the only thing that ends a flow where popup_closed never resolves either way.
const INTERACTIVE_TIMEOUT_MS = 30_000;
const SILENT_TIMEOUT_MS = 15_000;

interface TokenResponse {
  access_token: string;
  expires_in: number;
  error?: string;
  error_description?: string;
}

interface TokenClient {
  requestAccessToken: (overrides?: { prompt?: string }) => void;
  callback: (resp: TokenResponse) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (resp: TokenResponse) => void;
            error_callback?: (err: { type: string }) => void;
          }) => TokenClient;
          revoke: (token: string, done?: () => void) => void;
        };
      };
    };
  }
}

let gisPromise: Promise<void> | null = null;
let tokenClient: TokenClient | null = null;
let accessToken: string | null = null;
let tokenExpiry = 0; // epoch ms
// initTokenClient's error_callback is set once, not per-request, so route it to
// whichever request is currently in flight.
let pendingReject: ((e: Error) => void) | null = null;

export function isConfigured(): boolean {
  return typeof CLIENT_ID === 'string' && CLIENT_ID.length > 0;
}

function loadGis(): Promise<void> {
  if (gisPromise) return gisPromise;
  gisPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) return resolve();
    const script = document.createElement('script');
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google sign-in.'));
    document.head.appendChild(script);
  });
  return gisPromise;
}

/**
 * Start loading the GIS script ahead of a sign-in tap. Mobile browsers are far
 * stricter than desktop about treating a popup as user-initiated the longer it's
 * delayed after the click — preloading keeps requestAccessToken() close to the
 * tap instead of waiting on a script fetch first.
 */
export function preloadGis(): void {
  if (isConfigured()) void loadGis().catch(() => {});
}

function describeGisError(type: string): string {
  switch (type) {
    case 'popup_closed':
    case 'popup_closed_by_user':
      return 'Sign-in window was closed before finishing. Please try again.';
    case 'popup_failed_to_open':
      return 'Your browser blocked the sign-in popup. Allow popups for this site and try again.';
    default:
      return `Sign-in failed (${type}). Please try again.`;
  }
}

async function getClient(): Promise<TokenClient> {
  if (!isConfigured()) throw new Error('Google sign-in is not configured (missing VITE_GOOGLE_CLIENT_ID).');
  await loadGis();
  if (!tokenClient) {
    tokenClient = window.google!.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID!,
      scope: SCOPE,
      callback: () => {}, // replaced per-request below
      error_callback: (err) => {
        // Mobile Chrome often can't script-close the consent tab after a
        // multi-step OAuth flow (closing is only allowed if the tab's history
        // is still a single entry), so the user ends up manually switching
        // away from it — sometimes seconds after the real token already
        // arrived via postMessage, sometimes well after. A short grace period
        // isn't reliable here, so don't treat this as fatal at all: let the
        // request's own timeout (below) be the only thing that gives up.
        if (err.type === 'popup_closed' || err.type === 'popup_closed_by_user') return;
        pendingReject?.(new Error(describeGisError(err.type)));
        pendingReject = null;
      },
    });
  }
  return tokenClient;
}

/**
 * Get a valid access token. With interactive=false GIS tries to obtain a token
 * without UI (works if the user previously granted access in this browser).
 */
export function getAccessToken(interactive: boolean): Promise<string> {
  return new Promise((resolve, reject) => {
    void (async () => {
      try {
        // Reuse a still-valid token (60s safety margin).
        if (accessToken && Date.now() < tokenExpiry - 60_000) return resolve(accessToken);

        const client = await getClient();

        const timer = setTimeout(
          () => {
            pendingReject = null;
            reject(new Error("Sign-in didn't complete. Please try again."));
          },
          interactive ? INTERACTIVE_TIMEOUT_MS : SILENT_TIMEOUT_MS,
        );

        pendingReject = (e) => {
          clearTimeout(timer);
          reject(e);
        };
        client.callback = (resp) => {
          clearTimeout(timer);
          pendingReject = null;
          if (resp.error) return reject(new Error(resp.error_description || resp.error));
          accessToken = resp.access_token;
          tokenExpiry = Date.now() + resp.expires_in * 1000;
          resolve(accessToken);
        };
        client.requestAccessToken({ prompt: interactive ? 'consent' : '' });
      } catch (e) {
        reject(e instanceof Error ? e : new Error(String(e)));
      }
    })();
  });
}

export function signOut(): void {
  if (accessToken && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(accessToken);
  }
  accessToken = null;
  tokenExpiry = 0;
}
