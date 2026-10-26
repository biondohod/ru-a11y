/**
 * Tests for the rule: require-lang-attr
 * GOST R 52872-2019 §5.2.4; Decree No. 102, items a), d)
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
      name: 'html lang="ru"',
      code: `function App() { return <html lang="ru"><body></body></html>; }`,
    },
    {
      name: 'html lang="ru-RU"',
      code: `function App() { return <html lang="ru-RU"><body></body></html>; }`,
    },
    {
      name: 'html lang="en"',
      code: `function App() { return <html lang="en"><body></body></html>; }`,
    },
    {
      name: 'html lang="zh-Hans"',
      code: `function App() { return <html lang="zh-Hans"><body></body></html>; }`,
    },
    {
      name: 'elements other than html are ignored',
      code: `function App() { return <div><p>Текст</p></div>; }`,
    },
    {
      name: 'enforceRussian accepts lang="ru"',
      code: `function App() { return <html lang="ru"><body></body></html>; }`,
      options: [{ enforceRussian: true }],
    },
    {
      name: 'enforceRussian ignores the case of the language tag',
      code: `function App() { return <><html lang="RU" /><html lang="RU-ru" /></>; }`,
      options: [{ enforceRussian: true }],
    },
  ],

  invalid: [
    {
      name: 'html without lang',
      code: `function App() { return <html><body></body></html>; }`,
      errors: [{ messageId: 'missing' }],
    },
    {
      name: 'invalid lang (digits)',
      code: `function App() { return <html lang="123"><body></body></html>; }`,
      errors: [{ messageId: 'invalidValue' }],
    },
    {
      name: 'invalid lang (empty string)',
      code: `function App() { return <html lang=""><body></body></html>; }`,
      errors: [{ messageId: 'invalidValue' }],
    },
    {
      name: 'enforceRussian reports lang="en"',
      code: `function App() { return <html lang="en"><body></body></html>; }`,
      options: [{ enforceRussian: true }],
      errors: [{ messageId: 'notRussian' }],
    },
  ],
});
