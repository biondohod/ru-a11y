import type { AuditRunResult, GostIssue, GostPrinciple } from '../types';

const PRINCIPLE_LABELS: Record<GostPrinciple, string> = {
  воспринимаемость: 'Воспринимаемость',
  управляемость: 'Управляемость',
  понятность: 'Понятность',
  надежность: 'Надежность',
};

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

/**
 * Генерирует человекочитаемый отчет для терминала.
 */
export function buildConsoleReport(result: AuditRunResult): string {
  const totalIssues = result.pages.reduce((acc, page) => acc + page.issues.length, 0);

  const lines: string[] = [];
  lines.push('=== Результаты проверки ru-a11y ===');
  lines.push(`Проверено страниц: ${result.scannedPages}`);
  lines.push(`Выявлено нарушений: ${totalIssues}`);
  lines.push('');

  for (const page of result.pages) {
    lines.push(`URL: ${page.url}`);

    if (page.error) {
      lines.push(`  Ошибка проверки: ${page.error}`);
      lines.push('');
      continue;
    }

    if (page.issues.length === 0) {
      lines.push('  Нарушений не обнаружено.');
      lines.push('');
      continue;
    }

    const grouped = groupByPrinciple(page.issues);

    (Object.keys(grouped) as GostPrinciple[]).forEach((principleKey) => {
      const principleIssues = grouped[principleKey];
      if (principleIssues.length === 0) {
        return;
      }

      lines.push(`  ${PRINCIPLE_LABELS[principleKey]} (${principleIssues.length}):`);
      principleIssues.forEach((issue) => {
        lines.push(`    - [${issue.severity}] ${issue.title}`);
        lines.push(`      Селектор: ${issue.selector}`);
        lines.push(`      Правило: ${issue.ruRuleCode} / axe: ${issue.axeRuleId}`);
        lines.push(`      Источник правила: ${issue.ruleSource}; тип: ${issue.origin}`);
        if (issue.source?.filePath) {
          lines.push(
            `      Source: ${issue.source.filePath}:${issue.source.line ?? '?'}:${issue.source.column ?? '?'}`,
          );
        } else if (issue.source?.selector) {
          lines.push(`      Source selector: ${issue.source.selector}`);
        }
        lines.push(`      ГОСТ: ${issue.gostRefs.join('; ')}`);
        lines.push(`      Постановление №102: ${issue.post102Refs.join('; ')}`);
        lines.push(`      Рекомендация: ${issue.recommendation}`);
      });
    });

    lines.push('');
  }

  return lines.join('\n');
}

