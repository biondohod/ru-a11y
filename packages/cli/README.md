# ru-a11y-toolkit-cli

[![npm version](https://img.shields.io/npm/v/ru-a11y-toolkit-cli)](https://www.npmjs.com/package/ru-a11y-toolkit-cli)
[![license](https://img.shields.io/npm/l/ru-a11y-toolkit-cli)](../../LICENSE)

CLI-сканер для автоматизированной проверки доступности веб-страниц по российским требованиям.

Пакет входит в экосистему [ru-a11y-toolkit](https://www.npmjs.com/package/ru-a11y-toolkit) и помогает проверять уже работающие страницы (локальные стенды, test/prod окружения, собранные SPA/SSR приложения) в headless-браузере.

Поддерживаемые ориентиры в текущей версии:

- ГОСТ Р 52872 (маппинг в отчетах на русском)
- Постановление Правительства РФ №102 от 07.02.2026
- правила `axe-core` как runtime-движок

---

## Что делает пакет

`ru-a11y-toolkit-cli` запускает аудит в `Puppeteer + axe-core`, нормализует найденные нарушения в единую модель `ru-a11y` и отдает результат в удобном формате:

- **`console`** — быстрый читаемый отчет в терминале;
- **`json`** — машинно-читаемый отчет для CI/CD и интеграций;
- **`html`** — отчет для команды, QA и аудиторов.

Дополнительно CLI может подключать статический аудит ESLint (`--with-eslint`) и объединять runtime + static результаты в один отчет.

---

## Возможности

- Проверка одной или нескольких страниц (в том числе из файла URL)
- Параллельный аудит (`--concurrency`) с контролем таймаута (`--timeout`)
- Выбор уровня строгости (`--standard`: `gost-a` / `gost-aa` / `gost-aaa`)
- Фильтрация нарушений через `--include` / `--exclude`
- Отключение отдельных правил axe через `--disable-rules`
- Единая схема нарушений для runtime (`origin=runtime-axe`) и ESLint (`origin=static-eslint`)
- Управляемый код завершения для CI (`0`, `1`, `2`)

---

## Установка

### Из npm

```bash
npm install --save-dev ru-a11y-toolkit-cli
```

или

```bash
yarn add -D ru-a11y-toolkit-cli
```

### В монорепозитории

```bash
npm install
npm run build -w packages/cli
```

Проверка установки:

```bash
node packages/cli/dist/cli.js --help
```

---

## Быстрый старт

Проверка одной страницы:

```bash
ru-a11y-cli https://example.com
```

Проверка нескольких страниц и сохранение JSON-отчета:

```bash
ru-a11y-cli https://example.com https://example.com/catalog --format json --output ./reports
```

Проверка URL из файла:

```bash
ru-a11y-cli --urls-file ./urls.txt --standard gost-aa --concurrency 3
```

Объединенный аудит (runtime + ESLint) с HTML-отчетом:

```bash
ru-a11y-cli https://example.com --with-eslint --project-root ../ru-a11y-playground --eslint-targets "src/**/*.{js,jsx,ts,tsx}" --format html --output ./reports
```

Только статический аудит ESLint (без URL):

```bash
ru-a11y-cli --with-eslint --project-root ../ru-a11y-playground --eslint-targets "src/**/*.{js,jsx,ts,tsx}"
```

---

## Использование

```bash
ru-a11y-cli <url...> [опции]
```

```bash
ru-a11y-cli --help
ru-a11y-cli --version
```

### Опции CLI

| Флаг | Тип | По умолчанию | Описание |
| --- | --- | --- | --- |
| `--urls-file <path>` | `string` | — | Файл со списком URL (по одному на строку). Пустые строки и строки, начинающиеся с `#`, игнорируются. |
| `--standard <level>` | `gost-a \| gost-aa \| gost-aaa` | `gost-aa` | Уровень строгости и базовый набор WCAG-тегов для `axe-core`. |
| `--wcag-tags <tags>` | `csv` | зависит от `--standard` | Явно задает теги `runOnly` для `axe-core` (например, `wcag2a,wcag2aa,wcag21aa`). |
| `--format <type>` | `console \| json \| html` | `console` | Формат итогового отчета. |
| `--output <dir>` | `string` | `ru-a11y-reports` | Директория сохранения файла отчета для `json`/`html`. |
| `--max-issues <n>` | `number` | `Infinity` | Порог нарушений для завершения с кодом `1`. |
| `--timeout <ms>` | `number` | `30000` | Таймаут проверки одной страницы. |
| `--concurrency <n>` | `number` | `2` | Число одновременных проверок URL (минимум `1`). |
| `--include <filters>` | `csv` | — | Оставляет только нарушения, где токен найден в `ruRuleCode`, `axeRuleId`, `principle` или `severity`. |
| `--exclude <filters>` | `csv` | — | Исключает нарушения по тем же полям. |
| `--disable-rules <ids>` | `csv` | — | Отключает указанные правила `axe-core` для runtime-проверки. |
| `--with-eslint` | `boolean` | `false` | Добавляет статический аудит ESLint в общий отчет. |
| `--eslint-targets <globs>` | `csv` | `src/**/*.{js,jsx,ts,tsx}` | Паттерны файлов для ESLint. |
| `--eslint-config <path>` | `string` | — | Явный путь к конфигурации ESLint. |
| `--project-root <path>` | `string` | текущая директория | Корень проекта для запуска ESLint. |

---

## Примеры сценариев

### 1) Аудит по списку URL с fail-fast для CI

```bash
ru-a11y-cli --urls-file ./urls.txt --format json --output ./reports --max-issues 0
```

Если найдено хотя бы одно нарушение, процесс завершится с кодом `1`.

### 2) Фокус на критичных проблемах

```bash
ru-a11y-cli https://example.com --include критичное
```

### 3) Исключить конкретные группы

```bash
ru-a11y-cli https://example.com --exclude незначительное,надежность
```

### 4) Отключить выбранные правила axe

```bash
ru-a11y-cli https://example.com --disable-rules color-contrast,landmark-one-main
```

### 5) Пользовательский набор тегов WCAG

```bash
ru-a11y-cli https://example.com --wcag-tags wcag2a,wcag2aa,wcag21aa --format html --output ./reports
```

### 6) Runtime + ESLint в одном отчете

```bash
ru-a11y-cli https://example.com --with-eslint --project-root ../ru-a11y-playground --eslint-targets "src/**/*.{js,jsx,ts,tsx}" --format json --output ./reports
```

---

## Форматы отчетов

### Console

Содержит:

- сводку (`Проверено страниц`, `Выявлено нарушений`);
- блоки по каждой странице/файлу;
- группировку по принципам: воспринимаемость, управляемость, понятность, надежность;
- для каждого нарушения: серьезность, селектор, код ru-a11y, `axeRuleId`, источник, ссылки на ГОСТ/№102, рекомендацию.

### JSON

Файл: `ru-a11y-report.json`

Структура верхнего уровня:

- `generatedAt`
- `scannedPages`
- `totalIssues`
- `pages[]`

Для каждого нарушения в `pages[].issues[]` сохраняются, в том числе:

- `ruRuleCode`, `axeRuleId`, `title`, `description`, `recommendation`
- `severity`, `principle`
- `gostRefs`, `post102Refs`, `wcagRefs`
- `origin` (`runtime-axe` или `static-eslint`)
- `ruleSource` (`overlay-rules-map`, `cli-gost-map`, `eslint-rules`, `fallback`)
- `source` (для ESLint обычно `filePath/line/column`, для runtime — `selector/snippet`)

### HTML

Файл: `ru-a11y-report.html`

Содержит:

- summary-блок с ключевыми метриками (runtime/ESLint, ошибки аудита, объекты без нарушений);
- навигацию по проверенным страницам/файлам с якорями и статус-бейджами;
- карточки объектов проверки с метаданными;
- раскрывающиеся (accordion) карточки нарушений с source, нормативными ссылками и рекомендациями;
- адаптивную верстку для просмотра отчета командой и аудиторами.

---

## Коды выхода

| Код | Когда возвращается |
| --- | --- |
| `0` | Нарушений нет или их число не превышает `--max-issues`. |
| `1` | Общее число нарушений больше порога `--max-issues`. |
| `2` | Ошибка CLI, ошибка парсинга аргументов или инфраструктурная ошибка проверки (например, страница не открылась). |

---

## Как работает фильтрация include/exclude

Фильтры `--include` и `--exclude` сравниваются по подстроке (без учета регистра) с четырьмя полями нарушения:

- `ruRuleCode`
- `axeRuleId`
- `principle`
- `severity`

Примеры:

- `--include color-contrast` — оставить нарушения конкретного правила;
- `--include управляемость` — оставить нарушения принципа Operable;
- `--exclude незначительное` — убрать low/minor нарушения.

---

## Интеграция в CI/CD

Базовый шаг (пример):

```bash
ru-a11y-cli --urls-file ./urls.txt --format json --output ./artifacts/a11y --max-issues 0
```

Рекомендуемый пайплайн:

1. хранить список проверяемых URL в отдельном файле;
2. запускать CLI на каждом pull request;
3. публиковать `ru-a11y-report.json` / `ru-a11y-report.html` как артефакты сборки;
4. использовать `--max-issues 0` для жесткой политики качества.

---

## Ограничения

> CLI автоматизирует значимую часть проверки, но не заменяет ручной аудит.

- Автоматический анализ не покрывает все критерии доступности (особенно сценарные UX-проверки).
- Динамически подгружаемый контент может требовать дополнительного сценария прогрева страницы перед проверкой.
- Для защищенных страниц (авторизация, SSO, VPN) может потребоваться отдельная настройка окружения запуска.
- Runtime-аудит обычно не знает точный файл/строку исходника без доп. интеграции source maps.

---

## Связь с другими модулями

`ru-a11y-toolkit` эффективнее всего в связке трех инструментов:

| Инструмент | Когда работает | Что покрывает |
| --- | --- | --- |
| [`ru-a11y-toolkit-eslint`](https://www.npmjs.com/package/ru-a11y-toolkit-eslint) | во время разработки | проблемы в JSX/TSX и статике кода |
| [`ru-a11y-toolkit-overlay`](https://www.npmjs.com/package/ru-a11y-toolkit-overlay) | dev-режим в браузере | проблемы реального DOM и визуальные подсказки |
| `ru-a11y-toolkit-cli` | CI/CD и регресс-аудит | готовые страницы и централизованный отчет |

---

## Нормативная логика и маппинг

CLI использует `axe-core` как технический движок и нормализует результаты через `src/mapping/gostMapping.ts`.

Маппинг связывает каждое нарушение с:

- внутренним кодом `ruRuleCode`;
- ссылками на ГОСТ и Постановление №102;
- рекомендацией по исправлению;
- принципом доступности и уровнем серьезности.

Если доступен экспорт `RU_A11Y_RULES` из `ru-a11y-toolkit-overlay`, CLI использует этот маппинг как приоритетный источник (`ruleSource=overlay-rules-map`).

---

## Разработка

```bash
git clone https://github.com/biondohod/ru-a11y.git
cd ru-a11y/packages/cli
npm install
npm run build
npm test
```

Полезно во время разработки:

```bash
npm run dev
npm run typecheck
```

---

## Структура пакета

```
ru-a11y-toolkit-cli/
  bin/
	ru-a11y-cli                 # Точка входа бинарника
  src/
	cli.ts                      # Парсинг аргументов и orchestration
	types.ts                    # Общие типы отчета
	config/
	  defaultConfig.ts          # Значения по умолчанию и стандарты
	mapping/
	  gostMapping.ts            # axe -> ru-a11y (ГОСТ/№102)
	  eslintMapping.ts          # ESLint -> ru-a11y
	runner/
	  puppeteerRunner.ts        # Runtime-аудит через headless Chromium
	  eslintRunner.ts           # Статический аудит ESLint
	report/
	  consoleReport.ts          # Терминальный отчет
	  jsonReport.ts             # JSON-отчет
	  htmlReport.ts             # HTML-отчет
  tests/
	parseArgs.test.ts
	gostMapping.test.ts
	jsonReport.test.ts
	htmlReport.test.ts
```

---

## Лицензия

MIT © [biondohod](https://github.com/biondohod)
