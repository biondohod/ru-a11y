#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { DEFAULT_CONFIG, STANDARD_TO_WCAG_TAGS } from './config/defaultConfig';
import { buildConsoleReport } from './report/consoleReport';
import { writeHtmlReport } from './report/htmlReport';
import { buildJsonReport, writeJsonReport } from './report/jsonReport';
import { runPuppeteerAudit } from './runner/puppeteerRunner';
import type { AuditRunResult, CliOptions, GostIssue, OutputFormat, StandardLevel } from './types';

const VERSION = '0.2.0';

const HELP_TEXT = `ru-a11y-cli - проверка доступности сайтов по ГОСТ и Постановлению №102

Использование:
  ru-a11y-cli <url...> [опции]

Опции:
  --urls-file <путь>      Файл со списком URL (по одному на строку)
  --standard <уровень>    Целевой уровень: gost-a | gost-aa | gost-aaa (по умолчанию: gost-aa)
  --wcag-tags <теги>      Дополнительный фильтр правил axe по тегам (через запятую)
  --format <формат>       Формат отчета: console | json | html (по умолчанию: console)
  --output <директория>   Путь к директории для json/html отчетов
  --max-issues <число>    Порог нарушений для кода выхода 1
  --timeout <мс>          Таймаут проверки одной страницы в миллисекундах
  --concurrency <число>   Количество одновременных проверок
  --include <фильтр>      Включить только указанные группы (через запятую)
  --exclude <фильтр>      Исключить указанные группы (через запятую)
  --disable-rules <ids>   Отключить отдельные правила axe (через запятую)
  --help                  Показать эту справку
  --version               Показать версию CLI

Примеры:
  ru-a11y-cli https://example.com
  ru-a11y-cli https://example.com https://example.com/catalog --format json --output ./reports
  ru-a11y-cli --urls-file ./urls.txt --standard gost-aaa --max-issues 0
`;

function splitList(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseInteger(value: string, flagName: string): number {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    throw new Error(`Некорректное значение для ${flagName}: ${value}. Ожидается неотрицательное целое число.`);
  }

  return parsed;
}

function isHttpUrl(candidate: string): boolean {
  try {
    const parsed = new URL(candidate);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

async function readUrlsFromFile(filePath: string): Promise<string[]> {
  const content = await readFile(resolve(filePath), 'utf-8');
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));
}

/**
 * Разбирает аргументы CLI в единый объект настроек.
 */
export async function parseCliArgs(argv: string[]): Promise<CliOptions> {
  const options: CliOptions = {
    urls: [],
    standard: DEFAULT_CONFIG.standard,
    wcagTags: [],
    format: DEFAULT_CONFIG.format,
    outputDir: DEFAULT_CONFIG.outputDir,
    maxIssues: DEFAULT_CONFIG.maxIssues,
    timeoutMs: DEFAULT_CONFIG.timeoutMs,
    concurrency: DEFAULT_CONFIG.concurrency,
    include: [],
    exclude: [],
    disabledRules: [],
    help: false,
    version: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (!token.startsWith('--')) {
      options.urls.push(token);
      continue;
    }

    const value = argv[i + 1];

    switch (token) {
      case '--help':
        options.help = true;
        break;
      case '--version':
        options.version = true;
        break;
      case '--urls-file':
        if (!value) {
          throw new Error('Для флага --urls-file нужно указать путь к файлу.');
        }
        options.urlsFile = value;
        i += 1;
        break;
      case '--standard':
        if (!value || !['gost-a', 'gost-aa', 'gost-aaa'].includes(value)) {
          throw new Error('Флаг --standard принимает только: gost-a, gost-aa или gost-aaa.');
        }
        options.standard = value as StandardLevel;
        i += 1;
        break;
      case '--wcag-tags':
        if (!value) {
          throw new Error('Для флага --wcag-tags нужно указать список тегов.');
        }
        options.wcagTags = splitList(value);
        i += 1;
        break;
      case '--format':
        if (!value || !['console', 'json', 'html'].includes(value)) {
          throw new Error('Флаг --format принимает только: console, json или html.');
        }
        options.format = value as OutputFormat;
        i += 1;
        break;
      case '--output':
        if (!value) {
          throw new Error('Для флага --output нужно указать путь к директории.');
        }
        options.outputDir = value;
        i += 1;
        break;
      case '--max-issues':
        if (!value) {
          throw new Error('Для флага --max-issues нужно указать число.');
        }
        options.maxIssues = parseInteger(value, '--max-issues');
        i += 1;
        break;
      case '--timeout':
        if (!value) {
          throw new Error('Для флага --timeout нужно указать число миллисекунд.');
        }
        options.timeoutMs = parseInteger(value, '--timeout');
        i += 1;
        break;
      case '--concurrency':
        if (!value) {
          throw new Error('Для флага --concurrency нужно указать число.');
        }
        options.concurrency = Math.max(1, parseInteger(value, '--concurrency'));
        i += 1;
        break;
      case '--include':
        if (!value) {
          throw new Error('Для флага --include нужно указать фильтр.');
        }
        options.include = splitList(value);
        i += 1;
        break;
      case '--exclude':
        if (!value) {
          throw new Error('Для флага --exclude нужно указать фильтр.');
        }
        options.exclude = splitList(value);
        i += 1;
        break;
      case '--disable-rules':
        if (!value) {
          throw new Error('Для флага --disable-rules нужно указать список id правил.');
        }
        options.disabledRules = splitList(value);
        i += 1;
        break;
      default:
        throw new Error(`Неизвестный флаг: ${token}`);
    }
  }

  if (options.urlsFile) {
    const fileUrls = await readUrlsFromFile(options.urlsFile);
    options.urls = [...options.urls, ...fileUrls];
  }

  options.urls = Array.from(new Set(options.urls));

  if (!options.help && !options.version && options.urls.length === 0) {
    throw new Error('Не указан ни один URL. Передайте URL аргументами или используйте --urls-file.');
  }

  const invalid = options.urls.find((url) => !isHttpUrl(url));
  if (invalid) {
    throw new Error(`Некорректный URL: ${invalid}. Допустимы только адреса с http/https.`);
  }

  if (options.wcagTags.length === 0) {
    options.wcagTags = STANDARD_TO_WCAG_TAGS[options.standard] ?? [];
  }

  return options;
}

function matchByToken(issue: GostIssue, token: string): boolean {
  const normalizedToken = token.toLowerCase();
  return [issue.ruRuleCode, issue.axeRuleId, issue.principle, issue.severity]
    .map((part) => part.toLowerCase())
    .some((part) => part.includes(normalizedToken));
}

export function applyIssueFilters(result: AuditRunResult, include: string[], exclude: string[]): AuditRunResult {
  const pages = result.pages.map((page) => {
    const withInclude = include.length
      ? page.issues.filter((issue) => include.some((token) => matchByToken(issue, token)))
      : page.issues;

    const withExclude = exclude.length
      ? withInclude.filter((issue) => !exclude.some((token) => matchByToken(issue, token)))
      : withInclude;

    return {
      ...page,
      issues: withExclude,
    };
  });

  return {
    ...result,
    pages,
  };
}

function calculateExitCode(result: AuditRunResult, maxIssues: number): number {
  const hasInfrastructureErrors = result.pages.some((page) => Boolean(page.error));
  if (hasInfrastructureErrors) {
    return 2;
  }

  const totalIssues = result.pages.reduce((acc, page) => acc + page.issues.length, 0);
  if (totalIssues > maxIssues) {
    return 1;
  }

  return 0;
}

function printReport(result: AuditRunResult, format: OutputFormat): void {
  if (format === 'console') {
    process.stdout.write(`${buildConsoleReport(result)}\n`);
    return;
  }

  const json = buildJsonReport(result);
  process.stdout.write(`Проверено страниц: ${json.scannedPages}\n`);
  process.stdout.write(`Выявлено нарушений: ${json.totalIssues}\n`);
}

/**
 * Основной запуск CLI.
 */
export async function runCli(argv: string[]): Promise<number> {
  const options = await parseCliArgs(argv);

  if (options.help) {
    process.stdout.write(HELP_TEXT);
    return 0;
  }

  if (options.version) {
    process.stdout.write(`${VERSION}\n`);
    return 0;
  }

  const audit = await runPuppeteerAudit(options);
  const filtered = applyIssueFilters(audit, options.include, options.exclude);
  printReport(filtered, options.format);

  if (options.format === 'json') {
    const filePath = await writeJsonReport(filtered, options.outputDir);
    process.stdout.write(`JSON-отчет сохранен: ${filePath}\n`);
  }

  if (options.format === 'html') {
    const filePath = await writeHtmlReport(filtered, options.outputDir);
    process.stdout.write(`HTML-отчет сохранен: ${filePath}\n`);
  }

  return calculateExitCode(filtered, options.maxIssues);
}

async function main(): Promise<void> {
  try {
    const code = await runCli(process.argv.slice(2));
    process.exit(code);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Внутренняя ошибка CLI.';
    process.stderr.write(`Ошибка: ${message}\n`);
    process.exit(2);
  }
}

if (require.main === module) {
  void main();
}

