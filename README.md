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
- Inter + Fraunces via `next/font` (Quiet Editorial working direction)
- LocalStorage (versioned) for persistence
- `@ducanh2912/next-pwa` for service worker / offline
- Vitest for unit tests, plus draft Playwright smoke tests
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
| `npx playwright test --config playwright.config.mjs` | Browser smoke test (requires browser-test dependencies) |

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
| `/onboarding` | Legacy optional setup flow; **not required to start** |
| `/walk` | Active timer + recovery |
| `/check-in` | Fully optional neutral post-walk observation |
| `/choice` | Intentional next step after completing a walk |
| `/reflection` | Optional written thought after a walk |
| `/history` | Summaries + list |
| `/history/[id]` | Event detail / edit / delete |
| `/settings` | Default walk duration (5/10/15/20 minutes), intention, privacy, safety, data |
| `/offline` | Offline fallback |

## Local data model

Stored under `walk-instead:v1`:

- `WalkEvent` — id, timestamps, duration, status, practice flag, optional trigger / stateAfter / usefulPause / note
- `UserSettings` — legacy onboarding, optional implementation intention, calm-time duration preference (5/10/15/20 minutes; 600s default)

Reads are validated; corrupt or foreign-version data falls back safely. Schema version supports future migration.

## Timer recovery

Elapsed time is always `now - startedAt`. A visual interval updates the UI only. Refresh, sleep, lock, or reopen recovers the same active event. Pressing **Walk Instead** while an active walk exists resumes it (no duplicates). Active walks older than **6 hours** show a neutral unfinished-walk recovery dialog.

## PWA behavior

- Web app manifest + theme/background colors
- Standalone display
- Legacy icon (path / forward-movement mark); branding/icon refresh remains a v1 task
- Service worker in production builds caches the central flow for offline use after first visit
- Legacy onboarding includes install guidance; a full public-release installation/help experience is not yet complete

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

## Current review stage

The v0.2 redesign and developing v1 hardening work are in [draft PR #1](https://github.com/peterpielaetstrayer/walk_instead_app/pull/1), not merged into the production `master` branch. See [V1_PRODUCT_RELEASE_BLUEPRINT.md](docs/V1_PRODUCT_RELEASE_BLUEPRINT.md) for explicit release gates and [INTERACTION_DESIGN_V0_2.md](docs/INTERACTION_DESIGN_V0_2.md) for implemented flow and open QA. User feedback on the preview is encouraging; beta testing and release qualifications remain unverified.

## Known prototype limitations

- No cross-device sync
- Install prompt availability varies by browser
- Offline requires a prior successful visit/build with SW registered
- No voice notes (deferred)
- Browser smoke tests have been added to draft CI; **do not claim them passing until the latest run succeeds**
- Storage unavailable modes keep an in-memory session only

## Deferred features

- Consent-based anonymous product analytics hooks
- Alternate movement/reset flow for cases when walking is inaccessible or unsafe
- Richer migration tooling / import JSON
- Native wrappers (only if product validation warrants them)

See `docs/PRODUCT_DECISIONS.md` for why the product is shaped this way.
