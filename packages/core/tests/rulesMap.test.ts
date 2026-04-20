import {
  ESLINT_RULE_TO_AXE_ID,
  RU_A11Y_CUSTOM_RULES,
  RU_A11Y_RULES,
  findGostRuleByAxeId,
  getRuleMeta,
} from '../src';

describe('core rules registry', () => {
  it('contains axe and custom eslint rules in one registry', () => {
    expect(RU_A11Y_RULES).toHaveProperty('image-alt');
    expect(RU_A11Y_RULES).toHaveProperty('no-table-layout');
    expect(RU_A11Y_RULES).toHaveProperty('table-requires-th');
    expect(RU_A11Y_CUSTOM_RULES['no-table-layout'].aliases).toContain(
      '@ru-a11y/gost-a11y/no-table-layout',
    );
  });

  it('resolves eslint aliases to canonical metadata', () => {
    const meta = getRuleMeta('@ru-a11y/gost-a11y/no-table-layout');

    expect(meta.id).toBe('no-table-layout');
    expect(meta.gost).toBe('ГОСТ Р 52872-2019, §5.1.5');
    expect(meta.post102).toContain('Постановление №102');
  });

  it('keeps eslint to axe-compatible ids in core', () => {
    expect(ESLINT_RULE_TO_AXE_ID['@ru-a11y/gost-a11y/require-skip-link']).toBe('bypass');
    expect(ESLINT_RULE_TO_AXE_ID['@ru-a11y/gost-a11y/no-table-layout']).toBe(
      'no-table-layout',
    );
  });

  it('builds GOST rule definitions from the same metadata', () => {
    const rule = findGostRuleByAxeId('no-table-layout');

    expect(rule.code).toBe('RU_GOST_TABLE_LAYOUT');
    expect(rule.gostRefs).toContain('ГОСТ Р 52872-2019, §5.1.5');
    expect(rule.post102Refs).toContain(
      'Постановление Правительства РФ №102 от 07.02.2026, п. а)',
    );
  });
});
