/**
 * Тесты для правила: require-skip-link
 * Стандарт: ГОСТ Р 52872-2019 §5.2.3.1; Постановление №102 п. а)
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
  // Корректные случаи: skip-link присутствует
  valid: [
    {
      name: 'body содержит skip-link с href="#main" первым элементом',
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
      name: 'body содержит skip-link с href="#content"',
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
      name: 'body содержит skip-link с href="#maincontent"',
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
      name: 'не-body элементы не проверяются',
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
      name: 'компонент без body не проверяется',
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

  // Некорректные случаи: skip-link отсутствует
  invalid: [
    {
      name: 'body без skip-link',
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
      name: 'body с ссылкой, но не skip-link (обычная ссылка)',
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
      name: 'body только с пустым содержимым',
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

console.log('✅ Тесты require-skip-link прошли успешно');

