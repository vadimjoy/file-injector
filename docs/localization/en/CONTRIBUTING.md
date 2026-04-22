# Contributing to ai-css-kit

> **Language:** English | [Русский](../ru/CONTRIBUTING.md)

> **Note:** `ai-css-kit` is the canonical name across code, commits, PRs, and documentation.

---

## The Vision

We are not building a UI kit. We are building **Lego for neural networks**.

Every component in `ai-css-kit` must be:

- **Deterministic** — given the same HTML structure and tokens, any AI agent must produce an identical, predictable result
- **Atomic** — one block, one file, one responsibility. No hidden coupling
- **Self-contained** — a reusable subpart should not secretly live inside another component. A Dropdown should not be owned by an Autocomplete, and popup/grid/trigger-like parts should graduate into standalone contracts when they become shared

The end goal: an AI agent should be able to compose any UI from this kit without ambiguity, without magic, and without reading source code.

## Understand The Project Boundaries First

Before your first change, keep this model in mind:

```text
CSS kit -> themes -> showcase/playground -> CLI
```

Where:

- `CSS kit` is the canonical layer of tokens, utilities, foundations, and components
- `showcase/playground` is the lab that proves the component contract actually works
- `CLI` is the top layer; it should assemble HTML from stable contracts, not invent CSS from scratch

If you are unsure where a change belongs, it is usually safer to improve the kit/showcase layers before touching the CLI.

## Safest Contribution Areas

If you want to get productive quickly without breaking direction, start here:

1. tokens and themes
2. utilities, grid, and layout primitives
3. cleanup of component CSS contracts
4. schemas and playground coverage for existing components
5. documentation and onboarding

---

## Architecture Principles

### 1. Pure CSS & Decoupling

**Rule:** One component = one file = one task.

Components that co-locate state (e.g., a calendar popup wired into an input's DOM) are architectural debt. The correct model:

```
src/css/components/
├── input.css          # text input only
├── dropdown.css       # generic dropdown shell
├── autocomplete.css   # suggestion list as a standalone contract
├── datepicker.css     # composition built on simpler contracts
└── ...
```

When a subpart becomes shared and reusable, it should be promoted into its own module instead of being hidden inside another component's DOM contract.

**CSS-first, JS-last.** Before reaching for JavaScript:

| Problem | CSS Solution | JS fallback (last resort) |
|---|---|---|
| Popup positioning | `anchor-positioning` | `getBoundingClientRect` |
| Conditional layout | `container-queries` | resize observer |
| State toggling | `:has()`, `checkbox` hack | class toggle |
| Scroll snapping | `scroll-snap-type` | JS scroll listener |

If a CSS solution exists in modern browsers (Chrome 90+, Firefox 88+, Safari 14+), use it.

### 2. Token Naming Convention

All CSS custom properties follow a strict schema:

```
--ai-[component]-[property]
```

Examples:

```css
/* tokens.css — global primitives */
--ai-color-primary: #4f46e5;
--ai-space-4: 16px;
--ai-radius-md: 8px;
--ai-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);

/* component-level tokens */
--ai-input-height-md: 40px;
--ai-input-border-color: var(--ai-color-border);
--ai-calendar-day-size: 36px;
--ai-calendar-header-gap: var(--ai-space-2);
--ai-button-font-weight: 500;
```

**No magic numbers.** Every hardcoded value is a bug waiting to be found. If a number appears in component CSS, it must reference a token:

```css
/* WRONG */
.ui-input { padding: 9px 13px; border-radius: 8px; }

/* CORRECT */
.ai-input { padding: var(--ai-input-padding-y) var(--ai-input-padding-x); border-radius: var(--ai-radius-md); }
```

### 3. Theme Compatibility

The kit must be able to "swallow" any external JSON theme. Theme tokens map 1:1 to CSS variables:

```json
{
  "ai-color-primary": "#10b981",
  "ai-radius-md": "12px",
  "ai-font-family": "\"Poppins\", sans-serif"
}
```

```javascript
// theme ingestion (demo-theme.js pattern)
Object.entries(theme).forEach(([key, value]) => {
  document.documentElement.style.setProperty(`--${key}`, value);
});
```

Any component that breaks under an arbitrary theme is a defect.

---

## Contributing Process

### Before You Start

- Check [open issues](https://github.com/vadimjoy/ai-css-kit/issues) and [open PRs](https://github.com/vadimjoy/ai-css-kit/pulls) to avoid duplicate work
- For new components or significant changes, open an issue first to align on scope

### For Major Refactors — Write an ADR

Any structural change (e.g., decomposing a complex component into standalone contracts, migrating to Anchor Positioning, renaming token schema) requires an **Architectural Decision Record** before implementation.

Create a file at:

```
docs/adr/NNNN-short-title.md
```

ADR template:

```markdown
# ADR-NNNN: [Title]

**Status:** Proposed | Accepted | Deprecated

## Context
What problem are we solving and why now?

## Decision
What exactly are we doing?

## Consequences
- What breaks?
- What improves?
- Migration path for consumers?
```

Examples of changes that require an ADR:
- Decoupling `datepicker` → `input` + `calendar`
- Migrating token namespace from `--ui-*` to `--ai-*`
- Adding Anchor Positioning as the default popup strategy
- Introducing a new component category

### Setup

```bash
git clone https://github.com/vadimjoy/ai-css-kit.git
cd ai-css-kit
npm install
npm run build
```

Use HTTP mode for the current showcase and module-based demos:

```bash
npm run demo
```

Do not treat `file://` as the canonical way to inspect the project.

### Development Workflow

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/calendar-decoupling
   ```

2. Work in `src/css/components/`. Each component is a standalone `.css` file with PostCSS nesting.

3. Add or update the corresponding demo in `src/demos/`.

4. Build and verify:
   ```bash
   npm run build
   ```

5. Test the default theme and at least one preset theme (`dark`, `midnight`, `corporate`, or `warm`) manually.

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(calendar): add standalone calendar component
fix(input): remove hardcoded border-radius magic number
refactor(tokens): migrate --ui-* to --ai-* namespace
docs(adr): add ADR-0001 for calendar decoupling
```

**Banned in commit messages and PR descriptions:** any legacy codename. Use `ai-css-kit`.

### Pull Request Requirements

- [ ] No magic numbers — all values reference tokens
- [ ] Variable names follow `--ai-[component]-[property]` schema
- [ ] Component renders correctly in isolation (no hidden parent dependencies)
- [ ] Both light and dark themes verified
- [ ] If new component: demo file added to `src/demos/`
- [ ] If breaking change or major refactor: ADR exists in `docs/adr/`
- [ ] Zero references to legacy codenames in changed files

---

## File Structure Reference

```
ai-css-kit/
├── src/
│   ├── css/
│   │   ├── tokens.css          # all --ai-* primitives
│   │   ├── base.css            # reset + root defaults
│   │   ├── index.css           # @import manifest
│   │   ├── states.css          # shared state utilities
│   │   └── components/
│   │       ├── input.css
│   │       ├── button.css
│   │       ├── dropdown.css
│   │       ├── autocomplete.css
│   │       └── ...
│   └── demos/
│       ├── *.html              # one demo per component
│       └── shared/             # showcase, playground, and shared demo assets
│           ├── demo-page.css
│           ├── playground.css
│           ├── playground.js
│           ├── demo-theme.js
│           └── showcase-page.js / showcase-app.js
├── docs/
│   ├── localization/
│   │   ├── en/                 # English documentation
│   │   └── ru/                 # Russian documentation
│   ├── glossary.md             # bilingual glossary
│   └── adr/                    # ADR index
├── dist/                       # build output (do not edit)
├── SPEC.md
├── README.md
└── CONTRIBUTING.md
```

---

## Code Style

- **Selector naming:** BEM-style with `ui-` prefix: `.ui-input`, `.ui-input__icon`, `.ui-input--error`
- **Nesting:** Use PostCSS nesting (`postcss-nesting`). Max 3 levels deep
- **Comments:** Mark component sections with a block header:
  ```css
  /* ─── Component Header ─── */
  ```
- **Units:** `px` for fixed geometry, `em`/`rem` for typography-relative values, `%` for fluid layout

---

## License & Copyright

By submitting a pull request, you agree that your contribution is licensed under the **MIT License**.

Copyright for all contributions is retained by **vadimjoy** as the project author. You will be credited in the commit history, which is the canonical record of authorship for open-source projects.

No CLA required. MIT is the full and final agreement.

---

## Questions

Open a [GitHub Discussion](https://github.com/vadimjoy/ai-css-kit/discussions) or file an [issue](https://github.com/vadimjoy/ai-css-kit/issues).
