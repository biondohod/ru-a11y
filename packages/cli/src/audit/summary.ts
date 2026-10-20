import { EXIT_CODE } from '../config/defaultConfig';
import type { AuditRunResult, GostIssue, IssueOrigin } from '../types';

export function countIssues(result: AuditRunResult, origin?: IssueOrigin): number {
  return result.pages.reduce(
    (total, page) =>
      total +
      (origin ? page.issues.filter((issue) => issue.origin === origin).length : page.issues.length),
    0,
  );
}

function matchesToken(issue: GostIssue, token: string): boolean {
  const needle = token.toLowerCase();

  return [issue.ruRuleCode, issue.axeRuleId, issue.principle, issue.severity].some((field) =>
    field.toLowerCase().includes(needle),
  );
}

/**
 * Keeps issues that match any `include` token and none of the `exclude` tokens.
 * Tokens are matched case-insensitively against rule code, axe id, principle and severity.
 */
export function applyIssueFilters(
  result: AuditRunResult,
  include: readonly string[],
  exclude: readonly string[],
): AuditRunResult {
  const isIncluded = (issue: GostIssue) =>
    include.length === 0 || include.some((token) => matchesToken(issue, token));
  const isExcluded = (issue: GostIssue) => exclude.some((token) => matchesToken(issue, token));

  return {
    ...result,
    pages: result.pages.map((page) => ({
      ...page,
      issues: page.issues.filter((issue) => isIncluded(issue) && !isExcluded(issue)),
    })),
  };
}

export function mergeAuditResults(
  runtime: AuditRunResult,
  staticPages: AuditRunResult['pages'],
): AuditRunResult {
  return {
    startedAt: runtime.startedAt,
    finishedAt: new Date().toISOString(),
    scannedPages: runtime.scannedPages + staticPages.length,
    pages: [...runtime.pages, ...staticPages],
  };
}

export function calculateExitCode(result: AuditRunResult, maxIssues: number): number {
  if (result.pages.some((page) => page.error)) {
    return EXIT_CODE.auditFailed;
  }

  return countIssues(result) > maxIssues ? EXIT_CODE.issueThresholdExceeded : EXIT_CODE.ok;
}
