# Walk Instead — Product Decisions

## 1. Why the app starts the walk before requesting context

The product exists for low-motivation, activated moments. Any form, mood picker, or confirmation before moving becomes friction that users skip — or worse, an invitation to keep ruminating. Starting the timer immediately creates a commitment artifact (“I already chose to walk”) and preserves the three-second start proposition. Context (trigger, check-in, note) can be added later without breaking the interruption.

## 2. Why the default is ten minutes

Ten minutes is long enough to change physiological state and interrupt an automatic loop, short enough to feel doable when motivation is thin. It is a pause, not a workout. Users may end early without judgment or continue past ten minutes; the target is a default commitment, not a requirement.

## 3. Why practice walks are excluded from moments interrupted

“Moments interrupted” is personal evidence about real interruptions. Practice walks exist to learn the flow before it is needed. Counting them would inflate the metric and blur the signal the history screen is meant to provide.

## 4. Why data is local-first

Walk notes and triggers can be sensitive. A prototype with no account, no sync, and no transmission reduces trust cost and keeps the app usable offline. Local storage matches the product promise: private, fast, and available when the network is not.

## 5. Why there is no streak

Streaks create pressure and shame when broken — the opposite of a nonjudgmental pause tool. The goal is noticing what happens when you walk first, not maintaining a perfect chain of behavior.

## 6. Why GPS is excluded

Location tracking adds privacy risk, battery cost, permission friction, and fitness-product connotations. Walk Instead cares that you began moving and later notice how you feel — not where you went or how far.

## 7. Why the app does not judge the eventual decision

After a walk, people may still smoke, scroll, cancel, or proceed. The intervention’s success is creating a pause, not dictating the outcome. Observational language (“Better”, “About the same”, “Worse”) supports noticing without grading character.

## 8. Why this is a PWA rather than separate native applications

A PWA can sit on the home screen, work offline after first visit, and ship one codebase for personal prototypes and small betas. Native apps would delay validating the core loop. Installation is encouraged but optional; browser use remains valid.

## Additional prototype decisions

- **Stale active walk threshold:** 6 hours. After that, the app offers complete check-in, mark unfinished, or delete — never silently starting a new walk over an old active event.
- **Timer source of truth:** `startedAt` timestamps. Display ticks are visual only; refresh and tab sleep cannot reset elapsed time.
- **Schema version:** `walk-instead:v1` with validate-on-read and room for future migrations.
