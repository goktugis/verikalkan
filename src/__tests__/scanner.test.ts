import { describe, expect, it } from 'vitest';
import { generateValidIBAN } from '../core/algorithms/iban';
import { generateValidCard } from '../core/algorithms/luhn';
import { generateValidTCKN } from '../core/algorithms/tckn';
import { scanForPII } from '../core/scanner';

describe('PII ve Hassas Veri Tarayıcısı (Scanner)', () => {
  it('metin içindeki geçerli TCKN, IBAN, Kart, E-posta ve Telefonu doğru tespit etmelidir', () => {
    const fakeTCKN = generateValidTCKN();
    const fakeIBAN = generateValidIBAN();
    const fakeCard = generateValidCard('VISA');

    const sampleText = `
      Kullanıcı Bilgisi:
      TC Kimlik: ${fakeTCKN}
      Banka Hesabı: ${fakeIBAN}
      Ödeme Kartı: ${fakeCard}
      İletişim: ahmet.yilmaz@sirket.com veya +90 532 123 45 67
      Yetki: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
      Sağlık: Kan grubu A Rh+ olarak bildirilmiştir.
    `;

    const findings = scanForPII(sampleText);
    const types = findings.map(f => f.type);

    expect(types).toContain('TCKN');
    expect(types).toContain('IBAN');
    expect(types).toContain('CREDIT_CARD');
    expect(types).toContain('EMAIL');
    expect(types).toContain('PHONE');
    expect(types).toContain('JWT_TOKEN');
    expect(types).toContain('HEALTH_DATA');
  });

  it('hassas veri içermeyen temiz metinlerde boş bulgu listesi dönmelidir', () => {
    const cleanText = 'Sistem durumu: CPU %12, Bellek: 4GB, Docker container normal çalışıyor.';
    const findings = scanForPII(cleanText);
    expect(findings.length).toBe(0);
  });
});
