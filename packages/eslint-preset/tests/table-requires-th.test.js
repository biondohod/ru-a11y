/**
 * Тесты для правила: table-requires-th
 * Стандарт: ГОСТ Р 52872-2019 §5.1.5; Постановление №102 п. а)
 */

'use strict';

const { RuleTester } = require('eslint');
const rule = require('../rules/table-requires-th');

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    parserOptions: { ecmaFeatures: { jsx: true } },
    sourceType: 'module',
  },
});

ruleTester.run('table-requires-th', rule, {
  valid: [
    {
      name: 'таблица данных с th и scope="col"',
      code: `
        function DataTable() {
          return (
            <table>
              <thead>
                <tr>
                  <th scope="col">Имя</th>
                  <th scope="col">Возраст</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Иван</td>
                  <td>30</td>
                </tr>
              </tbody>
            </table>
          );
        }
      `,
    },
    {
      name: 'таблица с th scope="row"',
      code: `
        function DataTable() {
          return (
            <table>
              <tbody>
                <tr>
                  <th scope="row">Январь</th>
                  <td>100</td>
                </tr>
              </tbody>
            </table>
          );
        }
      `,
    },
    {
      name: 'таблица с role="presentation" — исключение',
      code: `
        function LayoutTable() {
          return (
            <table role="presentation">
              <tbody>
                <tr>
                  <td>Ячейка</td>
                </tr>
              </tbody>
            </table>
          );
        }
      `,
    },
    {
      name: 'таблица с aria-hidden="true" — исключение',
      code: `
        function HiddenTable() {
          return (
            <table aria-hidden="true">
              <tbody>
                <tr>
                  <td>Скрытый контент</td>
                </tr>
              </tbody>
            </table>
          );
        }
      `,
    },
    {
      name: 'таблица с динамическим scope',
      code: `
        function DataTable({ scopeValue }) {
          return (
            <table>
              <thead>
                <tr>
                  <th scope={scopeValue}>Колонка</th>
                </tr>
              </thead>
            </table>
          );
        }
      `,
    },
    {
      name: 'requireCaption: true — таблица с caption',
      code: `
        function DataTable() {
          return (
            <table>
              <caption>Статистика продаж</caption>
              <thead>
                <tr>
                  <th scope="col">Месяц</th>
                  <th scope="col">Продажи</th>
                </tr>
              </thead>
            </table>
          );
        }
      `,
      options: [{ requireCaption: true }],
    },
  ],

  invalid: [
    {
      name: 'таблица без <th>',
      code: `
        function BadTable() {
          return (
            <table>
              <tbody>
                <tr>
                  <td>Данные без заголовка</td>
                  <td>Ещё данные</td>
                </tr>
              </tbody>
            </table>
          );
        }
      `,
      errors: [{ messageId: 'missingTh' }],
    },
    {
      name: 'таблица с <th> без атрибута scope',
      code: `
        function BadTable() {
          return (
            <table>
              <thead>
                <tr>
                  <th>Имя</th>
                  <th>Возраст</th>
                </tr>
              </thead>
            </table>
          );
        }
      `,
      errors: [
        { messageId: 'missingScope' },
        { messageId: 'missingScope' },
      ],
    },
    {
      name: 'таблица с <th> и невалидным scope',
      code: `
        function BadTable() {
          return (
            <table>
              <thead>
                <tr>
                  <th scope="invalid-value">Заголовок</th>
                </tr>
              </thead>
            </table>
          );
        }
      `,
      errors: [{ messageId: 'invalidScope' }],
    },
    {
      name: 'requireCaption: true — таблица без caption',
      code: `
        function BadTable() {
          return (
            <table>
              <thead>
                <tr>
                  <th scope="col">Колонка</th>
                </tr>
              </thead>
            </table>
          );
        }
      `,
      options: [{ requireCaption: true }],
      errors: [{ messageId: 'missingCaption' }],
    },
  ],
});

console.log('✅ Тесты table-requires-th прошли успешно');

