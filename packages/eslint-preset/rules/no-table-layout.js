/**
 * Правило: no-table-layout
 * Описание: Запрет использования таблиц для вёрстки (только для табличных данных)
 * Стандарт: ГОСТ Р 52872-2019 §5.1.5
 * Постановление №102: п. а) — структура и смысловые связи должны определяться программой
 *
 * Таблицы должны использоваться только для представления табличных данных.
 * Для вёрстки страницы используйте CSS Grid или Flexbox.
 *
 * Признаки таблицы-вёрстки:
 * - role="presentation" или role="none" без данных
 * - Отсутствие <th>, <caption>, summary
 * - Наличие атрибутов cellpadding, cellspacing, border="0"
 * - Вложенные таблицы
 */

'use strict';

const messages = require('../messages');

/**
 * Проверяет наличие атрибута с заданным именем
 * @param {Array} attributes - массив атрибутов JSX
 * @param {string} name - имя атрибута
 * @returns {import('@typescript-eslint/types').TSESTree.JSXAttribute|undefined}
 */
function findAttribute(attributes, name) {
  return attributes.find(
    (attr) => attr.type === 'JSXAttribute' && attr.name && attr.name.name === name,
  );
}

/**
 * Получает строковое значение атрибута
 * @param {import('@typescript-eslint/types').TSESTree.JSXAttribute} attr
 * @returns {string|null}
 */
function getAttributeValue(attr) {
  if (!attr || !attr.value) return null;
  if (attr.value.type === 'Literal') return String(attr.value.value);
  if (
    attr.value.type === 'JSXExpressionContainer' &&
    attr.value.expression.type === 'Literal'
  ) {
    return String(attr.value.expression.value);
  }
  return null;
}

/**
 * Проверяет, содержит ли таблица дочерние элементы <th>
 * @param {import('@typescript-eslint/types').TSESTree.JSXElement} tableNode
 * @returns {boolean}
 */
function tableHasThElements(tableNode) {
  if (!tableNode.children) return false;

  function searchForTh(children) {
    for (const child of children) {
      if (child.type !== 'JSXElement') continue;
      const tagName =
        child.openingElement.name && child.openingElement.name.type === 'JSXIdentifier'
          ? child.openingElement.name.name
          : null;
      if (tagName === 'th') return true;
      if (searchForTh(child.children || [])) return true;
    }
    return false;
  }

  return searchForTh(tableNode.children);
}

/**
 * Проверяет, содержит ли таблица элемент <caption>
 * @param {import('@typescript-eslint/types').TSESTree.JSXElement} tableNode
 * @returns {boolean}
 */
function tableHasCaption(tableNode) {
  if (!tableNode.children) return false;
  return tableNode.children.some((child) => {
    if (child.type !== 'JSXElement') return false;
    const tagName =
      child.openingElement.name && child.openingElement.name.type === 'JSXIdentifier'
        ? child.openingElement.name.name
        : null;
    return tagName === 'caption';
  });
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Запрещает использование таблиц для вёрстки вместо табличных данных (ГОСТ Р 52872-2019 §5.1.5)',
      category: 'Доступность',
      recommended: true,
      url: 'https://github.com/ru-a11y/ru-a11y/blob/main/docs/rules/no-table-layout.md',
    },
    messages: {
      layoutTable: messages.noTableLayout.layoutTable,
      missingRole: messages.noTableLayout.missingRole,
    },
    schema: [
      {
        type: 'object',
        properties: {
          // Если true, разрешает таблицы без <th> при наличии role="presentation"
          allowPresentationRole: {
            type: 'boolean',
            default: true,
            description: 'Разрешить таблицы с role="presentation" для оформления',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {};
    const allowPresentationRole = options.allowPresentationRole !== false;

    return {
      JSXOpeningElement(node) {
        const tagName =
          node.name && node.name.type === 'JSXIdentifier' ? node.name.name : null;

        if (tagName !== 'table') return;

        const roleAttr = findAttribute(node.attributes, 'role');
        const roleValue = getAttributeValue(roleAttr);

        // Если явно указана презентационная роль — допустимо
        if (allowPresentationRole && (roleValue === 'presentation' || roleValue === 'none')) {
          return;
        }

        // Признаки таблицы-вёрстки: атрибуты border="0", cellpadding, cellspacing
        const borderAttr = findAttribute(node.attributes, 'border');
        const cellPaddingAttr = findAttribute(node.attributes, 'cellpadding');
        const cellSpacingAttr = findAttribute(node.attributes, 'cellspacing');
        const summaryAttr = findAttribute(node.attributes, 'summary');

        const borderValue = getAttributeValue(borderAttr);
        const hasLayoutAttributes =
          (borderAttr && borderValue === '0') || cellPaddingAttr || cellSpacingAttr;

        // Если есть признаки вёрстки и нет семантических атрибутов
        if (hasLayoutAttributes && !summaryAttr) {
          // Проверяем родительский JSX-элемент на наличие <th> и <caption>
          const parentElement = node.parent;
          const hasTh = tableHasThElements(parentElement);
          const hasCaption = tableHasCaption(parentElement);

          if (!hasTh && !hasCaption) {
            if (!roleAttr) {
              context.report({
                node,
                messageId: 'missingRole',
              });
            } else {
              context.report({
                node,
                messageId: 'layoutTable',
              });
            }
          }
        }
      },
    };
  },
};

