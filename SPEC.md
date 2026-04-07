# AI CSS Kit — Component Library Specification

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

Все стили распределены по каскадным слоям, чтобы темы всегда побеждали без `!important`:

```
@layer ai-kit.tokens, ai-kit.base, ai-kit.components, ai-kit.themes;

ai-kit.tokens    — глобальные `--ui-*` токены + fallback тёмной темы
ai-kit.base      — reset, .ui-field, типографика
ai-kit.components — 15 компонентов + состояния (`--ai-*` токены)
```

### Встроенные пресеты

Пять готовых тем лежат в `dist/themes/` и активируются атрибутом `data-theme` на `<html>`:

| Файл | Атрибут | Настроение |
|------|---------|------------|
| `dist/themes/default.css` | `data-theme="default"` *(можно также убрать атрибут)* | Базовая светлая тема |
| `dist/themes/dark.css` | `data-theme="dark"` | Классический dark mode |
| `dist/themes/midnight.css` | `data-theme="midnight"` | Deep dark + violet accent |
| `dist/themes/corporate.css` | `data-theme="corporate"` | Спокойный нейтральный blue/gray |
| `dist/themes/warm.css` | `data-theme="warm"` | Тёплые песочные оттенки, округлости |

```html
<link rel="stylesheet" href="/dist/ai-css-kit.css">
<link rel="stylesheet" href="/dist/themes/midnight.css">

<html data-theme="midnight">...</html>
```

### Theme Mapper CLI

Скрипт `scripts/theme-map.js` принимает JSON-файл (родной формат, W3C Design Tokens или Figma Tokens) и генерирует CSS с `@layer ai-kit.themes`:

```bash
npm run theme-map -- ./src/themes/ocean.json -o ./dist/themes/ocean.css
```

Главные правила маппинга:

- Ключи, начинающиеся с имени компонента (`button.bg`, `input.border`) → `--ai-button-bg`, `--ai-input-border`
- Остальные ключи → `--ui-color-*`, `--ui-radius-*`, и т.д. (точки превращаются в дефисы)
- Ключи, начинающиеся с `--`, попадают в CSS без изменений

Полный формат описан в [`docs/theming.md`](docs/theming.md).

### Ручные Overrides

Никто не мешает менять токены вручную прямо в `:root` или пределах компонента:

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

> **Context modifier rule:** Autocomplete never mutates `.ui-input` internally — always add `.ui-input--icon-left` (и другие модификаторы вроде `--readonly`) + вспомогательный класс `.ui-autocomplete__input`, чтобы явно указать поведение в HTML.

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
  <span>Accept terms and conditions</span>
</label>

<!-- Checked state -->
<label class="ui-checkbox ui-checkbox--md">
  <input type="checkbox" checked>
  <span>Subscribe to newsletter</span>
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

> **Context modifier rule:** Datepicker never alters `.ui-input` извне — всегда добавляй `.ui-input--icon-right`, `.ui-input--readonly` и вспомогательный `.ui-datepicker__input`, чтобы HTML явно отражал контракт компонента.

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

## Migration Guide

### From v1.x to v2.x

**Breaking Changes:**
- Font changed from system fonts to Inter (Google Fonts required)
- Primary color changed from `#3b82f6` to `#4f46e5`
- Border radius values updated
- Shadow values adjusted for softer appearance
- New size variants (padding values changed)

**New Components:**
- File Upload
- Date Picker
- Progress
- Badge
- Tooltip

**Updated Components:**
- Autocomplete: Improved styling and icon support
- All inputs: Added success and warning states
- Buttons: New variants and improved focus states

**Removed:**
- None

---

## Changelog

### v2.0.0 (2024)

- **Added**: File Upload component
- **Added**: Date Picker component
- **Added**: Progress component
- **Added**: Badge component
- **Added**: Tooltip component
- **Updated**: Complete visual refresh with Inter font
- **Updated**: New color palette (indigo primary)
- **Updated**: Improved dark theme
- **Updated**: Enhanced accessibility features
- **Updated**: All validation states (error, success, warning)

### v1.0.0 (2023)

- Initial release
- Core components: Input, Select, Textarea, Checkbox, Radio, Toggle, Slider, Button, Card
- Dark theme support
- CSS custom properties

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
