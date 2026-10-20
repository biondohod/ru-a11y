import { useState } from 'react';
import type { A11yViolationNode } from '../axeRunner';
import {
  contrastConfig,
  contrastRequiredConfig,
  descriptionConfig,
  detailsConfig,
  expandButtonConfig,
  fixBlockConfig,
  fixLabelConfig,
  fixTextConfig,
  impactLabelConfig,
  itemActiveConfig,
  itemConfig,
  itemHeaderConfig,
  itemSelectButtonConfig,
  itemTitleConfig,
  selectorConfig,
  severityDotErrorConfig,
  severityDotWarningConfig,
  sourceBadgeConfig,
  tagConfig,
  tagListConfig,
} from './styles/errorConfig';
import { COLORS } from './styles/tokens';

interface ErrorItemProps {
  violation: A11yViolationNode;
  isActive: boolean;
  onSelect: (violation: A11yViolationNode | null) => void;
}

const IMPACT_LABELS: Readonly<Record<string, string>> = {
  critical: 'Критическое',
  serious: 'Серьёзное',
  moderate: 'Умеренное',
  minor: 'Незначительное',
};

const CONTRAST_RULES = new Set(['color-contrast', 'color-contrast-enhanced']);

interface ContrastData {
  actual: string;
  required: string;
}

/**
 * Pulls the actual and expected ratios out of axe's failure summary:
 * "...color contrast of 3.76 (foreground ...). Expected contrast ratio of 4.5:1".
 */
export function parseContrastData(failureSummary?: string): ContrastData | null {
  const actual = failureSummary?.match(/contrast of ([\d.]+)/)?.[1];
  if (!actual) return null;

  return {
    actual,
    required: failureSummary?.match(/Expected contrast ratio of ([\d.]+)/)?.[1] ?? '',
  };
}

function NormativeTags({ violation }: { violation: A11yViolationNode }) {
  const { wcag, gost, post102 } = violation.meta;
  const tags = [
    { title: 'WCAG', value: wcag },
    { title: 'ГОСТ', value: gost },
    { title: 'Постановление №102', value: post102 },
  ].filter((tag): tag is { title: string; value: string } => Boolean(tag.value));

  return (
    <div style={tagListConfig}>
      {tags.map(({ title, value }) => (
        <span key={title} style={tagConfig} title={title}>
          {value}
        </span>
      ))}
    </div>
  );
}

/** One violation card: a select button (highlights the element) and an expandable explanation. */
export function ErrorItem({ violation, isActive, onSelect }: ErrorItemProps) {
  const [expanded, setExpanded] = useState(false);
  const { meta } = violation;
  const isError = meta.severity === 'error';
  const accentColor = isError ? COLORS.errorBorder : COLORS.warningBorder;
  const contrast = CONTRAST_RULES.has(violation.ruleId)
    ? parseContrastData(violation.failureSummary)
    : null;

  const select = () => {
    onSelect(isActive ? null : violation);
    setExpanded(true);
  };

  return (
    <div
      style={{
        ...(isActive ? itemActiveConfig : itemConfig),
        outline: isActive ? `2px solid ${accentColor}33` : 'none',
        outlineOffset: '-2px',
      }}
    >
      <button
        type="button"
        onClick={select}
        aria-pressed={isActive}
        aria-label={`${meta.title}. Подсветить элемент на странице.`}
        style={itemSelectButtonConfig}
      >
        <span style={itemHeaderConfig}>
          <span
            style={isError ? severityDotErrorConfig : severityDotWarningConfig}
            aria-hidden="true"
          />
          <span style={itemTitleConfig}>{meta.title}</span>
          {violation.source === 'ru-a11y' && (
            <span style={sourceBadgeConfig} title="Дополнительное runtime-правило ru-a11y">
              ru-a11y
            </span>
          )}
          {contrast && (
            <span style={contrastConfig}>
              <span title="Фактический контраст">факт: {contrast.actual}:1</span>
              {contrast.required && (
                <span title="Требуемый минимальный контраст" style={contrastRequiredConfig}>
                  нужно: {contrast.required}:1
                </span>
              )}
            </span>
          )}
          {violation.impact && (
            <span style={impactLabelConfig}>
              {IMPACT_LABELS[violation.impact] ?? violation.impact}
            </span>
          )}
        </span>

        <code style={selectorConfig} title={violation.selector}>
          {violation.selector}
        </code>
      </button>

      {expanded && (
        <div style={detailsConfig}>
          <p style={descriptionConfig}>{meta.description}</p>

          <div style={fixBlockConfig}>
            <div style={fixLabelConfig}>Как исправить</div>
            <p style={fixTextConfig}>{meta.fix}</p>
          </div>

          <NormativeTags violation={violation} />
        </div>
      )}

      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        aria-label={expanded ? 'Скрыть детали нарушения' : 'Показать детали нарушения'}
        style={expandButtonConfig}
      >
        {expanded ? '▲ Скрыть' : '▼ Подробнее'}
      </button>
    </div>
  );
}
