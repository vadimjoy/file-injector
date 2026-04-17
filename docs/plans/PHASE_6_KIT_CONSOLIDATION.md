# Phase 6 — Kit Consolidation & Visual Cleanup

> **Горизонт:** v0.9.0 (перед Фазой 5 — экосистема / v1.0.0)
> **Статус:** draft / ожидает утверждения
> **Связанные документы:** [`MASTER_PLAN`](../localization/ru/MASTER_PLAN.md) · [`SCALABILITY_PLAN`](./SCALABILITY_PLAN.md) · [`PHASE_7_DEMO_PLAYGROUND`](./PHASE_7_DEMO_PLAYGROUND.md)

---

## 1. Контекст

После Фазы 3 и параллельного трека масштабируемости кит вырос с **15 до 54 CSS-компонентов**. Во время роста:

- MASTER_PLAN фиксировал только атомарный костяк (Фаза 1). Новые «организмы» (footer, pricing-card, feature-item, logo-cloud, chart-legend, chat, timeline, feed, toggle-item) добавлялись без ревизии Module Contract и без обновления атомарной иерархии.
- Появились **повторяющиеся шаблоны**, реализованные копипастом (цветные иконки-плитки, вертикальные ленты с коннекторами, цветные dot/badge-ы).
- Визуальный язык расплылся: тема `warm` уходит в «пекарню», `midnight` — в monospace-gimmick, `feature-item --dark` — в рекламу 2015-го. Пользователь называет это «циганщиной» — потеря сдержанного, солидного тона.
- Демо-страницы стали «кашей»: 29 из 54 демо используют inline `style=""` (всего **258 включений**), встречаются захардкоженные hex-цвета, iframe в `index.html` тянет ручные `min-height`.
- Набор перестал быть самодостаточным: в `feature-item` вшит `--ghost` вариант, которого нет в `button/tag/chip`; в `notification` есть `__icon--primary`, но импортировать его в `feed` нельзя — просто потому что «пусть будет свой».

Фаза 6 — это **рефлексивная пауза перед Фазой 5**. Её цель — вернуть киту атомарную чистоту, снять визуальный «шум», переупаковать демо. Фазы 4 и 5 после этого стартуют на консистентном фундаменте.

---

## 2. Цели фазы

1. **Атомарность по уровням** — каждая сущность занимает ровно одну ступень (foundation → atom → molecule → organism → template). Никаких «организмов, живущих в файле атома».
2. **Единый язык иконок-плиток и цветных dot-меток** — выделить в отдельный атом и удалить копии из `feature-item`, `feed`, `notification`, `timeline`, `chat`.
3. **Визуальная сдержанность** — обновить темы и дефолтные токены так, чтобы кит выглядел «солидно» (Notion/Linear/Stripe-grade), а не как промо-лендинг.
4. **Чистые HTML-демо** — 0 inline-стилей, 0 захардкоженных цветов, консистентный скелет.
5. **Самодостаточные атомы и демо** — каждый `.html` в `src/demos/` читаем и полезен как отдельный пример без внешнего контекста.
6. **Переупорядоченный `index.css`** — импорты сгруппированы по слоям (foundations / atoms / molecules / organisms).

---

## 3. Атомарная карта (предлагаемая)

> Полная таблица — 54 текущих компонента, распределены по 5 слоям.
> Legend: **✅ оставить** · **♻ переименовать/перенести** · **🔀 объединить** · **🆕 создать** · **❌ удалить**

### 3.1 Foundations (не BEM-компоненты, а «система»)

| Сущность | Файл сейчас | Действие | Комментарий |
|---|---|---|---|
| Tokens (глобальные + компонентные) | `tokens.css` | ✅ | — |
| Base reset | `base.css` | ✅ | — |
| States (JS-driven) | `states.css` | ✅ | — |
| Typography | `components/typography.css` | ♻ → `foundations/typography.css` | Это не компонент — это система шрифтов |
| Icon system (Font Awesome wrapper) | демо `icons.html` | 🆕 `foundations/icon.css` | Базовые классы `.ui-icon`, `.ui-icon--lg`, `.ui-icon--muted` — чтобы не тащить инлайн `style="font-size:20px"` в пяти демо |
| Color (swatch/tile/scale) | `components/color-swatch.css` | ♻ → `foundations/color.css` | Не UI-компонент, а визуализация палитры |
| Divider | `components/divider.css` | ✅ | Остаётся атомом |
| Kbd | `components/kbd.css` | ✅ | Остаётся атомом |

### 3.2 Atoms (1 сущность, 0 дочерних)

| Компонент | Действие | Заметки |
|---|---|---|
| `button` | ✅ | Эталон — оставляем как есть |
| `input` (+ `field`/`label`/`helper`/`error`) | ♻ | Разнести: оставить `input.css` чистым, `field.css` отдельно (меньший файл, понятнее), `label.css` включает Label+Helper+Error |
| `textarea` | ✅ | |
| `select` | ✅ | |
| `checkbox` | ✅ | |
| `radio` | ✅ | |
| `toggle` | ♻ | **Изъять** `toggle-item` из этого файла (см. ниже) |
| `slider` | ✅ | |
| `progress` | ✅ | |
| `spinner` | ✅ | |
| `avatar` | ✅ | |
| `badge` | ✅ | **Чёткая граница:** статичный цветной маркер (счётчик/статус-слово) |
| `tag` | ✅ | **Чёткая граница:** метка с opcional close/border, может быть интерактивной |
| `chip` | ✅ | **Чёткая граница:** интерактивный «фильтр-pill», имеет pressed-состояние |
| `status` (dot) | ✅ | Атом — точка-индикатор |
| `tooltip` | ✅ | |
| `skeleton` | ✅ | |
| `kbd` | ✅ | см. foundations |
| `divider` | ✅ | см. foundations |
| 🆕 `icon-tile` | 🆕 | **Новый атом.** Плитка-фон + иконка (квадратная/круглая, variant primary/success/warning/error/neutral/dark, размеры sm/md/lg). Заменяет: `feature__icon`, `feed__icon`, `timeline__dot` (с иконкой), `notification__icon`, `chat__header-icon` |
| 🆕 `dot` | 🆕 | **Новый атом.** Цветной маркер-точка. Заменяет: `legend__dot`, `status` (становится `.ui-dot`), `avatar__status`, timeline простой dot. Один источник правды для «цветной кружок рядом с текстом» |

### 3.3 Molecules (2–3 атома, простая композиция)

| Компонент | Действие | Заметки |
|---|---|---|
| `autocomplete` | ✅ | Input + panel |
| `search` | ✅ | Input + icon-tile + optional kbd |
| `file-upload` | ✅ | |
| `datepicker` | ✅ | Input + calendar-panel |
| `breadcrumb` | ✅ | |
| `pagination` | ✅ | |
| `alert` | ✅ | **Пересобрать** на icon-tile |
| `banner` | ♻ | **Слить** с `alert` через модификатор `ui-alert--banner` (full-width, без скруглений). Сейчас это клон с 95% общего кода |
| `callout` | ♻ | **Слить** с `alert` через модификатор `ui-alert--quote` (цитата с иконкой слева). То же: клон |
| `empty-state` | ✅ | **Пересобрать** на icon-tile (крупный размер) |
| `dropdown` | ✅ | |
| `rating` | ✅ | |
| `stat-card` | ✅ | **Пересобрать** на icon-tile |
| `card` | ✅ | Простой контейнер — остаётся |
| `notification` | ✅ | **Пересобрать** на icon-tile, удалить локальные `__icon--*` |
| `toggle-item` | ♻ → `molecules/form-row.css` | Обобщить: это не «toggle-строка», а «строка настройки» (label + desc + любой control). Переименовать в `ui-form-row` — можно класть внутрь toggle/checkbox/select. Закрывает будущие нужды без новых молекул |
| `color-swatch`/`color-scale`/`color-tile` | ♻ → foundations/color | см. 3.1 |
| `section-header` | ✅ | |
| 🆕 `toast` | — | Оставляем «на потом» (Фаза 5) — сейчас не создаём |

### 3.4 Organisms (композиция из 3+ молекул/атомов)

| Компонент | Действие | Заметки |
|---|---|---|
| `accordion` | ✅ | |
| `tabs` | ✅ | |
| `table` | ✅ | |
| `steps` | ✅ | |
| `modal` | ✅ | |
| `sidebar` | ✅ | |
| `navbar` | ✅ | |
| `feed` | 🔀 | **Объединить** с `timeline` → один `ui-timeline`. Варианты через модификаторы: `--compact` (feed-стиль: маленькая иконка, плотно), `--dated` (timeline-стиль: yyyy-mm-dd слева), `--milestone` (цветные dot-варианты) |
| `timeline` | 🔀 | см. выше. `feed.css` удаляется |
| `chat` | ✅ | **Убрать** `__header-icon` — использовать общий icon-tile |
| `chart-legend` | ✅ | **Убрать** локальный `__dot` — использовать общий `ui-dot` |
| `logo-cloud` | ✅ | |
| `footer` | ✅ | **Проверить:** `ui-footer--inverted` дублирует тёмную тему — либо убрать, либо задокументировать как сознательный «выбор оформления» |
| `pricing-card` | ✅ | |
| `feature-item` | ✅ | **Убрать** локальные `__icon--*` варианты — использовать общий icon-tile. Удалить `--dark` (некрасиво, ломает тему) |

### 3.5 Итого по действиям

| Действие | Кол-во | Компоненты |
|---|---:|---|
| Без изменений | 33 | button, textarea, select, checkbox, radio, … |
| Переименовать/перенести | 7 | typography, color-swatch, divider, kbd, toggle-item, input decomposition, banner/callout |
| Объединить | 3 | feed+timeline → timeline; banner/callout → alert-модификаторы |
| Удалить после мёржа | 3 | `feed.css`, `banner.css`, `callout.css` |
| Создать | 3 | `icon-tile`, `dot`, `icon` (foundations) |
| **Сухой остаток** | **~50** | (было 54) |

> **Принцип:** один паттерн — один файл — один BEM-блок. Если рисунок встречается у трёх компонентов, он выносится в атом.

---

## 4. Визуальная чистка («циганщина»)

### 4.1 Темы (`src/themes/*.json`)

| Тема | Проблема | Решение |
|---|---|---|
| `default.json` | — | Эталон, не трогаем |
| `dark.json` | — | Эталон, не трогаем |
| `corporate.json` | — | Проверить, но в целом консервативна |
| `warm.json` | **Verdana** + яркий оранжевый primary + `color.warning = #dc2626` (red) — это ломает смысл warning как отдельного статуса | 1. Заменить `font.family` на тот же Inter/system-stack, что в default (вариативность темы — только цвета/радиусы).<br>2. Смягчить primary до `#c2410c`.<br>3. Вернуть warning-оранжевый (`#d97706`), отдельно от error |
| `midnight.json` | Monospace как основной шрифт — гимик, который делает весь UI похожим на терминал | Убрать `font.family`, наследовать из default. Тема — про цвет, не про типографику |

**Правило:** тема задаёт **цвет + радиус + тень**. Шрифт и геометрия size-модификаторов — общая системная константа.

### 4.2 Цветные акценты в компонентах

- `feature-item --dark` — удалить. Чёрный квадрат с белой иконкой не согласуется ни с одной темой.
- `feature-item --ghost`, `feed --warning`, `notification --error`, `timeline --primary` — все это сливается в **один источник правды:** `icon-tile --variant` (см. §3.2).
- `rating` использует захардкоженные `#f59e0b`/`#fbbf24` — вынести в `--ai-rating-filled-color` / `--ai-rating-hover-color` (уже сделано в tokens.css, но значения захардкожены не через глобальный `ui-color-warning`). **Действие:** связать `--ai-rating-filled-color` с `--ui-color-warning` по умолчанию.

### 4.3 Радиусы (консистентность)

Сейчас `--ui-radius-xl` (16px) используют 5 компонентов, `--ui-radius-lg` (12px) — 7, смешение выглядит нервно.

**Предлагаемый стандарт:**

| Уровень | Радиус | Использование |
|---|---|---|
| `xs` (4px) | Inline-элементы | kbd, input-mono, dot |
| `sm` (6px) | Компактные атомы | badge, tag, chip, small button |
| `md` (8px) | Базовые атомы | input, button (default), select, checkbox, tooltip |
| `lg` (12px) | Молекулы-«карточки» | alert, callout, dropdown-menu, datepicker-panel, card |
| `xl` (16px) | Организмы-«поверхности» | modal, pricing-card, stat-card, chat |
| `full` | Круглые | avatar, progress-track, toggle, chip-pill |

**Действие:** привести все `--ai-*-radius` токены к этой шкале.

### 4.4 Тени

`--ui-shadow-md` у modal/dropdown/tooltip одинаковая — норма. Но `stat-card` использует `--ui-shadow-xs`, `pricing-card` — `--ui-shadow-sm`, `card` — `--ui-shadow-xs`. Разнобой.

**Правило:** статичная карточка — `xs`; интерактивная карточка на hover — `sm`; всплывающая поверхность — `md`; модалка — `lg`.

---

## 5. Атомарный контракт для каждого компонента

Расширяем существующий **Module Contract** (Фаза 1) на все 50 компонентов:

```
MODULE CONTRACT v2 для компонента X:
  1. SCOPE
     ✓ Файл X.css содержит только один BEM-блок .ui-X
     ✓ Все вариации — модификаторы .ui-X--*, .ui-X__elem, .ui-X__elem--*
     ✓ Файл не правит чужие классы (кроме разрешённых контекстных: .ui-field .ui-X)

  2. TOKENS
     ✓ Все цвета/радиусы/тени/размеры — через --ai-X-* или --ui-* токены
     ✓ Нет захардкоженных hex/rgb/px-значений (кроме анимаций/transform)
     ✓ Токены перечислены в AI_CONTEXT.md

  3. ATOMICITY
     ✓ Уровень компонента зафиксирован (foundation/atom/molecule/organism)
     ✓ Если компонент использует другой компонент — только через публичный HTML-контракт, без CSS-оверрайдов
     ✓ Если паттерн повторяется ≥ 2 раз — он вынесен в атом (icon-tile, dot)

  4. DEMO
     ✓ demos/X.html использует только классы кита + shared/demo-page.css
     ✓ 0 инлайн-стилей (кроме случаев демонстрации переменных --ai-*)
     ✓ 0 захардкоженных hex-цветов
     ✓ Демо работает автономно, без зависимости от соседних страниц
```

CI-проверка (трек F плана масштабируемости) должна быть расширена правилами 3 и 4.

---

## 6. Порядок импортов `src/css/index.css`

**Было:** плоский список из 52 строк.

**Станет:**

```css
@layer ai-kit.tokens, ai-kit.base, ai-kit.components, ai-kit.themes;

/* Layer 1: Design Tokens */
@import './tokens.css';

/* Layer 2: Base Reset */
@import './base.css';

/* Layer 3: Foundations */
@import './foundations/typography.css';
@import './foundations/icon.css';
@import './foundations/color.css';
@import './components/divider.css';
@import './components/kbd.css';

/* Layer 4: Atoms */
@import './components/button.css';
@import './components/field.css';
@import './components/input.css';
@import './components/textarea.css';
@import './components/select.css';
@import './components/checkbox.css';
@import './components/radio.css';
@import './components/toggle.css';
@import './components/slider.css';
@import './components/progress.css';
@import './components/spinner.css';
@import './components/avatar.css';
@import './components/badge.css';
@import './components/tag.css';
@import './components/chip.css';
@import './components/status.css';           /* dot */
@import './components/tooltip.css';
@import './components/skeleton.css';
@import './components/icon-tile.css';        /* new */

/* Layer 5: Molecules */
@import './components/card.css';
@import './components/alert.css';            /* включает banner/callout варианты */
@import './components/empty-state.css';
@import './components/search.css';
@import './components/file-upload.css';
@import './components/autocomplete.css';
@import './components/datepicker.css';
@import './components/breadcrumb.css';
@import './components/pagination.css';
@import './components/dropdown.css';
@import './components/rating.css';
@import './components/stat-card.css';
@import './components/notification.css';
@import './components/form-row.css';         /* ex-toggle-item */
@import './components/section-header.css';

/* Layer 6: Organisms */
@import './components/accordion.css';
@import './components/tabs.css';
@import './components/table.css';
@import './components/steps.css';
@import './components/modal.css';
@import './components/sidebar.css';
@import './components/navbar.css';
@import './components/timeline.css';         /* ex-feed объединён */
@import './components/chat.css';
@import './components/chart-legend.css';
@import './components/logo-cloud.css';
@import './components/footer.css';
@import './components/pricing-card.css';
@import './components/feature-item.css';

/* Layer 7: JS-Controlled States */
@import './states.css';
```

Группировка даёт AI-агенту и человеку мгновенно считываемую карту.

---

## 7. План работ (итеративно, 5 спринтов)

Каждый спринт = отдельный PR, зелёный CI, обновлённый `AI_CONTEXT.md`, обновлённый `CHANGELOG.md`.

### Sprint 6.1 — Foundations (1–2 дня)

1. Создать директорию `src/css/foundations/`.
2. Перенести `typography.css` → `foundations/typography.css` (без изменений API).
3. Создать `foundations/icon.css` (`.ui-icon`, `.ui-icon--sm/md/lg/xl`, `.ui-icon--muted/primary/success/warning/error`). Не ломать: Font Awesome продолжает работать, но inline-стили `style="font-size:20px"` заменяются классом.
4. Создать `foundations/color.css` (мигрировать `color-swatch.css` — `.ui-swatch`, `.ui-swatch-group`, `.ui-palette`, `.ui-color-tile`, `.ui-color-scale`).
5. Обновить `index.css` с группировкой.
6. Прогнать `npm run lint:coupling` и визуальный diff.

### Sprint 6.2 — Icon-tile & dot атомы (2–3 дня)

1. Создать `components/icon-tile.css` (`.ui-icon-tile`, варианты sm/md/lg, цвета primary/success/warning/error/neutral).
2. Создать `components/dot.css` или расширить `status.css` до полноценного `.ui-dot`.
3. Мигрировать `feature-item`, `feed`, `notification`, `timeline`, `chat__header-icon`, `empty-state`, `stat-card` на `.ui-icon-tile`.
4. Мигрировать `chart-legend__dot`, `avatar__status`, `chat__header-status::before` на `.ui-dot`.
5. Удалить локальные классы `__icon--primary/success/warning/error` из 5+ файлов.
6. Обновить демо: `feature-item.html`, `feed.html`, `timeline.html`, `notification.html`, `chart-legend.html`, `chat.html`, `stat-card.html`, `empty-state.html`.
7. Обновить `AI_CONTEXT.md` (новые атомы + depricate локальных классов).

### Sprint 6.3 — Слияние alert/banner/callout, feed/timeline (2 дня)

1. Перенести всё содержимое `banner.css` и `callout.css` в `alert.css` как `--banner`/`--quote` модификаторы.
2. Удалить `banner.css`, `callout.css`. Обновить index.css.
3. Мигрировать `banner.html`, `callout.html` → используют `ui-alert ui-alert--banner` / `ui-alert--quote`.
4. Перенести всё содержимое `feed.css` в `timeline.css` с модификатором `ui-timeline--compact` (feed-layout: маленькая плотная иконка).
5. Удалить `feed.css`. Переименовать демо `feed.html` → оставить как пример `timeline --compact`.
6. Переименовать `toggle-item` → `form-row` (`.ui-form-row`), обновить CSS/HTML/demos.

### Sprint 6.4 — Визуальная чистка (1 день)

1. Чистка `warm.json`: убрать Verdana, скорректировать оттенки.
2. Чистка `midnight.json`: убрать monospace как default.
3. Унификация радиусов по таблице §4.3.
4. Унификация теней по §4.4.
5. Связать `--ai-rating-*` c `--ui-color-warning`.
6. Удалить `feature-item --dark` вариант.
7. Решение по `footer --inverted`: оставить → в доке пометить как «design choice, не заменяет тёмную тему» / удалить.

### Sprint 6.5 — HTML-демо: zero inline-styles (2 дня)

1. Написать CI-правило «`style=` в `src/demos/*.html` = 0 использований» (скрипт `scripts/lint-demo-purity.js`).
2. Вынести все повторяющиеся inline-стили в утилитарные классы внутри `shared/demo-page.css` (или в `foundations/icon.css` / `foundations/color.css`).
3. Пройтись по 29 файлам-нарушителям: заменить `style="width:200px"` → `u-w-200`, `style="color:#4f46e5"` → `ui-text-accent`, `style="grid-template-columns:repeat(3,1fr)"` → `u-grid u-grid--3col`.
4. **Исключения:** демо-переменных-токенов (где мы демонстрируем, что пользователь может кастомизировать через `style="--ai-...: #..."`) — они помечаются комментарием `<!-- demo: token override -->`.
5. Удалить ручные `min-height` из `index.html` — использовать `iframe` resize-observer или стандартизированные классы `showcase__iframe--xl/xxl`.

### Sprint 6.6 — Module Contract v2 (1–2 дня)

1. Обновить `scripts/audit-coupling.js` с правилами §5.
2. Добавить скрипт `scripts/lint-tokens.js` — проверка захардкоженных hex/rgb в `src/css/components/*.css`.
3. Добавить скрипт `scripts/audit-atomic-level.js` — проверка, что organism не имеет «организменных» классов внутри (т. е. footer не содержит определений для navbar).
4. Полный прогон CI на всех 50 компонентах.
5. Обновить `docs/localization/en/SPEC.md` (атомарные контракты).

---

## 8. Критерии успеха Фазы 6

- [ ] 0 inline-`style=""` в `src/demos/*.html` (кроме отмеченных `demo: token override`)
- [ ] 0 захардкоженных hex/rgb в `src/css/components/*.css`
- [ ] Каждый BEM-блок живёт в одном файле; CSS-файлов в `components/` = 50 (было 52 + 2 merged-out + 3 new)
- [ ] `feed.css`, `banner.css`, `callout.css` удалены
- [ ] `icon-tile.css`, `dot.css` (или `status.css`), `foundations/icon.css`, `foundations/color.css` созданы
- [ ] `warm.json` и `midnight.json` не изменяют `font.family`
- [ ] `feature-item --dark` удалён
- [ ] Все 50 компонентов проходят Module Contract v2 (CI)
- [ ] `index.css` сгруппирован по слоям (foundations → atoms → molecules → organisms)
- [ ] `AI_CONTEXT.md` и `SPEC.md` синхронизированы с новой структурой
- [ ] Визуальный diff-ревью прошёл по всем 5 темам (`default/dark/midnight/corporate/warm`)
- [ ] Обновлён `MASTER_PLAN.md` — новая таблица Roadmap: Фаза 6 отмечена как ✅

---

## 9. Риски и компромиссы

| Риск | Митигация |
|---|---|
| Слияние `feed`→`timeline` ломает пользовательские HTML | Публикуем `MIGRATION.md`, оставляем `ui-feed` как alias 1 минорную версию |
| Удаление `feature__icon--dark` ломает существующие лендинги | То же: deprecation-warning через CI-lint, реальное удаление в v1.0.0 |
| Рефакторинг icon-tile трогает 7 файлов — большой PR | Дробим на 7 под-PR (по 1 компоненту) |
| Чистка `warm` темы меняет брендинг | Это желаемое изменение — фиксируем в ADR-0006 «Theme purity: color-only variation» |

---

## 10. Следующие шаги

1. ✅ Утвердить этот план (review by @vadimjoy)
2. → Создать ADR-0006 «Theme purity: color-only theme variation»
3. → Создать ADR-0007 «Icon-tile & dot as foundational atoms»
4. → Запустить Sprint 6.1 (Foundations)
5. → Параллельно: запустить работу по [`PHASE_7_DEMO_PLAYGROUND`](./PHASE_7_DEMO_PLAYGROUND.md) (интерактивные демо с controls-панелью)

---

*Живой документ. Обновляется по завершении каждого спринта.*
