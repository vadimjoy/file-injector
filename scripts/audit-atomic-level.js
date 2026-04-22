#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LEVEL_DIRS = [
  { dir: path.join(__dirname, '..', 'src', 'css', 'foundations'), level: 1 },
  { dir: path.join(__dirname, '..', 'src', 'css', 'components'),  level: 2 },
];

const GLOBAL_ALLOWED_BASES = new Set(['ui-field']);

function collectCssFiles(dir, level) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.css'))
    .map((f) => ({ filePath: path.join(dir, f), level }));
}

function extractClasses(selector) {
  return (selector.match(/\.ui-[A-Za-z0-9_-]+/g) || []).map((c) => c.slice(1));
}

function getBase(className) {
  const d = className.indexOf('--');
  const u = className.indexOf('__');
  let cut = className.length;
  if (d !== -1) cut = Math.min(cut, d);
  if (u !== -1) cut = Math.min(cut, u);
  return className.slice(0, cut);
}

function isPrecedingExemption(rule) {
  const prev = rule.prev();
  return prev && prev.type === 'comment' &&
    prev.text.trim().toLowerCase() === 'audit-atomic: ignore';
}

function isStubsFile(root) {
  let found = false;
  root.each((node) => {
    if (node.type === 'comment' && node.text.includes('audit-atomic: stubs-file')) {
      found = true;
    }
    return false;
  });
  return found;
}

function getStubsSectionBases(root) {
  const bases = new Set();
  let inStubsSection = false;
  root.walk((node) => {
    if (node.type === 'comment' && node.text.includes('audit-atomic: stubs-section')) {
      inStubsSection = true;
      return;
    }
    if (!inStubsSection) return;
    if (node.type === 'rule' && node.selectors) {
      node.selectors.forEach((sel) => {
        extractClasses(sel).forEach((cls) => bases.add(getBase(cls)));
      });
    }
  });
  return bases;
}

const allFiles = LEVEL_DIRS.flatMap(({ dir, level }) => collectCssFiles(dir, level));

const baseOwner = new Map();

allFiles.forEach(({ filePath, level }) => {
  const css  = fs.readFileSync(filePath, 'utf8');
  const root = postcss.parse(css, { from: filePath });

  root.walkRules((rule) => {
    if (!rule.selectors) return;
    rule.selectors.forEach((sel) => {
      const classes = extractClasses(sel);
      if (classes.length === 1) {
        const base = getBase(classes[0]);
        if (!GLOBAL_ALLOWED_BASES.has(base) && !baseOwner.has(base)) {
          baseOwner.set(base, { filePath, level });
        }
      }
    });
  });
});

const violations = [];

allFiles.forEach(({ filePath, level }) => {
  const css  = fs.readFileSync(filePath, 'utf8');
  const root = postcss.parse(css, { from: filePath });

  if (isStubsFile(root)) return;

  const stubsSectionBases = getStubsSectionBases(root);

  root.walkRules((rule) => {
    if (!rule.selectors) return;
    if (isPrecedingExemption(rule)) return;

    rule.selectors.forEach((sel) => {
      const classes = extractClasses(sel);
      if (classes.length !== 1) return;

      const base  = getBase(classes[0]);
      if (GLOBAL_ALLOWED_BASES.has(base)) return;
      if (stubsSectionBases.has(base)) return;

      const owner = baseOwner.get(base);
      if (!owner) return;

      if (owner.filePath !== filePath && owner.level === level) {
        violations.push({
          file:       path.relative(process.cwd(), filePath),
          line:       rule.source && rule.source.start ? rule.source.start.line : 0,
          selector:   sel.trim(),
          foreignBase: base,
          ownedBy:    path.relative(process.cwd(), owner.filePath),
        });
      }
    });
  });
});

if (violations.length > 0) {
  console.error(`ATOMIC LEVEL VIOLATIONS (${violations.length} found)\n`);
  violations.forEach(({ file, line, selector, foreignBase, ownedBy }) => {
    console.error(`  ${file}:${line}`);
    console.error(`    Selector : ${selector}`);
    console.error(`    Problem  : defines base "${foreignBase}" which is owned by ${ownedBy}`);
    console.error('');
  });
  console.error('Fix: move the rule to its owning file, or extract a shared atom.');
  console.error('Exemption: add  /* audit-atomic: ignore */  above the rule.');
  process.exit(1);
}

console.log(`✓ No atomic-level violations in ${allFiles.length} CSS files`);