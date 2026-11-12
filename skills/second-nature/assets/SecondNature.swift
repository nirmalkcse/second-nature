//
//  SecondNature.swift
//  second-nature
//
//  The same vocabulary as tokens.css / physics.js / feedback.js, for SwiftUI.
//  Requires iOS 17, macOS 14, watchOS 10, tvOS 17 or visionOS 1.
//
//  Drop the file into a target and use what you need. On Apple platforms the
//  standard components already do most of this: reach for these only for
//  custom controls and gestures.
//
//  Note: written against the public SwiftUI API but not compiled as part of
//  this repository. Treat it as a starting point and build it in your project.
//

import SwiftUI

// MARK: - Springs

/// Role-based springs. One tempo per product; friction is the dial.
public extension Animation {
    /// Press release, toggle thumbs, hover-out.
    static let snMicro = Animation.spring(duration: 0.2, bounce: 0)
    /// Menus, popovers, tabs, small state changes.
    static let snSwift = Animation.spring(duration: 0.3, bounce: 0)
    /// Sheets, page-level moves, large surfaces.
    static let snSmooth = Animation.spring(duration: 0.5, bounce: 0)
    /// General purpose with a hint of life.
    static let snSnappy = Animation.spring(duration: 0.5, bounce: 0.15)
    /// After a drag or flick: the gesture supplied the energy, so it may overshoot.
    static let snRelease = Animation.spring(duration: 0.4, bounce: 0.2)
}

// MARK: - Physics

public enum SNPhysics {
    /// Rubber-banding: follows less the further you pull, and never further than `dimension`.
    public static func rubberband(_ overshoot: CGFloat, dimension: CGFloat, coefficient: CGFloat = 0.55) -> CGFloat {
        guard dimension > 0, overshoot != 0 else { return 0 }
        let x = abs(overshoot)
        let moved = (1 - 1 / ((x * coefficient) / dimension + 1)) * dimension
        return overshoot < 0 ? -moved : moved
    }

    /// 1:1 inside the range, progressive resistance outside it.
    public static func rubberbandClamp(_ value: CGFloat, in range: ClosedRange<CGFloat>, dimension: CGFloat, coefficient: CGFloat = 0.55) -> CGFloat {
        if value < range.lowerBound {
            return range.lowerBound - rubberband(range.lowerBound - value, dimension: dimension, coefficient: coefficient)
        }
        if value > range.upperBound {
            return range.upperBound + rubberband(value - range.upperBound, dimension: dimension, coefficient: coefficient)
        }
        return value
    }

    /// How far momentum carries something released at `velocity` (points per second).
    /// `DragGesture.Value.predictedEndTranslation` gives you this for free in SwiftUI.
    public static func project(velocity: CGFloat, decelerationRate: CGFloat = 0.998) -> CGFloat {
        (velocity / 1000) * decelerationRate / (1 - decelerationRate)
    }

    /// The snap point closest to where the gesture was heading.
    public static func nearest(_ points: [CGFloat], to value: CGFloat) -> CGFloat {
        points.min(by: { abs($0 - value) < abs($1 - value) }) ?? value
    }

    /// Where a slider would be `lookahead` seconds after release, as a fraction of its track.
    /// Commit when this passes a threshold: about 0.5 for harmless actions, 0.85 for consequential ones.
    public static func projectedProgress(distance: CGFloat, velocity: CGFloat, track: CGFloat, lookahead: CGFloat = 0.3) -> CGFloat {
        guard track > 0 else { return 0 }
        return (distance + lookahead * velocity) / track
    }

    /// Inner radius for a shape nested inside a rounded container.
    public static func concentricRadius(outer: CGFloat, gap: CGFloat, minimum: CGFloat = 0) -> CGFloat {
        max(outer - gap, minimum)
    }
}

// MARK: - Feedback

/// One vocabulary across platforms: selection, impact, notification.
public enum SNFeedback: Sendable {
    case selection
    case light, medium, heavy
    case soft, rigid
    case success, warning, error

    public var sensory: SensoryFeedback {
        switch self {
        case .selection: return .selection
        case .light: return .impact(weight: .light)
        case .medium: return .impact(weight: .medium)
        case .heavy: return .impact(weight: .heavy)
        case .soft: return .impact(flexibility: .soft)
        case .rigid: return .impact(flexibility: .rigid)
        case .success: return .success
        case .warning: return .warning
        case .error: return .error
        }
    }
}

public extension View {
    /// Play feedback on the frame `trigger` changes. Fire it on the cause, not on the request.
    func snFeedback<T: Equatable>(_ feedback: SNFeedback, trigger: T) -> some View {
        sensoryFeedback(feedback.sensory, trigger: trigger)
    }
}

// MARK: - Press

/// A button that answers on the way down and springs back on release.
public struct SNPressableButtonStyle: ButtonStyle {
    public var scale: CGFloat
    public var feedback: SNFeedback?

    public init(scale: CGFloat = 0.97, feedback: SNFeedback? = .light) {
        self.scale = scale
        self.feedback = feedback
    }

    public func makeBody(configuration: Configuration) -> some View {
        PressBody(configuration: configuration, scale: scale, feedback: feedback)
    }

    private struct PressBody: View {
        let configuration: ButtonStyleConfiguration
        let scale: CGFloat
        let feedback: SNFeedback?
        @Environment(\.accessibilityReduceMotion) private var reduceMotion

        var body: some View {
            let pressed = configuration.isPressed
            configuration.label
                .scaleEffect(pressed && !reduceMotion ? scale : 1)
                .opacity(pressed ? 0.85 : 1)
                // Down is fast: the finger is waiting. Up is a spring: the finger has gone.
                .animation(pressed ? .easeOut(duration: 0.1) : .snMicro, value: pressed)
                .sensoryFeedback(feedback?.sensory ?? .selection, trigger: pressed) { _, isDown in
                    feedback != nil && isDown
                }
        }
    }
}

public extension ButtonStyle where Self == SNPressableButtonStyle {
    static var snPressable: SNPressableButtonStyle { SNPressableButtonStyle() }
}

// MARK: - Shape

public extension View {
    /// Continuous ("squircle") corners.
    func snContinuousCorners(_ radius: CGFloat) -> some View {
        clipShape(.rect(cornerRadius: radius, style: .continuous))
    }

    /// Declare this view's shape so that children using `ContainerRelativeShape`
    /// get a concentric radius automatically.
    func snContainer(cornerRadius: CGFloat) -> some View {
        containerShape(.rect(cornerRadius: cornerRadius, style: .continuous))
    }
}

// MARK: - Motion that respects the person's settings

private struct SNAdaptiveAnimation<V: Equatable>: ViewModifier {
    let animation: Animation
    let value: V
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    func body(content: Content) -> some View {
        // Reduced motion is gentler, not absent: keep a short fade-speed ease, drop the spring.
        content.animation(reduceMotion ? .easeOut(duration: 0.2) : animation, value: value)
    }
}

public extension View {
    /// Like `.animation(_:value:)`, but falls back to a short ease under Reduce Motion.
    func snAnimation<V: Equatable>(_ animation: Animation, value: V) -> some View {
        modifier(SNAdaptiveAnimation(animation: animation, value: value))
    }
}

// MARK: - Drag that tracks 1:1, then lets physics finish

/// Vertical drag between detents: rubber-bands past the ends, lands on the detent
/// nearest to where the gesture was heading, and can be caught mid-flight.
public struct SNSnapDrag: ViewModifier {
    @Binding private var position: CGFloat
    private let detents: [CGFloat]
    private let dimension: CGFloat
    @State private var anchor: CGFloat?

    public init(position: Binding<CGFloat>, detents: [CGFloat], dimension: CGFloat) {
        _position = position
        self.detents = detents
        self.dimension = dimension
    }

    public func body(content: Content) -> some View {
        let lower = detents.min() ?? 0
        let upper = detents.max() ?? 0

        content
            .offset(y: position)
            .gesture(
                DragGesture(minimumDistance: 4)
                    .onChanged { value in
                        if anchor == nil { anchor = position }
                        let raw = (anchor ?? position) + value.translation.height
                        // While the finger is down the view IS the finger: no animation.
                        var transaction = Transaction()
                        transaction.disablesAnimations = true
                        withTransaction(transaction) {
                            position = SNPhysics.rubberbandClamp(raw, in: lower...upper, dimension: dimension)
                        }
                    }
                    .onEnded { value in
                        let start = anchor ?? position
                        anchor = nil
                        // Decide from where it was going, not from where the finger lifted.
                        let projected = start + value.predictedEndTranslation.height
                        let target = SNPhysics.nearest(detents, to: projected)
                        withAnimation(.snRelease) { position = target }
                    }
            )
    }
}

public extension View {
    func snSnapDrag(position: Binding<CGFloat>, detents: [CGFloat], dimension: CGFloat) -> some View {
        modifier(SNSnapDrag(position: position, detents: detents, dimension: dimension))
    }
}

// MARK: - Idle motion that looks alive

/// Edit-mode jiggle: three motions on slightly different clocks, a random phase per
/// view, and tilt divided by size so large tiles do not swing.
public struct SNJiggle: ViewModifier {
    private let isActive: Bool
    private let size: CGFloat
    @State private var phaseX = Double.random(in: 0...1)
    @State private var phaseY = Double.random(in: 0...1)
    @State private var phaseTilt = Double.random(in: 0...1)
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    public init(isActive: Bool, size: CGFloat = 1) {
        self.isActive = isActive
        self.size = size
    }

    public func body(content: Content) -> some View {
        if isActive && !reduceMotion {
            TimelineView(.animation) { context in
                let t = context.date.timeIntervalSinceReferenceDate
                let turn = 2 * Double.pi
                content
                    .rotationEffect(.radians(0.03 / Double(max(size, 1)) * sin(turn * (t / 0.256 + phaseTilt))))
                    .offset(
                        x: 0.4 * sin(turn * (t / 0.268 + phaseX)),
                        y: 0.4 * sin(turn * (t / 0.284 + phaseY))
                    )
            }
        } else {
            content
        }
    }
}

public extension View {
    /// - Parameter size: the view's size in grid units (an app icon is 1, a 4×4 widget is 4).
    func snJiggle(_ isActive: Bool, size: CGFloat = 1) -> some View {
        modifier(SNJiggle(isActive: isActive, size: size))
    }
}
