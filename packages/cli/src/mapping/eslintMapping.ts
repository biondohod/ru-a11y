import { getAxeRuleIdForEslintRule } from 'ru-a11y-toolkit-core';
import type { GostIssue, GostPrinciple, GostSeverity } from '../types';
import { findGostRuleByAxeId } from './gostMapping';

export interface EslintIssueInput {
  filePath: string;
  line: number;
  column: number;
  ruleId: string;
  message: string;
  severity: 1 | 2;
  snippet?: string;
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
  const mappedAxeRuleId = getAxeRuleIdForEslintRule(input.ruleId);
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
    gostRefs: mappedRule ? mappedRule.gostRefs : ['ГОСТ Р 52872-2019 (по правилу ESLint требуется уточнение)'],
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
      snippet: input.snippet,
      note: 'Источник получен из ESLint (статический анализ исходного кода).',
    },
  };
}
