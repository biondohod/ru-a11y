import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RuA11yOverlay } from '../src/RuA11yOverlay';
import axe from 'axe-core';

// Keep tests fast: no real axe-core scan.
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

// Render portals inline so Testing Library can query them.
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}));

/** The scan awaits several promises in a row; let all of them settle. */
async function flushPromises(rounds = 10): Promise<void> {
  for (let round = 0; round < rounds; round += 1) {
    await Promise.resolve();
  }
}

describe('RuA11yOverlay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the toggle button', async () => {
    await act(async () => {
      render(<RuA11yOverlay />);
    });

    const button = screen.getByRole('button', { name: /открыть отчёт по доступности/i });
    expect(button).toBeInTheDocument();
  });

  it('opens the panel on click', async () => {
    await act(async () => {
      render(<RuA11yOverlay />);
    });

    const toggleBtn = screen.getByRole('button', { name: /открыть отчёт по доступности/i });

    await act(async () => {
      fireEvent.click(toggleBtn);
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes the panel', async () => {
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

  it('shows a loading state while scanning', async () => {
    // Delay the axe response
    const mockedRun = axe.run as jest.MockedFunction<typeof axe.run>;
    mockedRun.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                violations: [],
                passes: [],
                incomplete: [],
                inapplicable: [],
              } as unknown as axe.AxeResults),
            2000,
          ),
        ),
    );

    await act(async () => {
      render(<RuA11yOverlay />);
      jest.advanceTimersByTime(350); // trigger the initial scan
    });

    // Open the panel
    const toggleBtn = screen.getByRole('button', { name: /открыть отчёт/i });
    await act(async () => {
      fireEvent.click(toggleBtn);
    });

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows the empty state when there are no violations', async () => {
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

  it('renders violation cards without nested interactive controls', async () => {
    (axe.run as unknown as jest.Mock).mockResolvedValue({
      violations: [
        {
          id: 'image-alt',
          impact: 'critical',
          nodes: [{ target: ['img'], html: '<img>', impact: 'critical', failureSummary: 'fix' }],
        },
      ],
    } as unknown as axe.AxeResults);
    document.body.innerHTML = '<main><h1>Страница</h1><img src="a.png"></main>';

    await act(async () => {
      render(<RuA11yOverlay customRules={false} />);
    });
    // Effects (and the initial scan timer) are registered when the first act() exits.
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await flushPromises();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /открыть отчёт/i }));
    });

    const card = screen.getByRole('button', { name: /подсветить элемент/i });
    expect(card.tagName).toBe('BUTTON');
    expect(card.querySelector('button, [role="button"]')).toBeNull();
  });

  it('keeps aria-expanded in sync', async () => {
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
