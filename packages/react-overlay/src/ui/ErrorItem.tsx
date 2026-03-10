/**
 * ErrorItem.tsx — один элемент нарушения доступности в списке
 */

import React, { useState } from 'react';
import {
  itemConfig,
  itemActiveConfig,
  itemHeaderConfig,
  severityDotErrorConfig,
  severityDotWarningConfig,
  itemTitleConfig,
  impactLabelConfig,
  selectorConfig,
  detailsConfig,
  descriptionConfig,
  fixBlockConfig,
  fixLabelConfig,
  fixTextConfig,
  tagListConfig,
  tagConfig,
  expandButtonConfig,
} from './styles/errorConfig';
import { COLORS, FONTS } from './styles/tokens';
import type { A11yViolationNode } from '../axeRunner';

interface ErrorItemProps {
  violation: A11yViolationNode;
  isActive: boolean;
  onSelect: (violation: A11yViolationNode | null) => void;
}

const IMPACT_LABELS: Record<string, string> = {
  critical: 'Критическое',
  serious: 'Серьёзное',
  moderate: 'Умеренное',
  minor: 'Незначительное',
};

/**
 * Извлекает фактическое и требуемое соотношения контрастности из failureSummary axe-core.
 * Формат строки: "...color contrast of 3.76 (foreground... Expected contrast ratio of 4.5:1"
 */
function parseContrastData(failureSummary?: string): { actual: string; required: string } | null {
  if (!failureSummary) return null;
  const actualMatch = failureSummary.match(/contrast of ([\d.]+)/);
  const requiredMatch = failureSummary.match(/Expected contrast ratio of ([\d.]+)/);
  if (!actualMatch) return null;
  return {
    actual: actualMatch[1],
    required: requiredMatch ? requiredMatch[1] : '',
  };
}

export function ErrorItem({ violation, isActive, onSelect }: ErrorItemProps) {
  const [expanded, setExpanded] = useState(false);
  const { meta } = violation;
  const isError = meta.severity === 'error';

  const dotColor = isError ? COLORS.errorBorder : COLORS.warningBorder;
  const contrastData =
    violation.ruleId === 'color-contrast' || violation.ruleId === 'color-contrast-enhanced'
      ? parseContrastData(violation.failureSummary)
      : null;

  const handleClick = () => {
    onSelect(isActive ? null : violation);
    setExpanded(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
      aria-label={`${meta.title}. Нажмите, чтобы подсветить элемент на странице.`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={{
        ...(isActive ? itemActiveConfig : itemConfig),
        outline: isActive ? `2px solid ${dotColor}33` : 'none',
        outlineOffset: '-2px',
      }}
    >
      {/* Заголовок */}
      <div style={itemHeaderConfig}>
        <div
          style={isError ? severityDotErrorConfig : severityDotWarningConfig}
          aria-hidden="true"
        />
        <span style={itemTitleConfig}>{meta.title}</span>
        {contrastData && (
          <span
            style={{
              fontSize: FONTS.sizeSm,
              fontWeight: 700,
              color: COLORS.badgeError,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '1px',
            }}
          >
            <span title="Фактический контраст">факт: {contrastData.actual}:1</span>
            {contrastData.required && (
              <span
                title="Требуемый минимальный контраст"
                style={{ color: COLORS.mutedText, fontWeight: 400 }}
              >
                нужно: {contrastData.required}:1
              </span>
            )}
          </span>
        )}
        {violation.impact && (
          <span style={impactLabelConfig}>
            {IMPACT_LABELS[violation.impact] ?? violation.impact}
          </span>
        )}
      </div>

      {/* CSS-селектор */}
      <code style={selectorConfig} title={violation.selector}>
        {violation.selector}
      </code>

      {/* Раскрываемое описание */}
      {expanded && (
        <div style={detailsConfig}>
          <p style={descriptionConfig}>{meta.description}</p>

          {/* Совет по исправлению */}
          <div style={fixBlockConfig}>
            <div style={fixLabelConfig}>Как исправить</div>
            <p style={fixTextConfig}>{meta.fix}</p>
          </div>

          {/* Нормативные ссылки */}
          <div style={tagListConfig}>
            {meta.wcag && (
              <span style={tagConfig} title="WCAG">
                {meta.wcag}
              </span>
            )}
            {meta.gost && (
              <span style={tagConfig} title="ГОСТ">
                {meta.gost}
              </span>
            )}
            {meta.post102 && (
              <span style={tagConfig} title="Постановление №102">
                {meta.post102}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Кнопка разворачивания */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setExpanded((v) => !v);
        }}
        aria-expanded={expanded}
        aria-label={expanded ? 'Скрыть детали нарушения' : 'Показать детали нарушения'}
        style={expandButtonConfig}
      >
        {expanded ? '▲ Скрыть' : '▼ Подробнее'}
      </button>
    </div>
  );
}
