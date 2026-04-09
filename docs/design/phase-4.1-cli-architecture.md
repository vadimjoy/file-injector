# Phase 4.1 — CLI Architecture: Core & API Communication

**Roadmap target:** v0.8.0  
**Author:** vadimjoy  
**Date:** 2026-04-09  
**Status:** Draft  
**Related ADR:** [ADR-0005](../adr/0005-cli-agent-architecture.md)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Module Structure](#3-module-structure)
4. [Data Contracts](#4-data-contracts)
5. [Core Module Specifications](#5-core-module-specifications)
   - 5.1 [Entry Point & Command Router](#51-entry-point--command-router)
   - 5.2 [Config Loader](#52-config-loader)
   - 5.3 [Context Loader](#53-context-loader)
   - 5.4 [Intent Parser](#54-intent-parser)
   - 5.5 [Component Resolver](#55-component-resolver)
   - 5.6 [Layout Composer](#56-layout-composer)
   - 5.7 [Validator](#57-validator)
   - 5.8 [Provider Abstraction Layer](#58-provider-abstraction-layer)
   - 5.9 [Output Formatter & Writer](#59-output-formatter--writer)
6. [API Communication Logic](#6-api-communication-logic)
   - 6.1 [OpenAI](#61-openai)
   - 6.2 [Anthropic](#62-anthropic)
   - 6.3 [Ollama (local)](#63-ollama-local)
   - 6.4 [Retry & Error Strategy](#64-retry--error-strategy)
7. [CLI UX Reference](#7-cli-ux-reference)
8. [Configuration Reference](#8-configuration-reference)
9. [Sequence Diagrams](#9-sequence-diagrams)
10. [Validation Rule Catalogue](#10-validation-rule-catalogue)
11. [Testing Strategy](#11-testing-strategy)
12. [Non-Functional Requirements](#12-non-functional-requirements)
13. [Open Questions](#13-open-questions)

---

## 1. Executive Summary

Phase 4.1 introduces the **ai-css-kit CLI** — a Node.js command-line tool that accepts a natural-language UI description and produces standards-compliant HTML using ai-css-kit components.

The key architectural constraint is **split responsibility**:

| Stage | LLM involved? | Deterministic? | Testable without LLM? |
|-------|:---:|:---:|:---:|
| Intent Parser | Yes | No (probabilistic) | No (needs mock/fixture) |
| Component Resolver | **No** | **Yes** | **Yes (100%)** |
| Layout Composer | **No** | **Yes** | **Yes (100%)** |
| Validator | **No** | **Yes** | **Yes (100%)** |

This split guarantees that 3 out of 4 pipeline stages are fully unit-testable, and that the LLM boundary is a single, isolated interface.

The CLI integrates with three LLM providers — OpenAI, Anthropic, and Ollama — through a common provider abstraction. All API calls use Node.js built-in `fetch` (Node ≥ 18), with no heavy SDK dependencies.

---

## 2. Architecture Overview

### 2.1 High-Level Pipeline

```
User Input (CLI prompt)
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                        CLI Entry Point                       │
│   bin/ai-css-kit.js  →  command router (commander)          │
└────────────────────────────┬────────────────────────────────┘
                             │
              ┌──────────────▼──────────────┐
              │       Config Loader          │
              │  .ai-css-kit.config.js + env │
              └──────────────┬──────────────┘
                             │
              ┌──────────────▼──────────────┐
              │       Context Loader         │
              │  AI_CONTEXT.md → system prompt│
              └──────────────┬──────────────┘
                             │
                    ╔════════▼════════╗
                    ║  Intent Parser  ║  ← LLM call (OpenAI / Anthropic / Ollama)
                    ║                 ║    system prompt = AI_CONTEXT.md
                    ╚════════╤════════╝    user message  = natural language prompt
                             │
                      ParsedIntent (JSON)
                             │
                    ┌────────▼────────┐
                    │Component Resolver│  ← pure deterministic, no LLM
                    │ (per-component   │    maps ComponentSpec → HTML atom
                    │  template fns)   │
                    └────────┬────────┘
                             │
                      ResolvedAtom[]
                             │
                    ┌────────▼────────┐
                    │ Layout Composer  │  ← pure deterministic, no LLM
                    │                  │    assembles atoms into layout
                    └────────┬────────┘
                             │
                      ComposedLayout (HTML string)
                             │
                    ┌────────▼────────┐
                    │    Validator     │  ← pure deterministic, no LLM
                    │                  │    checks against Module Contract
                    └────────┬────────┘
                             │
                      ValidationReport
                             │
                    ┌────────▼────────┐
                    │ Output Formatter │  ← html | json | snippet
                    │    + Writer      │    stdout | file
                    └─────────────────┘
```

### 2.2 Provider Abstraction

```
         ┌──────────────────────────────────────────┐
         │             LLMProvider (base)             │
         │  complete(messages, opts): CompletionResult│
         │  stream(messages, opts):  AsyncGenerator   │
         │  ping():                  void             │
         │  get capabilities():      ProviderCaps     │  ← NEW
         └────────────────┬─────────────────────────┘
                          │  extends
       ┌──────────┬────────┼───────────┬────────────────────┐
       ▼          ▼        ▼           ▼                    ▼
 OpenAI    Anthropic    Ollama    OpenAICompatible      Custom*
 Provider  Provider    Provider     Provider           Provider
    │         │           │              │
    │         │           │      (Groq, Mistral,      * registered via
    │         │           │       LM Studio,          registerProvider()
    │         │           │       Azure OpenAI,       in config file
    │         │           │       Together AI, ...)
```

**`OpenAICompatibleProvider`** is a subclass of `OpenAIProvider` that requires a mandatory `baseUrl` config field and exposes configurable capabilities. It covers any API that speaks the OpenAI Chat Completions protocol — no new adapter class needed per provider.

**`registerProvider(name, Class)`** is a factory-level function exported from `src/providers/factory.js`. Users call it from their `.ai-css-kit.config.js` to add custom providers without forking the package.

### 2.3 Dependency Map (runtime)

```
bin/ai-css-kit.js
  └── commander           (CLI argument parsing — only external dep)
      ├── config/loader.js
      │   └── (node:fs, node:path)
      ├── context/loader.js
      │   └── (node:fs, node:path)
      ├── pipeline/orchestrator.js
      │   ├── pipeline/intent-parser.js
      │   │   └── providers/factory.js
      │   │       ├── providers/openai.js   → fetch (node built-in)
      │   │       ├── providers/anthropic.js → fetch
      │   │       └── providers/ollama.js   → fetch
      │   ├── pipeline/component-resolver.js  (zero deps)
      │   ├── pipeline/layout-composer.js     (zero deps)
      │   └── pipeline/validator.js           (zero deps)
      └── output/formatter.js + output/writer.js
```

**Total external runtime dependencies: 1** (`commander`).  
Everything else is Node.js built-ins or project-internal modules.

---

## 3. Module Structure

```
cli/
├── bin/
│   └── ai-css-kit.js              ← #!/usr/bin/env node  (entry point)
│
├── src/
│   ├── index.js                   ← programmatic API (for use as a library)
│   │
│   ├── commands/
│   │   ├── generate.js            ← `generate` command handler
│   │   ├── validate.js            ← `validate` command handler
│   │   ├── theme-map.js           ← thin wrapper around scripts/theme-map.js
│   │   ├── config-init.js         ← `config init` — creates .ai-css-kit.config.js
│   │   └── context-dump.js        ← `context dump` — outputs AI_CONTEXT.md to stdout
│   │
│   ├── pipeline/
│   │   ├── orchestrator.js        ← runs full pipeline, top-level error handling
│   │   ├── intent-parser.js       ← LLM call → ParsedIntent
│   │   ├── component-resolver.js  ← ParsedIntent → ResolvedAtom[]
│   │   ├── layout-composer.js     ← ResolvedAtom[] → ComposedLayout
│   │   └── validator.js           ← HTML string → ValidationReport
│   │
│   ├── providers/
│   │   ├── factory.js             ← createProvider(config) + registerProvider(name, Class)
│   │   ├── base.js                ← abstract LLMProvider class + capabilities getter
│   │   ├── openai.js              ← OpenAI Chat Completions adapter
│   │   ├── anthropic.js           ← Anthropic Messages API adapter
│   │   ├── ollama.js              ← Ollama /api/chat adapter
│   │   └── openai-compatible.js   ← generic adapter for any OpenAI-protocol provider
│   │
│   ├── context/
│   │   ├── loader.js              ← reads AI_CONTEXT.md from package root
│   │   └── registry.js            ← parses Component Registry section as structured data
│   │
│   ├── config/
│   │   └── loader.js              ← merges file config + env vars + CLI flags
│   │
│   ├── output/
│   │   ├── formatter.js           ← ComposedLayout → html | json | snippet string
│   │   └── writer.js              ← writes to file or stdout
│   │
│   └── utils/
│       ├── retry.js               ← exponential backoff with jitter
│       ├── schema-validator.js    ← validates ParsedIntent against JSON schema
│       └── logger.js              ← structured logger (respects --verbose / --quiet)
│
├── templates/
│   └── config.template.js         ← template for `config init` command
│
├── tests/
│   ├── pipeline/
│   │   ├── intent-parser.test.js   ← uses fixture JSON (mocked provider)
│   │   ├── component-resolver.test.js ← pure unit tests, no mocks needed
│   │   ├── layout-composer.test.js    ← pure unit tests, no mocks needed
│   │   └── validator.test.js          ← pure unit tests, no mocks needed
│   ├── providers/
│   │   ├── factory.test.js         ← provider selection + registerProvider() logic
│   │   ├── retry.test.js           ← retry/backoff logic
│   │   ├── openai.test.js          ← HTTP mock (uses MockAgent from undici)
│   │   └── openai-compatible.test.js ← custom baseUrl + capability override tests
│   └── integration/
│       └── generate.test.js        ← end-to-end with mocked LLM provider
│
└── package.json                    ← extends root package.json or standalone
```

---

## 4. Data Contracts

All types are documented using TypeScript-like notation. The implementation is plain JavaScript (Node ≥ 18, ESM).

### 4.1 Primitive types

```typescript
type ComponentType =
  | 'input' | 'textarea' | 'select' | 'checkbox' | 'radio'
  | 'toggle' | 'slider' | 'file-upload' | 'button'
  | 'badge' | 'card' | 'progress' | 'autocomplete'
  | 'datepicker' | 'tooltip';

type SizeVariant        = 'sm' | 'md' | 'lg';
type ButtonVariant      = 'primary' | 'secondary' | 'ghost';
type ValidationState    = 'error' | 'success' | 'warning';
type LayoutType         = 'form' | 'card' | 'page' | 'section' | 'list' | 'inline';
type ContainerType      = 'card' | 'section' | 'none';
type OutputFormat       = 'html' | 'json' | 'snippet';
type ProviderName       = 'openai' | 'anthropic' | 'ollama' | 'openai-compatible' | string;
//                                                                                    ^ allows user-registered custom providers
type IssueSeverity      = 'error' | 'warning' | 'info';
type HeadingLevel       = 1 | 2 | 3;
type FormRole           = 'form' | 'search' | 'none';
```

### 4.2 ComponentSpec

Describes a single UI component as requested by the LLM (Intent Parser output).

```typescript
interface SelectOption {
  value: string;
  label: string;
  selected?: boolean;
  disabled?: boolean;
}

interface ComponentSpec {
  // Required
  id:   string;           // auto-generated: "input-1", "button-1", "select-2"
  type: ComponentType;

  // Layout
  size?:     SizeVariant; // default: 'md'; set on .ui-field wrapper
  position?: number;      // render order, 0-based; absent = preserve array order

  // Variants & modifiers
  variant?:          string;        // button: 'primary'|'secondary'|'ghost'
                                    // input: 'text'|'email'|'password'|'number'|'search'
  contextModifiers?: string[];      // e.g. ['icon-right', 'icon-left', 'readonly']
  validationState?:  ValidationState;

  // Content
  label?:       string;             // text for <label class="ui-label">
  placeholder?: string;
  helperText?:  string;             // text for <span class="ui-helper">
  text?:        string;             // button label, badge text, progress label
  icon?:        string;             // font-awesome class, e.g. 'fa-calendar'

  // State
  required?: boolean;               // adds required + aria-required="true"
  disabled?: boolean;               // adds disabled + aria-disabled="true"
  checked?:  boolean;               // checkbox/radio/toggle initial state
  value?:    string | number;       // initial value

  // Component-specific
  options?: SelectOption[];         // select, radio group
  rows?:    number;                 // textarea
  min?:     number;                 // slider, number input
  max?:     number;                 // slider, number input
  step?:    number;                 // slider, number input
  accept?:  string;                 // file-upload: MIME types
  multiple?: boolean;               // file-upload, select

  // Escape hatch
  attributes?: Record<string, string>; // extra HTML attributes passed verbatim
}
```

### 4.3 ParsedIntent

The complete structured representation of a user prompt, produced by the Intent Parser.

```typescript
interface AccessibilitySpec {
  lang?:         string;       // BCP-47 language tag, default: 'en'
  formRole?:     FormRole;     // <form> role attribute
  headingLevel?: HeadingLevel; // heading level for title (h1/h2/h3)
}

interface ParsedIntent {
  // Layout
  layout:    LayoutType;
  container: ContainerType;

  // Content
  components:   ComponentSpec[];
  theme:        string;          // 'default'|'dark'|'midnight'|'corporate'|'warm'
  title?:       string;          // card/section/form title
  description?: string;          // subtitle or <p> below title
  submitLabel?: string;          // text for submit button (if auto-added)

  // Metadata
  accessibility: AccessibilitySpec;
  rawPrompt:     string;         // original user string (preserved for debugging/logging)
}
```

### 4.4 ResolvedAtom

Output of Component Resolver for a single component.

```typescript
interface ResolvedAtom {
  spec:          ComponentSpec;
  html:          string;                     // the component element HTML
  wrapperHtml?:  string;                     // .ui-field wrapper (when applicable)
  classes:       string[];                   // every class applied (for validator)
  ariaAttributes: Record<string, string>;    // aria-* applied (for validator)
  requires?:     string[];                   // peer atom IDs that must also be present
                                             // (e.g. datepicker calendar panel)
}
```

### 4.5 ComposedLayout

Output of Layout Composer.

```typescript
interface LayoutMeta {
  componentCount: number;
  layoutType:     LayoutType;
  generatedAt:    string;   // ISO 8601 timestamp
  promptHash?:    string;   // SHA-256 of rawPrompt (for cache keying)
}

interface ComposedLayout {
  html:           string;   // complete assembled HTML fragment
  inlineStyles?:  string;   // <style> block with per-instance CSS overrides
  requiredTheme:  string;   // data-theme value user must set on <html>
  meta:           LayoutMeta;
}
```

### 4.6 ValidationReport

Output of Validator.

```typescript
interface ValidationIssue {
  code:        string;          // e.g. "MISSING_FIELD_WRAPPER"
  severity:    IssueSeverity;
  message:     string;          // human-readable description
  element?:    string;          // selector or description of offending element
  suggestion?: string;          // actionable fix instruction
  line?:       number;          // character position in HTML string (best-effort)
}

interface ValidationStats {
  componentsChecked: number;
  rulesChecked:      number;
  durationMs:        number;
}

interface ValidationReport {
  valid:    boolean;            // true iff errors.length === 0
  errors:   ValidationIssue[];
  warnings: ValidationIssue[];
  info:     ValidationIssue[];
  stats:    ValidationStats;
}
```

### 4.7 ProviderCapabilities

Describes what a provider implementation supports. Returned by the `capabilities` getter on every `LLMProvider` instance. Used by the Intent Parser to adapt its request strategy without touching provider-specific code.

```typescript
interface ProviderCapabilities {
  /**
   * Whether the provider supports response_format: json_object (or equivalent).
   * When false, the Intent Parser instructs the LLM via prompt text only ("return only JSON").
   * When true, the API-level JSON constraint is also sent.
   */
  supportsJsonMode: boolean;

  /**
   * Whether the provider supports streaming (Server-Sent Events / chunked response).
   * Required for future --stream flag.
   */
  supportsStreaming: boolean;

  /**
   * Whether an API key is required. false for Ollama and other local providers.
   * Config Loader skips the "missing API key" check when false.
   */
  requiresApiKey: boolean;

  /**
   * Known valid model identifiers for this provider.
   * When provided, Config Loader warns if config.provider.model is not in the list.
   * Optional — providers may omit this for dynamic model lists.
   */
  supportedModels?: string[];

  /**
   * Maximum context window in tokens.
   * Used to warn when the AI_CONTEXT.md system prompt + user prompt exceeds this limit.
   * Optional — omit if unknown.
   */
  maxContextTokens?: number;
}
```

**Built-in capability table:**

| Provider | `supportsJsonMode` | `supportsStreaming` | `requiresApiKey` | `maxContextTokens` |
|----------|--------------------|---------------------|------------------|-------------------|
| `openai` (gpt-4o) | true | true | true | 128 000 |
| `anthropic` (claude-3-5-sonnet) | false* | true | true | 200 000 |
| `ollama` (llama3) | true** | true | false | model-dependent |
| `openai-compatible` | configurable | true | configurable | configurable |

> \* Anthropic does not have a `response_format` field; JSON is enforced via prompt instruction only.  
> \*\* Ollama `format: "json"` is honoured only by models that support it; treated as best-effort.

---

### 4.8 LLM Message types

```typescript
type MessageRole = 'system' | 'user' | 'assistant';

interface Message {
  role:    MessageRole;
  content: string;
}

interface CompletionOptions {
  temperature?:    number;    // default: 0.1
  maxTokens?:      number;    // default: 2048
  responseFormat?: 'json' | 'text'; // if provider supports forced JSON
  stream?:         boolean;         // default: false
}

interface CompletionResult {
  content:  string;
  usage?: {
    promptTokens:     number;
    completionTokens: number;
    totalTokens:      number;
  };
  model:    string;
  provider: ProviderName;
  durationMs: number;
}
```

### 4.9 CLI Configuration

```typescript
interface ProviderConfig {
  provider:          ProviderName;
  model:             string;
  apiKey?:           string;    // read from env if absent; not required when requiresApiKey=false
  baseUrl?:          string;    // override for proxies / local deployments / openai-compatible
  supportsJsonMode?: boolean;   // override capability detection (used with openai-compatible)
  requiresApiKey?:   boolean;   // override capability detection (false for local providers)
  maxContextTokens?: number;    // override context window size for warnings
}

interface GenerateConfig {
  defaultTheme:  string;
  defaultSize:   SizeVariant;
  defaultLayout: LayoutType;
  maxTokens:     number;
  temperature:   number;
  validate:      boolean;
  outputFormat:  OutputFormat;
}

interface ValidateConfig {
  rules:  Record<string, IssueSeverity>; // override default severity per rule code
  failOn: IssueSeverity;                 // 'error' | 'warning'
}

interface OllamaConfig {
  baseUrl: string;
  model:   string;
}

interface CLIConfig {
  provider: ProviderConfig;
  generate: GenerateConfig;
  validate: ValidateConfig;
  ollama:   OllamaConfig;
}
```

---

## 5. Core Module Specifications

### 5.1 Entry Point & Command Router

**File:** `cli/bin/ai-css-kit.js`

```
#!/usr/bin/env node

Responsibilities:
  - Register all commands with commander
  - Parse process.argv
  - Route to the appropriate command handler
  - Handle top-level --help, --version
  - Exit with correct exit code

Exit codes:
  0   Success
  1   General / unhandled error
  2   Invalid CLI arguments
  3   Provider error (auth, network, timeout)
  4   Validation failed (--fail-on-validate)
  5   Intent Parse error (LLM returned invalid JSON after retries)
```

**Command registration pattern:**

```javascript
// bin/ai-css-kit.js
import { Command } from 'commander';
import { generateCommand } from '../src/commands/generate.js';
import { validateCommand } from '../src/commands/validate.js';
import { themeMapCommand } from '../src/commands/theme-map.js';
import { configInitCommand } from '../src/commands/config-init.js';
import { contextDumpCommand } from '../src/commands/context-dump.js';
import { readPackageJson } from '../src/utils/pkg.js';

const pkg = readPackageJson();
const program = new Command();

program
  .name('ai-css-kit')
  .description('AI-first CSS component toolkit CLI')
  .version(pkg.version);

program.addCommand(generateCommand());
program.addCommand(validateCommand());
program.addCommand(themeMapCommand());

const configCmd = program.command('config').description('Configuration utilities');
configCmd.addCommand(configInitCommand());

const contextCmd = program.command('context').description('Context utilities');
contextCmd.addCommand(contextDumpCommand());

program.parseAsync(process.argv).catch((err) => {
  console.error(`Fatal: ${err.message}`);
  process.exit(err.exitCode ?? 1);
});
```

---

### 5.2 Config Loader

**File:** `cli/src/config/loader.js`

**Priority chain (last wins):**

```
Defaults (hardcoded)
  ← .ai-css-kit.config.js  (CWD, searched upward to project root)
    ← Environment variables
      ← CLI flags (--provider, --model, --theme, etc.)
```

**Environment variable mapping:**

```
AI_CSS_KIT_PROVIDER        → config.provider.provider
AI_CSS_KIT_MODEL           → config.provider.model
OPENAI_API_KEY             → config.provider.apiKey  (when provider=openai)
ANTHROPIC_API_KEY          → config.provider.apiKey  (when provider=anthropic)
AI_CSS_KIT_BASE_URL        → config.provider.baseUrl
OLLAMA_BASE_URL            → config.ollama.baseUrl
AI_CSS_KIT_TEMPERATURE     → config.generate.temperature  (parsed as float)
AI_CSS_KIT_MAX_TOKENS      → config.generate.maxTokens    (parsed as int)
```

**Implementation:**

```javascript
// src/config/loader.js
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

const DEFAULTS = {
  provider: { provider: 'openai', model: 'gpt-4o', apiKey: undefined, baseUrl: undefined },
  generate:  { defaultTheme: 'default', defaultSize: 'md', defaultLayout: 'form',
               maxTokens: 2048, temperature: 0.1, validate: true, outputFormat: 'html' },
  validate:  { rules: {}, failOn: 'error' },
  ollama:    { baseUrl: 'http://localhost:11434', model: 'llama3' },
};

export async function loadConfig(cliFlags = {}) {
  const fileConfig = await findAndLoadConfigFile();
  const envConfig  = loadEnvConfig();
  return deepMerge(DEFAULTS, fileConfig, envConfig, normalizeCLIFlags(cliFlags));
}

async function findAndLoadConfigFile() {
  // Walk up from CWD until we find .ai-css-kit.config.js or reach FS root
  let dir = process.cwd();
  while (true) {
    const candidate = resolve(dir, '.ai-css-kit.config.js');
    if (existsSync(candidate)) {
      const mod = await import(pathToFileURL(candidate).href);
      return mod.default ?? mod;
    }
    const parent = dirname(dir);
    if (parent === dir) return {};   // reached FS root, no config file
    dir = parent;
  }
}
```

---

### 5.3 Context Loader

**File:** `cli/src/context/loader.js`

Loads `AI_CONTEXT.md` from the package's own directory (resolved at install time, not CWD). This ensures the context always matches the installed CLI version.

```javascript
// src/context/loader.js
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
// PKG_ROOT = the root of the ai-css-kit package (where AI_CONTEXT.md lives)

let _cachedContext = null;

export function loadAIContext() {
  if (_cachedContext) return _cachedContext;
  const path = resolve(PKG_ROOT, 'AI_CONTEXT.md');
  _cachedContext = readFileSync(path, 'utf8');
  return _cachedContext;
}
```

**Context slice for Intent Parsing:**

The full `AI_CONTEXT.md` is 430+ lines. For the Intent Parser call, only the following sections are injected as system prompt (to minimise token usage):

```
Section 1: Invariants (I-01..I-10)            ← always included
Section 2: Component Registry (tables only)   ← always included
Section 3: Composition Rules                  ← always included
Section 5: Anti-patterns                      ← always included
Token Reference                               ← omitted (not needed for HTML generation)
```

The Context Loader exposes a `sliceForIntent()` function that extracts these sections via heading-based parsing.

---

### 5.4 Intent Parser

**File:** `cli/src/pipeline/intent-parser.js`

**Responsibility:** Transform a free-text prompt into a validated `ParsedIntent` object using an LLM call.

#### System Prompt Construction

```
[AI_CONTEXT.md — sections 1,2,3,5]

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
      "type":            ComponentType,
      "size":            "sm" | "md" | "lg",
      "variant":         string | null,
      "label":           string | null,
      "placeholder":     string | null,
      "required":        boolean,
      "disabled":        boolean,
      "text":            string | null,
      "contextModifiers": string[],
      "validationState": null,
      "options":         SelectOption[] | null,
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
```

#### Implementation

```javascript
// src/pipeline/intent-parser.js
import { withRetry } from '../utils/retry.js';
import { validateIntentSchema } from '../utils/schema-validator.js';

export async function parseIntent(prompt, aiContext, provider, options = {}) {
  const { temperature = 0.1, maxTokens = 2048 } = options;

  const messages = [
    { role: 'system', content: buildSystemPrompt(aiContext) },
    { role: 'user',   content: prompt },
  ];

  const result = await withRetry(
    () => provider.complete(messages, { temperature, maxTokens, responseFormat: 'json' }),
    { maxAttempts: 3, retryOn: [429, 500, 502, 503] }
  );

  let intent;
  try {
    intent = JSON.parse(result.content);
  } catch (err) {
    throw new IntentParseError(
      `LLM returned non-JSON response after ${result.model} call`,
      { raw: result.content, cause: err }
    );
  }

  // Assign rawPrompt before validation
  intent.rawPrompt = prompt;

  // Validate shape against JSON schema
  const schemaErrors = validateIntentSchema(intent);
  if (schemaErrors.length > 0) {
    throw new IntentParseError(
      `ParsedIntent failed schema validation: ${schemaErrors[0]}`,
      { schemaErrors, intent }
    );
  }

  // Post-process: ensure IDs are unique, positions are assigned
  return normalizeIntent(intent);
}

function normalizeIntent(intent) {
  const seen = new Map();
  intent.components = intent.components.map((spec, idx) => {
    const base = spec.id ?? `${spec.type}-1`;
    const count = (seen.get(spec.type) ?? 0) + 1;
    seen.set(spec.type, count);
    return {
      ...spec,
      id:       `${spec.type}-${count}`,
      size:     spec.size ?? 'md',
      position: spec.position ?? idx,
      contextModifiers: spec.contextModifiers ?? [],
    };
  });
  intent.components.sort((a, b) => a.position - b.position);
  return intent;
}
```

---

### 5.5 Component Resolver

**File:** `cli/src/pipeline/component-resolver.js`

**Responsibility:** Pure, deterministic, zero-LLM conversion of `ComponentSpec[]` to `ResolvedAtom[]`.  
Every template function is a pure function: `(ComponentSpec) → ResolvedAtom`. No side effects.

#### Resolver Map

```javascript
// src/pipeline/component-resolver.js
const RESOLVERS = {
  input:       resolveInput,
  textarea:    resolveTextarea,
  select:      resolveSelect,
  checkbox:    resolveCheckbox,
  radio:       resolveRadio,
  toggle:      resolveToggle,
  slider:      resolveSlider,
  'file-upload': resolveFileUpload,
  button:      resolveButton,
  badge:       resolveBadge,
  card:        resolveCard,
  progress:    resolveProgress,
  autocomplete: resolveAutocomplete,
  datepicker:  resolveDatepicker,
  tooltip:     resolveTooltip,
};

export function resolveComponents(intent) {
  return intent.components.map((spec) => {
    const resolver = RESOLVERS[spec.type];
    if (!resolver) {
      throw new ResolverError(`Unknown component type: "${spec.type}"`);
    }
    return resolver(spec);
  });
}
```

#### Template Function Contract

Every resolver follows this pattern:

```javascript
/**
 * @param {ComponentSpec} spec
 * @returns {ResolvedAtom}
 */
function resolveInput(spec) {
  // 1. Build class list
  const classes = buildInputClasses(spec);

  // 2. Build attribute map
  const attrs = buildInputAttrs(spec);

  // 3. Render component HTML
  const inputHtml = renderElement('input', { class: classes, ...attrs });

  // 4. Render icon overlay (if context modifier present)
  const iconHtml  = renderInputIcons(spec);

  // 5. Render .ui-field wrapper (required for all form atoms)
  const wrapperHtml = renderFieldWrapper(spec, inputHtml + iconHtml);

  return {
    spec,
    html:         inputHtml,
    wrapperHtml,
    classes,
    ariaAttributes: extractAriaAttrs(attrs),
  };
}
```

#### Input Resolver (full specification)

```javascript
function resolveInput(spec) {
  const classes = ['ui-input'];

  // Context modifiers (from AI_CONTEXT.md §2.2)
  if (spec.contextModifiers.includes('icon-left'))  classes.push('ui-input--icon-left');
  if (spec.contextModifiers.includes('icon-right')) classes.push('ui-input--icon-right');
  if (spec.contextModifiers.includes('search'))     classes.push('ui-input--search');
  if (spec.contextModifiers.includes('readonly'))   classes.push('ui-input--readonly');

  // Validation state modifier
  if (spec.validationState) classes.push(`ui-input--${spec.validationState}`);

  const inputType = spec.variant ?? 'text';
  const attrs = {
    type:        inputType,
    id:          spec.id,
    class:       classes.join(' '),
    ...(spec.placeholder && { placeholder: spec.placeholder }),
    ...(spec.value       && { value: String(spec.value) }),
    ...(spec.required    && { required: '', 'aria-required': 'true' }),
    ...(spec.disabled    && { disabled: '', 'aria-disabled': 'true' }),
    ...(spec.contextModifiers.includes('readonly') && { readonly: '' }),
    ...(inputType === 'number' && {
      ...(spec.min  !== undefined && { min:  String(spec.min)  }),
      ...(spec.max  !== undefined && { max:  String(spec.max)  }),
      ...(spec.step !== undefined && { step: String(spec.step) }),
    }),
    ...spec.attributes,
  };

  const inputHtml = renderVoidElement('input', attrs);

  // Icon wrapper (for icon-left or icon-right variants)
  const needsWrapper = spec.contextModifiers.includes('icon-left')
                    || spec.contextModifiers.includes('icon-right')
                    || spec.contextModifiers.includes('search');
  const innerHtml = needsWrapper ? renderIconWrapper(spec, inputHtml) : inputHtml;

  const wrapperHtml = renderFieldWrapper(spec, innerHtml);

  return {
    spec,
    html:          inputHtml,
    wrapperHtml,
    classes,
    ariaAttributes: { ...(spec.required && { 'aria-required': 'true' }),
                      ...(spec.disabled && { 'aria-disabled': 'true' }) },
  };
}
```

#### Button Resolver (full specification)

```javascript
function resolveButton(spec) {
  const variant = spec.variant ?? 'primary';
  const size    = spec.size    ?? 'md';
  const classes = ['ui-button', `ui-button--${variant}`, `ui-button--${size}`];

  const attrs = {
    type:  'submit',
    class: classes.join(' '),
    ...(spec.disabled && { disabled: '', 'aria-disabled': 'true' }),
    ...spec.attributes,
  };

  const buttonHtml = `<button ${renderAttrs(attrs)}>${escapeHtml(spec.text ?? 'Submit')}</button>`;

  // Buttons do NOT get .ui-field wrapper (invariant I-01 applies to form elements only)
  return {
    spec,
    html:          buttonHtml,
    wrapperHtml:   undefined,
    classes,
    ariaAttributes: {},
  };
}
```

#### Datepicker Resolver (full specification — composite component)

```javascript
// Datepicker is a composite: trigger + calendar panel
// Following AI_CONTEXT.md §2.3 composite component spec
function resolveDatepicker(spec) {
  const inputClasses = [
    'ui-input',
    'ui-input--icon-right',
    'ui-input--readonly',
    'ui-datepicker__input',
  ];

  const triggerId  = spec.id;
  const panelId    = `${spec.id}-panel`;
  const calendarId = `${spec.id}-calendar`;

  const triggerHtml = `
<div class="ui-datepicker-trigger">
  <input
    class="${inputClasses.join(' ')}"
    type="text"
    id="${triggerId}"
    readonly
    placeholder="${spec.placeholder ?? 'Select date'}"
    aria-haspopup="dialog"
    aria-expanded="false"
    aria-controls="${panelId}"
    ${spec.required ? 'required aria-required="true"' : ''}
  >
  <span class="ui-datepicker__icon" aria-hidden="true">
    <i class="fa ${spec.icon ?? 'fa-calendar'}"></i>
  </span>
</div>`.trim();

  const calendarHtml = `
<div class="ui-datepicker__panel" id="${panelId}" role="dialog" aria-modal="true" hidden>
  <div class="ui-calendar" id="${calendarId}" role="grid" aria-label="Date picker">
    <div class="ui-calendar__header">
      <button class="ui-button ui-button--ghost ui-button--sm" aria-label="Previous month">&#8249;</button>
      <span class="ui-calendar__month-label" aria-live="polite"></span>
      <button class="ui-button ui-button--ghost ui-button--sm" aria-label="Next month">&#8250;</button>
    </div>
    <div class="ui-calendar__grid" role="row">
      <!-- Day headers and day cells generated by JS at runtime -->
    </div>
  </div>
</div>`.trim();

  const combinedHtml = `<div class="ui-datepicker">\n  ${triggerHtml}\n  ${calendarHtml}\n</div>`;
  const wrapperHtml  = renderFieldWrapper(spec, combinedHtml);

  return {
    spec,
    html:          combinedHtml,
    wrapperHtml,
    classes:       inputClasses,
    ariaAttributes: { 'aria-haspopup': 'dialog', 'aria-expanded': 'false' },
    requires:      [],  // calendar panel is inlined above
  };
}
```

#### Helper utilities used by all resolvers

```javascript
function renderFieldWrapper(spec, innerHtml) {
  const size      = spec.size ?? 'md';
  const labelHtml = spec.label
    ? `<label class="ui-label" for="${spec.id}">${escapeHtml(spec.label)}</label>`
    : '';
  const helperHtml = spec.helperText
    ? `<span class="ui-helper">${escapeHtml(spec.helperText)}</span>`
    : '';

  return [
    `<div class="ui-field ui-field--${size}">`,
    labelHtml ? `  ${labelHtml}` : '',
    `  ${innerHtml}`,
    helperHtml ? `  ${helperHtml}` : '',
    `</div>`,
  ].filter(Boolean).join('\n');
}

function renderIconWrapper(spec, inputHtml) {
  const iconClass = spec.icon ?? (spec.contextModifiers.includes('icon-left') ? 'fa-search' : 'fa-times');
  return [
    `<div class="ui-input-wrapper">`,
    `  <span class="ui-input-icon" aria-hidden="true"><i class="fa ${iconClass}"></i></span>`,
    `  ${inputHtml}`,
    `</div>`,
  ].join('\n');
}

function renderVoidElement(tag, attrs) {
  return `<${tag} ${renderAttrs(attrs)}>`;
}

function renderAttrs(attrs) {
  return Object.entries(attrs)
    .filter(([, v]) => v !== undefined && v !== false)
    .map(([k, v]) => v === '' ? k : `${k}="${escapeAttr(String(v))}"`)
    .join(' ');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
```

---

### 5.6 Layout Composer

**File:** `cli/src/pipeline/layout-composer.js`

**Responsibility:** Arrange `ResolvedAtom[]` into a final HTML layout according to `ParsedIntent.layout` and `ParsedIntent.container`.

#### Layout Strategies

```
Layout     Container   Result
---------  ----------  -------------------------------------------
form       card        <div class="ui-card"><form>...</form></div>
form       section     <section><form>...</form></section>
form       none        <form>...</form>
card       card        <div class="ui-card">...</div>
inline     none        <div class="ui-inline">...</div>
page       none        <div class="ui-page">...</div>
```

#### Implementation

```javascript
// src/pipeline/layout-composer.js
export function composeLayout(intent, atoms) {
  const sortedAtoms = [...atoms].sort((a, b) => a.spec.position - b.spec.position);
  const innerHtml   = sortedAtoms
    .map(atom => atom.wrapperHtml ?? atom.html)
    .join('\n\n');

  const formWrapped = intent.layout === 'form'
    ? wrapInForm(intent, innerHtml)
    : innerHtml;

  const containerWrapped = wrapInContainer(intent, formWrapped);

  return {
    html:          containerWrapped,
    inlineStyles:  undefined,
    requiredTheme: intent.theme,
    meta: {
      componentCount: atoms.length,
      layoutType:     intent.layout,
      generatedAt:    new Date().toISOString(),
    },
  };
}

function wrapInForm(intent, innerHtml) {
  const role       = intent.accessibility?.formRole ?? 'form';
  const roleAttr   = role !== 'none' ? ` role="${role}"` : '';
  const ariaLabel  = intent.title ? ` aria-label="${escapeAttr(intent.title)}"` : '';
  const novalidate = ' novalidate'; // let JS/CSS handle validation UX
  return `<form${roleAttr}${ariaLabel}${novalidate}>\n${indent(innerHtml)}\n</form>`;
}

function wrapInContainer(intent, innerHtml) {
  const header = buildHeader(intent);

  switch (intent.container) {
    case 'card':
      return [
        `<div class="ui-card">`,
        header ? `  <div class="ui-card__body">` : '',
        header ? `    ${header}` : '',
        header ? `  </div>` : '',
        `  <div class="ui-card__body">`,
        indent(innerHtml, 4),
        `  </div>`,
        `</div>`,
      ].filter(Boolean).join('\n');

    case 'section':
      return [
        `<section>`,
        header ? `  ${header}` : '',
        indent(innerHtml),
        `</section>`,
      ].filter(Boolean).join('\n');

    default:
      return header ? `${header}\n${innerHtml}` : innerHtml;
  }
}

function buildHeader(intent) {
  if (!intent.title && !intent.description) return '';
  const level = intent.accessibility?.headingLevel ?? 2;
  const lines = [];
  if (intent.title)       lines.push(`<h${level}>${escapeHtml(intent.title)}</h${level}>`);
  if (intent.description) lines.push(`<p>${escapeHtml(intent.description)}</p>`);
  return lines.join('\n');
}

function indent(str, spaces = 2) {
  const pad = ' '.repeat(spaces);
  return str.split('\n').map(line => (line.trim() ? pad + line : line)).join('\n');
}
```

---

### 5.7 Validator

**File:** `cli/src/pipeline/validator.js`

**Responsibility:** Inspect the generated HTML string for Module Contract violations without DOM parsing.  
Uses regex-based pattern matching (no dependencies). For structural checks, a minimal recursive descent parser is used.

#### Validator Architecture

```javascript
// src/pipeline/validator.js
const RULES = [
  ruleFieldWrapper,          // I-01: .ui-input must be inside .ui-field
  ruleLabelPresence,         // I-03: .ui-field must contain a .ui-label
  ruleFieldSizeModifier,     // I-02: .ui-field must have size modifier
  ruleNoParentMutation,      // I-04: no compound cross-component selectors in style attrs
  ruleContextModifierExplicit, // ADR-0002: .ui-input--icon-* must be on the atom
  ruleValidModifiers,        // only registered modifier classes used
  ruleAriaInteractive,       // interactive elements have accessible names
  ruleButtonVariant,         // every button has primary|secondary|ghost variant
  ruleThemeValue,            // data-theme (if present) matches known presets
];

export function validate(html, options = {}) {
  const start      = Date.now();
  const allIssues  = [];
  let rulesChecked = 0;

  for (const rule of RULES) {
    const issues = rule(html, options);
    allIssues.push(...issues);
    rulesChecked++;
  }

  const errors   = allIssues.filter(i => i.severity === 'error');
  const warnings = allIssues.filter(i => i.severity === 'warning');
  const info     = allIssues.filter(i => i.severity === 'info');

  return {
    valid:    errors.length === 0,
    errors,
    warnings,
    info,
    stats:    { componentsChecked: countComponents(html), rulesChecked, durationMs: Date.now() - start },
  };
}
```

---

### 5.8 Provider Abstraction Layer

**Files:** `cli/src/providers/base.js`, `factory.js`, `openai.js`, `anthropic.js`, `ollama.js`, `openai-compatible.js`

#### Base Class

```javascript
// src/providers/base.js
export class LLMProvider {
  constructor(config) {
    this.config = config;
    this.name   = 'base';
  }

  /**
   * Declares what this provider supports.
   * Subclasses override individual fields; the Intent Parser reads this
   * to adapt request strategy without touching provider-specific code.
   * @returns {ProviderCapabilities}
   */
  get capabilities() {
    return {
      supportsJsonMode:   false,
      supportsStreaming:  false,
      requiresApiKey:     true,
      supportedModels:    undefined,
      maxContextTokens:   undefined,
    };
  }

  /**
   * Single blocking completion (waits for full response).
   * @param {Message[]} messages
   * @param {CompletionOptions} options
   * @returns {Promise<CompletionResult>}
   */
  async complete(messages, options = {}) {
    throw new Error(`${this.name}.complete() not implemented`);
  }

  /**
   * Streaming completion — yields text chunks as they arrive.
   * @param {Message[]} messages
   * @param {CompletionOptions} options
   * @returns {AsyncGenerator<string>}
   */
  async *stream(messages, options = {}) {
    throw new Error(`${this.name}.stream() not implemented`);
  }

  /**
   * Health check. Resolves if provider is reachable and auth is valid.
   * Rejects with ProviderError otherwise.
   */
  async ping() {
    throw new Error(`${this.name}.ping() not implemented`);
  }
}
```

#### Factory — open registry with `registerProvider()`

```javascript
// src/providers/factory.js
import { LLMProvider }              from './base.js';
import { OpenAIProvider }           from './openai.js';
import { AnthropicProvider }        from './anthropic.js';
import { OllamaProvider }           from './ollama.js';
import { OpenAICompatibleProvider } from './openai-compatible.js';
import { ConfigError }              from '../utils/errors.js';

// Built-in providers — never modified at runtime
const BUILT_IN_REGISTRY = {
  'openai':             OpenAIProvider,
  'anthropic':          AnthropicProvider,
  'ollama':             OllamaProvider,
  'openai-compatible':  OpenAICompatibleProvider,
};

// User-registered providers — populated via registerProvider()
const _customRegistry = new Map();

/**
 * Register a custom LLM provider.
 * Called from the user's .ai-css-kit.config.js before default export.
 *
 * @param {string}           name          - Provider name used in config.provider.provider
 * @param {typeof LLMProvider} ProviderClass - Must extend LLMProvider
 *
 * @example
 * // .ai-css-kit.config.js
 * import { registerProvider } from 'ai-css-kit/cli';
 * import { MyProvider } from './my-provider.js';
 *
 * registerProvider('my-provider', MyProvider);
 *
 * export default { provider: { provider: 'my-provider', ... } };
 */
export function registerProvider(name, ProviderClass) {
  if (typeof name !== 'string' || !name.trim()) {
    throw new TypeError('registerProvider: name must be a non-empty string');
  }
  if (!(ProviderClass.prototype instanceof LLMProvider)) {
    throw new TypeError(
      `registerProvider: "${name}" must extend LLMProvider from 'ai-css-kit/cli/providers/base'`
    );
  }
  if (BUILT_IN_REGISTRY[name]) {
    throw new ConfigError(
      `registerProvider: "${name}" conflicts with a built-in provider. Choose a different name.`
    );
  }
  _customRegistry.set(name, ProviderClass);
}

/**
 * List all registered provider names (built-in + custom).
 * @returns {string[]}
 */
export function listProviders() {
  return [...Object.keys(BUILT_IN_REGISTRY), ..._customRegistry.keys()];
}

/**
 * Create a provider instance from config.
 * Custom providers registered via registerProvider() take precedence lookup
 * over nothing — built-in names are reserved and cannot be overridden.
 *
 * @param {CLIConfig} config
 * @returns {LLMProvider}
 */
export function createProvider(config) {
  const name = config.provider.provider;
  const Cls  = _customRegistry.get(name) ?? BUILT_IN_REGISTRY[name];

  if (!Cls) {
    throw new ConfigError(
      `Unknown provider: "${name}". ` +
      `Built-in: ${Object.keys(BUILT_IN_REGISTRY).join(', ')}. ` +
      `Custom registered: ${[..._customRegistry.keys()].join(', ') || '(none)'}`
    );
  }

  const instance = new Cls(config);

  // Warn if API key missing and provider requires it
  if (instance.capabilities.requiresApiKey && !config.provider.apiKey) {
    throw new ConfigError(
      `Provider "${name}" requires an API key. ` +
      `Set it via environment variable or config.provider.apiKey.`
    );
  }

  return instance;
}
```

#### `OpenAICompatibleProvider` — generic adapter for OpenAI-protocol APIs

Covers Groq, Mistral AI, LM Studio, Together AI, Perplexity, Azure OpenAI, and any other service that implements the OpenAI Chat Completions schema. The only difference from `OpenAIProvider` is that `baseUrl` is **required** (no default), and capabilities are configurable via the config file.

```javascript
// src/providers/openai-compatible.js
import { OpenAIProvider } from './openai.js';
import { ConfigError }    from '../utils/errors.js';

export class OpenAICompatibleProvider extends OpenAIProvider {
  constructor(config) {
    super(config);
    this.name = 'openai-compatible';

    if (!config.provider.baseUrl) {
      throw new ConfigError(
        '"openai-compatible" provider requires config.provider.baseUrl. ' +
        'Example: "https://api.groq.com/openai/v1"'
      );
    }

    this.baseUrl = config.provider.baseUrl;   // override OpenAIProvider default
    this.apiKey  = config.provider.apiKey ?? process.env.AI_CSS_KIT_API_KEY;
  }

  /**
   * Capabilities are configurable via config.provider.*
   * Conservative defaults — unknown providers assumed to not support json_object mode.
   */
  get capabilities() {
    return {
      supportsJsonMode:   this.config.provider.supportsJsonMode   ?? false,
      supportsStreaming:  true,
      requiresApiKey:     this.config.provider.requiresApiKey     ?? true,
      maxContextTokens:   this.config.provider.maxContextTokens   ?? undefined,
    };
  }
}
```

**Usage examples in `.ai-css-kit.config.js`:**

```javascript
// ── Groq (supports json_object mode) ──────────────────────────
export default {
  provider: {
    provider:           'openai-compatible',
    model:              'llama-3.3-70b-versatile',
    apiKey:             process.env.GROQ_API_KEY,
    baseUrl:            'https://api.groq.com/openai/v1',
    supportsJsonMode:   true,
    maxContextTokens:   128_000,
  },
};

// ── Mistral AI ─────────────────────────────────────────────────
export default {
  provider: {
    provider:           'openai-compatible',
    model:              'mistral-large-latest',
    apiKey:             process.env.MISTRAL_API_KEY,
    baseUrl:            'https://api.mistral.ai/v1',
    supportsJsonMode:   true,
  },
};

// ── LM Studio (local, no API key) ─────────────────────────────
export default {
  provider: {
    provider:           'openai-compatible',
    model:              'local-model',
    baseUrl:            'http://localhost:1234/v1',
    requiresApiKey:     false,
    supportsJsonMode:   false,
  },
};

// ── Fully custom provider class ────────────────────────────────
import { registerProvider } from 'ai-css-kit/cli';
import { MyCompanyProvider } from './providers/my-company.js';

registerProvider('my-company', MyCompanyProvider);

export default {
  provider: {
    provider: 'my-company',
    apiKey:   process.env.MY_COMPANY_API_KEY,
    baseUrl:  'https://llm.internal.example.com',
  },
};
```

#### Capability Negotiation in Intent Parser

The Intent Parser reads `provider.capabilities` once and adapts its request accordingly. This keeps all provider-specific branching out of the pipeline:

```javascript
// src/pipeline/intent-parser.js  (updated excerpt)
export async function parseIntent(prompt, aiContext, provider, options = {}) {
  const { temperature = 0.1, maxTokens = 2048 } = options;
  const caps = provider.capabilities;

  // Warn if prompt is likely to exceed the provider's context window
  if (caps.maxContextTokens) {
    const estimatedTokens = Math.ceil((aiContext.length + prompt.length) / 4);
    if (estimatedTokens > caps.maxContextTokens * 0.9) {
      logger.warn(
        `Estimated prompt size (~${estimatedTokens} tokens) is near the ` +
        `provider context limit (${caps.maxContextTokens}). Consider using --section flags.`
      );
    }
  }

  // Build system prompt; add explicit JSON instruction when json_object mode unavailable
  const systemPrompt = buildSystemPrompt(aiContext, {
    forceJsonInstruction: !caps.supportsJsonMode,
    // When supportsJsonMode=false, the system prompt ends with:
    // "IMPORTANT: Return ONLY raw JSON. No markdown. No code blocks. No commentary."
  });

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user',   content: prompt },
  ];

  // Only send response_format when provider supports it
  const completionOpts = {
    temperature,
    maxTokens,
    responseFormat: caps.supportsJsonMode ? 'json' : 'text',
  };

  const result = await withRetry(
    () => provider.complete(messages, completionOpts),
    { maxAttempts: 3, retryOn: [429, 500, 502, 503] }
  );

  // ... JSON parsing + schema validation (unchanged)
}
```

---

### 5.9 Output Formatter & Writer

**File:** `cli/src/output/formatter.js`, `writer.js`

```javascript
// src/output/formatter.js
export function format(layout, intent, report, options = {}) {
  const { outputFormat = 'html' } = options;

  switch (outputFormat) {
    case 'html':    return formatHTML(layout, intent);
    case 'json':    return formatJSON(layout, intent, report);
    case 'snippet': return layout.html;   // raw HTML fragment, no wrapper
    default:        throw new Error(`Unknown output format: "${outputFormat}"`);
  }
}

function formatHTML(layout, intent) {
  const themeAttr = intent.theme !== 'default'
    ? ` data-theme="${intent.theme}"`
    : '';
  return [
    `<!DOCTYPE html>`,
    `<html lang="${intent.accessibility?.lang ?? 'en'}"${themeAttr}>`,
    `<head>`,
    `  <meta charset="UTF-8">`,
    `  <meta name="viewport" content="width=device-width, initial-scale=1.0">`,
    `  <title>${escapeHtml(intent.title ?? 'Generated UI')}</title>`,
    `  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ai-css-kit/dist/ai-css-kit.min.css">`,
    intent.theme !== 'default'
      ? `  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ai-css-kit/dist/themes/${intent.theme}.css">`
      : '',
    `</head>`,
    `<body>`,
    indent(layout.html),
    `</body>`,
    `</html>`,
  ].filter(line => line !== '').join('\n');
}

function formatJSON(layout, intent, report) {
  return JSON.stringify({ layout, intent, validation: report }, null, 2);
}
```

```javascript
// src/output/writer.js
import { writeFileSync } from 'node:fs';

export function write(content, outputPath) {
  if (!outputPath || outputPath === '-') {
    process.stdout.write(content + '\n');
  } else {
    writeFileSync(outputPath, content, 'utf8');
  }
}
```

---

## 6. API Communication Logic

All HTTP calls use `globalThis.fetch` (available natively in Node.js ≥ 18.0.0). No external HTTP libraries are required.

### 6.1 OpenAI

**Endpoint:** `POST {baseUrl}/chat/completions`  
**Default baseUrl:** `https://api.openai.com/v1`

**Request:**

```json
{
  "model": "gpt-4o",
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user",   "content": "registration form with email, password, submit" }
  ],
  "temperature": 0.1,
  "max_tokens": 2048,
  "response_format": { "type": "json_object" }
}
```

**Request headers:**

```
Authorization: Bearer {apiKey}
Content-Type: application/json
User-Agent: ai-css-kit-cli/{version}
```

**Response (success):**

```json
{
  "id": "chatcmpl-abc123",
  "model": "gpt-4o-2024-08-06",
  "choices": [
    {
      "index": 0,
      "message": { "role": "assistant", "content": "{ \"layout\": \"form\", ... }" },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 820,
    "completion_tokens": 315,
    "total_tokens": 1135
  }
}
```

**Response extraction:**

```javascript
const content = response.choices[0].message.content;
const usage   = {
  promptTokens:     response.usage.prompt_tokens,
  completionTokens: response.usage.completion_tokens,
  totalTokens:      response.usage.total_tokens,
};
```

**Implementation:**

```javascript
// src/providers/openai.js
import { LLMProvider }   from './base.js';
import { ProviderError } from '../utils/errors.js';

export class OpenAIProvider extends LLMProvider {
  constructor(config) {
    super(config);
    this.name    = 'openai';
    this.baseUrl = config.provider.baseUrl ?? 'https://api.openai.com/v1';
    this.apiKey  = config.provider.apiKey  ?? process.env.OPENAI_API_KEY;
    this.model   = config.provider.model   ?? 'gpt-4o';
    if (!this.apiKey) throw new ConfigError('OPENAI_API_KEY is required for OpenAI provider');
  }

  async complete(messages, options = {}) {
    const { temperature = 0.1, maxTokens = 2048, responseFormat } = options;
    const start = Date.now();

    const body = {
      model:       this.model,
      messages,
      temperature,
      max_tokens:  maxTokens,
      ...(responseFormat === 'json' && { response_format: { type: 'json_object' } }),
    };

    const response = await this._fetch('/chat/completions', body);

    return {
      content:   response.choices[0].message.content,
      usage:     { promptTokens:     response.usage.prompt_tokens,
                   completionTokens: response.usage.completion_tokens,
                   totalTokens:      response.usage.total_tokens },
      model:     response.model,
      provider:  'openai',
      durationMs: Date.now() - start,
    };
  }

  async ping() {
    // GET /models — lightweight endpoint to test auth
    const res = await fetch(`${this.baseUrl}/models`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    if (!res.ok) throw new ProviderError(`OpenAI ping failed: ${res.status}`, { status: res.status });
  }

  async _fetch(path, body) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type':  'application/json',
        'User-Agent':    `ai-css-kit-cli/${this._version()}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new ProviderError(`OpenAI API error ${res.status}`, {
        status: res.status,
        body:   errBody,
      });
    }

    return res.json();
  }

  _version() {
    return process.env.npm_package_version ?? '0.0.0';
  }
}
```

---

### 6.2 Anthropic

**Endpoint:** `POST {baseUrl}/messages`  
**Default baseUrl:** `https://api.anthropic.com/v1`

**Request:**

```json
{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 2048,
  "temperature": 0.1,
  "system": "...",
  "messages": [
    { "role": "user", "content": "registration form with email, password, submit" }
  ]
}
```

**Request headers:**

```
x-api-key: {apiKey}
anthropic-version: 2023-06-01
Content-Type: application/json
User-Agent: ai-css-kit-cli/{version}
```

> **Note:** Anthropic separates the system prompt from user messages. The adapter transforms the `messages` array: extracts the `system` role message and passes it as a top-level `system` field.

**Response (success):**

```json
{
  "id": "msg_abc123",
  "type": "message",
  "role": "assistant",
  "model": "claude-3-5-sonnet-20241022",
  "content": [
    { "type": "text", "text": "{ \"layout\": \"form\", ... }" }
  ],
  "usage": {
    "input_tokens": 820,
    "output_tokens": 315
  }
}
```

**Response extraction:**

```javascript
const content = response.content.find(b => b.type === 'text')?.text ?? '';
const usage   = {
  promptTokens:     response.usage.input_tokens,
  completionTokens: response.usage.output_tokens,
  totalTokens:      response.usage.input_tokens + response.usage.output_tokens,
};
```

**Implementation:**

```javascript
// src/providers/anthropic.js
import { LLMProvider }   from './base.js';
import { ProviderError, ConfigError } from '../utils/errors.js';

export class AnthropicProvider extends LLMProvider {
  constructor(config) {
    super(config);
    this.name    = 'anthropic';
    this.baseUrl = config.provider.baseUrl ?? 'https://api.anthropic.com/v1';
    this.apiKey  = config.provider.apiKey  ?? process.env.ANTHROPIC_API_KEY;
    this.model   = config.provider.model   ?? 'claude-3-5-sonnet-20241022';
    if (!this.apiKey) throw new ConfigError('ANTHROPIC_API_KEY is required for Anthropic provider');
  }

  async complete(messages, options = {}) {
    const { temperature = 0.1, maxTokens = 2048 } = options;
    const start = Date.now();

    // Anthropic API: system message is a separate top-level field
    const systemMsg = messages.find(m => m.role === 'system');
    const userMsgs  = messages.filter(m => m.role !== 'system');

    const body = {
      model:       this.model,
      max_tokens:  maxTokens,
      temperature,
      ...(systemMsg && { system: systemMsg.content }),
      messages:    userMsgs,
    };

    const response = await this._fetch('/messages', body);
    const content  = response.content.find(b => b.type === 'text')?.text ?? '';

    return {
      content,
      usage: {
        promptTokens:     response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens:      response.usage.input_tokens + response.usage.output_tokens,
      },
      model:     response.model,
      provider:  'anthropic',
      durationMs: Date.now() - start,
    };
  }

  async ping() {
    // Lightweight: send a minimal request
    const res = await fetch(`${this.baseUrl}/messages`, {
      method:  'POST',
      headers: this._headers(),
      body: JSON.stringify({ model: this.model, max_tokens: 1,
                             messages: [{ role: 'user', content: 'ping' }] }),
    });
    // 400 (invalid request) is still a reachable API; only network errors matter
    if (res.status >= 500) throw new ProviderError(`Anthropic ping failed: ${res.status}`);
  }

  async _fetch(path, body) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method:  'POST',
      headers: this._headers(),
      body:    JSON.stringify(body),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new ProviderError(`Anthropic API error ${res.status}`, {
        status: res.status, body: errBody,
      });
    }

    return res.json();
  }

  _headers() {
    return {
      'x-api-key':         this.apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type':      'application/json',
      'User-Agent':        `ai-css-kit-cli/${process.env.npm_package_version ?? '0.0.0'}`,
    };
  }
}
```

---

### 6.3 Ollama (local)

**Endpoint:** `POST {baseUrl}/api/chat`  
**Default baseUrl:** `http://localhost:11434`

**Request:**

```json
{
  "model": "llama3",
  "messages": [
    { "role": "system",    "content": "..." },
    { "role": "user",      "content": "registration form..." }
  ],
  "stream": false,
  "format": "json",
  "options": {
    "temperature": 0.1,
    "num_predict": 2048
  }
}
```

> **Note:** `"format": "json"` instructs Ollama-compatible models to constrain output to JSON (model must support it). If the model does not honour it, the validator handles the fallback.

**Response (success):**

```json
{
  "model": "llama3",
  "message": {
    "role": "assistant",
    "content": "{ \"layout\": \"form\", ... }"
  },
  "done": true,
  "prompt_eval_count": 820,
  "eval_count": 315
}
```

**Response extraction:**

```javascript
const content = response.message.content;
const usage   = {
  promptTokens:     response.prompt_eval_count ?? 0,
  completionTokens: response.eval_count        ?? 0,
  totalTokens:      (response.prompt_eval_count ?? 0) + (response.eval_count ?? 0),
};
```

**Implementation:**

```javascript
// src/providers/ollama.js
import { LLMProvider }   from './base.js';
import { ProviderError } from '../utils/errors.js';

export class OllamaProvider extends LLMProvider {
  constructor(config) {
    super(config);
    this.name    = 'ollama';
    this.baseUrl = config.ollama?.baseUrl ?? config.provider.baseUrl ?? 'http://localhost:11434';
    this.model   = config.ollama?.model   ?? config.provider.model   ?? 'llama3';
  }

  async complete(messages, options = {}) {
    const { temperature = 0.1, maxTokens = 2048 } = options;
    const start = Date.now();

    const body = {
      model:    this.model,
      messages,
      stream:   false,
      format:   'json',
      options:  { temperature, num_predict: maxTokens },
    };

    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new ProviderError(`Ollama API error ${res.status}`, {
        status: res.status, body: errBody,
      });
    }

    const response = await res.json();

    return {
      content:   response.message.content,
      usage:     {
        promptTokens:     response.prompt_eval_count ?? 0,
        completionTokens: response.eval_count        ?? 0,
        totalTokens:      (response.prompt_eval_count ?? 0) + (response.eval_count ?? 0),
      },
      model:     response.model,
      provider:  'ollama',
      durationMs: Date.now() - start,
    };
  }

  async ping() {
    const res = await fetch(`${this.baseUrl}/api/tags`);
    if (!res.ok) throw new ProviderError(`Ollama not reachable at ${this.baseUrl}`, { status: res.status });
  }
}
```

---

### 6.4 Retry & Error Strategy

**File:** `cli/src/utils/retry.js`

#### Retry Policy

```
Trigger conditions:
  HTTP 429  Too Many Requests   → always retry (respect Retry-After header if present)
  HTTP 500  Internal Server Error → retry
  HTTP 502  Bad Gateway           → retry
  HTTP 503  Service Unavailable   → retry
  Network errors (ECONNREFUSED, ETIMEDOUT, fetch AbortError) → retry

No retry:
  HTTP 400  Bad Request           → programming error, throw immediately
  HTTP 401  Unauthorized          → config error, throw immediately
  HTTP 403  Forbidden             → config error, throw immediately
  HTTP 404  Not Found             → wrong baseUrl, throw immediately
  HTTP 422  Unprocessable Entity  → invalid request schema, throw immediately
```

#### Exponential Backoff with Jitter

```javascript
// src/utils/retry.js
export async function withRetry(fn, options = {}) {
  const {
    maxAttempts = 3,
    baseDelay   = 1000,   // 1 second
    maxDelay    = 15000,  // 15 seconds cap
    retryOn     = [429, 500, 502, 503],
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      const isRetryable = isRetryableError(err, retryOn);
      if (!isRetryable || attempt === maxAttempts) {
        err.attempts = attempt;
        throw err;
      }

      // Respect Retry-After header from 429 responses
      const retryAfterMs = extractRetryAfter(err) * 1000;
      const backoffMs     = Math.min(baseDelay * 2 ** (attempt - 1), maxDelay);
      const jitterMs      = Math.random() * backoffMs * 0.2;
      const waitMs        = Math.max(retryAfterMs, backoffMs + jitterMs);

      logger.debug(`Retry ${attempt}/${maxAttempts} in ${Math.round(waitMs)}ms (${err.message})`);
      await sleep(waitMs);
    }
  }

  throw lastError;
}

function isRetryableError(err, retryOn) {
  if (err.status && retryOn.includes(err.status)) return true;
  // Network-level errors
  if (err.cause?.code === 'ECONNREFUSED')  return true;
  if (err.cause?.code === 'ETIMEDOUT')     return true;
  if (err instanceof DOMException && err.name === 'AbortError') return true;
  return false;
}

function extractRetryAfter(err) {
  // ProviderError stores response headers when available
  const retryAfter = err.headers?.get?.('Retry-After');
  if (!retryAfter) return 0;
  const parsed = parseInt(retryAfter, 10);
  return isNaN(parsed) ? 0 : parsed;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

#### Error Class Hierarchy

```
Error
└── CLIError (exitCode: number)
    ├── ConfigError          exitCode: 2  (missing API key, unknown provider, etc.)
    ├── ProviderError        exitCode: 3  (HTTP error from LLM API)
    ├── IntentParseError     exitCode: 5  (LLM returned invalid JSON)
    ├── ResolverError        exitCode: 1  (unknown component type in intent)
    └── ValidationError      exitCode: 4  (generated HTML fails Module Contract)
```

```javascript
// src/utils/errors.js
export class CLIError extends Error {
  constructor(message, { exitCode = 1, ...meta } = {}) {
    super(message);
    this.name     = this.constructor.name;
    this.exitCode = exitCode;
    Object.assign(this, meta);
  }
}

export class ConfigError       extends CLIError { constructor(m, m2) { super(m, { exitCode: 2, ...m2 }); } }
export class ProviderError     extends CLIError { constructor(m, m2) { super(m, { exitCode: 3, ...m2 }); } }
export class IntentParseError  extends CLIError { constructor(m, m2) { super(m, { exitCode: 5, ...m2 }); } }
export class ResolverError     extends CLIError { constructor(m, m2) { super(m, { exitCode: 1, ...m2 }); } }
export class ValidationError   extends CLIError { constructor(m, m2) { super(m, { exitCode: 4, ...m2 }); } }
```

---

## 7. CLI UX Reference

### 7.1 Command Overview

```
ai-css-kit <command> [options]

Commands:
  generate <prompt>      Generate HTML from a natural language description
  validate <file>        Validate an HTML file against the Module Contract
  theme-map <input>      Convert a JSON theme file to CSS (wraps scripts/theme-map.js)
  config init            Create a .ai-css-kit.config.js in the current directory
  context dump           Print AI_CONTEXT.md to stdout
```

### 7.2 `generate` Command

```
ai-css-kit generate [options] "<prompt>"

Arguments:
  prompt                 Natural language description of the UI to generate

Options:
  -o, --output <file>    Write output to file instead of stdout ("-" for stdout)
  -t, --theme <name>     Theme preset: default|dark|midnight|corporate|warm  [default: "default"]
  -p, --provider <name>  LLM provider: openai|anthropic|ollama                [from config]
  -m, --model <name>     Model identifier                                      [from config]
  -f, --format <type>    Output format: html|json|snippet                     [default: "html"]
  --no-validate          Skip post-generation validation
  --fail-on-validate     Exit code 4 if validation has errors (CI usage)
  --temperature <n>      Override LLM temperature (0–1)                       [default: 0.1]
  --max-tokens <n>       Override LLM max_tokens                              [default: 2048]
  --verbose              Show pipeline step timings and token usage
  --quiet                Suppress all non-output messages

Examples:
  ai-css-kit generate "login form with email and password"
  ai-css-kit generate -o form.html -t midnight "registration form"
  ai-css-kit generate -p ollama -m llama3 --format snippet "search bar"
  ai-css-kit generate --fail-on-validate -o out.html "contact form"
```

**Verbose output format:**

```
[ai-css-kit] Loaded config from .ai-css-kit.config.js
[ai-css-kit] Provider: openai (gpt-4o)
[ai-css-kit] Loading AI context (1.2 KB)...
[ai-css-kit] ── Intent Parser ──────────────────── 1,842ms  820 + 315 tokens
[ai-css-kit] ── Component Resolver ─────────────── 0ms      3 components
[ai-css-kit] ── Layout Composer ───────────────── 0ms      form in card
[ai-css-kit] ── Validator ──────────────────────── 1ms      ✓ 0 errors, 0 warnings
[ai-css-kit] Output: stdout (html format)
```

### 7.3 `validate` Command

```
ai-css-kit validate [options] <file>

Arguments:
  file                   HTML file to validate (use "-" for stdin)

Options:
  -f, --format <type>    Report format: text|json                             [default: "text"]
  --fail-on <severity>   Exit non-zero on: error|warning                     [default: "error"]
  --quiet                Print only errors and warnings (suppress info)

Examples:
  ai-css-kit validate output.html
  ai-css-kit validate --format json output.html
  cat output.html | ai-css-kit validate -
  ai-css-kit validate --fail-on warning output.html   # strict mode
```

**Text report format:**

```
ai-css-kit validate output.html
─────────────────────────────────────
  ✓  Components checked:  3
  ✓  Rules checked:       9
  ✗  Errors:              1
  ⚠  Warnings:            1
─────────────────────────────────────
ERROR  [MISSING_FIELD_WRAPPER]
  Element:    <input class="ui-input" type="email">
  Message:    .ui-input element is not wrapped in a .ui-field element.
  Suggestion: Wrap the input in <div class="ui-field ui-field--md">...</div>

WARNING  [MISSING_ARIA_LABEL]
  Element:    <button class="ui-button ui-button--primary">
  Message:    Button has no accessible label. Text content is empty.
  Suggestion: Add descriptive text content inside the <button> element.
─────────────────────────────────────
Validation FAILED — 1 error(s) found.
```

### 7.4 `config init` Command

```
ai-css-kit config init

Creates .ai-css-kit.config.js in the current working directory.
Prompts for provider selection if run interactively.
Safe: will not overwrite an existing config file without --force.

Options:
  --force    Overwrite existing .ai-css-kit.config.js
  --provider <name>  Pre-select provider (skip interactive prompt)
```

**Generated config template:**

```javascript
// .ai-css-kit.config.js
// Generated by: ai-css-kit config init
// Docs: https://github.com/vadimjoy/ai-css-kit#configuration

export default {
  provider: {
    provider: 'openai',                    // 'openai' | 'anthropic' | 'ollama'
    model:    'gpt-4o',                    // model identifier for the chosen provider
    apiKey:   process.env.OPENAI_API_KEY,  // set via env variable (do NOT commit keys)
    // baseUrl: undefined,                 // optional: proxy or local LM Studio endpoint
  },

  generate: {
    defaultTheme:  'default',  // 'default' | 'dark' | 'midnight' | 'corporate' | 'warm'
    defaultSize:   'md',       // 'sm' | 'md' | 'lg'
    defaultLayout: 'form',
    maxTokens:     2048,
    temperature:   0.1,        // lower = more deterministic
    validate:      true,       // run validator automatically after generation
    outputFormat:  'html',     // 'html' | 'json' | 'snippet'
  },

  validate: {
    rules: {},      // override severity per rule code, e.g.: { MISSING_ARIA_LABEL: 'error' }
    failOn: 'error', // 'error' | 'warning' — what severity causes non-zero exit
  },

  ollama: {
    baseUrl: 'http://localhost:11434',
    model:   'llama3',
  },
};
```

### 7.5 `context dump` Command

```
ai-css-kit context dump

Prints the full AI_CONTEXT.md to stdout.
Useful for piping into other tools or verifying the installed version.

Options:
  --section <name>   Print only one section (e.g. "invariants", "registry", "tokens")
  --version          Print only the VERSION line

Examples:
  ai-css-kit context dump > my-context.md
  ai-css-kit context dump --section invariants
  ai-css-kit context dump | wc -l
```

---

## 8. Configuration Reference

### 8.1 Config File Location Search

The CLI searches for `.ai-css-kit.config.js` in this order:

```
1. $CWD/.ai-css-kit.config.js
2. $CWD/../.ai-css-kit.config.js
3. ... (walks up to filesystem root)
4. Built-in defaults (if no file found)
```

### 8.2 Full Defaults

| Key | Default | Type | Description |
|-----|---------|------|-------------|
| `provider.provider` | `'openai'` | `ProviderName` | LLM backend to use; any name registered via `registerProvider()` is valid |
| `provider.model` | `'gpt-4o'` | `string` | Model identifier |
| `provider.apiKey` | `undefined` | `string` | Resolved from env if absent; skipped when `requiresApiKey: false` |
| `provider.baseUrl` | `undefined` | `string` | **Required** for `openai-compatible`; optional proxy override for others |
| `provider.supportsJsonMode` | `undefined` | `boolean` | Override capability detection for `openai-compatible` provider |
| `provider.requiresApiKey` | `undefined` | `boolean` | Override to `false` for local providers (LM Studio, Ollama-compatible) |
| `provider.maxContextTokens` | `undefined` | `number` | Override context window size; triggers warning when prompt approaches limit |
| `generate.defaultTheme` | `'default'` | `string` | Theme preset for HTML output |
| `generate.defaultSize` | `'md'` | `SizeVariant` | Default component size |
| `generate.defaultLayout` | `'form'` | `LayoutType` | Assumed layout |
| `generate.maxTokens` | `2048` | `number` | LLM max_tokens |
| `generate.temperature` | `0.1` | `number` | LLM temperature |
| `generate.validate` | `true` | `boolean` | Auto-run validator |
| `generate.outputFormat` | `'html'` | `OutputFormat` | Output format |
| `validate.failOn` | `'error'` | `IssueSeverity` | Min severity for exit 4 |
| `ollama.baseUrl` | `'http://localhost:11434'` | `string` | Ollama server URL |
| `ollama.model` | `'llama3'` | `string` | Ollama model |

### 8.3 Environment Variable Priority

Environment variables override the config file:

| Environment Variable | Config Path | Notes |
|---------------------|-------------|-------|
| `AI_CSS_KIT_PROVIDER` | `provider.provider` | |
| `AI_CSS_KIT_MODEL` | `provider.model` | |
| `OPENAI_API_KEY` | `provider.apiKey` | when provider=openai |
| `ANTHROPIC_API_KEY` | `provider.apiKey` | when provider=anthropic |
| `AI_CSS_KIT_BASE_URL` | `provider.baseUrl` | |
| `OLLAMA_BASE_URL` | `ollama.baseUrl` | |
| `AI_CSS_KIT_TEMPERATURE` | `generate.temperature` | parsed as float |
| `AI_CSS_KIT_MAX_TOKENS` | `generate.maxTokens` | parsed as int |
| `AI_CSS_KIT_OUTPUT_FORMAT` | `generate.outputFormat` | |
| `AI_CSS_KIT_THEME` | `generate.defaultTheme` | |

---

## 9. Sequence Diagrams

### 9.1 `generate` Happy Path

```
User                CLI Entry       Config   Context   Provider    Pipeline
 │                      │           Loader   Loader    (OpenAI)    Stages
 │  $ ai-css-kit         │              │        │          │          │
 │  generate "form..."   │              │        │          │          │
 │──────────────────────►│              │        │          │          │
 │                        │──loadConfig()►│       │          │          │
 │                        │◄─────────────│       │          │          │
 │                        │──loadAIContext()──────►│         │          │
 │                        │◄──────────────────────│         │          │
 │                        │──createProvider(cfg)──────────► │          │
 │                        │                               │            │
 │                        │────────────────────────── parseIntent()──► │
 │                        │                               │            │ (LLM call)
 │                        │                               ├──POST /chat/completions
 │                        │                               │◄──{ ParsedIntent JSON }
 │                        │◄─────────────────────── ParsedIntent ──────│
 │                        │                                            │
 │                        │──────────────────── resolveComponents()───►│
 │                        │◄────────────────── ResolvedAtom[] ─────────│
 │                        │                                            │
 │                        │──────────────────── composeLayout() ──────►│
 │                        │◄────────────────── ComposedLayout ─────────│
 │                        │                                            │
 │                        │──────────────────── validate() ────────────►│
 │                        │◄────────────────── ValidationReport ────────│
 │                        │                                            │
 │                        │──format() + write()                        │
 │◄── HTML output ─────────│                                            │
 │                        │                                            │
```

### 9.2 `generate` With Provider Error & Retry

```
CLI Entry                  OpenAIProvider              OpenAI API
    │                           │                           │
    │──parseIntent()───────────►│                           │
    │                           │──POST /chat/completions──►│
    │                           │◄──────── 429 ─────────────│
    │                           │  (Retry-After: 5)         │
    │                           │  wait 5s + jitter          │
    │                           │──POST /chat/completions──►│
    │                           │◄──────── 500 ─────────────│
    │                           │  wait 2s + jitter          │
    │                           │──POST /chat/completions──►│
    │                           │◄── 200 { content: ... }───│
    │◄── ParsedIntent ──────────│                           │
    │                           │                           │
```

### 9.3 `validate` Command

```
User              CLI Entry          Validator
 │                    │                  │
 │  $ ai-css-kit      │                  │
 │  validate out.html │                  │
 │───────────────────►│                  │
 │                    │──read(file)       │
 │                    │──validate(html)──►│
 │                    │                  │──ruleFieldWrapper(html)
 │                    │                  │──ruleLabelPresence(html)
 │                    │                  │──ruleFieldSizeModifier(html)
 │                    │                  │──ruleNoParentMutation(html)
 │                    │                  │──ruleContextModifierExplicit(html)
 │                    │                  │──ruleValidModifiers(html)
 │                    │                  │──ruleAriaInteractive(html)
 │                    │                  │──ruleButtonVariant(html)
 │                    │                  │──ruleThemeValue(html)
 │                    │◄── ValidationReport ─│
 │                    │──format(report)   │
 │◄── text report ────│                  │
 │                    │──process.exit(code)  │
```

---

## 10. Validation Rule Catalogue

| Code | Severity | Description | Invariant |
|------|----------|-------------|-----------|
| `MISSING_FIELD_WRAPPER` | error | `.ui-input`, `.ui-select`, `.ui-textarea`, `.ui-checkbox`, `.ui-radio` not inside `.ui-field` | I-01 |
| `MISSING_FIELD_SIZE` | error | `.ui-field` without `ui-field--sm`, `ui-field--md`, or `ui-field--lg` | I-02 |
| `MISSING_LABEL` | error | `.ui-field` has no child with class `ui-label` | I-03 |
| `PARENT_SELECTOR_MUTATION` | error | `style` attribute contains padding/margin that implies external mutation pattern | I-04 |
| `COMPONENT_SIZE_ON_ATOM` | warning | Size modifier set directly on `.ui-input`/`.ui-select` instead of `.ui-field` | I-05 |
| `VALIDATION_ON_FIELD` | warning | `--error`/`--success`/`--warning` modifier on `.ui-field` instead of the input | I-06 |
| `INVALID_THEME_VALUE` | warning | `data-theme` attribute is not one of: default, dark, midnight, corporate, warm | I-07 |
| `IMPORTANT_USAGE` | error | `!important` found in any `style` attribute | I-10 |
| `MISSING_ARIA_LABEL` | warning | `<button>`, `<input>`, `<select>` without accessible name (no label, no aria-label) | WCAG 2.1 |
| `EMPTY_BUTTON_TEXT` | warning | `<button>` element has empty or whitespace-only text content | WCAG 2.1 |
| `BUTTON_MISSING_VARIANT` | error | `<button class="ui-button">` without variant class (`primary`, `secondary`, `ghost`) | ADR-0002 |
| `IMPLICIT_CONTEXT_MODIFIER` | error | `.ui-datepicker` child `.ui-input` without explicit `--icon-right` modifier | ADR-0001 |
| `AUTOCOMPLETE_MISSING_MODIFIER` | error | `.ui-autocomplete-trigger` child `.ui-input` without `--icon-left` modifier | ADR-0001 |
| `UNKNOWN_MODIFIER` | error | Class like `ui-input--foo` where `foo` is not in the registered modifier list | ADR-0002 |
| `SELECT_MISSING_PLACEHOLDER` | info | `<select class="ui-select">` has no option with `value=""` | UX best practice |
| `REQUIRED_NO_INDICATOR` | info | `required` attribute present but no visual indicator in label or helper text | UX best practice |

---

## 11. Testing Strategy

### 11.1 Test Pyramid

```
                  ┌─────────────┐
                  │ Integration │  3 tests (mocked LLM, real pipeline)
                  └──────┬──────┘
              ┌──────────┴──────────┐
              │     Unit Tests       │  ~60 tests
              │  (pure modules only) │
              └──────────┬──────────┘
        ┌─────────────── ┴──────────────────┐
        │          Fixture Tests             │  ~20 tests
        │  (IntentParser with mock provider) │
        └───────────────────────────────────┘
```

### 11.2 Unit Test Coverage Requirements

| Module | Test file | Coverage target | LLM mock needed |
|--------|-----------|-----------------|:---:|
| `component-resolver` | `component-resolver.test.js` | 100% | No |
| `layout-composer` | `layout-composer.test.js` | 100% | No |
| `validator` | `validator.test.js` | 100% | No |
| `intent-parser` | `intent-parser.test.js` | 90% | Yes (fixture JSON) |
| `config/loader` | `config.test.js` | 90% | No |
| `providers/retry` | `retry.test.js` | 100% | No |
| `providers/factory` | `factory.test.js` | 100% | No |
| `providers/openai` | `openai.test.js` | 80% | Yes (HTTP mock) |
| `providers/anthropic` | `anthropic.test.js` | 80% | Yes (HTTP mock) |
| `providers/ollama` | `ollama.test.js` | 80% | Yes (HTTP mock) |
| `providers/openai-compatible` | `openai-compatible.test.js` | 90% | Yes (HTTP mock) |

### 11.3 Key Test Scenarios

**Component Resolver** (pure, no mocks):

```javascript
// tests/pipeline/component-resolver.test.js
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { resolveComponents } from '../../src/pipeline/component-resolver.js';

describe('resolveInput', () => {
  test('renders basic text input with ui-field wrapper', () => {
    const atoms = resolveComponents({
      components: [{ id: 'input-1', type: 'input', size: 'md', label: 'Email',
                     variant: 'email', required: true, contextModifiers: [] }]
    });
    assert.equal(atoms.length, 1);
    assert.ok(atoms[0].wrapperHtml.includes('ui-field ui-field--md'));
    assert.ok(atoms[0].wrapperHtml.includes('ui-label'));
    assert.ok(atoms[0].html.includes('type="email"'));
    assert.ok(atoms[0].html.includes('aria-required="true"'));
  });

  test('applies icon-right context modifier', () => {
    const atoms = resolveComponents({
      components: [{ id: 'input-1', type: 'input', size: 'md', label: 'Date',
                     contextModifiers: ['icon-right', 'readonly'], variant: 'text' }]
    });
    assert.ok(atoms[0].html.includes('ui-input--icon-right'));
    assert.ok(atoms[0].html.includes('ui-input--readonly'));
    assert.ok(atoms[0].html.includes('readonly'));
  });

  test('throws ResolverError for unknown component type', () => {
    assert.throws(
      () => resolveComponents({ components: [{ id: 'x-1', type: 'unknown-widget' }] }),
      /Unknown component type/
    );
  });
});
```

**Validator** (pure, no mocks):

```javascript
// tests/pipeline/validator.test.js
describe('ruleFieldWrapper', () => {
  test('passes when input is inside .ui-field', () => {
    const html = '<div class="ui-field ui-field--md"><input class="ui-input"></div>';
    const report = validate(html);
    const codes = report.errors.map(e => e.code);
    assert.ok(!codes.includes('MISSING_FIELD_WRAPPER'));
  });

  test('fails when input is outside .ui-field', () => {
    const html = '<div><input class="ui-input" type="text"></div>';
    const report = validate(html);
    assert.ok(report.errors.some(e => e.code === 'MISSING_FIELD_WRAPPER'));
  });
});
```

**Provider Factory** (extensibility paths):

```javascript
// tests/providers/factory.test.js
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createProvider, registerProvider, listProviders } from '../../src/providers/factory.js';
import { LLMProvider } from '../../src/providers/base.js';

describe('registerProvider', () => {
  test('registers a custom provider and makes it createable', () => {
    class TestProvider extends LLMProvider {}
    registerProvider('test-custom', TestProvider);
    assert.ok(listProviders().includes('test-custom'));

    const instance = createProvider({ provider: { provider: 'test-custom', apiKey: 'x' } });
    assert.ok(instance instanceof TestProvider);
  });

  test('throws TypeError if class does not extend LLMProvider', () => {
    assert.throws(
      () => registerProvider('bad', class NotAProvider {}),
      /must extend LLMProvider/
    );
  });

  test('throws ConfigError if name conflicts with built-in', () => {
    assert.throws(
      () => registerProvider('openai', class X extends LLMProvider {}),
      /conflicts with a built-in/
    );
  });
});

describe('OpenAICompatibleProvider', () => {
  test('throws ConfigError when baseUrl is missing', () => {
    assert.throws(
      () => createProvider({ provider: { provider: 'openai-compatible', model: 'x' } }),
      /baseUrl/
    );
  });

  test('capabilities reflect config overrides', () => {
    const cfg = {
      provider: {
        provider: 'openai-compatible', model: 'x',
        baseUrl: 'http://localhost:1234/v1',
        supportsJsonMode: true, requiresApiKey: false,
      }
    };
    const p = createProvider(cfg);
    assert.equal(p.capabilities.supportsJsonMode, true);
    assert.equal(p.capabilities.requiresApiKey, false);
  });
});
```

**Intent Parser** (fixture-based, mock provider):

```javascript
// tests/pipeline/intent-parser.test.js
const FIXTURE_INTENT = JSON.parse(
  readFileSync('tests/fixtures/registration-form-intent.json', 'utf8')
);

test('normalizeIntent assigns sequential IDs', () => {
  const normalized = normalizeIntent(FIXTURE_INTENT);
  assert.equal(normalized.components[0].id, 'input-1');
  assert.equal(normalized.components[1].id, 'input-2');
  assert.equal(normalized.components[2].id, 'button-1');
});
```

### 11.4 Test Commands

```json
{
  "scripts": {
    "test":               "node --test tests/**/*.test.js",
    "test:unit":          "node --test tests/pipeline/**/*.test.js tests/providers/retry.test.js",
    "test:integration":   "node --test tests/integration/**/*.test.js",
    "test:coverage":      "node --experimental-test-coverage --test tests/**/*.test.js"
  }
}
```

---

## 12. Non-Functional Requirements

### 12.1 Performance

| Metric | Target | Notes |
|--------|--------|-------|
| Pipeline stages (non-LLM) | < 5ms total | Component Resolver + Layout Composer + Validator |
| CLI cold start | < 300ms | time-to-first-output before LLM call |
| First LLM token (OpenAI gpt-4o) | < 2s | network-dependent; measured P95 |
| Total generate command (OpenAI) | < 8s | includes full LLM response |
| Total generate command (Ollama/local) | < 30s | depends on hardware |

### 12.2 Compatibility

| Requirement | Value |
|-------------|-------|
| Node.js minimum | 18.0.0 (built-in fetch, node:test) |
| Node.js recommended | 20 LTS |
| OS | macOS, Linux, Windows (WSL2) |
| Package manager | npm ≥ 8, yarn ≥ 1.22, pnpm ≥ 8 |
| ESM | Yes (`.js` with `"type": "module"` in package.json) |

### 12.3 Security

| Concern | Mitigation |
|---------|------------|
| API key exposure | Never log API keys; redact from verbose output; never write to files |
| Prompt injection | System prompt is loaded from package bundle, not from user input |
| HTML output | All user-provided strings escaped with `escapeHtml()` before injection into templates |
| Config file | Warn if config file has world-readable permissions and contains `apiKey` literal string |
| SSRF via baseUrl | Validate `baseUrl` is `https://` or explicit `http://localhost` / `http://127.0.0.1`; warn on plain `http://` with non-loopback host |
| Custom provider class | `registerProvider()` validates the class extends `LLMProvider`; does not execute arbitrary code from config beyond the standard interface |

### 12.4 Determinism

The pipeline is designed so that for a **given ParsedIntent**, the output HTML is always identical:

```
Same ParsedIntent → same ResolvedAtom[] → same ComposedLayout → same validation result
```

Only the Intent Parser (LLM stage) is non-deterministic. Setting `temperature: 0` on the provider config maximises repeatability at this stage (model-dependent).

---

## 13. Open Questions

| # | Question | Impact | Proposed Resolution |
|---|----------|--------|---------------------|
| OQ-1 | Should the CLI be a separate npm package (`@ai-css-kit/cli`) or part of the root `ai-css-kit` package? | Tree-shaking, install size for CSS-only users | Separate package recommended; CSS-only users don't install `commander` |
| OQ-2 | How to handle multi-step forms (wizards) in the layout composer? | Phase 4.2 scope | Defer to Phase 4.3; document as known limitation |
| ~~OQ-3~~ | ~~Should `response_format: json_object` be required for all providers?~~ | ~~Some older models don't support it~~ | **Resolved:** `ProviderCapabilities.supportsJsonMode` flag; Intent Parser adapts request strategy automatically |
| OQ-4 | Caching strategy: cache ParsedIntent by SHA-256 of prompt + AI_CONTEXT version? | Performance for repeated calls | Phase 4.2 feature; mention in config as `cache: true/false` |
| OQ-5 | Streaming output: show HTML tokens as they arrive for long UIs? | UX for large forms | Optional `--stream` flag; requires streaming provider implementation |
| OQ-6 | Should `validate` accept inline `<style>` blocks with `@layer` for checking? | Validator completeness | Phase 5.1 scope; current validator checks HTML attributes only |
