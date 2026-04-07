/**
 * theme-map.js — AI CSS Kit Theme Mapper
 *
 * Converts a JSON theme file to a CSS file with [data-theme="name"] overrides.
 * Supports three input formats:
 *   - Native ai-css-kit format  { meta: {...}, tokens: { "color.primary": "#..." } }
 *   - W3C Design Tokens Format  { "color": { "primary": { "$value": "#...", "$type": "color" } } }
 *   - Figma Tokens Plugin format { "color": { "primary": { "value": "#...", "type": "color" } } }
 *
 * Token key → CSS variable mapping:
 *   - Keys starting with '--' are used verbatim as CSS variable names
 *   - Keys whose first segment is a known component name → --ai-<key>
 *   - All other keys → --ui-<key>  (dots replaced with hyphens)
 *
 * Usage (CLI):
 *   node scripts/theme-map.js <theme.json> [-o <output.css>] [--name <override-name>]
 *
 * Usage (API):
 *   const { parseTheme, generateCSS, tokenKeyToCssVar } = require('./scripts/theme-map');
 */

'use strict';

const fs   = require('fs');
const path = require('path');

/* --------------------------------------------------------------------------
   Constants
   -------------------------------------------------------------------------- */

/**
 * Component names whose tokens live in the --ai-* namespace.
 * Order matters for prefix-match: longer names first to avoid prefix collision.
 */
const COMPONENT_PREFIXES = new Set([
  'button',
  'input',
  'textarea',
  'select',
  'card',
  'badge',
  'progress',
  'tooltip',
  'checkbox',
  'radio',
  'toggle',
  'slider',
  'file-upload',
  'autocomplete',
  'calendar',
]);

/* --------------------------------------------------------------------------
   Core API
   -------------------------------------------------------------------------- */

/**
 * Convert a dot-notation token key to a CSS custom property name.
 *
 * @param {string} key  e.g. "color.primary", "button.bg", "--ui-foo"
 * @returns {string}    e.g. "--ui-color-primary", "--ai-button-bg", "--ui-foo"
 */
function tokenKeyToCssVar(key) {
  if (key.startsWith('--')) return key;

  const firstSegment = key.split('.')[0];
  const cssKey = key.replace(/\./g, '-');

  if (COMPONENT_PREFIXES.has(firstSegment)) {
    return '--ai-' + cssKey;
  }
  return '--ui-' + cssKey;
}

/**
 * Detect the format of a parsed theme JSON object.
 *
 * @param {object} json
 * @returns {'native' | 'w3c' | 'figma'}
 */
function detectFormat(json) {
  // Native: top-level "meta" and "tokens" keys
  if (json && typeof json.tokens === 'object' && json.tokens !== null) {
    return 'native';
  }

  // W3C Design Tokens (DTCG): leaf nodes have "$value" key
  if (hasLeafKey(json, '$value')) return 'w3c';

  // Figma Tokens Plugin: leaf nodes have "value" key
  if (hasLeafKey(json, 'value')) return 'figma';

  // Fallback: treat as native with a flat tokens object
  return 'native';
}

/**
 * Recursively check if any leaf-like node in the object has the given key.
 *
 * @param {*}      obj
 * @param {string} leafKey  "$value" or "value"
 * @returns {boolean}
 */
function hasLeafKey(obj, leafKey) {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return false;
  if (leafKey in obj) return true;
  return Object.values(obj).some(v => hasLeafKey(v, leafKey));
}

/**
 * Recursively flatten a nested token object into a flat key → value map.
 * Stops descending when it reaches a leaf node (a node with the format's
 * value key, or a non-object value).
 *
 * @param {object} obj
 * @param {string} prefix   Accumulated dot-notation prefix
 * @param {'w3c' | 'figma' | 'native'} format
 * @returns {Record<string, string>}
 */
function flattenTokens(obj, prefix, format) {
  const result = {};

  for (const [key, value] of Object.entries(obj)) {
    // Skip metadata keys used by W3C / Figma formats
    if (key.startsWith('$') && key !== '$value') continue;
    if (key === 'type' || key === '$type') continue;
    if (key === 'description' || key === '$description') continue;

    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      if (format === 'w3c' && '$value' in value) {
        // W3C leaf node
        result[fullKey] = String(value['$value']);
      } else if (format === 'figma' && 'value' in value) {
        // Figma leaf node
        result[fullKey] = String(value['value']);
      } else {
        // Nested group — recurse
        Object.assign(result, flattenTokens(value, fullKey, format));
      }
    } else if (typeof value !== 'object') {
      // Primitive value (native flat format or inline values)
      result[fullKey] = String(value);
    }
  }

  return result;
}

/**
 * Parse a raw JSON theme object into a normalised { meta, tokens } shape.
 *
 * @param {object} json  Parsed JSON from theme file
 * @returns {{ meta: object, tokens: Record<string, string> }}
 */
function parseTheme(json) {
  const format = detectFormat(json);

  if (format === 'native') {
    return {
      meta:   json.meta   || {},
      tokens: json.tokens || {},
    };
  }

  // W3C or Figma: flatten the whole object
  const tokens = flattenTokens(json, '', format);
  return { meta: {}, tokens };
}

/**
 * Generate a CSS string from a parsed theme.
 *
 * @param {object} meta    Theme metadata (name, version, author)
 * @param {Record<string, string>} tokens  Flat key→value map
 * @param {string} [nameOverride]  Override the theme name used in [data-theme]
 * @returns {string}  Full CSS content
 */
function generateCSS(meta, tokens, nameOverride) {
  const displayName = nameOverride || meta.name || 'custom';
  const safeName    = displayName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const entries = Object.entries(tokens);
  if (entries.length === 0) {
    throw new Error('Theme has no tokens — nothing to generate.');
  }

  const cssVars = entries
    .map(([key, value]) => `    ${tokenKeyToCssVar(key)}: ${value};`)
    .join('\n');

  const headerLines = [
    '/* Generated by ai-css-kit theme-map — do not edit */',
  ];
  if (meta.name)    headerLines.push(`/* Theme:   ${meta.name} */`);
  if (meta.version) headerLines.push(`/* Version: ${meta.version} */`);
  if (meta.author)  headerLines.push(`/* Author:  ${meta.author} */`);

  return `${headerLines.join('\n')}

@layer ai-kit.themes {
  [data-theme="${safeName}"] {
${cssVars}
  }
}
`;
}

/* --------------------------------------------------------------------------
   Exports
   -------------------------------------------------------------------------- */

module.exports = {
  tokenKeyToCssVar,
  detectFormat,
  hasLeafKey,
  flattenTokens,
  parseTheme,
  generateCSS,
};

/* --------------------------------------------------------------------------
   CLI entry point
   -------------------------------------------------------------------------- */

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log([
      'Usage:',
      '  node scripts/theme-map.js <theme.json> [-o <output.css>] [--name <theme-name>]',
      '',
      'Options:',
      '  -o <file>       Write output to file (default: stdout)',
      '  --name <name>   Override theme name used in [data-theme="..."]',
      '',
      'Formats supported:',
      '  Native        { "meta": {...}, "tokens": { "color.primary": "#..." } }',
      '  W3C DTCG      { "color": { "primary": { "$value": "#...", "$type": "color" } } }',
      '  Figma Tokens  { "color": { "primary": { "value": "#...", "type": "color" } } }',
    ].join('\n'));
    process.exit(0);
  }

  const inputFile = args[0];
  let outputFile  = null;
  let nameOverride = null;

  for (let i = 1; i < args.length; i++) {
    if ((args[i] === '-o' || args[i] === '--output') && args[i + 1]) {
      outputFile = args[++i];
    } else if (args[i] === '--name' && args[i + 1]) {
      nameOverride = args[++i];
    }
  }

  try {
    const raw  = fs.readFileSync(inputFile, 'utf8');
    const json = JSON.parse(raw);
    const { meta, tokens } = parseTheme(json);
    const css  = generateCSS(meta, tokens, nameOverride);

    if (outputFile) {
      fs.mkdirSync(path.dirname(path.resolve(outputFile)), { recursive: true });
      fs.writeFileSync(outputFile, css, 'utf8');
      console.log(`Generated: ${outputFile}`);
    } else {
      process.stdout.write(css);
    }
  } catch (err) {
    console.error('theme-map error:', err.message);
    process.exit(1);
  }
}
