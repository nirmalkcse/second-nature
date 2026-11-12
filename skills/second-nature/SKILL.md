---
name: second-nature
description: Design, build, animate, polish and review interfaces that feel like second nature - the craft behind Apple's platforms (radical simplicity, physics-based motion, continuous squircle geometry, haptic-grade feedback, low cognitive load, zero lag) as concrete rules, numbers, tokens and code. Use for ANY user-interface work on any stack - websites, landing pages, portfolios, web apps, dashboards, iOS, macOS, watchOS, visionOS and tvOS apps, React Native, Flutter, Android, desktop software, OS shells, console and TV interfaces, game menus and HUDs. Trigger when someone asks to design, build, restyle, animate or review a UI; says Apple-like, premium, polished, native, smooth, fluid, minimal, clean or intuitive; mentions springs, gestures, drag, swipe, sheets, haptics, microinteractions, squircles, Liquid Glass, design tokens or typography; or says something feels cheap, cluttered, janky, laggy or off. Also use when a UI is requested with no quality bar stated, because this skill is the quality bar.
---

# Second Nature

An interface has succeeded when people stop noticing it. They reach, it responds, the thing they wanted happens, and at no point did they think about the software. This skill is how to build that on purpose.

It distils how Apple's platforms earn that feeling (the Human Interface Guidelines, two decades of WWDC design talks, and what the shipping systems actually do) into decisions you can make and defend, plus tokens, physics code and checks you can use directly. It applies to any platform and any stack.

## How to hold this skill

**Principles, not costume.** The goal is an interface that behaves with this level of care, not one that looks like an Apple product. Keep the project's own brand, design system and platform conventions; apply these rules inside them. Do not reproduce Apple's trademarks, app icons or wallpapers, do not ship the San Francisco fonts outside Apple platforms (their licence forbids it; `system-ui` resolves to them where it is allowed), and do not imitate Liquid Glass on a product that has no reason to be made of glass. An Android app should feel like the best Android app, a Windows app like it belongs on Windows.

**Match the effort to the request.** A one-line fix to a button needs one rule from here, not a redesign. A new product surface deserves the whole loop below. Read what already exists before changing anything: existing tokens, components and motion values outrank the defaults in this skill.

**Every rule has a reason. Use the reason.** The numbers here are starting points that came from somewhere; the reasoning is what transfers. When a rule and its reason disagree in a specific case, follow the reason and say so.

**You cannot feel what you build.** You can verify structure, maths and performance from code; you cannot verify feel. Run it when you can, record it and step through frame by frame when you can, and tell the person plainly which parts need their hands on a real device.

## What to read

**This file is the working set.** It holds the decision rules, the numbers, the floor and the tells, and for most tasks it is all you need. The other files are depth, for when a task turns on one topic or you are stuck on a specific question.

Reading everything is the expensive mistake. In testing, agents that opened a dozen reference files to build a single page spent nearly twice the tokens of agents working with no skill at all, and passed exactly the same checks. Choose by the task:

| The task | Read beyond this file |
| --- | --- |
| A tweak, a fix, one component, a question | Nothing |
| Repairing or reviewing existing UI | Nothing. Run `scripts/audit.mjs` and work from the tells below |
| A page or a screen | Nothing, unless the stack's conventions are unfamiliar (then its platform guide) |
| Something dragged, swiped, flicked or snapped | [gestures.md](references/gestures.md) |
| A design system, a new product, a visual language | Up to three references from the table below |

- **Open a file to answer a question you can state** ("how should a sheet decide where to land?"), never to be thorough.
- **Three is the ceiling.** About to open a fourth? Build instead, and come back only for something specific.
- **Do not read `assets/` to learn the rules.** The rules are here. Open an asset when you are about to copy from it; the summary under *What ships with this skill* is enough to call the JavaScript.
- **Read in part.** Every reference opens with a contents list. Go to the section that answers your question.

## The eight pillars

Each is a question to ask of the work. The file beside it is depth; open it only for the reason given.

| # | Pillar | The question | Depth, and when it is worth opening |
| --- | --- | --- | --- |
| 1 | **Simplicity** | What here does the person not need right now? | [simplicity.md](references/simplicity.md): a screen with too much on it, a dense tool or dashboard |
| 2 | **Physics** | Does it move the way a real object would if I did that to it? | [gestures.md](references/gestures.md): anything dragged or swiped. [motion.md](references/motion.md): tuning springs past the defaults here, or choreographing several moving parts |
| 3 | **Geometry** | Are the shapes, spacing and alignment decided by a system, or by accident? | [geometry.md](references/geometry.md): drawing continuous corners on a specific platform, or setting up a shape and spacing system |
| 4 | **Feedback** | Does every action get an immediate, proportionate answer? | [feedback.md](references/feedback.md): haptics or sound, loading and progress, a custom control's full set of states |
| 5 | **Consistency** | Does the same thing look and behave the same everywhere? | [consistency.md](references/consistency.md): creating or extending a token system; one product on several platforms |
| 6 | **Cognition** | How much does the person have to remember, decide or decode? | [cognition.md](references/cognition.md): navigation and information architecture, long forms, many screen sizes |
| 7 | **Details** | Would the smallest part of this survive being looked at closely? | [details.md](references/details.md): a final polish pass on something that matters |
| 8 | **Performance** | Is there any moment where the person waits and nothing tells them why? | [performance.md](references/performance.md): something is janky or slow |

Also: [typography-color.md](references/typography-color.md) (setting up a type scale or palette) · [materials-depth.md](references/materials-depth.md) (translucent chrome, glass, shadow) · [review.md](references/review.md) (a formal written review) · [apple-lineage.md](references/apple-lineage.md) (history, OS versions and sources, only when asked).

Platform guides, for conventions you are unsure of: [web](references/platforms/web.md) · [Apple native](references/platforms/apple.md) · [React Native, Flutter, Android, desktop](references/platforms/cross-platform.md) · [games, consoles, TV and OS shells](references/platforms/games-consoles-os.md).

## The loop

Work through these in order for anything larger than a tweak. Each step removes work from the ones after it, which is why subtraction comes before styling and motion comes after structure.

1. **Frame.** One sentence: who is here, what are they trying to do, how often, on what device, in what state of mind. Name the single most important action on the screen and the feeling the product should leave (calm, capable, energised). If you cannot write the sentence, ask before designing.
2. **Subtract.** List every element, option and step. For each: remove it, merge it, defer it one level deeper, or replace the choice with a good default. Keep only what serves the sentence. Stop when removing one more thing would make the task harder; that point is simplicity, and it is not always the emptiest version.
3. **Structure.** Order by importance. Group by proximity. One primary action per view. Make the answers to *where am I, what can I do, how do I get back* visible without reading.
4. **Shape.** Apply one scale each for space, radius, type, colour and elevation. Make nested corners concentric. Let empty space do the separating before lines and boxes do.
5. **Move.** Decide what animates by how often it is seen and what it explains. Springs for anything a person touches; short decelerating curves for everything else; nothing at all for what happens a hundred times a day.
6. **Answer.** Give every interactive element all of its states (rest, hover, focus, pressed, busy, done, failed, disabled). Respond on the way down, within 100 ms. Add sound and haptics only where a physical thing would make them.
7. **Finish.** The details pass: empty, loading and error states, long and short content, dark mode, large text, reduced motion, keyboard, right-to-left, the corners and the hairlines.
8. **Verify.** Run it. Check it at the smallest and largest sizes and on the slowest device you can. Run `scripts/audit.mjs` over the code. Report what you verified and what needs a human hand.

## The floor

What every interface gets, whatever else the task asks for. None of it needs a reference.

**Any platform**

- Every value comes from a token: one scale each for space, radius, type, colour, elevation and motion. Colours are named for their role (`label`, `bg`, `accent`, `separator`), so light, dark and high contrast are the same components with different values.
- It follows the system: light and dark, larger text, reduced motion (keep fades, drop travel and bounce), reduced transparency (solid surfaces), increased contrast (firmer text and edges).
- Every control has all its states, a hit area of at least 44 pt, a visible keyboard focus ring and an accessible name.
- One accent colour, one primary action per view, text at 4.5:1 or better.

**Web**

- `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`, and never disable zoom. `color-scheme: light dark` with colours written as `light-dark(…)`.
- Tap highlight off and your own `:active` state; `touch-action: manipulation` on controls; form fields at 16 px or more.
- `dvh` / `svh` instead of `vh`; `env(safe-area-inset-*)` on edge-pinned bars; `overscroll-behavior: contain` on panels.
- Hover styles inside `@media (hover: hover) and (pointer: fine)`; `:focus-visible` for the focus ring.
- `prefers-reduced-motion`, `prefers-reduced-transparency` and `prefers-contrast` each handled.
- Real elements before any `div` with a handler: `<button>`, `<a>`, `<dialog>`, `<details>`, `<input type="range">`.
- Continuous corners with `corner-shape` inside `@supports`; `text-wrap: balance` on headings; `tabular-nums` on figures that change.

**Apple native:** standard components first; text styles, not fixed sizes; semantic colours; `.continuous` corners; springs; `sensoryFeedback` from the standard vocabulary.

**Anywhere else:** the host platform's own controls, type and conventions, with the same floor applied.

## Decisions you will make constantly

**Should this exist?** Ask in this order: can it be removed · can the system decide instead (a default, an inference) · can it wait until asked for (progressive disclosure) · can it merge with its neighbour. Adding is allowed when it removes a question from the person's head: a scrubber that shows time remaining is simpler than one that does not.

**Should this animate?**

| How often it is seen | Treatment |
| --- | --- |
| Constantly, or triggered from the keyboard (command palette, shortcuts, typing) | None. Motion here is latency. |
| Many times a day (hover, tabs, list navigation) | Almost none: ≤120 ms, colour or opacity only |
| Sometimes (menus, sheets, dialogs, toasts) | A short spring or decelerating curve, 150–350 ms |
| Rarely or once (onboarding, success, first run) | Room for character |

Animate only for a reason you can state: to show where something came from or went, to connect cause and effect, to confirm an action, or to soften a change that would otherwise startle.

**Spring or curve?** A person is or was touching it, or it can be interrupted: spring. It has a fixed start and end and nobody can grab it: a decelerating (ease-out) curve or a spring baked into CSS. It represents time itself (progress, hold-to-confirm): linear. Never ease-in for anything entering or responding; a slow start is a late answer.

**Bounce or not?** Default to none (`bounce: 0`). Overshoot belongs only where the person supplied the energy: releasing a drag, flicking, throwing. The same sheet opened by a button press gets no bounce, because nothing pushed it. Keep it at or under 0.3; above 0.4 it reads as a toy.

**Where does a gesture land?** Where it was *going*, never where the finger happened to lift. Project the release velocity forward, then choose the destination from the projection. Commit an action when the projected position crosses the threshold; raise the threshold for consequential actions.

**Which corner radius?** If the shape sits inside another rounded shape: `inner = outer − gap`. If it is a standalone control in a touch layout: a capsule. Otherwise the nearest step on the radius scale. Use continuous corners wherever the platform can draw them.

**Material or solid?** Translucency is for chrome that floats over content that moves beneath it (bars, sheets, popovers). Content itself is solid. Never stack one translucent layer on another, and always honour reduced-transparency and increased-contrast settings.

**Which feedback?** Visual always. Haptic when a physical counterpart would click, thud or snap, and only on the causal frame. Sound rarely, quiet, and never uninvited on the web. If turning the feedback off would not be noticed, it was decoration.

## Numbers that matter

Starting points with a provenance. Tune by feel, then keep them as tokens.

| What | Value |
| --- | --- |
| Hit target | 44×44 pt touch (28 min) · 28×28 pt pointer (20 min) · 60 pt spatial · 66 pt TV · 48 dp Android |
| Body text | 17 pt iOS · 13 pt macOS · 16 pt watchOS · 29 pt tvOS · 16–17 px web · never below 11 pt |
| Text contrast | ≥ 4.5:1 up to 17 pt · ≥ 3:1 at 18 pt+ or bold |
| Measure | 45–75 characters per line (`max-width: 65ch`) |
| Spacing | a 4 pt base; most gaps are 8, 12, 16, 24, 32 |
| Response | < 100 ms feels caused by me · < 400 ms keeps flow · > 1 s needs a progress signal |
| Frame budget | 16.7 ms at 60 Hz · 8.3 ms at 120 Hz. Design for the smaller one |
| Spring | duration 0.3–0.5 s · bounce 0 by default · 0.15–0.3 after a gesture |
| Press | scale 0.96–0.98 on the way down, ~100 ms; spring back on release |
| Durations | press 100–160 ms · menus and popovers 150–250 ms · sheets and pages 300–500 ms |
| Stagger | 30–80 ms between items, whole group done in ≤ 300 ms |
| Enter from | scale ≥ 0.9 with opacity 0. Never from scale 0: nothing appears from nothing |
| Rubber band | `(1 − 1 / (x·0.55/d + 1)) · d` — follows less the further you pull, never beyond `d` |
| Momentum | rest ≈ position + velocity × 0.5 (deceleration 0.998 per ms; 0.99 for a tighter stop) |
| Commit | projected = (distance + 0.3 s × velocity) ÷ track; commit at 0.5 (harmless) to 0.85 (consequential) |
| Continuous corner | curve begins ≈ 1.6 × r from the corner; CSS `superellipse(1.8)` at radius × 1.6 |
| Concentric | inner radius = outer radius − gap |
| Material | blur 20–30 px + saturate 180%; 35% dim behind clear glass over bright media |
| Choices | 3–5 tabs · ≤ 7 options before grouping · 1 primary action per view |

## What ships with this skill

Use these instead of re-deriving them. Paths are relative to this file. Open one when you are about to copy from it, not to learn the rules.

| File | Use it for |
| --- | --- |
| `assets/tokens.css` | Design tokens: space, radius, type, semantic colour (light, dark, high contrast), depth, materials, motion. Adapt names to the project's system; keep the structure. |
| `assets/base.css` | The web floor as working CSS, plus reference primitives to copy: button, switch, segmented control, grouped list, field, skeleton. |
| `assets/physics.js` | Zero-dependency ES module: exact spring solver, `animate()` (interruptible, velocity-preserving), `draggable()` (the whole two-phase gesture), rubber-banding, momentum projection, velocity tracking, intent projection, adaptive thresholds, display filtering, organic jiggle, spring → CSS `linear()`. |
| `assets/squircle.js` | Continuous-corner and superellipse SVG paths, concentric radius, a resize-aware clip helper. |
| `assets/feedback.js` | One feedback vocabulary (selection / impact / notification) across vibration, synthesised sound and gamepad rumble. |
| `assets/SecondNature.swift` | The same vocabulary for SwiftUI: springs, press styles, haptics, rubber band, projection, concentric shapes. |
| `scripts/spring.mjs` | `node scripts/spring.mjs --duration 0.4 --bounce 0.2` prints one spring in every platform's dialect (CSS, Motion, SwiftUI, UIKit, Reanimated, Compose, Flutter). |
| `scripts/audit.mjs` | `node scripts/audit.mjs <dir>` scans a codebase for the tells below and reports `file:line` with the reason and the fix. Run it in step 8 and at the start of any review. |

When the project already has a motion library, a token system or a component kit, map these onto it. Copy the code in only when there is nothing to map onto.

Enough to call the JavaScript without opening it:

```js
// physics.js
springFromBounce(duration, bounce)                  // → spring. Presets: SPRINGS.micro | swift | smooth | snappy | bouncy | release
animate({ from, to, velocity, spring, onUpdate })   // → { value, velocity, retarget(to), stop() }, interruptible
draggable(el, { axis, bounds, snap, initial, onUpdate, onRelease, onSettle })
                                                    // → { value, animateTo(v, { spring }), set(v), destroy() }, the whole gesture
rubberbandClamp(value, min, max, dimension)         // resistance past an edge
project(velocity)                                   // how far momentum carries; nearest(points, value) picks the stop
projectedProgress(distance, velocity, track)        // commit on intent, for sliders and swipes
new VelocityTracker()                               // .add(value, timeMs), .velocity(timeMs)
springToCSS(spring)                                 // → { easing, durationMs } for a CSS transition
jiggle(el, { size })                                // organic idle motion; displayFilter({ maxChange, intervalMs, monotonic })

// squircle.js
continuousCornerPath(width, height, radius)         // SVG path data; concentricRadius(outer, gap, minimum)

// feedback.js
feedback.play('selection' | 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error')
```

Token names follow one pattern: `--sn-space-*`, `--sn-radius-*`, `--sn-text-*`, `--sn-label` (`-2`, `-3`, `-4`), `--sn-bg` (`-2`, `-3`), `--sn-fill-*`, `--sn-separator`, `--sn-accent`, `--sn-shadow-*`, `--sn-material`, `--sn-dur-*`, `--sn-ease-out`, `--sn-spring-*` with a matching `-duration`, and `--sn-motion` (1, or 0 under reduced motion: multiply distances by it).

## The tells

Things that make an interface read as unfinished within a second. Fix these before anything subtle.

| Tell | Why it reads as cheap | Instead |
| --- | --- | --- |
| Feedback on release, not on press | The interface seems to think before answering | `:active` / pointer-down state within 100 ms |
| `ease-in`, or `linear` on movement | Starts slow: the moment the eye is watching is the dead one | Decelerate (`ease-out`) or spring |
| `transition: all` | Animates layout by accident; stutters | Name the properties; prefer `transform` and `opacity` |
| Appearing from `scale(0)` or from nowhere | Objects do not materialise from a point | From ≥ 0.9 scale + fade, from the element that caused it |
| An animation that cannot be interrupted | The person has to wait for the software | Springs, or transitions that retarget; never lock input |
| A drag that eases, or lags the finger | The object is being told about the finger rather than held by it | 1:1 tracking while down; physics only after release |
| Hard stop at an edge | Reads as frozen, not finished | Rubber-band |
| Same radius on parent and child | Gap pinches at the corners | Concentric radii |
| Borders everywhere | Structure drawn instead of composed | Space and grouping first, then tone, then hairlines |
| Five things shouting | Nothing is primary, so the person has to decide | One accent, one primary action |
| Pure-opacity crossfade between layouts | Two ghosts overlap | Move/scale shared elements; add 2–4 px blur if needed |
| Uniform stagger on everything | Mechanical, and it delays use | Stagger only first-run content, 30–80 ms, never controls |
| Hover styles on touch | They stick after the tap | Gate with `(hover: hover) and (pointer: fine)` |
| `100vh` on mobile, 12 px inputs, disabled zoom | The page jumps, zooms, or traps | `dvh`/`svh`, 16 px inputs, never disable zoom |
| No reduced-motion path | Excludes people and fails review | Keep fades, drop travel and overshoot |
| Spinner for a known shape | The layout jumps when content lands | Skeleton in the final shape; nothing at all under ~300 ms |
| Numbers that jitter | Looks like a fault | Tabular figures; filter and rate-limit the value |
| Text set by default | Wide tracking on big type, long lines, orphans | Tighten large type, cap the measure, `text-wrap: balance` |

## Reviewing existing work

Run `scripts/audit.mjs` first, then read the UI against the eight questions. Report in a table, most damaging first, and say what you could not judge from code:

| Where | What | Why it matters | Change to |
| --- | --- | --- | --- |
| `Sheet.tsx:42` | closes with `ease-in 400ms`, input blocked until done | slow start, and the person waits on the software | spring `duration 0.35, bounce 0`, interruptible |

That is enough for most reviews. For a formal written one with severity levels, see [review.md](references/review.md).

## Reporting back

Keep it short and concrete: what changed and why in the person's terms, which values you chose and where they live as tokens, what you verified (ran it, tests, audit output) and what you could not (feel on a real device, haptics, 120 Hz behaviour). Never describe something as smooth, native or polished on the strength of reading the code.
