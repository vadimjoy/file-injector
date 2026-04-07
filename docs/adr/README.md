# Architectural Decision Records

Этот каталог содержит все ADR (Architectural Decision Records) проекта ai-css-kit.

ADR — это короткий документ, фиксирующий конкретное архитектурное решение: что решено, почему, и какие альтернативы были отклонены.

## Формат ADR

```markdown
# NNNN — Название решения
## Статус: [Proposed | Accepted | Deprecated | Superseded by NNNN]
## Контекст
## Решение
## Последствия
## Альтернативы, которые рассматривались
```

## Индекс

| № | Название | Статус | Дата |
|---|----------|--------|------|
| [0001](0001-atomic-decoupling.md) | Atomic Decoupling — запрет parent-selector mutations | Accepted | 2026-04-02 |
| [0002](0002-context-modifier-pattern.md) | Context Modifier Pattern для иконок и контекстного padding | Accepted | 2026-04-04 |
| [0003](0003-ai-token-naming.md) | Стандарт нейминга `--ai-[component]-[prop]`: компонентные токены | Accepted | 2026-04-04 |
| [0004](0004-theme-mapper-and-presets.md) | Theme Mapper, каскадные слои и библиотека пресетов | Accepted | 2026-04-07 |

## Создание нового ADR

1. Скопируй последний файл как шаблон
2. Увеличь номер на 1
3. Заполни все секции
4. Установи статус `Proposed`
5. Обнови эту таблицу
6. После обсуждения смени статус на `Accepted` или `Rejected`
