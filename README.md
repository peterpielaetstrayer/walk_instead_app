# Walk Instead

**Walk first. Decide afterward.**

Walk Instead is a lightweight behavioral-interruption PWA for cravings, spirals, scrolling loops, avoidance, and other automatic patterns. It does not prescribe the final decision — it helps create a pause by encouraging a short walk first.

Core loop: **Notice → Press → Walk → Return → Decide**

## Product principle

You do not have to resolve everything right now. Start moving first.

This is not a fitness tracker, sobriety program, clinical mental-health product, emergency service, AI therapist, social network, or streak/habit game.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Inter via `next/font`
- LocalStorage (versioned) for persistence
- `@ducanh2912/next-pwa` for service worker / offline
- Vitest for unit tests
- `lucide-react` for sparse icons

No backend, auth, database, analytics, or paid services.

## Local setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production build

```bash
npm run build
npm start
```

Production build uses webpack (`next build --webpack`) so the PWA service worker can compile. Dev uses Turbopack.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build (+ PWA worker) |
| `npm start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm test` | Vitest unit tests |

## Architecture

```
src/
  app/                 # Routes (pages)
  components/          # Shell, buttons, timer, dialogs, selectors
  lib/
    types.ts           # WalkEvent, UserSettings, tokens
    storage.ts         # Versioned localStorage + validation
    walk-logic.ts      # Timer, recovery, summaries
    walk-store.tsx     # Client state provider
    format.ts          # Duration / date display
docs/
  IMPLEMENTATION_PLAN.md
  PRODUCT_DECISIONS.md
public/
  manifest.webmanifest
  icons/               # SVG + raster PWA icons
```

## Routes

| Route | Screen |
|-------|--------|
| `/` | Home — **WALK INSTEAD** |
| `/onboarding` | First-use (4 steps) |
| `/walk` | Active timer + recovery |
| `/check-in` | Post-walk state |
| `/reflection` | Optional note |
| `/history` | Summaries + list |
| `/history/[id]` | Event detail / edit / delete |
| `/settings` | Intention, privacy, safety, data |
| `/offline` | Offline fallback |

## Local data model

Stored under `walk-instead:v1`:

- `WalkEvent` — id, timestamps, duration, status, practice flag, optional trigger / stateAfter / usefulPause / note
- `UserSettings` — onboarding, implementation intention, default duration (600s)

Reads are validated; corrupt or foreign-version data falls back safely. Schema version supports future migration.

## Timer recovery

Elapsed time is always `now - startedAt`. A visual interval updates the UI only. Refresh, sleep, lock, or reopen recovers the same active event. Pressing **Walk Instead** while an active walk exists resumes it (no duplicates). Active walks older than **6 hours** show a neutral unfinished-walk recovery dialog.

## PWA behavior

- Web app manifest + theme/background colors
- Standalone display
- Custom blue icon (path / forward-movement mark)
- Service worker in production builds caches the central flow for offline use after first visit
- Install UI uses `beforeinstallprompt` when available; otherwise honest platform guidance (especially iOS Safari)

## Privacy

- No account
- All walks and notes stay on-device
- Export JSON / delete all from Settings
- Nothing is sent to analytics in this prototype

## Accessibility

- Semantic structure, focus states, ≥44px targets
- Keyboard-operable dialogs with Escape / focus return
- Timer does not announce every second
- `prefers-reduced-motion` respected
- Zoom not disabled
- Outcome colors are paired with text labels (not color-only)

## Known prototype limitations

- No cross-device sync
- Install prompt availability varies by browser
- Offline requires a prior successful visit/build with SW registered
- No voice notes (deferred)
- No end-to-end browser automation in CI yet (unit coverage for core logic)
- Storage unavailable modes keep an in-memory session only

## Deferred features

- Consent-based anonymous product analytics hooks
- Optional duration presets beyond 10 minutes
- Richer migration tooling / import JSON
- Native wrappers (only if product validation warrants them)

See `docs/PRODUCT_DECISIONS.md` for why the product is shaped this way.
