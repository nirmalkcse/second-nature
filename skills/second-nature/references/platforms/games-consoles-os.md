# Platform guide: games, consoles, television and OS shells

These are the interfaces where the stakes for *feel* are highest: a game is its feel; a console or OS shell is used thousands of times; a television is operated from across a room with a few buttons. The eight pillars hold. The constraints change.

## Contents

1. What is different here
2. Focus navigation
3. The ten-foot interface
4. Game feel, and where the menu's restraint ends
5. The HUD
6. Controller feedback
7. Teaching without text
8. Loading, resuming and transitions
9. Options that are really accessibility
10. Building it: engines and maths
11. Console and system shells
12. Operating-system shells, kiosks and embedded screens
13. Checklist

## 1. What is different here

| Constraint | Consequence |
| --- | --- |
| **Input is indirect** (controller, remote, keyboard) | There is no pointing. One element has focus at a time and everything hangs on how focus moves |
| **Distance** (2–3 m from a television) | Larger type, higher contrast, simpler layouts, generous margins |
| **Attention belongs elsewhere** (the game, the film, the road) | Interface is peripheral: glanceable, quiet, gone when not needed |
| **Frame time is the product** | Any hitch in the interface is felt as a hitch in the game |
| **Thousands of repetitions** (system shells) | Frequency rules are absolute: no ornamental motion on anything routine |
| **Expression is welcome in play** | Feedback can be far richer than in productivity software, as long as it is proportionate |

## 2. Focus navigation

- **Exactly one focused element, always.** Never zero, never ambiguous. When a screen appears, focus is already on the most likely choice.
- **Focus is unmistakable from across the room**: the focused item grows (5–10%), lifts with a shadow or glow, and may tilt with the stick or touch surface. Never colour alone.
- **Focus moves the way the stick was pressed**, to the nearest element in that direction. Test every direction from every element; dead ends and surprising jumps are the commonest faults.
- **Remember where focus was.** Returning to a screen or a row restores the last position.
- **The focus change is immediate**: the highlight moves on the same frame as the input, with a short spring to settle. A focus animation that lags is input lag.
- **Hold to repeat** accelerates; lists scroll with momentum but stop on an item, never between two.
- **Wrap-around is a decision**: fine in short carousels, disorienting in long grids. Mark the ends (a soft bump, a tick, a small rubber-band).
- **Back is universal and consistent**: one button, always the same, always one level.
- **Glyphs match the device in hand** and switch immediately when the person changes input.
- **Avoid a stick-driven cursor.** If a pointer is unavoidable, make targets large and magnetic.
- **A tick on focus move, a firmer one on select**, quiet and consistent; with a light haptic where available.

## 3. The ten-foot interface

- **Type**: body around 29 pt at television scale, nothing under 23 pt; medium or heavier weights; no thin faces.
- **Safe area**: keep primary content inset about 60 pt from top and bottom and 80 pt from the sides; some displays still crop the edges.
- **Contrast**: high, tested in a bright room and a dark one. Avoid pure white fields (glare) and fine detail (lost to distance and compression).
- **Fewer, larger elements**; a clear grid; lots of room between focusable items.
- **Text entry is expensive.** Avoid it; offer voice, a phone companion, codes or recents.
- **Media is the interface**: large artwork, previews that start after a pause on focus (never with sudden sound), "continue" first.
- **Lean back**: nothing times out too quickly, nothing requires precision, and the remote's few buttons do predictable things.

## 4. Game feel, and where the menu's restraint ends

Inside play, feedback is layered ("juice"): one action can answer with animation, particles, a camera kick, a frame or two of hit-stop, sound, and a haptic. The same rules still govern it:

- **Response on the same frame** as the input. Sample input late; do not queue it behind interface logic. Perceived control is latency first, everything else second.
- **Proportionate.** A footstep and an explosion are not the same size. If everything shakes the screen, nothing does.
- **Layered but synchronous**: every channel lands together ([feedback.md](../feedback.md)).
- **Consistent physics.** The world's springs, friction and gravity are a contract. So are the interface's.
- **Anticipation and follow-through** make actions readable; keep the *start* of the response instant and put the flourish after it.
- **Every effect is optional** for people who are sensitive to it (shake, flash, motion blur).

Menus, inventories and settings are productivity software inside a game: fast, quiet, zero ornamental delay. A beautiful two-second menu transition is charming once and a tax the next four hundred times. Keep character in the art direction, the sound and the first-run moments.

## 5. The HUD

- **Show what changed, when it changes**; fade it when it is stable. A full health bar need not be on screen.
- **Diegetic where possible**: information carried by the world (the weapon's own counter, the character's posture) costs no screen space and no attention shift.
- **Edges and corners** for persistent elements, inside the safe area; the centre belongs to the game.
- **Read in a glance**: shape and position first, numbers second. Critical states use more than colour (shape, motion, sound).
- **Calm values**: filter and rate-limit readouts so they do not flicker ([feedback.md §10](../feedback.md)).
- **No motion in the periphery** unless it is a warning. Peripheral motion pulls the eye involuntarily.
- **Scalable and repositionable**; legible on a handheld and a television; colour-blind-safe palettes or alternatives.
- **Directional cues** (damage, objectives) are spatial and brief.

## 6. Controller feedback

| Event | Feedback |
| --- | --- |
| Focus move | Barely-there tick: high-frequency motor, low amplitude, ~20 ms; or none |
| Select / confirm | A slightly firmer, short pulse |
| Blocked / invalid | A double low thud, distinct from confirm |
| Impacts in play | Low-frequency motor scaled to the force; direction if the hardware allows |
| Texture (surfaces, engines, rain) | Continuous, low amplitude, modulated; stop when the cause stops |
| Tension (drawing a bow, pulling a trigger) | Resistive or adaptive triggers where available |

- Use each platform's richest API where it exists (adaptive triggers, high-definition rumble, Core Haptics through `GCController`), with a simple dual-rumble fallback (`assets/feedback.js` → `rumble()` on the web).
- Pair every haptic with sound and a visual on the same frame.
- Short for interface, sustained only for gameplay.
- Provide an intensity setting and an off switch. Handheld play makes haptics audible to everyone nearby.

## 7. Teaching without text

- **Teach by doing**: the first room is the tutorial. One mechanic at a time, in a place where failing is safe.
- **Prompt in context**, at the moment the action is possible, with the correct button glyph, and stop prompting once it has been done a few times.
- **Never a wall of text or an unskippable sequence.** Everything can be skipped and revisited.
- **The interface explains itself**: a locked item says how to unlock it; an unavailable action says why.
- **Reward the first success** clearly; people remember the peak and the ending.

## 8. Loading, resuming and transitions

- **Never a frozen frame.** If work is happening, something on screen moves and input still registers.
- **Hide loads inside transitions** that would exist anyway (a door, a lift, a fade), and keep them honest in length.
- **Resume where the person was**, instantly where the platform allows. Starting from a title screen every time is the old way.
- **Pre-warm**: compile shaders and load the next menu's assets before they are needed, so first use does not hitch.
- **Pause is immediate and total**, from anywhere.
- **Autosave visibly but quietly**, and never during a moment that needs the frame budget.

## 9. Options that are really accessibility

Offer these as ordinary settings; many players use them for comfort, not need.

- Full control remapping; hold-versus-toggle; adjustable dead zones and sensitivity.
- Subtitles on by default or offered on first run, with size, background and speaker labels.
- Text size and interface scale.
- Colour-blind modes or, better, designs that do not depend on colour.
- Camera shake, motion blur, flashing, field of view and haptic intensity controls.
- Difficulty and assist options without stigma.
- Audio cues for visual information, and visual cues for audio.
- Screen-reader or narrated menus where the platform supports them.

## 10. Building it: engines and maths

The maths in this skill is engine-agnostic. Port it; do not approximate it with easing curves.

**A frame-rate-independent spring** (closed form is in `assets/physics.js`; this integrator is fine at game frame rates):

```
// each tick, dt in seconds
force     = -stiffness * (position - target) - damping * velocity
velocity += force / mass * dt
position += velocity * dt
```

Retargeting is just changing `target`; velocity carries over, which is the whole point. Use sub-steps or the closed form if `dt` can spike. Parameters from `scripts/spring.mjs`.

**Smooth follow without a spring** (cameras, cursors): `value += (target − value) × (1 − exp(−rate × dt))`. Frame-rate independent, unlike `lerp(value, target, 0.1)`.

**Continuous corners in a shader** (signed distance to a superellipse, n = 4 for a squircle):

```
d = pow(pow(abs(p.x) / r, n) + pow(abs(p.y) / r, n), 1.0 / n) - 1.0   // < 0 inside
```

**Organic idle motion**: three sines with close, unequal periods and a random phase per object ([motion.md §9](../motion.md)).

| Engine | Interface layer | Notes |
| --- | --- | --- |
| Unity | UI Toolkit, or uGUI | Drive springs from script on unscaled time; batch canvases; avoid layout rebuilds per frame |
| Unreal | UMG / Slate, CommonUI | CommonUI handles input-device switching and focus routing; animate in materials where possible |
| Godot | Control nodes, themes | Tweens for fixed motion, a small spring script for interactive; focus neighbours set explicitly |
| Apple | SwiftUI or UIKit over a Metal/RealityKit/SpriteKit scene | `GCController` for input and haptics; Game Mode; the system's controller glyphs |
| Web | DOM over canvas, or all-canvas | Gamepad API; DOM for menus gets accessibility and text rendering for free |

Render interface text and vectors at native resolution regardless of scene scaling; keep interface updates off the critical path of the simulation.

## 11. Console and system shells

A console's home is opened dozens of times a day and should feel like a light switch.

- **Instant, always.** The system button responds on the next frame from any state, over any game, without dropping the game's frames.
- **Content first**: large artwork, the last thing played in the first position, one press to resume.
- **Overlays do not take over**: quick menus, notifications and capture controls sit above the game, dim it lightly, and close on the same button.
- **One spatial model**: where the library is, where settings are, which way is back, identical everywhere.
- **Sound and haptic identity** that is recognisable, short and can be turned down.
- **Notifications are brief, in a corner, and never over the centre** of play.
- **Everything works from the controller alone**, including text entry, sign-in and purchases; offer a companion-device shortcut for the tedious parts.
- **Idle and power states are designed**: a calm rest state, a quick wake, a clear indication of background work.

## 12. Operating-system shells, kiosks and embedded screens

Launchers, lock screens, control panels, in-car displays, appliances and kiosks share the shell problem: they are the layer everything else rests on.

- **System gestures are sacred**: go home, go back, switch, reveal controls. They are global, always available, never blocked by content, and respond even when an app does not. Run the shell's interaction off the app's thread.
- **A consistent geography**: notifications from the top, controls from a corner or edge, the dock at the bottom; each thing leaves the way it arrived. People navigate by muscle memory within days.
- **Disambiguate one gesture carefully** rather than adding buttons ([gestures.md §6](../gestures.md)): combine distance, velocity and dwell, name every outcome, add hysteresis.
- **Status is calm**: battery, signal and time are filtered, stable and never animated for attention ([feedback.md §10](../feedback.md)).
- **Boot, lock, unlock, sleep and shutdown** are moments people see every day. They should be fast, continuous (the unlock animation leads into the home screen) and quiet.
- **Consequential system actions use a deliberate gesture** with a strict commit threshold (slide to power off), not a tap.
- **Edit modes are visibly different states** (the jiggle) with an obvious way out.
- **Ambient and always-on modes** are low-light, low-motion and glanceable, and shift with time of day.
- **Kiosks and public screens**: very large targets, one task per screen, a visible way to start over, a timeout that resets safely, no reliance on gestures people must discover.
- **In vehicles**: a glance of under two seconds, large targets, minimal motion, physical-control parity for anything used while driving, and a night mode.
- **Longevity**: a shell is lived in for years. Favour restraint that will not tire, and let personalisation (wallpaper, layout, tint) supply the variety.

## 13. Checklist

- [ ] One focused element at all times; focus visible from across the room without relying on colour
- [ ] Focus moves predictably in every direction; position is remembered
- [ ] Input is answered on the same frame; no interface animation delays an action
- [ ] Text and targets sized for viewing distance; content inside the safe area
- [ ] Menus are fast and quiet; expression lives in play and first-run moments
- [ ] HUD elements appear on change and fade when stable; readouts are filtered
- [ ] Haptics, sound and visuals land together; intensity is adjustable
- [ ] Glyphs match the active input device
- [ ] No frozen frames; loads are masked or show progress; resume is immediate
- [ ] Remapping, subtitles, scaling and comfort options exist
- [ ] System-level gestures and buttons always respond
- [ ] Frame pacing is even on the target hardware, measured
