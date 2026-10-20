/** Overlay panel: header with counters, the violation list and a footer. */

import {
  panelConfig,
  panelHeaderConfig,
  panelTitleConfig,
  panelHeaderActionsConfig,
  iconButtonConfig,
  iconButtonDisabledConfig,
  panelBodyConfig,
  panelFooterConfig,
  badgeErrorConfig,
  badgeWarningConfig,
  loadingStateConfig,
} from './styles/panelConfig';
import { COLORS } from './styles/tokens';
import { ErrorList } from './ErrorList';
import type { A11yViolationNode, ScanResult } from '../axeRunner';
import { useDraggable } from './useDraggable';

interface PanelProps {
  result: ScanResult | null;
  isScanning: boolean;
  onClose: () => void;
  activeViolation: A11yViolationNode | null;
  onSelectViolation: (v: A11yViolationNode | null) => void;
  onRescan: () => void;
}

export function Panel({
  result,
  isScanning,
  onClose,
  activeViolation,
  onSelectViolation,
  onRescan,
}: PanelProps) {
  const { offset, onMouseDown } = useDraggable();
  const totalErrors = result?.counts.error ?? 0;
  const totalWarnings = result?.counts.warning ?? 0;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Панель проверки доступности ru-a11y-toolkit"
      data-ru-a11y-overlay
      style={{ ...panelConfig, transform: `translate(${offset.x}px, ${offset.y}px)` }}
    >
      {/* Шапка */}
      <div style={panelHeaderConfig} onMouseDown={onMouseDown} title="Перетащите панель">
        <h2 style={panelTitleConfig}>
          <span aria-hidden="true">♿ </span>
          Доступность
          {result && (
            <span aria-label={`${totalErrors} ошибок, ${totalWarnings} предупреждений`}>
              {totalErrors > 0 && (
                <span style={{ ...badgeErrorConfig, marginLeft: '8px' }} aria-hidden="true">
                  {totalErrors}
                </span>
              )}
              {totalWarnings > 0 && (
                <span style={{ ...badgeWarningConfig, marginLeft: '4px' }} aria-hidden="true">
                  {totalWarnings}
                </span>
              )}
            </span>
          )}
        </h2>

        <div style={panelHeaderActionsConfig}>
          <button
            type="button"
            onClick={onRescan}
            disabled={isScanning}
            aria-label="Запустить проверку доступности заново"
            title="Перезапустить сканирование"
            style={isScanning ? iconButtonDisabledConfig : iconButtonConfig}
          >
            {isScanning ? '⟳' : '↺'}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть панель проверки доступности"
            style={iconButtonConfig}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Тело */}
      <div style={panelBodyConfig}>
        {isScanning && !result ? (
          <div style={loadingStateConfig} role="status" aria-live="polite">
            <span aria-hidden="true">⟳</span>
            Идёт проверка доступности…
          </div>
        ) : (
          <ErrorList
            violations={result?.violations ?? []}
            activeViolation={activeViolation}
            onSelect={onSelectViolation}
          />
        )}
      </div>

      {/* Подвал */}
      <div style={panelFooterConfig}>
        <span>
          {result
            ? `Проверено: ${result.scannedAt.toLocaleTimeString('ru-RU')}`
            : 'Ожидание сканирования…'}
        </span>
        <a
          href="https://github.com/biondohod/ru-a11y"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: COLORS.link, textDecoration: 'none' }}
          aria-label="Документация ru-a11y-toolkit (открывается в новой вкладке)"
        >
          ru-a11y-toolkit
        </a>
      </div>
    </div>
  );
}
