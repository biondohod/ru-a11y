import { useState, useCallback } from 'react';

/**
 * CSS-класс, добавляемый на <html> для активации режима повышенной читабельности.
 * Соответствует требованиям Постановления №102 и ГОСТ Р 52872 о возможности
 * переключения в режим для слабовидящих.
 */
const VISUALLY_IMPAIRED_CLASS = 'ru-a11y-visually-impaired';

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
      return next;
    });
  }, []);

  return { toggle, isEnabled };
}

