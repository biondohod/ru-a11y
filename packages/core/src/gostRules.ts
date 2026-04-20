import {
  RU_A11Y_RULES,
  getCanonicalRuleId,
  getRuleMeta,
  type RuA11yRuleMeta,
} from './rulesMap';

export type GostPrinciple =
  | 'воспринимаемость'
  | 'управляемость'
  | 'понятность'
  | 'надежность';

export type GostSeverity = 'критичное' | 'существенное' | 'незначительное';

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

const LEGACY_CODE_BY_RULE_ID: Record<string, string> = {
  bypass: 'RU_GOST_NAV_SKIP_LINK',
  'color-contrast': 'RU_GOST_TEXT_CONTRAST',
  'color-contrast-enhanced': 'RU_GOST_TEXT_CONTRAST',
  'document-title': 'RU_GOST_PAGE_TITLE',
  'no-table-layout': 'RU_GOST_TABLE_LAYOUT',
  'table-requires-th': 'RU_GOST_TABLE_HEADERS',
};

export const FALLBACK_GOST_RULE: GostRuleDefinition = {
  code: 'RU_GOST_GENERIC',
  axeRuleIds: [],
  title: 'Обнаружено нарушение доступности',
  description:
    'Правило не сопоставлено с внутренним каталогом ru-a11y. Требуется ручная проверка.',
  recommendation:
    'Проверьте элемент, указанный в отчете, и исправьте нарушение согласно рекомендациям axe-core, ГОСТ и Постановления №102.',
  principle: 'надежность',
  defaultSeverity: 'незначительное',
  gostRefs: ['ГОСТ Р 52872-2019 (требуется ручная классификация)'],
  post102Refs: ['Постановление №102 от 07.02.2026 (требуется ручная классификация)'],
  wcagRefs: [],
};

export function normalizeRuleCode(ruleId: string): string {
  const legacyCode = LEGACY_CODE_BY_RULE_ID[ruleId];
  if (legacyCode) {
    return legacyCode;
  }

  return `RU_AXE_${ruleId.toUpperCase().replace(/[^A-Z0-9]+/g, '_')}`;
}

export function toGostPrinciple(principle?: RuA11yRuleMeta['principle']): GostPrinciple {
  if (principle === 'perceivable') {
    return 'воспринимаемость';
  }

  if (principle === 'operable') {
    return 'управляемость';
  }

  if (principle === 'understandable') {
    return 'понятность';
  }

  return 'надежность';
}

export function toGostSeverity(level?: RuA11yRuleMeta['severity']): GostSeverity {
  return level === 'error' ? 'существенное' : 'незначительное';
}

function toRefs(ref?: string): string[] {
  return ref ? [ref] : [];
}

function normalizePost102Ref(ref?: string): string[] {
  if (!ref) {
    return [];
  }

  return [
    ref.replace(
      /^Постановление №102,/,
      'Постановление Правительства РФ №102 от 07.02.2026,',
    ),
  ];
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
    post102Refs: normalizePost102Ref(meta.post102),
    wcagRefs: toRefs(meta.wcag),
  };
}

export const GOST_RULES: GostRuleDefinition[] = Object.values(RU_A11Y_RULES).map(
  toGostRuleDefinition,
);

export function findGostRuleByAxeId(axeRuleId: string): GostRuleDefinition {
  const canonicalRuleId = getCanonicalRuleId(axeRuleId);

  if (!(canonicalRuleId in RU_A11Y_RULES)) {
    return FALLBACK_GOST_RULE;
  }

  return toGostRuleDefinition(getRuleMeta(canonicalRuleId));
}
