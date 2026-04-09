import { buildJunitReport } from '../src/report/junitReport';

describe('buildJunitReport', () => {
  it('формирует junit xml для страниц с нарушениями, чистых страниц и ошибок аудита', () => {
    const xml = buildJunitReport({
      startedAt: '2026-04-09T10:00:00.000Z',
      finishedAt: '2026-04-09T10:01:00.000Z',
      scannedPages: 3,
      pages: [
        {
          url: 'https://example.com',
          durationMs: 1000,
          issues: [
            {
              url: 'https://example.com',
              selector: '#main',
              ruRuleCode: 'RU_AXE_LINK_NAME',
              axeRuleId: 'link-name',
              title: 'Ссылка без доступного названия',
              description: 'Описание нарушения',
              recommendation: 'Добавьте aria-label',
              severity: 'критичное',
              principle: 'надежность',
              gostRefs: ['ГОСТ Р 52872-2019, §5.2.4'],
              post102Refs: ['Постановление №102, п. ж)'],
              wcagRefs: ['WCAG 2.1, 4.1.2 Name, Role, Value'],
              sourceMessage: 'Definition for rule was not found.',
              issueType: 'lint',
              origin: 'static-eslint',
              ruleSource: 'eslint-rules',
              source: {
                filePath: 'C:/repo/src/App.jsx',
                line: 10,
                column: 2,
              },
            },
          ],
        },
        {
          url: 'https://example.com/clean',
          durationMs: 500,
          issues: [],
        },
        {
          url: 'https://example.com/broken',
          durationMs: 200,
          issues: [],
          error: 'Navigation timeout',
        },
      ],
    });

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<testsuites name="ru-a11y CLI" tests="3" failures="1" errors="1"');
    expect(xml).toContain('<testsuite name="https://example.com" tests="1" failures="1" errors="0"');
    expect(xml).toContain('<failure message="Ссылка без доступного названия" type="RU_AXE_LINK_NAME">');
    expect(xml).toContain('Recommendation: Добавьте aria-label');
    expect(xml).toContain('<testsuite name="https://example.com/clean" tests="1" failures="0" errors="0"');
    expect(xml).toContain('No accessibility issues');
    expect(xml).toContain('<testsuite name="https://example.com/broken" tests="1" failures="0" errors="1"');
    expect(xml).toContain('<error message="Navigation timeout" type="audit-error">Navigation timeout</error>');
  });
});
