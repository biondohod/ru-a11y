'use strict';

/**
 * ru-a11y-toolkit-eslint
 *
 * Accessibility rules for JSX aligned with GOST R 52872-2019 and Government
 * Decree No. 102, with Russian messages.
 *
 * @example eslint.config.js
 * const ruA11y = require('ru-a11y-toolkit-eslint');
 * module.exports = [ruA11y.configs['gost-aa']];
 */

const core = require('ru-a11y-toolkit-core');
const { version } = require('./package.json');
const { rules } = require('./rules');
const levels = {
  recommended: require('./configs/levels/recommended'),
  'gost-aa': require('./configs/levels/gost-aa'),
  strict: require('./configs/levels/strict'),
};

/** Namespace the plugin is registered under in flat config: rules are `ru-a11y/<rule>`. */
const NAMESPACE = 'ru-a11y';

const plugin = {
  meta: { name: 'ru-a11y-toolkit-eslint', version },
  rules,

  // Shared rule catalog, handy for custom tooling built on top of the plugin.
  rulesMeta: core.RU_A11Y_RULES,
  customRulesMeta: core.RU_A11Y_CUSTOM_RULES,
  getRuleMeta: core.getRuleMeta,
  eslintRuleToAxeId: core.ESLINT_RULE_TO_AXE_ID,
};

function withNamespace(ruleLevels) {
  return Object.fromEntries(
    Object.entries(ruleLevels).map(([ruleId, level]) => [`${NAMESPACE}/${ruleId}`, level]),
  );
}

function createFlatConfig(level, extra = {}) {
  return {
    name: `${NAMESPACE}/${level}`,
    plugins: { [NAMESPACE]: plugin },
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: withNamespace(levels[level]),
    ...extra,
  };
}

const recommended = createFlatConfig('recommended');
const gostAA = createFlatConfig('gost-aa');
const strict = createFlatConfig('strict', {
  linterOptions: { reportUnusedDisableDirectives: 'error' },
});

plugin.configs = {
  recommended,
  'gost-aa': gostAA,
  strict,

  // Aliases kept for projects that used the explicit `/flat` names.
  'recommended/flat': recommended,
  'gost-aa/flat': gostAA,
  'strict/flat': strict,
};

module.exports = plugin;
