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

/**
 * Пресеты проверки — соответствуют пресетам eslint-preset:
 * - recommended: базовый уровень WCAG 2.1 AA (wcag2a + wcag21a + wcag2aa + wcag21aa)
 * - gost-aa: уровень AA + best-practice, ориентирован на ГОСТ/Постановление №102
 * - strict: максимально строгий, включает AAA и experimental
 */
export type AxePreset = 'recommended' | 'gost-aa' | 'strict';

/** Маппинг пресетов на теги axe-core */
export const PRESET_TAGS: Record<AxePreset, string[]> = {
  'recommended': ['wcag2a', 'wcag21a', 'wcag2aa', 'wcag21aa'],
  'gost-aa':     ['wcag2a', 'wcag21a', 'wcag2aa', 'wcag21aa', 'best-practice'],
  'strict':      ['wcag2a', 'wcag21a', 'wcag2aa', 'wcag21aa', 'wcag2aaa', 'wcag21aaa', 'best-practice'],
};

/** Конфигурация axe-runner */
export interface AxeRunnerConfig {
  /** Элемент, который нужно исключить из сканирования (сам оверлей) */
  excludeSelector?: string;
  /**
   * Пресет правил: 'recommended' | 'gost-aa' | 'strict'.
   * Если не указан — используется 'recommended'.
   * Если указаны явные tags — они имеют приоритет над пресетом.
   */
  preset?: AxePreset;
  /** Явный список тегов axe-core (переопределяет preset) */
  tags?: string[];
  /** Дебаунс в мс перед повторным запуском после изменений DOM */
  debounceMs?: number;
}

const DEFAULT_CONFIG = {
  excludeSelector: '[data-ru-a11y-overlay]',
  preset: 'recommended' as AxePreset,
  debounceMs: 1000,
};

/** Получает итоговый список тегов с учётом пресета и явных тегов */
function resolveTags(config: AxeRunnerConfig): string[] {
  if (config.tags && config.tags.length > 0) return config.tags;
  const preset = config.preset ?? DEFAULT_CONFIG.preset;
  return PRESET_TAGS[preset];
}

/** Флаг для предотвращения параллельных запусков axe-core */
let axeRunning = false;

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
 *
 * Защита от параллельных запусков: axe-core не поддерживает одновременный запуск
 * нескольких экземпляров. Если сканирование уже идёт — возвращаем пустой результат.
 */
export async function runAxeScan(config: AxeRunnerConfig = {}): Promise<ScanResult> {
  console.log('[ru-a11y-overlay] runAxeScan вызван, axeRunning =', axeRunning);
  // Защита от параллельных запусков (React StrictMode монтирует дважды)
  if (axeRunning) {
    console.warn('[ru-a11y-overlay] ⚠️ axeRunning=true — пропускаем запуск');
    return { violations: [], scannedAt: new Date(), counts: { error: 0, warning: 0 } };
  }

  axeRunning = true;

  try {
    const tags = resolveTags(config);
    const excludeSelector = config.excludeSelector ?? DEFAULT_CONFIG.excludeSelector;

    const runOptions: axe.RunOptions = {
      runOnly: {
        type: 'tag',
        values: tags,
      },
      // Отключаем сканирование iframes — предотвращает ошибки с cross-origin фреймами
      iframes: false,
    };

    // Контекст сканирования: исключаем сам оверлей.
    // axe-core требует формат exclude как массив массивов CSS-селекторов: [[selector]].
    const context: axe.ElementContext = excludeSelector
      ? { exclude: [[excludeSelector]] }
      : document;

    const results = await axe.run(context, runOptions);

    console.group('[ru-a11y-overlay] 🔍 Результаты axe-core');
    console.log('Теги:', tags);
    console.log('Контекст:', context);
    console.log('Всего нарушений (violations):', results.violations.length);
    console.log('Прошло (passes):', results.passes.length);
    console.log('Неприменимо (inapplicable):', results.inapplicable.length);
    console.log('Неполные (incomplete):', results.incomplete.length);
    if (results.violations.length > 0) {
      console.table(results.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.length,
      })));
      console.log('Полные данные violations:', results.violations);
    } else {
      console.warn('⚠️ violations пустой! Проверь теги и контекст выше.');
    }
    console.groupEnd();

    const violations = mapAxeViolations(results.violations);

    console.log('[ru-a11y-overlay] После mapAxeViolations:', violations.length, 'нарушений');
    violations.forEach(v => {
      console.log(`  → [${v.meta.severity}] ${v.ruleId}: ${v.meta.title} | selector: ${v.selector}`);
    });

    return {
      violations,
      scannedAt: new Date(),
      counts: countViolations(violations),
    };
  } catch (error) {
    console.error('[ru-a11y-overlay] ❌ axe.run упал с ошибкой:', error);
    return {
      violations: [],
      scannedAt: new Date(),
      counts: { error: 0, warning: 0 },
    };
  } finally {
    axeRunning = false;
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
  const excludeSelector = config.excludeSelector ?? DEFAULT_CONFIG.excludeSelector;
  const debounceMs = config.debounceMs ?? DEFAULT_CONFIG.debounceMs;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const scheduleRun = () => {
    if (debounceTimer) clearTimeout(debounceTimer);

    // Если сканирование уже идёт — планируем следующее на момент его завершения
    // (ждём debounceMs после того, как axeRunning станет false)
    const delay = axeRunning ? debounceMs + 500 : debounceMs;

    debounceTimer = setTimeout(async () => {
      // На случай если предыдущий скан ещё не успел завершиться — ждём ещё
      if (axeRunning) {
        scheduleRun();
        return;
      }
      const result = await runAxeScan(config);
      onResult(result);
    }, delay);
  };

  const observer = new MutationObserver((mutations) => {
    // Фильтруем мутации, которые исходят от самого оверлея
    const isOverlayMutation = mutations.every((m) => {
      const target = m.target as Element;
      return target.closest?.(excludeSelector) !== null;
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



