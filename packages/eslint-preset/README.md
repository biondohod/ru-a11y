# ru-a11y-toolkit-eslint

[![npm version](https://img.shields.io/npm/v/ru-a11y-toolkit-eslint)](https://www.npmjs.com/package/ru-a11y-toolkit-eslint)
[![license](https://img.shields.io/npm/l/ru-a11y-toolkit-eslint)](../../LICENSE)

> Часть [ru-a11y-toolkit](https://www.npmjs.com/package/ru-a11y-toolkit) — можно установить отдельно или в составе всего toolkit.

ESLint-пресет для автоматической проверки веб-доступности React/JSX-приложений согласно **российским нормативам**:

- **ГОСТ Р 52872-2019** «Интернет-ресурсы и другая информация, представленная в электронно-цифровой форме. Требования доступности» ([meganorm.ru](https://meganorm.ru/Data/547/54797.pdf))
- **Постановление Правительства РФ №102** от 07.02.2026 — требования к доступности сайтов государственных органов для инвалидов по зрению ([pravo.gov.ru](http://publication.pravo.gov.ru/document/0001202602100010?index=1))

> Все сообщения линтера — на **русском языке** с указанием конкретных пунктов ГОСТ и Постановления №102.

---

## Проблема

Большинство существующих ESLint-плагинов для доступности (например, `eslint-plugin-jsx-a11y`) реализованы для западного рынка: сообщения на английском, ссылки на WCAG. Российским разработчикам и аудиторам нужен инструмент, который:

1. **Говорит на русском** — понятные сообщения для всей команды
2. **Ссылается на российские нормативы** — ГОСТ Р 52872-2019 и Постановление №102
3. **Покрывает специфику РФ** — требование lang="ru", государственный язык в CAPTCHA, масштабирование 200%
4. **Интегрируется в существующий проект** за 5 минут

---

## Быстрый старт

### Установка

```bash
npm install --save-dev ru-a11y-toolkit-eslint eslint
```

```bash
yarn add -D ru-a11y-toolkit-eslint eslint
```

> `eslint-plugin-jsx-a11y` устанавливается автоматически как зависимость пакета.

### Настройка `eslint.config.js` (ESLint 9 Flat Config)

**Базовый уровень** (ГОСТ Р 52872-2019, уровень A — критические ошибки):

```js
const ruA11y = require('ru-a11y-toolkit-eslint');
module.exports = [ruA11y.configs.recommended];
```

**Стандартный уровень** (ГОСТ AA + Постановление №102 — для гос. сайтов):

```js
const ruA11y = require('ru-a11y-toolkit-eslint');
module.exports = [ruA11y.configs['gost-aa']];
```

**Строгий уровень** (ГОСТ AAA — максимальная строгость):

```js
const ruA11y = require('ru-a11y-toolkit-eslint');
module.exports = [ruA11y.configs.strict];
```

### Настройка `.eslintrc.js` (ESLint 8 Legacy)

```js
module.exports = {
  extends: ['ru-a11y-toolkit-eslint/gost-aa'],
};
```

---

## Уровни конфигурации

| Конфиг        | Уровень        | Для кого                                                           |
| ------------- | -------------- | ------------------------------------------------------------------ |
| `recommended` | ГОСТ A         | Все проекты — базовая доступность                                  |
| `gost-aa`     | ГОСТ AA + №102 | Гос. органы, порталы, обязанные соответствовать Постановлению №102 |
| `strict`      | ГОСТ AAA       | Критически важные сервисы (Госуслуги и аналоги)                    |

---

## Пример вывода линтера

```
✖  Отсутствует ссылка пропуска навигации (ГОСТ Р 52872-2019 §5.2.3.1, уровень A).
   Добавьте <a href="#main">Перейти к содержанию</a> в начало <body>.
   [Постановление №102 п. а) — беспрепятственный доступ с клавиатуры и скринридеров]
   src/App.jsx:3:5  @ru-a11y/gost-a11y/require-skip-link

✖  Таблицы используются для вёрстки, что нарушает семантику (ГОСТ Р 52872-2019 §5.1.5).
   Используйте CSS Grid или Flexbox для вёрстки.
   [Постановление №102 п. а) — структура и смысловые связи должны определяться программой]
   src/Layout.jsx:15:5  @ru-a11y/gost-a11y/no-table-layout

⚠  Значение maximum-scale=1.0 ограничивает масштабирование ниже 200%.
   Установите maximum-scale=2.0 или выше.
   [Постановление №102 п. б) — текстовая информация должна масштабироваться не менее чем на 200%]
   public/index.html:7:3  @ru-a11y/gost-a11y/zoom-200-warning
```

### Красивый formatter для терминала

Пакет включает собственный formatter для ESLint с цветной подсветкой, разбиением по секциям и фрагментом исходного кода.

```bash
npx eslint "src/**/*.{js,jsx,ts,tsx}" -f ru-a11y-toolkit-eslint/formatter
```

Если хотите запускать lint сразу с этим оформлением без запоминания `-f`, используйте обёртку:

```bash
npx ru-a11y-eslint "src/**/*.{js,jsx,ts,tsx}"
```

Команда запускает локальный `eslint` и автоматически подставляет `ru-a11y-toolkit-eslint/formatter`, если вы не передали свой `-f` или `--format`.

Formatter показывает:

- текст ошибки;
- рекомендацию по исправлению;
- нормативные требования;
- фрагмент кода с указателем на колонку.

Пример:

```txt
ru-a11y ESLint report
════════════════════════════════════════════════════════════════════════
Файлов с нарушениями: 1
Ошибок: 1
Предупреждений: 0

Файл src/App.jsx
    Нарушение #1  ERROR  @ru-a11y/gost-a11y/jsx-a11y/alt-text
      Где: src/App.jsx:2:10
      Текст ошибки:
        Элемент <img> не имеет атрибута alt (ГОСТ Р 52872-2019 §5.1.1).
      Рекомендация по исправлению:
        Добавьте <img alt="Описание" />.
      Нормативные требования:
        • Постановление №102 п. г)
        • WCAG 1.1.1
      Фрагмент кода
           2   return <img src="/hero.png" />;
                    ^
```

---

## Карта правил

### Кастомные правила `@ru-a11y/gost-a11y/`

| Правило                  | Уровень | ГОСТ Р 52872-2019 | Постановление №102 | Описание                                                     |
| ------------------------ | ------- | ----------------- | ------------------ | ------------------------------------------------------------ |
| `require-skip-link`      | A       | §5.2.3.1          | п. а)              | Обязательная ссылка «Перейти к содержанию» в начале `<body>` |
| `require-lang-attr`      | A       | §5.2.4            | п. а), п. д)       | Обязательный `lang` на `<html>`, рекомендуется `lang="ru"`   |
| `require-title-semantic` | A       | §5.2.3            | п. е)              | Информативный `<title>`, формат «Орган — Услуга»             |
| `no-frame-structure`     | A       | §5.1.1            | п. а)              | Запрет `<frame>`/`<frameset>`, `<iframe>` требует `title`    |
| `table-requires-th`      | A       | §5.1.5            | п. а)              | Таблицы данных должны иметь `<th scope="...">`               |
| `no-table-layout`        | A       | §5.1.5            | п. а)              | Запрет таблиц для вёрстки, только для табличных данных       |
| `zoom-200-warning`       | AA      | —                 | п. б)              | Запрет блокировки масштабирования, `maximum-scale` ≥ 2       |

### Правила из `eslint-plugin-jsx-a11y` (подключаются в `gost-aa` и `strict`)

Все 26 правил переведены на русский язык и содержат ссылки на нормативные документы. Перевод реализован через перехват `context.report()` в runtime — оригинальная логика проверки не изменяется.

| Правило                                                  | ГОСТ / №102 / WCAG     | Описание                                              |
| -------------------------------------------------------- | ---------------------- | ----------------------------------------------------- |
| `jsx-a11y/alt-text`                                      | §5.1.1; №102 п. г)     | `alt` для `<img>`, `<area>`, `<input type="image">`   |
| `jsx-a11y/anchor-has-content`                            | §5.2.4; №102 п. ж)     | Ссылки должны содержать текст                         |
| `jsx-a11y/anchor-is-valid`                               | №102 п. ж)             | Корректный `href`, не использовать `<a>` как кнопку   |
| `jsx-a11y/aria-activedescendant-has-tabindex`            | WCAG 4.1.2; №102 п. а) | `tabIndex` для элементов с `aria-activedescendant`    |
| `jsx-a11y/aria-props`                                    | WCAG 4.1.2             | Допустимые ARIA-атрибуты                              |
| `jsx-a11y/aria-proptypes`                                | WCAG 4.1.2             | Корректные значения ARIA-атрибутов                    |
| `jsx-a11y/aria-role`                                     | WCAG 4.1.2             | Допустимые значения `role`                            |
| `jsx-a11y/aria-unsupported-elements`                     | WCAG 4.1.2             | Запрет ARIA на неподдерживающих элементах             |
| `jsx-a11y/autocomplete-valid`                            | WCAG 1.3.5             | Корректные значения `autoComplete`                    |
| `jsx-a11y/click-events-have-key-events`                  | №102 п. а); WCAG 2.1.1 | `onClick` → аналоги клавиатуры                        |
| `jsx-a11y/heading-has-content`                           | §5.2.3; №102 п. е)     | Заголовки не должны быть пустыми                      |
| `jsx-a11y/html-has-lang`                                 | §5.2.4; №102 п. а)     | `lang` на `<html>`                                    |
| `jsx-a11y/iframe-has-title`                              | §5.1.1; №102 п. а)     | `title` для `<iframe>`                                |
| `jsx-a11y/img-redundant-alt`                             | §5.1.1; №102 п. г)     | Запрет слов «фото», «картинка» в `alt`                |
| `jsx-a11y/interactive-supports-focus`                    | №102 п. а); WCAG 2.1.1 | Интерактивные элементы должны принимать фокус         |
| `jsx-a11y/label-has-associated-control`                  | §5.1.3; №102 п. м)     | `<label>` связан с полем ввода                        |
| `jsx-a11y/media-has-caption`                             | №102 п. г); WCAG 1.2.2 | Субтитры для `<video>`/`<audio>`                      |
| `jsx-a11y/mouse-events-have-key-events`                  | №102 п. а); WCAG 2.1.1 | `onMouseOver`/`onMouseOut` → `onFocus`/`onBlur`       |
| `jsx-a11y/no-access-key`                                 | WCAG 2.1.4             | Запрет `accessKey`                                    |
| `jsx-a11y/no-interactive-element-to-noninteractive-role` | WCAG 4.1.2             | Запрет неинтерактивной роли на интерактивном элементе |
| `jsx-a11y/no-noninteractive-element-interactions`        | WCAG 4.1.2             | Обработчики событий только на интерактивных элементах |
| `jsx-a11y/no-noninteractive-tabindex`                    | WCAG 2.4.3; №102 п. а) | `tabIndex` только на интерактивных элементах          |
| `jsx-a11y/no-redundant-roles`                            | WCAG 4.1.2             | Запрет явного дублирования неявной роли               |
| `jsx-a11y/no-static-element-interactions`                | WCAG 4.1.2             | Запрет обработчиков на статичных элементах            |
| `jsx-a11y/scope`                                         | §5.1.5                 | `scope` только на `<th>`                              |
| `jsx-a11y/tabindex-no-positive`                          | №102 п. а); WCAG 2.4.3 | Запрет `tabIndex > 0`                                 |

---

## Детали правил

### `require-skip-link` — Ссылка пропуска навигации

**Стандарт:** ГОСТ Р 52872-2019 §5.2.3.1 · Постановление №102 п. а)

Пользователи клавиатуры и скринридеров вынуждены проходить через всё меню на каждой странице без skip-link. Это нарушает требование Постановления №102 о беспрепятственном доступе к информации с клавиатуры.

```jsx
// ❌ Ошибка: отсутствует ссылка пропуска
function App() {
  return (
    <body>
      <nav>Длинное меню...</nav>
      <main id="main">Контент</main>
    </body>
  );
}

// ✅ Правильно
function App() {
  return (
    <body>
      <a href="#main" className="skip-link">
        Перейти к содержанию
      </a>
      <nav>Длинное меню...</nav>
      <main id="main">Контент</main>
    </body>
  );
}
```

<details>
<summary>CSS для визуально скрытой, но доступной skip-link</summary>

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  z-index: 100;
}
.skip-link:focus {
  top: 0;
}
```

</details>

---

### `require-lang-attr` — Атрибут языка страницы

**Стандарт:** ГОСТ Р 52872-2019 §5.2.4 · Постановление №102 п. а), п. д)

Атрибут `lang` позволяет скринридерам выбрать правильный голосовой профиль. Без него текст на русском будет озвучиваться с иностранным акцентом или вовсе непонятно.

Постановление №102 п. д) требует, чтобы CAPTCHA и подтверждающие элементы были на **государственном языке Российской Федерации**.

```jsx
// ❌ Ошибка: нет lang
<html>
  <body>Содержание</body>
</html>

// ✅ Правильно
<html lang="ru">
  <body>Содержание</body>
</html>
```

**Опция `enforceRussian`** (для гос. сайтов, в пресете `strict`):

```js
    '@ru-a11y/gost-a11y/require-lang-attr': ['error', {enforceRussian: true}]
```

---

### `require-title-semantic` — Информативный заголовок страницы

**Стандарт:** ГОСТ Р 52872-2019 §5.2.3 · Постановление №102 п. е)

Постановление №102 п. е) прямо требует: «заголовки страниц официальных сайтов описывают их тему или цель». Пустой или шаблонный `<title>` нарушает это требование.

```jsx
// ❌ Ошибка: пустой заголовок
<title></title>

// ❌ Ошибка: неинформативный заголовок
<title>Страница</title>
<title>Untitled Document</title>

// ✅ Правильно: формат "Название органа — Услуга"
<title>Министерство финансов — Подача налоговой декларации</title>
<title>Госуслуги — Запись к врачу</title>
```

---

### `no-table-layout` — Таблицы только для данных

**Стандарт:** ГОСТ Р 52872-2019 §5.1.5 · Постановление №102 п. а)

Таблицы для вёрстки нарушают семантический порядок: скринридер будет читать содержимое в порядке ячеек, а не в логическом порядке чтения.

```jsx
// ❌ Ошибка: таблица для вёрстки
<table border="0" cellpadding="0">
  <tr>
    <td><nav>Меню</nav></td>
    <td><main>Контент</main></td>
  </tr>
</table>

// ✅ Правильно: CSS Grid для вёрстки
<div style={{ display: 'grid', gridTemplateColumns: '200px 1fr' }}>
  <nav>Меню</nav>
  <main>Контент</main>
</div>

// ✅ Правильно: таблица для данных
<table>
  <caption>Расписание приёма граждан</caption>
  <thead>
    <tr><th scope="col">День</th><th scope="col">Время</th></tr>
  </thead>
  <tbody>
    <tr><td>Понедельник</td><td>9:00 – 18:00</td></tr>
  </tbody>
</table>
```

---

### `table-requires-th` — Заголовочные ячейки в таблицах

**Стандарт:** ГОСТ Р 52872-2019 §5.1.5 · Постановление №102 п. а)

Без `<th scope="...">` скринридер не может связать данные с их контекстом. Пользователь услышит: «ячейка — Иванов, ячейка — 100 000, ячейка — январь» без понимания что это имя, зарплата и месяц.

```jsx
// ❌ Ошибка: нет <th>
<table>
  <tr><td>Иванов</td><td>100 000</td></tr>
</table>

// ✅ Правильно
<table>
  <caption>Список сотрудников</caption>
  <thead>
    <tr>
      <th scope="col">Фамилия</th>
      <th scope="col">Оклад, руб.</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Иванов</td><td>100 000</td></tr>
  </tbody>
</table>
```

---

### `zoom-200-warning` — Масштабирование 200%

**Стандарт:** Постановление №102 п. б)

Постановление №102 п. б) устанавливает: «текстовая информация масштабируется **не менее чем на 200 процентов** исходного масштаба интернет-страницы без применения вспомогательных технологий, **потери функциональности и появления горизонтальной полосы прокрутки**».

```jsx
// ❌ Ошибка: запрет масштабирования
<meta name="viewport" content="width=device-width, user-scalable=no" />

// ❌ Ошибка: ограничение масштаба ниже 200%
<meta name="viewport" content="width=device-width, maximum-scale=1.5" />

// ✅ Правильно: масштабирование разрешено
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

// ✅ Правильно: явно разрешаем до 5x
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
```

```jsx
// ❌ Ошибка: мелкий шрифт — плохо масштабируется
<p style={{ fontSize: '10px' }}>Примечание</p>

// ✅ Правильно: относительные единицы
<p style={{ fontSize: '0.875rem' }}>Примечание</p>
```

---

### `no-frame-structure` — Запрет устаревших фреймов

**Стандарт:** ГОСТ Р 52872-2019 §5.1.1 · Постановление №102 п. а)

`<frame>` и `<frameset>` — устаревшие элементы HTML4, не поддерживаемые современными браузерами. Скринридеры не могут корректно обработать фреймовую структуру.

```jsx
// ❌ Ошибка: устаревшие элементы
<frameset cols="25%,75%">
  <frame src="nav.html" />
  <frame src="content.html" />
</frameset>

// ❌ Ошибка: iframe без title
<iframe src="map.html" />

// ✅ Правильно: iframe с описанием
<iframe
  src="https://example.gov.ru/map"
  title="Карта расположения офиса Министерства"
  width="600"
  height="400"
/>
```

---

## Как работает русификация jsx-a11y

`eslint-plugin-jsx-a11y` репортит ошибки через `context.report({ message: '...' })` с английскими строками напрямую (не через `messageId`). Поэтому подмена `meta.messages` не работает.

Пресет использует утилиту **`wrap-jsx-rule`**, которая:

1. Оборачивает оригинальное правило из `eslint-plugin-jsx-a11y`
2. Передаёт в `originalRule.create()` объект-обёртку над `context` с переопределённым `report`
3. Перед вызовом оригинального `report` проверяет английское `message` по маппингу `{ match, replace }`
4. Если нашли совпадение — заменяет на русский текст и передаёт дальше

```js
// Пример маппинга в messages.js
anchorHasContent: [
  {
    match: 'Anchors must have content',       // подстрока английского сообщения
    replace: 'Элемент <a> должен содержать текст...' +
             ' [ГОСТ Р 52872-2019 §5.2.4; Постановление №102 п. ж)]',
  },
],
```

Оригинальная **логика проверки не изменяется** — только текст сообщения об ошибке.

---

## Сравнение с `eslint-plugin-jsx-a11y`

| Возможность               | `eslint-plugin-jsx-a11y` | `ru-a11y-toolkit-eslint`              |
| ------------------------- | ------------------------ | ------------------------------------- |
| Язык сообщений            | Английский               | **Русский**                           |
| Стандарт                  | WCAG 2.1                 | **ГОСТ Р 52872-2019 + №102**          |
| Масштабирование 200%      | ❌                       | ✅ `zoom-200-warning`                 |
| Ссылка пропуска навигации | Частично                 | ✅ `require-skip-link`                |
| Требование lang="ru"      | ❌                       | ✅ `require-lang-attr`                |
| Запрет вёрстки таблицами  | ❌                       | ✅ `no-table-layout`                  |
| Информативный `<title>`   | ❌                       | ✅ `require-title-semantic`           |
| Готовые пресеты для РФ    | ❌                       | ✅ `recommended`, `gost-aa`, `strict` |
| Ссылки на российские НПА  | ❌                       | ✅ В каждом сообщении                 |

`ru-a11y-toolkit-eslint` **расширяет** `eslint-plugin-jsx-a11y`, а не заменяет его.

---

## Расширенная настройка

### Тонкая настройка отдельных правил

```js
// eslint.config.js
const ruA11y = require('ru-a11y-toolkit-eslint');

module.exports = [
  {
    ...ruA11y.configs['gost-aa'],
    rules: {
      ...ruA11y.configs['gost-aa'].rules,
      // Требовать lang="ru" для гос. сайта
      '@ru-a11y/gost-a11y/require-lang-attr': ['error', { enforceRussian: true }],
      // Дополнительные допустимые href для skip-link
      '@ru-a11y/gost-a11y/require-skip-link': [
        'error',
        {
          allowedHrefs: ['#main', '#content', '#основной-контент'],
        },
      ],
      // Строгая проверка масштабирования
      '@ru-a11y/gost-a11y/zoom-200-warning': [
        'error',
        { minFontSizePx: 16, checkInlineStyles: true },
      ],
      // Требовать <caption> для всех таблиц
      '@ru-a11y/gost-a11y/table-requires-th': [
        'error',
        { requireCaption: true, requireScope: true },
      ],
    },
  },
];
```

### Использование только плагина (без пресета)

```js
const ruA11y = require('ru-a11y-toolkit-eslint');

module.exports = [
  {
    plugins: { '@ru-a11y/gost-a11y': ruA11y },
    rules: {
      '@ru-a11y/gost-a11y/require-lang-attr': 'error',
      '@ru-a11y/gost-a11y/zoom-200-warning': 'error',
      '@ru-a11y/gost-a11y/require-skip-link': 'warn',
    },
  },
];
```

### Игнорирование отдельных мест

```jsx
// Отключить для конкретной строки
<table border="0"> {/* eslint-disable-line @ru-a11y/gost-a11y/no-table-layout */}

// Отключить для блока
/* eslint-disable @ru-a11y/gost-a11y/zoom-200-warning */
<meta name="viewport" content="width=device-width, maximum-scale=1.0" />
/* eslint-enable @ru-a11y/gost-a11y/zoom-200-warning */
```

---

## Разработка

```bash
# Клонировать репозиторий
git clone https://github.com/biondohod/ru-a11y.git
cd ru-a11y/packages/eslint-preset

# Запустить тесты
npm test

# Запустить тесты с watch-режимом
npm test -- --watch
```

---

## Связанные пакеты

- **[`ru-a11y-toolkit-overlay`](https://www.npmjs.com/package/ru-a11y-toolkit-overlay)** — Runtime-визуализатор ошибок доступности в браузере
- **[`ru-a11y-toolkit-cli`](https://www.npmjs.com/package/ru-a11y-toolkit-cli)** — CLI-сканер для проверки готовых страниц (Puppeteer + axe-core)
- **[`ru-a11y-toolkit-visually-impaired`](https://www.npmjs.com/package/ru-a11y-toolkit-visually-impaired)** — Плагин для внедрения в интерфейс режимов для слабовидящих (увеличение, контраст, монохром и т.д.)
- **[`ru-a11y-toolkit`](https://www.npmjs.com/package/ru-a11y-toolkit)** — umbrella-пакет, включающий все три модуля

---

## Нормативная база

«Интернет-ресурсы и другая информация, представленная в электронно-цифровой форме. Приложения для стационарных и мобильных устройств, иные пользовательские интерфейсы. Требования доступности для людей с инвалидностью и других лиц с ограничениями жизнедеятельности»

- Введён в действие с 1 апреля 2020 года
- Основан на WCAG 2.1, адаптирован для РФ
- Ссылка: [meganorm.ru](https://meganorm.ru/Data/547/54797.pdf)

### Постановление Правительства РФ №102 от 07.02.2026

«Требования к обеспечению для инвалидов по зрению доступности информации о деятельности государственных органов и органов местного самоуправления, содержащейся на официальных сайтах»

Ключевые требования, которые проверяет этот пресет:

| Пункт | Требование                                                                                 | Правило                                                                                                |
| ----- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| п. а) | Беспрепятственный доступ с клавиатуры, корректное считывание скринридерами                 | `require-skip-link`, `require-lang-attr`, `no-frame-structure`, `table-requires-th`, `no-table-layout` |
| п. б) | Масштабирование текста не менее 200% без потери функциональности и горизонтального скролла | `zoom-200-warning`                                                                                     |
| п. д) | CAPTCHA на государственном языке РФ                                                        | `require-lang-attr` (enforceRussian)                                                                   |
| п. е) | Заголовки страниц описывают их тему или цель                                               | `require-title-semantic`                                                                               |
| п. г) | Нетекстовый контент имеет текстовую альтернативу                                           | `jsx-a11y/alt-text`                                                                                    |
| п. ж) | Цель каждой ссылки определяется из её текста                                               | `jsx-a11y/anchor-has-content`                                                                          |
| п. м) | Формы имеют текстовые описания полей, ошибки доступны скринридерам                         | `jsx-a11y/label-has-associated-control`                                                                |

- Вступило в силу с **1 марта 2026 года**
- Ссылка: [pravo.gov.ru](http://publication.pravo.gov.ru/document/0001202602100010?index=1)

---

## Структура пакета

```
@ru-a11y/eslint-preset/
├── index.js                        # Экспорт плагина и всех правил
├── messages.js                     # Русскоязычные сообщения об ошибках
├── configs/
│   ├── recommended.js              # Уровень A — критические нарушения
│   ├── gost-aa.js                  # Уровень AA + Постановление №102
│   └── strict.js                   # Уровень AAA — максимальная строгость
├── rules/
│   ├── require-skip-link.js        # Ссылка пропуска навигации
│   ├── require-lang-attr.js        # Атрибут lang на <html>
│   ├── require-title-semantic.js   # Информативный <title> и структура заголовков
│   ├── no-frame-structure.js       # Запрет <frame>/<frameset>, title для <iframe>
│   ├── table-requires-th.js        # <th scope> в таблицах данных
│   ├── no-table-layout.js          # Запрет таблиц для вёрстки
│   ├── zoom-200-warning.js         # Масштабирование 200%
│   ├── jsx-a11y-ru.js              # 26 правил jsx-a11y с русскими сообщениями
│   └── wrap-jsx-rule.js            # Утилита перехвата context.report для перевода
└── tests/                          # Jest-тесты для каждого правила
    ├── jsx-a11y-ru.test.js         # Тесты обёрток jsx-a11y и утилиты wrap-jsx-rule
    ├── no-frame-structure.test.js
    ├── no-table-layout.test.js
    ├── require-lang-attr.test.js
    ├── require-skip-link.test.js
    ├── require-title-semantic.test.js
    ├── table-requires-th.test.js
    └── zoom-200-warning.test.js
```

---

## Лицензия

MIT © [biondohod](https://github.com/biondohod)
