/**
 * rulesMap.test.ts — тесты маппинга правил
 */

import { getRuleMeta, RU_A11Y_RULES, WCAG_PRINCIPLES } from '../src/mapping/rulesMap';

describe('getRuleMeta', () => {
  it('возвращает правило из маппинга по известному ID', () => {
    const meta = getRuleMeta('image-alt');
    expect(meta.id).toBe('image-alt');
    expect(meta.title).toBeTruthy();
    expect(meta.description).toBeTruthy();
    expect(meta.fix).toBeTruthy();
    expect(meta.severity).toBe('error');
  });

  it('возвращает fallback для неизвестного правила', () => {
    const meta = getRuleMeta('unknown-axe-rule-xyz');
    expect(meta.id).toBe('unknown-axe-rule-xyz');
    expect(meta.title).toContain('unknown-axe-rule-xyz');
    expect(meta.severity).toBe('warning');
    expect(meta.description).toBeTruthy();
    expect(meta.fix).toBeTruthy();
  });

  it('fallback содержит ссылку на документацию axe-core', () => {
    const meta = getRuleMeta('some-unknown-rule');
    expect(meta.fix).toContain('axe-core');
  });
});

describe('RU_A11Y_RULES', () => {
  it('содержит ключевые правила', () => {
    const requiredRules = [
      'image-alt',
      'color-contrast',
      'label',
      'button-name',
      'link-name',
      'html-has-lang',
      'document-title',
      'heading-order',
    ];

    for (const ruleId of requiredRules) {
      expect(RU_A11Y_RULES).toHaveProperty(ruleId);
    }
  });

  it('каждое правило имеет обязательные поля', () => {
    for (const [id, rule] of Object.entries(RU_A11Y_RULES)) {
      expect(rule.id).toBe(id);
      expect(rule.title).toBeTruthy();
      expect(rule.description).toBeTruthy();
      expect(rule.fix).toBeTruthy();
      expect(['error', 'warning']).toContain(rule.severity);
    }
  });

  it('правила с ссылками на ГОСТ содержат корректный формат', () => {
    const rulesWithGost = Object.values(RU_A11Y_RULES).filter((r) => r.gost);
    expect(rulesWithGost.length).toBeGreaterThan(0);

    for (const rule of rulesWithGost) {
      expect(rule.gost).toMatch(/ГОСТ/i);
    }
  });

  it('правила с ссылками на Постановление №102 содержат корректный формат', () => {
    const rulesWithPost = Object.values(RU_A11Y_RULES).filter((r) => r.post102);
    expect(rulesWithPost.length).toBeGreaterThan(0);

    for (const rule of rulesWithPost) {
      expect(rule.post102).toMatch(/Постановление №102/i);
    }
  });

  it('правила с ссылками WCAG содержат корректный формат', () => {
    const rulesWithWcag = Object.values(RU_A11Y_RULES).filter((r) => r.wcag);
    expect(rulesWithWcag.length).toBeGreaterThan(0);

    for (const rule of rulesWithWcag) {
      expect(rule.wcag).toMatch(/WCAG/i);
    }
  });

  it('принципы соответствуют допустимым значениям', () => {
    const validPrinciples = ['perceivable', 'operable', 'understandable', 'robust', undefined];
    for (const rule of Object.values(RU_A11Y_RULES)) {
      expect(validPrinciples).toContain(rule.principle);
    }
  });
});

describe('WCAG_PRINCIPLES', () => {
  it('содержит все 4 принципа WCAG на русском', () => {
    expect(WCAG_PRINCIPLES.perceivable).toBe('Воспринимаемость');
    expect(WCAG_PRINCIPLES.operable).toBe('Управляемость');
    expect(WCAG_PRINCIPLES.understandable).toBe('Понятность');
    expect(WCAG_PRINCIPLES.robust).toBe('Надёжность');
  });
});

