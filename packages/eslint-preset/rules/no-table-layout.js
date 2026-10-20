'use strict';

/**
 * no-table-layout
 * Tables are for tabular data only; page layout belongs to CSS Grid / Flexbox.
 * A table is treated as a layout table when it carries layout attributes
 * (`border="0"`, `cellpadding`, `cellspacing`) and has no `<th>`, `<caption>` or `summary`.
 * GOST R 52872-2019, §5.1.5; Government Decree No. 102, item a).
 */

const messages = require('../messages');
const { createRule, getOptions } = require('./utils/create-rule');
const {
  findAttribute,
  getChildElements,
  getElementName,
  getStaticAttribute,
  hasAttribute,
  hasDescendant,
  hasPresentationRole,
} = require('./utils/jsx');

function hasLayoutAttributes(openingElement) {
  return (
    getStaticAttribute(openingElement, 'border') === '0' ||
    hasAttribute(openingElement, 'cellpadding', 'cellspacing')
  );
}

function hasDataTableSemantics(tableElement) {
  return (
    hasAttribute(tableElement.openingElement, 'summary') ||
    hasDescendant(tableElement, 'th') ||
    getChildElements(tableElement).some(
      (child) => getElementName(child.openingElement) === 'caption',
    )
  );
}

module.exports = createRule({
  name: 'no-table-layout',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Запрещает использование таблиц для вёрстки вместо табличных данных (ГОСТ Р 52872-2019 §5.1.5)',
    },
    messages: {
      layoutTable: messages.noTableLayout.layoutTable,
      missingRole: messages.noTableLayout.missingRole,
    },
    schema: [
      {
        type: 'object',
        properties: {
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
    const { allowPresentationRole = true } = getOptions(context);

    return {
      JSXElement(node) {
        const { openingElement } = node;
        if (getElementName(openingElement) !== 'table') return;
        if (allowPresentationRole && hasPresentationRole(openingElement)) return;
        if (!hasLayoutAttributes(openingElement) || hasDataTableSemantics(node)) return;

        context.report({
          node: openingElement,
          messageId: findAttribute(openingElement, 'role') ? 'layoutTable' : 'missingRole',
        });
      },
    };
  },
});
