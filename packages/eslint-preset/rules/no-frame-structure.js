'use strict';

/**
 * no-frame-structure
 * `<frame>` and `<frameset>` are obsolete and inaccessible. `<iframe>` is allowed
 * only with a meaningful `title`.
 * GOST R 52872-2019, §5.1.1; Government Decree No. 102, item a).
 */

const messages = require('../messages');
const { createRule, getOptions } = require('./utils/create-rule');
const {
  findAttribute,
  getElementName,
  getStaticValue,
  isBlank,
  isDynamicValue,
} = require('./utils/jsx');

module.exports = createRule({
  name: 'no-frame-structure',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Запрещает устаревшие фреймовые элементы и требует title для <iframe> (ГОСТ Р 52872-2019 §5.1.1)',
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
    const { allowIframe = true } = getOptions(context);

    function checkIframe(node) {
      if (!allowIframe) {
        context.report({ node, messageId: 'frameElement' });
        return;
      }

      const title = findAttribute(node, 'title');
      if (!title) {
        context.report({ node, messageId: 'iframeWithoutTitle' });
        return;
      }

      // A dynamic title cannot be checked statically, so it is trusted.
      if (!isDynamicValue(title) && isBlank(getStaticValue(title))) {
        context.report({ node: title, messageId: 'iframeEmptyTitle' });
      }
    }

    return {
      JSXOpeningElement(node) {
        switch (getElementName(node)) {
          case 'frame':
            context.report({ node, messageId: 'frameElement' });
            break;
          case 'frameset':
            context.report({ node, messageId: 'framesetElement' });
            break;
          case 'iframe':
            checkIframe(node);
            break;
          default:
            break;
        }
      },
    };
  },
});
