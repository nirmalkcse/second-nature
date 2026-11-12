# Cognition

*Pillar 6 · How much does the person have to remember, decide or decode?*

Using an interface is mental work: see what is there, work out what it means, decide what to do, do it, remember where you were. Every one of those can be made cheaper. The interfaces that feel effortless are not the ones with the least in them; they are the ones that ask the least of the person at each moment.

## Contents

1. Four costs
2. The laws, and what each one makes you do
3. Time
4. Wayfinding
5. Hierarchy
6. Mapping and affordance
7. Memory
8. Forgiveness
9. Reading and forms
10. Attention
11. One mind, many screens
12. Accessibility is the same problem
13. Emotional load
14. Checklist

## 1. Four costs

| Cost | Reduce it by |
| --- | --- |
| **Perceiving** — finding the thing | Hierarchy, grouping, alignment, contrast, less on screen |
| **Deciding** — choosing among options | Fewer options, a clear default, a recommended path |
| **Acting** — getting the pointer or finger there | Bigger, nearer targets; fewer steps; forgiving input |
| **Remembering** — holding state in the head | Show it instead; recognise rather than recall; keep context |

When something feels hard to use, name which cost is too high. The fix is different for each.

## 2. The laws, and what each one makes you do

| Law | In one line | Design consequence |
| --- | --- | --- |
| **Hick's** | Decision time grows with the number and complexity of choices | Cut options; group them; highlight one; split long decisions into short steps |
| **Fitts's** | Time to hit a target depends on its size and distance | Make frequent targets large and close; use edges and corners; put primary actions where the thumb rests |
| **Miller / Cowan** | Working memory holds about four chunks | Chunk information (3–4 digit groups, 3–5 tabs); never ask people to carry something from one screen to the next |
| **Jakob's** | People spend most of their time in other products | Follow conventions; innovate where it pays, not in navigation |
| **Tesler's** | Complexity cannot be removed, only moved | Move it into the system: defaults, inference, formatting, error correction |
| **Doherty threshold** | Under ~400 ms, person and system stay in rhythm | Answer within it, or show that you are answering |
| **Gestalt: proximity** | Near things are seen as related | Space is the primary grouping tool |
| **Gestalt: similarity** | Alike things are seen as the same kind | Same role, same look, and only the same role |
| **Gestalt: common region** | Things in a shared boundary belong together | Cards and backgrounds group; do not box unrelated items |
| **Gestalt: common fate** | Things that move together belong together | Animate related elements as one; never co-move unrelated ones |
| **Gestalt: continuity / closure** | The eye follows lines and completes shapes | A clipped card at the edge says "there is more"; alignment creates invisible lines |
| **Von Restorff** | The different one is remembered | One emphasised element per view; two is zero |
| **Serial position** | First and last items are recalled best | Put the most important destinations at the ends of a bar |
| **Peak–end** | An experience is judged by its peak and its end | Polish the completion moment and the hardest step |
| **Goal gradient / Zeigarnik** | Effort rises near the goal; unfinished tasks nag | Show progress; start people part-way; save drafts |
| **Aesthetic–usability** | Attractive things are perceived as easier to use | Craft buys patience, and can hide problems in testing |
| **Postel's** | Be liberal in what you accept | Accept any phone format, trailing spaces, pasted mess; tidy it yourself |
| **Recognition over recall** | Recognising is easier than remembering | Menus, recents, suggestions, visible state; no memorised commands as the only path |
| **Change blindness** | Unsignalled changes go unnoticed | Animate or highlight what changed, where the eye already is |
| **Pre-attentive attributes** | Colour, size, motion and orientation pop out before thought | Use one of them, for one thing, per view |

These are tendencies, not physics. Use them to generate and question designs, then test with people.

## 3. Time

Three thresholds describe how delay feels:

- **≈ 0.1 s** — instantaneous. The person feels they caused the result directly.
- **≈ 1 s** — the flow of thought survives, but the delay is noticed. Show that something is happening.
- **≈ 10 s** — attention is gone. Show progress, give an estimate, let them do something else.

Motion should fill a delay, never create one. See [performance.md](performance.md) and the waiting table in [feedback.md](feedback.md).

## 4. Wayfinding

At any moment the screen should answer, without reading: **Where am I? Where can I go? What will I find there? How do I get back?**

- A persistent indicator of location: selected tab, highlighted sidebar item, title.
- Titles that name the place, in the same words as the control that led there.
- A back path that always works and always returns to the same state, including scroll position.
- Destinations named for their contents ("Library", "Activity"), not generic containers ("Home", "More").
- Never a dead end: every screen has a way out, and every modal a visible close.
- Depth that is shallow and broad over deep and narrow. Three levels is a lot.

## 5. Hierarchy

Hierarchy is how a layout tells people what matters without words.

- **Tools, strongest first:** position and order, size, weight, colour and contrast, space around it.
- **Three levels, not seven:** primary (one thing), secondary (a few), tertiary (the rest). If everything is emphasised, nothing is.
- **Reading order is the default path:** top to bottom, leading to trailing. Put the important thing where reading begins. Mirror for right-to-left.
- **Alignment is information:** aligned items are peers; indented items are children.
- **Answer three questions at a glance:** what should I look at, what can I interact with, how do I interact?
- **Turn data into a picture** when a picture is faster: a summary figure, then a chart, then the table.

## 6. Mapping and affordance

- **Controls live next to what they affect**, and are arranged like the thing they control (volume up is above volume down; the left arrow is on the left).
- **Affordances are visible.** Things that can be pressed look pressable; things that can be dragged show a handle or a peeking edge. Do not rely on discovery.
- **Metaphors neither too literal nor too abstract.** A trash can that keeps items until emptied works because it behaves like one. A metaphor that looks right and behaves wrong is worse than none.
- **If a control needs a label to explain what it does, its mapping is weak.** Fix the mapping before writing the tooltip.
- **Physical consistency.** If something slid in from the right, the gesture that removes it goes right. The motion taught the mapping.

## 7. Memory

Assume people remember nothing between screens, and little between sessions.

- Show the current state; do not make them infer it from history.
- Keep the thing being edited visible while it is edited.
- Offer recents, suggestions and autofill before a blank field.
- Labels stay visible; a placeholder that vanishes on typing is a memory test.
- Carry information forward: never ask for something already known.
- Preview the result of an action before committing where it is costly to reverse.
- Restore where they were: scroll position, open panels, drafts, the tab they left.
- Teach in context, at the moment of need, not in a tour before they have a reason to care.

## 8. Forgiveness

People explore when mistakes are cheap, and exploring is how they learn.

- **Undo over confirm.** A confirmation dialog interrupts everyone to protect a few; undo protects the few without interrupting anyone. Keep dialogs for the destructive *and* irreversible.
- **Soft deletes**: a trash, an archive, a grace period.
- **Autosave** and drafts. Losing work is the least forgivable thing software does.
- **Reversible navigation**: leaving a flow half-way should not destroy it.
- **Generous input**: accept the format people type and fix it yourself.
- **Guard rails, not walls**: explain why something is unavailable instead of silently disabling it.

## 9. Reading and forms

- Measure of 45–75 characters; body text at the platform default size or larger; line height around 1.4–1.5 for prose.
- Left-aligned (leading-aligned) text for anything longer than a line or two.
- One column for forms; labels above fields; related fields grouped.
- The right keyboard and input type for each field; autofill hints set.
- Validate when a field is left, not on every keystroke; confirm success as soon as it is true.
- Break long numbers into chunks; format as people do locally.
- Only ask what is needed now. Every optional field makes the form feel longer.

## 10. Attention

Attention is borrowed. Return it promptly.

- **One interruption at a time**, and only for things that need the person now.
- **Quiet by default.** Badges, banners and sounds must be earned; each unnecessary one devalues the rest.
- **Motion in the periphery pulls the eye involuntarily.** Nothing should animate while someone is reading unless it is the thing they asked for.
- **Do not bury information in transient UI.** A toast that vanishes in three seconds is not a record.
- **Batch and summarise** updates instead of delivering each one.
- **Ask for permission at the moment of need**, with the reason in plain words, and take no for an answer.

## 11. One mind, many screens

The same person moves between a phone, a laptop, a watch and a television in a day. A premium experience keeps their mental model intact across all of them, at every size and aspect ratio.

- **Adapt to available space, not to device names.** Use size classes, container queries and window dimensions. A tablet window can be phone-sized; a phone can be mirrored into a resizable desktop window.
- **Design the extremes first:** the smallest supported screen with the largest text, and the widest window. The middle follows.
- **Reachability.** On a phone held in one hand, the bottom third is easy, the top corners are a stretch. Put frequent and primary actions low (tab bars, search, the main button); keep destructive ones out of the easy zone.
- **Input changes the rules.** Touch needs 44 pt targets and has no hover. A pointer is precise, can hover and scroll, and pairs with a keyboard. A remote moves focus one step at a time. Eyes and hands need 60 pt targets and comfort. Support every input the device has.
- **Text size is the person's choice.** Layouts reflow: side-by-side elements stack, rows grow, columns reduce, and the important content gets the space. Test at the largest accessibility size.
- **Never distort.** When the aspect ratio changes, scale artwork to fill and crop the unimportant part; do not stretch, and avoid letterboxing.
- **Respect the hardware:** safe areas, rounded display corners, cut-outs, the home indicator, fold hinges.
- **Glance distance sets the scale.** A watch is read in two seconds at arm's length; a car display in a glance; a television from three metres. Type, contrast and density follow from that, not from pixel count.
- **Stay oriented through change.** Rotation, resizing and moving to another device keep content and controls in recognisable positions, with a transition that shows what went where.

## 12. Accessibility is the same problem

Designing for people who see, hear, move or think differently is the same work as reducing cognitive load, taken seriously. It improves the product for everyone, including a person in sunlight, on a train, or holding a child.

- Contrast of at least 4.5:1 for text (3:1 for large or bold); never colour alone to carry meaning.
- Targets at least 44 pt; spacing between them.
- Every control has a name for assistive technology; focus order follows reading order; nothing is reachable only by gesture or hover.
- Text scales; layouts survive it.
- Captions and transcripts for audio; no information only in sound.
- Reduced motion, reduced transparency and increased contrast are honoured.
- Time limits are adjustable or absent.
- Test with a screen reader and with the keyboard alone. It finds structural problems nothing else does.

## 13. Emotional load

Confusion, anxiety and blame are also costs.

- Tone is calm and specific. The interface never blames the person.
- Waiting with no information is stressful; a clear status is reassuring even when the news is slow.
- Trust is built by transparency: say what data is used and why, at the moment it matters.
- Do not manufacture urgency. Countdown pressure, guilt-laden opt-outs and hidden costs spend trust that craft cannot buy back.
- Decide what the product should make people feel (calm, capable, energised) and check each screen against it.

## 14. Checklist

- [ ] One obvious first action on every screen
- [ ] No more options visible than needed; a default or recommendation where there is a choice
- [ ] Frequent targets are large and within easy reach
- [ ] Nothing has to be remembered from another screen
- [ ] Where am I / where can I go / how do I get back are answerable at a glance
- [ ] Related things are grouped by proximity; one thing is emphasised
- [ ] Controls sit beside what they affect
- [ ] Undo exists; confirmations are rare and specific
- [ ] Responses arrive within 100 ms, or progress is shown
- [ ] Layout holds at the smallest size, the largest text and the widest window
- [ ] Works by keyboard and screen reader; contrast and target sizes pass
- [ ] The tone would be acceptable said aloud to the person
