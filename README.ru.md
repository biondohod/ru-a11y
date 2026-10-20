# ru-a11y-toolkit

[![CI](https://github.com/biondohod/ru-a11y/actions/workflows/ci.yml/badge.svg)](https://github.com/biondohod/ru-a11y/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/ru-a11y-toolkit)](https://www.npmjs.com/package/ru-a11y-toolkit)
[![license](https://img.shields.io/npm/l/ru-a11y-toolkit)](./LICENSE)

**Набор инструментов для проверки веб-доступности React-приложений по российским требованиям.**
ESLint-правила, overlay для разработки, CLI-аудит для CI и режим для слабовидящих для
посетителей сайта. Все модули используют один каталог правил с русскими текстами и ссылками на
[ГОСТ Р 52872-2019](https://meganorm.ru/Data/547/54797.pdf) и
[Постановление Правительства РФ №102](http://publication.pravo.gov.ru/document/0001202602100010?index=1).

[English version](./README.md)

## Зачем

`eslint-plugin-jsx-a11y` и axe-core пишут по-английски и ссылаются на WCAG. Сайты госорганов
проверяют по ГОСТ Р 52872-2019 и, с 1 марта 2026 года, по Постановлению №102, где требования
сформулированы иначе и есть свои: масштабирование до 200% без горизонтальной прокрутки,
государственный язык в подтверждающих элементах, заголовки страниц, описывающие их цель.

Тулкит закрывает этот разрыв: каждое нарушение, где бы оно ни нашлось, описано по-русски,
со ссылкой на пункт ГОСТ, пункт Постановления №102 и критерий WCAG, и с конкретной рекомендацией.

## Пакеты

| Пакет                                                               | Что делает                                                                       |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [`ru-a11y-toolkit-core`](./packages/core)                           | Каталог: 115 правил с русскими текстами, нормативными ссылками и алиасами id.    |
| [`ru-a11y-toolkit-eslint`](./packages/eslint-preset)                | ESLint-плагин: 10 своих правил, 26 переведённых правил jsx-a11y, 3 flat-конфига. |
| [`ru-a11y-toolkit-overlay`](./packages/react-overlay)               | Overlay для dev-режима: axe-core и 44 собственные DOM-проверки, подсветка.       |
| [`ru-a11y-toolkit-cli`](./packages/cli)                             | CLI-аудит: Puppeteer + axe-core + ESLint, отчёты console / JSON / HTML / JUnit.  |
| [`ru-a11y-toolkit-visually-impaired`](./packages/visually-impaired) | Режим повышенной читаемости для посетителей: шрифт, контраст, интервалы, фокус.  |
| [`ru-a11y-toolkit`](./index.js)                                     | Umbrella-пакет со всеми модулями.                                                |

## Быстрый старт

```bash
npm install --save-dev ru-a11y-toolkit
```

ESLint (`eslint.config.js`, flat config, ESLint 8.57+):

```js
const ruA11y = require('ru-a11y-toolkit-eslint');

module.exports = [ruA11y.configs['gost-aa']];
```

Overlay в dev-режиме:

```tsx
import { RuA11yOverlay } from 'ru-a11y-toolkit-overlay';

{
  process.env.NODE_ENV === 'development' && <RuA11yOverlay preset="gost-aa" />;
}
```

Аудит страниц в CI:

```bash
npx ru-a11y-cli https://example.com --format junit --output ./reports --max-issues 0
```

Режим для слабовидящих:

```tsx
import { VisuallyImpairedOverlay } from 'ru-a11y-toolkit-visually-impaired';
import 'ru-a11y-toolkit-visually-impaired/styles/visually-impaired.css';

<VisuallyImpairedOverlay />;
```

## Покрытие

| Направление          | Проверок | Движок                                                 |
| -------------------- | -------: | ------------------------------------------------------ |
| Канонические правила |      115 | общий каталог метаданных                               |
| ESLint               |       36 | 10 своих + 26 правил jsx-a11y с переписанными текстами |
| Overlay (runtime)    |      148 | 104 правила axe-core + 44 собственные DOM-проверки     |

Автоматические проверки не заменяют ручной аудит: клавиатурные сценарии и работу со скринридером
нужно проверять вручную.

## Разработка

Нужен Node.js 22+.

```bash
git clone https://github.com/biondohod/ru-a11y.git
cd ru-a11y
npm install
npm run build
npm run check   # prettier, eslint, tsc и все тесты, как в CI
```

Подробности по каждому пакету в его README (на английском).

## Лицензия

MIT © [biondohod](https://github.com/biondohod)
