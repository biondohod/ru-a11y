/**
 * ErrorItem.tsx — один элемент нарушения доступности в списке
 */

import React, { useState } from 'react';
import { panelStyles, COLORS } from './styles';
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

export function ErrorItem({ violation, isActive, onSelect }: ErrorItemProps) {
  const [expanded, setExpanded] = useState(false);
  const { meta } = violation;
  const isError = meta.severity === 'error';

  const handleClick = () => {
    const nextActive = isActive ? null : violation;
    onSelect(nextActive);
    setExpanded(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const dotColor = isError ? COLORS.highlightErrorBorder : COLORS.highlightWarningBorder;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
      aria-label={`${meta.title}. Нажмите, чтобы подсветить элемент на странице.`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={{
        ...panelStyles.errorItem,
        ...(isActive ? panelStyles.errorItemActive : {}),
        outline: isActive ? `2px solid ${dotColor}33` : 'none',
        outlineOffset: '-2px',
      }}
    >
      {/* Заголовок нарушения */}
      <div style={panelStyles.errorItemTitle}>
        <div
          style={{
            ...panelStyles.errorSeverityDot,
            backgroundColor: dotColor,
          }}
          aria-hidden="true"
        />
        <span style={panelStyles.errorTitle}>{meta.title}</span>
        {violation.impact && (
          <span
            style={{
              marginLeft: 'auto',
              fontSize: '10px',
              color: '#a6adc8',
              flexShrink: 0,
            }}
          >
            {IMPACT_LABELS[violation.impact] ?? violation.impact}
          </span>
        )}
      </div>

      {/* CSS-селектор */}
      <code
        title={violation.selector}
        style={panelStyles.errorSelector}
      >
        {violation.selector}
      </code>

      {/* Раскрываемое описание */}
      {expanded && (
        <div style={{ marginTop: '8px' }}>
          <p style={{ ...panelStyles.errorDescription, marginTop: 0 }}>
            {meta.description}
          </p>

          {/* Совет по исправлению */}
          <div
            style={{
              backgroundColor: '#1e1e2e',
              border: `1px solid ${COLORS.panelBorder}`,
              borderRadius: '6px',
              padding: '8px 10px',
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: COLORS.badgeWarning,
                marginBottom: '4px',
              }}
            >
              Как исправить
            </div>
            <p style={{ ...panelStyles.errorDescription, margin: 0 }}>
              {meta.fix}
            </p>
          </div>

          {/* Нормативные ссылки */}
          <div style={panelStyles.errorMeta}>
            {meta.wcag && (
              <span style={panelStyles.errorTag} title="WCAG">
                {meta.wcag}
              </span>
            )}
            {meta.gost && (
              <span style={panelStyles.errorTag} title="ГОСТ">
                {meta.gost}
              </span>
            )}
            {meta.post102 && (
              <span style={panelStyles.errorTag} title="Постановление №102">
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
        style={{
          display: 'block',
          marginTop: '6px',
          background: 'none',
          border: 'none',
          color: COLORS.link,
          cursor: 'pointer',
          fontSize: '11px',
          padding: 0,
          textAlign: 'left',
        }}
      >
        {expanded ? '▲ Скрыть' : '▼ Подробнее'}
      </button>
    </div>
  );
}

