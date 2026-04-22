import { createProvider } from '../providers/factory.js';
import { loadConfig } from '../config/loader.js';
import { runPipeline } from '../pipeline/orchestrator.js';

export async function generateCommand(prompt, opts = {}) {
  try {
    const config = await loadConfig({
      provider: opts.provider,
      model: opts.model,
      theme: opts.theme,
      format: opts.format,
      validate: opts.validate,
      temperature: opts.temperature,
      maxTokens: opts.maxTokens,
      output: opts.output,
    });

    const provider = createProvider(config);

    console.error(`[ai-css-kit] Using provider: ${provider.name} (${provider.model})`);

    const result = await runPipeline(prompt, provider, config);

    let output = result.layout.html;

    if (result.layout.requiredTheme !== 'default') {
      const themeComment = `<!-- Theme: ${result.layout.requiredTheme} -->`;
      output = `${themeComment}\n${output}`;
    }

    if (opts.output) {
      const { writeFileSync } = await import('node:fs');
      writeFileSync(opts.output, output, 'utf8');
      console.error(`[ai-css-kit] Written to ${opts.output}`);
    } else {
      console.log(output);
    }

    if (result.validation) {
      if (result.validation.errors.length > 0) {
        console.error(`\n[ai-css-kit] Validation errors (${result.validation.errors.length}):`);
        result.validation.errors.forEach(e => {
          console.error(`  ${e.severity.toUpperCase()}: ${e.code} — ${e.message}`);
          if (e.suggestion) console.error(`    → ${e.suggestion}`);
        });
      }
      if (result.validation.warnings.length > 0) {
        console.error(`\n[ai-css-kit] Warnings (${result.validation.warnings.length}):`);
        result.validation.warnings.forEach(w => {
          console.error(`  ${w.severity.toUpperCase()}: ${w.code} — ${w.message}`);
        });
      }
      console.error(`\n[ai-css-kit] Stats: ${result.validation.stats.componentsChecked} components, ${result.validation.stats.rulesChecked} rules checked in ${result.validation.stats.durationMs}ms`);
    }

    if (result.validation && !result.validation.valid && config.validate?.failOn === 'error') {
      throw Object.assign(new Error('Validation failed'), {
        name: 'ValidationError',
        exitCode: 4,
        validation: result.validation,
      });
    }

  } catch (err) {
    if (err.context?.raw) {
      console.error('\nLLM raw response:');
      console.error(err.context.raw.slice(0, 500));
    }
    throw err;
  }
}