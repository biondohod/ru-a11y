'use strict';

/**
 * no-autoplay-media
 * Audio or video must not start playing sound on its own without a way to stop it.
 * WCAG 2.1, 1.4.2 Audio Control; Government Decree No. 102.
 */

const { createRule, messageFromCatalog } = require('./utils/create-rule');
const { getElementName, hasAttribute } = require('./utils/jsx');

const MEDIA_TAGS = new Set(['audio', 'video']);

module.exports = createRule({
  name: 'no-autoplay-media',
  meta: {
    type: 'problem',
    docs: { description: 'Запрещает autoplay для audio/video без controls или muted' },
    messages: { autoplay: messageFromCatalog('no-autoplay-audio', 'post102') },
  },

  create(context) {
    return {
      JSXOpeningElement(node) {
        if (!MEDIA_TAGS.has(getElementName(node))) return;
        if (!hasAttribute(node, 'autoPlay', 'autoplay')) return;
        if (hasAttribute(node, 'controls', 'muted')) return;

        context.report({ node, messageId: 'autoplay' });
      },
    };
  },
});
