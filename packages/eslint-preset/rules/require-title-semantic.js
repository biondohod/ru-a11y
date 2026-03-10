/**
 * Правило: require-title-semantic
 * Описание: Проверяет информативность заголовков страницы и структуру заголовков h1-h6
 * Стандарт: ГОСТ Р 52872-2019 §5.2.3, уровень A
 * Постановление №102: п. е) — заголовки страниц должны описывать их тему или цель
 *
 * Проверяет:
 * 1. Элемент <title> не должен быть пустым
 * 2. Элемент <title> не должен содержать шаблонные неинформативные значения
 * 3. Заголовки h1-h6 не должны быть пустыми
 * 4. Заголовки не должны пропускать уровни (h1 → h3 без h2)
 */

'use strict';

const messages = require('../messages');

/**
 * Шаблонные неинформативные заголовки страниц
 * Эти значения нарушают требования доступности
 */
const GENERIC_TITLES = new Set([
  'untitled',
  'untitled document',
  'untitled page',
  'new page',
  'страница',
  'новая страница',
  'документ',
  'без названия',
  'главная', // Само по себе без уточнения — неинформативно
  'index',
  'home',
  'document',
  'page',
]);

/**
 * Получает текстовое содержимое JSX-элемента (только прямые текстовые дочерние узлы)
 * @param {import('@typescript-eslint/types').TSESTree.JSXElement} node
 * @returns {string}
 */
function getJSXTextContent(node) {
  if (!node.children) return '';
  return node.children
    .filter((child) => child.type === 'JSXText' || child.type === 'Literal')
    .map((child) => child.value || '')
    .join('');
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Проверяет информативность заголовка страницы <title> и структуру заголовков h1-h6 (ГОСТ Р 52872-2019 §5.2.3)',
      category: 'Доступность',
      recommended: true,
      url: 'https://github.com/ru-a11y/ru-a11y/blob/main/docs/rules/require-title-semantic.md',
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
          // Если true — проверяет структуру заголовков h1-h6 на пропуски уровней
          checkHeadingOrder: {
            type: 'boolean',
            default: true,
            description: 'Проверять последовательность уровней заголовков h1-h6',
          },
          // Если true — проверяет элемент <title>
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
    const options = context.options[0] || {};
    const checkHeadingOrder = options.checkHeadingOrder !== false;
    const checkPageTitle = options.checkPageTitle !== false;

    // Стек уровней заголовков для проверки порядка
    let lastHeadingLevel = 0;

    return {
      JSXElement(node) {
        const openingEl = node.openingElement;
        const tagName =
          openingEl.name && openingEl.name.type === 'JSXIdentifier' ? openingEl.name.name : null;

        if (!tagName) return;

        // --- Проверка <title> ---
        if (checkPageTitle && tagName === 'title') {
          const textContent = getJSXTextContent(node).trim();

          if (textContent.length === 0) {
            context.report({
              node,
              messageId: 'emptyTitle',
            });
            return;
          }

          // Проверяем на шаблонные неинформативные значения
          if (GENERIC_TITLES.has(textContent.toLowerCase())) {
            context.report({
              node,
              messageId: 'genericTitle',
              data: { title: textContent },
            });
          }
        }

        // --- Проверка заголовков h1-h6 ---
        const headingMatch = /^h([1-6])$/.exec(tagName);
        if (!headingMatch) return;

        const level = parseInt(headingMatch[1], 10);

        // Проверяем на пустой заголовок
        const textContent = getJSXTextContent(node).trim();
        if (textContent.length === 0) {
          // Проверяем вложенные нетекстовые элементы (иконки, изображения)
          const hasNonTextChildren = node.children.some((child) => child.type === 'JSXElement');
          if (!hasNonTextChildren) {
            context.report({
              node,
              messageId: 'emptyHeading',
              data: { level },
            });
          }
        }

        // Проверяем порядок заголовков
        if (checkHeadingOrder && lastHeadingLevel > 0) {
          if (level > lastHeadingLevel + 1) {
            context.report({
              node,
              messageId: 'headingSkipped',
              data: {
                prev: lastHeadingLevel,
                current: level,
              },
            });
          }
        }

        lastHeadingLevel = level;
      },
    };
  },
};
