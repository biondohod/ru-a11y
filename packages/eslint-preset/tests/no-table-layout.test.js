/**
 * Tests for the rule: no-table-layout
 * GOST R 52872-2019 §5.1.5; Decree No. 102, item a)
 */

'use strict';

const { RuleTester } = require('eslint');
const rule = require('../rules/no-table-layout');

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    parserOptions: { ecmaFeatures: { jsx: true } },
    sourceType: 'module',
  },
});

ruleTester.run('no-table-layout', rule, {
  valid: [
    {
      name: 'data table with th and caption',
      code: `
        function DataTable() {
          return (
            <table>
              <caption>Расписание занятий</caption>
              <thead>
                <tr>
                  <th scope="col">День</th>
                  <th scope="col">Предмет</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Понедельник</td>
                  <td>Математика</td>
                </tr>
              </tbody>
            </table>
          );
        }
      `,
    },
    {
      name: 'role="presentation" table is allowed',
      code: `
        function LayoutTable() {
          return (
            <table role="presentation" border="0" cellpadding="0">
              <tbody>
                <tr>
                  <td>Колонка 1</td>
                  <td>Колонка 2</td>
                </tr>
              </tbody>
            </table>
          );
        }
      `,
    },
    {
      name: 'role="none" table is allowed',
      code: `
        function LayoutTable() {
          return (
            <table role="none" cellspacing="0">
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
      name: 'table with summary',
      code: `
        function DataTable() {
          return (
            <table summary="Данные о продажах за квартал">
              <thead>
                <tr>
                  <th>Месяц</th>
                  <th>Продажи</th>
                </tr>
              </thead>
            </table>
          );
        }
      `,
    },
  ],

  invalid: [
    {
      name: 'layout table with border="0" and no role',
      code: `
        function LayoutTable() {
          return (
            <table border="0" cellpadding="0" cellspacing="0">
              <tbody>
                <tr>
                  <td>Контент слева</td>
                  <td>Контент справа</td>
                </tr>
              </tbody>
            </table>
          );
        }
      `,
      errors: [
        {
          messageId: 'missingRole',
        },
      ],
    },
    {
      name: 'table with cellpadding and no semantics',
      code: `
        function LayoutTable() {
          return (
            <table cellpadding="10">
              <tbody>
                <tr>
                  <td>Ячейка</td>
                </tr>
              </tbody>
            </table>
          );
        }
      `,
      errors: [
        {
          messageId: 'missingRole',
        },
      ],
    },
  ],
});
