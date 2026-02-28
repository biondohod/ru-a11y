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
  serious:  'Серьёзное',
  moderate: 'Умеренное',
  minor:    'Незначительное',
};

/**
 * Извлекает число контрастности из failureSummary axe-core для правила color-contrast.
 * Формат строки: "...color contrast of 3.76 (foreground..."
 */
function parseContrastRatio(failureSummary?: string): string | null {
  if (!failureSummary) return null;
  const match = failureSummary.match(/contrast of ([\d.]+)/);
  return match ? match[1] : null;
}

export function ErrorItem({ violation, isActive, onSelect }: ErrorItemProps) {
  const [expanded, setExpanded] = useState(false);
  const { meta } = violation;
  const isError = meta.severity === 'error';

  const dotColor = isError ? COLORS.errorBorder : COLORS.warningBorder;
  const contrastRatio = violation.ruleId === 'color-contrast'
    ? parseContrastRatio(violation.failureSummary)
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
        {contrastRatio && (
          <span style={{
            fontSize: FONTS.sizeSm,
            fontWeight: 700,
            color: COLORS.badgeError,
            flexShrink: 0,
          }}>
            {contrastRatio}:1
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
            {meta.wcag   && <span style={tagConfig} title="WCAG">{meta.wcag}</span>}
            {meta.gost   && <span style={tagConfig} title="ГОСТ">{meta.gost}</span>}
            {meta.post102 && <span style={tagConfig} title="Постановление №102">{meta.post102}</span>}
          </div>
        </div>
      )}

      {/* Кнопка разворачивания */}
      <button
        onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
        aria-expanded={expanded}
        aria-label={expanded ? 'Скрыть детали нарушения' : 'Показать детали нарушения'}
        style={expandButtonConfig}
      >
        {expanded ? '▲ Скрыть' : '▼ Подробнее'}
      </button>
    </div>
  );
}
