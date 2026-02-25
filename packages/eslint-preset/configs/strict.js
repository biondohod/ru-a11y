/**
 * Конфигурация: strict
 * Уровень: ГОСТ Р 52872-2019, уровень AAA + дополнительные RU-паттерны
 *
 * Максимально строгий набор правил доступности.
 * Включает все требования уровня AA + расширенные проверки.
 *
 * Рекомендуется для:
 * - Портала Госуслуг и аналогичных критически важных сервисов
 * - Проектов с особыми требованиями к доступности
 * - Команд, стремящихся к максимальному уровню инклюзивности
 *
 * Внимание: Некоторые правила уровня AAA могут быть трудны для реализации.
 * Оцените применимость каждого правила к вашему проекту.
 *
 * Поддерживает как Flat Config (ESLint 9+, eslint.config.js),
 * так и Legacy Config (ESLint 8, .eslintrc.js).
 */

'use strict';

const gostAA = require('./gost-aa');

// Набор правил, общий для обоих форматов
const rules = {
  // Наследуем все правила уровня AA
  ...gostAA.rules,

  // -----------------------------------------------------------------------
  // Повышаем предупреждения до ошибок (максимальная строгость)
  // -----------------------------------------------------------------------

  // Медиаэлементы ОБЯЗАНЫ иметь субтитры (Постановление №102 п. г))
  'jsx-a11y/media-has-caption': 'error',

  // Неинтерактивные элементы не должны иметь интерактивные обработчики
  'jsx-a11y/no-noninteractive-element-interactions': 'error',

  // Неинтерактивные элементы не должны получать tabIndex
  'jsx-a11y/no-noninteractive-tabindex': 'error',

  // Избыточные ARIA-роли запрещены
  'jsx-a11y/no-redundant-roles': 'error',

  // -----------------------------------------------------------------------
  // Дополнительные параметры для максимальной строгости
  // -----------------------------------------------------------------------

  // Требуем lang="ru" для всех русскоязычных страниц (Постановление №102 п. д))
  '@ru-a11y/gost-a11y/require-lang-attr': [
    'error',
    { enforceRussian: true },
  ],

  // Требуем <caption> и scope для всех таблиц (ГОСТ Р 52872-2019 §5.1.5)
  '@ru-a11y/gost-a11y/table-requires-th': [
    'error',
    { requireCaption: true, requireScope: true },
  ],

  // Допустимые href для skip-link расширены
  '@ru-a11y/gost-a11y/require-skip-link': [
    'error',
    {
      allowedHrefs: [
        '#main',
        '#content',
        '#maincontent',
        '#main-content',
        '#основной-контент',
        '#skip-to-content',
      ],
    },
  ],

  // Строгая проверка масштабирования
  '@ru-a11y/gost-a11y/zoom-200-warning': [
    'error',
    {
      minFontSizePx: 16,
      checkInlineStyles: true,
    },
  ],

  // -----------------------------------------------------------------------
  // Дополнительные правила jsx-a11y уровня AAA
  // -----------------------------------------------------------------------

  // Автодополнение для форм (WCAG 1.3.5)
  'jsx-a11y/autocomplete-valid': 'error',

  // Не использовать accessKey (WCAG 2.1.4)
  'jsx-a11y/no-access-key': 'error',

  // Статичные элементы с обработчиками должны иметь роль (WCAG 4.1.2)
  'jsx-a11y/no-static-element-interactions': 'error',

  // Интерактивные элементы не должны быть вложены
  'jsx-a11y/no-interactive-element-to-noninteractive-role': 'error',

  // aria-activedescendant должен указывать на существующий элемент (WCAG 4.1.2)
  'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
};

/**
 * Legacy Config (ESLint 8): используется в .eslintrc.js
 * @example
 * module.exports = { extends: ['@ru-a11y/eslint-preset/strict'] }
 */
const legacyConfig = {
  plugins: [
    '@ru-a11y/gost-a11y',
    'jsx-a11y',
  ],
  reportUnusedDisableDirectives: true,
  rules,
};

module.exports = legacyConfig;
module.exports.rules = rules;
