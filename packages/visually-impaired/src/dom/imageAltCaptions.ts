import { canUseDOM } from './env';

const CAPTION_CLASS = 'ru-a11y-visually-impaired-image-alt';
const CAPTION_ATTRIBUTE = 'data-ru-a11y-image-alt-caption';

let observer: MutationObserver | null = null;
let isSyncing = false;

function observe(): void {
  observer?.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['alt'],
  });
}

function getCaption(image: HTMLImageElement): HTMLElement | null {
  const next = image.nextElementSibling;
  return next instanceof HTMLElement && next.classList.contains(CAPTION_CLASS) ? next : null;
}

function upsertCaption(image: HTMLImageElement): void {
  const altText = image.getAttribute('alt')?.trim();
  const existing = getCaption(image);

  // Decorative images (alt="") get no caption.
  if (!altText) {
    existing?.remove();
    return;
  }

  const caption = existing ?? document.createElement('span');
  caption.className = CAPTION_CLASS;
  caption.setAttribute(CAPTION_ATTRIBUTE, 'true');
  caption.textContent = altText;

  if (!existing) {
    image.insertAdjacentElement('afterend', caption);
  }
}

function removeOrphanCaptions(images: ReadonlySet<HTMLImageElement>): void {
  document.querySelectorAll<HTMLElement>(`.${CAPTION_CLASS}`).forEach((caption) => {
    const previous = caption.previousElementSibling;
    if (!(previous instanceof HTMLImageElement) || !images.has(previous)) {
      caption.remove();
    }
  });
}

/** Renders the `alt` text of every image as a visible caption right after it. */
export function syncImageAltCaptions(): void {
  if (!canUseDOM() || isSyncing) return;

  isSyncing = true;
  // Our own DOM writes must not re-trigger the observer.
  observer?.disconnect();

  try {
    const images = Array.from(document.querySelectorAll<HTMLImageElement>('img[alt]'));
    images.forEach(upsertCaption);
    removeOrphanCaptions(new Set(images));
  } finally {
    isSyncing = false;
    observe();
  }
}

export function enableImageAltCaptions(): void {
  if (!canUseDOM()) return;

  syncImageAltCaptions();
  if (!observer) {
    observer = new MutationObserver(syncImageAltCaptions);
    observe();
  }
}

export function disableImageAltCaptions(): void {
  observer?.disconnect();
  observer = null;

  if (canUseDOM()) {
    document.querySelectorAll(`.${CAPTION_CLASS}`).forEach((caption) => caption.remove());
  }
}
