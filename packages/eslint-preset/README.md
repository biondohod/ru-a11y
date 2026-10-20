# ru-a11y-toolkit-eslint

[![npm version](https://img.shields.io/npm/v/ru-a11y-toolkit-eslint)](https://www.npmjs.com/package/ru-a11y-toolkit-eslint)
[![license](https://img.shields.io/npm/l/ru-a11y-toolkit-eslint)](../../LICENSE)

ESLint plugin that checks React/JSX accessibility against
**GOST R 52872-2019** and **Russian Government Decree No. 102**. Every message is in Russian and
names the clause it is based on. Part of [ru-a11y-toolkit](../../README.md).

```text
src/App.jsx
  3:5  error  Отсутствует ссылка пропуска навигации (ГОСТ Р 52872-2019 §5.2.3.1, уровень A).
              Добавьте <a href="#main">Перейти к содержанию</a> в начало <body>.
              [Постановление №102 п. а) — беспрепятственный доступ с клавиатуры и скринридеров]
              ru-a11y/require-skip-link
```

## Install

```bash
npm install --save-dev ru-a11y-toolkit-eslint eslint
```

`eslint-plugin-jsx-a11y` is installed as a dependency. ESLint 8.57+ (flat config), 9 and 10 are supported.

## Configure

```js
// eslint.config.js
const ruA11y = require('ru-a11y-toolkit-eslint');

module.exports = [
  ruA11y.configs['gost-aa'],
  // TypeScript projects: add your parser as usual, e.g. typescript-eslint.
];
```

| Config        | Level                | Use for                                                   |
| ------------- | -------------------- | --------------------------------------------------------- |
| `recommended` | GOST level A         | Any project: violations that block assistive technologies |
| `gost-aa`     | GOST AA + Decree 102 | Public sector sites and services bound by Decree 102      |
| `strict`      | GOST AAA             | Critical services; also reports unused disable directives |

Configs are also exported as subpaths (`ru-a11y-toolkit-eslint/gost-aa`) and under the old
`*/flat` names. Rules are namespaced as `ru-a11y/<rule>`.

### Override options

```js
module.exports = [
  ruA11y.configs['gost-aa'],
  {
    rules: {
      'ru-a11y/require-lang-attr': ['error', { enforceRussian: true }],
      'ru-a11y/require-skip-link': ['error', { allowedHrefs: ['#app-content'] }],
      'ru-a11y/zoom-200-warning': ['error', { minFontSizePx: 14 }],
    },
  },
];
```

### Use single rules

```js
module.exports = [
  {
    plugins: { 'ru-a11y': ruA11y },
    rules: {
      'ru-a11y/require-lang-attr': 'error',
      'ru-a11y/jsx-a11y/alt-text': 'error',
    },
  },
];
```

## Pretty formatter

```bash
npx eslint "src/**/*.{js,jsx,ts,tsx}" -f ru-a11y-toolkit-eslint/formatter
# or the wrapper, which adds the formatter and picks up eslint.ru-a11y.config.{mjs,js,cjs}:
npx ru-a11y-eslint "src/**/*.{js,jsx,ts,tsx}"
```

The formatter splits each message into the problem, the fix and the normative references and
prints the offending line with a column pointer. Only ru-a11y and jsx-a11y rules are shown;
set `RU_A11Y_ESLINT_SHOW_ALL=1` to see every rule.

## Rules

### Custom rules

| Rule                     | GOST R 52872-2019 | Decree 102 | Checks                                                                     |
| ------------------------ | ----------------- | ---------- | -------------------------------------------------------------------------- |
| `require-skip-link`      | §5.2.3.1          | а)         | `<body>` starts with a skip link to the main content                       |
| `require-lang-attr`      | §5.2.4            | а), д)     | `<html>` has a valid BCP 47 `lang`; `enforceRussian` requires `ru`         |
| `require-title-semantic` | §5.2.3            | е)         | `<title>` is not empty or a placeholder; headings are not empty or skipped |
| `no-frame-structure`     | §5.1.1            | а)         | No `<frame>`/`<frameset>`; `<iframe>` has a meaningful `title`             |
| `table-requires-th`      | §5.1.5            | а)         | Data tables have `<th>` with a valid `scope` (and `<caption>` if set)      |
| `no-table-layout`        | §5.1.5            | а)         | Tables are not used for layout                                             |
| `zoom-200-warning`       | cl. 7.2           | б)         | Viewport allows 200% zoom; no tiny inline fonts or wide fixed widths       |
| `require-main-landmark`  | §5.1.5            | а)         | Pages expose `<main>` or `role="main"`                                     |
| `require-h1`             | §5.2.3            | е)         | Pages have a non-empty `<h1>`                                              |
| `no-autoplay-media`      | —                 | г)         | No autoplaying audio/video without `controls` or `muted`                   |

Page-level rules (`require-main-landmark`, `require-h1`) only run on page-like files:
`app/`, `pages/`, `routes/`, `layouts/` directories or `App`, `page`, `layout`, `route`,
`screen`, `view`, `index` file names.

<details>
<summary>Examples</summary>

```jsx
// require-skip-link
<body>
  <a href="#main" className="skip-link">Перейти к содержанию</a>
  <nav>…</nav>
  <main id="main">…</main>
</body>

// require-title-semantic: "Страница", "Untitled" and similar are reported
<title>Госуслуги — Запись к врачу</title>

// table-requires-th
<table>
  <caption>Расписание приёма граждан</caption>
  <thead><tr><th scope="col">День</th><th scope="col">Время</th></tr></thead>
  <tbody><tr><td>Понедельник</td><td>9:00–18:00</td></tr></tbody>
</table>

// zoom-200-warning: reported
<meta name="viewport" content="width=device-width, maximum-scale=1" />
<p style={{ fontSize: 10 }}>Примечание</p>
```

</details>

### Translated jsx-a11y rules

`gost-aa` and `strict` enable 26 rules from `eslint-plugin-jsx-a11y` exposed as
`ru-a11y/jsx-a11y/<rule>`, for example `alt-text`, `anchor-is-valid`, `label-has-associated-control`,
`media-has-caption`, `tabindex-no-positive`. Their detection logic is untouched; only the
messages are replaced with Russian texts that cite GOST, Decree 102 and WCAG.

jsx-a11y reports plain `message` strings rather than `messageId`s, so `meta.messages` cannot be
overridden. Instead the wrapper passes the original rule a context object whose `report()`
translates the message before forwarding it (`rules/jsx-a11y/wrap-rule.js`).

## Package layout

```text
index.js                plugin object and flat configs
configs/levels/         rule levels per config
rules/                  custom rules
rules/utils/jsx.js      shared JSX AST helpers
rules/utils/create-rule.js  rule metadata, catalog-based messages, page detection
rules/jsx-a11y/         translated jsx-a11y wrappers
messages.js             Russian message texts
formatter-pretty.js     terminal formatter
bin/ru-a11y-eslint      ESLint wrapper with the formatter preset
```

## License

MIT
