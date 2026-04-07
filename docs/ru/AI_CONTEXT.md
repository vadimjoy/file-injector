# AI CSS Kit — Контекст для AI-агентов

> **Язык:** Русский | [English](../en/AI_CONTEXT.md)

> **ВЕРСИЯ:** 0.6.0  
> **НАЗНАЧЕНИЕ:** Системный промпт / справочный документ для AI-агентов, генерирующих UI с помощью ai-css-kit  
> **ОБЛАСТЬ ПРИМЕНЕНИЯ:** Загрузите этот файл как контекст перед генерацией любого HTML с классами ai-css-kit

---

## 1. Инварианты (правила, которые НЕЛЬЗЯ нарушать)

```
I-01  Каждый интерактивный элемент формы ДОЛЖЕН быть обёрнут в .ui-field
I-02  Каждый .ui-field ДОЛЖЕН иметь ровно один модификатор размера: --sm | --md | --lg
I-03  Каждый <input>, <textarea>, <select> ДОЛЖЕН иметь связанный <label class="ui-label">
I-04  CSS-класс компонента НЕ ДОЛЖЕН переопределяться селектором родительского компонента
I-05  Варианты размера задаются на .ui-field, НЕ на отдельных компонентах внутри него
I-06  Классы состояния валидации (--error, --success, --warning) задаются на INPUT, а не на .ui-field
I-07  Пресеты тем активируются через data-theme="{default|dark|midnight|corporate|warm}" на <html> (удалите атрибут для возврата к дефолту)
I-08  Используйте --ai-[component]-* токены для кастомизации одного компонента в изоляции
I-09  Используйте --ui-* токены ТОЛЬКО для глобальных изменений, распространяющихся на все компоненты
I-10  НЕ используйте !important — переопределяйте --ai-* токены
```

---

## 2. Реестр компонентов

### 2.1 Макет / Обёртки

| Компонент | Базовый класс | Модификаторы размера | Примечания |
|-----------|---------------|----------------------|------------|
| Обёртка поля | `.ui-field` | `--sm` `--md` `--lg` | Обязательный родитель для элементов форм |
| Карточка | `.ui-card` | — | Универсальный контейнер контента |

### 2.2 Атомы форм

| Компонент | Базовый класс | Модификаторы состояния | Контекстные модификаторы |
|-----------|---------------|------------------------|--------------------------|
| Поле ввода | `.ui-input` | `--error` `--success` `--warning` | `--icon-left` `--icon-right` `--search` `--readonly` |
| Текстовая область | `.ui-textarea` | `--error` `--success` `--warning` | — |
| Выбор | `.ui-select` | `--error` `--success` `--warning` | — |
| Чекбокс | `.ui-checkbox` | — | `--sm` `--md` `--lg` (собственный размер) |
| Радиокнопка | `.ui-radio` | — | `--sm` `--md` `--lg` (собственный размер) |
| Тумблер | `.ui-toggle` | — | `--sm` `--md` `--lg` (собственный размер) |
| Слайдер | `.ui-slider` | — | `--sm` `--md` `--lg` (собственный размер) |
| Загрузка файла | `.ui-file-upload` | `--dragover` | `--sm` `--lg` |

> ПРИМЕЧАНИЕ: Checkbox, Radio, Toggle, Slider несут собственные модификаторы размера напрямую (не через .ui-field).

### 2.3 Составные компоненты

| Компонент | Класс-обёртка | Обязательные дочерние элементы |
|-----------|---------------|-------------------------------|
| Автодополнение | `.ui-autocomplete-trigger` + `.ui-autocomplete__search-icon` + `.ui-autocomplete__input` | Input должен включать `ui-input--icon-left` + `.ui-autocomplete__input`; панель остаётся независимой |
| Выбор даты | `.ui-datepicker-trigger` + `.ui-datepicker__icon` + `.ui-datepicker__input` | Input должен включать `ui-input--icon-right` + `ui-input--readonly` + `.ui-datepicker__input`; календарь — отдельный компонент |
| Input с иконкой | `.ui-input-wrapper` | `.ui-input-icon` + `.ui-input` |

### 2.4 Отображаемые компоненты

| Компонент | Базовый класс | Модификаторы |
|-----------|---------------|--------------|
| Кнопка | `.ui-button` | `--primary` `--secondary` `--ghost` + `--sm` `--md` `--lg` |
| Бейдж | `.ui-badge` | `--default` `--primary` `--success` `--warning` `--error` + `--sm` `--md` `--lg` + `--dot` |
| Прогресс | `.ui-progress` | `--primary` `--success` `--warning` `--error` + `--sm` `--md` `--lg` + `--striped` `--animated` |
| Подсказка | `.ui-tooltip` | `--bottom` `--left` `--right` (по умолчанию = top) |

### 2.5 Типографические хелперы

| Класс | Описание |
|-------|----------|
| `.ui-label` | Метка поля (используется внутри .ui-field) |
| `.ui-helper` | Подсказка под полем ввода |
| `.ui-error` | Текст ошибки |
| `.ui-success-text` | Текст успеха |

---

## 3. Правила композиции

### Правило C-01: Стандартное поле формы

```html
<div class="ui-field ui-field--{sm|md|lg}">
  <label class="ui-label" for="{id}">{Текст метки}</label>
  <input type="{type}" id="{id}" class="ui-input" placeholder="...">
  <!-- опционально: -->
  <span class="ui-helper">{Текст подсказки}</span>
  <span class="ui-error">{Сообщение об ошибке}</span>
</div>
```

### Правило C-02: Поле с состоянием валидации

```html
<div class="ui-field ui-field--md">
  <label class="ui-label" for="email">Email</label>
  <input type="email" id="email"
         class="ui-input ui-input--error"
         aria-invalid="true"
         aria-describedby="email-err">
  <span class="ui-error" id="email-err" role="alert">Неверный адрес электронной почты</span>
</div>
```

### Правило C-03: Input с иконкой слева

```html
<div class="ui-field ui-field--md">
  <label class="ui-label">Поиск</label>
  <div class="ui-input-wrapper">
    <span class="ui-input-icon"><!-- SVG иконка --></span>
    <input type="search" class="ui-input ui-input--icon-left">
  </div>
</div>
```

### Правило C-04: Варианты кнопок

```html
<!-- Всегда используйте ОБА модификатора: вариант и размер -->
<button class="ui-button ui-button--primary ui-button--md">Основная</button>
<button class="ui-button ui-button--secondary ui-button--md">Вторичная</button>
<button class="ui-button ui-button--ghost ui-button--sm">Отмена</button>
```

### Правило C-05: Выбор даты

```html
<div class="ui-field ui-field--md">
  <label class="ui-label">Дата</label>
  <div class="ui-datepicker">
    <div class="ui-datepicker-trigger">
      <input type="text" class="ui-input ui-input--icon-right ui-input--readonly ui-datepicker__input"
             value="12/25/2024" readonly>
      <span class="ui-datepicker__icon"><!-- SVG календаря --></span>
    </div>
    <div class="ui-datepicker__calendar"><!-- сетка календаря --></div>
  </div>
</div>
```

### Правило C-06: Группа чекбоксов / радиокнопок

```html
<fieldset>
  <legend>Варианты</legend>
  <label class="ui-checkbox ui-checkbox--md">
    <input type="checkbox" checked>
    <span>Вариант A</span>
  </label>
  <label class="ui-checkbox ui-checkbox--md">
    <input type="checkbox">
    <span>Вариант B</span>
  </label>
</fieldset>
```

---

## 4. Антипаттерны (НИКОГДА не генерируйте)

```
AP-01  НЕ используйте parent-selector для переопределения дочернего компонента:
       ✗ .my-wrapper .ui-input { padding: 0; }
       ✓ Добавьте класс-модификатор непосредственно к .ui-input

AP-02  НЕ используйте !important:
       ✗ .ui-button { background: red !important; }
       ✓ Переопределите --ui-color-primary или --ai-button-bg

AP-03  НЕ вкладывайте .ui-field в другой .ui-field

AP-04  НЕ помещайте состояние валидации на .ui-field:
       ✗ <div class="ui-field ui-field--error">
       ✓ <input class="ui-input ui-input--error">

AP-05  НЕ используйте .ui-button без модификаторов варианта И размера:
       ✗ <button class="ui-button">
       ✓ <button class="ui-button ui-button--primary ui-button--md">

AP-06  НЕ захардкоживайте значения px в инлайн-стилях для внутренних частей компонентов:
       ✗ <input style="padding: 9px 13px;">
       ✓ Используйте .ui-field--md, который задаёт правильные отступы через CSS
```

---

## 5. Справочник токенов (CSS-кастомные свойства)

### Глобальные токены (--ui-*) — Уровень 1

Влияют на все компоненты одновременно. Используйте для общебрендовых изменений.

```
Цвет
  --ui-color-primary          Брендовый акцент (по умолчанию: #4f46e5)
  --ui-color-primary-hover    Hover-состояние основного цвета
  --ui-color-primary-soft     Кольца фокуса, мягкие фоны
  --ui-color-success          #16a34a
  --ui-color-warning          #d97706
  --ui-color-error            #dc2626
  --ui-color-border           Цвет границы по умолчанию
  --ui-color-border-focus     Цвет границы при фокусе
  --ui-color-bg               Фон страницы/компонента
  --ui-color-bg-subtle        Слегка подкрашенный фон (поля ввода и т.п.)
  --ui-color-text             Основной текст
  --ui-color-text-muted       Вторичный/подсказывающий текст

Отступы (сетка 4px)
  --ui-space-1   4px
  --ui-space-2   8px
  --ui-space-3   12px
  --ui-space-4   16px
  --ui-space-6   24px
  --ui-space-8   32px

Радиус скругления
  --ui-radius-sm   6px
  --ui-radius-md   8px   ← по умолчанию для input/button
  --ui-radius-lg   12px  ← карточки, попапы
  --ui-radius-full 9999px

Типографика
  --ui-font-family   Inter, system-ui, sans-serif
  --ui-font-size-sm  13px
  --ui-font-size-md  14px  ← основной текст
  --ui-font-size-lg  16px

Тени
  --ui-shadow-sm    слабая возвышенность
  --ui-shadow-md    выпадающие списки
  --ui-shadow-lg    модальные окна, календари
  --ui-shadow-focus кольцо фокуса (использует primary-soft)
```

### Токены компонентов (--ai-*) — Уровень 2

Влияют **только на один компонент**. По умолчанию ссылаются на глобальные токены.
Переопределяйте для изолированной кастомизации без каскадных эффектов. См. [ADR-0003](adr/0003-ai-token-naming.md).

Полный список токенов по компонентам — аналогичен английской версии (см. [AI_CONTEXT.md](../en/AI_CONTEXT.md)).

### Примеры кастомизации

```css
/* Глобальное брендовое изменение — влияет на все компоненты */
:root {
  --ui-color-primary: #10b981;
  --ui-color-primary-hover: #059669;
  --ui-color-primary-soft: rgba(16, 185, 129, 0.15);
}

/* Изолированно: только кнопки получают скруглённые углы и зелёный цвет */
:root {
  --ai-button-bg:       #10b981;
  --ai-button-bg-hover: #059669;
  --ai-button-border:   #10b981;
  --ai-button-radius:   24px;
}

/* Изолированно: только календарь получает кастомный акцент */
:root {
  --ai-calendar-selected-bg:    #6d28d9;
  --ai-calendar-today-color:    #6d28d9;
}
```

---

## 6. Пресеты тем и Theme Mapper

- Пресеты тем находятся в `dist/themes/*.css` (`default`, `dark`, `midnight`, `corporate`, `warm`).
- Подключите нужные файлы **после** `dist/ai-css-kit.css` и переключайте через `data-theme="{name}"` на `<html>`.
- Удаление атрибута возвращает к базовым светлым токенам из `:root`.
- Все переопределения пресетов размещены в `@layer ai-kit.themes`, поэтому они всегда имеют приоритет над стилями компонентов без `!important`.

```html
<link rel="stylesheet" href="/dist/ai-css-kit.css">
<link rel="stylesheet" href="/dist/themes/midnight.css">
<html data-theme="midnight">...</html>
```

### Theme Mapper CLI

Используйте `npm run theme-map -- ./theme.json -o ./dist/themes/custom.css` для конвертации токенов JSON (родной формат, W3C или Figma) в готовый файл темы. Подробности — в [theming.md](theming.md).

---

## 7. Сводка по системе размеров

| Размер | Класс поля | Отступы input | Отступы button | Размер шрифта |
|--------|------------|---------------|----------------|---------------|
| sm | `.ui-field--sm` | 6px 10px | 6px 12px | 13px |
| md | `.ui-field--md` | 9px 13px | 9px 17px | 14px |
| lg | `.ui-field--lg` | 13px 17px | 12px 22px | 16px |

---

## 8. Чеклист доступности

При генерации компонентов формы всегда включайте:

- `id` на каждом `<input>`, совпадающий с `for` на `<label>`
- `aria-invalid="true"` на полях ввода с модификатором `--error`
- `aria-describedby="{id}"`, указывающий на элементы `.ui-helper` / `.ui-error`
- `role="alert"` на элементах `.ui-error`, появляющихся динамически
- Атрибут `disabled` (не CSS-класс) для отключённого состояния
- `<fieldset>` + `<legend>` для групп чекбоксов/радиокнопок

---

*Этот документ поддерживается в актуальном состоянии с каждым релизом компонентов.*  
*Решения ADR, влияющие на этот контекст:*  
*[ADR-0001](adr/0001-atomic-decoupling.md) — Атомарный декаплинг (запрет parent-selector мутаций)*  
*[ADR-0002](adr/0002-context-modifier-pattern.md) — Context Modifier Pattern*  
*[ADR-0003](adr/0003-ai-token-naming.md) — Нейминг компонентных токенов `--ai-[component]-[prop]`*
