import { fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react';
import {
  VISUALLY_IMPAIRED_STORAGE_KEY,
  VisuallyImpairedOverlay,
  getVisuallyImpairedSettings,
  resetVisuallyImpairedSettings,
} from '../src';

describe('VisuallyImpairedOverlay', () => {
  beforeEach(() => {
    localStorage.clear();
    resetVisuallyImpairedSettings();
  });

  it('starts collapsed and expands on click', () => {
    render(<VisuallyImpairedOverlay />);

    fireEvent.click(screen.getByRole('button', { name: 'Версия' }));

    expect(screen.getByRole('heading', { name: 'Версия для слабовидящих' })).toBeInTheDocument();
  });

  it('labels every option group', () => {
    render(<VisuallyImpairedOverlay defaultOpen />);

    for (const name of ['Размер текста', 'Интервал', 'Цвет', 'Изображения']) {
      expect(screen.getByRole('group', { name })).toBeInTheDocument();
    }
  });

  it('marks the selected option and updates the settings', () => {
    render(<VisuallyImpairedOverlay defaultOpen />);
    const fontSize = screen.getByRole('group', { name: 'Размер текста' });
    const large = Array.from(fontSize.querySelectorAll('button')).find(
      (button) => button.textContent === '125%',
    )!;

    fireEvent.click(large);

    expect(large).toHaveAttribute('aria-pressed', 'true');
    expect(getVisuallyImpairedSettings().fontSize).toBe('large');
  });

  it('syncs settings changed in another tab', () => {
    render(<VisuallyImpairedOverlay defaultOpen />);
    const contrast = screen.getByRole('checkbox', { name: 'Усилить фокус' });

    act(() => {
      localStorage.setItem(VISUALLY_IMPAIRED_STORAGE_KEY, JSON.stringify({ strongFocus: true }));
      window.dispatchEvent(new StorageEvent('storage', { key: VISUALLY_IMPAIRED_STORAGE_KEY }));
    });

    expect(contrast).toBeChecked();
  });
});
