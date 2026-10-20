import {
  ESLINT_RULE_TO_AXE_ID,
  FALLBACK_GOST_RULE,
  RU_A11Y_CUSTOM_RULES,
  RU_A11Y_RULES,
  RU_A11Y_TOOLKIT_STATS,
  findGostRuleByAxeId,
  getAxeRuleIdForEslintRule,
  getCanonicalRuleId,
  getRuleMeta,
} from '../src';

const allRules = Object.values(RU_A11Y_RULES);
const allAliases = allRules.flatMap((rule) => rule.aliases ?? []);

describe('rule registry', () => {
  it('contains axe and custom rules in a single registry', () => {
    expect(RU_A11Y_RULES).toHaveProperty('image-alt');
    expect(RU_A11Y_RULES).toHaveProperty('no-table-layout');
    expect(RU_A11Y_CUSTOM_RULES['no-table-layout'].aliases).toContain(
      '@ru-a11y/gost-a11y/no-table-layout',
    );
  });

  it('keys every rule by its own id', () => {
    for (const [key, rule] of Object.entries(RU_A11Y_RULES)) {
      expect(rule.id).toBe(key);
    }
  });

  it('has unique aliases that never shadow a canonical id', () => {
    expect(new Set(allAliases).size).toBe(allAliases.length);
    expect(allAliases.filter((alias) => alias in RU_A11Y_RULES)).toEqual([]);
  });

  it('keeps the published stats in sync with the catalog', () => {
    expect(allRules).toHaveLength(RU_A11Y_TOOLKIT_STATS.canonicalRules);
  });

  it.each([
    ['gost', /^ГОСТ Р 52872-2019, (§|п\. )/],
    ['post102', /^Постановление №102, п\. /],
    ['wcag', /^WCAG 2\.[12]\b/],
  ] as const)('formats %s references consistently', (field, pattern) => {
    const references = allRules.map((rule) => rule[field]).filter(Boolean);

    expect(references.length).toBeGreaterThan(0);
    for (const reference of references) {
      expect(reference).toMatch(pattern);
    }
  });

  it('describes every rule with non-empty Russian texts', () => {
    for (const rule of allRules) {
      expect(rule.title.trim()).not.toBe('');
      expect(rule.description.trim()).not.toBe('');
      expect(rule.fix.trim()).not.toBe('');
    }
  });
});

describe('getCanonicalRuleId / getRuleMeta', () => {
  it('resolves ESLint aliases to canonical metadata', () => {
    const meta = getRuleMeta('@ru-a11y/gost-a11y/no-table-layout');

    expect(meta.id).toBe('no-table-layout');
    expect(meta.gost).toBe('ГОСТ Р 52872-2019, §5.1.5');
    expect(meta.post102).toContain('Постановление №102');
  });

  it('passes unknown ids through unchanged', () => {
    expect(getCanonicalRuleId('totally-unknown')).toBe('totally-unknown');
  });

  it('returns a fallback description for unknown rules', () => {
    const meta = getRuleMeta('totally-unknown');

    expect(meta.id).toBe('totally-unknown');
    expect(meta.severity).toBe('warning');
    expect(meta.fix).toContain('totally-unknown');
  });
});

describe('ESLint to axe mapping', () => {
  it('maps plugin rules to axe-compatible ids', () => {
    expect(ESLINT_RULE_TO_AXE_ID['@ru-a11y/gost-a11y/require-skip-link']).toBe('bypass');
    expect(ESLINT_RULE_TO_AXE_ID['@ru-a11y/gost-a11y/no-table-layout']).toBe('no-table-layout');
  });

  it('only points to rules that exist in the catalog', () => {
    const missing = Object.values(ESLINT_RULE_TO_AXE_ID).filter((id) => !(id in RU_A11Y_RULES));

    expect(missing).toEqual([]);
  });

  it('accepts the short flat-config prefix', () => {
    expect(getAxeRuleIdForEslintRule('ru-a11y/require-skip-link')).toBe('bypass');
    expect(getAxeRuleIdForEslintRule('ru-a11y/jsx-a11y/alt-text')).toBe('image-alt');
  });
});

describe('findGostRuleByAxeId', () => {
  it('builds GOST rule definitions from the shared metadata', () => {
    const rule = findGostRuleByAxeId('no-table-layout');

    expect(rule.code).toBe('RU_GOST_TABLE_LAYOUT');
    expect(rule.gostRefs).toContain('ГОСТ Р 52872-2019, §5.1.5');
    expect(rule.post102Refs).toContain('Постановление Правительства РФ №102 от 07.02.2026, п. а)');
  });

  it('generates codes for rules without a legacy code', () => {
    expect(findGostRuleByAxeId('image-alt').code).toBe('RU_AXE_IMAGE_ALT');
  });

  it('falls back for unknown rules', () => {
    expect(findGostRuleByAxeId('totally-unknown')).toBe(FALLBACK_GOST_RULE);
  });
});
