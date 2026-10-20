export { runCli, type CliIO } from './cli';
export { parseCliArgs, type ParseArgsContext } from './args/parseArgs';
export { applyIssueFilters, calculateExitCode, countIssues } from './audit/summary';
export { EXIT_CODE } from './config/defaultConfig';
export { runPuppeteerAudit } from './runner/puppeteerRunner';
export { runEslintAudit } from './runner/eslintRunner';
export { GOST_RULES, mapAxeResultToGost, findGostRuleByAxeId } from './mapping/gostMapping';
export { mapEslintResultToGost } from './mapping/eslintMapping';
export {
  buildConsoleReport,
  buildHtmlReport,
  buildJsonReport,
  buildJunitReport,
  writeHtmlReport,
  writeJsonReport,
  writeJunitReport,
  type JsonReport,
} from './report';
export { VERSION } from './version';
export type {
  AuditRunResult,
  AxeIssueType,
  CliOptions,
  CliOutputFormat,
  GostIssue,
  GostPrinciple,
  GostSeverity,
  IssueOrigin,
  IssueSourceLocation,
  OutputFormat,
  PageAuditResult,
  RuleSource,
  StandardLevel,
} from './types';
