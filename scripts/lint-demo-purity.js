#!/usr/bin/env node
/**
 * lint-demo-purity.js
 * Phase 4.2 Kit Consolidation — Module Contract v2
 *
 * Checks that src/demos/*.html contains zero inline style="" attributes,
 * except for those explicitly marked as token-override demos with a
 * nearby HTML comment:  <!-- demo: token override -->
 *
 * Usage:
 *   node scripts/lint-demo-purity.js
 *   npm run lint:inline-styles
 *
 * Exit codes:
 *   0  — all clean
 *   1  — violations found
 */

const fs   = require('fs');
const path = require('path');
const glob = require('fs');

const DEMOS_DIR = path.join(__dirname, '..', 'src', 'demos');

// Regex: finds style="…" occurrences
const STYLE_RE  = /style\s*=\s*["'][^"']*["']/g;
// Regex: token-override exemption marker (within 200 chars before the style=)
const EXEMPT_RE = /<!--\s*demo:\s*token\s*override\s*-->/i;

function getHtmlFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.html'))
    .map(f => path.join(dir, f));
}

const files    = getHtmlFiles(DEMOS_DIR);
const violations = [];

files.forEach(filePath => {
  const source   = fs.readFileSync(filePath, 'utf8');
  const lines    = source.split('\n');
  const fileName = path.relative(process.cwd(), filePath);

  lines.forEach((line, idx) => {
    // Skip lines that contain only the exemption marker
    if (EXEMPT_RE.test(line)) return;

    const matches = [...line.matchAll(STYLE_RE)];
    if (!matches.length) return;

    // Check whether the exemption marker is on the previous two lines
    const context = lines.slice(Math.max(0, idx - 2), idx).join('\n');
    if (EXEMPT_RE.test(context)) return;

    matches.forEach(m => {
      violations.push({
        file: fileName,
        line: idx + 1,
        match: m[0].length > 60 ? m[0].slice(0, 57) + '...' : m[0],
      });
    });
  });
});

if (violations.length > 0) {
  console.error(`INLINE STYLE VIOLATIONS (${violations.length} found)\n`);
  violations.forEach(v => {
    console.error(`  ${v.file}:${v.line}  →  ${v.match}`);
  });
  console.error('\nFix: move inline styles to demo-page.css utility classes.');
  console.error('Exemption: add  <!-- demo: token override -->  above the element.');
  process.exit(1);
}

console.log(`✓ No inline style violations in ${files.length} demo files`);
