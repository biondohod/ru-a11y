import { hasExplicitName, hasText, queryAll } from './dom';
import { AA_PRESETS, finding, type CustomRule } from './types';

/** Text alternatives for graphics and embedded objects. */
export const imageRules: CustomRule[] = [
  {
    id: 'svg-img-alt',
    presets: AA_PRESETS,
    check: (context) =>
      queryAll(context, 'svg[role="img"]')
        .filter((svg) => !hasExplicitName(svg) && !svg.querySelector('title'))
        .map((svg) => finding(svg, 'serious')),
  },
  {
    id: 'role-img-alt',
    presets: AA_PRESETS,
    check: (context) =>
      queryAll(context, '[role="img"]')
        .filter((element) => !hasExplicitName(element) && !element.querySelector('title'))
        .map((element) => finding(element, 'serious')),
  },
  {
    id: 'object-alt',
    presets: AA_PRESETS,
    check: (context) =>
      queryAll(context, 'object')
        .filter((element) => !hasText(element) && !hasExplicitName(element))
        .map((element) => finding(element, 'moderate')),
  },
];
