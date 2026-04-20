import { useCallback, useEffect, useState } from 'react';

export const VISUALLY_IMPAIRED_CLASS = 'ru-a11y-visually-impaired';
export const VISUALLY_IMPAIRED_STORAGE_KEY = 'ru-a11y-visually-impaired-settings';

const IMAGE_ALT_CAPTION_CLASS = 'ru-a11y-visually-impaired-image-alt';
const IMAGE_ALT_CAPTION_ATTRIBUTE = 'data-ru-a11y-image-alt-caption';

export type FontSizeLevel = 'normal' | 'large' | 'xlarge';
export type LineHeightLevel = 'normal' | 'wide' | 'extra';
export type LetterSpacingLevel = 'normal' | 'wide';
export type ColorScheme = 'default' | 'white-black' | 'black-white' | 'blue-yellow' | 'beige-brown';
export type ImageMode = 'normal' | 'grayscale' | 'hidden';

export interface VisuallyImpairedSettings {
  enabled: boolean;
  fontSize: FontSizeLevel;
  lineHeight: LineHeightLevel;
  letterSpacing: LetterSpacingLevel;
  colorScheme: ColorScheme;
  underlineLinks: boolean;
  highlightLinks: boolean;
  imageMode: ImageMode;
  showImageAlt: boolean;
  reducedMotion: boolean;
  strongFocus: boolean;
}

export interface UseVisuallyImpairedSettingsReturn {
  settings: VisuallyImpairedSettings;
  setSettings: (next: Partial<VisuallyImpairedSettings>) => void;
  reset: () => void;
}

export interface UseVisuallyImpairedReturn extends UseVisuallyImpairedSettingsReturn {
  isEnabled: boolean;
  enable: () => void;
  disable: () => void;
  toggle: () => void;
}

export interface UseFontSizeReturn {
  fontSize: FontSizeLevel;
  setFontSize: (fontSize: FontSizeLevel) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
}

export interface UseColorSchemeReturn {
  colorScheme: ColorScheme;
  setColorScheme: (colorScheme: ColorScheme) => void;
}

export interface UseLinkSettingsReturn {
  underlineLinks: boolean;
  highlightLinks: boolean;
  setUnderlineLinks: (underlineLinks: boolean) => void;
  setHighlightLinks: (highlightLinks: boolean) => void;
  toggleUnderlineLinks: () => void;
  toggleHighlightLinks: () => void;
}

export interface UseImageSettingsReturn {
  imageMode: ImageMode;
  showImageAlt: boolean;
  setImageMode: (imageMode: ImageMode) => void;
  setShowImageAlt: (showImageAlt: boolean) => void;
  toggleShowImageAlt: () => void;
}

export interface UseMotionSettingsReturn {
  reducedMotion: boolean;
  setReducedMotion: (reducedMotion: boolean) => void;
  toggleReducedMotion: () => void;
}

export interface UseFocusSettingsReturn {
  strongFocus: boolean;
  setStrongFocus: (strongFocus: boolean) => void;
  toggleStrongFocus: () => void;
}

export const DEFAULT_VISUALLY_IMPAIRED_SETTINGS: VisuallyImpairedSettings = {
  enabled: false,
  fontSize: 'normal',
  lineHeight: 'normal',
  letterSpacing: 'normal',
  colorScheme: 'default',
  underlineLinks: false,
  highlightLinks: false,
  imageMode: 'normal',
  showImageAlt: false,
  reducedMotion: false,
  strongFocus: false,
};

const FULL_MODE_FALLBACKS = {
  fontSize: 'large' as FontSizeLevel,
  lineHeight: 'wide' as LineHeightLevel,
  colorScheme: 'white-black' as ColorScheme,
  underlineLinks: true,
  showImageAlt: true,
  reducedMotion: true,
  strongFocus: true,
};

const FONT_SCALE: Record<FontSizeLevel, string> = {
  normal: '1',
  large: '1.25',
  xlarge: '1.5',
};

const LINE_HEIGHT: Record<LineHeightLevel, string> = {
  normal: '1.5',
  wide: '1.7',
  extra: '2',
};

const LETTER_SPACING: Record<LetterSpacingLevel, string> = {
  normal: '0',
  wide: '0.04em',
};

const COLOR_SCHEMES: Record<ColorScheme, Record<string, string>> = {
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

let imageAltObserver: MutationObserver | null = null;
let isSyncingImageAltCaptions = false;
let settings = readStoredSettings();
const listeners = new Set<() => void>();

function canUseDOM(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function normalizeSettings(value: unknown): VisuallyImpairedSettings {
  if (!value || typeof value !== 'object') {
    return { ...DEFAULT_VISUALLY_IMPAIRED_SETTINGS };
  }

  const input = value as Partial<VisuallyImpairedSettings>;

  return {
    enabled: typeof input.enabled === 'boolean' ? input.enabled : DEFAULT_VISUALLY_IMPAIRED_SETTINGS.enabled,
    fontSize: isOneOf(input.fontSize, ['normal', 'large', 'xlarge'])
      ? input.fontSize
      : DEFAULT_VISUALLY_IMPAIRED_SETTINGS.fontSize,
    lineHeight: isOneOf(input.lineHeight, ['normal', 'wide', 'extra'])
      ? input.lineHeight
      : DEFAULT_VISUALLY_IMPAIRED_SETTINGS.lineHeight,
    letterSpacing: isOneOf(input.letterSpacing, ['normal', 'wide'])
      ? input.letterSpacing
      : DEFAULT_VISUALLY_IMPAIRED_SETTINGS.letterSpacing,
    colorScheme: isOneOf(input.colorScheme, ['default', 'white-black', 'black-white', 'blue-yellow', 'beige-brown'])
      ? input.colorScheme
      : DEFAULT_VISUALLY_IMPAIRED_SETTINGS.colorScheme,
    underlineLinks:
      typeof input.underlineLinks === 'boolean'
        ? input.underlineLinks
        : DEFAULT_VISUALLY_IMPAIRED_SETTINGS.underlineLinks,
    highlightLinks:
      typeof input.highlightLinks === 'boolean'
        ? input.highlightLinks
        : DEFAULT_VISUALLY_IMPAIRED_SETTINGS.highlightLinks,
    imageMode: isOneOf(input.imageMode, ['normal', 'grayscale', 'hidden'])
      ? input.imageMode
      : DEFAULT_VISUALLY_IMPAIRED_SETTINGS.imageMode,
    showImageAlt:
      typeof input.showImageAlt === 'boolean'
        ? input.showImageAlt
        : DEFAULT_VISUALLY_IMPAIRED_SETTINGS.showImageAlt,
    reducedMotion:
      typeof input.reducedMotion === 'boolean'
        ? input.reducedMotion
        : DEFAULT_VISUALLY_IMPAIRED_SETTINGS.reducedMotion,
    strongFocus:
      typeof input.strongFocus === 'boolean'
        ? input.strongFocus
        : DEFAULT_VISUALLY_IMPAIRED_SETTINGS.strongFocus,
  };
}

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === 'string' && allowed.includes(value as T);
}

function readStoredSettings(): VisuallyImpairedSettings {
  const storage = getStorage();
  if (!storage) return { ...DEFAULT_VISUALLY_IMPAIRED_SETTINGS };

  try {
    const raw = storage.getItem(VISUALLY_IMPAIRED_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_VISUALLY_IMPAIRED_SETTINGS };
    return normalizeSettings(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_VISUALLY_IMPAIRED_SETTINGS };
  }
}

function persistSettings(next: VisuallyImpairedSettings): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(VISUALLY_IMPAIRED_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota and privacy-mode failures.
  }
}

function emit(): void {
  listeners.forEach((listener) => listener());
}

function observeImageAltChanges(): void {
  if (!canUseDOM() || !document.body || !imageAltObserver) return;

  imageAltObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['alt'],
  });
}

function syncImageAltCaptions(): void {
  if (!canUseDOM() || isSyncingImageAltCaptions) return;

  isSyncingImageAltCaptions = true;

  try {
    imageAltObserver?.disconnect();

    const images = Array.from(document.querySelectorAll<HTMLImageElement>('img[alt]'));
    const activeImages = new Set(images);

    images.forEach((image) => {
      const altText = image.getAttribute('alt')?.trim();
      const nextSibling = image.nextElementSibling;
      const existingCaption =
        nextSibling instanceof HTMLElement && nextSibling.classList.contains(IMAGE_ALT_CAPTION_CLASS)
          ? nextSibling
          : null;

      if (!altText) {
        existingCaption?.remove();
        return;
      }

      const caption = existingCaption ?? document.createElement('span');
      caption.className = IMAGE_ALT_CAPTION_CLASS;
      caption.setAttribute(IMAGE_ALT_CAPTION_ATTRIBUTE, 'true');
      caption.textContent = altText;

      if (!existingCaption) {
        image.insertAdjacentElement('afterend', caption);
      }
    });

    document.querySelectorAll<HTMLElement>(`.${IMAGE_ALT_CAPTION_CLASS}`).forEach((caption) => {
      const previousSibling = caption.previousElementSibling;

      if (!(previousSibling instanceof HTMLImageElement) || !activeImages.has(previousSibling)) {
        caption.remove();
      }
    });
  } finally {
    isSyncingImageAltCaptions = false;
    observeImageAltChanges();
  }
}

function startImageAltObserver(): void {
  if (!canUseDOM() || imageAltObserver) return;

  imageAltObserver = new MutationObserver(() => {
    syncImageAltCaptions();
  });

  observeImageAltChanges();
}

function stopImageAltObserver(): void {
  imageAltObserver?.disconnect();
  imageAltObserver = null;
}

function removeImageAltCaptions(): void {
  if (!canUseDOM()) return;

  document.querySelectorAll(`.${IMAGE_ALT_CAPTION_CLASS}`).forEach((caption) => {
    caption.remove();
  });
}

function setRootAttribute(name: string, value: string | boolean | null): void {
  const root = document.documentElement;
  if (value === null) {
    root.removeAttribute(name);
    return;
  }

  if (typeof value === 'boolean') {
    root.toggleAttribute(name, value);
    return;
  }

  root.setAttribute(name, value);
}

function applySettings(next: VisuallyImpairedSettings): void {
  if (!canUseDOM()) return;

  const root = document.documentElement;
  const effectiveFontSize =
    next.enabled && next.fontSize === 'normal' ? FULL_MODE_FALLBACKS.fontSize : next.fontSize;
  const effectiveLineHeight =
    next.enabled && next.lineHeight === 'normal' ? FULL_MODE_FALLBACKS.lineHeight : next.lineHeight;
  const effectiveColorScheme =
    next.enabled && next.colorScheme === 'default' ? FULL_MODE_FALLBACKS.colorScheme : next.colorScheme;
  const effectiveUnderlineLinks = next.enabled ? FULL_MODE_FALLBACKS.underlineLinks : next.underlineLinks;
  const effectiveShowImageAlt = next.enabled ? FULL_MODE_FALLBACKS.showImageAlt : next.showImageAlt;
  const effectiveReducedMotion = next.enabled ? FULL_MODE_FALLBACKS.reducedMotion : next.reducedMotion;
  const effectiveStrongFocus = next.enabled ? FULL_MODE_FALLBACKS.strongFocus : next.strongFocus;

  root.classList.toggle(VISUALLY_IMPAIRED_CLASS, next.enabled);
  setRootAttribute(
    'data-ru-a11y-vi-font-size',
    effectiveFontSize === 'normal' ? null : effectiveFontSize,
  );
  setRootAttribute(
    'data-ru-a11y-vi-line-height',
    effectiveLineHeight === 'normal' ? null : effectiveLineHeight,
  );
  setRootAttribute(
    'data-ru-a11y-vi-letter-spacing',
    next.letterSpacing === 'normal' ? null : next.letterSpacing,
  );
  setRootAttribute(
    'data-ru-a11y-vi-color-scheme',
    effectiveColorScheme === 'default' ? null : effectiveColorScheme,
  );
  setRootAttribute('data-ru-a11y-vi-image-mode', next.imageMode === 'normal' ? null : next.imageMode);
  setRootAttribute('data-ru-a11y-vi-underline-links', effectiveUnderlineLinks);
  setRootAttribute('data-ru-a11y-vi-highlight-links', next.highlightLinks);
  setRootAttribute('data-ru-a11y-vi-reduced-motion', effectiveReducedMotion);
  setRootAttribute('data-ru-a11y-vi-strong-focus', effectiveStrongFocus);

  root.style.setProperty('--ru-a11y-vi-font-scale', FONT_SCALE[effectiveFontSize]);
  root.style.setProperty('--ru-a11y-vi-line-height', LINE_HEIGHT[effectiveLineHeight]);
  root.style.setProperty('--ru-a11y-vi-letter-spacing', LETTER_SPACING[next.letterSpacing]);

  Object.entries(COLOR_SCHEMES[effectiveColorScheme]).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });

  if (effectiveShowImageAlt) {
    syncImageAltCaptions();
    startImageAltObserver();
  } else {
    stopImageAltObserver();
    removeImageAltCaptions();
  }
}

export function getVisuallyImpairedSettings(): VisuallyImpairedSettings {
  return settings;
}

export function setVisuallyImpairedSettings(next: Partial<VisuallyImpairedSettings>): void {
  settings = normalizeSettings({ ...settings, ...next });
  persistSettings(settings);
  applySettings(settings);
  emit();
}

export function resetVisuallyImpairedSettings(): void {
  settings = { ...DEFAULT_VISUALLY_IMPAIRED_SETTINGS };
  persistSettings(settings);
  applySettings(settings);
  emit();
}

export function initializeVisuallyImpaired(): void {
  settings = readStoredSettings();
  applySettings(settings);
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useVisuallyImpairedSettings(): UseVisuallyImpairedSettingsReturn {
  const [snapshot, setSnapshot] = useState(() => getVisuallyImpairedSettings());

  useEffect(() => {
    const unsubscribe = subscribe(() => setSnapshot(getVisuallyImpairedSettings()));
    initializeVisuallyImpaired();
    return unsubscribe;
  }, []);

  const setSettings = useCallback((next: Partial<VisuallyImpairedSettings>) => {
    setVisuallyImpairedSettings(next);
  }, []);

  const reset = useCallback(() => {
    resetVisuallyImpairedSettings();
  }, []);

  return { settings: snapshot, setSettings, reset };
}

export function useVisuallyImpairedMode(): Pick<
  UseVisuallyImpairedReturn,
  'isEnabled' | 'enable' | 'disable' | 'toggle'
> {
  const { settings: current, setSettings } = useVisuallyImpairedSettings();

  const enable = useCallback(() => setSettings({ enabled: true }), [setSettings]);
  const disable = useCallback(() => setSettings({ enabled: false }), [setSettings]);
  const toggle = useCallback(() => setSettings({ enabled: !current.enabled }), [current.enabled, setSettings]);

  return { isEnabled: current.enabled, enable, disable, toggle };
}

export function useFontSize(): UseFontSizeReturn {
  const { settings: current, setSettings } = useVisuallyImpairedSettings();
  const levels: FontSizeLevel[] = ['normal', 'large', 'xlarge'];

  const setFontSize = useCallback((fontSize: FontSizeLevel) => setSettings({ fontSize }), [setSettings]);
  const increaseFontSize = useCallback(() => {
    const index = levels.indexOf(current.fontSize);
    setFontSize(levels[Math.min(index + 1, levels.length - 1)]);
  }, [current.fontSize, setFontSize]);
  const decreaseFontSize = useCallback(() => {
    const index = levels.indexOf(current.fontSize);
    setFontSize(levels[Math.max(index - 1, 0)]);
  }, [current.fontSize, setFontSize]);

  return { fontSize: current.fontSize, setFontSize, increaseFontSize, decreaseFontSize };
}

export function useColorScheme(): UseColorSchemeReturn {
  const { settings: current, setSettings } = useVisuallyImpairedSettings();
  const setColorScheme = useCallback((colorScheme: ColorScheme) => setSettings({ colorScheme }), [setSettings]);

  return { colorScheme: current.colorScheme, setColorScheme };
}

export function useLinkSettings(): UseLinkSettingsReturn {
  const { settings: current, setSettings } = useVisuallyImpairedSettings();
  const setUnderlineLinks = useCallback(
    (underlineLinks: boolean) => setSettings({ underlineLinks }),
    [setSettings],
  );
  const setHighlightLinks = useCallback(
    (highlightLinks: boolean) => setSettings({ highlightLinks }),
    [setSettings],
  );
  const toggleUnderlineLinks = useCallback(
    () => setUnderlineLinks(!current.underlineLinks),
    [current.underlineLinks, setUnderlineLinks],
  );
  const toggleHighlightLinks = useCallback(
    () => setHighlightLinks(!current.highlightLinks),
    [current.highlightLinks, setHighlightLinks],
  );

  return {
    underlineLinks: current.underlineLinks,
    highlightLinks: current.highlightLinks,
    setUnderlineLinks,
    setHighlightLinks,
    toggleUnderlineLinks,
    toggleHighlightLinks,
  };
}

export function useImageSettings(): UseImageSettingsReturn {
  const { settings: current, setSettings } = useVisuallyImpairedSettings();
  const setImageMode = useCallback((imageMode: ImageMode) => setSettings({ imageMode }), [setSettings]);
  const setShowImageAlt = useCallback((showImageAlt: boolean) => setSettings({ showImageAlt }), [setSettings]);
  const toggleShowImageAlt = useCallback(
    () => setShowImageAlt(!current.showImageAlt),
    [current.showImageAlt, setShowImageAlt],
  );

  return {
    imageMode: current.imageMode,
    showImageAlt: current.showImageAlt,
    setImageMode,
    setShowImageAlt,
    toggleShowImageAlt,
  };
}

export function useMotionSettings(): UseMotionSettingsReturn {
  const { settings: current, setSettings } = useVisuallyImpairedSettings();
  const setReducedMotion = useCallback(
    (reducedMotion: boolean) => setSettings({ reducedMotion }),
    [setSettings],
  );
  const toggleReducedMotion = useCallback(
    () => setReducedMotion(!current.reducedMotion),
    [current.reducedMotion, setReducedMotion],
  );

  return {
    reducedMotion: current.reducedMotion,
    setReducedMotion,
    toggleReducedMotion,
  };
}

export function useFocusSettings(): UseFocusSettingsReturn {
  const { settings: current, setSettings } = useVisuallyImpairedSettings();
  const setStrongFocus = useCallback((strongFocus: boolean) => setSettings({ strongFocus }), [setSettings]);
  const toggleStrongFocus = useCallback(
    () => setStrongFocus(!current.strongFocus),
    [current.strongFocus, setStrongFocus],
  );

  return {
    strongFocus: current.strongFocus,
    setStrongFocus,
    toggleStrongFocus,
  };
}

export function useVisuallyImpaired(): UseVisuallyImpairedReturn {
  const { settings: current, setSettings, reset } = useVisuallyImpairedSettings();

  const enable = useCallback(() => setSettings({ enabled: true }), [setSettings]);
  const disable = useCallback(() => setSettings({ enabled: false }), [setSettings]);
  const toggle = useCallback(() => setSettings({ enabled: !current.enabled }), [current.enabled, setSettings]);

  return {
    settings: current,
    setSettings,
    reset,
    isEnabled: current.enabled,
    enable,
    disable,
    toggle,
  };
}
