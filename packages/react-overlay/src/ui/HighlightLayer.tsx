/**
 * HighlightLayer.tsx — подсветка проблемных элементов через CSS-анимацию
 *
 * При выборе нарушения: плавный скролл до элемента + временная CSS-анимация
 * через outline/box-shadow прямо на DOM-элементе. Не использует fixed-позиционирование,
 * поэтому корректно работает при скролле.
 */

import { useEffect, useRef } from 'react';
import { COLORS } from './styles';
import type { A11yViolationNode } from '../axeRunner';

const STYLE_ID = 'ru-a11y-highlight-styles';
const HIGHLIGHT_CLASS_ERROR = 'ru-a11y-highlight-error';
const HIGHLIGHT_CLASS_WARNING = 'ru-a11y-highlight-warning';
const HIGHLIGHT_DURATION_MS = 2000;

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes ru-a11y-pulse-error {
      0%   { outline: 3px solid ${COLORS.highlightErrorBorder}; box-shadow: 0 0 0 4px ${COLORS.highlightError}, 0 0 12px 4px ${COLORS.highlightErrorBorder}88; }
      50%  { outline: 3px solid ${COLORS.highlightErrorBorder}; box-shadow: 0 0 0 6px ${COLORS.highlightError}, 0 0 20px 6px ${COLORS.highlightErrorBorder}88; }
      100% { outline: 3px solid transparent; box-shadow: none; }
    }
    @keyframes ru-a11y-pulse-warning {
      0%   { outline: 3px solid ${COLORS.highlightWarningBorder}; box-shadow: 0 0 0 4px ${COLORS.highlightWarning}, 0 0 12px 4px ${COLORS.highlightWarningBorder}88; }
      50%  { outline: 3px solid ${COLORS.highlightWarningBorder}; box-shadow: 0 0 0 6px ${COLORS.highlightWarning}, 0 0 20px 6px ${COLORS.highlightWarningBorder}88; }
      100% { outline: 3px solid transparent; box-shadow: none; }
    }
    .${HIGHLIGHT_CLASS_ERROR} {
      animation: ru-a11y-pulse-error ${HIGHLIGHT_DURATION_MS}ms ease-out forwards !important;
      outline-offset: 3px !important;
    }
    .${HIGHLIGHT_CLASS_WARNING} {
      animation: ru-a11y-pulse-warning ${HIGHLIGHT_DURATION_MS}ms ease-out forwards !important;
      outline-offset: 3px !important;
    }
  `;
  document.head.appendChild(style);
}

function findElement(violation: A11yViolationNode): Element | null {
  // Пробуем все варианты селекторов по очереди
  const selectors = [
    violation.targets[0]?.[0],
    violation.selector,
  ].filter(Boolean) as string[];

  for (const sel of selectors) {
    try {
      const el = document.querySelector(sel);
      if (el) return el;
    } catch {
      // невалидный селектор — пропускаем
    }
  }
  return null;
}

export function scrollAndHighlight(violation: A11yViolationNode | null) {
  if (!violation) return;

  injectStyles();

  const el = findElement(violation);
  if (!el) return;

  // Убираем классы со всех элементов (на случай предыдущей подсветки)
  document.querySelectorAll(`.${HIGHLIGHT_CLASS_ERROR}, .${HIGHLIGHT_CLASS_WARNING}`)
    .forEach(e => {
      e.classList.remove(HIGHLIGHT_CLASS_ERROR, HIGHLIGHT_CLASS_WARNING);
    });

  // Плавный скролл до элемента
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Небольшая задержка чтобы скролл начался раньше подсветки
  setTimeout(() => {
    // Убираем снова на случай если за время задержки что-то изменилось
    document.querySelectorAll(`.${HIGHLIGHT_CLASS_ERROR}, .${HIGHLIGHT_CLASS_WARNING}`)
      .forEach(e => e.classList.remove(HIGHLIGHT_CLASS_ERROR, HIGHLIGHT_CLASS_WARNING));

    const cls = violation.meta.severity === 'error' ? HIGHLIGHT_CLASS_ERROR : HIGHLIGHT_CLASS_WARNING;
    el.classList.add(cls);

    // Убираем класс после завершения анимации
    setTimeout(() => {
      el.classList.remove(cls);
    }, HIGHLIGHT_DURATION_MS + 100);
  }, 300);
}

interface HighlightLayerProps {
  activeViolation: A11yViolationNode | null;
  allViolations?: A11yViolationNode[];
}

/**
 * Компонент-наблюдатель: реагирует на смену activeViolation и запускает scroll+highlight.
 * Не рендерит никаких DOM-элементов.
 */
export function HighlightLayer({ activeViolation }: HighlightLayerProps) {
  const prevKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!activeViolation) return;
    // Не повторяем если кликнули на то же нарушение
    if (activeViolation.key === prevKeyRef.current) return;
    prevKeyRef.current = activeViolation.key;
    scrollAndHighlight(activeViolation);
  }, [activeViolation]);

  // Чистим подсветку при размонтировании
  useEffect(() => {
    return () => {
      document.querySelectorAll(`.${HIGHLIGHT_CLASS_ERROR}, .${HIGHLIGHT_CLASS_WARNING}`)
        .forEach(e => e.classList.remove(HIGHLIGHT_CLASS_ERROR, HIGHLIGHT_CLASS_WARNING));
    };
  }, []);

  return null;
}
