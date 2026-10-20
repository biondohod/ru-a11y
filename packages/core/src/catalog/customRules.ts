import type { RuA11yRuleMeta } from '../types';

/**
 * Rules without an axe-core counterpart: checks implemented by the
 * ru-a11y ESLint plugin and by the overlay runtime.
 */
export const CUSTOM_RULES = {
  'no-table-layout': {
    id: 'no-table-layout',
    title: 'Таблицы используются для вёрстки',
    description:
      'Таблица используется не для табличных данных, а для оформления страницы. ' +
      'Это нарушает семантику и мешает вспомогательным технологиям корректно считывать структуру контента.',
    fix: 'Используйте CSS Grid или Flexbox для вёрстки. Таблицы оставляйте только для табличных данных.',
    gost: 'ГОСТ Р 52872-2019, §5.1.5',
    post102: 'Постановление №102, п. а)',
    wcag: 'WCAG 2.1, 1.3.1 Info and Relationships',
    principle: 'perceivable',
    severity: 'error',
    aliases: ['@ru-a11y/gost-a11y/no-table-layout'],
  },

  'table-requires-th': {
    id: 'table-requires-th',
    title: 'Таблица данных не содержит корректных заголовков',
    description:
      'Таблица данных не содержит ячеек <th>, scope или caption, необходимых для корректного ' +
      'восприятия структуры таблицы вспомогательными технологиями.',
    fix: 'Добавьте <th> с корректным scope для строк и столбцов, а также <caption> для описания таблицы.',
    gost: 'ГОСТ Р 52872-2019, §5.1.5',
    post102: 'Постановление №102, п. а)',
    wcag: 'WCAG 2.1, 1.3.1 Info and Relationships',
    principle: 'perceivable',
    severity: 'error',
    aliases: ['@ru-a11y/gost-a11y/table-requires-th'],
  },

  'click-events-have-key-events': {
    id: 'click-events-have-key-events',
    title: 'Обработчик click не дублируется клавиатурным управлением',
    description:
      'Элемент реагирует на мышь, но не поддерживает эквивалентное управление с клавиатуры. ' +
      'Пользователи без мыши не смогут активировать этот интерфейсный элемент.',
    fix: 'Добавьте onKeyDown/onKeyUp или используйте нативный интерактивный элемент, например <button>.',
    post102: 'Постановление №102, п. а)',
    wcag: 'WCAG 2.1, 2.1.1 Keyboard',
    principle: 'operable',
    severity: 'error',
    aliases: ['@ru-a11y/gost-a11y/jsx-a11y/click-events-have-key-events'],
  },

  'heading-has-content': {
    id: 'heading-has-content',
    title: 'Заголовок не содержит текстового содержимого',
    description:
      'Элемент заголовка пуст или не имеет доступной текстовой альтернативы. ' +
      'Это нарушает структуру страницы и делает навигацию по заголовкам бесполезной.',
    fix: 'Добавьте информативный текст в заголовок или пересмотрите его семантическое использование.',
    gost: 'ГОСТ Р 52872-2019, §5.2.3',
    post102: 'Постановление №102, п. е)',
    wcag: 'WCAG 2.1, 2.4.6 Headings and Labels',
    principle: 'understandable',
    severity: 'error',
    aliases: ['@ru-a11y/gost-a11y/jsx-a11y/heading-has-content'],
  },

  'aria-activedescendant-has-tabindex': {
    id: 'aria-activedescendant-has-tabindex',
    title: 'Элемент с aria-activedescendant не может получать фокус',
    description:
      'Составной виджет использует aria-activedescendant, но сам элемент не является фокусируемым. ' +
      'Это ломает клавиатурную навигацию внутри компонента.',
    fix: 'Добавьте tabIndex={0} или используйте нативный фокусируемый контейнер для виджета.',
    post102: 'Постановление №102, п. а)',
    wcag: 'WCAG 2.1, 4.1.2 Name, Role, Value',
    principle: 'operable',
    severity: 'error',
    aliases: ['@ru-a11y/gost-a11y/jsx-a11y/aria-activedescendant-has-tabindex'],
  },

  'no-noninteractive-element-interactions': {
    id: 'no-noninteractive-element-interactions',
    title: 'Неинтерактивный элемент используется как интерактивный',
    description:
      'Неинтерактивный элемент получил обработчики мыши или клавиатуры, из-за чего его поведение ' +
      'не соответствует семантике и ожиданиям вспомогательных технологий.',
    fix: 'Замените элемент на <button> или <a>, либо добавьте корректную роль и полную клавиатурную поддержку.',
    wcag: 'WCAG 2.1, 4.1.2 Name, Role, Value',
    principle: 'robust',
    severity: 'warning',
    aliases: ['@ru-a11y/gost-a11y/jsx-a11y/no-noninteractive-element-interactions'],
  },

  'no-noninteractive-tabindex': {
    id: 'no-noninteractive-tabindex',
    title: 'Неинтерактивный элемент включён в порядок фокуса',
    description:
      'Неинтерактивный элемент получил tabIndex и попадает в последовательность клавиатурного фокуса. ' +
      'Это делает навигацию непредсказуемой.',
    fix: 'Уберите tabIndex с неинтерактивного элемента или замените его на семантически подходящий интерактивный элемент.',
    post102: 'Постановление №102, п. а)',
    wcag: 'WCAG 2.1, 2.4.3 Focus Order',
    principle: 'operable',
    severity: 'warning',
    aliases: ['@ru-a11y/gost-a11y/jsx-a11y/no-noninteractive-tabindex'],
  },

  'no-redundant-roles': {
    id: 'no-redundant-roles',
    title: 'Указана избыточная ARIA-роль',
    description:
      'Элемент уже имеет неявную нативную роль, поэтому явное дублирование role не даёт пользы ' +
      'и может усложнить поддержку интерфейса.',
    fix: 'Удалите избыточный атрибут role и сохраните нативную семантику HTML-элемента.',
    wcag: 'WCAG 2.1, 4.1.2 Name, Role, Value',
    principle: 'robust',
    severity: 'warning',
    aliases: ['@ru-a11y/gost-a11y/jsx-a11y/no-redundant-roles'],
  },

  'no-static-element-interactions': {
    id: 'no-static-element-interactions',
    title: 'Статический элемент содержит интерактивное поведение',
    description:
      'На статический элемент добавлены интерактивные обработчики без корректной семантики. ' +
      'Это сбивает пользователей скринридеров и клавиатуры.',
    fix: 'Используйте нативный интерактивный элемент или добавьте корректную роль вместе с клавиатурной поддержкой.',
    wcag: 'WCAG 2.1, 4.1.2 Name, Role, Value',
    principle: 'robust',
    severity: 'warning',
    aliases: ['@ru-a11y/gost-a11y/jsx-a11y/no-static-element-interactions'],
  },

  'no-interactive-element-to-noninteractive-role': {
    id: 'no-interactive-element-to-noninteractive-role',
    title: 'Интерактивному элементу назначена неинтерактивная роль',
    description:
      'Нативный интерактивный элемент получил неинтерактивную роль и потерял корректную семантику ' +
      'для вспомогательных технологий.',
    fix: 'Удалите конфликтующую role или замените элемент на действительно подходящий по смыслу.',
    wcag: 'WCAG 2.1, 4.1.2 Name, Role, Value',
    principle: 'robust',
    severity: 'warning',
    aliases: ['@ru-a11y/gost-a11y/jsx-a11y/no-interactive-element-to-noninteractive-role'],
  },
} satisfies Record<string, RuA11yRuleMeta>;
