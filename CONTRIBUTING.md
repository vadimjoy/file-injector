# Contributing to ai-css-kit

> **Note:** `ai-css-kit` is the canonical name across code, commits, PRs, and documentation.

---

## The Vision

We are not building a UI kit. We are building **Lego for neural networks**.

Every component in `ai-css-kit` must be:

- **Deterministic** — given the same HTML structure and tokens, any AI agent must produce an identical, predictable result
- **Atomic** — one block, one file, one responsibility. No hidden coupling
- **Self-contained** — a Calendar is not a child of an Input. A Dropdown is not owned by an Autocomplete. Each is an independent CSS entity

The end goal: an AI agent should be able to compose any UI from this kit without ambiguity, without magic, and without reading source code.

---

## Architecture Principles

### 1. Pure CSS & Decoupling

**Rule:** One component = one file = one task.

Components that co-locate state (e.g., a calendar popup wired into an input's DOM) are architectural debt. The correct model:

```
src/css/components/
├── input.css          # text input only
├── calendar.css       # calendar grid — standalone CSS entity
├── autocomplete.css   # suggestion list — standalone CSS entity
├── dropdown.css       # generic dropdown shell
└── datepicker.css     # composition: input + calendar (via Anchor Positioning)
```

`datepicker.css` can *reference* `calendar.css` tokens, but `calendar.css` must render correctly in isolation.

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

Any structural change (e.g., decoupling Calendar from Input, migrating to Anchor Positioning, renaming token schema) requires an **Architectural Decision Record** before implementation.

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

Open `index.html` in a browser to see the component showcase.

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

5. Test both `data-theme="light"` and `data-theme="dark"` manually.

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
│   │       ├── calendar.css    # standalone — no input dependency
│   │       ├── autocomplete.css
│   │       └── ...
│   └── demos/
│       ├── *.html              # one demo per component
│       └── shared/             # showcase + iframe assets
│           ├── demo-page.css
│           ├── showcase-page.css
│           ├── demo-theme.js   # iframe theme sync
│           └── showcase-page.js# landing toggle logic
├── docs/
│   └── adr/                    # architectural decision records
├── dist/                       # build output (do not edit)
├── SPEC.md
├── README.md
└── CONTRIBUTING.md
```

---

## Code Style

- **Selector naming:** BEM-style with `ai-` prefix: `.ai-input`, `.ai-input__icon`, `.ai-input--error`
- **Nesting:** Use PostCSS nesting (`postcss-nesting`). Max 3 levels deep
- **Comments:** Mark component sections with a block header:
  ```css
  /* ─── Calendar Header ─── */
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
