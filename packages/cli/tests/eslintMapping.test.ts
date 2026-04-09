import { mapEslintResultToGost } from '../src/mapping/eslintMapping';

describe('mapEslintResultToGost', () => {
  it('маппит кастомное правило no-table-layout на нормативные ссылки ГОСТ/№102', () => {
    const issue = mapEslintResultToGost({
      filePath: 'C:\\repo\\src\\Layout.jsx',
      line: 10,
      column: 5,
      ruleId: '@ru-a11y/gost-a11y/no-table-layout',
      message: 'Layout tables are not allowed.',
      severity: 2,
    });

    expect(issue.axeRuleId).toBe('no-table-layout');
    expect(issue.ruRuleCode).toBe('RU_GOST_TABLE_LAYOUT');
    expect(issue.gostRefs).toContain('ГОСТ Р 52872-2019, §5.1.5');
    expect(issue.post102Refs).toContain('Постановление Правительства РФ №102 от 07.02.2026, п. а)');
  });

  it('маппит bare jsx-a11y правило heading-has-content на осмысленный нормативный маппинг', () => {
    const issue = mapEslintResultToGost({
      filePath: 'C:\\repo\\src\\Page.jsx',
      line: 4,
      column: 3,
      ruleId: 'heading-has-content',
      message: 'Headings must have content.',
      severity: 2,
    });

    expect(issue.axeRuleId).toBe('heading-has-content');
    expect(issue.ruRuleCode).toBe('RU_AXE_HEADING_HAS_CONTENT');
    expect(issue.gostRefs).toContain('ГОСТ Р 52872-2019, §5.2.3');
    expect(issue.post102Refs).toContain('Постановление Правительства РФ №102 от 07.02.2026, п. е)');
  });
});
