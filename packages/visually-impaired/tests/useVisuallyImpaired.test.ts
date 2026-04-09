import { renderHook, act, waitFor } from '@testing-library/react';
import { useVisuallyImpaired } from '../src/useVisuallyImpaired';

describe('useVisuallyImpaired', () => {
  beforeEach(() => {
    // Сбрасываем класс перед каждым тестом
    document.documentElement.classList.remove('ru-a11y-visually-impaired');
    document.body.innerHTML = '';
  });

  it('должен возвращать isEnabled = false по умолчанию', () => {
    const { result } = renderHook(() => useVisuallyImpaired());
    expect(result.current.isEnabled).toBe(false);
  });

  it('должен добавлять класс на <html> при первом вызове toggle', () => {
    const { result } = renderHook(() => useVisuallyImpaired());

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isEnabled).toBe(true);
    expect(document.documentElement.classList.contains('ru-a11y-visually-impaired')).toBe(true);
  });

  it('должен убирать класс с <html> при повторном вызове toggle', () => {
    const { result } = renderHook(() => useVisuallyImpaired());

    act(() => {
      result.current.toggle();
    });

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isEnabled).toBe(false);
    expect(document.documentElement.classList.contains('ru-a11y-visually-impaired')).toBe(false);
  });

  it('должен экспортировать стабильную функцию toggle (useCallback)', () => {
    const { result, rerender } = renderHook(() => useVisuallyImpaired());
    const toggleBefore = result.current.toggle;

    rerender();

    expect(result.current.toggle).toBe(toggleBefore);
  });

  it('должен добавлять подпись с alt-текстом под изображением при включении режима', () => {
    document.body.innerHTML = '<img src="/cat.jpg" alt="Кот на подоконнике" />';

    const { result } = renderHook(() => useVisuallyImpaired());

    act(() => {
      result.current.toggle();
    });

    const image = document.querySelector('img');
    const caption = image?.nextElementSibling;

    expect(caption).not.toBeNull();
    expect(caption).toHaveClass('ru-a11y-visually-impaired-image-alt');
    expect(caption).toHaveTextContent('Кот на подоконнике');
  });

  it('не должен добавлять подпись для декоративного изображения с пустым alt', () => {
    document.body.innerHTML = '<img src="/decorative.jpg" alt="" />';

    const { result } = renderHook(() => useVisuallyImpaired());

    act(() => {
      result.current.toggle();
    });

    expect(document.querySelector('.ru-a11y-visually-impaired-image-alt')).toBeNull();
  });

  it('должен удалять подпись под изображением при выключении режима', () => {
    document.body.innerHTML = '<img src="/cat.jpg" alt="Кот на подоконнике" />';

    const { result } = renderHook(() => useVisuallyImpaired());

    act(() => {
      result.current.toggle();
    });

    act(() => {
      result.current.toggle();
    });

    expect(document.querySelector('.ru-a11y-visually-impaired-image-alt')).toBeNull();
  });

  it('должен обновлять подпись при изменении alt-текста в активном режиме', async () => {
    document.body.innerHTML = '<img src="/cat.jpg" alt="Кот" />';

    const { result } = renderHook(() => useVisuallyImpaired());

    act(() => {
      result.current.toggle();
    });

    const image = document.querySelector('img');

    act(() => {
      image?.setAttribute('alt', 'Кот на подоконнике');
    });

    await waitFor(() => {
      const caption = document.querySelector('.ru-a11y-visually-impaired-image-alt');
      expect(caption).toHaveTextContent('Кот на подоконнике');
    });
  });
});
