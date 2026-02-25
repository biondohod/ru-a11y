/**
 * @ru-a11y/eslint-preset
 *
 * ESLint-пресет для проверки веб-доступности согласно:
 * - ГОСТ Р 52872-2012 «Интернет-ресурсы и другая информация, представленная
 *   в электронно-цифровой форме. Приложения для стационарных и мобильных
 *   устройств, иные пользовательские интерфейсы. Требования доступности»
 * - Постановление Правительства РФ №102 от 07.02.2026
 *
 * === Flat Config (ESLint 9+, eslint.config.js) ===
 *
 * import ruA11y from '@ru-a11y/eslint-preset';
 * export default [ruA11y.configs['recommended/flat']];
 *
 * Или с jsx-a11y:
 * import ruA11y from '@ru-a11y/eslint-preset';
 * import jsxA11y from 'eslint-plugin-jsx-a11y';
 * export default [
 *   { plugins: { 'jsx-a11y': jsxA11y } },
 *   ruA11y.configs['gost-aa/flat'],
 * ];
 *
 * === Legacy Config (ESLint 8, .eslintrc.js) ===
 *
 * module.exports = {
 *   extends: ['@ru-a11y/gost-aa']
 * }
 *
 * Или для более точного контроля:
 * module.exports = {
 *   plugins: ['@ru-a11y/gost-a11y'],
 *   rules: {
 *     '@ru-a11y/gost-a11y/require-lang-attr': 'error',
 *     // ... другие правила
 *   }
 * }
 */

'use strict';

// Импорт всех кастомных правил
const requireSkipLink = require('./rules/require-skip-link');
const noTableLayout = require('./rules/no-table-layout');
const requireLangAttr = require('./rules/require-lang-attr');
const requireTitleSemantic = require('./rules/require-title-semantic');
const zoom200Warning = require('./rules/zoom-200-warning');
const noFrameStructure = require('./rules/no-frame-structure');
const tableRequiresTh = require('./rules/table-requires-th');

// Импорт конфигураций
const recommended = require('./configs/recommended');
const gostAA = require('./configs/gost-aa');
const strict = require('./configs/strict');

/**
 * Плагин @ru-a11y/gost-a11y
 * Экспортирует все кастомные правила и готовые конфигурации
 */
const plugin = {
  meta: {
    name: '@ru-a11y/gost-a11y',
    version: '1.0.0-alpha.1',
  },

  // Все кастомные правила
  rules: {
    'require-skip-link': requireSkipLink,
    'no-table-layout': noTableLayout,
    'require-lang-attr': requireLangAttr,
    'require-title-semantic': requireTitleSemantic,
    'zoom-200-warning': zoom200Warning,
    'no-frame-structure': noFrameStructure,
    'table-requires-th': tableRequiresTh,
  },
};

// Flat Config-объекты строятся после plugin, чтобы избежать циклических зависимостей
const flatPlugins = { '@ru-a11y/gost-a11y': plugin };

plugin.configs = {
  // === Legacy Config (ESLint 8, .eslintrc.js) ===

  // Базовый уровень — ГОСТ А (критические нарушения)
  recommended,

  // Полный уровень — ГОСТ AA + Постановление №102
  'gost-aa': gostAA,

  // Максимальный уровень — ГОСТ AAA + дополнительные RU-паттерны
  strict,

  // === Flat Config (ESLint 9+, eslint.config.js) ===

  // Базовый уровень — ГОСТ А
  'recommended/flat': {
    name: '@ru-a11y/gost-a11y/recommended',
    plugins: flatPlugins,
    rules: recommended.rules,
  },

  // Полный уровень — ГОСТ AA + Постановление №102
  // Примечание: jsx-a11y нужно передать отдельно:
  // { plugins: { 'jsx-a11y': jsxA11y } }
  'gost-aa/flat': {
    name: '@ru-a11y/gost-a11y/gost-aa',
    plugins: flatPlugins,
    rules: gostAA.rules,
  },

  // Максимальный уровень — ГОСТ AAA
  'strict/flat': {
    name: '@ru-a11y/gost-a11y/strict',
    plugins: flatPlugins,
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    rules: strict.rules,
  },
};

module.exports = plugin;

