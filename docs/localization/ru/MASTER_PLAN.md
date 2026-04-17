# AI CSS Kit — Master Plan (Дорожная карта)

> **Язык:** Русский | [English](../en/MASTER_PLAN.md)

> **Концепция:** "Deterministic UI Lego"  
> **Цель:** CSS-фреймворк, оптимизированный для генерации интерфейсов AI-агентами  
> **Автор:** vadimjoy | **Лицензия:** MIT | **Версия плана:** 1.2 (2026-04-18)

---

## Контекст и отправная точка

Текущее состояние кита (v0.3.1):

- 15 компонентов, Pure CSS, design tokens на `--ui-*` переменных
- Компоненты **слиплись**: `datepicker` и `autocomplete` мутируют `.ui-input` через parent-selector
- Нет машиночитаемого контекста для AI-агентов
- Нет CLI, нет автоматических визуальных тестов
- Темизация работает только через ручной оверрайд переменных

Конкретные примеры coupling-проблем, выявленных в коде:

```css
/* datepicker.css:15 — нарушение автономности Input */
.ui-datepicker__input-wrapper .ui-input { padding-right: 40px; }

/* autocomplete.css:15 — то же самое */
.ui-autocomplete__input-wrapper .ui-input { padding-left: 36px; }
```

AI-агент, генерируя `ui-datepicker`, не может предсказать, что тот тихо изменит padding у `ui-input`. Это и есть проблема недетерминизма.

---

## Принципы "Deterministic UI Lego"

1. **Изоляция** — компонент не влияет на стили другого компонента извне
2. **Предсказуемость** — одна комбинация классов = один и только один визуальный результат
3. **Машиночитаемость** — каждый токен и компонент описан в форме, которую AI понимает без интерпретации
4. **Composability** — любые N компонентов можно собрать вместе без конфликтов
5. **Reversibility** — любое решение задокументировано в ADR и может быть пересмотрено

---

## Фаза 1 — Архитектурная декомпозиция (The Decoupling)

**Горизонт:** v0.4.0  
**Трудозатраты:** ~2–3 недели

### Что делаем

#### 1.1 Аудит coupling-зависимостей

Провести полный аудит всех случаев, когда компонент-контейнер переопределяет стили дочернего компонента через parent-selector:

| Место | Проблема |
|-------|----------|
| `datepicker.css:15` | `.ui-datepicker__input-wrapper .ui-input` мутирует padding |
| `autocomplete.css:15` | `.ui-autocomplete__input-wrapper .ui-input` мутирует padding |
| Любые будущие случаи | Запрещены стандартом |

#### 1.2 Стандарт модификаторов контекста (Context Modifier Pattern)

Вместо мутации дочернего компонента вводим **явный модификатор** на самом компоненте:

```css
/* БЫЛО (нарушение) */
.ui-datepicker__input-wrapper .ui-input {
  padding-right: 40px;
}

/* СТАЛО (стандарт) */
.ui-input--icon-right {
  padding-right: 40px;
}
```

#### 1.3 Стандарт независимых модулей

Каждый компонент должен соответствовать **Module Contract**:

```
MODULE CONTRACT для компонента X:
  ✓ Все состояния управляются собственными классами (--modifier)
  ✓ Компонент не имеет CSS-правил, затрагивающих чужие классы
  ✓ Компонент не зависит от order of CSS imports
  ✓ Компонент работает вне .ui-field обёртки (если применимо)
  ✓ Компонент задокументирован в SPEC.md с полным HTML-контрактом
```

#### 1.4 Декомпозиция Input

| Новый класс | Что делает | Откуда взят |
|-------------|------------|-------------|
| `.ui-input--icon-left` | `padding-left: 36px` | из `.ui-input-wrapper .ui-input` |
| `.ui-input--icon-right` | `padding-right: 40px` | из `.ui-datepicker__input-wrapper .ui-input` |
| `.ui-input--readonly` | cursor: pointer, no outline | новый |

#### 1.5 Декомпозиция Calendar (Datepicker)

```
ui-datepicker            ← Orchestrator (только position: relative)
  ui-datepicker__trigger ← Обёртка триггера (flex, align-items)
  ui-input + .ui-input--icon-right ← Атом Input (без мутации)
  ui-datepicker__icon    ← Атом Icon (position: absolute)
  ui-datepicker__panel   ← Панель (бывший __calendar)
    ui-calendar          ← Независимый компонент Calendar Grid
```

### Критерий успеха Фазы 1

- [x] Ни один компонентный CSS-файл не содержит правил, таргетирующих классы других компонентов *(lint:coupling, 2026-04-02)*
- [x] Аудит-скрипт (Node.js) прогоняется в CI и падает при нарушении *(scripts/audit-coupling.js + npm run lint:coupling)*
- [x] `ui-input` имеет полный набор явных модификаторов для всех контекстов *(--icon-left/right/search/readonly)*
- [x] `ui-datepicker` и `ui-autocomplete` обновлены по новому стандарту *(больше нет parent-selector мутаций)*
- [x] Обновлён `SPEC.md` с новыми HTML-контрактами *(input, autocomplete, datepicker, card)*

---

## Фаза 2 — Стандартизация AI-контекста

**Горизонт:** v0.5.0  
**Трудозатраты:** ~1–2 недели

### Что делаем

#### 2.1 AI_CONTEXT.md

Машиночитаемый документ, который AI-агент загружает как системный промпт перед генерацией вёрстки.

#### 2.2 Система ADR (Architectural Decision Records)

Каждое архитектурное решение фиксируется в `docs/adr/NNNN-title.md` (англоязычный канонический файл).

#### 2.3 Стандарт нейминга `--ai-[component]-[prop]`

Двухуровневая система переменных:

```css
/* Уровень 1: Global Tokens (без изменений, обратная совместимость) */
:root {
  --ui-color-primary: #4f46e5;
  --ui-radius-md: 8px;
}

/* Уровень 2: Component Tokens (новые, переопределяют global) */
:root {
  --ai-button-bg:           var(--ui-color-primary);
  --ai-button-bg-hover:     var(--ui-color-primary-hover);
  --ai-button-radius:       var(--ui-radius-md);
  --ai-input-border:        var(--ui-color-border);
  --ai-input-border-focus:  var(--ui-color-border-focus);
  --ai-calendar-day-size:   32px;
  --ai-calendar-selected-bg: var(--ui-color-primary);
}
```

### Критерий успеха Фазы 2

- [x] `AI_CONTEXT.md` создан и поддерживается в актуальном состоянии *(v0.5.0, полный Token Reference --ai-*, 2026-04-04)*
- [x] `docs/adr/` содержит минимум 3 ADR (0001–0003)
- [x] Все компоненты имеют `--ai-[component]-*` токены *(все 15 компонентов обновлены)*
- [x] `--ui-*` токены сохранены как алиасы (breaking changes = 0)
- [x] `docs/adr/README.md` с индексом решений

---

## Фаза 3 — Темизация и дизайн-токены

**Горизонт:** v0.6.0  
**Трудозатраты:** ~2–3 недели

### Что делаем

#### 3.1 Формат внешних тем

```json
{
  "meta": {
    "name": "Midnight Pro",
    "version": "1.0.0",
    "author": "designer@example.com"
  },
  "tokens": {
    "color.primary":     "#6d28d9",
    "color.primary.hover": "#5b21b6",
    "radius.md":         "12px",
    "font.family":       "JetBrains Mono, monospace"
  }
}
```

#### 3.2 Theme Mapper

```bash
npx ai-css-kit theme-map ./my-theme.json -o ./dist/themes/midnight-pro.css
```

#### 3.3 Маппинг сторонних систем

| Источник | Статус | Формат |
|----------|--------|--------|
| W3C Design Tokens Format | v0.6.0 | JSON (`$value`, `$type`) |
| Figma Tokens Plugin | v0.6.0 | JSON (`value`, `type`) |
| Tailwind config | v0.7.0 | JS/JSON `theme.extend.*` |
| Style Dictionary | v0.7.0 | JSON properties |

#### 3.4 Встроенные пресеты тем

```
dist/themes/
  default.css      ← текущая light theme
  dark.css         ← текущая dark theme
  midnight.css     ← новая: deep dark с purple accent
  corporate.css    ← новая: neutral серый, sans-serif
  warm.css         ← новая: warm tones, rounded
```

#### 3.5 CSS `@layer` для приоритетов

```css
@layer ai-kit.tokens, ai-kit.base, ai-kit.components, ai-kit.themes;
```

### Критерий успеха Фазы 3

- [x] `scripts/theme-map.js` работает и покрыт тестами *(28 unit-тестов, 2026-04-07)*
- [x] Поддержаны форматы W3C Design Tokens и Figma Tokens
- [x] Минимум 3 встроенных пресета тем *(5 пресетов: default, dark, midnight, corporate, warm)*
- [x] `@layer` внедрён для всех компонентных стилей
- [x] Документация с примерами в `docs/theming.md`

---

## Трек масштабируемости

> **Документ плана:** [`docs/plans/SCALABILITY_PLAN.md`](../../plans/SCALABILITY_PLAN.md)  
> **Руководство контрибьютора:** [`docs/guides/scalability.md`](../../guides/scalability.md)  
> **Аудит фаз 1–3:** [`docs/audit/scalability-audit-phases-1-3.md`](../../audit/scalability-audit-phases-1-3.md)

План масштабируемости выполняется **параллельно** с фазами 4–5. Его **восемь** треков закрывают технический долг фаз 1–3 и закладывают фундамент для расширения до 50+ компонентов, сеточной системы, новых дизайн-концептов и масштабируемого CLI. Треки должны быть запущены на следующих границах фаз:

| Граница фазы | Версия | Запускаемые треки |
|--------------|--------|-------------------|
| До реализации Фазы 4 | v0.7.0 | **A** (Фундаментальные исправления), **B** (Модуляризация токенов), **F** (CI-автоматизация) |
| **Фаза 6 — Консолидация кита** | **v0.7.x** | **G** (атомарный передел, удаление дублей, визуальная чистка) — *блокер завершения Фазы 4* |
| **Фаза 7 — Интерактивные демо** | **v0.8.0-pre** | **H** (schema-driven playground: превью + контролы + код + токены) — *блокер завершения Фазы 4* |
| В ходе сборки CLI (Фаза 4) | v0.8.0 | **E** (Масштабируемость CLI: плагин-резолвер, реестр правил, нарезка контекста) |
| Фаза 4.3 — расширение компонентов | v0.8.x | **C-1** (Сетка), **C-2** (новые форм-компоненты), **C-4** (скрипт скаффолдинга) |
| Фаза 5 — экосистема | v0.9.0 | **C-3** (компоненты отображения), **D-1** (режимы плотности), **D-2** (адаптивные токены), **D-3** (мультибренд), **D-4** (токены анимации) |

> Каждый новый компонент или токен, добавляемый после Фазы 4, должен соответствовать чеклисту в `docs/guides/scalability.md`.  
> Фазы 6 и 7 (Треки G и H) выполняются **последовательно перед завершением Фазы 4** — CLI-агент не может быть сдан end-to-end, пока компонентная поверхность не консолидирована и демо не переведены на schema-driven playground.

---

## Фаза 6 — Консолидация кита и визуальная чистка

**Горизонт:** v0.7.x (между подготовкой масштабируемости и завершением CLI)  
**Трудозатраты:** ~2–3 недели  
**Полный план:** [`docs/plans/PHASE_6_KIT_CONSOLIDATION.md`](../../plans/PHASE_6_KIT_CONSOLIDATION.md)  
**Трек масштабируемости:** G

### Контекст

В ходе v0.6.x набор вырос с 15 до 54 компонентов без консолидирующего прохода. Кит стал выглядеть «не солидно» (разные радиусы, тени, шрифты в темах), накопились дубли на уровне атомов (circle-icon у `feature-item`, `chat`, `notification`, `stat-card`, `feed`), `feed` и `timeline` реализуют одинаковую ленту активности двумя разными способами, а `banner` / `callout` / `alert` — три почти одинаковых варианта уведомления. Демо страдают от 258 inline-стилей и пяти тем-экспериментов с кривой типографикой.

### Что делаем

#### 6.1 Атомарный аудит и ре-расслоение

Классифицировать все 54 компонента по уровням **Foundations / Atoms / Molecules / Organisms**. Перенести `typography`, `color-swatch`, `icon` в `src/css/foundations/`. Переупорядочить импорты в `src/css/index.css` по атомарным уровням с комментариями-разделителями.

#### 6.2 Выделение общих атомов `icon-tile` и `dot`

Создать `src/css/components/icon-tile.css` (круглая/квадратная цветная плитка под иконку — используется в `feature-item`, `chat`, `notification`, `stat-card`, `feed`) и `src/css/components/dot.css` (точка статуса/уведомления). Удалить дублирующие `__icon--primary/success/warning/error/dark` из пяти файлов. Зарегистрировать оба атома в `AI_CONTEXT.md` и `COMPONENT_PREFIXES`.

#### 6.3 Слияние `feed` + `timeline` → `timeline`

Оба компонента рендерят вертикальную ленту с иконкой и соединительной линией. Оставляем более богатый API под `ui-timeline`, `ui-feed` превращаем в deprecated-stub, дублирующий CSS удаляем.

#### 6.4 Слияние `banner` + `callout` → модификаторы `alert`

Три семейства схлопываются в `ui-alert` с модификаторами `--banner` (во всю ширину, без скруглений) и `--callout` (с рамкой, панель). Демо и `AI_CONTEXT.md` обновляются.

#### 6.5 Визуальная чистка «циганщины»

- Убрать Verdana из `src/themes/warm.json`
- Убрать принудительный monospace из `src/themes/midnight.json`
- Удалить модификатор `feature-item__icon--dark` (замещается `icon-tile`)
- Унифицировать радиусы и тени через токены (никаких магических литералов в компонентных файлах)

#### 6.6 Module Contract v2

Расширить `audit-coupling.js` двумя новыми линтами:
- `lint:inline-styles` — запрещает `style=""` в `src/demos/**/*.html` (сейчас 258 нарушений)
- `lint:atomic-imports` — запрещает молекуле/организму импортировать другую молекулу; upstream разрешены только атомы и foundations

Зафиксировать как поправку к ADR-0001 (Module Contract v2).

#### 6.7 Удаление inline-стилей из демо

Все 258 inline-`style` заменяются утилитами `u-stack`, `u-grid`, `u-cluster` (добавив недостающие в `src/css/utilities/`). Обязательное условие для Фазы 7 — playground строится на чистой разметке демо.

### Критерий успеха Фазы 6

- [ ] Количество компонентов сокращено с 54 → ~50 (3 слияния, 3 удаления, 2 новых атома, остальные переименованы / переразложены по уровням)
- [ ] Директория `src/css/foundations/` с `typography`, `color-swatch`, `icon`
- [ ] `icon-tile` и `dot` используются не менее чем в 4 компонентах каждый
- [ ] `feed` удалён (оставлен только stub), активити-стрим — только `timeline`
- [ ] `alert` с модификаторами `--banner` / `--callout`; старые файлы удалены
- [ ] `warm.json` и `midnight.json` не навязывают несистемные шрифты
- [ ] `feature-item__icon--dark` удалён
- [ ] `npm run lint:inline-styles` зелёный (0 inline-стилей в демо)
- [ ] `npm run lint:atomic-imports` зелёный
- [ ] `AI_CONTEXT.md` Component Registry обновлён
- [ ] ADR-0001 дополнен Module Contract v2

---

## Фаза 7 — Интерактивные демо (Playground)

**Горизонт:** v0.8.0-pre (после Фазы 6, до завершения CLI)  
**Трудозатраты:** ~2–3 недели  
**Полный план:** [`docs/plans/PHASE_7_DEMO_PLAYGROUND.md`](../../plans/PHASE_7_DEMO_PLAYGROUND.md)  
**Трек масштабируемости:** H

### Контекст

29 текущих статических HTML-демо не позволяют проверить размеры, состояния и токены без ручного редактирования разметки. AI-агент, который валидирует свой вывод против кита, также не имеет интерактивного эталона. Нужен **schema-driven playground**: тонкий Vanilla JS-хост (≤ 12 KB gzip), который по JSON-схеме на компонент рендерит четыре панели — Preview / Controls / Code / Tokens.

### Что делаем

#### 7.1 Каркас playground

`src/demos/playground/` с четырьмя панелями:
- **Preview** — живой рендер компонента в iframe для изоляции
- **Controls** — сегменты, селекты, range, text, toggle, color — всё генерируется из схемы
- **Code** — сгенерированная HTML-разметка с кнопкой «Copy»
- **Tokens** — живые значения `--ai-*` токенов с инлайн-оверрайдами

Без фреймворков. ES-модули, без бандлера.

#### 7.2 Формат схемы и биндинги

```json
{
  "component": "button",
  "template": "<button class=\"ui-button {variant} {size}\" {disabled}>{label}</button>",
  "controls": [
    { "type": "segmented", "key": "variant", "bindsClass": true,
      "options": ["ui-button--primary","ui-button--secondary","ui-button--ghost"] },
    { "type": "segmented", "key": "size", "bindsClass": true,
      "options": ["ui-button--sm","ui-button--md","ui-button--lg"] },
    { "type": "text",      "key": "label",    "bindsText": true  },
    { "type": "toggle",    "key": "disabled", "bindsAttr": "disabled" }
  ],
  "tokens": ["--ai-button-bg","--ai-button-radius","--ai-button-font-size"]
}
```

Типы биндингов: `bindsClass`, `bindsVar`, `bindsAttr`, `bindsText`, `bindsRepeat`.

#### 7.3 Библиотека схем

По одной схеме на консолидированный компонент (~50 файлов) в `src/demos/playground/schemas/`. Каждый старый демо-HTML сжимается до ≤ 25 строк (маунт playground + `<script data-schema="button.json">`).

#### 7.4 Глобальные контролы: тема / плотность / RTL / viewport

Над конкретной схемой:
- Переключатель темы (5 пресетов)
- Режим плотности (подготовка под D-1)
- RTL-зеркало
- Viewport-пресеты (mobile / tablet / desktop)

#### 7.5 Экспорт и обмен

- «Copy HTML» → буфер
- «Copy token overrides» → буфер (только изменённые токены)
- «Export JSON state» → скачивается файл, обратимый (позволяет восстановить состояние playground) — одновременно служит форматом передачи в CLI (`ai-css-kit generate --from-playground ./state.json`)

#### 7.6 Интеграция с валидатором CLI

Валидатор из Трека E-2 подключается к панели «Code»: при каждом изменении вызывается `validate(html)` и инлайн выводятся предупреждения. AI-агент получает эталонный цикл обратной связи: что попадает в CLI, то проходит валидатор, что проходит валидатор — зелёное в playground.

### Критерий успеха Фазы 7

- [ ] Каркас playground (preview + controls + code + tokens) работает
- [ ] Schema loader + binding engine ≤ 12 KB gzip
- [ ] По одной схеме на каждый консолидированный компонент (~50 файлов)
- [ ] Старые `src/demos/*.html` заменены (или сжаты до ≤ 25 строк)
- [ ] Глобальные контролы (тема / плотность / RTL / viewport)
- [ ] «Copy HTML» и «Export JSON» работают
- [ ] Инлайн-валидация из Трека E-2
- [ ] 0 inline-стилей (контроль через `lint:inline-styles` из Фазы 6)

---

## Фаза 4 — CLI-агент (The Orchestrator)

**Горизонт:** v0.8.0  
**Трудозатраты:** ~4–6 недель

> **Фаза 4.1 — Архитектура и API-дизайн** ✅ Завершена *(2026-04-09)*  
> Полная спецификация: [`docs/design/phase-4.1-cli-architecture.md`](../../design/phase-4.1-cli-architecture.md)

### Что делаем

#### 4.1 Архитектура CLI ✅

```
ai-css-kit generate "форма регистрации с email, паролем и кнопкой"
```

Внутренний pipeline агента:

```
[Natural Language Input]
         ↓
[Intent Parser]         ← LLM call (OpenAI/Anthropic/local)
         ↓
[Component Resolver]    ← матчит намерения → компоненты кита
         ↓
[Layout Composer]       ← собирает HTML из атомов по правилам Фазы 1
         ↓
[Validator]             ← проверяет сгенерированный HTML против Module Contract
         ↓
[Output: HTML + CSS overrides]
```

Полная структура модулей, все контракты данных (`ComponentSpec`, `ParsedIntent`, `ResolvedAtom`, `ComposedLayout`, `ValidationReport`), слой абстракции провайдеров (`OpenAI`, `Anthropic`, `Ollama`, `OpenAI-compatible`, пользовательский `registerProvider()`), а также UX-справочник CLI описаны в [`docs/design/phase-4.1-cli-architecture.md`](../../design/phase-4.1-cli-architecture.md).

#### 4.2 Intent Parser

Переводит свободный текст в структурированный объект `ParsedIntent` через вызов LLM. Граница LLM изолирована — 3 из 4 стадий pipeline полностью детерминированы и покрываются unit-тестами без LLM.

#### 4.3 Component Resolver

Чистый детерминированный модуль (без LLM). Принимает структурированный запрос и возвращает правильный HTML. Использует `AI_CONTEXT.md` как единственный источник истины. Реализован как директория плагинов на компонент (`cli/src/pipeline/resolvers/`) согласно треку E-1 плана масштабируемости.

#### 4.4 Validator

Проверяет сгенерированный HTML на соответствие Module Contract. Реализован как реестр правил (трек E-2) — новые правила для компонентов добавляются без изменения ядра:

```bash
ai-css-kit validate ./output.html
# ✓ Все компоненты используют допустимые комбинации классов
# ✓ Устаревшие паттерны parent-selector не обнаружены
# ✓ Все обязательные ARIA-атрибуты присутствуют
# ✗ WARNING: .ui-input не обёрнут в .ui-field
```

#### 4.5 Режимы CLI

```bash
ai-css-kit generate "кнопка primary large"
ai-css-kit generate --spec ./task.md
ai-css-kit generate "dashboard card" --theme midnight
ai-css-kit validate ./src/page.html
```

### Критерий успеха Фазы 4

- [x] Архитектура CLI спроектирована и полностью специфицирована *(`docs/design/phase-4.1-cli-architecture.md`, 2026-04-09)*
- [x] Слой абстракции провайдеров спроектирован *(OpenAI, Anthropic, Ollama, OpenAI-compatible, `registerProvider()`)*
- [x] Все контракты данных определены *(ComponentSpec, ParsedIntent, ResolvedAtom, ComposedLayout, ValidationReport)*
- [x] Треки A + B + F плана масштабируемости запланированы *(milestone v0.7.0)*
- [ ] **Фаза 6 завершена** — компонентная поверхность консолидирована (блокер)
- [ ] **Фаза 7 завершена** — schema-driven playground даёт эталонный цикл обратной связи (блокер)
- [ ] `npx ai-css-kit generate "..."` работает end-to-end
- [ ] Component Resolver покрыт 100% unit-тестами (без LLM)
- [ ] Validator обнаруживает все известные anti-patterns
- [ ] Поддержаны провайдеры: OpenAI, Anthropic, Ollama (local)
- [ ] Трек E плана масштабируемости реализован параллельно с CLI (плагин-резолвер, реестр правил, нарезка контекста)
- [ ] Документация в `docs/localization/ru/cli.md`

---

## Фаза 5 — Экосистема и валидация

**Горизонт:** v1.0.0  
**Трудозатраты:** ~3–4 недели

### Критерий успеха Фазы 5

- [ ] Visual regression тесты для всех 15 компонентов
- [ ] AI Accuracy Tests для 10 стандартных UI-паттернов
- [ ] CI pipeline: lint → build → unit → visual → ai-accuracy
- [ ] Публичный npm-пакет с версией 1.0.0
- [ ] Документационный сайт задеплоен

---

## Сводная таблица Roadmap

| Фаза | Версия | Ключевой результат | Приоритет |
|------|--------|-------------------|-----------|
| 1. Decoupling | v0.4.0 ✅ | Атомарные компоненты без coupling | Critical |
| 2. AI Context | v0.5.0 ✅ | AI_CONTEXT.md + ADR + `--ai-*` токены | Critical |
| 3. Theming | v0.6.0 ✅ | Theme Mapper + JSON-темы + @layer | High |
| **Подготовка масштабируемости** | **v0.7.0** | **Треки A + B + F** — фундаментальные исправления, модуляризация токенов, CI-автоматизация | **High** |
| **6. Kit Consolidation** | **v0.7.x** | **Трек G** — атомарный передел, удаление дублей (`feed`↔`timeline`, `banner`↔`callout`↔`alert`), выделение `icon-tile`/`dot`, визуальная чистка, Module Contract v2 — *блокер Фазы 4* | **Critical** |
| **7. Demo Playground** | **v0.8.0-pre** | **Трек H** — schema-driven playground (preview/controls/code/tokens), инлайн-валидатор, экспорт состояния — *блокер Фазы 4* | **Critical** |
| 4. CLI Agent | v0.8.0 | `npx ai-css-kit generate` + Треки C-1/C-2/E (сетка, новые компоненты, масштабируемость CLI) | High |
| 5. Ecosystem | v1.0.0 | Visual tests + AI accuracy + Треки C-3 + D (компоненты отображения, плотность, адаптивность, мультибренд) | Medium |

> **Порядок выполнения:** Фазы 6 и 7 выполняются **последовательно между подготовкой масштабируемости (v0.7.0) и релизом CLI (v0.8.0)**. Завершающие критерии Фазы 4 (`generate` end-to-end, 100% юнит-тестов резолвера, покрытие anti-patterns валидатором, поддержка провайдеров) не могут быть закрыты, пока не сданы Фазы 6 и 7, поскольку они определяют ту компонентную поверхность, против которой работает CLI.

> **План масштабируемости:** [`docs/plans/SCALABILITY_PLAN.md`](../../plans/SCALABILITY_PLAN.md) — полная разбивка задач с оценками трудозатрат, интегрированная в дорожную карту выше.  
> **Фаза 6:** [`docs/plans/PHASE_6_KIT_CONSOLIDATION.md`](../../plans/PHASE_6_KIT_CONSOLIDATION.md)  
> **Фаза 7:** [`docs/plans/PHASE_7_DEMO_PLAYGROUND.md`](../../plans/PHASE_7_DEMO_PLAYGROUND.md)

---

*Этот документ является живым артефактом. Обновляется при каждом завершении фазы.*
