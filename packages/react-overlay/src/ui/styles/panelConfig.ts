/**
 * panelConfig.ts — стили панели, кнопки-переключателя (FAB), шапки, подвала и бейджей.
 *
 * Каждый объект — независимый конфиг одного UI-элемента.
 * Используется в Panel.tsx как `style={panelConfig.panel}` и т.д.
 */

import type { CSSProperties } from 'react';
import { COLORS, FONTS, Z } from './tokens';

// ─── Кнопка-переключатель (FAB) ────────────────────────────────────────────────

export const toggleConfig: CSSProperties = {
  position: 'fixed',
  bottom: '24px',
  right: '24px',
  zIndex: Z.toggle,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 16px',
  backgroundColor: COLORS.panelBg,
  color: COLORS.panelText,
  border: `1px solid ${COLORS.panelBorder}`,
  borderRadius: '9999px',
  cursor: 'pointer',
  fontSize: FONTS.size,
  fontFamily: FONTS.base,
  fontWeight: 600,
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.5)',
  transition: 'all 0.2s ease',
  outline: 'none',
  userSelect: 'none',
};

// ─── Основная панель ───────────────────────────────────────────────────────────

export const panelConfig: CSSProperties = {
  position: 'fixed',
  // Якорим панель сверху — при раскрытии групп она растёт ВНИЗ,
  // шапка всегда остаётся видимой и доступной для drag.
  top: '24px',
  right: '24px',
  zIndex: Z.panel,
  width: '400px',
  maxWidth: 'calc(100vw - 48px)',
  maxHeight: 'calc(100vh - 48px)',
  backgroundColor: COLORS.panelBg,
  color: COLORS.panelText,
  border: `1px solid ${COLORS.panelBorder}`,
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  fontFamily: FONTS.base,
  fontSize: FONTS.size,
};

// ─── Шапка панели ─────────────────────────────────────────────────────────────

export const panelHeaderConfig: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  backgroundColor: COLORS.panelHeaderBg,
  borderBottom: `1px solid ${COLORS.panelBorder}`,
  flexShrink: 0,
  cursor: 'grab',
  userSelect: 'none',
};

export const panelTitleConfig: CSSProperties = {
  margin: 0,
  fontSize: FONTS.sizeLg,
  fontWeight: 700,
  color: COLORS.panelText,
};

// ─── Кнопки в шапке (закрыть / обновить) ─────────────────────────────────────

export const panelHeaderActionsConfig: CSSProperties = {
  display: 'flex',
  gap: '4px',
};

export const iconButtonConfig: CSSProperties = {
  background: 'none',
  border: 'none',
  color: COLORS.panelText,
  cursor: 'pointer',
  padding: '4px',
  lineHeight: 1,
  fontSize: FONTS.sizeLg,
  opacity: 0.7,
  borderRadius: '4px',
};

export const iconButtonDisabledConfig: CSSProperties = {
  ...iconButtonConfig,
  opacity: 0.4,
  cursor: 'not-allowed',
};

// ─── Тело панели ──────────────────────────────────────────────────────────────

export const panelBodyConfig: CSSProperties = {
  overflowY: 'auto',
  flex: 1,
  padding: '8px 0',
};

// ─── Подвал ───────────────────────────────────────────────────────────────────

export const panelFooterConfig: CSSProperties = {
  padding: '10px 16px',
  borderTop: `1px solid ${COLORS.panelBorder}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexShrink: 0,
  fontSize: FONTS.sizeSm,
  color: COLORS.separator,
};

// ─── Бейджи ───────────────────────────────────────────────────────────────────

/** Базовые стили бейджа — применяются всегда */
export const badgeBaseConfig: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '20px',
  height: '20px',
  padding: '0 6px',
  borderRadius: '9999px',
  fontSize: FONTS.sizeSm,
  fontWeight: 700,
  lineHeight: 1,
};

export const badgeErrorConfig: CSSProperties = {
  ...badgeBaseConfig,
  backgroundColor: COLORS.badgeError,
  color: COLORS.badgeText,
};

export const badgeWarningConfig: CSSProperties = {
  ...badgeBaseConfig,
  backgroundColor: COLORS.badgeWarning,
  color: COLORS.badgeText,
};

// ─── Состояния панели ─────────────────────────────────────────────────────────

export const loadingStateConfig: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  gap: '8px',
  color: COLORS.mutedText,
  fontSize: FONTS.sizeSm,
};


