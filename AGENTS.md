# AGENTS.md — Инструкции для ИИ-ассистентов

Статический сайт-документация «Программирование Пионер Мини 2 и Пионер Базовый»
(22 урока + 8 страниц разбора примеров, 12 разделов, русский язык).
Сайт генерируется **Eleventy (11ty) v3**; интерактив — vanilla JS (ES-модули, без фреймворков).
Серверной части нет — чистая статика + nginx. Метаданные уроков — в `lessons.json`.
Прод: `https://pioneer.nayanovaacademy.ru`.

## ⚠️ Критические правила

1. **`lessons.json` — единственный источник истины** для метаданных уроков (number, slug, title,
   section, description, duration, complexity). Генерируемые файлы НЕ редактировать вручную:
   `src/js/config/courseData.js`, `src/_data/assetsHash.json`, `_site/sw.js` и всё содержимое `_site/`.
2. **`src/js/config/courseData.js` ГЕНЕРИРУЕТСЯ** из `lessons.json` (npm run build:config-meta).
   Ручная правка недопустима и будет затёрта при следующем build.
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
8. **localStorage/sessionStorage**: ключи с префиксом `pioneer-web-`, доступ только через `utils.js`
   (`storageGet/storageSet`, `ssGet/ssSet`).
9. **Service worker регистрируется только в продакшене** (`sw-register.js` пропускает localhost).

## 🗺 Три типа страниц

| Тип | Расположение | URL | В `lessons.json`? | На главной/в гамбургере/поиске? | Prev/next |
|---|---|---|---|---|---|
| **Урок** | `src/NN-slug.md` | `/NN-slug/` | да | да | да (по `pageNumber`) |
| **Разбор примеров** | `src/examples/<slug>.md` | `/examples/<slug>/` (пермалинк) | **нет** | нет | нет |
| **Справочник SDK2** | `src/sdk2/*.njk` | `/sdk2/...` (пермалинк) | **нет** | только отдельные ссылки | свой `.bottom-controls` |

Страницы разбора (`src/examples/*.md`, 8 шт.: mission, get-telemetry, camera, aruco,
rc-channels, human-tracking, wasd-flight, events) не имеют `pageNumber`, поэтому
`eleventyComputed` даёт им null для `prevPage/nextPage/currentSection` — breadcrumb
«Главная › заголовок», футер без стрелок. Каждая ссылается «← Все разборы примеров» на `/09-examples/`,
а урок 9 содержит сводную таблицу разборов. **Не добавляйте их в `lessons.json`** — они не должны
смотреться «уроками» на главной. Коллекции Eleventy (`pages`, `sections`) собирают только `src/*.md`
(корень), поэтому файлы в `src/examples/` автоматически не попадают на главную.

### 📖 Справочник SDK2 (`/sdk2/`)

Постраничный API-справочник `pioneer_sdk2`/`pioneer_rknn`, портированный из папки `docs/`
(генератор на Python). Страницы строятся Eleventy-пагинацией по данным `src/_data/sdk2.json`:

| Шаблон | Пагинация | Пермалинк |
|---|---|---|
| `src/sdk2/index.njk` | — | `/sdk2/` |
| `src/sdk2/category.njk` | `sdk2.categories` → `cat` | `/sdk2/{{ cat.slug }}/` |
| `src/sdk2/method.njk` | `sdk2.methods` → `m` | `/sdk2/{{ m.category }}/{{ m.slug }}/` |
| `src/sdk2/examples.njk` | — | `/sdk2/examples/` |
| `src/sdk2/example-group.njk` | `sdk2.groups` → `g` | `/sdk2/examples/{{ g.slug }}/` |
| `src/sdk2/example.njk` | `sdk2.examples` → `e` | `/sdk2/examples/{{ e.group }}/{{ e.stem }}/` |

- **Данные генерируются** из `docs/_data.py` и `docs/_examples.py` скриптом
  `python tools/export-sdk2-data.py` → `src/_data/sdk2.json` (коммитится; при обновлении
  исходников docs перезапустите скрипт). Исходный код примеров подтягивается из
  `gf/pioneer-sdk2-example/`.
- `title`/`description`/`crumbs` для этих страниц считаются в `src/_data/eleventyComputed.js`
  по alias пагинации (`m`/`cat`/`g`/`e`) — front matter Eleventy шаблонит только `permalink`.
- Стили — `src/css/_sdk2.css` (подключён в `src/css/index.css`). Точки входа: баннер на
  главной (`layout-index.njk`), пункт в `hamburger-panel.njk`, ссылки в уроках 5 и 12,
  записи в `sitemap.njk`. В `lessons.json` **не добавлять**.

## 🔧 Команды (Node ≥ 18, Windows PowerShell)

```bash
npm install                 # установка зависимостей
npm start                   # дев-режим: npx @11ty/eleventy --serve
npm run build               # полная сборка в _site/
npm run build:dev           # сборка без service worker
npm run clean               # удаление _site/ и node_modules (PowerShell-совместимый)
npm run deploy              # деплой (powershell deploy.ps1), есть -DryRun и -SkipBuild
```

> В dev-режиме `eleventy.after` пересобирает CSS/JS (только при запуске с `--serve`/`--watch`).
> После правки `lessons.json` запустите `npm run build:config-meta` (+ `build:assets-hash`), иначе
> courseData.js/assetsHash не обновятся.

## 🏗 Структура

```
src/*.md                     # 22 урока 01-overview … 22-glossary (контент — предсобранный HTML)
src/404.md                   # страница 404 (permalink /404.html; nginx error_page)
src/examples/*.md            # 8 страниц разбора примеров (permlinks /examples/<slug>/)
src/sdk2/*.njk               # справочник SDK2 (/sdk2/...; пагинация по src/_data/sdk2.json)
src/index.njk                # точка входа главной (layout-index.njk)
src/robots.txt.njk           # robots.txt; src/sitemap.njk → /sitemap.xml
src/_includes/layout.njk     # шаблон страницы документации; layout-index.njk — главная
src/_includes/partials/      # site-footer.njk, hamburger-panel.njk (общие для обоих layout'ов)
src/_data/                   # site.json, lessonsData.cjs, examples.cjs (слаги разборов),
                             # sdk2.json (ГЕНЕРИРУЕТСЯ из docs/), eleventyComputed.js,
                             # assetsHash.json (ГЕНЕРИРУЕТСЯ)
src/css/index.css            # точка входа CSS (12 partials в фиксированном порядке)
src/js/script.js             # точка входа JS (ESM); initApp() на DOM-ready
src/js/theme-init.js         # мини-скрипт anti-FOUC (iife, подключается в <head>, НЕ модуль)
src/js/modules/*.js          # theme, hamburger, scroll-progress, toc, search, keyboard-nav,
                             # scroll-restore, sw-register, utils
src/js/config/*.js           # constants.js, courseData.js (ГЕНЕРИРУЕТСЯ из lessons.json)
lessons.json                 # метаданные 22 уроков + секции (источник истины)
eleventy.config.mjs          # конфиг; md-passthrough; фильтры relUrl/pad2/json; коллекции
build-*.mjs                  # скрипты сборки (clean, config-meta, css, js, assets-hash, sw)
deploy.ps1                   # деплой по SSH (DryRun/SkipBuild; guard на DEPLOY_REMOTE_PATH)
gf/pioneer-sdk2-example/     # локальный клон репозитория примеров (не деплоится, не коммитится)
pioneer.nayanovaacademy.ru   # nginx-конфиг (деплоится deploy.ps1)
```

## 🛠 Конвейер сборки

`npm run build` (порядок важен):
1. `build-clean.mjs` → полное удаление `_site/` (иначе накапливаются устаревшие каталоги
   от переименованных slug'ов — они попадают в precache SW и деплой)
2. `build-config-meta.mjs` → `src/js/config/courseData.js` из `lessons.json`
   (до build-js, т.к. esbuild бандлит этот файл)
3. `build-css.mjs` → `_site/css/main.css` (esbuild из `src/css/index.css`)
4. `build-js.mjs` → `_site/js/main.js` (esbuild, ESM, minified) + `_site/js/theme-init.js` (iife)
5. `build-assets-hash.mjs` → `src/_data/assetsHash.json` (mainCss, mainJs, themeInitJs)
6. `npx @11ty/eleventy` → `_site/{NN-slug}/index.html`, `_site/404.html`, `_site/examples/<slug>/`,
   robots.txt, sitemap.xml + passthrough (favicon). Сырые css/js в вывод НЕ копируются —
   сайт грузит только собранные main.css/main.js/theme-init.js с `?v=<hash>`
7. `build-sw.mjs` → `_site/sw.js` (последний шаг; сканирует ВСЕ файлы `_site/`; CACHE_NAME =
   хэш sha256 от путей+содержимого — SW обновляется при любом изменении контента)

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
  (`qs`, `qsa`, `on`, `debounce`, `throttle`, `storageGet`, `storageSet`, `ssGet`, `ssSet`).
- Порядок инициализации в `script.js`: theme → scrollProgress → keyboardNav → scrollRestore →
  (doc: toc) → (index: search) → hamburger → sw-register последним.
- `theme-init.js` — исключение: классический iife-скрипт в `<head>` (anti-FOUC), читает
  `pioneer-web-theme` из localStorage напрямую, вызовов utils не имеет. Не превращать в модуль.
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
- на главной нет ссылки на страницы, не перечисленные в `lessons.json`;
- в `_site/` нет каталогов, не соответствующих текущим slug'ам (clean-шаг отвечает за это);
- смена контента меняет CACHE_NAME в `_site/sw.js` (sw.js байт-в-байт не должен повторяться при
  изменении содержимого, иначе клиенты навсегда получат старый HTML из cache-first кэша).

## 🚀 Деплой (`deploy.ps1`)

1. Читает `.env` (`DEPLOY_SSH_HOST/PORT/USER/KEY/REMOTE_PATH`).
2. Собирает (флаг `-SkipBuild` пропускает), затем `tar` `_site/` по SSH; удалённо
   **полное `rm -rf` + распаковка** — без отката.
3. Деплоит nginx-конфиг (root `/var/www/pioneer.nayanovaacademy.ru/public/`). nginx: `try_files
   $uri $uri/ =404` + `error_page 404 /404.html` — несуществующие пути отдают настоящий
   статус 404 со статичной страницей, а не главную с 200 (soft-404).

## 🔒 Безопасность (не ломать)

- CSP в `pioneer.nayanovaacademy.ru` (`script-src 'self'`) — никаких внешних скриптов/CDN и inline-JS.
- Security-заголовки дублируются в КАЖДОМ location со своим `add_header` (html, assets, sw.js) —
  nginx не наследует add_header при наличии собственного. Добавляя location с add_header,
  дублируйте security-набор, иначе ответы location'а останутся без CSP/HSTS.
- `.env` и `ssh-private.key` (в корне `C:\websites\na\`) — никогда не печатать и не коммитить.
- `theme-init.js` подключается классическим скриптом (не inline) — CSP `'self'` это разрешает.
