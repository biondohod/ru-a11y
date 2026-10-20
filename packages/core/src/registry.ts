import { AXE_RULES } from './catalog/axeRules';
import { CUSTOM_RULES } from './catalog/customRules';
import type { RuA11yRuleMeta, WcagPrinciple } from './types';

export type AxeRuleId = keyof typeof AXE_RULES;
export type CustomRuleId = keyof typeof CUSTOM_RULES;
export type RuleId = AxeRuleId | CustomRuleId;

/** Rules implemented by ru-a11y itself (ESLint plugin and overlay runtime). */
export const RU_A11Y_CUSTOM_RULES: Readonly<Record<CustomRuleId, RuA11yRuleMeta>> = CUSTOM_RULES;

/** Single source of truth for every rule known to the toolkit. */
export const RU_A11Y_RULES: Readonly<Record<string, RuA11yRuleMeta>> = {
  ...AXE_RULES,
  ...CUSTOM_RULES,
};

/** Russian labels of WCAG principles, used for grouping in UI and reports. */
export const WCAG_PRINCIPLES: Readonly<Record<WcagPrinciple, string>> = {
  perceivable: 'Воспринимаемость',
  operable: 'Управляемость',
  understandable: 'Понятность',
  robust: 'Надёжность',
};

/** alias -> canonical id, built once instead of scanning every rule per lookup. */
const CANONICAL_ID_BY_ALIAS: ReadonlyMap<string, string> = new Map(
  Object.values(RU_A11Y_RULES).flatMap((rule) =>
    (rule.aliases ?? []).map((alias) => [alias, rule.id] as const),
  ),
);

export function isKnownRule(ruleId: string): boolean {
  return Object.hasOwn(RU_A11Y_RULES, ruleId);
}

/** Resolves an alias (e.g. an ESLint rule id) to the canonical rule id. Unknown ids pass through. */
export function getCanonicalRuleId(ruleId: string): string {
  if (isKnownRule(ruleId)) {
    return ruleId;
  }

  return CANONICAL_ID_BY_ALIAS.get(ruleId) ?? ruleId;
}

function createFallbackMeta(ruleId: string): RuA11yRuleMeta {
  return {
    id: ruleId,
    title: `Нарушение доступности: ${ruleId}`,
    description:
      'Обнаружено нарушение требований доступности. ' +
      'Подробная информация доступна в документации axe-core.',
    fix: `Изучите правило "${ruleId}" в документации axe-core: https://dequeuniversity.com/rules/axe/`,
    wcag: 'WCAG 2.1',
    severity: 'warning',
  };
}

/**
 * Returns rule metadata by id or alias.
 * Unknown rules get a generic Russian description so callers never have to handle `undefined`.
 */
export function getRuleMeta(ruleId: string): RuA11yRuleMeta {
  const canonicalRuleId = getCanonicalRuleId(ruleId);

  return isKnownRule(canonicalRuleId) ? RU_A11Y_RULES[canonicalRuleId] : createFallbackMeta(ruleId);
}
