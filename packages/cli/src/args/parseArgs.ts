import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  DEFAULT_CONFIG,
  OUTPUT_FORMATS,
  PROJECT_DEFAULTS,
  STANDARD_LEVELS,
  STANDARD_TO_WCAG_TAGS,
} from '../config/defaultConfig';
import type { CliOptions, CliOutputFormat } from '../types';
import { splitList } from './splitList';

export interface ParseArgsContext {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
}

interface BooleanFlag {
  kind: 'boolean';
  apply: (options: CliOptions) => void;
}

interface ValueFlag {
  kind: 'value';
  /** Completes the sentence "Для флага --x нужно указать ...". */
  expects: string;
  apply: (options: CliOptions, value: string, flag: string) => void;
}

type FlagSpec = BooleanFlag | ValueFlag;

const CLI_OUTPUT_FORMATS: readonly CliOutputFormat[] = [...OUTPUT_FORMATS, 'all'];

function booleanFlag(apply: BooleanFlag['apply']): BooleanFlag {
  return { kind: 'boolean', apply };
}

function valueFlag(expects: string, apply: ValueFlag['apply']): ValueFlag {
  return { kind: 'value', expects, apply };
}

function oneOf<T extends string>(allowed: readonly T[], value: string, flag: string): T {
  if (!(allowed as readonly string[]).includes(value)) {
    throw new Error(`Флаг ${flag} принимает только: ${allowed.join(', ')}.`);
  }

  return value as T;
}

function parseNonNegativeInteger(value: string, flag: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(
      `Некорректное значение для ${flag}: ${value}. Ожидается неотрицательное целое число.`,
    );
  }

  return parsed;
}

const FLAGS: Readonly<Record<string, FlagSpec>> = {
  '--help': booleanFlag((options) => {
    options.help = true;
  }),
  '--version': booleanFlag((options) => {
    options.version = true;
  }),
  '--with-eslint': booleanFlag((options) => {
    options.withEslint = true;
  }),
  '--urls-file': valueFlag('путь к файлу', (options, value) => {
    options.urlsFile = value;
  }),
  '--standard': valueFlag('уровень', (options, value, flag) => {
    options.standard = oneOf(STANDARD_LEVELS, value, flag);
  }),
  '--wcag-tags': valueFlag('список тегов', (options, value) => {
    options.wcagTags = splitList(value);
  }),
  '--format': valueFlag('формат', (options, value, flag) => {
    options.format = oneOf(CLI_OUTPUT_FORMATS, value, flag);
  }),
  '--output': valueFlag('путь к директории', (options, value) => {
    options.outputDir = value;
  }),
  '--max-issues': valueFlag('число', (options, value, flag) => {
    options.maxIssues = parseNonNegativeInteger(value, flag);
  }),
  '--timeout': valueFlag('число миллисекунд', (options, value, flag) => {
    options.timeoutMs = parseNonNegativeInteger(value, flag);
  }),
  '--concurrency': valueFlag('число', (options, value, flag) => {
    options.concurrency = Math.max(1, parseNonNegativeInteger(value, flag));
  }),
  '--include': valueFlag('фильтр', (options, value) => {
    options.include = splitList(value);
  }),
  '--exclude': valueFlag('фильтр', (options, value) => {
    options.exclude = splitList(value);
  }),
  '--disable-rules': valueFlag('список id правил', (options, value) => {
    options.disabledRules = splitList(value);
  }),
  '--eslint-targets': valueFlag('хотя бы один паттерн', (options, value) => {
    options.eslintTargets = splitList(value);
  }),
  '--eslint-config': valueFlag('путь к конфигурации', (options, value) => {
    options.eslintConfigFile = value;
  }),
  '--project-root': valueFlag('путь к корню проекта', (options, value) => {
    options.projectRoot = value;
  }),
};

function createDefaultOptions(cwd: string): CliOptions {
  return {
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
    withEslint: false,
    eslintTargets: [],
    projectRoot: cwd,
    help: false,
    version: false,
  };
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Zero-config mode: `ru-a11y-cli` without arguments audits the project in the
 * current directory using the conventional files from {@link PROJECT_DEFAULTS}.
 */
async function applyProjectDefaults(options: CliOptions): Promise<void> {
  const projectRoot = resolve(options.projectRoot);
  const urlsFile = resolve(projectRoot, PROJECT_DEFAULTS.urlsFile);
  const eslintConfig = resolve(projectRoot, PROJECT_DEFAULTS.eslintConfig);

  options.projectRoot = projectRoot;
  options.format = 'all';
  options.outputDir = resolve(projectRoot, DEFAULT_CONFIG.outputDir);
  options.concurrency = 1;

  if (await pathExists(urlsFile)) {
    options.urlsFile = urlsFile;
  }

  if (await pathExists(eslintConfig)) {
    options.withEslint = true;
    options.eslintConfigFile = eslintConfig;
    options.eslintTargets = [PROJECT_DEFAULTS.eslintTargets];
  }
}

function applyFlags(argv: readonly string[], options: CliOptions): void {
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith('--')) {
      options.urls.push(token);
      continue;
    }

    const spec = FLAGS[token];
    if (!spec) {
      throw new Error(`Неизвестный флаг: ${token}`);
    }

    if (spec.kind === 'boolean') {
      spec.apply(options);
      continue;
    }

    const value = argv[index + 1];
    if (value === undefined || value.startsWith('--')) {
      throw new Error(`Для флага ${token} нужно указать ${spec.expects}.`);
    }

    spec.apply(options, value, token);
    index += 1;
  }
}

async function readUrlsFromFile(filePath: string): Promise<string[]> {
  const content = await readFile(resolve(filePath), 'utf-8');

  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));
}

function isHttpUrl(candidate: string): boolean {
  try {
    const { protocol } = new URL(candidate);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

function rewriteBaseUrl(urls: string[], baseUrl: string | undefined): string[] {
  return baseUrl ? urls.map((url) => url.replace(PROJECT_DEFAULTS.baseUrl, baseUrl)) : urls;
}

function validate(options: CliOptions): void {
  if (options.help || options.version) {
    return;
  }

  if (options.urls.length === 0 && !options.withEslint) {
    throw new Error(
      'Не указан ни один URL. Передайте URL аргументами или используйте --urls-file.',
    );
  }

  const invalidUrl = options.urls.find((url) => !isHttpUrl(url));
  if (invalidUrl) {
    throw new Error(`Некорректный URL: ${invalidUrl}. Допустимы только адреса с http/https.`);
  }
}

/** Parses CLI arguments into a fully resolved {@link CliOptions} object. */
export async function parseCliArgs(
  argv: readonly string[],
  { cwd = process.cwd(), env = process.env }: ParseArgsContext = {},
): Promise<CliOptions> {
  const options = createDefaultOptions(cwd);

  if (argv.length === 0) {
    await applyProjectDefaults(options);
  }

  applyFlags(argv, options);

  if (options.urlsFile) {
    options.urls.push(...(await readUrlsFromFile(options.urlsFile)));
  }

  options.urls = [...new Set(rewriteBaseUrl(options.urls, env.RU_A11Y_BASE_URL))];

  if (options.wcagTags.length === 0) {
    options.wcagTags = [...STANDARD_TO_WCAG_TAGS[options.standard]];
  }

  validate(options);

  return options;
}
