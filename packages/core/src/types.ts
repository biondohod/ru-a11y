/** WCAG principle a rule belongs to. Used to group violations in reports and UI. */
export type WcagPrinciple = 'perceivable' | 'operable' | 'understandable' | 'robust';

/** Rule severity as configured by ru-a11y (independent of axe-core impact). */
export type RuleSeverity = 'error' | 'warning';

/**
 * Metadata of a single accessibility rule. Texts are in Russian because they are
 * shown to end users of the toolkit; references point to the Russian regulations.
 */
export interface RuA11yRuleMeta {
  /** axe-core rule id or an internal ru-a11y id. */
  id: string;
  /** Short violation title. */
  title: string;
  /** What is wrong and why it matters. */
  description: string;
  /** How to fix it: a one or two line hint or code sample. */
  fix: string;
  /** Clause of GOST R 52872-2019. */
  gost?: string;
  /** Clause of Government Decree No. 102. */
  post102?: string;
  /** WCAG 2.1 success criterion. */
  wcag?: string;
  principle?: WcagPrinciple;
  severity: RuleSeverity;
  /** Alternative ids used by ESLint / axe-compatible integrations. */
  aliases?: string[];
}
