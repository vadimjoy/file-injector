# Scalability Guide — ai-css-kit

**Audience:** Core contributors adding new components, tokens, themes, or CLI features  
**Version:** 1.0 (2026-04-09)  
**Related documents:**  
- `docs/audit/scalability-audit-phases-1-3.md` — identified risks  
- `docs/audit/SCALABILITY_PLAN.md` — work items and roadmap  
- `docs/adr/README.md` — architectural decisions  

---

## 1. The Four Scalability Axioms

Everything in this guide derives from four axioms. When in doubt, return to these:

```
1. EXPLICIT OVER IMPLICIT  — every relationship visible in the markup or token name
2. ONE OWNER PER RULE      — a CSS class is styled in exactly one file
3. MACHINE-READABLE BY DESIGN — AI agents and scripts can derive correct output without reading prose
4. REGISTER, DON'T PATCH   — extend by adding to a registry; never modify a core dispatch table
```

---

## 2. Adding a New Component

Follow this checklist completely. Every step is required. Steps can be automated via `scripts/scaffold-component.js [name]` once it exists (see SCALABILITY_PLAN.md Track C-4).

### 2.1 Checklist

```
[ ] 1. CSS file:        src/css/components/[name].css
[ ] 2. Token file:      src/css/tokens/[name].tokens.css
[ ] 3. Token import:    add to src/css/tokens.css (or the aggregator index)
[ ] 4. Component CSS:   uses only --ai-[name]-* tokens, no --ui-* directly
[ ] 5. Coupling check:  no selector in [name].css targets a class from another component
[ ] 6. Theme sources:   add token defaults to src/themes/default.json and src/themes/dark.json
[ ] 7. AI_CONTEXT.md:   add a row to the Component Registry table (section 2)
[ ] 8. SPEC.md:         add a full HTML contract with all modifiers and states
[ ] 9. ADR:             if the component introduces a new structural pattern, write an ADR
[ ]10. CLI resolver:    add cli/src/pipeline/resolvers/[name].js + register in resolvers/index.js
[ ]11. ComponentType:   add the type string to the ComponentType comment in data contracts
[ ]12. Validator rules: add component-specific rules to the Validation Rule Catalogue
[ ]13. CI completeness: run npm run lint:completeness — must pass
[ ]14. Demo:            add src/demos/[name].html or a section to index.html
```

### 2.2 CSS file structure

Every component file must follow this template:

```css
/* ==========================================================================
   [ComponentName]
   ========================================================================== */

@layer ai-kit.components {

/* Base class — all required properties */
.ui-[name] {
  /* Use --ai-[name]-* tokens exclusively */
  background: var(--ai-[name]-bg);
  border:      1px solid var(--ai-[name]-border);
  border-radius: var(--ai-[name]-radius);
  /* ... */
}

/* Modifier classes — one block per modifier */
.ui-[name]--[modifier] { ... }

/* State classes */
.ui-[name]:hover  { ... }
.ui-[name]:focus  { ... }
.ui-[name]:disabled { ... }

/* Size variants via parent .ui-field (if a form atom) */
.ui-field--sm .ui-[name] { ... }
.ui-field--md .ui-[name] { ... }
.ui-field--lg .ui-[name] { ... }

} /* end @layer ai-kit.components */
```

**Rules:**
- No selector in this file may reference a class that belongs to a different component file.
- Size is always controlled via `.ui-field--[size]` parent, not on the component itself (unless the component carries its own size modifiers, like `ui-checkbox--sm`).
- No `!important`.
- No hardcoded pixel values that should be design decisions — use or add a `--ai-[name]-*` token.

### 2.3 Token file structure

```css
/* src/css/tokens/[name].tokens.css */
/* No @layer wrapper — tokens.css adds the @layer ai-kit.tokens wrapper */

:root {
  /* Required properties */
  --ai-[name]-bg:           var(--ui-color-bg);
  --ai-[name]-border:       var(--ui-color-border);
  --ai-[name]-border-focus: var(--ui-color-border-focus);
  --ai-[name]-radius:       var(--ui-radius-md);
  --ai-[name]-color:        var(--ui-color-text);

  /* Hover state */
  --ai-[name]-border-hover: var(--ui-color-border-strong);

  /* Focus ring */
  --ai-[name]-focus-ring:   var(--ui-color-primary-soft);
}
```

**Naming convention:**
```
--ai-[component]-[property]
--ai-[component]-[property]-[state]
--ai-[component]-[property]-[variant]   ← variant AFTER property, not before
```

Do not embed variant names before the property:
```
--ai-badge-bg-primary    ✓  (property 'bg' before variant 'primary')
--ai-badge-primary-bg    ✗  (variant before property — ADR-0003 violation)
```

### 2.4 AI_CONTEXT.md entry

Add a row to the appropriate table in section 2 (Component Registry):

```markdown
| [Component] | `.ui-[name]` | `--[mod1]` `--[mod2]` | Notes |
```

If the component is composite (has required children), add it to section 2.3 with a `Required Children` column.

Add any new invariants to section 1 and any new anti-patterns to section 5.

---

## 3. Adding a New Design Token

### 3.1 Global token (`--ui-*`)

Use global tokens for values that apply across the entire design system:
- Typography scale (font sizes, line heights, font families)
- Colour palette primitives (primary, success, error, neutral)
- Spacing scale (space-1 through space-12)
- Border radius scale (xs, sm, md, lg, xl, full)
- Shadow scale (xs, sm, md, lg)
- Transition durations and easings

Global tokens live in `src/css/tokens/global.css` (after Track B-1 modularisation) or in the global block of `tokens.css`.

### 3.2 Component token (`--ai-[component]-*`)

Use component tokens for values that should be customisable per component:
- All visual properties that themes or AI agents might want to change independently
- Always reference a global token as default: `var(--ui-color-primary)`

After adding a component token:
1. Update `src/themes/default.json` and `src/themes/dark.json` to include the key
2. Run `npm run lint:context` to verify `AI_CONTEXT.md` Token Reference is up to date

### 3.3 Naming rules

| Situation | Pattern | Example |
|-----------|---------|---------|
| Single property | `--ai-[comp]-[prop]` | `--ai-button-bg` |
| Property in a state | `--ai-[comp]-[prop]-[state]` | `--ai-button-bg-hover` |
| Property for a variant | `--ai-[comp]-[prop]-[variant]` | `--ai-badge-bg-primary` |
| Compound property name | hyphen-separated | `--ai-input-border-focus` |

---

## 4. Adding a New Theme

### 4.1 Native JSON format

Create `src/themes/[name].json`:

```json
{
  "meta": {
    "name": "My Theme",
    "version": "1.0.0",
    "author": "your@email.com"
  },
  "tokens": {
    "color.primary":       "#your-color",
    "color.primary.hover": "#your-hover",
    "radius.md":           "8px",
    "font.family":         "Your Font, sans-serif",
    "button.radius":       "4px"
  }
}
```

Token key routing:
- `color.primary` → `--ui-color-primary` (global token: first segment `color` not a component)
- `button.radius` → `--ai-button-radius` (component token: first segment `button` in COMPONENT_PREFIXES)
- `--ui-my-token` → verbatim (explicit CSS variable name, starts with `--`)

### 4.2 Build and validate

```bash
node scripts/theme-map.js src/themes/[name].json -o dist/themes/[name].css
npm run build:themes   # rebuilds all themes
```

### 4.3 Registration

1. Add `"./themes/[name]": "./dist/themes/[name].css"` to `package.json#exports`
2. Add the theme name to the `INVALID_THEME_VALUE` validator rule whitelist in `cli/src/pipeline/validator.js`
3. Add the theme to the `generate.defaultTheme` allowed values in `cli/src/config/loader.js`
4. Add a demo control in `index.html` showcase page
5. Update `AI_CONTEXT.md` section 1 invariant I-07 to include the new theme name

---

## 5. Adding a New Layout Type (CLI)

When adding a new `LayoutType` to the CLI pipeline:

### 5.1 Data contracts

In `cli/src/pipeline/` (or wherever contracts are defined):
```js
// Add to the comment for ComponentType and LayoutType
type LayoutType = 'form' | 'card' | 'page' | 'section' | 'list' | 'inline' | '[new-type]';
```

### 5.2 Layout Composer

Add a case to `wrapInContainer` in `layout-composer.js`:
```js
case '[new-type]':
  return buildNewTypeLayout(intent, innerHtml);
```

All layout composer functions are pure (no side effects, no I/O) and must have 100% unit test coverage.

### 5.3 Intent Parser prompt

Add the new layout type to the Output Schema in the Intent Parser system prompt (`buildSystemPrompt` in `intent-parser.js`). Also update `AI_CONTEXT.md` and the Rule R-01 context if relevant.

### 5.4 Validator

Add a validation rule if the new layout type has structural requirements:
```js
// cli/src/pipeline/validator.js
registerValidationRule('MISSING_[LAYOUT]_WRAPPER', ruleNewLayoutWrapper, 'error');
```

---

## 6. Adding a New LLM Provider

### 6.1 Create the provider class

```
cli/src/providers/[name].js
```

The class must extend `LLMProvider` from `./base.js` and implement:
- `complete(messages, options)` → `Promise<CompletionResult>`
- `stream(messages, options)` → `AsyncGenerator<string>`
- `ping()` → `Promise<void>`
- `get capabilities()` → `ProviderCapabilities`

### 6.2 Register in factory

```js
// cli/src/providers/factory.js
import { MyProvider } from './my-provider.js';

const BUILT_IN_REGISTRY = {
  ...existing,
  'my-provider': MyProvider,
};
```

### 6.3 Add tests

`cli/tests/providers/[name].test.js` with:
- Authentication error handling
- Successful completion with token counting
- `ping()` success and failure
- Capabilities contract

### 6.4 Document

Update section 6 of `docs/design/phase-4.1-cli-architecture.md` with request/response format and implementation.

---

## 7. Extending the Validator

Every new component or invariant may require new validation rules. Rules are pure functions:

```js
/**
 * Rule function signature
 * @param {string} html
 * @param {object} options
 * @returns {ValidationIssue[]}
 */
function ruleMyCheck(html, options = {}) {
  const issues = [];
  // Use regex / simple string matching — no DOM library
  if (/* violation detected */) {
    issues.push({
      code:       'MY_RULE_CODE',
      severity:   'error',          // 'error' | 'warning' | 'info'
      message:    'Human-readable description of the problem.',
      element:    '.ui-my-component',
      suggestion: 'Actionable fix instruction.',
    });
  }
  return issues;
}
```

Add to the `RULES` array (or via `registerValidationRule` once E-2 is implemented). Add to the Validation Rule Catalogue in section 10 of the CLI architecture doc.

---

## 8. CSS Layer Architecture

The declared layer order is:

```css
@layer ai-kit.tokens, ai-kit.base, ai-kit.components, ai-kit.themes, ai-kit.overrides;
```

| Layer | Contents | Wins over |
|-------|----------|-----------|
| `ai-kit.tokens` | `--ui-*` and `--ai-*` custom properties | nothing (variables, no cascade) |
| `ai-kit.base` | Reset, `html`/`body`, font loading | — |
| `ai-kit.components` | All component class rules | base |
| `ai-kit.themes` | `[data-theme="*"]` overrides | components |
| `ai-kit.overrides` | Consumer customisation extension point | themes |

**Rules:**
- Component CSS files declare their `@layer ai-kit.components` wrapper internally.
- Theme files generated by `theme-map.js` always use `@layer ai-kit.themes`.
- The `ai-kit.overrides` layer is reserved for consumer use. ai-css-kit itself never writes into it.
- Adding a new layer above `ai-kit.overrides` is a breaking change — record in an ADR.

---

## 9. AI Context Maintenance

`AI_CONTEXT.md` is the system prompt loaded by the CLI and by external AI agents. It must stay accurate.

### 9.1 What must always be up to date

| Section | Trigger to update |
|---------|-------------------|
| Invariants (I-01..I-N) | New structural rule added |
| Component Registry | New component added / modifier added / removed |
| Composition Rules | New canonical HTML pattern added |
| Anti-patterns | New forbidden pattern identified |
| Token Reference | Any `--ai-*` token added, renamed, or removed |
| Theme Presets list | New theme added |

### 9.2 Drift detection

`npm run lint:context` runs `scripts/check-context-drift.js` which:
1. Extracts all `--ai-*` token names from `tokens.css`
2. Asserts each is present in `AI_CONTEXT.md` Token Reference section
3. Fails CI on mismatch

This does not yet check the Component Registry — that is a manual responsibility until `scripts/verify-component-completeness.js` is implemented (SCALABILITY_PLAN.md F-1).

### 9.3 Version tagging

Every time `AI_CONTEXT.md` changes, update the `> **VERSION:**` line at the top. The CLI reads this version to warn users if their installed context is older than the running kit version:

```
> **VERSION:** 0.7.0
```

---

## 10. Coupling Audit

`npm run lint:coupling` runs `scripts/audit-coupling.js`. It fails if any selector in a component CSS file targets a class owned by a different component.

**Allowed cross-component reference:** `.ui-field` (the shared form wrapper). It is in `GLOBAL_ALLOWED_BASES`.

When adding a new layout/wrapper component that other components legitimately reference by parent-selector (e.g., a new `ui-panel` that resizes children), add its base class to `GLOBAL_ALLOWED_BASES` in `audit-coupling.js` and record the decision in an ADR.

Never add component atoms (`ui-button`, `ui-input`, etc.) to `GLOBAL_ALLOWED_BASES` — they must remain isolated.

---

## 11. Sizing Conventions

There are two sizing models in the kit. Know which model applies to each component:

### Model 1: `.ui-field--[size]` parent (form atoms)

Used by: `ui-input`, `ui-textarea`, `ui-select`, `ui-autocomplete`, `ui-datepicker`

```html
<div class="ui-field ui-field--lg">
  <input class="ui-input">
</div>
```

The parent `.ui-field--lg` triggers size-specific padding/font-size overrides in the component CSS.

### Model 2: Own size modifier (non-form components)

Used by: `ui-button`, `ui-badge`, `ui-checkbox`, `ui-radio`, `ui-toggle`, `ui-slider`, `ui-calendar`

```html
<button class="ui-button ui-button--primary ui-button--lg">...</button>
```

**Do not mix the models.** A new component should use Model 1 if it is a form atom (wrapped in `.ui-field`), or Model 2 if it is standalone. Decide when creating the component and document the choice in `AI_CONTEXT.md`.

---

## 12. Commit and Review Checklist

Before merging any PR that adds or changes a component, token, theme, or CLI module:

```
[ ] npm run lint:coupling     — no cross-component selector violations
[ ] npm run lint:context      — AI_CONTEXT.md token reference is up to date
[ ] npm run lint:completeness — component has all required files (once script exists)
[ ] npm test                  — all unit tests pass
[ ] npm run build             — full build succeeds, no PostCSS errors
[ ] AI_CONTEXT.md updated     — Component Registry / Token Reference / Invariants
[ ] ADR written               — if a new architectural pattern was introduced
[ ] SPEC.md updated           — HTML contract documented with all modifiers
[ ] RELEASE_NOTES.md updated  — change logged under the upcoming version
```
