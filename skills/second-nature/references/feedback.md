# Feedback

*Pillar 4 · Does every action get an immediate, proportionate answer?*

In the physical world every action is answered: a switch clicks, a drawer stops, a key bottoms out. That constant, low-level confirmation is what lets people act without checking. An interface that answers every touch the same way builds the same unconscious trust; one that sometimes stays silent teaches people to hesitate, tap twice and watch.

## Contents

1. The contract
2. Every state a control can be in
3. Anatomy of a press
4. Microinteractions
5. Depth as feedback
6. Haptics
7. The feel of haptics without the hardware
8. Sound
9. Waiting
10. Calm, honest readouts
11. Errors and success
12. Checklist

## 1. The contract

Feedback is good when it is:

- **Immediate.** Within 100 ms the person believes they caused it. Later than that, it is a separate event.
- **On the cause.** It fires on the actual moment (the toggle flips, the item snaps home), not on the request that preceded it or the network reply that follows.
- **Proportionate.** A selection gets a tick; a payment gets more; deleting an account gets a pause. Equal fuss for everything is noise.
- **Consistent.** The same kind of event always produces the same response, so the response becomes a signal.
- **Redundant across senses, never dependent on one.** Motion, sound and touch reinforce each other; none may be the only carrier of something important.

It comes in four kinds, and each needs designing: **status** (what is happening now), **completion** (that worked), **warning** (this may not go how you expect), **error** (that did not work, here is what to do).

## 2. Every state a control can be in

Design all of them. The missing ones are where interfaces feel broken.

| State | What it must say | Typical treatment |
| --- | --- | --- |
| Rest | I can be used | Clear affordance, sufficient contrast |
| Hover | You are over me (pointer only) | Subtle tone shift, ≤ 120 ms; gated to hover-capable devices |
| Focus | The keyboard is here | Unmistakable ring, shown only for keyboard focus |
| Pressed | I felt that | Compress to ~0.97 and darken, ≤ 100 ms |
| Selected / on | This is the current choice | Filled, weighted, or the sliding thumb is here |
| Dragging | You are holding me | Lifted: larger, deeper shadow |
| Busy | Working on it | In-place progress; control stays the same size |
| Done | It worked | Brief confirmation in place, then return |
| Failed | It did not, and why | In place, specific, recoverable |
| Disabled | Not now | Reduced contrast, no hover or press response, and ideally a reason |

Controls must not change size between states; the layout around a button that swaps its label for a spinner should not move by a pixel.

## 3. Anatomy of a press

1. **Down.** Respond at once: scale to 0.96–0.98, darken slightly. Fast and decelerating (≈ 100 ms), because the finger is waiting.
2. **Hold.** The state stays as long as the finger does.
3. **Drag off.** Leaving the target (plus about 10 px of slack) releases the highlight: this is how people cancel. Coming back restores it.
4. **Up, inside.** The action fires and the control springs back (≈ 200–300 ms, no bounce, or a trace of it). The release may be softer than the press: the finger has gone.
5. **Result.** If the action takes time, the control shows it. If it completes at once, the change on screen is the confirmation.

Scale affects the whole control including its label, which is what you want: it reads as the object moving, not the text shrinking. Large surfaces (a full-width card) should compress less (0.98–0.99) than small ones.

## 4. Microinteractions

A microinteraction is one small task done completely: a toggle, a like, a copy button, pull-to-refresh. Each has four parts worth deciding explicitly:

| Part | Question |
| --- | --- |
| **Trigger** | What starts it, and is that discoverable? |
| **Rules** | What happens, in what order, and what cannot happen? |
| **Feedback** | What does the person see, hear and feel at each step? |
| **Loops and modes** | What changes on the tenth use? What if it is repeated quickly, or interrupted? |

Examples of the level of care to aim for:

- **Copy.** The icon morphs to a check for about a second and a half, then back. No toast needed: the confirmation is where the eye already is.
- **Toggle.** The thumb stretches toward the other side while held, slides with a spring on release, the track changes colour on the same frame, and a light impact fires as it lands.
- **Segmented control.** One thumb slides between options. The selection is an object that moves, not a highlight that jumps.
- **Password field, wrong entry.** A short horizontal shake (the gesture for "no") with an error haptic; the field keeps focus and selects its contents.
- **Delete from a list.** The row collapses while its neighbours close the gap; an undo affordance appears for a few seconds.
- **Number changes.** Digits roll or crossfade individually and stay tabular, so the figure does not jitter sideways.

## 5. Depth as feedback

Height is a cheap, legible signal: nearer things are more important and more available.

- **Lifting** (hover on a card, picking up a draggable) raises it: a little scale, a larger and softer shadow.
- **Pressing** lowers it: smaller, tighter shadow or none.
- **Layers above dim what is below**, in proportion to how completely they take over.
- Animate shadows cheaply: cross-fade the opacity of a second, pre-rendered shadow (a pseudo-element) rather than animating `box-shadow` itself, which repaints every frame.

## 6. Haptics

Haptics are the closest thing an interface has to weight. Used with restraint they make software feel physical; overused they are a phone buzzing in a pocket.

### Vocabulary

| Kind | Variants | Means | Use for |
| --- | --- | --- | --- |
| **Selection** | — | A value changed under your finger | Picker ticks, slider detents, segment changes, scrubbing |
| **Impact** | light · medium · heavy · soft · rigid | Something landed or collided | Snapping into place, a toggle seating, a drag dropping, pull-to-refresh threshold, lifting an item |
| **Notification** | success · warning · error | The outcome of a task | Payment complete, validation failed, action blocked |

Match the weight to the visual: a small chip seats with *light*; a full-screen sheet reaching its detent can take *medium*; *heavy* is rare. *Soft* suits rounded, elastic motion; *rigid* suits crisp, mechanical stops.

Custom patterns (Core Haptics and its equivalents) are built from **transient** events (taps) and **continuous** events (sustained texture), each with **intensity** (strength) and **sharpness** (soft and round ↔ crisp and precise). Use them where the standard set has no word for what is happening, mostly in games.

### Three rules

1. **Causality.** It must be obvious what caused the haptic, and its character should match the physical nature of the event.
2. **Harmony.** What is seen, heard and felt must land on the same frame. A haptic 80 ms after the visual snap is a second, unexplained event.
3. **Utility.** Add it only where it tells the person something. If turning it off would not be missed, remove it.

And from the platform guidance: use system patterns for their documented meanings (do not play the success pattern for something that is not a success); be consistent so people learn the association; keep them short in apps; make them optional; do not rely on them alone.

### Platform APIs

| Platform | API |
| --- | --- |
| SwiftUI | `.sensoryFeedback(.selection, trigger: value)`, `.impact(weight:)`, `.success` … |
| UIKit | `UISelectionFeedbackGenerator`, `UIImpactFeedbackGenerator(style:)`, `UINotificationFeedbackGenerator`; call `prepare()` just before so the engine is awake |
| watchOS | `WKInterfaceDevice.current().play(.click)` and friends (paired with a tone) |
| macOS | `NSHapticFeedbackManager` — `.alignment`, `.levelChange`, `.generic`, on a Force Touch trackpad |
| Custom | Core Haptics (`CHHapticEngine`, AHAP patterns), optionally with synchronised audio |
| Android | `View.performHapticFeedback(HapticFeedbackConstants.…)`; Compose `LocalHapticFeedback` |
| React Native | `expo-haptics` (`selectionAsync`, `impactAsync`, `notificationAsync`) |
| Flutter | `HapticFeedback.selectionClick()`, `lightImpact()`, `mediumImpact()`, `heavyImpact()` |
| Game controllers | `GCController` haptics (Apple), platform SDKs for adaptive triggers and HD rumble; on the web `gamepad.vibrationActuator.playEffect('dual-rumble', …)` |
| Web | `navigator.vibrate()` on Android browsers only. iOS Safari exposes no haptics to pages; workarounds that abused the native switch control have been reported closed. Treat web haptics as an enhancement that will often be absent |

`assets/feedback.js` wraps the web side behind the same vocabulary.

## 7. The feel of haptics without the hardware

Most of the web, every desktop and many embedded screens have no actuator. The sensation can still be suggested, because much of what reads as "tactile" is timing:

- **Crisp, fast, decelerating press** (≤ 100 ms down). Sluggish presses feel soft and far away.
- **A snap at the end of travel.** A thumb that lands with a very small overshoot (bounce 0.1–0.2) reads as seating into a detent.
- **Detents in continuous controls.** A slider that briefly sticks at meaningful values, or a dial that steps, feels notched.
- **Shadow and scale change on the same frame as the state change.**
- **A short tick** (10–20 ms, quiet), where sound is welcome.
- **No latency at all.** A haptic-like feel is impossible on top of a 150 ms delay.

## 8. Sound

Sound is the most intrusive channel. It reaches people who are not looking, and people near them.

- **Default to silent** on the web and in productivity software. Enable it by request or where the platform convention expects it (keyboards, cameras, games, watches).
- **Short and quiet.** Interface ticks are 10–60 ms; confirmations under 300 ms. They sit well below media volume.
- **One family.** Sounds in a product share a timbre the way its icons share a stroke. Higher and rising reads as positive; lower and falling as negative; identical repeats as neutral.
- **Paired with a haptic and a visual on the same frame**, so it reads as one event.
- **Respect the mute switch, system volume and Do Not Disturb.** Never play audio before the person has interacted.
- Every sound has a visible equivalent, for people who cannot hear it and devices that are muted.

## 9. Waiting

| Delay | What to show |
| --- | --- |
| < 100 ms | Nothing extra: the result is the feedback |
| 100 ms – 1 s | The control itself shows it is working; no blocking spinner |
| 1 – 10 s | A progress indicator, determinate if you can estimate at all |
| > 10 s | Progress with an estimate, the ability to do something else, and a notification on completion |

- **Act first, confirm after** (optimistic updates): show the result at once and reconcile with the server in the background. Roll back visibly, with an explanation, in the rare case it fails.
- **Skeletons for known shapes, spinners for unknown ones.** A placeholder in the final layout means nothing moves when content arrives.
- **Do not flash.** Delay showing a loading state by ~150–300 ms (most things finish first); once shown, keep it for at least ~300–500 ms so it does not flicker.
- **Progress never goes backwards**, and an estimate that changes should be smoothed (next section).
- **Explain long waits** in plain words, and say what is safe to do meanwhile.

## 10. Calm, honest readouts

Raw measurements are noisy. A battery's reported charge wobbles with load and temperature; network speed and remaining-time estimates jump around. A display that shows the raw value jitters, dips and recovers, and people read that as a fault.

A teardown of iOS 27's power management describes how the battery percentage handles this: the fuel gauge's raw `capacityLevel` passes through a display filter (limits named for a *maximum change* and a minimum *interval*) to become the `displayCapacity` on screen. The shown figure moves in small, orderly steps at a limited rate while the measurement underneath does not, and "0%" sits above a reserved capacity so there is still enough to shut down cleanly.

The principle generalises to any live value:

- **Rate-limit and step-limit what is displayed**, not what is measured (`displayFilter()` in `assets/physics.js`).
- **Make it monotonic when the truth is**: a download bar, a discharging battery, a countdown should never visibly backtrack because of noise.
- **Smooth estimates** (time remaining, speed) over a window, and round to a precision you can stand behind: "about 2 minutes", not "1:57… 2:13… 1:49".
- **Set figures in tabular numerals** so changing digits do not shift the layout.
- **Keep a reserve.** Design "empty", "full" and "done" so the system has margin to act gracefully at the boundary.

The line not to cross is the outcome. Smoothing presentation is care; misrepresenting what will happen is deception. If the device is about to shut down or the upload has failed, say so plainly and at once.

## 11. Errors and success

**Errors**
- Prevent first: constrain inputs, disable impossible actions (and say why), validate as people type.
- Report in place, next to the thing that needs fixing, in the person's words, with the fix.
- Preserve their work. Never clear a form because one field was wrong.
- Prefer undo to confirmation. Reserve dialogs for the destructive and irreversible.

**Success**
- Most success needs no ceremony: the thing they asked for is now on screen.
- Mark the end of something effortful (a purchase, a setup, a long form) with a clear, brief completion: a drawn checkmark, a success haptic, a sentence. People remember endings.
- Celebration is for genuine milestones, rare enough to stay special, and never in the way of the next step.

## 12. Checklist

- [ ] Every interactive element has rest, hover, focus, pressed, busy, done, failed and disabled states
- [ ] Press feedback begins on pointer-down, within 100 ms
- [ ] Dragging off a pressed control cancels; nothing fires on touch-down that cannot be undone
- [ ] Controls keep their size across states
- [ ] Haptics use the standard vocabulary, on the causal frame, and can be turned off
- [ ] No sound without invitation; mute and system volume respected
- [ ] No loading flash; skeletons match final layout; progress never backtracks
- [ ] Live figures are filtered, tabular and honestly rounded
- [ ] Errors appear in place with a fix; destructive actions offer undo or a specific confirmation
- [ ] Nothing important is conveyed by one sense or by colour alone
