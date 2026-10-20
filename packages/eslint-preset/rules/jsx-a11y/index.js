'use strict';

/**
 * eslint-plugin-jsx-a11y rules re-exported with Russian messages that reference
 * GOST R 52872-2019, Government Decree No. 102 and WCAG 2.1.
 * Exposed by the plugin as `ru-a11y/jsx-a11y/<rule>`.
 */

const { jsxA11y: translations } = require('../../messages');
const wrapJsxRule = require('./wrap-rule');

function loadJsxA11yRules() {
  try {
    return require('eslint-plugin-jsx-a11y').rules;
  } catch {
    return {};
  }
}

const jsxA11yRules = loadJsxA11yRules();

/** jsx-a11y rule name -> key of its translations in messages.js */
const WRAPPED_RULES = {
  'alt-text': 'altText',
  'anchor-has-content': 'anchorHasContent',
  'anchor-is-valid': 'anchorIsValid',
  'aria-props': 'ariaProps',
  'aria-proptypes': 'ariaProptypes',
  'aria-role': 'ariaRole',
  'aria-unsupported-elements': 'ariaUnsupportedElements',
  'click-events-have-key-events': 'clickEventsHaveKeyEvents',
  'heading-has-content': 'headingHasContent',
  'html-has-lang': 'htmlHasLang',
  'iframe-has-title': 'iframeHasTitle',
  'img-redundant-alt': 'imgRedundantAlt',
  'interactive-supports-focus': 'interactiveSupportsFocus',
  'label-has-associated-control': 'labelHasAssociatedControl',
  'media-has-caption': 'mediaHasCaption',
  'mouse-events-have-key-events': 'mouseEventsHaveKeyEvents',
  'tabindex-no-positive': 'tabindexNoPositive',
  'no-noninteractive-element-interactions': 'noNoninteractiveElementInteractions',
  'no-noninteractive-tabindex': 'noNoninteractiveTabindex',
  'no-redundant-roles': 'noRedundantRoles',
  scope: 'scope',
  'autocomplete-valid': 'autocompleteValid',
  'no-access-key': 'noAccessKey',
  'no-static-element-interactions': 'noStaticElementInteractions',
  'no-interactive-element-to-noninteractive-role': 'noInteractiveElementToNoninteractiveRole',
  'aria-activedescendant-has-tabindex': 'ariaActivedescendantHasTabindex',
};

/** Keeps configs valid when the optional jsx-a11y dependency is missing. */
function createNoopRule(ruleName) {
  return {
    meta: {
      type: 'suggestion',
      docs: { description: `jsx-a11y/${ruleName} (eslint-plugin-jsx-a11y не установлен)` },
      schema: [],
    },
    create: () => ({}),
  };
}

module.exports = Object.fromEntries(
  Object.entries(WRAPPED_RULES).map(([ruleName, translationKey]) => {
    const original = jsxA11yRules[ruleName];
    const rule = original
      ? wrapJsxRule(original, translations[translationKey])
      : createNoopRule(ruleName);
    return [ruleName, rule];
  }),
);
