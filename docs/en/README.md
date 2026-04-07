# AI CSS Kit

> **Language:** English | [Русский](../ru/README.md)

AI CSS Kit is a modular CSS library of form components and UI patterns for AI services and internal tools. It contains only HTML/CSS and a theme synchronisation script for demo pages; there are no runtime third-party dependencies beyond Font Awesome icons.

## Why AI CSS Kit

- **AI-ready UX** — ready-made patterns for prompts, assistants, and data-heavy UIs
- **Design tokens** — all colours, typography, and spacing backed by CSS custom properties
- **Modular imports** — import the full bundle or individual components
- **Themes & CLI mapper** — 5 presets + `theme-map` for JSON → CSS conversion
- **Zero JS** — styles require no JavaScript or frameworks
- **Font Awesome** — the only vendor dependency, used for iconography

## Installation

### npm

```bash
npm install ai-css-kit font-awesome
```

```css
/* PostCSS / bundler */
@import 'ai-css-kit';

/* selective import */
@import 'ai-css-kit/components/button.css';
```

### CDN

```html
<link rel="stylesheet" href="https://unpkg.com/ai-css-kit/dist/ai-css-kit.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
```

### Required fonts

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

## Quick Start

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/node_modules/font-awesome/css/font-awesome.min.css">
  <link rel="stylesheet" href="/node_modules/ai-css-kit/dist/ai-css-kit.css">
</head>
<body>
  <div class="ui-field ui-field--md">
    <label class="ui-label">Email Address</label>
    <input type="email" class="ui-input" placeholder="name@example.com">
    <span class="ui-helper"><i class="fa fa-lock" aria-hidden="true"></i> We keep it private</span>
  </div>
</body>
</html>
```

## Sub-packages

```css
@import 'ai-css-kit/tokens';          /* design tokens */
@import 'ai-css-kit/base';            /* reset and base styles */
@import 'ai-css-kit/components/button.css';
@import 'ai-css-kit/components/input.css';
```

Subpath exports let you include only the pieces you need in PostCSS, Vite, Webpack, etc.

## Themes and Presets

### Quick switching

The kit ships with 5 pre-built themes: `default`, `dark`, `midnight`, `corporate`, `warm`. Link the desired CSS and set `data-theme` on `<html>` or any ancestor:

```html
<link rel="stylesheet" href="/dist/ai-css-kit.css">
<link rel="stylesheet" href="/dist/themes/midnight.css">

<html data-theme="midnight">...</html>
```

To revert to the default light theme, remove the `data-theme` attribute. The main showcase (`index.html`) includes a preset selector and synchronises the chosen theme across all iframes via `postMessage`.

### Theme Mapper CLI

Describe your tokens in JSON (native format, W3C Design Tokens, or Figma Tokens) and run:

```bash
npm run theme-map -- ./my-theme.json -o ./dist/themes/my-theme.css
```

`scripts/theme-map.js` automatically detects the format, maps keys to `--ui-*` / `--ai-*` variables, and wraps the output in `@layer ai-kit.themes`. Details and examples are in [`docs/en/theming.md`](theming.md).

## Development & Build

```bash
npm install          # install PostCSS dev tools
npm run build        # dist/ai-css-kit.css and dist/ai-css-kit.min.css
npm run build:themes # dist/themes/*.css from src/themes/*.json
npm test             # run theme-map.js unit tests
```

The build is based on `postcss-cli` + `postcss-import` + `postcss-nesting`. Minification is applied automatically for `ai-css-kit.min.css`.

## Documentation

- Component examples, states, and tokens — [SPEC.md](SPEC.md)
- Theming, CLI mapper, and JSON format — [theming.md](theming.md)
- Live component demos are in `src/demos/*.html`
- Architectural decisions — [adr/README.md](adr/README.md)
- Project roadmap — [MASTER_PLAN.md](MASTER_PLAN.md)
- Glossary of terms — [../glossary.md](../glossary.md)

## License

MIT — free for personal and commercial use.
