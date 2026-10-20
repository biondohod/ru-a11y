import { hasText, queryAll } from './dom';
import { AA_PRESETS, ALL_PRESETS, STRICT_PRESETS, finding, type CustomRule } from './types';

const VALID_SCOPES = new Set(['col', 'row', 'colgroup', 'rowgroup']);

function hasPresentationRole(table: Element): boolean {
  return /^(presentation|none)$/i.test(table.getAttribute('role') ?? '');
}

/** Data tables vs layout tables, headers and captions. */
export const tableRules: CustomRule[] = [
  {
    id: 'no-table-layout',
    presets: AA_PRESETS,
    check: (context) =>
      queryAll(context, 'table')
        .filter(
          (table) =>
            !table.querySelector('th, caption, thead, [scope], [headers]') &&
            !hasPresentationRole(table),
        )
        .map((table) => finding(table, 'moderate')),
  },
  {
    id: 'table-requires-th',
    presets: ALL_PRESETS,
    check: (context) =>
      queryAll(context, 'table')
        .filter(
          (table) =>
            table.querySelector('td') && !table.querySelector('th') && !hasPresentationRole(table),
        )
        .map((table) => finding(table, 'serious')),
  },
  {
    id: 'empty-table-header',
    presets: AA_PRESETS,
    check: (context) =>
      queryAll(context, 'th')
        .filter((cell) => !hasText(cell) && !cell.getAttribute('aria-label'))
        .map((cell) => finding(cell, 'moderate')),
  },
  {
    id: 'scope-attr-valid',
    presets: ALL_PRESETS,
    check: (context) =>
      queryAll(context, '[scope]')
        .filter(
          (element) =>
            element.tagName.toLowerCase() !== 'th' ||
            !VALID_SCOPES.has(element.getAttribute('scope') ?? ''),
        )
        .map((element) => finding(element, 'moderate')),
  },
  {
    id: 'table-fake-caption',
    presets: STRICT_PRESETS,
    check: (context) =>
      queryAll(context, 'table')
        .filter(
          (table) =>
            !table.querySelector('caption') && table.querySelector('tr:first-child > td[colspan]'),
        )
        .map((table) => finding(table, 'minor')),
  },
];
