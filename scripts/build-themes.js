/**
 * build-themes.js — Build all preset theme CSS files from src/themes/*.json
 *
 * Reads every JSON file in src/themes/, runs it through theme-map, and writes
 * the resulting CSS to dist/themes/<name>.css.
 *
 * Usage:
 *   node scripts/build-themes.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const { parseTheme, generateCSS } = require('./theme-map');

const rootDir   = path.resolve(__dirname, '..');
const srcDir    = path.join(rootDir, 'src', 'themes');
const distDir   = path.join(rootDir, 'dist', 'themes');

async function run() {
  // Ensure output directory exists
  fs.mkdirSync(distDir, { recursive: true });

  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.json'));

  if (files.length === 0) {
    console.warn('No theme JSON files found in', srcDir);
    return;
  }

  let built = 0;

  for (const file of files) {
    const srcPath  = path.join(srcDir, file);
    const baseName = path.basename(file, '.json');
    const destPath = path.join(distDir, baseName + '.css');

    try {
      const raw    = fs.readFileSync(srcPath, 'utf8');
      const json   = JSON.parse(raw);
      const { meta, tokens } = parseTheme(json);
      const css    = generateCSS(meta, tokens);

      fs.writeFileSync(destPath, css, 'utf8');
      console.log(`  Built: dist/themes/${baseName}.css  (${Object.keys(tokens).length} tokens)`);
      built++;
    } catch (err) {
      console.error(`  Error building ${file}:`, err.message);
      process.exitCode = 1;
    }
  }

  console.log(`\nThemes built: ${built}/${files.length}`);
}

run();
