# AI CSS Kit

Deterministic visual platform for building precise interfaces from constrained CSS primitives, themes, schemas, and reusable component contracts.

## What This Project Is

`ai-css-kit` is not just a stylesheet bundle.

It is a system with four layers:

1. **CSS kit**: tokens, foundations, utilities, and components
2. **Theme system**: preset themes and JSON-to-CSS theme mapping
3. **Showcase / playground**: schema-driven component lab for testing states, tokens, and variants
4. **CLI**: a future generator/validator layer that composes HTML from the kit instead of inventing raw CSS

The core idea is simple:

> We do not redesign the same UI element every time.
> We define a component contract once, expose controlled variations, and extend the system through schemas instead of ad hoc markup and CSS.

## What This Project Is Not

- not a free-form visual page builder
- not an LLM that writes arbitrary CSS from scratch
- not a generic React component framework
- not “just demos”

The goal is deterministic composition: the same component contract should always produce the same visual result.

## Current Product Shape

Today the project should be read like this:

- **ready now**: CSS kit, tokens, themes, component contracts, lint/audit scripts
- **in active rescue / stabilization**: `showcase-app` and schema-driven playground
- **depends on playground being stable**: CLI end-to-end generation flow

If the playground is not stable, the CLI cannot be treated as complete. The playground is the visual contract and feedback loop for the rest of the system.

## Who It Is For

- engineers who care about pixel-accurate prototypes
- people building internal tools and form-heavy products
- AI-assisted UI workflows that need constrained, predictable output
- contributors who want to improve tokens, themes, components, schemas, validation, and deterministic UI generation

---

## Documentation / Документация

| Language | Link |
|----------|------|
| **Start Here (EN)** | [docs/localization/en/START_HERE.md](docs/localization/en/START_HERE.md) |
| **Start Here (RU)** | [docs/localization/ru/START_HERE.md](docs/localization/ru/START_HERE.md) |
| **English** | [docs/localization/en/README.md](docs/localization/en/README.md) |
| **Русский** | [docs/localization/ru/README.md](docs/localization/ru/README.md) |

---

## Quick Links / Быстрые ссылки

| Document | English | Русский |
|----------|---------|---------|
| Start Here | [docs/localization/en/START_HERE.md](docs/localization/en/START_HERE.md) | [docs/localization/ru/START_HERE.md](docs/localization/ru/START_HERE.md) |
| Live Demo | [GitHub Pages](https://vadimjoy.github.io/ai-css-kit/) | — |
| Component Specification | [docs/localization/en/SPEC.md](docs/localization/en/SPEC.md) | [docs/localization/ru/SPEC.md](docs/localization/ru/SPEC.md) |
| Theming Guide | [docs/localization/en/theming.md](docs/localization/en/theming.md) | [docs/localization/ru/theming.md](docs/localization/ru/theming.md) |
| Contributing Guide | [docs/localization/en/CONTRIBUTING.md](docs/localization/en/CONTRIBUTING.md) | [docs/localization/ru/CONTRIBUTING.md](docs/localization/ru/CONTRIBUTING.md) |
| Release Notes | [RELEASE_NOTES.md](RELEASE_NOTES.md) | — |
| Master Plan | [docs/localization/en/MASTER_PLAN.md](docs/localization/en/MASTER_PLAN.md) | [docs/localization/ru/MASTER_PLAN.md](docs/localization/ru/MASTER_PLAN.md) |
| AI Context | [AI_CONTEXT.md](AI_CONTEXT.md) | — |
| ADR Index | [docs/adr/README.md](docs/adr/README.md) | — |
| **Glossary** | [docs/glossary.md](docs/glossary.md) | [docs/glossary.md](docs/glossary.md) |

---

## Install

```bash
npm install ai-css-kit font-awesome
```

```html
<link rel="stylesheet" href="https://unpkg.com/ai-css-kit/dist/ai-css-kit.min.css">
```

---

## Adding a New Language / Добавление нового языка

1. Create `docs/localization/{lang}/` directory
2. Copy files from `docs/localization/en/` as a starting point
3. Translate all content
4. Add a language switcher header to each file (within `docs/localization`): `> **Language:** [English](../en/filename.md) | [Русский](../ru/filename.md) | **NewLang**`
5. Add a column to `docs/glossary.md`
6. Update this README with a new row in both tables

---

MIT License — free for personal and commercial use.
