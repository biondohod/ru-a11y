/**
 * errorConfig.ts — стили элементов списка нарушений.
 *
 * Содержит конфиги для:
 * - Пустого состояния (emptyState*)
 * - Заголовков групп WCAG (groupHeader*)
 * - Карточки нарушения (item*, severity*, selector, details*)
 */

import type { CSSProperties } from 'react';
import { COLORS, FONTS } from './tokens';
import { badgeBaseConfig } from './panelConfig';

// ─── Пустое состояние ─────────────────────────────────────────────────────────

export const emptyStateConfig: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '32px 16px',
  textAlign: 'center',
  color: COLORS.mutedText,
};

export const emptyIconConfig: CSSProperties = {
  fontSize: '32px',
  marginBottom: '8px',
};

export const emptyTitleConfig: CSSProperties = {
  fontSize: FONTS.size,
  fontWeight: 600,
  color: COLORS.panelText,
  margin: '0 0 4px',
};

export const emptySubtextConfig: CSSProperties = {
  fontSize: FONTS.sizeSm,
  margin: 0,
};

// ─── Заголовок группы нарушений ───────────────────────────────────────────────

export const groupHeaderConfig: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 16px',
  backgroundColor: COLORS.groupHeaderBg,
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: COLORS.panelText,
  cursor: 'pointer',
  border: 'none',
  width: '100%',
  textAlign: 'left',
  fontFamily: FONTS.base,
};

export const groupHeaderRightConfig: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
};

/** Бейдж внутри заголовка группы (переиспользует базовый) */
export const groupBadgeErrorConfig: CSSProperties = {
  ...badgeBaseConfig,
  backgroundColor: COLORS.badgeError,
  color: COLORS.badgeText,
};

export const groupBadgeWarningConfig: CSSProperties = {
  ...badgeBaseConfig,
  backgroundColor: COLORS.badgeWarning,
  color: COLORS.badgeText,
};

// ─── Карточка нарушения ───────────────────────────────────────────────────────

export const itemConfig: CSSProperties = {
  padding: '10px 16px',
  borderBottom: `1px solid ${COLORS.panelBorder}`,
  cursor: 'pointer',
  transition: 'background-color 0.15s ease',
};

export const itemActiveConfig: CSSProperties = {
  ...itemConfig,
  backgroundColor: COLORS.itemHover,
};

/** Строка-заголовок внутри карточки */
export const itemHeaderConfig: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '4px',
};

// ─── Цветная точка severity ───────────────────────────────────────────────────

export const severityDotBaseConfig: CSSProperties = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  flexShrink: 0,
};

export const severityDotErrorConfig: CSSProperties = {
  ...severityDotBaseConfig,
  backgroundColor: COLORS.errorBorder,
};

export const severityDotWarningConfig: CSSProperties = {
  ...severityDotBaseConfig,
  backgroundColor: COLORS.warningBorder,
};

// ─── Заголовок и мета нарушения ───────────────────────────────────────────────

export const itemTitleConfig: CSSProperties = {
  fontWeight: 600,
  fontSize: FONTS.sizeLg,
  color: COLORS.panelText,
};

export const impactLabelConfig: CSSProperties = {
  marginLeft: 'auto',
  fontSize: '10px',
  color: COLORS.mutedText,
  flexShrink: 0,
};

// ─── CSS-селектор ─────────────────────────────────────────────────────────────

export const selectorConfig: CSSProperties = {
  display: 'block',
  marginTop: '4px',
  padding: '3px 6px',
  backgroundColor: COLORS.panelHeaderBg,
  borderRadius: '4px',
  fontSize: '13px',
  fontFamily: FONTS.mono,
  color: COLORS.codeColor,
  wordBreak: 'break-all',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: '100%',
};

// ─── Раскрываемые детали ──────────────────────────────────────────────────────

export const detailsConfig: CSSProperties = {
  marginTop: '8px',
};

export const descriptionConfig: CSSProperties = {
  fontSize: FONTS.size,
  color: COLORS.mutedText,
  lineHeight: 1.5,
  margin: '0 0 6px',
};

// ─── Блок «Как исправить» ─────────────────────────────────────────────────────

export const fixBlockConfig: CSSProperties = {
  backgroundColor: COLORS.panelBg,
  border: `1px solid ${COLORS.panelBorder}`,
  borderRadius: '6px',
  padding: '8px 10px',
  marginBottom: '8px',
};

export const fixLabelConfig: CSSProperties = {
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: COLORS.fixLabel,
  marginBottom: '4px',
};

export const fixTextConfig: CSSProperties = {
  fontSize: FONTS.size,
  color: COLORS.mutedText,
  lineHeight: 1.5,
  margin: 0,
};

// ─── Нормативные теги ─────────────────────────────────────────────────────────

export const tagListConfig: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '4px',
  marginTop: '6px',
};

export const tagConfig: CSSProperties = {
  display: 'inline-block',
  padding: '1px 6px',
  borderRadius: '4px',
  fontSize: FONTS.sizeSm,
  fontWeight: 600,
  backgroundColor: COLORS.groupHeaderBg,
  color: COLORS.link,
  border: `1px solid ${COLORS.panelBorder}`,
};

// ─── Кнопка «Подробнее / Скрыть» ─────────────────────────────────────────────

export const expandButtonConfig: CSSProperties = {
  display: 'block',
  marginTop: '6px',
  background: 'none',
  border: 'none',
  color: COLORS.link,
  cursor: 'pointer',
  fontSize: FONTS.sizeXs,
  padding: 0,
  textAlign: 'left',
  fontFamily: FONTS.base,
};
