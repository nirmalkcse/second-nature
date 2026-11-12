# Simplicity

*Pillar 1 · What here does the person not need right now?*

Every element on a screen asks for a little attention, and attention is the one thing the person cannot get more of. Each extra option is a decision; each decision costs time and a little confidence. Simplicity is the discipline of spending that budget only where it buys something.

Apple's own wording is the useful correction: **simplicity is not minimalism.** Hiding every function behind one icon looks minimal and is hard to use. The target is *exactly enough*: the important things close at hand, everything else out of the way until wanted.

## Contents

1. The subtraction ladder
2. One screen, one job
3. Empty space is a material
4. Deference: content first, chrome last
5. Progressive disclosure
6. Defaults beat options
7. Fewer steps
8. Words
9. Restraint in colour and type
10. When the product is dense
11. Checks
12. Ways to get it wrong

## 1. The subtraction ladder

For every element, option, step and word, go down this list and stop at the first rung that works.

1. **Remove it.** Would anyone notice within a week? If not, it was noise.
2. **Decide it for them.** Can a default, an inference or the last-used value answer the question so the person never sees it?
3. **Defer it.** Can it appear only when relevant (on selection, on hover, in a menu, one level deeper)?
4. **Merge it.** Do two controls do nearly the same thing? Does a label repeat what the heading already says?
5. **Keep it, and make it earn the space.** Give it the right weight for how often it is needed.

Then run the test in reverse: is there anything whose *absence* forces the person to guess, remember or go looking? Add it back. A video scrubber that shows time remaining has more on it and is simpler to use, because it removes a question from the person's head.

## 2. One screen, one job

- Write the job in a sentence. Everything on the screen either helps that sentence or goes.
- **One primary action.** It gets the accent colour and the strongest weight. Secondary actions are quieter (tinted or plain). Tertiary ones live in a menu.
- If two things both need to be the loudest, the screen has two jobs. Split it, or decide.
- Destructive and rare actions never sit beside the primary action at equal weight.

## 3. Empty space is a material

The most powerful element on a well-made page is often the space around the subject. A product photographed alone on a clear field reads as important the way a painting on a gallery wall does; the same product in a grid of twelve reads as inventory. Space directs the eye: with one subject, one line and one action in a clear field, there is only one place to look.

- **Give the subject room in proportion to its importance.** Hero content gets the most air; it is how the layout says "this matters" without saying it.
- **Separate with space before lines.** Proximity already tells people what belongs together. Reach for a divider or a box only when spacing alone cannot make the grouping clear.
- **Outer margins ≥ inner gaps.** A group's internal spacing must be visibly tighter than the space around it, or the group dissolves. Use steps that are obviously different (8 inside, 24 between, 64 between sections), not near-misses (12 and 16).
- **Hold one alignment.** A strong left edge that everything hangs from is what makes generous space look composed rather than unfinished.
- **Fewer, larger things.** One confident headline at display size beats a headline, a sub-headline, a tagline and a badge.

Space is not free on every surface. A phone list, a spreadsheet or a watch face has to be dense. The rule that survives is the ratio: related things closer than unrelated things, always.

## 4. Deference: content first, chrome last

The interface is the frame, not the picture.

- Controls recede while the person is reading or watching: bars that minimise on scroll, toolbars that are translucent rather than solid slabs, full-bleed media.
- Chrome appears when it is useful (on tap, on hover, on selection) and leaves when it is not.
- Decoration that competes with content for attention (gradients behind text, ornamental icons, animated backgrounds) is spent budget. Keep what carries meaning.

## 5. Progressive disclosure

Show the common path; keep the rest one deliberate step away.

| Pattern | Use for |
| --- | --- |
| Overflow / "More" menu | Secondary actions on a toolbar or row |
| Controls that appear on selection | Formatting, bulk actions |
| Disclosure group / "Show advanced" | Options most people never change |
| Detail on demand (popover, inspector) | Explanations, metadata |
| Staged forms | Ask the next question only once the previous answer makes it relevant |
| Context menu / long-press | Power-user shortcuts that duplicate a visible path |

Rules: the hidden thing must be findable where people would look for it; nothing essential may exist only behind a gesture; and the first level must be complete enough to finish the common task.

## 6. Defaults beat options

Every setting is a decision the team declined to make. Most people never open settings, so the default *is* the product.

- Pick the default that is right for most people and safe for everyone.
- Remember the last choice instead of asking again.
- Infer from context (locale, time, the selection, what was just done) before asking.
- Offer a setting only when reasonable people genuinely need different behaviour, and say what it does in one plain line.

## 7. Fewer steps

- Count taps and screens for the top three tasks. Remove one from each.
- Do not confirm what can be undone; offer **undo** instead. Confirm only actions that are destructive *and* irreversible, and make the confirmation specific ("Delete 3 photos") rather than generic ("Are you sure?").
- Do not make people sign in, grant permissions or configure anything before they have seen value. Ask at the moment the need is obvious.
- Validate as they go, in place. Never return a form with the errors at the top.
- Let the system carry state between steps so nobody types the same thing twice.

## 8. Words

Interface text is interface. The shortest phrasing that is still clear is usually the most universal.

- **Label by content or action**, not by category: "Library", "Send", "Add photo" — not "Home", "OK", "Submit".
- Verbs on buttons; the button should make sense read alone.
- Sentence case. No jargon, no internal names, no exclamation marks, no "please" padding.
- A label is clearer than an icon unless the icon is universal (search, close, share, play). Do not make people learn symbols.
- Errors say what happened and what to do next, in the person's vocabulary, without blame.
- One idea per sentence; cut every word that does not change the meaning.

## 9. Restraint in colour and type

- **One accent colour**, meaning "you can act here". If it also decorates, it stops meaning anything.
- Neutrals carry the structure; semantic colours (success, warning, danger) appear only when their meaning is present.
- Two weights and three or four sizes per screen cover almost every hierarchy. More is a sign the hierarchy is unclear.
- One typeface family. A second needs a job description.

## 10. When the product is dense

Professional tools, dashboards and data tables cannot be made sparse, and should not be. Their simplicity comes from predictability:

- A strict grid and a single spacing rhythm, so the eye learns where things are.
- One visual treatment per kind of thing (every number right-aligned and tabular, every status the same pill).
- Strong hierarchy: three levels of emphasis and no more.
- Chrome that stays quiet so the data can be loud. Remove borders, zebra stripes and icons that restate the label.
- Summaries first, detail on demand: the headline number, then the chart, then the table.
- Keyboard paths for everything frequent.

## 11. Checks

- **Five-second test.** Show the screen for five seconds. Can someone say what it is for and what to do first?
- **Squint test.** Blur it. Is there exactly one thing that stands out, and is it the right thing?
- **Delete test.** Remove each element in turn. Did anything get harder? If not, leave it out.
- **Smaller-screen test.** Imagine half the space. What would you cut? Consider cutting it anyway.
- **First-timer test.** Could someone who has never seen it finish the main task without help text?
- **Fiftieth-time test.** Is anything here going to be annoying the fiftieth time (an animation, a confirmation, an onboarding tip)?

## 12. Ways to get it wrong

- **Minimal but not simple.** Everything behind a hamburger; icons without labels; gestures with no visible alternative.
- **Empty but not clear.** Lots of space and still no obvious first action.
- **Removing feedback.** Status, progress and confirmation are not clutter. A screen that says nothing after a tap is not simple, it is silent.
- **Removing capability.** If people need it weekly, hiding it three levels down just moves the complexity into their memory.
- **Simplifying for the screenshot.** The real test is the worst-case content: the long name, the empty list, the error.
