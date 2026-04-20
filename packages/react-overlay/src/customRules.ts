import axe from 'axe-core';
import { getRuleMeta } from './mapping/rulesMap';
import type { A11yViolationNode, AxePreset } from './axeRunner';

interface CustomRuleContext {
  document: Document;
  preset: AxePreset;
  excludeSelector: string;
}

interface CustomViolationInput {
  ruleId: string;
  element: Element;
  impact?: axe.ImpactValue;
  summary?: string;
}

type CustomRule = {
  id: string;
  presets: AxePreset[];
  check: (context: CustomRuleContext) => CustomViolationInput[];
};

const ALL_PRESETS: AxePreset[] = ['recommended', 'gost-aa', 'strict'];
const AA_PRESETS: AxePreset[] = ['gost-aa', 'strict'];
const STRICT_PRESETS: AxePreset[] = ['strict'];

function isExcluded(element: Element, excludeSelector: string): boolean {
  return Boolean(excludeSelector && element.closest(excludeSelector));
}

function queryAll(context: CustomRuleContext, selector: string): Element[] {
  return Array.from(context.document.querySelectorAll(selector)).filter(
    (element) => !isExcluded(element, context.excludeSelector),
  );
}

function getElementName(element: Element): string {
  return element.tagName.toLowerCase();
}

function escapeIdent(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }

  return value.replace(/[^a-zA-Z0-9_-]/g, '\\$&');
}

function getSelector(element: Element): string {
  if (element.id) {
    return `#${escapeIdent(element.id)}`;
  }

  const name = getElementName(element);
  const parent = element.parentElement;
  if (!parent) {
    return name;
  }

  const siblings = Array.from(parent.children).filter((child) => child.tagName === element.tagName);
  if (siblings.length <= 1) {
    return name;
  }

  return `${name}:nth-of-type(${siblings.indexOf(element) + 1})`;
}

function hasText(element: Element): boolean {
  return Boolean((element.textContent ?? '').trim());
}

function getAccessibleName(element: Element): string {
  const ariaLabel = element.getAttribute('aria-label')?.trim();
  if (ariaLabel) return ariaLabel;

  const labelledBy = element.getAttribute('aria-labelledby')?.trim();
  if (labelledBy) {
    const labels = labelledBy
      .split(/\s+/)
      .map((id) => element.ownerDocument.getElementById(id)?.textContent?.trim() ?? '')
      .filter(Boolean);
    if (labels.length > 0) return labels.join(' ');
  }

  const title = element.getAttribute('title')?.trim();
  if (title) return title;

  return (element.textContent ?? '').trim();
}

function hasExplicitName(element: Element): boolean {
  return Boolean(getAccessibleName(element));
}

function isFocusable(element: Element): boolean {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  if (element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true') {
    return false;
  }

  const tabIndex = element.getAttribute('tabindex');
  if (tabIndex !== null && Number(tabIndex) >= 0) {
    return true;
  }

  const tag = getElementName(element);
  if (tag === 'a' || tag === 'area') return element.hasAttribute('href');
  return ['button', 'input', 'select', 'textarea', 'summary', 'iframe'].includes(tag);
}

function isInteractive(element: Element): boolean {
  const tag = getElementName(element);
  const role = element.getAttribute('role');
  const interactiveRoles = new Set([
    'button',
    'checkbox',
    'combobox',
    'link',
    'listbox',
    'menuitem',
    'option',
    'radio',
    'searchbox',
    'slider',
    'spinbutton',
    'switch',
    'tab',
    'textbox',
  ]);

  return (
    isFocusable(element) ||
    interactiveRoles.has(role ?? '') ||
    ['button', 'input', 'select', 'textarea', 'details'].includes(tag)
  );
}

function hasScannableContent(context: CustomRuleContext): boolean {
  return Array.from(context.document.body.children).some(
    (element) => !isExcluded(element, context.excludeSelector),
  );
}

function pushViolation({
  ruleId,
  element,
  impact = 'moderate',
  summary,
}: CustomViolationInput): A11yViolationNode {
  const selector = getSelector(element);

  return {
    key: `custom:${ruleId}::${selector}`,
    ruleId,
    meta: getRuleMeta(ruleId),
    selector,
    targets: [[selector]],
    html: element.outerHTML,
    impact,
    failureSummary: summary,
  };
}

const customRules: CustomRule[] = [
  {
    id: 'bypass',
    presets: AA_PRESETS,
    check: (context) => {
      if (!hasScannableContent(context)) return [];
      const hasSkipLink = queryAll(context, 'a[href^="#"]').some((link) => {
        const text = (link.textContent ?? '').toLowerCase();
        return /пропустить|перейти к|skip/.test(text);
      });

      return hasSkipLink
        ? []
        : [{ ruleId: 'bypass', element: context.document.body, impact: 'serious' }];
    },
  },
  {
    id: 'skip-link',
    presets: AA_PRESETS,
    check: (context) =>
      queryAll(context, 'a[href^="#"]').flatMap((link) => {
        const href = link.getAttribute('href');
        const text = (link.textContent ?? '').toLowerCase();
        if (!href || !/пропустить|перейти к|skip/.test(text)) return [];
        return context.document.getElementById(href.slice(1))
          ? []
          : [{ ruleId: 'skip-link', element: link, impact: 'serious' as axe.ImpactValue }];
      }),
  },
  {
    id: 'html-has-lang',
    presets: ALL_PRESETS,
    check: (context) =>
      context.document.documentElement.hasAttribute('lang') || !hasScannableContent(context)
        ? []
        : [{ ruleId: 'html-has-lang', element: context.document.documentElement, impact: 'serious' }],
  },
  {
    id: 'html-lang-valid',
    presets: ALL_PRESETS,
    check: (context) => {
      const lang = context.document.documentElement.getAttribute('lang');
      if (!lang) return [];
      return /^[a-z]{2,3}(-[a-zA-Z0-9]{2,8})*$/.test(lang)
        ? []
        : [{ ruleId: 'html-lang-valid', element: context.document.documentElement, impact: 'serious' }];
    },
  },
  {
    id: 'html-xml-lang-mismatch',
    presets: STRICT_PRESETS,
    check: (context) => {
      const html = context.document.documentElement;
      const lang = html.getAttribute('lang')?.split('-')[0];
      const xmlLang = html.getAttribute('xml:lang')?.split('-')[0];
      return lang && xmlLang && lang !== xmlLang
        ? [{ ruleId: 'html-xml-lang-mismatch', element: html, impact: 'moderate' }]
        : [];
    },
  },
  {
    id: 'document-title',
    presets: ALL_PRESETS,
    check: (context) =>
      context.document.title.trim() || !hasScannableContent(context)
        ? []
        : [{ ruleId: 'document-title', element: context.document.documentElement, impact: 'serious' }],
  },
  {
    id: 'page-has-heading-one',
    presets: AA_PRESETS,
    check: (context) =>
      queryAll(context, 'h1').length > 0 || !hasScannableContent(context)
        ? []
        : [{ ruleId: 'page-has-heading-one', element: context.document.body, impact: 'moderate' }],
  },
  {
    id: 'heading-order',
    presets: AA_PRESETS,
    check: (context) => {
      let previousLevel = 0;
      return queryAll(context, 'h1,h2,h3,h4,h5,h6').flatMap((heading) => {
        const currentLevel = Number(heading.tagName.slice(1));
        const hasGap = previousLevel > 0 && currentLevel > previousLevel + 1;
        previousLevel = currentLevel;
        return hasGap ? [{ ruleId: 'heading-order', element: heading, impact: 'moderate' }] : [];
      });
    },
  },
  {
    id: 'empty-heading',
    presets: ALL_PRESETS,
    check: (context) =>
      queryAll(context, 'h1,h2,h3,h4,h5,h6').flatMap((heading) =>
        hasText(heading) || hasExplicitName(heading)
          ? []
          : [{ ruleId: 'empty-heading', element: heading, impact: 'serious' }],
      ),
  },
  {
    id: 'meta-viewport',
    presets: ALL_PRESETS,
    check: (context) => {
      const viewport = context.document.querySelector('meta[name="viewport" i]');
      if (!viewport) return [];
      const content = viewport.getAttribute('content') ?? '';
      return /user-scalable\s*=\s*no/i.test(content) ||
        /maximum-scale\s*=\s*(0|1(?:\.0+)?)(?:\D|$)/i.test(content)
        ? [{ ruleId: 'meta-viewport', element: viewport, impact: 'serious' }]
        : [];
    },
  },
  {
    id: 'meta-viewport-large',
    presets: STRICT_PRESETS,
    check: (context) => {
      const viewport = context.document.querySelector('meta[name="viewport" i]');
      if (!viewport) return [];
      const content = viewport.getAttribute('content') ?? '';
      const match = content.match(/maximum-scale\s*=\s*([\d.]+)/i);
      return match && Number(match[1]) < 5
        ? [{ ruleId: 'meta-viewport-large', element: viewport, impact: 'moderate' }]
        : [];
    },
  },
  {
    id: 'no-table-layout',
    presets: AA_PRESETS,
    check: (context) =>
      queryAll(context, 'table').flatMap((table) => {
        const hasDataSemantics = table.querySelector('th, caption, thead, [scope], [headers]');
        const hasPresentationRole = /^(presentation|none)$/i.test(table.getAttribute('role') ?? '');
        return !hasDataSemantics && !hasPresentationRole
          ? [{ ruleId: 'no-table-layout', element: table, impact: 'moderate' }]
          : [];
      }),
  },
  {
    id: 'table-requires-th',
    presets: ALL_PRESETS,
    check: (context) =>
      queryAll(context, 'table').flatMap((table) => {
        const hasPresentationRole = /^(presentation|none)$/i.test(table.getAttribute('role') ?? '');
        const hasDataCells = table.querySelector('td');
        return hasDataCells && !hasPresentationRole && !table.querySelector('th')
          ? [{ ruleId: 'table-requires-th', element: table, impact: 'serious' }]
          : [];
      }),
  },
  {
    id: 'empty-table-header',
    presets: AA_PRESETS,
    check: (context) =>
      queryAll(context, 'th').flatMap((cell) =>
        hasText(cell) || cell.getAttribute('aria-label')
          ? []
          : [{ ruleId: 'empty-table-header', element: cell, impact: 'moderate' }],
      ),
  },
  {
    id: 'scope-attr-valid',
    presets: ALL_PRESETS,
    check: (context) =>
      queryAll(context, '[scope]').flatMap((element) => {
        const value = element.getAttribute('scope');
        return element.tagName.toLowerCase() !== 'th' ||
          !['col', 'row', 'colgroup', 'rowgroup'].includes(value ?? '')
          ? [{ ruleId: 'scope-attr-valid', element, impact: 'moderate' }]
          : [];
      }),
  },
  {
    id: 'table-fake-caption',
    presets: STRICT_PRESETS,
    check: (context) =>
      queryAll(context, 'table').flatMap((table) =>
        !table.querySelector('caption') && table.querySelector('tr:first-child > td[colspan]')
          ? [{ ruleId: 'table-fake-caption', element: table, impact: 'minor' }]
          : [],
      ),
  },
  {
    id: 'frame-title-unique',
    presets: AA_PRESETS,
    check: (context) => {
      const seen = new Map<string, Element>();
      return queryAll(context, 'iframe[title], frame[title]').flatMap((frame) => {
        const title = frame.getAttribute('title')?.trim();
        if (!title) return [];
        if (seen.has(title)) return [{ ruleId: 'frame-title-unique', element: frame, impact: 'moderate' }];
        seen.set(title, frame);
        return [];
      });
    },
  },
  {
    id: 'frame-focusable-content',
    presets: STRICT_PRESETS,
    check: (context) =>
      queryAll(context, 'iframe[tabindex="-1"], frame[tabindex="-1"]').map((frame) => ({
        ruleId: 'frame-focusable-content',
        element: frame,
        impact: 'minor' as axe.ImpactValue,
      })),
  },
  {
    id: 'blink',
    presets: ALL_PRESETS,
    check: (context) =>
      queryAll(context, 'blink').map((element) => ({ ruleId: 'blink', element, impact: 'serious' })),
  },
  {
    id: 'marquee',
    presets: ALL_PRESETS,
    check: (context) =>
      queryAll(context, 'marquee').map((element) => ({
        ruleId: 'marquee',
        element,
        impact: 'serious' as axe.ImpactValue,
      })),
  },
  {
    id: 'meta-refresh',
    presets: AA_PRESETS,
    check: (context) =>
      queryAll(context, 'meta[http-equiv="refresh" i]').map((element) => ({
        ruleId: 'meta-refresh',
        element,
        impact: 'serious' as axe.ImpactValue,
      })),
  },
  {
    id: 'no-autoplay-audio',
    presets: AA_PRESETS,
    check: (context) =>
      queryAll(context, 'audio[autoplay], video[autoplay]').flatMap((media) =>
        media.hasAttribute('muted') || media.hasAttribute('controls')
          ? []
          : [{ ruleId: 'no-autoplay-audio', element: media, impact: 'serious' }],
      ),
  },
  {
    id: 'audio-caption',
    presets: AA_PRESETS,
    check: (context) =>
      queryAll(context, 'audio').flatMap((audio) =>
        audio.querySelector('track[kind="captions"], track[kind="subtitles"]')
          ? []
          : [{ ruleId: 'audio-caption', element: audio, impact: 'moderate' }],
      ),
  },
  {
    id: 'input-button-name',
    presets: ALL_PRESETS,
    check: (context) =>
      queryAll(context, 'input[type="button"], input[type="submit"], input[type="reset"]').flatMap(
        (input) =>
          hasExplicitName(input) || input.getAttribute('value')?.trim()
            ? []
            : [{ ruleId: 'input-button-name', element: input, impact: 'serious' }],
      ),
  },
  {
    id: 'input-image-alt',
    presets: ALL_PRESETS,
    check: (context) =>
      queryAll(context, 'input[type="image"]').flatMap((input) =>
        input.getAttribute('alt')?.trim()
          ? []
          : [{ ruleId: 'input-image-alt', element: input, impact: 'serious' }],
      ),
  },
  {
    id: 'select-name',
    presets: ALL_PRESETS,
    check: (context) =>
      queryAll(context, 'select').flatMap((select) =>
        hasExplicitName(select) || context.document.querySelector(`label[for="${select.id}"]`)
          ? []
          : [{ ruleId: 'select-name', element: select, impact: 'serious' }],
      ),
  },
  {
    id: 'label-title-only',
    presets: STRICT_PRESETS,
    check: (context) =>
      queryAll(context, 'input, textarea, select').flatMap((control) => {
        const id = control.getAttribute('id');
        const hasLabel = id ? Boolean(context.document.querySelector(`label[for="${escapeIdent(id)}"]`)) : false;
        const wrapped = Boolean(control.closest('label'));
        return !hasLabel &&
          !wrapped &&
          !control.getAttribute('aria-label') &&
          (control.getAttribute('title') || control.getAttribute('aria-describedby'))
          ? [{ ruleId: 'label-title-only', element: control, impact: 'minor' }]
          : [];
      }),
  },
  {
    id: 'svg-img-alt',
    presets: AA_PRESETS,
    check: (context) =>
      queryAll(context, 'svg[role="img"]').flatMap((svg) =>
        hasExplicitName(svg) || svg.querySelector('title')
          ? []
          : [{ ruleId: 'svg-img-alt', element: svg, impact: 'serious' }],
      ),
  },
  {
    id: 'role-img-alt',
    presets: AA_PRESETS,
    check: (context) =>
      queryAll(context, '[role="img"]').flatMap((element) =>
        hasExplicitName(element) || element.querySelector('title')
          ? []
          : [{ ruleId: 'role-img-alt', element, impact: 'serious' }],
      ),
  },
  {
    id: 'object-alt',
    presets: AA_PRESETS,
    check: (context) =>
      queryAll(context, 'object').flatMap((element) =>
        hasText(element) || hasExplicitName(element)
          ? []
          : [{ ruleId: 'object-alt', element, impact: 'moderate' }],
      ),
  },
  {
    id: 'nested-interactive',
    presets: ALL_PRESETS,
    check: (context) =>
      queryAll(context, 'a, button, input, select, textarea, [role="button"], [role="link"]').flatMap((element) =>
        Array.from(element.children).some((child) => isInteractive(child))
          ? [{ ruleId: 'nested-interactive', element, impact: 'serious' }]
          : [],
      ),
  },
  {
    id: 'focus-order-semantics',
    presets: AA_PRESETS,
    check: (context) =>
      queryAll(context, '[tabindex]').flatMap((element) => {
        const value = Number(element.getAttribute('tabindex'));
        return Number.isFinite(value) && value >= 0 && !isInteractive(element)
          ? [{ ruleId: 'focus-order-semantics', element, impact: 'moderate' }]
          : [];
      }),
  },
  {
    id: 'landmark-one-main',
    presets: AA_PRESETS,
    check: (context) => {
      const mains = queryAll(context, 'main, [role="main"]');
      return mains.length === 1 || !hasScannableContent(context)
        ? []
        : [{ ruleId: 'landmark-one-main', element: mains[1] ?? context.document.body, impact: 'moderate' }];
    },
  },
  {
    id: 'landmark-no-duplicate-main',
    presets: AA_PRESETS,
    check: (context) => {
      const mains = queryAll(context, 'main, [role="main"]');
      return mains.slice(1).map((element) => ({
        ruleId: 'landmark-no-duplicate-main',
        element,
        impact: 'moderate' as axe.ImpactValue,
      }));
    },
  },
  {
    id: 'landmark-unique',
    presets: STRICT_PRESETS,
    check: (context) => {
      const seen = new Set<string>();
      return queryAll(context, 'nav, aside, section[aria-label], [role="navigation"], [role="complementary"]').flatMap(
        (landmark) => {
          const key = `${landmark.getAttribute('role') ?? getElementName(landmark)}:${getAccessibleName(landmark)}`;
          if (!getAccessibleName(landmark)) return [];
          if (seen.has(key)) return [{ ruleId: 'landmark-unique', element: landmark, impact: 'minor' }];
          seen.add(key);
          return [];
        },
      );
    },
  },
  {
    id: 'duplicate-id',
    presets: ALL_PRESETS,
    check: (context) => {
      const seen = new Set<string>();
      return queryAll(context, '[id]').flatMap((element) => {
        const id = element.id;
        if (!id || !seen.has(id)) {
          seen.add(id);
          return [];
        }
        return [{ ruleId: 'duplicate-id', element, impact: 'serious' }];
      });
    },
  },
  {
    id: 'duplicate-id-active',
    presets: ALL_PRESETS,
    check: (context) => {
      const seen = new Set<string>();
      return queryAll(context, '[id]').flatMap((element) => {
        const id = element.id;
        if (!id || !isInteractive(element) || !seen.has(id)) {
          if (id) seen.add(id);
          return [];
        }
        return [{ ruleId: 'duplicate-id-active', element, impact: 'serious' }];
      });
    },
  },
  {
    id: 'duplicate-id-aria',
    presets: ALL_PRESETS,
    check: (context) => {
      const references = new Set(
        queryAll(context, '[aria-labelledby], [aria-describedby], label[for]')
          .flatMap((element) => [
            element.getAttribute('aria-labelledby'),
            element.getAttribute('aria-describedby'),
            element.getAttribute('for'),
          ])
          .filter(Boolean)
          .flatMap((value) => value!.split(/\s+/)),
      );
      const seen = new Set<string>();
      return queryAll(context, '[id]').flatMap((element) => {
        const id = element.id;
        if (!id || !references.has(id) || !seen.has(id)) {
          if (id) seen.add(id);
          return [];
        }
        return [{ ruleId: 'duplicate-id-aria', element, impact: 'serious' }];
      });
    },
  },
  {
    id: 'accesskeys',
    presets: STRICT_PRESETS,
    check: (context) => {
      const seen = new Set<string>();
      return queryAll(context, '[accesskey]').flatMap((element) => {
        const key = element.getAttribute('accesskey')?.toLowerCase();
        if (!key || !seen.has(key)) {
          if (key) seen.add(key);
          return [];
        }
        return [{ ruleId: 'accesskeys', element, impact: 'minor' }];
      });
    },
  },
  {
    id: 'aria-hidden-body',
    presets: ALL_PRESETS,
    check: (context) =>
      context.document.body.getAttribute('aria-hidden') === 'true'
        ? [{ ruleId: 'aria-hidden-body', element: context.document.body, impact: 'critical' }]
        : [],
  },
  {
    id: 'aria-hidden-focus',
    presets: ALL_PRESETS,
    check: (context) =>
      queryAll(context, '[aria-hidden="true"]').flatMap((element) =>
        isFocusable(element) || Array.from(element.querySelectorAll('*')).some(isFocusable)
          ? [{ ruleId: 'aria-hidden-focus', element, impact: 'serious' }]
          : [],
      ),
  },
  {
    id: 'presentation-role-conflict',
    presets: AA_PRESETS,
    check: (context) =>
      queryAll(context, '[role="presentation"], [role="none"]').flatMap((element) =>
        Array.from(element.attributes).some((attribute) => attribute.name.startsWith('aria-')) ||
        element.hasAttribute('tabindex')
          ? [{ ruleId: 'presentation-role-conflict', element, impact: 'minor' }]
          : [],
      ),
  },
  {
    id: 'p-as-heading',
    presets: STRICT_PRESETS,
    check: (context) =>
      queryAll(context, 'p').flatMap((paragraph) => {
        const style = paragraph.getAttribute('style') ?? '';
        return /font-size\s*:\s*(2[4-9]|[3-9]\d)px/i.test(style) || /font-weight\s*:\s*(bold|[7-9]00)/i.test(style)
          ? [{ ruleId: 'p-as-heading', element: paragraph, impact: 'minor' }]
          : [];
      }),
  },
  {
    id: 'target-size',
    presets: STRICT_PRESETS,
    check: (context) =>
      queryAll(context, 'a[href], button, input, select, textarea, [role="button"], [role="link"]').flatMap((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return [];
        return rect.width < 24 || rect.height < 24
          ? [{ ruleId: 'target-size', element, impact: 'minor' }]
          : [];
      }),
  },
];

export function runCustomRules(
  document: Document,
  preset: AxePreset,
  excludeSelector: string,
): A11yViolationNode[] {
  const context: CustomRuleContext = { document, preset, excludeSelector };

  return customRules
    .filter((rule) => rule.presets.includes(preset))
    .flatMap((rule) => rule.check(context))
    .map(pushViolation);
}
