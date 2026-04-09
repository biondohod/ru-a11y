'use strict';

const formatter = require('../formatter-pretty');
const ANSI_PATTERN = /\u001B\[[0-9;]*m/g;

describe('ru-a11y formatter', () => {
  test('разделяет сообщение на секции и показывает подсвеченный сниппет', () => {
    const output = formatter([
      {
        filePath: 'src/App.jsx',
        errorCount: 1,
        warningCount: 0,
        source: [
          'export function App() {',
          '  return <img src="/hero.png" />;',
          '}',
        ].join('\n'),
        messages: [
          {
            ruleId: '@ru-a11y/gost-a11y/jsx-a11y/alt-text',
            severity: 2,
            line: 2,
            column: 10,
            message:
              'Элемент <img> не имеет атрибута alt (ГОСТ Р 52872-2019 §5.1.1). Добавьте <img alt="Описание" />. [Постановление №102 п. г); WCAG 1.1.1]',
          },
        ],
      },
    ]);

    const plainOutput = output.replace(ANSI_PATTERN, '');

    expect(plainOutput).toContain('ru-a11y ESLint report');
    expect(plainOutput).toContain('Текст ошибки');
    expect(plainOutput).toContain('Рекомендация по исправлению');
    expect(plainOutput).toContain('Нормативные требования');
    expect(plainOutput).toContain('Фрагмент кода');
    expect(plainOutput).toContain('src/App.jsx');
    expect(plainOutput).toContain('<img src="/hero.png" />');
    expect(plainOutput).toContain('Постановление №102 п. г)');
    expect(plainOutput).toContain('WCAG 1.1.1');
  });

  test('выносит нормативные ссылки из текста ошибки в отдельный блок', () => {
    const output = formatter([
      {
        filePath: 'src/App.jsx',
        errorCount: 1,
        warningCount: 0,
        source: '<html>',
        messages: [
          {
            ruleId: '@ru-a11y/gost-a11y/require-lang-attr',
            severity: 2,
            line: 1,
            column: 1,
            message:
              'Отсутствует атрибут lang на элементе <html> (ГОСТ Р 52872-2019 §5.2.4, уровень A). Добавьте <html lang="ru"> для корректного объявления языка страницы. [Постановление №102 п. а) — информация должна быть доступна вспомогательным технологиям]',
          },
        ],
      },
    ]);

    const plainOutput = output.replace(ANSI_PATTERN, '');

    expect(plainOutput).toContain('Отсутствует атрибут lang на элементе <html>.');
    expect(plainOutput).toContain('ГОСТ Р 52872-2019 §5.2.4, уровень A');
    expect(plainOutput).toContain('Постановление №102 п. а)');
    expect(plainOutput).not.toContain('Текст ошибки:\n        Отсутствует атрибут lang на элементе <html> (ГОСТ Р 52872-2019 §5.2.4, уровень A).');
  });

  test('печатает успешный отчёт без нарушений', () => {
    const output = formatter([
      {
        filePath: 'src/App.jsx',
        errorCount: 0,
        warningCount: 0,
        messages: [],
      },
    ]);

    const plainOutput = output.replace(ANSI_PATTERN, '');

    expect(plainOutput).toContain('Нарушений не обнаружено.');
    expect(plainOutput).toContain('Файлов с нарушениями');
  });
});
