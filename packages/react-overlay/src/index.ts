/**
 * src/index.ts — точка входа пакета ru-a11y-toolkit-overlay
 *
 * Экспортирует:
 * - RuA11yOverlay — основной React-компонент оверлея
 * - RU_A11Y_RULES — маппинг правил с русскоязычными описаниями
 * - getRuleMeta — утилита для получения метаданных правила
 * - WCAG_PRINCIPLES — справочник принципов WCAG на русском
 * - Типы: RuA11yRuleMeta, A11yViolationNode, ScanResult, RuA11yOverlayProps
 */

// Основной компонент
export { RuA11yOverlay, type RuA11yOverlayProps } from './RuA11yOverlay';
export { RuA11yOverlay as default } from './RuA11yOverlay';

// Маппинг правил (для расширенного использования и интеграции с eslint-пакетом)
export {
  RU_A11Y_RULES,
  WCAG_PRINCIPLES,
  getRuleMeta,
  type RuA11yRuleMeta,
} from './mapping/rulesMap';

// Типы axe-runner (для расширенного использования)
export type { A11yViolationNode, ScanResult, AxeRunnerConfig } from './axeRunner';

