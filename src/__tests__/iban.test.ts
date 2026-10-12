import { describe, expect, it } from 'vitest';
import { formatIBAN, generateValidIBAN, maskIBAN, validateIBAN } from '../core/algorithms/iban';

describe('TR IBAN (ISO 7064 Mod 97-10) Algoritması', () => {
  it('geçersiz IBAN formatlarını tespit etmelidir', () => {
    expect(validateIBAN('')).toBe(false);
    expect(validateIBAN('TR123456')).toBe(false);
    expect(validateIBAN('DE89370400440532013000')).toBe(false); // TR dışı
    expect(validateIBAN('TR00000000000000000000000000')).toBe(false);
  });

  it('generateValidIBAN ile üretilen IBAN her zaman matematiksel olarak geçerli olmalıdır', () => {
    for (let i = 0; i < 20; i++) {
      const iban = generateValidIBAN();
      expect(iban.startsWith('TR')).toBe(true);
      expect(iban.length).toBe(26);
      expect(validateIBAN(iban)).toBe(true);
    }
  });

  it('formatIBAN 4lü bloklar halinde biçimlendirmelidir', () => {
    const iban = generateValidIBAN();
    const formatted = formatIBAN(iban);
    expect(formatted.split(' ').length).toBe(7);
  });

  it('maskIBAN başı ve sonu hariç orta kısmı yıldızlamalıdır', () => {
    const iban = generateValidIBAN();
    const masked = maskIBAN(iban);
    expect(masked.startsWith('TR')).toBe(true);
    expect(masked).toContain('****');
  });
});
