# AI CSS Kit — CLI

> **Язык:** English | [Русский](../ru/cli.md)

> **Версия:** v0.8.0  
> **Связанный ADR:** [ADR-0005 CLI Agent Architecture](../adr/0005-cli-agent-architecture.md)  
> **Архитектура:** [Phase 4.1 CLI Architecture](../design/phase-4.1-cli-architecture.md)

> **Статус зрелости:** CLI-контур частично реализован, но пока не должен восприниматься как полностью стабильный продуктовый слой. По дорожной карте playground (подфаза 4.3) остаётся блокером для end-to-end зрелости CLI.

---

## Обзор

CLI генерирует HTML-разметку из описания на естественном языке. Это целевой верхний слой системы, который превращает запросы вида `"кнопка основного действия"` в HTML с классами ai-css-kit.

```
npm install ai-css-kit
npx ai-css-kit generate "основная кнопка"
```

**Ключевой принцип:** 3 из 4 этапов пайплайна полностью детерминированы и тестируемы без LLM. Только Intent Parser требует вызов LLM.

---

## Установка

```bash
# Как локальная зависимость
npm install ai-css-kit --save-dev

# Глобально
npm install -g ai-css-kit

# Через npx (без установки)
npx ai-css-kit generate "поле ввода"
```

---

## Быстрый старт

```bash
# Установите API-ключ
export OPENAI_API_KEY=sk-...

# Сгенерировать компонент
npx ai-css-kit generate "кнопка primary"

# Сгенерировать форму
npx ai-css-kit generate "форма регистрации: имя, email, пароль"

# Сохранить в файл
npx ai-css-kit generate "карточка с заголовком" -o card.html

# Другой провайдер
npx ai-css-kit generate "бейдж со статусом" -p anthropic
```

---

## Команды

### `generate`

Генерирует HTML-разметку из естественного языка.

```bash
ai-css-kit generate [options] <prompt...>
```

**Аргументы:**

| Аргумент | Описание |
|----------|----------|
| `<prompt...>` | Описание на естественном языке (разделённые пробелами) |

**Опции:**

| Флаг | По умолчанию | Описание |
|------|--------------|----------|
| `-t, --theme <name>` | `default` | Тема: `default`, `dark`, `midnight`, `corporate`, `warm` |
| `-o, --output <file>` | stdout | Путь к файлу вывода |
| `-f, --format <format>` | `html` | Формат: `html`, `json`, `snippet` |
| `-p, --provider <name>` | `openai` | Провайдер LLM: `openai`, `anthropic`, `ollama` |
| `-m, --model <model>` | зависит от провайдера | Имя модели |
| `--no-validate` | — | Пропустить валидацию |
| `--temperature <n>` | `0.1` | Температура LLM (0–2) |
| `--max-tokens <n>` | `2048` | Макс. токенов |

**Примеры:**

```bash
# Базовая генерация
ai-css-kit generate "primary button"

# Форма
ai-css-kit generate "login form: email and password fields"

# С темой
ai-css-kit generate "alert with warning" --theme midnight

# В файл
ai-css-kit generate "card component" -o card.html

# JSON-вывод
ai-css-kit generate "toggle switch" -f json

# Другой провайдер
ai-css-kit generate "input with error" -p ollama
```

---

### `validate`

Валидирует HTML-файл по правилам Module Contract.

```bash
ai-css-kit validate [options] <file>
```

**Аргументы:**

| Аргумент | Описание |
|----------|----------|
| `<file>` | HTML-файл для валидации |

**Опции:**

| Флаг | По умолчанию | Описание |
|------|--------------|----------|
| `--fail-on <severity>` | `error` | Ошибка при: `error`, `warning` |
| `--rules <json>` | `{}` | Переопределение серьёзности правил в JSON |

**Примеры:**

```bash
# Базовая валидация
ai-css-kit validate output.html

# Ошибка на warnings
ai-css-kit validate output.html --fail-on warning

# С переопределением правил
ai-css-kit validate output.html --rules '{"MISSING_LABEL":"warning"}'
```

---

### `context`

Утилиты для AI-контекста.

#### `context dump`

Выводит `AI_CONTEXT.md` в stdout. Полезно для отладки.

```bash
ai-css-kit context dump
```

---

## Конфигурация

### Файл конфигурации (`.ai-css-kit.config.js`)

Создайте в корне проекта или домашней директории:

```js
// .ai-css-kit.config.js
export default {
  provider: {
    provider: 'openai',
    model: 'gpt-4o',
    apiKey: process.env.OPENAI_API_KEY,
  },
  generate: {
    defaultTheme: 'default',
    defaultSize: 'md',
    defaultLayout: 'form',
    maxTokens: 2048,
    temperature: 0.1,
    validate: true,
  },
};
```

### Переменные окружения

| Переменная | Ключ конфига | Провайдер |
|------------|--------------|-----------|
| `OPENAI_API_KEY` | `config.provider.apiKey` | openai |
| `ANTHROPIC_API_KEY` | `config.provider.apiKey` | anthropic |
| `AI_CSS_KIT_PROVIDER` | `config.provider.provider` | все |
| `AI_CSS_KIT_MODEL` | `config.provider.model` | все |
| `AI_CSS_KIT_BASE_URL` | `config.provider.baseUrl` | все |
| `OLLAMA_BASE_URL` | `config.ollama.baseUrl` | ollama |
| `AI_CSS_KIT_TEMPERATURE` | `config.generate.temperature` | все |
| `AI_CSS_KIT_MAX_TOKENS` | `config.generate.maxTokens` | все |

### Приоритет конфигурации (последний выигрывает)

```
Defaults (хардкод)
  ← .ai-css-kit.config.js (поиск вверх от CWD)
    ← Переменные окружения
      ← CLI-флаги
```

---

## LLM-провайдеры

### OpenAI (по умолчанию)

Требует `OPENAI_API_KEY`:

```bash
export OPENAI_API_KEY=sk-...
ai-css-kit generate "button"
```

Модель по умолчанию: `gpt-4o`.

### Anthropic

Требует `ANTHROPIC_API_KEY`:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
ai-css-kit generate "input field" -p anthropic
```

Модель по умолчанию: `claude-3-5-sonnet-latest`.

### Ollama (локальный)

Работает локально без API-ключа. Требует Ollama на `localhost:11434`:

```bash
ollama serve  # в другом терминале
ai-css-kit generate "badge" -p ollama
```

Модель по умолчанию: `llama3`.

### OpenAI-совместимые провайдеры

Любой API с протоколом OpenAI Chat Completions (Groq, LM Studio, Together AI, Azure OpenAI):

```js
// .ai-css-kit.config.js
export default {
  provider: {
    provider: 'openai-compatible',
    model: 'mixtral-8x7b-32768',
    apiKey: process.env.GROQ_API_KEY,
    baseUrl: 'https://api.groq.com/openai/v1',
  },
};
```

```bash
ai-css-kit generate "form" -p openai-compatible
```

---

## Форматы вывода

### `html` (по умолчанию)

Полный HTML с обёрткой:

```bash
ai-css-kit generate "button" -f html
```

```html
<!-- Theme: default -->
<div class="ui-field ui-field--md">
  <button class="ui-button ui-button--primary ui-button--md">Submit</button>
</div>
```

### `snippet`

Только разметка компонента:

```bash
ai-css-kit generate "input" -f snippet
```

```html
<input type="text" class="ui-input ui-input--md" id="input-1">
```

### `json`

Структурированный вывод для программного использования:

```bash
ai-css-kit generate "button" -f json
```

```json
{
  "intent": { "layout": "form", "container": "none", "theme": "default" },
  "atoms": [...],
  "layout": { "html": "...", "requiredTheme": "default" },
  "validation": { "valid": true, "errors": [], "warnings": [] }
}
```

---

## Правила валидации

| Код правила | Серьёзность | Описание |
|------------|-------------|----------|
| `FIELD_WRAPPER` | error | Элементы формы внутри `.ui-field` |
| `LABEL_PRESENCE` | error | `.ui-field` содержит `.ui-label` |
| `FIELD_SIZE_MODIFIER` | error | `.ui-field` имеет модификатор размера |
| `NO_PARENT_MUTATION` | error | Нет cross-component селекторов |
| `BUTTON_VARIANT` | error | Кнопка имеет variant: primary/secondary/ghost |
| `VALID_THEME` | error | `data-theme` соответствует пресетам |
| `VALID_MODIFIERS` | warning | Только зарегистрированные модификаторы |

---

## Коды завершения

| Код | Значение |
|-----|----------|
| `0` | Успех |
| `1` | Общая / необработанная ошибка |
| `2` | Неверные аргументы или конфиг |
| `3` | Ошибка провайдера (auth, сеть, timeout) |
| `4` | Ошибка валидации |

---

## Troubleshooting

### "Provider requires an API key"

Установите переменную окружения:

```bash
# OpenAI
export OPENAI_API_KEY=sk-...

# Anthropic
export ANTHROPIC_API_KEY=sk-ant-...
```

Или в `.ai-css-kit.config.js`:

```js
export default {
  provider: { apiKey: 'ваш-ключ' },
};
```

### Ollama connection refused

Убедитесь, что Ollama запущен:

```bash
ollama serve
ai-css-kit generate "button" -p ollama
```

---

## Смотрите также

- [SPEC.md](SPEC.md) — спецификация компонентов
- [theming.md](theming.md) — темизация и система токенов
- [AI_CONTEXT.md](../../AI_CONTEXT.md) — контекст для AI-агентов
- [ADR-0005](../adr/0005-cli-agent-architecture.md) — ADR архитектуры CLI
- [Phase 4.1 CLI Architecture](../design/phase-4.1-cli-architecture.md) — полная технич. спецификация
