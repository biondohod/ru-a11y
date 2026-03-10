/**
 * Тесты для правила: zoom-200-warning
 * Стандарт: Постановление Правительства РФ №102 п. б)
 */

'use strict';

const { RuleTester } = require('eslint');
const rule = require('../rules/zoom-200-warning');

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    parserOptions: { ecmaFeatures: { jsx: true } },
    sourceType: 'module',
  },
});

ruleTester.run('zoom-200-warning', rule, {
  valid: [
    {
      name: 'viewport без ограничений масштабирования',
      code: `
        function Head() {
          return <meta name="viewport" content="width=device-width, initial-scale=1.0" />;
        }
      `,
    },
    {
      name: 'viewport с maximum-scale=2.0',
      code: `
        function Head() {
          return <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=2.0" />;
        }
      `,
    },
    {
      name: 'viewport с maximum-scale=5.0',
      code: `
        function Head() {
          return <meta name="viewport" content="width=device-width, maximum-scale=5.0" />;
        }
      `,
    },
    {
      name: 'нормальный размер шрифта 16px',
      code: `
        function Component() {
          return <p style={{ fontSize: '16px' }}>Текст</p>;
        }
      `,
    },
    {
      name: 'нормальный размер шрифта 1rem',
      code: `
        function Component() {
          return <p style={{ fontSize: '1rem' }}>Текст</p>;
        }
      `,
    },
    {
      name: 'нормальный размер шрифта 1.2rem',
      code: `
        function Component() {
          return <p style={{ fontSize: '1.2rem' }}>Текст</p>;
        }
      `,
    },
    {
      name: 'мета-тег без name="viewport"',
      code: `
        function Head() {
          return <meta name="description" content="Описание страницы" />;
        }
      `,
    },
  ],

  invalid: [
    {
      name: 'viewport с user-scalable=no',
      code: `
        function Head() {
          return <meta name="viewport" content="width=device-width, user-scalable=no" />;
        }
      `,
      errors: [{ messageId: 'userScalableNo' }],
    },
    {
      name: 'viewport с maximum-scale=1.0',
      code: `
        function Head() {
          return <meta name="viewport" content="width=device-width, maximum-scale=1.0" />;
        }
      `,
      errors: [{ messageId: 'maxScaleLow' }],
    },
    {
      name: 'viewport с maximum-scale=1.5',
      code: `
        function Head() {
          return <meta name="viewport" content="width=device-width, maximum-scale=1.5" />;
        }
      `,
      errors: [{ messageId: 'maxScaleLow' }],
    },
    {
      name: 'слишком маленький шрифт 12px',
      code: `
        function Component() {
          return <small style={{ fontSize: '12px' }}>Сноска</small>;
        }
      `,
      errors: [{ messageId: 'smallFontSize' }],
    },
    {
      name: 'слишком маленький шрифт 0.7rem',
      code: `
        function Component() {
          return <span style={{ fontSize: '0.7rem' }}>Текст</span>;
        }
      `,
      errors: [{ messageId: 'smallFontSize' }],
    },
    {
      name: 'фиксированная ширина 800px',
      code: `
        function Component() {
          return <div style={{ width: '800px' }}>Контент</div>;
        }
      `,
      errors: [{ messageId: 'fixedLayout' }],
    },
  ],
});

console.log('✅ Тесты zoom-200-warning прошли успешно');
