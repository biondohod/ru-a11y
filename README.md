# ru-a11y-toolkit

[![npm version](https://img.shields.io/npm/v/ru-a11y-toolkit)](https://www.npmjs.com/package/ru-a11y-toolkit)
[![license](https://img.shields.io/npm/l/ru-a11y-toolkit)](./LICENSE)

Набор инструментов для проверки веб-доступности React/JS-проектов по российским требованиям.

- [ГОСТ Р 52872-2019](https://meganorm.ru/Data/547/54797.pdf)
- [Постановление Правительства РФ №102](http://publication.pravo.gov.ru/document/0001202602100010?index=1)

Подробности и примеры находятся в README каждого пакета, этот файл - краткий обзор.

---

## Состав toolkit

| Пакет | Кратко |
| --- | --- |
| [`ru-a11y-toolkit-eslint`](./packages/eslint-preset/README.md) | Статический lint-доступности с русскими сообщениями и пресетами ГОСТ/№102. |
| [`ru-a11y-toolkit-overlay`](./packages/react-overlay/README.md) | Runtime-панель в браузере для визуализации нарушений в dev-режиме. |
| [`ru-a11y-toolkit-cli`](./packages/cli/README.md) | CLI-аудит готовых URL (Puppeteer + axe-core) с отчетами `console/json/html`. |
| [`ru-a11y-toolkit-visually-impaired`](./packages/visually-impaired/README.md) | Режим повышенной читабельности для конечных пользователей сайта. |

---

## Установка

Все инструменты сразу:

```bash
npm install --save-dev ru-a11y-toolkit
```

Или по отдельности:

```bash
npm install --save-dev ru-a11y-toolkit-eslint
npm install --save-dev ru-a11y-toolkit-cli
npm install --save-dev ru-a11y-toolkit-overlay
npm install ru-a11y-toolkit-visually-impaired
```

---

## Модули: подключение и что ожидать

### `ru-a11y-toolkit-eslint`

ESLint-пакет для раннего обнаружения проблем доступности в JSX/TSX еще до запуска приложения. Сообщения правил русскоязычные и привязаны к ГОСТ/№102, поэтому результаты сразу понятны разработке и QA.

Быстрый старт:

```js
const ruA11y = require('ru-a11y-toolkit-eslint');
module.exports = [ruA11y.configs['gost-aa']];
```

Что ожидать:

```text
✖ Отсутствует ссылка пропуска навигации
  src/App.jsx:3:5  @ru-a11y/gost-a11y/require-skip-link
```

Подробнее: [`packages/eslint-preset/README.md`](./packages/eslint-preset/README.md)

---

### `ru-a11y-toolkit-overlay`

React-overlay показывает runtime-нарушения прямо поверх интерфейса в dev-режиме. Это ускоряет исправления, потому что проблемный элемент можно увидеть и проверить сразу в браузере.

Быстрый старт:

```tsx
import { RuA11yOverlay } from 'ru-a11y-toolkit-overlay';

{process.env.NODE_ENV === 'development' && <RuA11yOverlay />}
```

Что ожидать:

```text
В dev-режиме появится панель с количеством нарушений,
группировкой по принципам и подсветкой проблемных элементов на странице.
```

Подробнее: [`packages/react-overlay/README.md`](./packages/react-overlay/README.md)

---

### `ru-a11y-toolkit-cli`

CLI-аудитор проверяет уже работающие страницы по URL через `Puppeteer + axe-core` и формирует общий отчет. Удобен для CI/CD, регресс-проверок и nightly-сканов.

Быстрый старт:

```bash
ru-a11y-cli https://example.com --format html --output ./reports
```

Что ожидать:

```text
Проверено страниц: 1
Выявлено нарушений: 3
```

Подробнее: [`packages/cli/README.md`](./packages/cli/README.md)

---

### `ru-a11y-toolkit-visually-impaired`

Пакет добавляет переключаемый режим повышенной читабельности для конечного пользователя: контраст, увеличенный шрифт, усиленный фокус и снижение визуального шума. Используется как UX-дополнение к lint/runtime проверкам.

Быстрый старт:

```tsx
import { useVisuallyImpaired } from 'ru-a11y-toolkit-visually-impaired';
import 'ru-a11y-toolkit-visually-impaired/styles/visually-impaired.css';
```

Что ожидать:

```text
После toggle() на <html> добавляется класс ru-a11y-visually-impaired,
а интерфейс переключается в высококонтрастный режим с крупным шрифтом.
```

Подробнее: [`packages/visually-impaired/README.md`](./packages/visually-impaired/README.md)

---

## Документация пакетов

- [`packages/eslint-preset/README.md`](./packages/eslint-preset/README.md)
- [`packages/cli/README.md`](./packages/cli/README.md)
- [`packages/react-overlay/README.md`](./packages/react-overlay/README.md)
- [`packages/visually-impaired/README.md`](./packages/visually-impaired/README.md)

---

## Разработка

```bash
git clone https://github.com/biondohod/ru-a11y.git
cd ru-a11y
npm install
npm run test:all
```

## Лицензия

MIT © [biondohod](https://github.com/biondohod)

