import type { GostIssue, PageAuditResult } from '../types';

const ESLINT_ENTITY_PREFIX = 'eslint://';

/** ESLint results are stored as pseudo pages with an `eslint://<file>` url. */
export function isEslintEntity(page: PageAuditResult): boolean {
  return page.url.startsWith(ESLINT_ENTITY_PREFIX);
}

/** Human readable name of an audited entity: the page URL or the source file path. */
export function getEntityName(page: PageAuditResult): string {
  return isEslintEntity(page) ? page.url.slice(ESLINT_ENTITY_PREFIX.length) : page.url;
}

export function toEslintEntityUrl(filePath: string): string {
  return `${ESLINT_ENTITY_PREFIX}${filePath}`;
}

/** `file:line:column` for static issues, the CSS selector for runtime ones. */
export function getIssueLocation(issue: GostIssue): string {
  const { source } = issue;

  if (source?.filePath) {
    return `${source.filePath}:${source.line ?? '?'}:${source.column ?? '?'}`;
  }

  return source?.selector ?? issue.selector;
}

export function msToSeconds(durationMs: number): string {
  return (durationMs / 1000).toFixed(3);
}
