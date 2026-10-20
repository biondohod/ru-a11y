/**
 * Tests for the rule: require-title-semantic
 * GOST R 52872-2019 §5.2.3; Decree No. 102, item e)
 */

'use strict';

const { RuleTester } = require('eslint');
const rule = require('../rules/require-title-semantic');

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    parserOptions: { ecmaFeatures: { jsx: true } },
    sourceType: 'module',
  },
});

ruleTester.run('require-title-semantic', rule, {
  valid: [
    {
      name: 'meaningful title',
      code: `
        function Head() {
          return <title>Личный кабинет — Портал Госуслуг</title>;
        }
      `,
    },
    {
      name: 'meaningful title with an agency name',
      code: `
        function Head() {
          return <title>Запись к врачу — Министерство здравоохранения РФ</title>;
        }
      `,
    },
    {
      name: 'valid heading order h1 -> h2 -> h3',
      code: `
        function Page() {
          return (
            <article>
              <h1>Главный заголовок</h1>
              <h2>Подраздел</h2>
              <h3>Подподраздел</h3>
            </article>
          );
        }
      `,
    },
    {
      name: 'several h2 in a row',
      code: `
        function Page() {
          return (
            <article>
              <h1>Заголовок</h1>
              <h2>Раздел 1</h2>
              <h2>Раздел 2</h2>
            </article>
          );
        }
      `,
    },
    {
      name: 'heading with a nested element (icon)',
      code: `
        function Page() {
          return (
            <h2><span aria-hidden="true">★</span></h2>
          );
        }
      `,
    },
  ],

  invalid: [
    {
      name: 'empty title',
      code: `
        function Head() {
          return <title>   </title>;
        }
      `,
      errors: [{ messageId: 'emptyTitle' }],
    },
    {
      name: 'placeholder title "страница"',
      code: `
        function Head() {
          return <title>страница</title>;
        }
      `,
      errors: [{ messageId: 'genericTitle' }],
    },
    {
      name: 'empty h1',
      code: `
        function Page() {
          return <h1>   </h1>;
        }
      `,
      errors: [{ messageId: 'emptyHeading' }],
    },
    {
      name: 'skipped heading level: h1 -> h3',
      code: `
        function Page() {
          return (
            <article>
              <h1>Заголовок первого уровня</h1>
              <h3>Пропущен h2!</h3>
            </article>
          );
        }
      `,
      errors: [{ messageId: 'headingSkipped' }],
    },
    {
      name: 'skipped heading level: h2 -> h4',
      code: `
        function Page() {
          return (
            <article>
              <h1>Заголовок</h1>
              <h2>Подраздел</h2>
              <h4>Пропущен h3!</h4>
            </article>
          );
        }
      `,
      errors: [{ messageId: 'headingSkipped' }],
    },
  ],
});

console.log('✅ Тесты require-title-semantic прошли успешно');
