'use strict';

const recommended = require('./recommended');

/**
 * Level AA (GOST R 52872-2019) + Government Decree No. 102.
 * Recommended for public sector sites and any service that must comply with Decree 102.
 */
module.exports = {
  ...recommended,

  // Warnings of level A become errors.
  'require-skip-link': 'error',
  'no-table-layout': 'error',
  'zoom-200-warning': 'error',
  'require-main-landmark': 'error',
  'require-h1': 'error',
  'no-autoplay-media': 'error',

  // Stricter options. Set `enforceRussian: true` for government sites (Decree 102 d)).
  'require-lang-attr': ['error', { enforceRussian: false }],
  'table-requires-th': ['error', { requireCaption: true, requireScope: true }],

  // jsx-a11y rules with Russian messages (WCAG 2.1 AA).
  'jsx-a11y/alt-text': 'error',
  'jsx-a11y/anchor-has-content': 'error',
  'jsx-a11y/anchor-is-valid': 'error',
  'jsx-a11y/aria-props': 'error',
  'jsx-a11y/aria-proptypes': 'error',
  'jsx-a11y/aria-role': 'error',
  'jsx-a11y/aria-unsupported-elements': 'error',
  'jsx-a11y/click-events-have-key-events': 'error',
  'jsx-a11y/heading-has-content': 'error',
  'jsx-a11y/html-has-lang': 'error',
  'jsx-a11y/iframe-has-title': 'error',
  'jsx-a11y/img-redundant-alt': 'error',
  'jsx-a11y/interactive-supports-focus': 'error',
  'jsx-a11y/label-has-associated-control': 'error',
  'jsx-a11y/media-has-caption': 'warn',
  'jsx-a11y/mouse-events-have-key-events': 'error',
  'jsx-a11y/tabindex-no-positive': 'error',
  'jsx-a11y/no-noninteractive-element-interactions': 'warn',
  'jsx-a11y/no-noninteractive-tabindex': 'warn',
  'jsx-a11y/no-redundant-roles': 'warn',
  'jsx-a11y/scope': 'error',
};
