'use strict';

/**
 * ru-a11y-toolkit: umbrella package that re-exports every module of the toolkit.
 *
 * @example
 * const { configs } = require('ru-a11y-toolkit');
 * module.exports = [configs['gost-aa']];
 */

const eslint = require('ru-a11y-toolkit-eslint');
const core = require('ru-a11y-toolkit-core');

/**
 * React modules are optional: they need React and a built `dist/`. A missing
 * module resolves to an empty object, any other error is a real bug and is rethrown.
 */
function requireOptional(moduleName) {
  try {
    return require(moduleName);
  } catch (error) {
    if (error && error.code === 'MODULE_NOT_FOUND') {
      return {};
    }
    throw error;
  }
}

module.exports = {
  /** ESLint plugin with rules and flat configs. */
  eslint,
  /** Shared rule catalog, Russian texts and normative references. */
  core,
  /** Development overlay: `<toolkit.overlay.RuA11yOverlay />`. */
  overlay: requireOptional('ru-a11y-toolkit-overlay'),
  /** Visually impaired mode: `toolkit.visuallyImpaired.useVisuallyImpaired()`. */
  visuallyImpaired: requireOptional('ru-a11y-toolkit-visually-impaired'),
  /** Shortcut to the ESLint flat configs. */
  configs: eslint.configs,
  /** Shortcut to the ESLint rules. */
  rules: eslint.rules,
};
