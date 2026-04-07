# ADR-0002 — Context Modifier Pattern for icons and contextual padding

**Status:** Accepted  
**Date:** 2026-04-04  
**Author:** vadimjoy  
**Related ADRs:** [ADR-0001](0001-atomic-decoupling.md)

---

## Context

ADR-0001 prohibited parent-selector mutations and introduced the component isolation principle. However, it described only "what is forbidden" without fully answering the question "what to do instead".

The concrete problem: orchestrator components (datepicker, autocomplete, input-with-icon) need to modify the internal padding of the `ui-input` atom so that text is not obscured by an icon. Meanwhile:

1. Mutating `ui-input` from the outside via parent-selector — prohibited (ADR-0001)
2. Hardcoding `padding` in each orchestrator — duplication with no unified standard
3. The AI agent must see the context explicitly from the element's own classes

---

## Decision

### Context Modifier Pattern

Introduce a modifier class on the atom itself that carries the **semantic context** of use:

```
.ui-input--icon-left    → padding-left increased to accommodate a left icon
.ui-input--icon-right   → padding-right increased to accommodate a right icon
.ui-input--search       → both padding-left and padding-right increased (double icon)
.ui-input--readonly     → cursor: pointer, caret-color: transparent
```

### Modifier naming principle

A context modifier answers the question **"in what context is the atom used?"**, not "who uses it".

```
✓ .ui-input--icon-right    (context: there is a right-side icon)
✗ .ui-input--datepicker    (violation: binding to a specific parent)
✗ .ui-input--in-picker     (violation: describes a relationship, not the atom's state)
```

This allows a single modifier to be reused across multiple orchestrators:

```html
<!-- datepicker uses icon-right -->
<input class="ui-input ui-input--icon-right ui-input--readonly">

<!-- a custom trigger can also use icon-right -->
<input class="ui-input ui-input--icon-right">
```

### Size-aware modifiers

Padding in context modifiers adapts via the `.ui-field--{size}` parent:

```css
/* Base (md) */
.ui-input.ui-input--icon-left  { padding-left: 36px; }
.ui-input.ui-input--icon-right { padding-right: 40px; }

/* Small — smaller offset */
.ui-field--sm .ui-input.ui-input--icon-left  { padding-left: 30px; }

/* Large — larger offset */
.ui-field--lg .ui-input.ui-input--icon-left  { padding-left: 44px; }
```

The orchestrator does not control sizes directly — they are inherited via the standard `.ui-field--{size}` mechanism.

---

## Application to Components

### Datepicker

```html
<!-- Datepicker trigger: input + right icon -->
<div class="ui-datepicker-trigger">
  <input type="text"
         class="ui-input ui-input--icon-right ui-input--readonly
                ui-datepicker__input"
         value="12/25/2024" readonly>
  <span class="ui-datepicker__icon"><!-- calendar SVG --></span>
</div>
```

### Autocomplete

```html
<!-- Autocomplete trigger: input + left icon -->
<div class="ui-autocomplete-trigger">
  <span class="ui-autocomplete__search-icon"><!-- search SVG --></span>
  <input type="text"
         class="ui-input ui-input--icon-left ui-autocomplete__input"
         placeholder="Search...">
</div>
```

### Input with arbitrary icon

```html
<!-- Standard input-wrapper with left icon -->
<div class="ui-input-wrapper">
  <span class="ui-input-icon"><!-- SVG --></span>
  <input type="search" class="ui-input ui-input--icon-left">
</div>
```

---

## Pattern Extensibility

The pattern is not limited to icons. Any case where context requires modification of an atom should be expressed as an explicit modifier:

| Situation | Wrong | Correct |
|-----------|-------|---------|
| Datepicker needs cursor:pointer | `.ui-datepicker .ui-input { cursor: pointer }` | `.ui-input--readonly` |
| Search form — double icon | `.search-form .ui-input { padding: 9px 36px }` | `.ui-input--search` |
| Inline editor without border | `.editor .ui-input { border: none }` | `.ui-input--borderless` (future) |

---

## Consequences

### Positive

- HTML is self-documenting: the set of classes on an element fully describes its state
- AI agent has O(1) context for each atom: no need to know which orchestrator the atom is in
- A single modifier is reused across multiple components
- `audit-coupling.js` lint script detects violations automatically

### Negative / Trade-offs

- Number of classes on an element grows: `class="ui-input ui-input--icon-right ui-input--readonly"`
- Developer must know about the modifier — documentation in AI_CONTEXT.md is required
- Adding a new icon type requires adding a new modifier in `input.css`

---

## Alternatives Considered

### A. Named data attribute

```html
<input class="ui-input" data-icon="right">
```

**Rejected:** Data attributes are not part of the component's CSS contract. Requires an additional CSS rule `[data-icon="right"]`. No standardisation for lint checks.

### B. CSS Custom Property injection

```css
.ui-datepicker-trigger { --_input-padding-right: 40px; }
.ui-input { padding-right: var(--_input-padding-right, 13px); }
```

**Rejected:** "Magic" variables are invisible in the atom's documentation. The AI agent cannot infer `ui-input` behaviour without knowing about `--_input-padding-right`.

---

## Related Tasks

- [x] Implemented modifiers `.ui-input--icon-left/right/search/readonly` in `input.css`
- [x] Removed coupling rules from `datepicker.css` and `autocomplete.css`
- [x] Updated HTML contracts in `SPEC.md`
