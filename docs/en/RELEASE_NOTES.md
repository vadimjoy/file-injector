# Release Notes

> **Language:** English | [Русский](../ru/RELEASE_NOTES.md)

## 0.0.5

- **Theme Mapper CLI**: added `scripts/theme-map.js` with support for three JSON formats (native, W3C Design Tokens, Figma Tokens) and 28 unit tests (`npm test`). Run `npm run theme-map -- ./theme.json -o dist/themes/custom.css` to generate ready-to-use CSS with `@layer ai-kit.themes`.
- **Five presets**: `src/themes/*.json` → `dist/themes/{default,dark,midnight,corporate,warm}.css`; a new `build:themes` script is included in the main pipeline, and the package exports `ai-css-kit/themes/*` for selective imports.
- **Cascade layers**: all tokens, base styles, and components are wrapped in `@layer ai-kit.tokens/base/components`, while themes go into `ai-kit.themes`, so preset files always win without `!important`.
- **Documentation**: `docs/theming.md` added; `README.md`, `SPEC.md`, `docs/AI_CONTEXT.md`, and the roadmap updated (Phase 3 marked complete). ADR-0004 records the decision.
- **Demos & showcase**: `index.html` has a preset selector; `showcase-page.js` broadcasts the selected theme to all iframes; `demo-theme.js` supports all `data-theme` values. Shared demo CSS imports the built preset files to show real theme behaviour.

## 0.0.4

- **AI context**: `docs/AI_CONTEXT.md` is now a self-contained system prompt (invariants, component registry, composition rules, anti-patterns, token reference, size tables) that an agent loads before generating markup.
- **Architectural decisions**: ADR-0002 (Context Modifier Pattern) and ADR-0003 (AI token naming) recorded, with an updated index in `docs/adr/README.md`, keeping decisions revisable.
- **Roadmap update**: `docs/MASTER_PLAN.md` describes Phase 2 milestones (context standardisation, ADR system, AI token namespace), showing how the "Deterministic Lego" strategy evolves.
- **Component AI tokens**: a second layer of `--ai-[component]-*` variables added to `src/css/tokens.css`, referencing global `--ui-*` by default and allowing per-component customisation without side-cascade effects.
- **Component rewire**: all styles in `src/css/components/` migrated to the new `--ai-*` tokens and explicit context modifiers, removing parent-selector dependencies ahead of the Phase 2 release.

## 0.0.3

- Package version bumped to `0.0.3`; published files list narrowed to built artefacts from `dist/` (see `package.json#files`), making installs lighter and consistent with `exports`.
- `package-lock.json` synchronised to the same version number so consumers receive uniform metadata on installs and in CI.

## 0.0.2

- Added `scripts/build-modules.js` and an npm `build:modules` script that builds individual CSS entry points (`tokens.css`, `base.css`, `states.css`, and component files) directly into `dist/` for consumers who need file-level tree-shaking.
- Updated `.gitignore` and repository structure: built artefacts are no longer stored in Git; releases are produced only via the build pipeline.
- Rewrote the slider (`src/css/components/slider.css`): introduced a typed `@property --_fill`, gradient tracks, smooth thumb transitions, Firefox `::-moz-range-progress` support, and explicit disabled styles. Demos now set `style="--_fill:…"` to reflect the CSS contract (`src/demos/slider.html`).
- Updated toggle demos (`src/demos/toggle.html`): better on/off state display and updated copy.

## 0.0.1

- Library launch around the "Deterministic UI Lego" concept, establishing a new AI-oriented architecture and build pipeline.
- `SPEC.md` describes the context modifier pattern: inputs use explicit `.ui-input--icon-left/right/search/readonly` classes, while orchestrators (Autocomplete/Datepicker) add only auxiliary classes (`.ui-autocomplete__input`, `.ui-datepicker__input`) rather than mutating child atoms.
- Component CSS aligned with the contract: parent-selector rules removed from `src/css/components/input.css`, `src/css/components/autocomplete.css`, and `src/css/components/datepicker.css`, so all states are declared on the element itself.
- Documentation extended (`docs/MASTER_PLAN.md`) to describe the multi-phase roadmap (coupling audit, context modifiers, machine-readable specs) and provide overall context for contributors and AI agents.
