import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PROJECT_DEFAULTS } from '../config/defaultConfig';
import { mapEslintResultToGost } from '../mapping/eslintMapping';
import { toEslintEntityUrl } from '../report/shared';
import type { CliOptions, PageAuditResult } from '../types';

/** The subset of ESLint's public API the CLI relies on. */
interface EslintMessage {
  ruleId: string | null;
  message: string;
  line: number;
  column: number;
  severity: 0 | 1 | 2;
}

interface EslintFileResult {
  filePath: string;
  messages: EslintMessage[];
}

interface EslintInstance {
  lintFiles(patterns: string[]): Promise<EslintFileResult[]>;
}

type EslintConstructor = new (options: Record<string, unknown>) => EslintInstance;

type ReportableMessage = EslintMessage & { ruleId: string; severity: 1 | 2 };

function isReportable(message: EslintMessage): message is ReportableMessage {
  return message.ruleId !== null && message.severity > 0;
}

async function readSourceLines(filePath: string): Promise<string[]> {
  try {
    return (await readFile(filePath, 'utf-8')).split(/\r?\n/);
  } catch {
    return [];
  }
}

/** ESLint is loaded lazily so runtime-only audits do not pay for its startup. */
async function loadEslint(): Promise<EslintConstructor> {
  const { ESLint } = (await import('eslint')) as unknown as { ESLint: EslintConstructor };
  return ESLint;
}

async function toPageResult(fileResult: EslintFileResult): Promise<PageAuditResult> {
  const sourceLines = await readSourceLines(fileResult.filePath);
  const issues = fileResult.messages.filter(isReportable).map((message) =>
    mapEslintResultToGost({
      filePath: fileResult.filePath,
      line: message.line,
      column: message.column,
      ruleId: message.ruleId,
      message: message.message,
      severity: message.severity,
      snippet: sourceLines[message.line - 1],
    }),
  );

  return { url: toEslintEntityUrl(fileResult.filePath), issues, durationMs: 0 };
}

/** Runs ESLint over the project and converts findings to ru-a11y issues, one entity per file. */
export async function runEslintAudit(options: CliOptions): Promise<PageAuditResult[]> {
  if (!options.withEslint) {
    return [];
  }

  const ESLint = await loadEslint();
  const eslint = new ESLint({
    cwd: resolve(options.projectRoot),
    errorOnUnmatchedPattern: false,
    overrideConfigFile: options.eslintConfigFile ? resolve(options.eslintConfigFile) : undefined,
  });

  const patterns =
    options.eslintTargets.length > 0 ? options.eslintTargets : [PROJECT_DEFAULTS.eslintTargets];
  const lintResults = await eslint.lintFiles(patterns);

  return Promise.all(lintResults.map(toPageResult));
}
