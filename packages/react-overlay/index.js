/**
 * ru-a11y-toolkit-overlay
 *
 * Точка входа для CommonJS (устаревший способ).
 * Рекомендуемый импорт — через dist/ после сборки:
 *   import { RuA11yOverlay } from 'ru-a11y-toolkit-overlay';
 *
 * Для разработки используйте:
 *   npm run build  — сборка в dist/
 *   npm run dev    — сборка в watch-режиме
 */

// После сборки dist/ будет создан автоматически через tsup.
// В процессе разработки используйте: npm run build
try {
  module.exports = require('./dist/index.js');
} catch {
  module.exports = {};
}
