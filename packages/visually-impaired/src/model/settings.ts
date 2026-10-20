export const FONT_SIZE_LEVELS = ['normal', 'large', 'xlarge'] as const;
export const LINE_HEIGHT_LEVELS = ['normal', 'wide', 'extra'] as const;
export const LETTER_SPACING_LEVELS = ['normal', 'wide'] as const;
export const COLOR_SCHEMES = [
  'default',
  'white-black',
  'black-white',
  'blue-yellow',
  'beige-brown',
] as const;
export const IMAGE_MODES = ['normal', 'grayscale', 'hidden'] as const;

export type FontSizeLevel = (typeof FONT_SIZE_LEVELS)[number];
export type LineHeightLevel = (typeof LINE_HEIGHT_LEVELS)[number];
export type LetterSpacingLevel = (typeof LETTER_SPACING_LEVELS)[number];
export type ColorScheme = (typeof COLOR_SCHEMES)[number];
export type ImageMode = (typeof IMAGE_MODES)[number];

export interface VisuallyImpairedSettings {
  /** Full mode: turns on a readable preset on top of the individual settings. */
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

export type BooleanSettingKey = {
  [Key in keyof VisuallyImpairedSettings]: VisuallyImpairedSettings[Key] extends boolean
    ? Key
    : never;
}[keyof VisuallyImpairedSettings];

export const DEFAULT_VISUALLY_IMPAIRED_SETTINGS: Readonly<VisuallyImpairedSettings> = {
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

/** Allowed values of every enum setting; drives validation of stored data. */
const ENUM_SETTINGS = {
  fontSize: FONT_SIZE_LEVELS,
  lineHeight: LINE_HEIGHT_LEVELS,
  letterSpacing: LETTER_SPACING_LEVELS,
  colorScheme: COLOR_SCHEMES,
  imageMode: IMAGE_MODES,
} as const satisfies { [Key in keyof VisuallyImpairedSettings]?: readonly string[] };

function isAllowed(value: unknown, allowed: readonly string[]): boolean {
  return typeof value === 'string' && allowed.includes(value);
}

function isValidValue(key: keyof VisuallyImpairedSettings, value: unknown): boolean {
  const allowed = (ENUM_SETTINGS as Partial<Record<string, readonly string[]>>)[key];
  return allowed ? isAllowed(value, allowed) : typeof value === 'boolean';
}

/**
 * Turns untrusted input (localStorage, partial updates) into complete settings:
 * unknown keys are dropped, invalid values fall back to defaults.
 */
export function normalizeSettings(value: unknown): VisuallyImpairedSettings {
  const input = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const keys = Object.keys(DEFAULT_VISUALLY_IMPAIRED_SETTINGS) as Array<
    keyof VisuallyImpairedSettings
  >;

  return Object.fromEntries(
    keys.map((key) => [
      key,
      isValidValue(key, input[key]) ? input[key] : DEFAULT_VISUALLY_IMPAIRED_SETTINGS[key],
    ]),
  ) as unknown as VisuallyImpairedSettings;
}

/** Values the full mode enforces when the user has not picked something stronger. */
const FULL_MODE_PRESET = {
  fontSize: 'large',
  lineHeight: 'wide',
  colorScheme: 'white-black',
} as const satisfies Partial<VisuallyImpairedSettings>;

/** Settings actually applied to the page once full mode is taken into account. */
export function resolveEffectiveSettings(
  settings: VisuallyImpairedSettings,
): VisuallyImpairedSettings {
  if (!settings.enabled) return settings;

  return {
    ...settings,
    fontSize: settings.fontSize === 'normal' ? FULL_MODE_PRESET.fontSize : settings.fontSize,
    lineHeight:
      settings.lineHeight === 'normal' ? FULL_MODE_PRESET.lineHeight : settings.lineHeight,
    colorScheme:
      settings.colorScheme === 'default' ? FULL_MODE_PRESET.colorScheme : settings.colorScheme,
    underlineLinks: true,
    showImageAlt: true,
    reducedMotion: true,
    strongFocus: true,
  };
}
