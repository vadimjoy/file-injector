# AI CSS Kit — Master Plan (Roadmap)

> **Language:** English | [Русский](../ru/MASTER_PLAN.md)

> **Concept:** "Deterministic UI Lego"  
> **Goal:** A CSS framework optimised for UI generation by AI agents  
> **Author:** vadimjoy | **License:** MIT | **Plan version:** 1.2 (2026-04-17)

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

## Phase 4.2 — Kit Consolidation and Visual Cleanup

> **Sub-phase of Phase 4.** Wedged between Phase 4.1 (Architecture, ✅ complete) and the preliminary scalability tracks (A + B + F). Blocker for all remaining CLI sub-phases (4.4 Intent Parser onward).

**Target version:** v0.7.x (before Tracks A/B/F start)  
**Effort:** ~2–3 weeks  
**Full plan:** [`docs/plans/KIT_CONSOLIDATION.md`](../../plans/KIT_CONSOLIDATION.md) *(filename retained from early working title "Phase 6" — it is the detailed spec for sub-phase 4.2)*  
**Scalability track:** G

### Context

During the v0.6.x expansion the kit grew from 15 to 54 components without a consolidation pass. The surface is visually inconsistent (mismatched radii, shadows, and theme typography), has duplicated atomic primitives (circle-icon clones in `feature-item`, `chat`, `notification`, `stat-card`, `feed`), `feed` and `timeline` render the same activity stream two different ways, and `banner` / `callout` / `alert` are three near-identical notification families. Demos carry 258 inline-style occurrences and five theme experiments with quirky typography. Until this surface is consolidated, the CLI resolver (sub-phase 4.5) would generate markup against an inconsistent set of primitives.

### What We Do

#### 4.2.1 Atomic audit and re-layering

Classify all 54 components across **Foundations / Atoms / Molecules / Organisms**. Move `typography`, `color-swatch`, `icon` into `src/css/foundations/`. Reorder imports in `src/css/index.css` by atomic layer with section separators.

#### 4.2.2 Extract shared atoms `icon-tile` and `dot`

Create `src/css/components/icon-tile.css` (circular/square coloured icon tile — used by `feature-item`, `chat`, `notification`, `stat-card`, `feed`) and `src/css/components/dot.css` (status / notification dot). Remove duplicated `__icon--primary/success/warning/error/dark` modifiers from the five component files. Register both atoms in `AI_CONTEXT.md` and `COMPONENT_PREFIXES`.

#### 4.2.3 Merge `feed` + `timeline` → `timeline`

Both render a vertical activity stream with an icon column and connector line. Keep the richer API under `ui-timeline`, turn `ui-feed` into a deprecated stub, delete the duplicated CSS.

#### 4.2.4 Merge `banner` + `callout` → `alert` modifiers

The three families collapse into `ui-alert` with modifiers `--banner` (full-width, no radius) and `--callout` (bordered panel). Demos and `AI_CONTEXT.md` updated.

#### 4.2.5 Visual cleanup

- Remove Verdana from `src/themes/warm.json`
- Remove forced monospace from `src/themes/midnight.json`
- Delete `feature-item__icon--dark` modifier (replaced by `icon-tile`)
- Unify radii and shadows through tokens (no magic literals in component files)

#### 4.2.6 Module Contract v2

Extend `audit-coupling.js` with two new lints:
- `lint:inline-styles` — forbids `style=""` in `src/demos/**/*.html` (currently 258 violations)
- `lint:atomic-imports` — a molecule/organism cannot import another molecule; only atoms and foundations are allowed upstream

Record as an amendment to ADR-0001 (Module Contract v2).

#### 4.2.7 Purge inline styles from demos

All 258 inline `style` occurrences are replaced by the `u-stack`, `u-grid`, `u-cluster` utilities (adding any missing ones into `src/css/utilities/`). A prerequisite for sub-phase 4.3 — the playground is built on clean demo markup.

### Sub-phase 4.2 Success Criteria

- [ ] Component count reduced from 54 → ~50 (3 merges, 3 deletions, 2 new atoms, rest renamed / re-layered)
- [ ] `src/css/foundations/` directory with `typography`, `color-swatch`, `icon`
- [ ] `icon-tile` and `dot` used in at least 4 components each
- [ ] `feed` deleted (stub only); activity stream lives in `timeline`
- [ ] `alert` with `--banner` / `--callout` modifiers; legacy files deleted
- [ ] `warm.json` and `midnight.json` no longer force non-system fonts
- [ ] `feature-item__icon--dark` deleted
- [ ] `npm run lint:inline-styles` passes (0 inline styles in demos)
- [ ] `npm run lint:atomic-imports` passes
- [ ] `AI_CONTEXT.md` Component Registry updated
- [ ] ADR-0001 amended with Module Contract v2

---

## Phase 4.3 — Interactive Demos (Playground)

> **Sub-phase of Phase 4.** Follows 4.2 Kit Consolidation, precedes the preliminary scalability tracks. Blocker for all remaining CLI sub-phases.

**Target version:** v0.8.0-pre (after sub-phase 4.2, before Tracks A/B/F start)  
**Effort:** ~2–3 weeks  
**Full plan:** [`docs/plans/DEMO_PLAYGROUND.md`](../../plans/DEMO_PLAYGROUND.md) *(filename retained from early working title "Phase 7" — it is the detailed spec for sub-phase 4.3)*  
**Scalability track:** H

### Context

The 29 current static HTML demos do not let the user (or the AI agent validating output) exercise size modifiers, state flags, or token overrides without hand-editing markup. There is no interactive reference for the CLI to validate against. The solution is a **schema-driven playground**: a thin Vanilla JS host (≤ 12 KB gzipped) that renders four panels per component (Preview / Controls / Code / Tokens) from a JSON schema. The playground then serves as the canonical reference contract for the CLI: what lands in the playground → passes the validator, and vice versa.

### What We Do

#### 4.3.1 Playground skeleton

`src/demos/playground/` with four panels:
- **Preview** — live component render inside an iframe for isolation
- **Controls** — segmented, select, range, text, toggle, color inputs — all generated from schema
- **Code** — rendered HTML with a "Copy" button
- **Tokens** — live `--ai-*` token values with inline overrides

No framework. ES modules, no build step.

#### 4.3.2 Schema format and bindings

```json
{
  "component": "button",
  "template": "<button class=\"ui-button {variant} {size}\" {disabled}>{label}</button>",
  "controls": [
    { "type": "segmented", "key": "variant", "bindsClass": true,
      "options": ["ui-button--primary","ui-button--secondary","ui-button--ghost"] },
    { "type": "segmented", "key": "size", "bindsClass": true,
      "options": ["ui-button--sm","ui-button--md","ui-button--lg"] },
    { "type": "text",      "key": "label",    "bindsText": true  },
    { "type": "toggle",    "key": "disabled", "bindsAttr": "disabled" }
  ],
  "tokens": ["--ai-button-bg","--ai-button-radius","--ai-button-font-size"]
}
```

Binding types: `bindsClass`, `bindsVar`, `bindsAttr`, `bindsText`, `bindsRepeat`.

#### 4.3.3 Schema library

One schema per consolidated component (~50 files) in `src/demos/playground/schemas/`. Each legacy demo HTML shrinks to ≤ 25 lines (playground mount + `<script data-schema="button.json">`).

#### 4.3.4 Global controls: theme / density / RTL / viewport

Layered on top of per-component schema:
- Theme picker (5 presets)
- Density toggle (prep for D-1)
- RTL flip
- Viewport presets (mobile / tablet / desktop)

#### 4.3.5 Export and share

- "Copy HTML" → clipboard
- "Copy token overrides" → clipboard (changed tokens only)
- "Export JSON state" → downloadable file, round-trippable (reloads playground state) — also serves as the CLI hand-off format (`ai-css-kit generate --from-playground ./state.json`)

#### 4.3.6 CLI validator integration

The validator from Track E-2 wires into the "Code" panel: every change triggers `validate(html)` and warnings show inline. The AI agent gets a canonical feedback loop — what lands in the CLI passes the validator; what passes the validator shows green in the playground.

### Sub-phase 4.3 Success Criteria

- [ ] Playground skeleton (preview + controls + code + tokens) functional
- [ ] Schema loader + binding engine ≤ 12 KB gzipped
- [ ] One schema per consolidated component (~50 files)
- [ ] Legacy `src/demos/*.html` replaced (or reduced to ≤ 25 lines each)
- [ ] Global controls (theme / density / RTL / viewport)
- [ ] "Copy HTML" and "Export JSON" work
- [ ] Inline validation from Track E-2
- [ ] Zero inline styles (enforced by `lint:inline-styles` from sub-phase 4.2)

---

## Scalability Workstream

> **Reference document:** [`docs/plans/SCALABILITY_PLAN.md`](../../plans/SCALABILITY_PLAN.md)  
> **Contributor guide:** [`docs/guides/scalability.md`](../../guides/scalability.md)  
> **Audit baseline:** [`docs/audit/scalability-audit-phases-1-3.md`](../../audit/scalability-audit-phases-1-3.md)

The scalability plan runs **in parallel** with Phases 4–5. Its **eight** tracks close technical debt from Phases 1–3 and lay the foundation for expanding to 50+ components, grid layouts, new design concepts, and a scalable CLI. Tracks must be started at the phase boundaries shown below:

| Phase boundary | Version | Tracks to start |
|----------------|---------|-----------------|
| **Sub-phase 4.2 — Kit Consolidation** | **v0.7.x** | **G** (atomic re-layering, dedup, visual cleanup) — *described above, blocker for 4.4+* |
| **Sub-phase 4.3 — Demo Playground** | **v0.8.0-pre** | **H** (schema-driven playground: preview + controls + code + tokens) — *described above, blocker for 4.4+* |
| Before the remaining Phase 4 work | v0.7.0 (parallel to 4.2) | **A** (Foundational Fixes), **B** (Token Modularisation), **F** (CI Automation) |
| During Phase 4.4+ CLI build | v0.8.0 | **E** (CLI Scalability: plugin resolver, rule registry, context slicing) |
| Sub-phase 4.8 — component expansion | v0.8.x | **C-1** (Grid system), **C-2** (new form components), **C-4** (scaffold script) |
| Phase 5 — ecosystem | v0.9.0 | **C-3** (display components), **D-1** (density modes), **D-2** (responsive tokens), **D-3** (multi-brand), **D-4** (motion tokens) |

> Every new component or token added after Phase 4 must follow the checklist in `docs/guides/scalability.md`.  
> Sub-phases **4.2** and **4.3** **wedge in before Tracks A/B/F** and are blockers for the remaining CLI sub-phases (4.4 Intent Parser, 4.5 Component Resolver, 4.6 Validator, 4.7 CLI modes) — the CLI agent cannot ship end-to-end until the component surface is consolidated and demos are migrated to the schema-driven playground.

---

## Phase 4 — CLI Agent (The Orchestrator)

**Target version:** v0.8.0  
**Effort:** ~4–6 weeks (excluding sub-phases 4.2 / 4.3)

> **Phase 4.1 — Architecture & API Design** ✅ Complete *(2026-04-09)*  
> Full specification: [`docs/design/phase-4.1-cli-architecture.md`](../../design/phase-4.1-cli-architecture.md)
>
> **Phase 4.2 — Kit Consolidation** and **Phase 4.3 — Interactive Demos** are specified above (before the "Scalability Workstream" section). They are blockers for sub-phases 4.4–4.7; the remaining CLI sub-phases cannot start until 4.2 and 4.3 ship.

### What We Do

#### 4.1 CLI architecture ✅

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

The complete module structure, all data contracts (`ComponentSpec`, `ParsedIntent`, `ResolvedAtom`, `ComposedLayout`, `ValidationReport`), provider abstraction layer (`OpenAI`, `Anthropic`, `Ollama`, `OpenAI-compatible`, custom `registerProvider()`), and CLI UX reference are specified in [`docs/design/phase-4.1-cli-architecture.md`](../../design/phase-4.1-cli-architecture.md).

#### 4.4 Intent Parser *(formerly 4.2; shifted after inserting 4.2 Kit Consolidation and 4.3 Demo Playground)*

Translates free text into a structured `ParsedIntent` object via an LLM call. The LLM boundary is isolated — 3 out of 4 pipeline stages are fully deterministic and unit-testable without an LLM.

#### 4.5 Component Resolver *(formerly 4.3)*

A pure deterministic module (no LLM). Accepts a structured request and returns the correct HTML. Takes rules directly from `AI_CONTEXT.md` — single source of truth. Implemented as a per-component plugin directory (`cli/src/pipeline/resolvers/`) per Scalability Track E-1.

#### 4.6 Validator *(formerly 4.4)*

Checks generated HTML for Module Contract compliance. Implemented as a rule registry (Scalability Track E-2) so new component rules can be added without patching core:

```bash
ai-css-kit validate ./output.html
# ✓ All components use valid class combinations
# ✓ No deprecated parent-selector patterns detected
# ✓ All required ARIA attributes present
# ✗ WARNING: .ui-input missing .ui-field wrapper
```

#### 4.7 CLI modes *(formerly 4.5)*

```bash
ai-css-kit generate "primary large button"
ai-css-kit generate --spec ./task.md
ai-css-kit generate "dashboard card" --theme midnight
ai-css-kit validate ./src/page.html
```

### Phase 4 Success Criteria

- [x] **4.1** CLI architecture designed and fully specified *(`docs/design/phase-4.1-cli-architecture.md`, 2026-04-09)*
- [x] **4.1** Provider abstraction layer designed *(OpenAI, Anthropic, Ollama, OpenAI-compatible, custom `registerProvider()`)*
- [x] **4.1** All data contracts defined *(ComponentSpec, ParsedIntent, ResolvedAtom, ComposedLayout, ValidationReport)*
- [x] **4.1** Scalability tracks A + B + F scoped and scheduled *(Scalability Plan v0.7.0 milestone)*
- [ ] **4.2** Kit consolidation shipped — component surface cleaned (blocker for 4.4+)
- [ ] **4.3** Interactive demos (playground) shipped — canonical feedback loop in place (blocker for 4.4+)
- [ ] **4.4** `npx ai-css-kit generate "..."` works end-to-end (Intent Parser + pipeline)
- [ ] **4.5** Component Resolver is 100% unit-tested (no LLM)
- [ ] **4.6** Validator detects all known anti-patterns
- [ ] **4.4–4.7** Providers supported: OpenAI, Anthropic, Ollama (local)
- [ ] **4.4–4.7** Scalability Track E implemented alongside CLI (plugin resolver, rule registry, context slicing)
- [ ] **4.7** Documentation in `docs/localization/en/cli.md`

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
| 1. Decoupling | v0.4.0 ✅ | Atomic components without coupling | Critical |
| 2. AI Context | v0.5.0 ✅ | AI_CONTEXT.md + ADR + `--ai-*` tokens | Critical |
| 3. Theming | v0.6.0 ✅ | Theme Mapper + JSON themes + @layer | High |
| 4.1 Architecture | — ✅ | Full CLI spec, data contracts, provider abstraction | Critical |
| **4.2 Kit Consolidation** | **v0.7.x** | **Track G** — atomic re-layering, dedup (`feed`↔`timeline`, `banner`↔`callout`↔`alert`), `icon-tile`/`dot` extraction, visual cleanup, Module Contract v2 — *blocker for 4.4+* | **Critical** |
| **4.3 Demo Playground** | **v0.8.0-pre** | **Track H** — schema-driven playground (preview/controls/code/tokens), inline validator, state export — *blocker for 4.4+* | **Critical** |
| Scalability prep | v0.7.0 (parallel to 4.2) | **Tracks A + B + F** — foundational fixes, token modularisation, CI automation | High |
| 4.4–4.7 CLI Agent | v0.8.0 | `npx ai-css-kit generate` + Tracks C-1/C-2/E (Intent Parser, Resolver, Validator, CLI modes) | High |
| 5. Ecosystem | v1.0.0 | Visual tests + AI accuracy + Tracks C-3 + D (display components, density, responsive, multi-brand) | Medium |

> **Execution order:** Sub-phases **4.2** and **4.3** wedge into Phase 4 **between 4.1 Architecture and 4.4–4.7 (Intent Parser, Component Resolver, Validator, CLI modes)**. They run before the preliminary scalability tracks (A + B + F) or in parallel. Phase 4 completion criteria (`generate` end-to-end, 100% resolver unit tests, validator anti-pattern coverage, provider support) cannot be closed until 4.2 and 4.3 ship — they define the component surface the CLI targets.

> **Scalability Plan:** [`docs/plans/SCALABILITY_PLAN.md`](../../plans/SCALABILITY_PLAN.md) — full work breakdown with effort estimates, integrated into the roadmap above.  
> **Sub-phase 4.2 (Kit Consolidation):** [`docs/plans/KIT_CONSOLIDATION.md`](../../plans/KIT_CONSOLIDATION.md) *(filename retained from early working title "Phase 6")*  
> **Sub-phase 4.3 (Demo Playground):** [`docs/plans/DEMO_PLAYGROUND.md`](../../plans/DEMO_PLAYGROUND.md) *(filename retained from early working title "Phase 7")*

---

*This document is a living artefact. Updated on completion of each phase.*
