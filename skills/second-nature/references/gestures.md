# Gestures

*Pillar 2 · While the finger is down, the interface is the finger. When it lifts, physics finishes the thought.*

Direct manipulation is the strongest illusion an interface can create: the feeling that you are moving the thing itself rather than asking a computer to move it. It is also the easiest to break. A few milliseconds of lag, a drag that eases, a release that ignores how fast you were moving, and the object turns back into a picture.

## Contents

1. The two phases
2. Touch down
3. Tracking
4. Edges: rubber-banding
5. Release: velocity, projection, snapping
6. Deciding on intent
7. Linked values
8. Scrolling
9. Sheets and drawers
10. Other gestures
11. Every gesture needs another way
12. Checklist
13. Code

## 1. The two phases

```
Pointer down?
├─ yes → TRACK    position maps 1:1 to the pointer. No easing, no spring, no duration.
└─ no  → RELEASE  a spring, started at the pointer's velocity, heads for the place
                  the gesture was going.
```

Most gesture bugs come from mixing these up: a spring during tracking makes the element trail the finger like something dragged through syrup; a fixed-duration tween after release makes every flick land the same way, however hard it was thrown.

## 2. Touch down

- **Respond on contact.** Highlight, lift or compress the moment the pointer lands, not when it leaves. Waiting for the release reads as lag even at 0 ms.
- **Catch whatever is moving.** If the element is mid-animation, stop it where it is and hand it to the finger. People act while things are still moving; an interface that makes them wait for an animation has stopped listening.
- **Remember where they grabbed it.** Track the offset between the pointer and the element. An element that jumps to centre itself under the finger has broken the illusion in the first frame.
- **Capture the pointer** so tracking continues when the finger leaves the element's bounds.
- **Ignore the second finger.** Once a drag has an owner, other pointers do not get to move the element.

## 3. Tracking

- **1:1 means exactly that.** Write the position directly on every move event.
- **Slop before commitment.** Allow a few pixels of movement (≈ 3–4 px for a mouse, ≈ 10 px for touch) before a press becomes a drag, so taps still work. When the threshold is crossed, re-base the start point so the element does not jump by the slop distance.
- **Lock the axis** once the direction is clear, and tell the browser which axis is yours (`touch-action: pan-y` on a horizontal carousel, `pan-x` on a vertical sheet handle, `none` only on surfaces that own both).
- **Run candidate gestures in parallel** from the first movement and cancel the losers when intent is clear. Avoid recognisers that only report a finished gesture ("swiped left"): they throw away the continuous position you need for feedback.
- **Stay off the framework's render path.** A state update per pointer event re-renders per frame and drops frames. Write the transform directly on the element; do not drive children through an inherited CSS variable.
- **Keep a short velocity history.** Release velocity comes from roughly the last 100 ms of movement, not the whole gesture and not the last two samples. If the finger paused before lifting, the velocity is zero: a pause is a decision to drop, not to throw. (The iOS home gesture is reported to average velocity over about the last 1/24 s.)

## 4. Edges: rubber-banding

Nothing physical stops dead. When a drag passes a limit, keep following, progressively less:

```
offset = (1 − 1 / (c · x / d + 1)) · d
```

`x` is how far the finger has pulled past the edge, `d` is the size of the view along that axis, `c` is 0.55 (UIKit's rubber-banding coefficient). It is a hyperbola, not the logarithm it is often described as, and the difference matters: a logarithm grows without limit, while this curve has a ceiling at `d`, so content can never be pulled more than one view-length however far the finger travels.

| Finger past the edge (d = 844) | Content moves |
| --- | --- |
| 185 pt | 90.7 pt |
| 844 pt (one screen) | 299.5 pt |
| 16,880 pt (twenty screens) | 773.7 pt — still under one screen |

The result communicates two things at once: *I am still listening* and *there is nothing more here*. A hard stop only says "frozen". `rubberband()` and `rubberbandClamp()` in `assets/physics.js` implement it.

## 5. Release: velocity, projection, snapping

1. **Hand off the velocity.** The spring starts at the speed and direction the finger was moving, so there is no seam between dragging and animating. This is the detail that most separates fluid from merely fine.
2. **Project where it was going.** Scroll views lose a fixed fraction of their speed each millisecond (0.998 normally, 0.99 for a quicker stop). The distance left to travel is `(velocity ÷ 1000) × rate ÷ (1 − rate)`: about half the velocity in px/s at the normal rate.
3. **Choose the destination from the projection**, not from the release point: the nearest snap point to where momentum would have carried it. This is what lets a short, fast flick travel a long way, and makes "small input, big output" feel earned.
4. **Spring there**, with a little bounce (0.15–0.25) because a real force was applied.
5. **For reverse-or-commit decisions, trust the direction of travel** over position. Someone 70% of the way across who flicks back means *cancel*.

For two-dimensional motion, run one spring per axis. A single spring on the straight-line distance goes wrong as soon as the two axes have different velocities.

## 6. Deciding on intent

A gesture ends where the finger stopped. The person meant where it was going. Good gesture logic judges the second.

### Commit on the projection

The "slide to power off" control feels heavy, as if it were pushing back. A teardown of iOS 27 reports that there is no resistance in it at all: the knob follows the finger to the pixel. The weight is entirely in the decision at release:

```
final = (distance + 0.3 s × velocity) ÷ track        commit if final ≥ 0.85
```

A slow drag has to physically reach 85% of the track; a confident flick gets there on momentum; anything else springs back. The same teardown reports the older slider committed at 60%, so the threshold was raised for an action as consequential as turning the device off.

Take three things from this:

- **Perceived weight comes from the commit threshold and the spring-back**, not from making the drag harder. Keep tracking honest.
- **Scale the threshold to the consequences**: about 0.5 for something harmless and reversible, up to about 0.85 for something disruptive.
- **Let velocity count** in both directions: a flick forward commits early, a flick backward cancels even past the line.

`projectedProgress()` in `physics.js` is this formula.

### One gesture, several meanings

The home indicator turns one upward swipe into "go home", "show the app switcher", "switch to the neighbouring app" or "never mind". The same teardown describes the decision as a classifier with **22 named outcomes** (for example *home by distance threshold*, *app switcher by pausing*, *current layout by not travelling sufficient distance*), driven by a few measurements:

| Signal | Result |
| --- | --- |
| Upward velocity above ≈ 204 pt/s | Home |
| Dragged past ≈ 60% of screen height | Home |
| Speed falls below ≈ 51 pt/s (a pause) | App switcher |

And one refinement that makes it feel like mind-reading: the pause threshold is not fixed. While the finger hovers in the switcher zone, it climbs 20% of the remaining way toward ≈ 134 pt/s on every update, and decays back to 51 when the finger moves on. The longer someone hesitates, the more clearly they mean the switcher, so the easier it becomes to get it.

What to take from it:

- **Write the decision table.** Enumerate every outcome a gesture can have, name each one, and state the condition that selects it. Unnamed outcomes are the ones that feel random.
- **Combine distance, velocity and dwell.** Any one alone misreads people.
- **Let thresholds adapt to hesitation** (`adaptiveThreshold()` in `physics.js`). Hysteresis is what stops a gesture flickering between two outcomes at the boundary.
- **Remove the buttons the gesture replaces.** The reward for getting this right is that three controls disappear.

These figures come from an independent teardown, not from Apple documentation, and will differ between releases. Use the structure; tune the numbers on your own product.

## 7. Linked values

The dragged element is rarely alone: a scrim darkens, the page behind scales back, a label fades. Derive all of them from the one value the finger controls.

```js
const progress = (PEEK - y) / (PEEK - FULL);     // 0 → 1
scrim.style.opacity = progress * 0.4;
page.style.transform = `scale(${1 - progress * 0.06})`;
```

One source of truth means everything stays in step during the drag, when the gesture reverses, and when it is interrupted. Separate animations drift apart the first time someone catches the sheet halfway.

## 8. Scrolling

- **Never replace native scrolling** with a scripted one. The platform's inertia, rubber-banding, accessibility and input handling are tuned better than a library will manage, and people know exactly how it should feel.
- Use scroll snapping (`scroll-snap-type`) for carousels and pagers rather than hand-rolled drag.
- Contain overscroll (`overscroll-behavior: contain`) inside sheets and panels so reaching their end does not scroll the page behind.
- Drive scroll-linked effects (collapsing titles, progress, parallax) from scroll position using scroll-driven animations, not from scroll events on the main thread.
- A list's scroll position is state. Preserve it across navigation; restoring someone to the top of a long list is a small betrayal.
- Pull-to-refresh: track 1:1 with resistance, fire a haptic at the threshold, refresh on release, never on reaching the threshold.

## 9. Sheets and drawers

A sheet done properly is weeks of edge cases: detents, momentum, a scrim tied to progress, the hand-off between scrolling the content and dragging the sheet, focus trapping, Escape, the software keyboard. Use the platform's sheet where one exists (SwiftUI `presentationDetents`, UIKit sheet controllers) and a proven library on the web (Vaul). Build your own only when nothing covers the interaction, and then:

- **Detents** (peek, half, full) chosen by projection, not by release position.
- **The scrim is progress**, not a separate fade.
- **Content scroll hands off to sheet drag** at the top: when the inner list is scrolled to its start, a downward pull moves the sheet.
- A **grabber** shows it can be dragged; tapping it steps between detents (no bounce: nothing pushed it).
- Dim the background for a task that interrupts; leave it interactive for a panel that works alongside.
- Dismiss by gesture *and* by a visible control, Escape, and tapping the scrim.

## 10. Other gestures

| Gesture | What makes it feel right |
| --- | --- |
| **Swipe actions on a row** | Row tracks 1:1; actions reveal beneath; passing the full-swipe threshold fires a haptic and commits on release; flick velocity counts |
| **Drag to reorder** | Lift on pick-up (scale 1.03–1.07, deeper shadow, haptic); neighbours spring out of the way as it passes; drop settles with a spring and a softer haptic |
| **Hold to confirm** | Progress fills linearly (it is showing time); release before the end snaps back fast; completing fires a notification haptic |
| **Slider** | Thumb follows exactly; value updates live; detents tick; fine control by dragging away from the track |
| **Long press / context menu** | Element lifts and the background dims as the hold progresses; the menu grows from the element; a small movement cancels |
| **Pinch / rotate** | Anchored at the centroid of the touches; rubber-bands past min/max scale; settles with a spring |
| **Swipe back** | The outgoing view tracks the finger from the edge; the incoming one parallaxes beneath; commit by projection |

## 11. Every gesture needs another way

A gesture is invisible until someone discovers it, and impossible for some people to perform.

- Provide a visible control or a menu item for anything a gesture does. Swipe-to-delete also has an Edit mode; pinch-to-zoom also has buttons.
- Keyboard: every drag has an arrow-key or Enter equivalent; Escape cancels.
- Show that something can be moved: a grabber, a peeking edge of the next card, a brief hint on first appearance.
- Complex gestures (multi-finger, path-based, timed) need a single-pointer alternative.
- Under reduced motion, tracking stays (the person is producing the motion); flings and bounces go.

## 12. Checklist

- [ ] Responds on pointer-down, not on release
- [ ] Follows 1:1 while down; no easing or spring during tracking
- [ ] Keeps the grab offset; no jump on pick-up or on crossing the slop
- [ ] Can be caught mid-animation and reversed
- [ ] Rubber-bands at limits instead of stopping dead
- [ ] Release velocity is handed to the spring
- [ ] Destination chosen from projected position; a short fast flick works
- [ ] Linked visuals derive from one value
- [ ] `touch-action` set; native scroll not fought; pointer captured
- [ ] Second finger ignored; click after drag suppressed
- [ ] Hit targets ≥ 44 pt; hover styles gated to hover-capable pointers
- [ ] Non-gesture alternative exists; keyboard path exists
- [ ] Tested on a real phone, on a slow one, and at 120 Hz

## 13. Code

`draggable()` in `assets/physics.js` implements sections 2–5 for one axis:

```js
import { draggable, SPRINGS } from './physics.js';

const sheet = draggable(el, {
  axis: 'y',
  bounds: [56, 432],            // resting range; beyond it rubber-bands
  snap: [56, 250, 432],         // detents, chosen by projected landing point
  initial: 432,
  onUpdate: (y) => { scrim.style.opacity = ((432 - y) / 376) * 0.4; },
});

closeButton.onclick = () => sheet.animateTo(432, { spring: SPRINGS.smooth }); // a tap: no bounce
```

For two axes, combine the primitives yourself (`VelocityTracker`, `rubberbandClamp`, `project`, `nearest`, one `animate()` per axis); the demo's throwable tile is a complete example. Native equivalents are in [platforms/apple.md](platforms/apple.md) and [platforms/cross-platform.md](platforms/cross-platform.md).
