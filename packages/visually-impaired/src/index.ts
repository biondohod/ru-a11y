export {
  DEFAULT_VISUALLY_IMPAIRED_SETTINGS,
  VISUALLY_IMPAIRED_CLASS,
  VISUALLY_IMPAIRED_STORAGE_KEY,
  getVisuallyImpairedSettings,
  initializeVisuallyImpaired,
  resetVisuallyImpairedSettings,
  setVisuallyImpairedSettings,
  useColorScheme,
  useFocusSettings,
  useFontSize,
  useImageSettings,
  useLinkSettings,
  useMotionSettings,
  useVisuallyImpaired,
  useVisuallyImpairedMode,
  useVisuallyImpairedSettings,
} from './useVisuallyImpaired';

export type {
  ColorScheme,
  FontSizeLevel,
  ImageMode,
  LetterSpacingLevel,
  LineHeightLevel,
  UseColorSchemeReturn,
  UseFocusSettingsReturn,
  UseFontSizeReturn,
  UseImageSettingsReturn,
  UseLinkSettingsReturn,
  UseMotionSettingsReturn,
  UseVisuallyImpairedReturn,
  UseVisuallyImpairedSettingsReturn,
  VisuallyImpairedSettings,
} from './useVisuallyImpaired';

export { VisuallyImpairedOverlay } from './VisuallyImpairedOverlay';
export type { VisuallyImpairedOverlayProps } from './VisuallyImpairedOverlay';

import { VisuallyImpairedOverlay } from './VisuallyImpairedOverlay';
import {
  DEFAULT_VISUALLY_IMPAIRED_SETTINGS,
  getVisuallyImpairedSettings,
  initializeVisuallyImpaired,
  resetVisuallyImpairedSettings,
  setVisuallyImpairedSettings,
  useColorScheme,
  useFocusSettings,
  useFontSize,
  useImageSettings,
  useLinkSettings,
  useMotionSettings,
  useVisuallyImpaired,
  useVisuallyImpairedMode,
  useVisuallyImpairedSettings,
} from './useVisuallyImpaired';

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
