# Geometry

*Pillar 3 · Are the shapes, spacing and alignment decided by a system, or by accident?*

People cannot name what is wrong with a corner that kinks or a gap that is two pixels off, but they register it, the same way they register a door that does not hang straight. Precise geometry is not decoration. It is what makes an interface feel made rather than assembled.

## Contents

1. Why continuous corners
2. The maths
3. Drawing them on each platform
4. Three kinds of shape
5. Concentricity
6. The radius scale
7. Spacing and the grid
8. Optical alignment
9. Hairlines and the pixel grid
10. Checklist

## 1. Why continuous corners

A standard rounded rectangle joins a straight edge (curvature 0) directly to a circular arc (curvature 1/r). The tangent is continuous, so there is no visible angle, but the *curvature* jumps at the joint. The eye, and any highlight running along the edge, picks up that jump as a faint kink where the corner starts. It is the look of a shape cut by a machine with one setting.

A continuous corner ramps the curvature up from zero, holds it, and ramps it back down. The edge flows into the corner the way it does on a milled or moulded object, which is why the same curve is used for the hardware, the display corners and the interface drawn inside them. The difference is small in pixels and large in feel: plain arcs read as slightly cheap; continuous ones read as soft and resolved.

Use continuous corners wherever the platform can draw them, and most of all on large, prominent shapes (cards, sheets, icons, images, windows), where the joint is most visible.

## 2. The maths

**Superellipse** (Lamé curve): `|x/a|ⁿ + |y/b|ⁿ = 1`

| n | Shape |
| --- | --- |
| 1 | Diamond (bevel) |
| 2 | Circle / ellipse — an ordinary `border-radius` corner |
| 4 | The classic "squircle" |
| ≈ 5 | Close to the app-icon silhouette |
| → ∞ | Rectangle |

**Apple's continuous corner** is related but not a pure superellipse: a circular arc through the middle of the corner, joined to the straight edges by curves that ease the curvature in and out. Its key property is that it starts earlier: the curve leaves the straight edge about **1.53 × r** from the corner point, where a circular arc of the same nominal radius starts at exactly r. Figma exposes the same construction as *corner smoothing*; 60% reproduces the iOS shape (the curve then starts at 1.6 × r).

Two consequences that surprise people:

- A continuous corner **needs more edge**. If the side is shorter than about 3.2 × r, there is not enough room and the shape converges on a capsule. Reduce the radius or accept the capsule.
- A superellipse in the same corner *box* as a circle **looks tighter**, because it hugs the corner more closely. To keep the perceived roundness when switching, the box has to grow.

## 3. Drawing them on each platform

| Platform | How |
| --- | --- |
| **SwiftUI** | `RoundedRectangle(cornerRadius: 20, style: .continuous)`; `.clipShape(.rect(cornerRadius: 20, style: .continuous))`. On iOS 26+: `ConcentricRectangle()` and `.containerShape(…)` for corners that follow their container |
| **UIKit / Core Animation** | `layer.cornerRadius = 20; layer.cornerCurve = .continuous` |
| **AppKit** | `layer.cornerCurve = .continuous` on a layer-backed view |
| **CSS** | `corner-shape: squircle` or `superellipse(k)` with `border-radius` (Chromium 139+ at the time of writing; not yet in Safari or Firefox — check current support). Always inside `@supports` |
| **Figma / Sketch** | Corner smoothing 60% ("iOS") |
| **React Native** | `borderCurve: 'continuous'` (iOS only) |
| **Flutter** | `RoundedSuperellipseBorder` / `ClipRSuperellipse` (3.32+); `ContinuousRectangleBorder` on older versions (a different, squarer curve) |
| **Android / Compose** | No system shape; use a path-based shape or accept `RoundedCornerShape`, which is the platform's own look |
| **Canvas, SVG, shaders, game UI** | Generate the path (`assets/squircle.js`) or use a signed-distance function: `pow(abs(p.x), n) + pow(abs(p.y), n) − pow(r, n)` |

### CSS, precisely

`superellipse(k)` uses the exponent `n = 2ᵏ`: `round` is k = 1, `squircle` is k = 2. Because of the "looks tighter" effect, swapping `round` for `squircle` at the same `border-radius` visibly squares the corner. Fitting a superellipse to an iOS-style corner of radius r (60% smoothing) gives:

```css
@supports (corner-shape: superellipse(1.8)) {
  .card {
    border-radius: calc(var(--r) * 1.6);   /* the corner needs more edge */
    corner-shape: superellipse(1.8);       /* max deviation ≈ 1% of r */
  }
}
```

The simpler `corner-shape: squircle` at `radius × 1.84` is within about 2%. Both figures come from a numerical fit against the smoothed-corner construction, not from a specification; treat them as a starting point and judge by eye. `assets/tokens.css` ships this as `--sn-corner-shape` and `--sn-corner-scale`, which fall back to an ordinary corner of the intended size everywhere else.

### Where CSS cannot do it

`assets/squircle.js` returns path data for an iOS-style corner (`continuousCornerPath`) or an exact superellipse (`superellipsePath`):

- As `clip-path: path(…)` (`applySquircle()` keeps it in step with resizes). Clipping also clips `box-shadow` and borders: put the shadow on a wrapper with `filter: drop-shadow()`.
- As an inline SVG background or mask when the element needs a border or shadow of its own.
- For small or low-prominence elements, an ordinary radius is fine. Spend the effort on the shapes people look at.

## 4. Three kinds of shape

Apple's current system names three, and the taxonomy is useful everywhere:

| Kind | Radius | Use |
| --- | --- | --- |
| **Fixed** | A constant from the scale | Standalone surfaces: cards, fields, images |
| **Capsule** | Half the height | Buttons, chips, search fields, sliders; the natural shape for touch controls and for anything near a screen edge on a phone |
| **Concentric** | Parent radius − padding | Anything nested inside a rounded container, and controls near the edge of a window on larger screens |

Capsules nest inside rounded containers without any arithmetic, which is one reason modern system controls lean on them. Dense desktop controls (small and medium sizes) keep rounded rectangles; large ones become capsules.

For a component that appears both nested and standalone, make it concentric with a fallback radius: it adapts when it has a container and uses the fallback when it does not.

## 5. Concentricity

When one rounded shape sits inside another, their corners should share a centre:

```
inner radius = outer radius − gap
```

Give the child the *same* radius as the parent and the band between them is thin along the sides and fat at the corners. The eye reads that as a pinch.

```css
.card      { --r: 28px; --pad: 12px; border-radius: var(--r); padding: var(--pad); }
.card > *  { border-radius: max(calc(var(--r) - var(--pad)), 6px); }
```

- **Clamp to a minimum.** When the gap is larger than the outer radius the formula goes negative; fall back to a small fixed radius (4–6 px) rather than a sharp corner.
- **Carry it through every level.** Window → sidebar → row → thumbnail: each one subtracts its own gap.
- **Include the device.** Controls that sit near the corner of a display or window should be concentric with *that* corner. A square-ish button tucked into a deeply rounded screen corner is the most common place this goes wrong.
- When a radius simply looks off, it is usually this: check the nesting.

`concentricRadius(outer, gap, minimum)` is in `assets/squircle.js`; SwiftUI's `ConcentricRectangle` and `containerShape` do it for you.

## 6. The radius scale

One short scale, chosen by the size of the thing:

| Token | px | Typical use |
| --- | --- | --- |
| `xs` | 6 | Tags, inline chips, small thumbnails |
| `sm` | 10 | Inputs, segmented thumbs, menu items |
| `md` | 14 | Buttons (non-capsule), list containers |
| `lg` | 20 | Cards, popovers |
| `xl` | 28 | Sheets, large panels, dialogs |
| `2xl` | 38 | Full-width sheets, device-scale surfaces |
| `full` | 9999 | Capsules, avatars |

Radius grows with the element: a 28 px corner on a 32 px chip is a blob, a 6 px corner on a full-width sheet looks sharp. Use few distinct radii per screen. A product where everything is one radius looks flat; one where every component has its own looks unplanned.

## 7. Spacing and the grid

- **A 4-point base.** Every gap, inset and size is a multiple of 4; most are 8, 12, 16, 24, 32, 48, 64. One scale, no one-off values.
- **Spacing encodes relationships.** Within a component the steps are small; between groups, clearly larger; between sections, larger again. Adjacent steps that are too similar (12 next to 16) read as a mistake. Make differences obvious or make things equal.
- **Insets ≥ gaps.** A container's padding should be at least as large as the spacing between its children.
- **Margins come from the platform.** Use system layout margins and safe areas, not hard-coded insets: about 16–20 pt on a phone, a readable-width column on wide screens, 60 pt top/bottom and 80 pt side insets on a television.
- **Cap the measure.** Running text is 45–75 characters wide however wide the window is.
- **Align to few edges.** Count the distinct left edges on a screen; fewer is calmer. Aligned things are read as related, indented things as subordinate.
- **Vertical rhythm.** Line heights and block spacing land on the 4-point grid so text in neighbouring columns lines up.

## 8. Optical alignment

Mathematical centring and visual centring are different things, and the eye judges the second.

- **Triangles and asymmetric glyphs**: a play triangle centred by its bounding box looks too far left. Centre it on its centre of mass (shift it about a tenth of its width toward the point).
- **Icon weight**: a circle and a triangle must be drawn slightly larger than a square to look the same size. Icon families use keyline shapes for this; do not scale icons to identical bounding boxes.
- **Text in a box**: text is centred on its line box, which includes space for descenders. Labels in buttons often sit visually low or high. Trim to cap-height where supported (`text-box: trim-both cap alphabetic`), or adjust by a pixel.
- **Icon beside text**: align to the text's cap-height and optical centre, and match stroke weight to the font weight. A regular-weight label with a bold icon looks like two products.
- **Round shapes overshoot.** Curved edges need to extend slightly past the line straight edges sit on (the same reason an "O" is taller than an "H"). A circular avatar beside a square thumbnail may need a fraction more size.
- **Padding around text is visual, not numeric.** Equal top and bottom padding rarely looks equal; uppercase and numerals need less above. Check with the eye.
- **Quotation marks and bullets** can hang in the margin so the text edge stays straight.

When a number says it is centred and the eye says it is not, the eye is right.

## 9. Hairlines and the pixel grid

- **A hairline is one device pixel**, not one CSS pixel or one point: 0.5 on a 2× display, a third on 3×. Use it for separators so they stay crisp and light.
- **Keep edges on whole device pixels at rest.** Fractional positions blur borders and text. Round transforms once motion settles.
- **Separators belong to the content.** In a list with leading icons, the divider starts where the text starts, not at the icon, and never under the last row.
- **Inner edges, not outer borders.** A 0.5–1 px inset highlight (lighter on top in dark mode) defines a surface without adding to its size.
- **Images get an edge too.** A 0.5 px inner stroke at low opacity stops a white image dissolving into a white background.

## 10. Checklist

- [ ] Prominent shapes use continuous corners where the platform supports them
- [ ] Every nested corner is concentric; clamped to a minimum
- [ ] Controls near a screen or window corner follow that corner
- [ ] Radii come from one scale and grow with element size
- [ ] All spacing is on the 4-point scale; no one-off values
- [ ] Inside-group spacing is visibly tighter than between-group spacing
- [ ] Text measure capped; margins from the platform's guides and safe areas
- [ ] Few alignment edges; icons optically centred and weight-matched to text
- [ ] Separators are hairlines, inset to the text, absent after the last row
- [ ] Nothing sits on a fractional pixel at rest
