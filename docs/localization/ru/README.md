# AI CSS Kit

> **Язык:** Русский | [English](../en/README.md)

AI CSS Kit — это детерминированная визуальная платформа для быстрой и точной сборки интерфейсов из ограниченного набора токенов, CSS-примитивов, компонентов, тем и схем.

> Новый читатель? Начни с [START_HERE.md](START_HERE.md).

## Что это

Проект состоит из четырех слоев:

1. **CSS kit** — токены, foundations, utilities и компоненты
2. **Theme system** — пресеты тем и JSON → CSS theme mapping
3. **Showcase / playground** — лаборатория компонентов, где проверяются состояния, токены и вариации
4. **CLI** — будущий слой генерации и валидации HTML на базе контрактов кита

Главная идея:

> Мы не проектируем каждый сложный элемент заново.
> Мы один раз задаём его контракт, набор допустимых вариаций и токены, а потом переиспользуем и расширяем это через схемы.

## Чем проект не является

- не свободным конструктором “нарисуй что угодно”
- не LLM, который пишет CSS с нуля
- не просто набором демо-страниц
- не фреймворком компонентов на React/Vue

Это constrained UI system: интерфейсы должны собираться из заранее выверенных блоков и давать предсказуемый результат.

## Что уже есть, а что ещё в работе

- **готово**: CSS kit, токены, темы, большая часть компонентного слоя, аудит-скрипты и контракты
- **активно стабилизируется**: `showcase-app` и schema-driven playground
- **зависит от playground**: CLI end-to-end поток

Это важно для контрибьютора: playground сейчас не декоративный бонус, а визуальный контракт системы. Пока он не стабилен, CLI нельзя считать завершённым продуктовым слоем.

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

## Как читать проект

Если нужен быстрый ментальный образ, читай так:

```text
ai-css-kit = deterministic UI lego
showcase-app = лаборатория и контрольный стенд
schemas = контракт допустимых вариаций
CLI = будущий сборщик HTML по этим контрактам
```

## CLI — Генерация UI из естественного языка

```bash
npm install ai-css-kit --save-dev
npx ai-css-kit generate "основная кнопка"
```

CLI задуман как верхний слой, который трансформирует естественный язык в HTML на базе уже существующих контрактов.

Важно: по текущей дорожной карте этот слой ещё нельзя считать полностью зрелым, пока не стабилизирован playground.

Примеры целевого использования:

```bash
# Форма
npx ai-css-kit generate "форма входа: email и пароль"

# С темой
npx ai-css-kit generate "карточка с заголовком" --theme midnight

# Валидация
npx ai-css-kit validate output.html
```

Полная документация: [cli.md](cli.md)

## Playground — Интерактивные демо

`showcase-app` и playground нужны не для красоты, а как лаборатория и эталонный цикл обратной связи. Здесь компонент должен выдерживать:

- вариативность размеров и состояний
- переключение тем
- token overrides
- проверку пригодности для CLI и валидации

Schema-driven демо живут в `src/demos/schemas/`. Подключение в любом HTML:

```html
<div id="playground" data-schema="./schemas/button.js"></div>
<script type="module" src="/shared/playground.js"></script>
```

См. [docs/plans/DEMO_PLAYGROUND.md](../../plans/DEMO_PLAYGROUND.md).

## Куда безопасно контрибьютить

Если человек только входит в проект, самые безопасные направления такие:

1. токены, темы и theme mapping
2. foundations / utilities / grid/layout primitives
3. компонентные контракты и cleanup существующих CSS-модулей
4. schema-driven playground для существующих компонентов
5. документация и contributor onboarding

CLI-контур лучше трогать после понимания того, как компонент проходит путь:

```text
component CSS -> schema -> showcase/playground -> validation -> CLI generation
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

Чтобы вернуться к базовой светлой теме, удалите атрибут `data-theme`. Главная витрина (`index.html`) сейчас развивается как единый `showcase-app`, без обязательной сетки iframe.

### Theme Mapper CLI

Опишите токены в JSON (родной формат, W3C Design Tokens или Figma Tokens) и выполните:

```bash
npm run theme-map -- ./my-theme.json -o ./dist/themes/my-theme.css
```

Скрипт `scripts/theme-map.js` автоматически определит формат, сопоставит ключи с `--ui-*` / `--ai-*` переменными и завернёт вывод в `@layer ai-kit.themes`. Детали и примеры — в [`docs/localization/ru/theming.md`](theming.md).

## Разработка и сборка

```bash
npm install             # установить зависимости
npm run build           # dist/ai-css-kit.css + 58 модульных CSS + 5 тем
npm run lint:coupling    # проверка coupling-нарушений
npm run lint:atomic-level # порядок импортов слоёв
```

Все скрипты сборки — ESM (`.mjs`).

## Документация

- Начать быстро и понять границы проекта — [START_HERE.md](START_HERE.md)
- Подробные примеры, состояния и токены — [SPEC.md](SPEC.md)
- Темизация, CLI-маппер и формат JSON — [theming.md](theming.md)
- **CLI** — [cli.md](cli.md)
- Живые примеры компонентов и playground — `src/demos/*.html`, `src/demos/shared/*`, `src/demos/schemas/*`
- Архитектурные решения — [adr/README.md](../../adr/README.md)
- Дорожная карта проекта — [MASTER_PLAN.md](MASTER_PLAN.md)
- Глоссарий терминов — [../glossary.md](../../glossary.md)

## Лицензия

MIT — можно использовать в коммерческих и open-source проектах.
