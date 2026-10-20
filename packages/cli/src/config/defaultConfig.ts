import type { OutputFormat, StandardLevel } from '../types';

/** Defaults applied when a flag is not passed. */
export const DEFAULT_CONFIG = {
  standard: 'gost-aa',
  format: 'console',
  timeoutMs: 30_000,
  concurrency: 2,
  maxIssues: Number.POSITIVE_INFINITY,
  outputDir: 'ru-a11y-reports',
} as const;

/** Files picked up automatically when the CLI is started without arguments. */
export const PROJECT_DEFAULTS = {
  urlsFile: 'ru-a11y.urls.txt',
  eslintConfig: 'eslint.ru-a11y.config.mjs',
  eslintTargets: 'src/**/*.{js,jsx,ts,tsx}',
  /** URLs starting with this origin are rewritten to `RU_A11Y_BASE_URL` when it is set. */
  baseUrl: 'http://localhost:3000',
} as const;

export const STANDARD_LEVELS: readonly StandardLevel[] = ['gost-a', 'gost-aa', 'gost-aaa'];

export const OUTPUT_FORMATS: readonly OutputFormat[] = ['console', 'json', 'html', 'junit'];

/** GOST conformance level -> axe-core tags that cover it. */
export const STANDARD_TO_WCAG_TAGS: Readonly<Record<StandardLevel, readonly string[]>> = {
  'gost-a': ['wcag2a', 'wcag21a'],
  'gost-aa': ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
  'gost-aaa': ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag21aaa'],
};

/** Process exit codes, stable for CI pipelines. */
export const EXIT_CODE = {
  ok: 0,
  issueThresholdExceeded: 1,
  auditFailed: 2,
} as const;
