# ADR-0004 — Theme Mapper, cascade layers, and preset library

> **Language:** English | [Русский](../../ru/adr/0004-theme-mapper-and-presets.md)

**Status:** Accepted  
**Date:** 2026-04-07  
**Author:** vadimjoy  
**Related ADRs:** [0003](0003-ai-token-naming.md)

---

## Context

Phase 3 of the roadmap required giving theming the same determinism as the atoms from Phases 1/2. At v0.5.0 the project had:

- Only `:root` (light) and `[data-theme="dark"]` override inside `tokens.css` — no formal format for third-party themes.
- AI agents and designers had to manually map external tokens to `--ui-*` / `--ai-*`, which was time-consuming and error-prone.
- Component styles were not wrapped in `@layer`, so final specificity depended on import order; themes had to be connected "after everything" and fight styles via `!important`.
- Demo pages and the showcase switched only binary `light/dark`, not demonstrating new presets.

A machine-readable theme format was needed, CSS generation had to be automated, and cascade predictability had to be guaranteed.

---

## Decision

1. **Cascade layers** — `src/css/index.css` declares the order `@layer ai-kit.tokens, ai-kit.base, ai-kit.components, ai-kit.themes`. All existing files (`tokens.css`, `base.css`, component CSS, `states.css`) are wrapped in their respective layers, so themes in `ai-kit.themes` always win without `!important`.

2. **Theme Mapper CLI** — `scripts/theme-map.js` created, which:
   - Accepts JSON themes in three formats: native (`meta` + flat `tokens`), W3C Design Tokens (`$value`/`$type`), and Figma Tokens (`value`/`type`).
   - Automatically detects the format, flattens the tree to dot-notation, and maps keys to `--ui-*` and `--ai-*` variables.
   - Generates a CSS file with comments and `@layer ai-kit.themes { [data-theme="name"] { ... } }`.

3. **Preset build** — source JSON files added to `src/themes/` (default, dark, midnight, corporate, warm) and a `scripts/build-themes.js` script + `build:themes` npm script that translates them to `dist/themes/*.css` and publishes via `package.json#exports./themes/*`.

4. **Documentation** — `docs/theming.md` written; `README.md`, `SPEC.md`, `AI_CONTEXT.md`, `MASTER_PLAN.md`, and release notes updated with format description, CLI, and new demo controls.

5. **Demo showcase** — `index.html` now has a preset selector (default/dark/midnight/corporate/warm). `showcase-page.js` broadcasts the selected theme to all iframes; `demo-theme.js` applies any `data-theme` value (not only dark). All demos import theme CSS to respond to the selection.

---

## Consequences

### Positive

- Themes became deterministic: any JSON → CLI → ready CSS that is guaranteed to override components without manual specificity tuning.
- W3C/Figma format support removes manual token re-coding for designers and AI agents.
- Official presets can be connected with a single line `import 'ai-css-kit/themes/midnight'`, lowering the entry barrier.
- Demos replicate the production flow: `data-theme="midnight"` and the set of `dist/themes/*.css` files are tested in real UI.
- Tests (`node --test tests/theme-map.test.js`) provide regression coverage for the entire parse → generate chain.

### Negative / Trade-offs

- Build is longer: in addition to `build:css`, `build:themes` is now always run.
- Demo page bundle loads all 5 preset CSS files to enable instant switching — the increased weight is acceptable for a showcase but not for consumers (who import only the needed themes in production).
- CLI and tests require Node ≥18 due to the built-in `node:test` module and modern APIs.
- The JSON specification must be maintained and kept in sync with documentation (additional process when adding new tokens).

---

## Alternatives Considered

1. **Keep only `:root` + `[data-theme="dark"]`** — document how to override `--ui-*`. Rejected: does not solve fast import of external design systems, provides no presets, does not scale for AI agents.

2. **Use external tools (Style Dictionary / Theo)** — requires a heavy Node pipeline and a JSON DSL not friendly to AI. Our goal is minimal entry: flat keys, obvious naming rules, zero-dependency CLI.

3. **Generate themes via PostCSS on the fly** — possible to import JSON in PostCSS, but ties users to our build stack. A CLI based on `node scripts/theme-map.js` allows using the tool as an external utility both in CI and locally.

4. **`prefers-color-scheme` instead of `data-theme`** — solves only the binary dark/light scenario, no named presets, no designer JSON support.

---

## Release / Follow-up

- Include `npm run build:themes` in the main `npm run build` pipeline (done).
- Maintain the theme index in documentation and demos.
- When adding new tokens, update `src/themes/*.json`, `docs/theming.md`, and Theme Mapper unit tests.
