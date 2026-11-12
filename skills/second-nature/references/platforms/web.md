# Platform guide: the web

The web has no house style, runs on every device and input, and gives you no physics for free. Everything in this skill applies; this file says which tools carry it.

## Contents

1. The stack
2. Foundation: the first ten lines
3. Tokens
4. Motion: pick the lightest tool
5. Let the platform do it
6. Recipes
7. Product pages and storytelling sites
8. Portfolios
9. Web apps and dashboards
10. Installed and mobile web
11. Test matrix
12. Never ship

## 1. The stack

**Use the platform first.** Semantic HTML for structure and accessibility, CSS for layout, theming and most motion, JavaScript only for what CSS cannot express: gestures, velocity, interruption.

Work inside whatever the project already uses (React, Vue, Svelte, Astro, plain HTML; Tailwind or CSS modules). If it has nothing for a job, these are dependable defaults:

| Need | Reach for |
| --- | --- |
| Springs, gestures, layout and exit animation in components | Motion (`motion` / `motion/react`) |
| Physics without a dependency | `assets/physics.js` |
| Accessible primitives (dialog, menu, popover, tabs, select) | Base UI, Radix, or React Aria: unstyled, keyboard-complete, and they expose the trigger position for origin-aware animation |
| Bottom sheet / drawer | Vaul |
| Toasts | Sonner |
| Carousel | CSS scroll snap first; Embla when you need more |
| Anchored overlays | CSS anchor positioning where supported; Floating UI otherwise |
| Long lists | TanStack Virtual |

Do not hand-roll a dialog, a menu or a combobox: the accessibility and edge cases are months of work. Do not add a library that replaces native scrolling.

## 2. Foundation: the first ten lines

Ship this before the first component. Each line removes one "this is a web page" tell.

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="color-scheme" content="light dark" />
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000000" />
```

```css
html {
  -webkit-text-size-adjust: 100%;             /* no font inflation in landscape */
  -webkit-tap-highlight-color: transparent;   /* you supply the press state */
  scrollbar-gutter: stable;                   /* no jump when a scrollbar appears */
}
button, a, [role='button'] { touch-action: manipulation; }       /* no double-tap delay */
button, [role='button']    { -webkit-user-select: none; user-select: none; }
input, select, textarea    { font-size: max(16px, 1em); }        /* iOS zooms below 16px */

.app-shell  { min-block-size: 100dvh; }       /* tracks the visible viewport */
.hero       { min-block-size: 100svh; }       /* never overflows, never shifts on scroll */
.bottom-bar { padding-block-end: max(12px, env(safe-area-inset-bottom)); }
.panel      { overscroll-behavior: contain; } /* reaching its end doesn't scroll the page */

@media (hover: hover) and (pointer: fine) {   /* hover only where hovering exists */
  .row:hover { background: var(--sn-fill-3); }
}
```

`assets/base.css` contains all of this with reasons. Never use `user-scalable=no` or `maximum-scale=1`; fix the cause (input font size) instead.

## 3. Tokens

Start from `assets/tokens.css`, or map its names onto the project's own. With Tailwind v4, declare them in `@theme` so utilities and custom CSS share one source:

```css
@theme {
  --radius-lg: 20px;
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --color-label: light-dark(rgb(0 0 0 / 0.88), rgb(255 255 255 / 0.93));
}
```

Use `light-dark()` with `color-scheme` for theming, `color-mix()` for derived tints, OKLCH for palettes, and logical properties (`inline`, `block`) so right-to-left works without extra code.

## 4. Motion: pick the lightest tool

| Need | Tool |
| --- | --- |
| State change on an element (hover, press, open) | CSS `transition`. It retargets when interrupted, which keyframes do not |
| Element entering the page or leaving `display: none` | `@starting-style` plus `transition-behavior: allow-discrete` |
| Spring character without JavaScript | A spring baked into `linear()` (`node scripts/spring.mjs --tokens`) |
| Programmatic, one-off, or layered motion | Web Animations API: `el.animate(…)`, `composite: 'add'` to stack effects |
| Continuity between pages or between two DOM states | View Transitions (`document.startViewTransition`, `@view-transition { navigation: auto }`, `view-transition-name` for shared elements) |
| Motion tied to scroll position | Scroll-driven animations (`animation-timeline: scroll()` / `view()`), inside `@supports` |
| Anything dragged, thrown, or interruptible with velocity | JavaScript springs: `physics.js` or Motion |

Rules that hold for all of them:

- Animate `transform` and `opacity`. Name the properties; never `transition: all`.
- Keyframes restart from the beginning when retriggered. Use transitions or springs for anything that can fire twice.
- Keep view transitions short (≈ 250 ms) and disable or simplify them under reduced motion; they block interaction while running.
- Wrap every non-essential animation in `@media (prefers-reduced-motion: no-preference)` or multiply distances by `--sn-motion`.

## 5. Let the platform do it

Modern HTML and CSS cover a lot that used to need libraries. Check current support, enhance progressively.

| Element or feature | Gives you |
| --- | --- |
| `<dialog>` + `showModal()` | Focus trap, Escape to close, `::backdrop`, top layer |
| `popover` attribute | Light dismiss, top layer, no z-index wars |
| CSS anchor positioning | Tethered menus and tooltips without JavaScript |
| `<details>` with `::details-content` and `interpolate-size: allow-keywords` | Animated disclosure to `height: auto` |
| `inert` | Removes background content from focus and assistive tech while a layer is open |
| `scroll-snap-*`, `scroll-margin`, `overscroll-behavior` | Carousels and pagers with native physics |
| `:focus-visible` | Focus rings for keyboards only |
| `accent-color`, `field-sizing: content` | Native controls in brand colour; inputs that grow |
| `text-wrap: balance / pretty`, `text-box` | Better rag and true optical centring |
| `corner-shape` | Continuous corners (see [geometry.md](../geometry.md)) |
| `content-visibility: auto` | Skips rendering off-screen sections |

## 6. Recipes

**A popover that grows from its trigger and leaves faster than it arrived**

```css
.popover {
  transform-origin: var(--transform-origin, top);   /* primitives expose the trigger side */
  transition:
    opacity var(--sn-dur-fast) var(--sn-ease-out),
    transform var(--sn-spring-swift-duration) var(--sn-spring-swift),
    display var(--sn-dur-fast) allow-discrete,
    overlay var(--sn-dur-fast) allow-discrete;
}
.popover:not(:popover-open) { opacity: 0; transform: scale(0.96); transition-duration: 120ms; }
@starting-style { .popover:popover-open { opacity: 0; transform: scale(0.96); } }
```

**Revealing content of unknown height without animating `height`**

```css
.reveal { display: grid; grid-template-rows: 0fr; transition: grid-template-rows var(--sn-dur-base) var(--sn-ease-out); }
.reveal[data-open='true'] { grid-template-rows: 1fr; }
.reveal > * { overflow: hidden; min-block-size: 0; }
```

**A shared element between a list and a detail view**

```css
.thumb[data-active] { view-transition-name: hero; }
.detail-image       { view-transition-name: hero; }
::view-transition-group(hero) { animation-duration: 280ms; animation-timing-function: var(--sn-ease-out); }
@media (prefers-reduced-motion: reduce) { ::view-transition-group(*) { animation: none; } }
```

**A soft edge where content meets a floating bar**

```css
.scroller { mask-image: linear-gradient(to bottom, transparent 0, #000 28px); }
```

**A sheet**: use Vaul, or `draggable()` from `physics.js` as in [gestures.md §13](../gestures.md).

## 7. Product pages and storytelling sites

The model is the gallery wall: one subject, a clear field, one sentence, one action ([simplicity.md §3](../simplicity.md)).

- **One idea per viewport.** A headline of a few words at display size, a single supporting line, the product. Then the next idea.
- **Type carries the page.** Large, tightly tracked headlines; a quiet body; almost no chrome. Let weight and tone, not boxes, separate things.
- **Space is the budget.** Section padding of 96–160 px is normal. Resist filling it.
- **Scroll tells the story; it does not get hijacked.** Sticky scenes with scroll-driven animation (or a scrubbed video or image sequence) reveal the product as the person scrolls at their own speed. Never take over the wheel, never animate scroll position, never trap the page.
- **Motion is slow and few.** One moving thing at a time, long decelerating curves, large surfaces. Everything has a static, legible reduced-motion version.
- **Imagery is the product.** Art-direct for each breakpoint (`<picture>`), serve the right density, reserve the space, preload only the first.
- **The navigation recedes**: a slim translucent bar that minimises on scroll down and returns on scroll up.
- **Performance is part of the look.** A heavy hero that janks on a mid-range phone undoes the whole impression. Budget it, and lazy-load every scene below the first.

## 8. Portfolios

- Restraint reads as confidence. A strong type system, generous space, the work shown large.
- The first screen says who, what and one proof, with no entrance choreography that delays reading.
- Project lists: big thumbnails, hover previews gated to hover devices, a view transition into the case study.
- Case studies: the outcome first, then the story; real captions; images that can be inspected.
- One or two moments of character (a cursor detail, an elegant page transition, a physical toggle), not twenty.
- It loads instantly and works with a keyboard. Those are part of the portfolio.

## 9. Web apps and dashboards

- **Speed is the feature.** Optimistic updates, cached navigation, intent preloading, no blocking spinners.
- **No animation on frequent actions**: command palettes, keyboard shortcuts, table sorting and tab changes respond on the next frame.
- **Density through consistency** ([simplicity.md §10](../simplicity.md)): one grid, tabular numerals, right-aligned figures, three levels of emphasis.
- **Keyboard-first**: every frequent action has a shortcut, shown in menus and tooltips; a command palette; focus that is always visible and never lost.
- **State survives**: filters, scroll, selection and drafts persist across navigation and reload; the URL reflects the view.
- **Charts** follow the same tokens, animate only on first appearance or data change, and never loop.
- **Empty, loading, partial and error states** are designed for every panel independently.

## 10. Installed and mobile web

- `display: standalone` in the manifest changes the viewport and safe areas: test it installed.
- Paint to the edges (`viewport-fit=cover`) and pad content with `env(safe-area-inset-*)`.
- The software keyboard: `interactive-widget=resizes-content` in the viewport meta, `dvh` for shells, and keep the focused field and its submit button visible.
- Set `inputmode`, `autocomplete`, `enterkeyhint` and `autocapitalize` on every field.
- Match the browser chrome to the top of the page with `theme-color` for each colour scheme.
- Avoid fixed elements that fight the collapsing URL bar; prefer sticky positioning.

## 11. Test matrix

| Where | Why |
| --- | --- |
| A real iPhone in Safari | Sticky hover, tap delay, input zoom, safe areas, rubber-banding, the keyboard: none reproduce in desktop emulation |
| A mid-range Android phone in Chrome | The honest performance target |
| Desktop Safari, Chrome and Firefox | Feature support differs (corner-shape, anchor positioning, scroll-driven animation, view transitions) |
| Keyboard only | Focus order, traps, visible focus |
| A screen reader (VoiceOver or NVDA) | Names, roles, announcements |
| Reduced motion, reduced transparency, increased contrast, forced colours | Each setting separately |
| 200% zoom and the largest text size | Reflow |
| A right-to-left language and a long one | Mirroring, truncation |
| Slow 4G and offline | Loading, shift, failure states |

Say which of these were actually done.

## 12. Never ship

| Never | Instead |
| --- | --- |
| Scroll hijacking, scripted smooth scroll | Native scroll, scroll snap, scroll-driven animation |
| `user-scalable=no`, `maximum-scale=1` | 16 px inputs |
| `outline: none` with nothing in its place | `:focus-visible` ring |
| Ungated `:hover` effects | `@media (hover: hover) and (pointer: fine)` |
| `100vh` for app shells or bottom-pinned UI | `100dvh`, `100svh` |
| `transition: all`, animated `width` / `height` / `top` | Named `transform` and `opacity` |
| Keyframes on interruptible UI | Transitions or springs |
| `touchmove` + `preventDefault()` to stop overscroll | `overscroll-behavior`, `touch-action` |
| A `div` with a click handler | `<button>` or `<a>` |
| Self-hosted San Francisco fonts or SF Symbols | `system-ui`, and an open icon family |
| Sound on load, or before any interaction | Opt-in, after a gesture |
| Declaring it done from device emulation | A real phone |
