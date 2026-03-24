import type { GostIssue, GostPrinciple, GostSeverity } from '../types';
import { findGostRuleByAxeId } from './gostMapping';

const ESLINT_RULE_TO_AXE_ID: Record<string, string> = {
  '@ru-a11y/gost-a11y/require-skip-link': 'bypass',
  '@ru-a11y/gost-a11y/require-lang-attr': 'html-has-lang',
  '@ru-a11y/gost-a11y/require-title-semantic': 'document-title',
  '@ru-a11y/gost-a11y/no-frame-structure': 'frame-title',
  '@ru-a11y/gost-a11y/zoom-200-warning': 'meta-viewport',
  '@ru-a11y/gost-a11y/jsx-a11y/alt-text': 'image-alt',
  '@ru-a11y/gost-a11y/jsx-a11y/anchor-has-content': 'link-name',
  '@ru-a11y/gost-a11y/jsx-a11y/anchor-is-valid': 'link-name',
  '@ru-a11y/gost-a11y/jsx-a11y/aria-props': 'aria-valid-attr',
  '@ru-a11y/gost-a11y/jsx-a11y/aria-proptypes': 'aria-valid-attr-value',
  '@ru-a11y/gost-a11y/jsx-a11y/aria-role': 'aria-roles',
  '@ru-a11y/gost-a11y/jsx-a11y/click-events-have-key-events': 'click-events-have-key-events',
  '@ru-a11y/gost-a11y/jsx-a11y/html-has-lang': 'html-has-lang',
  '@ru-a11y/gost-a11y/jsx-a11y/iframe-has-title': 'frame-title',
  '@ru-a11y/gost-a11y/jsx-a11y/img-redundant-alt': 'image-redundant-alt',
  '@ru-a11y/gost-a11y/jsx-a11y/label-has-associated-control': 'label',
  '@ru-a11y/gost-a11y/jsx-a11y/media-has-caption': 'video-caption',
  '@ru-a11y/gost-a11y/jsx-a11y/tabindex-no-positive': 'tabindex',
  '@ru-a11y/gost-a11y/jsx-a11y/no-access-key': 'accesskeys',
  '@ru-a11y/gost-a11y/jsx-a11y/autocomplete-valid': 'autocomplete-valid',
};

export interface EslintIssueInput {
  filePath: string;
  line: number;
  column: number;
  ruleId: string;
  message: string;
  severity: 1 | 2;
}

function severityFromEslint(level: 1 | 2): GostSeverity {
  return level === 2 ? 'критичное' : 'существенное';
}

function principleFromRuleId(ruleId: string): GostPrinciple {
  if (ruleId.includes('lang') || ruleId.includes('title') || ruleId.includes('heading')) {
    return 'понятность';
  }

  if (ruleId.includes('contrast') || ruleId.includes('image') || ruleId.includes('caption')) {
    return 'воспринимаемость';
  }

  if (ruleId.includes('tab') || ruleId.includes('skip') || ruleId.includes('keyboard')) {
    return 'управляемость';
  }

  return 'надежность';
}

/**
 * Converts ESLint finding to unified ru-a11y issue shape for merged reports.
 */
export function mapEslintResultToGost(input: EslintIssueInput): GostIssue {
  const mappedAxeRuleId = ESLINT_RULE_TO_AXE_ID[input.ruleId];
  const mappedRule = mappedAxeRuleId ? findGostRuleByAxeId(mappedAxeRuleId) : null;

  return {
    url: `file://${input.filePath}`,
    selector: `${input.filePath}:${input.line}:${input.column}`,
    ruRuleCode: mappedRule
      ? mappedRule.code
      : `RU_ESLINT_${input.ruleId.toUpperCase().replace(/[^A-Z0-9]+/g, '_')}`,
    axeRuleId: mappedAxeRuleId ?? input.ruleId,
    title: mappedRule ? mappedRule.title : `Нарушение ESLint: ${input.ruleId}`,
    description: mappedRule ? mappedRule.description : 'Нарушение обнаружено статическим анализатором ESLint.',
    recommendation: mappedRule ? mappedRule.recommendation : 'Исправьте проблему согласно сообщению ESLint и правилам ГОСТ/WCAG.',
    severity: severityFromEslint(input.severity),
    principle: mappedRule ? mappedRule.principle : principleFromRuleId(input.ruleId),
    gostRefs: mappedRule ? mappedRule.gostRefs : ['ГОСТ Р 52872-2012 (по правилу ESLint требуется уточнение)'],
    post102Refs: mappedRule
      ? mappedRule.post102Refs
      : ['Постановление Правительства РФ №102 от 07.02.2026 (по правилу ESLint требуется уточнение)'],
    wcagRefs: mappedRule ? mappedRule.wcagRefs : [],
    sourceMessage: input.message,
    issueType: 'lint',
    origin: 'static-eslint',
    ruleSource: 'eslint-rules',
    source: {
      filePath: input.filePath,
      line: input.line,
      column: input.column,
      note: 'Источник получен из ESLint (статический анализ исходного кода).',
    },
  };
}

