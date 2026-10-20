import { findRepeated, hasScannableContent, isInteractive, queryAll } from './dom';
import {
  AA_PRESETS,
  ALL_PRESETS,
  STRICT_PRESETS,
  finding,
  findingIf,
  type CustomRule,
} from './types';

const SKIP_LINK_TEXT = /пропустить|перейти к|skip/;
const INTERACTIVE_SELECTOR = 'a, button, input, select, textarea, [role="button"], [role="link"]';
const TARGET_SELECTOR = 'a[href], button, input, select, textarea, [role="button"], [role="link"]';
/** WCAG 2.2, 2.5.8 Target Size (Minimum). */
const MIN_TARGET_SIZE_PX = 24;

function isSkipLink(link: Element): boolean {
  return SKIP_LINK_TEXT.test((link.textContent ?? '').toLowerCase());
}

/** Keyboard navigation: skip links, focus order, access keys and target size. */
export const navigationRules: CustomRule[] = [
  {
    id: 'bypass',
    presets: AA_PRESETS,
    check: (context) => {
      if (!hasScannableContent(context)) return [];
      const hasSkipLink = queryAll(context, 'a[href^="#"]').some(isSkipLink);
      return findingIf(!hasSkipLink, context.document.body, 'serious');
    },
  },
  {
    id: 'skip-link',
    presets: AA_PRESETS,
    check: (context) =>
      queryAll(context, 'a[href^="#"]')
        .filter(isSkipLink)
        .filter((link) => !context.document.getElementById(link.getAttribute('href')!.slice(1)))
        .map((link) => finding(link, 'serious')),
  },
  {
    id: 'nested-interactive',
    presets: ALL_PRESETS,
    check: (context) =>
      queryAll(context, INTERACTIVE_SELECTOR)
        .filter((element) => Array.from(element.children).some(isInteractive))
        .map((element) => finding(element, 'serious')),
  },
  {
    id: 'focus-order-semantics',
    presets: AA_PRESETS,
    check: (context) =>
      queryAll(context, '[tabindex]')
        .filter((element) => {
          const tabIndex = Number(element.getAttribute('tabindex'));
          return Number.isFinite(tabIndex) && tabIndex >= 0 && !isInteractive(element);
        })
        .map((element) => finding(element, 'moderate')),
  },
  {
    id: 'accesskeys',
    presets: STRICT_PRESETS,
    check: (context) =>
      findRepeated(queryAll(context, '[accesskey]'), (element) =>
        element.getAttribute('accesskey')?.toLowerCase(),
      ).map((element) => finding(element, 'minor')),
  },
  {
    id: 'target-size',
    presets: STRICT_PRESETS,
    check: (context) =>
      queryAll(context, TARGET_SELECTOR)
        .filter((element) => {
          const { width, height } = element.getBoundingClientRect();
          const isRendered = width > 0 && height > 0;
          return isRendered && (width < MIN_TARGET_SIZE_PX || height < MIN_TARGET_SIZE_PX);
        })
        .map((element) => finding(element, 'minor')),
  },
];
