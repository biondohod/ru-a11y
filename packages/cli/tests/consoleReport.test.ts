import { buildConsoleReport } from '../src/report/consoleReport';
import type { AuditRunResult } from '../src/types';

describe('buildConsoleReport', () => {
  it('должен печатать секции описания, нормативки и рекомендации для ESLint-ошибки', () => {
    const result: AuditRunResult = {
      startedAt: '2026-04-09T10:00:00.000Z',
      finishedAt: '2026-04-09T10:00:02.000Z',
      scannedPages: 1,
      pages: [
        {
          url: 'eslint://C:/repo/src/App.tsx',
          durationMs: 0,
          issues: [
            {
              url: 'file://C:/repo/src/App.tsx',
              selector: 'C:/repo/src/App.tsx:12:5',
              ruRuleCode: 'RU.1.1.1',
              axeRuleId: 'image-alt',
              title: 'Изображение без alt',
              description: 'Элемент `<img>` не имеет текстовой альтернативы.',
              recommendation: 'Добавьте `<img alt="Описание" />`.',
              severity: 'критичное',
              principle: 'воспринимаемость',
              gostRefs: ['ГОСТ Р 52872-2019, §5.2.3.1'],
              post102Refs: ['Постановление Правительства РФ №102'],
              wcagRefs: ['WCAG 1.1.1'],
              sourceMessage: 'img elements must have an alt prop',
              issueType: 'lint',
              origin: 'static-eslint',
              ruleSource: 'eslint-rules',
              source: {
                filePath: 'C:/repo/src/App.tsx',
                line: 12,
                column: 5,
                snippet: '<img src="/hero.png" />',
                note: 'Источник получен из ESLint.',
              },
            },
          ],
        },
      ],
    };

    const report = buildConsoleReport(result);

    expect(report).toContain('ru-a11y CLI report');
    expect(report).toContain('Текст ошибки');
    expect(report).toContain('Нормативные требования');
    expect(report).toContain('Постановление №102');
    expect(report).toContain('WCAG');
    expect(report).toContain('Рекомендация по исправлению');
    expect(report).toContain('Фрагмент кода');
    expect(report).toContain('<img src="/hero.png" />');
  });

  it('должен показывать успешный результат без нарушений', () => {
    const result: AuditRunResult = {
      startedAt: '2026-04-09T10:00:00.000Z',
      finishedAt: '2026-04-09T10:00:02.000Z',
      scannedPages: 1,
      pages: [
        {
          url: 'https://example.com',
          durationMs: 123,
          issues: [],
        },
      ],
    };

    const report = buildConsoleReport(result);

    expect(report).toContain('Нарушений не обнаружено.');
    expect(report).toContain('Проверено страниц');
    expect(report).toContain('Найдено нарушений');
  });
});
