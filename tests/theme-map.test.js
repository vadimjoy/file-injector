/**
 * tests/theme-map.test.js
 * Unit tests for scripts/theme-map.js
 * Uses Node.js built-in test runner (requires Node >= 18).
 *
 * Run:  node --test tests/theme-map.test.js
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import {
  tokenKeyToCssVar,
  detectFormat,
  hasLeafKey,
  flattenTokens,
  parseTheme,
  generateCSS,
} from '../scripts/theme-map.js';

/* --------------------------------------------------------------------------
   tokenKeyToCssVar
   -------------------------------------------------------------------------- */

describe('tokenKeyToCssVar', () => {
  test('maps global color tokens to --ui-*', () => {
    assert.equal(tokenKeyToCssVar('color.primary'),       '--ui-color-primary');
    assert.equal(tokenKeyToCssVar('color.primary.hover'), '--ui-color-primary-hover');
    assert.equal(tokenKeyToCssVar('radius.md'),           '--ui-radius-md');
    assert.equal(tokenKeyToCssVar('font.family'),         '--ui-font-family');
    assert.equal(tokenKeyToCssVar('shadow.xs'),           '--ui-shadow-xs');
  });

  test('maps component tokens to --ai-*', () => {
    assert.equal(tokenKeyToCssVar('button.bg'),            '--ai-button-bg');
    assert.equal(tokenKeyToCssVar('button.bg.hover'),      '--ai-button-bg-hover');
    assert.equal(tokenKeyToCssVar('input.border'),         '--ai-input-border');
    assert.equal(tokenKeyToCssVar('card.radius'),          '--ai-card-radius');
    assert.equal(tokenKeyToCssVar('calendar.selected-bg'), '--ai-calendar-selected-bg');
    assert.equal(tokenKeyToCssVar('autocomplete.shadow'),  '--ai-autocomplete-shadow');
    assert.equal(tokenKeyToCssVar('file-upload.bg'),       '--ai-file-upload-bg');
  });

  test('passes through keys that already start with --', () => {
    assert.equal(tokenKeyToCssVar('--ui-color-primary'),  '--ui-color-primary');
    assert.equal(tokenKeyToCssVar('--custom-var'),        '--custom-var');
  });
});

/* --------------------------------------------------------------------------
   detectFormat
   -------------------------------------------------------------------------- */

describe('detectFormat', () => {
  test('detects native format (has tokens key)', () => {
    const json = { meta: { name: 'Test' }, tokens: { 'color.primary': '#fff' } };
    assert.equal(detectFormat(json), 'native');
  });

  test('detects W3C DTCG format ($value leaf nodes)', () => {
    const json = {
      color: {
        primary: { $value: '#4f46e5', $type: 'color' },
      },
    };
    assert.equal(detectFormat(json), 'w3c');
  });

  test('detects Figma Tokens format (value leaf nodes)', () => {
    const json = {
      color: {
        primary: { value: '#4f46e5', type: 'color' },
      },
    };
    assert.equal(detectFormat(json), 'figma');
  });

  test('falls back to native for unknown structure', () => {
    assert.equal(detectFormat({}), 'native');
    assert.equal(detectFormat({ tokens: {} }), 'native');
  });
});

/* --------------------------------------------------------------------------
   hasLeafKey
   -------------------------------------------------------------------------- */

describe('hasLeafKey', () => {
  test('returns true when $value exists anywhere in tree', () => {
    const obj = { color: { primary: { $value: '#fff' } } };
    assert.ok(hasLeafKey(obj, '$value'));
  });

  test('returns false when key is absent', () => {
    const obj = { color: { primary: '#fff' } };
    assert.ok(!hasLeafKey(obj, '$value'));
  });

  test('handles null / non-object gracefully', () => {
    assert.ok(!hasLeafKey(null,      '$value'));
    assert.ok(!hasLeafKey('string',  '$value'));
    assert.ok(!hasLeafKey(undefined, '$value'));
  });
});

/* --------------------------------------------------------------------------
   flattenTokens
   -------------------------------------------------------------------------- */

describe('flattenTokens', () => {
  test('flattens W3C nested tokens', () => {
    const json = {
      color: {
        primary: { $value: '#4f46e5', $type: 'color' },
        bg:      { $value: '#ffffff', $type: 'color' },
      },
      radius: {
        md: { $value: '8px', $type: 'dimension' },
      },
    };
    const result = flattenTokens(json, '', 'w3c');
    assert.equal(result['color.primary'], '#4f46e5');
    assert.equal(result['color.bg'],      '#ffffff');
    assert.equal(result['radius.md'],     '8px');
  });

  test('flattens Figma nested tokens', () => {
    const json = {
      global: {
        primary: { value: '#4f46e5', type: 'color' },
      },
    };
    const result = flattenTokens(json, '', 'figma');
    assert.equal(result['global.primary'], '#4f46e5');
  });

  test('flattens native flat tokens (primitive values)', () => {
    const json = { 'color.primary': '#fff', 'radius.md': '8px' };
    const result = flattenTokens(json, '', 'native');
    assert.equal(result['color.primary'], '#fff');
    assert.equal(result['radius.md'],     '8px');
  });

  test('skips $type and description metadata keys', () => {
    const json = {
      color: {
        primary: { $value: '#fff', $type: 'color', $description: 'Brand color' },
      },
    };
    const result = flattenTokens(json, '', 'w3c');
    assert.ok(!('color.primary.$type' in result));
    assert.ok(!('color.primary.$description' in result));
    assert.equal(result['color.primary'], '#fff');
  });
});

/* --------------------------------------------------------------------------
   parseTheme
   -------------------------------------------------------------------------- */

describe('parseTheme', () => {
  test('parses native format', () => {
    const json = {
      meta:   { name: 'My Theme', version: '1.0' },
      tokens: { 'color.primary': '#6d28d9', 'radius.md': '12px' },
    };
    const { meta, tokens } = parseTheme(json);
    assert.equal(meta.name,              'My Theme');
    assert.equal(tokens['color.primary'], '#6d28d9');
    assert.equal(tokens['radius.md'],     '12px');
  });

  test('parses W3C DTCG format', () => {
    const json = {
      color: {
        primary: { $value: '#6d28d9', $type: 'color' },
      },
    };
    const { meta, tokens } = parseTheme(json);
    assert.deepEqual(meta, {});
    assert.equal(tokens['color.primary'], '#6d28d9');
  });

  test('parses Figma Tokens format', () => {
    const json = {
      color: {
        primary: { value: '#6d28d9', type: 'color' },
      },
    };
    const { meta, tokens } = parseTheme(json);
    assert.equal(tokens['color.primary'], '#6d28d9');
  });
});

/* --------------------------------------------------------------------------
   generateCSS
   -------------------------------------------------------------------------- */

describe('generateCSS', () => {
  test('generates valid CSS with correct data-theme attribute', () => {
    const meta   = { name: 'Midnight Pro', version: '1.0.0' };
    const tokens = { 'color.primary': '#6d28d9', 'radius.md': '12px' };
    const css    = generateCSS(meta, tokens);

    assert.ok(css.includes('[data-theme="midnight-pro"]'));
    assert.ok(css.includes('--ui-color-primary: #6d28d9'));
    assert.ok(css.includes('--ui-radius-md: 12px'));
  });

  test('wraps output in @layer ai-kit.themes', () => {
    const css = generateCSS({ name: 'Test' }, { 'color.primary': '#fff' });
    assert.ok(css.includes('@layer ai-kit.themes'));
  });

  test('includes generation header comment', () => {
    const css = generateCSS({ name: 'Test' }, { 'color.primary': '#fff' });
    assert.ok(css.includes('Generated by ai-css-kit theme-map'));
  });

  test('handles component tokens (--ai-* namespace)', () => {
    const css = generateCSS({ name: 'Test' }, { 'button.bg': '#10b981' });
    assert.ok(css.includes('--ai-button-bg: #10b981'));
  });

  test('handles direct CSS variable keys (--)', () => {
    const css = generateCSS({ name: 'Test' }, { '--ui-line-height': '1.6' });
    assert.ok(css.includes('--ui-line-height: 1.6'));
  });

  test('supports nameOverride parameter', () => {
    const css = generateCSS({ name: 'Midnight' }, { 'color.primary': '#fff' }, 'custom-dark');
    assert.ok(css.includes('[data-theme="custom-dark"]'));
  });

  test('throws when tokens object is empty', () => {
    assert.throws(
      () => generateCSS({ name: 'Empty' }, {}),
      /no tokens/i
    );
  });

  test('sanitises theme name to safe CSS identifier', () => {
    const css = generateCSS({ name: 'My Brand Theme!' }, { 'color.primary': '#fff' });
    assert.ok(css.includes('[data-theme="my-brand-theme"]'));
  });
});

/* --------------------------------------------------------------------------
   Integration — end-to-end round-trip
   -------------------------------------------------------------------------- */

describe('integration: native theme file round-trip', () => {
  test('default.json produces correct CSS', () => {
    const raw  = fs.readFileSync(
      path.resolve(__dirname, '../src/themes/default.json'), 'utf8'
    );
    const json = JSON.parse(raw);
    const { meta, tokens } = parseTheme(json);
    const css  = generateCSS(meta, tokens);

    assert.ok(css.includes('[data-theme="default"]'));
    assert.ok(css.includes('--ui-color-primary: #4f46e5'));
    assert.ok(css.includes('--ui-radius-md: 8px'));
  });

  test('dark.json produces dark token overrides', () => {
    const raw  = fs.readFileSync(
      path.resolve(__dirname, '../src/themes/dark.json'), 'utf8'
    );
    const json = JSON.parse(raw);
    const { meta, tokens } = parseTheme(json);
    const css  = generateCSS(meta, tokens);

    assert.ok(css.includes('[data-theme="dark"]'));
    assert.ok(css.includes('--ui-color-bg: #1f2937'));
  });

  test('midnight.json uses --ai-* component token override', () => {
    const raw  = fs.readFileSync(
      path.resolve(__dirname, '../src/themes/midnight.json'), 'utf8'
    );
    const json = JSON.parse(raw);
    const { meta, tokens } = parseTheme(json);
    const css  = generateCSS(meta, tokens);

    assert.ok(css.includes('[data-theme="midnight"]'));
    assert.ok(css.includes('--ai-calendar-selected-bg'));
  });
});
