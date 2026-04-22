# AI CSS Kit — CLI Guide

> **Language:** English | [Русский](../ru/cli.md)

> **Version:** v0.8.0  
> **Related ADR:** [ADR-0005 CLI Agent Architecture](../adr/0005-cli-agent-architecture.md)  
> **Architecture spec:** [Phase 4.1 CLI Architecture](../design/phase-4.1-cli-architecture.md)

---

## Overview

The AI CSS Kit CLI generates standards-compliant HTML markup from natural language descriptions. It transforms prompts like `"registration form with email, password and submit button"` into production-ready HTML using ai-css-kit component classes.

```
npm install ai-css-kit
npx ai-css-kit generate "primary large button"
```

**Key design principle:** 3 of 4 pipeline stages are fully deterministic and unit-testable. Only the Intent Parser requires an LLM call.

---

## Installation

### As a local dependency

```bash
npm install ai-css-kit --save-dev
```

### As a global CLI

```bash
npm install -g ai-css-kit
```

### Via npx (no install)

```bash
npx ai-css-kit generate "search input with icon"
```

---

## Quick Start

```bash
# Set your API key
export OPENAI_API_KEY=sk-...

# Generate a component
npx ai-css-kit generate "primary button"

# Generate a form
npx ai-css-kit generate "login form with email and password fields"

# Save to file
npx ai-css-kit generate "card with title and description" -o card.html

# Use a different provider
npx ai-css-kit generate "badge with success state" -p anthropic
```

---

## Commands

### `generate`

Generates HTML markup from natural language.

```bash
ai-css-kit generate [options] <prompt...>
```

**Arguments:**

| Argument | Description |
|----------|-------------|
| `<prompt...>` | Natural language description (space-separated, quoted if multi-word) |

**Options:**

| Flag | Default | Description |
|------|---------|-------------|
| `-t, --theme <name>` | `default` | Theme preset: `default`, `dark`, `midnight`, `corporate`, `warm` |
| `-o, --output <file>` | stdout | Output file path |
| `-f, --format <format>` | `html` | Output format: `html`, `json`, `snippet` |
| `-p, --provider <name>` | `openai` | LLM provider: `openai`, `anthropic`, `ollama` |
| `-m, --model <model>` | provider default | Model name |
| `--no-validate` | — | Skip validation step |
| `--temperature <n>` | `0.1` | LLM temperature (0–2) |
| `--max-tokens <n>` | `2048` | Max response tokens |

**Examples:**

```bash
# Basic usage
ai-css-kit generate "primary button"

# Form generation
ai-css-kit generate "registration form: name, email, password with labels"

# With theme
ai-css-kit generate "alert with warning message" --theme midnight

# Output to file
ai-css-kit generate "card component" -o card.html

# JSON output (structured data)
ai-css-kit generate "toggle switch" -f json

# Different provider
ai-css-kit generate "input with error state" -p ollama
```

---

### `validate`

Validates an HTML file against the Module Contract rules.

```bash
ai-css-kit validate [options] <file>
```

**Arguments:**

| Argument | Description |
|----------|-------------|
| `<file>` | HTML file to validate |

**Options:**

| Flag | Default | Description |
|------|---------|-------------|
| `--fail-on <severity>` | `error` | Fail on: `error`, `warning` |
| `--rules <json>` | `{}` | Rule severity overrides as JSON |

**Examples:**

```bash
# Basic validation
ai-css-kit validate output.html

# Fail on warnings too
ai-css-kit validate output.html --fail-on warning

# With rule overrides
ai-css-kit validate output.html --rules '{"MISSING_LABEL":"warning"}'
```

**Exit codes:**

| Code | Meaning |
|------|---------|
| `0` | Validation passed |
| `1` | Validation failed (errors or matching fail-on level) |
| `2` | File not found or invalid arguments |

---

### `context`

Utilities for the AI context system.

#### `context dump`

Outputs `AI_CONTEXT.md` to stdout. Useful for debugging or reviewing what context the LLM receives.

```bash
ai-css-kit context dump
```

---

## Configuration

### Config file (`.ai-css-kit.config.js`)

Create in your project root or home directory:

```js
// .ai-css-kit.config.js
export default {
  provider: {
    provider: 'openai',
    model: 'gpt-4o',
    apiKey: process.env.OPENAI_API_KEY,
  },
  generate: {
    defaultTheme: 'default',
    defaultSize: 'md',
    defaultLayout: 'form',
    maxTokens: 2048,
    temperature: 0.1,
    validate: true,
  },
};
```

### Environment variables

| Variable | Maps to | Provider |
|----------|---------|---------|
| `OPENAI_API_KEY` | `config.provider.apiKey` | openai |
| `ANTHROPIC_API_KEY` | `config.provider.apiKey` | anthropic |
| `AI_CSS_KIT_PROVIDER` | `config.provider.provider` | all |
| `AI_CSS_KIT_MODEL` | `config.provider.model` | all |
| `AI_CSS_KIT_BASE_URL` | `config.provider.baseUrl` | all |
| `OLLAMA_BASE_URL` | `config.ollama.baseUrl` | ollama |
| `AI_CSS_KIT_TEMPERATURE` | `config.generate.temperature` | all |
| `AI_CSS_KIT_MAX_TOKENS` | `config.generate.maxTokens` | all |

### Config priority (last wins)

```
Defaults (hardcoded)
  ← .ai-css-kit.config.js (searched upward from CWD)
    ← Environment variables
      ← CLI flags
```

---

## LLM Providers

### OpenAI (default)

Requires `OPENAI_API_KEY` environment variable.

```bash
export OPENAI_API_KEY=sk-...
ai-css-kit generate "button"
```

Default model: `gpt-4o`.

### Anthropic

Requires `ANTHROPIC_API_KEY` environment variable.

```bash
export ANTHROPIC_API_KEY=sk-ant-...
ai-css-kit generate "input field" -p anthropic
```

Default model: `claude-3-5-sonnet-latest`.

### Ollama (local)

Runs locally without an API key. Requires Ollama running on `localhost:11434`.

```bash
ollama serve  # in another terminal
ai-css-kit generate "badge" -p ollama
```

Default model: `llama3`. Override with `--model`:

```bash
ai-css-kit generate "toggle" -p ollama -m codellama
```

### OpenAI-compatible providers

Any API that speaks the OpenAI Chat Completions protocol (Groq, LM Studio, Together AI, Azure OpenAI, etc.).

```js
// .ai-css-kit.config.js
export default {
  provider: {
    provider: 'openai-compatible',
    model: 'mixtral-8x7b-32768',
    apiKey: process.env.GROQ_API_KEY,
    baseUrl: 'https://api.groq.com/openai/v1',
  },
};
```

```bash
ai-css-kit generate "form" -p openai-compatible
```

---

## Output Formats

### `html` (default)

Full HTML document with appropriate wrapper:

```bash
ai-css-kit generate "button" -f html
```

```html
<!-- Theme: default -->
<div class="ui-field ui-field--md">
  <button class="ui-button ui-button--primary ui-button--md">Submit</button>
</div>
```

### `snippet`

Just the component markup, no wrapper:

```bash
ai-css-kit generate "input" -f snippet
```

```html
<input type="text" class="ui-input ui-input--md" id="input-1">
```

### `json`

Structured output for programmatic use:

```bash
ai-css-kit generate "button" -f json
```

```json
{
  "intent": {
    "layout": "form",
    "container": "none",
    "theme": "default",
    "components": [...]
  },
  "atoms": [...],
  "layout": {
    "html": "...",
    "requiredTheme": "default",
    "meta": { "componentCount": 1, "layoutType": "form" }
  },
  "validation": {
    "valid": true,
    "errors": [],
    "warnings": [],
    "stats": { "componentsChecked": 1, "rulesChecked": 7, "durationMs": 1 }
  }
}
```

---

## Validation Rules

The validator checks generated HTML against Module Contract rules:

| Rule Code | Severity | Description |
|-----------|----------|-------------|
| `FIELD_WRAPPER` | error | Form elements must be inside `.ui-field` |
| `LABEL_PRESENCE` | error | `.ui-field` must contain `.ui-label` |
| `FIELD_SIZE_MODIFIER` | error | `.ui-field` must have size modifier (--sm/--md/--lg) |
| `NO_PARENT_MUTATION` | error | No cross-component parent selectors |
| `BUTTON_VARIANT` | error | Button must have variant: primary, secondary, or ghost |
| `VALID_THEME` | error | `data-theme` value must match known presets |
| `VALID_MODIFIERS` | warning | Only registered modifier classes used |

---

## Pipeline Architecture

```
User Input (CLI prompt)
         │
         ▼
┌─────────────────────────────────┐
│      Config Loader              │
│  .ai-css-kit.config.js + env   │
└────────────────┬────────────────┘
                 │
         ┌───────▼───────┐
         │ Context Loader│
         │ AI_CONTEXT.md │
         └───────┬───────┘
                 │
        ╔════════▼════════╗
        ║  Intent Parser  ║  ← LLM call (OpenAI / Anthropic / Ollama)
        ╚════════╤════════╝
                 │
          ParsedIntent
                 │
        ┌────────▼────────┐
        │Component Resolver│  ← pure deterministic, no LLM
        └────────┬────────┘
                 │
         ResolvedAtom[]
                 │
        ┌────────▼────────┐
        │ Layout Composer │  ← pure deterministic, no LLM
        └────────┬────────┘
                 │
          ComposedLayout
                 │
        ┌────────▼────────┐
        │    Validator    │  ← pure deterministic, no LLM
        └────────┬────────┘
                 │
          ValidationReport
```

---

## Programmatic API

```js
import { generate, validate } from 'ai-css-kit/cli';

const result = await generate('primary button', {
  provider: 'openai',
  theme: 'dark',
  format: 'html',
});

console.log(result.layout.html);

const report = await validate('<button class="ui-button">Click</button>');
console.log(report.valid);
```

### `generate(prompt, options)`

| Option | Type | Description |
|--------|------|-------------|
| `provider` | `string` | Provider name |
| `model` | `string` | Model name |
| `theme` | `string` | Theme preset |
| `format` | `string` | Output format |
| `validate` | `boolean` | Run validation |
| `temperature` | `number` | LLM temperature |
| `maxTokens` | `number` | Max tokens |

### `validate(html, options)`

| Option | Type | Description |
|--------|------|-------------|
| `failOn` | `string` | Fail on severity |
| `rules` | `object` | Rule overrides |

---

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | General / unhandled error |
| `2` | Invalid CLI arguments or config |
| `3` | Provider error (auth, network, timeout) |
| `4` | Validation failed |

---

## Troubleshooting

### "Provider requires an API key"

Set the appropriate environment variable:

```bash
# OpenAI
export OPENAI_API_KEY=sk-...

# Anthropic
export ANTHROPIC_API_KEY=sk-ant-...
```

Or configure in `.ai-css-kit.config.js`:

```js
export default {
  provider: {
    apiKey: 'your-key-here',
  },
};
```

### Ollama connection refused

Ensure Ollama is running:

```bash
ollama serve
# In another terminal:
ai-css-kit generate "button" -p ollama
```

### Validation errors in output

The CLI includes an integrated validator. If validation fails:

1. Check the error messages for specific rule violations
2. Use `--no-validate` to skip validation if needed
3. Review [AI_CONTEXT.md](../../AI_CONTEXT.md) for proper component usage

---

## See Also

- [SPEC.md](SPEC.md) — Component specification
- [theming.md](theming.md) — Theming and token system
- [AI_CONTEXT.md](../../AI_CONTEXT.md) — AI agent context
- [ADR-0005](../adr/0005-cli-agent-architecture.md) — CLI architecture ADR
- [Phase 4.1 CLI Architecture](../design/phase-4.1-cli-architecture.md) — Full technical spec
