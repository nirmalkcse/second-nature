# Motion

*Pillar 2 · Does it move the way a real object would if I did that to it?*

People have spent their whole lives learning how objects behave: they have weight, they keep moving until something stops them, they slow before they rest, they come back the way they went. An interface that follows those expectations needs no explaining. One that breaks them (teleporting, starting slowly, ignoring a push) feels like software.

Gesture-driven motion (anything under a finger) is covered in [gestures.md](gestures.md). This file covers what moves, how, and when not to.

## Contents

1. What motion is for
2. How often it will be seen
3. Springs
4. Curves and durations (when it is not a spring)
5. Arriving and leaving
6. Several things at once
7. A spatial model
8. Weight
9. Idle motion that looks alive
10. Reduced motion
11. Tuning by eye

## 1. What motion is for

Motion earns its place by doing one of four jobs:

| Job | Example |
| --- | --- |
| **Orient** — show where something came from or went | A sheet rises from the bottom, so "down" dismisses it |
| **Connect** — tie a cause to its effect | A menu grows out of the button that opened it |
| **Confirm** — acknowledge an action | A button compresses under the finger |
| **Soften** — make a change readable instead of abrupt | A list closes the gap where a row was removed |

A fifth, **character**, is real but rationed: it belongs in rare moments (first run, success, empty states), never in the path of a frequent task. If you cannot name the job, do not animate.

## 2. How often it will be seen

The single best predictor of whether an animation helps is how many times a day the person will watch it.

| Frequency | Treatment |
| --- | --- |
| Constant or keyboard-triggered (command palette, shortcuts, typing, focus moves) | No animation. At this frequency any duration is latency. |
| Many times a day (hover, tab switches, row selection) | Colour or opacity only, ≤ 120 ms |
| Occasional (menus, sheets, dialogs, toasts) | A real transition, 150–350 ms |
| Rare (onboarding, completion, celebration) | Longer, more expressive, still skippable |

Never make people wait for an animation before they can act, least of all one they will see again.

## 3. Springs

A spring is the only kind of animation that is continuous in both position *and* velocity. That one property gives you everything that makes motion feel physical:

- **It can start from any speed.** Hand it the velocity of a finger and the motion carries on without a seam.
- **It can be interrupted.** Give it a new target mid-flight and it bends toward it, keeping its momentum. A timed animation in the same situation is thrown away and restarted from a standstill: velocity drops to zero in a single frame, which is the "hitch" people feel when they catch a moving thing.
- **It has no fixed path or length**, so the same spring feels right over 20 px and over 600 px.

The model is a damped harmonic oscillator: `m·x″ = −k·x − b·x′`.

### Two numbers

Think in **duration** and **bounce** (the parameterisation SwiftUI adopted in 2023), not mass, stiffness and damping.

- **duration** — the *perceptual* length in seconds: roughly when it looks finished (a bounce-0 spring is ~98.6% of the way there at its duration). The mathematical tail runs longer; never wait on it.
- **bounce** — 0 is no overshoot (critically damped). 0.15 is a hint of life. 0.3 is plainly bouncy. Above about 0.4 looks exaggerated in interface chrome. Negative values over-damp.

Conversion (mass = 1): `stiffness = (2π ÷ duration)²`, `damping = (1 − bounce) × 4π ÷ duration`, so damping ratio = `1 − bounce`. Check: duration 0.5, bounce 0.3 → stiffness 157.9, damping 17.6. `scripts/spring.mjs` does this and prints the result for every platform.

### Presets

| Name | duration | bounce | Use |
| --- | --- | --- | --- |
| `micro` | 0.2 | 0 | Press release, toggle thumb, hover-out |
| `swift` | 0.3 | 0 | Menus, popovers, tabs, small state changes |
| `smooth` | 0.5 | 0 | Sheets, page-level moves, large surfaces (SwiftUI `.smooth`) |
| `snappy` | 0.5 | 0.15 | General purpose with a little life (SwiftUI `.snappy`) |
| `bouncy` | 0.5 | 0.3 | Playful, small elements, rare (SwiftUI `.bouncy`) |
| `release` | 0.4 | 0.2 | Settling after a drag or flick |
| `interactive` | 0.15 | 0.14 | Following a target that keeps moving |

SwiftUI's three presets share one duration and stiffness; they differ only in damping. That is a good way to think about a product's motion: one tempo, with friction as the dial.

### Choosing

- **Start at bounce 0.** It is the most versatile and never looks wrong.
- **Add bounce only when the person supplied energy**: a drag released, a flick, a throw. The overshoot is the object using up the momentum it was given. A sheet opened by a tap has no momentum to spend.
- **Smaller things can be quicker and bouncier; larger things slower and flatter** (see §8).
- **One tempo per product.** Pick a house duration (0.3–0.5 s) and derive the rest from it, so the whole interface moves like one material.
- A spring that feels "weird" usually needs more damping, not less stiffness.

## 4. Curves and durations (when it is not a spring)

Use a timed curve when the motion has a fixed start and end and nothing can grab it (a tooltip, a colour change, a toast timing out), or bake a spring into CSS `linear()` to get spring character off the main thread (`scripts/spring.mjs --tokens`).

| Situation | Curve | Token |
| --- | --- | --- |
| Entering, responding, exiting | Decelerate | `--sn-ease-out` `cubic-bezier(0.22, 1, 0.36, 1)` |
| Moving between two on-screen positions | Accelerate then decelerate | `--sn-ease-in-out` `cubic-bezier(0.65, 0, 0.35, 1)` |
| Edge-attached sheet without a spring | Steep start, long settle | `--sn-ease-sheet` `cubic-bezier(0.32, 0.72, 0, 1)` at ~500 ms |
| Representing time (progress, hold-to-confirm, spinner) | Linear | `linear` |

**No ease-in for interface motion.** It spends the first frames, the ones the eye is fixed on, barely moving. At equal duration, ease-out is perceived as faster. The browser's built-in keywords are weak; use the stronger custom curves above.

| Element | Duration |
| --- | --- |
| Press feedback | 100–160 ms |
| Tooltip, small popover | 120–200 ms |
| Menu, dropdown, tab | 150–250 ms |
| Dialog, sheet, drawer, page | 250–500 ms |
| Explanatory or first-run | As long as the explanation needs |

Scale duration with distance when the size of the change varies (a container growing 8 px versus 400 px): derive it and clamp it, for example `clamp(150ms, distance × 0.5ms, 320ms)`.

## 5. Arriving and leaving

- **Things come from somewhere.** A menu scales out of its trigger (`transform-origin` at the trigger); a detail view grows from the item tapped. Centred modals are the exception: they belong to the screen, so they stay centred.
- **Never from nothing.** Start at scale ≥ 0.9 with opacity 0, or offset 8–16 px. `scale(0)` and long slides read as a trick.
- **Out the way it came in.** If it slid in from the right, it leaves to the right. Symmetry is what makes the dismiss gesture guessable.
- **Leaving is quicker and plainer than arriving.** The person has already decided; get out of the way (about 70% of the enter duration, no bounce, no stagger).
- **Materialise glass.** A translucent surface arriving should change blur and scale together, so it reads as a material coming into focus, not a picture fading up.
- **Hint at the destination.** The frames in between should point at the outcome: a control expanding toward the finger, a card tilting the way it is about to go.

On the web, `@starting-style` animates entry without JavaScript; use transitions (which retarget) rather than keyframes (which restart) for anything that can be triggered twice quickly.

## 6. Several things at once

Most choreography problems are solved by animating fewer things.

1. **Cast the scene.** One *lead* (what the person must notice), a little *support*, optional *decoration* that only fades, and everything else *static*.
2. **One entrance per container.** If the panel slides in, its contents are already there. Animating both makes people watch two shows before they can act.
3. **Together by default.** Things that are part of the same object or the same moment start together and share a tempo. Sequence only when order means something (cause then effect, or reading order on first run).
4. **Stagger sparingly.** 30–80 ms between items, the whole group finished within ~300 ms, only on first-run or marketing content, never on menus, lists or anything opened repeatedly. Stagger the first few items and bring the rest in with the last.
5. **Close the gap immediately.** When an item leaves a list, take it out of layout at once so its neighbours move *while* it fades. Waiting for the exit before closing the gap makes the whole thing feel slow.
6. **Swapping content in place is one crossfade**, old out as new comes in. If the two states look like overlapping ghosts, add 2–4 px of blur during the swap, or move shared elements instead of fading them.
7. **Nothing blocks input.** Whatever is visible is tappable, however much is still moving.

## 7. A spatial model

Motion teaches people where things live. Decide the geography once and never contradict it.

- Forward in a hierarchy brings the new view in from the trailing edge; back reverses it. (Mirror for right-to-left.)
- Sheets and keyboards live below; notifications and menus bar items above; sidebars at the leading edge.
- Detail views grow out of their thumbnail and shrink back into it.
- Layers have an order: content at the bottom, chrome floating above, modal surfaces above that, system alerts on top. Higher layers cast larger, softer shadows and dim what is beneath.
- A thing has one home. If the mini-player came from the bottom bar, it returns there.

## 8. Weight

Size implies mass, and mass changes how things move.

- A full-screen sheet travels further and settles more slowly than a tooltip; give it the longer duration and no bounce.
- Small elements can afford more bounce to read as alive. The same bounce on a large surface looks heavy and takes too long to settle.
- Lifting something (picking up a card to drag it) brings it closer: scale up 3–7%, deepen and widen the shadow, and restore both on drop.
- Tilt and rotation amplitudes should shrink as the element grows, so the edges travel a similar distance (see §9).

## 9. Idle motion that looks alive

Looping motion (an edit-mode wiggle, a breathing indicator, a waiting state) looks mechanical when every element runs the same loop in step. The home-screen jiggle is the model for doing it well. A teardown of iOS 27's SpringBoard reports that each icon runs **three** animations, not one:

| Motion | Amplitude | Half-period |
| --- | --- | --- |
| Horizontal shift | ± 0.4 pt | ≈ 0.134 s |
| Vertical shift | ± 0.4 pt | ≈ 0.142 s |
| Tilt | ± 0.03 rad (≈ 1.72°) ÷ size | ≈ 0.128 s |

Three ideas do the work, and they generalise to any ambient motion:

1. **Independent clocks that never line up.** The periods are close but unequal, so the combined motion takes about twenty minutes to repeat. The eye never finds the loop.
2. **A random start per element.** Each icon begins at a random point in its cycle, so no two neighbours are ever in step.
3. **Amplitude divided by size.** A 4×4 widget tilts a quarter as much as an app icon (≈ 0.43°), so its edges move about the same distance instead of swinging.

`jiggle()` in `assets/physics.js` implements this on the compositor. Apply the same recipe to shimmer, floating decorations, particle drift and "thinking" indicators: several slightly different clocks, random phase, amplitude scaled to size.

Ambient loops that invite interaction should start late (a couple of seconds in), repeat rarely, and stop the moment the person engages.

## 10. Reduced motion

Some people get nauseous from interface motion; others simply prefer less. The setting means *gentler*, not *off*.

- **Keep**: opacity and colour changes, highlights, progress, anything that confirms an action.
- **Remove**: travel, scale, parallax, overshoot, auto-playing and looping motion, zoom transitions, anything that moves a large part of the screen.
- **Replace** a slide or zoom with a short cross-fade (150–200 ms).
- **Direct manipulation stays.** A drag still follows the finger; the person is producing that motion. Drop the bounce and the fling after release.
- Collapse choreography: no stagger, the group appears together.

The `--sn-motion` token is `1` normally and `0` under `prefers-reduced-motion: reduce`. Multiply distances by it (`translateY(calc(12px * var(--sn-motion)))`) and movement disappears while fades remain. `animate()` in `physics.js` drops bounce automatically under the same setting.

Motion that is uncomfortable for many people even without the setting: large surfaces sweeping across the field of view, slow continuous oscillation, motion in the periphery, and rotating the whole scene. On spatial platforms these are comfort issues, not preferences; prefer a quick fade to relocating a large object.

## 11. Tuning by eye

- **Slow it down.** Play at 10–25% speed or step frame by frame (browser Animations panel, Xcode's slow animations, a screen recording scrubbed by hand). Errors invisible at full speed are obvious here: two states visibly overlapping, the wrong transform origin, properties finishing at different times.
- **Interrupt it.** Reverse it halfway. Trigger it twice. Catch it. Anything that jumps is not finished.
- **Come back tomorrow.** Fresh eyes see what yesterday's adjusted to.
- **Use it fifty times.** If you start wanting to skip it, shorten it or remove it.
- **Try it on the real device.** A 120 Hz phone in the hand shows roughness a 60 Hz desktop monitor hides.
