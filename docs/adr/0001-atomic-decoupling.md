# ADR-0001 — Atomic Decoupling: запрет parent-selector mutations

**Статус:** Accepted  
**Дата:** 2026-04-02  
**Автор:** vadimjoy  
**Связанные ADR:** —  

---

## Контекст

AI CSS Kit позиционируется как «Deterministic UI Lego» — набор компонентов, которые AI-агент может комбинировать без конфликтов и неожиданных визуальных эффектов.

При аудите кодовой базы v0.3.1 обнаружен паттерн **parent-selector mutation**: компонент-контейнер переопределяет стили вложенного базового компонента через CSS-цепочку вида `.parent .child`.

### Выявленные нарушения

**`src/css/components/datepicker.css`, строка 15:**

```css
.ui-datepicker__input-wrapper .ui-input {
  padding-right: 40px;
}
```

**`src/css/components/autocomplete.css`, строка 15:**

```css
.ui-autocomplete__input-wrapper .ui-input {
  padding-left: 36px;
}
```

### Почему это критично для AI

1. **Нарушение предсказуемости.** AI-агент, генерируя `<input class="ui-input">` внутри `ui-datepicker`, не видит явного сигнала о том, что padding будет изменён. Класс `.ui-input` сам по себе не несёт этой информации.

2. **Взрывной рост контекста.** Чтобы правильно использовать `ui-input`, агент вынужден знать все N компонентов, которые содержат `ui-input` внутри себя. Сложность растёт как O(N²). При атомарном подходе — O(1) на компонент.

3. **Хрупкость при рефакторинге.** Перемещение `.ui-input` в другой контейнер неожиданно меняет его внешний вид. Агент не может это предсказать без статического анализа всего CSS.

4. **Конфликт специфичности.** Если разработчик добавляет `.ui-input { padding-right: 10px }` на уровне страницы, результат непредсказуем в зависимости от порядка подключения файлов.

---

## Решение

### Правило «Один компонент — один файл — полная изоляция»

Каждый компонентный CSS-файл **запрещено** содержать CSS-правила, селектор которых таргетирует CSS-класс другого компонента.

**Критерий нарушения:** Правило является нарушением, если:
- его селектор содержит класс из другого компонентного файла, ИЛИ
- его селектор содержит более одного компонентного класса в CSS-цепочке

### Context Modifier Pattern

Вместо мутации через parent-selector вводим **явный модификатор** на самом компоненте. Модификатор несёт семантику контекста в своём имени.

```css
/* ЗАПРЕЩЕНО: мутация извне */
.ui-datepicker__input-wrapper .ui-input {
  padding-right: 40px;
}

/* ПРАВИЛЬНО: явный модификатор на атоме */
.ui-input--icon-right {
  padding-right: 40px;
}
```

Разметка становится явным контрактом:

```html
<!-- ЗАПРЕЩЕНО: скрытое поведение -->
<div class="ui-datepicker__input-wrapper">
  <input class="ui-input" type="text">
  <!-- ↑ незаметно получает padding-right: 40px -->
</div>

<!-- ПРАВИЛЬНО: явный контракт, читаемый без знания контекста -->
<div class="ui-datepicker__input-wrapper">
  <input class="ui-input ui-input--icon-right" type="text">
  <!-- ↑ модификатор явно указывает на наличие иконки справа -->
</div>
```

### Новые модификаторы для `.ui-input`

| Модификатор | CSS-свойство | Замещает |
|-------------|-------------|---------|
| `.ui-input--icon-left` | `padding-left: 36px` | `.ui-input-wrapper .ui-input` (старый) |
| `.ui-input--icon-right` | `padding-right: 40px` | `.ui-datepicker__input-wrapper .ui-input` |
| `.ui-input--search` | `padding-left: 36px` + `padding-right: 36px` | для двойных иконок |
| `.ui-input--readonly` | `cursor: pointer; caret-color: transparent` | новый (нужен datepicker) |

### Обновление компонентов

**datepicker.css** — удалить строки 15–17, обновить документацию:

```css
/* УДАЛИТЬ */
.ui-datepicker__input-wrapper .ui-input {
  padding-right: 40px;
}
```

HTML-контракт в `SPEC.md` обновить:

```html
<!-- Было -->
<input type="text" class="ui-input" value="12/25/2024" readonly>

<!-- Стало -->
<input type="text" class="ui-input ui-input--icon-right ui-input--readonly"
       value="12/25/2024" readonly>
```

**autocomplete.css** — аналогично, удалить строки 15–17.

---

## Механизм контроля

### Автоматический аудит-скрипт

Скрипт `scripts/audit-coupling.js` прогоняется в CI и фейлит билд при нарушении правила:

```javascript
// Упрощённая логика
const COMPONENT_CLASSES = loadComponentClasses(); // ['ui-input', 'ui-button', ...]

for (const file of componentFiles) {
  const rules = parseCSS(file);
  for (const rule of rules) {
    const foreignClasses = findForeignClasses(rule.selector, currentComponent);
    if (foreignClasses.length > 0) {
      throw new Error(
        `COUPLING VIOLATION in ${file}: ` +
        `selector "${rule.selector}" targets foreign class "${foreignClasses[0]}"`
      );
    }
  }
}
```

### Формат ошибки

```
COUPLING VIOLATION
  File:     src/css/components/datepicker.css
  Line:     15
  Selector: .ui-datepicker__input-wrapper .ui-input
  Problem:  Selector targets .ui-input which belongs to input.css
  Fix:      Add modifier .ui-input--icon-right to the atom instead
```

---

## Последствия

### Положительные

- AI-агент получает **O(1) контекст** для каждого компонента: всё необходимое описано в классах самого элемента
- HTML становится самодокументируемым: набор классов полностью описывает визуальное состояние
- Устраняется проблема order-of-imports — специфичность не зависит от порядка файлов
- Рефакторинг компонентов становится безопасным: перемещение элемента не меняет его вид

### Отрицательные / Компромиссы

- Небольшое увеличение числа CSS-классов на элементах HTML (`ui-input ui-input--icon-right` вместо простого `ui-input` внутри datepicker)
- Требует обновления существующей документации (`SPEC.md`) и примеров в `src/demos/`
- **Breaking change** для пользователей, которые использовали `.ui-datepicker__input-wrapper .ui-input` в собственном CSS для дополнительной кастомизации

### Миграционный путь для пользователей

```css
/* v0.3.x — работало через implicit coupling */
.ui-datepicker__input-wrapper .ui-input { ... }

/* v0.4.0 — явный модификатор */
.ui-input--icon-right { ... }
```

В CHANGELOG.md будет добавлена секция `Migration Guide: v0.3 → v0.4`.

---

## Альтернативы, которые рассматривались

### A. CSS Scope (@scope)

Использовать новый CSS `@scope` для ограничения видимости стилей:

```css
@scope (.ui-datepicker__input-wrapper) {
  .ui-input { padding-right: 40px; }
}
```

**Отклонено:** `@scope` имеет ограниченную поддержку браузеров (Chrome 118+, Firefox не поддерживает на дату решения). Противоречит принципу изоляции — datepicker всё равно «знает» про inner layout input.

### B. CSS Custom Properties для контекстной инъекции

Родительский компонент устанавливает переменную, которую дочерний «слушает»:

```css
.ui-datepicker__input-wrapper {
  --_input-padding-right: 40px;
}

.ui-input {
  padding-right: var(--_input-padding-right, 13px);
}
```

**Отклонено:** Создаёт неявный контракт через «магические» переменные. AI-агент не видит `--_input-padding-right` в документации `.ui-input`. Хуже читаемости кода, нет выигрыша перед Context Modifier Pattern.

### C. Оставить как есть, задокументировать

Описать в `AI_CONTEXT.md` все известные parent-selector mutations и обучить агента учитывать их.

**Отклонено:** Не решает корневую проблему, только смещает сложность в документацию. Каждый новый компонент-контейнер будет добавлять ещё один специальный случай.

---

## Связанные задачи

- [ ] Реализовать новые модификаторы `.ui-input--icon-*` в `input.css`
- [ ] Удалить coupling-правила из `datepicker.css` и `autocomplete.css`
- [ ] Написать `scripts/audit-coupling.js`
- [ ] Добавить audit-скрипт в CI (`package.json scripts.lint:coupling`)
- [ ] Обновить `SPEC.md` — HTML-контракты datepicker и autocomplete
- [ ] Обновить `src/demos/datepicker.html` и `src/demos/autocomplete.html`
- [ ] Написать `CHANGELOG.md` секцию Migration Guide v0.3 → v0.4
- [ ] Открыть ADR-0002 для Context Modifier Pattern (расширение на другие компоненты)
