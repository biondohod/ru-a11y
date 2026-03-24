import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { AuditRunResult } from '../types';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Формирует HTML-представление отчета.
 */
export function buildHtmlReport(result: AuditRunResult): string {
  const totalIssues = result.pages.reduce((acc, page) => acc + page.issues.length, 0);
  const rows = result.pages
    .flatMap((page) =>
      page.issues.map(
        (issue) => `
        <tr>
          <td>${escapeHtml(page.url)}</td>
          <td>${escapeHtml(issue.origin)}</td>
          <td>${escapeHtml(issue.severity)}</td>
          <td>${escapeHtml(issue.principle)}</td>
          <td>${escapeHtml(issue.title)}</td>
          <td><code>${escapeHtml(issue.selector)}</code></td>
          <td>${escapeHtml(
            issue.source?.filePath
              ? `${issue.source.filePath}:${issue.source.line ?? '?'}:${issue.source.column ?? '?'}`
              : issue.source?.selector ?? '-',
          )}</td>
          <td>${escapeHtml(issue.sourceMessage)}</td>
          <td>${escapeHtml(issue.gostRefs.join('; '))}</td>
          <td>${escapeHtml(issue.post102Refs.join('; '))}</td>
          <td>${escapeHtml(issue.recommendation)}</td>
        </tr>`,
      ),
    )
    .join('');

  return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Отчет ru-a11y CLI</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
      h1, h2 { margin-bottom: 8px; }
      .summary { margin-bottom: 16px; padding: 12px; background: #f5f7fa; border: 1px solid #dde3ea; }
      table { border-collapse: collapse; width: 100%; font-size: 14px; }
      th, td { border: 1px solid #d6dbe1; padding: 8px; text-align: left; vertical-align: top; }
      th { background: #eef2f6; }
      code { font-family: Consolas, monospace; }
    </style>
  </head>
  <body>
    <h1>Отчет по доступности ru-a11y</h1>
    <div class="summary">
      <div><strong>Проверено страниц:</strong> ${result.scannedPages}</div>
      <div><strong>Выявлено нарушений:</strong> ${totalIssues}</div>
      <div><strong>Дата формирования:</strong> ${escapeHtml(result.finishedAt)}</div>
    </div>

    <h2>Таблица нарушений</h2>
    <table>
      <thead>
        <tr>
          <th>URL</th>
          <th>Origin</th>
          <th>Серьезность</th>
          <th>Принцип</th>
          <th>Нарушение</th>
          <th>Селектор</th>
          <th>Source</th>
          <th>Сообщение</th>
          <th>ГОСТ</th>
          <th>Постановление №102</th>
          <th>Рекомендация</th>
        </tr>
      </thead>
      <tbody>
        ${rows || '<tr><td colspan="11">Нарушения не обнаружены.</td></tr>'}
      </tbody>
    </table>
  </body>
</html>`;
}

/**
 * Сохраняет HTML-отчет на диск и возвращает путь к файлу.
 */
export async function writeHtmlReport(result: AuditRunResult, outputDir: string): Promise<string> {
  await mkdir(outputDir, { recursive: true });
  const reportPath = join(outputDir, 'ru-a11y-report.html');
  await writeFile(reportPath, buildHtmlReport(result), 'utf-8');
  return reportPath;
}

