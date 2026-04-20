'use strict';

const { RuleTester } = require('eslint');
const requireMainLandmark = require('../rules/require-main-landmark');
const requireH1 = require('../rules/require-h1');
const noAutoplayMedia = require('../rules/no-autoplay-media');

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    parserOptions: { ecmaFeatures: { jsx: true } },
    sourceType: 'module',
  },
});

ruleTester.run('require-main-landmark', requireMainLandmark, {
  valid: [
    {
      filename: 'src/pages/HomePage.jsx',
      code: `
        function App() {
          return <main><h1>Главная</h1></main>;
        }
      `,
    },
    {
      filename: 'src/pages/HomePage.jsx',
      code: `
        function App() {
          return <div role="main"><h1>Главная</h1></div>;
        }
      `,
    },
    {
      filename: 'src/components/Card.jsx',
      code: `
        function Card() {
          return <section><h2>Карточка</h2></section>;
        }
      `,
    },
  ],
  invalid: [
    {
      filename: 'src/pages/HomePage.jsx',
      code: `
        function App() {
          return <div><h1>Главная</h1></div>;
        }
      `,
      errors: [{ messageId: 'missing' }],
    },
  ],
});

ruleTester.run('require-h1', requireH1, {
  valid: [
    {
      filename: 'src/pages/HomePage.jsx',
      code: `
        function App() {
          return <main><h1>Главная</h1></main>;
        }
      `,
    },
    {
      filename: 'src/components/Card.jsx',
      code: `
        function Card() {
          return <section><h2>Карточка</h2></section>;
        }
      `,
    },
  ],
  invalid: [
    {
      filename: 'src/pages/HomePage.jsx',
      code: `
        function App() {
          return <main><h2>Раздел</h2></main>;
        }
      `,
      errors: [{ messageId: 'missing' }],
    },
    {
      filename: 'src/pages/HomePage.jsx',
      code: `
        function App() {
          return <main><h1> </h1></main>;
        }
      `,
      errors: [{ messageId: 'empty' }],
    },
  ],
});

ruleTester.run('no-autoplay-media', noAutoplayMedia, {
  valid: [
    {
      code: `
        function App() {
          return <video autoPlay muted />;
        }
      `,
    },
    {
      code: `
        function App() {
          return <audio autoPlay controls />;
        }
      `,
    },
  ],
  invalid: [
    {
      code: `
        function App() {
          return <audio autoPlay src="/intro.mp3" />;
        }
      `,
      errors: [{ messageId: 'autoplay' }],
    },
  ],
});
