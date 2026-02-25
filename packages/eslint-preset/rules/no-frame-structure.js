/**
 * Правило: no-frame-structure
 * Описание: Запрет устаревших фреймовых элементов <frame> и <frameset>
 *           Элемент <iframe> допустим только с информативным атрибутом title
 * Стандарт: ГОСТ Р 52872-2019 §5.1.1
 * Постановление №102: п. а) — структура страницы должна корректно считываться скринридерами
 *
 * <frame> и <frameset> — устаревшие HTML-элементы, недоступные для вспомогательных
 * технологий и не поддерживаемые современными браузерами.
 * <iframe> разрешён, но обязательно должен иметь атрибут title.
 */

'use strict';

const messages = require('../messages');

/**
 * Получает строковое значение JSX-атрибута
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
  // Динамическое выражение — считаем что значение есть
  if (attr.value.type === 'JSXExpressionContainer') return '__dynamic__';
  return null;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Запрещает устаревшие фреймовые элементы и требует title для <iframe> (ГОСТ Р 52872-2019 §5.1.1)',
      category: 'Доступность',
      recommended: true,
      url: 'https://github.com/ru-a11y/ru-a11y/blob/main/docs/rules/no-frame-structure.md',
    },
    messages: {
      frameElement: messages.noFrameStructure.frameElement,
      framesetElement: messages.noFrameStructure.framesetElement,
      iframeWithoutTitle: messages.noFrameStructure.iframeWithoutTitle,
      iframeEmptyTitle: messages.noFrameStructure.iframeEmptyTitle,
    },
    schema: [
      {
        type: 'object',
        properties: {
          // Если true — разрешить <iframe> (по умолчанию разрешён, но требует title)
          allowIframe: {
            type: 'boolean',
            default: true,
            description: 'Разрешить <iframe> (но требовать атрибут title)',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {};
    const allowIframe = options.allowIframe !== false;

    return {
      JSXOpeningElement(node) {
        const tagName =
          node.name && node.name.type === 'JSXIdentifier' ? node.name.name : null;

        if (!tagName) return;

        // Запрещаем <frame>
        if (tagName === 'frame') {
          context.report({
            node,
            messageId: 'frameElement',
          });
          return;
        }

        // Запрещаем <frameset>
        if (tagName === 'frameset') {
          context.report({
            node,
            messageId: 'framesetElement',
          });
          return;
        }

        // Проверяем <iframe>
        if (tagName === 'iframe') {
          if (!allowIframe) {
            context.report({
              node,
              messageId: 'frameElement',
            });
            return;
          }

          // Ищем атрибут title
          const titleAttr = node.attributes.find(
            (attr) =>
              attr.type === 'JSXAttribute' && attr.name && attr.name.name === 'title',
          );

          if (!titleAttr) {
            context.report({
              node,
              messageId: 'iframeWithoutTitle',
            });
            return;
          }

          const titleValue = getAttrStringValue(titleAttr);

          // Динамическое значение — пропускаем (доверяем разработчику)
          if (titleValue === '__dynamic__') return;

          // Пустой title
          if (!titleValue || titleValue.trim().length === 0) {
            context.report({
              node: titleAttr,
              messageId: 'iframeEmptyTitle',
            });
          }
        }
      },
    };
  },
};

