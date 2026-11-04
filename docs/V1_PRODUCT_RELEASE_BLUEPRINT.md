# Walk Instead — v1.0 Product & Release Blueprint

> **Status:** working draft / reviewable canonical plan  
> **Date:** 2026-11-04  
> **Product owner:** Peter  
> **Primary source:** existing `master` v0.1 prototype and draft [PR #1](https://github.com/peterpielaetstrayer/walk_instead_app/pull/1)  
> **Design comparison:** [Figma directions v0.2](https://www.figma.com/design/9ZguHOWm5ygFLNat9xmJMj)  
> **Previous decision record:** [PRODUCT_DECISIONS.md](PRODUCT_DECISIONS.md), [INTERACTION_DESIGN_V0_2.md](INTERACTION_DESIGN_V0_2.md)  
> **Governance:** Design/development in a **draft branch**; production merge, public launch, beta invitations, store submission, spending and distribution require **separate explicit approval**.

## 1. Product contract

**Category:** standalone behavioral-interruption tool.  
**Promise:** *Walk first. Decide afterward.*  
**Working tagline:** *Change your state. Choose your next step.*  
**Human-centered design question:** When an urge, automatic behavior or activated emotional state narrows choice, what is the smallest, safest, most dignified interface that makes a pause available?

The app does **not** guarantee a physiological effect, treat substance-use disorders, anxiety or other diagnoses, or judge the decision after a pause. Movement is the flagship default intervention, not a compulsory health prescription.

**Core loop:** Open → **Begin walking** (no blocking intake) → elapsed/timestamp-backed timer → optional note and early finish → optional neutral check-in → **choose next step**. The app must stay useful if the user does not feel better or declines to share a rating.

**Design commitments**:
- Action before reflection; one dominant action during the urgent moment.
- User-controlled, compassionate copy without streaks, grades, shame, celebratory animations or nudges that exploit distress.
- A clearly signposted way to avoid walking when it is unsafe or inaccessible; choose its exact v1 implementation through accessibility review rather than inventing unsupported coaching.
- Local-first, no account, no GPS, no network dependency after first proper PWA install; no cloud transmission of sensitive notes/trigger fields.
- Optional calm-time preferences are a **separate mental mode**; do not add a new onboarding burden.
- Clear, honest information about local device storage and data loss on browser-clear/uninstall.

## 2. Release target and boundaries

**v1.0 target:** a **free, production-ready installable PWA**, mobile-first and usable in a normal browser, with a reliable, accessible, dignified, complete core flow. iOS and Android home-screen use should be tested; native app-store distribution is **not** a prerequisite for v1.0.

### Must ship in the PWA v1.0

| ID | Capability | Acceptance in plain language | Current status |
| --- | --- | --- | --- |
| P0-01 | Instant start | First visit or returning user can start in one dominant interaction without onboarding, login, mood or route selection | Implemented in PR #1; device test pending |
| P0-02 | Single active walk and recovery | Repeat taps/reload/background resume same walk; clock derives from timestamps, including offline use | Implemented; broaden regression tests |
| P0-03 | End early / keep walking / overtime | User may stop before/after default without penalty, go to optional check-in, or continue | Implemented; phone test partial |
| P0-04 | Completely optional check-in | Nothing is preselected; a skip leaves a completed record with no rating, not an invented state | Implemented; full browser CI pending |
| P0-05 | Intentional re-entry | Return to day, take another pause, or record a thought; no instruction about user's ultimate behavior | Implemented; assess language and loop |
| P0-06 | Basic written thought capture | Note can be entered, saved, read, edited/deleted and exported locally; timer continues | Implemented; test note focus/data failure |
| P0-07 | Privacy and control | No signup or tracking; clear local storage disclosure; export and delete all data, plus delete one walk | Existing functionality; audit controls |
| P0-08 | Offline and update recovery | Central flow works after install, including reload and version updates without broken cached routes | Requires device/PWA verification |
| P0-09 | Accessible and safer alternatives | Keyboard, focus-trap dialogs, contrast, text scaling and reduced motion work; movement alternatives for inability/unsafe walking addressed | **Open design + QA gate** |
| P1-01 | Adjustable default duration | Choose from a small set at calm-time settings, default 10 min; existing active walk remains unchanged | **Implemented on draft branch; verification pending** |
| P1-02 | Finished visual system | Deliberate typography, hierarchy, responsive spacing, icons, loading/error/empty states, quality copy | Quiet Editorial direction implemented; polish pending |
| P1-03 | Useful installation and support | Honest install guidance per browser, accessible support/contact and privacy information, clear nonclinical scope | Partial; release copy pending |

### Explicitly deferred / future experiments

- Optional saved familiar routes and suggested walking loops; GPS mapping or route-safety claims require research, permission architecture and privacy review.
- Voice recording, transcription, searchable idea library, AI reflection, cloud sync, subscriptions or paywalls. Never gate the core intervention or data deletion behind payment.
- Analytics or A/B testing tied to sensitive triggers; if any analytics become warranted, use privacy review and informed opt-in before implementation.
- LOCUS/OWLL integration remains a separate educational design research track. Never automatically share route, note or behavioral data with learning systems.
- App Store and Google Play distribution are later *channel decisions*, not prerequisites to proving the product. Apple’s guideline 4.2 expects meaningful functionality beyond a repackaged website; review policy before any native wrapper submission. Sources: https://developer.apple.com/app-store/review/guidelines/ and https://support.google.com/googleplay/android-developer/answer/14151465 .

## 3. Release milestones / gates (order matters)

### M0 — Current draft integrity, evidence, branch hygiene
**Output:** draft PR #1 with all static checks, jsdom focus tests and browser-level smoke tests passing for **the same head commit**; no abandoned/queued workflow silently interpreted as pass. Document limitations and any unverified PWA behavior. Keep existing v0.1 production alive.  
**Gate:** CI green **and** first-run / note / finish early / skip / choice path verified manually.  
**Current blocker:** latest CI flows were queued at planning; user reports current preview works but phone/browser matrix is not complete.

### M1 — Functional completeness and behavior polish
**Output:** design-review each path and ambiguity; improve direct start/resume, cancel vs save thought, early end, late end, skip, re-entry, history and settings. Add calm-time duration presets (e.g. 5 / 10 / 15 / 20 minutes) without changing active walk, followed by safety/accessibility alternative design. Eliminate obsolete forced onboarding route and stale copy **only after preserving data compatibility**.  
**Gate:** every P0 acceptance scenario works without a stuck loading screen, lost data, duplicate walk or accidental rating.

### M2 — Quality, accessibility, privacy
**Output:** systematic screen-by-screen audit, including WCAG 2.2 AA-informed keyboard/focus/contrast tests, strong mobile touch targets, zoom to 200% and reflow, VoiceOver/TalkBack tests, reduced motion, low-power/offline transitions, browser support, safe-use wording, stored-data threat model and explicit honest storage limitations.  
**Gate:** no critical a11y, privacy or data-loss issues; all observed errors have owner, reproduction steps and resolution evidence.

### M3 — Private evidence-building beta (separate consent gate)
**Output:** invite a small number of consenting **adults** through an approved process, with synthetic demonstration scenarios, not demands for personal substance-use disclosures. Compare first-use understanding, unexpected hesitation, comfort, repeat use, what makes the app feel intrusive, and usability when no mood improvement occurs. No clinical efficacy conclusions from such a beta.  
**Gate:** observed friction resolved; privacy notice and support route in place. Peter approves recruitment first.

### M4 — Production and PWA release (separate publication gate)
**Output:** tagged and documented release candidate, tested production build, rollback plan, live privacy/help contact pages, install validation on Android/iOS, data continuity check across updates, monitoring plan that does not expose note contents, changelog, explicit public release approval.  
**Gate:** Peter reviews final checklist and authorizes the actual merge/deployment. Do not rely on a Vercel READY status as evidence of all gates.

### M5 — Optional distribution after v1.0
Evaluate Google Play's current testing policy, Apple’s minimum-functionality and privacy requirements, additional native capabilities, support costs and actual user demand. Native wrappers are not automatically justified by a functional PWA.

## 4. Quality and evaluation criteria (working thresholds, not observed outcomes)

- **Discoverability:** most consenting testers can find the begin action without instruction; document hesitation and explanations rather than cherry-picking impressions.
- **Time-to-action:** target near-immediate first/return start; no intermediate multi-step screens. Measure from app ready to start action, report median and range separately from loading/network time.
- **Comprehension:** testers can explain *what the app does*, *what it does not do* and what happens to notes.
- **Agency:** can decline all ratings, finish early and continue past target with no negative copy; outcome options never imply a required emotional improvement.
- **Reliability:** no reproducible stuck loading path, fatal browser exception, duplicate active walk or unintended note loss in release matrix. Browser testing must include PWA enabled **and** blocked-service-worker controls.
- **Accessibility:** use WCAG 2.2 AA as target; prioritize visible focus, unambiguous control labels, touch targets (aim 44×44 CSS px as ergonomic practice), contrast, focus containment and return, zoom/reflow, reduced motion and screen-reader announcement cadence. Official reference: https://www.w3.org/TR/WCAG22/.
- **Data integrity:** export files parse, deletion works, localStorage unavailability is disclosed, upgrades preserve records or fail safely. No analytics tied to behavior until explicitly approved.
- **Safety:** advise movement only where safe; do not encourage interacting with the screen while crossing roads, driving or navigating hazards; offer alternatives when walking is inaccessible. Avoid claims that ten minutes reliably changes physiology.

## 5. Test matrix and proof protocol

| Test | First visit | Returning / data | Narrow viewport | iOS Safari/PWA | Android Chrome/PWA | Desktop keyboard | Offline | Expected evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Start in one action, no onboarding | Required | Required | Required | Required | Required | Required | Follow-up | Video/steps; no extra prompt |
| Reload/close/reopen/return and resume | Required | Required | Required | Required | Required | Required | Required | Same walk ID, accurate time |
| Save/edit/cancel text thought | Required | Required | Required | Required | Required | Required | Required | Note intact or intentionally discarded |
| Finish early / skip rating / choice | Required | Required | Required | Required | Required | Required | Required | Completed unrated record |
| Target reached / continue beyond | Required | Required | Required | Required | Required | Required | Required | No forced ending |
| History / export / delete | Required | Required | Required | Required | Required | Required | Required | No silent data loss |
| Dialog focus / Escape / screen reader | Required | Required | Required | Required | Required | Required | — | Focus stays within, returns on close |
| App update across cached SW versions | — | Required | Required | Required | Required | Required | Required | Fresh assets + old data survive |

**Evidence rules:** Link each test to source commit, test script or manual test record, OS/browser, timestamp, exact outcome and known exceptions. Mark **not run** rather than pass if untested. CI validates code and a browser baseline, not all mobile/assistive/offline states.

## 6. Known risks and immediate backlog

| Priority | Risk / gap | Evidence at blueprint creation | Next bounded action |
| --- | --- | --- | --- |
| Critical | Recent browser smoke CI not yet green | Workflow runs for latest draft reported queued; earlier static build was green | Inspect latest run and logs; repair any failure; require green on latest head |
| High | PWA cache/upgrade and offline behavior unverified | Prior preview loading reports; user later reports flows work; no comprehensive SW test | Test install, offline, refresh, cache/version rollover on devices |
| High | Dialog accessibility/focus trap not complete | Dialog restores focus, Escape; no explicit Tab trap/inert background confirmed | Implement and verify keyboard focus containment, close button and return |
| High | Walk alternatives and safe movement guidance | Walk is flagship; no robust non-walking fallback in current product | Prototype accessible alternative and evaluate with users before implementing |
| High | Sensitive note storage on shared devices / browser deletion | localStorage and clear/export present; privacy implications remain | Plain-language privacy notice, device/shared-use limitations and data retention review |
| Medium | Duration setting verification | Draft now offers 5/10/15/20 minute settings and data validation | Confirm preference survives refresh and does not alter an active walk; browser QA pending |
| Medium | History summary needs regression confirmation | Draft now counts only check-in respondents in the denominator and uses observational language | Validate negative/skip cases and require green tests |
| Medium | Old onboarding/manual copy not aligned | Legacy `/onboarding` and some README/settings copy refer to mandatory flow | Audit copy and revise after navigation/data compatibility testing |
| Medium | Visual polish not yet measured | Figma direction A selected provisionally; no completed contrast/zoom testing | Screen-by-screen design review and full interaction states |
| Medium | Support and transparent app info | Prototype contains Safety section but not release-grade help/privacy page | Draft truthful notices; confirm operator contact method without inventing address |

## 7. Product decisions / review authority

**Confirmed**: immediate start, no compulsory questionnaire, 10-minute default, simple timer, optional written reflection, free core, local-first, private nonjudgmental history, choice after pause.

**Provisional**: Quiet Editorial as brand foundation; exact copy, voice and contrast treatment, flow for safe nonwalking reset, optional duration presets and a very small adult beta.

**Parked**: route preparation/generation, voice and AI capture, pricing, Supabase/cloud sync, native packaging, educational integration.

**Requires explicit Peter approval**: new accounts or cloud collection, using real user or behavioral data in analytics/research, participant recruitment/invitations, spending, public distribution, app-store submission, production merge/deployment or a consequential change to agreed schedule.

## 8. Next bounded execution package

1. **Primary:** Clear browser CI on draft PR #1, then run documented real-device navigation checks. The newly introduced browser test should be treated as a test target, not as evidence of success before CI completes.
2. **Secondary:** Review and verify the newly implemented calm-time duration presets and observation-based history text; then prioritize focus/accessibility and offline integrity before new features.
3. **Administrative:** Keep this blueprint and a concise Peter OS status link in a draft PR. Do not activate an expansive parallel product workload during existing graduate-school and HRWC commitments.

**Definition of v1.0 done:** all release-critical functions pass the supported device/browser matrix; the app can be installed and updated without losing user data; core paths function offline; privacy, safety and accessibility are truthfully documented; there are no known high-severity unresolved failures; beta evidence is reviewed; **and Peter explicitly approves production release**. An attractive Figma design, green build or Vercel READY deployment alone never satisfies this definition.

## 9. Execution record — November 4 follow-through

After creating this blueprint, the draft PR received bounded implementation changes:

- Added **5 / 10 / 15 / 20 minute default walk options** in Settings, preserving the currently active walk's target duration and keeping the urgent-start screen free of a time picker.
- Added conservative validation for finite, integer stored default durations and regression tests for a changed preference with an existing walk.
- Updated the home screen's duration annotation to reflect the actual active walk or saved preference.
- Corrected **history summaries** so unrated pauses do not count as a usefulness verdict; changed summary language to reported observations rather than a causal claim.
- Expanded Playwright coverage for settings → begin walk → persistence, in addition to the existing save-thought, early-finish, skip-check-in and resume scenarios.
- Updated README navigation, documentation and legacy-onboarding labels to reflect current code.
- **CI blocker identified:** several interim runs failed TypeScript due to missing explicit `children` in the new React dialog-focus test's `createElement` props. Fixed in commit `8c9b914`; latest all-stage tests are **not yet verified** as passing. Do not interpret earlier Vercel READY previews as CI success.

**No production merge, manual deployment, paid service, account system, external recruitment or public release approval.** The draft branch remains the sole location of this v1 planning and implementation work.
