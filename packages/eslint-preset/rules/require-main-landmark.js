'use strict';

const { getRuleMeta } = require('ru-a11y-toolkit-core');

const meta = getRuleMeta('landmark-one-main');

function getJSXName(node) {
  return node && node.type === 'JSXIdentifier' ? node.name : null;
}

function getLiteralAttribute(node, name) {
  const attr = node.attributes.find(
    (item) => item.type === 'JSXAttribute' && item.name && item.name.name === name,
  );

  if (!attr || !attr.value) return null;
  if (attr.value.type === 'Literal') return String(attr.value.value);
  if (
    attr.value.type === 'JSXExpressionContainer' &&
    attr.value.expression.type === 'Literal'
  ) {
    return String(attr.value.expression.value);
  }

  return null;
}

function shouldCheckFile(context) {
  const filename = context.filename || (context.getFilename && context.getFilename()) || '';
  return /(?:^|[\\/])(app|pages?|routes?|layouts?)(?:[\\/]|$)/i.test(filename) ||
    /(?:app|page|layout|route|screen|view|index)\.[jt]sx?$/i.test(filename);
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Требует один основной landmark <main> или role="main"',
      category: 'Доступность',
      recommended: true,
      url: 'https://github.com/ru-a11y/ru-a11y/blob/main/docs/rules/require-main-landmark.md',
    },
    messages: {
      missing: `${meta.title}. ${meta.fix} [${meta.gost ?? 'ГОСТ Р 52872-2019'}; ${meta.wcag ?? 'WCAG 2.1'}]`,
    },
    schema: [],
  },

  create(context) {
    let hasMain = false;
    const shouldCheck = shouldCheckFile(context);

    return {
      JSXOpeningElement(node) {
        const tagName = getJSXName(node.name);
        const role = getLiteralAttribute(node, 'role');
        if (tagName === 'main' || role === 'main') {
          hasMain = true;
        }
      },
      'Program:exit'(node) {
        if (shouldCheck && !hasMain) {
          context.report({ node, messageId: 'missing' });
        }
      },
    };
  },
};
