/**
 * second-nature · physics.js
 *
 * Zero-dependency motion physics for interfaces that behave like objects:
 * springs you can interrupt, momentum you can project, edges that resist.
 *
 * ES module. The maths runs anywhere (browser, Node, workers);
 * `animate`, `decay` and `draggable` need a DOM-like clock or element.
 *
 * Units: positions in px (or any unit), velocities in units PER SECOND,
 * durations in seconds unless a name says `Ms`.
 */

const TAU = Math.PI * 2;
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

/* ────────────────────────────────────────────────────────────────────────
 * 1. Spring parameters
 *
 * Designers think in two numbers: how long it takes and how much it bounces.
 * Physics engines think in mass, stiffness and damping. These convert.
 * (Same parameterisation as SwiftUI's Spring(duration:bounce:), mass = 1.)
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * @param {number} duration  Perceptual duration in seconds. Not the settle time:
 *                           a spring has no fixed end, it just gets close.
 * @param {number} bounce    0 = no overshoot (critically damped). 0.15 = a little,
 *                           0.3 = clearly bouncy. Above ~0.4 looks like a toy.
 *                           Negative values over-damp (slower, flatter).
 */
export function springFromBounce(duration = 0.5, bounce = 0) {
  const d = Math.max(duration, 0.01);
  const b = clamp(bounce, -0.99, 0.99);
  const stiffness = (TAU / d) ** 2;
  const dampingRatio = b >= 0 ? 1 - b : 1 / (1 + b);
  const damping = dampingRatio * 2 * Math.sqrt(stiffness);
  return { mass: 1, stiffness, damping, dampingRatio, duration: d, bounce: b };
}

/** The other direction: physical parameters → duration / bounce. */
export function springFromPhysical({ mass = 1, stiffness = 100, damping = 10 } = {}) {
  const dampingRatio = damping / (2 * Math.sqrt(stiffness * mass));
  const duration = TAU / Math.sqrt(stiffness / mass);
  const bounce = dampingRatio <= 1 ? 1 - dampingRatio : 1 / dampingRatio - 1;
  return { mass, stiffness, damping, dampingRatio, duration, bounce };
}

/**
 * Named springs. `smooth`, `snappy`, `bouncy` and `interactive` mirror the
 * SwiftUI presets; the rest are role-based starting points. Tune by feel.
 */
export const SPRINGS = Object.freeze({
  micro: springFromBounce(0.2, 0), // press release, toggle thumbs, hover-out
  swift: springFromBounce(0.3, 0), // menus, popovers, tabs, small state changes
  smooth: springFromBounce(0.5, 0), // sheets, page-level moves, large surfaces
  snappy: springFromBounce(0.5, 0.15), // general purpose with a hint of life
  bouncy: springFromBounce(0.5, 0.3), // playful, rare, small elements only
  release: springFromBounce(0.4, 0.2), // after a drag or flick: momentum earned it
  interactive: springFromBounce(0.15, 0.14), // chasing a target that keeps moving
});

/* ────────────────────────────────────────────────────────────────────────
 * 2. Closed-form spring solver
 *
 * Exact at any t, so frame rate never changes the motion and an interrupted
 * animation can restart from precisely where (and how fast) it was.
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * State of a spring at time t.
 * @returns {{ value: number, velocity: number }}
 */
export function springAt(t, { from = 0, to = 1, velocity = 0, spring = SPRINGS.smooth } = {}) {
  const { mass, stiffness, damping } = spring;
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const x0 = from - to;
  const v0 = velocity;
  let x;
  let v;

  if (zeta < 1 - 1e-6) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    const a = zeta * w0;
    const B = (v0 + a * x0) / wd;
    const e = Math.exp(-a * t);
    const cos = Math.cos(wd * t);
    const sin = Math.sin(wd * t);
    x = e * (x0 * cos + B * sin);
    v = e * ((B * wd - a * x0) * cos - (a * B + x0 * wd) * sin);
  } else if (zeta <= 1 + 1e-6) {
    const B = v0 + w0 * x0;
    const e = Math.exp(-w0 * t);
    x = (x0 + B * t) * e;
    v = (B - w0 * (x0 + B * t)) * e;
  } else {
    const s = Math.sqrt(zeta * zeta - 1);
    const r1 = -w0 * (zeta - s);
    const r2 = -w0 * (zeta + s);
    const c1 = (v0 - r2 * x0) / (r1 - r2);
    const c2 = x0 - c1;
    const e1 = Math.exp(r1 * t);
    const e2 = Math.exp(r2 * t);
    x = c1 * e1 + c2 * e2;
    v = c1 * r1 * e1 + c2 * r2 * e2;
  }
  return { value: to + x, velocity: v };
}

/**
 * Seconds until the spring stays within `restDelta` of the target.
 * Useful for CSS durations; never gate user input on it.
 */
export function settleTime({ from = 0, to = 1, velocity = 0, spring = SPRINGS.smooth, restDelta } = {}) {
  const span = Math.abs(to - from) || 1;
  const delta = restDelta ?? span * 0.001;
  const step = 1 / 240;
  let lastOutside = 0;
  for (let t = 0; t <= 10; t += step) {
    const s = springAt(t, { from, to, velocity, spring });
    if (Math.abs(s.value - to) > delta) lastOutside = t;
    else if (t - lastOutside > 0.1) break;
  }
  return lastOutside + step;
}

/* ────────────────────────────────────────────────────────────────────────
 * 3. Springs as CSS: bake a spring into a linear() easing
 *
 * For motion that has a fixed start and end and never needs a gesture's
 * velocity. Runs off the main thread, so it stays smooth under load.
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * @returns {{ easing: string, durationMs: number }}
 *   e.g. `transition: transform ${durationMs}ms ${easing}`
 */
export function springToCSS(spring = SPRINGS.smooth, { tolerance = 0.0025 } = {}) {
  const total = settleTime({ from: 0, to: 1, spring, restDelta: 0.001 });
  const n = Math.max(24, Math.ceil(total * 120));
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const p = i / n;
    pts.push([p, springAt(p * total, { from: 0, to: 1, spring }).value]);
  }
  pts[pts.length - 1][1] = 1;
  const kept = simplify(pts, tolerance);
  const body = kept
    .map(([p, v], i) => {
      const val = round(v, 4);
      if (i === 0 || i === kept.length - 1) return `${val}`;
      return `${val} ${round(p * 100, 2)}%`;
    })
    .join(', ');
  return { easing: `linear(${body})`, durationMs: Math.round(total * 1000) };
}

function round(v, places) {
  const f = 10 ** places;
  return Math.round(v * f) / f;
}

/** Ramer–Douglas–Peucker: keep only the points that shape the curve. */
function simplify(points, tolerance) {
  if (points.length <= 2) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [x1, y1] = points[a];
    const [x2, y2] = points[b];
    let worst = 0;
    let index = -1;
    for (let i = a + 1; i < b; i++) {
      const [x, y] = points[i];
      const onLine = y1 + ((y2 - y1) * (x - x1)) / (x2 - x1 || 1);
      const d = Math.abs(y - onLine);
      if (d > worst) {
        worst = d;
        index = i;
      }
    }
    if (worst > tolerance && index > 0) {
      keep[index] = 1;
      stack.push([a, index], [index, b]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

/* ────────────────────────────────────────────────────────────────────────
 * 4. Edges and momentum
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Rubber-banding: the further you pull past an edge, the less it follows.
 * It approaches `dimension` but never reaches it, so it always gives a little.
 *
 * @param {number} overshoot   distance past the edge (signed)
 * @param {number} dimension   size of the view along this axis
 * @param {number} coefficient 0.55 is the classic scroll-view feel
 */
export function rubberband(overshoot, dimension, coefficient = 0.55) {
  if (!(dimension > 0) || overshoot === 0) return 0;
  const x = Math.abs(overshoot);
  return Math.sign(overshoot) * (1 - 1 / ((x * coefficient) / dimension + 1)) * dimension;
}

/** Follow 1:1 inside [min, max]; resist progressively outside it. */
export function rubberbandClamp(value, min, max, dimension = max - min, coefficient = 0.55) {
  const dim = dimension > 0 ? dimension : 1;
  if (value < min) return min - rubberband(min - value, dim, coefficient);
  if (value > max) return max + rubberband(value - max, dim, coefficient);
  return value;
}

/** Fraction of velocity kept per millisecond, as scroll views define it. */
export const DECELERATION = Object.freeze({ normal: 0.998, fast: 0.99 });

/**
 * How far momentum will carry something released at `velocity` (units/s).
 * Decide where a flick lands from this, not from where the finger let go.
 */
export function project(velocity, decelerationRate = DECELERATION.normal) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/** State of a free glide (inertial scrolling) at time t. */
export function decayAt(t, { from = 0, velocity = 0, decelerationRate = DECELERATION.normal } = {}) {
  const k = Math.log(decelerationRate) * 1000; // per second, negative
  const e = Math.exp(k * t);
  return { value: from + (velocity * (e - 1)) / k, velocity: velocity * e };
}

/** The value in `points` closest to `value`. */
export function nearest(points, value) {
  let best = points[0];
  for (const p of points) if (Math.abs(p - value) < Math.abs(best - value)) best = p;
  return best;
}

/* ────────────────────────────────────────────────────────────────────────
 * 5. Velocity tracking
 *
 * Release velocity comes from the last ~100ms of movement, not the whole
 * gesture and not the last two samples (which are noise).
 * ──────────────────────────────────────────────────────────────────────── */

export class VelocityTracker {
  constructor({ windowMs = 100, staleMs = 60 } = {}) {
    this.windowMs = windowMs;
    this.staleMs = staleMs;
    this.samples = [];
  }

  reset() {
    this.samples.length = 0;
  }

  /** @param {number} value position  @param {number} timeMs timestamp (event.timeStamp) */
  add(value, timeMs = now()) {
    const s = this.samples;
    s.push(value, timeMs);
    while (s.length > 4 && timeMs - s[1] > this.windowMs) s.splice(0, 2);
  }

  /**
   * Units per second. Returns 0 if the pointer rested before lifting,
   * because a paused finger is a decision to drop, not to throw.
   */
  velocity(atMs = now()) {
    const s = this.samples;
    if (s.length < 4) return 0;
    const lastT = s[s.length - 1];
    if (atMs - lastT > this.staleMs) return 0;
    const dt = lastT - s[1];
    if (dt <= 0) return 0;
    return ((s[s.length - 2] - s[0]) / dt) * 1000;
  }
}

/* ────────────────────────────────────────────────────────────────────────
 * 6. Animation drivers (interruptible by construction)
 * ──────────────────────────────────────────────────────────────────────── */

const hasWindow = typeof window !== 'undefined';
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
const raf = (fn) => (hasWindow && window.requestAnimationFrame ? window.requestAnimationFrame(fn) : setTimeout(() => fn(now()), 1000 / 60));
const caf = (id) => (hasWindow && window.cancelAnimationFrame ? window.cancelAnimationFrame(id) : clearTimeout(id));

export function prefersReducedMotion() {
  return hasWindow && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Drive a value with a spring.
 *
 *   const a = animate({ from: 0, to: 300, velocity: 1200, onUpdate: v => … });
 *   a.retarget(0);   // changes its mind mid-flight, keeps its velocity
 *   a.stop();        // returns { value, velocity } so a drag can take over
 *
 * Under prefers-reduced-motion the spring loses its bounce: the element still
 * arrives where physics says it should, without the overshoot.
 */
export function animate({
  from = 0,
  to = 1,
  velocity = 0,
  spring = SPRINGS.smooth,
  onUpdate = () => {},
  onComplete = () => {},
  restDelta = 0.05,
  restSpeed = 2,
  respectReducedMotion = true,
} = {}) {
  let s = spring;
  if (respectReducedMotion && prefersReducedMotion() && s.bounce > 0) s = springFromBounce(s.duration, 0);

  let origin = from;
  let target = to;
  let v0 = velocity;
  let t0 = now();
  let current = { value: from, velocity };
  let frame = 0;
  let done = false;
  let resolve;
  const finished = new Promise((r) => (resolve = r));

  const tick = () => {
    if (done) return;
    const t = (now() - t0) / 1000;
    current = springAt(t, { from: origin, to: target, velocity: v0, spring: s });
    const resting = Math.abs(current.value - target) <= restDelta && Math.abs(current.velocity) <= restSpeed;
    if (resting) {
      current = { value: target, velocity: 0 };
      done = true;
      onUpdate(target, 0);
      onComplete(target);
      resolve(true);
      return;
    }
    onUpdate(current.value, current.velocity);
    frame = raf(tick);
  };
  frame = raf(tick);

  const sync = () => {
    if (!done) current = springAt((now() - t0) / 1000, { from: origin, to: target, velocity: v0, spring: s });
    return current;
  };

  return {
    finished,
    get value() {
      return sync().value;
    },
    get velocity() {
      return sync().velocity;
    },
    get target() {
      return target;
    },
    get done() {
      return done;
    },
    /** Head somewhere else without losing momentum. */
    retarget(newTo, { velocity: newVelocity, spring: newSpring } = {}) {
      const live = sync();
      origin = live.value;
      v0 = newVelocity ?? live.velocity;
      target = newTo;
      t0 = now();
      if (newSpring) s = newSpring;
      if (done) {
        done = false;
        frame = raf(tick);
      }
      return this;
    },
    /** Freeze where it is. Hand the returned state to whatever takes over. */
    stop() {
      const live = sync();
      if (!done) {
        done = true;
        caf(frame);
        resolve(false);
      }
      return live;
    },
  };
}

/**
 * Glide with momentum, then settle. If the glide would leave [min, max] it
 * hands its remaining velocity to a spring pulling back to the edge, which is
 * the bounce you feel at the end of a scroll.
 */
export function decay({
  from = 0,
  velocity = 0,
  decelerationRate = DECELERATION.normal,
  min = -Infinity,
  max = Infinity,
  edgeSpring = SPRINGS.release,
  onUpdate = () => {},
  onComplete = () => {},
  restSpeed = 4,
} = {}) {
  const t0 = now();
  let current = { value: from, velocity };
  let frame = 0;
  let done = false;
  let handoff = null;

  const tick = () => {
    if (done) return;
    current = decayAt((now() - t0) / 1000, { from, velocity, decelerationRate });
    const edge = current.value < min ? min : current.value > max ? max : null;
    if (edge !== null) {
      handoff = animate({ from: current.value, to: edge, velocity: current.velocity, spring: edgeSpring, onUpdate, onComplete });
      return;
    }
    onUpdate(current.value, current.velocity);
    if (Math.abs(current.velocity) < restSpeed) {
      done = true;
      onComplete(current.value);
      return;
    }
    frame = raf(tick);
  };
  frame = raf(tick);

  return {
    get value() {
      return handoff ? handoff.value : current.value;
    },
    get velocity() {
      return handoff ? handoff.velocity : current.velocity;
    },
    stop() {
      if (handoff) return handoff.stop();
      done = true;
      caf(frame);
      return current;
    },
  };
}

/* ────────────────────────────────────────────────────────────────────────
 * 7. draggable(): the two-phase gesture in one place
 *
 *   Finger down → the element IS the finger. No easing, no spring, 1:1.
 *   Finger up   → physics finishes the thought, starting at release velocity.
 *
 * Handles: grab offset, catch-mid-flight, tap-vs-drag slop, pointer capture,
 * second-finger protection, rubber-banding, momentum projection, snapping,
 * and swallowing the click that would otherwise follow a drag.
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * @param {HTMLElement} el
 * @param {object} o
 * @param {'x'|'y'} [o.axis='y']
 * @param {[number, number]|(() => [number, number])} [o.bounds]  resting range; outside it rubber-bands.
 *        Pass a function when the range depends on layout, so it survives a resize.
 * @param {number[]|(() => number[])|null} [o.snap]  rest only on these values
 * @param {number} [o.initial=0]
 * @param {number} [o.slop=4]                px of movement before a press becomes a drag
 * @param {object} [o.spring]                spring used after release
 * @param {HTMLElement} [o.handle=el]        element that receives the pointer
 * @param {(value:number, state:{dragging:boolean, velocity:number})=>void} [o.onUpdate]
 * @param {(e:{value:number, velocity:number, projected:number, target:number})=>number|void} [o.onRelease]
 *        return a number to override where it settles
 * @param {(target:number)=>void} [o.onSettle]
 */
export function draggable(el, o = {}) {
  const axis = o.axis ?? 'y';
  const read = (v, fallback) => (typeof v === 'function' ? v() : v) ?? fallback;
  const bounds = () => read(o.bounds, [-Infinity, Infinity]);
  const handle = o.handle ?? el;
  const slop = o.slop ?? 4;
  const spring = o.spring ?? SPRINGS.release;
  const render =
    o.render ??
    ((v) => {
      el.style.transform = axis === 'y' ? `translate3d(0, ${v}px, 0)` : `translate3d(${v}px, 0, 0)`;
    });
  const tracker = new VelocityTracker();
  const coord = (e) => (axis === 'y' ? e.clientY : e.clientX);
  const dimension = () => {
    const r = el.getBoundingClientRect();
    return (axis === 'y' ? r.height : r.width) || 1;
  };

  let value = o.initial ?? 0;
  let anim = null;
  let pointerId = null;
  let dragging = false;
  let caught = false;
  let startPointer = 0;
  let startValue = 0;
  let suppressClick = false;

  const emit = (v, state) => {
    value = v;
    render(v);
    o.onUpdate?.(v, state);
  };
  emit(value, { dragging: false, velocity: 0 });

  const animateTo = (target, { velocity = 0, spring: sp = spring } = {}) => {
    anim?.stop();
    anim = animate({
      from: value,
      to: target,
      velocity,
      spring: sp,
      onUpdate: (v, vel) => emit(v, { dragging: false, velocity: vel }),
      onComplete: (t) => o.onSettle?.(t),
    });
    return anim;
  };

  const onDown = (e) => {
    if (pointerId !== null || (e.pointerType === 'mouse' && e.button !== 0)) return;
    pointerId = e.pointerId;
    // Catch it mid-flight: whatever it was doing, it stops being told what to do.
    caught = !!anim && !anim.done;
    if (caught) value = anim.stop().value;
    dragging = false;
    startPointer = coord(e);
    startValue = value;
    tracker.reset();
    tracker.add(coord(e), e.timeStamp);
  };

  const onMove = (e) => {
    if (e.pointerId !== pointerId) return;
    const p = coord(e);
    if (!dragging) {
      if (Math.abs(p - startPointer) < slop) return;
      dragging = true;
      startPointer = p; // re-base so crossing the slop doesn't jump
      startValue = value;
      try {
        handle.setPointerCapture(pointerId);
      } catch {}
      o.onStart?.();
    }
    tracker.add(p, e.timeStamp);
    const raw = startValue + (p - startPointer);
    const [min, max] = bounds();
    emit(rubberbandClamp(raw, min, max, dimension()), { dragging: true, velocity: tracker.velocity(e.timeStamp) });
  };

  const onUp = (e) => {
    if (e.pointerId !== pointerId) return;
    pointerId = null;
    if (!dragging) {
      // Caught mid-flight and let go without moving: don't leave it stranded between stops.
      if (caught) settle(0);
      caught = false;
      return;
    }
    dragging = false;
    caught = false;
    suppressClick = true;
    setTimeout(() => (suppressClick = false), 0);
    settle(tracker.velocity(e.timeStamp));
  };

  const settle = (velocity) => {
    const projected = value + project(velocity);
    const snap = read(o.snap, null);
    const [min, max] = bounds();
    let target = snap?.length ? nearest(snap, projected) : clamp(projected, min, max);
    const override = o.onRelease?.({ value, velocity, projected, target });
    if (typeof override === 'number') target = override;
    animateTo(target, { velocity });
  };

  const onClick = (e) => {
    if (!suppressClick) return;
    e.preventDefault();
    e.stopPropagation();
  };

  handle.style.touchAction = o.touchAction ?? (axis === 'y' ? 'pan-x' : 'pan-y');
  handle.addEventListener('pointerdown', onDown);
  handle.addEventListener('pointermove', onMove);
  handle.addEventListener('pointerup', onUp);
  handle.addEventListener('pointercancel', onUp);
  handle.addEventListener('click', onClick, true);

  return {
    get value() {
      return value;
    },
    get dragging() {
      return dragging;
    },
    /** Move programmatically (a button press): no velocity, so no bounce. */
    animateTo,
    set(v) {
      anim?.stop();
      emit(v, { dragging: false, velocity: 0 });
    },
    destroy() {
      anim?.stop();
      handle.removeEventListener('pointerdown', onDown);
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
      handle.removeEventListener('pointercancel', onUp);
      handle.removeEventListener('click', onClick, true);
    },
  };
}

/* ────────────────────────────────────────────────────────────────────────
 * 8. Deciding on intent, not position
 *
 * A gesture ends where the finger stopped; the person meant where it was
 * going. Commit on the projection.
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Where a slider/swipe would be a moment after release, as a 0–1 fraction of
 * its track:  (distance + lookahead × speed) ÷ track
 *
 * Compare the result against a commit threshold. A slow, deliberate drag has
 * to physically reach it; a confident flick gets there on momentum. Raise the
 * threshold for consequential actions (≈0.85 for "power off"), lower it for
 * harmless ones (≈0.5).
 */
export function projectedProgress(distance, velocity, track, lookahead = 0.3) {
  if (!(track > 0)) return 0;
  return (distance + lookahead * velocity) / track;
}

/**
 * A threshold that learns from hesitation. While `dwelling` is true it moves
 * a fraction of the way toward `ceiling` on every update; otherwise it falls
 * back toward `floor`. Use it when one gesture has two meanings separated by
 * a pause (flick = go home, pause = show switcher): the longer someone
 * lingers, the more clearly they mean the second, so the easier it gets.
 */
export function adaptiveThreshold({ floor = 51, ceiling = 134, rate = 0.2 } = {}) {
  let value = floor;
  return {
    get value() {
      return value;
    },
    update(dwelling) {
      value += ((dwelling ? ceiling : floor) - value) * rate;
      return value;
    },
    reset() {
      value = floor;
    },
  };
}

/* ────────────────────────────────────────────────────────────────────────
 * 9. Calm readouts
 *
 * Raw measurements are noisy: they jitter, dip and recover. A number on
 * screen that does the same reads as a broken product. Filter what is
 * displayed so it moves in small, orderly steps, and (where the truth only
 * goes one way) never backtracks.
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * @param {object} o
 * @param {number} [o.maxChange=1]      largest step the displayed value may take
 * @param {number} [o.intervalMs=1000]  at most one step per interval
 * @param {'down'|'up'|null} [o.monotonic=null]  refuse to move the other way
 * @returns {(raw:number, nowMs?:number)=>number} feed it raw values, show its output
 */
export function displayFilter({ maxChange = 1, intervalMs = 1000, monotonic = null } = {}) {
  let shown;
  let lastStep = -Infinity;
  return (raw, t = now()) => {
    if (shown === undefined) {
      shown = raw;
      lastStep = t;
      return shown;
    }
    if (t - lastStep < intervalMs) return shown;
    let delta = clamp(raw - shown, -maxChange, maxChange);
    if (monotonic === 'down' && delta > 0) delta = 0;
    if (monotonic === 'up' && delta < 0) delta = 0;
    if (delta !== 0) {
      shown += delta;
      lastStep = t;
    }
    return shown;
  };
}

/* ────────────────────────────────────────────────────────────────────────
 * 10. Idle motion that looks alive: jiggle
 *
 * One looping animation on every element looks like a machine, because
 * everything moves in step. Life comes from three things:
 *   1. several independent motions (x, y, tilt) on slightly different clocks,
 *      so the combination takes many minutes to repeat;
 *   2. a random starting point per element, so no two are ever in sync;
 *   3. tilt divided by the element's size, so a big tile moves its edges
 *      about as far as a small one instead of swinging wildly.
 * ──────────────────────────────────────────────────────────────────────── */

/** Half-periods in ms. Close to one another, deliberately not equal. */
export const JIGGLE = Object.freeze({ xMs: 134, yMs: 142, tiltMs: 128, shift: 0.4, tiltDeg: 1.72 });

/**
 * Start jiggling an element (edit mode, "something here can be rearranged").
 * Runs on the compositor via the Web Animations API.
 *
 * @param {Element} el
 * @param {object} [o]
 * @param {number} [o.size=1]      size in grid units; tilt is divided by it
 * @param {number} [o.amount=1]    overall intensity
 * @returns {() => void} stop
 */
export function jiggle(el, { size = 1, amount = 1 } = {}) {
  if (typeof el?.animate !== 'function' || prefersReducedMotion()) return () => {};
  const phase = () => -Math.random() * 1000; // negative delay = start mid-cycle
  const base = { direction: 'alternate', iterations: Infinity, easing: 'ease-in-out', composite: 'add' };
  const shift = JIGGLE.shift * amount;
  const tilt = (JIGGLE.tiltDeg * amount) / Math.max(size, 1);
  const running = [
    el.animate({ translate: [`${-shift}px 0`, `${shift}px 0`] }, { ...base, duration: JIGGLE.xMs, delay: phase() }),
    el.animate({ translate: [`0 ${-shift}px`, `0 ${shift}px`] }, { ...base, duration: JIGGLE.yMs, delay: phase() }),
    el.animate({ rotate: [`${-tilt}deg`, `${tilt}deg`] }, { ...base, duration: JIGGLE.tiltMs, delay: phase() }),
  ];
  return () => running.forEach((a) => a.cancel());
}
