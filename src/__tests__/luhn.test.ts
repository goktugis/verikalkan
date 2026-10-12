import { describe, expect, it } from 'vitest';
import { generateValidCard, maskCreditCard, validateCreditCard, validateLuhn } from '../core/algorithms/luhn';

describe('Luhn Algoritması ve Kredi Kartı Motoru', () => {
  it('geçersiz kartları reddetmelidir', () => {
    expect(validateLuhn('')).toBe(false);
    expect(validateLuhn('1234')).toBe(false);
    expect(validateLuhn('4111111111111112')).toBe(false); // Luhn check fails
  });

  it('Troy, Visa ve Mastercard için üretilen sentetik kartlar Luhn kontrolünü geçmelidir', () => {
    const brands: ('TROY' | 'VISA' | 'MASTERCARD')[] = ['TROY', 'VISA', 'MASTERCARD'];
    for (const b of brands) {
      for (let i = 0; i < 10; i++) {
        const card = generateValidCard(b);
        const { isValid, brand } = validateCreditCard(card);
        expect(isValid).toBe(true);
        expect(brand).toBe(b);
      }
    }
  });

  it('maskCreditCard ilk 4 ve son 4 haneyi koruyup ortayı gizlemelidir', () => {
    const card = generateValidCard('VISA');
    const masked = maskCreditCard(card);
    expect(masked.startsWith(card.substring(0, 4))).toBe(true);
    expect(masked.endsWith(card.substring(card.length - 4))).toBe(true);
    expect(masked).toContain('****');
  });
});
