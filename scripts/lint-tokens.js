#!/usr/bin/env node
/**
 * lint-tokens.js
 * Checks src/css/components/ and src/css/foundations/ for hardcoded colour
 * values (hex, rgb, rgba, hsl, hsla) that bypass the design-token system.
 *
 * Rules
 * -----
 * - Property values must use var(--ui-*) or var(--ai-*) tokens, not raw colour
 *   literals.
 * - Exception: values that are part of a CSS gradient helper or a browser-
 *   normalisation rule (e.g. `transparent`, `currentColor`, `inherit`,
 *   `initial`, `unset`, `none`).
 *
 * Exemption
 * ---------
 * Precede the violating declaration with a comment:
 *   /* lint-tokens: ignore * /
 * (single line only — the comment must be the immediate preceding node)
 *
 * Exit 1 on violations, 0 on clean.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── directories to scan ──────────────────────────────────────────────────────
const ROOTS = [
  path.join(__dirname, '..', 'src', 'css', 'foundations'),
  path.join(__dirname, '..', 'src', 'css', 'components'),
];

// ── patterns that flag a declaration value as a hardcoded colour ─────────────
const COLOR_PATTERNS = [
  /#[0-9a-fA-F]{3,8}\b/,                  // hex: #fff  #4f46e5  #00000080
  /rgba?\s*\(\s*\d/,                       // rgb()/rgba() with numeric args
  /hsla?\s*\(/,                            // hsl()/hsla()
];

// ── values that are always allowed even though they look like colours ─────────
const ALLOWED_LITERALS = new Set([
  'transparent', 'currentcolor', 'inherit', 'initial', 'unset', 'none',
]);

// ── CSS properties we check (colour-bearing props only) ──────────────────────
const COLOR_PROPS = new Set([
  'color', 'background', 'background-color', 'border-color',
  'border-top-color', 'border-right-color', 'border-bottom-color',
  'border-left-color', 'outline-color', 'text-decoration-color',
  'box-shadow', 'text-shadow', 'fill', 'stroke', 'stop-color',
  'caret-color', 'column-rule-color', 'accent-color',
]);

function isColorProp(prop) {
  return COLOR_PROPS.has(prop.toLowerCase());
}

function hasHardcodedColor(value) {
  const lower = value.toLowerCase().trim();
  if (ALLOWED_LITERALS.has(lower)) return false;
  return COLOR_PATTERNS.some((re) => re.test(value));
}

function isPrecedingExemption(decl) {
  const prev = decl.prev();
  return prev && prev.type === 'comment' &&
    prev.text.trim().toLowerCase() === 'lint-tokens: ignore';
}

function collectCssFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.css'))
    .map((f) => path.join(dir, f));
}

const cssFiles = ROOTS.flatMap(collectCssFiles);

const violations = [];

cssFiles.forEach((filePath) => {
  const css  = fs.readFileSync(filePath, 'utf8');
  const root = postcss.parse(css, { from: filePath });

  root.walkDecls((decl) => {
    if (!isColorProp(decl.prop)) return;
    if (!hasHardcodedColor(decl.value)) return;
    if (isPrecedingExemption(decl)) return;

    violations.push({
      file: path.relative(process.cwd(), filePath),
      line: decl.source && decl.source.start ? decl.source.start.line : 0,
      prop: decl.prop,
      value: decl.value,
    });
  });
});

if (violations.length > 0) {
  console.error(`HARDCODED COLOUR VIOLATIONS (${violations.length} found)\n`);
  violations.forEach(({ file, line, prop, value }) => {
    const truncated = value.length > 60 ? value.slice(0, 57) + '...' : value;
    console.error(`  ${file}:${line}  →  ${prop}: ${truncated}`);
  });
  console.error('\nFix: replace with var(--ui-*) / var(--ai-*) design tokens.');
  console.error('Exemption: add  /* lint-tokens: ignore */  above the declaration.');
  process.exit(1);
}

console.log(`✓ No hardcoded colour violations in ${cssFiles.length} CSS files`);
