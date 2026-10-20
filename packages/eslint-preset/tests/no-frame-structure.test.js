/**
 * Tests for the rule: no-frame-structure
 * GOST R 52872-2019 §5.1.1; Decree No. 102, item a)
 */

'use strict';

const { RuleTester } = require('eslint');
const rule = require('../rules/no-frame-structure');

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    parserOptions: { ecmaFeatures: { jsx: true } },
    sourceType: 'module',
  },
});

ruleTester.run('no-frame-structure', rule, {
  valid: [
    {
      name: 'iframe with a meaningful title',
      code: `
        function Map() {
          return <iframe src="map.html" title="Карта расположения офиса" />;
        }
      `,
    },
    {
      name: 'iframe with a dynamic title',
      code: `
        function Video({ videoTitle }) {
          return <iframe src="video.html" title={videoTitle} />;
        }
      `,
    },
    {
      name: 'iframe with a title from a variable',
      code: `
        const TITLE = "Виджет погоды";
        function Weather() {
          return <iframe src="weather.html" title={TITLE} />;
        }
      `,
    },
    {
      name: 'regular HTML elements are allowed',
      code: `
        function Page() {
          return (
            <div>
              <p>Обычный параграф</p>
              <section>Секция</section>
            </div>
          );
        }
      `,
    },
  ],

  invalid: [
    {
      name: '<frame> is forbidden',
      code: `
        function OldApp() {
          return <frame src="page.html" />;
        }
      `,
      errors: [{ messageId: 'frameElement' }],
    },
    {
      name: '<frameset> is forbidden',
      code: `
        function OldApp() {
          return (
            <frameset cols="25%,75%">
              <frame src="menu.html" />
              <frame src="content.html" />
            </frameset>
          );
        }
      `,
      errors: [
        { messageId: 'framesetElement' },
        // a nested frame is reported too
        { messageId: 'frameElement' },
        { messageId: 'frameElement' },
      ],
    },
    {
      name: 'iframe without a title',
      code: `
        function Page() {
          return <iframe src="widget.html" />;
        }
      `,
      errors: [{ messageId: 'iframeWithoutTitle' }],
    },
    {
      name: 'iframe with an empty title',
      code: `
        function Page() {
          return <iframe src="widget.html" title="" />;
        }
      `,
      errors: [{ messageId: 'iframeEmptyTitle' }],
    },
    {
      name: 'iframe with a whitespace-only title',
      code: `
        function Page() {
          return <iframe src="widget.html" title="   " />;
        }
      `,
      errors: [{ messageId: 'iframeEmptyTitle' }],
    },
  ],
});

console.log('✅ Тесты no-frame-structure прошли успешно');
