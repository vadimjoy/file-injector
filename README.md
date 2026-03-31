# Pure UI

A lightweight, modern CSS component library built with zero JavaScript dependencies. Designed with minimalism and accessibility in mind.

## Features

- **Zero Dependencies** — Pure CSS, no JavaScript libraries required for styling
- **3 Size Variants** — Small (sm), Medium (md), and Large (lg) for all components
- **Full Customization** — Every visual aspect controlled via CSS custom properties
- **Dark Mode Support** — Automatic theme detection or manual toggle via `data-theme="dark"`
- **Accessibility First** — ARIA-compatible, keyboard navigable, focus states
- **Modern Standards** — CSS Grid, Flexbox, Custom Properties, and semantic HTML
- **Responsive** — Mobile-first approach with breakpoints at 768px and 1024px

## Installation

### CDN

```html
<link rel="stylesheet" href="https://your-cdn.com/pure-ui/styles.css">
```

### Prerequisites

```html
<!-- Required: Google Fonts Inter -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

## Quick Start

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
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

## Components

| Component | Class | Description |
|-----------|-------|-------------|
| Input | `.ui-input` | Text input with error/success/warning states |
| Textarea | `.ui-textarea` | Multi-line text input |
| Select | `.ui-select` | Dropdown with custom arrow styling |
| Autocomplete | `.ui-autocomplete` | Searchable dropdown with suggestions |
| Checkbox | `.ui-checkbox` | Single or multiple selection |
| Radio | `.ui-radio` | Mutually exclusive selection |
| Toggle | `.ui-toggle` | On/off switch with animation |
| Slider | `.ui-slider` | Range input for numeric values |
| Button | `.ui-button` | Action buttons with multiple variants |
| File Upload | `.ui-file-upload` | Drag-and-drop file input |
| Date Picker | `.ui-datepicker` | Calendar date selection |
| Progress | `.ui-progress` | Linear progress indicator |
| Badge | `.ui-badge` | Status indicators and labels |
| Tooltip | `.ui-tooltip` | Contextual information on hover |
| Card | `.ui-card` | Container for grouping content |
| Field Wrapper | `.ui-field` | Form field container with consistent spacing |

## Dark Mode

```html
<html data-theme="dark">
  <!-- All components use dark theme -->
</html>
```

## Customization

Override CSS custom properties to create custom themes:

```css
:root {
  --ui-color-primary: #10b981;
  --ui-color-primary-hover: #059669;
  --ui-radius-md: 12px;
  --ui-font-family: 'Poppins', sans-serif;
}
```

## Documentation

Full component specification, CSS variables reference, accessibility guidelines, and usage examples are in [SPEC.md](SPEC.md).

## Browser Support

Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## License

MIT License — free for personal and commercial use.
