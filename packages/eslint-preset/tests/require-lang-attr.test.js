/**
 * Тесты для правила: require-lang-attr
 * Стандарт: ГОСТ Р 52872-2019 §5.2.4; Постановление №102 п. а), п. д)
 */

'use strict';

const { RuleTester } = require('eslint');
const rule = require('../rules/require-lang-attr');

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    parserOptions: { ecmaFeatures: { jsx: true } },
    sourceType: 'module',
  },
});

ruleTester.run('require-lang-attr', rule, {
  valid: [
    {
      name: 'html с lang="ru"',
      code: `function App() { return <html lang="ru"><body></body></html>; }`,
    },
    {
      name: 'html с lang="ru-RU"',
      code: `function App() { return <html lang="ru-RU"><body></body></html>; }`,
    },
    {
      name: 'html с lang="en"',
      code: `function App() { return <html lang="en"><body></body></html>; }`,
    },
    {
      name: 'html с lang="zh-Hans"',
      code: `function App() { return <html lang="zh-Hans"><body></body></html>; }`,
    },
    {
      name: 'не-html элементы не проверяются',
      code: `function App() { return <div><p>Текст</p></div>; }`,
    },
    {
      name: 'enforceRussian: true — lang="ru" принимается',
      code: `function App() { return <html lang="ru"><body></body></html>; }`,
      options: [{ enforceRussian: true }],
    },
  ],

  invalid: [
    {
      name: 'html без атрибута lang',
      code: `function App() { return <html><body></body></html>; }`,
      errors: [{ messageId: 'missing' }],
    },
    {
      name: 'html с невалидным lang (цифры)',
      code: `function App() { return <html lang="123"><body></body></html>; }`,
      errors: [{ messageId: 'invalidValue' }],
    },
    {
      name: 'html с невалидным lang (пустая строка)',
      code: `function App() { return <html lang=""><body></body></html>; }`,
      errors: [{ messageId: 'invalidValue' }],
    },
    {
      name: 'enforceRussian: true — lang="en" выдаёт предупреждение',
      code: `function App() { return <html lang="en"><body></body></html>; }`,
      options: [{ enforceRussian: true }],
      errors: [{ messageId: 'notRussian' }],
    },
  ],
});

console.log('✅ Тесты require-lang-attr прошли успешно');
