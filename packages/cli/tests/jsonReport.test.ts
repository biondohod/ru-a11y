import { buildJsonReport } from '../src/report/jsonReport';

describe('buildJsonReport', () => {
  it('должен формировать агрегированный JSON-отчет', () => {
    const report = buildJsonReport({
      startedAt: '2026-03-24T10:00:00.000Z',
      finishedAt: '2026-03-24T10:01:00.000Z',
      scannedPages: 1,
      pages: [
        {
          url: 'https://example.com',
          durationMs: 3210,
          issues: [
            {
              url: 'https://example.com',
              selector: '#main',
              ruRuleCode: 'RU_GOST_PAGE_TITLE',
              axeRuleId: 'document-title',
              title: 'Не задан заголовок страницы',
              description: 'Описание',
              recommendation: 'Рекомендация',
              severity: 'существенное',
              principle: 'понятность',
              gostRefs: ['ГОСТ'],
              post102Refs: ['ПП102'],
              wcagRefs: ['WCAG 2.1'],
              sourceMessage: 'source',
              issueType: 'violation',
            },
          ],
        },
      ],
    });

    expect(report.scannedPages).toBe(1);
    expect(report.totalIssues).toBe(1);
    expect(report.pages[0].issues[0].axeRuleId).toBe('document-title');
  });
});

