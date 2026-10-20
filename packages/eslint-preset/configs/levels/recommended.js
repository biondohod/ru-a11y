'use strict';

/**
 * Level A (GOST R 52872-2019): violations that make content unusable with
 * assistive technologies. Rule ids are relative to the plugin namespace.
 */
module.exports = {
  'require-lang-attr': 'error', // GOST §5.2.4
  'no-frame-structure': 'error', // GOST §5.1.1
  'table-requires-th': 'error', // GOST §5.1.5
  'require-title-semantic': 'error', // GOST §5.2.3; Decree 102 e)
  'require-main-landmark': 'warn', // Decree 102 a)
  'require-h1': 'warn', // GOST §5.2.3
  'no-table-layout': 'warn', // GOST §5.1.5
  'require-skip-link': 'warn', // GOST §5.2.3.1
  'zoom-200-warning': 'warn', // Decree 102 b)
  'no-autoplay-media': 'warn', // WCAG 1.4.2
};
