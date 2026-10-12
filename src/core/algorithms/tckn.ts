/**
 * T.C. Kimlik Numarası Doğrulama ve Sentetik Üretim Algoritması
 * Kurallar:
 * 1) 11 hanelidir ve sadece rakamlardan oluşur.
 * 2) İlk hane '0' olamaz.
 * 3) (1, 3, 5, 7, 9. haneler toplamı * 7) - (2, 4, 6, 8. haneler toplamı) mod 10 = 10. hane.
 * 4) İlk 10 hanenin toplamının mod 10'u = 11. hane.
 */

export function validateTCKN(tckn: string): boolean {
  if (!tckn || typeof tckn !== 'string') return false;
  
  // Clean whitespace and dashes
  const clean = tckn.trim().replace(/[-\s]/g, '');
  if (!/^[1-9]\d{10}$/.test(clean)) return false;

  const digits = clean.split('').map(Number);
  
  // 1, 3, 5, 7, 9. haneler (0-indexed: 0, 2, 4, 6, 8)
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  
  // 2, 4, 6, 8. haneler (0-indexed: 1, 3, 5, 7)
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];

  const calc10 = ((oddSum * 7) - evenSum) % 10;
  const d10 = (calc10 + 10) % 10;
  if (digits[9] !== d10) return false;

  const totalFirst10 = digits.slice(0, 10).reduce((acc, curr) => acc + curr, 0);
  const d11 = totalFirst10 % 10;
  if (digits[10] !== d11) return false;

  return true;
}

/**
 * Algoritmayı %100 sağlayan matematiksel olarak geçerli sahte TCKN üretir.
 * KVKK uyumlu sentetik test verisi için kullanılır.
 */
export function generateValidTCKN(): string {
  // İlk 9 haneyi rastgele üret (ilk hane 1-9 arası)
  const digits: number[] = [];
  digits.push(Math.floor(Math.random() * 9) + 1); // 1-9
  for (let i = 1; i < 9; i++) {
    digits.push(Math.floor(Math.random() * 10)); // 0-9
  }

  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];

  const calc10 = ((oddSum * 7) - evenSum) % 10;
  const d10 = (calc10 + 10) % 10;
  digits.push(d10);

  const totalFirst10 = digits.slice(0, 10).reduce((acc, curr) => acc + curr, 0);
  const d11 = totalFirst10 % 10;
  digits.push(d11);

  return digits.join('');
}

/**
 * TCKN Maskeleme (Örn: 12345678901 -> 123*****01)
 */
export function maskTCKN(tckn: string): string {
  const clean = tckn.trim().replace(/[-\s]/g, '');
  if (clean.length !== 11) return '***********';
  return `${clean.substring(0, 3)}*****${clean.substring(8)}`;
}
