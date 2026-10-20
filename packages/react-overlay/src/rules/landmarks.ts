import { findRepeated, getAccessibleName, getTagName, hasScannableContent, queryAll } from './dom';
import { AA_PRESETS, STRICT_PRESETS, finding, findingIf, type CustomRule } from './types';

const MAIN_SELECTOR = 'main, [role="main"]';
const NAMED_LANDMARKS =
  'nav, aside, section[aria-label], [role="navigation"], [role="complementary"]';

/** Landmark regions. */
export const landmarkRules: CustomRule[] = [
  {
    id: 'landmark-one-main',
    presets: AA_PRESETS,
    check: (context) => {
      const mains = queryAll(context, MAIN_SELECTOR);
      return findingIf(
        mains.length !== 1 && hasScannableContent(context),
        mains[1] ?? context.document.body,
        'moderate',
      );
    },
  },
  {
    id: 'landmark-no-duplicate-main',
    presets: AA_PRESETS,
    check: (context) =>
      queryAll(context, MAIN_SELECTOR)
        .slice(1)
        .map((main) => finding(main, 'moderate')),
  },
  {
    id: 'landmark-unique',
    presets: STRICT_PRESETS,
    check: (context) =>
      findRepeated(queryAll(context, NAMED_LANDMARKS), (landmark) => {
        const name = getAccessibleName(landmark);
        return name ? `${landmark.getAttribute('role') ?? getTagName(landmark)}:${name}` : null;
      }).map((landmark) => finding(landmark, 'minor')),
  },
];
