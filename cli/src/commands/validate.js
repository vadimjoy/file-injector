import { readFileSync } from 'node:fs';
import { validate } from '../pipeline/validator.js';

export async function validateCommand(file, opts = {}) {
  try {
    const content = readFileSync(file, 'utf8');

    const config = {};
    if (opts.failOn) {
      config.failOn = opts.failOn;
    }
    if (opts.rules) {
      try {
        config.rules = JSON.parse(opts.rules);
      } catch {
        console.error(`[ai-css-kit] Error: Invalid JSON in --rules`);
        process.exit(2);
      }
    }

    const result = validate(content, config);

    if (result.errors.length > 0) {
      console.error(`\nValidation FAILED — ${result.errors.length} error(s):\n`);
      result.errors.forEach(e => {
        console.error(`  ERROR: ${e.code}`);
        console.error(`    ${e.message}`);
        if (e.element) console.error(`    Element: ${e.element.slice(0, 100)}`);
        if (e.suggestion) console.error(`    Fix: ${e.suggestion}`);
        console.error('');
      });
    }

    if (result.warnings.length > 0) {
      console.error(`\nWarnings — ${result.warnings.length}:\n`);
      result.warnings.forEach(w => {
        console.error(`  WARNING: ${w.code}`);
        console.error(`    ${w.message}`);
        console.error('');
      });
    }

    if (result.errors.length === 0 && result.warnings.length === 0) {
      console.error(`\n✓ Validation passed — no issues found`);
    }

    console.error(`\nStats: ${result.stats.componentsChecked} components, ${result.stats.rulesChecked} rules checked in ${result.stats.durationMs}ms`);

    const failOn = opts.failOn ?? 'error';
    if (failOn === 'error' && result.errors.length > 0) {
      process.exit(1);
    }
    if (failOn === 'warning' && (result.errors.length > 0 || result.warnings.length > 0)) {
      process.exit(1);
    }

  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(`[ai-css-kit] Error: File not found: ${file}`);
      process.exit(2);
    }
    console.error(`[ai-css-kit] Error: ${err.message}`);
    process.exit(1);
  }
}