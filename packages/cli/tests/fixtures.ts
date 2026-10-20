import type { AuditRunResult, GostIssue, PageAuditResult } from '../src/types';

export function createIssue(overrides: Partial<GostIssue> = {}): GostIssue {
  return {
    url: 'https://example.com',
    selector: '#main',
    ruRuleCode: 'RU_AXE_IMAGE_ALT',
    axeRuleId: 'image-alt',
    title: 'Изображение без альтернативного текста',
    description: 'Описание',
    recommendation: 'Рекомендация',
    severity: 'существенное',
    principle: 'воспринимаемость',
    gostRefs: ['ГОСТ Р 52872-2019, §5.1.1'],
    post102Refs: [],
    wcagRefs: [],
    sourceMessage: 'message',
    issueType: 'violation',
    origin: 'runtime-axe',
    ruleSource: 'core-rules-map',
    ...overrides,
  };
}

export function createPage(overrides: Partial<PageAuditResult> = {}): PageAuditResult {
  return { url: 'https://example.com', issues: [], durationMs: 10, ...overrides };
}

export function createAudit(pages: PageAuditResult[]): AuditRunResult {
  return {
    startedAt: '2026-01-01T00:00:00.000Z',
    finishedAt: '2026-01-01T00:00:01.000Z',
    scannedPages: pages.length,
    pages,
  };
}
