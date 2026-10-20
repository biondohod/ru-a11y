/**
 * Tests for the rule: table-requires-th
 * GOST R 52872-2019 §5.1.5; Decree No. 102, item a)
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
      name: 'data table with th scope="col"',
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
      name: 'table with th scope="row"',
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
      name: 'role="presentation" table is skipped',
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
      name: 'aria-hidden="true" table is skipped',
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
      name: 'dynamic scope',
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
      name: 'requireCaption: table with caption',
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
      name: 'table without <th>',
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
      name: '<th> without scope',
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
      errors: [{ messageId: 'missingScope' }, { messageId: 'missingScope' }],
    },
    {
      name: '<th> with an invalid scope',
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
      name: 'requireCaption: table without caption',
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
