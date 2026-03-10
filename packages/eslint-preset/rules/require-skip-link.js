/**
 * Правило: require-skip-link
 * Описание: Обязательное наличие ссылки «пропустить навигацию» в начале страницы
 * Стандарт: ГОСТ Р 52872-2019 §5.2.3.1, уровень A
 * Постановление №102: п. а) — беспрепятственный доступ с клавиатуры и скринридеров
 *
 * Это правило проверяет наличие skip-navigation ссылки в JSX-разметке.
 * Ссылка должна быть одним из первых интерактивных элементов на странице
 * и вести на основной контент (href="#main", "#content", "#maincontent").
 */

'use strict';

const messages = require('../messages');

/** Допустимые значения href для ссылки пропуска */
const VALID_SKIP_HREFS = new Set([
  '#main',
  '#content',
  '#maincontent',
  '#main-content',
  '#основной-контент',
]);

/**
 * Проверяет, является ли узел ссылкой пропуска навигации
 * @param {import('@typescript-eslint/types').TSESTree.JSXOpeningElement} node
 * @returns {boolean}
 */
function isSkipLink(node) {
  if (node.name.name !== 'a') return false;

  const hrefAttr = node.attributes.find(
    (attr) => attr.type === 'JSXAttribute' && attr.name && attr.name.name === 'href',
  );

  if (!hrefAttr || !hrefAttr.value) return false;

  const hrefValue =
    hrefAttr.value.type === 'Literal'
      ? hrefAttr.value.value
      : hrefAttr.value.type === 'JSXExpressionContainer' &&
          hrefAttr.value.expression.type === 'Literal'
        ? hrefAttr.value.expression.value
        : null;

  return hrefValue && VALID_SKIP_HREFS.has(hrefValue);
}

/**
 * Рекурсивно проверяет наличие skip-link в дереве JSX
 * @param {import('@typescript-eslint/types').TSESTree.JSXElement} jsxElement
 * @returns {boolean}
 */
function hasSkipLink(jsxElement) {
  if (!jsxElement || !jsxElement.children) return false;

  for (const child of jsxElement.children) {
    if (child.type === 'JSXElement') {
      if (isSkipLink(child.openingElement)) return true;
      // Проверяем только первые 5 уровней вложенности
      if (hasSkipLink(child)) return true;
    }
  }
  return false;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Требует наличия ссылки пропуска навигации в начале страницы (ГОСТ Р 52872-2019 §5.2.3.1)',
      category: 'Доступность',
      recommended: true,
      url: 'https://github.com/ru-a11y/ru-a11y/blob/main/docs/rules/require-skip-link.md',
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
          // Дополнительные допустимые значения href
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
    const options = context.options[0] || {};
    const allowedHrefs = new Set([...VALID_SKIP_HREFS, ...(options.allowedHrefs || [])]);

    /**
     * Отслеживаем, нашли ли мы skip-link в корневых JSX-элементах
     * (body, main компоненты и т.п.)
     */
    let foundSkipLink = false;

    return {
      // Проверяем JSX-элементы, которые могут быть корнем документа
      JSXElement(node) {
        const openingEl = node.openingElement;
        const tagName =
          openingEl.name && openingEl.name.type === 'JSXIdentifier' ? openingEl.name.name : null;

        // Проверяем только элементы body (для серверного рендеринга) или обёрточные компоненты
        if (tagName === 'body') {
          // Ищем skip-link среди первых дочерних элементов
          const children = node.children.filter((c) => c.type === 'JSXElement');

          if (children.length === 0) return;

          // Проверяем первые 3 дочерних элемента
          const firstChildren = children.slice(0, 3);
          const hasSkip = firstChildren.some((child) => {
            const childTag =
              child.openingElement.name && child.openingElement.name.type === 'JSXIdentifier'
                ? child.openingElement.name.name
                : null;

            if (childTag === 'a') {
              const hrefAttr = child.openingElement.attributes.find(
                (attr) => attr.type === 'JSXAttribute' && attr.name && attr.name.name === 'href',
              );

              if (!hrefAttr || !hrefAttr.value) return false;

              const hrefValue =
                hrefAttr.value.type === 'Literal'
                  ? hrefAttr.value.value
                  : hrefAttr.value.type === 'JSXExpressionContainer' &&
                      hrefAttr.value.expression.type === 'Literal'
                    ? hrefAttr.value.expression.value
                    : null;

              return hrefValue && allowedHrefs.has(hrefValue);
            }
            return false;
          });

          if (!hasSkip) {
            foundSkipLink = false;
            context.report({
              node,
              messageId: 'missing',
            });
          } else {
            foundSkipLink = true;
          }
        }
      },
    };
  },
};
