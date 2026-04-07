# AI CSS Kit — Master Plan (Roadmap)

> **Language:** English | [Русский](../ru/MASTER_PLAN.md)

> **Concept:** "Deterministic UI Lego"  
> **Goal:** A CSS framework optimised for UI generation by AI agents  
> **Author:** vadimjoy | **License:** MIT | **Plan version:** 1.0 (2026-04)

---

## Context and Starting Point

State of the kit at v0.3.1:

- 15 components, Pure CSS, design tokens on `--ui-*` variables
- Components were **tightly coupled**: `datepicker` and `autocomplete` mutated `.ui-input` via parent-selector
- No machine-readable context for AI agents
- No CLI, no automated visual tests
- Theming worked only via manual variable overrides

Concrete coupling problems found in the code:

```css
/* datepicker.css:15 — violates Input autonomy */
.ui-datepicker__input-wrapper .ui-input { padding-right: 40px; }

/* autocomplete.css:15 — same problem */
.ui-autocomplete__input-wrapper .ui-input { padding-left: 36px; }
```

An AI agent generating `ui-datepicker` cannot predict that it silently changes the padding of `ui-input`. That is the root of non-determinism.

---

## "Deterministic UI Lego" Principles

1. **Isolation** — a component does not affect the styles of another component from the outside
2. **Predictability** — one class combination = one and only one visual result
3. **Machine-readability** — every token and component is described in a form that AI understands without interpretation
4. **Composability** — any N components can be assembled together without conflicts
5. **Reversibility** — every decision is documented in an ADR and can be reconsidered

---

## Phase 1 — Architectural Decoupling (The Decoupling)

**Target version:** v0.4.0  
**Effort:** ~2–3 weeks

### What We Do

#### 1.1 Coupling dependency audit

Perform a full audit of all cases where a container component overrides styles of a nested component via a parent-selector chain:

| Location | Problem |
|----------|---------|
| `datepicker.css:15` | `.ui-datepicker__input-wrapper .ui-input` mutates padding |
| `autocomplete.css:15` | `.ui-autocomplete__input-wrapper .ui-input` mutates padding |
| Any future cases | Prohibited by the standard |

#### 1.2 Context Modifier Pattern standard

Instead of mutating a child component, introduce an **explicit modifier** on the component itself:

```css
/* BEFORE (violation) */
.ui-datepicker__input-wrapper .ui-input {
  padding-right: 40px;
}

/* AFTER (standard) */
.ui-input--icon-right {
  padding-right: 40px;
}
```

The AI agent now explicitly states the modifier in markup:

```html
<!-- BEFORE: hidden behaviour, agent unaware of the mutation -->
<div class="ui-datepicker__input-wrapper">
  <input class="ui-input"> <!-- silently gets padding-right: 40px -->
</div>

<!-- AFTER: explicit contract -->
<div class="ui-datepicker__input-wrapper">
  <input class="ui-input ui-input--icon-right"> <!-- intent is visible in the class -->
</div>
```

#### 1.3 Independent module standard

Every component must conform to the **Module Contract**:

```
MODULE CONTRACT for component X:
  ✓ All states controlled by own classes (--modifier)
  ✓ Component has no CSS rules targeting another component's classes
  ✓ Component is independent of CSS import order
  ✓ Component works outside .ui-field wrapper (where applicable)
  ✓ Component is documented in SPEC.md with a full HTML contract
```

#### 1.4 Input decomposition

Input (`ui-input`) is the base atom. Explicit modifiers are extracted:

| New class | What it does | Origin |
|-----------|-------------|--------|
| `.ui-input--icon-left` | `padding-left: 36px` | from `.ui-input-wrapper .ui-input` |
| `.ui-input--icon-right` | `padding-right: 40px` | from `.ui-datepicker__input-wrapper .ui-input` |
| `.ui-input--readonly` | cursor: pointer, no caret | new |

#### 1.5 Calendar (Datepicker) decomposition

Datepicker is split into independent layers:

```
ui-datepicker            ← Orchestrator (position: relative only)
  ui-datepicker__trigger ← Trigger wrapper (flex, align-items)
  ui-input + .ui-input--icon-right ← Input atom (no mutation)
  ui-datepicker__icon    ← Icon atom (position: absolute)
  ui-datepicker__panel   ← Panel (former __calendar)
    ui-calendar          ← Independent Calendar Grid component
      ui-calendar__header
      ui-calendar__grid
      ui-calendar__day
```

`ui-calendar` must be reusable in date-range-picker, time-picker, etc. without rewriting.

### Why This Matters for AI

An AI agent builds markup from atomic rules. If component A secretly affects component B, the agent either:
- misses the effect (generates broken markup), or
- must "know" about every parent-selector relationship (exponentially growing context).

Deterministic atoms with explicit modifiers give **O(1) context** per component instead of **O(N²)**.

### Phase 1 Success Criteria

- [x] No component CSS file contains rules targeting another component's classes *(lint:coupling, 2026-04-02)*
- [x] Audit script (Node.js) runs in CI and fails on violation *(scripts/audit-coupling.js + npm run lint:coupling)*
- [x] `ui-input` has a full set of explicit modifiers for all contexts *(--icon-left/right/search/readonly)*
- [x] `ui-datepicker` and `ui-autocomplete` updated to the new standard *(no more parent-selector mutations)*
- [x] `SPEC.md` updated with new HTML contracts *(input, autocomplete, datepicker, card)*

---

## Phase 2 — AI Context Standardisation

**Target version:** v0.5.0  
**Effort:** ~1–2 weeks

### What We Do

#### 2.1 AI_CONTEXT.md

A machine-readable document that an AI agent loads as a system prompt before generating markup. Structure:

```markdown
# AI CSS Kit — Context for AI Agents

## Invariants (rules that must never be violated)
## Component Registry (full component list + their classes)
## Composition Rules (how to combine components)
## Anti-patterns (what must not be generated)
## Token Reference (all --ui-* variables with semantics)
```

#### 2.2 ADR system (Architectural Decision Records)

Every architectural decision is captured in `docs/adr/NNNN-title.md` (single canonical English source).

ADR format:

```markdown
# NNNN — Decision title
## Status: [Proposed | Accepted | Deprecated | Superseded by NNNN]
## Context
## Decision
## Consequences
## Alternatives considered
```

Starting list:

| # | Title | Status |
|---|-------|--------|
| 0001 | Atomic Decoupling — ban parent-selector mutations | Accepted |
| 0002 | Context Modifier Pattern for icons | Proposed |
| 0003 | Transition from `--ui-*` to `--ai-[component]-[prop]` (phased) | Proposed |

#### 2.3 `--ai-[component]-[prop]` naming standard

**Problem:** The current `--ui-color-primary` carries no information about which component uses it. An AI agent cannot locally customise only the button without affecting all components that use this token.

**Solution:** Two-level variable system:

```css
/* Level 1: Global Tokens (unchanged, backward-compatible) */
:root {
  --ui-color-primary: #4f46e5;
  --ui-radius-md: 8px;
}

/* Level 2: Component Tokens (new, override global) */
:root {
  /* Format: --ai-[component]-[property] */
  --ai-button-bg:           var(--ui-color-primary);
  --ai-button-bg-hover:     var(--ui-color-primary-hover);
  --ai-button-radius:       var(--ui-radius-md);
  --ai-button-font-size:    var(--ui-font-size-md);

  --ai-input-border:        var(--ui-color-border);
  --ai-input-border-focus:  var(--ui-color-border-focus);
  --ai-input-radius:        var(--ui-radius-md);
  --ai-input-bg:            var(--ui-color-bg);

  --ai-calendar-day-size:   32px;
  --ai-calendar-selected-bg: var(--ui-color-primary);
}
```

Component files use `--ai-*` tokens that reference global tokens by default. The AI agent can customise a single component without cascade effects.

**Migration:** Phased. `--ui-*` remain as Level 1 aliases for backward compatibility.

### Phase 2 Success Criteria

- [x] `AI_CONTEXT.md` created and kept up to date *(v0.5.0, full --ai-* Token Reference, 2026-04-04)*
- [x] `docs/adr/` contains at least 3 ADRs (0001–0003) *(0001 Atomic Decoupling, 0002 Context Modifier, 0003 AI Token Naming)*
- [x] All components have `--ai-[component]-*` tokens *(all 15 components updated)*
- [x] `--ui-*` tokens preserved as aliases (zero breaking changes) *(`--ai-*` reference `--ui-*` by default)*
- [x] `docs/adr/README.md` with decision index *(index updated)*

---

## Phase 3 — Theming and Design Tokens

**Target version:** v0.6.0  
**Effort:** ~2–3 weeks

### What We Do

#### 3.1 External theme format

Define a unified format for importing third-party themes:

```json
{
  "meta": {
    "name": "Midnight Pro",
    "version": "1.0.0",
    "author": "designer@example.com"
  },
  "tokens": {
    "color.primary":     "#6d28d9",
    "color.primary.hover": "#5b21b6",
    "radius.md":         "12px",
    "font.family":       "JetBrains Mono, monospace"
  }
}
```

#### 3.2 Theme Mapper

Node.js script `scripts/theme-map.js` that accepts a JSON theme and generates a CSS file with mappings:

```bash
npx ai-css-kit theme-map ./my-theme.json -o ./dist/themes/midnight-pro.css
```

#### 3.3 External system mapping

Support for importing tokens from popular formats:

| Source | Status | Format |
|--------|--------|--------|
| W3C Design Tokens Format | v0.6.0 | JSON (`$value`, `$type`) |
| Figma Tokens Plugin | v0.6.0 | JSON (`value`, `type`) |
| Tailwind config | v0.7.0 | JS/JSON `theme.extend.*` |
| Style Dictionary | v0.7.0 | JSON properties |

#### 3.4 Built-in theme presets

```
dist/themes/
  default.css      ← current light theme (renamed)
  dark.css         ← current dark theme (renamed)
  midnight.css     ← new: deep dark with purple accent
  corporate.css    ← new: neutral grey, sans-serif
  warm.css         ← new: warm tones, rounded
```

#### 3.5 CSS `@layer` for cascade priorities

All component styles moved into `@layer`, so themes always win without `!important`:

```css
@layer ai-kit.tokens, ai-kit.base, ai-kit.components, ai-kit.themes;

@layer ai-kit.components {
  .ui-button--primary { background: var(--ai-button-bg); }
}

@layer ai-kit.themes {
  /* Theme always wins — declared in a higher layer */
  [data-theme="midnight"] { --ai-button-bg: #6d28d9; }
}
```

### Phase 3 Success Criteria

- [x] `scripts/theme-map.js` works and is covered by tests *(28 unit tests, Node built-in test runner, 2026-04-07)*
- [x] W3C Design Tokens and Figma Tokens formats supported *(detectFormat + flattenTokens, 2026-04-07)*
- [x] At least 3 built-in theme presets *(5 presets: default, dark, midnight, corporate, warm, 2026-04-07)*
- [x] `@layer` implemented for all component styles *(ai-kit.tokens, ai-kit.base, ai-kit.components, ai-kit.themes, 2026-04-07)*
- [x] Documentation with examples in `docs/theming.md` *(Token Reference, CLI examples, @layer explanation, 2026-04-07)*

---

## Phase 4 — CLI Agent (The Orchestrator)

**Target version:** v0.8.0  
**Effort:** ~4–6 weeks

### What We Do

#### 4.1 CLI architecture

```
ai-css-kit generate "registration form with email, password and a button"
```

Internal agent pipeline:

```
[Natural Language Input]
         ↓
[Intent Parser]         ← LLM call (OpenAI/Anthropic/local)
         ↓
[Component Resolver]    ← maps intents → kit components
         ↓
[Layout Composer]       ← assembles HTML from atoms following Phase 1 rules
         ↓
[Validator]             ← checks generated HTML against Module Contract
         ↓
[Output: HTML + CSS overrides]
```

#### 4.2 Intent Parser

Translates free text into a structured request:

```json
{
  "layout": "form",
  "components": [
    { "type": "input", "variant": "email", "size": "md", "label": "Email" },
    { "type": "input", "variant": "password", "size": "md", "label": "Password" },
    { "type": "button", "variant": "primary", "size": "md", "text": "Sign Up" }
  ],
  "theme": "default",
  "container": "card"
}
```

#### 4.3 Component Resolver

A pure deterministic module (no LLM). Accepts a structured request and returns the correct HTML. Takes rules directly from `AI_CONTEXT.md` — single source of truth.

#### 4.4 Validator

Checks generated HTML for Module Contract compliance:

```bash
ai-css-kit validate ./output.html
# ✓ All components use valid class combinations
# ✓ No deprecated parent-selector patterns detected
# ✓ All required ARIA attributes present
# ✗ WARNING: .ui-input missing .ui-field wrapper
```

### Phase 4 Success Criteria

- [ ] `npx ai-css-kit generate "..."` works end-to-end
- [ ] Component Resolver is 100% unit-tested (no LLM)
- [ ] Validator detects all known anti-patterns
- [ ] Providers supported: OpenAI, Anthropic, Ollama (local)
- [ ] Documentation in `docs/en/cli.md`

---

## Phase 5 — Ecosystem and Validation

**Target version:** v1.0.0  
**Effort:** ~3–4 weeks

### What We Do

#### 5.1 Visual Regression Tests (Playwright)

Automatic verification of every component in all states.

#### 5.2 AI Accuracy Tests

A dedicated test suite: an AI agent generates markup from a prompt; Playwright verifies the result.

#### 5.3 Component Playground (Storybook-like)

A static showcase based on existing `src/demos/*.html`, extended with a live token editor.

#### 5.4 Compatibility monitoring

An automated CI job that weekly:
1. Generates 20 standard UI patterns via the CLI agent
2. Runs visual tests
3. Publishes a report to `docs/reports/compatibility-YYYY-WW.md`

#### 5.5 npm publication + documentation site

```
docs/site/          ← static site (Astro or 11ty)
  /components       ← live examples
  /tokens           ← table of all --ai-* variables
  /cli              ← CLI documentation
  /themes           ← theme gallery
```

### Phase 5 Success Criteria

- [ ] Visual regression tests for all 15 components
- [ ] AI Accuracy Tests for 10 standard UI patterns
- [ ] CI pipeline: lint → build → unit → visual → ai-accuracy
- [ ] Public npm package at version 1.0.0
- [ ] Documentation site deployed

---

## Roadmap Summary

| Phase | Version | Key Result | Priority |
|-------|---------|-----------|----------|
| 1. Decoupling | v0.4.0 | Atomic components without coupling | Critical |
| 2. AI Context | v0.5.0 | AI_CONTEXT.md + ADR + `--ai-*` tokens | Critical |
| 3. Theming | v0.6.0 ✅ | Theme Mapper + JSON themes + @layer | High |
| 4. CLI Agent | v0.8.0 | `npx ai-css-kit generate` | High |
| 5. Ecosystem | v1.0.0 | Visual tests + AI accuracy + public site | Medium |

---

*This document is a living artefact. Updated on completion of each phase.*
