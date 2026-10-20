import * as core from 'ru-a11y-toolkit-core';
import { RU_A11Y_RULES, WCAG_PRINCIPLES, getRuleMeta } from '../src';

describe('catalog re-exports', () => {
  it('exposes the core catalog unchanged', () => {
    expect(RU_A11Y_RULES).toBe(core.RU_A11Y_RULES);
    expect(WCAG_PRINCIPLES).toBe(core.WCAG_PRINCIPLES);
    expect(getRuleMeta).toBe(core.getRuleMeta);
  });
});
