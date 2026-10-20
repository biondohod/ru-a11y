'use strict';

/**
 * require-lang-attr
 * `<html>` must declare a valid BCP 47 `lang`, so screen readers pick the right voice.
 * Optionally enforces Russian (Government Decree No. 102, item d)).
 * GOST R 52872-2019, §5.2.4.
 */

const messages = require('../messages');
const { createRule, getOptions } = require('./utils/create-rule');
const { findAttribute, getElementName, getStaticValue } = require('./utils/jsx');

/** language[-Script][-REGION][-variant...], e.g. `ru`, `ru-RU`, `zh-Hans-CN`. */
const BCP47_PATTERN = /^[a-zA-Z]{2,3}(-[a-zA-Z]{4})?(-[a-zA-Z]{2,3})?(-[a-zA-Z0-9]+)*$/;

function isRussian(lang) {
  return lang === 'ru' || lang.startsWith('ru-');
}

module.exports = createRule({
  name: 'require-lang-attr',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Требует корректного атрибута lang на элементе <html> (ГОСТ Р 52872-2019 §5.2.4)',
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
    const { enforceRussian = false } = getOptions(context);

    return {
      JSXOpeningElement(node) {
        if (getElementName(node) !== 'html') return;

        const langAttribute = findAttribute(node, 'lang');
        if (!langAttribute) {
          context.report({ node, messageId: 'missing' });
          return;
        }

        const lang = getStaticValue(langAttribute);
        if (lang === null) return; // dynamic value, cannot be validated statically

        if (!BCP47_PATTERN.test(lang)) {
          context.report({ node: langAttribute, messageId: 'invalidValue', data: { value: lang } });
          return;
        }

        if (enforceRussian && !isRussian(lang)) {
          context.report({ node: langAttribute, messageId: 'notRussian', data: { value: lang } });
        }
      },
    };
  },
});
