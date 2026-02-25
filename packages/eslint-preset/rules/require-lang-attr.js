/**
 * Правило: require-lang-attr
 * Описание: Обязательный атрибут lang на элементе <html>
 * Стандарт: ГОСТ Р 52872-2019 §5.2.4, уровень A
 * Постановление №102: п. а) — информация должна быть доступна вспомогательным технологиям
 *
 * Атрибут lang помогает скринридерам выбрать правильный голосовой профиль
 * и корректно произносить текст на нужном языке.
 *
 * Для русскоязычных сайтов рекомендуется lang="ru" или lang="ru-RU".
 */

'use strict';

const messages = require('../messages');

/**
 * Список допустимых кодов языка BCP-47 (не исчерпывающий)
 * Поддерживаемые форматы:
 *   - Просто язык: ru, en, zh
 *   - Язык + скрипт (4 буквы): zh-Hans, zh-Hant
 *   - Язык + регион (2-3 буквы/цифры): ru-RU, en-US, zh-CN
 *   - Язык + скрипт + регион: zh-Hans-CN
 */
const LANG_PATTERN = /^[a-zA-Z]{2,3}(-[a-zA-Z]{4})?(-[a-zA-Z]{2,3})?(-[a-zA-Z0-9]+)*$/;

/**
 * Получает значение атрибута из JSX
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
  return null;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Требует корректного атрибута lang на элементе <html> (ГОСТ Р 52872-2019 §5.2.4)',
      category: 'Доступность',
      recommended: true,
      url: 'https://github.com/ru-a11y/ru-a11y/blob/main/docs/rules/require-lang-attr.md',
    },
    messages: {
      missing: messages.requireLangAttr.missing,
      invalidValue: messages.requireLangAttr.invalidValue,
      notRussian: messages.requireLangAttr.notRussian,
    },
    schema: [
      {
        type: 'object',
        properties: {
          // Если true — предупреждает, когда язык не русский (для гос. сайтов)
          enforceRussian: {
            type: 'boolean',
            default: false,
            description: 'Требовать lang="ru" для соответствия Постановлению №102 п. д)',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {};
    const enforceRussian = options.enforceRussian === true;

    return {
      JSXOpeningElement(node) {
        const tagName =
          node.name && node.name.type === 'JSXIdentifier' ? node.name.name : null;

        // Проверяем только элемент <html>
        if (tagName !== 'html') return;

        const langAttr = node.attributes.find(
          (attr) => attr.type === 'JSXAttribute' && attr.name && attr.name.name === 'lang',
        );

        // Атрибут lang отсутствует
        if (!langAttr) {
          context.report({
            node,
            messageId: 'missing',
          });
          return;
        }

        const langValue = getAttrStringValue(langAttr);

        // Не удалось определить значение (динамическое выражение) — пропускаем
        if (langValue === null) return;

        // Проверяем формат кода языка BCP-47
        if (!LANG_PATTERN.test(langValue)) {
          context.report({
            node: langAttr,
            messageId: 'invalidValue',
            data: { value: langValue },
          });
          return;
        }

        // Если enforceRussian — предупреждаем о не-русском языке
        if (enforceRussian) {
          const isRussian = langValue === 'ru' || langValue.startsWith('ru-');
          if (!isRussian) {
            context.report({
              node: langAttr,
              messageId: 'notRussian',
              data: { value: langValue },
            });
          }
        }
      },
    };
  },
};

