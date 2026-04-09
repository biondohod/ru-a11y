import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { AuditRunResult, GostIssue, PageAuditResult } from '../types';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function isEslintPage(url: string): boolean {
  return url.startsWith('eslint://');
}

function getEntityName(page: PageAuditResult): string {
  return isEslintPage(page.url) ? page.url.replace(/^eslint:\/\//, '') : page.url;
}

function getIssueLocation(issue: GostIssue): string {
  if (issue.source?.filePath) {
    return `${issue.source.filePath}:${issue.source.line ?? '?'}:${issue.source.column ?? '?'}`;
  }

  if (issue.source?.selector) {
    return issue.source.selector;
  }

  return issue.selector;
}

function buildIssueFailureText(issue: GostIssue): string {
  const lines = [
    `Title: ${issue.title}`,
    `Rule: ${issue.ruRuleCode} / ${issue.axeRuleId}`,
    `Severity: ${issue.severity}`,
    `Principle: ${issue.principle}`,
    `Origin: ${issue.origin}`,
    `Source: ${issue.ruleSource}`,
    `Location: ${getIssueLocation(issue)}`,
    `Description: ${issue.description}`,
    `Recommendation: ${issue.recommendation}`,
  ];

  if (issue.gostRefs.length > 0) {
    lines.push(`GOST: ${issue.gostRefs.join('; ')}`);
  }

  if (issue.post102Refs.length > 0) {
    lines.push(`Post102: ${issue.post102Refs.join('; ')}`);
  }

  if (issue.wcagRefs.length > 0) {
    lines.push(`WCAG: ${issue.wcagRefs.join('; ')}`);
  }

  lines.push(`Message: ${issue.sourceMessage}`);

  return lines.join('\n');
}

interface JunitSuiteStats {
  tests: number;
  failures: number;
  errors: number;
}

function buildTestCaseXml(page: PageAuditResult, issue: GostIssue, index: number): string {
  const name = `${index + 1}. ${issue.title}`;

  return `    <testcase name="${escapeXml(name)}" classname="${escapeXml(getEntityName(page))}" time="0">
      <failure message="${escapeXml(issue.title)}" type="${escapeXml(issue.ruRuleCode)}">${escapeXml(buildIssueFailureText(issue))}</failure>
    </testcase>`;
}

function buildPageSuite(page: PageAuditResult): { xml: string; stats: JunitSuiteStats } {
  const suiteName = getEntityName(page);

  if (page.error) {
    return {
      xml: `  <testsuite name="${escapeXml(suiteName)}" tests="1" failures="0" errors="1" time="${(
        page.durationMs / 1000
      ).toFixed(3)}">
    <testcase name="Audit execution" classname="${escapeXml(suiteName)}" time="0">
      <error message="${escapeXml(page.error)}" type="audit-error">${escapeXml(page.error)}</error>
    </testcase>
  </testsuite>`,
      stats: { tests: 1, failures: 0, errors: 1 },
    };
  }

  if (page.issues.length === 0) {
    return {
      xml: `  <testsuite name="${escapeXml(suiteName)}" tests="1" failures="0" errors="0" time="${(
        page.durationMs / 1000
      ).toFixed(3)}">
    <testcase name="No accessibility issues" classname="${escapeXml(suiteName)}" time="0" />
  </testsuite>`,
      stats: { tests: 1, failures: 0, errors: 0 },
    };
  }

  const testcases = page.issues.map((issue, index) => buildTestCaseXml(page, issue, index)).join('\n');

  return {
    xml: `  <testsuite name="${escapeXml(suiteName)}" tests="${page.issues.length}" failures="${page.issues.length}" errors="0" time="${(
      page.durationMs / 1000
    ).toFixed(3)}">
${testcases}
  </testsuite>`,
    stats: { tests: page.issues.length, failures: page.issues.length, errors: 0 },
  };
}

/**
 * Формирует JUnit XML для CI-систем.
 */
export function buildJunitReport(result: AuditRunResult): string {
  const suites = result.pages.map((page) => buildPageSuite(page));
  const stats = suites.reduce(
    (acc, suite) => ({
      tests: acc.tests + suite.stats.tests,
      failures: acc.failures + suite.stats.failures,
      errors: acc.errors + suite.stats.errors,
    }),
    { tests: 0, failures: 0, errors: 0 },
  );

  const totalTimeMs = result.pages.reduce((acc, page) => acc + page.durationMs, 0);

  return `<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="ru-a11y CLI" tests="${stats.tests}" failures="${stats.failures}" errors="${stats.errors}" time="${(
    totalTimeMs / 1000
  ).toFixed(3)}">
${suites.map((suite) => suite.xml).join('\n')}
</testsuites>`;
}

/**
 * Сохраняет JUnit XML-отчет на диск и возвращает путь к файлу.
 */
export async function writeJunitReport(result: AuditRunResult, outputDir: string): Promise<string> {
  await mkdir(outputDir, { recursive: true });
  const reportPath = join(outputDir, 'ru-a11y-junit.xml');
  await writeFile(reportPath, buildJunitReport(result), 'utf-8');
  return reportPath;
}
