// Run: node tests/audit.test.mjs
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const audit = (...args) => JSON.parse(execFileSync('node', ['skills/second-nature/scripts/audit.mjs', ...args, '--json'], { cwd: root, encoding: 'utf8' }));
const rulesIn = (result, file) => new Set(result.findings.filter((f) => !file || f.file.endsWith(file)).map((f) => f.rule));

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log(`  ok  ${name}`); };

test('flags every tell in the bad stylesheet', () => {
  const found = rulesIn(audit('tests/fixtures/bad.css'), 'bad.css');
  for (const rule of ['select-none-root', 'viewport-100vh', 'transition-all', 'ease-in', 'hover-ungated', 'layout-animation', 'long-duration', 'linear-motion', 'scale-zero', 'focus-removed', 'input-zoom', 'thin-weight', 'licensed-font']) {
    assert.ok(found.has(rule), `expected ${rule}`);
  }
});

test('flags tells in components and utility classes', () => {
  const found = rulesIn(audit('tests/fixtures/bad.tsx'), 'bad.tsx');
  for (const rule of ['scroll-hijack', 'clickable-div', 'transition-all', 'ease-in', 'viewport-100vh', 'thin-weight', 'focus-removed', 'scale-zero']) {
    assert.ok(found.has(rule), `expected ${rule}`);
  }
});

test('flags a viewport that disables zoom', () => {
  assert.ok(rulesIn(audit('tests/fixtures/bad.html')).has('zoom-disabled'));
});

test('reports missing reduced-motion handling at project level', () => {
  assert.ok(rulesIn(audit('tests/fixtures/bad.css')).has('no-reduced-motion'));
});

test('stays quiet on a well-made stylesheet', () => {
  const result = audit('tests/fixtures/good.css');
  assert.deepEqual(result.findings, [], JSON.stringify(result.findings, null, 2));
});

test("this skill's own assets and demo pass its audit", () => {
  const result = audit('skills/second-nature/assets', 'demo');
  const serious = result.findings.filter((f) => f.severity !== 'polish');
  assert.deepEqual(serious, [], JSON.stringify(serious, null, 2));
});

console.log(`\n${passed} passed`);
