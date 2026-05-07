export const RU_A11Y_TOOLKIT_STATS = {
  canonicalRules: 115,
  runtimeAndLintChecks: 184,
  customChecks: 54,
  eslintChecks: {
    total: 36,
    base: 26,
    custom: 10,
  },
  overlayChecks: {
    total: 148,
    axe: 104,
    custom: 44,
  },
} as const;

export type RuA11yToolkitStats = typeof RU_A11Y_TOOLKIT_STATS;
