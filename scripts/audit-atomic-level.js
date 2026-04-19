#!/usr/bin/env node
/**
 * audit-atomic-level.js
 * Enforces the Module Contract rule: a CSS file may only define selectors
 * whose base class it "owns".  An organism-level file must NOT introduce
 * element/modifier selectors that belong to a DIFFERENT organism.
 *
 * Atomic level classification (derived from src/css/index.css import order)
 * --------------------------------------------------------------------------
 *  foundations/   → level 1 (typography, icon, color palette)
 *  components/    → level 2 (atoms & molecules)
 *
 * Rules checked
 * -------------
 * 1. Every CSS file may reference (style) ANY class from a lower or equal
 *    level — e.g. a molecule may style atoms inside it using BEM child
 *    selectors.
 * 2. A file at level N must NOT *define* (appear as the sole selector) a
 *    base that belongs to a DIFFERENT file at the SAME level.
 *    e.g.  button.css  must not define  .ui-badge { … }
 *
 * Exemptions
 * ----------
 * - "GLOBAL_ALLOWED_BASES" — classes shared across layers (ui-field etc.)
 * - Preceding comment:  /* audit-atomic: ignore * /
 *
 * Exit 1 on violations, 0 on clean.
 */
'use strict';

const fs      = require('fs');
const path    = require('path');
const postcss = require('postcss');

// ── directories and their level numbers ─────────────────────────────────────
const LEVEL_DIRS = [
  { dir: path.join(__dirname, '..', 'src', 'css', 'foundations'), level: 1 },
  { dir: path.join(__dirname, '..', 'src', 'css', 'components'),  level: 2 },
];

// Bases that are intentionally shared / don't belong to a single file
const GLOBAL_ALLOWED_BASES = new Set(['ui-field']);

// ── helpers ──────────────────────────────────────────────────────────────────
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

/** True if the file header declares it is entirely a backward-compat stub file. */
function isStubsFile(root) {
  let found = false;
  root.each((node) => {
    if (node.type === 'comment' && node.text.includes('audit-atomic: stubs-file')) {
      found = true;
    }
    return false; // stop after first node
  });
  return found;
}

/** Build a Set of bases that appear AFTER a `stubs-section` marker in this file. */
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

// ── build a registry: base-class → { file, level } ──────────────────────────
const allFiles = LEVEL_DIRS.flatMap(({ dir, level }) => collectCssFiles(dir, level));

// First pass: collect which file "owns" each base (first file to define it solo)
const baseOwner = new Map(); // base → { filePath, level }

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

// ── second pass: detect cross-ownership violations ───────────────────────────
const violations = [];

allFiles.forEach(({ filePath, level }) => {
  const css  = fs.readFileSync(filePath, 'utf8');
  const root = postcss.parse(css, { from: filePath });

  // Skip files that are entirely backward-compat stub collections
  if (isStubsFile(root)) return;

  // Collect bases exempt because they live in a stubs-section of this file
  const stubsSectionBases = getStubsSectionBases(root);

  root.walkRules((rule) => {
    if (!rule.selectors) return;
    if (isPrecedingExemption(rule)) return;

    rule.selectors.forEach((sel) => {
      const classes = extractClasses(sel);
      if (classes.length !== 1) return; // compound selectors are contextual — OK

      const base  = getBase(classes[0]);
      if (GLOBAL_ALLOWED_BASES.has(base)) return;
      if (stubsSectionBases.has(base)) return; // within a declared stubs-section

      const owner = baseOwner.get(base);
      if (!owner) return; // not registered (shouldn't happen in second pass)

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
