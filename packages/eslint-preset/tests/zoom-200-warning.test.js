/**
 * Tests for the rule: zoom-200-warning
 * Government Decree No. 102, item b)
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
      name: 'viewport without zoom restrictions',
      code: `
        function Head() {
          return <meta name="viewport" content="width=device-width, initial-scale=1.0" />;
        }
      `,
    },
    {
      name: 'viewport with maximum-scale=2.0',
      code: `
        function Head() {
          return <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=2.0" />;
        }
      `,
    },
    {
      name: 'viewport with maximum-scale=5.0',
      code: `
        function Head() {
          return <meta name="viewport" content="width=device-width, maximum-scale=5.0" />;
        }
      `,
    },
    {
      name: 'font size 16px',
      code: `
        function Component() {
          return <p style={{ fontSize: '16px' }}>Текст</p>;
        }
      `,
    },
    {
      name: 'font size 1rem',
      code: `
        function Component() {
          return <p style={{ fontSize: '1rem' }}>Текст</p>;
        }
      `,
    },
    {
      name: 'font size 1.2rem',
      code: `
        function Component() {
          return <p style={{ fontSize: '1.2rem' }}>Текст</p>;
        }
      `,
    },
    {
      name: 'meta tag other than viewport',
      code: `
        function Head() {
          return <meta name="description" content="Описание страницы" />;
        }
      `,
    },
  ],

  invalid: [
    {
      name: 'viewport with user-scalable=no',
      code: `
        function Head() {
          return <meta name="viewport" content="width=device-width, user-scalable=no" />;
        }
      `,
      errors: [{ messageId: 'userScalableNo' }],
    },
    {
      name: 'viewport with maximum-scale=1.0',
      code: `
        function Head() {
          return <meta name="viewport" content="width=device-width, maximum-scale=1.0" />;
        }
      `,
      errors: [{ messageId: 'maxScaleLow' }],
    },
    {
      name: 'viewport with maximum-scale=1.5',
      code: `
        function Head() {
          return <meta name="viewport" content="width=device-width, maximum-scale=1.5" />;
        }
      `,
      errors: [{ messageId: 'maxScaleLow' }],
    },
    {
      name: 'font size 12px is too small',
      code: `
        function Component() {
          return <small style={{ fontSize: '12px' }}>Сноска</small>;
        }
      `,
      errors: [{ messageId: 'smallFontSize' }],
    },
    {
      name: 'font size 0.7rem is too small',
      code: `
        function Component() {
          return <span style={{ fontSize: '0.7rem' }}>Текст</span>;
        }
      `,
      errors: [{ messageId: 'smallFontSize' }],
    },
    {
      name: 'fixed width 800px',
      code: `
        function Component() {
          return <div style={{ width: '800px' }}>Контент</div>;
        }
      `,
      errors: [{ messageId: 'fixedLayout' }],
    },
  ],
});
