# AI CSS Kit

> **Language:** English | [Русский](../ru/README.md)

AI CSS Kit is a deterministic visual platform for building precise interfaces from constrained tokens, CSS primitives, themes, schemas, and reusable component contracts.

> New to the project? Start with [START_HERE.md](START_HERE.md).

## What This Is

The project has four layers:

1. **CSS kit** — tokens, foundations, utilities, and components
2. **Theme system** — preset themes and JSON → CSS theme mapping
3. **Showcase / playground** — a component lab for testing states, tokens, and controlled variations
4. **CLI** — a future HTML generation and validation layer built on top of the kit contracts

Core idea:

> We do not redesign a complex UI element every time.
> We define its contract once, expose controlled variations, and extend the system through schemas instead of ad hoc CSS and markup.

## What This Is Not

- not a free-form visual builder
- not an LLM that writes arbitrary CSS from scratch
- not just a demo gallery
- not a React/Vue component framework

This is a constrained UI system: interfaces should be assembled from pre-validated building blocks and produce predictable output.

## What Exists vs What Is Still Stabilizing

- **ready now**: CSS kit, tokens, themes, most of the component layer, audit scripts, and core contracts
- **actively being stabilized**: `showcase-app` and the schema-driven playground
- **depends on playground maturity**: the CLI end-to-end flow

This matters for contributors: the playground is not decorative. It is the visual contract and feedback loop for the rest of the system.

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

## How To Read The Project

If you need a quick mental model, read it like this:

```text
ai-css-kit = deterministic UI lego
showcase-app = lab and control stand
schemas = contract for allowed variations
CLI = future HTML assembler using those contracts
```

## CLI — Generate UI from Natural Language

```bash
npm install ai-css-kit --save-dev
npx ai-css-kit generate "primary button"
```

The CLI is intended as the top layer: it turns natural language into standards-compliant HTML using the already defined kit contracts.

Important: by the current roadmap, this layer should not yet be treated as fully mature until the playground is stabilized.

Target usage examples:

```bash
# Form generation
npx ai-css-kit generate "login form with email and password"

# With theme
npx ai-css-kit generate "card with title" --theme midnight

# Validate HTML output
npx ai-css-kit validate output.html
```

Full CLI documentation: [cli.md](cli.md)

## Playground — Interactive Component Demos

`showcase-app` and the playground exist as a lab and validation surface. This is where a component must prove that it survives:

- state and size variations
- theme switching
- token overrides
- future CLI/validator integration

Schema-driven demos live in `src/demos/schemas/`. Mount a playground in any demo HTML:

```html
<div id="playground" data-schema="./schemas/button.js"></div>
<script type="module" src="/shared/playground.js"></script>
```

See [docs/plans/DEMO_PLAYGROUND.md](../../plans/DEMO_PLAYGROUND.md) for the full specification.

## Safe Contribution Areas

If someone is new to the codebase, the safest contribution tracks are:

1. tokens, themes, and theme mapping
2. foundations / utilities / grid and layout primitives
3. component contract cleanup in existing CSS modules
4. schema-driven playground coverage for existing components
5. documentation and contributor onboarding

The CLI layer is easier to work on after understanding this pipeline:

```text
component CSS -> schema -> showcase/playground -> validation -> CLI generation
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

To revert to the default light theme, remove the `data-theme` attribute. The main showcase (`index.html`) is evolving toward a single `showcase-app` shell, without a required iframe grid.

### Theme Mapper CLI

Describe your tokens in JSON (native format, W3C Design Tokens, or Figma Tokens) and run:

```bash
npm run theme-map -- ./my-theme.json -o ./dist/themes/my-theme.css
```

`scripts/theme-map.js` automatically detects the format, maps keys to `--ui-*` / `--ai-*` variables, and wraps the output in `@layer ai-kit.themes`. Details and examples are in [`docs/localization/en/theming.md`](theming.md).

## Development & Build

```bash
npm install          # install dependencies
npm run build        # dist/ai-css-kit.css + dist/ai-css-kit.min.css + 58 modular CSS files + 5 themes
npm run lint:coupling  # check atomic-level coupling violations
npm run lint:atomic-level # enforce import layer order
```

The build uses `postcss-cli` + `postcss-import` + `postcss-nesting`. All build scripts are ESM (`.mjs`).

## Documentation

- Quick onboarding and project boundaries — [START_HERE.md](START_HERE.md)
- Component examples, states, and tokens — [SPEC.md](SPEC.md)
- Theming, CLI mapper, and JSON format — [theming.md](theming.md)
- **CLI guide** — [cli.md](cli.md)
- Live component demos and playground infrastructure are in `src/demos/*.html`, `src/demos/shared/*`, and `src/demos/schemas/*`
- Architectural decisions — [adr/README.md](../../adr/README.md)
- Project roadmap — [MASTER_PLAN.md](MASTER_PLAN.md)
- Glossary of terms — [../glossary.md](../../glossary.md)

## License

MIT — free for personal and commercial use.
