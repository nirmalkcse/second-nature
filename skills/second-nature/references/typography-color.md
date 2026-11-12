# Typography, colour and icons

Type, colour and symbols carry almost all of an interface's meaning. Getting them right is mostly a matter of using what the platform already tuned, and resisting the urge to add.

## Contents

1. Use the system font
2. Sizes
3. Tracking and leading
4. Weight and hierarchy
5. Text that scales
6. Web typography details
7. Colour: semantic, not literal
8. One accent
9. Light, dark and contrast
10. Wide colour and modern colour spaces
11. Inclusive colour
12. Icons and symbols

## 1. Use the system font

The system font is the one the person reads all day, tuned for their display and their language, with optical sizing and tracking built in. It is also free: no download, no layout shift.

| Platform | System family | Notes |
| --- | --- | --- |
| iOS, iPadOS, macOS, tvOS, visionOS | SF Pro | Rounded, Condensed and Expanded variants; New York (serif); SF Mono |
| watchOS | SF Compact | Flatter sides for small sizes and narrow columns |
| Windows | Segoe UI Variable | Has an optical axis: name `Segoe UI Variable Display` for headings, `Text` for body |
| Android | Roboto / Google Sans | |
| Web | `system-ui` | Resolves to the above. Also `ui-rounded`, `ui-serif`, `ui-monospace` |

```css
font-family: system-ui, -apple-system, 'Segoe UI Variable Text', 'Segoe UI', Roboto, sans-serif;
```

**Licensing.** The San Francisco and New York font files are licensed for designing and building software for Apple platforms. Do not self-host them on a website or ship them in a non-Apple product. The generic `system-ui` keyword gives Apple-device visitors San Francisco legitimately and everyone else their own system font, which is the right behaviour anyway.

A custom typeface is a brand decision. If the product has one, use it for the brand's voice (headlines, marketing) and consider leaving interface text to the system font. Whatever the face, the rules below still apply.

## 2. Sizes

Default and minimum text sizes by platform:

| Platform | Default body | Minimum |
| --- | --- | --- |
| iOS, iPadOS | 17 pt | 11 pt |
| macOS | 13 pt | 10 pt |
| watchOS | 16 pt | 12 pt |
| tvOS | 29 pt | 23 pt |
| visionOS | 17 pt | 12 pt |
| Web | 16–17 px | 12 px for incidental text |

The iOS text styles at the default size (use the styles, not the numbers, so text scales):

| Style | Size / leading | Weight |
| --- | --- | --- |
| Large Title | 34 / 41 | Regular |
| Title 1 | 28 / 34 | Regular |
| Title 2 | 22 / 28 | Regular |
| Title 3 | 20 / 25 | Regular |
| Headline | 17 / 22 | Semibold |
| Body | 17 / 22 | Regular |
| Callout | 16 / 21 | Regular |
| Subheadline | 15 / 20 | Regular |
| Footnote | 13 / 18 | Regular |
| Caption 1 | 12 / 16 | Regular |
| Caption 2 | 11 / 13 | Regular |

macOS runs smaller and denser (Large Title 26/32, Title 1 22/26, Body 13/16, Footnote 10/13). tvOS runs much larger (Title 1 76/96, Body 29/36, Caption 25/32) because it is read from across a room.

A screen rarely needs more than three or four of these. On the web, set sizes in `rem` so they follow the person's browser setting, and make display sizes fluid: `clamp(2.5rem, 1.6rem + 3.6vw, 4.5rem)`.

## 3. Tracking and leading

**Both depend on size. One value for all sizes is always wrong somewhere.**

- **Large type**: tighter tracking, tighter leading. Letters and lines drift apart visually as they grow.
- **Small type**: slightly looser tracking, relatively more leading, for legibility.
- **All-caps and small labels**: noticeably wider tracking (+0.04 to +0.08 em).

San Francisco applies size-specific tracking automatically at run time. Its table, for mock-ups and for understanding the shape of the curve (tracking in thousandths of an em):

| Size (pt) | 11 | 12 | 13 | 15 | 17 | 20 | 22 | 28 | 34 | 48 | 64 | 80+ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Tracking | +6 | 0 | −6 | −16 | −26 | −23 | −12 | +14 | +12 | +8 | +4 | 0 |

The upturn above 20 pt is specific to San Francisco: its variable design already narrows the letterforms at display sizes, so the tracking compensates. Do not copy these numbers onto another typeface. For most other faces (Inter, Segoe, Roboto, a brand font):

| Role | Tracking | Line height |
| --- | --- | --- |
| Display (40 px +) | −0.02 to −0.03 em | 1.05–1.1 |
| Titles (20–34 px) | −0.01 to −0.02 em | 1.15–1.25 |
| Body (15–18 px) | 0 | 1.4–1.5 |
| Captions (≤ 12 px) | +0.01 em | 1.3–1.4 |

Avoid tight leading on three or more lines of text even where space is short; loosen it for wide columns and long passages, and for scripts with tall ascenders and descenders.

## 4. Weight and hierarchy

- Build hierarchy from **size, weight and colour together**. Weight adds emphasis without taking space.
- **Avoid Ultralight, Thin and Light** for interface text; they fail on small sizes, low-density screens and in sunlight. Regular, Medium, Semibold and Bold cover everything.
- Two weights per screen is normal; three is the limit.
- Secondary text is quieter by colour (`label-2`) before it is smaller.
- Keep the relative hierarchy intact when text size changes.
- **Few typefaces.** One family is enough for almost any product; a second needs a clear job.
- Bolder weights read better over busy or translucent backgrounds.

## 5. Text that scales

People choose their text size (Dynamic Type on Apple platforms, the font-size setting on Android and in browsers), and some rely on very large sizes. Respecting it is not optional.

- Use text styles or relative units, never fixed point sizes for content.
- **The layout adapts, not just the glyphs**: side-by-side items stack, rows grow taller, multi-column layouts lose columns.
- Icons that carry meaning scale with the text.
- Keep truncation to a minimum; let labels wrap.
- Not everything must grow equally: prioritise the content people came to read over chrome like tab titles.
- Keep primary content near the top at every size.
- Test at the largest accessibility size on the smallest screen.

## 6. Web typography details

```css
body        { font: 400 1.0625rem/1.47 system-ui, sans-serif; font-optical-sizing: auto; }
h1, h2, h3  { text-wrap: balance; letter-spacing: -0.01em; line-height: 1.2; }
p           { text-wrap: pretty; max-inline-size: 65ch; }
.numeric    { font-variant-numeric: tabular-nums; }
.label      { text-box: trim-both cap alphabetic; }   /* true optical centring, where supported */
```

- Curly quotes, real dashes, non-breaking spaces before units.
- Hyphenate justified or narrow columns (`hyphens: auto`) with the document language set.
- `-webkit-text-size-adjust: 100%` to stop landscape font inflation.
- If loading a web font: one variable file, subset, preloaded, with fallback metrics matched so the swap does not move the layout.
- Do not fake bold or italic; load the real cut or do without.

## 7. Colour: semantic, not literal

Name colours for what they mean. A component asks for `label` or `separator`, not for a hex value, so light, dark, high-contrast and future themes all work without touching it.

A minimal semantic set (see `assets/tokens.css`):

| Role | Purpose |
| --- | --- |
| `bg`, `bg-2`, `bg-3` | Base, grouped/secondary, and elevated surfaces |
| `label`, `label-2`, `label-3`, `label-4` | Text and icons from primary to decorative |
| `fill-1…3` | Translucent fills for controls, so they adapt to whatever is behind |
| `separator` | Hairlines |
| `accent` | Interactivity |
| `success`, `warning`, `danger` | Status, used only when the status is present |

- Do not hard-code system colour values on native platforms; they shift between releases and appearances. Use the APIs.
- Do not reuse a semantic colour for a different job (the separator colour as text).
- **The same colour means the same thing everywhere.** If the accent marks interactive text, non-interactive text is never that colour.
- Neutrals do the structural work. Greys with a faint tint of the brand hue feel more considered than pure grey.
- Translucent fills and labels (black or white at an alpha) sit correctly on any surface; opaque greys only on the background they were chosen for.

## 8. One accent

The accent colour is a signal: *you can act here*. Signals work by being rare.

- One accent per product, used for primary actions, selection, links and focus.
- Never for decoration, large backgrounds or headings.
- One *filled* accent element per view (the primary action). Others are tinted or plain.
- Over colourful or photographic backgrounds, prefer monochrome labels; coloured text on coloured glass is hard to read.
- Check the accent in both appearances and against its own text: white on the accent must reach 4.5:1.

## 9. Light, dark and contrast

**Dark mode is its own design**, not an inversion.

| | Light | Dark |
| --- | --- | --- |
| Depth shown by | Shadows | Lighter surfaces as they rise; a thin light edge |
| Base | White or near-white | Black or near-black |
| Elevated surface | White with shadow | A lighter grey |
| Colours | As chosen | Slightly lighter and less saturated, to avoid vibrating |
| Text | Near-black | Slightly off-white for long reading |

- Supply both variants of every colour and image; test every screen in both.
- Honour the system setting by default; an in-app override sits on top of it.
- Ease the change between themes instead of flashing.

**Contrast minimums**

| Text | Minimum ratio |
| --- | --- |
| Up to 17 pt, any weight | 4.5 : 1 |
| 18 pt and above | 3 : 1 |
| Bold at any size | 3 : 1 |

Interface components and meaningful icons also need 3:1 against their surroundings. Provide a higher-contrast variant when the person asks for it (`prefers-contrast: more`, Increase Contrast): firmer text colours, visible borders, solid surfaces.

Test in bright light and in the dark. Colours look darker and flatter in sunlight and brighter in a dim room.

## 10. Wide colour and modern colour spaces

- Modern displays cover Display P3. Use it for imagery and for accents that benefit from extra saturation, with an sRGB fallback.
- Prefer a perceptual space (OKLCH) for building palettes: equal steps in lightness look equal, and hue stays put as lightness changes.
- `light-dark(a, b)` gives one declaration for both appearances; `color-mix()` derives tints, hovers and translucent variants from a single source.
- Smooth gradients need intermediate stops along an eased curve; a plain two-stop fade to transparent shows a visible edge. Add a little noise or dithering if banding appears.

```css
--accent: light-dark(oklch(0.55 0.2 257), oklch(0.7 0.16 255));
--accent-soft: color-mix(in oklch, var(--accent) 14%, transparent);
```

## 11. Inclusive colour

- **Never colour alone.** Pair it with a shape, an icon, a label or a position: an error has an icon and text, a chart series has a pattern or direct label.
- About one in twelve men has a colour-vision deficiency; red and green are the common confusion. Check designs through a simulator.
- Colour meanings vary by culture. Red is danger in some places and good fortune in others.
- Text contrast applies over images and materials too; test over the worst-case background.

## 12. Icons and symbols

- **One family**, drawn on one grid, with one stroke logic.
- **Weight matches the text beside it**, and the symbol scales with the text. On Apple platforms SF Symbols does both automatically, offers nine weights and three scales, and aligns to the baseline.
- **Rendering modes** carry meaning: monochrome for most interface use; hierarchical or palette to show depth or status; multicolour only where the colours are intrinsic (weather, flags).
- **Outline for unselected, fill for selected** is the common convention; hold it throughout.
- **Animate a symbol to mark an event** (a bounce on arrival, a pulse while active, a morph between two related states), once, not in a loop.
- **A label is clearer than an icon** unless the symbol is universal. Menus benefit from one symbol per group, not one per item.
- **Licensing again.** SF Symbols are for interfaces on Apple platforms. Elsewhere, choose an open family that offers multiple weights so the matching rule can still be followed.
- App icons: a single, simple, recognisable idea; no text; fills the shape; works at 16 px and at 1024 px, on light, dark and tinted backgrounds.
