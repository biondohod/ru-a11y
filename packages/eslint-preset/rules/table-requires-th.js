/**
 * Правило: table-requires-th
 * Описание: Каждая таблица данных должна содержать заголовочные ячейки <th> с атрибутом scope
 * Стандарт: ГОСТ Р 52872-2019 §5.1.5
 * Постановление №102: п. а) — структура должна корректно определяться скринридерами
 *
 * Без заголовочных ячеек <th> скринридеры не могут связать данные с их контекстом,
 * что делает таблицы недоступными для незрячих пользователей.
 *
 * Исключения:
 * - Таблицы с role="presentation" или role="none" (используются для вёрстки)
 * - Таблицы с aria-hidden="true"
 */

'use strict';

const messages = require('../messages');

/** Допустимые значения атрибута scope */
const VALID_SCOPE_VALUES = new Set(['col', 'row', 'colgroup', 'rowgroup']);

/**
 * Получает строковое значение JSX-атрибута
 * @param {import('@typescript-eslint/types').TSESTree.JSXAttribute} attr
 * @returns {string|null}
 */
function getAttrStringValue(attr) {
  if (!attr || !attr.value) return null;
  if (attr.value.type === 'Literal') return String(attr.value.value);
  if (
    attr.value.type === 'JSXExpressionContainer' &&
    attr.value.expression &&
    attr.value.expression.type === 'Literal'
  ) {
    return String(attr.value.expression.value);
  }
  if (attr.value.type === 'JSXExpressionContainer') return '__dynamic__';
  return null;
}

/**
 * Ищет атрибут по имени
 * @param {Array} attributes
 * @param {string} name
 * @returns {import('@typescript-eslint/types').TSESTree.JSXAttribute|undefined}
 */
function findAttr(attributes, name) {
  return attributes.find(
    (attr) => attr.type === 'JSXAttribute' && attr.name && attr.name.name === name,
  );
}

/**
 * Рекурсивно ищет все дочерние JSX-элементы с заданным именем тега
 * @param {import('@typescript-eslint/types').TSESTree.JSXElement} jsxElement
 * @param {string} tagName
 * @returns {Array}
 */
function findAllDescendants(jsxElement, tagName) {
  const results = [];
  if (!jsxElement || !jsxElement.children) return results;

  function traverse(children) {
    for (const child of children) {
      if (child.type !== 'JSXElement') continue;
      const childTag =
        child.openingElement.name && child.openingElement.name.type === 'JSXIdentifier'
          ? child.openingElement.name.name
          : null;
      if (childTag === tagName) results.push(child);
      traverse(child.children || []);
    }
  }

  traverse(jsxElement.children);
  return results;
}

/**
 * Проверяет, является ли таблица презентационной (для вёрстки)
 * @param {import('@typescript-eslint/types').TSESTree.JSXOpeningElement} openingElement
 * @returns {boolean}
 */
function isPresentationalTable(openingElement) {
  const roleAttr = findAttr(openingElement.attributes, 'role');
  const roleValue = getAttrStringValue(roleAttr);
  if (roleValue === 'presentation' || roleValue === 'none') return true;

  const ariaHiddenAttr = findAttr(openingElement.attributes, 'aria-hidden');
  if (ariaHiddenAttr) {
    const ariaHiddenValue = getAttrStringValue(ariaHiddenAttr);
    if (ariaHiddenValue === 'true' || ariaHiddenAttr.value === null) return true;
  }

  return false;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Требует наличия <th> с атрибутом scope в каждой таблице данных (ГОСТ Р 52872-2019 §5.1.5)',
      category: 'Доступность',
      recommended: true,
      url: 'https://github.com/ru-a11y/ru-a11y/blob/main/docs/rules/table-requires-th.md',
    },
    messages: {
      missingTh: messages.tableRequiresTh.missingTh,
      missingScope: messages.tableRequiresTh.missingScope,
      invalidScope: messages.tableRequiresTh.invalidScope,
      missingCaption: messages.tableRequiresTh.missingCaption,
    },
    schema: [
      {
        type: 'object',
        properties: {
          // Требовать <caption> для каждой таблицы
          requireCaption: {
            type: 'boolean',
            default: false,
            description: 'Требовать элемент <caption> в каждой таблице данных',
          },
          // Требовать атрибут scope на всех <th>
          requireScope: {
            type: 'boolean',
            default: true,
            description: 'Требовать атрибут scope на элементах <th>',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {};
    const requireCaption = options.requireCaption === true;
    const requireScope = options.requireScope !== false;

    return {
      JSXElement(node) {
        const openingEl = node.openingElement;
        const tagName =
          openingEl.name && openingEl.name.type === 'JSXIdentifier' ? openingEl.name.name : null;

        // Проверяем только элементы <table>
        if (tagName !== 'table') return;

        // Пропускаем презентационные таблицы
        if (isPresentationalTable(openingEl)) return;

        // --- Проверка наличия <th> ---
        const thElements = findAllDescendants(node, 'th');

        if (thElements.length === 0) {
          context.report({
            node: openingEl,
            messageId: 'missingTh',
          });
          // Не продолжаем — нет смысла проверять scope если нет th
          return;
        }

        // --- Проверка атрибута scope на <th> ---
        if (requireScope) {
          for (const thElement of thElements) {
            const scopeAttr = findAttr(thElement.openingElement.attributes, 'scope');

            if (!scopeAttr) {
              context.report({
                node: thElement.openingElement,
                messageId: 'missingScope',
              });
              continue;
            }

            const scopeValue = getAttrStringValue(scopeAttr);

            // Динамическое значение — пропускаем
            if (scopeValue === '__dynamic__') continue;

            if (scopeValue && !VALID_SCOPE_VALUES.has(scopeValue)) {
              context.report({
                node: scopeAttr,
                messageId: 'invalidScope',
                data: { value: scopeValue },
              });
            }
          }
        }

        // --- Проверка наличия <caption> ---
        if (requireCaption) {
          const captionElements = findAllDescendants(node, 'caption');
          if (captionElements.length === 0) {
            context.report({
              node: openingEl,
              messageId: 'missingCaption',
            });
          }
        }
      },
    };
  },
};
