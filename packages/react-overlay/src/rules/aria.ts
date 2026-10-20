import { findRepeated, isFocusable, isInteractive, queryAll } from './dom';
import { AA_PRESETS, ALL_PRESETS, finding, findingIf, type CustomRule } from './types';

const ID_REFERENCE_ATTRIBUTES = ['aria-labelledby', 'aria-describedby', 'for'] as const;

function getReferencedIds(elements: Element[]): Set<string> {
  return new Set(
    elements.flatMap((element) =>
      ID_REFERENCE_ATTRIBUTES.flatMap((attribute) =>
        (element.getAttribute(attribute) ?? '').split(/\s+/).filter(Boolean),
      ),
    ),
  );
}

/** ids, aria-hidden and role conflicts. */
export const ariaRules: CustomRule[] = [
  {
    id: 'duplicate-id',
    presets: ALL_PRESETS,
    check: (context) =>
      findRepeated(queryAll(context, '[id]'), (element) => element.id).map((element) =>
        finding(element, 'serious'),
      ),
  },
  {
    id: 'duplicate-id-active',
    presets: ALL_PRESETS,
    check: (context) => {
      const elements = queryAll(context, '[id]');
      const repeated = new Set(findRepeated(elements, (element) => element.id));
      return elements
        .filter((element) => repeated.has(element) && isInteractive(element))
        .map((element) => finding(element, 'serious'));
    },
  },
  {
    id: 'duplicate-id-aria',
    presets: ALL_PRESETS,
    check: (context) => {
      const referenced = getReferencedIds(
        queryAll(context, '[aria-labelledby], [aria-describedby], label[for]'),
      );
      const elements = queryAll(context, '[id]');
      return findRepeated(elements, (element) => element.id)
        .filter((element) => referenced.has(element.id))
        .map((element) => finding(element, 'serious'));
    },
  },
  {
    id: 'aria-hidden-body',
    presets: ALL_PRESETS,
    check: ({ document }) =>
      findingIf(document.body.getAttribute('aria-hidden') === 'true', document.body, 'critical'),
  },
  {
    id: 'aria-hidden-focus',
    presets: ALL_PRESETS,
    check: (context) =>
      queryAll(context, '[aria-hidden="true"]')
        .filter(
          (element) =>
            isFocusable(element) || Array.from(element.querySelectorAll('*')).some(isFocusable),
        )
        .map((element) => finding(element, 'serious')),
  },
  {
    id: 'presentation-role-conflict',
    presets: AA_PRESETS,
    check: (context) =>
      queryAll(context, '[role="presentation"], [role="none"]')
        .filter(
          (element) =>
            Array.from(element.attributes).some((attribute) =>
              attribute.name.startsWith('aria-'),
            ) || element.hasAttribute('tabindex'),
        )
        .map((element) => finding(element, 'minor')),
  },
];
