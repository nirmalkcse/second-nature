# Platform guide: React Native, Flutter, Android, Windows and desktop shells

The pillars are universal. Their expression belongs to the host platform. The aim is never "make it look like iOS everywhere"; it is "make it this well-made everywhere".

API names reflect the frameworks at the time of writing; check current documentation.

## Contents

1. One design, native expressions
2. React Native and Expo
3. Flutter
4. Android and Jetpack Compose
5. Windows
6. Electron, Tauri and other desktop web shells
7. Sharing tokens
8. The same spring everywhere

## 1. One design, native expressions

| Share across platforms | Let each platform decide |
| --- | --- |
| Information architecture, naming, content | Navigation pattern (tab bar, rail, drawer, sidebar) |
| Token *structure*: spacing scale, type roles, semantic colour roles | Typeface, default sizes, corner style |
| Brand: accent colour, illustration, voice | Control appearance (switches, pickers, dialogs) |
| Interaction model: what can be dragged, what is primary | Back behaviour, system gestures, haptic vocabulary |
| Motion principles: springs, interruptibility, restraint | Transition styles, overscroll effect |

Prefer the framework's *adaptive* or native-backed components over one custom look drawn identically on both. When a product ships an iOS-style sheet on Android or a ripple on iOS, people can tell it was ported.

## 2. React Native and Expo

The risk is the JavaScript thread: anything animated or tracked from there competes with rendering and business logic.

| Need | Use |
| --- | --- |
| Animation | **Reanimated**: shared values and worklets run on the UI thread. `withSpring`, `withDecay`, `withTiming` |
| Gestures | **Gesture Handler** (`Gesture.Pan()` etc.), composed with Reanimated so tracking never crosses the bridge |
| Navigation | Native stack (`react-native-screens`) so pushes, the back swipe and large titles are the platform's own |
| Sheets | A native-driven bottom sheet library, or the platform sheet via native stack presentation |
| Haptics | `expo-haptics`: `selectionAsync()`, `impactAsync(style)`, `notificationAsync(type)` |
| Continuous corners | `borderCurve: 'continuous'` (iOS) |
| Lists | A recycling list (FlashList or equivalent); stable keys; fixed or estimated item sizes |
| Reduced motion | Reanimated's `useReducedMotion()`; `AccessibilityInfo` |
| Safe areas and keyboard | `react-native-safe-area-context`; a keyboard-aware controller |

```js
const y = useSharedValue(PEEK);
const start = useSharedValue(PEEK);

const pan = Gesture.Pan()
  .onBegin(() => { cancelAnimation(y); start.value = y.value; })           // catch it mid-flight
  .onChange((e) => { y.value = rubberbandClamp(start.value + e.translationY, FULL, PEEK, HEIGHT); })
  .onEnd((e) => {
    const projected = y.value + project(e.velocityY);                       // where it was going
    y.value = withSpring(nearest(DETENTS, projected), { velocity: e.velocityY, ...RELEASE });
  });
```

`rubberbandClamp`, `project` and `nearest` are a few lines each: port them from `assets/physics.js` and mark them `'worklet'`. Get spring parameters from `scripts/spring.mjs`.

- Never drive animation with `setState` per frame, or with the legacy `Animated` API without the native driver.
- Use platform-specific files or `Platform.select` for the handful of things that should differ.
- Press feedback: `Pressable` with a Reanimated scale on `onPressIn`, not on `onPress`.
- Test on a real low-end Android device; that is where the JavaScript thread shows.

## 3. Flutter

Flutter draws everything itself, so it gives nothing native for free and can do anything. Discipline matters more here.

| Need | Use |
| --- | --- |
| Springs | `SpringSimulation` with `SpringDescription(mass:, stiffness:, damping:)`, driven by `AnimationController.animateWith`; `SpringDescription.withDampingRatio` |
| Momentum | `FrictionSimulation`, `ClampingScrollSimulation`, `BouncingScrollSimulation` |
| Scroll physics | `ScrollConfiguration` — let iOS bounce and Android stretch; do not force one on both |
| Gestures | `GestureDetector` (`onPanUpdate`, `onPanEnd` with `details.velocity`); `DraggableScrollableSheet` for sheets |
| Adaptive controls | `.adaptive` constructors (`Switch.adaptive`, `Slider.adaptive`), Cupertino widgets on iOS, Material on Android |
| Navigation | `CupertinoPageRoute` on iOS keeps the edge-swipe back; predictive back on Android |
| Continuous corners | `RoundedSuperellipseBorder`, `ClipRSuperellipse` (recent versions); `ContinuousRectangleBorder` is a different, squarer curve |
| Haptics | `HapticFeedback.selectionClick()`, `lightImpact()`, `mediumImpact()`, `heavyImpact()` |
| Accessibility settings | `MediaQuery.disableAnimationsOf(context)`, `MediaQuery.textScalerOf`, `highContrastOf` |
| Type | Set the platform's system font per target rather than one bundled face everywhere |

```dart
void _onPanEnd(DragEndDetails d) {
  final v = d.velocity.pixelsPerSecond.dy;
  final target = nearest(detents, _y.value + project(v));
  _y.animateWith(SpringSimulation(
    const SpringDescription(mass: 1, stiffness: 246.7, damping: 25.1),   // duration 0.4, bounce 0.2
    _y.value, target, v,
  ));
}
```

- Keep animations out of `build` by using `AnimatedBuilder`/`ValueListenableBuilder` around the smallest subtree; wrap heavy static children in `RepaintBoundary`.
- Profile in profile mode on a device; watch for shader-compilation jank on first run of an effect.
- Text scaling and right-to-left need explicit testing; nothing is inherited from the OS automatically.

## 4. Android and Jetpack Compose

Android has its own mature language. Follow it; apply the pillars within it.

| Need | Use |
| --- | --- |
| Springs | `spring(dampingRatio =, stiffness =)` as the `animationSpec`; springs are Compose's default and are interruptible |
| Interruptible values | `Animatable` — `snapTo` while dragging, `animateTo(target, initialVelocity = v)` on release, `animateDecay` for flings |
| Velocity | `VelocityTracker` in `pointerInput`; `draggable`/`AnchoredDraggable` for snapping between anchors |
| Shared elements | `SharedTransitionLayout`, `sharedElement`, `sharedBounds` |
| Back | Predictive back: the destination previews as the gesture progresses. Support it |
| Haptics | `LocalHapticFeedback`, `View.performHapticFeedback(HapticFeedbackConstants.…)` |
| Overscroll | The platform's stretch effect. Do not replace it with an iOS-style bounce |
| Layout | Window size classes; edge-to-edge with insets; navigation bar → rail → drawer as width grows |
| Shape | The Material shape system; `RoundedCornerShape`. Continuous corners are not native here |
| Accessibility | Font scale, TalkBack semantics, `Settings.Global.ANIMATOR_DURATION_SCALE` (respect "remove animations") |

```kotlin
val y = remember { Animatable(PEEK) }
Modifier.pointerInput(Unit) {
    val tracker = VelocityTracker()
    detectVerticalDragGestures(
        onDragStart = { scope.launch { y.stop() } },                         // catch it mid-flight
        onVerticalDrag = { change, dy ->
            tracker.addPosition(change.uptimeMillis, change.position)
            scope.launch { y.snapTo(rubberbandClamp(y.value + dy, FULL, PEEK, height)) }
        },
        onDragEnd = {
            val v = tracker.calculateVelocity().y
            scope.launch { y.animateTo(nearest(detents, y.value + project(v)), spring(0.8f, 246.7f), v) }
        },
    )
}
```

- Targets are 48 dp; the type scale, elevation and colour roles come from Material. Map this skill's semantic tokens onto them.
- Recent Material guidance moved to spring-based motion tokens; use the theme's motion scheme rather than fixed durations.
- Keep recomposition narrow: read animated values in the layout or draw phase (`graphicsLayer { translationY = y.value }`), not in composition.
- Test on a mid-range device with animations at 1× and at "off".

## 5. Windows

| Aspect | Convention |
| --- | --- |
| Framework | WinUI 3 / Windows App SDK for native; the Fluent design system |
| Type | Segoe UI Variable (Display, Text and Small optical sizes); body 14 px |
| Geometry | 4 px grid; corner radii 4 (controls) and 8 (overlays, windows) |
| Materials | Mica for window backgrounds, Acrylic for transient surfaces; both follow the system theme and fall back to solid |
| Motion | Short, direct; connected animations between views; spring-based natural motion in the composition layer |
| Navigation | Navigation view at the left; title-bar back; command bars |
| Input | Mouse, keyboard, touch and pen on the same device. Keyboard access and visible focus for everything; context menus on right-click |
| Dialogs | Primary button first (left); accent-coloured primary |
| Accessibility | High-contrast themes must work: use system colours, never hard-coded ones; Narrator names; text scaling |

Respect the person's accent colour and light/dark setting, snap layouts, per-monitor DPI and window resizing down to small sizes.

## 6. Electron, Tauri and other desktop web shells

A web app in a window is judged against native apps. The tells are specific.

- **Start instantly.** Show the window with real content, not a white flash followed by a spinner.
- **Native window chrome**: controls on the correct side for each OS (leading on macOS, trailing on Windows); a draggable title region; correct full-screen and resize behaviour.
- **Native menus and shortcuts**, per OS: ⌘ on macOS, Ctrl on Windows and Linux. Standard items (Undo, Copy, Preferences/Settings, Quit) in their standard places.
- **Not selectable, not draggable**: interface chrome should not highlight on drag-select; images and links should not drag out as ghosts; only content is selectable.
- **Cursors**: the default arrow over buttons in a desktop app (the pointing hand is a web-link convention); text cursor only over text.
- **Focus rings on keyboard focus only.**
- **System integration**: the system font, the system accent colour, light/dark and contrast settings, native context menus, native file dialogs, notifications, drag and drop to and from the desktop.
- **Materials**: window vibrancy on macOS, Mica on Windows, through the shell's API rather than CSS blur over a screenshot.
- **Scrolling**: native scrollbars and overscroll behaviour for each OS.
- **Idle is idle**: no background animation or polling when the window is hidden.

## 7. Sharing tokens

Keep one token source and generate each platform's format from it.

```json
{
  "space":  { "4": { "$value": "16px" } },
  "radius": { "lg": { "$value": "20px" } },
  "color":  { "label": { "$value": { "light": "#000000e0", "dark": "#ffffffed" } } },
  "motion": { "swift": { "$value": { "duration": 0.3, "bounce": 0 } } }
}
```

- Use a token build step (Style Dictionary or a similar tool) to emit CSS custom properties, a Swift enum or asset catalog, Kotlin/Compose constants, and Dart.
- Share the **semantic** layer; let each platform define its own primitives where conventions differ (type sizes, radii).
- Store springs as `duration` and `bounce`; convert per platform at build time.
- Units: points on Apple, dp/sp on Android, logical pixels on the web and Flutter. One "16" is the same visual size on all of them at default scale.

## 8. The same spring everywhere

`node scripts/spring.mjs --duration 0.4 --bounce 0.2` prints one spring in every dialect. The mapping:

| Platform | Parameters |
| --- | --- |
| SwiftUI / UIKit / Core Animation | `duration`, `bounce` directly |
| Motion (web), `physics.js` | `duration`, `bounce`; or `stiffness`, `damping`, `mass` |
| CSS | `linear()` easing + settle duration |
| Reanimated | `mass`, `stiffness`, `damping` (or `duration` + `dampingRatio`) |
| Flutter | `SpringDescription(mass, stiffness, damping)` |
| Compose | `dampingRatio` (= 1 − bounce), `stiffness` |

with `stiffness = (2π ÷ duration)²`, `damping = (1 − bounce) × 4π ÷ duration`, `mass = 1`.

The rubber-band and projection formulas are plain arithmetic and port to any language unchanged.
