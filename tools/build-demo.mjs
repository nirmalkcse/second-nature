#!/usr/bin/env node
/**
 * Builds demo/index.html: one self-contained file you can open by double-click
 * (browsers refuse ES-module imports from file://, so the skill's assets are
 * inlined rather than linked). Source of truth stays in skills/second-nature/assets.
 *
 *   node tools/build-demo.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

const root = new URL('..', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');

/** Wrap an ES module as `const Name = (() => { …; return { exports } })()`. */
const asNamespace = (name, path) => {
  const source = read(path);
  const names = [...source.matchAll(/^export (?:async )?(?:function\*?|const|let|class) ([A-Za-z_$][\w$]*)/gm)].map((m) => m[1]);
  return `const ${name} = (() => {\n${source.replace(/^export /gm, '')}\nreturn { ${names.join(', ')} };\n})();`;
};

let html = read('demo/src/index.html');
html = html.replace(/\/\*\s*@css\s+(\S+)\s*\*\//g, (_, path) => read(path));
html = html.replace(/\/\/\s*@module\s+(\w+)\s+(\S+)/g, (_, name, path) => asNamespace(name, path));
writeFileSync(new URL('demo/index.html', root), html);
console.log(`demo/index.html  ${(html.length / 1024).toFixed(1)} kB`);
