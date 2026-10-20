import type { ColorScheme, FontSizeLevel, LetterSpacingLevel, LineHeightLevel } from './settings';

export const VISUALLY_IMPAIRED_CLASS = 'ru-a11y-visually-impaired';
export const VISUALLY_IMPAIRED_STORAGE_KEY = 'ru-a11y-visually-impaired-settings';

/** Data attribute on <html> per setting; the stylesheet keys off these. */
export const ROOT_ATTRIBUTES = {
  fontSize: 'data-ru-a11y-vi-font-size',
  lineHeight: 'data-ru-a11y-vi-line-height',
  letterSpacing: 'data-ru-a11y-vi-letter-spacing',
  colorScheme: 'data-ru-a11y-vi-color-scheme',
  imageMode: 'data-ru-a11y-vi-image-mode',
  underlineLinks: 'data-ru-a11y-vi-underline-links',
  highlightLinks: 'data-ru-a11y-vi-highlight-links',
  reducedMotion: 'data-ru-a11y-vi-reduced-motion',
  strongFocus: 'data-ru-a11y-vi-strong-focus',
} as const;

export const FONT_SCALE: Readonly<Record<FontSizeLevel, string>> = {
  normal: '1',
  large: '1.25',
  xlarge: '1.5',
};

export const LINE_HEIGHT: Readonly<Record<LineHeightLevel, string>> = {
  normal: '1.5',
  wide: '1.7',
  extra: '2',
};

export const LETTER_SPACING: Readonly<Record<LetterSpacingLevel, string>> = {
  normal: '0',
  wide: '0.04em',
};

type ColorTokens = Readonly<Record<`--ru-a11y-vi-${string}`, string>>;

export const COLOR_SCHEME_TOKENS: Readonly<Record<ColorScheme, ColorTokens>> = {
  default: {
    '--ru-a11y-vi-bg': 'Canvas',
    '--ru-a11y-vi-text': 'CanvasText',
    '--ru-a11y-vi-link': 'LinkText',
    '--ru-a11y-vi-border': 'CanvasText',
    '--ru-a11y-vi-focus': '#ffbf00',
    '--ru-a11y-vi-surface': 'Canvas',
  },
  'white-black': {
    '--ru-a11y-vi-bg': '#ffffff',
    '--ru-a11y-vi-text': '#000000',
    '--ru-a11y-vi-link': '#0000ee',
    '--ru-a11y-vi-border': '#000000',
    '--ru-a11y-vi-focus': '#ffbf00',
    '--ru-a11y-vi-surface': '#ffffff',
  },
  'black-white': {
    '--ru-a11y-vi-bg': '#000000',
    '--ru-a11y-vi-text': '#ffffff',
    '--ru-a11y-vi-link': '#ffff00',
    '--ru-a11y-vi-border': '#ffffff',
    '--ru-a11y-vi-focus': '#00e5ff',
    '--ru-a11y-vi-surface': '#000000',
  },
  'blue-yellow': {
    '--ru-a11y-vi-bg': '#063462',
    '--ru-a11y-vi-text': '#fff200',
    '--ru-a11y-vi-link': '#ffffff',
    '--ru-a11y-vi-border': '#fff200',
    '--ru-a11y-vi-focus': '#ffffff',
    '--ru-a11y-vi-surface': '#063462',
  },
  'beige-brown': {
    '--ru-a11y-vi-bg': '#f7f0d2',
    '--ru-a11y-vi-text': '#3b2716',
    '--ru-a11y-vi-link': '#003399',
    '--ru-a11y-vi-border': '#3b2716',
    '--ru-a11y-vi-focus': '#8a4b00',
    '--ru-a11y-vi-surface': '#f7f0d2',
  },
};
