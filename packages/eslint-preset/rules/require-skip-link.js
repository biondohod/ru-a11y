'use strict';

/**
 * require-skip-link
 * `<body>` must start with a "skip to content" link pointing at the main content,
 * so keyboard and screen reader users can bypass repeated navigation.
 * GOST R 52872-2019, §5.2.3.1; Government Decree No. 102, item a).
 */

const messages = require('../messages');
const { createRule, getOptions } = require('./utils/create-rule');
const { getChildElements, getElementName, getStaticAttribute } = require('./utils/jsx');

const DEFAULT_SKIP_HREFS = [
  '#main',
  '#content',
  '#maincontent',
  '#main-content',
  '#основной-контент',
];

/** The skip link has to be among the first focusable things on the page. */
const MAX_SKIP_LINK_POSITION = 3;

module.exports = createRule({
  name: 'require-skip-link',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Требует наличия ссылки пропуска навигации в начале страницы (ГОСТ Р 52872-2019 §5.2.3.1)',
    },
    messages: {
      missing: messages.requireSkipLink.missing,
      invalidHref: messages.requireSkipLink.invalidHref,
      missingText: messages.requireSkipLink.missingText,
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedHrefs: {
            type: 'array',
            items: { type: 'string' },
            description: 'Дополнительные допустимые значения href для ссылки пропуска',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const { allowedHrefs = [] } = getOptions(context);
    const skipHrefs = new Set([...DEFAULT_SKIP_HREFS, ...allowedHrefs]);

    const isSkipLink = (element) =>
      getElementName(element.openingElement) === 'a' &&
      skipHrefs.has(getStaticAttribute(element.openingElement, 'href'));

    return {
      JSXElement(node) {
        if (getElementName(node.openingElement) !== 'body') return;

        const children = getChildElements(node);
        if (children.length === 0) return;

        if (!children.slice(0, MAX_SKIP_LINK_POSITION).some(isSkipLink)) {
          context.report({ node, messageId: 'missing' });
        }
      },
    };
  },
});
