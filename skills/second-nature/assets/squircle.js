/**
 * second-nature · squircle.js
 *
 * Continuous corners as SVG path data.
 *
 * A CSS `border-radius` corner is a straight line that suddenly becomes a
 * circular arc: curvature jumps from 0 to 1/r at a single point. The eye reads
 * that jump as a faint kink, which is why plain rounded rectangles look
 * slightly "stamped out". A continuous corner eases curvature in and out, so
 * the edge flows into the corner the way a machined object does.
 *
 * Two generators:
 *   continuousCornerPath  – the iOS-style corner (arc in the middle, eased
 *                           bézier shoulders). Use this to match Apple hardware
 *                           and Figma's "corner smoothing".
 *   superellipsePath      – a true superellipse corner. Matches CSS
 *                           `corner-shape: superellipse(k)` exactly.
 *
 * Both return a string for <path d="…">, `clip-path: path("…")`, or a mask.
 */

const rad = (deg) => (deg * Math.PI) / 180;
const fmt = (n) => +n.toFixed(3);

/**
 * iOS-style continuous corner.
 *
 * Construction follows the one Figma published in "Desperately seeking
 * squircles" (and the MIT-licensed figma-squircle by Tien Pham): each corner is
 * a circular arc covering 90°·(1 − smoothing), joined to the edges by cubic
 * béziers that ramp curvature gradually.
 *
 * @param {number} width
 * @param {number} height
 * @param {number} radius     nominal corner radius, as you would give border-radius
 * @param {number} smoothing  0 = plain rounded rect, 0.6 ≈ iOS, 1 = maximum
 */
export function continuousCornerPath(width, height, radius, smoothing = 0.6) {
  const budget = Math.min(width, height) / 2;
  const r = Math.max(0, Math.min(radius, budget));
  if (r === 0) return `M0 0H${fmt(width)}V${fmt(height)}H0Z`;

  // The corner needs (1 + smoothing)·r of edge to ease into. Give it what fits.
  let s = Math.max(0, Math.min(smoothing, 1));
  s = Math.min(s, budget / r - 1);
  const p = Math.min((1 + s) * r, budget);

  const arcMeasure = 90 * (1 - s);
  const arcLength = Math.sin(rad(arcMeasure / 2)) * r * Math.SQRT2;
  const alpha = (90 - arcMeasure) / 2;
  const p3p4 = r * Math.tan(rad(alpha / 2));
  const beta = 45 * s;
  const c = p3p4 * Math.cos(rad(beta));
  const d = c * Math.tan(rad(beta));
  const b = (p - arcLength - c - d) / 3;
  const a = 2 * b;

  const f = fmt;
  const abc = a + b + c;
  return [
    `M${f(width - p)} 0`,
    // top-right
    `c${f(a)} 0 ${f(a + b)} 0 ${f(abc)} ${f(d)}`,
    `a${f(r)} ${f(r)} 0 0 1 ${f(arcLength)} ${f(arcLength)}`,
    `c${f(d)} ${f(c)} ${f(d)} ${f(b + c)} ${f(d)} ${f(abc)}`,
    `L${f(width)} ${f(height - p)}`,
    // bottom-right
    `c0 ${f(a)} 0 ${f(a + b)} ${f(-d)} ${f(abc)}`,
    `a${f(r)} ${f(r)} 0 0 1 ${f(-arcLength)} ${f(arcLength)}`,
    `c${f(-c)} ${f(d)} ${f(-(b + c))} ${f(d)} ${f(-abc)} ${f(d)}`,
    `L${f(p)} ${f(height)}`,
    // bottom-left
    `c${f(-a)} 0 ${f(-(a + b))} 0 ${f(-abc)} ${f(-d)}`,
    `a${f(r)} ${f(r)} 0 0 1 ${f(-arcLength)} ${f(-arcLength)}`,
    `c${f(-d)} ${f(-c)} ${f(-d)} ${f(-(b + c))} ${f(-d)} ${f(-abc)}`,
    `L0 ${f(p)}`,
    // top-left
    `c0 ${f(-a)} 0 ${f(-(a + b))} ${f(d)} ${f(-abc)}`,
    `a${f(r)} ${f(r)} 0 0 1 ${f(arcLength)} ${f(-arcLength)}`,
    `c${f(c)} ${f(-d)} ${f(b + c)} ${f(-d)} ${f(abc)} ${f(-d)}`,
    'Z',
  ].join('');
}

/**
 * Rectangle with superellipse corners:  |x/r|ⁿ + |y/r|ⁿ = 1
 *
 *   exponent 2  → circular arcs (plain border-radius)
 *   exponent 4  → CSS `corner-shape: squircle`
 *   exponent 2^k → CSS `corner-shape: superellipse(k)`
 *
 * Note that `radius` here is the size of the corner *box*. A squircle in the
 * same box as a circle looks tighter, because it hugs the corner more closely.
 * See `matchCircularRadius` to keep the perceived roundness.
 */
export function superellipsePath(width, height, radius, { exponent = 4, segments = 24 } = {}) {
  const r = Math.max(0, Math.min(radius, Math.min(width, height) / 2));
  if (r === 0) return `M0 0H${fmt(width)}V${fmt(height)}H0Z`;
  const e = 2 / exponent;
  const corner = (cx, cy, startDeg) => {
    let out = '';
    for (let i = 0; i <= segments; i++) {
      const t = rad(startDeg + (90 * i) / segments);
      const cos = Math.cos(t);
      const sin = Math.sin(t);
      const x = cx + r * Math.sign(cos) * Math.abs(cos) ** e;
      const y = cy + r * Math.sign(sin) * Math.abs(sin) ** e;
      out += `L${fmt(x)} ${fmt(y)}`;
    }
    return out;
  };
  return (
    `M${fmt(r)} 0` +
    corner(width - r, r, -90) +
    corner(width - r, height - r, 0) +
    corner(r, height - r, 90) +
    corner(r, r, 180) +
    'Z'
  );
}

/**
 * The corner-box size that makes a superellipse corner look as round as a
 * circular one of `radius` (same distance from the corner point to the curve's
 * apex). For a squircle this is ≈ 1.84 × radius.
 */
export function matchCircularRadius(radius, exponent = 4) {
  const circleInset = 1 - Math.SQRT1_2;
  const superInset = 1 - 0.5 ** (1 / exponent);
  return (radius * circleInset) / superInset;
}

/**
 * Concentric corner radius: the radius a shape needs so that it sits evenly
 * inside its container. inner = outer − gap, never below `minimum`.
 */
export function concentricRadius(outerRadius, gap, minimum = 0) {
  return Math.max(outerRadius - gap, minimum);
}

/**
 * Keep an element clipped to a continuous corner as it resizes.
 * clip-path also clips box-shadow and borders: put the shadow on a wrapper
 * with `filter: drop-shadow(…)`, or draw the shape as an SVG background.
 *
 * @returns {() => void} call to stop observing
 */
export function applySquircle(el, { radius = 20, smoothing = 0.6 } = {}) {
  const update = () => {
    const { width, height } = el.getBoundingClientRect();
    if (width && height) el.style.clipPath = `path("${continuousCornerPath(width, height, radius, smoothing)}")`;
  };
  update();
  if (typeof ResizeObserver === 'undefined') return () => {};
  const observer = new ResizeObserver(update);
  observer.observe(el);
  return () => observer.disconnect();
}
