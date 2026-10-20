/**
 * Tests for rules/jsx-a11y (translated jsx-a11y rules) and wrap-rule.js:
 *
 * 1. all 26 wrapped jsx-a11y rules are registered in the plugin;
 * 2. reports get Russian messages (context.report is intercepted);
 * 3. the original rule logic still works (valid/invalid cases);
 * 4. the wrapper itself works in isolation.
 */

'use strict';

const { RuleTester, Linter } = require('eslint');
const plugin = require('../index.js');
const wrapJsxRule = require('../rules/jsx-a11y/wrap-rule');

// -----------------------------------------------------------------------
// Fixtures
// -----------------------------------------------------------------------

const EXPECTED_JSX_A11Y_RULES = [
  'alt-text',
  'anchor-has-content',
  'anchor-is-valid',
  'aria-props',
  'aria-proptypes',
  'aria-role',
  'aria-unsupported-elements',
  'click-events-have-key-events',
  'heading-has-content',
  'html-has-lang',
  'iframe-has-title',
  'img-redundant-alt',
  'interactive-supports-focus',
  'label-has-associated-control',
  'media-has-caption',
  'mouse-events-have-key-events',
  'tabindex-no-positive',
  'no-noninteractive-element-interactions',
  'no-noninteractive-tabindex',
  'no-redundant-roles',
  'scope',
  'autocomplete-valid',
  'no-access-key',
  'no-static-element-interactions',
  'no-interactive-element-to-noninteractive-role',
  'aria-activedescendant-has-tabindex',
];

const LANG_OPTS = {
  ecmaVersion: 2020,
  sourceType: 'module',
  parserOptions: { ecmaFeatures: { jsx: true } },
};

/** Runs a single rule through Linter and returns the first message. */
function lint(ruleName, code) {
  const linter = new Linter({ configType: 'flat' });
  // Short plugin name: ESLint 9 would parse `@scope/pkg/rule` as
  // plugin `@scope/pkg` and rule `rule`.
  const config = [
    {
      files: ['**/*.jsx', '**/*.js'],
      plugins: { a11y: plugin },
      rules: { [`a11y/jsx-a11y/${ruleName}`]: 'error' },
      languageOptions: LANG_OPTS,
    },
  ];
  const msgs = linter.verify(code, config, { filename: 'test.jsx' });
  return msgs[0] || null;
}

// -----------------------------------------------------------------------
// 1. Registration
// -----------------------------------------------------------------------

describe('jsx-a11y wrappers: registration', () => {
  test('the plugin exposes all 26 wrapped jsx-a11y rules', () => {
    const pluginRuleNames = Object.keys(plugin.rules);
    for (const name of EXPECTED_JSX_A11Y_RULES) {
      expect(pluginRuleNames).toContain(`jsx-a11y/${name}`);
    }
  });

  test('the plugin has 36 rules: 10 custom + 26 jsx-a11y', () => {
    expect(Object.keys(plugin.rules)).toHaveLength(36);
  });

  test('every wrapped rule has meta and create', () => {
    for (const name of EXPECTED_JSX_A11Y_RULES) {
      const rule = plugin.rules[`jsx-a11y/${name}`];
      expect(rule).toHaveProperty('meta');
      expect(rule).toHaveProperty('create');
      expect(typeof rule.create).toBe('function');
    }
  });
});

// -----------------------------------------------------------------------
// 2. Russian messages via intercepted context.report
// -----------------------------------------------------------------------

describe('jsx-a11y wrappers: Russian messages', () => {
  test('anchor-has-content: empty link', () => {
    const msg = lint('anchor-has-content', `function C(){return <a href="/p"></a>;}`);
    expect(msg).not.toBeNull();
    expect(msg.message).toMatch(/Элемент <a>/);
    expect(msg.message).toMatch(/ГОСТ Р 52872-2019/);
    expect(msg.message).toMatch(/Постановление №102/);
  });

  test('html-has-lang: html without lang', () => {
    const msg = lint('html-has-lang', `function C(){return <html><body/></html>;}`);
    expect(msg).not.toBeNull();
    expect(msg.message).toMatch(/атрибут lang/);
    expect(msg.message).toMatch(/ГОСТ Р 52872-2019/);
  });

  test('iframe-has-title: iframe without title', () => {
    const msg = lint('iframe-has-title', `function C(){return <iframe src="x.html"/>;}`);
    expect(msg).not.toBeNull();
    expect(msg.message).toMatch(/title/);
    expect(msg.message).toMatch(/ГОСТ Р 52872-2019/);
  });

  test('tabindex-no-positive: tabIndex={2}', () => {
    const msg = lint('tabindex-no-positive', `function C(){return <div tabIndex={2}>x</div>;}`);
    expect(msg).not.toBeNull();
    expect(msg.message).toMatch(/tabIndex/);
    expect(msg.message).toMatch(/Постановление №102/);
    expect(msg.message).toMatch(/WCAG 2\.4\.3/);
  });

  test('aria-role: invalid role', () => {
    const msg = lint('aria-role', `function C(){return <div role="superman">x</div>;}`);
    expect(msg).not.toBeNull();
    expect(msg.message).toMatch(/role/);
    expect(msg.message).toMatch(/WCAG 4\.1\.2/);
  });

  test('click-events-have-key-events: onClick without a keyboard handler', () => {
    const msg = lint(
      'click-events-have-key-events',
      `function C(){return <div onClick={()=>{}}>x</div>;}`,
    );
    expect(msg).not.toBeNull();
    expect(msg.message).toMatch(/клавиатур/);
    expect(msg.message).toMatch(/Постановление №102/);
  });

  test('alt-text: img without alt', () => {
    const msg = lint('alt-text', `function C(){return <img src="x.png"/>;}`);
    expect(msg).not.toBeNull();
    expect(msg.message).toMatch(/alt/);
    expect(msg.message).toMatch(/ГОСТ Р 52872-2019/);
  });

  test('scope: scope on td', () => {
    const msg = lint('scope', `function C(){return <td scope="col">x</td>;}`);
    expect(msg).not.toBeNull();
    expect(msg.message).toMatch(/scope/);
    expect(msg.message).toMatch(/ГОСТ Р 52872-2019/);
  });

  test('every message is in Russian', () => {
    const cyrillicRe = /[а-яёА-ЯЁ]/;
    const testCases = {
      'anchor-has-content': `function C(){return <a href="/p"></a>;}`,
      'html-has-lang': `function C(){return <html><body/></html>;}`,
      'iframe-has-title': `function C(){return <iframe src="x.html"/>;}`,
      'tabindex-no-positive': `function C(){return <div tabIndex={2}>x</div>;}`,
      'aria-role': `function C(){return <div role="superman">x</div>;}`,
      scope: `function C(){return <td scope="col">x</td>;}`,
    };
    for (const [ruleName, code] of Object.entries(testCases)) {
      const msg = lint(ruleName, code);
      expect(msg).not.toBeNull();
      expect(msg.message).toMatch(cyrillicRe);
    }
  });
});

// -----------------------------------------------------------------------
// 3. wrap-rule in isolation
// -----------------------------------------------------------------------

describe('wrapJsxRule', () => {
  /**
   * Minimal fake context with a patchable report; listeners are called
   * directly, without the ESLint runtime.
   */
  function runWithFakeContext(rule, mappings, triggerFn) {
    let reported = null;
    // A plain object, so report can be overridden via Object.create
    const fakeContext = Object.create({
      report(descriptor) {
        reported = descriptor;
      },
    });
    const wrapped = wrapJsxRule(rule, mappings);
    const listeners = wrapped.create(fakeContext);
    triggerFn(listeners, fakeContext);
    return reported;
  }

  const fakeRule = {
    meta: { type: 'problem', schema: [] },
    create(context) {
      return {
        testEvent() {
          context.report({ message: 'Original English error message' });
        },
      };
    },
  };

  test('replaces a message matched by substring', () => {
    const result = runWithFakeContext(
      fakeRule,
      [{ match: 'Original English error message', replace: 'Русское сообщение' }],
      (listeners) => listeners.testEvent(),
    );
    expect(result.message).toBe('Русское сообщение');
  });

  test('keeps the message when nothing matches', () => {
    const result = runWithFakeContext(
      fakeRule,
      [{ match: 'something else', replace: 'Не должно появиться' }],
      (listeners) => listeners.testEvent(),
    );
    expect(result.message).toBe('Original English error message');
  });

  test('supports RegExp matchers', () => {
    const result = runWithFakeContext(
      fakeRule,
      [{ match: /English (error)/, replace: 'Через RegExp' }],
      (listeners) => listeners.testEvent(),
    );
    expect(result.message).toBe('Через RegExp');
  });

  test('returns null for null', () => {
    expect(wrapJsxRule(null, [])).toBeNull();
  });

  test('returns the original rule when it has no create', () => {
    const noCreate = { meta: {} };
    expect(wrapJsxRule(noCreate, [])).toBe(noCreate);
  });

  test('keeps meta', () => {
    const wrapped = wrapJsxRule(fakeRule, []);
    expect(wrapped.meta.type).toBe('problem');
  });
});

// -----------------------------------------------------------------------
// 4. RuleTester cases (must run at the top level)
// -----------------------------------------------------------------------

const ruleTester = new RuleTester({
  languageOptions: LANG_OPTS,
});

ruleTester.run(
  '@ru-a11y/gost-a11y/jsx-a11y/anchor-has-content',
  plugin.rules['jsx-a11y/anchor-has-content'],
  {
    valid: [
      { code: `function C(){return <a href="/page">Перейти</a>;}` },
      { code: `function C(){return <a href="/page" aria-label="Главная страница"/>;}` },
    ],
    invalid: [{ code: `function C(){return <a href="/page"></a>;}`, errors: 1 }],
  },
);

ruleTester.run(
  '@ru-a11y/gost-a11y/jsx-a11y/html-has-lang',
  plugin.rules['jsx-a11y/html-has-lang'],
  {
    valid: [{ code: `function App(){return <html lang="ru"><body/></html>;}` }],
    invalid: [{ code: `function App(){return <html><body/></html>;}`, errors: 1 }],
  },
);

ruleTester.run(
  '@ru-a11y/gost-a11y/jsx-a11y/iframe-has-title',
  plugin.rules['jsx-a11y/iframe-has-title'],
  {
    valid: [{ code: `function C(){return <iframe title="Карта" src="map.html"/>;}` }],
    invalid: [{ code: `function C(){return <iframe src="map.html"/>;}`, errors: 1 }],
  },
);

ruleTester.run(
  '@ru-a11y/gost-a11y/jsx-a11y/tabindex-no-positive',
  plugin.rules['jsx-a11y/tabindex-no-positive'],
  {
    valid: [
      { code: `function C(){return <div tabIndex={0}>OK</div>;}` },
      { code: `function C(){return <div tabIndex={-1}>OK</div>;}` },
    ],
    invalid: [{ code: `function C(){return <div tabIndex={1}>Bad</div>;}`, errors: 1 }],
  },
);

ruleTester.run('@ru-a11y/gost-a11y/jsx-a11y/aria-role', plugin.rules['jsx-a11y/aria-role'], {
  valid: [{ code: `function C(){return <div role="button">OK</div>;}` }],
  invalid: [{ code: `function C(){return <div role="superman">Bad</div>;}`, errors: 1 }],
});

console.log('✅ Тесты jsx-a11y-ru прошли успешно');
