/**
 * Тесты для правила: no-frame-structure
 * Стандарт: ГОСТ Р 52872-2019 §5.1.1; Постановление №102 п. а)
 */

'use strict';

const { RuleTester } = require('eslint');
const rule = require('../rules/no-frame-structure');

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    ecmaFeatures: { jsx: true },
    sourceType: 'module',
  },
});

ruleTester.run('no-frame-structure', rule, {
  valid: [
    {
      name: 'iframe с информативным title',
      code: `
        function Map() {
          return <iframe src="map.html" title="Карта расположения офиса" />;
        }
      `,
    },
    {
      name: 'iframe с динамическим title',
      code: `
        function Video({ videoTitle }) {
          return <iframe src="video.html" title={videoTitle} />;
        }
      `,
    },
    {
      name: 'iframe с title через переменную',
      code: `
        const TITLE = "Виджет погоды";
        function Weather() {
          return <iframe src="weather.html" title={TITLE} />;
        }
      `,
    },
    {
      name: 'обычные HTML-элементы разрешены',
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
      name: 'элемент <frame> запрещён',
      code: `
        function OldApp() {
          return <frame src="page.html" />;
        }
      `,
      errors: [{ messageId: 'frameElement' }],
    },
    {
      name: 'элемент <frameset> запрещён',
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
        // frame внутри тоже отловится
        { messageId: 'frameElement' },
        { messageId: 'frameElement' },
      ],
    },
    {
      name: 'iframe без атрибута title',
      code: `
        function Page() {
          return <iframe src="widget.html" />;
        }
      `,
      errors: [{ messageId: 'iframeWithoutTitle' }],
    },
    {
      name: 'iframe с пустым title',
      code: `
        function Page() {
          return <iframe src="widget.html" title="" />;
        }
      `,
      errors: [{ messageId: 'iframeEmptyTitle' }],
    },
    {
      name: 'iframe с пробельным title',
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

