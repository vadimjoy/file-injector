# ADR-0003 — `--ai-[component]-[prop]` naming standard: component tokens

**Status:** Accepted  
**Date:** 2026-04-04  
**Author:** vadimjoy  
**Related ADRs:** [ADR-0001](0001-atomic-decoupling.md), [ADR-0002](0002-context-modifier-pattern.md)

---

## Context

The existing `--ui-*` variable system works at the level of global design tokens:

```css
:root {
  --ui-color-primary: #4f46e5;
  --ui-radius-md: 8px;
}
```

### Problem: no isolated customisation point

If an AI agent is given the task "make buttons with rounded corners", it must change `--ui-radius-md`, which affects every component using that token: inputs, selects, cards, badges — everything changes at once.

There is no way to change only the button without risking cascade changes.

### Problem: AI agent cannot see which variables affect which component

With only `--ui-color-primary`, the agent cannot answer "which variables control the button's background colour?" without reading `button.css` in full. With 15+ components this requires loading all CSS into context.

---

## Decision

### Two-level token system

**Level 1: Global Tokens** — existing `--ui-*`, preserved unchanged (backward compatible).

**Level 2: Component Tokens** — new `--ai-[component]-[prop]` that:
- reference global tokens by default
- can be overridden in isolation for a single component
- are documented in `AI_CONTEXT.md` as the single customisation point for that component

### Naming format

```
--ai-[component]-[property]
--ai-[component]-[property]-[state]
```

Examples:
```
--ai-button-bg                 ← button background (normal state)
--ai-button-bg-hover           ← button background on hover
--ai-button-radius             ← button radius
--ai-input-border-focus        ← input border on focus
--ai-calendar-selected-bg      ← background of selected day in calendar
```

### Component name rules

| Component | Prefix |
|-----------|--------|
| Button | `--ai-button-*` |
| Input | `--ai-input-*` |
| Textarea | `--ai-textarea-*` |
| Select | `--ai-select-*` |
| Card | `--ai-card-*` |
| Badge | `--ai-badge-*` |
| Progress | `--ai-progress-*` |
| Tooltip | `--ai-tooltip-*` |
| Checkbox | `--ai-checkbox-*` |
| Radio | `--ai-radio-*` |
| Toggle | `--ai-toggle-*` |
| Slider | `--ai-slider-*` |
| File Upload | `--ai-file-upload-*` |
| Autocomplete | `--ai-autocomplete-*` |
| Calendar (Datepicker) | `--ai-calendar-*` |

### Declaration in tokens.css

```css
/* ==========================================================================
   Component Tokens — Level 2 (--ai-*)
   Inherit from Global Tokens by default.
   Override these to customize a single component without cascade effects.
   ========================================================================== */
:root {
  /* Button */
  --ai-button-bg:           var(--ui-color-primary);
  --ai-button-bg-hover:     var(--ui-color-primary-hover);
  --ai-button-color:        #ffffff;
  --ai-button-border:       var(--ui-color-primary);
  --ai-button-radius:       var(--ui-radius-md);
  --ai-button-font-size:    var(--ui-font-size-md);
  --ai-button-focus-ring:   var(--ui-color-primary-soft);

  /* Input */
  --ai-input-bg:            var(--ui-color-bg);
  --ai-input-border:        var(--ui-color-border);
  --ai-input-border-focus:  var(--ui-color-border-focus);
  --ai-input-color:         var(--ui-color-text);
  --ai-input-radius:        var(--ui-radius-md);
  --ai-input-placeholder:   var(--ui-color-text-placeholder);

  /* ... and so on for each component */
}
```

### Usage in component files

```css
/* button.css — uses --ai-* tokens */
.ui-button--primary {
  background:    var(--ai-button-bg);
  color:         var(--ai-button-color);
  border-color:  var(--ai-button-border);
  border-radius: var(--ai-button-radius);
}

.ui-button--primary:hover:not(:disabled) {
  background:   var(--ai-button-bg-hover);
  border-color: var(--ai-button-bg-hover);
}
```

### Isolated customisation by AI agent

```css
/* Only buttons become green — other components are unaffected */
:root {
  --ai-button-bg:       #10b981;
  --ai-button-bg-hover: #059669;
  --ai-button-border:   #10b981;
  --ai-button-radius:   24px;
}
```

---

## Migration Strategy

### Phased approach

1. **Phase 2 (current):** Add `--ai-*` tokens to `tokens.css`; components start using them. `--ui-*` remain as aliases.
2. **Phase 3 (theming):** Theme Mapper generates CSS with `--ai-*` tokens for specific themes.
3. **Post v1.0.0 (optional):** Direct values in components may be replaced by `--ai-*` tokens if that does not cause breaking changes.

### No breaking changes

`--ui-*` tokens are not removed or renamed. `--ai-*` tokens are added on top and reference `--ui-*` by default:

```css
/* tokens.css */
:root {
  --ui-color-primary: #4f46e5;            /* ← Level 1: unchanged */
  --ai-button-bg: var(--ui-color-primary); /* ← Level 2: new token */
}
```

Code using `--ui-color-primary` directly continues to work.

---

## Consequences

### Positive

- AI agent has an **isolated namespace** for customising each component
- Tokens are self-documenting: `--ai-button-bg` clearly means "button background"
- `AI_CONTEXT.md` can reference specific `--ai-*` variables per component
- Theme Mapper (Phase 3) gets a clear API for generating theme overrides
- No breaking changes: `--ui-*` preserved as the global level

### Negative / Trade-offs

- Duplication: every component token references a global one (`--ai-button-bg: var(--ui-color-primary)`)
- `tokens.css` roughly doubles in size
- Developer must be aware of the two-level system

### Acceptability of trade-offs

Duplication in `tokens.css` is **documentation**: each line explicitly states how the component uses the global token. This is more valuable than brevity.

---

## Alternatives Considered

### A. Keep only --ui-* tokens

**Rejected:** No isolated customisation point. `--ui-radius-md` affects all components simultaneously.

### B. Inline CSS Variables as scope

```css
.ui-button { --bg: var(--ui-color-primary); background: var(--bg); }
```

**Rejected:** Single-name private variables (`--bg`) create conflicts when components are nested. No consistent namespace. AI agent cannot reach beyond the component file.

### C. CSS @layer for priorities without tokens

**Rejected:** `@layer` controls specificity but not the naming of customisation points. Does not solve the isolated customisation task for AI agents.

---

## Related Tasks

- [x] Component Tokens block added to `tokens.css`
- [x] All 15 components updated to use `--ai-*` tokens
- [x] `AI_CONTEXT.md` updated with full `--ai-*` Token Reference
- [x] Phase 3: Theme Mapper generates overrides via `--ai-*` tokens
