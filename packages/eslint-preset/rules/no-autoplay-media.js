'use strict';

const { getRuleMeta } = require('ru-a11y-toolkit-core');

const meta = getRuleMeta('no-autoplay-audio');

function getJSXName(node) {
  return node && node.type === 'JSXIdentifier' ? node.name : null;
}

function hasAttribute(node, name) {
  return node.attributes.some(
    (item) => item.type === 'JSXAttribute' && item.name && item.name.name === name,
  );
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Запрещает autoplay для audio/video без controls или muted',
      category: 'Доступность',
      recommended: true,
      url: 'https://github.com/ru-a11y/ru-a11y/blob/main/docs/rules/no-autoplay-media.md',
    },
    messages: {
      autoplay: `${meta.title}. ${meta.fix} [${meta.post102 ?? 'Постановление №102'}; ${meta.wcag ?? 'WCAG 2.1'}]`,
    },
    schema: [],
  },

  create(context) {
    return {
      JSXOpeningElement(node) {
        const tagName = getJSXName(node.name);
        if (tagName !== 'audio' && tagName !== 'video') return;
        if (!hasAttribute(node, 'autoPlay') && !hasAttribute(node, 'autoplay')) return;
        if (hasAttribute(node, 'controls') || hasAttribute(node, 'muted')) return;

        context.report({ node, messageId: 'autoplay' });
      },
    };
  },
};
