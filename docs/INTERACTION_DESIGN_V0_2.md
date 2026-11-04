# Walk Instead v0.2 — Interaction flow draft

**Status:** Design and functional draft only. Do not merge, deploy, publish to stores or collect user data without separate review and explicit approval.

**Design board:** https://www.figma.com/design/9ZguHOWm5ygFLNat9xmJMj

## Why this work exists

The July v0.1 prototype introduced a one-button pause and timestamp-based timer, but required four-step onboarding for a new user and a post-walk state selection before completing check-in. Those are avoidable decisions at precisely the time when the user may have little bandwidth.

The current draft tests a **Quiet Editorial** design direction and the principle **"Walk first. Decide afterward."**

## Updated prototype flow

1. **Home → Begin walking.** First-time users go straight into a session; no forced onboarding, account, mood or route question. A prior active walk resumes rather than creating duplicates.
2. **Walk → Timer.** The established 10-minute timestamp-based pause now uses a simpler linear progress display. Early finishing is allowed; an expired timer offers check-in or continued walking.
3. **Optional thought capture.** A text-note bottom sheet leaves the timer running. Notes live in existing local walk records; no microphone recording, transcription or backend is introduced. Unsafe attention while walking is explicitly discouraged.
4. **Check-in → Completely optional.** Three equally weighted observations, none selected by default. An optional secondary usefulness question is available but not required. Skipping is a first-class exit.
5. **Choice → Agency.** Users can return to their day, begin another pause, or add a note. The app makes no moral judgment about what they choose afterward.

## Deliberate non-features

- No Supabase, login, sync, GPS, maps, route generation, subscription plan, AI suggestions or voice recording.
- No streaks, success/failure scoring, mandatory reflection or medical efficacy claim.
- The original multi-step onboarding route still exists as optional legacy material. It should be redesigned/retired after validated first-run testing; the home no longer forces it.
- Familiar-route preparation remains a design hypothesis in the Figma board, not a feature. No interface should pretend an algorithm has generated a safe route.

## Regression and acceptance checklist

- [ ] New browser with no local data → home → single action starts timer without onboarding.
- [ ] Repeat tap / revisit after lock / refresh → resumes existing walk, does not duplicate.
- [ ] Early finish → check-in; both skip and state selection lead to choice; status stays completed.
- [ ] No state selected → completed event persists without a false mood observation.
- [ ] Time target reached → keep walking or check in; no forced ending.
- [ ] Thought capture → cancel preserves prior note; save writes one local note without resetting timer.
- [ ] Offline after initial PWA installation → central flow still works.
- [ ] Storage failure → transparent notice; no claim that note persisted.
- [ ] Keyboard, text zoom, screen reader, bright sunlight, narrow phone, reduced motion and contrast QA.
- [ ] Voice microphone permissions, route/location privacy, paid tier and app stores must be separately designed and approved if ever pursued.

CI runs static verification via GitHub Actions when this draft PR opens. A passing build will **not** substitute for actual device and accessibility testing.

## Provisional visual direction

A — Quiet Editorial is the working design only, informed by comparison with B — Grounded Wayfinding and C — Focused Instrument in the Figma review board. Typography, copy, secondary-action placement and contrast need real-user critique. No universal "optimal" design is claimed.

**No release authorization.** This draft is for discussion, inspection and iterative evaluation.

## Initial human feedback and open QA blocker — November 4, 2026

A first reviewer found the interface appropriately simple and straightforward but reported **loading errors in some pathways**. The exact paths, error strings and device/browser are not yet known, so no cause or fix is verified.

Read-only inspection confirmed:
- Vercel preview commit `df58d61` was **READY**, and the corresponding GitHub Actions workflow passed lint, typecheck, tests and production build.
- Vercel Authentication protection is enabled for preview deployments (`all_except_custom_domains`); this may affect access, but is **not** proof that it caused the pathway errors.
- No server-side runtime error clusters or recent runtime log records were returned for the inspected period. **Browser-side errors may not be captured by those server logs.**
- This is a PWA using a service worker. Stale cached assets across builds are a plausible issue to investigate, not a confirmed diagnosis.

**Open QA blocker (do not close or merge yet):** Capture exactly which route or interaction failed, what appeared on screen, browser/OS, and whether a fresh browser/private window reproduces. Test both direct deep links and in-app navigation for `/`, `/walk`, `/check-in`, `/choice`, `/reflection`, `/history`, `/history/[id]` and `/settings`. Verify behavior with and without existing saved walk data, including no completed check-in and early finishing. Validate session and PWA cache behavior before changing service-worker configuration. Keep the preview protected while testing and avoid using real sensitive notes during debugging.

**Design interpretation:** The minimal interface is an intended feature, but stability, predictable transitions, accessibility and high-quality typography/spatial rhythm remain necessary for a polished public product. Do not respond to the feedback by adding dashboard clutter or decorative features.

## November 4 — targeted stability follow-up for user-reported pathways

Peter recalled the loading problems most likely occurred during **Save a thought** and **Finish early** in the v0.2 preview. This is not yet an exact, independently reproduced browser error trace.

**Code issues identified and corrected on the draft branch:**
- The common `BottomSheet` and `ConfirmationDialog` had an inline `onClose` in their focus-effect dependency array. Because the live timer and typed note rerendered the parent frequently, this repeatedly tore down/reinitialized dialog focus (potentially knocking focus out of the note field). The effect now remains attached while open, using the latest close callback from a ref.
- Both live-walk clock readers used `useSyncExternalStore` with raw `Date.now()` snapshots, which are not stable across React snapshot reads. They now use one-second state updates and refresh on focus/visibility changes while still computing progress from the persisted start timestamp.
- Added a jsdom dialog-focus regression test and Playwright browser smoke flows covering start → note → save → finish early → skip check-in → intentional choice → history, plus reload/resume. The Playwright test intentionally blocks service workers so app navigation is independently diagnosed from PWA cache behavior. Offline/service-worker QA remains separate.

**Status:** Fixes committed, but not to be claimed as confirmed resolution until green tests and a real-device repeat. Keep PR draft and maintain the loading issue as an open QA gate if phone failures persist. No production merge or manual deployment was performed.
