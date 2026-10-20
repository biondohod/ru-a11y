import { mapWithConcurrency } from '../src/utils/concurrency';

describe('mapWithConcurrency', () => {
  it('preserves input order', async () => {
    const result = await mapWithConcurrency(
      [30, 10, 20],
      (delay) => new Promise<number>((resolve) => setTimeout(() => resolve(delay), delay)),
      3,
    );

    expect(result).toEqual([30, 10, 20]);
  });

  it('never runs more than `concurrency` workers at once', async () => {
    let active = 0;
    let peak = 0;

    await mapWithConcurrency(
      Array.from({ length: 10 }, (_, index) => index),
      async () => {
        active += 1;
        peak = Math.max(peak, active);
        await new Promise((resolve) => setTimeout(resolve, 5));
        active -= 1;
      },
      3,
    );

    expect(peak).toBe(3);
  });

  it('handles an empty list', async () => {
    await expect(mapWithConcurrency([], async () => 1, 4)).resolves.toEqual([]);
  });
});
