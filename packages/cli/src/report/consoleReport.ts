import { countIssues } from '../audit/summary';
import type { AuditRunResult, GostIssue, GostPrinciple, GostSeverity } from '../types';
import { ANSI, indentBlock, tone } from '../utils/terminal';
import { getIssueLocation } from './shared';

const PRINCIPLE_LABELS: Record<GostPrinciple, string> = {
  воспринимаемость: 'Воспринимаемость',
  управляемость: 'Управляемость',
  понятность: 'Понятность',
  надежность: 'Надежность',
};

function formatLabel(label: string): string {
  return tone(label, ANSI.bold, ANSI.cyan);
}

function formatInlineCode(text: string): string {
  return text.replace(/`([^`]+)`/g, (_, code: string) => tone(code, ANSI.bold, ANSI.yellow));
}

const SEVERITY_BACKGROUND: Readonly<
  Record<GostSeverity, typeof ANSI.bgRed | typeof ANSI.bgYellow | typeof ANSI.bgBlue>
> = {
  критичное: ANSI.bgRed,
  существенное: ANSI.bgYellow,
  незначительное: ANSI.bgBlue,
};

function formatSeverity(severity: GostSeverity): string {
  return tone(` ${severity.toUpperCase()} `, ANSI.bold, ANSI.white, SEVERITY_BACKGROUND[severity]);
}

function groupByPrinciple(issues: GostIssue[]): Record<GostPrinciple, GostIssue[]> {
  return issues.reduce<Record<GostPrinciple, GostIssue[]>>(
    (acc, issue) => {
      acc[issue.principle].push(issue);
      return acc;
    },
    {
      воспринимаемость: [],
      управляемость: [],
      понятность: [],
      надежность: [],
    },
  );
}

function formatReferenceSection(label: string, refs: string[]): string[] {
  if (refs.length === 0) {
    return [];
  }

  return [
    `${formatLabel(label)}`,
    ...refs.flatMap((ref) => indentBlock(`• ${formatInlineCode(ref)}`, '        ')),
  ];
}

function collectNormativeReferences(issue: GostIssue): string[] {
  return [...issue.gostRefs, ...issue.post102Refs, ...issue.wcagRefs];
}

function formatSourceSnippet(issue: GostIssue): string[] {
  const snippet = issue.source?.snippet?.trimEnd();
  const line = issue.source?.line;
  const column = issue.source?.column ?? 1;

  if (!snippet || !line) {
    return [];
  }

  const gutter = tone(String(line).padStart(4, ' '), ANSI.gray);
  const pointerPad = Math.max(0, column - 1);

  return [
    formatLabel('Фрагмент кода'),
    `        ${gutter} ${tone(snippet, ANSI.yellow)}`,
    `             ${' '.repeat(pointerPad)}${tone('^', ANSI.bold, ANSI.red)}`,
  ];
}

function formatIssue(issue: GostIssue, index: number): string[] {
  const lines: string[] = [];

  lines.push(
    `    ${tone(`Нарушение #${index}`, ANSI.bold, ANSI.magenta)} ${formatSeverity(issue.severity)} ${tone(issue.title, ANSI.bold)}`,
  );
  lines.push(`      ${formatLabel('Где')}: ${tone(getIssueLocation(issue), ANSI.yellow)}`);
  lines.push(
    `      ${formatLabel('Правило')}: ${tone(issue.ruRuleCode, ANSI.bold, ANSI.blue)} ${tone('/', ANSI.gray)} ${tone(issue.axeRuleId, ANSI.blue)}`,
  );
  lines.push(
    `      ${formatLabel('Источник')}: ${tone(issue.origin, ANSI.green)} ${tone('•', ANSI.gray)} ${tone(issue.ruleSource, ANSI.green)}`,
  );
  lines.push(`      ${formatLabel('Описание')}:`);
  lines.push(...indentBlock(formatInlineCode(issue.description), '        '));
  lines.push(`      ${formatLabel('Текст ошибки')}:`);
  lines.push(...indentBlock(formatInlineCode(issue.sourceMessage), '        '));
  lines.push(...formatSourceSnippet(issue));
  lines.push(
    ...formatReferenceSection('Нормативные требования', collectNormativeReferences(issue)),
  );
  lines.push(`      ${formatLabel('Рекомендация по исправлению')}:`);
  lines.push(...indentBlock(formatInlineCode(issue.recommendation), '        '));

  if (issue.source?.note) {
    lines.push(`      ${formatLabel('Примечание')}: ${tone(issue.source.note, ANSI.gray)}`);
  }

  return lines;
}

/** Human readable terminal report grouped by page and WCAG principle. */
export function buildConsoleReport(result: AuditRunResult): string {
  const totalIssues = countIssues(result);
  const lines: string[] = [];

  lines.push(tone('ru-a11y CLI report', ANSI.bold, ANSI.white));
  lines.push(tone('═'.repeat(72), ANSI.gray));
  lines.push(
    `${formatLabel('Проверено страниц')}: ${tone(String(result.scannedPages), ANSI.bold)}`,
  );
  lines.push(
    `${formatLabel('Найдено нарушений')}: ${tone(String(totalIssues), ANSI.bold, totalIssues > 0 ? ANSI.red : ANSI.green)}`,
  );
  lines.push('');

  for (const page of result.pages) {
    lines.push(`${tone('Страница', ANSI.bold, ANSI.white)} ${tone(page.url, ANSI.cyan)}`);
    lines.push(`  ${formatLabel('Длительность')}: ${tone(`${page.durationMs} ms`, ANSI.gray)}`);

    if (page.error) {
      lines.push(`  ${formatLabel('Ошибка проверки')}: ${tone(page.error, ANSI.bold, ANSI.red)}`);
      lines.push('');
      continue;
    }

    if (page.issues.length === 0) {
      lines.push(`  ${tone('Нарушений не обнаружено.', ANSI.green)}`);
      lines.push('');
      continue;
    }

    const grouped = groupByPrinciple(page.issues);

    (Object.keys(grouped) as GostPrinciple[]).forEach((principleKey) => {
      const principleIssues = grouped[principleKey];
      if (principleIssues.length === 0) {
        return;
      }

      lines.push('');
      lines.push(
        `  ${tone(PRINCIPLE_LABELS[principleKey], ANSI.bold, ANSI.magenta)} ${tone(`(${principleIssues.length})`, ANSI.gray)}`,
      );

      principleIssues.forEach((issue, index) => {
        lines.push(...formatIssue(issue, index + 1));
        lines.push('');
      });
    });
  }

  return lines.join('\n').trimEnd();
}
