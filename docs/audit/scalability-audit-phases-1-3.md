# Scalability Audit — Phases 1–3

**Project:** ai-css-kit  
**Audit scope:** Architectural decisions implemented in phases 1–3 (v0.4.0–v0.6.0)  
**Audit date:** 2026-04-09  
**Auditor:** OpenCode  
**Based on:** `docs/localization/en/MASTER_PLAN.md`, ADR-0001–0004, source code

---

## Methodology

Each accepted decision is evaluated against three scalability dimensions:

- **Volume** — does the solution hold at 50+ components and 100+ tokens?
- **Extensibility** — can new contributors extend the system without modifying core files?
- **Automation** — is the correctness of the decision machine-verifiable, or does it rely on human discipline?

Risk levels: **Critical** · **High** · **Medium** · **Low**

---

## Phase 1 — Architectural Decoupling (ADR-0001, ADR-0002)

### 1-A · `GLOBAL_ALLOWED_BASES` is a hardcoded allowlist

**File:** `scripts/audit-coupling.js:7`  
**Risk:** Medium

```js
const GLOBAL_ALLOWED_BASES = new Set(['ui-field']);
```

The coupling checker allows cross-component selector chains only for `ui-field`. Any new shared layout wrapper (e.g., `ui-stack`, `ui-grid`, `ui-modal-body`) introduced in future phases must be manually added to this constant. There is no automated mechanism to derive the allowlist from source — a developer adding a new layout atom will either break CI or manually patch the checker.

**Recommendation:** Define shared/layout components in a dedicated config file (e.g., `src/css/layout-atoms.json`) and load it dynamically in `audit-coupling.js`. Alternatively, mark layout atoms with a CSS comment convention and derive the allowlist at build time.

---

### 1-B · Icon offset values are not tokenized

**File:** `src/css/components/input.css:182–232`  
**Risk:** Medium

```css
.ui-input.ui-input--icon-left  { padding-left: 36px; }
.ui-input.ui-input--icon-right { padding-right: 40px; }
```

The offset values (`36px`, `40px`) are bare literals duplicated across three size variants (sm/md/lg × left/right/search = 8 rules). If the icon size changes (e.g., switching from 16 px to 24 px icons), each rule must be updated manually with no single source of truth.

**Recommendation:** Extract into component tokens:

```css
:root {
  --ai-input-icon-offset-left:  36px;
  --ai-input-icon-offset-right: 40px;
}
```

This also enables themes to adjust icon offsets without patching component CSS.

---

### 1-C · Two overlapping icon composition patterns

**Files:** `src/css/components/input.css:119–160` and `AI_CONTEXT.md:56`  
**Risk:** Medium

Two distinct patterns currently exist for adding an icon to an input:

| Pattern | Mechanism | Context |
|---------|-----------|---------|
| `ui-input-wrapper` + `ui-input-icon` | CSS Grid overlay | Generic icon input |
| `ui-input--icon-left/right` modifier | Padding modifier only | Inside autocomplete / datepicker |

The Component Registry in `AI_CONTEXT.md` documents both but gives no decision rule for when to use which. An AI agent generating a new composite (e.g., a search-with-clear-button input) must choose without a canonical guideline, producing inconsistent output across agents and sessions.

**Recommendation:** Document a single canonical pattern in `AI_CONTEXT.md` with an explicit decision tree, or deprecate one pattern in favor of the other and track the deprecation in an ADR.

---

### 1-D · `ui-calendar` is not a standalone module

**File:** `src/css/components/datepicker.css`  
**Risk:** High

The MASTER_PLAN (section 1.5) specifies that `ui-calendar` must be reusable in `date-range-picker`, `time-picker`, etc. without rewriting. However, the calendar implementation (`ui-calendar`, `ui-datepicker__header`, `ui-datepicker__grid`, `ui-datepicker__day`) lives inside `datepicker.css`. A consumer importing only `calendar` styles must import the entire datepicker file, including trigger styles.

Additionally, `ui-datepicker__header` and `ui-datepicker__grid` use the `ui-datepicker__` namespace, which couples their naming to the datepicker context even when used standalone.

**Recommendation:** Split `datepicker.css` into two files: `datepicker.css` (trigger only) and `calendar.css` (grid, header, day, footer). Register `calendar` as a first-class component with its own `--ai-calendar-*` token block. This is already planned implicitly but not executed.

---

### 1-E · Intra-component parent-selectors create specificity depth

**File:** `src/css/components/datepicker.css:168–274`  
**Risk:** Low

Size variants use 2-level chains:

```css
.ui-calendar--sm .ui-datepicker__header { padding: ... }
.ui-calendar--md .ui-datepicker__nav    { width: 28px; }
```

This is intra-component and therefore not caught by the coupling checker. At 3 sizes × ~6 child elements = 18 rules today. If calendar gains more states (range selection, disabled ranges, highlighted weeks), the rule count grows multiplicatively. Specificity depth also makes external theming harder to override cleanly.

**Recommendation:** For the calendar grid, consider CSS custom properties for per-size values (`--ui-calendar-day-size` already exists as `--ai-calendar-day-size`) to reduce the size-variant rule count.

---

## Phase 2 — AI Context Standardisation (ADR-0003)

### 2-A · `AI_CONTEXT.md` is manually maintained with no automation

**File:** `AI_CONTEXT.md` (~430 lines)  
**Risk:** High

The document is the single system prompt for AI agents. It contains:
- Component Registry (duplicated from `SPEC.md`)
- Full token reference (duplicated from `tokens.css`)
- Invariant rules (duplicated from ADR files)

There is no automated pipeline to regenerate or validate `AI_CONTEXT.md` against the source of truth. Any change to a component class, token name, or invariant requires manual updates in 3–4 places. Drift between `AI_CONTEXT.md` and the actual CSS is currently caught only in code review.

At 15 components the document is already 430 lines. At 50+ components it will become unmanageable as a single flat file.

**Recommendation:**
1. Add a CI check that extracts token names from `tokens.css` and verifies they are all present in `AI_CONTEXT.md`.
2. Consider generating the Token Reference section of `AI_CONTEXT.md` from `tokens.css` at build time (e.g., a `scripts/gen-ai-context.js`).
3. Split `AI_CONTEXT.md` into sections importable separately (e.g., `AI_CONTEXT_tokens.md`, `AI_CONTEXT_components.md`) for large-context scenarios.

---

### 2-B · `COMPONENT_PREFIXES` in `theme-map.js` must be updated manually

**File:** `scripts/theme-map.js:35–51`  
**Risk:** High

```js
const COMPONENT_PREFIXES = new Set([
  'button', 'input', 'textarea', 'select', 'card', 'badge',
  'progress', 'tooltip', 'checkbox', 'radio', 'toggle', 'slider',
  'file-upload', 'autocomplete', 'calendar',
]);
```

This list controls whether a theme token maps to `--ai-*` or `--ui-*`. When a new component is added (Phase 4+ will require CLI-specific components), a developer must update this set. There is no test or CI check that verifies parity between this list and the actual `src/css/components/` directory.

**Recommendation:** Generate `COMPONENT_PREFIXES` dynamically by scanning `src/css/components/*.css` filenames at runtime, or add a build-time test that asserts every component file has a matching entry.

---

### 2-C · Token naming inconsistency: badge variants in token names

**File:** `src/css/tokens.css:150–158`  
**Risk:** Medium

The badge component encodes semantic color variants in token names:

```css
--ai-badge-primary-bg:    ...
--ai-badge-success-bg:    ...
--ai-badge-warning-bg:    ...
--ai-badge-error-bg:      ...
```

All other components follow `--ai-[component]-[property]` with no variant segment. The badge pattern follows `--ai-[component]-[variant]-[property]`. This inconsistency means:

- An AI agent cannot infer token names by the standard pattern alone for badge.
- Theme mapper generates `[data-theme="x"] { --ai-badge-primary-bg: ...; }` which is correct but breaks the "component token isolates one component" mental model — now the token also encodes the color intent.

**Recommendation:** Decide on one standard and document it explicitly in ADR-0003 (amendment):
- Option A: `--ai-badge-bg-primary`, `--ai-badge-bg-success` (property before variant)
- Option B: Accept `[component]-[variant]-[property]` as a valid extension and add it to ADR-0003

Enforce the chosen convention via a naming-lint script.

---

### 2-D · `tokens.css` is a single growing `:root` block

**File:** `src/css/tokens.css:90–237`  
**Risk:** Medium

All 15 component token blocks are declared in a single `:root {}` rule inside `@layer ai-kit.tokens`. The file is already 281 lines. At 50 components it would reach ~900 lines with no logical modularisation.

There is no mechanism to load only a subset of component tokens (e.g., for a tree-shaken bundle that only includes `button` + `input`).

**Recommendation:** Split component tokens into per-component token files in `src/css/tokens/` (e.g., `tokens/button.tokens.css`, `tokens/input.tokens.css`) and import them from `tokens.css`. This enables future tree-shaking and keeps each component's token surface self-contained.

---

### 2-E · ADR index is manually maintained

**File:** `docs/adr/README.md`  
**Risk:** Low

The index table in `README.md` must be updated every time a new ADR is added. No script enforces that all `docs/adr/*.md` files appear in the index, and there is no check for stale "Proposed" ADRs that have been implemented but not promoted to "Accepted".

**Recommendation:** Add a small Node script to CI that reads all `docs/adr/*.md` headers and asserts each appears in `README.md` with the correct status.

---

## Phase 3 — Theming and Design Tokens (ADR-0004)

### 3-A · Dark theme defined in two places

**Files:** `src/css/tokens.css:241–279` and `src/themes/dark.json`  
**Risk:** High

The built-in dark theme exists as:
1. `[data-theme="dark"]` override block in `tokens.css` — bundled into `dist/ai-css-kit.css` inside `@layer ai-kit.tokens`
2. `src/themes/dark.json` → compiled to `dist/themes/dark.css` — inside `@layer ai-kit.themes`

A consumer importing the full bundle (`dist/ai-css-kit.css`) gets the `tokens.css` dark theme. A consumer who also imports `dist/themes/dark.css` gets a second dark theme that wins via layer priority. As tokens are added to the component layer over time, the two definitions can silently diverge, leading to different dark-theme appearances depending on which file a consumer imports.

**Recommendation:** Remove the `[data-theme="dark"]` block from `tokens.css` and make `dist/themes/dark.css` the single authoritative dark theme. Update the full bundle build to include `dark.css` or provide an explicit migration note in `RELEASE_NOTES.md`.

---

### 3-B · No JSON Schema for theme files

**File:** `src/themes/*.json`  
**Risk:** Medium

Theme JSON files have no formal schema. Invalid CSS values (e.g., a typo in a hex color) and unrecognized token keys (e.g., `colour.primary` instead of `color.primary`) are accepted silently and produce invalid or no-op CSS. Errors are only visible at render time in a browser.

**Recommendation:** Add a JSON Schema definition (`src/themes/schema.json`) covering the native format and use it in `theme-map.js` to validate input before generating CSS. Optionally add W3C DTCG schema validation for external inputs.

---

### 3-C · Format detection is heuristic and fragile

**File:** `scripts/theme-map.js:81–95`  
**Risk:** Medium

```js
function detectFormat(json) {
  if (json && typeof json.tokens === 'object') return 'native';
  if (hasLeafKey(json, '$value')) return 'w3c';
  if (hasLeafKey(json, 'value'))  return 'figma';
  return 'native'; // fallback
}
```

A Figma Tokens file that also has a top-level `tokens` key (which Figma sets sometimes) would be misdetected as `native` format. A native theme file with a `value` string somewhere would be misdetected as Figma. The `hasLeafKey` check traverses the entire object recursively without depth limit, making it O(N) on large token trees.

**Recommendation:** Require explicit `$schema` or `format` declaration in theme files, or accept `--format native|w3c|figma` as a CLI flag. Use this as the primary detection signal, with heuristics only as a fallback.

---

### 3-D · No consumer override layer above themes

**File:** `src/css/index.css`  
**Risk:** Medium

The declared layer order is:

```css
@layer ai-kit.tokens, ai-kit.base, ai-kit.components, ai-kit.themes;
```

`ai-kit.themes` is the highest layer. A consumer who needs to override a specific design decision above a preset theme (without modifying the theme file) has no designated layer. Their only options are:
- Add styles after all imports with high specificity (fragile)
- Modify the theme JSON and rebuild (not always possible with third-party themes)
- Use `:root` overrides outside any layer (these win over all layers, which works but is undocumented)

At scale, consumers will find this ceiling unexpectedly early when integrating with design systems that have their own specificity requirements.

**Recommendation:** Add an `ai-kit.overrides` layer as the final layer:

```css
@layer ai-kit.tokens, ai-kit.base, ai-kit.components, ai-kit.themes, ai-kit.overrides;
```

Document it as the designated extension point for consumer customisations above themes.

---

### 3-E · No plugin architecture for new theme formats

**File:** `scripts/theme-map.js`  
**Risk:** Low (now) · **High** (at Phase 4+)

The Mapper supports 3 formats via a single conditional chain (`detectFormat` → `flattenTokens`). Tailwind config and Style Dictionary formats are planned for v0.7.0 but would require modifying core `theme-map.js` logic. There is no adapter interface that would allow format support to be added externally.

**Recommendation:** Extract each format parser into its own module (`formats/native.js`, `formats/w3c.js`, `formats/figma.js`) with a common interface `{ detect(json): boolean, flatten(json): Record<string,string> }`. Loaders can then be registered dynamically, making it trivial to add Tailwind and Style Dictionary support without touching core logic.

---

## Summary Table

| ID | Phase | Decision / File | Risk | Type |
|----|-------|-----------------|------|------|
| 1-A | 1 | `GLOBAL_ALLOWED_BASES` hardcoded in coupling checker | Medium | Extensibility |
| 1-B | 1 | Icon offset literals not tokenized (`input.css:182`) | Medium | Volume |
| 1-C | 1 | Two overlapping icon composition patterns | Medium | Automation |
| 1-D | 1 | `ui-calendar` not a standalone module (`datepicker.css`) | **High** | Extensibility |
| 1-E | 1 | Intra-component size-variant selectors (datepicker) | Low | Volume |
| 2-A | 2 | `AI_CONTEXT.md` manually maintained, no automation | **High** | Automation |
| 2-B | 2 | `COMPONENT_PREFIXES` hardcoded in `theme-map.js` | **High** | Extensibility |
| 2-C | 2 | Token naming inconsistency in badge variants | Medium | Volume |
| 2-D | 2 | Single monolithic `tokens.css` `:root` block | Medium | Volume |
| 2-E | 2 | ADR index manually maintained | Low | Automation |
| 3-A | 3 | Dark theme defined in `tokens.css` AND `dark.json` | **High** | Extensibility |
| 3-B | 3 | No JSON Schema for theme files | Medium | Automation |
| 3-C | 3 | Format detection is heuristic, no explicit format flag | Medium | Automation |
| 3-D | 3 | No consumer override layer above `ai-kit.themes` | Medium | Extensibility |
| 3-E | 3 | No plugin architecture for theme format adapters | Low → High | Extensibility |

---

## Prioritised Recommendations

### Must address before Phase 4

1. **[3-A]** Remove duplicate dark theme from `tokens.css`. Single source in `src/themes/dark.json`.
2. **[1-D]** Split `datepicker.css` into `calendar.css` + `datepicker.css` to fulfill the Phase 1 reusability promise.
3. **[2-B]** Auto-generate `COMPONENT_PREFIXES` from component directory scan; add CI parity test.

### Should address in Phase 4

4. **[2-A]** Add CI token-drift check for `AI_CONTEXT.md`; generate Token Reference section at build time.
5. **[3-D]** Declare `ai-kit.overrides` as a fifth layer; document as consumer extension point.
6. **[2-D]** Migrate component tokens into per-component token files for tree-shaking readiness.

### Can address post Phase 4

7. **[1-B]** Tokenize icon offset values (`--ai-input-icon-offset-*`).
8. **[2-C]** Align badge token naming with the `--ai-[component]-[property]` standard.
9. **[3-B]** Add JSON Schema validation to Theme Mapper.
10. **[3-E]** Refactor `theme-map.js` to a plugin-based format adapter architecture.
11. **[1-A]** Derive `GLOBAL_ALLOWED_BASES` from a config file.
12. **[3-C]** Add `--format` CLI flag as an explicit override for format detection.
13. **[1-C]** Consolidate icon composition to one canonical pattern; deprecate the other.
14. **[2-E]** Add CI check for ADR index completeness.

---

## What scales well

The following decisions from Phases 1–3 are considered robust and do not require changes:

- **`@layer` cascade ordering** (ADR-0004) — clean, standard, browser-supported. Themes-over-components layering is correct.
- **Context Modifier Pattern** (ADR-0002) — O(1) context per component as designed. Holds at any number of components.
- **`audit-coupling.js` CI enforcement** (ADR-0001) — build fails fast on violations. Correct principle; only the allowlist mechanism needs improvement (issue 1-A).
- **Two-level token system** `--ui-*` / `--ai-*` (ADR-0003) — the concept scales. The implementation has modularisation gaps (issue 2-D) but the architecture is sound.
- **Theme Mapper core pipeline** (ADR-0004) — `parseTheme → generateCSS` is clean and well-tested (28 unit tests). Format detection is the only fragile part.
- **ADR system itself** — lightweight, file-based, no tooling required. Scales through Phase 5.
