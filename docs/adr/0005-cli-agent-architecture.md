# ADR-0005 — CLI Agent Architecture: split pipeline and provider abstraction

**Status:** Proposed  
**Date:** 2026-04-09  
**Author:** vadimjoy  
**Related ADRs:** [0001](0001-atomic-decoupling.md), [0002](0002-context-modifier-pattern.md), [0003](0003-ai-token-naming.md), [0004](0004-theme-mapper-and-presets.md)  
**Related Design Doc:** [phase-4.1-cli-architecture.md](../design/phase-4.1-cli-architecture.md)

---

## Context

Phase 4 of the roadmap introduces a CLI agent: `npx ai-css-kit generate "..."` — a command that accepts a natural language UI description and produces standards-compliant HTML using ai-css-kit components.

The central engineering challenge is that the pipeline combines two fundamentally different computational models:

1. **Probabilistic** — an LLM call that translates human language into a structured description. Output varies, errors are probabilistic (hallucinated component types, malformed JSON), and the call is slow and expensive.
2. **Deterministic** — mapping a structured component description to correct HTML. This must follow the exact rules of ADR-0001, ADR-0002, and ADR-0003 (atomic isolation, context modifiers, `--ai-*` tokens). Output must be reproducible and fully unit-testable.

If these two models are entangled in a single module, the entire pipeline becomes unpredictable and untestable. The key architectural question is: **where exactly is the LLM boundary, and what guarantees exist outside it?**

Additionally, the project targets three LLM backends — OpenAI, Anthropic, and Ollama (local) — with different API schemas, authentication mechanisms, and rate-limiting behaviours. A provider-agnostic interface is required.

---

## Decision

### 1. Four-Stage Split Pipeline

The `generate` command runs a strict linear pipeline with a single LLM-involved stage:

```
[Intent Parser]         ← only LLM stage
      ↓ ParsedIntent (JSON schema validated)
[Component Resolver]    ← pure deterministic, zero LLM
      ↓ ResolvedAtom[]
[Layout Composer]       ← pure deterministic, zero LLM
      ↓ ComposedLayout (HTML string)
[Validator]             ← pure deterministic, zero LLM
      ↓ ValidationReport
```

The LLM boundary is the output of the Intent Parser: a `ParsedIntent` JSON object whose schema is enforced by a JSON Schema validator before the deterministic stages receive it. If the LLM returns invalid or out-of-schema JSON, the pipeline throws `IntentParseError` with exit code 5, without touching the deterministic stages.

This separation provides:
- **100% unit testability** for 3 of 4 stages (Component Resolver, Layout Composer, Validator) — no mocks, no fixtures, pure function calls.
- **A stable, versioned contract** at the LLM boundary: `ParsedIntent`. When AI_CONTEXT.md changes, only the Intent Parser system prompt changes; the downstream stages are unaffected.
- **Regression safety**: if a new LLM model produces different `ParsedIntent` shapes, the schema validator catches it immediately — not after producing broken HTML.

### 2. Component Resolver as the "Determinism Guarantee"

The Component Resolver is the most critical module. It is a registry of pure template functions — one per component type — that map a `ComponentSpec` to a `ResolvedAtom` (HTML string + class list + ARIA attributes). No LLM, no network, no side effects.

Correctness rules are applied here:
- Context modifiers (`--icon-left`, `--icon-right`, `--readonly`) are applied explicitly per ADR-0001 and ADR-0002.
- `--ai-[component]-*` token naming is enforced via `--ai-*` in generated style overrides per ADR-0003.
- Invariants from `AI_CONTEXT.md` (I-01 through I-10) are enforced as code, not documentation.

Because the resolver is pure and deterministic, the same `ParsedIntent` always produces the same HTML output — regardless of which LLM provider generated the intent.

### 3. Provider Abstraction Layer with Open Registry

All LLM backends implement a common `LLMProvider` interface:

```
LLMProvider
  .complete(messages, options)  → CompletionResult
  .stream(messages, options)    → AsyncGenerator<string>
  .ping()                       → void (throws ProviderError if unreachable)
  .capabilities                 → ProviderCapabilities   ← NEW
```

The `capabilities` getter is a key extensibility mechanism. It lets the Intent Parser adapt its request strategy (e.g. whether to send `response_format: json_object`) without provider-specific branching in pipeline code. Each subclass overrides only the capabilities it changes from the base defaults.

Four built-in adapters ship with the package:

| Name | API | Notes |
|------|-----|-------|
| `openai` | OpenAI Chat Completions (`/v1/chat/completions`) | `response_format: json_object` supported |
| `anthropic` | Anthropic Messages (`/v1/messages`) | system message extracted to top-level; JSON via prompt only |
| `ollama` | Ollama `/api/chat` | `format: "json"` best-effort; no API key required |
| `openai-compatible` | OpenAI Chat Completions protocol | `baseUrl` required; covers Groq, Mistral, LM Studio, Azure OpenAI, etc. |

`OpenAICompatibleProvider` extends `OpenAIProvider` with a mandatory `baseUrl` and configurable capabilities (`supportsJsonMode`, `requiresApiKey`, `maxContextTokens` via config). This covers any service that speaks the OpenAI Chat Completions schema without writing a new adapter class.

**Open registry** — `factory.js` exposes `registerProvider(name, Class)`:

```javascript
// user's .ai-css-kit.config.js
import { registerProvider } from 'ai-css-kit/cli';
import { MyCompanyProvider } from './providers/my-company.js';

registerProvider('my-company', MyCompanyProvider);

export default { provider: { provider: 'my-company', ... } };
```

`registerProvider` validates that the class extends `LLMProvider` and that the name does not conflict with built-ins. The factory then resolves custom providers before falling back to built-ins. Result: adding a new provider requires zero changes to the CLI source code.

All adapters use Node.js built-in `fetch` (Node ≥ 18). No LLM SDKs are added as runtime dependencies.

### 4. Retry Strategy with Exponential Backoff

All provider HTTP calls are wrapped in `withRetry()` with:
- Max 3 attempts
- Exponential backoff: `baseDelay * 2^(attempt-1)` ms, capped at 15 seconds
- ±20% random jitter to prevent thundering herd
- Retry on HTTP 429 (respecting `Retry-After` header), 500, 502, 503, and network errors
- Immediate throw on 400, 401, 403, 404, 422 (unretryable errors)

### 5. Config Resolution Chain

Configuration is resolved in this priority order (later overrides earlier):

```
Hardcoded defaults
  ← .ai-css-kit.config.js (discovered by walking up from CWD)
    ← Environment variables (OPENAI_API_KEY, AI_CSS_KIT_PROVIDER, etc.)
      ← CLI flags (--provider, --model, --theme, --temperature, ...)
```

API keys are **never** committed to config files — they are read from environment variables. The `config init` command generates a template that uses `process.env.OPENAI_API_KEY`.

### 6. Single External Dependency at Runtime

The CLI runtime has one external dependency: `commander` (CLI argument parsing). All other functionality uses Node.js built-ins (`node:fs`, `node:path`, `node:url`, `globalThis.fetch`). This minimises supply-chain risk and install size for end users.

---

## Consequences

### Positive

- **3 of 4 pipeline stages are 100% unit-testable** without any LLM, network, or mock infrastructure. This directly supports the Phase 4 success criterion: "Component Resolver is 100% unit-tested (no LLM)".
- **Validator detects all known anti-patterns** before the user sees output. Every rule in the Validation Rule Catalogue maps back to an invariant from `AI_CONTEXT.md` or an ADR — no ad-hoc heuristics.
- **Provider flexibility without code changes**: switching from OpenAI to Ollama requires only a config file change (`provider: 'ollama'`). No pipeline code changes.
- **`OpenAICompatibleProvider` covers ~10 additional providers** (Groq, Mistral, LM Studio, Together AI, Azure OpenAI, Perplexity, etc.) with zero new adapter code — only a `baseUrl` config change.
- **`registerProvider()` enables third-party extensibility**: enterprise users, air-gapped deployments, or niche providers can integrate without forking the package.
- **`ProviderCapabilities` negotiation** removes all provider-specific branching from pipeline code. Adding a new capability (e.g. `supportsVision`) requires adding one field to the interface and one read in the relevant pipeline stage.
- **Determinism guarantee**: for the same `ParsedIntent`, the HTML output is identical across every run, regardless of provider, model, or execution environment.
- **Minimal footprint**: the single `commander` runtime dependency means CSS-only users (who never install the CLI) are not penalised.

### Negative / Trade-offs

- The `ParsedIntent` JSON schema becomes a **versioned contract** — changes to AI_CONTEXT.md that affect the intent structure require a coordinated schema migration.
- The split between the probabilistic Intent Parser and the deterministic resolver means **errors at the LLM boundary are terminal** for that run (the user must retry). There is no partial recovery.
- Using native `fetch` means **streaming support requires manual SSE parsing** (no high-level streaming abstractions from an SDK). This is acceptable for the initial implementation.
- Walking up the directory tree to find `.ai-css-kit.config.js` is a small performance hit on cold start (< 5ms in practice). In monorepos, care is needed to avoid loading a parent project's config unintentionally.
- `registerProvider()` executes code imported from the user's config file. This is **by design** (same model as Vite/ESBuild plugins) but requires the same trust as any config file — the user must audit third-party provider packages they import.
- `OpenAICompatibleProvider` with `supportsJsonMode: false` relies on prompt-only JSON instruction, which is less reliable than API-level constraints. Validation via `schema-validator.js` is the safety net.

---

## Alternatives Considered

### A. Single monolithic `generate` function with LLM + templating mixed

Simplest implementation: call LLM with "generate HTML for ai-css-kit" and return the response directly.

**Rejected:** Output is non-deterministic and unvalidated. The LLM can hallucinate class names, miss ARIA attributes, or create parent-selector mutations (ADR-0001 violations). No unit testing is possible. This approach directly contradicts the "Deterministic UI Lego" principle.

### B. Use the OpenAI SDK / Anthropic SDK

Replace the custom HTTP fetch adapters with the official `openai` and `@anthropic-ai/sdk` packages.

**Rejected:** These SDKs are large (500KB+ each) and would become runtime dependencies for all users who `npm install ai-css-kit`. The `ai-css-kit` package is a CSS library; bundling LLM SDKs would be a severe misuse of the install footprint. Native `fetch` (Node ≥ 18) provides everything needed.

### E. Closed built-in registry (no `registerProvider()`)

Ship only the four built-in providers and document how to submit a PR to add new ones.

**Rejected:** Enterprise users with internal LLM endpoints cannot wait for upstream PRs. Air-gapped deployments require local providers not suitable for the public package. The `registerProvider()` pattern (used by Vite, ESBuild, Rollup) is well-understood by the JS ecosystem and adds no runtime overhead when unused.

### C. LangChain / LlamaIndex orchestration

Use an existing AI orchestration framework for the pipeline.

**Rejected:** These frameworks impose their own abstractions, versions, and dependency trees. The ai-css-kit pipeline is simple (4 linear stages), and the deterministic stages (Resolver, Composer, Validator) have no value from a generic orchestration layer. The "Deterministic UI Lego" philosophy favours minimal, explicit, auditable code over framework magic.

### D. Generate HTML directly in Component Resolver from raw prompt (skip Intent Parser)

Skip the LLM entirely; use a regex/keyword parser to extract component intents from the prompt.

**Rejected:** Natural language is too varied for reliable regex parsing. A prompt like "a form for signing up" must be understood semantically. This approach would require maintaining a custom NLP system, which is out of scope.

### E. Separate CLI package (`@ai-css-kit/cli`) vs. root package

Two options were considered:
1. CLI code inside root `ai-css-kit` package (current proposal for Phase 4.1)
2. Separate `@ai-css-kit/cli` scoped package

**Decision deferred (OQ-1 in design doc):** Phase 4.1 ships CLI code inside the root package as `cli/` subdirectory. If install size feedback from CSS-only users is negative, extraction to a separate package is straightforward (no API changes needed, only `package.json` split).

---

## Release / Follow-up

- [ ] Implement `cli/` directory structure per [design doc §3](../design/phase-4.1-cli-architecture.md#3-module-structure)
- [ ] Implement `ProviderCapabilities` getter in `base.js` and all four built-in adapters
- [ ] Implement `registerProvider()` + `listProviders()` in `factory.js`
- [ ] Implement `OpenAICompatibleProvider` in `openai-compatible.js`
- [ ] Implement capability negotiation in `intent-parser.js` (`supportsJsonMode` branch)
- [ ] Write unit tests for Component Resolver covering all 15 component types
- [ ] Write unit tests for Validator covering all 16 rules in the catalogue
- [ ] Write unit tests for `factory.js` covering `registerProvider()` happy path + all error cases
- [ ] Write unit tests for `OpenAICompatibleProvider` with mocked HTTP
- [ ] Write integration test for `generate` command with mocked LLM provider
- [ ] Add `bin.ai-css-kit` entry to root `package.json` pointing to `cli/bin/ai-css-kit.js`
- [ ] Document CLI in `docs/en/cli.md` (Phase 4 success criterion)
- [ ] Document `registerProvider()` and `openai-compatible` in `docs/en/cli.md`
- [ ] Update `AI_CONTEXT.md` to v0.7.0 with CLI usage section
- [ ] Update `MASTER_PLAN.md` Phase 4 success criteria checkboxes on completion
