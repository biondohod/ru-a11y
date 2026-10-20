'use strict';

const gostAA = require('./gost-aa');

/**
 * Level AAA (GOST R 52872-2019) plus extra checks. Some AAA requirements are hard
 * to meet; evaluate each rule for your project.
 */
module.exports = {
  ...gostAA,

  'jsx-a11y/media-has-caption': 'error',
  'jsx-a11y/no-noninteractive-element-interactions': 'error',
  'jsx-a11y/no-noninteractive-tabindex': 'error',
  'jsx-a11y/no-redundant-roles': 'error',

  'require-lang-attr': ['error', { enforceRussian: true }],
  'require-skip-link': [
    'error',
    {
      allowedHrefs: [
        '#main',
        '#content',
        '#maincontent',
        '#main-content',
        '#основной-контент',
        '#skip-to-content',
      ],
    },
  ],
  'zoom-200-warning': ['error', { minFontSizePx: 16, checkInlineStyles: true }],

  'jsx-a11y/autocomplete-valid': 'error',
  'jsx-a11y/no-access-key': 'error',
  'jsx-a11y/no-static-element-interactions': 'error',
  'jsx-a11y/no-interactive-element-to-noninteractive-role': 'error',
  'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
};
