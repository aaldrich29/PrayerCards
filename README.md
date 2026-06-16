# Prayer Cards

A mobile-first, **local-first** prayer app. It emulates carrying a stack of business‑card‑sized
prayer cards: add requests and verses, organize them by category and people, and pray over the
cards that are *due today*. Swipe to pray; the card leaves the stack until its next period.

- **No backend, no accounts, no server-side storage.** Hosts as a static site.
- **Works fully offline** using on-device storage (`localStorage`) — no login required.
- **Optional "Sign in with Google"** backs up / syncs your data to **your own** Google Drive
  (a private app folder). Done entirely in the browser; the app never sees your data.

## How it works

- A card has a **cadence** (daily / weekly / monthly / every N days / none). It re-enters the
  "stack" when its period elapses since you last prayed for it, and disappears once prayed.
- **Pray** view = a swipe deck. Swipe **right = prayed**, **left = later**. Tap a card to flip it
  for notes and stats (times prayed, last prayed, date added).
- Cards can be **archived** or moved to the **Answered** box (with an optional testimony note).
- Pray your whole **Daily Stack**, or filter to a **category** or **person**.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # stack-engine unit tests (Vitest)
npm run build    # type-check + production build to dist/
```

> Note: keep this project on a local disk, not inside a Google Drive (`G:\My Drive`) folder —
> `npm` cannot reliably write `node_modules` to Drive's virtual filesystem.

## Optional: enable Google Drive sync

1. In **Google Cloud Console** → APIs & Services:
   - Enable the **Google Drive API**.
   - Configure the **OAuth consent screen** (External). Add yourself as a test user. The only
     scope needed is `.../auth/drive.appdata` (a private, app-only folder).
   - Create an **OAuth Client ID** (type: *Web application*). Under **Authorized JavaScript
     origins** add `http://localhost:5173` and your production origin
     (e.g. `https://<user>.github.io`).
2. Copy `.env.example` to `.env` and set `VITE_GOOGLE_CLIENT_ID=...`.
3. Run the app, open **Settings → Google Drive sync → Sign in with Google**.

Notes:
- The OAuth client ID is **public** by design for this browser-only flow — there is no secret.
- Until the consent screen is verified by Google, you'll see an "unverified app" warning and a
  100-user cap. That's fine for personal/family use.

## Deploy (GitHub Pages)

Push to `main`. The included workflow (`.github/workflows/deploy.yml`) builds and deploys to Pages,
setting the base path to `/<repo>/` automatically. To enable Drive sync in production, add a repo
secret named `GOOGLE_CLIENT_ID` and add the Pages origin to your OAuth client's authorized origins.

## Tech

Vite · React · TypeScript · Tailwind CSS · Zustand (persisted to localStorage) · Framer Motion
(swipe deck) · vite-plugin-pwa (installable + offline).
