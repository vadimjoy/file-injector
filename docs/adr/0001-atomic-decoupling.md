# ADR-0001 — Atomic Decoupling: ban parent-selector mutations

**Status:** Accepted  
**Date:** 2026-04-02  
**Author:** vadimjoy  
**Related ADRs:** —

---

## Context

AI CSS Kit is positioned as "Deterministic UI Lego" — a set of components that an AI agent can combine without conflicts and unexpected visual effects.

An audit of the v0.3.1 codebase revealed a **parent-selector mutation** pattern: a container component overrides the styles of a nested base component via a CSS chain like `.parent .child`.

### Violations found

**`src/css/components/datepicker.css`, line 15:**

```css
.ui-datepicker__input-wrapper .ui-input {
  padding-right: 40px;
}
```

**`src/css/components/autocomplete.css`, line 15:**

```css
.ui-autocomplete__input-wrapper .ui-input {
  padding-left: 36px;
}
```

### Why this is critical for AI

1. **Breaks predictability.** An AI agent generating `<input class="ui-input">` inside `ui-datepicker` sees no explicit signal that padding will be changed. The class `.ui-input` alone carries no such information.

2. **Exponential context growth.** To correctly use `ui-input`, the agent must know all N components that contain `ui-input` inside them. Complexity grows as O(N²). With an atomic approach — O(1) per component.

3. **Fragility during refactoring.** Moving `.ui-input` to a different container unexpectedly changes its appearance. The agent cannot predict this without static analysis of all CSS.

4. **Specificity conflict.** If a developer adds `.ui-input { padding-right: 10px }` at page level, the result is unpredictable depending on file import order.

---

## Decision

### Rule: "One component — one file — full isolation"

Every component CSS file is **prohibited** from containing CSS rules whose selector targets a CSS class from another component.

**Violation criterion:** A rule is a violation if:
- its selector contains a class from another component file, OR
- its selector contains more than one component class in a CSS chain

### Context Modifier Pattern

Instead of mutating via parent-selector, introduce an **explicit modifier** on the component itself. The modifier carries the semantic context in its name.

```css
/* PROHIBITED: mutation from outside */
.ui-datepicker__input-wrapper .ui-input {
  padding-right: 40px;
}

/* CORRECT: explicit modifier on the atom */
.ui-input--icon-right {
  padding-right: 40px;
}
```

Markup becomes an explicit contract:

```html
<!-- PROHIBITED: hidden behaviour -->
<div class="ui-datepicker__input-wrapper">
  <input class="ui-input" type="text">
  <!-- ↑ silently gets padding-right: 40px -->
</div>

<!-- CORRECT: explicit contract, readable without context knowledge -->
<div class="ui-datepicker__input-wrapper">
  <input class="ui-input ui-input--icon-right" type="text">
  <!-- ↑ modifier explicitly indicates a right-side icon -->
</div>
```

### New modifiers for `.ui-input`

| Modifier | CSS property | Replaces |
|----------|-------------|---------|
| `.ui-input--icon-left` | `padding-left: 36px` | `.ui-input-wrapper .ui-input` (old) |
| `.ui-input--icon-right` | `padding-right: 40px` | `.ui-datepicker__input-wrapper .ui-input` |
| `.ui-input--search` | `padding-left: 36px` + `padding-right: 36px` | for double icons |
| `.ui-input--readonly` | `cursor: pointer; caret-color: transparent` | new (needed by datepicker) |

---

## Enforcement Mechanism

### Automated audit script

`scripts/audit-coupling.js` runs in CI and fails the build on rule violation:

```javascript
// Simplified logic
const COMPONENT_CLASSES = loadComponentClasses(); // ['ui-input', 'ui-button', ...]

for (const file of componentFiles) {
  const rules = parseCSS(file);
  for (const rule of rules) {
    const foreignClasses = findForeignClasses(rule.selector, currentComponent);
    if (foreignClasses.length > 0) {
      throw new Error(
        `COUPLING VIOLATION in ${file}: ` +
        `selector "${rule.selector}" targets foreign class "${foreignClasses[0]}"`
      );
    }
  }
}
```

### Error format

```
COUPLING VIOLATION
  File:     src/css/components/datepicker.css
  Line:     15
  Selector: .ui-datepicker__input-wrapper .ui-input
  Problem:  Selector targets .ui-input which belongs to input.css
  Fix:      Add modifier .ui-input--icon-right to the atom instead
```

---

## Consequences

### Positive

- AI agent gets **O(1) context** for each component: everything needed is described in the element's own classes
- HTML becomes self-documenting: the set of classes fully describes the visual state
- Order-of-imports problem eliminated — specificity no longer depends on file order
- Component refactoring becomes safe: moving an element does not change its appearance

### Negative / Trade-offs

- Slight increase in the number of CSS classes on HTML elements (`ui-input ui-input--icon-right` instead of plain `ui-input` inside datepicker)
- Requires updating existing documentation (`SPEC.md`) and examples in `src/demos/`
- **Breaking change** for consumers who used `.ui-datepicker__input-wrapper .ui-input` in their own CSS for additional customisation

### Migration path for consumers

```css
/* v0.3.x — worked via implicit coupling */
.ui-datepicker__input-wrapper .ui-input { ... }

/* v0.4.0 — explicit modifier */
.ui-input--icon-right { ... }
```

---

## Alternatives Considered

### A. CSS Scope (@scope)

Use the new CSS `@scope` to limit style visibility:

```css
@scope (.ui-datepicker__input-wrapper) {
  .ui-input { padding-right: 40px; }
}
```

**Rejected:** `@scope` has limited browser support (Chrome 118+, Firefox unsupported at decision date). Contradicts the isolation principle — datepicker still "knows" about the inner input layout.

### B. CSS Custom Properties for contextual injection

Parent component sets a variable that the child "listens to":

```css
.ui-datepicker__input-wrapper {
  --_input-padding-right: 40px;
}

.ui-input {
  padding-right: var(--_input-padding-right, 13px);
}
```

**Rejected:** Creates an implicit contract via "magic" variables. The AI agent does not see `--_input-padding-right` in `.ui-input` documentation. Worse readability, no advantage over Context Modifier Pattern.

### C. Keep as-is and document

Describe all known parent-selector mutations in `AI_CONTEXT.md` and train the agent to account for them.

**Rejected:** Does not solve the root problem, only shifts complexity to documentation. Every new container component will add another special case.

---

## Related Tasks

- [x] Implement new `.ui-input--icon-*` modifiers in `input.css`
- [x] Remove coupling rules from `datepicker.css` and `autocomplete.css`
- [x] Write `scripts/audit-coupling.js`
- [x] Add audit script to CI (`package.json scripts.lint:coupling`)
- [x] Update `SPEC.md` — datepicker and autocomplete HTML contracts
- [x] Update `src/demos/datepicker.html` and `src/demos/autocomplete.html`
