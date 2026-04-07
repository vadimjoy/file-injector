# AI CSS Kit — Master Plan (Дорожная карта)

> **Язык:** Русский | [English](../en/MASTER_PLAN.md)

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

Каждое архитектурное решение фиксируется в `docs/en/adr/NNNN-title.md` и `docs/ru/adr/NNNN-title.md`.

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

- [x] `docs/AI_CONTEXT.md` создан и поддерживается в актуальном состоянии *(v0.5.0, полный Token Reference --ai-*, 2026-04-04)*
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

## Фаза 4 — CLI-агент (The Orchestrator)

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
[Layout Composer]       ← собирает HTML из атомов по правилам Фазы 1
         ↓
[Validator]             ← проверяет сгенерированный HTML против Module Contract
         ↓
[Output: HTML + CSS overrides]
```

#### 4.2 Режимы CLI

```bash
ai-css-kit generate "кнопка primary large"
ai-css-kit generate --spec ./task.md
ai-css-kit generate "dashboard card" --theme midnight
ai-css-kit validate ./src/page.html
```

### Критерий успеха Фазы 4

- [ ] `npx ai-css-kit generate "..."` работает end-to-end
- [ ] Component Resolver покрыт 100% unit-тестами (без LLM)
- [ ] Validator обнаруживает все известные anti-patterns
- [ ] Поддержаны провайдеры: OpenAI, Anthropic, Ollama (local)
- [ ] Документация в `docs/ru/cli.md`

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
| 1. Decoupling | v0.4.0 | Атомарные компоненты без coupling | Critical |
| 2. AI Context | v0.5.0 | AI_CONTEXT.md + ADR + `--ai-*` токены | Critical |
| 3. Theming | v0.6.0 ✅ | Theme Mapper + JSON-темы + @layer | High |
| 4. CLI Agent | v0.8.0 | `npx ai-css-kit generate` | High |
| 5. Ecosystem | v1.0.0 | Visual tests + AI accuracy + публичный сайт | Medium |

---

*Этот документ является живым артефактом. Обновляется при каждом завершении фазы.*
