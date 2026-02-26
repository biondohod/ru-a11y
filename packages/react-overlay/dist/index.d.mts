import React from 'react';
import axe from 'axe-core';

/**
 * RuA11yOverlay.tsx — главный компонент оверлея проверки доступности
 *
 * Интеграция:
 * ```tsx
 * import { RuA11yOverlay } from 'ru-a11y-toolkit-overlay';
 *
 * root.render(
 *   <React.StrictMode>
 *     <App />
 *     {process.env.NODE_ENV === 'development' && <RuA11yOverlay />}
 *   </React.StrictMode>
 * );
 * ```
 *
 * Компонент НЕ рендерится в production-сборке — проверка process.env.NODE_ENV
 * гарантирует это при бандлинге (tree-shaking).
 */

interface RuA11yOverlayProps {
    /**
     * Дополнительный CSS-селектор для исключения из сканирования.
     * По умолчанию исключается сам оверлей ([data-ru-a11y-overlay]).
     */
    excludeSelector?: string;
    /**
     * Показывать ли подсветку всех нарушений одновременно (не только активного).
     * По умолчанию: false (подсвечивается только выбранный элемент).
     */
    highlightAll?: boolean;
    /**
     * Теги axe-core для запуска.
     * По умолчанию: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
     */
    axeTags?: string[];
    /**
     * Задержка дебаунса в мс перед повторным сканированием после изменений DOM.
     * По умолчанию: 1000 мс.
     */
    debounceMs?: number;
    /**
     * Автоматически запускать сканирование при изменениях DOM через MutationObserver.
     * По умолчанию: true.
     */
    autoScan?: boolean;
}
/**
 * Главный компонент оверлея.
 *
 * Жизненный цикл:
 * 1. При монтировании — запускает первоначальное сканирование axe-core
 * 2. Если autoScan=true — подключает MutationObserver для реактивного ресканирования
 * 3. При размонтировании — отключает наблюдатель и отменяет ожидающие операции
 */
declare function RuA11yOverlay({ excludeSelector, highlightAll, axeTags, debounceMs, autoScan, }?: RuA11yOverlayProps): React.ReactPortal;

/**
 * Маппинг правил axe-core на русскоязычные описания с привязкой к нормативным документам:
 *   - ГОСТ Р 52872-2019 «Интернет-ресурсы и другая информация, представленная в электронно-цифровой форме»
 *   - Постановление Правительства РФ №102 от 07.02.2026
 *   - WCAG 2.1 (Web Content Accessibility Guidelines)
 *
 * Данный файл является общим источником истины для всего ru-a11y-toolkit:
 * - ru-a11y-toolkit-overlay: использует для отображения в runtime UI
 * - ru-a11y-toolkit-eslint: использует как reference для сообщений об ошибках
 */
interface RuA11yRuleMeta {
    /** axe-core ruleId или внутренний идентификатор */
    id: string;
    /** Краткое название нарушения (RU) */
    title: string;
    /** Развернутое объяснение — что не так и почему это проблема (RU) */
    description: string;
    /** Пример исправления — 1-2 строки кода или совета (RU) */
    fix: string;
    /** Ссылка на пункт ГОСТ Р 52872-2019 */
    gost?: string;
    /** Ссылка на пункт Постановления №102 */
    post102?: string;
    /** Ссылка на Success Criterion WCAG */
    wcag?: string;
    /** Принцип WCAG для группировки: Воспринимаемость / Управляемость / Понятность / Надёжность */
    principle?: 'perceivable' | 'operable' | 'understandable' | 'robust';
    /** Степень серьёзности нарушения */
    severity: 'error' | 'warning';
}
/**
 * Сопоставление axe-core ruleId → метаданные нарушения на русском языке.
 *
 * Покрытие:
 * - Нетекстовый контент (WCAG 1.1)
 * - Медиа (WCAG 1.2)
 * - Адаптируемость (WCAG 1.3)
 * - Навигация с клавиатуры (WCAG 2.1, 2.4)
 * - Заголовки и метки (WCAG 2.4)
 * - Языковые атрибуты (WCAG 3.1)
 * - Совместимость (WCAG 4.1)
 */
declare const RU_A11Y_RULES: Record<string, RuA11yRuleMeta>;
/**
 * Список принципов WCAG с русскоязычными названиями для группировки в UI
 */
declare const WCAG_PRINCIPLES: Record<NonNullable<RuA11yRuleMeta['principle']>, string>;
/**
 * Возвращает метаданные правила по его ID.
 * Если правило не найдено в маппинге, возвращает fallback-описание на русском.
 */
declare function getRuleMeta(ruleId: string): RuA11yRuleMeta;

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

/** Одно конкретное нарушение (узел DOM + правило) */
interface A11yViolationNode {
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
interface ScanResult {
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
interface AxeRunnerConfig {
    /** Элемент, который нужно исключить из сканирования (сам оверлей) */
    excludeSelector?: string;
    /** Теги axe-core для запуска (по умолчанию wcag2a + wcag2aa) */
    tags?: string[];
    /** Дебаунс в мс перед повторным запуском после изменений DOM */
    debounceMs?: number;
}

export { type A11yViolationNode, type AxeRunnerConfig, RU_A11Y_RULES, RuA11yOverlay, type RuA11yOverlayProps, type RuA11yRuleMeta, type ScanResult, WCAG_PRINCIPLES, RuA11yOverlay as default, getRuleMeta };
