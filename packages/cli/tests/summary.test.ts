import {
  applyIssueFilters,
  calculateExitCode,
  countIssues,
  mergeAuditResults,
} from '../src/audit/summary';
import { EXIT_CODE } from '../src/config/defaultConfig';
import { createAudit, createIssue, createPage } from './fixtures';

const contrast = createIssue({ axeRuleId: 'color-contrast', ruRuleCode: 'RU_GOST_TEXT_CONTRAST' });
const lang = createIssue({
  axeRuleId: 'html-has-lang',
  ruRuleCode: 'RU_AXE_HTML_HAS_LANG',
  principle: 'понятность',
  origin: 'static-eslint',
});

describe('countIssues', () => {
  it('counts all issues or only the given origin', () => {
    const audit = createAudit([
      createPage({ issues: [contrast, lang] }),
      createPage({ issues: [contrast] }),
    ]);

    expect(countIssues(audit)).toBe(3);
    expect(countIssues(audit, 'static-eslint')).toBe(1);
  });
});

describe('applyIssueFilters', () => {
  const audit = createAudit([createPage({ issues: [contrast, lang] })]);

  it('keeps everything without filters', () => {
    expect(applyIssueFilters(audit, [], []).pages[0].issues).toHaveLength(2);
  });

  it('matches include tokens case-insensitively against several fields', () => {
    expect(applyIssueFilters(audit, ['CONTRAST'], []).pages[0].issues).toEqual([contrast]);
    expect(applyIssueFilters(audit, ['понятность'], []).pages[0].issues).toEqual([lang]);
  });

  it('applies exclude after include', () => {
    expect(applyIssueFilters(audit, ['RU_'], ['lang']).pages[0].issues).toEqual([contrast]);
  });

  it('does not mutate the input', () => {
    applyIssueFilters(audit, ['contrast'], []);

    expect(audit.pages[0].issues).toHaveLength(2);
  });
});

describe('mergeAuditResults', () => {
  it('appends static pages to the runtime result', () => {
    const merged = mergeAuditResults(createAudit([createPage()]), [
      createPage({ url: 'eslint://a.tsx' }),
    ]);

    expect(merged.scannedPages).toBe(2);
    expect(merged.pages.map((page) => page.url)).toEqual(['https://example.com', 'eslint://a.tsx']);
  });
});

describe('calculateExitCode', () => {
  it('returns ok when the threshold is not exceeded', () => {
    expect(calculateExitCode(createAudit([createPage({ issues: [contrast] })]), 1)).toBe(
      EXIT_CODE.ok,
    );
  });

  it('fails when issues exceed the threshold', () => {
    expect(calculateExitCode(createAudit([createPage({ issues: [contrast] })]), 0)).toBe(
      EXIT_CODE.issueThresholdExceeded,
    );
  });

  it('prioritises audit errors over issue counts', () => {
    expect(calculateExitCode(createAudit([createPage({ error: 'timeout' })]), 100)).toBe(
      EXIT_CODE.auditFailed,
    );
  });
});
