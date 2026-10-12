/**
 * Türkiye IBAN Doğrulama ve Sentetik Üretim Algoritması (ISO 7064 Mod 97-10)
 * Format: TR + 2 kontrol hanesi + 5 hane banka kodu + 1 hane rezerv + 16 hane hesap no = 26 karakter
 */

export function validateIBAN(iban: string): boolean {
  if (!iban || typeof iban !== 'string') return false;

  const clean = iban.trim().toUpperCase().replace(/[\s-]/g, '');
  if (!/^TR\d{24}$/.test(clean)) return false;

  // İlk 4 karakteri (TR + kontrol haneleri) sona taşı
  const rearranged = clean.slice(4) + clean.slice(0, 4);

  // Harfleri sayılara çevir (T=29, R=27)
  const numericString = rearranged
    .split('')
    .map(char => {
      const code = char.charCodeAt(0);
      return code >= 65 && code <= 90 ? (code - 55).toString() : char;
    })
    .join('');

  try {
    const remainder = BigInt(numericString) % 97n;
    return remainder === 1n;
  } catch {
    return false;
  }
}

/**
 * Algoritmayı %100 sağlayan matematiksel olarak geçerli sahte TR IBAN üretir.
 */
export function generateValidIBAN(bankCode?: string): string {
  // 5 haneli banka kodu (Örn: 00062 Garanti, 00067 Yapı Kredi, 00010 Ziraat vb.)
  const bank = bankCode || ['00010', '00062', '00067', '00015', '00111'][Math.floor(Math.random() * 5)];
  
  // 17 haneli hesap kısmı (1 rezerv + 16 hesap)
  let account = '';
  for (let i = 0; i < 17; i++) {
    account += Math.floor(Math.random() * 10).toString();
  }

  const bban = bank + account; // 22 hane

  // ISO 7064 kontrol hanesi hesaplama: BBAN + '2927' (TR) + '00'
  const tempNumeric = bban + '292700';
  const remainder = BigInt(tempNumeric) % 97n;
  const checkDigits = (98n - remainder).toString().padStart(2, '0');

  return `TR${checkDigits}${bban}`;
}

/**
 * IBAN Formatlama (Örn: TR33 0006 2000 0001 2345 6789 01)
 */
export function formatIBAN(iban: string): string {
  const clean = iban.trim().toUpperCase().replace(/[\s-]/g, '');
  return clean.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * IBAN Maskeleme (Örn: TR33 **** **** **** **** **** 8901)
 */
export function maskIBAN(iban: string): string {
  const clean = iban.trim().toUpperCase().replace(/[\s-]/g, '');
  if (clean.length !== 26) return 'TR** **** **** **** **** **** **';
  return `${clean.substring(0, 4)} **** **** **** **** **** ${clean.substring(22)}`;
}
