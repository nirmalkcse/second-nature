# Reviewing an interface

How to audit existing work against the eight pillars and report it so that someone can act on it.

## 1. Start with what a machine can find

```bash
node scripts/audit.mjs <path-to-project>            # human-readable
node scripts/audit.mjs <path-to-project> --json     # for tooling
```

The script reads CSS, HTML, JSX/TSX, Vue, Svelte and Astro files and reports the tells that can be detected statically: `transition: all`, ease-in on interface motion, entering from `scale(0)`, animated layout properties, ungated hover, `100vh`, small input text, disabled zoom, removed focus outlines, missing reduced-motion handling, uniform long durations, and more. Each finding has a file, a line, the reason and the fix.

It cannot judge feel, hierarchy or taste. Treat its output as the floor, not the review.

## 2. Then use it

If it can be run, run it, on the smallest screen you can. Do the main task start to finish, twice. Notice every moment of hesitation, waiting or surprise. Those are the findings; the code tells you why.

If it cannot be run, say so, and mark every judgement about feel as unverified.

## 3. Walk the eight questions

| # | Ask | Look for |
| --- | --- | --- |
| 1 | **What here does the person not need right now?** | More than one primary action; options that could be defaults; steps that could be removed; decoration; labels that repeat; borders doing the job of space |
| 2 | **Does it move like a real object?** | Feedback on release; ease-in; fixed tweens after drags; animations that block input or cannot be reversed; hard stops at edges; popovers scaling from the centre; things appearing from nowhere; motion on high-frequency actions |
| 3 | **Is the geometry systematic?** | Off-scale spacing; same radius nested; mixed radii; misaligned edges; optical centring; fractional pixels; inconsistent margins |
| 4 | **Does every action get an answer?** | Missing pressed, focus, busy, done, failed or disabled states; controls that resize between states; spinners that flash; errors far from their cause; silent failures |
| 5 | **Is it consistent?** | Two components for one job; raw values instead of tokens; different motion on similar elements; mixed icon sets; platform conventions broken |
| 6 | **How much must they remember, decide or decode?** | Unclear location or way back; too many choices; placeholder-only labels; information needed from a previous screen; confirmations where undo would do; small or distant targets |
| 7 | **Do the small parts hold up?** | Empty, loading, error and offline states; long and short content; dark mode; large text; right-to-left; truncation; numerals that jitter; widows; keyboard and focus order |
| 8 | **Does anyone wait without knowing why?** | Layout properties animated; state set per frame; heavy blur; layout shift on load; no intent preloading; blocking spinners; work on the main thread during transitions |

Each row maps to a reference file with a full checklist at its end.

## 4. Rank by damage

| Severity | Meaning | Examples |
| --- | --- | --- |
| **Breaks trust** | People cannot complete the task, lose work, or are excluded | Unreachable by keyboard; input blocked during animation; no error recovery; contrast failures; zoom disabled; lost state |
| **Feels cheap** | Works, but reads as unfinished within seconds | Late press feedback; ease-in; janky scroll; pinched nested corners; layout shift; flashing loaders |
| **Polish** | Only noticed in aggregate | Tracking on large type; optical centring; stagger timing; shadow layering |

Fix in that order. Within a level, fix responsiveness and performance first (nothing else registers without them), then structure and hierarchy, then geometry and type, then motion, then delight.

## 5. Report

Lead with a two- or three-sentence verdict: what is working, the one thing that would improve it most, and what you could not assess. Then the table, most damaging first:

| Where | What | Why it matters | Change to |
| --- | --- | --- | --- |
| `Sheet.tsx:42` | Closes with `ease-in 400ms`; input blocked until it ends | Slow start reads as lag, and the person waits on the software | Spring `duration 0.35, bounce 0`; interruptible |
| `Card.css:18` | Child radius equals parent radius (16 inside 16, 12 px gap) | Gap pinches at the corners | `calc(16px - 12px)`, min 4 px |
| `Button.tsx:9` | No pressed state; feedback on click only | Feels unresponsive on touch | `:active { scale: 0.97 }` at 100 ms |

Rules for the table:

- One row per distinct problem, not per occurrence. Note the count ("and 14 more") and fix the pattern at its source.
- "Why it matters" is the effect on the person, not a restatement of the rule.
- "Change to" is specific enough to apply: a value, a token, a named pattern.
- Do not pad with praise or with findings you would not fix.

Close with **what was verified and how** (ran it, tests, audit output, profile) and **what needs a device or a person** (feel, haptics, 120 Hz, real content).

## 6. A ten-minute pass

When there is only time for a quick look:

1. Press every button. Does it answer on the way down?
2. Open and close every overlay quickly, twice, mid-animation. Does anything jump or lock?
3. Resize to the smallest width and the largest text size.
4. Tab through the page. Can you see where you are, and reach everything?
5. Switch to dark mode and to reduced motion.
6. Throttle the network and reload. What moves? What flashes?
7. Squint. What is the loudest thing? Is it the right thing?
8. Look at one corner, one icon and one line of text at 800%.

Eight checks find most of what a full review would.
