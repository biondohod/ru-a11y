import type { CustomRuleContext } from './types';

const INTERACTIVE_ROLES = new Set([
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

const NATIVELY_FOCUSABLE = new Set(['button', 'input', 'select', 'textarea', 'summary', 'iframe']);
const NATIVELY_INTERACTIVE = new Set(['button', 'input', 'select', 'textarea', 'details']);

export function getTagName(element: Element): string {
  return element.tagName.toLowerCase();
}

export function isExcluded(element: Element, excludeSelector: string): boolean {
  return Boolean(excludeSelector && element.closest(excludeSelector));
}

/** `querySelectorAll` that skips the overlay itself. */
export function queryAll(context: CustomRuleContext, selector: string): Element[] {
  return Array.from(context.document.querySelectorAll(selector)).filter(
    (element) => !isExcluded(element, context.excludeSelector),
  );
}

/** Page-level rules stay silent until the page renders something besides the overlay. */
export function hasScannableContent(context: CustomRuleContext): boolean {
  return Array.from(context.document.body.children).some(
    (element) => !isExcluded(element, context.excludeSelector),
  );
}

export function escapeIdent(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }

  return value.replace(/[^a-zA-Z0-9_-]/g, '\\$&');
}

function hasUniqueId(element: Element): boolean {
  return (
    Boolean(element.id) &&
    element.ownerDocument.querySelectorAll(`#${escapeIdent(element.id)}`).length === 1
  );
}

function getSegment(element: Element): string {
  const tagName = getTagName(element);
  const parent = element.parentElement;
  if (!parent) return tagName;

  const sameTagSiblings = Array.from(parent.children).filter(
    (sibling) => sibling.tagName === element.tagName,
  );

  return sameTagSiblings.length > 1
    ? `${tagName}:nth-of-type(${sameTagSiblings.indexOf(element) + 1})`
    : tagName;
}

/**
 * Selector that matches exactly this element: the nearest unique id, or a
 * `tag:nth-of-type()` path from `<body>`. Used to deduplicate findings and to
 * highlight the element, so a selector shared by several elements is a bug.
 */
export function getUniqueSelector(element: Element): string {
  const segments: string[] = [];

  for (let current: Element | null = element; current; current = current.parentElement) {
    if (hasUniqueId(current)) {
      segments.unshift(`#${escapeIdent(current.id)}`);
      break;
    }

    const tagName = getTagName(current);
    if (tagName === 'body' || tagName === 'html') {
      segments.unshift(tagName);
      break;
    }

    segments.unshift(getSegment(current));
  }

  return segments.join(' > ');
}

export function hasText(element: Element): boolean {
  return Boolean((element.textContent ?? '').trim());
}

/** Name from `aria-label` or `aria-labelledby`. Content-based names are checked separately. */
export function getAccessibleName(element: Element): string {
  const ariaLabel = element.getAttribute('aria-label')?.trim();
  if (ariaLabel) return ariaLabel;

  const labelledBy = element.getAttribute('aria-labelledby')?.trim();
  if (!labelledBy) return '';

  return labelledBy
    .split(/\s+/)
    .map((id) => element.ownerDocument.getElementById(id)?.textContent?.trim() ?? '')
    .filter(Boolean)
    .join(' ');
}

export function hasExplicitName(element: Element): boolean {
  return Boolean(getAccessibleName(element));
}

/** `<label for>` or a wrapping `<label>`, via the native `labels` API. */
export function hasAssociatedLabel(element: Element): boolean {
  const { labels } = element as Element & { labels?: NodeListOf<HTMLLabelElement> | null };
  return Boolean(labels && labels.length > 0);
}

export function isFocusable(element: Element): boolean {
  if (!(element instanceof HTMLElement)) return false;
  if (element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true') {
    return false;
  }

  const tabIndex = element.getAttribute('tabindex');
  if (tabIndex !== null && Number(tabIndex) >= 0) return true;

  const tagName = getTagName(element);
  if (tagName === 'a' || tagName === 'area') return element.hasAttribute('href');
  return NATIVELY_FOCUSABLE.has(tagName);
}

export function isInteractive(element: Element): boolean {
  return (
    isFocusable(element) ||
    INTERACTIVE_ROLES.has(element.getAttribute('role') ?? '') ||
    NATIVELY_INTERACTIVE.has(getTagName(element))
  );
}

/** Elements from `elements` whose `key` was already seen earlier in the list. */
export function findRepeated(
  elements: Element[],
  getKey: (element: Element) => string | null | undefined,
): Element[] {
  const seen = new Set<string>();

  return elements.filter((element) => {
    const key = getKey(element);
    if (!key) return false;
    if (seen.has(key)) return true;
    seen.add(key);
    return false;
  });
}
