/**
 * tokens.ts — дизайн-токены оверлея: цвета, z-index, типографика.
 * Единственный источник правды для всех значений.
 * Правьте здесь — изменения автоматически применятся везде.
 */

import type { CSSProperties } from 'react';

// ─── Цвета ────────────────────────────────────────────────────────────────────

export const COLORS = {
  // Панель
  panelBg:        '#1e1e2e',
  panelText:      '#cdd6f4',
  panelBorder:    '#313244',
  panelHeaderBg:  '#181825',

  // Severity
  errorBorder:    '#ef4444',
  warningBorder:  '#f59e0b',
  errorBg:        'rgba(239, 68, 68, 0.25)',
  warningBg:      'rgba(245, 158, 11, 0.25)',

  // Кнопка-переключатель
  btnPrimary:     '#89b4fa',
  btnPrimaryText: '#1e1e2e',

  // Бейджи
  badgeError:     '#f38ba8',
  badgeWarning:   '#fab387',
  badgeText:      '#1e1e2e',

  // Прочее
  groupHeaderBg:  '#313244',
  itemHover:      '#2a2a3e',
  link:           '#89dceb',
  separator:      '#45475a',
  mutedText:      '#a6adc8',
  codeColor:      '#89b4fa',
  fixLabel:       '#fab387',
} as const;

// ─── Z-index ──────────────────────────────────────────────────────────────────

export const Z = {
  panel:     999999,
  toggle:    999998,
  highlight: 999997,
  tooltip:   1000000,
} as const;

// ─── Типографика ──────────────────────────────────────────────────────────────

export const FONTS = {
  base:   'system-ui, -apple-system, sans-serif',
  mono:   '"Fira Code", "Consolas", monospace',
  size:   '14px',
  sizeSm: '12px',
  sizeXs: '11px',
  sizeLg: '16px',
} as const;

// ─── Вспомогательные типы ─────────────────────────────────────────────────────

export type Styles = Record<string, CSSProperties>;

