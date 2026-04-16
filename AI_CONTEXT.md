# AI CSS Kit — Context for AI Agents

> **VERSION:** 0.8.0  
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
I-07  Theme presets are activated via data-theme="{default|dark|midnight|corporate|warm}" on <html> (remove attribute to fall back to default)
I-08  Use --ai-[component]-* tokens to customize a single component in isolation
I-09  Use --ui-* tokens ONLY for global changes that must cascade to all components
I-10  DO NOT use !important — override --ai-* tokens instead
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
| Spinner | `.ui-spinner` | `--sm` `--md` `--lg` + `--inverted` |
| Avatar | `.ui-avatar` | `--sm` `--md` `--lg` `--xl` + `--square` |
| Avatar wrap | `.ui-avatar-wrap` | `--online` `--offline` `--busy` (status dot) |
| Avatar group | `.ui-avatar-group` | — (stacked avatars with overlap) |
| Tag | `.ui-tag` | `--default` `--primary` `--success` `--warning` `--error` + `--sm` `--md` `--lg` + `--removable` |
| Alert | `.ui-alert` | `--info` `--success` `--warning` `--error` |
| Button (icon) | `.ui-button--icon` | `--sm` `--md` `--lg` | Square icon-only button; combine with any variant |
| Badge (live) | `.ui-badge--live` | — | Pulsing animated dot; combine with any badge variant |
| Stat Card | `.ui-stat-card` | `--primary` `--success` `--warning` `--error` | KPI metric card: `__header` `__label` `__value` `__icon` `__delta` `__footer` |
| Skeleton | `.ui-skeleton` | `--pulse` `--static` `--circle` `--rounded` `--text` `--heading` `--avatar-sm/md/lg` `--btn` `--card` | Loading placeholder shimmer |
| Empty State | `.ui-empty-state` | `--sm` `--lg` | `__icon` `__title` `__description` `__actions` |
| Banner | `.ui-banner` | `--info` `--success` `--warning` `--error` `--neutral` | Full-width top strip: `__icon` `__content` `__title` `__text` `__actions` `__close` |
| Callout | `.ui-callout` | `--info` `--success` `--warning` `--error` `--neutral` `--accent` | Block note: `__icon` `__body` `__title` `__text` |
| Section Header | `.ui-section-header` | `--sm` `--xl` `--divided` `--center` | `__text` `__title` `__subtitle` `__actions` |
| Feed / Timeline | `.ui-feed` | `--compact` `--no-line` | `__item` `__icon` `__content` `__header` `__title` `__time` `__text` |
| Rating | `.ui-rating` | `--sm` `--md` `--lg` `--readonly` | `__star` `--filled` `__count` |
| Status | `.ui-status` | `--online` `--offline` `--warning` `--error` `--pending` `--sm` `--md` `--lg` | `__dot` `__label` |
| Notification | `.ui-notification` | `--unread` | `__icon` `__body` `__header` `__title` `__time` `__text` `__actions` `__unread-dot` |

### 2.5 Navigation & Structure

| Component | Base Class | Modifiers / Children |
|-----------|------------|----------------------|
| Tabs | `.ui-tabs` | `--underline` + `--sm` `--md` `--lg`; items: `.ui-tabs__item` + `--active` |
| Breadcrumb | `.ui-breadcrumb` | `<ol class="ui-breadcrumb__list">` → `.ui-breadcrumb__item` + `--current` → `.ui-breadcrumb__link` |
| Pagination | `.ui-pagination` | `--sm` `--lg`; items: `.ui-pagination__item` + `--active` + `--disabled`; `.ui-pagination__ellipsis` |
| Steps | `.ui-steps` | `--vertical`; items: `.ui-steps__item` + `--active` `--done` `--error`; `.ui-steps__indicator` `.ui-steps__label` |
| Table | `.ui-table-wrap` + `.ui-table` | `--hoverable` `--striped` `--bordered`; cells: `.ui-table__th` `.ui-table__td` + `--right` `--center` `--muted` `--mono` |
| Chip | `.ui-chip` | `--sm` `--md` `--lg` `--active` `--disabled` | Filter/toggle pill; `__icon` `__dismiss` |
| Divider | `.ui-divider` | `--horizontal` `--vertical` `--thick` `--subtle` `--strong` `--label` | `__text` for labeled variant |
| Dropdown | `.ui-dropdown` | — | `__menu` `--right` `--up`; `__item` `--active` `--danger` `--disabled`; `__item-icon` `__item-trail`; `__separator` `__label` |
| Modal | `.ui-modal` | `--sm` `--md` `--lg` `--xl` `--full` | Overlay: `.ui-modal-overlay`; `__header` `__title` `__subtitle` `__close` `__body` `__footer` `--between` `--start` |
| Sidebar | `.ui-sidebar` | `--collapsed` | `__header` `__logo` `__brand` `__nav` `__section-label` `__item` `--active` `__item-icon` `__item-text` `__item-badge` `__footer` |
| Navbar | `.ui-navbar` | `--compact` | `__brand` `__logo` `__nav` `__item` `__link` `--active` `__separator` `__actions` |
| Search | `.ui-search` | `--sm` `--lg` | `__icon` `__input` `__kbd` |

### 2.6 Typography Helpers

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

### Rule C-07: Tabs

```html
<!-- Always set size on the container, role on each item -->
<div class="ui-tabs ui-tabs--md" role="tablist">
  <button class="ui-tabs__item ui-tabs__item--active" type="button" role="tab" aria-selected="true">Overview</button>
  <button class="ui-tabs__item" type="button" role="tab" aria-selected="false">Analytics</button>
  <button class="ui-tabs__item" type="button" role="tab" aria-selected="false" disabled>Billing</button>
</div>
<!-- Underline variant: add ui-tabs--underline to container -->
```

### Rule C-08: Alert

```html
<div class="ui-alert ui-alert--{info|success|warning|error}" role="alert">
  <!-- icon optional: any inline SVG or <i> with font-awesome -->
  <svg class="ui-alert__icon" aria-hidden="true"><!-- icon --></svg>
  <div class="ui-alert__content">
    <div class="ui-alert__title">Title (optional)</div>
    <div class="ui-alert__body">Message text.</div>
  </div>
  <!-- dismiss button optional -->
  <button class="ui-alert__close" type="button" aria-label="Dismiss">×</button>
</div>
```

### Rule C-09: Avatar with status

```html
<!-- Plain avatar (initials) -->
<div class="ui-avatar ui-avatar--md" aria-label="John Doe">JD</div>

<!-- Image avatar -->
<img class="ui-avatar ui-avatar--md" src="photo.jpg" alt="John Doe">

<!-- With status indicator — wrap only, never mutate .ui-avatar -->
<div class="ui-avatar-wrap ui-avatar-wrap--online">
  <div class="ui-avatar ui-avatar--md" aria-label="John Doe">JD</div>
</div>

<!-- Group (stacked) -->
<div class="ui-avatar-group">
  <div class="ui-avatar ui-avatar--md" aria-label="Alice">AB</div>
  <div class="ui-avatar ui-avatar--md" aria-label="Bob">BC</div>
  <div class="ui-avatar ui-avatar--md" aria-label="3 more">+3</div>
</div>
```

### Rule C-10: Breadcrumb

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

### Rule C-11: Pagination

```html
<nav class="ui-pagination" aria-label="Pagination">
  <button class="ui-pagination__item" type="button" aria-label="Previous page">‹</button>
  <button class="ui-pagination__item" type="button" aria-label="Page 1">1</button>
  <button class="ui-pagination__item ui-pagination__item--active" type="button"
          aria-current="page" aria-label="Page 2, current">2</button>
  <button class="ui-pagination__item" type="button" aria-label="Page 3">3</button>
  <span class="ui-pagination__ellipsis" aria-hidden="true">…</span>
  <button class="ui-pagination__item" type="button" aria-label="Page 10">10</button>
  <button class="ui-pagination__item" type="button" aria-label="Next page">›</button>
</nav>
```

### Rule C-12: Table

```html
<div class="ui-table-wrap">
  <table class="ui-table ui-table--hoverable">
    <thead>
      <tr>
        <th class="ui-table__th">Name</th>
        <th class="ui-table__th ui-table__th--right">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr class="ui-table__row">
        <td class="ui-table__td">Alice</td>
        <td class="ui-table__td ui-table__td--right ui-table__td--mono">$1 200</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Rule C-13: Steps

```html
<!-- Horizontal (default) -->
<div class="ui-steps">
  <div class="ui-steps__item ui-steps__item--done">
    <div class="ui-steps__indicator"><!-- checkmark SVG or number --></div>
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
<!-- Vertical: add ui-steps--vertical to container -->
```

### Rule C-14: Modal

```html
<div class="ui-modal-overlay">
  <div class="ui-modal ui-modal--md" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="ui-modal__header">
      <div>
        <h2 class="ui-modal__title" id="modal-title">Dialog Title</h2>
        <p class="ui-modal__subtitle">Optional subtitle</p>
      </div>
      <button class="ui-modal__close" type="button" aria-label="Close">×</button>
    </div>
    <div class="ui-modal__body">Content goes here.</div>
    <div class="ui-modal__footer">
      <button class="ui-button ui-button--secondary ui-button--md">Cancel</button>
      <button class="ui-button ui-button--primary ui-button--md">Confirm</button>
    </div>
  </div>
</div>
```

### Rule C-15: Dropdown

```html
<div class="ui-dropdown">
  <button class="ui-button ui-button--secondary ui-button--md" type="button">Options</button>
  <div class="ui-dropdown__menu" role="menu">
    <span class="ui-dropdown__label">Account</span>
    <button class="ui-dropdown__item" type="button" role="menuitem">
      <span class="ui-dropdown__item-icon"><i class="fa fa-user"></i></span>
      Profile
    </button>
    <div class="ui-dropdown__separator"></div>
    <button class="ui-dropdown__item ui-dropdown__item--danger" type="button" role="menuitem">
      <span class="ui-dropdown__item-icon"><i class="fa fa-sign-out"></i></span>
      Logout
    </button>
  </div>
</div>
```

### Rule C-16: Chip filter group

```html
<div role="group" aria-label="Filter">
  <button class="ui-chip ui-chip--md ui-chip--active" type="button" aria-pressed="true">All</button>
  <button class="ui-chip ui-chip--md" type="button" aria-pressed="false">Design</button>
  <button class="ui-chip ui-chip--md" type="button" aria-pressed="false">Development</button>
</div>
```

### Rule C-17: Skeleton card

```html
<div style="display:flex;flex-direction:column;gap:12px;padding:16px">
  <div style="display:flex;align-items:center;gap:10px">
    <div class="ui-skeleton ui-skeleton--avatar-md"></div>
    <div style="flex:1;display:flex;flex-direction:column;gap:6px">
      <div class="ui-skeleton ui-skeleton--text" style="width:60%"></div>
      <div class="ui-skeleton ui-skeleton--text-sm" style="width:40%"></div>
    </div>
  </div>
  <div class="ui-skeleton ui-skeleton--text"></div>
  <div class="ui-skeleton ui-skeleton--text" style="width:80%"></div>
</div>
```

### Rule C-18: Stat Card

```html
<div class="ui-stat-card ui-stat-card--primary">
  <div class="ui-stat-card__header">
    <p class="ui-stat-card__label">Total Revenue</p>
    <div class="ui-stat-card__icon"><i class="fa fa-dollar"></i></div>
  </div>
  <p class="ui-stat-card__value">$48,294</p>
  <div class="ui-stat-card__footer">
    <span class="ui-stat-card__delta ui-stat-card__delta--up">↑ 12.5%</span>
    <p class="ui-stat-card__description">vs last month</p>
  </div>
</div>
```

### Rule C-19: Sidebar

```html
<aside class="ui-sidebar" aria-label="Main navigation">
  <div class="ui-sidebar__header">
    <div class="ui-sidebar__logo"><!-- logo --></div>
    <div class="ui-sidebar__header-text">
      <span class="ui-sidebar__brand">App</span>
    </div>
  </div>
  <nav class="ui-sidebar__nav">
    <span class="ui-sidebar__section-label">Main</span>
    <a class="ui-sidebar__item ui-sidebar__item--active" href="#">
      <span class="ui-sidebar__item-icon"><i class="fa fa-home"></i></span>
      <span class="ui-sidebar__item-text">Dashboard</span>
    </a>
  </nav>
</aside>
<!-- Collapsed: add ui-sidebar--collapsed to <aside> -->
```

### Rule C-20: Navbar

```html
<header class="ui-navbar" role="banner">
  <a class="ui-navbar__brand" href="/">
    <span class="ui-navbar__logo"><!-- logo --></span>
    AppName
  </a>
  <ul class="ui-navbar__nav" role="list">
    <li class="ui-navbar__item">
      <a class="ui-navbar__link ui-navbar__link--active" href="#">Dashboard</a>
    </li>
    <li class="ui-navbar__item">
      <a class="ui-navbar__link" href="#">Tasks</a>
    </li>
  </ul>
  <div class="ui-navbar__actions">
    <button class="ui-button ui-button--ghost ui-button--icon ui-button--md" type="button" aria-label="Notifications">
      <i class="fa fa-bell"></i>
    </button>
  </div>
</header>
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

### Global Tokens (--ui-*) — Level 1

Affect all components simultaneously. Use for brand-wide changes.

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

### Component Tokens (--ai-*) — Level 2

Affect a **single component** only. Reference global tokens by default.
Override these for isolated customization without cascade effects. See [ADR-0003](docs/adr/0003-ai-token-naming.md).

```
Button
  --ai-button-bg            Primary button background
  --ai-button-bg-hover      Primary button background on hover
  --ai-button-color         Primary button text color
  --ai-button-border        Primary button border color
  --ai-button-border-hover  Primary button border color on hover
  --ai-button-radius        Border radius for all button sizes
  --ai-button-font-size     Font size for medium button
  --ai-button-focus-ring    Focus ring color (shadow)

Input
  --ai-input-bg             Input background
  --ai-input-border         Input border color
  --ai-input-border-hover   Input border on hover
  --ai-input-border-focus   Input border on focus
  --ai-input-color          Input text color
  --ai-input-radius         Input border radius
  --ai-input-placeholder    Placeholder text color
  --ai-input-focus-ring     Focus ring color (shadow)

Textarea
  --ai-textarea-bg            Textarea background
  --ai-textarea-border        Textarea border color
  --ai-textarea-border-hover  Textarea border on hover
  --ai-textarea-border-focus  Textarea border on focus
  --ai-textarea-color         Textarea text color
  --ai-textarea-radius        Textarea border radius
  --ai-textarea-placeholder   Placeholder text color
  --ai-textarea-focus-ring    Focus ring color (shadow)

Select
  --ai-select-bg             Select background
  --ai-select-border         Select border color
  --ai-select-border-hover   Select border on hover
  --ai-select-border-focus   Select border on focus
  --ai-select-color          Select text color
  --ai-select-radius         Select border radius
  --ai-select-focus-ring     Focus ring color (shadow)

Card
  --ai-card-bg       Card background
  --ai-card-border   Card border color
  --ai-card-radius   Card border radius
  --ai-card-shadow   Card box shadow
  --ai-card-padding  Card inner padding

Badge
  --ai-badge-radius              Badge border radius
  --ai-badge-primary-bg          Primary badge background
  --ai-badge-primary-color       Primary badge text color
  --ai-badge-success-bg / -color
  --ai-badge-warning-bg / -color
  --ai-badge-error-bg / -color

Progress
  --ai-progress-bar-bg    Progress bar fill color
  --ai-progress-track-bg  Progress track background
  --ai-progress-radius    Track and bar border radius

Tooltip
  --ai-tooltip-bg     Tooltip background
  --ai-tooltip-color  Tooltip text color
  --ai-tooltip-radius Tooltip border radius
  --ai-tooltip-shadow Tooltip box shadow

Checkbox
  --ai-checkbox-accent      Checkbox checked color (accent-color)
  --ai-checkbox-focus-ring  Focus outline color

Radio
  --ai-radio-accent      Radio checked color (accent-color)
  --ai-radio-focus-ring  Focus outline color

Toggle
  --ai-toggle-bg          Track color when unchecked
  --ai-toggle-bg-checked  Track color when checked
  --ai-toggle-knob        Knob (thumb) color
  --ai-toggle-focus-ring  Focus ring color

Slider
  --ai-slider-fill          Filled portion color
  --ai-slider-track         Empty track color
  --ai-slider-track-hover   Empty track color on hover
  --ai-slider-thumb-bg      Thumb background
  --ai-slider-thumb-border  Thumb border color
  --ai-slider-focus-ring    Focus ring color

File Upload
  --ai-file-upload-bg             Zone background (idle)
  --ai-file-upload-border         Zone border color (idle)
  --ai-file-upload-border-active  Zone border on hover/dragover
  --ai-file-upload-bg-active      Zone background on hover/dragover
  --ai-file-upload-radius         Zone border radius

Autocomplete panel
  --ai-autocomplete-bg                  Panel background
  --ai-autocomplete-border              Panel border color
  --ai-autocomplete-radius              Panel border radius
  --ai-autocomplete-shadow              Panel box shadow
  --ai-autocomplete-item-hover          Item hover background
  --ai-autocomplete-item-active-bg      Highlighted item background
  --ai-autocomplete-item-active-color   Highlighted item text color

Calendar (Datepicker)
  --ai-calendar-bg              Calendar background
  --ai-calendar-border          Calendar border color
  --ai-calendar-radius          Calendar border radius
  --ai-calendar-shadow          Calendar box shadow
  --ai-calendar-day-size        Day cell size (default: 32px, md variant)
  --ai-calendar-day-hover       Day cell hover background
  --ai-calendar-selected-bg     Selected day background
  --ai-calendar-selected-color  Selected day text color
  --ai-calendar-today-color     Today label text color

Tabs
  --ai-tabs-border              Container border (underline variant)
  --ai-tabs-item-color          Default item text color
  --ai-tabs-item-hover-bg       Item background on hover
  --ai-tabs-item-hover-color    Item text on hover
  --ai-tabs-item-active-color   Active item text color
  --ai-tabs-item-active-bg      Active item background (pill variant)
  --ai-tabs-item-active-border  Active item bottom border (underline variant)
  --ai-tabs-radius              Item border radius (pill variant)

Alert
  --ai-alert-radius             Alert border radius
  --ai-alert-info-bg / -color / -border
  --ai-alert-success-bg / -color / -border
  --ai-alert-warning-bg / -color / -border
  --ai-alert-error-bg / -color / -border

Spinner
  --ai-spinner-color            Spinning arc color
  --ai-spinner-track-color      Background track color

Avatar
  --ai-avatar-bg                Avatar background (initials)
  --ai-avatar-color             Avatar text color (initials)
  --ai-avatar-border            Border between stacked avatars / wrap ring
  --ai-avatar-radius            Avatar border radius (full = circle)
  --ai-avatar-online-color      Status dot: online
  --ai-avatar-offline-color     Status dot: offline
  --ai-avatar-busy-color        Status dot: busy

Tag
  --ai-tag-radius               Tag border radius
  --ai-tag-default-bg / -color / -border
  --ai-tag-primary-bg / -color / -border
  --ai-tag-success-bg / -color / -border
  --ai-tag-warning-bg / -color / -border
  --ai-tag-error-bg / -color / -border

Breadcrumb
  --ai-breadcrumb-color             Link text color
  --ai-breadcrumb-hover-color       Link text on hover
  --ai-breadcrumb-current-color     Current (last) item color
  --ai-breadcrumb-separator-color   Separator "/" color

Pagination
  --ai-pagination-item-bg           Item background
  --ai-pagination-item-color        Item text color
  --ai-pagination-item-border       Item border color
  --ai-pagination-item-hover-bg     Item background on hover
  --ai-pagination-item-active-bg    Active item background
  --ai-pagination-item-active-color Active item text color
  --ai-pagination-radius            Item border radius
  --ai-pagination-focus-ring        Focus ring color

Table
  --ai-table-border         Cell / wrapper border color
  --ai-table-header-bg      Header row background
  --ai-table-header-color   Header cell text color
  --ai-table-row-hover      Row hover background (--hoverable)
  --ai-table-stripe-bg      Alternating row background (--striped)
  --ai-table-radius         Wrapper border radius

Steps
  --ai-steps-indicator-size          Indicator circle diameter
  --ai-steps-indicator-bg / -color / -border           Pending state
  --ai-steps-indicator-active-bg / -color / -border    Active state
  --ai-steps-indicator-done-bg / -color / -border      Completed state
  --ai-steps-line-color              Connector line (pending)
  --ai-steps-line-done-color         Connector line (completed)
  --ai-steps-label-color             Step label text (pending)
  --ai-steps-label-active-color      Step label text (active)

Modal
  --ai-modal-bg               Dialog background
  --ai-modal-border           Dialog border color
  --ai-modal-radius           Dialog border radius
  --ai-modal-shadow           Dialog box shadow
  --ai-modal-overlay-bg       Overlay backdrop color

Dropdown
  --ai-dropdown-bg                  Panel background
  --ai-dropdown-border              Panel border color
  --ai-dropdown-radius              Panel border radius
  --ai-dropdown-shadow              Panel box shadow
  --ai-dropdown-item-color          Default item text color
  --ai-dropdown-item-hover-bg       Item background on hover
  --ai-dropdown-item-hover-color    Item text on hover
  --ai-dropdown-item-active-bg      Active item background
  --ai-dropdown-item-active-color   Active item text color

Chip
  --ai-chip-radius         Border radius
  --ai-chip-bg             Default background
  --ai-chip-border         Default border color
  --ai-chip-color          Default text color
  --ai-chip-hover-bg/border/color   Hover state
  --ai-chip-active-bg/border/color  Active/selected state

Divider
  --ai-divider-color    Line color
  --ai-divider-spacing  Vertical margin (horizontal) / horizontal margin (vertical)

Skeleton
  --ai-skeleton-bg           Base shimmer color
  --ai-skeleton-highlight    Highlight sweep color
  --ai-skeleton-radius       Border radius
  --ai-skeleton-duration     Animation duration

Stat Card
  --ai-stat-card-bg / -border / -radius / -shadow / -padding
  --ai-stat-card-value-size  Font size of the value

Feed / Timeline
  --ai-feed-icon-size     Icon circle diameter
  --ai-feed-icon-bg       Icon circle background (default)
  --ai-feed-icon-color    Icon circle text color (default)
  --ai-feed-line-color    Connector line color

Rating
  --ai-rating-size          Star font size
  --ai-rating-filled-color  Filled star color
  --ai-rating-empty-color   Empty star color
  --ai-rating-hover-color   Hover star color

Search
  --ai-search-bg      Input background
  --ai-search-border  Input border color
  --ai-search-radius  Input border radius

Sidebar
  --ai-sidebar-width             Default width
  --ai-sidebar-collapsed-width   Collapsed width
  --ai-sidebar-bg                Background
  --ai-sidebar-border            Border color
  --ai-sidebar-item-color        Item default text color
  --ai-sidebar-item-hover-bg/color    Item hover state
  --ai-sidebar-item-active-bg/color   Item active state

Navbar
  --ai-navbar-height                Bar height
  --ai-navbar-bg                    Background
  --ai-navbar-border                Bottom border color
  --ai-navbar-link-color            Link default text color
  --ai-navbar-link-hover-bg/color   Link hover state
  --ai-navbar-link-active-bg/color  Link active state
```

### Customization Examples

```css
/* Global brand change — affects all components */
:root {
  --ui-color-primary: #10b981;
  --ui-color-primary-hover: #059669;
  --ui-color-primary-soft: rgba(16, 185, 129, 0.15);
}

/* Isolated: only buttons get rounded corners and green color */
:root {
  --ai-button-bg:       #10b981;
  --ai-button-bg-hover: #059669;
  --ai-button-border:   #10b981;
  --ai-button-radius:   24px;
}

/* Isolated: only calendar gets custom accent */
:root {
  --ai-calendar-selected-bg:    #6d28d9;
  --ai-calendar-today-color:    #6d28d9;
}
```

---

## 6. Theme Presets & Theme Mapper

- Theme presets live in `dist/themes/*.css` (`default`, `dark`, `midnight`, `corporate`, `warm`).
- Import the files you need **after** `dist/ai-css-kit.css` and switch via `data-theme="{name}"` on `<html>`.
- Removing the attribute reverts to the base light tokens from `:root`.
- All preset overrides sit inside `@layer ai-kit.themes`, so they always trump component styles without `!important`.

```html
<link rel="stylesheet" href="/dist/ai-css-kit.css">
<link rel="stylesheet" href="/dist/themes/midnight.css">
<html data-theme="midnight">...</html>
```

### Theme Mapper CLI

Use `npm run theme-map -- ./theme.json -o ./dist/themes/custom.css` to convert JSON tokens (native, W3C, or Figma format) into a usable theme file. See [docs/theming.md](docs/theming.md) for full details.

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
- `disabled` attribute (not just a CSS class) for disabled state
- `<fieldset>` + `<legend>` for checkbox/radio groups
- `role="tablist"` on `.ui-tabs`; `role="tab"` + `aria-selected` on each `.ui-tabs__item`
- `role="alert"` on `.ui-alert` elements
- `aria-label` on `.ui-avatar` when used as initials (no visible text alternative)
- `aria-label="Breadcrumb"` on `<nav class="ui-breadcrumb">`; `aria-current="page"` on current item
- `aria-label` on each `.ui-pagination__item`; `aria-current="page"` on active item; `aria-hidden="true"` on `.ui-pagination__ellipsis`
- `role="status"` + `aria-label="Loading"` on `.ui-spinner`
- `aria-label` on `.ui-tag__remove` buttons (e.g. `aria-label="Remove {tag name}"`)
- `role="dialog"` + `aria-modal="true"` + `aria-labelledby` on `.ui-modal`; trap focus inside open modal
- `role="menu"` on `.ui-dropdown__menu`; `role="menuitem"` on each `.ui-dropdown__item`
- `aria-pressed="true/false"` on `.ui-chip` toggle buttons
- `role="status"` + `aria-label` on `.ui-status` for live updates
- `aria-label` on `.ui-search__input`; `aria-label` on keyboard shortcut `.ui-search__kbd`
- `aria-label` on `.ui-notification` unread indicators
- `role="banner"` on `.ui-navbar`; `aria-label` on `.ui-sidebar` nav
- `aria-label` on icon-only `.ui-button--icon` buttons

---

*This document is maintained alongside each component release.*  
*Component count: 43 (24 original + 17 added in v0.8.0: modal, dropdown, chip, divider, empty-state, banner, callout, skeleton, stat-card, section-header, feed, rating, search, status, notification, sidebar, navbar; plus icon-button and live-badge modifiers)*  
*ADR decisions that affect this context:*  
* [ADR-0001](docs/adr/0001-atomic-decoupling.md) — Atomic Decoupling (ban parent-selector mutations)  
* [ADR-0002](docs/adr/0002-context-modifier-pattern.md) — Context Modifier Pattern  
* [ADR-0003](docs/adr/0003-ai-token-naming.md) — Component Token Naming `--ai-[component]-[prop]`
