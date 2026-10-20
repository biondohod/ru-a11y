'use strict';

/**
 * table-requires-th
 * Data tables need `<th>` header cells (optionally with a valid `scope` and a `<caption>`),
 * otherwise screen readers cannot relate cells to their headers.
 * Presentational (`role="presentation"|"none"`) and hidden (`aria-hidden`) tables are skipped.
 * GOST R 52872-2019, §5.1.5; Government Decree No. 102, item a).
 */

const messages = require('../messages');
const { createRule, getOptions } = require('./utils/create-rule');
const {
  findAttribute,
  findDescendants,
  getElementName,
  getStaticValue,
  hasDescendant,
  hasPresentationRole,
  isDynamicValue,
} = require('./utils/jsx');

const VALID_SCOPES = new Set(['col', 'row', 'colgroup', 'rowgroup']);

function isHidden(openingElement) {
  const ariaHidden = findAttribute(openingElement, 'aria-hidden');
  // A valueless `aria-hidden` is the same as `aria-hidden="true"` in JSX.
  return (
    Boolean(ariaHidden) && (ariaHidden.value === null || getStaticValue(ariaHidden) === 'true')
  );
}

module.exports = createRule({
  name: 'table-requires-th',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Требует наличия <th> с атрибутом scope в каждой таблице данных (ГОСТ Р 52872-2019 §5.1.5)',
    },
    messages: {
      missingTh: messages.tableRequiresTh.missingTh,
      missingScope: messages.tableRequiresTh.missingScope,
      invalidScope: messages.tableRequiresTh.invalidScope,
      missingCaption: messages.tableRequiresTh.missingCaption,
    },
    schema: [
      {
        type: 'object',
        properties: {
          requireCaption: {
            type: 'boolean',
            default: false,
            description: 'Требовать элемент <caption> в каждой таблице данных',
          },
          requireScope: {
            type: 'boolean',
            default: true,
            description: 'Требовать атрибут scope на элементах <th>',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const { requireCaption = false, requireScope = true } = getOptions(context);

    function checkScope(headerCell) {
      const scope = findAttribute(headerCell.openingElement, 'scope');

      if (!scope) {
        context.report({ node: headerCell.openingElement, messageId: 'missingScope' });
        return;
      }

      const value = getStaticValue(scope);
      if (!isDynamicValue(scope) && value && !VALID_SCOPES.has(value)) {
        context.report({ node: scope, messageId: 'invalidScope', data: { value } });
      }
    }

    return {
      JSXElement(node) {
        const { openingElement } = node;
        if (getElementName(openingElement) !== 'table') return;
        if (hasPresentationRole(openingElement) || isHidden(openingElement)) return;

        const headerCells = findDescendants(node, 'th');
        if (headerCells.length === 0) {
          // Scope and caption checks are meaningless without header cells.
          context.report({ node: openingElement, messageId: 'missingTh' });
          return;
        }

        if (requireScope) {
          headerCells.forEach(checkScope);
        }

        if (requireCaption && !hasDescendant(node, 'caption')) {
          context.report({ node: openingElement, messageId: 'missingCaption' });
        }
      },
    };
  },
});
