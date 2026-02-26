/**
 * RuA11yOverlay.test.tsx — тесты компонента оверлея
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RuA11yOverlay } from '../src/RuA11yOverlay';
import axe from 'axe-core';

// Мокируем axe-core, чтобы не запускать реальное сканирование в тестах
jest.mock('axe-core', () => ({
  __esModule: true,
  default: {
    run: jest.fn().mockResolvedValue({
      violations: [],
      passes: [],
      incomplete: [],
      inapplicable: [],
    }),
  },
}));

// Мокируем createPortal чтобы рендерить в обычное дерево React
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}));

describe('RuA11yOverlay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('рендерит кнопку-переключатель', async () => {
    await act(async () => {
      render(<RuA11yOverlay />);
    });

    const button = screen.getByRole('button', { name: /открыть отчёт по доступности/i });
    expect(button).toBeInTheDocument();
  });

  it('открывает панель при нажатии на кнопку', async () => {
    await act(async () => {
      render(<RuA11yOverlay />);
    });

    const toggleBtn = screen.getByRole('button', { name: /открыть отчёт по доступности/i });

    await act(async () => {
      fireEvent.click(toggleBtn);
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('закрывает панель при повторном нажатии', async () => {
    await act(async () => {
      render(<RuA11yOverlay />);
    });

    const toggleBtn = screen.getByRole('button', { name: /открыть отчёт по доступности/i });

    await act(async () => {
      fireEvent.click(toggleBtn);
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /закрыть панель/i });

    await act(async () => {
      fireEvent.click(closeBtn);
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('показывает состояние загрузки во время сканирования', async () => {
    // Задерживаем ответ axe
    const mockedRun = axe.run as jest.MockedFunction<typeof axe.run>;
    mockedRun.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ violations: [], passes: [], incomplete: [], inapplicable: [] } as any), 2000)),
    );

    await act(async () => {
      render(<RuA11yOverlay />);
      jest.advanceTimersByTime(350); // запускаем начальное сканирование
    });

    // Открываем панель
    const toggleBtn = screen.getByRole('button', { name: /открыть отчёт/i });
    await act(async () => {
      fireEvent.click(toggleBtn);
    });

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('показывает пустое состояние когда нарушений нет', async () => {
    await act(async () => {
      render(<RuA11yOverlay />);
      jest.advanceTimersByTime(2000);
    });

    await act(async () => {
      await Promise.resolve(); // flush promises
    });

    const toggleBtn = screen.getByRole('button', { name: /открыть отчёт/i });
    await act(async () => {
      fireEvent.click(toggleBtn);
    });

    expect(screen.getByText(/нарушений не обнаружено/i)).toBeInTheDocument();
  });

  it('кнопка имеет корректный aria-expanded', async () => {
    await act(async () => {
      render(<RuA11yOverlay />);
    });

    const toggleBtn = screen.getByRole('button', { name: /открыть отчёт/i });
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');

    await act(async () => {
      fireEvent.click(toggleBtn);
    });

    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
  });
});



