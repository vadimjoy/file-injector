#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');

const COMPONENT_DIR = path.join(__dirname, '..', 'src', 'css', 'components');
const GLOBAL_ALLOWED_BASES = new Set(['ui-field']);

const cssFiles = fs
  .readdirSync(COMPONENT_DIR)
  .filter((file) => file.endsWith('.css'))
  .map((file) => path.join(COMPONENT_DIR, file));

function extractClasses(selector) {
  const matches = selector.match(/\.ui-[A-Za-z0-9_-]+/g) || [];
  return matches.map((cls) => cls.slice(1));
}

function getBase(className) {
  const dashIndex = className.indexOf('--');
  const underscoreIndex = className.indexOf('__');
  let cut = className.length;

  if (dashIndex !== -1) cut = Math.min(cut, dashIndex);
  if (underscoreIndex !== -1) cut = Math.min(cut, underscoreIndex);

  return className.slice(0, cut);
}

function collectOwnedBases(root) {
  const bases = new Set();
  root.walkRules((rule) => {
    if (!rule.selectors) return;
    rule.selectors.forEach((selector) => {
      const classes = extractClasses(selector);
      if (classes.length === 1) {
        bases.add(getBase(classes[0]));
      }
    });
  });
  return bases;
}

const violations = [];

cssFiles.forEach((filePath) => {
  const css = fs.readFileSync(filePath, 'utf8');
  const root = postcss.parse(css, { from: filePath });
  const ownedBases = collectOwnedBases(root);

  root.walkRules((rule) => {
    if (!rule.selectors) return;

    rule.selectors.forEach((selector) => {
      const classes = extractClasses(selector);
      if (classes.length === 0) return;

      const bases = [...new Set(classes.map(getBase))];
      const foreign = bases.filter(
        (base) => !GLOBAL_ALLOWED_BASES.has(base) && !ownedBases.has(base)
      );

      if (foreign.length === 0) return;

      violations.push({
        file: path.relative(process.cwd(), filePath),
        line: rule.source && rule.source.start ? rule.source.start.line : 0,
        selector: selector.trim(),
        foreign
      });
    });
  });
});

if (violations.length > 0) {
  console.error('COUPLING VIOLATION\n');
  violations.forEach((violation) => {
    console.error(`File:     ${violation.file}`);
    console.error(`Line:     ${violation.line}`);
    console.error(`Selector: ${violation.selector}`);
    console.error(`Problem:  references foreign bases: ${violation.foreign.join(', ')}`);
    console.error('');
  });
  process.exit(1);
}

console.log('✓ No coupling violations detected');
