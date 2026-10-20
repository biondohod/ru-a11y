import {
  DEFAULT_VISUALLY_IMPAIRED_SETTINGS,
  normalizeSettings,
  resolveEffectiveSettings,
} from '../src/model/settings';

describe('normalizeSettings', () => {
  it('returns defaults for non-object input', () => {
    expect(normalizeSettings(null)).toEqual(DEFAULT_VISUALLY_IMPAIRED_SETTINGS);
    expect(normalizeSettings('broken')).toEqual(DEFAULT_VISUALLY_IMPAIRED_SETTINGS);
  });

  it('keeps valid values and replaces invalid ones with defaults', () => {
    const settings = normalizeSettings({
      fontSize: 'xlarge',
      colorScheme: 'neon',
      underlineLinks: 'yes',
      strongFocus: true,
      unknown: 1,
    });

    expect(settings).toEqual({
      ...DEFAULT_VISUALLY_IMPAIRED_SETTINGS,
      fontSize: 'xlarge',
      strongFocus: true,
    });
    expect(settings).not.toHaveProperty('unknown');
  });
});

describe('resolveEffectiveSettings', () => {
  it('leaves settings untouched outside full mode', () => {
    const settings = { ...DEFAULT_VISUALLY_IMPAIRED_SETTINGS, fontSize: 'large' as const };

    expect(resolveEffectiveSettings(settings)).toBe(settings);
  });

  it('applies the full mode preset without downgrading user choices', () => {
    const effective = resolveEffectiveSettings({
      ...DEFAULT_VISUALLY_IMPAIRED_SETTINGS,
      enabled: true,
      fontSize: 'xlarge',
    });

    expect(effective).toMatchObject({
      fontSize: 'xlarge',
      lineHeight: 'wide',
      colorScheme: 'white-black',
      underlineLinks: true,
      showImageAlt: true,
      reducedMotion: true,
      strongFocus: true,
    });
  });
});
