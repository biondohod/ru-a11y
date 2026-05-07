export {
  RU_A11Y_CUSTOM_RULES,
  RU_A11Y_RULES,
  WCAG_PRINCIPLES,
  getCanonicalRuleId,
  getRuleMeta,
  type RuA11yRuleMeta,
} from './rulesMap';

export {
  ESLINT_RULE_TO_AXE_ID,
  getAxeRuleIdForEslintRule,
} from './eslintRuleMap';

export {
  FALLBACK_GOST_RULE,
  GOST_RULES,
  findGostRuleByAxeId,
  normalizeRuleCode,
  toGostPrinciple,
  toGostRuleDefinition,
  toGostSeverity,
  type GostPrinciple,
  type GostRuleDefinition,
  type GostSeverity,
} from './gostRules';

export { RU_A11Y_TOOLKIT_STATS, type RuA11yToolkitStats } from './stats';
