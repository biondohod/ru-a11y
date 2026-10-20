import axe from 'axe-core';
import { RU_A11Y_RULES, RU_A11Y_TOOLKIT_STATS } from 'ru-a11y-toolkit-core';
import { runAxeScan, type ScanResult } from '../src/axeRunner';
import { CUSTOM_RULES } from '../src/rules';
import { getUniqueSelector } from '../src/rules/dom';

jest.mock('axe-core', () => ({
  __esModule: true,
  default: {
    run: jest.fn().mockResolvedValue({
      violations: [],
      passes: [],
      incomplete: [],
      inapplicable: [],
    }),
  },
}));

async function scan(html: string, preset: 'recommended' | 'gost-aa' | 'strict' = 'gost-aa') {
  document.body.innerHTML = html;
  const result = await runAxeScan({ preset });
  if (!result) throw new Error('scan was skipped');
  return result;
}

function selectorsOf(result: ScanResult, ruleId: string): string[] {
  return result.violations
    .filter((violation) => violation.ruleId === ruleId)
    .map((violation) => violation.selector);
}

describe('custom rule catalog', () => {
  it('has unique ids that all exist in the core catalog', () => {
    const ids = CUSTOM_RULES.map((rule) => rule.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.filter((id) => !(id in RU_A11Y_RULES))).toEqual([]);
  });

  it('matches the rule count published by core', () => {
    expect(CUSTOM_RULES).toHaveLength(RU_A11Y_TOOLKIT_STATS.overlayChecks.custom);
  });
});

describe('overlay custom rules', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.title = 'Страница проверки';
    document.documentElement.setAttribute('lang', 'ru');
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('adds ru-a11y DOM findings on top of axe-core', async () => {
    const result = await scan(`
      <header><nav><a href="/home">Главная</a></nav></header>
      <main>
        <h1>Демо</h1>
        <h3>Пропущенный уровень</h3>
        <table><tr><td>Ячейка</td></tr></table>
      </main>
    `);
    const ruleIds = result.violations.map((violation) => violation.ruleId);

    expect(axe.run).toHaveBeenCalled();
    expect(ruleIds).toEqual(
      expect.arrayContaining(['bypass', 'heading-order', 'no-table-layout', 'table-requires-th']),
    );
    expect(result.violations.every((violation) => violation.source === 'ru-a11y')).toBe(true);
  });

  it('does not scan the overlay when the page has no other content', async () => {
    const result = await scan('<button data-ru-a11y-overlay>Доступность</button>');

    expect(result.violations).toHaveLength(0);
  });

  it('keeps separate findings for elements with the same tag', async () => {
    const result = await scan(`
      <main><h1>Форма</h1>
        <section><input type="image" src="a.png"></section>
        <section><input type="image" src="b.png"></section>
      </main>
    `);

    expect(selectorsOf(result, 'input-image-alt')).toEqual([
      'body > main > section:nth-of-type(1) > input',
      'body > main > section:nth-of-type(2) > input',
    ]);
  });

  it('merges axe and ru-a11y findings for the same element', async () => {
    (axe.run as unknown as jest.Mock).mockResolvedValueOnce({
      violations: [
        {
          id: 'input-image-alt',
          impact: 'critical',
          nodes: [{ target: ['input[src="a.png"]'], html: '<input>', impact: 'critical' }],
        },
      ],
    });

    const result = await scan('<main><h1>Форма</h1><input type="image" src="a.png"></main>');
    const findings = result.violations.filter(
      (violation) => violation.ruleId === 'input-image-alt',
    );

    expect(findings).toHaveLength(1);
    expect(findings[0].source).toBe('axe');
  });

  it('accepts a select wrapped in a label', async () => {
    const result = await scan(`
      <main><h1>Форма</h1>
        <label>Город <select><option>Москва</option></select></label>
        <select id="bare"><option>1</option></select>
      </main>
    `);

    expect(selectorsOf(result, 'select-name')).toEqual(['#bare']);
  });

  it('respects a custom excludeSelector together with the overlay itself', async () => {
    document.body.innerHTML = `
      <main><h1>Страница</h1></main>
      <div class="third-party"><input type="image" src="ad.png"></div>
      <div data-ru-a11y-overlay><input type="image" src="overlay.png"></div>
    `;

    const result = await runAxeScan({
      preset: 'gost-aa',
      excludeSelector: '[data-ru-a11y-overlay], .third-party',
    });

    expect(result && selectorsOf(result, 'input-image-alt')).toEqual([]);
  });

  it('skips a scan while another one is running', async () => {
    document.body.innerHTML = '<main><h1>Страница</h1></main>';

    const [first, second] = await Promise.all([runAxeScan(), runAxeScan()]);

    expect(first).not.toBeNull();
    expect(second).toBeNull();
  });
});

describe('getUniqueSelector', () => {
  it('prefers a unique id and falls back to a structural path', () => {
    document.body.innerHTML = `
      <div id="root"><ul><li>a</li><li>b</li></ul></div>
      <p id="dup"></p><p id="dup"></p>
    `;

    const [, second] = Array.from(document.querySelectorAll('li'));
    const duplicates = document.querySelectorAll('#dup');

    expect(getUniqueSelector(second)).toBe('#root > ul > li:nth-of-type(2)');
    expect(getUniqueSelector(duplicates[1])).toBe('body > p:nth-of-type(2)');
    expect(document.querySelector(getUniqueSelector(duplicates[1]))).toBe(duplicates[1]);
  });
});
