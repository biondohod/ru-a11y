/**
 * axeRunner.ts — модуль запуска axe-core и преобразования результатов
 *
 * Стратегия проверки: MutationObserver
 * Выбрана вместо setInterval по следующим причинам:
 * - Реагирует только на реальные изменения DOM, не опрашивает DOM впустую
 * - Меньше нагрузка на CPU в состоянии покоя
 * - Более предсказуемое поведение в SPA с частыми обновлениями
 *
 * Недостаток: не реагирует на изменения атрибутов глубоко вложенных элементов
 * без subtree: true (что учтено в конфигурации).
 */

import axe from 'axe-core';
import { getRuleMeta, type RuA11yRuleMeta } from './mapping/rulesMap';

/** Одно конкретное нарушение (узел DOM + правило) */
export interface A11yViolationNode {
  /** Уникальный ключ для React (ruleId + xpath) */
  key: string;
  /** Правило axe-core */
  ruleId: string;
  /** Метаданные правила с русскоязычным описанием */
  meta: RuA11yRuleMeta;
  /** CSS-селектор проблемного элемента */
  selector: string;
  /** Полное дерево целевых элементов для подсветки */
  targets: string[][];
  /** HTML-сниппет проблемного элемента */
  html: string;
  /** Оценка влияния от axe-core ('critical' | 'serious' | 'moderate' | 'minor') */
  impact: axe.ImpactValue;
  /** Дополнительное сообщение от axe о конкретном нарушении */
  failureSummary?: string;
}

/** Результат одного сканирования */
export interface ScanResult {
  /** Список всех нарушений */
  violations: A11yViolationNode[];
  /** Время последнего сканирования */
  scannedAt: Date;
  /** Количество ошибок по severity */
  counts: {
    error: number;
    warning: number;
  };
}

/** Конфигурация axe-runner */
export interface AxeRunnerConfig {
  /** Элемент, который нужно исключить из сканирования (сам оверлей) */
  excludeSelector?: string;
  /** Теги axe-core для запуска (по умолчанию wcag2a + wcag2aa) */
  tags?: string[];
  /** Дебаунс в мс перед повторным запуском после изменений DOM */
  debounceMs?: number;
}

const DEFAULT_CONFIG: Required<AxeRunnerConfig> = {
  excludeSelector: '[data-ru-a11y-overlay]',
  tags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
  debounceMs: 1000,
};

/**
 * Преобразует результаты axe-core в плоский список нарушений с русскоязычными метаданными
 */
function mapAxeViolations(violations: axe.Result[]): A11yViolationNode[] {
  const result: A11yViolationNode[] = [];

  for (const violation of violations) {
    for (const node of violation.nodes) {
      const selector = node.target.join(', ');
      const key = `${violation.id}::${selector}`;

      result.push({
        key,
        ruleId: violation.id,
        meta: getRuleMeta(violation.id),
        selector,
        targets: node.target.map((t) => (Array.isArray(t) ? t : [t as string])),
        html: node.html,
        impact: node.impact ?? violation.impact ?? 'minor',
        failureSummary: node.failureSummary,
      });
    }
  }

  return result;
}

/**
 * Подсчитывает количество нарушений по severity
 */
function countViolations(violations: A11yViolationNode[]): ScanResult['counts'] {
  return violations.reduce(
    (acc, v) => {
      if (v.meta.severity === 'error') acc.error++;
      else acc.warning++;
      return acc;
    },
    { error: 0, warning: 0 },
  );
}

/**
 * Запускает axe-core на текущем документе.
 * Возвращает промис с результатами сканирования.
 */
export async function runAxeScan(config: AxeRunnerConfig = {}): Promise<ScanResult> {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  try {
    const runOptions: axe.RunOptions = {
      runOnly: {
        type: 'tag',
        values: cfg.tags,
      },
    };

    // exclude передаётся как часть контекста (второй аргумент — ElementContext),
    // а не как RunOptions — это правильный способ исключения элементов в axe-core API
    const context: axe.ElementContext = cfg.excludeSelector
      ? { include: [['html']], exclude: [[cfg.excludeSelector]] }
      : document;

    const results = await axe.run(context, runOptions);
    const violations = mapAxeViolations(results.violations);

    return {
      violations,
      scannedAt: new Date(),
      counts: countViolations(violations),
    };
  } catch (error) {
    console.error('[ru-a11y-overlay] Ошибка при запуске axe-core:', error);
    return {
      violations: [],
      scannedAt: new Date(),
      counts: { error: 0, warning: 0 },
    };
  }
}

/**
 * Создаёт MutationObserver, который перезапускает axe при изменениях DOM.
 * Использует дебаунс для предотвращения лишних запусков при множественных изменениях.
 *
 * @param onResult — колбэк, вызываемый с новыми результатами
 * @param config — конфигурация
 * @returns функция отключения наблюдателя
 */
export function createDomObserver(
  onResult: (result: ScanResult) => void,
  config: AxeRunnerConfig = {},
): () => void {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let isRunning = false;

  const scheduleRun = () => {
    // Если сканирование уже идёт — не планируем ещё одно до завершения
    if (isRunning) return;

    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(async () => {
      isRunning = true;
      try {
        const result = await runAxeScan(config);
        onResult(result);
      } finally {
        isRunning = false;
      }
    }, cfg.debounceMs);
  };

  const observer = new MutationObserver((mutations) => {
    // Фильтруем мутации, которые исходят от самого оверлея
    const isOverlayMutation = mutations.every((m) => {
      const target = m.target as Element;
      return target.closest?.(cfg.excludeSelector) !== null;
    });

    if (!isOverlayMutation) {
      scheduleRun();
    }
  });

  observer.observe(document.body, {
    childList: true,   // отслеживаем добавление/удаление элементов
    subtree: true,     // включая вложенные элементы
    attributes: true,  // отслеживаем изменение атрибутов (alt, aria-*, role и т.д.)
    attributeFilter: [ // только значимые для доступности атрибуты
      'alt', 'aria-label', 'aria-labelledby', 'aria-describedby',
      'aria-hidden', 'role', 'tabindex', 'href', 'lang', 'title',
      'for', 'id', 'type', 'disabled',
    ],
  });

  return () => {
    observer.disconnect();
    if (debounceTimer) clearTimeout(debounceTimer);
  };
}



