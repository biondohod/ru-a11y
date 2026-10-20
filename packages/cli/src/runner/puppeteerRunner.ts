import axe from 'axe-core';
import puppeteer, { type Browser } from 'puppeteer';
import { mapAxeResultToGost } from '../mapping/gostMapping';
import type { AuditRunResult, CliOptions, GostIssue, PageAuditResult } from '../types';
import { mapWithConcurrency } from '../utils/concurrency';

type AxeFinding = Pick<axe.Result, 'id' | 'impact' | 'help' | 'nodes'>;
type AxeFindings = Pick<axe.AxeResults, 'violations' | 'incomplete'>;

/** Translates CLI options to axe-core run options. */
export function buildAxeRunOptions(
  options: Pick<CliOptions, 'wcagTags' | 'disabledRules'>,
): axe.RunOptions {
  const runOptions: axe.RunOptions = {};

  if (options.wcagTags.length > 0) {
    runOptions.runOnly = { type: 'tag', values: options.wcagTags };
  }

  if (options.disabledRules.length > 0) {
    runOptions.rules = Object.fromEntries(
      options.disabledRules.map((ruleId) => [ruleId, { enabled: false }]),
    );
  }

  return runOptions;
}

function toIssues(url: string, finding: AxeFinding, type: 'violation' | 'incomplete'): GostIssue[] {
  const base = { url, id: finding.id, impact: finding.impact, type };

  // axe may report a page-level finding without nodes, e.g. a missing landmark.
  if (finding.nodes.length === 0) {
    return [mapAxeResultToGost({ ...base, message: finding.help, target: ['document'] })];
  }

  return finding.nodes.map((node) =>
    mapAxeResultToGost({
      ...base,
      message: node.failureSummary ?? finding.help,
      target: node.target.map(String),
      html: node.html,
    }),
  );
}

export function collectIssues(url: string, findings: AxeFindings): GostIssue[] {
  return [
    ...findings.violations.flatMap((finding) => toIssues(url, finding, 'violation')),
    ...findings.incomplete.flatMap((finding) => toIssues(url, finding, 'incomplete')),
  ];
}

async function auditUrl(
  browser: Browser,
  url: string,
  options: CliOptions,
): Promise<PageAuditResult> {
  const startedAt = Date.now();
  const page = await browser.newPage();

  try {
    page.setDefaultNavigationTimeout(options.timeoutMs);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: options.timeoutMs });
    await page.evaluate(axe.source);

    const findings = await page.evaluate(
      (runOptions) => (window as unknown as { axe: typeof axe }).axe.run(document, runOptions),
      buildAxeRunOptions(options),
    );

    return { url, issues: collectIssues(url, findings), durationMs: Date.now() - startedAt };
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : 'Неизвестная ошибка запуска проверки страницы.';

    return {
      url,
      issues: [],
      durationMs: Date.now() - startedAt,
      error: `Не удалось проверить страницу: ${reason}`,
    };
  } finally {
    await page.close();
  }
}

/** Audits every URL in a shared headless Chromium instance. */
export async function runPuppeteerAudit(options: CliOptions): Promise<AuditRunResult> {
  const startedAt = new Date().toISOString();
  const browser = await puppeteer.launch({
    headless: true,
    // Chromium's sandbox is unavailable in most Docker/CI images the CLI runs in.
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const pages = await mapWithConcurrency(
      options.urls,
      (url) => auditUrl(browser, url, options),
      options.concurrency,
    );

    return { startedAt, finishedAt: new Date().toISOString(), scannedPages: pages.length, pages };
  } finally {
    await browser.close();
  }
}
