# Materials and depth

An interface is not flat, even when it is drawn flat. Some things sit on the content, some float above it, some interrupt everything. Showing that order clearly lets people keep their place: they can see what they were doing behind what they are doing now.

## Contents

1. Two layers
2. Liquid Glass: what it is and the rules for it
3. What changed in iOS 27, and what to learn from it
4. Standard materials
5. Translucency on the web
6. Translucent or solid?
7. Elevation and shadow
8. Dimming and focus
9. Where chrome meets content
10. Separating things: an order of preference
11. Checklist

## 1. Two layers

Apple's current system makes the model explicit, and it is a good model for any interface:

- **The content layer**: what the person came for. Solid, legible, edge to edge.
- **The functional layer**: navigation and controls (bars, sidebars, sheets, popovers, floating buttons). It floats above the content, lets content pass beneath it, and is drawn in a material that makes clear it is a different kind of thing.

Controls are distinguished from content by *being on a different layer*, not by boxes and borders. Content extends under the functional layer to the edges of the screen or window.

## 2. Liquid Glass: what it is and the rules for it

Introduced across Apple's platforms in 2025 (iOS 26, macOS 26 and their siblings). Earlier materials *scattered* light, like frosted glass. Liquid Glass *bends* it: it refracts and reflects what is beneath, has a specular edge, and moves like a light gel.

**How it behaves**

- It adapts continuously to what is behind it: shadows deepen when text scrolls underneath, it can switch between light and dark on its own, and nearby colour spills onto it.
- It responds to touch: it flexes and lights up under the finger, and elements can lift into glass while being manipulated. The response is stronger for direct touch than for a pointer.
- Larger pieces read as thicker: stronger shadows and more pronounced lensing.
- Shapes morph between states (a button becoming a menu) instead of cross-fading.

**The rules**

| Rule | Why |
| --- | --- |
| Use it for the functional layer only; **not in the content layer** | Its job is to distinguish controls from content. The exception is the moving part of a control (a slider thumb, a toggle) while it is being used |
| Use it **sparingly on custom controls** | It exists to draw attention to the content beneath; a screen full of glass draws attention to the glass |
| **Never stack glass on glass** | Legibility collapses. Things on top of glass use fills, transparency and vibrancy |
| **Regular** variant by default | It blurs and adjusts luminosity to keep text legible; right for anything with text (alerts, sidebars, popovers) |
| **Clear** variant only over visually rich media, where the content can tolerate dimming and is bold and bright | It is much more transparent and does not adapt; add a dark dimming layer of about 35% behind it when the content is bright |
| Do not mix the two variants in one place | They read as different materials |
| **Tint only to emphasise** a primary action | Colour on glass is a strong signal; over a colourful background prefer monochrome labels |
| Put the material on the control, not on views inside it | One surface, one material |

Standard system components adopt all of this automatically. That is the strongest reason to use standard bars, sheets and controls on Apple platforms: custom chrome has to re-implement behaviour that keeps changing.

**APIs (as introduced with iOS 26; check current documentation)**: SwiftUI `glassEffect(_:in:)`, `GlassEffectContainer`, `glassEffectID(_:in:)` for morphing, `.buttonStyle(.glass)` and `.glassProminent`, `scrollEdgeEffectStyle(_:for:)`, `backgroundExtensionEffect()`, `tabBarMinimizeBehavior(_:)`; UIKit `UIGlassEffect`, `UIGlassContainerEffect`, `UIBackgroundExtensionView`.

**Outside Apple platforms, do not imitate it.** True refraction needs the system compositor; web approximations with displacement filters are expensive, inconsistent across browsers, and read as costume. Take the principles (a distinct floating layer, adapting to content, legibility first) and express them in the host platform's own material.

## 3. What changed in iOS 27, and what to learn from it

After a year of legibility complaints, the 2026 releases refined the material rather than replacing it. As reported at the time:

- Glass diffuses complex content behind it more effectively; edges gained a darker rim for separation; specular highlights are brighter.
- A system setting lets people choose how transparent the glass is, from very clear to fully tinted, and the material follows Reduce Transparency and Increase Contrast.
- When content scrolls beneath floating bars, a uniform backing appears behind the toolbar to hold contrast.
- Existing apps picked up most of this without changes, because they used the system material.

The lessons outlast the specifics:

1. **Legibility beats effect.** A material is judged on the worst content that can scroll under it.
2. **Give people the dial.** Transparency is a preference, and for some an access need.
3. **Design for both ends** of that dial. If the layout only works when the glass is clear, it does not work.
4. **Use the system's material** and inherit its improvements, instead of freezing this year's look into custom code.

## 4. Standard materials

Beneath the glass, the content layer still uses the classic blur materials for structure:

| Material | Character | Use |
| --- | --- | --- |
| Ultra-thin | Most translucent | Full-screen overlays that should keep the background very present |
| Thin | Translucent | Overlays that partly cover content |
| Regular | Balanced (default) | Most panels and overlays |
| Thick | Most opaque | When text or fine detail needs the contrast |

- Thicker gives better contrast for text; thinner keeps more context visible. Choose by that trade, **by purpose rather than by the colour it happens to produce**, since the result changes with settings and content.
- **Use vibrant colours on materials.** Vibrancy pulls colour from behind the material so labels and fills stay legible over anything. Labels come in four levels (primary to quaternary), fills in three, separators in one. Avoid the faintest label level on the thinnest materials.
- On spatial platforms the window material is system-defined glass that lets the room show through; use colour sparingly on it and rely on vibrancy for hierarchy.

## 5. Translucency on the web

```css
.bar {
  background: light-dark(rgb(255 255 255 / 0.72), rgb(32 32 36 / 0.7));
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  backdrop-filter: blur(24px) saturate(180%);
  box-shadow:
    inset 0 0 0 0.5px light-dark(rgb(0 0 0 / 0.06), rgb(255 255 255 / 0.12)),  /* edge */
    inset 0 1px 0 light-dark(rgb(255 255 255 / 0.7), rgb(255 255 255 / 0.1));  /* light catching the top */
}

@media (prefers-reduced-transparency: reduce) { .bar { background: var(--bg-2); backdrop-filter: none; } }
@media (prefers-contrast: more)               { .bar { background: var(--bg);  backdrop-filter: none; border: 1px solid; } }
```

- **Blur plus saturation.** Blur alone turns everything grey; the saturation boost keeps the colour of what is behind alive.
- **The fill does the legibility work.** 65–85% opacity for anything carrying text. The blur is the finish, not the foundation.
- **A bright top edge and a hairline outline** make it read as a physical sheet.
- **Test over the worst case**: a busy photo, dense text, pure white, pure black.
- **Mind the cost.** Backdrop blur is paid per pixel, per frame, for everything that moves beneath. Keep translucent areas modest; do not animate the blur radius of large surfaces; skip it on low-end devices if it drops frames.
- **Provide a solid fallback** where `backdrop-filter` is unsupported or the person asked for less transparency.

`assets/base.css` ships this as `.sn-material`, with the reduced-transparency and high-contrast paths wired through tokens.

## 6. Translucent or solid?

Use translucency when **all** of these hold:

1. The surface floats above content that scrolls or changes beneath it.
2. Seeing a hint of that content helps people keep their place.
3. Its text remains legible over the worst content that can pass underneath.
4. The device can afford the blur.

Otherwise use a solid surface. Content itself (articles, tables, forms, cards in a feed) is always solid. A translucent card on a static background is decoration with a performance cost.

## 7. Elevation and shadow

Height says how important and how temporary something is.

| Level | Examples | Treatment |
| --- | --- | --- |
| 0 | Page content | No shadow |
| 1 | Cards, raised controls | Tight, faint contact shadow |
| 2 | Hover lift, sticky bars, dragged items | Contact shadow plus a soft, wider one |
| 3 | Popovers, menus, sheets | Larger and softer |
| 4 | Dialogs, anything modal | Largest, with a scrim beneath |

- **Layer the shadow**: a small, tight one for contact and a large, soft, faint one for ambient light. A single heavy blur looks pasted on.
- **Shadows are short and low-contrast.** If you notice the shadow, it is too strong. Tint it toward the background hue instead of pure black.
- **Light comes from above**: shadows fall downward; top edges catch a highlight.
- **Higher means softer and wider**, not darker.
- **In dark mode shadows barely show.** Raise elevated surfaces in lightness and give them a thin light edge instead.
- **Elevation is state.** Things lift when picked up or hovered and settle when dropped. Change it with motion (see [feedback.md](feedback.md)).
- Bigger surfaces are "thicker": a full sheet casts more shadow than a small chip.

## 8. Dimming and focus

- **A task that interrupts** gets a scrim: the background dims and may recede (scale down a few percent, round its corners). The dimming *is* the message "deal with this first".
- **A task that runs alongside** (an inspector, a persistent panel, a non-blocking sheet) gets no scrim, so the main content stays usable.
- **Scrim strength follows progress** during a drag, from the same value that moves the sheet.
- **Stacked layers** each push the one beneath further back and dim it a little more, so depth stays readable.
- Tapping the scrim dismisses, except where losing the layer would lose work.
- Background layers that lose focus become more opaque and quieter; the active one is the liveliest thing on screen.

## 9. Where chrome meets content

A hard line under a sticky header is the old answer. The current one is a **scroll edge effect**: content softens (a short blur and fade) as it passes under floating controls, which keeps the controls legible and shows where the layers meet without drawing a border.

- Use it only where something actually floats over scrolling content. It is functional, not decorative.
- **Soft** for floating interactive elements; **hard** (more opaque, a defined edge) for pinned headers, text-only controls, and controls without their own background.
- One style per view; do not stack soft and hard.
- On the web: a gradient mask on the scroller's edge, or a short pseudo-element with a masked backdrop blur under the bar; reveal a hairline only once content has scrolled beneath.

## 10. Separating things: an order of preference

When two things need to read as separate, reach for these in order and stop at the first that works:

1. **Space.** Distance alone.
2. **Tone.** A slightly different surface colour (grouped background and cards).
3. **A hairline.** One device pixel, low contrast.
4. **Elevation.** A shadow, when one thing really is above the other.
5. **A material.** When it floats over moving content.
6. **A border.** Last, and rarely more than a pixel at low contrast.

Using two of these where one would do is how interfaces get heavy.

## 11. Checklist

- [ ] Controls and navigation read as a layer above content; content runs to the edges beneath them
- [ ] Translucency only on floating chrome; content surfaces are solid
- [ ] No translucent surface stacked on another
- [ ] Text on materials is legible over the worst-case background
- [ ] Reduced-transparency and increased-contrast settings produce solid, bordered surfaces
- [ ] Shadows are layered, soft, short and tinted; dark mode uses lighter surfaces and edges
- [ ] Interrupting tasks dim the background; parallel ones do not
- [ ] Scrim opacity is derived from the gesture, not animated separately
- [ ] Edges under floating bars soften instead of drawing a hard line
- [ ] The lightest separation that works is the one used
