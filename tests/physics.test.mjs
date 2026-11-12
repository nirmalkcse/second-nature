// Run: node tests/physics.test.mjs
import assert from 'node:assert/strict';
import {
  springFromBounce, springFromPhysical, springAt, settleTime, springToCSS,
  rubberband, rubberbandClamp, project, decayAt, nearest, VelocityTracker, animate, SPRINGS,
} from '../skills/second-nature/assets/physics.js';

const close = (a, b, eps, msg) => assert.ok(Math.abs(a - b) <= eps, `${msg}: ${a} vs ${b}`);
let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log(`  ok  ${name}`); };

await test("matches Apple's documented Spring(duration: 0.5, bounce: 0.3)", () => {
  const s = springFromBounce(0.5, 0.3);
  close(s.stiffness, 157.9, 0.1, 'stiffness');
  close(s.damping, 17.6, 0.1, 'damping');
  assert.equal(s.mass, 1);
});

await test('duration/bounce round-trips through physical parameters', () => {
  for (const [d, b] of [[0.3, 0], [0.5, 0.15], [0.4, 0.2], [0.6, -0.3]]) {
    const back = springFromPhysical(springFromBounce(d, b));
    close(back.duration, d, 1e-9, 'duration');
    close(back.bounce, b, 1e-9, 'bounce');
  }
});

await test('closed-form solver agrees with brute-force integration (all three damping regimes)', () => {
  for (const spring of [springFromBounce(0.5, 0.3), springFromBounce(0.5, 0), springFromBounce(0.5, -0.4)]) {
    let x = 0, v = 800; const to = 300, dt = 1 / 200000;
    for (let t = 0; t < 0.35; t += dt) {
      const a = (-spring.stiffness * (x - to) - spring.damping * v) / spring.mass;
      v += a * dt; x += v * dt;
    }
    const s = springAt(0.35, { from: 0, to, velocity: 800, spring });
    close(s.value, x, 0.05, `value (bounce ${spring.bounce})`);
    close(s.velocity, v, 0.5, `velocity (bounce ${spring.bounce})`);
  }
});

await test('starts exactly at from/velocity and ends at the target', () => {
  const s0 = springAt(0, { from: 20, to: 120, velocity: -300, spring: SPRINGS.snappy });
  close(s0.value, 20, 1e-9, 'start value'); close(s0.velocity, -300, 1e-9, 'start velocity');
  const s1 = springAt(5, { from: 20, to: 120, velocity: -300, spring: SPRINGS.snappy });
  close(s1.value, 120, 1e-6, 'end value');
});

await test('bounce 0 never overshoots; bounce 0.3 does', () => {
  let peak0 = 0, peak3 = 0;
  for (let t = 0; t < 2; t += 0.001) {
    peak0 = Math.max(peak0, springAt(t, { spring: springFromBounce(0.5, 0) }).value);
    peak3 = Math.max(peak3, springAt(t, { spring: springFromBounce(0.5, 0.3) }).value);
  }
  assert.ok(peak0 <= 1 + 1e-9, `critically damped overshoot ${peak0}`);
  assert.ok(peak3 > 1.02, `bouncy overshoot ${peak3}`);
});

await test('a critically damped spring is ~98.6% done at its perceptual duration', () => {
  close(springAt(0.5, { spring: springFromBounce(0.5, 0) }).value, 0.986, 0.002, 'progress at duration');
});

await test('rubber band: 1:1 at the edge, resists further out, never exceeds the dimension', () => {
  close(rubberband(1, 800), 0.55, 0.01, 'initial slope is the coefficient');
  assert.ok(rubberband(200, 800) < 200 * 0.55);
  assert.ok(rubberband(1e9, 800) < 800);
  assert.equal(rubberband(-120, 800), -rubberband(120, 800));
  assert.equal(rubberbandClamp(50, 0, 100), 50);
  assert.ok(rubberbandClamp(-40, 0, 100) > -40 && rubberbandClamp(-40, 0, 100) < 0);
  assert.ok(rubberbandClamp(140, 0, 100) < 140 && rubberbandClamp(140, 0, 100) > 100);
});

await test('momentum projection matches where a decay glide actually comes to rest', () => {
  close(project(1000), 499, 0.01, 'project(1000 px/s)');
  close(decayAt(20, { from: 0, velocity: 1000 }).value, project(1000), 1.5, 'glide rest vs projection');
  close(project(1000, 0.99), 99, 0.01, 'fast rate');
});

await test('nearest picks the snap point closest to the projection', () => {
  assert.equal(nearest([0, 300, 640], 420), 300);
  assert.equal(nearest([0, 300, 640], 480), 640);
});

await test('velocity tracker: steady movement, and zero after a pause', () => {
  const t = new VelocityTracker();
  for (let i = 0; i <= 10; i++) t.add(i * 8, 1000 + i * 8); // 8px per 8ms = 1000 px/s
  close(t.velocity(1080), 1000, 1, 'steady velocity');
  assert.equal(t.velocity(1300), 0, 'stale samples mean the finger stopped');
});

await test('spring → CSS linear() is well-formed and ends at 1', () => {
  const { easing, durationMs } = springToCSS(SPRINGS.snappy);
  assert.match(easing, /^linear\(0, .*, 1\)$/);
  assert.ok(durationMs > 300 && durationMs < 1500, `duration ${durationMs}`);
  assert.ok(easing.split(',').length < 60, 'kept compact');
  assert.ok(settleTime({ spring: SPRINGS.bouncy }) > settleTime({ spring: SPRINGS.smooth }));
});

await test('animate(): interruptible — retarget keeps position and velocity continuous', async () => {
  const seen = [];
  const a = animate({ from: 0, to: 100, spring: SPRINGS.smooth, onUpdate: (v) => seen.push(v) });
  await new Promise((r) => setTimeout(r, 120));
  const before = { value: a.value, velocity: a.velocity };
  assert.ok(before.value > 0 && before.value < 100 && before.velocity > 0);
  a.retarget(0);
  close(a.value, before.value, 3, 'no jump on retarget');
  assert.ok(a.velocity > 0, 'still carrying its old momentum just after turning round');
  assert.equal(await a.finished, true);
  assert.equal(a.value, 0);
});

await test('animate(): stop() hands back live state for a drag to take over', async () => {
  const a = animate({ from: 0, to: 100, velocity: 500 });
  await new Promise((r) => setTimeout(r, 60));
  const live = a.stop();
  assert.ok(live.value > 0 && live.value < 100);
  assert.equal(await a.finished, false);
});

console.log(`\n${passed} passed`);

// ── helpers added after studying real gesture and display behaviour ──
import { projectedProgress, adaptiveThreshold, displayFilter } from '../skills/second-nature/assets/physics.js';

await test('rubber band reproduces published figures (c = 0.55, d = 844)', () => {
  close(rubberband(185, 844), 90.7, 0.15, '185pt pull');
  close(rubberband(844, 844), 299.5, 0.1, 'one full screen pull');
  close(rubberband(844 * 20, 844), 773.7, 0.5, 'twenty screens still under one screen');
});

await test('commit on projection: slow drag must reach the line, a flick gets there on momentum', () => {
  const track = 300;
  assert.ok(projectedProgress(0.75 * track, 0, track) < 0.85, 'stopped at 75% does not commit');
  assert.ok(projectedProgress(0.56 * track, 400, track) >= 0.85, 'a flick from 56% does');
  assert.ok(projectedProgress(0.9 * track, -400, track) < 0.85, 'flicking back cancels even past the line');
});

await test('adaptive threshold: climbs while dwelling, decays when moving', () => {
  const t = adaptiveThreshold({ floor: 51, ceiling: 134, rate: 0.2 });
  close(t.update(true), 67.6, 0.01, 'first step is 20% of the way');
  for (let i = 0; i < 40; i++) t.update(true);
  close(t.value, 134, 0.1, 'approaches the ceiling');
  for (let i = 0; i < 40; i++) t.update(false);
  close(t.value, 51, 0.1, 'returns to the floor');
});

await test('display filter: small orderly steps, never backtracks when monotonic', () => {
  const f = displayFilter({ maxChange: 1, intervalMs: 1000, monotonic: 'down' });
  assert.equal(f(80, 0), 80);
  assert.equal(f(74, 500), 80, 'too soon to change');
  assert.equal(f(74, 1000), 79, 'one step at most');
  assert.equal(f(83, 2000), 79, 'noise upward is ignored');
  assert.equal(f(70, 3000), 78);
});

console.log(`${passed} passed in total`);
