# Consistency

*Pillar 5 · Does the same thing look and behave the same everywhere?*

People do not learn an interface screen by screen. They learn a handful of rules ("blue text can be tapped", "swiping down closes things", "the primary button is on the right") and apply them everywhere. Each time a rule holds, the product gets easier; each exception costs a moment of doubt and a little trust. Consistency is what lets one lesson pay off a hundred times.

## Contents

1. Three kinds of consistency
2. Tokens: one scale for each thing
3. Components: one per job
4. One motion language
5. Icons and symbols
6. Voice
7. Across devices: one product, many shapes
8. At home on each platform
9. Keeping it consistent
10. When to break it
11. Checklist

## 1. Three kinds of consistency

| Kind | Meaning | Fails when |
| --- | --- | --- |
| **With the platform** | Behaves like everything else on this device | A custom back gesture, a non-standard text field, a scroll that feels foreign |
| **Within the product** | The same element is the same everywhere | Three button styles, two date formats, a modal that closes differently on one screen |
| **Across devices** | One product on phone, tablet, desktop, watch, TV | Features renamed, moved or missing from one to another |

People spend most of their time in *other* software, so their expectations are set before they open yours (Jakob's law). Use the convention unless you can demonstrate that your alternative is better, and even then weigh the cost of being the exception.

## 2. Tokens: one scale for each thing

A design token is a named decision. Every value in the interface should trace back to one.

**Three layers**

| Layer | Example | Rule |
| --- | --- | --- |
| Primitive | `gray-900`, `space-4`, `radius-lg` | The raw palette and scales. Never used directly in components. |
| Semantic | `label`, `bg-elevated`, `accent`, `separator` | What a value *means*. Components use these. |
| Component | `button-height`, `card-radius` | Only where a component needs its own name; defined in terms of semantic tokens. |

**One scale each** for space, radius, type size, weight, colour role, elevation, duration and easing. `assets/tokens.css` is a complete example.

- **No magic numbers.** A value that is not on a scale is either a mistake or a new token. `13px` beside a scale of 12 and 16 is a bug waiting to be copied.
- **Themes swap at the semantic layer.** Light, dark and high-contrast are different values for the same names, so components never ask which mode they are in.
- **Names describe role, not appearance.** `danger`, not `red`; `label-secondary`, not `gray-500`.
- **One source of truth**, exported to wherever it is consumed: CSS custom properties, a Tailwind theme, a Swift enum, a Compose theme, a Figma library. Divergence between design files and code is the most common way consistency dies.

If the project already has tokens, use them. Map this skill's names onto the existing ones rather than adding a second system.

## 3. Components: one per job

- **One component for one job.** Two ways to pick a date or confirm an action means people must learn both, and the team must maintain both.
- **Shared anatomy.** Every list row has its leading, title, subtitle, accessory and separator in the same places. Every dialog has its title, message and actions in the same order.
- **Few variants, clearly ranked.** Buttons: primary, secondary (tinted), tertiary (plain), destructive. If a new variant is needed, an existing one is probably being misused.
- **Standard states.** Every component implements the same state list ([feedback.md](feedback.md)) in the same visual language.
- **Consistent placement.** The primary action, the close control, the back affordance and search live in the same place on every screen. People stop looking and start reaching.
- **Things that look the same behave the same.** And the reverse: if it behaves differently, it must look different.
- **Do not repurpose a familiar symbol.** A trash can deletes; a magnifying glass searches. Giving a known icon a new meaning breaks a rule people brought with them.

## 4. One motion language

Motion is part of the visual identity, and inconsistency in it is felt even when it is not seen.

- **One tempo.** Choose a house duration and derive every transition from it. A product with one snappy menu and one languid one feels like two products.
- **One spring per role** (see [motion.md](motion.md)): the same press, the same sheet, the same list insertion everywhere.
- **Sub-animations share a family.** Parts of one component animate with related timing, so it reads as a single object.
- **One transition per navigation type**: push, modal, tab switch and zoom each look the same wherever they occur.
- **Same direction in, same direction out**, product-wide.

## 5. Icons and symbols

- **One family.** Same grid, same corner treatment, same stroke logic. Mixing sets is as visible as mixing typefaces.
- **Weight follows text.** An icon beside regular text is regular weight; beside semibold, semibold. On Apple platforms SF Symbols does this automatically; elsewhere, choose or draw an icon weight to match.
- **Scale with text.** Icons grow when text size grows.
- **Outline versus fill has meaning**: commonly outline for unselected, filled for selected. Keep it uniform.
- **Use the standard glyph** for standard actions (share, search, close, add, edit). Novel metaphors need a label.
- **A label beats an icon** unless the icon is universal. In menus, an icon per group aids scanning; an icon on every item is noise.

## 6. Voice

The words are part of the system.

- One name per concept, used everywhere (not "workspace" here and "project" there).
- One set of verbs for the same actions ("Delete" is always "Delete", never sometimes "Remove").
- Consistent capitalisation, date, time and number formats, all from the locale.
- The same tone in an error as in a welcome: plain, direct, on the person's side.

## 7. Across devices: one product, many shapes

The same product on a phone, a tablet, a laptop, a watch and a television should feel like one thing that understands where it is.

- **Share the model, adapt the expression.** The information architecture, the names, the symbols and the core interactions are the same. Layout, density and input adapt.
- **Each device has a posture.** Phone: one-handed, vertical, quick. Tablet: between focus and depth. Desktop: wide, precise, keyboard-heavy, many windows. Watch: a two-second glance. Television: across the room, one focus at a time. Spatial: eyes and hands, comfort first.
- **Same functionality, different amounts visible.** A tab bar on a phone can become a sidebar on a wide screen; an overflow menu can unfold into a toolbar. Do not remove capabilities because the window got smaller.
- **Lay out by available space, not by device name.** Size classes, container queries and window width tell you how much room there is; "is iPad" does not.
- **Keep grouped things together** as the layout changes, and keep content and controls in predictable positions so people stay oriented through a resize or rotation.
- **Carry state across.** What someone was doing on one device should be where they left it on the next. Preserving context is the highest form of consistency.
- **Give every platform the same care.** A brilliant phone app with a stretched-phone tablet version tells people which customers matter.

## 8. At home on each platform

Being consistent with the host platform beats being consistent with yourself. The principles in this skill are universal; their expression is not.

| | Apple platforms | Android | Windows | Web |
| --- | --- | --- | --- | --- |
| System type | SF Pro / SF Compact | Roboto, Google Sans | Segoe UI Variable | `system-ui` |
| Back | Edge swipe, leading chevron | System back gesture, predictive back | Title-bar back, Alt+← | Browser back must work |
| Primary navigation | Tab bar (bottom), sidebar | Navigation bar / rail / drawer | Navigation view (left) | Top or side nav |
| Primary action | Trailing in bar; default button on the right | FAB or trailing | Bottom-right of dialogs; accent button | By reading order |
| Dialog button order | Cancel then confirm (confirm trailing) | Dismiss then confirm | Confirm then cancel | Follow the host OS where possible |
| Corners | Continuous | Circular; shape system varies by theme | Small radii (4–8) | Whatever the brand system says |
| Motion | Springs | Springs and emphasised easing | Brief, connected animations | Springs and decelerating curves |
| Feedback | Taptic haptics | Haptic constants | Mostly visual and sound | Mostly visual |

A cross-platform product should share its tokens' *structure* and its brand, and let each platform supply the native control behaviours. Shipping iOS-style switches and sheets on Android, or Material ripples on iOS, signals that the product was ported, not built.

## 9. Keeping it consistent

- **Audit before adding.** Search the codebase for an existing component, token or pattern before creating one.
- **Lint the values.** `scripts/audit.mjs` flags behaviours that drift (ungated hover, ad-hoc easing, `transition: all`); a token linter catches raw hex and pixel values.
- **Document by example.** One page that shows every component in every state, in light and dark, is worth more than a specification.
- **Change in one place.** If a tweak means editing twelve files, the abstraction is missing.
- **Review for drift.** New work is compared against the system, not against the last screen someone built.

## 10. When to break it

Consistency serves people; it is not the goal. Break a pattern when:

- you can show (with real people, not opinion) that the alternative is meaningfully better for the task;
- the context is truly different, and the difference is signalled visually;
- the platform itself has moved on.

Then make the new pattern the consistent one: update the system, do not leave a one-off.

## 11. Checklist

- [ ] Every value comes from a token; no raw colours, sizes or durations in components
- [ ] Components use semantic tokens; themes swap without touching components
- [ ] One component per job; variants are few and ranked
- [ ] Same placement for primary action, close, back and search on every screen
- [ ] Identical-looking things behave identically
- [ ] One tempo, one spring per role, one transition per navigation type
- [ ] One icon family, weight-matched to text; standard glyphs for standard actions
- [ ] One name per concept; formats come from the locale
- [ ] Functionality is the same at every window size; layout adapts by available space
- [ ] Platform conventions are followed on each platform
