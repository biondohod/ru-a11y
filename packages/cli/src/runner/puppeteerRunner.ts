import axe from 'axe-core';
import puppeteer, { type Browser } from 'puppeteer';
import { mapAxeResultToGost } from '../mapping/gostMapping';
import type { AuditRunResult, CliOptions, GostIssue, PageAuditResult } from '../types';

interface AxeNodeResult {
  target: string[];
  failureSummary?: string;
  html?: string;
}

interface AxeRunResponse {
  incomplete: Array<{
    id: string;
    impact?: string | null;
    help: string;
    nodes: AxeNodeResult[];
  }>;
  violations: Array<{
    id: string;
    impact?: string | null;
    help: string;
    nodes: AxeNodeResult[];
  }>;
}

function normalizeAxeConfig(options: CliOptions): Record<string, unknown> {
  const config: Record<string, unknown> = {};

  if (options.wcagTags.length > 0) {
    config.runOnly = {
      type: 'tag',
      values: options.wcagTags,
    };
  }

  if (options.disabledRules.length > 0) {
    const rules = options.disabledRules.reduce<Record<string, { enabled: boolean }>>((acc, ruleId) => {
      acc[ruleId] = { enabled: false };
      return acc;
    }, {});

    config.rules = rules;
  }

  return config;
}

async function runSingleUrl(browser: Browser, url: string, options: CliOptions): Promise<PageAuditResult> {
  const startedAt = Date.now();
  const page = await browser.newPage();

  try {
    page.setDefaultNavigationTimeout(options.timeoutMs);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: options.timeoutMs });

    await page.evaluate(axe.source);

    const axeConfig = normalizeAxeConfig(options);
    const result = await page.evaluate(async (config: Record<string, unknown>) => {
      const axeApi = (window as unknown as { axe: { run: (context: Document, options?: unknown) => Promise<AxeRunResponse> } }).axe;
      return axeApi.run(document, config);
    }, axeConfig);

    const groups: Array<{ items: AxeRunResponse['violations']; type: 'violation' | 'incomplete' }> = [
      { items: result.violations, type: 'violation' },
      { items: result.incomplete, type: 'incomplete' },
    ];

    const issues: GostIssue[] = groups.flatMap(({ items, type }) =>
      items.flatMap((violation: AxeRunResponse['violations'][number]) => {
        if (!violation.nodes.length) {
          return [
            mapAxeResultToGost({
              url,
              id: violation.id,
              impact: violation.impact,
              message: violation.help,
              target: ['document'],
              type,
            }),
          ];
        }

        return violation.nodes.map((node: AxeNodeResult) =>
          mapAxeResultToGost({
            url,
            id: violation.id,
            impact: violation.impact,
            message: node.failureSummary ?? violation.help,
            target: node.target,
            type,
            html: node.html,
          }),
        );
      }),
    );

    return {
      url,
      issues,
      durationMs: Date.now() - startedAt,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка запуска проверки страницы.';

    return {
      url,
      issues: [],
      durationMs: Date.now() - startedAt,
      error: `Не удалось проверить страницу: ${errorMessage}`,
    };
  } finally {
    await page.close();
  }
}

async function runWithConcurrency<T>(
  items: string[],
  worker: (item: string) => Promise<T>,
  concurrency: number,
): Promise<T[]> {
  const results: T[] = [];
  let index = 0;

  const runners = Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await worker(items[current]);
    }
  });

  await Promise.all(runners);
  return results;
}

/**
 * Запускает аудит по списку URL с использованием headless Chromium через Puppeteer.
 */
export async function runPuppeteerAudit(options: CliOptions): Promise<AuditRunResult> {
  const startedAt = new Date();

  let browser: Browser | undefined;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const pages = await runWithConcurrency(options.urls, (url) => runSingleUrl(browser as Browser, url, options), options.concurrency);

    return {
      startedAt: startedAt.toISOString(),
      finishedAt: new Date().toISOString(),
      scannedPages: pages.length,
      pages,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}


