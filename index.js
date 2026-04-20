'use strict';

/**
 * ru-a11y-toolkit — umbrella-пакет
 *
 * Реэкспортирует все готовые модули toolkit.
 *
 * Использование:
 *   const toolkit = require('ru-a11y-toolkit');
 *   // toolkit.eslint — ESLint-плагин
 *   // toolkit.overlay — React Overlay (только dev-режим)
 */

const eslint = require('ru-a11y-toolkit-eslint');
const core = require('ru-a11y-toolkit-core');

/**
 * React Overlay — runtime-визуализатор нарушений доступности.
 * Загружается лениво: не падает при отсутствии React в окружении.
 * Для использования: import { RuA11yOverlay } from 'ru-a11y-toolkit-overlay'
 */
let overlay = {};
try {
  overlay = require('ru-a11y-toolkit-overlay');
} catch {
  // overlay недоступен (например, dist ещё не собран или нет React)
}

/**
 * Visually Impaired — режим повышенной читабельности для слабовидящих.
 * Загружается лениво: не падает при отсутствии React в окружении.
 * Для использования: import { useVisuallyImpaired } from 'ru-a11y-toolkit-visually-impaired'
 */
let visuallyImpaired = {};
try {
  visuallyImpaired = require('ru-a11y-toolkit-visually-impaired');
} catch {
  // visuallyImpaired недоступен (например, dist ещё не собран или нет React)
}

module.exports = {
  /** ESLint-плагин с правилами и конфигами */
  eslint,

  /** Единый каталог правил, переводов и нормативных ссылок */
  core,

  /**
   * React Overlay — runtime-визуализатор нарушений доступности.
   * Используйте в dev-режиме: {process.env.NODE_ENV === 'development' && <toolkit.overlay.RuA11yOverlay />}
   */
  overlay,

  /**
   * Режим повышенной читабельности для слабовидящих.
   * Используйте хук: const { toggle, isEnabled } = toolkit.visuallyImpaired.useVisuallyImpaired()
   */
  visuallyImpaired,

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
