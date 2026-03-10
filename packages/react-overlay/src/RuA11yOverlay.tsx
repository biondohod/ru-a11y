/**
 * RuA11yOverlay.tsx — главный компонент оверлея проверки доступности
 *
 * Интеграция:
 * ```tsx
 * import { RuA11yOverlay } from 'ru-a11y-toolkit-overlay';
 *
 * root.render(
 *   <React.StrictMode>
 *     <App />
 *     {process.env.NODE_ENV === 'development' && <RuA11yOverlay />}
 *   </React.StrictMode>
 * );
 * ```
 *
 * Компонент НЕ рендерится в production-сборке — проверка process.env.NODE_ENV
 * гарантирует это при бандлинге (tree-shaking).
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  type A11yViolationNode,
  type AxePreset,
  createDomObserver,
  runAxeScan,
  type ScanResult,
} from './axeRunner';
import { Panel } from './ui/Panel';
import { HighlightLayer } from './ui/HighlightLayer';
import { COLORS, panelStyles } from './ui/styles';

export interface RuA11yOverlayProps {
  /**
   * Дополнительный CSS-селектор для исключения из сканирования.
   * По умолчанию исключается сам оверлей ([data-ru-a11y-overlay]).
   */
  excludeSelector?: string;

  /**
   * Пресет правил проверки. Соответствует пресетам eslint-preset:
   * - 'recommended' (по умолчанию): WCAG 2.1 AA — базовые критические проверки
   * - 'gost-aa': WCAG 2.1 AA + best-practice, ориентирован на ГОСТ/Постановление №102
   * - 'strict': максимальный — включает AAA и экспериментальные правила
   */
  preset?: AxePreset;

  /**
   * Задержка дебаунса в мс перед повторным сканированием после изменений DOM.
   * По умолчанию: 1000 мс.
   */
  debounceMs?: number;

  /**
   * Автоматически запускать сканирование при изменениях DOM через MutationObserver.
   * По умолчанию: true.
   */
  autoScan?: boolean;
}

/**
 * Главный компонент оверлея.
 *
 * Жизненный цикл:
 * 1. При монтировании — запускает первоначальное сканирование axe-core
 * 2. Если autoScan=true — подключает MutationObserver для реактивного ресканирования
 * 3. При размонтировании — отключает наблюдатель и отменяет ожидающие операции
 */
export function RuA11yOverlay({
  excludeSelector,
  preset = 'recommended',
  debounceMs = 1000,
  autoScan = true,
}: RuA11yOverlayProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [activeViolation, setActiveViolation] = useState<A11yViolationNode | null>(null);
  const isMountedRef = useRef(true);

  const axeConfig = {
    excludeSelector: excludeSelector ?? '[data-ru-a11y-overlay]',
    preset,
    debounceMs,
  };

  const handleScanResult = useCallback((scanResult: ScanResult) => {
    if (!isMountedRef.current) return;
    setResult(scanResult);
    setIsScanning(false);
    // Если активное нарушение исчезло — сбрасываем выделение
    setActiveViolation((prev) => {
      if (!prev) return null;
      const stillExists = scanResult.violations.some((v) => v.key === prev.key);
      return stillExists ? prev : null;
    });
  }, []);

  const runScan = useCallback(async () => {
    if (!isMountedRef.current) return;
    setIsScanning(true);
    const scanResult = await runAxeScan(axeConfig);
    handleScanResult(scanResult);
  }, [axeConfig, handleScanResult]);

  // Первоначальное сканирование после монтирования компонента
  useEffect(() => {
    // Сбрасываем флаг при каждом монтировании (важно для React StrictMode)
    isMountedRef.current = true;

    // Задержка 800мс даёт React (включая StrictMode double-mount) и браузеру
    // завершить рендер перед первым сканированием.
    const timer = setTimeout(() => {
      runScan();
    }, 800);

    return () => {
      clearTimeout(timer);
      isMountedRef.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Подключение MutationObserver для автоматического ресканирования
  useEffect(() => {
    if (!autoScan) return;

    return createDomObserver(handleScanResult, axeConfig);
  }, [autoScan]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalIssues = (result?.counts.error ?? 0) + (result?.counts.warning ?? 0);
  const errorCount = result?.counts.error ?? 0;
  const warningCount = result?.counts.warning ?? 0;

  // Определяем цвет кнопки-переключателя на основе наличия ошибок
  const toggleColor =
    errorCount > 0 ? COLORS.badgeError : warningCount > 0 ? COLORS.badgeWarning : COLORS.btnPrimary;

  return createPortal(
    <>
      {/* Слой подсветки */}
      <HighlightLayer activeViolation={activeViolation} allViolations={result?.violations ?? []} />

      {/* Панель с нарушениями */}
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

      {/* Кнопка-переключатель (FAB) */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-label={
          isOpen
            ? 'Закрыть отчёт по доступности'
            : `Открыть отчёт по доступности${totalIssues > 0 ? `: ${totalIssues} нарушений` : ': нарушений нет'}`
        }
        data-ru-a11y-overlay
        style={{
          ...panelStyles.toggleButton,
          borderColor: totalIssues > 0 ? toggleColor : COLORS.panelBorder,
        }}
      >
        <span aria-hidden="true">♿</span>
        <span>Доступность</span>
        {isScanning ? (
          <span aria-hidden="true" style={{ fontSize: '11px', opacity: 0.7 }}>
            ⟳
          </span>
        ) : totalIssues > 0 ? (
          <span
            style={{
              ...panelStyles.badge,
              backgroundColor: toggleColor,
              color: COLORS.badgeText,
            }}
            aria-hidden="true"
          >
            {totalIssues}
          </span>
        ) : null}
      </button>
    </>,
    document.body,
  );
}

export default RuA11yOverlay;
