/**
 * Client-side Google OAuth via Google Identity Services (GIS) token model.
 * Runs entirely in the browser (popup) — no client secret, no backend.
 * We request only the `drive.appdata` scope: a private, app-owned folder in the
 * user's Drive that the app can read/write but is invisible in their Drive UI.
 */

// A Google client_id only ever contains [0-9A-Za-z._-]. Strip anything else
// (stray whitespace, a BOM, or a zero-width space — common when the value is
// pasted into a CI secret): such an invisible character travels into the OAuth
// request as e.g. %E2%80%8B and makes Google reject it with invalid_client
// ("OAuth client was not found"). .trim() alone misses zero-width characters.
const CLIENT_ID =
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.replace(/[^0-9A-Za-z._-]/g, '') || undefined;
const SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const GIS_SRC = 'https://accounts.google.com/gsi/client';
// If GIS never calls back (popup lost on a mobile tab switch, etc.), don't hang forever.
// This is now the only thing that ends a flow where popup_closed never resolves either way.
const INTERACTIVE_TIMEOUT_MS = 30_000;
const SILENT_TIMEOUT_MS = 15_000;

// --- Redirect (implicit) flow, used on mobile / installed PWAs ---------------
// The GIS popup token model can't reliably deliver a token back to a standalone
// PWA or a mobile browser tab (the consent screen opens in a separate context
// and the postMessage with the token never reaches the waiting page). For those
// we instead navigate the page itself to Google's OAuth endpoint and read the
// token out of the URL fragment when Google redirects us back — same browsing
// context, so the token always comes home.
const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
// Survives the round-trip to accounts.google.com and back (localStorage, not
// sessionStorage, so it also survives a PWA process restart mid-flow).
const OAUTH_STATE_KEY = 'prayer-cards-oauth-state';

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

// Persist the access token across reloads so reopening the app within the
// token's ~1h lifetime reuses it instead of re-asking Google — otherwise every
// page load fires a "silent" token request that still briefly flashes the auth
// UI on mobile. The token is short-lived and scoped to drive.appdata (this
// app's private folder only).
const TOKEN_KEY = 'prayer-cards-token';

function persistToken(): void {
  try {
    if (accessToken) localStorage.setItem(TOKEN_KEY, JSON.stringify({ token: accessToken, expiry: tokenExpiry }));
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable (private mode quota, etc.) — fall back to memory-only */
  }
}

function loadPersistedToken(): void {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return;
    const { token, expiry } = JSON.parse(raw) as { token?: unknown; expiry?: unknown };
    // Only adopt a token with real life left; getAccessToken treats the last
    // 60s as already-expired, so match that here.
    if (typeof token === 'string' && typeof expiry === 'number' && Date.now() < expiry - 60_000) {
      accessToken = token;
      tokenExpiry = expiry;
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    /* ignore malformed/blocked storage */
  }
}

loadPersistedToken();

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
 * Load the GIS script and create the token client ahead of a sign-in tap.
 * Mobile browsers are far stricter than desktop about treating window.open()
 * as user-initiated the longer/more-removed it is from the click — even a
 * single microtask hop (an already-resolved `await`) can be enough for some
 * of them to stop counting it as a real user gesture. Doing all the async
 * setup ahead of time means getAccessToken() can call requestAccessToken()
 * fully synchronously within the click handler's own call stack once this
 * has resolved.
 */
export function preloadGis(): void {
  if (isConfigured()) void getClient().catch(() => {});
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

function requestToken(client: TokenClient, interactive: boolean): Promise<string> {
  return new Promise((resolve, reject) => {
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
      persistToken();
      resolve(accessToken);
    };
    // Called synchronously by the caller when possible — see getAccessToken.
    client.requestAccessToken({ prompt: interactive ? 'consent' : '' });
  });
}

/**
 * Get a valid access token. With interactive=false GIS tries to obtain a token
 * without UI (works if the user previously granted access in this browser).
 *
 * When the client is already initialized (preloadGis() ran earlier and
 * resolved), this calls requestAccessToken() synchronously in the caller's
 * own call stack — no await, not even a microtask — so a click handler that
 * calls this directly keeps the popup tied to the original user gesture as
 * tightly as this API allows.
 */
export function getAccessToken(interactive: boolean): Promise<string> {
  // Reuse a still-valid token — no popup needed at all.
  if (accessToken && Date.now() < tokenExpiry - 60_000) return Promise.resolve(accessToken);

  if (tokenClient) return requestToken(tokenClient, interactive);

  // Not preloaded yet (e.g. preloadGis() hasn't resolved, or sync isn't
  // configured until just now) — fall back to the async path. This is one
  // tick removed from the click, but only hit on a true first-ever attempt.
  return getClient().then((client) => requestToken(client, interactive));
}

/**
 * The exact URL Google redirects back to after consent. Must be registered as
 * an "Authorized redirect URI" on the OAuth client. It is the app's own base
 * URL (origin + Vite base path), e.g. https://<user>.github.io/PrayerCards/.
 */
function redirectUri(): string {
  return window.location.origin + import.meta.env.BASE_URL;
}

function isStandalonePwa(): boolean {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches === true ||
    // iOS Safari's non-standard standalone flag.
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isMobile(): boolean {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

/**
 * Whether interactive sign-in should use the full-page redirect flow instead of
 * the GIS popup. True for installed PWAs and mobile browsers, where the popup
 * token model fails to return a token; false on desktop, where the popup works
 * and is the nicer UX.
 */
export function shouldUseRedirect(): boolean {
  return isStandalonePwa() || isMobile();
}

/**
 * Navigate the page to Google's OAuth consent screen (implicit flow). This does
 * not return — the browser leaves the app. When Google redirects back,
 * consumeRedirectResult() picks the token out of the URL fragment on load.
 */
export function beginRedirectSignIn(): void {
  if (!isConfigured()) throw new Error('Google sign-in is not configured (missing VITE_GOOGLE_CLIENT_ID).');
  // CSRF guard: a random nonce we echo through `state` and verify on return.
  const state = crypto.randomUUID();
  localStorage.setItem(OAUTH_STATE_KEY, state);
  const params = new URLSearchParams({
    client_id: CLIENT_ID!,
    redirect_uri: redirectUri(),
    response_type: 'token',
    scope: SCOPE,
    include_granted_scopes: 'true',
    state,
    prompt: 'consent',
  });
  window.location.assign(`${AUTH_ENDPOINT}?${params}`);
}

export interface RedirectResult {
  ok: boolean;
  error?: string;
}

/**
 * If the current page load is a return from beginRedirectSignIn(), consume the
 * token (or error) from the URL fragment, store it, and strip it from the URL.
 * Returns null when this isn't an OAuth redirect return so the caller can fall
 * through to its normal startup path.
 */
export function consumeRedirectResult(): RedirectResult | null {
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  const hasToken = params.has('access_token');
  const hasError = params.has('error');
  if (!hasToken && !hasError) return null;

  // Always clear the one-time state and scrub the fragment from the URL/history,
  // regardless of outcome, so a token never lingers in the address bar.
  const expectedState = localStorage.getItem(OAUTH_STATE_KEY);
  localStorage.removeItem(OAUTH_STATE_KEY);
  history.replaceState(null, '', window.location.pathname + window.location.search);

  if (params.get('state') !== expectedState || !expectedState) {
    return { ok: false, error: 'Sign-in could not be verified. Please try again.' };
  }
  if (hasError) {
    return { ok: false, error: describeGisError(params.get('error') || 'unknown') };
  }

  accessToken = params.get('access_token');
  const expiresIn = Number(params.get('expires_in')) || 3600;
  tokenExpiry = Date.now() + expiresIn * 1000;
  persistToken();
  return { ok: true };
}

export function signOut(): void {
  if (accessToken && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(accessToken);
  }
  accessToken = null;
  tokenExpiry = 0;
  persistToken();
}
