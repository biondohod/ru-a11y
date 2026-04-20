/**
 * Конфигурация: gost-aa
 * Уровень: ГОСТ Р 52872-2019, уровень AA + Постановление Правительства РФ №102
 *
 * Полный набор правил для обеспечения уровня AA доступности согласно
 * ГОСТ Р 52872-2019 и требований Постановления №102 от 07.02.2026.
 *
 * Рекомендуется для:
 * - Государственных сайтов и порталов
 * - Сайтов органов исполнительной власти
 * - Любых публичных веб-сервисов, обязанных соответствовать ПП РФ №102
 *
 * Поддерживает как Flat Config (ESLint 9+, eslint.config.js),
 * так и Legacy Config (ESLint 8, .eslintrc.js).
 *
 * @example
 * module.exports = { extends: ['@ru-a11y/eslint-preset/gost-aa'] }
 */

'use strict';

const recommended = require('./recommended');

// Набор правил, общий для обоих форматов
const rules = {
  // Наследуем все правила уровня A
  ...recommended.rules,

  // -----------------------------------------------------------------------
  // Повышаем предупреждения до ошибок (уровень AA строже)
  // -----------------------------------------------------------------------

  // Обязательная ссылка пропуска навигации (ГОСТ Р 52872-2019 §5.2.3.1) → ошибка
  '@ru-a11y/gost-a11y/require-skip-link': 'error',

  // Запрет таблиц для вёрстки (ГОСТ Р 52872-2019 §5.1.5) → ошибка
  '@ru-a11y/gost-a11y/no-table-layout': 'error',

  // Масштабирование 200% (Постановление №102 п. б)) → ошибка
  '@ru-a11y/gost-a11y/zoom-200-warning': 'error',

  // Основная область и H1 обязательны для навигации вспомогательных технологий
  '@ru-a11y/gost-a11y/require-main-landmark': 'error',
  '@ru-a11y/gost-a11y/require-h1': 'error',

  // Автовоспроизведение звука без управления блокирует восприятие скринридера
  '@ru-a11y/gost-a11y/no-autoplay-media': 'error',

  // -----------------------------------------------------------------------
  // Дополнительные параметры правил для уровня AA
  // -----------------------------------------------------------------------

  // Требуем lang="ru" — рекомендация для государственных сайтов (Постановление №102 п. д))
  '@ru-a11y/gost-a11y/require-lang-attr': [
    'error',
    { enforceRussian: false }, // Включите true для гос. сайтов
  ],

  // Требуем <caption> для таблиц данных (ГОСТ Р 52872-2019 §5.1.5)
  '@ru-a11y/gost-a11y/table-requires-th': ['error', { requireCaption: true, requireScope: true }],

  // -----------------------------------------------------------------------
  // Правила jsx-a11y с русскими сообщениями (WCAG 2.1, уровень AA)
  // Обёрнуты в @ru-a11y/gost-a11y — сообщения на русском со ссылками
  // на ГОСТ Р 52872-2019 и Постановление №102
  // -----------------------------------------------------------------------

  // Альтернативный текст для изображений (ГОСТ Р 52872-2019 §5.1.1; Постановление №102 п. г))
  '@ru-a11y/gost-a11y/jsx-a11y/alt-text': 'error',

  // Элементы <a> должны иметь содержимое (ГОСТ Р 52872-2019 §5.2.4; Постановление №102 п. ж))
  '@ru-a11y/gost-a11y/jsx-a11y/anchor-has-content': 'error',

  // Якорные ссылки должны быть допустимыми (Постановление №102 п. ж))
  '@ru-a11y/gost-a11y/jsx-a11y/anchor-is-valid': 'error',

  // ARIA-атрибуты должны быть допустимыми (WCAG 4.1.2)
  '@ru-a11y/gost-a11y/jsx-a11y/aria-props': 'error',

  // Значения ARIA-атрибутов должны быть валидными (WCAG 4.1.2)
  '@ru-a11y/gost-a11y/jsx-a11y/aria-proptypes': 'error',

  // ARIA-роли должны быть допустимыми (WCAG 4.1.2)
  '@ru-a11y/gost-a11y/jsx-a11y/aria-role': 'error',

  // Не добавлять ARIA на неподдерживающие элементы (WCAG 4.1.2)
  '@ru-a11y/gost-a11y/jsx-a11y/aria-unsupported-elements': 'error',

  // Интерактивные элементы должны поддерживать клавиатуру (Постановление №102 п. а))
  '@ru-a11y/gost-a11y/jsx-a11y/click-events-have-key-events': 'error',

  // Заголовки должны содержать текст (ГОСТ Р 52872-2019 §5.2.3; Постановление №102 п. е))
  '@ru-a11y/gost-a11y/jsx-a11y/heading-has-content': 'error',

  // <html> должен иметь атрибут lang (ГОСТ Р 52872-2019 §5.2.4)
  '@ru-a11y/gost-a11y/jsx-a11y/html-has-lang': 'error',

  // <iframe> должен иметь уникальный title (ГОСТ Р 52872-2019 §5.1.1; Постановление №102 п. а))
  '@ru-a11y/gost-a11y/jsx-a11y/iframe-has-title': 'error',

  // alt не должен содержать слова "изображение", "фото" и т.п. (Постановление №102 п. г))
  '@ru-a11y/gost-a11y/jsx-a11y/img-redundant-alt': 'error',

  // Интерактивные элементы должны быть фокусируемы (Постановление №102 п. а))
  '@ru-a11y/gost-a11y/jsx-a11y/interactive-supports-focus': 'error',

  // label должен быть связан с контролом (ГОСТ Р 52872-2019 §5.1.3; Постановление №102 п. м))
  '@ru-a11y/gost-a11y/jsx-a11y/label-has-associated-control': 'error',

  // Медиаэлементы должны иметь субтитры (Постановление №102 п. г))
  '@ru-a11y/gost-a11y/jsx-a11y/media-has-caption': 'warn',

  // Обработчики мыши должны иметь аналоги для клавиатуры (Постановление №102 п. а))
  '@ru-a11y/gost-a11y/jsx-a11y/mouse-events-have-key-events': 'error',

  // tabIndex не должен быть положительным (Постановление №102 п. а))
  '@ru-a11y/gost-a11y/jsx-a11y/tabindex-no-positive': 'error',

  // Неинтерактивные элементы не должны иметь интерактивные обработчики (WCAG 4.1.2)
  '@ru-a11y/gost-a11y/jsx-a11y/no-noninteractive-element-interactions': 'warn',

  // Неинтерактивные элементы не должны получать tabIndex (WCAG 2.4.3)
  '@ru-a11y/gost-a11y/jsx-a11y/no-noninteractive-tabindex': 'warn',

  // Избыточные ARIA-роли не рекомендуются (WCAG 4.1.2)
  '@ru-a11y/gost-a11y/jsx-a11y/no-redundant-roles': 'warn',

  // Scope должен использоваться только на <th> (ГОСТ Р 52872-2019 §5.1.5)
  '@ru-a11y/gost-a11y/jsx-a11y/scope': 'error',
};

/**
 * Legacy Config (ESLint 8): используется в .eslintrc.js
 */
const legacyConfig = {
  plugins: ['@ru-a11y/gost-a11y'],
  rules,
};

module.exports = legacyConfig;
module.exports.rules = rules;
