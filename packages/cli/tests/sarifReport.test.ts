import { join } from 'node:path';
import { buildSarifReport } from '../src/report/sarifReport';
import { VERSION } from '../src/version';
import { createAudit, createIssue, createPage } from './fixtures';

const projectRoot = join('/', 'repo');

const lintIssue = createIssue({
  url: `file://${join(projectRoot, 'src', 'App.tsx')}`,
  ruRuleCode: 'RU_AXE_IMAGE_ALT',
  axeRuleId: 'image-alt',
  severity: 'критичное',
  origin: 'static-eslint',
  issueType: 'lint',
  ruleSource: 'eslint-rules',
  source: {
    filePath: join(projectRoot, 'src', 'App.tsx'),
    line: 12,
    column: 5,
    snippet: '<img />',
  },
});

const runtimeIssue = createIssue({
  url: 'https://example.com/catalog',
  selector: 'main > img',
  ruRuleCode: 'RU_AXE_IMAGE_ALT',
  axeRuleId: 'image-alt',
  severity: 'существенное',
  source: { selector: 'main > img' },
});

function build(pages = [createPage({ issues: [lintIssue, runtimeIssue] })]) {
  return buildSarifReport(createAudit(pages), { projectRoot });
}

describe('buildSarifReport', () => {
  it('produces a SARIF 2.1.0 log with tool metadata', () => {
    const log = build();
    const [run] = log.runs;

    expect(log.version).toBe('2.1.0');
    expect(log.$schema).toContain('sarif-2.1.0');
    expect(run.tool.driver).toMatchObject({ name: 'ru-a11y-toolkit-cli', version: VERSION });
  });

  it('declares each rule once and references it by index', () => {
    const [run] = build().runs;

    expect(run.tool.driver.rules.map((rule) => rule.id)).toEqual(['RU_AXE_IMAGE_ALT']);
    expect(run.results.map((result) => result.ruleIndex)).toEqual([0, 0]);
    expect(run.tool.driver.rules[0].properties.tags).toContain('accessibility');
  });

  it('maps GOST severity to SARIF levels', () => {
    const [run] = build().runs;

    expect(run.results.map((result) => result.level)).toEqual(['error', 'warning']);
  });

  it('points ESLint findings to a repository-relative file and line', () => {
    const [lint] = build().runs[0].results;

    expect(lint.locations[0].physicalLocation).toEqual({
      artifactLocation: { uri: 'src/App.tsx', uriBaseId: '%SRCROOT%' },
      region: { startLine: 12, startColumn: 5, snippet: { text: '<img />' } },
    });
  });

  it('reports runtime findings with a logical location', () => {
    const [, runtime] = build().runs[0].results;

    expect(runtime.locations[0]).toEqual({
      logicalLocations: [
        {
          name: 'main > img',
          fullyQualifiedName: 'https://example.com/catalog main > img',
          kind: 'element',
        },
      ],
    });
    expect(runtime.properties.url).toBe('https://example.com/catalog');
  });

  it('keeps fingerprints stable between runs and distinct between issues', () => {
    const first = build().runs[0].results.map((result) => result.partialFingerprints);
    const second = build().runs[0].results.map((result) => result.partialFingerprints);

    expect(first).toEqual(second);
    expect(new Set(first.map((fingerprints) => Object.values(fingerprints)[0])).size).toBe(2);
  });

  it('reports one alert when several ESLint rules flag the same position', () => {
    const duplicate = { ...lintIssue, sourceMessage: 'reported by jsx-a11y/alt-text' };
    const elsewhere = { ...lintIssue, source: { ...lintIssue.source, line: 20 } };
    const [run] = build([createPage({ issues: [lintIssue, duplicate, elsewhere] })]).runs;

    expect(
      run.results.map((result) => result.locations[0].physicalLocation?.region?.startLine),
    ).toEqual([12, 20]);
  });

  it('keeps uncatalogued rules apart', () => {
    const generic = (axeRuleId: string) =>
      createIssue({ ruRuleCode: 'RU_GOST_GENERIC', axeRuleId, ruleSource: 'fallback' });
    const [run] = build([createPage({ issues: [generic('foo'), generic('bar')] })]).runs;

    expect(run.tool.driver.rules.map((rule) => rule.id)).toEqual([
      'RU_GOST_GENERIC/foo',
      'RU_GOST_GENERIC/bar',
    ]);
  });

  it('records pages that could not be audited as failed invocations', () => {
    const [run] = build([
      createPage({
        url: 'https://example.com/down',
        error: 'Не удалось проверить страницу: timeout',
      }),
    ]).runs;

    expect(run.invocations[0].executionSuccessful).toBe(false);
    expect(run.invocations[0].toolExecutionNotifications[0].message.text).toContain('timeout');
    expect(run.results).toEqual([]);
  });
});
