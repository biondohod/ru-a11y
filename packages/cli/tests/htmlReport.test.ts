import { buildHtmlReport } from '../src/report/htmlReport';
import type { AuditRunResult } from '../src/types';

describe('buildHtmlReport', () => {
  it('рендерит расширенный HTML с навигацией и блоками по ESLint/runtime', () => {
    const report: AuditRunResult = {
      startedAt: '2026-03-25T10:00:00.000Z',
      finishedAt: '2026-03-25T10:01:00.000Z',
      scannedPages: 2,
      pages: [
        {
          url: 'https://example.com',
          durationMs: 1200,
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
              sourceMessage: 'runtime source',
              issueType: 'violation',
              origin: 'runtime-axe',
              ruleSource: 'cli-gost-map',
              source: { selector: '#main' },
            },
          ],
        },
        {
          url: 'eslint://C:\\repo\\src\\App.jsx',
          durationMs: 0,
          issues: [
            {
              url: 'file://C:\\repo\\src\\App.jsx',
              selector: 'C:\\repo\\src\\App.jsx:10:5',
              ruRuleCode: 'RU_GOST_IMAGE_ALT',
              axeRuleId: 'image-alt',
              title: 'Изображение без alt',
              description: 'Описание eslint',
              recommendation: 'Добавьте alt',
              severity: 'критичное',
              principle: 'воспринимаемость',
              gostRefs: ['ГОСТ'],
              post102Refs: ['ПП102'],
              wcagRefs: [],
              sourceMessage: 'eslint source',
              issueType: 'lint',
              origin: 'static-eslint',
              ruleSource: 'eslint-rules',
              source: { filePath: 'C:\\repo\\src\\App.jsx', line: 10, column: 5 },
            },
          ],
        },
      ],
    };

    const html = buildHtmlReport(report);

    expect(html).toContain('Навигация по объектам');
    expect(html).toContain('Runtime (axe)</span><b>1</b>');
    expect(html).toContain('ESLint</span><b>1</b>');
    expect(html).toContain('href="#entity-1"');
    expect(html).toContain('href="#entity-2"');
    expect(html).toContain('<details class="issue-card">');
    expect(html).toContain('Файл: C:\\repo\\src\\App.jsx');
  });

  it('экранирует опасный HTML в тексте нарушений', () => {
    const report: AuditRunResult = {
      startedAt: '2026-03-25T10:00:00.000Z',
      finishedAt: '2026-03-25T10:01:00.000Z',
      scannedPages: 1,
      pages: [
        {
          url: 'https://example.com',
          durationMs: 10,
          issues: [
            {
              url: 'https://example.com',
              selector: '<script>alert(1)</script>',
              ruRuleCode: 'RU_GOST_GENERIC',
              axeRuleId: 'unknown',
              title: '<script type="text/javascript">alert(1)</script>',
              description: 'desc',
              recommendation: 'fix',
              severity: 'незначительное',
              principle: 'надежность',
              gostRefs: ['ГОСТ'],
              post102Refs: ['ПП102'],
              wcagRefs: [],
              sourceMessage: '<b>raw message</b>',
              issueType: 'violation',
              origin: 'runtime-axe',
              ruleSource: 'fallback',
            },
          ],
        },
      ],
    };

    const html = buildHtmlReport(report);

    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('&lt;script type=&quot;text/javascript&quot;&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('&lt;b&gt;raw message&lt;/b&gt;');
  });
});

