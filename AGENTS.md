# AGENTS.md — Инструкции для ИИ-ассистентов

Статический сайт-документация «Программирование Пионер Мини 2 и Пионер Базовый»
(10 уроков + 8 страниц разбора примеров, 7 разделов, русский язык).
Сайт генерируется **Eleventy (11ty) v3**; интерактив — vanilla JS (ES-модули, без фреймворков).
Серверной части нет — чистая статика + nginx. Метаданные уроков — в `lessons.json`.
Прод: `https://pioneer.nayanovaacademy.ru`.

## ⚠️ Критические правила

1. **`lessons.json` — единственный источник истины** для метаданных уроков (number, slug, title,
   section, description, duration, complexity). Генерируемые файлы НЕ редактировать вручную:
   `src/_data/courseConfig.json`, `src/_data/assetsHash.json`, `_site/sw.js` и всё содержимое `_site/`.
2. **`src/js/config/courseData.js` дублирует метаданные на клиенте и синхронизируется вручную** —
   при изменении `lessons.json` обновляйте и его, и `src/_data/courseConfig.json` (через `build:config-meta`).
3. **Контент страниц — эталонный HTML**, НЕ Markdown (перенесён из прежнего самописного конструктора).
   Хранится в `src/NN-slug.md` как чистый HTML **с предподсветленными токенами `tok-*`**
   (`tok-c` комментари, `tok-k` ключевое слово, `tok-n` число, `tok-b` builtin, `tok-s` строка).
   НЕ пытайтесь «переконвертировать» его обратно в чистый Markdown и не удаляйте классы `tok-*`.
4. **Md-движок — сквозной (passthrough)**: в `eleventy.config.mjs` вместо markdown-it
   подставлен `render: (str) => str`. Обычный markdown-it разрывал большие HTML-блоки на
   пустых строках (правило CommonMark html_block) — внутрь `<pre><code class="codewrap">`
   попадали лишние `<p>` и терялись отступы Python-кода. Не возвращайте markdown-обработку,
   если только не переписаны ВСЕ страницы.
5. **Ссылки между страницами**: уроки — `/NN-slug/` (например `/05-sdk2/`), страницы разбора
   примеров — `/examples/<slug>/`. Не использовать старые `*.html`-ссылки.
6. **`_site/` — вывод сборки.** Правки только в `src/`, затем `npm run build`.
7. **Не коммитьте** `.env`, `_site/`, `node_modules/`, `gf/` (см. `.gitignore`).
8. **localStorage**: ключи с префиксом `pioneer-web-`, доступ только через `utils.js`.
9. **Service worker регистрируется только в продакшене** (`sw-register.js` пропускает localhost).

## 🗺 Два типа страниц

| Тип | Расположение | URL | В `lessons.json`? | На главной/в гамбургере/поиске? | Prev/next |
|---|---|---|---|---|---|
| **Урок** | `src/NN-slug.md` | `/NN-slug/` | да | да | да (по `pageNumber`) |
| **Разбор примеров** | `src/examples/<slug>.md` | `/examples/<slug>/` (пермалинк) | **нет** | нет | нет |

Страницы разбора (`src/examples/*.md`, 8 шт.: mission, get-telemetry, camera, aruco,
rc-channels, human-tracking, wasd-flight, events) не имеют `pageNumber`, поэтому
`eleventyComputed` даёт им null для `prevPage/nextPage/currentSection` — breadcrumb
«Главная › заголовок», футер без стрелок. Каждая ссылается «← Все разборы примеров» на `/09-examples/`,
а урок 9 содержит сводную таблицу разборов. **Не добавляйте их в `lessons.json`** — они не должны
смотреться «уроками» на главной. Коллекции Eleventy (`pages`, `sections`) собирают только `src/*.md`
(корень), поэтому файлы в `src/examples/` автоматически не попадают на главную.

## 🔧 Команды (Node ≥ 18, Windows PowerShell)

```bash
npm install                 # установка зависимостей
npm start                   # дев-режим: npx @11ty/eleventy --serve
npm run build               # полная сборка в _site/
npm run build:dev           # сборка без service worker
npm run clean               # удаление _site/ и node_modules (PowerShell-совместимый)
npm run deploy              # деплой (powershell deploy.ps1), есть -DryRun и -SkipBuild
```

> В dev-режиме `eleventy.after` пересобирает только CSS/JS. После правки `lessons.json` вручную
> запустите `npm run build:config-meta` (+ `build:assets-hash`), иначе данные не обновятся.

## 🏗 Структура

```
src/*.md                     # 10 уроков 01-overview … 10-links (контент — предсобранный HTML)
src/examples/*.md            # 8 страниц разбора примеров (permlinks /examples/<slug>/)
src/index.njk                # точка входа главной (layout-index.njk)
src/_includes/layout.njk     # шаблон страницы документации; layout-index.njk — главная
src/_data/                   # site.json, lessonsData.cjs, eleventyComputed.js,
                             # courseConfig.json (ГЕНЕРИРУЕТСЯ), assetsHash.json (ГЕНЕРИРУЕТСЯ)
src/css/index.css            # точка входа CSS (12 partials в фиксированном порядке)
src/js/script.js             # точка входа JS (ESM); initApp() на DOM-ready
src/js/modules/*.js          # theme, hamburger, scroll-progress, toc, search, keyboard-nav,
                             # scroll-restore, sw-register, utils
src/js/config/*.js           # constants.js, courseData.js (дублирует lessons.json)
lessons.json                 # метаданные 10 уроков + секции (источник истины)
eleventy.config.mjs          # конфиг; md-passthrough; фильтры relUrl/pad2/json; коллекции
build-*.mjs                  # скрипты сборки (css, js, highlight, config-meta, assets-hash, sw)
deploy.ps1                   # деплой по SSH (DryRun/SkipBuild; guard на DEPLOY_REMOTE_PATH)
gf/pioneer-sdk2-example/     # локальный клон репозитория примеров (не деплоится, не коммитится)
pioneer.nayanovaacademy.ru   # nginx-конфиг (деплоится deploy.ps1)
```

## 🛠 Конвейер сборки

`npm run build` (порядок важен):
1. `build-css.mjs` → `_site/css/main.css` (esbuild из `src/css/index.css`)
2. `build-js.mjs` → `_site/js/main.js` (esbuild, ESM, minified)
3. `build-highlight.mjs` → `_site/js/hljs.min.js` (про запас для новых markdown-фенсов)
4. `build-config-meta.mjs` → `src/_data/courseConfig.json` из `lessons.json`
5. `build-assets-hash.mjs` → `src/_data/assetsHash.json`
6. `npx @11ty/eleventy` → `_site/{NN-slug}/index.html`, `_site/examples/<slug>/index.html`
   + passthrough (css/js/favicon)
7. `build-sw.mjs` → `_site/sw.js` (последний шаг; сканирует ВСЕ файлы `_site/` — новые страницы
   попадают в precache автоматически)

## 📝 Редактирование контента

Front matter страницы-разбора (уроки — аналогично, плюс `pageNumber`/`pageSlug`):

```yaml
---
layout: layout.njk
title: "..."
description: "..."
permalink: "/examples/<slug>/"   # для страниц разбора; уроки используют pageNumber+pageSlug
---
```

- Тело — чистый HTML: `<h1>`, `<h2 id="...">`, `codewrap`/`tablewrap`/`docblock` контейнеры.
- **Блоки кода**: `<div class="codewrap"><pre><code data-lang="python">…</code></pre></div>`.
  Python-код подсвечивайте токенами `tok-*` вручную (сквозной md не подсвечивает ничего).
  Аналогично Lua (`data-lang="lua"`), bash, text, json.
- Пустые строки и отступы внутри `<pre>` — легитимное содержимое; passthrough их сохраняет.
- `relUrl`-фильтр не вызывается для контентных ссылок — заголовки layout-шаблона используют его
  сами; контентные ссылки пишите абсолютными (`/09-examples/`) — сайт деплоится в корень.
- `eleventyComputed.pageUrl` фолбэк на `page.url` — страницы без `pageNumber` получают
  корректные canonical-ссылки.

## 💻 Конвенции кода

### JavaScript (`src/js/`)
- ES-модули (`import`/`export`), `export function initXxx()`; DOM-хелперы из `utils.js`
  (`qs`, `qsa`, `on`, `debounce`, `throttle`, `storageGet`, `storageSet`).
- Порядок инициализации в `script.js`: theme → scrollProgress → keyboardNav → scrollRestore →
  (doc: toc) → (index: search) → hamburger → sw-register последним.
- Русские строки, лог-префиксы `[module]`.
- Модули не зависят от наличия уроков: on страницах разбора (`pageType === 'doc'`, сайдбар есть)
  работает общий toc/scroll-код, поиск (`search.js`) опирается на `courseData.js` — поэтому
  страницы разбора там не участвуют.

### CSS (`src/css/`)
- `_variables.css` первым (design tokens, светлые + тёмные) → `_reset` → `_typography` → `_layout`
  → `_components` → `_code` → `_tables` → `_toc` → `_hamburger` → `_index` → `_responsive` → `_print`.
  BEM-подобные имена. Ваши страницы используют уже готовые классы `codewrap`, `tablewrap`,
  `docblock`, `btn ghost`, `topic-card`.

## 🧪 Тестирование

Тестов, CI и линтера нет. Проверка вручную: `npm run build` → осмотр `_site/` →
smoke-тест через `npm start`. Типовые проверки:
- пустые строки и отступы внутри `codewrap` (регрессия - п.4 правил выше);
- новые страницы есть в `_site/sw.js` (precache);
- на главной нет ссылки на страницы, не перечисленные в `lessons.json`.

## 🚀 Деплой (`deploy.ps1`)

1. Читает `.env` (`DEPLOY_SSH_HOST/PORT/USER/KEY/REMOTE_PATH`).
2. Собирает (флаг `-SkipBuild` пропускает), затем `tar` `_site/` по SSH; удалённо
   **полное `rm -rf` + распаковка** — без отката.
3. Деплоит nginx-конфиг (root `/var/www/pioneer.nayanovaacademy.ru/public/`), nginx `try_files`
   пустых путей ведёт на `/index.html`.

## 🔒 Безопасность (не ломать)

- CSP в `pioneer.nayanovaacademy.ru` (`script-src 'self'`) — никаких внешних скриптов/CDN и inline-JS.
- `.env` и `ssh-private.key` (в корне `C:\websites\na\`) — никогда не печатать и не коммитить.
