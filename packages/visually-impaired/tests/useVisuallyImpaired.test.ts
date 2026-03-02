import { renderHook, act } from '@testing-library/react';
import { useVisuallyImpaired } from '../src/useVisuallyImpaired';

describe('useVisuallyImpaired', () => {
  beforeEach(() => {
    // Сбрасываем класс перед каждым тестом
    document.documentElement.classList.remove('ru-a11y-visually-impaired');
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
});

