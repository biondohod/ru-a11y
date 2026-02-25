/**
 * Тесты для правила: no-table-layout
 * Стандарт: ГОСТ Р 52872-2019 §5.1.5; Постановление №102 п. а)
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
      name: 'семантическая таблица данных с th и caption',
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
      name: 'таблица с role="presentation" разрешена',
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
      name: 'таблица с role="none" разрешена',
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
      name: 'таблица с summary (признак семантики)',
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
      name: 'таблица для вёрстки с border="0" без role',
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
      name: 'таблица с cellpadding без семантики',
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

console.log('✅ Тесты no-table-layout прошли успешно');

