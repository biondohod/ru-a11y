/**
 * Значения по умолчанию для запуска CLI-аудита.
 */
export const DEFAULT_CONFIG = {
  standard: 'gost-aa',
  format: 'console',
  timeoutMs: 30000,
  concurrency: 2,
  maxIssues: Number.POSITIVE_INFINITY,
  outputDir: 'ru-a11y-reports',
} as const;

export const STANDARD_TO_WCAG_TAGS: Record<string, string[]> = {
  'gost-a': ['wcag2a', 'wcag21a'],
  'gost-aa': ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
  'gost-aaa': ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag21aaa'],
};

