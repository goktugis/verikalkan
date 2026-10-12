import { describe, expect, it } from 'vitest';
import { generateValidTCKN, maskTCKN, validateTCKN } from '../core/algorithms/tckn';

describe('TCKN (T.C. Kimlik No) Algoritması', () => {
  it('geçersiz TCKN formatlarını reddetmelidir', () => {
    expect(validateTCKN('')).toBe(false);
    expect(validateTCKN('1234567890')).toBe(false); // 10 haneli
    expect(validateTCKN('01234567891')).toBe(false); // 0 ile başlayan
    expect(validateTCKN('123456789012')).toBe(false); // 12 haneli
    expect(validateTCKN('abcdefghijk')).toBe(false);
    expect(validateTCKN('11111111111')).toBe(false); // 11 tane 1 kuralı sağlamaz
  });

  it('generateValidTCKN ile üretilen sentetik TCKN her zaman geçerli olmalıdır', () => {
    for (let i = 0; i < 25; i++) {
      const generated = generateValidTCKN();
      expect(generated.length).toBe(11);
      expect(generated[0]).not.toBe('0');
      expect(validateTCKN(generated)).toBe(true);
    }
  });

  it('maskTCKN orta 5 haneyi yıldızlamalıdır', () => {
    const valid = generateValidTCKN();
    const masked = maskTCKN(valid);
    expect(masked.length).toBe(11);
    expect(masked.slice(3, 8)).toBe('*****');
    expect(masked.slice(0, 3)).toBe(valid.slice(0, 3));
    expect(masked.slice(9)).toBe(valid.slice(9));
  });
});
