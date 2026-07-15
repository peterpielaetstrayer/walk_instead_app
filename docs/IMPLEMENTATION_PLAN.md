# Walk Instead v0.1 — Implementation Plan

## Goal

Ship a complete, polished, mobile-first PWA prototype that embodies **Walk first. Decide afterward.** — local-only data, three-second start, timestamp-based timer recovery, optional check-in/reflection, and honest install/offline support.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- `next/font` (Inter)
- `lucide-react` for sparse line icons
- `@ducanh2912/next-pwa` or `serwist` for service worker / offline
- Vitest for unit tests; Playwright optional for one smoke E2E
- No backend, auth, or analytics

## Architecture

```
src/
  app/                 # Routes
  components/          # UI primitives + feature components
  lib/
    types.ts           # WalkEvent, UserSettings
    storage.ts         # Versioned localStorage abstraction
    walk-logic.ts      # Timer, recovery, summaries
    format.ts          # Duration / date helpers
  hooks/               # useWalkStore, useTimer, useInstallPrompt
  public/              # Manifest icons, offline assets
```

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Home — primary Walk Instead CTA |
| `/onboarding` | First-use (4 steps, skippable practice) |
| `/walk` | Active walk + timer recovery |
| `/check-in` | Post-walk state + useful pause |
| `/reflection` | Optional note |
| `/history` | Summaries + list |
| `/history/[id]` | Event detail / edit / delete |
| `/settings` | Intention, privacy, safety, data controls |

## Data

- Versioned key `walk-instead:v1`
- Validate + migrate on read; graceful empty fallback
- Active walk recovered from `startedAt` timestamps (never tick-count as source of truth)
- Stale active threshold: **6 hours** → recovery dialog

## Build sequence

1. Scaffold + design tokens + shell
2. Storage + domain utils + tests
3. Components (buttons, timer, sheets, selectors)
4. Screens / routes in product order
5. PWA manifest + icons + offline
6. A11y / reduced motion / responsive shell
7. README, PRODUCT_DECISIONS, QA gates

## Done when

All §30 completion criteria pass: onboarding → walk → check-in → history, timer survives refresh, no duplicate actives, local export/delete, offline central flow, typecheck/lint/test/build green.

## Status (v0.1)

Implemented and verified locally: typecheck, lint, unit tests (15), production webpack build, route smoke (200s).
