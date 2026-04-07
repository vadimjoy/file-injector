# ADR-0002 — Context Modifier Pattern для иконок и контекстного padding

> **Язык:** Русский | [English](../../en/adr/0002-context-modifier-pattern.md)

**Статус:** Accepted  
**Дата:** 2026-04-04  
**Автор:** vadimjoy  
**Связанные ADR:** [ADR-0001](0001-atomic-decoupling.md)

---

## Контекст

ADR-0001 запретил parent-selector mutations и ввёл принцип изоляции компонентов. Однако принцип описывал только «что нельзя», не давая полного ответа на вопрос «что делать вместо этого».

Конкретная задача: компонентам-оркестраторам (datepicker, autocomplete, input-с-иконкой) нужно изменить внутренний padding атома `ui-input`, чтобы текст не перекрывался иконкой. При этом:

1. Мутировать `ui-input` снаружи через parent-selector — запрещено (ADR-0001)
2. Hardcode `padding` в каждом оркестраторе — дублирование и нет единого стандарта
3. AI-агент должен явно видеть контекст по классам самого элемента

---

## Решение

### Context Modifier Pattern

Вводим класс-модификатор на самом атоме, который несёт **семантику контекста** использования:

```
.ui-input--icon-left    → padding-left увеличен под иконку слева
.ui-input--icon-right   → padding-right увеличен под иконку справа
.ui-input--search       → padding-left и padding-right увеличены (двойная иконка)
.ui-input--readonly     → cursor: pointer, caret-color: transparent
```

### Принцип именования модификаторов

Модификатор контекста отвечает на вопрос **«в каком контексте используется атом?»**, а не «кто его использует».

```
✓ .ui-input--icon-right    (контекст: есть иконка справа)
✗ .ui-input--datepicker    (нарушение: привязка к конкретному родителю)
✗ .ui-input--in-picker     (нарушение: описывает отношение, а не состояние атома)
```

Это позволяет переиспользовать один модификатор в нескольких оркестраторах:

```html
<!-- datepicker использует icon-right -->
<input class="ui-input ui-input--icon-right ui-input--readonly">

<!-- custom trigger тоже может использовать icon-right -->
<input class="ui-input ui-input--icon-right">
```

### Size-aware модификаторы

Padding в контекстных модификаторах адаптируется через `.ui-field--{size}` родителя:

```css
/* Базовый (md) */
.ui-input.ui-input--icon-left  { padding-left: 36px; }
.ui-input.ui-input--icon-right { padding-right: 40px; }

/* Small — меньший отступ */
.ui-field--sm .ui-input.ui-input--icon-left  { padding-left: 30px; }

/* Large — больший отступ */
.ui-field--lg .ui-input.ui-input--icon-left  { padding-left: 44px; }
```

Оркестратор не управляет размерами напрямую — они наследуются через стандартный механизм `.ui-field--{size}`.

---

## Применение в компонентах

### Datepicker

```html
<!-- Триггер datepicker: input + иконка справа -->
<div class="ui-datepicker-trigger">
  <input type="text"
         class="ui-input ui-input--icon-right ui-input--readonly
                ui-datepicker__input"
         value="12/25/2024" readonly>
  <span class="ui-datepicker__icon"><!-- calendar SVG --></span>
</div>
```

### Autocomplete

```html
<!-- Триггер autocomplete: input + иконка слева -->
<div class="ui-autocomplete-trigger">
  <span class="ui-autocomplete__search-icon"><!-- search SVG --></span>
  <input type="text"
         class="ui-input ui-input--icon-left ui-autocomplete__input"
         placeholder="Поиск...">
</div>
```

### Input с произвольной иконкой

```html
<!-- Стандартный input-wrapper с иконкой слева -->
<div class="ui-input-wrapper">
  <span class="ui-input-icon"><!-- SVG --></span>
  <input type="search" class="ui-input ui-input--icon-left">
</div>
```

---

## Расширяемость паттерна

Паттерн не ограничен иконками. Любой случай, когда контекст требует модификации атома, должен оформляться как явный модификатор:

| Ситуация | Неправильно | Правильно |
|----------|-------------|-----------|
| Datepicker нужен cursor:pointer | `.ui-datepicker .ui-input { cursor: pointer }` | `.ui-input--readonly` |
| Форма поиска — двойная иконка | `.search-form .ui-input { padding: 9px 36px }` | `.ui-input--search` |
| Инлайн-редактор без бордера | `.editor .ui-input { border: none }` | `.ui-input--borderless` (будущий) |

---

## Последствия

### Положительные

- HTML самодокументируется: набор классов на элементе полностью описывает его состояние
- AI-агент имеет O(1) контекст для каждого атома: не нужно знать, в каком оркестраторе атом используется
- Один модификатор переиспользуется в нескольких компонентах
- Lint-скрипт `audit-coupling.js` обнаруживает нарушения автоматически

### Отрицательные / Компромиссы

- Количество классов на элементе растёт: `class="ui-input ui-input--icon-right ui-input--readonly"`
- Разработчик должен знать о наличии модификатора — необходима документация в AI_CONTEXT.md
- При добавлении нового типа иконки нужно добавить новый модификатор в `input.css`

---

## Альтернативы, которые рассматривались

### A. Именованный data-атрибут

```html
<input class="ui-input" data-icon="right">
```

**Отклонено:** Data-атрибуты не являются частью CSS-контракта компонента. Требует дополнительного CSS-правила `[data-icon="right"]`. Нет стандартизации для lint-проверки.

### B. CSS Custom Property инъекция

```css
.ui-datepicker-trigger { --_input-padding-right: 40px; }
.ui-input { padding-right: var(--_input-padding-right, 13px); }
```

**Отклонено:** «Магические» переменные невидимы в документации атома. AI-агент не может вывести поведение `ui-input` без знания о `--_input-padding-right`.

---

## Связанные задачи

- [x] Реализованы модификаторы `.ui-input--icon-left/right/search/readonly` в `input.css`
- [x] Удалены coupling-правила из `datepicker.css` и `autocomplete.css`
- [x] Обновлены HTML-контракты в `SPEC.md`
