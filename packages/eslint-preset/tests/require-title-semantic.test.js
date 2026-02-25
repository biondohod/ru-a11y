/**
 * Тесты для правила: require-title-semantic
 * Стандарт: ГОСТ Р 52872-2019 §5.2.3; Постановление №102 п. е)
 */

'use strict';

const { RuleTester } = require('eslint');
const rule = require('../rules/require-title-semantic');

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    ecmaFeatures: { jsx: true },
    sourceType: 'module',
  },
});

ruleTester.run('require-title-semantic', rule, {
  valid: [
    {
      name: 'информативный title',
      code: `
        function Head() {
          return <title>Личный кабинет — Портал Госуслуг</title>;
        }
      `,
    },
    {
      name: 'информативный title с указанием ведомства',
      code: `
        function Head() {
          return <title>Запись к врачу — Министерство здравоохранения РФ</title>;
        }
      `,
    },
    {
      name: 'корректная структура заголовков h1→h2→h3',
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
      name: 'корректная структура с несколькими h2 подряд',
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
      name: 'заголовок с вложенным элементом (иконка)',
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
      name: 'пустой title',
      code: `
        function Head() {
          return <title>   </title>;
        }
      `,
      errors: [{ messageId: 'emptyTitle' }],
    },
    {
      name: 'шаблонный title "страница"',
      code: `
        function Head() {
          return <title>страница</title>;
        }
      `,
      errors: [{ messageId: 'genericTitle' }],
    },
    {
      name: 'пустой заголовок h1',
      code: `
        function Page() {
          return <h1>   </h1>;
        }
      `,
      errors: [{ messageId: 'emptyHeading' }],
    },
    {
      name: 'пропуск уровня заголовка: h1 → h3',
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
      name: 'пропуск уровня заголовка: h2 → h4',
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

