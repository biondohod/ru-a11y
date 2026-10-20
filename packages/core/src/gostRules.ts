import { RU_A11Y_RULES, getRuleMeta, isKnownRule, getCanonicalRuleId } from './registry';
import type { RuA11yRuleMeta, RuleSeverity, WcagPrinciple } from './types';

/** WCAG principle names as GOST R 52872-2019 spells them. */
export type GostPrinciple = 'воспринимаемость' | 'управляемость' | 'понятность' | 'надежность';

/** Severity scale used in reports for Russian regulators. */
export type GostSeverity = 'критичное' | 'существенное' | 'незначительное';

/** Rule shape consumed by reports: everything needed to describe a violation. */
export interface GostRuleDefinition {
  code: string;
  axeRuleIds: string[];
  title: string;
  description: string;
  recommendation: string;
  principle: GostPrinciple;
  defaultSeverity: GostSeverity;
  gostRefs: string[];
  post102Refs: string[];
  wcagRefs: string[];
}

const GOST_PRINCIPLE_BY_WCAG: Readonly<Record<WcagPrinciple, GostPrinciple>> = {
  perceivable: 'воспринимаемость',
  operable: 'управляемость',
  understandable: 'понятность',
  robust: 'надежность',
};

const GOST_SEVERITY_BY_RULE_SEVERITY: Readonly<Record<RuleSeverity, GostSeverity>> = {
  error: 'существенное',
  warning: 'незначительное',
};

/** Stable report codes kept for rules that existed before codes were generated. */
const LEGACY_CODE_BY_RULE_ID: Readonly<Record<string, string>> = {
  bypass: 'RU_GOST_NAV_SKIP_LINK',
  'color-contrast': 'RU_GOST_TEXT_CONTRAST',
  'color-contrast-enhanced': 'RU_GOST_TEXT_CONTRAST',
  'document-title': 'RU_GOST_PAGE_TITLE',
  'no-table-layout': 'RU_GOST_TABLE_LAYOUT',
  'table-requires-th': 'RU_GOST_TABLE_HEADERS',
};

const POST_102_FULL_TITLE = 'Постановление Правительства РФ №102 от 07.02.2026';

export const FALLBACK_GOST_RULE: GostRuleDefinition = {
  code: 'RU_GOST_GENERIC',
  axeRuleIds: [],
  title: 'Обнаружено нарушение доступности',
  description: 'Правило не сопоставлено с внутренним каталогом ru-a11y. Требуется ручная проверка.',
  recommendation:
    'Проверьте элемент, указанный в отчете, и исправьте нарушение согласно рекомендациям axe-core, ГОСТ и Постановления №102.',
  principle: 'надежность',
  defaultSeverity: 'незначительное',
  gostRefs: ['ГОСТ Р 52872-2019 (требуется ручная классификация)'],
  post102Refs: [`${POST_102_FULL_TITLE} (требуется ручная классификация)`],
  wcagRefs: [],
};

/** Turns any rule id into an upper snake case report code, e.g. `image-alt` -> `RU_AXE_IMAGE_ALT`. */
export function toRuleCode(prefix: string, ruleId: string): string {
  return `${prefix}_${ruleId.toUpperCase().replace(/[^A-Z0-9]+/g, '_')}`;
}

export function normalizeRuleCode(ruleId: string): string {
  return LEGACY_CODE_BY_RULE_ID[ruleId] ?? toRuleCode('RU_AXE', ruleId);
}

export function toGostPrinciple(principle?: WcagPrinciple): GostPrinciple {
  return principle ? GOST_PRINCIPLE_BY_WCAG[principle] : 'надежность';
}

export function toGostSeverity(severity?: RuleSeverity): GostSeverity {
  return severity ? GOST_SEVERITY_BY_RULE_SEVERITY[severity] : 'незначительное';
}

function toRefs(ref?: string): string[] {
  return ref ? [ref] : [];
}

/** Expands the short "Постановление №102," prefix used in the catalog to the full title. */
function toPost102Refs(ref?: string): string[] {
  return toRefs(ref).map((value) =>
    value.replace(/^Постановление №102,/, `${POST_102_FULL_TITLE},`),
  );
}

export function toGostRuleDefinition(meta: RuA11yRuleMeta): GostRuleDefinition {
  return {
    code: normalizeRuleCode(meta.id),
    axeRuleIds: [meta.id],
    title: meta.title,
    description: meta.description,
    recommendation: meta.fix,
    principle: toGostPrinciple(meta.principle),
    defaultSeverity: toGostSeverity(meta.severity),
    gostRefs: toRefs(meta.gost),
    post102Refs: toPost102Refs(meta.post102),
    wcagRefs: toRefs(meta.wcag),
  };
}

export const GOST_RULES: readonly GostRuleDefinition[] =
  Object.values(RU_A11Y_RULES).map(toGostRuleDefinition);

/** Looks a rule up by axe id or alias; unknown rules resolve to {@link FALLBACK_GOST_RULE}. */
export function findGostRuleByAxeId(axeRuleId: string): GostRuleDefinition {
  const canonicalRuleId = getCanonicalRuleId(axeRuleId);

  return isKnownRule(canonicalRuleId)
    ? toGostRuleDefinition(getRuleMeta(canonicalRuleId))
    : FALLBACK_GOST_RULE;
}
