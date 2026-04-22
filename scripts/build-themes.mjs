#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tokenKeyToCssVar, detectFormat, flattenTokens, parseTheme, generateCSS } from './theme-map.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rootDir   = path.resolve(__dirname, '..');
const srcDir    = path.join(rootDir, 'src', 'themes');
const distDir   = path.join(rootDir, 'dist', 'themes');

async function run() {
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