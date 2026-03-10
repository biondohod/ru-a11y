/**
 * Правило: zoom-200-warning
 * Описание: Предупреждение о потенциальных проблемах с масштабированием 200%
 * Стандарт: Постановление Правительства РФ №102 п. б)
 *
 * Проверяет:
 * 1. Мета-тег viewport: user-scalable=no и maximum-scale < 2
 * 2. Инлайн-стили с маленькими размерами шрифта (< 16px/1rem)
 * 3. Фиксированные ширины контейнеров в инлайн-стилях
 */

'use strict';

const messages = require('../messages');

/**
 * Разбирает строку content мета-тега viewport
 * @param {string} content - значение атрибута content
 * @returns {Object} - объект с параметрами viewport
 */
function parseViewportContent(content) {
  const result = {};
  content.split(',').forEach((part) => {
    const [key, value] = part
      .trim()
      .split('=')
      .map((s) => s.trim());
    if (key && value !== undefined) {
      result[key] = value;
    }
  });
  return result;
}

/**
 * Проверяет, является ли значение размера шрифта слишком малым
 * @param {string|number} value - значение CSS-свойства
 * @returns {{ tooSmall: boolean, value: string }}
 */
function checkFontSize(value) {
  if (typeof value === 'number') {
    return { tooSmall: value < 16, value: `${value}px` };
  }
  if (typeof value === 'string') {
    // Проверяем px
    const pxMatch = /^(\d+(?:\.\d+)?)px$/.exec(value);
    if (pxMatch) {
      const px = parseFloat(pxMatch[1]);
      return { tooSmall: px < 16, value };
    }
    // Проверяем rem/em
    const remMatch = /^(\d+(?:\.\d+)?)rem$/.exec(value);
    if (remMatch) {
      const rem = parseFloat(remMatch[1]);
      return { tooSmall: rem < 1, value };
    }
    const emMatch = /^(\d+(?:\.\d+)?)em$/.exec(value);
    if (emMatch) {
      const em = parseFloat(emMatch[1]);
      return { tooSmall: em < 0.875, value };
    }
    // pt
    const ptMatch = /^(\d+(?:\.\d+)?)pt$/.exec(value);
    if (ptMatch) {
      const pt = parseFloat(ptMatch[1]);
      return { tooSmall: pt < 12, value };
    }
  }
  return { tooSmall: false, value: String(value) };
}

/**
 * Получает значение атрибута JSX
 * @param {import('@typescript-eslint/types').TSESTree.JSXAttribute} attr
 * @returns {string|null}
 */
function getAttrStringValue(attr) {
  if (!attr || !attr.value) return null;
  if (attr.value.type === 'Literal') return String(attr.value.value);
  if (
    attr.value.type === 'JSXExpressionContainer' &&
    attr.value.expression &&
    attr.value.expression.type === 'Literal'
  ) {
    return String(attr.value.expression.value);
  }
  return null;
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Предупреждает о потенциальных проблемах с масштабированием 200% (Постановление №102 п. б))',
      category: 'Доступность',
      recommended: true,
      url: 'https://github.com/ru-a11y/ru-a11y/blob/main/docs/rules/zoom-200-warning.md',
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
          // Минимальный размер шрифта в px (по умолчанию 16)
          minFontSizePx: {
            type: 'number',
            default: 16,
            description: 'Минимальный допустимый размер шрифта в пикселях',
          },
          // Проверять ли инлайн-стили (по умолчанию true)
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
    const options = context.options[0] || {};
    const checkInlineStyles = options.checkInlineStyles !== false;

    return {
      JSXOpeningElement(node) {
        const tagName = node.name && node.name.type === 'JSXIdentifier' ? node.name.name : null;

        // --- Проверка мета-тега viewport ---
        if (tagName === 'meta') {
          const nameAttr = node.attributes.find(
            (attr) => attr.type === 'JSXAttribute' && attr.name && attr.name.name === 'name',
          );
          const nameValue = getAttrStringValue(nameAttr);

          if (nameValue === 'viewport') {
            const contentAttr = node.attributes.find(
              (attr) => attr.type === 'JSXAttribute' && attr.name && attr.name.name === 'content',
            );
            const contentValue = getAttrStringValue(contentAttr);

            if (contentValue) {
              const viewportParams = parseViewportContent(contentValue);

              // Проверяем user-scalable=no
              if (
                viewportParams['user-scalable'] === 'no' ||
                viewportParams['user-scalable'] === '0'
              ) {
                context.report({
                  node: contentAttr || node,
                  messageId: 'userScalableNo',
                });
              }

              // Проверяем maximum-scale < 2
              if (viewportParams['maximum-scale']) {
                const maxScale = parseFloat(viewportParams['maximum-scale']);
                if (!isNaN(maxScale) && maxScale < 2) {
                  context.report({
                    node: contentAttr || node,
                    messageId: 'maxScaleLow',
                    data: { value: viewportParams['maximum-scale'] },
                  });
                }
              }
            }
          }
        }

        // --- Проверка инлайн-стилей ---
        if (!checkInlineStyles) return;

        const styleAttr = node.attributes.find(
          (attr) => attr.type === 'JSXAttribute' && attr.name && attr.name.name === 'style',
        );

        if (
          styleAttr &&
          styleAttr.value &&
          styleAttr.value.type === 'JSXExpressionContainer' &&
          styleAttr.value.expression &&
          styleAttr.value.expression.type === 'ObjectExpression'
        ) {
          const styleObj = styleAttr.value.expression;

          for (const prop of styleObj.properties) {
            if (prop.type !== 'Property') continue;

            const propName =
              prop.key.type === 'Identifier'
                ? prop.key.name
                : prop.key.type === 'Literal'
                  ? String(prop.key.value)
                  : null;

            if (!propName) continue;

            const propValue = prop.value.type === 'Literal' ? prop.value.value : null;

            // Проверяем fontSize
            if (propName === 'fontSize' && propValue !== null) {
              const { tooSmall, value } = checkFontSize(propValue);
              if (tooSmall) {
                context.report({
                  node: prop,
                  messageId: 'smallFontSize',
                  data: { value },
                });
              }
            }

            // Проверяем фиксированную ширину > 200px
            if (propName === 'width' && typeof propValue === 'number' && propValue > 200) {
              context.report({
                node: prop,
                messageId: 'fixedLayout',
              });
            }

            if (propName === 'width' && typeof propValue === 'string') {
              const pxMatch = /^(\d+(?:\.\d+)?)px$/.exec(propValue);
              if (pxMatch && parseFloat(pxMatch[1]) > 200) {
                context.report({
                  node: prop,
                  messageId: 'fixedLayout',
                });
              }
            }
          }
        }
      },
    };
  },
};
