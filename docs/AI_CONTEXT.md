# AI CSS Kit — Context for AI Agents

> **VERSION:** 0.3.1 (Phase 1 target: 0.4.0)  
> **PURPOSE:** System prompt / reference document for AI agents generating UI with ai-css-kit  
> **SCOPE:** Load this file as context before generating any HTML with ai-css-kit classes

---

## 1. Invariants (Rules that MUST never be violated)

```
I-01  Every interactive form element MUST be wrapped in .ui-field
I-02  Every .ui-field MUST have exactly one size modifier: --sm | --md | --lg
I-03  Every <input>, <textarea>, <select> MUST have an associated <label class="ui-label">
I-04  A component's CSS class MUST NOT be overridden by a parent component's selector
I-05  Size variants are set on .ui-field, NOT on individual components inside it
I-06  Validation state classes (--error, --success, --warning) are set on the INPUT, not on .ui-field
I-07  Dark theme is activated via data-theme="dark" on <html> or any ancestor element
I-08  --ui-* CSS variables are the ONLY correct way to customize appearance
```

---

## 2. Component Registry

### 2.1 Layout / Wrappers

| Component | Base Class | Size Modifiers | Notes |
|-----------|------------|----------------|-------|
| Field wrapper | `.ui-field` | `--sm` `--md` `--lg` | Required parent for form elements |
| Card | `.ui-card` | — | Generic content container |

### 2.2 Form Atoms

| Component | Base Class | State Modifiers | Context Modifiers |
|-----------|------------|-----------------|-------------------|
| Input | `.ui-input` | `--error` `--success` `--warning` | `--icon-left` `--icon-right` `--search` `--readonly` |
| Textarea | `.ui-textarea` | `--error` `--success` `--warning` | — |
| Select | `.ui-select` | `--error` `--success` `--warning` | — |
| Checkbox | `.ui-checkbox` | — | `--sm` `--md` `--lg` (own size) |
| Radio | `.ui-radio` | — | `--sm` `--md` `--lg` (own size) |
| Toggle | `.ui-toggle` | — | `--sm` `--md` `--lg` (own size) |
| Slider | `.ui-slider` | — | `--sm` `--md` `--lg` (own size) |
| File Upload | `.ui-file-upload` | `--dragover` | `--sm` `--lg` |

> NOTE: Checkbox, Radio, Toggle, Slider carry their own size modifiers directly (not via .ui-field).

### 2.3 Composite Components

| Component | Wrapper Class | Required Children |
|-----------|---------------|-------------------|
| Autocomplete | `.ui-autocomplete-trigger` + `.ui-autocomplete__search-icon` + `.ui-autocomplete__input` | Input must include `ui-input--icon-left` + `.ui-autocomplete__input`; panel stays independent |
| Datepicker | `.ui-datepicker-trigger` + `.ui-datepicker__icon` + `.ui-datepicker__input` | Input must include `ui-input--icon-right` + `ui-input--readonly` + `.ui-datepicker__input`; calendar is separate component |
| Input with icon | `.ui-input-wrapper` | `.ui-input-icon` + `.ui-input` |

### 2.4 Display Components

| Component | Base Class | Modifiers |
|-----------|------------|-----------|
| Button | `.ui-button` | `--primary` `--secondary` `--ghost` + `--sm` `--md` `--lg` |
| Badge | `.ui-badge` | `--default` `--primary` `--success` `--warning` `--error` + `--sm` `--md` `--lg` + `--dot` |
| Progress | `.ui-progress` | `--primary` `--success` `--warning` `--error` + `--sm` `--md` `--lg` + `--striped` `--animated` |
| Tooltip | `.ui-tooltip` | `--bottom` `--left` `--right` (default = top) |

### 2.5 Typography Helpers

| Class | Description |
|-------|-------------|
| `.ui-label` | Field label (use inside .ui-field) |
| `.ui-helper` | Hint text below input |
| `.ui-error` | Error message text |
| `.ui-success-text` | Success message text |

---

## 3. Composition Rules

### Rule C-01: Standard form field

```html
<div class="ui-field ui-field--{sm|md|lg}">
  <label class="ui-label" for="{id}">{Label text}</label>
  <input type="{type}" id="{id}" class="ui-input" placeholder="...">
  <!-- optional: -->
  <span class="ui-helper">{Hint text}</span>
  <span class="ui-error">{Error message}</span>
</div>
```

### Rule C-02: Field with validation state

```html
<div class="ui-field ui-field--md">
  <label class="ui-label" for="email">Email</label>
  <input type="email" id="email"
         class="ui-input ui-input--error"
         aria-invalid="true"
         aria-describedby="email-err">
  <span class="ui-error" id="email-err" role="alert">Invalid email address</span>
</div>
```

### Rule C-03: Input with left icon

```html
<div class="ui-field ui-field--md">
  <label class="ui-label">Search</label>
  <div class="ui-input-wrapper">
    <span class="ui-input-icon"><!-- SVG icon --></span>
    <input type="search" class="ui-input ui-input--icon-left">
  </div>
</div>
```

### Rule C-04: Button variants

```html
<!-- Always use BOTH variant and size modifiers -->
<button class="ui-button ui-button--primary ui-button--md">Primary</button>
<button class="ui-button ui-button--secondary ui-button--md">Secondary</button>
<button class="ui-button ui-button--ghost ui-button--sm">Cancel</button>
```

### Rule C-05: Datepicker

```html
<div class="ui-field ui-field--md">
  <label class="ui-label">Date</label>
  <div class="ui-datepicker">
    <div class="ui-datepicker-trigger">
      <input type="text" class="ui-input ui-input--icon-right ui-input--readonly ui-datepicker__input"
             value="12/25/2024" readonly>
      <span class="ui-datepicker__icon"><!-- calendar SVG --></span>
    </div>
    <div class="ui-datepicker__calendar"><!-- calendar grid --></div>
  </div>
</div>
```

### Rule C-06: Checkbox / Radio group

```html
<fieldset>
  <legend>Options</legend>
  <label class="ui-checkbox ui-checkbox--md">
    <input type="checkbox" checked>
    <span>Option A</span>
  </label>
  <label class="ui-checkbox ui-checkbox--md">
    <input type="checkbox">
    <span>Option B</span>
  </label>
</fieldset>
```

---

## 4. Anti-patterns (NEVER generate these)

```
AP-01  DO NOT use parent-selector to override child component:
       ✗ .my-wrapper .ui-input { padding: 0; }
       ✓ Add a modifier class to .ui-input directly

AP-02  DO NOT use !important:
       ✗ .ui-button { background: red !important; }
       ✓ Override --ui-color-primary or --ai-button-bg

AP-03  DO NOT nest .ui-field inside another .ui-field

AP-04  DO NOT put validation state on .ui-field:
       ✗ <div class="ui-field ui-field--error">
       ✓ <input class="ui-input ui-input--error">

AP-05  DO NOT use .ui-button without both variant AND size:
       ✗ <button class="ui-button">
       ✓ <button class="ui-button ui-button--primary ui-button--md">

AP-06  DO NOT hardcode px values in inline styles for component internals:
       ✗ <input style="padding: 9px 13px;">
       ✓ Use .ui-field--md which sets correct padding via CSS
```

---

## 5. Token Reference (CSS Custom Properties)

### Global Tokens (--ui-*)

```
Color
  --ui-color-primary          Brand accent (default: #4f46e5)
  --ui-color-primary-hover    Hover state of primary
  --ui-color-primary-soft     Focus rings, soft backgrounds
  --ui-color-success          #16a34a
  --ui-color-warning          #d97706
  --ui-color-error            #dc2626
  --ui-color-border           Default border color
  --ui-color-border-focus     Focus border color
  --ui-color-bg               Page/component background
  --ui-color-bg-subtle        Subtle background (inputs, etc.)
  --ui-color-text             Primary text
  --ui-color-text-muted       Secondary/hint text

Spacing (4px baseline grid)
  --ui-space-1   4px
  --ui-space-2   8px
  --ui-space-3   12px
  --ui-space-4   16px
  --ui-space-6   24px
  --ui-space-8   32px

Border Radius
  --ui-radius-sm   6px
  --ui-radius-md   8px   ← default for inputs/buttons
  --ui-radius-lg   12px  ← cards, popups
  --ui-radius-full 9999px

Typography
  --ui-font-family   Inter, system-ui, sans-serif
  --ui-font-size-sm  13px
  --ui-font-size-md  14px  ← body default
  --ui-font-size-lg  16px

Shadows
  --ui-shadow-sm    subtle elevation
  --ui-shadow-md    dropdowns
  --ui-shadow-lg    modals, calendars
  --ui-shadow-focus focus ring (uses primary-soft)
```

### Customization Examples

```css
/* Brand override — affects all components */
:root {
  --ui-color-primary: #10b981;
  --ui-color-primary-hover: #059669;
  --ui-color-primary-soft: rgba(16, 185, 129, 0.15);
}

/* Rounded design system */
:root {
  --ui-radius-sm: 10px;
  --ui-radius-md: 14px;
  --ui-radius-lg: 20px;
}
```

---

## 6. Dark Theme

Activate by setting `data-theme="dark"` on `<html>` or any ancestor:

```html
<html data-theme="dark">
  <!-- All components automatically use dark palette -->
</html>
```

All color tokens have dark variants defined in `tokens.css`. No additional classes needed.

---

## 7. Size System Summary

| Size | Field class | Input padding | Button padding | Font size |
|------|-------------|---------------|----------------|-----------|
| sm | `.ui-field--sm` | 6px 10px | 6px 12px | 13px |
| md | `.ui-field--md` | 9px 13px | 9px 17px | 14px |
| lg | `.ui-field--lg` | 13px 17px | 12px 22px | 16px |

---

## 8. Accessibility Checklist

When generating form components, always include:

- `id` on every `<input>`, matching `for` on `<label>`
- `aria-invalid="true"` on inputs with `--error` modifier
- `aria-describedby="{id}"` pointing to `.ui-helper` / `.ui-error` elements
- `role="alert"` on `.ui-error` elements that appear dynamically
- `disabled` attribute (not CSS class) for disabled state
- `<fieldset>` + `<legend>` for checkbox/radio groups

---

*This document is auto-sourced from SPEC.md and updated with each component release.*  
*ADR decisions that affect this context: [ADR-0001](adr/0001-atomic-decoupling.md)*
