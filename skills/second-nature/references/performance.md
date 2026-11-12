# Performance

*Pillar 8 · Is there any moment where the person waits and nothing tells them why?*

Everything else in this skill depends on this. A spring that stutters is worse than no spring. A press state that arrives 150 ms late is not feedback. Direct manipulation survives only while the response is immediate; the moment lag appears, the object under the finger turns back into a picture of one. Performance is not a pass applied after the design is good. It is what lets the design register at all.

## Contents

1. Budgets
2. What each frame costs
3. Where the animation runs
4. Traps that look correct
5. Perceived speed
6. Loading
7. Long lists and heavy views
8. Apple native
9. Games and real-time UI
10. When nothing is happening
11. Measuring
12. Checklist

## 1. Budgets

| What | Budget |
| --- | --- |
| Input to visible response | < 100 ms; aim for the next frame |
| One frame | 16.7 ms at 60 Hz · 8.3 ms at 120 Hz |
| A single main-thread task | < 50 ms |
| Web: Interaction to Next Paint | ≤ 200 ms |
| Web: Largest Contentful Paint | ≤ 2.5 s |
| Web: Cumulative Layout Shift | ≤ 0.1 |
| App launch to first frame | about 400 ms |
| Hitch time (native scrolling and animation) | under ~5 ms of hitch per second |

Design for the smaller frame budget: most current phones and many laptops refresh at 120 Hz. Budget against a mid-range phone, not the machine the code was written on, which is the least representative device the product will ever run on.

## 2. What each frame costs

To show a change, a renderer may do up to three things: **layout** (measure and position), **paint** (draw pixels into layers), **composite** (assemble layers on the GPU). The property you animate decides how many of those run every frame.

| Tier | Properties | Cost per frame |
| --- | --- | --- |
| Composite only | `transform`, `opacity` (and, unevenly across browsers, `filter`, `clip-path`) | Cheapest; can run off the main thread |
| Paint | `color`, `background`, `box-shadow`, `border-radius` | Redraws the element |
| Layout | `width`, `height`, `padding`, `margin`, `top`, `left`, `font-size` | Re-measures the element and often its neighbours |

Swap down a tier whenever the result looks the same:

| Instead of animating | Animate |
| --- | --- |
| `width` / `height` | `transform: scale()` (or a clip) |
| `top` / `left` / `margin` | `transform: translate()` |
| `box-shadow` | Opacity of a pre-rendered shadow layer, or `filter: drop-shadow()` |
| `display` / `visibility` | `opacity`, then remove |
| `height: auto` reveal | Grid row `0fr → 1fr`, or a measured transform |

Never `transition: all`: it animates whatever changes next, including layout properties nobody meant to animate.

The same hierarchy exists natively: animating a layer's transform or opacity is cheap; anything that forces layout, re-draws text, or triggers offscreen rendering (masks, non-opaque group blending, shadows without an explicit path) is not.

## 3. Where the animation runs

JavaScript runs on the main thread, along with layout, parsing, hydration and everything else. An animation driven from there stalls whenever the page is busy.

| Driver | Runs |
| --- | --- |
| CSS transitions and keyframes on compositor properties | Off the main thread |
| Web Animations API (`element.animate`) on compositor properties | Off the main thread |
| `requestAnimationFrame` loops, most gesture-driven and layout animations | Main thread |

- **Fixed-path motion** (a menu opening, a tab indicator, a spring baked into `linear()`): CSS or WAAPI. It stays smooth during navigation, data loading and hydration, which is exactly when main-thread animation drops frames.
- **Gesture-driven and interruptible motion**: JavaScript is the right tool; keep the per-frame work tiny (one transform write) and keep the main thread free while it runs.
- Compositor acceleration is granted by the renderer, not guaranteed. Choosing cheap properties is in your control; rely on that.

## 4. Traps that look correct

- **Animating through framework state.** Setting state on every pointer move or frame re-renders the component 60–120 times a second. Write to the element directly (a ref, a motion value) and update state once at the end.
- **Inherited CSS variables.** Changing a custom property on a container recalculates style for every descendant. Driving a drag through `--offset` on a parent gets slower as the content grows. Set `transform` on the element itself.
- **Blur.** `filter: blur()` and `backdrop-filter` cost in proportion to area and radius. Keep animated blur small (a few pixels softens a crossfade) and translucent surfaces modest in size; avoid animating the blur radius of a large surface.
- **`will-change` as a fix.** It only pre-promotes a layer. It does not make an expensive property cheap, and every promoted layer uses memory. Add it to the one element that visibly shifts when its animation starts, after measuring.
- **Too many layers.** Hundreds of individually promoted elements overwhelm the compositor. Animate a container where you can.
- **Layout thrashing.** Reading layout (`offsetHeight`, `getBoundingClientRect`) after writing styles in the same frame forces a synchronous layout. Batch reads, then writes.
- **Non-passive scroll and touch listeners** block scrolling until they return. Mark them passive; prefer `touch-action` and `overscroll-behavior` to `preventDefault()`.
- **Images decoded on the main thread** during a transition. Decode ahead (`img.decode()`), size correctly.

## 5. Perceived speed

How fast something feels is partly engineering and partly design.

- **Respond first, work second.** The control acknowledges the press on the next frame even when the result takes a second.
- **Optimistic updates.** Show the outcome immediately; reconcile in the background; roll back visibly if it fails.
- **Start before they ask.** Preload on intent: hover, pointer-down, focus, an item scrolling into view. Navigation that begins on pointer-down instead of click is ~100 ms faster for free.
- **Keep what was there.** Show the previous or cached content while fresh data loads, instead of blanking to a spinner.
- **Skeletons shaped like the result**, so arrival moves nothing.
- **No layout shift.** Reserve space for images, embeds, late-loading fonts and banners. Content that jumps under a finger is the worst kind of slow.
- **Progressive detail.** Dominant colour, then a blurred preview, then the image. Text before decoration.
- **Use motion to cover latency, never to add it.** A 200 ms transition that hides a 200 ms fetch is good design; a 400 ms transition in front of an instant result is a tax.
- **Ease-out feels faster than ease-in** at the same duration, because the response is visible immediately.
- **Instant back.** Returning to the previous screen should be immediate and restore its state.

## 6. Loading

- Ship less. The fastest code is the code that was never sent: split by route, lazy-load below the fold, drop unused dependencies.
- The system font costs nothing. If a web font is essential: subset it, preload the one above the fold, `font-display: swap`, and match fallback metrics (`size-adjust`) so the swap does not shift the layout.
- Images: modern formats (AVIF, WebP), responsive sizes (`srcset`, `sizes`), explicit dimensions, lazy below the fold, high fetch priority for the main one.
- Prioritise what is visible; defer analytics, chat widgets and anything not needed for the first interaction.
- Cache aggressively and work offline where it makes sense.
- Hydrate or attach interaction progressively, so the first tap is not waiting on the whole page.

## 7. Long lists and heavy views

- Virtualise long lists: render what is visible plus a small buffer; recycle rows.
- Keep row layout simple and of predictable height.
- `content-visibility: auto` lets the browser skip off-screen sections.
- Load and decode images for rows just ahead of the scroll; cancel work for rows that left.
- Do expensive work (sorting, filtering, parsing, layout of large text) off the main thread.
- Debounce input that triggers heavy work, never the visual response to the input itself.

## 8. Apple native

- **The main thread is for the interface.** Networking, decoding, parsing and database work happen elsewhere; only the final state change comes back.
- **Hitches** are frames delivered late. Watch the hitch time ratio during scrolling and transitions; under about 5 ms per second is barely noticeable, over 10 is plainly rough.
- **Instruments**: Time Profiler for CPU, Hangs for main-thread stalls, Animation Hitches for missed frames, the SwiftUI instrument for excessive view updates. Profile a release build on a real, older device.
- **SwiftUI**: keep view bodies cheap; narrow the state each view depends on; prefer `List`/lazy stacks for long content; give items stable identity; use `drawingGroup()` only for complex vector content that is measurably slow.
- **UIKit / Core Animation**: reuse cells; prefetch; set `shadowPath`; avoid masks and group opacity on scrolling content; rasterise only static, complex layers.
- **Images**: downsample to display size before decoding; never load a 12-megapixel image into a 100-point thumbnail.
- **120 Hz**: animations and display links run at the display's rate when allowed; on iPhone this requires opting in through the app's Info.plist. Check, on device, that custom animation really runs at 120.
- **Launch**: show the first real frame quickly; defer everything not needed for it; restore state rather than starting cold.
- **Liquid Glass and materials** are sampled and blurred by the system; let standard components provide them rather than stacking custom blur views.

## 9. Games and real-time UI

- **Consistency beats peak.** A locked 60, or a locked 30 with correct frame pacing, feels better than 90 that dips to 50. Uneven frame times are the stutter people feel.
- **Input latency is the feel.** Sample input as late as possible in the frame; avoid buffering it behind a frame of UI logic. Menus should answer on the same frame as the button press.
- **Fixed simulation step, interpolated rendering**, so motion is identical at every refresh rate.
- **Render interface text and vector UI at native resolution** even when the 3D scene is scaled.
- **No hitches on first use**: pre-warm shaders, pre-load the next menu, decode UI textures ahead.
- **Loading is part of the experience.** Show progress, keep input alive, and never present a frozen frame.
- **Offer performance and quality modes**, with sensible defaults per device, and respect thermal and power state.

## 10. When nothing is happening

An idle interface should do no work.

- Stop animation loops when nothing is animating; pause them when the tab or app is hidden and when the element is off-screen.
- No timers polling for things that can be pushed or observed.
- Ambient effects (shimmer, particles, video backgrounds) stop under Low Power Mode, reduced motion, or when out of view.
- Heat and battery drain are part of how a product feels by the end of the day.

## 11. Measuring

- **On real hardware.** A mid-range phone a few years old, in the hand, on a normal network.
- **With a recording, not by feel.** Browser Performance panel or Instruments for dropped frames and long tasks; a high-frame-rate screen recording stepped through for visible stutter.
- **Under load**: during navigation, while data is arriving, with a long list, with many items on screen.
- **CPU throttling on a desktop** models a slow processor, not a weak GPU or low memory. It is a hint, not a verdict.
- **In the field**: collect real-user timings (Web Vitals, MetricKit); the lab is the best case.
- **Name the cause before changing code**: which property, which thread, which task. "Added `will-change`, seems smoother" is not a diagnosis.

When reporting, separate what was measured from what was inferred from reading code, and say which claims need a device to confirm.

## 12. Checklist

- [ ] Press and hover responses arrive on the next frame
- [ ] Animations use `transform` and `opacity`; no `transition: all`; no layout properties animated
- [ ] Fixed-path motion runs in CSS or WAAPI; gesture motion writes one transform per frame
- [ ] No state updates per frame; no inherited custom property driving motion
- [ ] Blur areas and radii are modest; nothing large animates its blur
- [ ] No layout shift when content, fonts or images arrive
- [ ] Loading states do not flash; previous content stays visible while refreshing
- [ ] Intent-based preloading for likely next steps
- [ ] Long lists virtualised; heavy work off the main thread
- [ ] Idle means idle: loops stop off-screen and when hidden
- [ ] Verified on a mid-range phone and at 120 Hz, or stated as unverified
