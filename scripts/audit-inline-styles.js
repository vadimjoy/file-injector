#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const DEMOS_DIR = path.join(__dirname, '..', 'src', 'demos');

const ALLOWED_STYLES = [
  'font-size:var(--ui-font-size-xs)',
  'font-size:var(--ui-font-size-sm)',
  'font-size:11px',
  'font-size:12px',
  'font-size:14px',
  'font-size:16px',
  'font-size:20px',
  'font-size:24px',
  'font-size:32px',
  'font-size:48px',
  'width:100%',
  'width:75%',
  'width:50%',
  'width:80%',
  'width:60%',
  'width:40%',
  'width:120px',
  'width:45%',
  'width:30%',
  'width:88%',
  'width:70%',
  'width:55%',
  'width:65%',
  'width:44px',
  'height:44px',
  'width:40px',
  'height:40px',
  '--_fill:',
  'background:#4f46e5',
  'background:#16a34a',
  'background:#d97706',
  'background:#dc2626',
  'background:#0ea5e9',
  'background:#8b5cf6',
  'background:#ec4899',
  'background:#111827',
  'background:#f9fafb',
  'background:#eef2ff',
  'background:#e0e7ff',
  'background:#c7d2fe',
  'background:#a5b4fc',
  'background:#818cf8',
  'background:#6366f1',
  'background:#4338ca',
  'background:#312e81',
  'color:#312e81',
  'color:#fff',
  'color:var(--ui-color-text)',
  'color:var(--ui-color-text-secondary)',
  'color:var(--ui-color-text-muted)',
  'color:var(--ui-color-success)',
  'color:var(--ui-color-error)',
  'color:var(--ui-color-warning)',
  'color:var(--ui-color-primary)',
  'background:var(--ui-color-primary)',
  'padding:20px 32px',
  'border-radius:var(--ui-radius-lg)',
  'display:flex',
  'align-items:center',
  'gap:16px',
  'display:flex;justify-content:space-between;align-items:center;padding:6px 0',
  'border:1px solid #e5e7eb',
  'margin:0 0 8px',
  'margin:0 0 4px',
  'margin:0',
  'margin-right:4px',
  'font-weight:400',
  'font-family:var(--ui-font-family)',
  'font-size:11px;color:var(--ui-color-text-muted);font-family:var(--ui-font-family)',
];

function collectHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(function(file) { return file.endsWith('.html'); })
    .map(function(file) { return path.join(dir, file); });
}

function isAllowedStyle(style) {
  var trimmed = style.trim();
  for (var j = 0; j < ALLOWED_STYLES.length; j++) {
    if (trimmed.indexOf(ALLOWED_STYLES[j]) !== -1) return true;
  }
  return false;
}

var violations = [];

function checkFile(filePath) {
  var content = fs.readFileSync(filePath, 'utf8');
  var lines = content.split('\n');

  lines.forEach(function(line, idx) {
    var styleMatches = line.match(/style="([^"]*)"/g);
    if (!styleMatches) return;

    styleMatches.forEach(function(match) {
      var styleAttr = match.slice(7, -1);
      if (!isAllowedStyle(styleAttr)) {
        violations.push({
          file: path.relative(process.cwd(), filePath),
          line: idx + 1,
          snippet: line.trim().slice(0, 120),
          style: styleAttr.slice(0, 80)
        });
      }
    });
  });
}

var files = collectHtmlFiles(DEMOS_DIR);
files.forEach(checkFile);

if (violations.length > 0) {
  console.error('\nINLINE STYLE VIOLATIONS (' + violations.length + ')\n');
  violations.forEach(function(v) {
    console.error(v.file + ':' + v.line);
    console.error('  style="' + v.style + '"');
    console.error('  -> ' + v.snippet);
    console.error('');
  });
  console.error('Fix: replace inline styles with utility classes from demo-page.css');
  process.exit(1);
}

console.log('✓ No inline style violations (src/demos/*.html)');