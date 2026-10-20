import type axe from 'axe-core';
import type { AxePreset } from '../axeRunner';

export interface CustomRuleContext {
  document: Document;
  preset: AxePreset;
  excludeSelector: string;
}

/** A finding produced by a custom rule before it is turned into a violation node. */
export interface CustomFinding {
  element: Element;
  impact: axe.ImpactValue;
  summary?: string;
}

export interface CustomRule {
  /** Rule id in the ru-a11y-toolkit-core catalog. */
  id: string;
  /** Presets the rule is enabled for. */
  presets: readonly AxePreset[];
  check: (context: CustomRuleContext) => CustomFinding[];
}

export const ALL_PRESETS: readonly AxePreset[] = ['recommended', 'gost-aa', 'strict'];
export const AA_PRESETS: readonly AxePreset[] = ['gost-aa', 'strict'];
export const STRICT_PRESETS: readonly AxePreset[] = ['strict'];

export function finding(
  element: Element,
  impact: axe.ImpactValue,
  summary?: string,
): CustomFinding {
  return { element, impact, summary };
}

/** Reports `element` when `condition` holds. Keeps one-element checks on one line. */
export function findingIf(
  condition: unknown,
  element: Element,
  impact: axe.ImpactValue,
): CustomFinding[] {
  return condition ? [finding(element, impact)] : [];
}
