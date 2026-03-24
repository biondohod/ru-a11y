import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { AuditRunResult } from '../types';

export interface JsonReport {
  generatedAt: string;
  scannedPages: number;
  totalIssues: number;
  pages: AuditRunResult['pages'];
}

/**
 * Формирует машинно-читаемую структуру отчета.
 */
export function buildJsonReport(result: AuditRunResult): JsonReport {
  const totalIssues = result.pages.reduce((acc, page) => acc + page.issues.length, 0);

  return {
    generatedAt: result.finishedAt,
    scannedPages: result.scannedPages,
    totalIssues,
    pages: result.pages,
  };
}

/**
 * Сохраняет JSON-отчет на диск и возвращает путь к файлу.
 */
export async function writeJsonReport(result: AuditRunResult, outputDir: string): Promise<string> {
  await mkdir(outputDir, { recursive: true });
  const reportPath = join(outputDir, 'ru-a11y-report.json');
  const payload = JSON.stringify(buildJsonReport(result), null, 2);

  await writeFile(reportPath, payload, 'utf-8');
  return reportPath;
}

