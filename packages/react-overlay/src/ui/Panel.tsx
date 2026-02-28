/**
 * Panel.tsx — основная панель оверлея с шапкой, списком ошибок и подвалом
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
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
import type { ScanResult, A11yViolationNode } from '../axeRunner';

interface PanelProps {
  result: ScanResult | null;
  isScanning: boolean;
  onClose: () => void;
  activeViolation: A11yViolationNode | null;
  onSelectViolation: (v: A11yViolationNode | null) => void;
  onRescan: () => void;
}

/**
 * Хук для простого drag-and-drop панели.
 * Перетаскивание работает за шапку панели.
 */
function useDraggable(initialOffset = { x: 0, y: 0 }) {
  const [offset, setOffset] = useState(initialOffset);
  const dragStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    // Не начинаем drag при клике на кнопки внутри шапки
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    e.preventDefault();
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }, [offset]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragStart.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setOffset({ x: dragStart.current.ox + dx, y: dragStart.current.oy + dy });
    };

    const onMouseUp = () => {
      dragStart.current = null;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return { offset, onMouseDown };
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
  const totalErrors   = result?.counts.error   ?? 0;
  const totalWarnings = result?.counts.warning  ?? 0;

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
            onClick={onRescan}
            disabled={isScanning}
            aria-label="Запустить проверку доступности заново"
            title="Перезапустить сканирование"
            style={isScanning ? iconButtonDisabledConfig : iconButtonConfig}
          >
            {isScanning ? '⟳' : '↺'}
          </button>
          <button
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
