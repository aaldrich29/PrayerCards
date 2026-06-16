# Prayer Cards — Roadmap & Design Notes

This file captures where the app is, the decisions behind it, and what's planned next, so
future work (by a human or an AI agent) has the context it needs.

## Status: v1 (shipped)

A mobile-first, local-first PWA. All data lives in the browser (`localStorage`); optional
"Sign in with Google" syncs a single JSON document to the user's own Google Drive
(`appDataFolder`) with **no backend**.

Implemented:
- Cards (prayer **requests** and **verses**), organized by **category** and assigned to **people**.
- **Cadence** per card (daily / weekly / monthly / every-N-days / none). A card re-enters the
  "stack" when its period elapses since last prayed, and leaves once prayed.
- **Pray mode**: swipe deck (right = prayed, left = later, tap = flip for notes/stats). Scope to the
  whole Daily Stack, a category, or a person.
- **Lifecycle**: archive, **Answered** box with testimony notes; per-card stats (times prayed, last
  prayed, added).
- **Storage**: localStorage (offline-first) + optional Google Drive sync (last-write-wins) + manual
  JSON export/import.
- **Themes**: 4 themes via runtime CSS tokens (`data-theme` on `<html>`) — Midnight, Light, Sepia,
  and **Index Card** (paper stock, ruled lines, red margin line, serif card font). Picker in Settings.
- **Stats / prayer tracking**: dedicated Stats tab — total prayers, current streak, this-week count,
  active days, a 30-day activity chart, and most-prayed-for ranking. Per-card 14-day sparkline on the
  card back. All derived from each card's `prayLog` timestamps (`src/lib/stats.ts`, unit-tested).
- **PWA**: installable + offline. Deploys to GitHub Pages via `.github/workflows/deploy.yml`.

## Key architecture decisions

- **No backend by design.** OAuth uses the Google Identity Services *token model* entirely in the
  browser (no client secret). The only scope is `drive.appdata` — a private, app-owned folder the
  user never sees and we never access server-side.
- **Stack engine is pure** (`src/lib/stack.ts`) and unit-tested — it's the heart of the app.
- **Single-document data model** (`AppData` in `src/types.ts`) so sync is one JSON blob.
- **Dev lives on local disk**, not `G:\My Drive` — npm can't reliably write `node_modules` to the
  Google Drive virtual filesystem.

## Planned next (rough priority order)

### Sync robustness
- **Field-level / per-record merge** instead of last-write-wins, so edits on two offline devices
  don't clobber each other. Likely a per-card `updatedAt` + merge by id.
- Surface conflict/merge results in the UI (currently a silent last-write-wins).
- Show the signed-in Google account email (add `email` scope or call userinfo).

### Prayer experience
- **Drag-to-reorder** cards within a category (the `order` field already exists).
- **Snooze** vs "later": optional "skip for the rest of this period" on left-swipe.
- **Search & tags** across cards.
- Up-swipe = prayed (in addition to right-swipe), down = skip.
- Stats: monthly/yearly views, per-category breakdown, calendar heatmap.

### Content
- **Auto-fetch verse text** from a public API when adding a verse by reference (keep manual entry as
  fallback so the app stays offline-capable). Decide on a license-clean source.
- Card images / colors per card.

### Reminders (deferred from v1 on purpose)
- Optional **PWA push notifications** for "you have N cards due" (works on Android; iOS is limited
  and may need a lightweight push relay — revisit only if requested).

### Polish / ops
- More themes (high-contrast, OLED black, seasonal) — the token system makes new themes a small
  addition in `src/index.css` + an entry in the Settings picker.
- Onboarding for first-run instead of seeded sample data (or a "load sample data" button).
- **Google OAuth verification** to lift the "unverified app" warning + 100-user cap (needed only for
  wide public distribution).
- Bundle size: code-split Framer Motion / lazy-load non-Pray views if needed.

## Testing & verification

- `npm test` — stack-engine unit tests (cadence boundaries, due logic, markPrayed, buildStack).
- `npm run build` — type-check + production build (also generates the PWA service worker).
- Manual: add cards with different cadences, swipe to pray, confirm they leave the stack and
  re-appear after the period; mark answered/archive; export/import JSON; (with a client ID) sign in
  and confirm `prayer-cards.json` appears in Drive `appDataFolder` and syncs across devices.
