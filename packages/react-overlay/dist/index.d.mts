import React from 'react';
import axe from 'axe-core';

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
/**
 * Пресеты проверки — соответствуют пресетам eslint-preset:
 * - recommended: базовый уровень WCAG 2.1 AA (wcag2a + wcag21a + wcag2aa + wcag21aa)
 * - gost-aa: уровень AA + best-practice, ориентирован на ГОСТ/Постановление №102
 * - strict: максимально строгий, включает AAA и experimental
 */
type AxePreset = 'recommended' | 'gost-aa' | 'strict';
/** Маппинг пресетов на теги axe-core */
declare const PRESET_TAGS: Record<AxePreset, string[]>;
/** Конфигурация axe-runner */
interface AxeRunnerConfig {
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
     * Пресет правил проверки. Соответствует пресетам eslint-preset:
     * - 'recommended' (по умолчанию): WCAG 2.1 AA — базовые критические проверки
     * - 'gost-aa': WCAG 2.1 AA + best-practice, ориентирован на ГОСТ/Постановление №102
     * - 'strict': максимальный — включает AAA и экспериментальные правила
     */
    preset?: AxePreset;
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
declare function RuA11yOverlay({ excludeSelector, preset, debounceMs, autoScan, }?: RuA11yOverlayProps): React.ReactPortal;

export { type A11yViolationNode, type AxePreset, type AxeRunnerConfig, PRESET_TAGS, RU_A11Y_RULES, RuA11yOverlay, type RuA11yOverlayProps, type RuA11yRuleMeta, type ScanResult, WCAG_PRINCIPLES, RuA11yOverlay as default, getRuleMeta };
