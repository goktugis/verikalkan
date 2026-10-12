import { describe, expect, it } from 'vitest';
import { generateValidVKN, maskVKN, validateVKN } from '../core/algorithms/vkn';

describe('VKN (Vergi Kimlik Numarası) Algoritması', () => {
  it('hatalı VKN uzunluk ve formatlarını reddetmelidir', () => {
    expect(validateVKN('')).toBe(false);
    expect(validateVKN('123456789')).toBe(false); // 9 haneli
    expect(validateVKN('12345678901')).toBe(false); // 11 haneli
    expect(validateVKN('abcdefghij')).toBe(false);
  });

  it('generateValidVKN ile üretilen sentetik VKN her zaman geçerli olmalıdır', () => {
    for (let i = 0; i < 25; i++) {
      const vkn = generateValidVKN();
      expect(vkn.length).toBe(10);
      expect(validateVKN(vkn)).toBe(true);
    }
  });

  it('maskVKN doğru maskelemelidir', () => {
    const vkn = generateValidVKN();
    const masked = maskVKN(vkn);
    expect(masked.length).toBe(10);
    expect(masked.slice(3, 7)).toBe('****');
  });
});
