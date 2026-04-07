# ADR-0003 — Стандарт нейминга `--ai-[component]-[prop]`: компонентные токены

> **Язык:** Русский | [English](../../en/adr/0003-ai-token-naming.md)

**Статус:** Accepted  
**Дата:** 2026-04-04  
**Автор:** vadimjoy  
**Связанные ADR:** [ADR-0001](0001-atomic-decoupling.md), [ADR-0002](0002-context-modifier-pattern.md)

---

## Контекст

Текущая система `--ui-*` переменных работает на уровне глобальных дизайн-токенов:

```css
:root {
  --ui-color-primary: #4f46e5;
  --ui-radius-md: 8px;
}
```

### Проблема: нет изолированной точки кастомизации

Если AI-агент получает задание «сделать кнопки с округлёнными углами», ему приходится изменить `--ui-radius-md`, что затронет все компоненты, которые используют этот токен: inputs, selects, cards, badges — всё изменится одновременно.

Нет способа изменить только кнопку без риска каскадных изменений.

### Проблема: AI-агент не видит, какие переменные влияют на какой компонент

При наличии только `--ui-color-primary` агент не может ответить на вопрос «какие переменные управляют цветом фона кнопки?» без полного прочтения `button.css`. При работе с 15+ компонентами это требует загрузки всего CSS в контекст.

---

## Решение

### Двухуровневая система токенов

**Уровень 1: Global Tokens** — существующие `--ui-*`, сохраняются без изменений (обратная совместимость).

**Уровень 2: Component Tokens** — новые `--ai-[component]-[prop]`, которые:
- по умолчанию ссылаются на глобальные токены
- могут быть переопределены изолированно для одного компонента
- документируются в `AI_CONTEXT.md` как единственная точка кастомизации компонента

### Формат именования

```
--ai-[component]-[property]
--ai-[component]-[property]-[state]
```

Примеры:
```
--ai-button-bg                 ← фон кнопки (обычное состояние)
--ai-button-bg-hover           ← фон кнопки при hover
--ai-button-radius             ← радиус кнопки
--ai-input-border-focus        ← бордер input при фокусе
--ai-calendar-selected-bg      ← фон выбранного дня в календаре
```

### Правила именования компонента

| Компонент | Префикс |
|-----------|---------|
| Button / Кнопка | `--ai-button-*` |
| Input / Поле ввода | `--ai-input-*` |
| Textarea / Текстовая область | `--ai-textarea-*` |
| Select / Выбор | `--ai-select-*` |
| Card / Карточка | `--ai-card-*` |
| Badge / Бейдж | `--ai-badge-*` |
| Progress / Прогресс | `--ai-progress-*` |
| Tooltip / Подсказка | `--ai-tooltip-*` |
| Checkbox / Чекбокс | `--ai-checkbox-*` |
| Radio / Радиокнопка | `--ai-radio-*` |
| Toggle / Тумблер | `--ai-toggle-*` |
| Slider / Слайдер | `--ai-slider-*` |
| File Upload / Загрузка файла | `--ai-file-upload-*` |
| Autocomplete / Автодополнение | `--ai-autocomplete-*` |
| Calendar (Datepicker) / Календарь | `--ai-calendar-*` |

### Декларация в tokens.css

```css
/* ==========================================================================
   Component Tokens — Level 2 (--ai-*)
   Inherit from Global Tokens by default.
   Override these to customize a single component without cascade effects.
   ========================================================================== */
:root {
  /* Button */
  --ai-button-bg:           var(--ui-color-primary);
  --ai-button-bg-hover:     var(--ui-color-primary-hover);
  --ai-button-color:        #ffffff;
  --ai-button-border:       var(--ui-color-primary);
  --ai-button-radius:       var(--ui-radius-md);
  --ai-button-font-size:    var(--ui-font-size-md);
  --ai-button-focus-ring:   var(--ui-color-primary-soft);

  /* Input */
  --ai-input-bg:            var(--ui-color-bg);
  --ai-input-border:        var(--ui-color-border);
  --ai-input-border-focus:  var(--ui-color-border-focus);
  --ai-input-color:         var(--ui-color-text);
  --ai-input-radius:        var(--ui-radius-md);
  --ai-input-placeholder:   var(--ui-color-text-placeholder);

  /* ... и т.д. для каждого компонента */
}
```

### Использование в компонентных файлах

```css
/* button.css — использует --ai-* токены */
.ui-button--primary {
  background:    var(--ai-button-bg);
  color:         var(--ai-button-color);
  border-color:  var(--ai-button-border);
  border-radius: var(--ai-button-radius);
}

.ui-button--primary:hover:not(:disabled) {
  background:   var(--ai-button-bg-hover);
  border-color: var(--ai-button-bg-hover);
}
```

### Изолированная кастомизация AI-агентом

```css
/* Только кнопки становятся зелёными — остальные компоненты не затронуты */
:root {
  --ai-button-bg:       #10b981;
  --ai-button-bg-hover: #059669;
  --ai-button-border:   #10b981;
  --ai-button-radius:   24px;
}
```

---

## Стратегия миграции

### Поэтапность

1. **Фаза 2 (текущая):** Добавляем `--ai-*` токены в `tokens.css`, компоненты начинают их использовать. `--ui-*` остаются как алиасы.
2. **Фаза 3 (темизация):** Theme Mapper генерирует CSS с `--ai-*` токенами для конкретных тем.
3. **После v1.0.0 (опционально):** Прямые значения в компонентах могут быть заменены на `--ai-*`, если это не вызывает breaking changes.

### Нет breaking changes

`--ui-*` токены не удаляются и не переименовываются. `--ai-*` токены добавляются поверх и ссылаются на `--ui-*` по умолчанию:

```css
/* tokens.css */
:root {
  --ui-color-primary: #4f46e5;           /* ← Level 1: не меняется */
  --ai-button-bg: var(--ui-color-primary); /* ← Level 2: новый токен */
}
```

Код, использующий `--ui-color-primary` напрямую, продолжает работать.

---

## Последствия

### Положительные

- AI-агент имеет **изолированный namespace** для кастомизации каждого компонента
- Токены самодокументируются: `--ai-button-bg` явно говорит «фон кнопки»
- `AI_CONTEXT.md` может ссылаться на конкретные `--ai-*` переменные для каждого компонента
- Theme Mapper (Фаза 3) получает чёткий API для генерации тематических оверрайдов
- Нет breaking changes: `--ui-*` сохраняются как глобальный уровень

### Отрицательные / Компромиссы

- Дублирование: каждый компонентный токен ссылается на глобальный (`--ai-button-bg: var(--ui-color-primary)`)
- Увеличение `tokens.css` примерно вдвое
- Разработчик должен знать о двух уровнях системы

### Приемлемость компромиссов

Дублирование в `tokens.css` — это **документация**: каждая строка явно говорит, как компонент использует глобальный токен. Это ценнее, чем краткость.

---

## Альтернативы, которые рассматривались

### A. Оставить только --ui-* токены

**Отклонено:** Нет изолированной точки кастомизации. `--ui-radius-md` влияет на все компоненты одновременно.

### B. Инлайн CSS Variables как scope

```css
.ui-button { --bg: var(--ui-color-primary); background: var(--bg); }
```

**Отклонено:** Приватные переменные с одиночными именами (`--bg`) создают конфликты при вложении компонентов. Нет согласованного namespace. AI-агент не может выйти за пределы компонентного файла.

### C. CSS @layer для приоритетов без токенов

**Отклонено:** `@layer` управляет специфичностью, но не именованием кастомизационных точек. Не решает задачу изолированной кастомизации для AI-агентов.

---

## Связанные задачи

- [x] Добавлен блок Component Tokens в `tokens.css`
- [x] Все 15 компонентов обновлены для использования `--ai-*` токенов
- [x] `docs/AI_CONTEXT.md` обновлён с полным Token Reference для `--ai-*`
- [x] Фаза 3: Theme Mapper генерирует оверрайды через `--ai-*` токены
