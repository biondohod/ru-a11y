/**
 * Styles of the panel, the toggle button (FAB), header, footer and badges.
 *
 * Each object styles exactly one UI element.
 */

import type { CSSProperties } from 'react';
import { COLORS, FONTS, Z } from './tokens';

// ─── Toggle button (FAB) ─────────────────────────────────────────────────────

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

// ─── Panel ───────────────────────────────────────────────────────────────────

export const panelConfig: CSSProperties = {
  position: 'fixed',
  // Anchored to the top: expanding groups grows the panel downwards,
  // so the header (the drag handle) always stays visible.
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

// ─── Panel header ────────────────────────────────────────────────────────────

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

// ─── Header buttons (close / rescan) ─────────────────────────────────────────

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

// ─── Panel body ──────────────────────────────────────────────────────────────

export const panelBodyConfig: CSSProperties = {
  overflowY: 'auto',
  flex: 1,
  padding: '8px 0',
};

// ─── Footer ──────────────────────────────────────────────────────────────────

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

// ─── Badges ──────────────────────────────────────────────────────────────────

/** Base badge style. */
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

// ─── Panel states ────────────────────────────────────────────────────────────

export const loadingStateConfig: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  gap: '8px',
  color: COLORS.mutedText,
  fontSize: FONTS.sizeSm,
};
