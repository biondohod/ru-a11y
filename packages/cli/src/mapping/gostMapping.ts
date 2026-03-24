import type { AxeIssueType, GostIssue, GostPrinciple, GostSeverity } from '../types';

/**
 * Метаданные внутреннего правила ru-a11y и его связь с axe-core.
 */
export interface GostRuleDefinition {
  code: string;
  axeRuleIds: string[];
  title: string;
  description: string;
  recommendation: string;
  principle: GostPrinciple;
  defaultSeverity: GostSeverity;
  gostRefs: string[];
  post102Refs: string[];
  wcagRefs: string[];
}

/**
 * Временное core-ядро для CLI. В будущем блок можно вынести в отдельный пакет @ru-a11y-toolkit-core.
 */
export const GOST_RULES: GostRuleDefinition[] = [
  {
    code: 'RU_GOST_NAV_SKIP_LINK',
    axeRuleIds: ['bypass'],
    title: 'Отсутствует ссылка пропуска навигации',
    description:
      'Пользователь клавиатуры или скринридера вынужден проходить повторяющиеся блоки меню перед основным контентом.',
    recommendation:
      'Добавьте в начало страницы ссылку вида <a href="#main">Перейти к содержанию</a> и соответствующий id у основного блока.',
    principle: 'управляемость',
    defaultSeverity: 'существенное',
    gostRefs: ['ГОСТ Р 52872-2012, п. 5.2.3'],
    post102Refs: ['Постановление Правительства РФ №102 от 07.02.2026, п. а)'],
    wcagRefs: ['WCAG 2.1, 2.4.1 Bypass Blocks'],
  },
  {
    code: 'RU_GOST_TEXT_CONTRAST',
    axeRuleIds: ['color-contrast', 'color-contrast-enhanced'],
    title: 'Недостаточный контраст текста',
    description: 'Контраст текста и фона ниже нормативного минимума, что затрудняет чтение для слабовидящих пользователей.',
    recommendation:
      'Измените цвет текста или фона так, чтобы достичь требуемого коэффициента контрастности (обычно не ниже 4.5:1).',
    principle: 'воспринимаемость',
    defaultSeverity: 'критичное',
    gostRefs: ['ГОСТ Р 52872-2012, п. 5.1.4'],
    post102Refs: ['Постановление Правительства РФ №102 от 07.02.2026, п. в)'],
    wcagRefs: ['WCAG 2.1, 1.4.3 Contrast (Minimum)'],
  },
  {
    code: 'RU_GOST_PAGE_TITLE',
    axeRuleIds: ['document-title'],
    title: 'Не задан заголовок страницы',
    description: 'Отсутствие корректного <title> мешает пользователю понять контекст страницы при переходах.',
    recommendation: 'Добавьте информативный элемент <title> в блоке <head> с темой и назначением страницы.',
    principle: 'понятность',
    defaultSeverity: 'существенное',
    gostRefs: ['ГОСТ Р 52872-2012, п. 5.2.2'],
    post102Refs: ['Постановление Правительства РФ №102 от 07.02.2026, п. е)'],
    wcagRefs: ['WCAG 2.1, 2.4.2 Page Titled'],
  },
];

const FALLBACK_RULE: GostRuleDefinition = {
  code: 'RU_GOST_GENERIC',
  axeRuleIds: [],
  title: 'Обнаружено нарушение доступности',
  description: 'Правило не сопоставлено с внутренним каталогом ru-a11y. Требуется ручная проверка.',
  recommendation: 'Проверьте элемент, указанный в отчете, и исправьте нарушение согласно рекомендациям axe-core и ГОСТ.',
  principle: 'надежность',
  defaultSeverity: 'незначительное',
  gostRefs: ['ГОСТ Р 52872-2012 (требуется ручная классификация)'],
  post102Refs: ['Постановление Правительства РФ №102 от 07.02.2026 (требуется ручная классификация)'],
  wcagRefs: [],
};

export interface AxeResultItem {
  url: string;
  id: string;
  impact?: string | null;
  message: string;
  target?: string[];
  type?: AxeIssueType;
}

/**
 * Ищет мета-описание правила по id из axe-core.
 */
export function findGostRuleByAxeId(axeRuleId: string): GostRuleDefinition {
  return GOST_RULES.find((rule) => rule.axeRuleIds.includes(axeRuleId)) ?? FALLBACK_RULE;
}

function mapImpactToSeverity(impact?: string | null, fallback: GostSeverity = 'существенное'): GostSeverity {
  if (impact === 'critical' || impact === 'serious') {
    return 'критичное';
  }

  if (impact === 'moderate') {
    return 'существенное';
  }

  if (impact === 'minor') {
    return 'незначительное';
  }

  return fallback;
}

/**
 * Преобразует элемент результата axe-core в нормализованный объект ru-a11y.
 */
export function mapAxeResultToGost(axeResultItem: AxeResultItem): GostIssue {
  const rule = findGostRuleByAxeId(axeResultItem.id);

  return {
    url: axeResultItem.url,
    selector: axeResultItem.target?.[0] ?? 'document',
    ruRuleCode: rule.code,
    axeRuleId: axeResultItem.id,
    title: rule.title,
    description: rule.description,
    recommendation: rule.recommendation,
    severity: mapImpactToSeverity(axeResultItem.impact, rule.defaultSeverity),
    principle: rule.principle,
    gostRefs: rule.gostRefs,
    post102Refs: rule.post102Refs,
    wcagRefs: rule.wcagRefs,
    sourceMessage: axeResultItem.message,
    issueType: axeResultItem.type ?? 'violation',
  };
}

