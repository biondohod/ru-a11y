'use strict';

/**
 * Wraps an eslint-plugin-jsx-a11y rule and translates its English report messages.
 *
 * ESLint 9 freezes `context.report`, so instead of patching it we hand the original
 * rule a context that inherits everything from the real one and overrides `report`.
 */

/**
 * @typedef {{ match: string | RegExp, replace: string }} MessageMapping
 */

/** Returns the Russian message for the first matching mapping, or the original one. */
function translate(message, mappings) {
  const mapping = mappings.find(({ match }) =>
    typeof match === 'string' ? message.includes(match) : match.test(message),
  );

  return mapping ? mapping.replace : message;
}

function createTranslatingContext(context, mappings) {
  const translatingContext = Object.create(context);

  Object.defineProperty(translatingContext, 'report', {
    configurable: true,
    writable: true,
    value(descriptor) {
      if (descriptor && typeof descriptor.message === 'string') {
        return context.report({ ...descriptor, message: translate(descriptor.message, mappings) });
      }
      return context.report(descriptor);
    },
  });

  return translatingContext;
}

/**
 * @param {import('eslint').Rule.RuleModule} originalRule
 * @param {MessageMapping[]} [mappings]
 * @returns {import('eslint').Rule.RuleModule}
 */
function wrapJsxRule(originalRule, mappings = []) {
  if (!originalRule || !originalRule.create) return originalRule;
  if (mappings.length === 0) return originalRule;

  return {
    meta: originalRule.meta ? { ...originalRule.meta } : { type: 'suggestion', schema: [] },
    create(context) {
      return originalRule.create(createTranslatingContext(context, mappings));
    },
  };
}

module.exports = wrapJsxRule;
