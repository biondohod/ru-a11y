'use strict';

const jsxA11yRules = require('./jsx-a11y');

/** Rules implemented by ru-a11y itself. */
const customRules = {
  'require-skip-link': require('./require-skip-link'),
  'no-table-layout': require('./no-table-layout'),
  'require-lang-attr': require('./require-lang-attr'),
  'require-title-semantic': require('./require-title-semantic'),
  'zoom-200-warning': require('./zoom-200-warning'),
  'no-frame-structure': require('./no-frame-structure'),
  'table-requires-th': require('./table-requires-th'),
  'require-main-landmark': require('./require-main-landmark'),
  'require-h1': require('./require-h1'),
  'no-autoplay-media': require('./no-autoplay-media'),
};

/** Every rule of the plugin: custom ones plus translated jsx-a11y rules under `jsx-a11y/`. */
const rules = {
  ...customRules,
  ...Object.fromEntries(
    Object.entries(jsxA11yRules).map(([name, rule]) => [`jsx-a11y/${name}`, rule]),
  ),
};

module.exports = { customRules, jsxA11yRules, rules };
