'use strict';

/**
 * require-h1
 * A page needs a non-empty first level heading.
 * GOST R 52872-2019, §5.2.3; WCAG 2.1, 2.4.6.
 */

const {
  createRule,
  getFilename,
  isPageLikeFile,
  messageFromCatalog,
} = require('./utils/create-rule');
const { getElementName, getStaticAttribute, hasContent } = require('./utils/jsx');

function hasAccessibleName(element) {
  const { openingElement } = element;

  return (
    hasContent(element) ||
    Boolean(getStaticAttribute(openingElement, 'aria-label')) ||
    Boolean(getStaticAttribute(openingElement, 'aria-labelledby'))
  );
}

module.exports = createRule({
  name: 'require-h1',
  meta: {
    type: 'problem',
    docs: { description: 'Требует наличие информативного заголовка первого уровня' },
    messages: {
      missing: messageFromCatalog('page-has-heading-one'),
      empty: messageFromCatalog('empty-heading'),
    },
  },

  create(context) {
    const isPage = isPageLikeFile(getFilename(context));
    let hasH1 = false;

    return {
      JSXElement(node) {
        if (getElementName(node.openingElement) !== 'h1') return;

        hasH1 = true;
        if (!hasAccessibleName(node)) {
          context.report({ node, messageId: 'empty' });
        }
      },
      'Program:exit'(node) {
        if (isPage && !hasH1) {
          context.report({ node, messageId: 'missing' });
        }
      },
    };
  },
});
