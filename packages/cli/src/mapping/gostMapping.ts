import {
  FALLBACK_GOST_RULE,
  GOST_RULES,
  findGostRuleByAxeId,
  type GostRuleDefinition,
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

const SEVERITY_BY_IMPACT: Readonly<Record<string, GostSeverity>> = {
  critical: 'критичное',
  serious: 'критичное',
  moderate: 'существенное',
  minor: 'незначительное',
};

/** axe impact wins over the catalog default because it reflects the concrete node. */
function mapImpactToSeverity(
  impact: string | null | undefined,
  fallback: GostSeverity,
): GostSeverity {
  return (impact && SEVERITY_BY_IMPACT[impact]) || fallback;
}

/**
 * Converts one axe-core result node to the ru-a11y issue model.
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
