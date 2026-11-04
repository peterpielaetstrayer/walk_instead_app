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
