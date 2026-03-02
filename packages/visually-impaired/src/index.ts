/**
 * ru-a11y-toolkit-visually-impaired
 *
 * Модуль повышенной читабельности для пользователей с нарушениями зрения.
 * Часть монорепозитория ru-a11y-toolkit.
 *
 * Публичный API:
 * - useVisuallyImpaired — React-хук для управления режимом
 * - UseVisuallyImpairedReturn — тип возвращаемого значения хука
 *
 * CSS-стили подключаются отдельно:
 * import 'ru-a11y-toolkit-visually-impaired/styles/visually-impaired.css';
 */
export { useVisuallyImpaired } from './useVisuallyImpaired';
export type { UseVisuallyImpairedReturn } from './useVisuallyImpaired';

