/**
 * ErrorList.tsx — список нарушений с группировкой по принципам WCAG
 */

import React, { useMemo, useState } from 'react';
import { panelStyles, COLORS } from './styles';
import { ErrorItem } from './ErrorItem';
import { WCAG_PRINCIPLES } from '../mapping/rulesMap';
import type { A11yViolationNode } from '../axeRunner';

interface ErrorListProps {
  violations: A11yViolationNode[];
  activeViolation: A11yViolationNode | null;
  onSelect: (violation: A11yViolationNode | null) => void;
}

type GroupKey = keyof typeof WCAG_PRINCIPLES | 'other';

const GROUP_ORDER: GroupKey[] = ['perceivable', 'operable', 'understandable', 'robust', 'other'];

const GROUP_LABELS: Record<GroupKey, string> = {
  ...WCAG_PRINCIPLES,
  other: 'Прочие нарушения',
};

export function ErrorList({ violations, activeViolation, onSelect }: ErrorListProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<GroupKey>>(new Set());

  // Группируем нарушения по принципу WCAG
  const groups = useMemo(() => {
    const map = new Map<GroupKey, A11yViolationNode[]>();

    for (const group of GROUP_ORDER) {
      map.set(group, []);
    }

    for (const v of violations) {
      const principle = (v.meta.principle as GroupKey | undefined) ?? 'other';
      const key: GroupKey = principle in GROUP_LABELS ? principle : 'other';
      map.get(key)!.push(v);
    }

    // Убираем пустые группы
    return GROUP_ORDER.filter((g) => (map.get(g)?.length ?? 0) > 0).map((g) => ({
      key: g,
      label: GROUP_LABELS[g],
      items: map.get(g)!,
    }));
  }, [violations]);

  if (violations.length === 0) {
    return (
      <div style={panelStyles.emptyState} role="status">
        <div style={panelStyles.emptyIcon} aria-hidden="true">
          ✅
        </div>
        <p style={panelStyles.emptyText}>Нарушений не обнаружено</p>
        <p style={panelStyles.emptySubtext}>
          Это не означает полного отсутствия проблем — axe-core находит ~57% нарушений.
          Используйте ручное тестирование и{' '}
          <span style={{ color: COLORS.link }}>ru-a11y-toolkit-eslint</span> для полного покрытия.
        </p>
      </div>
    );
  }

  const toggleGroup = (key: GroupKey) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div role="list" aria-label="Список нарушений доступности">
      {groups.map(({ key, label, items }) => {
        const isCollapsed = collapsedGroups.has(key);
        const errorCount = items.filter((v) => v.meta.severity === 'error').length;
        const warnCount = items.filter((v) => v.meta.severity === 'warning').length;

        return (
          <div key={key} role="listitem">
            {/* Заголовок группы */}
            <button
              style={panelStyles.groupHeader}
              onClick={() => toggleGroup(key)}
              aria-expanded={!isCollapsed}
              aria-controls={`group-${key}`}
            >
              <span>{label}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {errorCount > 0 && (
                  <span
                    style={{
                      ...panelStyles.badge,
                      ...panelStyles.badgeError,
                    }}
                    aria-label={`${errorCount} ошибок`}
                  >
                    {errorCount}
                  </span>
                )}
                {warnCount > 0 && (
                  <span
                    style={{
                      ...panelStyles.badge,
                      ...panelStyles.badgeWarning,
                    }}
                    aria-label={`${warnCount} предупреждений`}
                  >
                    {warnCount}
                  </span>
                )}
                <span aria-hidden="true" style={{ fontSize: '10px', marginLeft: '2px' }}>
                  {isCollapsed ? '▶' : '▼'}
                </span>
              </span>
            </button>

            {/* Элементы группы */}
            {!isCollapsed && (
              <div id={`group-${key}`}>
                {items.map((v) => (
                  <ErrorItem
                    key={v.key}
                    violation={v}
                    isActive={activeViolation?.key === v.key}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

