import { hasScannableContent, queryAll } from './dom';
import {
  AA_PRESETS,
  ALL_PRESETS,
  STRICT_PRESETS,
  finding,
  findingIf,
  type CustomRule,
} from './types';

const BCP47_PRIMARY = /^[a-z]{2,3}(-[a-zA-Z0-9]{2,8})*$/;
const VIEWPORT_SELECTOR = 'meta[name="viewport" i]';

function getViewportContent(document: Document): { element: Element; content: string } | null {
  const element = document.querySelector(VIEWPORT_SELECTOR);
  return element ? { element, content: element.getAttribute('content') ?? '' } : null;
}

/** Document level checks: language, title, viewport and refresh. */
export const documentRules: CustomRule[] = [
  {
    id: 'html-has-lang',
    presets: ALL_PRESETS,
    check: (context) => {
      const html = context.document.documentElement;
      return findingIf(!html.hasAttribute('lang') && hasScannableContent(context), html, 'serious');
    },
  },
  {
    id: 'html-lang-valid',
    presets: ALL_PRESETS,
    check: ({ document }) => {
      const lang = document.documentElement.getAttribute('lang');
      return findingIf(lang && !BCP47_PRIMARY.test(lang), document.documentElement, 'serious');
    },
  },
  {
    id: 'html-xml-lang-mismatch',
    presets: STRICT_PRESETS,
    check: ({ document }) => {
      const html = document.documentElement;
      const lang = html.getAttribute('lang')?.split('-')[0];
      const xmlLang = html.getAttribute('xml:lang')?.split('-')[0];
      return findingIf(lang && xmlLang && lang !== xmlLang, html, 'moderate');
    },
  },
  {
    id: 'document-title',
    presets: ALL_PRESETS,
    check: (context) =>
      findingIf(
        !context.document.title.trim() && hasScannableContent(context),
        context.document.documentElement,
        'serious',
      ),
  },
  {
    id: 'meta-viewport',
    presets: ALL_PRESETS,
    check: ({ document }) => {
      const viewport = getViewportContent(document);
      if (!viewport) return [];

      const blocksZoom =
        /user-scalable\s*=\s*no/i.test(viewport.content) ||
        /maximum-scale\s*=\s*(0|1(?:\.0+)?)(?:\D|$)/i.test(viewport.content);
      return findingIf(blocksZoom, viewport.element, 'serious');
    },
  },
  {
    id: 'meta-viewport-large',
    presets: STRICT_PRESETS,
    check: ({ document }) => {
      const viewport = getViewportContent(document);
      const match = viewport?.content.match(/maximum-scale\s*=\s*([\d.]+)/i);
      return viewport ? findingIf(match && Number(match[1]) < 5, viewport.element, 'moderate') : [];
    },
  },
  {
    id: 'meta-refresh',
    presets: AA_PRESETS,
    check: (context) =>
      queryAll(context, 'meta[http-equiv="refresh" i]').map((meta) => finding(meta, 'serious')),
  },
];
