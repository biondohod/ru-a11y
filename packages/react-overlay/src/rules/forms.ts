import { hasAssociatedLabel, hasExplicitName, queryAll } from './dom';
import { ALL_PRESETS, STRICT_PRESETS, finding, type CustomRule } from './types';

/** Names of form controls. */
export const formRules: CustomRule[] = [
  {
    id: 'input-button-name',
    presets: ALL_PRESETS,
    check: (context) =>
      queryAll(context, 'input[type="button"], input[type="submit"], input[type="reset"]')
        .filter((input) => !hasExplicitName(input) && !input.getAttribute('value')?.trim())
        .map((input) => finding(input, 'serious')),
  },
  {
    id: 'input-image-alt',
    presets: ALL_PRESETS,
    check: (context) =>
      queryAll(context, 'input[type="image"]')
        .filter((input) => !input.getAttribute('alt')?.trim())
        .map((input) => finding(input, 'serious')),
  },
  {
    id: 'select-name',
    presets: ALL_PRESETS,
    check: (context) =>
      queryAll(context, 'select')
        .filter((select) => !hasExplicitName(select) && !hasAssociatedLabel(select))
        .map((select) => finding(select, 'serious')),
  },
  {
    id: 'label-title-only',
    presets: STRICT_PRESETS,
    check: (context) =>
      queryAll(context, 'input, textarea, select')
        .filter(
          (control) =>
            !hasAssociatedLabel(control) &&
            !control.getAttribute('aria-label') &&
            Boolean(control.getAttribute('title') || control.getAttribute('aria-describedby')),
        )
        .map((control) => finding(control, 'minor')),
  },
];
