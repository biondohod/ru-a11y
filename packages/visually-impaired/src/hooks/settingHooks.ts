import { useCallback } from 'react';
import {
  FONT_SIZE_LEVELS,
  type ColorScheme,
  type FontSizeLevel,
  type ImageMode,
} from '../model/settings';
import { setVisuallyImpairedSettings } from '../store/settingsStore';
import {
  useBooleanSetter,
  useVisuallyImpairedSettings,
  type UseVisuallyImpairedSettingsReturn,
} from './useVisuallyImpairedSettings';

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

const enable = () => setVisuallyImpairedSettings({ enabled: true });
const disable = () => setVisuallyImpairedSettings({ enabled: false });

/** Full mode switch only. */
export function useVisuallyImpairedMode(): Pick<
  UseVisuallyImpairedReturn,
  'isEnabled' | 'enable' | 'disable' | 'toggle'
> {
  const { settings } = useVisuallyImpairedSettings();
  const [, toggle] = useBooleanSetter('enabled', settings.enabled);
  return { isEnabled: settings.enabled, enable, disable, toggle };
}

/** Everything: settings, setters and the full mode switch. */
export function useVisuallyImpaired(): UseVisuallyImpairedReturn {
  const { settings, setSettings, reset } = useVisuallyImpairedSettings();
  const [, toggle] = useBooleanSetter('enabled', settings.enabled);

  return { settings, setSettings, reset, isEnabled: settings.enabled, enable, disable, toggle };
}

function stepFontSize(current: FontSizeLevel, step: 1 | -1): FontSizeLevel {
  const index = FONT_SIZE_LEVELS.indexOf(current) + step;
  return FONT_SIZE_LEVELS[Math.min(Math.max(index, 0), FONT_SIZE_LEVELS.length - 1)];
}

export function useFontSize(): UseFontSizeReturn {
  const { settings } = useVisuallyImpairedSettings();
  const { fontSize } = settings;

  const setFontSize = useCallback(
    (next: FontSizeLevel) => setVisuallyImpairedSettings({ fontSize: next }),
    [],
  );
  const increaseFontSize = useCallback(
    () => setFontSize(stepFontSize(fontSize, 1)),
    [fontSize, setFontSize],
  );
  const decreaseFontSize = useCallback(
    () => setFontSize(stepFontSize(fontSize, -1)),
    [fontSize, setFontSize],
  );

  return { fontSize, setFontSize, increaseFontSize, decreaseFontSize };
}

export function useColorScheme(): UseColorSchemeReturn {
  const { settings } = useVisuallyImpairedSettings();
  const setColorScheme = useCallback(
    (colorScheme: ColorScheme) => setVisuallyImpairedSettings({ colorScheme }),
    [],
  );

  return { colorScheme: settings.colorScheme, setColorScheme };
}

export function useLinkSettings(): UseLinkSettingsReturn {
  const { settings } = useVisuallyImpairedSettings();
  const { underlineLinks, highlightLinks } = settings;
  const [setUnderlineLinks, toggleUnderlineLinks] = useBooleanSetter(
    'underlineLinks',
    underlineLinks,
  );
  const [setHighlightLinks, toggleHighlightLinks] = useBooleanSetter(
    'highlightLinks',
    highlightLinks,
  );

  return {
    underlineLinks,
    highlightLinks,
    setUnderlineLinks,
    setHighlightLinks,
    toggleUnderlineLinks,
    toggleHighlightLinks,
  };
}

export function useImageSettings(): UseImageSettingsReturn {
  const { settings } = useVisuallyImpairedSettings();
  const { showImageAlt } = settings;
  const [setShowImageAlt, toggleShowImageAlt] = useBooleanSetter('showImageAlt', showImageAlt);
  const setImageMode = useCallback(
    (imageMode: ImageMode) => setVisuallyImpairedSettings({ imageMode }),
    [],
  );

  return {
    imageMode: settings.imageMode,
    showImageAlt,
    setImageMode,
    setShowImageAlt,
    toggleShowImageAlt,
  };
}

export function useMotionSettings(): UseMotionSettingsReturn {
  const { reducedMotion } = useVisuallyImpairedSettings().settings;
  const [setReducedMotion, toggleReducedMotion] = useBooleanSetter('reducedMotion', reducedMotion);
  return { reducedMotion, setReducedMotion, toggleReducedMotion };
}

export function useFocusSettings(): UseFocusSettingsReturn {
  const { strongFocus } = useVisuallyImpairedSettings().settings;
  const [setStrongFocus, toggleStrongFocus] = useBooleanSetter('strongFocus', strongFocus);
  return { strongFocus, setStrongFocus, toggleStrongFocus };
}
