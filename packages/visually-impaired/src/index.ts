import {
  useColorScheme,
  useFocusSettings,
  useFontSize,
  useImageSettings,
  useLinkSettings,
  useMotionSettings,
  useVisuallyImpaired,
  useVisuallyImpairedMode,
} from './hooks/settingHooks';
import { useVisuallyImpairedSettings } from './hooks/useVisuallyImpairedSettings';
import { DEFAULT_VISUALLY_IMPAIRED_SETTINGS } from './model/settings';
import {
  getVisuallyImpairedSettings,
  initializeVisuallyImpaired,
  resetVisuallyImpairedSettings,
  setVisuallyImpairedSettings,
} from './store/settingsStore';
import { VisuallyImpairedOverlay } from './ui/VisuallyImpairedOverlay';

export {
  DEFAULT_VISUALLY_IMPAIRED_SETTINGS,
  type ColorScheme,
  type FontSizeLevel,
  type ImageMode,
  type LetterSpacingLevel,
  type LineHeightLevel,
  type VisuallyImpairedSettings,
} from './model/settings';
export { VISUALLY_IMPAIRED_CLASS, VISUALLY_IMPAIRED_STORAGE_KEY } from './model/theme';
export {
  getVisuallyImpairedSettings,
  initializeVisuallyImpaired,
  resetVisuallyImpairedSettings,
  setVisuallyImpairedSettings,
} from './store/settingsStore';
export {
  useVisuallyImpairedSettings,
  type UseVisuallyImpairedSettingsReturn,
} from './hooks/useVisuallyImpairedSettings';
export {
  useColorScheme,
  useFocusSettings,
  useFontSize,
  useImageSettings,
  useLinkSettings,
  useMotionSettings,
  useVisuallyImpaired,
  useVisuallyImpairedMode,
  type UseColorSchemeReturn,
  type UseFocusSettingsReturn,
  type UseFontSizeReturn,
  type UseImageSettingsReturn,
  type UseLinkSettingsReturn,
  type UseMotionSettingsReturn,
  type UseVisuallyImpairedReturn,
} from './hooks/settingHooks';
export {
  VisuallyImpairedOverlay,
  type VisuallyImpairedOverlayProps,
} from './ui/VisuallyImpairedOverlay';

/** Everything in one namespace object, for non-tree-shaken usage. */
export const visuallyImpaired = {
  Overlay: VisuallyImpairedOverlay,
  hooks: {
    useVisuallyImpaired,
    useVisuallyImpairedSettings,
    useVisuallyImpairedMode,
    useFontSize,
    useColorScheme,
    useLinkSettings,
    useImageSettings,
    useMotionSettings,
    useFocusSettings,
  },
  settings: {
    defaults: DEFAULT_VISUALLY_IMPAIRED_SETTINGS,
    get: getVisuallyImpairedSettings,
    set: setVisuallyImpairedSettings,
    reset: resetVisuallyImpairedSettings,
    initialize: initializeVisuallyImpaired,
  },
};
