import { hasExplicitName, hasScannableContent, hasText, queryAll } from './dom';
import {
  AA_PRESETS,
  ALL_PRESETS,
  STRICT_PRESETS,
  finding,
  findingIf,
  type CustomRule,
} from './types';

const HEADINGS = 'h1,h2,h3,h4,h5,h6';
const LARGE_FONT = /font-size\s*:\s*(2[4-9]|[3-9]\d)px/i;
const BOLD_FONT = /font-weight\s*:\s*(bold|[7-9]00)/i;

/** Page structure through headings. */
export const headingRules: CustomRule[] = [
  {
    id: 'page-has-heading-one',
    presets: AA_PRESETS,
    check: (context) =>
      findingIf(
        queryAll(context, 'h1').length === 0 && hasScannableContent(context),
        context.document.body,
        'moderate',
      ),
  },
  {
    id: 'heading-order',
    presets: AA_PRESETS,
    check: (context) => {
      let previousLevel = 0;

      return queryAll(context, HEADINGS).flatMap((heading) => {
        const level = Number(heading.tagName.slice(1));
        const skipsLevel = previousLevel > 0 && level > previousLevel + 1;
        previousLevel = level;
        return findingIf(skipsLevel, heading, 'moderate');
      });
    },
  },
  {
    id: 'empty-heading',
    presets: ALL_PRESETS,
    check: (context) =>
      queryAll(context, HEADINGS)
        .filter((heading) => !hasText(heading) && !hasExplicitName(heading))
        .map((heading) => finding(heading, 'serious')),
  },
  {
    id: 'p-as-heading',
    presets: STRICT_PRESETS,
    check: (context) =>
      queryAll(context, 'p')
        .filter((paragraph) => {
          const style = paragraph.getAttribute('style') ?? '';
          return LARGE_FONT.test(style) || BOLD_FONT.test(style);
        })
        .map((paragraph) => finding(paragraph, 'minor')),
  },
];
