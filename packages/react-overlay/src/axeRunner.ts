/**
 * Runs axe-core plus the ru-a11y custom rules and maps results to Russian metadata.
 *
 * Re-scans are driven by a MutationObserver rather than polling: it reacts only to
 * real DOM changes, costs nothing while the page is idle and behaves predictably
 * in SPAs with frequent updates.
 */

import axe from 'axe-core';
import { getRuleMeta, type RuA11yRuleMeta } from 'ru-a11y-toolkit-core';
import { runCustomRules } from './rules';

/** One violation: a rule failing on a specific DOM node. */
export interface A11yViolationNode {
  /** Stable key: rule id + selector. */
  key: string;
  ruleId: string;
  /** `axe` for axe-core rules, `ru-a11y` for the toolkit's own runtime checks. */
  source: 'axe' | 'ru-a11y';
  /** Russian rule metadata from ru-a11y-toolkit-core. */
  meta: RuA11yRuleMeta;
  /** CSS selector of the failing element. */
  selector: string;
  /** Full axe target list, used for highlighting. */
  targets: string[][];
  html: string;
  impact: axe.ImpactValue;
  /** axe's explanation for this particular node. */
  failureSummary?: string;
}

export interface ScanResult {
  violations: A11yViolationNode[];
  scannedAt: Date;
  counts: {
    error: number;
    warning: number;
  };
}

/**
 * Rule presets, aligned with the ESLint plugin configs:
 * - recommended: WCAG 2.1 AA;
 * - gost-aa: WCAG 2.1 AA + best practices, targeting GOST / Decree 102;
 * - strict: adds AAA.
 */
export type AxePreset = 'recommended' | 'gost-aa' | 'strict';

export const PRESET_TAGS: Readonly<Record<AxePreset, readonly string[]>> = {
  recommended: ['wcag2a', 'wcag21a', 'wcag2aa', 'wcag21aa'],
  'gost-aa': ['wcag2a', 'wcag21a', 'wcag2aa', 'wcag21aa', 'best-practice'],
  strict: ['wcag2a', 'wcag21a', 'wcag2aa', 'wcag21aa', 'wcag2aaa', 'wcag21aaa', 'best-practice'],
};

export interface AxeRunnerConfig {
  /** Elements to skip, normally the overlay itself. */
  excludeSelector?: string;
  /** Rule preset; ignored when `tags` are given. */
  preset?: AxePreset;
  /** Explicit axe-core tags, take precedence over `preset`. */
  tags?: string[];
  /** Delay before re-scanning after DOM changes. */
  debounceMs?: number;
  /** Run the ru-a11y DOM checks in addition to axe-core. */
  customRules?: boolean;
  /** Run axe-core rules. Disable to see only the ru-a11y checks. */
  axeRules?: boolean;
  /** Log every scan to the console. */
  debug?: boolean;
}

const DEFAULTS = {
  excludeSelector: '[data-ru-a11y-overlay]',
  preset: 'recommended',
  debounceMs: 1000,
  customRules: true,
  axeRules: true,
  debug: false,
} as const satisfies Required<Omit<AxeRunnerConfig, 'tags'>>;

/** Attributes whose changes can affect accessibility and trigger a re-scan. */
const OBSERVED_ATTRIBUTES = [
  'alt',
  'aria-label',
  'aria-labelledby',
  'aria-describedby',
  'aria-hidden',
  'role',
  'tabindex',
  'href',
  'lang',
  'title',
  'for',
  'id',
  'type',
  'disabled',
];

const LOG_PREFIX = '[ru-a11y-overlay]';

/** axe-core cannot run concurrently in one document. */
let isScanning = false;

function resolveTags(config: AxeRunnerConfig): string[] {
  if (config.tags && config.tags.length > 0) return config.tags;
  return [...PRESET_TAGS[config.preset ?? DEFAULTS.preset]];
}

function mapAxeViolations(violations: axe.Result[]): A11yViolationNode[] {
  return violations.flatMap((violation) =>
    violation.nodes.map((node) => {
      const selector = node.target.join(', ');

      return {
        key: `${violation.id}::${selector}`,
        ruleId: violation.id,
        source: 'axe' as const,
        meta: getRuleMeta(violation.id),
        selector,
        targets: node.target.map((target) => (Array.isArray(target) ? target : [String(target)])),
        html: node.html,
        impact: node.impact ?? violation.impact ?? 'minor',
        failureSummary: node.failureSummary,
      };
    }),
  );
}

function resolveElement(selector: string): Element | null {
  try {
    return document.querySelector(selector);
  } catch {
    return null;
  }
}

/**
 * axe and the ru-a11y checks can report the same rule on the same element with
 * different selectors (`input[src="a.png"]` vs `main > section > input`), so
 * duplicates are detected by the element itself, falling back to the selector.
 */
function dedupe(violations: A11yViolationNode[]): A11yViolationNode[] {
  const seenSelectors = new Set<string>();
  const seenElements = new Map<string, Set<Element>>();

  return violations.filter(({ ruleId, selector }) => {
    const element = resolveElement(selector);

    if (element) {
      const elements = seenElements.get(ruleId) ?? new Set<Element>();
      if (elements.has(element)) return false;
      seenElements.set(ruleId, elements.add(element));
      return true;
    }

    const key = `${ruleId}::${selector}`;
    if (seenSelectors.has(key)) return false;
    seenSelectors.add(key);
    return true;
  });
}

function countBySeverity(violations: A11yViolationNode[]): ScanResult['counts'] {
  const error = violations.filter((violation) => violation.meta.severity === 'error').length;
  return { error, warning: violations.length - error };
}

function createResult(violations: A11yViolationNode[]): ScanResult {
  return { violations, scannedAt: new Date(), counts: countBySeverity(violations) };
}

async function runAxeRules(
  config: AxeRunnerConfig,
  excludeSelector: string,
): Promise<A11yViolationNode[]> {
  if (!(config.axeRules ?? DEFAULTS.axeRules)) return [];

  // axe expects `exclude` as an array of selector arrays.
  const context: axe.ElementContext = excludeSelector ? { exclude: [[excludeSelector]] } : document;
  const results = await axe.run(context, {
    runOnly: { type: 'tag', values: resolveTags(config) },
    // Cross-origin frames make axe throw.
    iframes: false,
  });

  return mapAxeViolations(results.violations);
}

function logScan(result: ScanResult): void {
  console.groupCollapsed?.(`${LOG_PREFIX} ${result.violations.length} violation(s)`);
  console.table(
    result.violations.map(({ ruleId, source, impact, selector, meta }) => ({
      ruleId,
      source,
      impact,
      severity: meta.severity,
      selector,
    })),
  );
  console.groupEnd?.();
}

/**
 * Scans the current document.
 * Resolves with `null` when another scan is still running, so callers can keep
 * the previous result instead of flashing an empty one.
 */
export async function runAxeScan(config: AxeRunnerConfig = {}): Promise<ScanResult | null> {
  if (isScanning) return null;
  isScanning = true;

  const excludeSelector = config.excludeSelector ?? DEFAULTS.excludeSelector;

  try {
    const axeViolations = await runAxeRules(config, excludeSelector);
    const customViolations =
      (config.customRules ?? DEFAULTS.customRules)
        ? runCustomRules(document, config.preset ?? DEFAULTS.preset, excludeSelector)
        : [];

    const result = createResult(dedupe([...axeViolations, ...customViolations]));
    if (config.debug) logScan(result);
    return result;
  } catch (error) {
    console.error(`${LOG_PREFIX} scan failed:`, error);
    return createResult([]);
  } finally {
    isScanning = false;
  }
}

function isOverlayMutation(mutation: MutationRecord, excludeSelector: string): boolean {
  const target =
    mutation.target instanceof Element ? mutation.target : mutation.target.parentElement;
  return Boolean(target?.closest(excludeSelector));
}

/**
 * Re-runs the scan (debounced) whenever the page DOM changes.
 * Mutations inside the overlay are ignored. Returns a cleanup function.
 */
export function createDomObserver(
  onResult: (result: ScanResult) => void,
  config: AxeRunnerConfig = {},
): () => void {
  const excludeSelector = config.excludeSelector ?? DEFAULTS.excludeSelector;
  const debounceMs = config.debounceMs ?? DEFAULTS.debounceMs;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const scheduleScan = () => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      const result = await runAxeScan(config);
      // A scan was already in progress: try again once it is likely done.
      if (result === null) {
        scheduleScan();
        return;
      }
      onResult(result);
    }, debounceMs);
  };

  const observer = new MutationObserver((mutations) => {
    if (!mutations.every((mutation) => isOverlayMutation(mutation, excludeSelector))) {
      scheduleScan();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: OBSERVED_ATTRIBUTES,
  });

  return () => {
    observer.disconnect();
    clearTimeout(timer);
  };
}
