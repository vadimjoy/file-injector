# AI CSS Kit — Component Library Specification

> **Language:** English (full spec) | [Russian (summary)](../ru/SPEC.md)  
> **Docs index:** [docs/README.md](../../README.md)

## Overview

**AI CSS Kit** is a lightweight, AI-first CSS component library built with zero JavaScript dependencies. Designed with minimalism and accessibility in mind, it provides a complete set of form components with support for light/dark themes.

### Key Features

- **Zero Dependencies** — Pure CSS, no JavaScript libraries required for styling
- **3 Size Variants** — Small (sm), Medium (md), and Large (lg) for all components
- **Full Customization** — Every visual aspect controlled via CSS custom properties (`--ui-*` / `--ai-*`)
- **Theme Presets + Mapper** — `dist/themes/*.css` + JSON → CSS CLI for custom themes
- **Accessibility First** — ARIA-compatible, keyboard navigable, focus states
- **Modern Standards** — CSS Grid, Flexbox, Custom Properties, and semantic HTML
- **Responsive** — Mobile-first approach with breakpoints at 768px and 1024px

### When to Use

- Projects requiring full style control without framework overhead
- Lightweight applications where bundle size matters
- Prototypes and MVPs needing polished UI quickly
- Design systems requiring consistent, themeable components

---

## Installation

### npm (Recommended)

```bash
npm install ai-css-kit font-awesome
```

```css
@import 'ai-css-kit';
/* or */
@import 'ai-css-kit/components/button.css';
```

### CDN

```html
<link rel="stylesheet" href="https://unpkg.com/ai-css-kit/dist/ai-css-kit.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
```

### Prerequisites

```html
<!-- Required: Google Fonts Inter -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

---

## Quick Start

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://unpkg.com/ai-css-kit/dist/ai-css-kit.css">
</head>
<body>
  <div class="ui-field ui-field--md">
    <label class="ui-label">Email Address</label>
    <input type="email" class="ui-input" placeholder="name@example.com">
    <span class="ui-helper">We'll never share your email</span>
  </div>
</body>
</html>
```

---

## Theming

### Cascade Layers

All styles are grouped into cascade layers so theme overrides win without using `!important`:

```
@layer ai-kit.tokens, ai-kit.base, ai-kit.components, ai-kit.themes;

ai-kit.tokens     — global `--ui-*` tokens + dark fallback
ai-kit.base       — reset, `.ui-field`, typography
ai-kit.components — 43 components + states (`--ai-*` tokens)
```

### Built-in Presets

Five ready-made themes live in `dist/themes/` and are activated via a `data-theme` attribute on `<html>`:

| File | Attribute | Mood |
|------|-----------|------|
| `dist/themes/default.css` | `data-theme="default"` *(or omit the attribute)* | Base light theme |
| `dist/themes/dark.css` | `data-theme="dark"` | Classic dark mode |
| `dist/themes/midnight.css` | `data-theme="midnight"` | Deep dark with violet accent |
| `dist/themes/corporate.css` | `data-theme="corporate"` | Calm neutral blue/gray |
| `dist/themes/warm.css` | `data-theme="warm"` | Warm sandy palette with rounded corners |

```html
<link rel="stylesheet" href="/dist/ai-css-kit.css">
<link rel="stylesheet" href="/dist/themes/midnight.css">

<html data-theme="midnight">...</html>
```

### Theme Mapper CLI

The `scripts/theme-map.js` helper accepts JSON (native, W3C Design Tokens, or Figma Tokens) and emits CSS inside `@layer ai-kit.themes`:

```bash
npm run theme-map -- ./src/themes/ocean.json -o ./dist/themes/ocean.css
```

Mapping rules:

- Keys that start with a component name (`button.bg`, `input.border`) → `--ai-button-bg`, `--ai-input-border`
- Other keys become `--ui-color-*`, `--ui-radius-*`, etc. (dots turn into hyphens)
- Keys that already start with `--` are copied to CSS verbatim

The full format lives in [`docs/theming.md`](../../theming.md).

### Manual Overrides

Override tokens manually inside `:root` or within a component scope whenever you need bespoke tweaks:

```css
:root {
  --ui-color-primary: #10b981;
  --ui-color-primary-hover: #059669;
  --ui-radius-md: 12px;
  --ui-font-family: 'Poppins', sans-serif;
}

:root {
  --ai-button-radius: 24px;
  --ai-calendar-selected-bg: #6d28d9;
}
```

---

## CSS Variables Reference

### Colors

| Variable | Default (Light) | Default (Dark) | Description |
|----------|-----------------|----------------|-------------|
| `--ui-color-primary` | `#4f46e5` | `#818cf8` | Primary brand color |
| `--ui-color-primary-hover` | `#4338ca` | `#6366f1` | Primary hover state |
| `--ui-color-primary-soft` | `rgba(79,70,229,0.10)` | `rgba(129,140,248,0.15)` | Focus rings, selections |
| `--ui-color-success` | `#16a34a` | `#4ade80` | Success state |
| `--ui-color-warning` | `#d97706` | `#fbbf24` | Warning state |
| `--ui-color-error` | `#dc2626` | `#f87171` | Error state |
| `--ui-color-border` | `#e5e7eb` | `#374151` | Default border |
| `--ui-color-border-focus` | `#4f46e5` | `#818cf8` | Focus border |
| `--ui-color-bg` | `#ffffff` | `#1f2937` | Background |
| `--ui-color-text` | `#111827` | `#f9fafb` | Primary text |
| `--ui-color-text-muted` | `#6b7280` | `#9ca3af` | Secondary text |

### Spacing System

| Variable | Value | Usage |
|----------|-------|-------|
| `--ui-space-1` | 4px | Minimal gaps |
| `--ui-space-2` | 8px | Icon gaps |
| `--ui-space-3` | 12px | Small padding |
| `--ui-space-4` | 16px | Standard padding |
| `--ui-space-6` | 24px | Section gaps |
| `--ui-space-8` | 32px | Large gaps |

### Border Radius

| Variable | Value | Usage |
|----------|-------|-------|
| `--ui-radius-sm` | 6px | Small elements |
| `--ui-radius-md` | 8px | Inputs, buttons |
| `--ui-radius-lg` | 12px | Cards, modals |
| `--ui-radius-full` | 9999px | Pills, badges |

### Shadows

| Variable | Value | Usage |
|----------|-------|-------|
| `--ui-shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| `--ui-shadow-md` | `0 4px 6px rgba(0,0,0,0.07)` | Dropdowns |
| `--ui-shadow-lg` | `0 10px 15px rgba(0,0,0,0.08)` | Modals, popovers |

### Typography

| Variable | Default | Description |
|----------|---------|-------------|
| `--ui-font-family` | `Inter, system-ui, sans-serif` | Base font |
| `--ui-font-size-sm` | 13px | Small text |
| `--ui-font-size-md` | 14px | Body text |
| `--ui-font-size-lg` | 16px | Large text |
| `--ui-line-height` | 1.5 | Line height |

### Transitions

| Variable | Value | Description |
|----------|-------|-------------|
| `--ui-transition-fast` | `all 0.15s ease` | Quick feedback |
| `--ui-transition` | `all 0.2s ease` | Standard animations |
| `--ui-transition-slow` | `all 0.3s ease` | Emphasis animations |

---

## Component Library

### 1. Input (`.ui-input`)

Text input field with multiple states and sizes.

#### Classes

| Class | Description |
|-------|-------------|
| `.ui-input` | Base input style |
| `.ui-input--error` | Error state styling |
| `.ui-input--success` | Success state styling |
| `.ui-input--warning` | Warning state styling |
| `.ui-input--icon-left` | Adds left padding for leading icon contexts |
| `.ui-input--icon-right` | Adds right padding for trailing icon contexts |
| `.ui-input--search` | Balanced padding for icons on both sides |
| `.ui-input--readonly` | Pointer cursor + hidden caret for non-editable triggers |
| `.ui-input-wrapper` | Grid container for icon overlay — positions icon and input in the same cell without `position: absolute` |
| `.ui-input-icon` | Left-side icon inside `.ui-input-wrapper` |
| `.ui-input-icon--right` | Right-side icon inside `.ui-input-wrapper` |

#### States

- **Default**: Normal appearance
- **Focus**: Blue border with soft shadow ring
- **Hover**: Darker border
- **Disabled**: Muted colors, not-allowed cursor
- **Error**: Red border, red background tint
- **Success**: Green border, green background tint
- **Warning**: Amber border, amber background tint

#### HTML Examples

```html
<!-- Basic input -->
<input type="text" class="ui-input" placeholder="Enter text...">

<!-- With field wrapper -->
<div class="ui-field ui-field--md">
  <label class="ui-label">Email</label>
  <input type="email" class="ui-input" placeholder="email@example.com">
  <span class="ui-helper">We'll never share your email</span>
</div>

<!-- Error state -->
<input type="text" class="ui-input ui-input--error" value="Invalid">
<span class="ui-error">Please enter a valid email</span>

<!-- With left icon (search) — CSS Grid overlay, no position:absolute -->
<div class="ui-input-wrapper">
  <span class="ui-input-icon">
    <svg><!-- search icon --></svg>
  </span>
  <input type="text" class="ui-input ui-input--icon-left" placeholder="Search...">
</div>

<!-- With right icon (date) -->
<div class="ui-input-wrapper">
  <input type="text" class="ui-input ui-input--icon-right ui-input--readonly" placeholder="MM/DD/YYYY" readonly>
  <span class="ui-input-icon ui-input-icon--right">
    <svg><!-- calendar icon --></svg>
  </span>
</div>
```

> **Implementation note:** `.ui-input-wrapper` uses `display: grid` with both the icon and the input assigned to the same `grid-area: 1 / 1`. The icon floats over the input via `z-index: 1` — no `position: absolute` is used. Size overrides (icon offset, input padding) are applied automatically when the wrapper is inside a `.ui-field--sm` or `.ui-field--lg` parent.

#### Input Types Supported

- `text` — Standard text input
- `email` — Email with validation
- `password` — Masked input
- `number` — Numeric input
- `tel` — Telephone number
- `url` — URL with validation
- `search` — Search input

---

### 2. Textarea (`.ui-textarea`)

Multi-line text input for longer content.

#### Classes

| Class | Description |
|-------|-------------|
| `.ui-textarea` | Base textarea |
| `.ui-textarea--error` | Error state |
| `.ui-textarea--success` | Success state |
| `.ui-textarea--warning` | Warning state |

#### States

Same as Input component.

#### HTML Example

```html
<div class="ui-field ui-field--md">
  <label class="ui-label">Message</label>
  <textarea class="ui-textarea" rows="4" placeholder="Enter your message..."></textarea>
</div>
```

---

### 3. Select (`.ui-select`)

Dropdown select with custom arrow styling.

#### Classes

| Class | Description |
|-------|-------------|
| `.ui-select` | Base select |
| `.ui-select--error` | Error state |
| `.ui-select--success` | Success state |
| `.ui-select--warning` | Warning state |

#### States

Same as Input component.

#### HTML Example

```html
<div class="ui-field ui-field--md">
  <label class="ui-label">Country</label>
  <select class="ui-select">
    <option value="">Select a country...</option>
    <option value="us">United States</option>
    <option value="uk">United Kingdom</option>
  </select>
</div>
```

---

### 4. Autocomplete

Search input trigger and list suggestion panel — two independent atomic components. The trigger and the panel are never structurally coupled; the panel lives in normal document flow and physically displaces surrounding content.

#### Trigger Classes

| Class | Description |
|-------|-------------|
| `.ui-autocomplete-trigger` | Grid container for search input + icon overlay |
| `.ui-autocomplete__search-icon` | Left search icon inside the trigger |
| `.ui-autocomplete__input` | Input element that shares grid-area with the icon |

#### List Panel Classes

| Class | Description |
|-------|-------------|
| `.ui-autocomplete-panel` | Base static list panel |
| `.ui-autocomplete-panel--sm` | Small: 6px 10px item padding, 13px font, 14px icons, max-height 180px |
| `.ui-autocomplete-panel--md` | Medium: 9px 13px item padding, 14px font, 16px icons, max-height 220px |
| `.ui-autocomplete-panel--lg` | Large: 12px 16px item padding, 16px font, 18px icons, max-height 260px |
| `.ui-autocomplete__item` | Suggestion item row |
| `.ui-autocomplete__item--active` | Keyboard-focused item |
| `.ui-autocomplete__item--highlighted` | Selected / matched item |
| `.ui-autocomplete__item-icon` | Optional leading icon inside an item |
| `.ui-autocomplete__empty` | Empty-state message |

#### States

- **Item Hover**: Background highlight (`--ui-color-bg-hover`)
- **Active**: Keyboard navigation state
- **Highlighted**: Selected/matching item — primary light background

#### HTML Example

```html
<!-- Trigger — wraps inside ui-field for size context -->
<div class="ui-field ui-field--md">
  <label class="ui-label">Search Products</label>
  <div class="ui-autocomplete-trigger">
    <span class="ui-autocomplete__search-icon">
      <svg><!-- search icon --></svg>
    </span>
    <input type="text" class="ui-input ui-input--icon-left ui-autocomplete__input" placeholder="Type to search...">
  </div>
</div>

<!-- List panel — text only (sm) -->
<div class="ui-autocomplete-panel ui-autocomplete-panel--sm">
  <div class="ui-autocomplete__item ui-autocomplete__item--highlighted">
    <span>John Doe</span>
  </div>
  <div class="ui-autocomplete__item">
    <span>Jane Smith</span>
  </div>
  <div class="ui-autocomplete__item ui-autocomplete__item--active">
    <span>Bob Johnson</span>
  </div>
</div>

<!-- List panel — with icons (md) -->
<div class="ui-autocomplete-panel ui-autocomplete-panel--md">
  <div class="ui-autocomplete__item ui-autocomplete__item--highlighted">
    <span class="ui-autocomplete__item-icon">📦</span>
    <span>MacBook Pro</span>
  </div>
  <div class="ui-autocomplete__item">
    <span class="ui-autocomplete__item-icon">📦</span>
    <span>iPhone 15</span>
  </div>
</div>

<!-- Empty state (lg) -->
<div class="ui-autocomplete-panel ui-autocomplete-panel--lg">
  <div class="ui-autocomplete__empty">No matches found</div>
</div>
```

> **Implementation note:** `.ui-autocomplete-trigger` uses `display: grid` — both the search icon and the input share `grid-area: 1 / 1`. No `position: absolute`. The list panel is `display: block` in normal flow — it pushes adjacent content down.

> **Context modifier rule:** Autocomplete never mutates `.ui-input` internally—always add `.ui-input--icon-left` (and other modifiers such as `--readonly`) plus the helper class `.ui-autocomplete__input` so the HTML contract stays explicit.

---

### 5. Checkbox (`.ui-checkbox`)

Single or multiple selection checkbox.

#### Classes

| Class | Description |
|-------|-------------|
| `.ui-checkbox` | Base checkbox wrapper |
| `.ui-checkbox--sm` | Small size (13px) |
| `.ui-checkbox--md` | Medium size (16px, default) |
| `.ui-checkbox--lg` | Large size (20px) |

#### States

- **Unchecked**: Empty checkbox
- **Checked**: Filled with primary color
- **Disabled**: Reduced opacity
- **Focus**: Visible outline ring

#### HTML Example

```html
<!-- Single checkbox -->
<label class="ui-checkbox ui-checkbox--md">
  <input type="checkbox">
  <span>Accept</span>
</label>

<!-- Checked state -->
<label class="ui-checkbox ui-checkbox--md">
  <input type="checkbox" checked>
  <span>Subscribe</span>
</label>

<!-- Disabled -->
<label class="ui-checkbox ui-checkbox--md">
  <input type="checkbox" disabled>
  <span>Unavailable option</span>
</label>
```

---

### 6. Radio (`.ui-radio`)

Mutually exclusive single selection.

#### Classes

| Class | Description |
|-------|-------------|
| `.ui-radio` | Base radio wrapper |
| `.ui-radio--sm` | Small size |
| `.ui-radio--md` | Medium size (default) |
| `.ui-radio--lg` | Large size |

#### States

Same as Checkbox.

#### HTML Example

```html
<fieldset>
  <legend>Shipping Method</legend>
  <label class="ui-radio ui-radio--md">
    <input type="radio" name="shipping" checked>
    <span>Standard shipping (Free)</span>
  </label>
  <label class="ui-radio ui-radio--md">
    <input type="radio" name="shipping">
    <span>Express shipping ($15)</span>
  </label>
</fieldset>
```

---

### 7. Toggle / Switch (`.ui-toggle`)

On/off switch with animated toggle.

#### Classes

| Class | Description |
|-------|-------------|
| `.ui-toggle` | Base toggle wrapper |
| `.ui-toggle--sm` | Small (34×19px) |
| `.ui-toggle--md` | Medium (42×23px, default) |
| `.ui-toggle--lg` | Large (54×29px) |

#### States

- **Off**: Gray background, knob on left
- **On**: Primary color background, knob on right
- **Disabled**: Reduced opacity

#### HTML Example

```html
<label class="ui-toggle ui-toggle--md">
  <input type="checkbox">
  <span>Enable notifications</span>
</label>

<!-- Default on -->
<label class="ui-toggle ui-toggle--md">
  <input type="checkbox" checked>
  <span>Dark mode</span>
</label>
```

---

### 8. Slider (`.ui-slider`)

Range input for numeric values.

#### Classes

| Class | Description |
|-------|-------------|
| `.ui-slider` | Base slider |
| `.ui-slider--sm` | Small (3px track, 13px thumb) |
| `.ui-slider--md` | Medium (5px track, 17px thumb, default) |
| `.ui-slider--lg` | Large (7px track, 21px thumb) |

#### States

- **Default**: Gray track, primary thumb
- **Hover**: Thumb scales up with shadow
- **Focus**: Ring outline
- **Dragging**: Active scale state

#### HTML Example

```html
<div class="ui-field ui-field--md">
  <label class="ui-label">Volume: 50%</label>
  <input type="range" class="ui-slider ui-slider--md" 
         min="0" max="100" value="50">
</div>

<!-- With steps -->
<input type="range" class="ui-slider ui-slider--md" 
       min="0" max="100" step="10" value="50">
```

---

### 9. Button (`.ui-button`)

Action buttons with multiple variants.

#### Classes

| Class | Description |
|-------|-------------|
| `.ui-button` | Base button |
| `.ui-button--primary` | Filled primary color |
| `.ui-button--secondary` | Outlined with border |
| `.ui-button--ghost` | Transparent background |
| `.ui-button--sm` | Small size |
| `.ui-button--md` | Medium size (default) |
| `.ui-button--lg` | Large size |

#### States

- **Default**: Base appearance
- **Hover**: Visual feedback (color change, shadow)
- **Focus**: Ring outline
- **Active**: Slight scale down
- **Disabled**: Reduced opacity, no interactions

#### HTML Examples

```html
<!-- Variants -->
<button class="ui-button ui-button--primary ui-button--md">
  Save Changes
</button>

<button class="ui-button ui-button--secondary ui-button--md">
  Cancel
</button>

<button class="ui-button ui-button--ghost ui-button--md">
  Learn More
</button>

<!-- With icon -->
<button class="ui-button ui-button--primary ui-button--md">
  <svg><!-- icon --></svg>
  <span>Download</span>
</button>

<!-- Disabled -->
<button class="ui-button ui-button--primary ui-button--md" disabled>
  Processing...
</button>
```

---

### 10. File Upload (`.ui-file-upload`)

Drag-and-drop file input with visual feedback.

#### Classes

| Class | Description |
|-------|-------------|
| `.ui-file-upload` | Base container |
| `.ui-file-upload--sm` | Small size |
| `.ui-file-upload--lg` | Large size |
| `.ui-file-upload--dragover` | Active drag state |
| `.ui-file-upload__icon` | Upload icon |
| `.ui-file-upload__title` | Main text |
| `.ui-file-upload__hint` | Subtle hint text |
| `.ui-file-upload__btn` | Browse button |

#### States

- **Default**: Dashed border, subtle background
- **Hover**: Border color change, icon animation
- **Dragover**: Highlighted state with primary border

#### HTML Example

```html
<div class="ui-file-upload">
  <input type="file" accept="image/*">
  <div class="ui-file-upload__icon">
    <svg><!-- upload icon --></svg>
  </div>
  <span class="ui-file-upload__title">Drop files here</span>
  <span class="ui-file-upload__hint">or click to browse</span>
  <span class="ui-file-upload__btn">Select Files</span>
</div>
```

#### JavaScript Integration

```javascript
dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropzone.classList.add('ui-file-upload--dragover');
});

dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('ui-file-upload--dragover');
  // Handle dropped files
});
```

---

### 11. Date Picker

Date input trigger and calendar view — two independent atomic components. The trigger and the calendar are never structurally coupled; the calendar lives in normal document flow and physically displaces surrounding content.

#### Trigger Classes

| Class | Description |
|-------|-------------|
| `.ui-datepicker-trigger` | Grid container for date input + calendar icon overlay |
| `.ui-datepicker__icon` | Right-side calendar icon inside the trigger |
| `.ui-datepicker__input` | Input element that shares grid-area with the icon |

#### Calendar View Classes

| Class | Description |
|-------|-------------|
| `.ui-calendar` | Base static calendar surface |
| `.ui-calendar--sm` | Small: 240px min-width, 26px day cells, 13px month font |
| `.ui-calendar--md` | Medium: 280px min-width, 32px day cells, 14px month font |
| `.ui-calendar--lg` | Large: 340px min-width, 40px day cells, 16px month font |
| `.ui-datepicker__header` | Month navigation bar |
| `.ui-datepicker__nav` | Prev / Next month buttons |
| `.ui-datepicker__month-year` | Month and year label |
| `.ui-datepicker__grid` | 7-column CSS Grid for weekdays + day buttons |
| `.ui-datepicker__weekday` | Weekday header cell (Su, Mo …) |
| `.ui-datepicker__day` | Day button |
| `.ui-datepicker__day--today` | Current day — primary text color |
| `.ui-datepicker__day--selected` | Selected day — primary background |
| `.ui-datepicker__day--muted` | Days from adjacent months |
| `.ui-datepicker__footer` | Optional action buttons (Cancel / Apply) |

#### States

- **Day Hover**: Background highlight (`--ui-color-bg-hover`)
- **Selected**: Primary background, white text
- **Today**: Primary text color, bold weight
- **Muted**: Reduced color for out-of-month days

#### HTML Example

```html
<!-- Trigger — wraps inside ui-field for size context -->
<div class="ui-field ui-field--md">
  <label class="ui-label">Appointment Date</label>
  <div class="ui-datepicker-trigger">
    <input type="text" class="ui-input ui-input--icon-right ui-input--readonly ui-datepicker__input" placeholder="MM/DD/YYYY" readonly value="03/30/2026">
    <span class="ui-datepicker__icon">
      <svg><!-- calendar icon --></svg>
    </span>
  </div>
</div>

<!-- Calendar — small, no footer -->
<div class="ui-calendar ui-calendar--sm">
  <div class="ui-datepicker__header">
    <button class="ui-datepicker__nav">&#8249;</button>
    <span class="ui-datepicker__month-year">December 2024</span>
    <button class="ui-datepicker__nav">&#8250;</button>
  </div>
  <div class="ui-datepicker__grid">
    <div class="ui-datepicker__weekday">Su</div>
    <!-- weekday headers × 7 -->
    <button class="ui-datepicker__day ui-datepicker__day--muted">30</button>
    <!-- day buttons … -->
    <button class="ui-datepicker__day ui-datepicker__day--selected">25</button>
    <button class="ui-datepicker__day ui-datepicker__day--today">26</button>
  </div>
</div>

<!-- Calendar — large, with footer -->
<div class="ui-calendar ui-calendar--lg">
  <div class="ui-datepicker__header">
    <button class="ui-datepicker__nav">&#8249;</button>
    <span class="ui-datepicker__month-year">October 2026</span>
    <button class="ui-datepicker__nav">&#8250;</button>
  </div>
  <div class="ui-datepicker__grid">
    <!-- weekdays + days -->
  </div>
  <div class="ui-datepicker__footer">
    <button class="ui-button ui-button--ghost ui-button--md">Cancel</button>
    <button class="ui-button ui-button--primary ui-button--md">Apply</button>
  </div>
</div>
```

> **Implementation note:** `.ui-datepicker-trigger` uses `display: grid` — the calendar icon and the input share `grid-area: 1 / 1`. No `position: absolute`. The calendar widget uses `display: grid` for the day grid (`grid-template-columns: repeat(7, 1fr)`) and `display: block` at the container level — it is in normal flow.

> **Context modifier rule:** Datepicker never mutates `.ui-input` from the outside—always include `.ui-input--icon-right`, `.ui-input--readonly`, and the helper `.ui-datepicker__input` so the HTML contract is explicit.

---

### 12. Progress (`.ui-progress`)

Linear progress indicator with optional states.

#### Classes

| Class | Description |
|-------|-------------|
| `.ui-progress` | Base container |
| `.ui-progress--sm` | Small height (4px) |
| `.ui-progress--md` | Medium height (6px, default) |
| `.ui-progress--lg` | Large height (10px) |
| `.ui-progress--primary` | Primary color (default) |
| `.ui-progress--success` | Green progress |
| `.ui-progress--warning` | Amber progress |
| `.ui-progress--error` | Red progress |
| `.ui-progress--striped` | Striped pattern |
| `.ui-progress--animated` | Animated stripes |
| `.ui-progress__header` | Label + value |
| `.ui-progress__label` | Description text |
| `.ui-progress__value` | Percentage/Status |
| `.ui-progress__track` | Background bar |
| `.ui-progress__bar` | Filled progress |

#### States

- **Determinate**: Fixed width showing progress
- **Indeterminate**: Animated loading state
- **Success/Warning/Error**: Color variants

#### HTML Example

```html
<!-- Basic progress -->
<div class="ui-progress ui-progress--md">
  <div class="ui-progress__header">
    <span class="ui-progress__label">Uploading...</span>
    <span class="ui-progress__value">75%</span>
  </div>
  <div class="ui-progress__track">
    <div class="ui-progress__bar" style="width: 75%;"></div>
  </div>
</div>

<!-- Success state -->
<div class="ui-progress ui-progress--md ui-progress--success">
  <div class="ui-progress__header">
    <span class="ui-progress__label">Complete</span>
    <span class="ui-progress__value">100%</span>
  </div>
  <div class="ui-progress__track">
    <div class="ui-progress__bar" style="width: 100%;"></div>
  </div>
</div>

<!-- Animated loading -->
<div class="ui-progress ui-progress--md ui-progress--striped ui-progress--animated">
  <div class="ui-progress__track">
    <div class="ui-progress__bar" style="width: 60%;"></div>
  </div>
</div>
```

---

### 13. Badge (`.ui-badge`)

Status indicators and labels.

#### Classes

| Class | Description |
|-------|-------------|
| `.ui-badge` | Base badge |
| `.ui-badge--sm` | Small size |
| `.ui-badge--md` | Medium size (default) |
| `.ui-badge--lg` | Large size |
| `.ui-badge--default` | Gray neutral |
| `.ui-badge--primary` | Primary color |
| `.ui-badge--success` | Green |
| `.ui-badge--warning` | Amber |
| `.ui-badge--error` | Red |
| `.ui-badge--dot` | With status dot |

#### HTML Examples

```html
<!-- Default badges -->
<span class="ui-badge ui-badge--md ui-badge--primary">New</span>
<span class="ui-badge ui-badge--md ui-badge--success">Active</span>
<span class="ui-badge ui-badge--md ui-badge--warning">Pending</span>
<span class="ui-badge ui-badge--md ui-badge--error">Failed</span>

<!-- With dot -->
<span class="ui-badge ui-badge--md ui-badge--success ui-badge--dot">Live</span>

<!-- Sizes -->
<span class="ui-badge ui-badge--sm ui-badge--primary">Beta</span>
<span class="ui-badge ui-badge--lg ui-badge--primary">Feature</span>
```

---

### 14. Tooltip (`.ui-tooltip`)

Contextual information on hover/focus.

#### Classes

| Class | Description |
|-------|-------------|
| `.ui-tooltip-wrapper` | Positioning container |
| `.ui-tooltip` | Tooltip popup |
| `.ui-tooltip--bottom` | Bottom position |
| `.ui-tooltip--left` | Left position |
| `.ui-tooltip--right` | Right position |

#### Positions

- **Top** (default): Tooltip appears above element
- **Bottom**: Tooltip appears below element
- **Left**: Tooltip appears to the left
- **Right**: Tooltip appears to the right

#### HTML Example

```html
<!-- Top tooltip (default) -->
<div class="ui-tooltip-wrapper">
  <button class="ui-button ui-button--secondary ui-button--md">
    Hover me
  </button>
  <span class="ui-tooltip">This is a tooltip</span>
</div>

<!-- Bottom tooltip -->
<div class="ui-tooltip-wrapper">
  <button class="ui-button ui-button--secondary ui-button--md">
    Hover me
  </button>
  <span class="ui-tooltip ui-tooltip--bottom">Appears below</span>
</div>

<!-- With more content -->
<div class="ui-tooltip-wrapper">
  <button class="ui-button ui-button--primary ui-button--lg">
    Info
  </button>
  <span class="ui-tooltip">
    This tooltip contains more detailed information about the feature.
  </span>
</div>
```

---

### 15. Card (`.ui-card`)

Container for grouping content.

#### Classes

| Class | Description |
|-------|-------------|
| `.ui-card` | Base card container |
| `.ui-card__title` | Card heading |
| `.ui-card__subtitle` | Secondary heading |
| `.ui-card__body` | Rich text content block |
| `.ui-card__actions` | Flex row for primary/secondary actions |
| `.ui-card__action` | Action item wrapper applied to buttons/links |
| `.ui-card__action--fixed` | Modifier to prevent the action from stretching |

#### HTML Example

```html
<div class="ui-card">
  <h3 class="ui-card__title">Card Title</h3>
  <p class="ui-card__subtitle">Card description text</p>
  <p class="ui-card__body">Cards group related content and actions.</p>
  <div class="ui-card__actions">
    <button class="ui-button ui-button--primary ui-button--sm ui-card__action ui-card__action--fixed">Accept</button>
    <button class="ui-button ui-button--ghost ui-button--sm ui-card__action ui-card__action--fixed">Cancel</button>
  </div>
</div>
```

---

### 17. Tabs (`.ui-tabs`)

Horizontal tab strip for switching between views.

#### Classes

| Class | Description |
|-------|-------------|
| `.ui-tabs` | Container (`role="tablist"`) |
| `.ui-tabs--sm` | Small size |
| `.ui-tabs--md` | Medium size (default) |
| `.ui-tabs--lg` | Large size |
| `.ui-tabs--underline` | Underline variant (no pill background) |
| `.ui-tabs__item` | Individual tab button (`role="tab"`) |
| `.ui-tabs__item--active` | Selected tab |

#### States

- **Default**: Muted text, no background
- **Hover**: Subtle background highlight
- **Active**: Primary color text + background (pill) or bottom border (underline)
- **Disabled**: Reduced opacity, non-interactive

#### HTML Example

```html
<!-- Pill (default) -->
<div class="ui-tabs ui-tabs--md" role="tablist">
  <button class="ui-tabs__item ui-tabs__item--active" type="button" role="tab" aria-selected="true">Overview</button>
  <button class="ui-tabs__item" type="button" role="tab" aria-selected="false">Analytics</button>
  <button class="ui-tabs__item" type="button" role="tab" aria-selected="false" disabled>Billing</button>
</div>

<!-- Underline -->
<div class="ui-tabs ui-tabs--underline ui-tabs--md" role="tablist">
  <button class="ui-tabs__item ui-tabs__item--active" type="button" role="tab" aria-selected="true">Overview</button>
  <button class="ui-tabs__item" type="button" role="tab" aria-selected="false">Analytics</button>
</div>
```

---

### 18. Alert (`.ui-alert`)

Inline feedback message for info, success, warning, and error states.

#### Classes

| Class | Description |
|-------|-------------|
| `.ui-alert` | Base container (`role="alert"`) |
| `.ui-alert--info` | Informational (primary color) |
| `.ui-alert--success` | Success (green) |
| `.ui-alert--warning` | Warning (amber) |
| `.ui-alert--error` | Error (red) |
| `.ui-alert__icon` | Leading icon (optional) |
| `.ui-alert__content` | Text wrapper |
| `.ui-alert__title` | Bold heading (optional) |
| `.ui-alert__body` | Message text |
| `.ui-alert__close` | Dismiss button (optional) |

#### HTML Example

```html
<div class="ui-alert ui-alert--success" role="alert">
  <svg class="ui-alert__icon" aria-hidden="true"><!-- checkmark --></svg>
  <div class="ui-alert__content">
    <div class="ui-alert__title">Changes saved</div>
    <div class="ui-alert__body">Your profile has been updated successfully.</div>
  </div>
  <button class="ui-alert__close" type="button" aria-label="Dismiss">×</button>
</div>
```

---

### 19. Spinner (`.ui-spinner`)

Animated loading indicator for async operations.

#### Classes

| Class | Description |
|-------|-------------|
| `.ui-spinner` | Base container (`role="status"`) |
| `.ui-spinner--sm` | 14×14px spinning arc |
| `.ui-spinner--md` | 20×20px spinning arc (default) |
| `.ui-spinner--lg` | 28×28px spinning arc |
| `.ui-spinner--inverted` | White arc (for primary/dark backgrounds) |
| `.ui-spinner__label` | Visible loading text next to spinner |

#### HTML Example

```html
<!-- Standalone -->
<span class="ui-spinner ui-spinner--md" role="status" aria-label="Loading"></span>

<!-- With label -->
<span class="ui-spinner ui-spinner--md" role="status">
  <span class="ui-spinner__label">Loading…</span>
</span>

<!-- Inside a button -->
<button class="ui-button ui-button--primary ui-button--md" disabled>
  <span class="ui-spinner ui-spinner--sm ui-spinner--inverted" role="status" aria-label="Loading"></span>
  Saving…
</button>
```

---

### 20. Avatar (`.ui-avatar`)

User or entity visual representation — initials or image.

#### Classes

| Class | Description |
|-------|-------------|
| `.ui-avatar` | Base element (works on `<div>` for initials or `<img>`) |
| `.ui-avatar--sm` | 24×24px |
| `.ui-avatar--md` | 36×36px (default) |
| `.ui-avatar--lg` | 48×48px |
| `.ui-avatar--xl` | 64×64px |
| `.ui-avatar--square` | Rounded square (radius-md) instead of circle |
| `.ui-avatar-wrap` | Wrapper for status indicator |
| `.ui-avatar-wrap--online` | Green status dot |
| `.ui-avatar-wrap--offline` | Gray status dot |
| `.ui-avatar-wrap--busy` | Amber status dot |
| `.ui-avatar-group` | Stacked row of avatars with negative margin overlap |

#### HTML Example

```html
<!-- Initials -->
<div class="ui-avatar ui-avatar--md" aria-label="John Doe">JD</div>

<!-- Image -->
<img class="ui-avatar ui-avatar--md" src="photo.jpg" alt="John Doe">

<!-- With status -->
<div class="ui-avatar-wrap ui-avatar-wrap--online">
  <div class="ui-avatar ui-avatar--md" aria-label="John Doe">JD</div>
</div>

<!-- Group -->
<div class="ui-avatar-group">
  <div class="ui-avatar ui-avatar--md" aria-label="Alice">AB</div>
  <div class="ui-avatar ui-avatar--md" aria-label="Bob">BC</div>
  <div class="ui-avatar ui-avatar--md" aria-label="3 more">+3</div>
</div>
```

---

### 21. Tag (`.ui-tag`)

Interactive label with optional dismiss. Larger and bordered — distinct from Badge.

#### Classes

| Class | Description |
|-------|-------------|
| `.ui-tag` | Base tag |
| `.ui-tag--sm` | Small (2px 7px padding, 11px font) |
| `.ui-tag--md` | Medium (4px 10px padding, 13px font, default) |
| `.ui-tag--lg` | Large (6px 14px padding, 14px font) |
| `.ui-tag--default` | Gray neutral with border |
| `.ui-tag--primary` | Primary color |
| `.ui-tag--success` | Green |
| `.ui-tag--warning` | Amber |
| `.ui-tag--error` | Red |
| `.ui-tag--removable` | Has dismiss button; add `.ui-tag__remove` inside |
| `.ui-tag__icon` | Leading icon (12×12px) |
| `.ui-tag__remove` | Dismiss `<button>` inside removable tag |

#### HTML Example

```html
<!-- Static -->
<span class="ui-tag ui-tag--primary ui-tag--md">Feature</span>

<!-- Removable -->
<span class="ui-tag ui-tag--default ui-tag--md ui-tag--removable">
  TypeScript
  <button class="ui-tag__remove" type="button" aria-label="Remove TypeScript">×</button>
</span>
```

---

### 22. Breadcrumb (`.ui-breadcrumb`)

Navigation trail showing the current page's location hierarchy.

#### Classes

| Class | Description |
|-------|-------------|
| `.ui-breadcrumb` | `<nav>` container |
| `.ui-breadcrumb__list` | `<ol>` list |
| `.ui-breadcrumb__item` | `<li>` item |
| `.ui-breadcrumb__item--current` | Last item (current page) |
| `.ui-breadcrumb__link` | `<a>` or `<span>` inside item; separator generated via CSS |

#### HTML Example

```html
<nav class="ui-breadcrumb" aria-label="Breadcrumb">
  <ol class="ui-breadcrumb__list">
    <li class="ui-breadcrumb__item">
      <a class="ui-breadcrumb__link" href="/">Home</a>
    </li>
    <li class="ui-breadcrumb__item">
      <a class="ui-breadcrumb__link" href="/settings">Settings</a>
    </li>
    <li class="ui-breadcrumb__item ui-breadcrumb__item--current" aria-current="page">
      <span class="ui-breadcrumb__link">Profile</span>
    </li>
  </ol>
</nav>
```

---

### 23. Pagination (`.ui-pagination`)

Page navigation control.

#### Classes

| Class | Description |
|-------|-------------|
| `.ui-pagination` | `<nav>` container |
| `.ui-pagination--sm` | Small (28px items) |
| `.ui-pagination--lg` | Large (44px items) |
| `.ui-pagination__item` | Page `<button>` (36px default) |
| `.ui-pagination__item--active` | Current page |
| `.ui-pagination__ellipsis` | `<span>` separator "…" |

#### States

- **Default**: Bordered button, muted text
- **Hover**: Subtle background
- **Active**: Primary background, white text
- **Disabled**: Reduced opacity

#### HTML Example

```html
<nav class="ui-pagination" aria-label="Pagination">
  <button class="ui-pagination__item" type="button" disabled aria-label="Previous page">‹</button>
  <button class="ui-pagination__item ui-pagination__item--active" type="button" aria-current="page" aria-label="Page 1, current">1</button>
  <button class="ui-pagination__item" type="button" aria-label="Page 2">2</button>
  <span class="ui-pagination__ellipsis" aria-hidden="true">…</span>
  <button class="ui-pagination__item" type="button" aria-label="Page 10">10</button>
  <button class="ui-pagination__item" type="button" aria-label="Next page">›</button>
</nav>
```

---

### 24. Table (`.ui-table`)

Data table with header, rows, and optional visual modifiers.

#### Classes

| Class | Description |
|-------|-------------|
| `.ui-table-wrap` | Scroll wrapper with border and `border-radius` |
| `.ui-table` | Base `<table>` |
| `.ui-table--hoverable` | Highlights row on hover |
| `.ui-table--striped` | Alternating row background |
| `.ui-table--bordered` | Borders on all cells |
| `.ui-table__th` | Header cell — uppercase, small font |
| `.ui-table__td` | Body cell |
| `.ui-table__row` | Body row |
| `.ui-table__th--right` / `.ui-table__td--right` | Right-align |
| `.ui-table__th--center` / `.ui-table__td--center` | Center-align |
| `.ui-table__td--muted` | Secondary text color |
| `.ui-table__td--mono` | Monospace font (IDs, numbers) |

#### HTML Example

```html
<div class="ui-table-wrap">
  <table class="ui-table ui-table--hoverable">
    <thead>
      <tr>
        <th class="ui-table__th">Name</th>
        <th class="ui-table__th">Status</th>
        <th class="ui-table__th ui-table__th--right">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr class="ui-table__row">
        <td class="ui-table__td">Alice Brown</td>
        <td class="ui-table__td"><span class="ui-badge ui-badge--md ui-badge--success">Active</span></td>
        <td class="ui-table__td ui-table__td--right ui-table__td--mono">$1 200</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

### 25. Steps (`.ui-steps`)

Step indicator for multi-step flows (wizards, onboarding).

#### Classes

| Class | Description |
|-------|-------------|
| `.ui-steps` | Container (horizontal by default) |
| `.ui-steps--vertical` | Vertical layout |
| `.ui-steps__item` | Single step |
| `.ui-steps__item--active` | Current step (ring + primary colors) |
| `.ui-steps__item--done` | Completed step (success colors) |
| `.ui-steps__item--error` | Failed step (error colors) |
| `.ui-steps__indicator` | Circle showing number or icon |
| `.ui-steps__label` | Step label below/beside indicator |

#### HTML Example

```html
<div class="ui-steps">
  <div class="ui-steps__item ui-steps__item--done">
    <div class="ui-steps__indicator"><!-- checkmark SVG --></div>
    <div class="ui-steps__label">Account</div>
  </div>
  <div class="ui-steps__item ui-steps__item--active">
    <div class="ui-steps__indicator">2</div>
    <div class="ui-steps__label">Details</div>
  </div>
  <div class="ui-steps__item">
    <div class="ui-steps__indicator">3</div>
    <div class="ui-steps__label">Confirm</div>
  </div>
</div>

<!-- Vertical -->
<div class="ui-steps ui-steps--vertical">
  <!-- same items -->
</div>
```

---

### 26. Modal (`.ui-modal`)

Overlay dialog with header, body, and footer for focused interactions.

### Classes

| Class | Description |
|-------|-------------|
| `.ui-modal-overlay` | Full-screen backdrop |
| `.ui-modal` | Dialog container |
| `.ui-modal--sm` | Small width (~400px) |
| `.ui-modal--md` | Medium width (~560px, default) |
| `.ui-modal--lg` | Large width (~720px) |
| `.ui-modal--xl` | Extra-large width (~900px) |
| `.ui-modal--full` | Full-screen modal |
| `.ui-modal__header` | Top section with title and close |
| `.ui-modal__title` | Primary heading |
| `.ui-modal__subtitle` | Secondary heading below title |
| `.ui-modal__close` | Dismiss button in header |
| `.ui-modal__body` | Scrollable content area |
| `.ui-modal__footer` | Bottom action row |
| `.ui-modal__footer--between` | Space-between footer layout |
| `.ui-modal__footer--start` | Left-aligned footer layout |

### Example

```html
<div class="ui-modal-overlay">
  <div class="ui-modal ui-modal--sm" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="ui-modal__header">
      <div>
        <div class="ui-modal__title" id="modal-title">Confirm Action</div>
        <div class="ui-modal__subtitle">This cannot be undone.</div>
      </div>
      <button class="ui-modal__close" type="button" aria-label="Close">×</button>
    </div>
    <div class="ui-modal__body">
      <p>Are you sure you want to delete this item?</p>
    </div>
    <div class="ui-modal__footer ui-modal__footer--between">
      <button class="ui-button ui-button--ghost ui-button--md">Cancel</button>
      <button class="ui-button ui-button--primary ui-button--md">Delete</button>
    </div>
  </div>
</div>
```

---

### 27. Dropdown (`.ui-dropdown`)

Floating contextual menu anchored to a trigger element.

### Classes

| Class | Description |
|-------|-------------|
| `.ui-dropdown` | Positioning wrapper |
| `.ui-dropdown__menu` | Floating menu panel |
| `.ui-dropdown__menu--right` | Right-aligned menu |
| `.ui-dropdown__menu--up` | Opens upward |
| `.ui-dropdown__item` | Menu item row |
| `.ui-dropdown__item--active` | Highlighted/focused item |
| `.ui-dropdown__item--danger` | Destructive item (red) |
| `.ui-dropdown__item--disabled` | Non-interactive item |
| `.ui-dropdown__item-icon` | Leading icon inside item |
| `.ui-dropdown__item-trail` | Trailing content (badge, shortcut) |
| `.ui-dropdown__separator` | Horizontal rule between groups |
| `.ui-dropdown__label` | Section label (non-interactive) |

### Example

```html
<div class="ui-dropdown">
  <button class="ui-button ui-button--secondary ui-button--md">Options</button>
  <div class="ui-dropdown__menu">
    <button class="ui-dropdown__item" type="button">
      <span class="ui-dropdown__item-icon">✏️</span>
      Edit
    </button>
    <button class="ui-dropdown__item" type="button">
      <span class="ui-dropdown__item-icon">📋</span>
      Duplicate
      <span class="ui-dropdown__item-trail">⌘D</span>
    </button>
    <div class="ui-dropdown__separator"></div>
    <button class="ui-dropdown__item ui-dropdown__item--danger" type="button">
      <span class="ui-dropdown__item-icon">🗑</span>
      Delete
    </button>
  </div>
</div>
```

---

### 28. Chip (`.ui-chip`)

Toggleable filter pill for selection and filtering interfaces.

### Classes

| Class | Description |
|-------|-------------|
| `.ui-chip` | Base chip |
| `.ui-chip--sm` | Small size |
| `.ui-chip--md` | Medium size (default) |
| `.ui-chip--lg` | Large size |
| `.ui-chip--active` | Selected/active state |
| `.ui-chip--disabled` | Non-interactive state |
| `.ui-chip__icon` | Leading icon |
| `.ui-chip__dismiss` | Dismiss button inside chip |

### Example

```html
<button class="ui-chip ui-chip--md" type="button">Design</button>
<button class="ui-chip ui-chip--md ui-chip--active" type="button">Development</button>
<button class="ui-chip ui-chip--md" type="button">
  Marketing
  <span class="ui-chip__dismiss" aria-label="Remove Marketing">×</span>
</button>
```

---

### 29. Divider (`.ui-divider`)

Separator line for visually grouping content sections.

### Classes

| Class | Description |
|-------|-------------|
| `.ui-divider` | Base divider (horizontal by default) |
| `.ui-divider--horizontal` | Explicit horizontal rule |
| `.ui-divider--vertical` | Inline vertical separator |
| `.ui-divider--thick` | Thicker line weight |
| `.ui-divider--subtle` | Lighter color |
| `.ui-divider--strong` | Darker color |
| `.ui-divider--label` | Divider with centered text label |
| `.ui-divider__text` | Text inside a label divider |

### Example

```html
<!-- Horizontal -->
<hr class="ui-divider ui-divider--horizontal">

<!-- Vertical (inline) -->
<div style="display:flex;align-items:center;gap:8px;">
  <span>Home</span>
  <span class="ui-divider ui-divider--vertical"></span>
  <span>About</span>
</div>

<!-- With label -->
<div class="ui-divider ui-divider--label">
  <span class="ui-divider__text">OR</span>
</div>
```

---

### 30. Empty State (`.ui-empty-state`)

Zero-content placeholder shown when a list or view has no data.

### Classes

| Class | Description |
|-------|-------------|
| `.ui-empty-state` | Base container (centered column) |
| `.ui-empty-state--sm` | Compact sizing |
| `.ui-empty-state--lg` | Spacious sizing |
| `.ui-empty-state__icon` | Large illustrative icon or image |
| `.ui-empty-state__title` | Primary heading |
| `.ui-empty-state__description` | Supporting body text |
| `.ui-empty-state__actions` | Row of action buttons |

### Example

```html
<div class="ui-empty-state">
  <div class="ui-empty-state__icon">📭</div>
  <div class="ui-empty-state__title">No results found</div>
  <div class="ui-empty-state__description">Try adjusting your search or filters.</div>
  <div class="ui-empty-state__actions">
    <button class="ui-button ui-button--primary ui-button--md">Clear filters</button>
  </div>
</div>
```

---

### 31. Banner (`.ui-banner`)

Full-width notification strip displayed at the top of a page or section.

### Classes

| Class | Description |
|-------|-------------|
| `.ui-banner` | Base container |
| `.ui-banner--info` | Informational (primary color) |
| `.ui-banner--success` | Success (green) |
| `.ui-banner--warning` | Warning (amber) |
| `.ui-banner--error` | Error (red) |
| `.ui-banner--neutral` | Neutral gray |
| `.ui-banner__icon` | Leading icon |
| `.ui-banner__content` | Text wrapper |
| `.ui-banner__title` | Bold heading (optional) |
| `.ui-banner__text` | Body message |
| `.ui-banner__actions` | Action button row |
| `.ui-banner__action` | Individual action link or button |
| `.ui-banner__close` | Dismiss button |

### Example

```html
<div class="ui-banner ui-banner--warning" role="alert">
  <span class="ui-banner__icon">⚠️</span>
  <div class="ui-banner__content">
    <span class="ui-banner__title">Scheduled maintenance</span>
    <span class="ui-banner__text">The service will be unavailable on Sunday at 2 AM UTC.</span>
  </div>
  <div class="ui-banner__actions">
    <a class="ui-banner__action" href="#">Learn more</a>
  </div>
  <button class="ui-banner__close" type="button" aria-label="Dismiss">×</button>
</div>
```

---

### 32. Callout (`.ui-callout`)

Block-level aside for notes, tips, warnings, or highlighted information.

### Classes

| Class | Description |
|-------|-------------|
| `.ui-callout` | Base container |
| `.ui-callout--info` | Informational (primary color) |
| `.ui-callout--success` | Success (green) |
| `.ui-callout--warning` | Warning (amber) |
| `.ui-callout--error` | Error (red) |
| `.ui-callout--neutral` | Neutral gray |
| `.ui-callout--accent` | Accent/brand color |
| `.ui-callout__icon` | Leading icon |
| `.ui-callout__body` | Content wrapper |
| `.ui-callout__title` | Bold heading |
| `.ui-callout__text` | Body text |

### Example

```html
<div class="ui-callout ui-callout--info">
  <span class="ui-callout__icon">ℹ️</span>
  <div class="ui-callout__body">
    <div class="ui-callout__title">Note</div>
    <div class="ui-callout__text">Changes take effect after the next deployment cycle.</div>
  </div>
</div>
```

---

### 33. Skeleton (`.ui-skeleton`)

Animated loading placeholder shown while content is being fetched.

### Classes

| Class | Description |
|-------|-------------|
| `.ui-skeleton` | Base pulsing block |
| `.ui-skeleton--pulse` | Pulse animation (default) |
| `.ui-skeleton--static` | No animation |
| `.ui-skeleton--circle` | Circular shape |
| `.ui-skeleton--rounded` | Rounded rectangle |
| `.ui-skeleton--text` | Single text line height |
| `.ui-skeleton--text-sm` | Small text line |
| `.ui-skeleton--heading` | Heading line height |
| `.ui-skeleton--avatar-sm` | Small avatar circle |
| `.ui-skeleton--avatar-md` | Medium avatar circle |
| `.ui-skeleton--avatar-lg` | Large avatar circle |
| `.ui-skeleton--btn` | Button-shaped block |
| `.ui-skeleton--card` | Card-shaped block |
| `.ui-skeleton--thumbnail` | Image thumbnail shape |

### Example

```html
<div style="display:flex;gap:12px;align-items:center;">
  <div class="ui-skeleton ui-skeleton--avatar-md ui-skeleton--circle"></div>
  <div style="flex:1;display:flex;flex-direction:column;gap:6px;">
    <div class="ui-skeleton ui-skeleton--text ui-skeleton--heading"></div>
    <div class="ui-skeleton ui-skeleton--text"></div>
    <div class="ui-skeleton ui-skeleton--text-sm" style="width:60%;"></div>
  </div>
</div>
```

---

### 34. Stat Card (`.ui-stat-card`)

KPI metric card displaying a key value with optional delta and context.

### Classes

| Class | Description |
|-------|-------------|
| `.ui-stat-card` | Base card container |
| `.ui-stat-card--primary` | Primary accent |
| `.ui-stat-card--success` | Green accent |
| `.ui-stat-card--warning` | Amber accent |
| `.ui-stat-card--error` | Red accent |
| `.ui-stat-card__header` | Top row with label and icon |
| `.ui-stat-card__label` | Metric label |
| `.ui-stat-card__icon` | Metric icon |
| `.ui-stat-card__value` | Primary numeric value |
| `.ui-stat-card__delta` | Change indicator |
| `.ui-stat-card__delta--up` | Positive change (green arrow) |
| `.ui-stat-card__delta--down` | Negative change (red arrow) |
| `.ui-stat-card__delta--neutral` | No change (gray) |
| `.ui-stat-card__footer` | Bottom row |
| `.ui-stat-card__description` | Supporting context text |

### Example

```html
<div class="ui-stat-card ui-stat-card--primary">
  <div class="ui-stat-card__header">
    <span class="ui-stat-card__label">Monthly Revenue</span>
    <span class="ui-stat-card__icon">💰</span>
  </div>
  <div class="ui-stat-card__value">$48,295</div>
  <div class="ui-stat-card__footer">
    <span class="ui-stat-card__delta ui-stat-card__delta--up">+12.5%</span>
    <span class="ui-stat-card__description">vs last month</span>
  </div>
</div>
```

---

### 35. Section Header (`.ui-section-header`)

Title row with optional subtitle and inline action buttons.

### Classes

| Class | Description |
|-------|-------------|
| `.ui-section-header` | Base container |
| `.ui-section-header--sm` | Compact sizing |
| `.ui-section-header--xl` | Large sizing |
| `.ui-section-header--divided` | Bottom border separator |
| `.ui-section-header--center` | Centered alignment |
| `.ui-section-header__text` | Text column wrapper |
| `.ui-section-header__title` | Primary heading |
| `.ui-section-header__subtitle` | Secondary description |
| `.ui-section-header__actions` | Right-aligned action slot |

### Example

```html
<div class="ui-section-header ui-section-header--divided">
  <div class="ui-section-header__text">
    <div class="ui-section-header__title">Team Members</div>
    <div class="ui-section-header__subtitle">Manage access and roles</div>
  </div>
  <div class="ui-section-header__actions">
    <button class="ui-button ui-button--primary ui-button--sm">Invite member</button>
  </div>
</div>
```

---

### 36. Feed / Timeline (`.ui-feed`)

Chronological activity stream with icon indicators and content rows.

### Classes

| Class | Description |
|-------|-------------|
| `.ui-feed` | Base container |
| `.ui-feed--compact` | Reduced spacing between items |
| `.ui-feed--no-line` | Removes the connecting vertical line |
| `.ui-feed__item` | Single activity row |
| `.ui-feed__icon` | Circle icon beside the item |
| `.ui-feed__icon--primary` | Primary color icon |
| `.ui-feed__icon--success` | Success color icon |
| `.ui-feed__icon--warning` | Warning color icon |
| `.ui-feed__icon--error` | Error color icon |
| `.ui-feed__content` | Text block wrapper |
| `.ui-feed__header` | Row with title and timestamp |
| `.ui-feed__title` | Activity title |
| `.ui-feed__time` | Timestamp |
| `.ui-feed__text` | Body text |

### Example

```html
<div class="ui-feed">
  <div class="ui-feed__item">
    <div class="ui-feed__icon ui-feed__icon--success">✓</div>
    <div class="ui-feed__content">
      <div class="ui-feed__header">
        <span class="ui-feed__title">Deployment succeeded</span>
        <span class="ui-feed__time">2 min ago</span>
      </div>
      <div class="ui-feed__text">Version 2.4.1 is now live.</div>
    </div>
  </div>
  <div class="ui-feed__item">
    <div class="ui-feed__icon ui-feed__icon--primary">👤</div>
    <div class="ui-feed__content">
      <div class="ui-feed__header">
        <span class="ui-feed__title">Alice joined the team</span>
        <span class="ui-feed__time">1 hr ago</span>
      </div>
    </div>
  </div>
  <div class="ui-feed__item">
    <div class="ui-feed__icon ui-feed__icon--warning">!</div>
    <div class="ui-feed__content">
      <div class="ui-feed__header">
        <span class="ui-feed__title">High memory usage detected</span>
        <span class="ui-feed__time">3 hr ago</span>
      </div>
      <div class="ui-feed__text">Instance i-0a1b2c exceeded 85% threshold.</div>
    </div>
  </div>
</div>
```

---

### 37. Rating (`.ui-rating`)

Star rating widget for displaying or collecting user ratings.

### Classes

| Class | Description |
|-------|-------------|
| `.ui-rating` | Base container |
| `.ui-rating--sm` | Small stars |
| `.ui-rating--md` | Medium stars (default) |
| `.ui-rating--lg` | Large stars |
| `.ui-rating--readonly` | Display-only, non-interactive |
| `.ui-rating__star` | Individual star element |
| `.ui-rating__star--filled` | Filled/selected star |
| `.ui-rating__count` | Numeric review count label |

### Example

```html
<div class="ui-rating ui-rating--md ui-rating--readonly" aria-label="4 out of 5 stars">
  <span class="ui-rating__star ui-rating__star--filled">★</span>
  <span class="ui-rating__star ui-rating__star--filled">★</span>
  <span class="ui-rating__star ui-rating__star--filled">★</span>
  <span class="ui-rating__star ui-rating__star--filled">★</span>
  <span class="ui-rating__star">★</span>
  <span class="ui-rating__count">(128 reviews)</span>
</div>
```

---

### 38. Search (`.ui-search`)

Search input with icon and optional keyboard shortcut hint.

### Classes

| Class | Description |
|-------|-------------|
| `.ui-search` | Base container |
| `.ui-search--sm` | Small size |
| `.ui-search--lg` | Large size |
| `.ui-search__icon` | Leading search icon |
| `.ui-search__input` | Text input element |
| `.ui-search__kbd` | Keyboard shortcut badge (e.g. ⌘K) |

### Example

```html
<div class="ui-search">
  <span class="ui-search__icon">🔍</span>
  <input class="ui-search__input" type="search" placeholder="Search…" aria-label="Search">
  <kbd class="ui-search__kbd">⌘K</kbd>
</div>
```

---

### 39. Status (`.ui-status`)

System health or presence indicator with dot and label.

### Classes

| Class | Description |
|-------|-------------|
| `.ui-status` | Base container |
| `.ui-status--online` | Green dot |
| `.ui-status--offline` | Gray dot |
| `.ui-status--warning` | Amber dot |
| `.ui-status--error` | Red dot |
| `.ui-status--pending` | Pulsing/animated dot |
| `.ui-status--sm` | Small size |
| `.ui-status--md` | Medium size (default) |
| `.ui-status--lg` | Large size |
| `.ui-status__dot` | Colored indicator dot |
| `.ui-status__label` | Status text label |

### Example

```html
<div class="ui-status ui-status--online">
  <span class="ui-status__dot"></span>
  <span class="ui-status__label">Online</span>
</div>

<div class="ui-status ui-status--error">
  <span class="ui-status__dot"></span>
  <span class="ui-status__label">Service unavailable</span>
</div>
```

---

### 40. Notification (`.ui-notification`)

Notification row for inbox or feed panels, with read/unread states.

### Classes

| Class | Description |
|-------|-------------|
| `.ui-notification` | Base container |
| `.ui-notification--unread` | Unread highlight state |
| `.ui-notification__icon` | Leading icon or avatar |
| `.ui-notification__icon--primary` | Primary color icon |
| `.ui-notification__icon--success` | Success color icon |
| `.ui-notification__icon--warning` | Warning color icon |
| `.ui-notification__icon--error` | Error color icon |
| `.ui-notification__body` | Content wrapper |
| `.ui-notification__header` | Row with title and timestamp |
| `.ui-notification__title` | Notification title |
| `.ui-notification__time` | Timestamp |
| `.ui-notification__text` | Body message |
| `.ui-notification__actions` | Inline action links |
| `.ui-notification__unread-dot` | Dot marking unread status |

### Example

```html
<!-- Unread -->
<div class="ui-notification ui-notification--unread">
  <div class="ui-notification__icon ui-notification__icon--primary">🔔</div>
  <div class="ui-notification__body">
    <div class="ui-notification__header">
      <span class="ui-notification__title">New comment on your post</span>
      <span class="ui-notification__time">5 min ago</span>
    </div>
    <div class="ui-notification__text">Alice replied: "Great point, thanks!"</div>
    <div class="ui-notification__actions">
      <a href="#">View</a> · <a href="#">Dismiss</a>
    </div>
  </div>
  <span class="ui-notification__unread-dot"></span>
</div>

<!-- Read -->
<div class="ui-notification">
  <div class="ui-notification__icon ui-notification__icon--success">✓</div>
  <div class="ui-notification__body">
    <div class="ui-notification__header">
      <span class="ui-notification__title">Deployment complete</span>
      <span class="ui-notification__time">1 hr ago</span>
    </div>
    <div class="ui-notification__text">v2.4.1 was deployed successfully.</div>
  </div>
</div>
```

---

### 41. Sidebar (`.ui-sidebar`)

Vertical navigation layout with sections, items, and collapsible support.

### Classes

| Class | Description |
|-------|-------------|
| `.ui-sidebar` | Base container |
| `.ui-sidebar--collapsed` | Collapsed (icon-only) state |
| `.ui-sidebar__header` | Top branding area |
| `.ui-sidebar__logo` | Logo image or icon |
| `.ui-sidebar__brand` | Brand/product name |
| `.ui-sidebar__tagline` | Short descriptor under brand |
| `.ui-sidebar__nav` | Navigation section |
| `.ui-sidebar__section-label` | Non-interactive group label |
| `.ui-sidebar__item` | Nav item row |
| `.ui-sidebar__item--active` | Currently active nav item |
| `.ui-sidebar__item-icon` | Item leading icon |
| `.ui-sidebar__item-text` | Item label |
| `.ui-sidebar__item-badge` | Trailing badge (count, status) |
| `.ui-sidebar__footer` | Bottom utility area |

### Example

```html
<nav class="ui-sidebar">
  <div class="ui-sidebar__header">
    <span class="ui-sidebar__logo">⚡</span>
    <span class="ui-sidebar__brand">AppName</span>
  </div>
  <div class="ui-sidebar__nav">
    <span class="ui-sidebar__section-label">Main</span>
    <a class="ui-sidebar__item ui-sidebar__item--active" href="#">
      <span class="ui-sidebar__item-icon">🏠</span>
      <span class="ui-sidebar__item-text">Dashboard</span>
    </a>
    <a class="ui-sidebar__item" href="#">
      <span class="ui-sidebar__item-icon">📊</span>
      <span class="ui-sidebar__item-text">Analytics</span>
      <span class="ui-sidebar__item-badge">3</span>
    </a>
    <a class="ui-sidebar__item" href="#">
      <span class="ui-sidebar__item-icon">⚙️</span>
      <span class="ui-sidebar__item-text">Settings</span>
    </a>
  </div>
</nav>
```

---

### 42. Navbar (`.ui-navbar`)

Horizontal top navigation bar with brand, links, and action slots.

### Classes

| Class | Description |
|-------|-------------|
| `.ui-navbar` | Base container |
| `.ui-navbar--compact` | Reduced height variant |
| `.ui-navbar__brand` | Brand/logo area |
| `.ui-navbar__logo` | Logo image or icon |
| `.ui-navbar__nav` | Link group |
| `.ui-navbar__item` | Nav item wrapper |
| `.ui-navbar__link` | Anchor element inside item |
| `.ui-navbar__link--active` | Active/current page link |
| `.ui-navbar__separator` | Vertical divider between sections |
| `.ui-navbar__actions` | Right-side action slot |

### Example

```html
<header class="ui-navbar">
  <div class="ui-navbar__brand">
    <span class="ui-navbar__logo">⚡</span>
    AppName
  </div>
  <nav class="ui-navbar__nav">
    <div class="ui-navbar__item">
      <a class="ui-navbar__link ui-navbar__link--active" href="#">Home</a>
    </div>
    <div class="ui-navbar__item">
      <a class="ui-navbar__link" href="#">Docs</a>
    </div>
  </nav>
  <div class="ui-navbar__actions">
    <button class="ui-button ui-button--ghost ui-button--sm" aria-label="Open menu">☰</button>
  </div>
</header>
```

---

### 16. Field Wrapper (`.ui-field`)

Container for form fields with consistent spacing.

#### Classes

| Class | Description |
|-------|-------------|
| `.ui-field` | Base wrapper |
| `.ui-field--sm` | Small inputs |
| `.ui-field--md` | Medium inputs (default) |
| `.ui-field--lg` | Large inputs |

#### HTML Example

```html
<div class="ui-field ui-field--md">
  <label class="ui-label">Username</label>
  <input type="text" class="ui-input">
  <span class="ui-helper">Choose a unique username</span>
</div>
```

---

## Size Reference

| Component | sm | md | lg |
|-----------|-----|-----|-----|
| **Field padding** | 6px 10px | 9px 13px | 13px 17px |
| **Field font** | 13px | 14px | 16px |
| **Button padding** | 6px 12px | 9px 17px | 12px 22px |
| **Checkbox/Radio** | 13px | 16px | 20px |
| **Toggle** | 34×19px | 42×23px | 54×29px |
| **Slider track** | 3px | 5px | 7px |
| **Slider thumb** | 13px | 17px | 21px |
| **Badge** | 10px | 11px | 13px |
| **File Upload** | 20px 16px | 32px 24px | 40px 32px |
| **Calendar min-width** | 240px | 280px | 340px |
| **Calendar day cell** | 26×26px | 32×32px | 40×40px |
| **Calendar day font** | 11px (xs) | 13px (sm) | 14px (md) |
| **Calendar header font** | 13px (sm) | 14px (md) | 16px (lg) |
| **Calendar header padding** | 8px 12px | 12px 16px | 16px 24px |
| **Calendar grid padding** | 4px | 8px | 12px |
| **List item padding** | 6px 10px | 9px 13px | 12px 16px |
| **List item font** | 13px (sm) | 14px (md) | 16px (lg) |
| **List item icon** | 14×14px | 16×16px | 18×18px |
| **List max-height** | 180px | 220px | 260px |
| **Tabs item padding** | 5px 10px | 7px 14px | 9px 18px |
| **Tag padding** | 2px 7px | 4px 10px | 6px 14px |
| **Tag font** | 11px (xs) | 13px (sm) | 14px (md) |
| **Spinner diameter** | 14px | 20px | 28px |
| **Avatar diameter** | 24px | 36px | 48px | 64px (xl) |
| **Pagination item** | 28×28px | 36×36px | 44×44px |
| **Steps indicator** | — | 28×28px (fixed) | — |

---

## Accessibility

### Keyboard Navigation

All interactive components support keyboard navigation:

| Component | Keys | Action |
|-----------|------|--------|
| **Input/Textarea** | Tab, Shift+Tab | Focus navigation |
| **Select** | ↑↓, Enter, Escape | Navigate, select, close |
| **Checkbox/Radio** | Space | Toggle/select |
| **Toggle** | Space | Toggle on/off |
| **Slider** | ←→, ↑↓ | Adjust value |
| **Button** | Space, Enter | Activate |
| **Autocomplete** | ↑↓, Enter, Escape | Navigate, select, close |
| **Date Picker** | ↑↓←→, Enter, Escape | Navigate days, select, close |

### Focus Management

- All focusable elements have visible focus indicators
- Focus rings use `--ui-color-primary-soft` for consistency
- Focus states are clearly distinguishable from hover states

### Screen Readers

- Use semantic HTML elements (`<label>`, `<fieldset>`, `<input>`)
- Associate labels with inputs using `for` attribute or nesting
- Provide helper text and error messages
- Use `aria-describedby` for complex relationships

#### Example:

```html
<div class="ui-field ui-field--md">
  <label class="ui-label" for="email">Email</label>
  <input type="email" 
         id="email" 
         class="ui-input" 
         aria-describedby="email-help email-error"
         aria-invalid="false">
  <span id="email-help" class="ui-helper">We'll never share your email</span>
  <span id="email-error" class="ui-error" role="alert" hidden>
    Please enter a valid email
  </span>
</div>
```

### Color Contrast

All color combinations meet WCAG 2.1 AA standards:
- Text on backgrounds: minimum 4.5:1 contrast ratio
- Large text: minimum 3:1 contrast ratio
- Interactive elements: minimum 3:1 contrast ratio

### Reduced Motion

Respect user preferences for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | Full |
| Firefox | 88+ | Full |
| Safari | 14+ | Full |
| Edge | 90+ | Full |

### CSS Features Used

- CSS Custom Properties (Variables)
- Flexbox Layout
- CSS Grid
- `appearance: none` for form styling
- `::-webkit-slider-thumb` for range inputs
- `:focus-visible` for accessible focus states
- `:has()` selector (progressive enhancement)

### Polyfills

No polyfills required for modern browsers. For older browsers:

```html
<!-- For IE11 support (not recommended) -->
<script src="https://polyfill.io/v3/polyfill.min.js?features=css-variables"></script>
```

---

## Responsive Design

### Breakpoints

| Breakpoint | Width | Target |
|------------|-------|--------|
| Mobile | < 768px | Phones |
| Tablet | 768px - 1024px | Tablets, small laptops |
| Desktop | > 1024px | Desktops, large screens |

### Mobile Considerations

- Touch targets minimum 44×44px
- Increased padding on mobile
- Stack layout on narrow screens
- Reduced animations on low-power devices

```css
/* Mobile-first responsive example */
.component-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 768px) {
  .component-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}

@media (min-width: 1024px) {
  .component-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## Customization Examples

### Brand Colors

```css
:root {
  --ui-color-primary: #059669;        /* Emerald green */
  --ui-color-primary-hover: #047857;
  --ui-color-primary-soft: rgba(5, 150, 105, 0.15);
}
```

### Rounded Design

```css
:root {
  --ui-radius-sm: 8px;
  --ui-radius-md: 12px;
  --ui-radius-lg: 20px;
}
```

### Square Design

```css
:root {
  --ui-radius-sm: 2px;
  --ui-radius-md: 4px;
  --ui-radius-lg: 8px;
}
```

### Compact Spacing

```css
:root {
  --ui-space-1: 2px;
  --ui-space-2: 4px;
  --ui-space-3: 8px;
  --ui-space-4: 12px;
}
```

### Custom Shadows

```css
:root {
  --ui-shadow-sm: 0 1px 2px rgba(0,0,0,0.06);
  --ui-shadow-md: 0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.03);
  --ui-shadow-lg: 0 10px 20px rgba(0,0,0,0.08), 0 3px 6px rgba(0,0,0,0.04);
}
```

---

## Best Practices

### Do's

- Always use `.ui-field` wrapper for proper spacing
- Provide labels for all form inputs
- Use semantic HTML elements
- Test in both light and dark themes
- Ensure sufficient color contrast
- Include helper text for complex fields
- Use appropriate input types (`email`, `tel`, etc.)

### Don'ts

- Don't override component styles directly; use CSS variables
- Don't skip labels (even if visually hidden)
- Don't use disabled states without explanation
- Don't rely solely on color to convey state
- Don't use too many validation states at once
- Don't forget to test keyboard navigation

---

## License

MIT License — free for personal and commercial use.

---

## Contributing

Contributions welcome! Please follow our [Contributing Guide](CONTRIBUTING.md).

---

## Support

- 📖 [Documentation](https://docs.ai-css-kit.dev)
- 🐛 [Issue Tracker](https://github.com/vadimjoy/ai-css-kit/issues)
- 💬 [Discussions](https://github.com/vadimjoy/ai-css-kit/discussions)

---

**AI CSS Kit** — Modern minimalism, pure CSS, zero dependencies.
