import { mapAxeResultToGost } from '../src/mapping/gostMapping';

describe('mapAxeResultToGost', () => {
  it('maps the bypass rule to RU_GOST_NAV_SKIP_LINK', () => {
    const issue = mapAxeResultToGost({
      url: 'https://example.com',
      id: 'bypass',
      impact: 'serious',
      message: 'Page must have means to bypass repeated blocks',
      target: ['a.skip-link'],
    });

    expect(issue.ruRuleCode).toBe('RU_GOST_NAV_SKIP_LINK');
    expect(issue.severity).toBe('критичное');
    expect(issue.selector).toBe('a.skip-link');
    expect(issue.origin).toBe('runtime-axe');
    expect(issue.ruleSource).toBeDefined();
    expect(issue.source?.selector).toBe('a.skip-link');
    expect(issue.post102Refs[0]).toContain('№102');
  });

  it('falls back for an unknown axe rule', () => {
    const issue = mapAxeResultToGost({
      url: 'https://example.com',
      id: 'unknown-rule',
      impact: 'minor',
      message: 'Unknown issue',
    });

    expect(issue.ruRuleCode).toBe('RU_GOST_GENERIC');
    expect(issue.severity).toBe('незначительное');
    expect(issue.selector).toBe('document');
    expect(issue.ruleSource).toBe('fallback');
  });
});
