# Walk Instead — release QA evidence ledger

**Date:** 2026-11-04  
**Branch:** `design/v0-2-quiet-editorial-interruption-flow`  
**Release status:** Draft, unmerged. The public `master` version remains separate.  
**Companion canonical plan:** [V1_PRODUCT_RELEASE_BLUEPRINT.md](V1_PRODUCT_RELEASE_BLUEPRINT.md)

## Verified evidence (and its limits)

| Claim | Status | Evidence | Limitation |
| --- | --- | --- | --- |
| One-time dependency refresh installed and built | Verified | [Action run 41869257234](https://github.com/peterpielaetstrayer/walk_instead_app/actions/runs/41869257234), successful prior to artifact commit | Security findings should be rerun on exact final release commit |
| Next.js and Playwright pinned to patched/testable versions | Verified by branch `package.json` | `next@16.4.5`, `eslint-config-next@16.4.5`, `@playwright/test@1.64.1`; lockfile committed | No native-store qualification implied |
| Production high/critical dependency audit | Passed on draft CI | [Action run 41871695509](https://github.com/peterpielaetstrayer/walk_instead_app/actions/runs/41871695509); `npm audit --omit=dev --audit-level=high` success | Does not clear moderate or dev dependency advisories |
| Main browser note → early finish → skip check-in flow | Passed on prior browser run | [Action run 41870945589](https://github.com/peterpielaetstrayer/walk_instead_app/actions/runs/41870945589) | Newest commit must be retested; same run also found selector problems elsewhere |
| Walk resume after refresh | Passed on prior browser run | [Action run 41871695509](https://github.com/peterpielaetstrayer/walk_instead_app/actions/runs/41871695509) | Does not prove all devices or older persisted data |
| Configured duration survives a walk and refresh | Passed on prior browser run | [Action run 41871695509](https://github.com/peterpielaetstrayer/walk_instead_app/actions/runs/41871695509) | Tests five-minute setting in Chromium; no iOS/Android evidence |
| Previously visited walk reopened offline and text note saved locally | Passed on prior browser run | [Action run 41871695509](https://github.com/peterpielaetstrayer/walk_instead_app/actions/runs/41871695509), real service worker enabled | Does not test fresh install offline, every route, or SW version rollover |
| Entire four-test browser suite on current head | **Pending at writing** | First three of four passed in run 41871695509; remaining failure was ambiguous text locator matching the heading and Next route announcer; corrected in a subsequent commit | **Do not mark green until latest exact head succeeds** |
| Reviewer's manual preview interaction | Informally passed | Peter reported earlier loading paths were now working | Device/version, reproducible steps and complete matrix not recorded |
| Mobile screen reader and 200% zoom | **Not tested** | None | Critical release QA gate |
| PWA upgrade/cache rollover on real devices | **Not tested** | None | Critical data-continuity gate |
| Nonwalking alternative | **Design unresolved** | No implementation | Important safety/accessibility gate, not just a visual feature |

## Focused accessibility contrast review

Static WCAG relative-luminance computations from CSS palette (calculations, **not** screen-reader or visual-audit certification):

| Pair | Contrast | Observation |
| --- | ---: | --- |
| Main text `#273329` on page `#f6f4ee` | 11.99:1 | Exceeds 4.5:1 |
| Secondary text `#5b665f` on page | 5.44:1 | Exceeds 4.5:1 |
| Muted text `#646e67` on page | 4.81:1 | Exceeds 4.5:1 |
| White text on primary `#315a4b` | 7.79:1 | Exceeds 4.5:1 |
| Primary on subtle `#e7ede6` | 6.55:1 | Exceeds 4.5:1 |
| Earlier decorative border `#d4d8d1` on page | 1.31:1 | Insufficient if used to distinguish an interactive control |
| **New control border `#7d8b82` on page** | **3.24:1** | Exceeds 3:1 for required nontext control boundaries |
| **New control border `#7d8b82` on surface `#fffefa`** | **3.53:1** | Exceeds 3:1 |

**Scope:** Apply stronger control border to textareas, radio-like choices, input fields, secondary buttons. Retain lighter borders only when decorative separation is not essential to identifying a control. This does not validate icons, disabled states, focus order, hover, all text sizes or platform rendering.

## Reproduction and issue policy

- Every reported failure should record **commit SHA, browser/version, OS, relevant saved state, expected result, actual result, and screenshot/trace** where available.
- Playwright now uploads failure traces/screenshots from CI for seven days; browser errors should never be ignored merely because navigation visually reaches its target.
- The service worker is registered defensively, and `cacheOnFrontEndNav` is enabled to support offline reload after a visited route is cached. Verify behavior on real install/update cycles before release.
- During testing, use synthetic notes and trigger labels; avoid recording sensitive personal disclosures in diagnostic traces.
- Pending issues should be marked **not run** or **unresolved**, not silently changed to passed.
- No merge, production deployment, beta recruitment, app-store submission or public release without Peter's separate authorization.

## Next release QA order

1. Verify **all four browser scenarios green on exact PR head** and security audit remains green.
2. Regression of first-use, background/reopen, early-stop, note cancel/save and check-in skip on iPhone and Android.
3. Offline installation, offline reload, service-worker upgrade and local data preservation.
4. VoiceOver/TalkBack, keyboard Tab/Shift+Tab and Escape, visible focus, 200% zoom and reduced motion.
5. Privacy/support text, safe non-walking flow, beta study and explicit release decision.

**Priority:** finish reliability and test evidence, **not** additional routes, voice notes, cloud accounts, subscriptions or dashboard features.
