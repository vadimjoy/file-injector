# Pure UI

Pure UI — модульная CSS-библиотека форм и UI‑паттернов. Внутри только HTML/CSS и скрипт синхронизации темы для демо-страниц; сторонних зависимостей в рантайме нет, кроме иконок Font Awesome.

## Почему Pure UI

- **Дизайн‑токены** — все цвета, типографика и отступы на переменных CSS
- **Модульные импорты** — подключайте весь пакет или отдельные компоненты
- **Тёмная тема** — переключается через `data-theme="dark"` и сохраняется локально
- **Zero JS** — стили не требуют JavaScript и фреймворков
- **Font Awesome** — единственный вендор для иконографики

## Установка

### npm

```bash
npm install pure-ui font-awesome
```

```css
/* postcss / bundler */
@import 'pure-ui';

/* точечный импорт */
@import 'pure-ui/components/button.css';
```

### CDN

```html
<link rel="stylesheet" href="https://unpkg.com/pure-ui/dist/pure-ui.min.css">
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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/node_modules/font-awesome/css/font-awesome.min.css">
  <link rel="stylesheet" href="/node_modules/pure-ui/dist/pure-ui.css">
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

## Субпакеты

```css
@import 'pure-ui/tokens';         /* дизайн‑токены */
@import 'pure-ui/base';            /* сброс и базовые стили */
@import 'pure-ui/components/button.css';
@import 'pure-ui/components/input.css';
```

Subpath‑экспорты позволяют собирать только нужные блоки в PostCSS, Vite, Webpack и т.д.

## Тёмная тема и синхронизация

```html
<html data-theme="dark">...</html>
```

Для демо-страниц мы используем `src/js/demo-theme.js`, который принимает события `postMessage` и переключает атрибут `data-theme`. Главная витрина (`index.html`) просто отправляет `type: 'theme'` во все iframe, так что вы можете использовать тот же приём в дизайне-системах с множеством песочниц.

## Разработка и сборка

```bash
npm install          # установить dev-инструменты PostCSS
npm run build        # dist/pure-ui.css и dist/pure-ui.min.css
```

Сборка основана на `postcss-cli` + `postcss-import` + `postcss-nesting`. Минификация включается автоматически для `pure-ui.min.css`.

## Документация

- Подробные примеры, состояния и токены — в [SPEC.md](SPEC.md)
- Живые примеры компонентов находятся в `src/demos/*.html`

## Лицензия

MIT — можно использовать в коммерческих и open-source проектах.
