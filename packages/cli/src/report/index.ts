import type { AuditRunResult, OutputFormat } from '../types';
import { writeHtmlReport } from './htmlReport';
import { writeJsonReport } from './jsonReport';
import { writeJunitReport } from './junitReport';

export type FileOutputFormat = Exclude<OutputFormat, 'console'>;

interface FileReporter {
  /** Shown to the user after the file is written. */
  label: string;
  write: (result: AuditRunResult, outputDir: string) => Promise<string>;
}

/** Report formats persisted to disk. The console report is printed, not written. */
export const FILE_REPORTERS: Readonly<Record<FileOutputFormat, FileReporter>> = {
  json: { label: 'JSON-отчет', write: writeJsonReport },
  html: { label: 'HTML-отчет', write: writeHtmlReport },
  junit: { label: 'JUnit XML-отчет', write: writeJunitReport },
};

export { buildConsoleReport } from './consoleReport';
export { buildHtmlReport, writeHtmlReport } from './htmlReport';
export { buildJsonReport, writeJsonReport, type JsonReport } from './jsonReport';
export { buildJunitReport, writeJunitReport } from './junitReport';
