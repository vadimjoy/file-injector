# AI CSS Kit — Component Library Specification

> **Language:** English | [Русский](../ru/SPEC.md)

> **Note:** The canonical full specification lives at [`/SPEC.md`](../../SPEC.md) in the repository root. This file contains a language header and summary; the root file is the authoritative reference.

---

## Overview

**AI CSS Kit** is a lightweight, AI-first CSS component library built with zero JavaScript dependencies. Designed with minimalism and accessibility in mind, it provides a complete set of form components with support for light/dark themes.

### Key Features

- **Zero Dependencies** — Pure CSS, no JavaScript libraries required for styling
- **3 Size Variants** — Small (sm), Medium (md), and Large (lg) for all components
- **Full Customisation** — Every visual aspect controlled via CSS custom properties (`--ui-*` / `--ai-*`)
- **Theme Presets + Mapper** — `dist/themes/*.css` + JSON → CSS CLI for custom themes
- **Accessibility First** — ARIA-compatible, keyboard navigable, focus states
- **Modern Standards** — CSS Grid, Flexbox, Custom Properties, semantic HTML

### Components (15 total)

| # | Component | Base Class |
|---|-----------|------------|
| 1 | Input | `.ui-input` |
| 2 | Textarea | `.ui-textarea` |
| 3 | Select | `.ui-select` |
| 4 | Autocomplete | `.ui-autocomplete-trigger` |
| 5 | Checkbox | `.ui-checkbox` |
| 6 | Radio | `.ui-radio` |
| 7 | Toggle | `.ui-toggle` |
| 8 | Slider | `.ui-slider` |
| 9 | Button | `.ui-button` |
| 10 | File Upload | `.ui-file-upload` |
| 11 | Date Picker | `.ui-datepicker-trigger` |
| 12 | Progress | `.ui-progress` |
| 13 | Badge | `.ui-badge` |
| 14 | Tooltip | `.ui-tooltip` |
| 15 | Card | `.ui-card` |

For the full component API — including all class names, states, HTML examples, size tables, accessibility notes, and browser support — see the **[full SPEC.md](../../SPEC.md)**.

---

## Related

- [AI Context for agents](AI_CONTEXT.md)
- [Theming Guide](theming.md)
- [Glossary](../glossary.md)
