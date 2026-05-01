import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { AuditRunResult, GostIssue, PageAuditResult } from '../types';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function isEslintPage(url: string): boolean {
  return url.startsWith('eslint://');
}

function getEntityLabel(page: PageAuditResult): string {
  return isEslintPage(page.url) ? 'Файл' : 'Страница';
}

function getEntityValue(page: PageAuditResult): string {
  return isEslintPage(page.url) ? page.url.replace(/^eslint:\/\//, '') : page.url;
}

function getPageStatus(page: PageAuditResult): { label: string; cssClass: string } {
  if (page.error) {
    return { label: 'Ошибка аудита', cssClass: 'status-error' };
  }

  if (page.issues.length > 0) {
    return { label: `${page.issues.length} нарушений`, cssClass: 'status-bad' };
  }

  return { label: 'Без нарушений', cssClass: 'status-good' };
}

function getSeverityClass(severity: string): string {
  const normalized = severity.toLowerCase();
  if (normalized.includes('крит')) {
    return 'sev-critical';
  }

  if (normalized.includes('суще')) {
    return 'sev-major';
  }

  return 'sev-minor';
}

function renderSource(issue: GostIssue): string {
  if (issue.source?.filePath) {
    return `${issue.source.filePath}:${issue.source.line ?? '?'}:${issue.source.column ?? '?'}`;
  }

  if (issue.source?.selector) {
    return issue.source.selector;
  }

  return '-';
}

function renderIssue(issue: GostIssue, issueIndex: number): string {
  const issueTitle = `${issueIndex + 1}. ${issue.title}`;
  return `
    <details class="issue-card">
      <summary>
        <span class="issue-title">${escapeHtml(issueTitle)}</span>
        <span class="severity ${getSeverityClass(issue.severity)}">${escapeHtml(issue.severity)}</span>
      </summary>
      <div class="issue-body">
        <p><strong>Origin:</strong> ${escapeHtml(issue.origin)}</p>
        <p><strong>Принцип:</strong> ${escapeHtml(issue.principle)}</p>
        <p><strong>Код:</strong> ${escapeHtml(issue.ruRuleCode)} / ${escapeHtml(issue.axeRuleId)}</p>
        <p><strong>Селектор:</strong> <code>${escapeHtml(issue.selector)}</code></p>
        <p><strong>Источник:</strong> <code>${escapeHtml(renderSource(issue))}</code></p>
        <p><strong>Описание:</strong> ${escapeHtml(issue.description)}</p>
        <p><strong>Рекомендация:</strong> ${escapeHtml(issue.recommendation)}</p>
        <p><strong>ГОСТ:</strong> ${escapeHtml(issue.gostRefs.join('; '))}</p>
        <p><strong>Постановление №102:</strong> ${escapeHtml(issue.post102Refs.join('; '))}</p>
        <p><strong>WCAG:</strong> ${escapeHtml(issue.wcagRefs.join('; ') || '-')}</p>
        <p><strong>Сообщение:</strong></p>
        <pre>${escapeHtml(issue.sourceMessage)}</pre>
      </div>
    </details>`;
}

function renderPage(page: PageAuditResult, pageIndex: number): string {
  const pageId = `entity-${pageIndex + 1}`;
  const status = getPageStatus(page);
  const entityLabel = getEntityLabel(page);
  const entityValue = getEntityValue(page);
  const runtimeCount = page.issues.filter((issue) => issue.origin === 'runtime-axe').length;
  const eslintCount = page.issues.filter((issue) => issue.origin === 'static-eslint').length;

  let content: string;
  if (page.error) {
    content = `<div class="panel panel-error">${escapeHtml(page.error)}</div>`;
  } else if (page.issues.length === 0) {
    content = '<div class="panel panel-ok">Нарушений не обнаружено.</div>';
  } else {
    content = page.issues.map((issue, issueIndex) => renderIssue(issue, issueIndex)).join('');
  }

  return `
    <section class="entity-card" id="${pageId}">
      <div class="entity-head">
        <h3>${pageIndex + 1}. ${escapeHtml(entityLabel)}: ${escapeHtml(entityValue)}</h3>
        <span class="status-badge ${status.cssClass}">${escapeHtml(status.label)}</span>
      </div>
      <div class="entity-meta">
        <span><strong>Время:</strong> ${page.durationMs} ms</span>
        <span><strong>Runtime:</strong> ${runtimeCount}</span>
        <span><strong>ESLint:</strong> ${eslintCount}</span>
      </div>
      ${content}
    </section>`;
}

/**
 * Формирует HTML-представление отчета.
 */
export function buildHtmlReport(result: AuditRunResult): string {
  const totalIssues = result.pages.reduce((acc, page) => acc + page.issues.length, 0);
  const runtimeIssues = result.pages.reduce(
    (acc, page) => acc + page.issues.filter((issue) => issue.origin === 'runtime-axe').length,
    0,
  );
  const eslintIssues = result.pages.reduce(
    (acc, page) => acc + page.issues.filter((issue) => issue.origin === 'static-eslint').length,
    0,
  );
  const pagesWithErrors = result.pages.filter((page) => Boolean(page.error)).length;
  const pagesWithIssues = result.pages.filter((page) => !page.error && page.issues.length > 0).length;
  const cleanPages = result.pages.filter((page) => !page.error && page.issues.length === 0).length;

  const navItems = result.pages
    .map((page, index) => {
      const status = getPageStatus(page);
      const entityLabel = getEntityLabel(page);
      const entityValue = getEntityValue(page);
      return `<a class="toc-item" href="#entity-${index + 1}">
        <span class="toc-label">${escapeHtml(`${entityLabel}: ${entityValue}`)}</span>
        <span class="status-badge ${status.cssClass}">${escapeHtml(status.label)}</span>
      </a>`;
    })
    .join('');

  const pageSections = result.pages.map((page, index) => renderPage(page, index)).join('');

  return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Отчет ru-a11y CLI</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: Inter, Segoe UI, Arial, sans-serif;
        color: #182233;
        background: linear-gradient(180deg, #ffffff, #f4f7fc);
      }
      main { max-width: 1180px; margin: 0 auto; padding: 24px 16px 40px; }
      h1, h2, h3 { margin: 0; }
      .hero, .toc, .entity-card {
        background: #ffffff;
        border: 1px solid #d8e0ef;
        border-radius: 14px;
        padding: 16px;
        margin-bottom: 14px;
      }
      .hero p { margin: 8px 0 0; color: #5e6b80; }
      .stats {
        margin-top: 14px;
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }
      .stat {
        border: 1px solid #d8e0ef;
        border-radius: 10px;
        padding: 10px;
        background: #fbfcff;
      }
      .stat b { display: block; font-size: 22px; margin-top: 4px; }
      .toc-list { display: grid; gap: 8px; }
      .toc-item {
        text-decoration: none;
        color: inherit;
        border: 1px solid #d8e0ef;
        border-radius: 10px;
        padding: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }
      .toc-label {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        overflow-wrap: anywhere;
        white-space: normal;
      }
      .status-badge {
        border-radius: 999px;
        padding: 4px 10px;
        font-size: 12px;
        font-weight: 700;
        white-space: nowrap;
      }
      .status-good { background: #ddf4e8; color: #0c7e46; }
      .status-bad { background: #fde6e5; color: #b3261e; }
      .status-error { background: #eee5f8; color: #5d3a9b; }
      .entity-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 10px;
        min-width: 0;
      }
      .entity-head h3 {
        min-width: 0;
        overflow-wrap: anywhere;
      }
      .entity-meta {
        margin-top: 10px;
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        color: #5e6b80;
      }
      .panel {
        margin-top: 12px;
        border-radius: 10px;
        padding: 10px;
        border: 1px solid #d8e0ef;
      }
      .panel-ok { background: #ecfaf2; }
      .panel-error { background: #f5effd; border-color: #d7c7ef; }
      .issue-card {
        margin-top: 12px;
        border: 1px solid #d8e0ef;
        border-radius: 10px;
        overflow: hidden;
      }
      .issue-card > summary {
        list-style: none;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        background: #f9fbff;
      }
      .issue-title {
        min-width: 0;
        overflow-wrap: anywhere;
      }
      .issue-card > summary::-webkit-details-marker { display: none; }
      .issue-body { padding: 0 12px 12px; border-top: 1px solid #d8e0ef; }
      .issue-body p { margin: 8px 0 0; }
      .issue-body code {
        background: #f1f4fb;
        padding: 2px 5px;
        border-radius: 6px;
        overflow-wrap: anywhere;
      }
      .issue-body pre {
        margin: 6px 0 0;
        padding: 10px;
        overflow: auto;
        border-radius: 8px;
        border: 1px solid #d8e0ef;
        background: #fbfcff;
        white-space: pre-wrap;
      }
      .severity {
        border-radius: 8px;
        padding: 2px 8px;
        font-size: 12px;
        font-weight: 700;
      }
      .sev-critical { background: #ffe3e1; color: #9b1b13; }
      .sev-major { background: #fff1db; color: #9a5c00; }
      .sev-minor { background: #e7f6eb; color: #0b7a43; }
      @media (max-width: 860px) {
        .entity-head, .toc-item { flex-direction: column; align-items: flex-start; }
      }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <h1>Отчет по доступности ru-a11y</h1>
        <p>Сформирован: ${escapeHtml(result.finishedAt)}</p>
        <div class="stats">
          <div class="stat"><span>Проверено объектов</span><b>${result.scannedPages}</b></div>
          <div class="stat"><span>Всего нарушений</span><b>${totalIssues}</b></div>
          <div class="stat"><span>Runtime (axe)</span><b>${runtimeIssues}</b></div>
          <div class="stat"><span>ESLint</span><b>${eslintIssues}</b></div>
          <div class="stat"><span>С ошибками аудита</span><b>${pagesWithErrors}</b></div>
          <div class="stat"><span>Без нарушений</span><b>${cleanPages}</b></div>
          <div class="stat"><span>С нарушениями</span><b>${pagesWithIssues}</b></div>
        </div>
      </section>

      <section class="toc">
        <h2>Навигация по объектам</h2>
        <div class="toc-list">
          ${navItems || '<p>Нет объектов для отображения.</p>'}
        </div>
      </section>

      ${pageSections || '<section class="entity-card"><p>Данные отчета отсутствуют.</p></section>'}
    </main>
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
