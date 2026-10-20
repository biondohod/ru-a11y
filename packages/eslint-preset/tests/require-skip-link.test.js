/**
 * Tests for the rule: require-skip-link
 * GOST R 52872-2019 §5.2.3.1; Decree No. 102, item a)
 */

'use strict';

const { RuleTester } = require('eslint');
const rule = require('../rules/require-skip-link');

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    parserOptions: { ecmaFeatures: { jsx: true } },
    sourceType: 'module',
  },
});

ruleTester.run('require-skip-link', rule, {
  // Valid: a skip link is present
  valid: [
    {
      name: 'body starts with a skip link to #main',
      code: `
        function App() {
          return (
            <body>
              <a href="#main">Перейти к содержанию</a>
              <nav>Навигация</nav>
              <main id="main">Контент</main>
            </body>
          );
        }
      `,
    },
    {
      name: 'skip link to #content',
      code: `
        function App() {
          return (
            <body>
              <a href="#content">Пропустить навигацию</a>
              <header>Шапка</header>
              <main id="content">Основной контент</main>
            </body>
          );
        }
      `,
    },
    {
      name: 'skip link to #maincontent',
      code: `
        function App() {
          return (
            <body>
              <a href="#maincontent">К основному содержанию</a>
              <header>Шапка</header>
            </body>
          );
        }
      `,
    },
    {
      name: 'elements other than body are ignored',
      code: `
        function Header() {
          return (
            <header>
              <nav>Навигация без skip-link</nav>
            </header>
          );
        }
      `,
    },
    {
      name: 'components without body are ignored',
      code: `
        function Page() {
          return (
            <div>
              <nav>Навигация</nav>
              <main>Контент</main>
            </div>
          );
        }
      `,
    },
  ],

  // Invalid: no skip link
  invalid: [
    {
      name: 'body without a skip link',
      code: `
        function App() {
          return (
            <body>
              <header>Шапка</header>
              <nav>Навигация</nav>
              <main>Контент</main>
            </body>
          );
        }
      `,
      errors: [
        {
          messageId: 'missing',
        },
      ],
    },
    {
      name: 'body with a regular link only',
      code: `
        function App() {
          return (
            <body>
              <a href="/home">На главную</a>
              <nav>Навигация</nav>
              <main>Контент</main>
            </body>
          );
        }
      `,
      errors: [
        {
          messageId: 'missing',
        },
      ],
    },
    {
      name: 'body with empty content only',
      code: `
        function App() {
          return (
            <body>
              <div>Только div без skip-link</div>
            </body>
          );
        }
      `,
      errors: [
        {
          messageId: 'missing',
        },
      ],
    },
  ],
});
