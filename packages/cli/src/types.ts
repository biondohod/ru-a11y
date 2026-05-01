export type StandardLevel = 'gost-a' | 'gost-aa' | 'gost-aaa';

export type OutputFormat = 'console' | 'json' | 'html' | 'junit';
export type CliOutputFormat = OutputFormat | 'all';

export type GostSeverity = 'критичное' | 'существенное' | 'незначительное';

export type GostPrinciple =
  | 'воспринимаемость'
  | 'управляемость'
  | 'понятность'
  | 'надежность';

export type AxeIssueType = 'violation' | 'incomplete' | 'inapplicable' | 'pass';

export type AuditIssueType = AxeIssueType | 'lint';

export type IssueOrigin = 'runtime-axe' | 'static-eslint';

export type RuleSource = 'core-rules-map' | 'cli-gost-map' | 'overlay-rules-map' | 'eslint-rules' | 'fallback';

export interface IssueSourceLocation {
  filePath?: string;
  line?: number;
  column?: number;
  selector?: string;
  snippet?: string;
  note?: string;
}

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
