'use strict';

/**
 * require-title-semantic
 * - `<title>` must not be empty or a placeholder like "Untitled" / "Новая страница";
 * - `<h1>`-`<h6>` must not be empty;
 * - heading levels must not be skipped (h1 -> h3).
 * GOST R 52872-2019, §5.2.3; Government Decree No. 102, item e).
 */

const messages = require('../messages');
const { createRule, getOptions } = require('./utils/create-rule');
const { getElementName, getStaticText, hasContent } = require('./utils/jsx');

const PLACEHOLDER_TITLES = new Set([
  'untitled',
  'untitled document',
  'untitled page',
  'new page',
  'страница',
  'новая страница',
  'документ',
  'без названия',
  'главная',
  'index',
  'home',
  'document',
  'page',
]);

const HEADING_PATTERN = /^h([1-6])$/;

function getHeadingLevel(tagName) {
  const match = HEADING_PATTERN.exec(tagName);
  return match ? Number(match[1]) : null;
}

module.exports = createRule({
  name: 'require-title-semantic',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Проверяет информативность заголовка страницы <title> и структуру заголовков h1-h6 (ГОСТ Р 52872-2019 §5.2.3)',
    },
    messages: {
      emptyTitle: messages.requireTitleSemantic.emptyTitle,
      genericTitle: messages.requireTitleSemantic.genericTitle,
      missingTitle: messages.requireTitleSemantic.missingTitle,
      headingSkipped: messages.requireTitleSemantic.headingSkipped,
      emptyHeading: messages.requireTitleSemantic.emptyHeading,
    },
    schema: [
      {
        type: 'object',
        properties: {
          checkHeadingOrder: {
            type: 'boolean',
            default: true,
            description: 'Проверять последовательность уровней заголовков h1-h6',
          },
          checkPageTitle: {
            type: 'boolean',
            default: true,
            description: 'Проверять информативность элемента <title>',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const { checkHeadingOrder = true, checkPageTitle = true } = getOptions(context);
    let previousLevel = 0;

    function checkPageTitleElement(node) {
      if (!hasContent(node)) {
        context.report({ node, messageId: 'emptyTitle' });
        return;
      }

      const title = getStaticText(node).trim();
      if (PLACEHOLDER_TITLES.has(title.toLowerCase())) {
        context.report({ node, messageId: 'genericTitle', data: { title } });
      }
    }

    function checkHeading(node, level) {
      if (!hasContent(node)) {
        context.report({ node, messageId: 'emptyHeading', data: { level } });
      }

      if (checkHeadingOrder && previousLevel > 0 && level > previousLevel + 1) {
        context.report({
          node,
          messageId: 'headingSkipped',
          data: { prev: previousLevel, current: level },
        });
      }

      previousLevel = level;
    }

    return {
      JSXElement(node) {
        const tagName = getElementName(node.openingElement);
        if (!tagName) return;

        if (tagName === 'title') {
          if (checkPageTitle) checkPageTitleElement(node);
          return;
        }

        const level = getHeadingLevel(tagName);
        if (level !== null) {
          checkHeading(node, level);
        }
      },
    };
  },
});
