import { resolveEffectiveSettings, type VisuallyImpairedSettings } from '../model/settings';
import {
  COLOR_SCHEME_TOKENS,
  FONT_SCALE,
  LETTER_SPACING,
  LINE_HEIGHT,
  ROOT_ATTRIBUTES,
  VISUALLY_IMPAIRED_CLASS,
} from '../model/theme';
import { canUseDOM } from './env';
import { disableImageAltCaptions, enableImageAltCaptions } from './imageAltCaptions';

/** `null` removes the attribute, booleans toggle a valueless attribute. */
function setRootAttribute(root: HTMLElement, name: string, value: string | boolean | null): void {
  if (value === null) {
    root.removeAttribute(name);
  } else if (typeof value === 'boolean') {
    root.toggleAttribute(name, value);
  } else {
    root.setAttribute(name, value);
  }
}

/** Default values are expressed by the absence of the attribute. */
function valueOrNull<T extends string>(value: T, defaultValue: T): T | null {
  return value === defaultValue ? null : value;
}

/** Reflects the settings on <html> as a class, data attributes and CSS variables. */
export function applySettings(settings: VisuallyImpairedSettings): void {
  if (!canUseDOM()) return;

  const root = document.documentElement;
  const effective = resolveEffectiveSettings(settings);

  root.classList.toggle(VISUALLY_IMPAIRED_CLASS, settings.enabled);

  const attributes: Record<keyof typeof ROOT_ATTRIBUTES, string | boolean | null> = {
    fontSize: valueOrNull(effective.fontSize, 'normal'),
    lineHeight: valueOrNull(effective.lineHeight, 'normal'),
    letterSpacing: valueOrNull(effective.letterSpacing, 'normal'),
    colorScheme: valueOrNull(effective.colorScheme, 'default'),
    imageMode: valueOrNull(effective.imageMode, 'normal'),
    underlineLinks: effective.underlineLinks,
    highlightLinks: effective.highlightLinks,
    reducedMotion: effective.reducedMotion,
    strongFocus: effective.strongFocus,
  };

  (Object.keys(attributes) as Array<keyof typeof attributes>).forEach((key) => {
    setRootAttribute(root, ROOT_ATTRIBUTES[key], attributes[key]);
  });

  root.style.setProperty('--ru-a11y-vi-font-scale', FONT_SCALE[effective.fontSize]);
  root.style.setProperty('--ru-a11y-vi-line-height', LINE_HEIGHT[effective.lineHeight]);
  root.style.setProperty('--ru-a11y-vi-letter-spacing', LETTER_SPACING[effective.letterSpacing]);
  Object.entries(COLOR_SCHEME_TOKENS[effective.colorScheme]).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });

  if (effective.showImageAlt) {
    enableImageAltCaptions();
  } else {
    disableImageAltCaptions();
  }
}
