#!/usr/bin/env node
/**
 * audit.mjs — find the tells a machine can find.
 *
 *   node audit.mjs <dir-or-file> [more paths…]
 *   node audit.mjs src --json          machine-readable
 *   node audit.mjs src --strict        exit 1 if anything breaks trust or feels cheap
 *   node audit.mjs src --all           list every occurrence (default: 5 per rule)
 *
 * Scans CSS, SCSS, Less, HTML, JS/TS, JSX/TSX, Vue, Svelte and Astro for
 * patterns that reliably make an interface feel unfinished, and explains each
 * with the reason and the fix. Zero dependencies.
 *
 * It cannot judge feel, hierarchy or taste. A clean report is the floor, not
 * the review. See references/review.md.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, relative, resolve } from 'node:path';

const SEVERITY = {
  trust: { label: 'Breaks trust', order: 0 },
  cheap: { label: 'Feels cheap', order: 1 },
  polish: { label: 'Polish', order: 2 },
};

const RULES = {
  'zoom-disabled': {
    severity: 'trust',
    title: 'Pinch-zoom is disabled',
    why: 'People who need larger text cannot read the page.',
    fix: 'Remove user-scalable=no / maximum-scale=1. If inputs were zooming the page, set their font-size to 16px or more.',
  },
  'focus-removed': {
    severity: 'trust',
    title: 'Focus outline removed with nothing in its place',
    why: 'Keyboard users cannot see where they are.',
    fix: 'Style :focus-visible with a clear ring instead of removing the outline.',
  },
  'no-reduced-motion': {
    severity: 'trust',
    title: 'Motion is used, but reduced motion is never handled',
    why: 'Some people get nauseous from interface motion; the setting exists so software can respect it.',
    fix: 'Under prefers-reduced-motion: reduce keep fades, drop travel, scale and overshoot. In components use the framework hook (useReducedMotion, accessibilityReduceMotion).',
  },
  'clickable-div': {
    severity: 'trust',
    title: 'Click handler on a non-interactive element',
    why: 'It cannot be reached or activated from the keyboard and is invisible to assistive technology.',
    fix: 'Use <button> (or <a> for navigation). It brings focus, Enter/Space and the right role for free.',
  },
  'select-none-root': {
    severity: 'trust',
    title: 'Text selection disabled for the whole page',
    why: 'People copy addresses, order numbers and error messages. Content must stay selectable.',
    fix: 'Apply user-select: none to controls only (buttons, tabs, drag handles).',
  },
  'scroll-hijack': {
    severity: 'trust',
    title: 'Native scrolling is replaced by a script',
    why: 'Scripted scrolling loses the platform’s inertia, rubber-banding and accessibility, and feels foreign on every device.',
    fix: 'Keep native scroll. Use scroll snap and scroll-driven animations for effects.',
  },
  'licensed-font': {
    severity: 'trust',
    title: 'San Francisco / New York font files are being shipped',
    why: 'Their licence covers building for Apple platforms, not embedding on the web or in other products.',
    fix: 'Use the system-ui font stack: Apple devices get San Francisco, everyone else gets their own system font.',
  },
  'transition-all': {
    severity: 'cheap',
    title: 'transition: all',
    why: 'It animates whatever changes next, including layout properties nobody meant to animate, and stutters.',
    fix: 'Name the properties, and prefer transform and opacity.',
  },
  'ease-in': {
    severity: 'cheap',
    title: 'ease-in on interface motion',
    why: 'It starts slowly, so the first frames (the ones the eye is watching) barely move. It reads as lag.',
    fix: 'Decelerate instead: a strong ease-out such as cubic-bezier(0.22, 1, 0.36, 1), or a spring.',
  },
  'scale-zero': {
    severity: 'cheap',
    title: 'Entering from scale(0)',
    why: 'Nothing in the world appears from a point. It reads as a trick.',
    fix: 'Start from scale(0.9–0.97) with opacity 0, growing from the element that caused it.',
  },
  'layout-animation': {
    severity: 'cheap',
    title: 'Animating a layout property',
    why: 'width, height, top, left, margin and padding force layout every frame and move their neighbours.',
    fix: 'Animate transform (translate / scale) or opacity. For height: auto, animate grid-template-rows 0fr → 1fr.',
  },
  'hover-ungated': {
    severity: 'cheap',
    title: ':hover styles that apply on touch devices',
    why: 'Touch browsers apply :hover on tap and leave it stuck until the next tap elsewhere.',
    fix: 'Wrap hover rules in @media (hover: hover) and (pointer: fine). Give touch a pressed (:active) state instead.',
  },
  'viewport-100vh': {
    severity: 'cheap',
    title: '100vh used for full-height layout',
    why: 'On phones 100vh is the height with the browser bars hidden, so content overflows and bottom controls sit under the toolbar.',
    fix: 'Use 100dvh for app shells and 100svh for heroes.',
  },
  'input-zoom': {
    severity: 'cheap',
    title: 'Form control text smaller than 16px',
    why: 'iOS Safari zooms the page when such a field is focused, and does not zoom back out.',
    fix: 'font-size: max(16px, 1em) on input, select and textarea.',
  },
  'long-duration': {
    severity: 'polish',
    title: 'Interface transition of 600ms or more',
    why: 'Past about 500ms people are waiting for the interface rather than using it.',
    fix: 'Menus and popovers 150–250ms, sheets and pages 300–500ms. Longer only for rare, explanatory motion.',
  },
  'linear-motion': {
    severity: 'polish',
    title: 'Linear easing on a transition',
    why: 'Constant speed with an abrupt stop looks mechanical. Linear is for things that represent time (progress, spinners).',
    fix: 'Use a decelerating curve or a spring.',
  },
  'thin-weight': {
    severity: 'polish',
    title: 'Thin or light font weight',
    why: 'Light weights lose legibility at text sizes, on low-density screens and in sunlight.',
    fix: 'Use Regular or heavier for text. Reserve light weights for very large display type, if at all.',
  },
  'no-press-foundation': {
    severity: 'polish',
    title: 'Touch foundations are missing',
    why: 'Without them taps flash grey and can wait for a possible double-tap.',
    fix: 'Add -webkit-tap-highlight-color: transparent on html and touch-action: manipulation on buttons and links (see assets/base.css).',
  },
};

const CSS_EXT = new Set(['.css', '.scss', '.sass', '.less', '.pcss']);
const MARKUP_EXT = new Set(['.html', '.htm', '.vue', '.svelte', '.astro']);
const SCRIPT_EXT = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.mdx']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'out', '.next', '.nuxt', '.svelte-kit', '.output', 'coverage', 'vendor', '.turbo', '.cache', 'target', 'Pods', '.venv']);

/* ── CLI ─────────────────────────────────────────────────────────────── */

const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith('--')));
const targets = argv.filter((a) => !a.startsWith('--'));

if (flags.has('--help') || targets.length === 0) {
  console.log('Usage: node audit.mjs <dir-or-file> [more…] [--json] [--strict] [--all]');
  process.exit(targets.length === 0 && !flags.has('--help') ? 1 : 0);
}

/* ── Collect files ───────────────────────────────────────────────────── */

const cwd = process.cwd();
const files = [];
const walk = (path) => {
  let stat;
  try {
    stat = statSync(path);
  } catch {
    console.error(`Cannot read ${path}`);
    return;
  }
  if (stat.isDirectory()) {
    for (const name of readdirSync(path)) {
      if (SKIP_DIRS.has(name) || name.startsWith('.')) continue;
      walk(join(path, name));
    }
    return;
  }
  const ext = extname(path).toLowerCase();
  if (!(CSS_EXT.has(ext) || MARKUP_EXT.has(ext) || SCRIPT_EXT.has(ext))) return;
  if (/\.min\.|\.d\.ts$|\.test\.|\.spec\.|\.stories\./.test(path) || stat.size > 1_500_000) return;
  files.push(path);
};
targets.forEach((t) => walk(resolve(cwd, t)));

/* ── Findings ────────────────────────────────────────────────────────── */

const findings = [];
const project = { motion: false, reducedMotion: false, css: false, tapHighlight: false, touchAction: false };

const report = (rule, file, line, excerpt) => {
  findings.push({ rule, severity: RULES[rule].severity, file: relative(cwd, file).replace(/\\/g, '/'), line, excerpt: excerpt.trim().replace(/\s+/g, ' ').slice(0, 140) });
};

const stripComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
const lineAt = (text, index) => text.slice(0, index).split('\n').length;

const seconds = (value, unit) => (unit === 'ms' ? Number(value) / 1000 : Number(value));

/** Check one CSS declaration in the context of the blocks that contain it. */
function checkDeclaration(decl, stack, file, line) {
  const m = decl.match(/^\s*([\w-]+)\s*:\s*([\s\S]+)$/);
  if (!m) return;
  const prop = m[1].toLowerCase();
  const value = m[2].trim();
  const selectors = stack.filter((b) => !b.header.startsWith('@')).map((b) => b.header);
  const selector = selectors.join(' ');
  const inKeyframes = stack.some((b) => /^@(-webkit-)?keyframes/.test(b.header));

  if (/^(transition|animation)/.test(prop)) project.motion = true;

  if (prop === 'transition' || prop === 'transition-property') {
    if (/(^|[\s,])all\b/.test(value)) report('transition-all', file, line, decl);
    if (/(^|[\s,])(width|height|max-height|max-width|min-height|top|left|right|bottom|margin(-\w+)?|padding(-\w+)?|font-size)\b/.test(value)) report('layout-animation', file, line, decl);
  }
  if (prop === 'transition' || prop === 'transition-timing-function' || prop === 'animation' || prop === 'animation-timing-function') {
    if (/\bease-in\b(?!-out)/.test(value)) report('ease-in', file, line, decl);
  }
  if ((prop === 'transition' || prop === 'transition-timing-function') && /(^|[\s,])linear\b(?!\()/.test(value)) report('linear-motion', file, line, decl);
  if ((prop === 'transition' || prop === 'transition-duration') && !/linear\(|var\(/.test(value)) {
    const durations = [...value.matchAll(/(\d*\.?\d+)(ms|s)\b/g)].map((d) => seconds(d[1], d[2]));
    if (durations.some((d) => d >= 0.6)) report('long-duration', file, line, decl);
  }
  if ((prop === 'transform' || prop === 'scale') && /(scale(3d)?\(\s*0(\.0+)?\s*[,)]|^0(\.0+)?$)/.test(value) && (inKeyframes || /starting-style|enter|open|show|from|initial|hidden|closed/i.test(stack.map((b) => b.header).join(' ')))) {
    report('scale-zero', file, line, decl);
  }
  if (prop === 'height' || prop === 'min-height') {
    // `height: 100vh; height: 100dvh;` is the correct fallback pattern for older browsers, so a
    // 100vh is only reported (when its block closes) if no dvh/svh declaration replaced it.
    const block = stack[stack.length - 1];
    if (/^100vh\b/.test(value)) (block.vh ??= {})[prop] = { line, decl };
    else if (/\d(dvh|svh)\b/.test(value) && block.vh) delete block.vh[prop];
  }
  if (prop === 'outline' && /^(none|0)\b/.test(value) && !stack.some((b) => /focus-visible/.test(b.header))) {
    report('focus-removed', file, line, decl); // cleared later if the file styles :focus-visible
  }
  if (prop === 'font-size' && /(^|[\s,>+~(])(input|textarea|select)\b/.test(selector)) {
    const px = value.match(/^(\d*\.?\d+)px/);
    if (px && Number(px[1]) < 16) report('input-zoom', file, line, decl);
  }
  if ((prop === 'user-select' || prop === '-webkit-user-select') && /^none\b/.test(value) && selectors.length === 1 && /^(html|body|:root|\*)(\s*,\s*(html|body|:root|\*))*$/.test(selectors[0].trim())) {
    report('select-none-root', file, line, decl);
  }
  if (prop === 'font-weight' && /^(100|200|300|lighter)\b/.test(value)) report('thin-weight', file, line, decl);
  if (prop === '-webkit-tap-highlight-color') project.tapHighlight = true;
  if (prop === 'touch-action' && /manipulation/.test(value)) project.touchAction = true;
}

/** A small CSS scanner: tracks nesting so rules know which blocks they are in. */
function scanCSS(source, file, lineOffset = 0) {
  project.css = true;
  const text = stripComments(source);
  if (/prefers-reduced-motion/.test(text)) project.reducedMotion = true;
  const stack = [];
  let chunkStart = 0;
  const before = findings.length;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') {
      const header = text.slice(chunkStart, i).trim().replace(/\s+/g, ' ');
      const block = { header, line: lineAt(text, i) + lineOffset, reported: false };
      const gated = /@media[^{]*\bhover\s*:\s*hover/.test(header) || stack.some((b) => b.gated);
      block.gated = gated;
      if (/:hover\b/.test(header) && !gated && !header.startsWith('@')) {
        report('hover-ungated', file, block.line, header);
      }
      stack.push(block);
      chunkStart = i + 1;
    } else if (ch === ';' || ch === '}') {
      const decl = text.slice(chunkStart, i);
      if (decl.includes(':') && stack.length) checkDeclaration(decl, stack, file, lineAt(text, chunkStart + (decl.length - decl.trimStart().length)) + lineOffset);
      if (ch === '}') {
        const closing = stack.pop();
        if (closing?.vh) for (const v of Object.values(closing.vh)) report('viewport-100vh', file, v.line, v.decl);
      }
      chunkStart = i + 1;
    }
  }

  // An outline reset is fine when the same stylesheet provides a :focus-visible style.
  if (/:focus-visible/.test(text)) {
    for (let i = findings.length - 1; i >= before; i--) if (findings[i].rule === 'focus-removed') findings.splice(i, 1);
  }
}

/** Line-based checks for markup and script files. */
function scanLines(source, file, { script }) {
  const lines = source.split('\n');
  if (/prefers-reduced-motion|useReducedMotion|reducedMotion|accessibilityReduceMotion|isReduceMotionEnabled|disableAnimations/.test(source)) project.reducedMotion = true;
  if (/\b(animate|transition|whileHover|whileTap|initial)=\{|\.animate\(|withSpring\(|withTiming\(|\btransition-|\banimate-/.test(source)) project.motion = true;

  lines.forEach((line, index) => {
    const n = index + 1;
    if (/<meta[^>]+viewport/i.test(line) && /user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0+)?(?![\d.])/i.test(line)) report('zoom-disabled', file, n, line);
    if (/url\([^)]*(SF-?Pro|SFPro|SF-?UI|SF-?Compact|NewYork|New-York)[^)]*\.(woff2?|ttf|otf)/i.test(line)) report('licensed-font', file, n, line);

    // Utility classes (Tailwind and similar) and inline style objects.
    if (/(["'`\s])transition-all\b/.test(line) || /transition:\s*["'`]all\b/.test(line)) report('transition-all', file, n, line);
    if (/(["'`\s:])ease-in(?![-\w])/.test(line) && /class(Name)?=|["'`]/.test(line) && !/ease-in-out/.test(line.replace(/ease-in(?![-\w])/g, ''))) {
      if (/class(Name)?=|cn\(|clsx\(|cva\(|tw`/.test(line)) report('ease-in', file, n, line);
    }
    if (/ease:\s*["'`]easeIn["'`]|easing:\s*["'`]ease-in["'`]|Easing\.in\(/.test(line)) report('ease-in', file, n, line);
    if (/\binitial=\{\{[^}]*\bscale:\s*0(\.0+)?\s*[,}]/.test(line) || /(["'`\s])scale-0(?![\w-])/.test(line)) report('scale-zero', file, n, line);
    if (/(["'`\s])(min-)?h-screen(?![\w-])/.test(line)) report('viewport-100vh', file, n, line);
    if (/(["'`\s])font-(thin|extralight|light)(?![\w-])/.test(line)) report('thin-weight', file, n, line);
    if (/(["'`\s])outline-none(?![\w-])/.test(line) && !/focus-visible:|focus:ring|focus:outline/.test(line)) report('focus-removed', file, n, line);

    if (script || /\.(vue|svelte|astro)$/.test(file)) {
      if (/<(div|span|li|p|img)\b[^>]*\b(onClick|on:click|@click)=/.test(line) && !/\brole=|tabIndex|tabindex/.test(line)) report('clickable-div', file, n, line);
      if (/from\s+["'`](lenis|@studio-freight\/lenis|locomotive-scroll|smooth-scrollbar|fullpage\.js|@fullpage\/[\w-]+)["'`]|require\(["'`](lenis|locomotive-scroll|smooth-scrollbar|fullpage\.js)["'`]\)/.test(line)) report('scroll-hijack', file, n, line);
    }
  });
}

for (const file of files) {
  let source;
  try {
    source = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  const ext = extname(file).toLowerCase();
  if (CSS_EXT.has(ext)) {
    scanCSS(source, file);
    scanLines(source, file, { script: false });
  } else if (MARKUP_EXT.has(ext)) {
    for (const m of source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) scanCSS(m[1], file, lineAt(source, m.index) - 1);
    scanLines(source.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, (s) => s.replace(/[^\n]/g, ' ')), file, { script: false });
  } else {
    scanLines(source, file, { script: true });
  }
}

if (project.motion && !project.reducedMotion) findings.push({ rule: 'no-reduced-motion', severity: 'trust', file: '(project)', line: 0, excerpt: 'No prefers-reduced-motion query or reduced-motion hook found in the scanned files.' });
if (project.css && !(project.tapHighlight && project.touchAction)) {
  const missing = [!project.tapHighlight && '-webkit-tap-highlight-color', !project.touchAction && 'touch-action: manipulation'].filter(Boolean).join(' and ');
  findings.push({ rule: 'no-press-foundation', severity: 'polish', file: '(project)', line: 0, excerpt: `Not found: ${missing}.` });
}

/* ── Output ──────────────────────────────────────────────────────────── */

const counts = { trust: 0, cheap: 0, polish: 0 };
for (const f of findings) counts[f.severity]++;

if (flags.has('--json')) {
  console.log(JSON.stringify({ scanned: files.length, counts, findings: findings.map((f) => ({ ...f, title: RULES[f.rule].title, why: RULES[f.rule].why, fix: RULES[f.rule].fix })) }, null, 2));
} else {
  const limit = flags.has('--all') ? Infinity : 5;
  console.log(`\nsecond-nature audit · ${files.length} file${files.length === 1 ? '' : 's'} scanned`);
  if (findings.length === 0) {
    console.log('\nNo machine-detectable tells found. That is the floor, not the review:\nfeel, hierarchy and taste still need eyes and hands (references/review.md).\n');
  } else {
    const byRule = new Map();
    for (const f of findings) byRule.set(f.rule, [...(byRule.get(f.rule) ?? []), f]);
    const ordered = [...byRule.entries()].sort((a, b) => SEVERITY[RULES[a[0]].severity].order - SEVERITY[RULES[b[0]].severity].order || b[1].length - a[1].length);
    let current = null;
    for (const [rule, list] of ordered) {
      const r = RULES[rule];
      if (r.severity !== current) {
        current = r.severity;
        console.log(`\n── ${SEVERITY[current].label} ${'─'.repeat(Math.max(0, 56 - SEVERITY[current].label.length))}`);
      }
      console.log(`\n${r.title}  (${list.length})`);
      console.log(`  why  ${r.why}`);
      console.log(`  fix  ${r.fix}`);
      for (const f of list.slice(0, limit)) console.log(`    ${f.line ? `${f.file}:${f.line}` : f.file}  ${f.excerpt}`);
      if (list.length > limit) console.log(`    … and ${list.length - limit} more (--all to list)`);
    }
    console.log(`\n${counts.trust} break trust · ${counts.cheap} feel cheap · ${counts.polish} polish`);
    console.log('This covers only what can be detected statically. Review feel by using it.\n');
  }
}

process.exit(flags.has('--strict') && counts.trust + counts.cheap > 0 ? 1 : 0);
