import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { countIssues } from '../audit/summary';
import type { AuditRunResult } from '../types';

export interface JsonReport {
  generatedAt: string;
  scannedPages: number;
  totalIssues: number;
  pages: AuditRunResult['pages'];
}

/** Machine readable report for CI integrations. */
export function buildJsonReport(result: AuditRunResult): JsonReport {
  return {
    generatedAt: result.finishedAt,
    scannedPages: result.scannedPages,
    totalIssues: countIssues(result),
    pages: result.pages,
  };
}

/** Writes the JSON report to `outputDir` and returns the file path. */
export async function writeJsonReport(result: AuditRunResult, outputDir: string): Promise<string> {
  await mkdir(outputDir, { recursive: true });
  const reportPath = join(outputDir, 'ru-a11y-report.json');
  const payload = JSON.stringify(buildJsonReport(result), null, 2);

  await writeFile(reportPath, payload, 'utf-8');
  return reportPath;
}
