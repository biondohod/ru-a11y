import axe from 'axe-core';
import { runAxeScan } from '../src/axeRunner';

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

describe('overlay custom rules', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.title = 'Страница проверки';
    document.documentElement.setAttribute('lang', 'ru');
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('добавляет ru-a11y DOM-нарушения поверх axe-core', async () => {
    document.body.innerHTML = `
      <header><nav><a href="/home">Главная</a></nav></header>
      <main>
        <h1>Демо</h1>
        <h3>Пропущенный уровень</h3>
        <table><tr><td>Ячейка</td></tr></table>
      </main>
    `;

    const result = await runAxeScan({ preset: 'gost-aa' });
    const ruleIds = result.violations.map((violation) => violation.ruleId);

    expect(axe.run).toHaveBeenCalled();
    expect(ruleIds).toContain('bypass');
    expect(ruleIds).toContain('heading-order');
    expect(ruleIds).toContain('no-table-layout');
    expect(ruleIds).toContain('table-requires-th');
  });

  it('не сканирует сам overlay, если другого контента на странице нет', async () => {
    document.body.innerHTML = '<button data-ru-a11y-overlay>Доступность</button>';

    const result = await runAxeScan({ preset: 'gost-aa' });

    expect(result.violations).toHaveLength(0);
  });
});
