'use strict';

/**
 * zoom-200-warning
 * Pages must stay usable at 200% zoom (Government Decree No. 102, item b)). Flags:
 * - `<meta name="viewport">` with `user-scalable=no` or `maximum-scale` below 2;
 * - inline `fontSize` below the configured minimum;
 * - inline fixed `width` above 200px.
 */

const messages = require('../messages');
const { createRule, getOptions } = require('./utils/create-rule');
const {
  findAttribute,
  getElementName,
  getStaticAttribute,
  getStaticValue,
} = require('./utils/jsx');

const DEFAULT_MIN_FONT_SIZE_PX = 16;
const MAX_FIXED_WIDTH_PX = 200;
const MIN_MAXIMUM_SCALE = 2;

/**
 * Minimum font size per unit as a fraction of `minFontSizePx`, assuming a 16px root.
 * `em` is relative to the parent, so it gets a slightly lower bar (14px at the default).
 */
const MIN_FONT_SIZE_FACTOR = { px: 1, rem: 1 / 16, em: 0.875 / 16, pt: 0.75 };
const CSS_LENGTH = /^(\d+(?:\.\d+)?)(px|rem|em|pt)$/;

/** `width=device-width, user-scalable=no` -> `{ width: 'device-width', 'user-scalable': 'no' }` */
function parseViewport(content) {
  return Object.fromEntries(
    content
      .split(',')
      .map((part) => part.split('=').map((token) => token.trim()))
      .filter(([key, value]) => key && value !== undefined),
  );
}

/**
 * Parses a literal CSS length. React treats bare numbers as px.
 * Returns `null` for anything else (`inherit`, `calc()`, percentages).
 */
function parseLength(value) {
  if (typeof value === 'number') return { amount: value, unit: 'px' };
  if (typeof value !== 'string') return null;

  const match = CSS_LENGTH.exec(value.trim());
  return match ? { amount: Number(match[1]), unit: match[2] } : null;
}

function getPropertyName(property) {
  if (property.key.type === 'Identifier') return property.key.name;
  if (property.key.type === 'Literal') return String(property.key.value);
  return null;
}

function getInlineStyleProperties(openingElement) {
  const style = findAttribute(openingElement, 'style');
  const expression = style && style.value && style.value.expression;

  if (!expression || expression.type !== 'ObjectExpression') return [];

  return expression.properties.filter(
    (property) => property.type === 'Property' && property.value.type === 'Literal',
  );
}

module.exports = createRule({
  name: 'zoom-200-warning',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Предупреждает о потенциальных проблемах с масштабированием 200% (Постановление №102 п. б))',
    },
    messages: {
      userScalableNo: messages.zoom200Warning.userScalableNo,
      maxScaleLow: messages.zoom200Warning.maxScaleLow,
      smallFontSize: messages.zoom200Warning.smallFontSize,
      fixedLayout: messages.zoom200Warning.fixedLayout,
    },
    schema: [
      {
        type: 'object',
        properties: {
          minFontSizePx: {
            type: 'number',
            default: DEFAULT_MIN_FONT_SIZE_PX,
            description: 'Минимальный допустимый размер шрифта в пикселях',
          },
          checkInlineStyles: {
            type: 'boolean',
            default: true,
            description: 'Проверять инлайн-стили на проблемы с масштабированием',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const { minFontSizePx = DEFAULT_MIN_FONT_SIZE_PX, checkInlineStyles = true } =
      getOptions(context);

    function checkViewport(node) {
      if (getStaticAttribute(node, 'name') !== 'viewport') return;

      const contentAttribute = findAttribute(node, 'content');
      const content = getStaticValue(contentAttribute);
      if (!content) return;

      const viewport = parseViewport(content);
      const reportNode = contentAttribute || node;

      if (viewport['user-scalable'] === 'no' || viewport['user-scalable'] === '0') {
        context.report({ node: reportNode, messageId: 'userScalableNo' });
      }

      const maximumScale = Number.parseFloat(viewport['maximum-scale']);
      if (!Number.isNaN(maximumScale) && maximumScale < MIN_MAXIMUM_SCALE) {
        context.report({
          node: reportNode,
          messageId: 'maxScaleLow',
          data: { value: viewport['maximum-scale'] },
        });
      }
    }

    function checkInlineStyle(node) {
      for (const property of getInlineStyleProperties(node)) {
        const name = getPropertyName(property);
        const length = parseLength(property.value.value);
        if (!length) continue;

        if (
          name === 'fontSize' &&
          length.amount < minFontSizePx * MIN_FONT_SIZE_FACTOR[length.unit]
        ) {
          context.report({
            node: property,
            messageId: 'smallFontSize',
            data: { value: `${length.amount}${length.unit}` },
          });
        }

        if (name === 'width' && length.unit === 'px' && length.amount > MAX_FIXED_WIDTH_PX) {
          context.report({ node: property, messageId: 'fixedLayout' });
        }
      }
    }

    return {
      JSXOpeningElement(node) {
        if (getElementName(node) === 'meta') {
          checkViewport(node);
        }

        if (checkInlineStyles) {
          checkInlineStyle(node);
        }
      },
    };
  },
});
