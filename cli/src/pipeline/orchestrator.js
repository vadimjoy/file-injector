import { parseIntent } from './intent-parser.js';
import { resolveComponents } from './component-resolver.js';
import { composeLayout } from './layout-composer.js';
import { validate } from './validator.js';
import { loadContextForIntent } from '../context/loader.js';

export async function runPipeline(prompt, provider, config) {
  const aiContext = loadContextForIntent();

  const intent = await parseIntent(prompt, aiContext, provider, {
    temperature: config.generate?.temperature ?? 0.1,
    maxTokens: config.generate?.maxTokens ?? 2048,
  });

  const atoms = resolveComponents(intent);

  const layout = composeLayout(intent, atoms);

  let validationResult = null;
  if (config.generate?.validate !== false) {
    validationResult = validate(layout.html);
    if (!validationResult.valid && config.validate?.failOn === 'error') {
      throw Object.assign(new Error('Validation failed'), {
        name: 'ValidationError',
        exitCode: 4,
        validationResult,
      });
    }
  }

  return {
    intent,
    atoms,
    layout,
    validation: validationResult,
  };
}