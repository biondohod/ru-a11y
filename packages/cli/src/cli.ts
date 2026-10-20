import { join } from 'node:path';
import { HELP_TEXT } from './args/helpText';
import { parseCliArgs } from './args/parseArgs';
import {
  applyIssueFilters,
  calculateExitCode,
  countIssues,
  mergeAuditResults,
} from './audit/summary';
import { EXIT_CODE, OUTPUT_FORMATS } from './config/defaultConfig';
import { FILE_REPORTERS, buildConsoleReport } from './report';
import { runEslintAudit } from './runner/eslintRunner';
import { runPuppeteerAudit } from './runner/puppeteerRunner';
import type { AuditRunResult, CliOptions, CliOutputFormat, OutputFormat } from './types';
import { VERSION } from './version';

export interface CliIO {
  stdout: Pick<NodeJS.WritableStream, 'write'>;
}

const defaultIO: CliIO = { stdout: process.stdout };

function resolveFormats(format: CliOutputFormat): readonly OutputFormat[] {
  return format === 'all' ? OUTPUT_FORMATS : [format];
}

function emptyAudit(): AuditRunResult {
  const now = new Date().toISOString();
  return { startedAt: now, finishedAt: now, scannedPages: 0, pages: [] };
}

async function runAudits(options: CliOptions): Promise<AuditRunResult> {
  const runtime = options.urls.length > 0 ? await runPuppeteerAudit(options) : emptyAudit();
  const staticPages = await runEslintAudit(options);

  return mergeAuditResults(runtime, staticPages);
}

async function emitReports(result: AuditRunResult, options: CliOptions, io: CliIO): Promise<void> {
  const formats = resolveFormats(options.format);
  // With several formats each file report gets its own sub-directory.
  const isMultiFormat = formats.length > 1;

  if (formats.includes('console')) {
    io.stdout.write(`${buildConsoleReport(result)}\n`);
  } else {
    // The full console report already contains these totals.
    io.stdout.write(`Проверено страниц: ${result.scannedPages}\n`);
    io.stdout.write(`Выявлено нарушений: ${countIssues(result)}\n`);
  }

  for (const format of formats) {
    if (format === 'console') {
      continue;
    }

    const reporter = FILE_REPORTERS[format];
    const outputDir = isMultiFormat ? join(options.outputDir, format) : options.outputDir;
    const filePath = await reporter.write(result, outputDir);
    io.stdout.write(`${reporter.label} сохранен: ${filePath}\n`);
  }
}

/**
 * Runs the CLI and resolves with the process exit code:
 * 0 - ok, 1 - issue threshold exceeded, 2 - an audit could not be completed.
 */
export async function runCli(argv: readonly string[], io: CliIO = defaultIO): Promise<number> {
  const options = await parseCliArgs(argv);

  if (options.help) {
    io.stdout.write(HELP_TEXT);
    return EXIT_CODE.ok;
  }

  if (options.version) {
    io.stdout.write(`${VERSION}\n`);
    return EXIT_CODE.ok;
  }

  const audit = await runAudits(options);
  const filtered = applyIssueFilters(audit, options.include, options.exclude);

  await emitReports(filtered, options, io);

  return calculateExitCode(filtered, options.maxIssues);
}
