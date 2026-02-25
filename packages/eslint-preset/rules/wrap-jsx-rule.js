/**
 * wrap-jsx-rule.js
 *
 * Оборачивает правило eslint-plugin-jsx-a11y, подменяя англоязычные message
 * на русские при вызове context.report().
 *
 * ESLint 9 делает context.report non-configurable/non-writable, поэтому мы
 * создаём объект-обёртку поверх context (через Object.create + defineProperty
 * только для 'report'), и передаём его в originalRule.create.
 *
 * @param {Object} originalRule  - оригинальное правило из eslint-plugin-jsx-a11y
 * @param {Array}  ruMessages    - [{ match: RegExp|string, replace: string }, ...]
 */

'use strict';

/**
 * @param {Object} originalRule  - оригинальное правило из eslint-plugin-jsx-a11y
 * @param {Array}  ruMessages    - [{ match: RegExp|string, replace: string }, ...]
 * @returns {Object} обёрнутое ESLint-правило
 */
function wrapJsxRule(originalRule, ruMessages) {
  if (!originalRule || !originalRule.create) return originalRule;

  const mappings = Array.isArray(ruMessages) ? ruMessages : [];

  /**
   * Подменяет английское сообщение на русское, если найдено совпадение.
   */
  function translateMessage(message) {
    if (!message || !mappings.length) return message;
    for (const { match, replace } of mappings) {
      if (typeof match === 'string') {
        if (message.includes(match)) return replace;
      } else if (match instanceof RegExp) {
        if (match.test(message)) return replace;
      }
    }
    return message;
  }

  /**
   * Создаёт объект-обёртку над context, переопределяя только метод report.
   */
  function makeWrappedContext(context) {
    // Создаём объект наследующий context, но с переопределённым report
    const wrapped = Object.create(context);
    try {
      Object.defineProperty(wrapped, 'report', {
        configurable: true,
        writable: true,
        value: function (descriptor) {
          if (descriptor && typeof descriptor.message === 'string') {
            const translated = translateMessage(descriptor.message);
            if (translated !== descriptor.message) {
              return context.report.call(context, Object.assign({}, descriptor, { message: translated }));
            }
          }
          return context.report.call(context, descriptor);
        },
      });
      return wrapped;
    } catch (_) {
      return context;
    }
  }

  return {
    meta: originalRule.meta
      ? Object.assign({}, originalRule.meta)
      : { type: 'suggestion', schema: [] },

    create(context) {
      return originalRule.create(makeWrappedContext(context));
    },
  };
}

module.exports = wrapJsxRule;

