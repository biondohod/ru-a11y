import type { AuditRunResult, OutputFormat } from '../types';
import { writeHtmlReport } from './htmlReport';
import { writeJsonReport } from './jsonReport';
import { writeJunitReport } from './junitReport';
import { writeSarifReport } from './sarifReport';

export type FileOutputFormat = Exclude<OutputFormat, 'console'>;

export interface FileReporterContext {
  /** Root of the audited project; file-based formats write paths relative to it. */
  projectRoot: string;
}

interface FileReporter {
  /** Shown to the user after the file is written. */
  label: string;
  write: (
    result: AuditRunResult,
    outputDir: string,
    context: FileReporterContext,
  ) => Promise<string>;
}

/** Report formats persisted to disk. The console report is printed, not written. */
export const FILE_REPORTERS: Readonly<Record<FileOutputFormat, FileReporter>> = {
  json: { label: 'JSON-отчет', write: writeJsonReport },
  html: { label: 'HTML-отчет', write: writeHtmlReport },
  junit: { label: 'JUnit XML-отчет', write: writeJunitReport },
  sarif: { label: 'SARIF-отчет', write: writeSarifReport },
};

export { buildConsoleReport } from './consoleReport';
export { buildHtmlReport, writeHtmlReport } from './htmlReport';
export { buildJsonReport, writeJsonReport, type JsonReport } from './jsonReport';
export { buildJunitReport, writeJunitReport } from './junitReport';
export {
  buildSarifReport,
  writeSarifReport,
  type SarifLog,
  type SarifReportOptions,
} from './sarifReport';
