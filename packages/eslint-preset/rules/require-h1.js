'use strict';

const { getRuleMeta } = require('ru-a11y-toolkit-core');

const pageMeta = getRuleMeta('page-has-heading-one');
const emptyMeta = getRuleMeta('empty-heading');

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

function hasTextContent(node) {
  return node.children.some((child) => {
    if (child.type === 'JSXText') return child.value.trim().length > 0;
    if (child.type === 'JSXExpressionContainer' && child.expression.type === 'Literal') {
      return String(child.expression.value ?? '').trim().length > 0;
    }
    return child.type === 'JSXElement';
  });
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
      description: 'Требует наличие информативного заголовка первого уровня',
      category: 'Доступность',
      recommended: true,
      url: 'https://github.com/ru-a11y/ru-a11y/blob/main/docs/rules/require-h1.md',
    },
    messages: {
      missing: `${pageMeta.title}. ${pageMeta.fix} [${pageMeta.gost ?? 'ГОСТ Р 52872-2019'}; ${pageMeta.wcag ?? 'WCAG 2.1'}]`,
      empty: `${emptyMeta.title}. ${emptyMeta.fix} [${emptyMeta.gost ?? 'ГОСТ Р 52872-2019'}; ${emptyMeta.wcag ?? 'WCAG 2.1'}]`,
    },
    schema: [],
  },

  create(context) {
    let hasH1 = false;
    const shouldCheck = shouldCheckFile(context);

    return {
      JSXElement(node) {
        const tagName = getJSXName(node.openingElement.name);
        if (tagName !== 'h1') return;

        hasH1 = true;
        const hasAccessibleName =
          hasTextContent(node) ||
          getLiteralAttribute(node.openingElement, 'aria-label') ||
          getLiteralAttribute(node.openingElement, 'aria-labelledby');

        if (!hasAccessibleName) {
          context.report({ node, messageId: 'empty' });
        }
      },
      'Program:exit'(node) {
        if (shouldCheck && !hasH1) {
          context.report({ node, messageId: 'missing' });
        }
      },
    };
  },
};
