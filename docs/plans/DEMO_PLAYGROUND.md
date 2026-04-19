# Demo Playground (интерактивные демо)

> ⚠️ **Актуализация плана (2026-04-17):** в MASTER_PLAN эта работа учтена как **подфаза 4.3 «Demo Playground»**, следующая за подфазой 4.2 (Kit Consolidation) и предшествующая трекам A/B/F. Имя файла `DEMO_PLAYGROUND.md` оставлено без изменений, чтобы не ломать ссылки. Все задачи, схемы и критерии действительны; перенумерована только позиция в MASTER_PLAN и SCALABILITY_PLAN — с «Phase 7» на «подфазу 4.3». Полная дорожная карта: [`MASTER_PLAN`](../localization/ru/MASTER_PLAN.md).

> **Горизонт:** v0.8.0-pre (после подфазы 4.2; **блокер** для подфаз 4.4–4.7 CLI)
> **Статус:** в работе — промежуточный этап **2026-04-19** зафиксирован в [`MASTER_PLAN`](../localization/ru/MASTER_PLAN.md) (CI: `lint:atomic-level`, правка `audit-inline-styles`, мелкие фиксы компонентов); каркас playground и библиотека схем — ещё впереди.
> **Связано с:** [`KIT_CONSOLIDATION`](./KIT_CONSOLIDATION.md) · [`MASTER_PLAN`](../localization/ru/MASTER_PLAN.md)

---

## 1. Проблема

Текущие демо (`src/demos/*.html`) — **статичные витрины**. Для каждого компонента в HTML вручную сгенерированы 4–8 вариаций (sm/md/lg × primary/secondary/…). Это:

- раздувает HTML (`button.html` — 60 строк на 9 состояний, `datepicker.html` — 500+),
- не даёт пользователю **«пощупать»** компонент: нельзя тут же покрутить radius, поменять размер, увидеть как реагирует на длинный текст,
- не демонстрирует главный козырь кита — **управление через `--ai-*` токены**,
- не показывает AI-агенту, какие токены реально влияют на компонент (он видит готовый HTML, но не карту «переменная → эффект»),
- ломает «one-truth» подход: для каждого нового варианта копипастится новый `<div>` вместо одного управляемого.

Пользователь просит: **«гибко управлять размерами и изменяемыми значениями»**.

---

## 2. Цель фазы

Превратить каждое демо в **playground**: превью-зона + управляющие элементы. Управление идёт через тот же кит (dogfooding: playground использует `ui-field`, `ui-slider`, `ui-select`, `ui-toggle`, `ui-chip` для своих контролов).

Пользователь и AI-агент видят:
- как выглядит компонент **сейчас** (превью),
- какие **параметры** он принимает (контролы),
- какой **HTML** это даёт (code panel — generated live),
- какие **`--ai-*` токены** меняются (vars panel).

---

## 3. Архитектура playground

### 3.1 Структура страницы демо

```
┌─────────────────────────────────────────────────────┐
│  <header>  Component Name · Atom/Molecule/Organism  │
├──────────────────────────────┬──────────────────────┤
│                              │  Controls            │
│         Preview              │  ┌────────────────┐  │
│      (live component)        │  │ Size   [sm/md/ │  │
│                              │  │         lg]    │  │
│  ┌────────────────────────┐  │  │                │  │
│  │   <rendered component> │  │  │ Variant [..][..]│  │
│  │                        │  │  │                │  │
│  └────────────────────────┘  │  │ Radius ▮▯▯▯ 8px│  │
│                              │  │                │  │
│                              │  │ Label  [Click…]│  │
│                              │  │                │  │
│                              │  │ Disabled  [ ◎ ]│  │
│                              │  └────────────────┘  │
│                              │                      │
│                              │  Tokens (live)       │
│                              │  --ai-button-bg:     │
│                              │    var(--ui-…)       │
│                              │  --ai-button-radius: │
│                              │    8px               │
├──────────────────────────────┴──────────────────────┤
│  HTML (copy)                                        │
│  <button class="ui-button ui-button--primary        │
│           ui-button--md">Click me</button>          │
└─────────────────────────────────────────────────────┘
```

Playground целиком помещается в один iframe (как сейчас) — `index.html` просто вырастает визуально.

### 3.2 Механика связывания

Одна и та же **схема параметров** (JSON) управляет тремя вещами:
1. Рендеринг контролов (какие слайдеры/селекты показать).
2. Применение `style.setProperty('--ai-…', value)` на preview-root.
3. Генерация HTML-строки в code panel.

```js
// схема для button.html
{
  component: 'button',
  atomicLevel: 'atom',
  controls: {
    size:     { type: 'segmented', options: ['sm','md','lg'], default: 'md', bindsClass: 'ui-button--{value}' },
    variant:  { type: 'segmented', options: ['primary','secondary','ghost'], default: 'primary', bindsClass: 'ui-button--{value}' },
    label:    { type: 'text', default: 'Click me', bindsText: true },
    disabled: { type: 'toggle', default: false, bindsAttr: 'disabled' },
    radius:   { type: 'range', min: 0, max: 24, default: 8, unit: 'px', bindsVar: '--ai-button-radius' },
    fontSize: { type: 'range', min: 11, max: 20, default: 14, unit: 'px', bindsVar: '--ai-button-font-size' },
  },
  tokens: ['--ai-button-bg','--ai-button-radius','--ai-button-font-size','--ai-button-color']
}
```

Схемы хранятся в `src/demos/schemas/*.js`. Рендерер — универсальный, в `src/demos/shared/playground.js`.

### 3.3 Демо-HTML после рефакторинга

```html
<!-- src/demos/button.html -->
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Button — AI CSS Kit</title>
  <link rel="stylesheet" href="../css/index.css">
  <link rel="stylesheet" href="./shared/demo-page.css">
  <link rel="stylesheet" href="./shared/playground.css">
</head>
<body class="demo-page">
  <main class="ui-playground"
        data-component="button"
        data-schema="./schemas/button.js"></main>
  <script type="module" src="./shared/playground.js"></script>
  <script src="./shared/demo-theme.js"></script>
</body>
</html>
```

**HTML демо сжимается** с 60–500 строк до 15. Все вариации генерятся рантайм из схемы.

---

## 4. Типы контролов

Универсальный компонент `ui-playground-control` поддерживает 6 типов. Реализация — через существующие атомы кита:

| Тип | Виджет | Базовый компонент кита | Пример |
|---|---|---|---|
| `segmented` | Группа кнопок-переключателей | `ui-chip` (с aria-pressed) | size: [sm] [md] [lg] |
| `select` | Выпадающий список | `ui-select` | icon: [fa-star ▾] |
| `range` | Слайдер + число | `ui-slider` + `ui-input` | radius: ▯▯▮▯▯▯ 8px |
| `text` | Текстовое поле | `ui-input` | label: [Click me] |
| `toggle` | Чекбокс/свитч | `ui-toggle` | disabled: ☐ |
| `color` | Swatch picker + input | `ui-swatch-group` + `ui-input` | bg: #4f46e5 |

**Важно:** контролы — это **дожирование собственных компонентов**. Каждый playground-контрол пользуется тем же API, которое кит предлагает внешним проектам. Если в ките что-то некрасиво — это сразу видно.

---

## 5. Биндинги (parameter → preview)

Схема контрола указывает **один из 5 биндингов**:

### 5.1 `bindsClass` — добавление/замена класса

```js
size: { type: 'segmented', options: ['sm','md','lg'], bindsClass: 'ui-button--{value}' }
// выбрали md → preview-root.classList = 'ui-button ui-button--md'
```

### 5.2 `bindsVar` — оверрайд CSS-переменной

```js
radius: { type: 'range', bindsVar: '--ai-button-radius', unit: 'px' }
// значение 12 → preview-root.style.setProperty('--ai-button-radius', '12px')
```

Это — **главная демо-ценность кита.** Пользователь видит, как одна переменная перекрашивает всё.

### 5.3 `bindsAttr` — HTML-атрибут

```js
disabled: { type: 'toggle', bindsAttr: 'disabled' }
```

### 5.4 `bindsText` — текстовое содержимое

```js
label: { type: 'text', bindsText: true, target: '.ui-button__label' }
```

### 5.5 `bindsRepeat` — повторение элемента (для списков)

```js
itemCount: { type: 'range', min: 1, max: 10, bindsRepeat: { template: '.ui-feed__item', target: '.ui-feed' } }
```

Нужен для `feed`, `timeline`, `steps`, `pricing-card`, `chart-legend`.

---

## 6. Code panel (live HTML)

Снизу playground-страницы — панель с сгенерированным HTML:

```
┌─ HTML ─────────────────────────── [copy] ─┐
│ <button class="ui-button ui-button--md    │
│         ui-button--primary"               │
│         style="--ai-button-radius:12px">  │
│   Click me                                │
│ </button>                                 │
└───────────────────────────────────────────┘
```

Генерация: из текущего состояния схемы → HTML-строка + форматирование через prettier (опционально, инлайн реализация под 50 строк).

Кнопка **copy** копирует HTML в буфер. Это превращает playground в **код-генератор** — прямой поставщик HTML для AI-агента и разработчика.

---

## 7. Tokens panel

Сбоку или под preview:

```
┌─ Active tokens ──────────┐
│ --ai-button-radius: 12px │  ← изменено (жирным)
│ --ai-button-bg:     var(─ui-color-primary)
│ --ai-button-color:  #fff │
└──────────────────────────┘
```

Работает как визуальный контракт: видно, какие токены отвечают за текущий вид. Список берётся из `schemas/*.js` (поле `tokens`) + автоматически подтягивается из `AI_CONTEXT.md` (связь через `--ai-[component]-*` нейминг).

---

## 8. Layout уровня страницы

`src/demos/shared/playground.css` определяет сетку:

```css
.ui-playground {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  grid-template-areas:
    "preview  controls"
    "code     tokens";
  gap: var(--ui-space-6);
}

.ui-playground__preview  { grid-area: preview;  min-height: 320px; }
.ui-playground__controls { grid-area: controls; }
.ui-playground__code     { grid-area: code; }
.ui-playground__tokens   { grid-area: tokens; }

@media (max-width: 860px) {
  .ui-playground {
    grid-template-columns: 1fr;
    grid-template-areas:
      "preview"
      "controls"
      "tokens"
      "code";
  }
}
```

Внутри `iframe` в `index.html` playground выглядит пропорционально (iframe minimum 480px).

---

## 9. Дефолтное превью (без контролов)

Чтобы `index.html` — витрина — не превращался в лес слайдеров, у playground есть режим `minimal`:

```html
<main class="ui-playground ui-playground--minimal" data-component="button">...</main>
```

В этом режиме рендерится **только preview** со значениями defaults. Controls и code panel появляются, когда пользователь открывает демо в отдельном табе (`?mode=full`) или разворачивает `<details>` «Settings».

`index.html` остаётся быстрым обзорным мозаиком; клик на заголовок компонента открывает playground `?mode=full`.

---

## 10. Дополнительные фичи (часть 2)

### 10.1 Theme preview в playground

Подпанель «Theme» — 5 чипсов (default/dark/midnight/corporate/warm). Меняет `data-theme` на preview-root, не на всей странице. Это **изолированный превью** — удобно сравнивать тему без перезагрузки всего демо.

### 10.2 Density / compact mode

Глобальный тумблер «density: comfortable | compact» — изменяет `--ui-space-*` на preview-root (`.ui-density--compact { --ui-space-4: 12px; … }`).

Подключается к треку **D-1 Density modes** плана масштабируемости.

### 10.3 RTL-превью

Кнопка RTL переключает `dir="rtl"` на preview-root. Важно для chat, breadcrumb, timeline.

### 10.4 Responsive preview

Ручка ширины превью: 360 / 768 / 1280 px — перетаскивает `max-width` preview-контейнера. Проверка адаптива без DevTools.

### 10.5 Export: JSON-пресет

Кнопка **Save preset** → выгружает текущую комбинацию контролов как JSON:

```json
{
  "component": "button",
  "state": { "size":"lg", "variant":"ghost", "radius":12 },
  "generatedAt": "2026-04-18T…"
}
```

JSON-пресеты могут быть загружены в `npx ai-css-kit generate --preset ./my-button.json` — переиспользование в CLI (Фаза 4).

---

## 11. План работ (спринты)

### Sprint 7.1 — Скелет playground (2–3 дня)

1. Создать `src/demos/shared/playground.js` (рантайм-рендерер, ~300 строк).
2. Создать `src/demos/shared/playground.css` (сетка, панели).
3. Создать `src/demos/shared/playground-control.js` — универсальный компонент контрола (5–6 типов).
4. Создать директорию `src/demos/schemas/`, прописать формат схемы.
5. Пилотная миграция: `button.html` → playground. Сравнить с текущим.

### Sprint 7.2 — Атомы (2 дня)

Мигрировать атомы, где выигрыш максимален (1 превью → 50 состояний):
- button, input, textarea, select, checkbox, radio, toggle, slider, badge, tag, chip, avatar, progress, spinner, tooltip, skeleton, status/dot, icon-tile.

Каждый schema-файл — 20–40 строк.

### Sprint 7.3 — Молекулы (2–3 дня)

- autocomplete, search, file-upload, datepicker, breadcrumb, pagination, alert (с banner/quote-вариантами), empty-state, dropdown, rating, stat-card, card, notification, form-row, section-header.

### Sprint 7.4 — Организмы (3 дня)

Здесь нужен `bindsRepeat` и сложные схемы:
- accordion (кол-во панелей, multi/single), tabs, table (колонки/строки), steps (кол-во шагов, активный шаг), modal, sidebar (collapsed/expanded), navbar, timeline (compact/dated/milestone), chat (кол-во сообщений, typing on/off), chart-legend, logo-cloud, footer, pricing-card, feature-item.

### Sprint 7.5 — Foundations & Code panel (2 дня)

- Code panel (copy-HTML) с авто-форматированием.
- Tokens panel с подсветкой изменённых.
- Theme preview switcher внутри playground.
- Density / RTL / Responsive переключатели.

### Sprint 7.6 — Shiny showcase (1–2 дня)

- Обновить `index.html` — автогенерация секций из списка схем, единый размер iframe, без ручных `min-height`.
- Добавить `?mode=full` для полного playground.
- Добавить JSON-export пресета.
- Документация: `docs/guides/playground.md`.

---

## 12. Технические решения

### 12.1 Почему не React / Vue

Сейчас кит — Pure CSS. Playground не должен тащить фреймворк. Используем:
- **Vanilla JS + ES modules** (playground.js = 1 файл).
- **Нет сборки** — `<script type="module">` работает из коробки.
- **Шаблонизатор** — tagged template literals (`html\`<div>${x}</div>\``), никаких JSX.

Размер playground runtime: ≤ 8 KB минифицированного JS + ≤ 3 KB CSS.

### 12.2 Изоляция preview

Preview живёт в `div.ui-playground__preview` с классом-скопером. Все `--ai-*` переменные применяются к этому корню. Это не ломает остальную страницу (controls, code panel), потому что они в том же iframe, но в другом CSS-скоупе.

### 12.3 Fallback без JS

Если JS отключён — рендерим дефолтный HTML в `<noscript>`-превью. Это продиктовано политикой «демо показывает результат даже без скриптов».

### 12.4 Совместимость с iframe-showcase

`index.html` грузит каждое демо в iframe. Playground работает внутри iframe так же, как на отдельной странице. Высота iframe адаптируется через `ResizeObserver` + `postMessage('resize', height)` от playground к showcase.

---

## 13. Критерии успеха Фазы 7

- [ ] Создан `src/demos/shared/playground.{js,css}` — универсальный рантайм
- [ ] Схемы есть у всех 50 компонентов (`src/demos/schemas/*.js`)
- [ ] HTML каждого демо ≤ 25 строк
- [ ] Playground в `?mode=full` даёт code-panel с copy-to-clipboard
- [ ] Tokens panel показывает изменённые `--ai-*` с live-значениями
- [ ] Theme preview работает per-demo (не мешает глобальному)
- [ ] RTL / density / responsive переключатели работают
- [ ] `index.html` не имеет ручных `min-height` — iframe resize автоматический
- [ ] 0 инлайн-стилей в HTML (консистентно с Фазой 6.5)
- [ ] Playground runtime ≤ 12 KB gzipped
- [ ] JSON-пресеты экспортируются и читаются CLI (stub в Фазе 4)

---

## 14. Риски и компромиссы

| Риск | Митигация |
|---|---|
| Playground перегружает AI-контекст (больше JS) | Схемы + рантайм — это **вспомогательный** слой. `AI_CONTEXT.md` продолжает описывать **статичный HTML-контракт** компонента. Schema-JSON — дополнительный машиночитаемый слой (может попасть в AI_CONTEXT.md во 2-й версии) |
| Пользователи ожидают простой пример, не playground | Режим `minimal` в `index.html` оставляет краткое превью; `?mode=full` — полный playground |
| Разнообразие контролов → разный UX на страницах | Жёсткая типизация 6 типов; `playground-control.js` — один файл, одна реализация |
| Усложнение CI: надо проверять схемы | Добавляем `scripts/lint-schemas.js`: проверка, что каждому компоненту соответствует ровно одна схема, схема валидна по JSON Schema |

---

## 15. Интеграция с остальными фазами

- **Фаза 6 (consolidation)** должна завершиться хотя бы на 6.2 (icon-tile/dot), иначе схемы придётся переписывать.
- **Фаза 4 (CLI)** получает бонус: `schemas/*.js` — это **готовый Component Resolver**, механика «текст → HTML» сможет использовать схемы как источник истины для генерации вариантов.
- **Фаза 5 (visual regression)** становится проще: playground генерит фиксированные комбинации → снимаем скриншот → сравниваем.
- **Трек D-1 (Density)** плана масштабируемости — density-переключатель в playground.
- **Трек D-2 (Adaptive tokens)** — responsive-превью в playground.

---

## 16. Следующие шаги

1. ✅ Утвердить план (review by @vadimjoy)
2. → ADR-0008 «Demo playground: schema-driven interactive demos»
3. → Параллельно с Sprint 6.2: запустить Sprint 7.1 (скелет playground)
4. → После Sprint 6.3 (merged components): мигрировать демо на playground в батчах (7.2 → 7.3 → 7.4)

---

*Живой документ. Обновляется по завершении каждого спринта.*
