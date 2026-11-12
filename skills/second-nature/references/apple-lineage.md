# Lineage: where these ideas come from

Read this when you need the history behind a rule, want to cite a primary source, or need to know which OS release introduced something. Nothing here is required to apply the skill.

## Contents

1. Four decades in one table
2. The principles, as Apple has stated them
3. What each era got right, and what it overdid
4. Primary sources: talks worth watching
5. Other reading
6. Material studied for this skill
7. A note on confidence

## 1. Four decades in one table

| Year | Release | What it added to the craft |
| --- | --- | --- |
| 1984 | Macintosh | The desktop metaphor, direct manipulation, menus, "see and point" instead of "remember and type" |
| 1987 | Apple Human Interface Guidelines (book) | Named the principles: metaphor, direct manipulation, feedback, consistency, forgiveness, user control, aesthetic integrity |
| 2001 | Mac OS X "Aqua" | Translucency, drop shadows, the Dock, animation used to explain (the genie effect shows where a window went) |
| 2007 | iPhone OS 1 | Multi-touch, inertial scrolling, rubber-banding, pinch to zoom: the physics that made a touchscreen feel direct |
| 2010–12 | iOS 4–6 | Peak skeuomorphism: leather, felt, paper. Familiarity through texture |
| 2013 | iOS 7 | The reset: *clarity, deference, depth*. Flat surfaces, translucency, parallax, type-led layouts, and the continuous-corner icon shape |
| 2014–15 | OS X Yosemite, Apple Watch, iPhone 6s | Translucency on the Mac; the San Francisco typeface; the Taptic Engine and the first designed haptic language |
| 2016 | iPhone 7 | A home button that does not move: a solid surface plus a precisely timed haptic is perceived as a click. Feedback can *be* the mechanism |
| 2017 | iPhone X, iOS 11 | No home button: fluid, interruptible gestures; display and interface corners sharing one continuous curve; large titles |
| 2018 | WWDC "Designing Fluid Interfaces" | The reference explanation of springs, velocity hand-off, projection and interruptibility |
| 2019 | iOS 13, macOS Catalina | Dark mode, SF Symbols, SwiftUI, Core Haptics, context menus |
| 2020 | macOS Big Sur, iOS 14 | Mac and iOS visual languages converge; widgets |
| 2022 | iOS 16, iPhone 14 Pro | The Dynamic Island: a hardware cut-out turned into a living, morphing surface |
| 2023 | iOS 17, visionOS | Springs become the default animation, in designer terms (duration and bounce); animated symbols; spatial design with eyes and hands |
| 2024 | iOS 18 | Personalisation: tinted icons, free placement, a customisable Control Center |
| 2025 | iOS 26 and siblings | Liquid Glass; a functional layer floating over content; concentric shapes; year-based version numbers across platforms |
| 2026 | iOS 27, macOS 27 | Liquid Glass refined for legibility with a user transparency control; the Human Interface Guidelines restate eight design principles |

## 2. The principles, as Apple has stated them

The wording changes; the ideas barely do.

**1987 — the original guidelines.** Metaphors from the real world · direct manipulation · see-and-point · consistency · WYSIWYG · user control · feedback and dialogue · forgiveness · perceived stability · aesthetic integrity.

**2013 — iOS 7.** *Clarity* (legible text, precise icons, function-led design) · *Deference* (the interface helps people understand content and never competes with it) · *Depth* (layers and motion convey hierarchy).

**2017 — "Essential Design Principles".** Wayfinding · feedback · visibility · consistency · mental model · proximity · grouping · mapping · affordance · progressive disclosure · symmetry.

**2025 — the new design system.** *Hierarchy* (controls and content are distinct; the interface elevates content) · *Harmony* (shapes align with the concentric design of hardware and software) · *Consistency* (platform conventions, adapting across sizes and displays).

**2026 — "Principles of great design" and the Human Interface Guidelines.**

| Principle | In brief |
| --- | --- |
| **Purpose** | Know what the product is for; decide what not to build |
| **Agency** | Stay out of the way; let people explore; make recovery easy |
| **Responsibility** | Be transparent; protect people's information; anticipate misuse |
| **Familiarity** | Build on what people know; be consistent; give clear feedback |
| **Flexibility** | Design for everyone, every input, every context and platform |
| **Simplicity** | Just what is necessary, which is not the same as minimal; be concise; establish hierarchy |
| **Craft** | Quality in every detail; iterate; keep maintaining it after launch |
| **Delight** | The emotion you intend, reinforced throughout; a result of the other seven, not decoration |

Apple's own caveat belongs with the list: there is no formula, and leaning hard on one principle can cost another. They are tools for weighing trade-offs.

The eight pillars in this skill are organised around craft practice (simplicity, physics, geometry, feedback, consistency, cognition, details, performance) rather than restating these. They are meant to be the *how* behind Apple's *what*.

## 3. What each era got right, and what it overdid

- **Skeuomorphism** got familiarity right: people understood a notepad that looked like one. It overdid the texture, which aged, wasted space and constrained behaviour to the real object's limits.
- **Flat design** got focus right: content first, no ornament. It overdid the removal: buttons that did not look pressable, hierarchy that depended on thin type.
- **The modern system** keeps the metaphor in the *behaviour* instead of the *texture*: things have weight, momentum, elasticity and depth, without pretending to be leather. That is the skeuomorphism worth keeping: physical truth in how things move and respond, not in how they are painted.
- **Liquid Glass** pushed material expressiveness again, and its first year showed the cost when effect outruns legibility. The second-year refinements are the lesson: a material earns its place only if the content beneath stays readable and people keep control.

The pattern across all of them: when a visual idea and usability conflict, usability wins in the next release.

## 4. Primary sources: talks worth watching

Apple's design sessions are free on developer.apple.com. These are the ones this skill draws on most.

| Year | Session | Take from it |
| --- | --- | --- |
| 2017 | Essential Design Principles (802) | The vocabulary of usability: wayfinding, feedback, mapping, affordance |
| 2018 | Designing Fluid Interfaces (803) | Springs, interruptibility, velocity hand-off, projection, rubber-banding. The single most useful talk on interaction feel |
| 2019 | Designing Audio-Haptic Experiences (810) | Causality, harmony, utility |
| 2019 | Introducing Core Haptics (520) | Transient and continuous events, intensity and sharpness |
| 2020 | The Details of UI Typography (10175) | Optical sizes, tracking, leading, Dynamic Type |
| 2021 | Practice Audio Haptic Design (10278) | Designing sound and haptics together |
| 2023 | Animate with Springs (10158) | Duration and bounce; why springs are the default |
| 2023 | Explore SwiftUI Animation (10156) | How animation, transactions and velocity work underneath |
| 2023 | Animate Symbols in Your App (10258) | Symbol effects and when to use them |
| 2023 | Principles of Spatial Design (10072) · Design for Spatial Input (10073) | Comfort, depth, eyes and hands |
| 2024 | Enhance Your UI Animations and Transitions (10145) | Zoom transitions, interruptible navigation |
| 2025 | Meet Liquid Glass (219) | What the material is and the rules for using it |
| 2025 | Get to Know the New Design System (356) | Shapes, concentricity, bars, sheets, scroll edge effects, cross-platform continuity |
| 2025 | Design Foundations from Idea to Interface (359) | Structure, navigation, content, visual design as a process |
| 2026 | Principles of Great Design (250) | The eight principles above |

Also: the **Human Interface Guidelines** (developer.apple.com/design/human-interface-guidelines), especially Design principles, Layout, Typography, Color, Materials, Motion, Playing haptics, Accessibility and the platform overviews; and **Apple Design Resources** for templates and the Dynamic Type tables.

## 5. Other reading

- Don Norman, *The Design of Everyday Things* — affordances, signifiers, mapping, feedback.
- Dieter Rams's ten principles of good design — "as little design as possible".
- Dan Saffer, *Microinteractions* — trigger, rules, feedback, loops and modes.
- Jakob Nielsen, *Response Times: The 3 Important Limits* and the ten usability heuristics.
- Jon Yablonski, *Laws of UX* — the psychology laws with examples.
- Figma, "Desperately seeking squircles" — how continuous corners are constructed.
- Emil Kowalski, *Animations on the Web* and his open-source agent skills (github.com/emilkowalski/skills) — the web-side practice of much of this, and a direct influence on this skill's approach to motion.
- Rauno Freiberg, "Invisible Details of Interaction Design" and the Web Interface Guidelines.
- Steve Swink, *Game Feel* — for games and anything real-time.

## 6. Material studied for this skill

Beyond the sources above, two sets of social posts supplied by the skill's author shaped specific sections:

- **@justinbuilds.mov** — five short teardowns disassembling iOS 27 to show how scroll rubber-banding, spring interruption, the home-indicator gesture, the power-off slider, the icon jiggle and the battery percentage are implemented. The specific constants in [gestures.md](gestures.md), [motion.md](motion.md) and [feedback.md](feedback.md) attributed to "a teardown of iOS 27" come from these.
- **@creative_vaani** — a teardown of how Apple's product pages use empty space ("products presented like art in a gallery"), reflected in [simplicity.md](simplicity.md).

## 7. A note on confidence

- **Documented by Apple**: the design principles, text-size and contrast tables, control sizes, material and haptic guidance, the spring parameterisation and its conversion formula, the scroll deceleration rates.
- **Widely established, not officially published**: the rubber-banding formula and its 0.55 coefficient; the momentum projection formula (from Apple's own sample code for the 2018 talk); the 1.53 × r extent of continuous corners.
- **From independent reverse-engineering**: the home-gesture thresholds, the power-off slider's 85% and 0.3 s, the jiggle periods and amplitudes, the battery display filter. These describe one release and may change; use the structure, tune the numbers.
- **Derived for this skill**: the CSS `superellipse(1.8)` at 1.6 × radius fit, the role-based spring presets, the token values. Starting points, to be judged by eye.
- **Release details after mid-2026** rely on press coverage at the time of writing. Check current documentation before depending on a specific API or setting.
