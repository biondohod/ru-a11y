'use strict';

const { Linter } = require('eslint');
const { RU_A11Y_TOOLKIT_STATS } = require('ru-a11y-toolkit-core');
const plugin = require('..');
const { customRules, jsxA11yRules } = require('../rules');

const LEVELS = ['recommended', 'gost-aa', 'strict'];

const PAGE = `
  export default function App() {
    return (
      <html lang="ru">
        <body>
          <a href="#main">Перейти к содержанию</a>
          <main id="main"><h1>Госуслуги</h1><img src="logo.png" /></main>
        </body>
      </html>
    );
  }
`;

function lint(config) {
  const linter = new Linter({ configType: 'flat' });
  return linter.verify(PAGE, [{ files: ['**/*.jsx'] }, { files: ['**/*.jsx'], ...config }], {
    filename: 'src/pages/App.jsx',
  });
}

describe('plugin', () => {
  it('reads its version from package.json', () => {
    expect(plugin.meta.version).toBe(require('../package.json').version);
  });

  it('matches the rule counts published by core', () => {
    expect(Object.keys(customRules)).toHaveLength(RU_A11Y_TOOLKIT_STATS.eslintChecks.custom);
    expect(Object.keys(jsxA11yRules)).toHaveLength(RU_A11Y_TOOLKIT_STATS.eslintChecks.base);
    expect(Object.keys(plugin.rules)).toHaveLength(RU_A11Y_TOOLKIT_STATS.eslintChecks.total);
  });
});

describe.each(LEVELS)('configs["%s"]', (level) => {
  const config = plugin.configs[level];

  it('is a flat config that registers the plugin', () => {
    expect(config.plugins).toEqual({ 'ru-a11y': plugin });
    expect(Array.isArray(config.plugins)).toBe(false);
  });

  it('only references rules that exist in the plugin', () => {
    const missing = Object.keys(config.rules)
      .map((ruleId) => ruleId.replace(/^ru-a11y\//, ''))
      .filter((ruleId) => !(ruleId in plugin.rules));

    expect(missing).toEqual([]);
  });

  it('lints JSX without configuration errors', () => {
    const messages = lint(config);

    expect(messages.filter((message) => message.fatal)).toEqual([]);
    expect(messages.every((message) => message.ruleId?.startsWith('ru-a11y/'))).toBe(true);
  });

  it('is exported as a subpath and as a /flat alias', () => {
    expect(require(`../configs/${level}`)).toBe(config);
    expect(plugin.configs[`${level}/flat`]).toBe(config);
  });
});

describe('config levels', () => {
  it('gets stricter from recommended to strict', () => {
    const ruleCount = (level) => Object.keys(plugin.configs[level].rules).length;

    expect(ruleCount('recommended')).toBeLessThan(ruleCount('gost-aa'));
    expect(ruleCount('gost-aa')).toBeLessThan(ruleCount('strict'));
  });

  it('reports a missing alt text with gost-aa', () => {
    const ruleIds = lint(plugin.configs['gost-aa']).map((message) => message.ruleId);

    expect(ruleIds).toContain('ru-a11y/jsx-a11y/alt-text');
  });
});
