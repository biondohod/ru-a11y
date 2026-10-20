import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { AuditRunResult, GostIssue, PageAuditResult } from '../types';
import { getEntityName, getIssueLocation, msToSeconds } from './shared';

export const JUNIT_REPORT_FILE = 'ru-a11y-junit.xml';

interface SuiteStats {
  tests: number;
  failures: number;
  errors: number;
}

interface Suite {
  xml: string;
  stats: SuiteStats;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildFailureText(issue: GostIssue): string {
  const optional: Array<[label: string, refs: string[]]> = [
    ['GOST', issue.gostRefs],
    ['Post102', issue.post102Refs],
    ['WCAG', issue.wcagRefs],
  ];

  return [
    `Title: ${issue.title}`,
    `Rule: ${issue.ruRuleCode} / ${issue.axeRuleId}`,
    `Severity: ${issue.severity}`,
    `Principle: ${issue.principle}`,
    `Origin: ${issue.origin}`,
    `Source: ${issue.ruleSource}`,
    `Location: ${getIssueLocation(issue)}`,
    `Description: ${issue.description}`,
    `Recommendation: ${issue.recommendation}`,
    ...optional
      .filter(([, refs]) => refs.length > 0)
      .map(([label, refs]) => `${label}: ${refs.join('; ')}`),
    `Message: ${issue.sourceMessage}`,
  ].join('\n');
}

function testCase(className: string, name: string, body = ''): string {
  const attributes = `name="${escapeXml(name)}" classname="${escapeXml(className)}" time="0"`;

  return body
    ? `    <testcase ${attributes}>\n      ${body}\n    </testcase>`
    : `    <testcase ${attributes} />`;
}

function testSuite(page: PageAuditResult, stats: SuiteStats, testCases: string[]): Suite {
  const name = escapeXml(getEntityName(page));
  const xml = [
    `  <testsuite name="${name}" tests="${stats.tests}" failures="${stats.failures}" errors="${stats.errors}" time="${msToSeconds(page.durationMs)}">`,
    ...testCases,
    '  </testsuite>',
  ].join('\n');

  return { xml, stats };
}

function buildPageSuite(page: PageAuditResult): Suite {
  const className = getEntityName(page);

  if (page.error) {
    const error = escapeXml(page.error);
    return testSuite(page, { tests: 1, failures: 0, errors: 1 }, [
      testCase(
        className,
        'Audit execution',
        `<error message="${error}" type="audit-error">${error}</error>`,
      ),
    ]);
  }

  if (page.issues.length === 0) {
    return testSuite(page, { tests: 1, failures: 0, errors: 0 }, [
      testCase(className, 'No accessibility issues'),
    ]);
  }

  const failures = page.issues.map((issue, index) =>
    testCase(
      className,
      `${index + 1}. ${issue.title}`,
      `<failure message="${escapeXml(issue.title)}" type="${escapeXml(issue.ruRuleCode)}">${escapeXml(buildFailureText(issue))}</failure>`,
    ),
  );

  return testSuite(
    page,
    { tests: page.issues.length, failures: page.issues.length, errors: 0 },
    failures,
  );
}

function sumStats(suites: readonly Suite[]): SuiteStats {
  return suites.reduce<SuiteStats>(
    (total, { stats }) => ({
      tests: total.tests + stats.tests,
      failures: total.failures + stats.failures,
      errors: total.errors + stats.errors,
    }),
    { tests: 0, failures: 0, errors: 0 },
  );
}

/** JUnit XML: one test suite per page/file, one failing test case per issue. */
export function buildJunitReport(result: AuditRunResult): string {
  const suites = result.pages.map(buildPageSuite);
  const { tests, failures, errors } = sumStats(suites);
  const totalMs = result.pages.reduce((total, page) => total + page.durationMs, 0);

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<testsuites name="ru-a11y CLI" tests="${tests}" failures="${failures}" errors="${errors}" time="${msToSeconds(totalMs)}">`,
    ...suites.map((suite) => suite.xml),
    '</testsuites>',
  ].join('\n');
}

/** Writes the JUnit report to `outputDir` and returns the file path. */
export async function writeJunitReport(result: AuditRunResult, outputDir: string): Promise<string> {
  await mkdir(outputDir, { recursive: true });
  const reportPath = join(outputDir, JUNIT_REPORT_FILE);
  await writeFile(reportPath, buildJunitReport(result), 'utf-8');
  return reportPath;
}
