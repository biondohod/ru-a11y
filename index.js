'use strict';

/**
 * ru-a11y-toolkit — umbrella-пакет
 *
 * Реэкспортирует все готовые модули toolkit.
 * По мере выхода CLI и React Overlay они будут добавлены сюда.
 *
 * Использование:
 *   const toolkit = require('ru-a11y-toolkit');
 *   // toolkit.eslint — ESLint-плагин
 *   // toolkit.eslint.configs['gost-aa'] — конфиг напрямую
 */

const eslint = require('ru-a11y-toolkit-eslint');

module.exports = {
  /** ESLint-плагин с правилами и конфигами */
  eslint,

  /**
   * Конфиги для прямого использования в eslint.config.js (Flat Config):
   *   const { configs } = require('ru-a11y-toolkit');
   *   module.exports = [configs.recommended];
   */
  configs: eslint.configs,

  /**
   * Все правила плагина:
   *   const { rules } = require('ru-a11y-toolkit');
   */
  rules: eslint.rules,
};

