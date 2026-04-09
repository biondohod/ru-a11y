import { useState, useCallback } from 'react';

/**
 * CSS-класс, добавляемый на <html> для активации режима повышенной читабельности.
 * Соответствует требованиям Постановления №102 и ГОСТ Р 52872 о возможности
 * переключения в режим для слабовидящих.
 */
const VISUALLY_IMPAIRED_CLASS = 'ru-a11y-visually-impaired';
const IMAGE_ALT_CAPTION_CLASS = 'ru-a11y-visually-impaired-image-alt';
const IMAGE_ALT_CAPTION_ATTRIBUTE = 'data-ru-a11y-image-alt-caption';

let imageAltObserver: MutationObserver | null = null;
let isSyncingImageAltCaptions = false;

function syncImageAltCaptions(): void {
  if (typeof document === 'undefined' || isSyncingImageAltCaptions) {
    return;
  }

  isSyncingImageAltCaptions = true;

  try {
    const images = Array.from(document.querySelectorAll<HTMLImageElement>('img[alt]'));
    const activeImages = new Set(images);

    images.forEach((image) => {
      const altText = image.getAttribute('alt')?.trim();
      const nextSibling = image.nextElementSibling;
      const existingCaption =
        nextSibling instanceof HTMLElement &&
        nextSibling.classList.contains(IMAGE_ALT_CAPTION_CLASS)
          ? nextSibling
          : null;

      if (!altText) {
        existingCaption?.remove();
        return;
      }

      const caption = existingCaption ?? document.createElement('span');
      caption.className = IMAGE_ALT_CAPTION_CLASS;
      caption.setAttribute(IMAGE_ALT_CAPTION_ATTRIBUTE, 'true');
      caption.textContent = altText;

      if (!existingCaption) {
        image.insertAdjacentElement('afterend', caption);
      }
    });

    const captions = Array.from(
      document.querySelectorAll<HTMLElement>(`.${IMAGE_ALT_CAPTION_CLASS}`)
    );

    captions.forEach((caption) => {
      const previousSibling = caption.previousElementSibling;

      if (!(previousSibling instanceof HTMLImageElement) || !activeImages.has(previousSibling)) {
        caption.remove();
      }
    });
  } finally {
    isSyncingImageAltCaptions = false;
  }
}

function startImageAltObserver(): void {
  if (typeof document === 'undefined' || imageAltObserver) {
    return;
  }

  imageAltObserver = new MutationObserver(() => {
    syncImageAltCaptions();
  });

  imageAltObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['alt'],
  });
}

function stopImageAltObserver(): void {
  imageAltObserver?.disconnect();
  imageAltObserver = null;
}

function removeImageAltCaptions(): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.querySelectorAll(`.${IMAGE_ALT_CAPTION_CLASS}`).forEach((caption) => {
    caption.remove();
  });
}

/**
 * Возвращаемый тип хука useVisuallyImpaired
 */
export interface UseVisuallyImpairedReturn {
  /** Активен ли сейчас режим повышенной читабельности */
  isEnabled: boolean;
  /** Переключить режим повышенной читабельности */
  toggle: () => void;
}

/**
 * Хук для управления режимом повышенной читабельности для слабовидящих.
 *
 * При активации добавляет класс `ru-a11y-visually-impaired` на <html>,
 * что активирует CSS-стили из visually-impaired.css:
 * — увеличенный шрифт (1.5rem и выше)
 * — чёрный текст на белом фоне (высокий контраст)
 * — усиленный фокус-индикатор
 * — обесцвеченные изображения с повышенным контрастом
 *
 * Состояние не сохраняется в localStorage — разработчик решает это самостоятельно
 * (пример хранения см. в README).
 *
 * @example
 * ```tsx
 * import { useVisuallyImpaired } from 'ru-a11y-toolkit-visually-impaired';
 * import 'ru-a11y-toolkit-visually-impaired/styles/visually-impaired.css';
 *
 * function Header() {
 *   const { toggle, isEnabled } = useVisuallyImpaired();
 *   return (
 *     <button onClick={toggle} aria-pressed={isEnabled}>
 *       {isEnabled ? 'Обычная версия' : 'Версия для слабовидящих'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useVisuallyImpaired(): UseVisuallyImpairedReturn {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);

  const toggle = useCallback(() => {
    setIsEnabled((prev) => {
      const next = !prev;
      // Переключаем CSS-класс на корневом элементе документа.
      // Это позволяет CSS-файлу применять стили глобально через каскад.
      document.documentElement.classList.toggle(VISUALLY_IMPAIRED_CLASS, next);

      if (next) {
        syncImageAltCaptions();
        startImageAltObserver();
      } else {
        stopImageAltObserver();
        removeImageAltCaptions();
      }

      return next;
    });
  }, []);

  return { toggle, isEnabled };
}
