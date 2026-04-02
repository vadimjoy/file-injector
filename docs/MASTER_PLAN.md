# AI CSS Kit — Master Plan (Roadmap)

> **Концепция:** "Deterministic UI Lego"  
> **Цель:** CSS-фреймворк, оптимизированный для генерации интерфейсов AI-агентами  
> **Автор:** vadimjoy | **Лицензия:** MIT | **Версия плана:** 1.0 (2026-04)

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

## Phase 1 — Архитектурная декомпозиция (The Decoupling)

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

AI-агент теперь явно указывает модификатор в разметке:

```html
<!-- БЫЛО: скрытое поведение, агент не знает о мутации -->
<div class="ui-datepicker__input-wrapper">
  <input class="ui-input"> <!-- тихо получает padding-right: 40px -->
</div>

<!-- СТАЛО: явный контракт -->
<div class="ui-datepicker__input-wrapper">
  <input class="ui-input ui-input--icon-right"> <!-- намерение видно в классе -->
</div>
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

Input (`ui-input`) — базовый атом. Выделяем явные модификаторы:

| Новый класс | Что делает | Откуда взят |
|-------------|------------|-------------|
| `.ui-input--icon-left` | `padding-left: 36px` | из `.ui-input-wrapper .ui-input` |
| `.ui-input--icon-right` | `padding-right: 40px` | из `.ui-datepicker__input-wrapper .ui-input` |
| `.ui-input--readonly` | cursor: pointer, no outline | новый |

#### 1.5 Декомпозиция Calendar (Datepicker)

Datepicker разбивается на независимые слои:

```
ui-datepicker            ← Orchestrator (только position: relative)
  ui-datepicker__trigger ← Обёртка триггера (flex, align-items)
  ui-input + .ui-input--icon-right ← Атом Input (без мутации)
  ui-datepicker__icon    ← Атом Icon (position: absolute)
  ui-datepicker__panel   ← Панель (бывший __calendar)
    ui-calendar          ← Независимый компонент Calendar Grid
      ui-calendar__header
      ui-calendar__grid
      ui-calendar__day
```

`ui-calendar` должен быть переиспользуем в date-range-picker, time-picker и т.д. без переписывания.

### Зачем это нужно для AI

AI-агент строит верстку по атомарным правилам. Если компонент A тайно влияет на компонент B, агент либо:
- пропускает эффект (генерирует сломанную верстку),
- или вынужден «знать» о всех parent-selector связях (экспоненциально растущий контекст).

Детерминированные атомы с явными модификаторами — это **O(1) контекст** на компонент вместо **O(N²)**.

### Критерий успеха Phase 1

- [x] Ни один компонентный CSS-файл не содержит правил, таргетирующих классы других компонентов *(lint:coupling, 2026-04-02)*
- [x] Аудит-скрипт (Node.js) прогоняется в CI и падает при нарушении *(scripts/audit-coupling.js + npm run lint:coupling)*
- [x] `ui-input` имеет полный набор явных модификаторов для всех контекстов *(--icon-left/right/search/readonly)*
- [x] `ui-datepicker` и `ui-autocomplete` обновлены по новому стандарту *(больше нет parent-selector мутаций)*
- [x] Обновлён `SPEC.md` с новыми HTML-контрактами *(input, autocomplete, datepicker, card)*

---

## Phase 2 — Стандартизация AI-контекста

**Горизонт:** v0.5.0  
**Трудозатраты:** ~1–2 недели

### Что делаем

#### 2.1 AI_CONTEXT.md

Машиночитаемый документ, который AI-агент загружает как системный промпт перед генерацией верстки. Структура:

```markdown
# AI CSS Kit — Context for AI Agents

## Invariants (никогда не нарушаемые правила)
## Component Registry (полный список компонентов + их классы)
## Composition Rules (как комбинировать компоненты)
## Anti-patterns (что генерировать нельзя)
## Token Reference (все --ui-* переменные с семантикой)
```

#### 2.2 Система ADR (Architectural Decision Records)

Каждое архитектурное решение фиксируется в `docs/adr/NNNN-title.md`.

Формат ADR:

```markdown
# NNNN — Название решения
## Статус: [Proposed | Accepted | Deprecated | Superseded by NNNN]
## Контекст
## Решение
## Последствия
## Альтернативы, которые рассматривались
```

Индекс ADR ведётся в `docs/adr/README.md`.

Стартовый список:

| № | Название | Статус |
|---|----------|--------|
| 0001 | Atomic Decoupling — запрет parent-selector mutations | Accepted |
| 0002 | Context Modifier Pattern для иконок | Proposed |
| 0003 | Переход от `--ui-*` к `--ai-[component]-[prop]` (поэтапный) | Proposed |

#### 2.3 Стандарт нейминга `--ai-[component]-[prop]`

**Проблема:** Текущий `--ui-color-primary` не несёт информации о том, в каком компоненте он используется. AI-агент не может локально настроить только кнопку, не затронув все компоненты.

**Решение:** Двухуровневая система переменных:

```css
/* Уровень 1: Global Tokens (без изменений, обратная совместимость) */
:root {
  --ui-color-primary: #4f46e5;
  --ui-radius-md: 8px;
}

/* Уровень 2: Component Tokens (новые, переопределяют global) */
:root {
  /* Формат: --ai-[component]-[property] */
  --ai-button-bg:           var(--ui-color-primary);
  --ai-button-bg-hover:     var(--ui-color-primary-hover);
  --ai-button-radius:       var(--ui-radius-md);
  --ai-button-font-size:    var(--ui-font-size-md);

  --ai-input-border:        var(--ui-color-border);
  --ai-input-border-focus:  var(--ui-color-border-focus);
  --ai-input-radius:        var(--ui-radius-md);
  --ai-input-bg:            var(--ui-color-bg);

  --ai-calendar-day-size:   32px;
  --ai-calendar-selected-bg: var(--ui-color-primary);
}
```

Компонентные файлы используют `--ai-*` токены, которые по умолчанию ссылаются на глобальные:

```css
/* button.css */
.ui-button--primary {
  background: var(--ai-button-bg);      /* ← AI-токен */
  border-radius: var(--ai-button-radius); /* ← AI-токен */
}
```

AI-агент может тонко настроить один компонент без cascade-эффектов:

```css
/* Настройка только кнопки, ничего другого не ломается */
:root {
  --ai-button-bg: #10b981;
  --ai-button-radius: 24px;
}
```

**Миграция:** Поэтапная. `--ui-*` остаются как алиасы на уровне 1 для обратной совместимости.

### Зачем это нужно для AI

Без `AI_CONTEXT.md` агент «видит» HTML-контракты только через hallucination или через SPEC.md (слишком длинный для context window). Специализированный файл — это **system prompt для верстальщика**, который умещается в 2–4k токенов.

Переменные `--ai-*` дают агенту **изолированный namespace** для кастомизации — он точно знает: изменение `--ai-button-bg` влияет только на кнопку.

### Критерий успеха Phase 2

- [ ] `docs/AI_CONTEXT.md` создан и поддерживается в актуальном состоянии
- [ ] `docs/adr/` содержит минимум 3 ADR (0001–0003)
- [ ] Все компоненты имеют `--ai-[component]-*` токены
- [ ] `--ui-*` токены сохранены как алиасы (breaking changes = 0)
- [ ] Документ `docs/adr/README.md` с индексом решений

---

## Phase 3 — Темизация и дизайн-токены

**Горизонт:** v0.6.0  
**Трудозатраты:** ~2–3 недели

### Что делаем

#### 3.1 Формат внешних тем

Определяем единый формат для импорта сторонних тем:

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

Node.js-скрипт `scripts/theme-map.js`, который принимает JSON-тему и генерирует CSS-файл с маппингом:

```bash
npx ai-css-kit theme-map ./my-theme.json -o ./dist/themes/midnight-pro.css
```

Вывод:

```css
/* Generated by ai-css-kit theme-map — do not edit */
:root[data-theme="midnight-pro"] {
  --ui-color-primary:       #6d28d9;
  --ui-color-primary-hover: #5b21b6;
  --ui-radius-md:           12px;
  --ui-font-family:         'JetBrains Mono', monospace;

  /* Component-level cascade */
  --ai-button-bg:           var(--ui-color-primary);
  --ai-input-border-focus:  var(--ui-color-primary);
}
```

#### 3.3 Маппинг сторонних систем

Поддержка импорта токенов из популярных форматов:

| Источник | Статус | Формат |
|----------|--------|--------|
| W3C Design Tokens Format | v0.6.0 | JSON (`$value`, `$type`) |
| Figma Tokens Plugin | v0.6.0 | JSON (`value`, `type`) |
| Tailwind config | v0.7.0 | JS/JSON `theme.extend.*` |
| Style Dictionary | v0.7.0 | JSON properties |

#### 3.4 Встроенные пресеты тем

```
dist/themes/
  default.css      ← текущая light theme (переименование)
  dark.css         ← текущая dark theme (переименование)
  midnight.css     ← новая: deep dark с purple accent
  corporate.css    ← новая: neutral серый, sans-serif
  warm.css         ← новая: warm tones, rounded
```

#### 3.5 CSS `@layer` для приоритетов

Переводим все компонентные стили в `@layer`, чтобы темы всегда побеждали без `!important`:

```css
@layer ai-kit.tokens, ai-kit.base, ai-kit.components, ai-kit.themes;

@layer ai-kit.components {
  .ui-button--primary { background: var(--ai-button-bg); }
}

@layer ai-kit.themes {
  /* Тема всегда в более высоком слое */
  [data-theme="midnight"] { --ai-button-bg: #6d28d9; }
}
```

### Зачем это нужно для AI

AI-агент часто получает задание «сверстать в стиле Tailwind / Material Design / кастомном бренде». Без Theme Mapper агент вынужден вручную маппить чужие токены на `--ui-*` переменные, что ненадёжно. С Theme Mapper — это однострочная команда.

Формат JSON-темы — это **машиночитаемый контракт** для дизайнеров и агентов одновременно.

### Критерий успеха Phase 3

- [ ] `scripts/theme-map.js` работает и покрыт тестами
- [ ] Поддержаны форматы W3C Design Tokens и Figma Tokens
- [ ] Минимум 3 встроенных пресета темы (default, dark, corporate)
- [ ] `@layer` внедрён для всех компонентных стилей
- [ ] Документация с примерами в `docs/theming.md`

---

## Phase 4 — CLI-агент (The Orchestrator)

**Горизонт:** v0.8.0  
**Трудозатраты:** ~4–6 недель

### Что делаем

#### 4.1 Архитектура CLI

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
[Layout Composer]       ← собирает HTML из атомов по правилам Phase 1
         ↓
[Validator]             ← проверяет сгенерированный HTML против Module Contract
         ↓
[Output: HTML + CSS overrides]
```

#### 4.2 Intent Parser

Переводит свободный текст в структурированный запрос:

```json
{
  "layout": "form",
  "components": [
    { "type": "input", "variant": "email", "size": "md", "label": "Email" },
    { "type": "input", "variant": "password", "size": "md", "label": "Password" },
    { "type": "button", "variant": "primary", "size": "md", "text": "Sign Up" }
  ],
  "theme": "default",
  "container": "card"
}
```

#### 4.3 Component Resolver

Чистый детерминированный модуль (без LLM). Принимает структурированный запрос и возвращает правильный HTML:

```javascript
// Пример резолвера для компонента
resolve('input', { variant: 'email', size: 'md', label: 'Email' })
// → '<div class="ui-field ui-field--md">...</div>'
```

Резолвер берёт правила **напрямую из AI_CONTEXT.md** — single source of truth.

#### 4.4 Validator

Проверяет сгенерированный HTML на соответствие Module Contract:

```bash
ai-css-kit validate ./output.html
# ✓ All components use valid class combinations
# ✓ No deprecated parent-selector patterns detected
# ✓ All required ARIA attributes present
# ✗ WARNING: .ui-input missing .ui-field wrapper
```

#### 4.5 Режимы CLI

```bash
# Интерактивный режим
ai-css-kit generate

# Прямой ввод
ai-css-kit generate "кнопка primary large"

# Из файла задания
ai-css-kit generate --spec ./task.md

# С темой
ai-css-kit generate "dashboard card" --theme midnight

# Только валидация существующего файла
ai-css-kit validate ./src/page.html
```

#### 4.6 Конфигурационный файл

```json
// ai-css-kit.config.json
{
  "llm": {
    "provider": "openai",
    "model": "gpt-4o",
    "apiKey": "${OPENAI_API_KEY}"
  },
  "defaults": {
    "size": "md",
    "theme": "default"
  },
  "output": {
    "dir": "./generated",
    "format": "html"
  }
}
```

### Зачем это нужно для AI

Без CLI каждый AI-агент (Cursor, Copilot, Claude) «изобретает» верстку из кита заново, опираясь на собственную интерпретацию документации. Это ведёт к дрейфу и ошибкам.

CLI-агент — это **авторизованный верстальщик**: он знает все Module Contracts, никогда не генерирует coupling-нарушения, и его вывод всегда валиден.

### Критерий успеха Phase 4

- [ ] `npx ai-css-kit generate "..."` работает end-to-end
- [ ] Component Resolver покрыт 100% unit-тестами (без LLM)
- [ ] Validator обнаруживает все известные anti-patterns
- [ ] Поддержаны провайдеры: OpenAI, Anthropic, Ollama (local)
- [ ] Документация в `docs/cli.md`

---

## Phase 5 — Экосистема и валидация

**Горизонт:** v1.0.0  
**Трудозатраты:** ~3–4 недели

### Что делаем

#### 5.1 Visual Regression Tests (Playwright)

Автоматическая проверка каждого компонента во всех состояниях:

```
tests/visual/
  button.spec.ts      ← all variants × all sizes × all states
  input.spec.ts       ← default, error, success, warning, disabled
  datepicker.spec.ts  ← closed, open, day-selected
  ...
```

Workflow:

```bash
npm run test:visual         # сравнение с baseline скриншотами
npm run test:visual:update  # обновление baseline после намеренных изменений
```

CI падает, если пиксельный diff > 0 для неожиданных изменений.

#### 5.2 AI Accuracy Tests

Специальный тест-сьют: AI-агент генерирует верстку по промпту, Playwright проверяет результат:

```typescript
// tests/ai-accuracy/form-registration.spec.ts
test('AI generates valid registration form', async ({ page }) => {
  const html = await aiGenerate('registration form with email and password');
  await page.setContent(wrapWithKit(html));

  // Проверяем структурную корректность
  await expect(page.locator('.ui-field')).toHaveCount(2);
  await expect(page.locator('.ui-input[type="email"]')).toBeVisible();
  await expect(page.locator('.ui-button--primary')).toBeVisible();

  // Проверяем accessibility
  await expect(page.locator('label[for]')).toHaveCount(2);
});
```

#### 5.3 Component Playground (Storybook-like)

Статическая витрина на базе существующих `src/demos/*.html`, расширенная:

```
src/demos/
  _playground/
    index.html       ← каталог всех компонентов с live-редактором токенов
    theme-switcher/  ← переключатель между пресетами тем
```

#### 5.4 Мониторинг совместимости

Автоматический CI-job, который раз в неделю:

1. Генерирует 20 стандартных UI-паттернов через CLI-агент
2. Прогоняет визуальные тесты
3. Публикует отчёт в `docs/reports/compatibility-YYYY-WW.md`

#### 5.5 Публикация в npm + документационный сайт

```
docs/site/          ← статический сайт (Astro или 11ty)
  /components       ← живые примеры
  /tokens           ← таблица всех --ai-* переменных
  /cli              ← документация по CLI
  /themes           ← галерея тем
```

### Зачем это нужно для AI

AI-агент должен уметь **верифицировать собственную верстку**. Без тестов нет обратной связи — агент не знает, сломалось ли что-то после изменения токена. AI Accuracy Tests — это цикл самокоррекции, встроенный в инфраструктуру.

### Критерий успеха Phase 5

- [ ] Visual regression тесты для всех 15 компонентов
- [ ] AI Accuracy Tests для 10 стандартных UI-паттернов
- [ ] CI pipeline: lint → build → unit → visual → ai-accuracy
- [ ] Публичный npm-пакет с версией 1.0.0
- [ ] Документационный сайт задеплоен

---

## Сводная таблица Roadmap

| Фаза | Версия | Ключевой результат | Приоритет |
|------|--------|-------------------|-----------|
| 1. Decoupling | v0.4.0 | Атомарные компоненты без coupling | Critical |
| 2. AI Context | v0.5.0 | AI_CONTEXT.md + ADR + `--ai-*` токены | Critical |
| 3. Theming | v0.6.0 | Theme Mapper + JSON-темы + @layer | High |
| 4. CLI Agent | v0.8.0 | `npx ai-css-kit generate` | High |
| 5. Ecosystem | v1.0.0 | Visual tests + AI accuracy + публичный сайт | Medium |

---

## Следующий шаг (сегодня)

1. ✅ Принять ADR-0001 (Atomic Decoupling) — `docs/adr/0001-atomic-decoupling.md`
2. ✅ Запустить аудит coupling в `datepicker.css` и `autocomplete.css` *(замена на Context Modifiers + lint:coupling)*
3. ⏳ Открыть Issue на GitHub: "Phase 1: Atomic Decoupling"

---

*Этот документ является живым артефактом. Обновляется при каждом завершении фазы.*
