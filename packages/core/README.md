# ru-a11y-toolkit-core

[![npm version](https://img.shields.io/npm/v/ru-a11y-toolkit-core)](https://www.npmjs.com/package/ru-a11y-toolkit-core)
[![license](https://img.shields.io/npm/l/ru-a11y-toolkit-core)](../../LICENSE)

The rule catalog behind [ru-a11y-toolkit](../../README.md). It holds, for every accessibility
rule the toolkit knows, a Russian title, description and fix, the GOST R 52872-2019 clause,
the Decree No. 102 item and the WCAG criterion.

The ESLint plugin, the overlay and the CLI all read their texts from here, so one problem
is described the same way in the editor, in the browser and in a CI report.

## Install

```bash
npm install ru-a11y-toolkit-core
```

## Usage

```ts
import { getRuleMeta, findGostRuleByAxeId, getAxeRuleIdForEslintRule } from 'ru-a11y-toolkit-core';

getRuleMeta('image-alt');
// {
//   id: 'image-alt',
//   title: 'Изображение без альтернативного текста',
//   fix: 'Добавьте <img alt="Описание содержания изображения" /> или alt="" для декоративных.',
//   gost: 'ГОСТ Р 52872-2019, §5.1.1',
//   post102: 'Постановление №102, п. г)',
//   wcag: 'WCAG 2.1, 1.1.1 Non-text Content',
//   principle: 'perceivable',
//   severity: 'error',
// }

// ESLint rule ids are aliases of catalog rules:
getRuleMeta('ru-a11y/no-table-layout').id; // 'no-table-layout'
getAxeRuleIdForEslintRule('ru-a11y/require-skip-link'); // 'bypass'

// Report-oriented shape with GOST principle and severity names:
findGostRuleByAxeId('bypass').code; // 'RU_GOST_NAV_SKIP_LINK'
```

Unknown ids never throw: `getRuleMeta` returns a generic Russian description and
`findGostRuleByAxeId` returns `FALLBACK_GOST_RULE`.

## API

| Export                                                                                                                | Description                                                   |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `RU_A11Y_RULES`                                                                                                       | All 115 rules keyed by id                                     |
| `RU_A11Y_CUSTOM_RULES`                                                                                                | Rules implemented by ru-a11y itself (no axe-core counterpart) |
| `getRuleMeta(id)`                                                                                                     | Metadata by id or alias, with a fallback                      |
| `getCanonicalRuleId(id)`, `isKnownRule(id)`                                                                           | Alias resolution (O(1), the alias index is built once)        |
| `WCAG_PRINCIPLES`                                                                                                     | Russian names of the four WCAG principles                     |
| `ESLINT_RULE_TO_AXE_ID`, `getAxeRuleIdForEslintRule(id)`                                                              | ESLint rule id to axe-core id                                 |
| `GOST_RULES`, `findGostRuleByAxeId(id)`                                                                               | Rules in the shape used by CLI reports                        |
| `toGostPrinciple`, `toGostSeverity`, `normalizeRuleCode`, `toRuleCode`                                                | Conversion helpers                                            |
| `RU_A11Y_TOOLKIT_STATS`                                                                                               | Rule counts per engine, used in the docs                      |
| Types: `RuA11yRuleMeta`, `RuleId`, `AxeRuleId`, `CustomRuleId`, `GostRuleDefinition`, `GostPrinciple`, `GostSeverity` |                                                               |

## How rules are counted

- **115** canonical rule ids live in the catalog.
- **184** checks are implemented across engines: 36 in ESLint and 148 in the overlay
  (104 axe-core rules plus 44 own DOM checks). One canonical id can be checked by several
  engines, which is why the numbers differ.
- **54** of those checks are written from scratch (10 ESLint rules, 44 overlay checks);
  26 more reuse `eslint-plugin-jsx-a11y` logic with rewritten Russian messages.

Each package has a test that compares its real rule count with `RU_A11Y_TOOLKIT_STATS`, so the
published numbers cannot go stale.

## Layout

```text
src/
  types.ts             RuA11yRuleMeta and friends
  catalog/axeRules.ts  metadata for axe-core rules, grouped by WCAG principle
  catalog/customRules.ts  rules without an axe-core counterpart
  registry.ts          merged catalog, alias index, lookups
  gostRules.ts         report-oriented view (codes, GOST principle/severity names)
  eslintRuleMap.ts     ESLint id -> axe id
  stats.ts             published counts
```

## License

MIT
