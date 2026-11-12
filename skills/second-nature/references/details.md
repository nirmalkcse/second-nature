# Details

*Pillar 7 · Would the smallest part of this survive being looked at closely?*

People can tell when a physical product took shortcuts: a door that rattles, a seam that does not line up. Software is the same. A tap that answers late, an icon one pixel off, a layout that breaks on rotation each say that nobody checked, and people reasonably wonder what else nobody checked. The reverse also holds. Hundreds of details nobody consciously notices add up to the feeling that a product is solid.

Most of these will never be mentioned by anyone. That is the point.

## Contents

1. What the smallest parts of a mature system do
2. The catalogue
3. Worst-case content
4. Finishing rituals

## 1. What the smallest parts of a mature system do

Six ordinary iOS behaviours, taken apart. Each looks trivial and each hides a decision worth copying. The figures come from an independent teardown of iOS 27, not from Apple documentation; treat them as illustrations of the *kind* of thinking, and tune your own values.

| Behaviour | What is actually happening | The lesson | More |
| --- | --- | --- | --- |
| **Pulling past the end of a list** | The content follows the finger along a hyperbola, `(1 − 1/(0.55·x/d + 1))·d`, which has a ceiling: it can never be pulled further than one screen however far you drag | Limits should resist, not stop. Choose the curve that cannot do something absurd | [gestures.md §4](gestures.md) |
| **Grabbing something mid-animation** | Motion is a spring, so the hand takes over at the object's current speed. A timed animation would be discarded and restart from a standstill | Use motion that can be interrupted without a jump in velocity | [motion.md §3](motion.md) |
| **The swipe up from the home indicator** | One gesture is classified into one of 22 named outcomes from distance, velocity and dwell. The "pause" threshold rises while you hesitate, making the app switcher easier to reach the longer you linger | Name every outcome of a gesture. Combine signals. Let thresholds adapt to hesitation | [gestures.md §6](gestures.md) |
| **Slide to power off** | No resistance at all: the knob tracks the finger exactly. It commits if the position 0.3 s after release would be past 85% of the track, and springs back otherwise | Weight is in the commit rule, not in the drag. Judge where the gesture was going. Stricter thresholds for bigger consequences | [gestures.md §6](gestures.md) |
| **Icons wiggling in edit mode** | Three animations per icon (x, y, tilt) on slightly different clocks, each started at a random point; tilt divided by the item's size. The combined pattern takes about twenty minutes to repeat and no two icons are ever in step | Life comes from independent, incommensurate motions and random phase, with amplitude scaled to size | [motion.md §9](motion.md) |
| **The battery percentage** | The gauge's raw reading passes through a display filter that limits how far and how often the shown number may change; 0% sits above a hidden reserve | A displayed value is a designed signal. Filter noise, keep it orderly, keep a margin, and never misstate the outcome | [feedback.md §10](feedback.md) |

What they have in common: in each case the obvious implementation (a hard stop, a timed tween, a distance threshold, one looping animation, the raw number) would have worked, and nobody would have filed a bug. Someone decided that "works" was not the bar.

## 2. The catalogue

Scan the sections relevant to what you are building. Each line is a small thing that is usually wrong by default.

### Text

- Headlines balance across lines (`text-wrap: balance`); paragraphs avoid a lone last word (`text-wrap: pretty`).
- Large type has tighter tracking and tighter leading than body type; small caps and all-caps labels are tracked wider.
- Real typographic characters: curly quotes, apostrophes, en and em dashes, the multiplication sign, a true ellipsis.
- Non-breaking spaces between a number and its unit, and inside names that should not split.
- Truncation is deliberate: the middle for file names and paths, the end for prose, never for the one thing people need to read. The full text is reachable.
- Long content has a tested worst case: a 60-character name, a word with no spaces, a script that is taller or wider.
- Links are distinguishable by more than colour.

### Numbers, dates and units

- Tabular figures wherever digits change or align in columns, so nothing jitters.
- Numbers right-aligned in tables; decimal points aligned.
- Formatted for the locale: separators, currency placement, 12- or 24-hour time, first day of the week.
- Relative time for the recent past ("3 min ago"), absolute dates after about a week.
- Correct plurals in every language (`Intl.PluralRules`, string catalogs); never "1 items".
- Precision matches certainty: "about 2 minutes", not "1 min 57 s".
- Counts change with a small roll or crossfade, not a jump.

### Lists and tables

- Separators are hairlines, start at the text (not the icon), and do not follow the last row.
- Rows have a pressed state; whole rows are the hit target, not just the label.
- Selection survives reloads; scroll position survives navigation.
- Removing a row closes the gap as it leaves; inserting opens the space first.
- Sticky headers do not cover the row being read.
- Empty lists say what belongs here and how to add the first one.
- Very long lists are virtualised and still scroll at full frame rate.

### Forms and inputs

- The right keyboard, capitalisation and autocorrect for each field; autofill attributes set.
- The return key says what it does (Next, Search, Send) and does it.
- Focus moves forward on its own where the next step is unambiguous; one-time codes fill from the message and auto-advance.
- Fields are at least 16 px on the web so the page does not zoom.
- The keyboard never covers the field being typed in or the button that submits it.
- Paste is always allowed; pasted content is cleaned, not rejected.
- Errors appear beside the field, when the field is left, and disappear the moment they are fixed.
- The submit button stays enabled and explains what is missing, instead of sitting greyed out without a reason.

### Controls

- Every control answers on the way down.
- Hit areas extend beyond small visuals to 44 pt, without overlapping their neighbours.
- Dragging off a pressed button cancels it.
- Toggles take effect immediately; they are not paired with a Save button.
- Disabled looks different from enabled by more than colour, and ideally says why.
- Destructive actions are visually distinct and never the default.
- Double submission is impossible: the control enters a busy state on first press.
- Tooltips wait before the first appears, then show instantly for neighbours.

### Images and media

- Space is reserved before the image loads (aspect ratio known), so nothing shifts.
- A placeholder in the image's dominant colour or a blurred preview, cross-fading to the real thing.
- A faint inner edge so light images do not bleed into light backgrounds.
- Avatars and thumbnails never squash (`object-fit: cover`, `flex-shrink: 0`).
- Video does not autoplay with sound; controls appear on interaction and fade when idle.
- Images are the right resolution for the display density and no larger.

### Scrolling

- Native scrolling, never hijacked.
- Content scrolls under translucent bars; a soft edge effect, not a hard border, where it meets them.
- Tapping the status bar or title returns to the top where the platform expects it.
- Scroll chaining is contained inside panels and sheets.
- The scroll indicator is not covered by overlays.
- Large titles collapse smoothly into the bar, driven by scroll position.

### Focus and keyboard

- A visible focus ring for keyboard users, absent for pointer users.
- Tab order follows reading order; focus is trapped inside modals and returned to the trigger on close.
- Escape closes the top-most layer. Enter activates the default action.
- Common shortcuts work and are shown beside their menu items.
- Arrow keys move within composite controls (tabs, menus, grids).
- Keyboard-triggered actions do not animate.

### Empty, loading and error states

- Each is designed, not left to chance. The empty state is often the first thing a new person sees.
- Loading placeholders match the final layout; nothing jumps on arrival.
- Errors keep the person's work, say what happened and offer a way forward.
- Offline is a state, not a crash: show what is cached, queue what was done.
- Partial failure is handled: nine items loaded and one failed is not a blank page.

### Light, dark and contrast

- Dark mode is designed, not inverted: elevated surfaces get lighter, not shadowed; saturated colours are toned for dark backgrounds.
- Images, illustrations and icons have a version or treatment for both.
- No pure white text on pure black for long reading; soften one of them.
- The theme change itself is eased, not a flash.
- Increased-contrast and reduced-transparency settings are honoured.
- The browser or system chrome matches the page (`theme-color`, status bar style).

### Icons

- One family, one optical size, stroke weight matched to adjacent text.
- Optically centred in their containers.
- Pixel-aligned at the sizes they ship at.
- Standard glyphs for standard actions; a label where the meaning is not universal.
- Symbol animation only to mark a state change (a bell that rings once), never looping for decoration.

### Motion

- Anything that can be triggered twice quickly handles it gracefully.
- Popovers and menus grow from their trigger; modals from the centre.
- Exits are quicker than entrances.
- Nothing animates on first paint unless it is telling a story.
- Reduced motion has been tried, and everything still makes sense.

### Touch and pointer

- No hover-dependent functionality on touch devices; hover styles gated to devices that can hover.
- No tap delay; no grey tap flash; no accidental text selection on controls.
- Long-press, where used, has a visible alternative.
- The cursor reflects the affordance: pointer on links and buttons, text on text, grab and grabbing on draggables, resize on edges.
- Content respects safe areas, the home indicator and rounded display corners.

### System integration

- State restoration: reopening the app returns to where the person was.
- Copy, paste, share, drag and drop, and undo work wherever people would expect them to.
- Links can be opened in a new tab or window; back and forward behave.
- Text can be selected and copied when it is content (order numbers, addresses, error codes).
- Notifications say something specific and lead to the exact place they refer to.
- Works when the window is small, the text is large, the connection is slow and the language is long.

## 3. Worst-case content

Designs are drawn with ideal content and used with real content. Before calling anything finished, try:

| Try | Looking for |
| --- | --- |
| A very long name, title or email; a single long unbroken word | Overflow, broken layout, lost controls |
| A one-character name; an empty string; only whitespace | Collapsed rows, misaligned avatars |
| Zero items, one item, ten thousand items | Empty states, plurals, performance |
| Huge and negative numbers; many decimals | Truncation, alignment, formatting |
| Text at the largest accessibility size | Clipping, overlapping, lost hierarchy |
| A long language (German), a tall script (Thai, Arabic), right-to-left | Truncation, mirrored layout, line height |
| An image that fails, is tiny, or has an extreme aspect ratio | Placeholders, distortion |
| A slow or absent network; a request that fails half-way | Loading, retry, partial states |
| Rapid repeated taps; rotation mid-task; backgrounding mid-request | Double actions, lost state |
| The smallest supported screen and an ultra-wide window | Reflow, measure, reachability |

## 4. Finishing rituals

- **Slow it down.** Step through every transition frame by frame.
- **Zoom in.** Inspect corners, edges and icon alignment at 400–800%.
- **Use it one-handed, outdoors, on an old device.**
- **Turn on every accessibility setting in turn** and use the product for five minutes each.
- **Read every word aloud.**
- **Leave it overnight.** Look again with fresh eyes before shipping.
- **Compare against the best example you know** of the same pattern, side by side. Note every difference and decide whether it is intentional.
- **Keep going after launch.** Craft is maintained, not delivered; platforms move and so should the product.
