# Platform guide: Apple native

On Apple platforms most of this skill is already built into the system components. The first job is to not undo it.

API names below reflect the SDKs at the time of writing (through the iOS 26 generation). Check current documentation before relying on a signature.

## Contents

1. The stack
2. Rule zero: use the standard component
3. Pillar → API
4. Snippets
5. Each platform's posture
6. The current design system
7. Tools
8. Checklist

## 1. The stack

| Layer | Use |
| --- | --- |
| **Swift + SwiftUI** | The default for new interface code on every Apple platform |
| **UIKit / AppKit** | Where SwiftUI cannot yet express the behaviour, or in existing code. They interoperate freely |
| **Core Animation** | Layer-level animation, custom transitions, anything measured in frames |
| **Metal** | Custom rendering and shaders (visual effects, games) |
| **Core Haptics, AVFoundation** | Custom haptics and synchronised sound |
| **SF Symbols, SF Pro, New York** | Iconography and type, with weights that match |
| **WidgetKit, ActivityKit, App Intents** | Widgets, Live Activities and the Dynamic Island, system integration |
| **TipKit, Swift Charts** | Contextual education; charts in the system style |
| **RealityKit** | Spatial content |
| **SpriteKit, GameController** | 2D games and controller input |

## 2. Rule zero: use the standard component

`List`, `NavigationStack`, `TabView`, `.sheet`, `Menu`, `Toggle`, `Slider`, `Picker`, `DatePicker` and the system bars already have: tuned springs, interruptible transitions, haptics, the current material, Dynamic Type, right-to-left support, VoiceOver, keyboard and pointer behaviour, and every future design change.

- Configure with modifiers before considering a custom control.
- Build custom only when no standard component can express the interaction, and then match the system's behaviour (states, haptics, accessibility traits) exactly.
- Do not restyle bars, sheets and alerts into something that no longer reads as the platform.
- Custom chrome is also frozen chrome: it will not pick up next year's refinements.

## 3. Pillar → API

| Need | SwiftUI | UIKit / Core Animation |
| --- | --- | --- |
| Spring | `.animation(.snappy, value:)`, `withAnimation(.spring(duration: 0.4, bounce: 0.2))`, `.smooth`, `.bouncy` | `UIView.animate(springDuration:bounce:)`, `UIViewPropertyAnimator` with `UISpringTimingParameters`, `CASpringAnimation(perceptualDuration:bounce:)` |
| Interruptible, velocity-preserving | The default for springs: retargeting keeps velocity | `UIViewPropertyAnimator` (pause, reverse, continue with new timing) |
| Drag with velocity and projection | `DragGesture` — `value.velocity`, `value.predictedEndTranslation`, `value.predictedEndLocation` | `UIPanGestureRecognizer.velocity(in:)` and your own projection |
| Scroll physics and snapping | `ScrollView` + `.scrollTargetBehavior(.viewAligned)` or `.paging`, `.scrollBounceBehavior` | `UIScrollView.decelerationRate` (`.normal` 0.998, `.fast` 0.99), `targetContentOffset` |
| Sheets with detents | `.sheet` + `.presentationDetents([.medium, .large])`, `.presentationDragIndicator`, `.presentationBackgroundInteraction` | `UISheetPresentationController` |
| Shared-element transitions | `matchedGeometryEffect`, `.navigationTransition(.zoom(sourceID:in:))` with `.matchedTransitionSource` | Custom `UIViewControllerAnimatedTransitioning`; zoom transitions |
| Multi-step and scroll-linked motion | `PhaseAnimator`, `KeyframeAnimator`, `.scrollTransition`, `.visualEffect` | `CAKeyframeAnimation`, `UIViewPropertyAnimator.fractionComplete` |
| Changing numbers and symbols | `.contentTransition(.numericText())`, `.symbolEffect(.bounce, value:)` | `UIImageView.addSymbolEffect` |
| Continuous and concentric corners | `.clipShape(.rect(cornerRadius: 20, style: .continuous))`, `ContainerRelativeShape`, `ConcentricRectangle`, `.containerShape` | `layer.cornerCurve = .continuous` |
| Haptics | `.sensoryFeedback(.selection, trigger:)`, `.impact(weight:)`, `.success` | `UISelectionFeedbackGenerator`, `UIImpactFeedbackGenerator`, `UINotificationFeedbackGenerator` (+ `prepare()`); Core Haptics for custom |
| Text that scales | `.font(.body)` and other text styles, `@ScaledMetric`, `.monospacedDigit()`, `.dynamicTypeSize(…)` | `UIFont.preferredFont(forTextStyle:)`, `adjustsFontForContentSizeCategory` |
| Semantic colour and hierarchy | `.foregroundStyle(.primary / .secondary / .tertiary)`, `Color.accentColor`, `.tint(…)` | `UIColor.label`, `.secondaryLabel`, `.systemBackground`, `.separator` |
| Materials | `.background(.regularMaterial)`, `.glassEffect()`, `.buttonStyle(.glass)` | `UIVisualEffectView` with `UIBlurEffect` / `UIGlassEffect` |
| Adaptive layout | `ViewThatFits`, `horizontalSizeClass`, `NavigationSplitView`, `.tabViewStyle(.sidebarAdaptable)`, safe-area modifiers | Size classes, layout guides, `UISplitViewController` |
| Accessibility settings | `@Environment(\.accessibilityReduceMotion)`, `\.accessibilityReduceTransparency`, `\.colorSchemeContrast`, `\.dynamicTypeSize` | `UIAccessibility.isReduceMotionEnabled` and notifications |

## 4. Snippets

`assets/SecondNature.swift` contains these as reusable pieces (spring presets, a pressable button style, the feedback vocabulary, rubber-band and projection maths, a snap-drag modifier, organic jiggle). The essentials:

**Press that answers on the way down**

```swift
struct Pressable: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .animation(configuration.isPressed ? .easeOut(duration: 0.1)
                                               : .spring(duration: 0.25, bounce: 0),
                       value: configuration.isPressed)
            .sensoryFeedback(.impact(weight: .light), trigger: configuration.isPressed) { _, down in down }
    }
}
```

**Track 1:1, then let physics finish**

```swift
.gesture(
    DragGesture()
        .onChanged { value in
            var t = Transaction(); t.disablesAnimations = true        // the element IS the finger
            withTransaction(t) { y = rubberbandClamp(start + value.translation.height, in: 56...432, dimension: height) }
        }
        .onEnded { value in
            let projected = start + value.predictedEndTranslation.height   // where it was going
            withAnimation(.spring(duration: 0.4, bounce: 0.2)) {            // bounce: the drag earned it
                y = nearest([56, 250, 432], to: projected)
            }
            start = y
        }
)
```

**A tap opens the same sheet with no bounce** (nothing pushed it): `withAnimation(.smooth) { y = 56 }`.

**Reduced motion**

```swift
@Environment(\.accessibilityReduceMotion) private var reduceMotion
// …
.transition(reduceMotion ? .opacity : .move(edge: .bottom).combined(with: .opacity))
```

**Concentric shapes**

```swift
VStack { thumbnail.clipShape(ContainerRelativeShape()) }
    .padding(12)
    .background(.background.secondary)
    .containerShape(.rect(cornerRadius: 28, style: .continuous))   // children inherit 28 − 12
```

## 5. Each platform's posture

**iPhone** — one hand, short sessions, vertical.
- Primary actions and search within the thumb's reach; tab bar with three to five destinations.
- Sheets for subtasks; push navigation with the edge swipe back, which must never be blocked.
- Body text 17 pt; targets 44 pt; respect the home indicator and the Dynamic Island.
- Ongoing tasks belong in a Live Activity: glanceable, minimal, one piece of information.
- Haptics are part of the language here; use the standard vocabulary.

**iPad** — between phone and Mac.
- Sidebar or split view instead of a stretched phone layout; adapt by size class, since windows resize freely.
- Pointer support: hover effects, context menus, keyboard shortcuts (discoverable by holding ⌘).
- Drag and drop between apps; multiple windows; Apple Pencil precision and hover.

**Mac** — wide, precise, keyboard-driven, many windows.
- Everything reachable from the menu bar, with keyboard shortcuts. Undo everywhere.
- Denser: body 13 pt, controls 28 pt, hover states matter, right-click context menus.
- Windows resize to any size; toolbars, sidebars and inspectors collapse sensibly.
- Standard window controls stay where people expect them. Settings live in a Settings window.
- No touch-sized targets, no bottom tab bars, no pull-to-refresh.

**Apple Watch** — a two-second glance at arm's length.
- One idea per screen; large type; full-bleed black that disappears into the bezel.
- The Digital Crown scrolls with haptic detents; lists snap.
- Complications and the Smart Stack do most of the work; opening the app is the exception.
- Haptics carry meaning when nobody is looking; keep them distinct and rare.

**Apple TV** — across the room, one focus at a time.
- The focus engine: the focused item grows, lifts and tilts with the remote; focus moves in the direction pressed, predictably, and is never lost.
- Type from 23 pt up (body 29 pt); primary content inset 60 pt top and bottom, 80 pt at the sides.
- Focus is never shown by colour alone; scale and motion are the signal.
- Minimal text entry; previews and media carry the experience.

**Apple Vision Pro** — eyes and hands, comfort above all.
- Targets at least 60 pt with spacing; elements highlight when looked at and are selected with a pinch.
- Keep content in the centre of the field of view; avoid making people turn or reach.
- Windows use system glass that lets the room through; add colour and depth sparingly; prefer flat, legible text.
- Avoid motion in the periphery and large moving surfaces; fade rather than fly for relocation; never rotate the person's world.
- Depth is a tool for hierarchy, not decoration.

**CarPlay** — glance and return to the road: system templates, very large targets, no reading.

## 6. The current design system

From the 2025 releases onward the system is organised around a **content layer** and a **functional layer** of Liquid Glass floating above it ([materials-depth.md](../materials-depth.md)). In practice:

- Let content run edge to edge beneath bars and sidebars (`backgroundExtensionEffect` where a sidebar would cover imagery).
- Do not put custom backgrounds behind system bars; use scroll edge effects for legibility.
- Tab bars float and can minimise on scroll; search sits at the bottom on iPhone; bars group related items and separate the primary action.
- Controls are capsules by default; nested shapes are concentric with their container and with the display ([geometry.md](../geometry.md)).
- Sheets are inset with concentric corners at partial height and expand to the edges at full height; action sheets originate from the control that triggered them.
- Remove toolbar items that are not essential; move secondary actions into a menu; do not mix text and symbol buttons in one group.
- Recompile, look at every screen, and remove customisations that fight the new material before adding any glass of your own.

## 7. Tools

- **Xcode Previews** — iterate on real components in every size, appearance and text size at once.
- **Simulator and Device Hub** — size classes and settings quickly; but feel is judged on a device.
- **Instruments** — Time Profiler, Hangs, Animation Hitches, SwiftUI ([performance.md §8](../performance.md)).
- **Accessibility Inspector** — contrast, hit areas, labels, an audit pass.
- **SF Symbols app** — browse, check availability by OS version, preview animations and rendering modes, export templates for custom symbols.
- **Icon Composer** — layered app icons with light, dark, tinted and clear appearances.
- **Reality Composer Pro** — spatial content.
- **Apple Design Resources** — official Figma and Sketch libraries and the Dynamic Type tables.
- Debug settings: slow animations in the Simulator; Reduce Motion, Increase Contrast, Reduce Transparency, Bold Text and Larger Text in Settings.

## 8. Checklist

- [ ] Standard components wherever one exists; custom ones match system behaviour
- [ ] Springs (not timed curves) on everything interactive; interruptible
- [ ] Drags track without animation and finish from predicted end position
- [ ] Continuous corners; concentric with containers and the display
- [ ] Text styles, not fixed sizes; layout survives the largest Dynamic Type size
- [ ] Semantic colours and hierarchical foreground styles; correct in light, dark and increased contrast
- [ ] Haptics from the standard vocabulary, on the causal frame
- [ ] Reduce Motion, Reduce Transparency, VoiceOver, Voice Control and keyboard navigation all work
- [ ] The back swipe, system gestures and safe areas are respected
- [ ] Each supported platform gets its own posture, not a stretched phone app
- [ ] Profiled on an older device at 120 Hz; hitch-free scrolling
