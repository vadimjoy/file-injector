#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(__dirname, '../..');

function readPackageJson() {
  try {
    return JSON.parse(readFileSync(resolve(PKG_ROOT, 'package.json'), 'utf8'));
  } catch {
    return { version: '0.0.5', name: 'ai-css-kit' };
  }
}

const pkg = readPackageJson();
const program = new Command();

program
  .name('ai-css-kit')
  .description('AI-first CSS component toolkit CLI — generate standards-compliant UI from natural language')
  .version(pkg.version);

program
  .command('generate')
  .description('Generate UI component HTML from natural language')
  .arguments('<prompt...>', 'Natural language description of the UI to generate')
  .option('-t, --theme <theme>', 'Theme preset', 'default')
  .option('-o, --output <file>', 'Output file (default: stdout)')
  .option('-f, --format <format>', 'Output format: html|json|snippet', 'html')
  .option('-p, --provider <provider>', 'LLM provider: openai|anthropic|ollama', 'openai')
  .option('-m, --model <model>', 'Model name')
  .option('--no-validate', 'Skip validation')
  .option('--temperature <n>', 'Temperature', parseFloat, 0.1)
  .option('--max-tokens <n>', 'Max tokens', parseInt, 2048)
  .action(async (prompt, opts) => {
    const { generateCommand } = await import('../src/commands/generate.js');
    await generateCommand(prompt.join(' '), opts);
  });

program
  .command('validate')
  .description('Validate generated HTML against Module Contract')
  .arguments('<file>', 'HTML file to validate')
  .option('--fail-on <severity>', 'Fail on severity: error|warning', 'error')
  .option('--rules <rules>', 'Rule overrides as JSON')
  .action(async (file, opts) => {
    const { validateCommand } = await import('../src/commands/validate.js');
    await validateCommand(file, opts);
  });

program
  .command('context')
  .description('Context utilities')
  .action(() => program.help());

program
  .command('context dump')
  .description('Output AI_CONTEXT.md to stdout')
  .action(async () => {
    const { loadAIContext } = await import('../src/context/loader.js');
    console.log(loadAIContext());
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(`Fatal: ${err.message}`);
  process.exit(err.exitCode ?? 1);
});