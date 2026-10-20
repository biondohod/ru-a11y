'use strict';

/**
 * Regression tests for false positives / ignored options fixed during the refactor.
 */

const { RuleTester } = require('eslint');
const requireH1 = require('../rules/require-h1');
const requireTitleSemantic = require('../rules/require-title-semantic');
const zoom200Warning = require('../rules/zoom-200-warning');

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

ruleTester.run('require-h1: dynamic content', requireH1, {
  valid: [
    {
      name: 'h1 rendered from a variable is not empty',
      filename: 'src/pages/Article.jsx',
      code: 'const Article = ({ title }) => <main><h1>{title}</h1></main>;',
    },
    {
      name: 'h1 with a conditional expression',
      filename: 'src/pages/Article.jsx',
      code: 'const Article = ({ a }) => <main><h1>{a ? "A" : "B"}</h1></main>;',
    },
  ],
  invalid: [
    {
      name: 'h1 with an empty expression is still empty',
      filename: 'src/pages/Article.jsx',
      code: 'const Article = () => <main><h1>{/* todo */}</h1></main>;',
      errors: [{ messageId: 'empty' }],
    },
  ],
});

ruleTester.run('require-title-semantic: dynamic content', requireTitleSemantic, {
  valid: [
    {
      name: 'h2 rendered from a variable is not empty',
      code: 'const A = ({ t }) => <div><h1>Каталог</h1><h2>{t}</h2></div>;',
    },
    {
      name: 'title rendered from a variable is not empty',
      code: 'const Head = ({ page }) => <head><title>{page}</title></head>;',
    },
  ],
  invalid: [
    {
      name: 'whitespace-only string literal is empty',
      code: 'const A = () => <div><h1>{"  "}</h1></div>;',
      errors: [{ messageId: 'emptyHeading' }],
    },
  ],
});

ruleTester.run('zoom-200-warning: minFontSizePx option', zoom200Warning, {
  valid: [
    {
      name: 'custom minimum lower than the default',
      code: 'const A = () => <p style={{ fontSize: 14 }}>x</p>;',
      options: [{ minFontSizePx: 12 }],
    },
  ],
  invalid: [
    {
      name: 'custom minimum higher than the default',
      code: 'const A = () => <p style={{ fontSize: 18 }}>x</p>;',
      options: [{ minFontSizePx: 20 }],
      errors: [{ messageId: 'smallFontSize', data: { value: '18px' } }],
    },
    {
      name: 'rem values scale with the custom minimum',
      code: 'const A = () => <p style={{ fontSize: "1.1rem" }}>x</p>;',
      options: [{ minFontSizePx: 20 }],
      errors: [{ messageId: 'smallFontSize' }],
    },
  ],
});
