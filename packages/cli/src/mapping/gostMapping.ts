import {
  FALLBACK_GOST_RULE,
  GOST_RULES,
  findGostRuleByAxeId,
  type GostRuleDefinition,
  type GostSeverity as CoreGostSeverity,
} from 'ru-a11y-toolkit-core';
import type { AxeIssueType, GostIssue, GostSeverity } from '../types';

export { GOST_RULES, findGostRuleByAxeId, type GostRuleDefinition };

export interface AxeResultItem {
  url: string;
  id: string;
  impact?: string | null;
  message: string;
  target?: string[];
  type?: AxeIssueType;
  html?: string;
}

function mapImpactToSeverity(
  impact?: string | null,
  fallback: CoreGostSeverity = 'существенное',
): GostSeverity {
  if (impact === 'critical' || impact === 'serious') {
    return 'критичное';
  }

  if (impact === 'moderate') {
    return 'существенное';
  }

  if (impact === 'minor') {
    return 'незначительное';
  }

  return fallback;
}

/**
 * Преобразует элемент результата axe-core в нормализованный объект ru-a11y.
 */
export function mapAxeResultToGost(axeResultItem: AxeResultItem): GostIssue {
  const rule = findGostRuleByAxeId(axeResultItem.id);

  return {
    url: axeResultItem.url,
    selector: axeResultItem.target?.[0] ?? 'document',
    ruRuleCode: rule.code,
    axeRuleId: axeResultItem.id,
    title: rule.title,
    description: rule.description,
    recommendation: rule.recommendation,
    severity: mapImpactToSeverity(axeResultItem.impact, rule.defaultSeverity),
    principle: rule.principle,
    gostRefs: rule.gostRefs,
    post102Refs: rule.post102Refs,
    wcagRefs: rule.wcagRefs,
    sourceMessage: axeResultItem.message,
    issueType: axeResultItem.type ?? 'violation',
    origin: 'runtime-axe',
    ruleSource: rule === FALLBACK_GOST_RULE ? 'fallback' : 'core-rules-map',
    source: {
      selector: axeResultItem.target?.[0] ?? 'document',
      snippet: axeResultItem.html,
      note: 'Для runtime-аудита точный файл и строка обычно недоступны без отдельной интеграции source maps.',
    },
  };
}
