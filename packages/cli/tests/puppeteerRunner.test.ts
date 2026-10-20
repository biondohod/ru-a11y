import type axe from 'axe-core';
import { buildAxeRunOptions, collectIssues } from '../src/runner/puppeteerRunner';

function finding(id: string, nodes: Array<Partial<axe.NodeResult>>): axe.Result {
  return { id, impact: 'serious', help: `${id} help`, nodes } as unknown as axe.Result;
}

describe('buildAxeRunOptions', () => {
  it('restricts rules by tag and disables the requested ones', () => {
    expect(buildAxeRunOptions({ wcagTags: ['wcag2a'], disabledRules: ['region'] })).toEqual({
      runOnly: { type: 'tag', values: ['wcag2a'] },
      rules: { region: { enabled: false } },
    });
  });

  it('returns empty options when nothing is configured', () => {
    expect(buildAxeRunOptions({ wcagTags: [], disabledRules: [] })).toEqual({});
  });
});

describe('collectIssues', () => {
  it('creates one issue per node and marks the axe result type', () => {
    const issues = collectIssues('https://example.com', {
      violations: [
        finding('image-alt', [
          { target: ['img.a'], html: '<img class="a">', failureSummary: 'fix a' },
          { target: ['img.b'], html: '<img class="b">' },
        ]),
      ],
      incomplete: [finding('color-contrast', [{ target: ['p'] }])],
    });

    expect(issues.map((issue) => [issue.selector, issue.issueType, issue.sourceMessage])).toEqual([
      ['img.a', 'violation', 'fix a'],
      ['img.b', 'violation', 'image-alt help'],
      ['p', 'incomplete', 'color-contrast help'],
    ]);
  });

  it('reports page-level findings without nodes against the document', () => {
    const [issue] = collectIssues('https://example.com', {
      violations: [finding('landmark-one-main', [])],
      incomplete: [],
    });

    expect(issue.selector).toBe('document');
  });
});
