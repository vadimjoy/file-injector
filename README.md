# AI CSS Kit

An AI-first modular pure-CSS component library for building form-heavy UIs and internal tools.

---

## Documentation / Документация

| Language | Link |
|----------|------|
| **English** | [docs/localization/en/README.md](docs/localization/en/README.md) |
| **Русский** | [docs/localization/ru/README.md](docs/localization/ru/README.md) |

---

## Quick Links / Быстрые ссылки

| Document | English | Русский |
|----------|---------|---------|
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
