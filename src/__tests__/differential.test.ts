import { describe, expect, it } from 'vitest';
import { perturbDate, perturbNumeric, sampleLaplaceNoise } from '../core/algorithms/differential';

describe('Diferansiyel Gizlilik (Differential Privacy)', () => {
  it('sampleLaplaceNoise geçerli sayısal gürültü üretmelidir', () => {
    for (let i = 0; i < 20; i++) {
      const noise = sampleLaplaceNoise(1.0, 1.0);
      expect(typeof noise).toBe('number');
      expect(isNaN(noise)).toBe(false);
    }
  });

  it('perturbNumeric belirlenen alt ve üst sınırlar içinde kalmalıdır', () => {
    const val = 50000;
    const min = 40000;
    const max = 60000;
    for (let i = 0; i < 30; i++) {
      const perturbed = perturbNumeric(val, 1.0, min, max);
      expect(perturbed).toBeGreaterThanOrEqual(min);
      expect(perturbed).toBeLessThanOrEqual(max);
    }
  });

  it('perturbDate tarihi geçerli formatta tutarak kaydırmalıdır', () => {
    const original = '2026-10-15';
    const perturbed = perturbDate(original, 7);
    expect(/^\d{4}-\d{2}-\d{2}$/.test(perturbed)).toBe(true);
  });
});
