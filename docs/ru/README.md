# AI CSS Kit

> **Язык:** Русский | [English](../en/README.md)

AI CSS Kit — модульная CSS-библиотека форм и UI‑паттернов для AI‑сервисов и внутренних тулов. Внутри только HTML/CSS и скрипт синхронизации темы для демо-страниц; сторонних зависимостей в рантайме нет, кроме иконок Font Awesome.

## Почему AI CSS Kit

- **AI‑ready UX** — готовые паттерны для промптов, ассистентов и data-heavy UI
- **Дизайн‑токены** — все цвета, типографика и отступы на переменных CSS
- **Модульные импорты** — подключайте весь пакет или отдельные компоненты
- **Темы и CLI-маппер** — 5 пресетов + `theme-map` для JSON → CSS
- **Zero JS** — стили не требуют JavaScript и фреймворков
- **Font Awesome** — единственный вендор для иконографики

## Установка

### npm

```bash
npm install ai-css-kit font-awesome
```

```css
/* postcss / bundler */
@import 'ai-css-kit';

/* точечный импорт */
@import 'ai-css-kit/components/button.css';
```

### CDN

```html
<link rel="stylesheet" href="https://unpkg.com/ai-css-kit/dist/ai-css-kit.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
```

### Обязательные шрифты

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

## Быстрый старт

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/node_modules/font-awesome/css/font-awesome.min.css">
  <link rel="stylesheet" href="/node_modules/ai-css-kit/dist/ai-css-kit.css">
</head>
<body>
  <div class="ui-field ui-field--md">
    <label class="ui-label">Email-адрес</label>
    <input type="email" class="ui-input" placeholder="name@example.com">
    <span class="ui-helper"><i class="fa fa-lock" aria-hidden="true"></i> Адрес остаётся приватным</span>
  </div>
</body>
</html>
```

## Субпакеты

```css
@import 'ai-css-kit/tokens';         /* дизайн‑токены */
@import 'ai-css-kit/base';            /* сброс и базовые стили */
@import 'ai-css-kit/components/button.css';
@import 'ai-css-kit/components/input.css';
```

Subpath‑экспорты позволяют собирать только нужные блоки в PostCSS, Vite, Webpack и т.д.

## Темы и пресеты

### Быстрое переключение

В комплекте 5 преднастроенных тем: `default`, `dark`, `midnight`, `corporate`, `warm`. Подключите нужные CSS и выставьте `data-theme` на `<html>` или любом предке:

```html
<link rel="stylesheet" href="/dist/ai-css-kit.css">
<link rel="stylesheet" href="/dist/themes/midnight.css">

<html data-theme="midnight">...</html>
```

Чтобы вернуться к базовой светлой теме, удалите атрибут `data-theme`. Главная витрина (`index.html`) содержит селектор пресетов и синхронизирует выбранный вариант во все iframe через `postMessage`.

### Theme Mapper CLI

Опишите токены в JSON (родной формат, W3C Design Tokens или Figma Tokens) и выполните:

```bash
npm run theme-map -- ./my-theme.json -o ./dist/themes/my-theme.css
```

Скрипт `scripts/theme-map.js` автоматически определит формат, сопоставит ключи с `--ui-*` / `--ai-*` переменными и завернёт вывод в `@layer ai-kit.themes`. Детали и примеры — в [`docs/ru/theming.md`](theming.md).

## Разработка и сборка

```bash
npm install          # установить dev-инструменты PostCSS
npm run build        # dist/ai-css-kit.css и dist/ai-css-kit.min.css
npm run build:themes # dist/themes/*.css из src/themes/*.json
npm test             # запуск unit-тестов theme-map.js
```

Сборка основана на `postcss-cli` + `postcss-import` + `postcss-nesting`. Минификация включается автоматически для `ai-css-kit.min.css`.

## Документация

- Подробные примеры, состояния и токены — [SPEC.md](SPEC.md)
- Темизация, CLI-маппер и формат JSON — [theming.md](theming.md)
- Живые примеры компонентов — `src/demos/*.html`
- Архитектурные решения — [adr/README.md](adr/README.md)
- Дорожная карта проекта — [MASTER_PLAN.md](MASTER_PLAN.md)
- Глоссарий терминов — [../glossary.md](../glossary.md)

## Лицензия

MIT — можно использовать в коммерческих и open-source проектах.
