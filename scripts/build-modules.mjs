#!/usr/bin/env node
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import postcss from 'postcss';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const postcssConfig = require('../postcss.config.cjs');

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src', 'css');
const distDir = path.join(rootDir, 'dist');

const TOP_LEVEL_FILES = ['tokens.css', 'base.css', 'states.css'];

async function collectFiles() {
  const files = TOP_LEVEL_FILES.map((filename) => ({
    src: path.join(srcDir, filename),
    dest: path.join(distDir, filename)
  }));

  const componentsDir = path.join(srcDir, 'components');
  const entries = await fs.readdir(componentsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.css')) {
      files.push({
        src: path.join(componentsDir, entry.name),
        dest: path.join(distDir, 'components', entry.name)
      });
    }
  }

  return files;
}

async function buildFile({ src, dest }) {
  const css = await fs.readFile(src, 'utf8');
  const result = await postcss(postcssConfig.plugins).process(css, {
    from: src,
    to: dest
  });

  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, result.css, 'utf8');
}

async function run() {
  const files = await collectFiles();
  await Promise.all(files.map(buildFile));
  console.log(`Built ${files.length} modular CSS files`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});