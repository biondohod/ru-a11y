/**
 * HighlightLayer.tsx — подсветка проблемных элементов через CSS-анимацию
 */

import { useEffect, useRef } from 'react';
import { COLORS } from './styles/tokens';
import type { A11yViolationNode } from '../axeRunner';

const STYLE_ID = 'ru-a11y-highlight-styles';
const HIGHLIGHT_CLASS_ERROR   = 'ru-a11y-highlight-error';
const HIGHLIGHT_CLASS_WARNING = 'ru-a11y-highlight-warning';
const HIGHLIGHT_DURATION_MS   = 2000;

function buildHighlightCss(): string {
  const e  = COLORS.errorBorder;
  const eBg = COLORS.errorBg;
  const w  = COLORS.warningBorder;
  const wBg = COLORS.warningBg;

  return `
    @keyframes ru-a11y-pulse-error {
      0%   { outline: 3px solid ${e}; box-shadow: 0 0 0 4px ${eBg}, 0 0 12px 4px ${e}88; }
      50%  { outline: 3px solid ${e}; box-shadow: 0 0 0 6px ${eBg}, 0 0 20px 6px ${e}88; }
      100% { outline: 3px solid transparent; box-shadow: none; }
    }
    @keyframes ru-a11y-pulse-warning {
      0%   { outline: 3px solid ${w}; box-shadow: 0 0 0 4px ${wBg}, 0 0 12px 4px ${w}88; }
      50%  { outline: 3px solid ${w}; box-shadow: 0 0 0 6px ${wBg}, 0 0 20px 6px ${w}88; }
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
}

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = buildHighlightCss();
  document.head.appendChild(style);
}

function findElement(violation: A11yViolationNode): Element | null {
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

  document.querySelectorAll(`.${HIGHLIGHT_CLASS_ERROR}, .${HIGHLIGHT_CLASS_WARNING}`)
    .forEach(e => e.classList.remove(HIGHLIGHT_CLASS_ERROR, HIGHLIGHT_CLASS_WARNING));

  el.scrollIntoView({ behavior: 'smooth', block: 'center' });

  setTimeout(() => {
    document.querySelectorAll(`.${HIGHLIGHT_CLASS_ERROR}, .${HIGHLIGHT_CLASS_WARNING}`)
      .forEach(e => e.classList.remove(HIGHLIGHT_CLASS_ERROR, HIGHLIGHT_CLASS_WARNING));

    const cls = violation.meta.severity === 'error' ? HIGHLIGHT_CLASS_ERROR : HIGHLIGHT_CLASS_WARNING;
    el.classList.add(cls);

    setTimeout(() => {
      el.classList.remove(cls);
    }, HIGHLIGHT_DURATION_MS + 100);
  }, 300);
}

interface HighlightLayerProps {
  activeViolation: A11yViolationNode | null;
  allViolations?: A11yViolationNode[];
}

export function HighlightLayer({ activeViolation }: HighlightLayerProps) {
  const prevKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!activeViolation) return;
    if (activeViolation.key === prevKeyRef.current) return;
    prevKeyRef.current = activeViolation.key;
    scrollAndHighlight(activeViolation);
  }, [activeViolation]);

  useEffect(() => {
    return () => {
      document.querySelectorAll(`.${HIGHLIGHT_CLASS_ERROR}, .${HIGHLIGHT_CLASS_WARNING}`)
        .forEach(e => e.classList.remove(HIGHLIGHT_CLASS_ERROR, HIGHLIGHT_CLASS_WARNING));
    };
  }, []);

  return null;
}
