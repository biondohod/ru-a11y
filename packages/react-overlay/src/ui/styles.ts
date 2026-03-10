/**
 * styles.ts — обратно-совместимый реэкспорт.
 * Используйте напрямую: styles/tokens, styles/panelConfig, styles/errorConfig.
 */

export { COLORS, Z as Z_INDEX, FONTS } from './styles/tokens';
export * from './styles/panelConfig';
export * from './styles/errorConfig';

// ── Алиас panelStyles для RuA11yOverlay.tsx ──────────────────────────────────
import {
  toggleConfig,
  panelConfig,
  panelHeaderConfig,
  panelTitleConfig,
  iconButtonConfig,
  panelBodyConfig,
  panelFooterConfig,
  badgeBaseConfig,
  badgeErrorConfig,
  badgeWarningConfig,
  loadingStateConfig,
} from './styles/panelConfig';
import {
  emptyStateConfig,
  emptyIconConfig,
  emptyTitleConfig,
  emptySubtextConfig,
  groupHeaderConfig,
  itemConfig,
  itemActiveConfig,
  itemHeaderConfig,
  severityDotBaseConfig,
  itemTitleConfig,
  selectorConfig,
  descriptionConfig,
  tagListConfig,
  tagConfig,
} from './styles/errorConfig';

/** @deprecated используйте именованные конфиги из styles/panelConfig и styles/errorConfig */
export const panelStyles = {
  toggleButton: toggleConfig,
  panel: panelConfig,
  panelHeader: panelHeaderConfig,
  panelTitle: panelTitleConfig,
  panelClose: iconButtonConfig,
  panelBody: panelBodyConfig,
  panelFooter: panelFooterConfig,
  badge: badgeBaseConfig,
  badgeError: badgeErrorConfig,
  badgeWarning: badgeWarningConfig,
  loadingState: loadingStateConfig,
  emptyState: emptyStateConfig,
  emptyIcon: emptyIconConfig,
  emptyText: emptyTitleConfig,
  emptySubtext: emptySubtextConfig,
  groupHeader: groupHeaderConfig,
  errorItem: itemConfig,
  errorItemActive: itemActiveConfig,
  errorItemTitle: itemHeaderConfig,
  errorSeverityDot: severityDotBaseConfig,
  errorTitle: itemTitleConfig,
  errorSelector: selectorConfig,
  errorDescription: descriptionConfig,
  errorMeta: tagListConfig,
  errorTag: tagConfig,
};
