import { getRuleMeta } from 'ru-a11y-toolkit-core';
import type { A11yViolationNode, AxePreset } from '../axeRunner';
import { ariaRules } from './aria';
import { documentRules } from './document';
import { getUniqueSelector } from './dom';
import { formRules } from './forms';
import { headingRules } from './headings';
import { imageRules } from './images';
import { landmarkRules } from './landmarks';
import { mediaRules } from './media';
import { navigationRules } from './navigation';
import { tableRules } from './tables';
import type { CustomFinding, CustomRule, CustomRuleContext } from './types';

/**
 * DOM checks that run in addition to axe-core. They cover GOST / Decree 102
 * requirements axe does not check, or checks it only runs at other levels.
 */
export const CUSTOM_RULES: readonly CustomRule[] = [
  ...navigationRules,
  ...documentRules,
  ...headingRules,
  ...tableRules,
  ...mediaRules,
  ...formRules,
  ...imageRules,
  ...landmarkRules,
  ...ariaRules,
];

function toViolation(
  ruleId: string,
  { element, impact, summary }: CustomFinding,
): A11yViolationNode {
  const selector = getUniqueSelector(element);

  return {
    key: `custom:${ruleId}::${selector}`,
    ruleId,
    source: 'ru-a11y',
    meta: getRuleMeta(ruleId),
    selector,
    targets: [[selector]],
    html: element.outerHTML,
    impact,
    failureSummary: summary,
  };
}

export function runCustomRules(
  document: Document,
  preset: AxePreset,
  excludeSelector: string,
): A11yViolationNode[] {
  const context: CustomRuleContext = { document, preset, excludeSelector };

  return CUSTOM_RULES.filter((rule) => rule.presets.includes(preset)).flatMap((rule) =>
    rule.check(context).map((result) => toViolation(rule.id, result)),
  );
}
