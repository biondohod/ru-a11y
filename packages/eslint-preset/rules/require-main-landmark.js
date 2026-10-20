'use strict';

/**
 * require-main-landmark
 * A page must expose its main content area as `<main>` or `role="main"`.
 * GOST R 52872-2019; Government Decree No. 102, item a).
 */

const {
  createRule,
  getFilename,
  isPageLikeFile,
  messageFromCatalog,
} = require('./utils/create-rule');
const { getElementName, getStaticAttribute } = require('./utils/jsx');

module.exports = createRule({
  name: 'require-main-landmark',
  meta: {
    type: 'problem',
    docs: { description: 'Требует один основной landmark <main> или role="main"' },
    messages: { missing: messageFromCatalog('landmark-one-main') },
  },

  create(context) {
    if (!isPageLikeFile(getFilename(context))) return {};

    let hasMain = false;

    return {
      JSXOpeningElement(node) {
        if (getElementName(node) === 'main' || getStaticAttribute(node, 'role') === 'main') {
          hasMain = true;
        }
      },
      'Program:exit'(node) {
        if (!hasMain) {
          context.report({ node, messageId: 'missing' });
        }
      },
    };
  },
});
