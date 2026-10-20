import type { GostPrinciple, GostSeverity } from 'ru-a11y-toolkit-core';

export type { GostPrinciple, GostSeverity };

export type StandardLevel = 'gost-a' | 'gost-aa' | 'gost-aaa';

export type OutputFormat = 'console' | 'json' | 'html' | 'junit';
export type CliOutputFormat = OutputFormat | 'all';

export type AxeIssueType = 'violation' | 'incomplete' | 'inapplicable' | 'pass';

export type AuditIssueType = AxeIssueType | 'lint';

/** Where an issue was found: in a running page (axe) or in source code (ESLint). */
export type IssueOrigin = 'runtime-axe' | 'static-eslint';

/** Which catalog provided the issue metadata. */
export type RuleSource =
  | 'core-rules-map'
  | 'cli-gost-map'
  | 'overlay-rules-map'
  | 'eslint-rules'
  | 'fallback';

export interface IssueSourceLocation {
  filePath?: string;
  line?: number;
  column?: number;
  selector?: string;
  snippet?: string;
  note?: string;
}

/** A single violation normalized to the ru-a11y report model. */
export interface GostIssue {
  url: string;
  selector: string;
  ruRuleCode: string;
  axeRuleId: string;
  title: string;
  description: string;
  recommendation: string;
  severity: GostSeverity;
  principle: GostPrinciple;
  gostRefs: string[];
  post102Refs: string[];
  wcagRefs: string[];
  sourceMessage: string;
  issueType: AuditIssueType;
  origin: IssueOrigin;
  ruleSource: RuleSource;
  source?: IssueSourceLocation;
}

/** Result for one audited entity: a page URL or, for ESLint, a source file. */
export interface PageAuditResult {
  url: string;
  issues: GostIssue[];
  durationMs: number;
  error?: string;
}

export interface AuditRunResult {
  startedAt: string;
  finishedAt: string;
  scannedPages: number;
  pages: PageAuditResult[];
}

export interface CliOptions {
  urls: string[];
  standard: StandardLevel;
  wcagTags: string[];
  format: CliOutputFormat;
  outputDir: string;
  maxIssues: number;
  timeoutMs: number;
  concurrency: number;
  include: string[];
  exclude: string[];
  disabledRules: string[];
  withEslint: boolean;
  eslintTargets: string[];
  eslintConfigFile?: string;
  projectRoot: string;
  help: boolean;
  version: boolean;
  urlsFile?: string;
}
