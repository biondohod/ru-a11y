export type StandardLevel = 'gost-a' | 'gost-aa' | 'gost-aaa';

export type OutputFormat = 'console' | 'json' | 'html';

export type GostSeverity = 'критичное' | 'существенное' | 'незначительное';

export type GostPrinciple =
  | 'воспринимаемость'
  | 'управляемость'
  | 'понятность'
  | 'надежность';

export type AxeIssueType = 'violation' | 'incomplete' | 'inapplicable' | 'pass';

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
  issueType: AxeIssueType;
}

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
  format: OutputFormat;
  outputDir: string;
  maxIssues: number;
  timeoutMs: number;
  concurrency: number;
  include: string[];
  exclude: string[];
  disabledRules: string[];
  help: boolean;
  version: boolean;
  urlsFile?: string;
}

