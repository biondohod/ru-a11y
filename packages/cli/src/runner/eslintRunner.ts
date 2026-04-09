import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { mapEslintResultToGost } from '../mapping/eslintMapping';
import type { CliOptions, PageAuditResult } from '../types';

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

async function readSourceLines(filePath: string): Promise<string[]> {
  try {
    const content = await readFile(filePath, 'utf-8');
    return content.split(/\r?\n/);
  } catch {
    return [];
  }
}

async function loadEslintConstructor(): Promise<new (options?: Record<string, unknown>) => {
  lintFiles: (patterns: string[]) => Promise<EslintFileResult[]>;
}> {
  // Dynamic import keeps eslint optional for runtime-only mode.
  const eslintModule = (await import('eslint')) as { ESLint: new (options?: Record<string, unknown>) => {
    lintFiles: (patterns: string[]) => Promise<EslintFileResult[]>;
  } };

  return eslintModule.ESLint;
}

/**
 * Runs ESLint-based static checks and converts findings to unified ru-a11y issues.
 */
export async function runEslintAudit(options: CliOptions): Promise<PageAuditResult[]> {
  if (!options.withEslint) {
    return [];
  }

  const ESLint = await loadEslintConstructor();
  const cwd = resolve(options.projectRoot || process.cwd());
  const patterns = options.eslintTargets.length > 0 ? options.eslintTargets : ['src/**/*.{js,jsx,ts,tsx}'];

  const eslint = new ESLint({
    cwd,
    errorOnUnmatchedPattern: false,
    overrideConfigFile: options.eslintConfigFile ? resolve(options.eslintConfigFile) : undefined,
  });

  const lintResults = await eslint.lintFiles(patterns);

  return Promise.all(lintResults.map(async (fileResult) => {
    const sourceLines = await readSourceLines(fileResult.filePath);
    const issues = fileResult.messages
      .filter((message) => message.ruleId && message.severity > 0)
      .map((message) =>
        mapEslintResultToGost({
          filePath: fileResult.filePath,
          line: message.line,
          column: message.column,
          ruleId: message.ruleId as string,
          message: message.message,
          severity: message.severity === 2 ? 2 : 1,
          snippet: sourceLines[message.line - 1],
        }),
      );

    return {
      url: `eslint://${fileResult.filePath}`,
      issues,
      durationMs: 0,
    };
  }));
}
