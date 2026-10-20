/**
 * jsx-a11y-ru.js
 *
 * Обёртки над правилами eslint-plugin-jsx-a11y с русскоязычными сообщениями.
 * Ссылки на: ГОСТ Р 52872-2019, Постановление №102, WCAG 2.1.
 *
 * Каждое правило оборачивается через wrap-jsx-rule, которая перехватывает
 * context.report() и подменяет message по маппингу { match, replace }.
 */

'use strict';

const wrapJsxRule = require('./wrap-jsx-rule');
const messages = require('../messages');

/**
 * Безопасно получает плагин jsx-a11y (опциональный peerDependency).
 */
function tryRequireJsxA11y() {
  try {
    return require('eslint-plugin-jsx-a11y');
  } catch {
    return null;
  }
}

const jsxA11yPlugin = tryRequireJsxA11y();
const jsxRules = jsxA11yPlugin ? jsxA11yPlugin.rules : {};

/**
 * Возвращает обёрнутое правило или заглушку, если jsx-a11y не установлен.
 * @param {string} ruleName - имя правила в jsx-a11y
 * @param {Array}  ruMappings - [{ match, replace }, ...]
 */
function wrap(ruleName, ruMappings) {
  const original = jsxRules[ruleName];
  if (!original) {
    return {
      meta: {
        type: 'suggestion',
        docs: { description: `jsx-a11y/${ruleName} (eslint-plugin-jsx-a11y не установлен)` },
        schema: [],
      },
      create() {
        return {};
      },
    };
  }
  return wrapJsxRule(original, ruMappings);
}

const m = messages.jsxA11y;

const rules = {
  'alt-text': wrap('alt-text', m.altText),
  'anchor-has-content': wrap('anchor-has-content', m.anchorHasContent),
  'anchor-is-valid': wrap('anchor-is-valid', m.anchorIsValid),
  'aria-props': wrap('aria-props', m.ariaProps),
  'aria-proptypes': wrap('aria-proptypes', m.ariaProptypes),
  'aria-role': wrap('aria-role', m.ariaRole),
  'aria-unsupported-elements': wrap('aria-unsupported-elements', m.ariaUnsupportedElements),
  'click-events-have-key-events': wrap('click-events-have-key-events', m.clickEventsHaveKeyEvents),
  'heading-has-content': wrap('heading-has-content', m.headingHasContent),
  'html-has-lang': wrap('html-has-lang', m.htmlHasLang),
  'iframe-has-title': wrap('iframe-has-title', m.iframeHasTitle),
  'img-redundant-alt': wrap('img-redundant-alt', m.imgRedundantAlt),
  'interactive-supports-focus': wrap('interactive-supports-focus', m.interactiveSupportsFocus),
  'label-has-associated-control': wrap('label-has-associated-control', m.labelHasAssociatedControl),
  'media-has-caption': wrap('media-has-caption', m.mediaHasCaption),
  'mouse-events-have-key-events': wrap('mouse-events-have-key-events', m.mouseEventsHaveKeyEvents),
  // Правило в jsx-a11y называется tabindex-no-positive (не no-positive-tabindex)
  'tabindex-no-positive': wrap('tabindex-no-positive', m.tabindexNoPositive),
  'no-noninteractive-element-interactions': wrap(
    'no-noninteractive-element-interactions',
    m.noNoninteractiveElementInteractions,
  ),
  'no-noninteractive-tabindex': wrap('no-noninteractive-tabindex', m.noNoninteractiveTabindex),
  'no-redundant-roles': wrap('no-redundant-roles', m.noRedundantRoles),
  scope: wrap('scope', m.scope),
  'autocomplete-valid': wrap('autocomplete-valid', m.autocompleteValid),
  'no-access-key': wrap('no-access-key', m.noAccessKey),
  'no-static-element-interactions': wrap(
    'no-static-element-interactions',
    m.noStaticElementInteractions,
  ),
  'no-interactive-element-to-noninteractive-role': wrap(
    'no-interactive-element-to-noninteractive-role',
    m.noInteractiveElementToNoninteractiveRole,
  ),
  'aria-activedescendant-has-tabindex': wrap(
    'aria-activedescendant-has-tabindex',
    m.ariaActivedescendantHasTabindex,
  ),
};

module.exports = rules;
