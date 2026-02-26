/**
 * HighlightLayer.tsx — слой подсветки проблемных элементов на странице
 *
 * Рисует цветные обводки вокруг элементов с нарушениями доступности.
 * Использует React-портал для рендеринга поверх всего содержимого.
 * Позиции обновляются при изменении активного элемента и при ресайзе окна.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { COLORS, Z_INDEX } from './styles';
import type { A11yViolationNode } from '../axeRunner';

interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
  severity: 'error' | 'warning';
  key: string;
}

interface HighlightLayerProps {
  /** Нарушение, которое нужно подсветить (null — снять все подсветки) */
  activeViolation: A11yViolationNode | null;
  /** Все нарушения для показа всех меток одновременно */
  allViolations?: A11yViolationNode[];
  /** Показывать все нарушения одновременно или только активное */
  showAll?: boolean;
}

/**
 * Находит DOM-элемент по CSS-селектору и возвращает его bounding rect
 */
function getElementRect(selector: string): DOMRect | null {
  try {
    const el = document.querySelector(selector);
    if (!el) return null;
    return el.getBoundingClientRect();
  } catch {
    return null;
  }
}

function HighlightBox({ rect }: { rect: HighlightRect }) {
  const isError = rect.severity === 'error';
  const color = isError ? COLORS.highlightErrorBorder : COLORS.highlightWarningBorder;
  const bg = isError ? COLORS.highlightError : COLORS.highlightWarning;

  return (
    <div
      style={{
        position: 'fixed',
        top: rect.top - 2,
        left: rect.left - 2,
        width: rect.width + 4,
        height: rect.height + 4,
        border: `2px solid ${color}`,
        backgroundColor: bg,
        zIndex: Z_INDEX.highlight,
        pointerEvents: 'none',
        borderRadius: '3px',
        boxShadow: `0 0 0 1px ${color}33`,
        transition: 'all 0.2s ease',
      }}
      aria-hidden="true"
    />
  );
}

export function HighlightLayer({ activeViolation, allViolations = [], showAll = false }: HighlightLayerProps) {
  const [rects, setRects] = useState<HighlightRect[]>([]);
  const rafRef = useRef<number | null>(null);

  const updateRects = useCallback(() => {
    const violations = showAll
      ? allViolations
      : activeViolation
        ? [activeViolation]
        : [];

    const newRects: HighlightRect[] = [];

    for (const v of violations) {
      // Берём первый селектор из targets (обычно это основной элемент)
      const selector = v.targets[0]?.[0] ?? v.selector;
      const domRect = getElementRect(selector);

      if (domRect && domRect.width > 0 && domRect.height > 0) {
        newRects.push({
          top: domRect.top + window.scrollY,
          left: domRect.left + window.scrollX,
          width: domRect.width,
          height: domRect.height,
          severity: v.meta.severity,
          key: v.key,
        });
      }
    }

    setRects(newRects);
  }, [activeViolation, allViolations, showAll]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(updateRects);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [updateRects]);

  // Обновляем позиции при ресайзе и скролле
  useEffect(() => {
    const handleResize = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateRects);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [updateRects]);

  if (rects.length === 0) return null;

  return createPortal(
    <>
      {rects.map((rect) => (
        <HighlightBox key={rect.key} rect={rect} />
      ))}
    </>,
    document.body,
  );
}

