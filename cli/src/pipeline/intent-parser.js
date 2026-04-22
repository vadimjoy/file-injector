import { IntentParseError } from '../providers/base.js';

const SYSTEM_PROMPT_TEMPLATE = `{aiContext}

## Your Role
You are a structured UI intent extractor for ai-css-kit.
Parse the user's natural language description and return ONLY a JSON object.

## Output Schema
{
  "layout":    "form" | "card" | "page" | "section" | "list" | "inline",
  "container": "card" | "section" | "none",
  "theme":     "default" | "dark" | "midnight" | "corporate" | "warm",
  "title":     string | null,
  "description": string | null,
  "submitLabel": string | null,
  "accessibility": {
    "lang": "en",
    "formRole": "form" | "search" | "none",
    "headingLevel": 1 | 2 | 3
  },
  "components": [
    {
      "id":              "input-1",
      "type":            "input" | "textarea" | "select" | "checkbox" | "radio" | "toggle" | "slider" | "file-upload" | "button" | "badge" | "card" | "progress" | "autocomplete" | "datepicker" | "tooltip",
      "size":            "sm" | "md" | "lg",
      "variant":         string | null,
      "label":           string | null,
      "placeholder":     string | null,
      "required":        boolean,
      "disabled":        boolean,
      "text":            string | null,
      "contextModifiers": string[],
      "validationState": null | "error" | "success" | "warning",
      "options":         Array<{value: string, label: string, selected?: boolean, disabled?: boolean}> | null,
      "helperText":      string | null,
      "position":        number
    }
  ]
}

## Rules
R-01  Use ONLY component types from the Component Registry.
R-02  Every form element MUST have a non-empty label.
R-03  Every <select> MUST include at least one option with value="" (placeholder).
R-04  Button variant MUST be one of: primary | secondary | ghost. Default: primary.
R-05  When the user says "required", set required: true on the relevant field.
R-06  Use "md" size for all components unless the user specifies size.
R-07  Auto-generate a submit button at position=99 if layout is "form" and no button exists.
R-08  IDs follow the pattern: {type}-{1-based-index} (e.g. input-1, button-1).
R-09  Set validationState to null unless user explicitly mentions error/success/warning.
R-10  Return ONLY valid JSON. No markdown, no commentary, no code blocks.
R-11  When user says "search", use input with contextModifiers: ["search"] and layout: "form".
R-12  When user mentions "modal" or "dialog", use card container with appropriate content.
`;

export async function parseIntent(prompt, aiContext, provider, options = {}) {
  const { temperature = 0.1, maxTokens = 2048 } = options;

  const systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace('{aiContext}', aiContext);

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: prompt },
  ];

  let result;
  try {
    result = await provider.complete(messages, {
      temperature,
      maxTokens,
      responseFormat: provider.capabilities.supportsJsonMode ? 'json' : undefined,
    });
  } catch (err) {
    throw new IntentParseError(`LLM call failed: ${err.message}`, { cause: err });
  }

  let intent;
  try {
    const content = result.content.trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      intent = JSON.parse(jsonMatch[0]);
    } else {
      intent = JSON.parse(content);
    }
  } catch (err) {
    throw new IntentParseError(
      `LLM returned non-JSON response`,
      { raw: result.content, cause: err }
    );
  }

  intent.rawPrompt = prompt;

  const schemaErrors = validateIntentSchema(intent);
  if (schemaErrors.length > 0) {
    throw new IntentParseError(
      `ParsedIntent failed schema validation: ${schemaErrors[0]}`,
      { schemaErrors, intent }
    );
  }

  return normalizeIntent(intent);
}

function validateIntentSchema(intent) {
  const errors = [];

  if (!intent) {
    errors.push('Intent is null or undefined');
    return errors;
  }

  const validLayouts = ['form', 'card', 'page', 'section', 'list', 'inline'];
  if (intent.layout && !validLayouts.includes(intent.layout)) {
    errors.push(`Invalid layout: "${intent.layout}". Must be one of: ${validLayouts.join(', ')}`);
  }

  const validContainers = ['card', 'section', 'none'];
  if (intent.container && !validContainers.includes(intent.container)) {
    errors.push(`Invalid container: "${intent.container}". Must be one of: ${validContainers.join(', ')}`);
  }

  const validThemes = ['default', 'dark', 'midnight', 'corporate', 'warm'];
  if (intent.theme && !validThemes.includes(intent.theme)) {
    errors.push(`Invalid theme: "${intent.theme}". Must be one of: ${validThemes.join(', ')}`);
  }

  if (!Array.isArray(intent.components)) {
    errors.push('components must be an array');
    return errors;
  }

  const validTypes = [
    'input', 'textarea', 'select', 'checkbox', 'radio', 'toggle',
    'slider', 'file-upload', 'button', 'badge', 'card', 'progress',
    'autocomplete', 'datepicker', 'tooltip'
  ];

  const seen = new Map();

  for (let i = 0; i < intent.components.length; i++) {
    const comp = intent.components[i];
    if (!comp || typeof comp !== 'object') {
      errors.push(`Component at index ${i} is invalid`);
      continue;
    }

    if (!comp.type || !validTypes.includes(comp.type)) {
      errors.push(`Invalid component type at index ${i}: "${comp.type}". Must be one of: ${validTypes.join(', ')}`);
    }

    if (comp.size && !['sm', 'md', 'lg'].includes(comp.size)) {
      errors.push(`Invalid size at index ${i}: "${comp.size}"`);
    }

    const count = (seen.get(comp.type) ?? 0) + 1;
    seen.set(comp.type, count);
  }

  return errors;
}

function normalizeIntent(intent) {
  const seen = new Map();

  intent.components = (intent.components ?? []).map((spec, idx) => {
    const base = spec.id ?? `${spec.type}-1`;
    const count = (seen.get(spec.type) ?? 0) + 1;
    seen.set(spec.type, count);

    return {
      ...spec,
      id: spec.id ?? `${spec.type}-${count}`,
      type: spec.type,
      size: spec.size ?? 'md',
      position: spec.position ?? idx,
      contextModifiers: spec.contextModifiers ?? [],
      validationState: spec.validationState ?? null,
      required: spec.required ?? false,
      disabled: spec.disabled ?? false,
    };
  });

  const hasButton = intent.components.some(c => c.type === 'button');
  if (intent.layout === 'form' && !hasButton) {
    const maxPos = Math.max(0, ...intent.components.map(c => c.position ?? 0));
    intent.components.push({
      id: `button-1`,
      type: 'button',
      text: intent.submitLabel ?? 'Submit',
      variant: 'primary',
      size: 'md',
      position: maxPos + 1,
      contextModifiers: [],
      required: false,
      disabled: false,
    });
  }

  intent.components.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  return intent;
}