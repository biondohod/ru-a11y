/**
 * styles.ts — инлайн-стили для компонентов оверлея
 * Используем объекты стилей (CSS-in-JS без зависимостей) для изоляции от стилей приложения.
 * Все стили используют высокую специфичность через inline styles.
 */

import type { CSSProperties } from 'react';

/** Цветовая палитра оверлея */
export const COLORS = {
  errorBg: '#fef2f2',
  errorBorder: '#ef4444',
  errorText: '#991b1b',
  warningBg: '#fffbeb',
  warningBorder: '#f59e0b',
  warningText: '#92400e',
  panelBg: '#1e1e2e',
  panelText: '#cdd6f4',
  panelBorder: '#313244',
  panelHeader: '#181825',
  btnPrimary: '#89b4fa',
  btnPrimaryText: '#1e1e2e',
  badgeError: '#f38ba8',
  badgeWarning: '#fab387',
  badgeText: '#1e1e2e',
  highlightError: 'rgba(239, 68, 68, 0.25)',
  highlightWarning: 'rgba(245, 158, 11, 0.25)',
  highlightErrorBorder: '#ef4444',
  highlightWarningBorder: '#f59e0b',
  groupHeader: '#313244',
  itemHover: '#2a2a3e',
  link: '#89dceb',
  separator: '#45475a',
} as const;

/** Z-index оверлея (высокое значение для отображения поверх всего) */
export const Z_INDEX = {
  panel: 999999,
  toggle: 999998,
  highlight: 999997,
  tooltip: 1000000,
} as const;

export const panelStyles: Record<string, CSSProperties> = {
  /** Кнопка-переключатель (FAB) в правом нижнем углу */
  toggleButton: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: Z_INDEX.toggle,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: COLORS.panelBg,
    color: COLORS.panelText,
    border: `1px solid ${COLORS.panelBorder}`,
    borderRadius: '9999px',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontWeight: 600,
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.5)',
    transition: 'all 0.2s ease',
    outline: 'none',
    userSelect: 'none',
  },

  /** Основная панель */
  panel: {
    position: 'fixed',
    bottom: '80px',
    right: '24px',
    zIndex: Z_INDEX.panel,
    width: '400px',
    maxWidth: 'calc(100vw - 48px)',
    maxHeight: 'calc(100vh - 120px)',
    backgroundColor: COLORS.panelBg,
    color: COLORS.panelText,
    border: `1px solid ${COLORS.panelBorder}`,
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '13px',
  },

  /** Шапка панели */
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: COLORS.panelHeader,
    borderBottom: `1px solid ${COLORS.panelBorder}`,
    flexShrink: 0,
  },

  panelTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 700,
    color: COLORS.panelText,
  },

  panelClose: {
    background: 'none',
    border: 'none',
    color: COLORS.panelText,
    cursor: 'pointer',
    padding: '4px',
    lineHeight: 1,
    fontSize: '16px',
    opacity: 0.7,
    borderRadius: '4px',
  },

  /** Зона прокрутки с содержимым */
  panelBody: {
    overflowY: 'auto',
    flex: 1,
    padding: '8px 0',
  },

  /** Подвал с кнопками действий */
  panelFooter: {
    padding: '10px 16px',
    borderTop: `1px solid ${COLORS.panelBorder}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
    fontSize: '11px',
    color: COLORS.separator,
  },

  /** Бейдж с числом ошибок */
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '20px',
    height: '20px',
    padding: '0 6px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: 700,
    lineHeight: 1,
  },

  badgeError: {
    backgroundColor: COLORS.badgeError,
    color: COLORS.badgeText,
  },

  badgeWarning: {
    backgroundColor: COLORS.badgeWarning,
    color: COLORS.badgeText,
  },

  /** Группа нарушений */
  groupHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 16px',
    backgroundColor: COLORS.groupHeader,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: COLORS.separator,
    cursor: 'pointer',
    border: 'none',
    width: '100%',
    textAlign: 'left',
  },

  /** Один элемент нарушения */
  errorItem: {
    padding: '10px 16px',
    borderBottom: `1px solid ${COLORS.panelBorder}`,
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },

  errorItemActive: {
    backgroundColor: COLORS.itemHover,
  },

  errorItemTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },

  errorSeverityDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },

  errorTitle: {
    fontWeight: 600,
    fontSize: '13px',
    color: COLORS.panelText,
  },

  errorDescription: {
    fontSize: '12px',
    color: '#a6adc8',
    lineHeight: 1.5,
    marginBottom: '6px',
  },

  errorMeta: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '4px',
    marginTop: '6px',
  },

  errorTag: {
    display: 'inline-block',
    padding: '1px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 600,
    backgroundColor: COLORS.groupHeader,
    color: COLORS.link,
    border: `1px solid ${COLORS.panelBorder}`,
  },

  errorSelector: {
    display: 'block',
    marginTop: '4px',
    padding: '3px 6px',
    backgroundColor: COLORS.panelHeader,
    borderRadius: '4px',
    fontSize: '11px',
    color: '#89b4fa',
    fontFamily: '"Fira Code", "Consolas", monospace',
    wordBreak: 'break-all' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    maxWidth: '100%',
  },

  /** Пустое состояние */
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 16px',
    textAlign: 'center',
    color: '#a6adc8',
  },

  emptyIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },

  emptyText: {
    fontSize: '14px',
    fontWeight: 600,
    color: COLORS.panelText,
    marginBottom: '4px',
  },

  emptySubtext: {
    fontSize: '12px',
  },

  /** Индикатор загрузки */
  loadingState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    gap: '8px',
    color: '#a6adc8',
    fontSize: '12px',
  },
};

