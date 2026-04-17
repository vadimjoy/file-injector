# Scalability Plan — ai-css-kit

**Version:** 1.1  
**Date:** 2026-04-18  
**Status:** Active  
**Based on:** `docs/audit/scalability-audit-phases-1-3.md`, `docs/design/phase-4.1-cli-architecture.md`, `docs/plans/PHASE_6_KIT_CONSOLIDATION.md`, `docs/plans/PHASE_7_DEMO_PLAYGROUND.md`

---

## Purpose

This plan consolidates the open scalability work from the Phase 1–3 audit and extends it to cover:

- Component set expansion (grid, layout primitives, new UI patterns)
- New design concepts (density modes, responsive tokens, multi-brand)
- CLI (Phase 4) scalability from the start
- Token system growth to 50+ components
- AI context maintainability at scale
- **Kit consolidation after the v0.6.x component expansion** — atomic decomposition, visual-style cleanup, removal of duplicated primitives (icon tiles, dots, feed/timeline, alert/banner/callout overlaps)
- **Interactive demo playground** — schema-driven controls over sizes, states, and tokens for every component, replacing ad-hoc static demos

Work items are grouped into **tracks** so they can be executed in parallel across phases. Tracks **G** and **H** are *blockers for Phase 4 completion*: the kit must be consolidated and demos must be converted to the schema-driven playground before the CLI ships `npx ai-css-kit generate` end-to-end, otherwise the agent will produce markup against an inconsistent component surface.

---

## Track A — Foundational Fixes (Before / During Phase 4)

These items close gaps identified in the Phase 1–3 audit. They must be resolved before the Component set grows beyond 20 components, to avoid compounding technical debt.

### A-1 · Split `calendar.css` out of `datepicker.css`

**Source:** Audit 1-D  
**Effort:** S (1–2 days)

Create `src/css/components/calendar.css` containing all `ui-calendar` and `ui-datepicker__*` grid/header/day classes. Keep `datepicker.css` for trigger-only classes (`ui-datepicker-trigger`, `ui-datepicker__icon`, `ui-datepicker__input`).

Update `package.json#exports`:
```json
"./components/calendar":   "./dist/components/calendar.css",
"./components/datepicker": "./dist/components/datepicker.css"
```

Record in ADR-0006.

---

### A-2 · Remove duplicate dark theme from `tokens.css`

**Source:** Audit 3-A  
**Effort:** S (half day)

Delete the `[data-theme="dark"]` block from `src/css/tokens.css` (lines 241–279). The canonical dark theme is `src/themes/dark.json` → `dist/themes/dark.css`. Update the full bundle build to import `dark.css` by default, or add a migration note.

Record in ADR-0007.

---

### A-3 · Auto-derive `COMPONENT_PREFIXES` in `theme-map.js`

**Source:** Audit 2-B  
**Effort:** S (1 day)

Replace the hardcoded `Set` with a dynamic scan:

```js
// scripts/theme-map.js
import { readdirSync } from 'node:fs';
const COMPONENT_PREFIXES = new Set(
  readdirSync(COMPONENT_DIR)
    .filter(f => f.endsWith('.css'))
    .map(f => f.replace('.css', ''))
);
```

Add a CI test that asserts the set contains at least the 15 known components.

---

### A-4 · Tokenize icon offset values in `input.css`

**Source:** Audit 1-B  
**Effort:** XS (2 hours)

Add to `tokens.css`:
```css
--ai-input-icon-offset-left:  36px;
--ai-input-icon-offset-right: 40px;
```

Replace literals in `input.css` and update size-variant overrides. These tokens then flow into theme files for customisation.

---

### A-5 · Add `ai-kit.overrides` as fifth CSS layer

**Source:** Audit 3-D  
**Effort:** XS (1 hour)

In `src/css/index.css`:
```css
@layer ai-kit.tokens, ai-kit.base, ai-kit.components, ai-kit.themes, ai-kit.overrides;
```

Document in `docs/localization/en/theming.md` as the consumer extension point. Record in ADR-0007.

---

### A-6 · CI check: `AI_CONTEXT.md` token drift

**Source:** Audit 2-A  
**Effort:** M (2–3 days)

`scripts/check-context-drift.js`:
1. Extracts all `--ai-[component]-[prop]` names from `tokens.css`
2. Asserts each name appears in `AI_CONTEXT.md` Token Reference section
3. Exits 1 on mismatch with a diff

Add as `npm run lint:context` and include in the main `build` script.

---

### A-7 · Consolidate icon composition pattern

**Source:** Audit 1-C  
**Effort:** S (1 day)

Decision: deprecate `ui-input--icon-left/right` bare modifiers in favour of the `ui-input-wrapper` + `ui-input-icon` CSS Grid pattern (already implemented). The modifier classes remain for backward compat but point to a deprecation notice in `AI_CONTEXT.md`.

Update the Component Registry in `AI_CONTEXT.md` to document only the `ui-input-wrapper` pattern for new usage. Record in ADR-0002 amendment.

---

## Track B — Token System Modularisation

### B-1 · Split `tokens.css` into per-component token files

**Source:** Audit 2-D  
**Effort:** M (3–4 days)

Create `src/css/tokens/`:
```
src/css/tokens/
  global.css          ← --ui-* tokens (typography, color, radius, shadow, spacing)
  button.tokens.css
  input.tokens.css
  textarea.tokens.css
  ... (one per component)
```

`tokens.css` becomes an aggregator that imports all files:
```css
@layer ai-kit.tokens {
  @import './tokens/global.css';
  @import './tokens/button.tokens.css';
  /* ... */
}
```

Benefits:
- Tree-shaking readiness: consumers who only use `button` + `input` can import selectively
- Each component "owns" its token surface: changes to button tokens can't break unrelated components
- Opens the door to per-component `package.json#exports./tokens/button` entries

---

### B-2 · Fix badge token naming inconsistency

**Source:** Audit 2-C  
**Effort:** XS (2 hours)

Rename badge tokens from `--ai-badge-[variant]-[prop]` to `--ai-badge-[prop]-[variant]`:

```css
/* Before */
--ai-badge-primary-bg:    ...;
--ai-badge-success-color: ...;

/* After */
--ai-badge-bg-primary:    ...;
--ai-badge-color-success: ...;
```

Record chosen convention in ADR-0003 amendment. Add a naming-lint step to `audit-coupling.js` or a separate `lint:tokens` script.

---

### B-3 · Design token schema and validation

**Source:** Audit 3-B  
**Effort:** M (3 days)

Add `src/themes/schema.json` (JSON Schema Draft 7) covering the native theme format. Run it in `theme-map.js` on input before processing. Generate schema from `tokens.css` at build time (via `scripts/gen-theme-schema.js`) so it stays in sync automatically.

---

## Track C — Component Set Expansion

### C-1 · Grid system

**Effort:** L (1–2 weeks)  
**Target version:** v0.7.0

Implement a CSS Grid + Flexbox layout primitive system following the same modular rules:

```
ui-grid                    ← CSS Grid container
  ui-grid--cols-[1-12]     ← column count
  ui-grid--gap-[sm|md|lg]  ← gap size

ui-stack                   ← vertical flexbox stack
  ui-stack--[sm|md|lg]     ← gap between items
  ui-stack--inline         ← horizontal variant

ui-columns                 ← equal-width columns (auto-fit)
  ui-columns--[sm|md|lg]   ← min column width

ui-spacer                  ← fills available flex space
ui-divider                 ← horizontal rule with token control
```

Token additions:
```css
--ai-grid-gap-sm: var(--ui-space-2);
--ai-grid-gap-md: var(--ui-space-4);
--ai-grid-gap-lg: var(--ui-space-6);
```

Grid components must pass `audit-coupling.js` and be first-class in `AI_CONTEXT.md` Component Registry. Register `grid`, `stack`, `columns`, `spacer`, `divider` in `COMPONENT_PREFIXES`.

---

### C-2 · New form components

**Effort:** M per component  
**Target version:** v0.7.0–v0.8.0

Priority order based on frequency in AI-generated forms:

| Component | Class | Notes |
|-----------|-------|-------|
| Combobox | `ui-combobox` | Select + autocomplete hybrid |
| Date Range Picker | `ui-daterange` | Reuses `ui-calendar` from A-1 |
| Color Picker | `ui-colorpicker` | Swatch grid + hex input |
| Time Picker | `ui-timepicker` | Reuses `ui-calendar` header |
| Tag Input | `ui-tag-input` | Multi-value input with removable tags |
| Number Stepper | `ui-stepper` | Increment/decrement controls around input |
| Multi-Select | `ui-multiselect` | Dropdown with checkbox list |

Each component must:
1. Have its own CSS file in `src/css/components/`
2. Have a `src/css/tokens/[name].tokens.css` file (from B-1)
3. Be registered in `COMPONENT_PREFIXES`
4. Be added to `AI_CONTEXT.md` Component Registry
5. Have a resolver function in `cli/src/pipeline/component-resolver.js`
6. Have a `ComponentType` union type extension in `cli/` data contracts
7. Pass `lint:coupling` and have an ADR if it introduces a new pattern

---

### C-3 · Display and layout components

**Effort:** S–M per component  
**Target version:** v0.7.0–v0.8.0

| Component | Class | Notes |
|-----------|-------|-------|
| Modal / Dialog | `ui-modal` | Uses `aria-modal="true"`, focus trap JS expected |
| Drawer | `ui-drawer` | Slide-in panel variant |
| Tabs | `ui-tabs` + `ui-tab` | Horizontal and vertical variants |
| Accordion | `ui-accordion` + `ui-accordion__item` | Collapsible sections |
| Alert / Banner | `ui-alert` | Info/success/warning/error variants |
| Table | `ui-table` | Sortable, striped variants |
| Pagination | `ui-pagination` | Page navigation |
| Breadcrumb | `ui-breadcrumb` | Navigation trail |
| Avatar | `ui-avatar` | Image/initials with size modifiers |
| Spinner / Loader | `ui-spinner` | Animated loading indicator |

---

### C-4 · Component generation script

**Effort:** M (3–5 days)  
**Target version:** v0.7.0

`scripts/scaffold-component.js [name]` — generates the full component scaffold:

```
src/css/components/[name].css         ← component CSS stub
src/css/tokens/[name].tokens.css      ← token block stub
src/themes/default.json               ← updated with new tokens
AI_CONTEXT.md                         ← Component Registry row added
docs/localization/en/SPEC.md          ← component HTML contract stub
cli/src/pipeline/component-resolver.js ← resolver stub added
```

Includes CI check: `scripts/verify-component-completeness.js` — asserts every component in `src/css/components/` has a matching token file, resolver, and `AI_CONTEXT.md` entry.

---

## Track D — New Design Concepts

### D-1 · Density modes

**Effort:** M (1 week)  
**Target version:** v0.8.0

Two additional density modifiers alongside `--sm|--md|--lg`:

```css
/* Compact mode — useful for data-dense UIs, admin panels */
[data-density="compact"] {
  --ui-space-1: 2px;
  --ui-space-2: 4px;
  /* ... rescale all spacing tokens */
}

/* Comfortable mode — accessibility-first, large touch targets */
[data-density="comfortable"] {
  --ui-space-1: 6px;
  --ui-space-2: 10px;
}
```

Set on `<html data-density="compact">`. Orthogonal to `data-theme`.

---

### D-2 · Responsive tokens

**Effort:** L (2 weeks)  
**Target version:** v0.9.0

CSS `@media`-aware token overrides via `@layer ai-kit.responsive`:

```css
@layer ai-kit.responsive {
  @media (max-width: 640px) {
    :root {
      --ui-font-size-md: 16px;     /* larger tap targets on mobile */
      --ui-space-4:      20px;
    }
  }
}
```

These are defined in a new `src/css/responsive.css` file, imported optionally. They do not override `ai-kit.themes` (responsive layer sits below themes in the declaration order or is merged into `ai-kit.tokens`).

---

### D-3 · Multi-brand token profiles

**Effort:** L (2 weeks)  
**Target version:** v0.9.0

A **brand profile** is a set of Level 1 (`--ui-*`) overrides that define a complete visual language (typeface, color palette, radius, spacing scale). Multiple brands can share one HTML page via scoped selectors:

```css
/* dist/brands/acme.css */
@layer ai-kit.themes {
  [data-brand="acme"] {
    --ui-font-family: 'Neue Haas Grotesk', sans-serif;
    --ui-color-primary: #ff4400;
    --ui-radius-md: 2px;
    /* ... */
  }
}
```

Theme Mapper extended to accept a `brand` key in JSON:
```json
{ "meta": { "name": "Acme", "type": "brand" }, "tokens": { ... } }
```

---

### D-4 · Motion / animation tokens

**Effort:** S (3 days)  
**Target version:** v0.8.0

```css
:root {
  --ui-duration-fast:   100ms;
  --ui-duration-normal: 200ms;
  --ui-duration-slow:   350ms;
  --ui-easing-default:  cubic-bezier(0.4, 0, 0.2, 1);
  --ui-easing-spring:   cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Respects user preference */
@media (prefers-reduced-motion: reduce) {
  :root {
    --ui-duration-fast:   0ms;
    --ui-duration-normal: 0ms;
    --ui-duration-slow:   0ms;
  }
}
```

Components replace hardcoded `transition: all 0.2s ease` with `var(--ui-transition)` or `var(--ui-duration-normal) var(--ui-easing-default)`.

---

## Track E — CLI Scalability (Phase 4)

### E-1 · Component Resolver: plugin architecture

**Effort:** M (1 week)  
**Target:** Phase 4 implementation

The `RESOLVERS` map in `component-resolver.js` is currently hardcoded. As components grow beyond 20, the single file becomes unwieldy. Structure:

```
cli/src/pipeline/resolvers/
  index.js           ← builds and exports the final RESOLVERS map
  input.js
  button.js
  datepicker.js
  ... (one per component)
  grid.js            ← from Track C-1
  combobox.js        ← from Track C-2
```

`index.js`:
```js
import { resolveInput }      from './input.js';
import { resolveButton }     from './button.js';
// ...
export const RESOLVERS = { input: resolveInput, button: resolveButton, ... };
```

Adding a new component = adding one file + one import in `index.js`. No other file changes.

---

### E-2 · Validator: rule registry

**Effort:** S (2 days)  
**Target:** Phase 4 implementation

Current `RULES` array in `validator.js` is hardcoded. Make it a registry:

```js
// cli/src/pipeline/validator.js
const BUILT_IN_RULES = new Map([
  ['MISSING_FIELD_WRAPPER',        ruleFieldWrapper],
  ['MISSING_FIELD_SIZE',           ruleFieldSizeModifier],
  // ...
]);

let _customRules = new Map();

export function registerValidationRule(code, fn, defaultSeverity = 'error') { ... }
export function validate(html, options = {}) { ... }
```

Consumers (including the Phase 4 CLI scaffold command) can add component-specific validation rules without forking the validator.

---

### E-3 · Context Loader: sectioned streaming for large kits

**Source:** Audit 2-A, CLI architecture section 5.3  
**Effort:** M (3 days)  
**Target:** Phase 4 implementation

As `AI_CONTEXT.md` grows beyond 1000 lines, sending it whole in every LLM call will consume the context window. The `sliceForIntent()` function must be robust and tested:

```js
export function sliceForIntent(fullContext, sections = ['invariants', 'registry', 'composition', 'antipatterns']) {
  // Heading-based extraction — returns only requested sections
}

export function sliceForValidation(fullContext) {
  // Returns: invariants + antipatterns + modifier lists
}

export function sliceForTokenCustomisation(fullContext) {
  // Returns: Token Reference section only
}
```

Add `--context-sections <list>` CLI flag to `generate` command to override default slicing.

---

### E-4 · `ParsedIntent` type: extensible `ComponentSpec`

**Target:** Phase 4 implementation

The `ComponentType` union in `data-contracts` must be open for extension. Use a string enum with a known-values comment rather than a closed union:

```ts
// All known values; custom types registered via the resolver map are also valid
type ComponentType = 'input' | 'button' | 'grid' | 'stack' | ... | string;
```

Document in `docs/design/extending-components.md`: to add a new `ComponentType`, you register a resolver and the LLM will infer the type from `AI_CONTEXT.md` Component Registry entries.

---

### E-5 · CLI output: multi-file generation mode

**Effort:** M (1 week)  
**Target:** Phase 4.2

For complex UIs (pages, dashboards), a single HTML fragment is insufficient. Add `--format directory`:

```
ai-css-kit generate "admin dashboard with sidebar, header, stats cards" -f directory -o ./ui/

Output:
  ui/layout.html      ← page skeleton
  ui/sidebar.html     ← sidebar fragment
  ui/header.html      ← header fragment
  ui/cards.html       ← stats cards fragment
  ui/manifest.json    ← describes fragments + their data-theme requirements
```

This requires extending `ComposedLayout` with a `fragments` array and adding a `directory` output mode to `writer.js`.

---

### E-6 · Theme format adapter plugin architecture

**Source:** Audit 3-E  
**Effort:** M (1 week)  
**Target:** Phase 4.2 (before v0.7.0 Tailwind/Style Dictionary support)

Refactor `theme-map.js` into:

```
scripts/formats/
  native.js       ← { detect, flatten }
  w3c.js          ← { detect, flatten }
  figma.js        ← { detect, flatten }
  tailwind.js     ← v0.7.0
  style-dict.js   ← v0.7.0
  index.js        ← format registry
```

`index.js`:
```js
export function registerFormat(name, { detect, flatten }) { ... }
export function resolveFormat(json, explicit) { ... }
```

---

## Track F — Automation and CI

### F-1 · `scripts/verify-component-completeness.js`

**Effort:** S (2 days)

Asserts for every `src/css/components/*.css`:
- Matching `src/css/tokens/[name].tokens.css` exists
- Component name appears in `AI_CONTEXT.md` Component Registry
- Component name appears in `COMPONENT_PREFIXES` (from dynamic scan, A-3)
- If CLI exists: resolver function exists in `cli/src/pipeline/resolvers/index.js`

Run as `npm run lint:completeness` in CI.

---

### F-2 · ADR status automation

**Source:** Audit 2-E  
**Effort:** XS (1 day)

`scripts/check-adr-index.js`:
- Reads all `docs/adr/*.md` files
- Extracts `**Status:**` line from each
- Asserts each file appears in `docs/adr/README.md` with matching status
- Warns on ADRs with "Proposed" status older than 30 days (stale proposals)

---

### F-3 · JSON Schema validation for themes

**Source:** Audit 3-B  
**Effort:** M (3 days)

See Track B-3. Add to `npm run build:themes` pipeline.

---

## Track G — Kit Consolidation (Phase 6 blocker)

**Reference plan:** [`docs/plans/PHASE_6_KIT_CONSOLIDATION.md`](./PHASE_6_KIT_CONSOLIDATION.md)  
**Target version:** v0.7.x (between Scalability prep and CLI completion)  
**Effort:** ~2–3 weeks  
**Status:** Planned — must land before Phase 4 success criteria can be closed

The kit grew from 15 to 54 components across the v0.6.x expansion without a consolidation pass. The result is visually inconsistent ("not solid", "циганщина"), has duplicated atomic primitives, and inflates the CLI's component surface beyond what `AI_CONTEXT.md` can concisely describe. Track G closes this gap.

### G-1 · Atomic audit and re-layering

**Effort:** S (2 days)

Classify all 54 components into Foundations / Atoms / Molecules / Organisms. Move `typography`, `color-swatch`, `icon` into `src/css/foundations/`. Re-order `src/css/index.css` imports by atomic layer with section comments. Defined in `PHASE_6_KIT_CONSOLIDATION.md §3`.

### G-2 · Extract shared atoms: `icon-tile` and `dot`

**Effort:** M (3 days)

Create `src/css/components/icon-tile.css` (circular/square coloured badge used by `feature-item`, `chat`, `notification`, `stat-card`, `feed`) and `src/css/components/dot.css` (status/notification dot). Remove the duplicated `__icon--primary/success/warning/error/dark` clones from five component files. Register both atoms in `AI_CONTEXT.md` and `COMPONENT_PREFIXES`.

### G-3 · Merge `feed` + `timeline` → `timeline`

**Effort:** S (1 day)

`feed.css` and `timeline.css` both render a vertical activity stream with icon column + connector line. Keep the more feature-complete API under `ui-timeline`, deprecate `ui-feed` with a re-export stub, delete the duplicate CSS.

### G-4 · Merge `banner` + `callout` → `alert` modifiers

**Effort:** S (1–2 days)

Collapse the three alert-like families into `ui-alert` with modifiers `--banner` (full-width) and `--callout` (bordered panel). Update demos and `AI_CONTEXT.md`.

### G-5 · Visual-style cleanup

**Effort:** S (2 days)

Purge tacky accents: remove Verdana from `warm.json`, monospace from `midnight.json`, `--dark` icon variant from `feature-item`, and unify radii/shadows through tokens. Defined in `PHASE_6_KIT_CONSOLIDATION.md §4`.

### G-6 · Module Contract v2 enforcement

**Effort:** M (3 days)

Extend `audit-coupling.js` with two new lints:
- `lint:inline-styles` — forbid inline `style=""` in `src/demos/**/*.html` (258 instances found)
- `lint:atomic-imports` — forbid molecules/organisms importing peer molecules; only atoms/foundations are allowed upstream

Document as Module Contract v2 amendment to ADR-0001.

### G-7 · Purge inline styles from demos

**Effort:** S (2 days)

Replace the 258 inline-style occurrences with the existing `u-stack`, `u-grid`, `u-cluster` utilities (and add any missing utility primitives to `src/css/utilities/`). Required before Track H can build the schema-driven playground on top of clean demo markup.

### G-8 · Success criteria

- [ ] Component count reduced from 54 → ~50 (3 merged, 3 deleted, 2 new atoms, rest renamed/re-layered)
- [ ] `src/css/foundations/` directory in place with `typography`, `color-swatch`, `icon`
- [ ] `icon-tile` and `dot` atoms used by ≥4 components each
- [ ] `feed` removed (stub only) and `timeline` is the single activity-stream component
- [ ] `alert` with `--banner` / `--callout` modifiers; legacy files deleted
- [ ] `warm.json` and `midnight.json` no longer force non-system fonts
- [ ] `feature-item__icon--dark` deleted
- [ ] `npm run lint:inline-styles` passes (zero inline styles in demos)
- [ ] `npm run lint:atomic-imports` passes
- [ ] `AI_CONTEXT.md` Component Registry updated to reflect the consolidated surface
- [ ] ADR-0001 amended with Module Contract v2

---

## Track H — Demo Playground (Phase 7 blocker)

**Reference plan:** [`docs/plans/PHASE_7_DEMO_PLAYGROUND.md`](./PHASE_7_DEMO_PLAYGROUND.md)  
**Target version:** v0.8.0-pre (after Track G, before Phase 4 completion)  
**Effort:** ~2–3 weeks  
**Status:** Planned — depends on Track G (clean demo markup)

The current 29 static HTML demos do not let the user (or the AI agent validating output) exercise size modifiers, state flags, or token overrides without editing HTML by hand. Track H replaces them with a **schema-driven playground**: a thin Vanilla JS host (≤ 12 KB gzipped) that renders preview + controls + code + tokens panels from a per-component JSON schema.

### H-1 · Playground skeleton

**Effort:** M (3 days)

Build `src/demos/playground/` with four panels:
- **Preview** — live component render with iframe isolation
- **Controls** — segmented / select / range / text / toggle / color inputs driven by schema
- **Code** — rendered HTML with "Copy" button
- **Tokens** — live `--ai-*` token values with inline overrides

No framework. ES modules, no build step.

### H-2 · Schema format and bindings

**Effort:** S (2 days)

Schema per component:
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

Binding types: `bindsClass`, `bindsVar`, `bindsAttr`, `bindsText`, `bindsRepeat`. Defined in `PHASE_7_DEMO_PLAYGROUND.md §4`.

### H-3 · Schema library

**Effort:** L (1–2 weeks)

Author one schema per consolidated component (~50 files) in `src/demos/playground/schemas/`. Demo HTML shrinks to ≤ 25 lines per component (just the playground mount + `<script data-schema="button.json">`).

### H-4 · Theme / density / RTL / responsive controls

**Effort:** S (2 days)

Global controls outside per-component schema:
- Theme picker (reuses 5 preset themes)
- Density toggle (prep for D-1)
- RTL flip
- Viewport presets (mobile / tablet / desktop)

### H-5 · Export and share

**Effort:** S (1 day)

- "Copy HTML" → clipboard
- "Copy token overrides" → clipboard (only changed tokens)
- "Export JSON state" → downloadable file, round-trippable to re-load the playground state

Serves as a hand-off format for the CLI (`ai-css-kit generate --from-playground ./state.json`).

### H-6 · Integration with CLI validator

**Effort:** M (3 days)

Wire Track E-2's validator into the playground: the "Code" panel runs `validate(html)` on every change and shows warnings inline. Gives the user (and the AI agent during Phase 4 integration tests) immediate feedback on whether the composed markup respects Module Contract v2.

### H-7 · Success criteria

- [ ] Playground skeleton (preview + controls + code + tokens) functional
- [ ] Schema loader + binding engine ≤ 12 KB gzipped
- [ ] One schema per consolidated component (~50 files)
- [ ] Old `src/demos/*.html` replaced (or reduced to ≤ 25 lines each)
- [ ] Theme / density / RTL / viewport global controls
- [ ] "Copy HTML" and "Export JSON" work
- [ ] Inline validation shows warnings from Track E-2
- [ ] Zero inline styles (enforced by G-6 `lint:inline-styles`)

---

## Roadmap Integration

| Phase | Version | Track items |
|-------|---------|-------------|
| Phase 4 prep — foundational | v0.7.0 | A-1, A-2, A-3, A-4, A-5, A-6, A-7, B-1, B-2, F-1, F-2 |
| **Phase 6 — Kit Consolidation** | **v0.7.x** | **G-1, G-2, G-3, G-4, G-5, G-6, G-7** *(blocker for Phase 4 completion)* |
| **Phase 7 — Demo Playground** | **v0.8.0-pre** | **H-1, H-2, H-3, H-4, H-5, H-6** *(blocker for Phase 4 completion)* |
| Phase 4 (CLI) | v0.8.0 | E-1, E-2, E-3, E-4, C-4, B-3, F-3 |
| Phase 4.2 | v0.8.x | E-5, E-6, D-4 |
| Phase 4.3 | v0.8.x | C-1 (Grid), C-2 (priority form components) |
| Phase 5 | v0.9.0 | C-3 (display components), D-1, D-2, D-3 |
| Post v1.0.0 | — | C-2 (remaining), D-2 (responsive tokens full), D-3 (multi-brand) |

> **Execution order:** Tracks G and H run sequentially between the v0.7.0 scalability prep and the final v0.8.0 CLI release. The existing Phase 4 stubs (Intent Parser skeleton, provider abstraction, architecture doc) remain in place; the **completion criteria** of Phase 4 (end-to-end `generate`, 100% resolver tests, validator anti-pattern coverage, provider support) cannot be marked done until Tracks G and H ship, because their output defines the component surface the CLI targets.

---

## Effort Legend

| Size | Estimate |
|------|----------|
| XS | < half day |
| S | 1–2 days |
| M | 3–5 days |
| L | 1–2 weeks |
