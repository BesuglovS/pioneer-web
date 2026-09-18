# Pioneer-web — Программирование Пионер Мини 2

Документация по программированию образовательных квадрокоптеров **Геоскан Пионер Мини 2** и **Пионер Базовый**.

Статический сайт: [pioneer.nayanovaacademy.ru](https://pioneer.nayanovaacademy.ru)

## Описание

Справочный сайт из **10 уроков** в **7 разделах** плюс **8 страниц разбора примеров** (`/examples/<slug>/`): обзор платформы, быстрый старт, способы запуска, Pioneer SDK 2 (Python), нейросети на борту (RKNN), Lua, блочное ПО, Пионер Базовый, разбор репозитория `pioneer-sdk2-example` и ссылки.

Функции сайта:

- Содержание с боковой навигацией по заголовкам
- Поиск по разделам на главной
- Тёмная и светлая темы
- Хлебные крошки, переходы к предыдущей/следующей странице (кнопки + клавиши `←`/`→`, `h`/`l`)
- Подсветка кода Python/Lua — предсобранные токены `tok-*` прямо в HTML
- Адаптивный дизайн, мобильное меню разделов
- Service Worker для офлайн-кэширования (только в продакшене)

## Технологии

| Технология | Назначение |
|---|---|
| **Eleventy v3** | Генератор статических сайтов |
| **Nunjucks** | Шаблонизатор (layout-страницы и главная) |
| **esbuild** | Бандлер CSS и JS |
| **highlight.js** | Сборка подсветки на будущее (для новых markdown-фенсов) |
| Vanilla JS | Интерактив: ES-модули без фреймворков |

> Контент страниц — эталонный HTML (перенесён из прежнего самописного конструктора). Md-движок Eleventy работает в сквозном режиме: каждый `src/*.md` после front matter попадает в вывод как есть, без markdown-обработки. Это защищает пустые строки и отступы внутри `<pre>` блоков `codewrap`.

## Быстрый старт

```powershell
# Установка зависимостей
npm install

# Режим разработки (с автоперезагрузкой)
npm start

# Полная сборка
npm run build
```

Сайт будет доступен по адресу `http://localhost:8080` (или следующему свободному порту).

## Скрипты сборки

| Команда | Описание |
|---|---|
| `npm start` | Режим разработки с hot-reload |
| `npm run build` | Полная сборка для продакшена (7 шагов, включая sw.js) |
| `npm run build:dev` | Сборка без service worker |
| `npm run build:css` | Только CSS → `_site/css/main.css` |
| `npm run build:js` | Только JS + highlight.js |
| `npm run build:sw` | Генерация `_site/sw.js` |
| `npm run build:config-meta` | Перегенерация `courseConfig.json` из `lessons.json` |
| `npm run build:assets-hash` | Перегенерация `assetsHash.json` (кэш-бастер `?v=`) |
| `npm run clean` | Удаление `_site` и `node_modules` (PowerShell) |
| `npm run deploy` | Сборка + деплой через SSH (PowerShell) |
| `npm run deploy:dry` | Показ команд деплоя без выполнения |

## Структура проекта

```
pioneer-web/
├── src/                      # Исходники сайта
│   ├── _includes/            # Nunjucks-шаблоны (layout.njk, layout-index.njk)
│   ├── _data/                # Данные Eleventy (site.json, lessonsData.cjs,
│   │                         # eleventyComputed.js, courseConfig.json*, assetsHash.json*)
│   ├── css/                  # Стили (12 partials, index.css — точка входа)
│   ├── js/                   # JavaScript: config/ (константы, метаданные), modules/ (9 файлов)
│   ├── index.njk             # Главная страница
│   ├── 01-overview.md …      # 10 уроков (эталонный HTML внутри .md)
│   └── examples/             # 8 страниц разбора примеров (не в lessons.json)
│       ├── mission.md            → /examples/mission/
│       ├── get-telemetry.md      → /examples/get-telemetry/
│       ├── camera.md             → /examples/camera/
│       ├── aruco.md              → /examples/aruco/
│       ├── rc-channels.md        → /examples/rc-channels/
│       ├── human-tracking.md     → /examples/human-tracking/
│       ├── wasd-flight.md        → /examples/wasd-flight/
│       └── events.md             → /examples/events/
├── gf/pioneer-sdk2-example/  # Локальный клон репозитория примеров (источник кода для разборов)
├── lessons.json              # Метаданные уроков (источник истины)
├── eleventy.config.mjs       # Конфигурация Eleventy
├── build-*.mjs               # Скрипты сборки
├── deploy.ps1                # Деплой по SSH
├── pioneer.nayanovaacademy.ru # nginx-конфиг (деплоится deploy.ps1)
└── _site/                    # Сгенерированный сайт (результат сборки)
```

## Конвейер сборки (`npm run build`)

1. `build-css.mjs` → `_site/css/main.css` (esbuild из `src/css/index.css`)
2. `build-js.mjs` → `_site/js/main.js` (esbuild, ESM, minified)
3. `build-highlight.mjs` → `_site/js/hljs.min.js` (про запас для новых markdown-фенсов)
4. `build-config-meta.mjs` → `src/_data/courseConfig.json` из `lessons.json`
5. `build-assets-hash.mjs` → `src/_data/assetsHash.json`
6. `npx @11ty/eleventy` → `_site/{NN-slug}/index.html` + passthrough (css/js/favicon)
7. `build-sw.mjs` → `_site/sw.js` (последний шаг; сканирует весь `_site/` в precache)

## Деплой

Настройки SSH-деплоя задаются в `.env` (образец — `.env.example`):

```
DEPLOY_SSH_HOST=...
DEPLOY_SSH_PORT=22
DEPLOY_SSH_USER=root
DEPLOY_SSH_KEY=path/to/key
DEPLOY_REMOTE_PATH=/var/www/pioneer.nayanovaacademy.ru/public/
```

```powershell
npm run deploy          # сборка + деплой
npm run deploy:dry      # просмотр команд без выполнения
.\deploy.ps1 -SkipBuild # деплой без пересборки
```

Важно: деплой **полностью очищает** удалённую директорию (`rm -rf` + распаковка tar) — отката нет; путь обязан совпадать с указанным webroot, либо скрипт прерывается.

## Лицензия

Все права защищены. Академия Ньяяновой.
