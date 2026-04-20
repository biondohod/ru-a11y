import { act, renderHook, waitFor } from '@testing-library/react';
import {
  VISUALLY_IMPAIRED_STORAGE_KEY,
  resetVisuallyImpairedSettings,
  setVisuallyImpairedSettings,
  useColorScheme,
  useFontSize,
  useLinkSettings,
  useVisuallyImpaired,
} from '../src/useVisuallyImpaired';

describe('useVisuallyImpaired', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-ru-a11y-vi-font-size');
    document.documentElement.removeAttribute('data-ru-a11y-vi-line-height');
    document.documentElement.removeAttribute('data-ru-a11y-vi-letter-spacing');
    document.documentElement.removeAttribute('data-ru-a11y-vi-color-scheme');
    document.documentElement.removeAttribute('data-ru-a11y-vi-image-mode');
    document.documentElement.removeAttribute('data-ru-a11y-vi-underline-links');
    document.documentElement.removeAttribute('data-ru-a11y-vi-highlight-links');
    document.documentElement.removeAttribute('data-ru-a11y-vi-reduced-motion');
    document.documentElement.removeAttribute('data-ru-a11y-vi-strong-focus');
    document.body.innerHTML = '';
    resetVisuallyImpairedSettings();
  });

  it('returns disabled state by default', () => {
    const { result } = renderHook(() => useVisuallyImpaired());
    expect(result.current.isEnabled).toBe(false);
  });

  it('adds the html class on toggle', () => {
    const { result } = renderHook(() => useVisuallyImpaired());

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isEnabled).toBe(true);
    expect(document.documentElement.classList.contains('ru-a11y-visually-impaired')).toBe(true);
  });

  it('removes the html class on second toggle', () => {
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

  it('keeps toggle stable across a rerender without state changes', () => {
    const { result, rerender } = renderHook(() => useVisuallyImpaired());
    const toggleBefore = result.current.toggle;

    rerender();

    expect(result.current.toggle).toBe(toggleBefore);
  });

  it('persists settings to localStorage', () => {
    const { result } = renderHook(() => useVisuallyImpaired());

    act(() => {
      result.current.setSettings({
        enabled: true,
        fontSize: 'xlarge',
        colorScheme: 'black-white',
      });
    });

    const raw = localStorage.getItem(VISUALLY_IMPAIRED_STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!)).toMatchObject({
      enabled: true,
      fontSize: 'xlarge',
      colorScheme: 'black-white',
    });
    expect(document.documentElement).toHaveAttribute('data-ru-a11y-vi-font-size', 'xlarge');
    expect(document.documentElement).toHaveAttribute('data-ru-a11y-vi-color-scheme', 'black-white');
  });

  it('restores settings from localStorage', async () => {
    localStorage.setItem(
      VISUALLY_IMPAIRED_STORAGE_KEY,
      JSON.stringify({ enabled: true, fontSize: 'xlarge', underlineLinks: false }),
    );

    const { result } = renderHook(() => useVisuallyImpaired());

    await waitFor(() => {
      expect(result.current.isEnabled).toBe(true);
      expect(result.current.settings.fontSize).toBe('xlarge');
      expect(result.current.settings.underlineLinks).toBe(false);
    });
  });

  it('exposes dedicated hooks for font, color and links', () => {
    const font = renderHook(() => useFontSize());
    const color = renderHook(() => useColorScheme());
    const links = renderHook(() => useLinkSettings());

    act(() => {
      font.result.current.setFontSize('xlarge');
      color.result.current.setColorScheme('blue-yellow');
      links.result.current.setHighlightLinks(true);
    });

    expect(font.result.current.fontSize).toBe('xlarge');
    expect(color.result.current.colorScheme).toBe('blue-yellow');
    expect(links.result.current.highlightLinks).toBe(true);
    expect(document.documentElement.classList.contains('ru-a11y-visually-impaired')).toBe(false);
    expect(document.documentElement).toHaveAttribute('data-ru-a11y-vi-font-size', 'xlarge');
    expect(document.documentElement).toHaveAttribute('data-ru-a11y-vi-color-scheme', 'blue-yellow');
    expect(document.documentElement).toHaveAttribute('data-ru-a11y-vi-highlight-links');
  });

  it('applies link settings without enabling full visually impaired mode', () => {
    const { result } = renderHook(() => useLinkSettings());

    act(() => {
      result.current.setUnderlineLinks(true);
    });

    expect(document.documentElement.classList.contains('ru-a11y-visually-impaired')).toBe(false);
    expect(document.documentElement).toHaveAttribute('data-ru-a11y-vi-underline-links');
  });

  it('applies programmatic settings changes', () => {
    setVisuallyImpairedSettings({ enabled: true, imageMode: 'grayscale' });

    expect(document.documentElement.classList.contains('ru-a11y-visually-impaired')).toBe(true);
    expect(document.documentElement).toHaveAttribute('data-ru-a11y-vi-image-mode', 'grayscale');
  });

  it('adds an alt caption under images when the mode is enabled', () => {
    document.body.innerHTML = '<img src="/cat.jpg" alt="Cat on a windowsill" />';

    const { result } = renderHook(() => useVisuallyImpaired());

    act(() => {
      result.current.toggle();
    });

    const image = document.querySelector('img');
    const caption = image?.nextElementSibling;

    expect(caption).not.toBeNull();
    expect(caption).toHaveClass('ru-a11y-visually-impaired-image-alt');
    expect(caption).toHaveTextContent('Cat on a windowsill');
  });

  it('does not add a caption for decorative images', () => {
    document.body.innerHTML = '<img src="/decorative.jpg" alt="" />';

    const { result } = renderHook(() => useVisuallyImpaired());

    act(() => {
      result.current.toggle();
    });

    expect(document.querySelector('.ru-a11y-visually-impaired-image-alt')).toBeNull();
  });

  it('removes image captions when the mode is disabled', () => {
    document.body.innerHTML = '<img src="/cat.jpg" alt="Cat on a windowsill" />';

    const { result } = renderHook(() => useVisuallyImpaired());

    act(() => {
      result.current.toggle();
    });

    act(() => {
      result.current.toggle();
    });

    expect(document.querySelector('.ru-a11y-visually-impaired-image-alt')).toBeNull();
  });

  it('updates image captions when alt changes', async () => {
    document.body.innerHTML = '<img src="/cat.jpg" alt="Cat" />';

    const { result } = renderHook(() => useVisuallyImpaired());

    act(() => {
      result.current.toggle();
    });

    const image = document.querySelector('img');

    act(() => {
      image?.setAttribute('alt', 'Cat on a windowsill');
    });

    await waitFor(() => {
      const caption = document.querySelector('.ru-a11y-visually-impaired-image-alt');
      expect(caption).toHaveTextContent('Cat on a windowsill');
    });
  });
});
