import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';
import type { AuditRunResult, GostIssue, GostSeverity, PageAuditResult } from '../types';
import { VERSION } from '../version';
import { getEntityName } from './shared';

/**
 * SARIF 2.1.0 (https://docs.oasis-open.org/sarif/sarif/v2.1.0/) for GitHub code scanning and
 * other static analysis dashboards. ESLint findings point to a file and line in the
 * repository; runtime findings have no source file and are reported with a logical location
 * (page URL + CSS selector).
 */

export const SARIF_REPORT_FILE = 'ru-a11y-report.sarif';

const SARIF_SCHEMA = 'https://json.schemastore.org/sarif-2.1.0.json';
const INFORMATION_URI = 'https://github.com/biondohod/ru-a11y';
/** Repository root as seen by the consumer, e.g. GitHub's checkout directory. */
const SOURCE_ROOT = '%SRCROOT%';
const FINGERPRINT_KEY = 'ruA11yIssue/v1';
const GENERIC_RULE_CODE = 'RU_GOST_GENERIC';

type SarifLevel = 'error' | 'warning' | 'note';

const LEVEL_BY_SEVERITY: Readonly<Record<GostSeverity, SarifLevel>> = {
  критичное: 'error',
  существенное: 'warning',
  незначительное: 'note',
};

/** GitHub code scanning orders alerts by this score (0-10). */
const SECURITY_SEVERITY_BY_LEVEL: Readonly<Record<SarifLevel, string>> = {
  error: '7.0',
  warning: '4.0',
  note: '1.0',
};

export interface SarifReportOptions {
  /** ESLint file paths are written relative to this directory. Defaults to the current one. */
  projectRoot?: string;
}

interface SarifRule {
  id: string;
  name: string;
  shortDescription: { text: string };
  fullDescription: { text: string };
  help: { text: string; markdown: string };
  defaultConfiguration: { level: SarifLevel };
  properties: { tags: string[]; precision: 'high'; 'security-severity': string };
}

interface SarifLocation {
  physicalLocation?: {
    artifactLocation: { uri: string; uriBaseId?: string };
    region?: { startLine: number; startColumn?: number; snippet?: { text: string } };
  };
  logicalLocations?: Array<{ name: string; fullyQualifiedName: string; kind: string }>;
}

interface SarifResult {
  ruleId: string;
  ruleIndex: number;
  level: SarifLevel;
  message: { text: string };
  locations: SarifLocation[];
  partialFingerprints: Record<string, string>;
  properties: { url: string; origin: GostIssue['origin']; principle: string; severity: string };
}

interface SarifNotification {
  level: 'error';
  message: { text: string };
  locations: SarifLocation[];
}

export interface SarifLog {
  $schema: string;
  version: '2.1.0';
  runs: Array<{
    tool: {
      driver: {
        name: string;
        version: string;
        semanticVersion: string;
        informationUri: string;
        rules: SarifRule[];
      };
    };
    invocations: Array<{
      executionSuccessful: boolean;
      startTimeUtc: string;
      endTimeUtc: string;
      toolExecutionNotifications: SarifNotification[];
    }>;
    results: SarifResult[];
  }>;
}

function toPosixPath(path: string): string {
  return path.split(sep).join('/');
}

/** Repository-relative POSIX path, so code scanning can map the result to a file. */
function toArtifactUri(filePath: string, projectRoot: string): string {
  const path = isAbsolute(filePath) ? relative(projectRoot, filePath) : filePath;
  return toPosixPath(path);
}

/** Uncatalogued rules share one report code; keep them apart in SARIF by their axe id. */
function getRuleId(issue: GostIssue): string {
  return issue.ruRuleCode === GENERIC_RULE_CODE
    ? `${GENERIC_RULE_CODE}/${issue.axeRuleId}`
    : issue.ruRuleCode;
}

function buildRule(issue: GostIssue): SarifRule {
  const level = LEVEL_BY_SEVERITY[issue.severity];
  const references = [...issue.gostRefs, ...issue.post102Refs, ...issue.wcagRefs];

  return {
    id: getRuleId(issue),
    name: issue.axeRuleId,
    shortDescription: { text: issue.title },
    fullDescription: { text: issue.description },
    help: {
      text: [issue.recommendation, ...references].join('\n'),
      markdown: [
        `**${issue.title}**`,
        '',
        issue.description,
        '',
        `**Как исправить:** ${issue.recommendation}`,
        ...(references.length > 0 ? ['', ...references.map((reference) => `- ${reference}`)] : []),
      ].join('\n'),
    },
    defaultConfiguration: { level },
    properties: {
      tags: ['accessibility', 'a11y', issue.principle],
      precision: 'high',
      'security-severity': SECURITY_SEVERITY_BY_LEVEL[level],
    },
  };
}

function buildLocation(issue: GostIssue, projectRoot: string): SarifLocation {
  const { source } = issue;

  if (source?.filePath) {
    return {
      physicalLocation: {
        artifactLocation: {
          uri: toArtifactUri(source.filePath, projectRoot),
          uriBaseId: SOURCE_ROOT,
        },
        region: {
          startLine: source.line ?? 1,
          startColumn: source.column,
          ...(source.snippet ? { snippet: { text: source.snippet } } : {}),
        },
      },
    };
  }

  const selector = source?.selector ?? issue.selector;
  return {
    logicalLocations: [
      { name: selector, fullyQualifiedName: `${issue.url} ${selector}`, kind: 'element' },
    ],
  };
}

/** Stable across runs, so a dashboard can tell a new alert from one that was already there. */
function fingerprint(issue: GostIssue, location: SarifLocation): string {
  const where =
    location.physicalLocation?.artifactLocation.uri ??
    location.logicalLocations?.[0]?.fullyQualifiedName ??
    issue.url;

  return createHash('sha256')
    .update(
      `${getRuleId(issue)}|${where}|${issue.source?.line ?? ''}|${issue.source?.column ?? ''}`,
    )
    .digest('hex');
}

function buildMessage(issue: GostIssue): string {
  return `${issue.title}. ${issue.recommendation}`;
}

function buildNotification(page: PageAuditResult): SarifNotification {
  return {
    level: 'error',
    message: { text: page.error ?? 'Аудит не выполнен.' },
    locations: [
      {
        logicalLocations: [
          { name: getEntityName(page), fullyQualifiedName: page.url, kind: 'resource' },
        ],
      },
    ],
  };
}

export function buildSarifReport(
  result: AuditRunResult,
  options: SarifReportOptions = {},
): SarifLog {
  const projectRoot = resolve(options.projectRoot ?? process.cwd());
  const rules: SarifRule[] = [];
  const ruleIndexById = new Map<string, number>();

  const ruleIndexFor = (issue: GostIssue): number => {
    const ruleId = getRuleId(issue);
    const known = ruleIndexById.get(ruleId);
    if (known !== undefined) return known;

    ruleIndexById.set(ruleId, rules.length);
    rules.push(buildRule(issue));
    return rules.length - 1;
  };

  // Several ESLint rules can map to one catalog rule (e.g. require-lang-attr and
  // jsx-a11y/html-has-lang); one alert per rule and position is enough.
  const seenFingerprints = new Set<string>();

  const results = result.pages.flatMap((page) =>
    page.issues.flatMap((issue): SarifResult[] => {
      const location = buildLocation(issue, projectRoot);
      const issueFingerprint = fingerprint(issue, location);
      if (seenFingerprints.has(issueFingerprint)) return [];
      seenFingerprints.add(issueFingerprint);

      return [
        {
          ruleId: getRuleId(issue),
          ruleIndex: ruleIndexFor(issue),
          level: LEVEL_BY_SEVERITY[issue.severity],
          message: { text: buildMessage(issue) },
          locations: [location],
          partialFingerprints: { [FINGERPRINT_KEY]: issueFingerprint },
          properties: {
            url: issue.url,
            origin: issue.origin,
            principle: issue.principle,
            severity: issue.severity,
          },
        },
      ];
    }),
  );

  const failedPages = result.pages.filter((page) => page.error);

  return {
    $schema: SARIF_SCHEMA,
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'ru-a11y-toolkit-cli',
            version: VERSION,
            semanticVersion: VERSION,
            informationUri: INFORMATION_URI,
            rules,
          },
        },
        invocations: [
          {
            executionSuccessful: failedPages.length === 0,
            startTimeUtc: result.startedAt,
            endTimeUtc: result.finishedAt,
            toolExecutionNotifications: failedPages.map(buildNotification),
          },
        ],
        results,
      },
    ],
  };
}

/** Writes the SARIF report to `outputDir` and returns the file path. */
export async function writeSarifReport(
  result: AuditRunResult,
  outputDir: string,
  options: SarifReportOptions = {},
): Promise<string> {
  await mkdir(outputDir, { recursive: true });
  const reportPath = join(outputDir, SARIF_REPORT_FILE);
  await writeFile(
    reportPath,
    `${JSON.stringify(buildSarifReport(result, options), null, 2)}\n`,
    'utf-8',
  );
  return reportPath;
}
