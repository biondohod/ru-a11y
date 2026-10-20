/**
 * Development overlay that shows accessibility violations on top of the page.
 *
 * @example
 * root.render(
 *   <>
 *     <App />
 *     {process.env.NODE_ENV === 'development' && <RuA11yOverlay />}
 *   </>
 * );
 *
 * Guarding with NODE_ENV lets bundlers drop the overlay from production builds.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  createDomObserver,
  runAxeScan,
  type A11yViolationNode,
  type AxePreset,
  type AxeRunnerConfig,
  type ScanResult,
} from './axeRunner';
import { HighlightLayer } from './ui/HighlightLayer';
import { Panel } from './ui/Panel';
import { badgeBaseConfig, toggleConfig } from './ui/styles/panelConfig';
import { COLORS } from './ui/styles/tokens';

export interface RuA11yOverlayProps {
  /** Extra selector excluded from scanning. The overlay (`[data-ru-a11y-overlay]`) is always excluded. */
  excludeSelector?: string;
  /** Rule preset, matching the ESLint plugin configs. Default: `recommended`. */
  preset?: AxePreset;
  /** Debounce before re-scanning after DOM changes, ms. Default: 1000. */
  debounceMs?: number;
  /** Re-scan automatically on DOM changes. Default: true. */
  autoScan?: boolean;
  /** Run the ru-a11y DOM checks in addition to axe-core. Default: true. */
  customRules?: boolean;
  /** Run axe-core rules. Disable to see only the ru-a11y checks. Default: true. */
  axeRules?: boolean;
  /** Log every scan to the browser console. Default: false. */
  debug?: boolean;
}

const OVERLAY_SELECTOR = '[data-ru-a11y-overlay]';

/** Gives React (including the StrictMode double mount) time to render before the first scan. */
const INITIAL_SCAN_DELAY_MS = 800;

function getToggleColor(result: ScanResult | null): string {
  if (!result) return COLORS.btnPrimary;
  if (result.counts.error > 0) return COLORS.badgeError;
  if (result.counts.warning > 0) return COLORS.badgeWarning;
  return COLORS.btnPrimary;
}

function getToggleLabel(isOpen: boolean, totalIssues: number): string {
  if (isOpen) return 'Закрыть отчёт по доступности';
  return totalIssues > 0
    ? `Открыть отчёт по доступности: ${totalIssues} нарушений`
    : 'Открыть отчёт по доступности: нарушений нет';
}

export function RuA11yOverlay({
  excludeSelector,
  preset = 'recommended',
  debounceMs = 1000,
  autoScan = true,
  customRules = true,
  axeRules = true,
  debug = false,
}: RuA11yOverlayProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [activeViolation, setActiveViolation] = useState<A11yViolationNode | null>(null);
  const isMountedRef = useRef(false);

  const config = useMemo<AxeRunnerConfig>(
    () => ({
      excludeSelector: excludeSelector
        ? `${OVERLAY_SELECTOR}, ${excludeSelector}`
        : OVERLAY_SELECTOR,
      preset,
      debounceMs,
      customRules,
      axeRules,
      debug,
    }),
    [excludeSelector, preset, debounceMs, customRules, axeRules, debug],
  );

  const applyResult = useCallback((scanResult: ScanResult) => {
    if (!isMountedRef.current) return;

    setResult(scanResult);
    setIsScanning(false);
    // Drop the selection when its violation has been fixed.
    setActiveViolation((previous) =>
      previous && scanResult.violations.some(({ key }) => key === previous.key) ? previous : null,
    );
  }, []);

  const runScan = useCallback(async () => {
    if (!isMountedRef.current) return;

    setIsScanning(true);
    const scanResult = await runAxeScan(config);
    if (scanResult) {
      applyResult(scanResult);
    } else if (isMountedRef.current) {
      setIsScanning(false);
    }
  }, [config, applyResult]);

  useEffect(() => {
    isMountedRef.current = true;
    const timer = setTimeout(runScan, INITIAL_SCAN_DELAY_MS);

    return () => {
      clearTimeout(timer);
      isMountedRef.current = false;
    };
  }, [runScan]);

  useEffect(() => {
    if (!autoScan) return undefined;
    return createDomObserver(applyResult, config);
  }, [autoScan, config, applyResult]);

  const totalIssues = result ? result.counts.error + result.counts.warning : 0;
  const toggleColor = getToggleColor(result);

  return createPortal(
    <>
      <HighlightLayer activeViolation={activeViolation} />

      {isOpen && (
        <Panel
          result={result}
          isScanning={isScanning}
          onClose={() => setIsOpen(false)}
          activeViolation={activeViolation}
          onSelectViolation={setActiveViolation}
          onRescan={runScan}
        />
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label={getToggleLabel(isOpen, totalIssues)}
        data-ru-a11y-overlay
        style={{
          ...toggleConfig,
          borderColor: totalIssues > 0 ? toggleColor : COLORS.panelBorder,
        }}
      >
        <span aria-hidden="true">♿</span>
        <span>Доступность</span>
        {isScanning ? (
          <span aria-hidden="true" style={{ fontSize: '11px', opacity: 0.7 }}>
            ⟳
          </span>
        ) : (
          totalIssues > 0 && (
            <span
              aria-hidden="true"
              style={{ ...badgeBaseConfig, backgroundColor: toggleColor, color: COLORS.badgeText }}
            >
              {totalIssues}
            </span>
          )
        )}
      </button>
    </>,
    document.body,
  );
}

export default RuA11yOverlay;
