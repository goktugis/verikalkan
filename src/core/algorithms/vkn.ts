/**
 * Vergi Kimlik Numarası (VKN) Doğrulama ve Sentetik Üretim Algoritması
 * Kurallar:
 * 1) 10 haneli rakamlardan oluşur.
 * 2) 1-9 arasındaki haneler için:
 *    v1 = (d[i] + 9 - i) % 10
 *    v2 = (v1 * 2^(9 - i)) % 9
 *    Eğer v1 != 0 ve v2 == 0 ise v2 = 9
 *    Toplam += v2
 * 3) Son kontrol hanesi = (10 - (Toplam % 10)) % 10
 */

export function validateVKN(vkn: string): boolean {
  if (!vkn || typeof vkn !== 'string') return false;
  
  const clean = vkn.trim().replace(/[-\s]/g, '');
  if (!/^\d{10}$/.test(clean)) return false;

  const digits = clean.split('').map(Number);
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    const v1 = (digits[i] + (9 - i)) % 10;
    let v2 = (v1 * Math.pow(2, 9 - i)) % 9;
    if (v1 !== 0 && v2 === 0) {
      v2 = 9;
    }
    sum += v2;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return digits[9] === checkDigit;
}

/**
 * Algoritmayı %100 sağlayan matematiksel olarak geçerli sahte VKN üretir.
 */
export function generateValidVKN(): string {
  const digits: number[] = [];
  for (let i = 0; i < 9; i++) {
    digits.push(Math.floor(Math.random() * 10));
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const v1 = (digits[i] + (9 - i)) % 10;
    let v2 = (v1 * Math.pow(2, 9 - i)) % 9;
    if (v1 !== 0 && v2 === 0) {
      v2 = 9;
    }
    sum += v2;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  digits.push(checkDigit);

  return digits.join('');
}

/**
 * VKN Maskeleme (Örn: 1234567890 -> 123****890)
 */
export function maskVKN(vkn: string): string {
  const clean = vkn.trim().replace(/[-\s]/g, '');
  if (clean.length !== 10) return '**********';
  return `${clean.substring(0, 3)}****${clean.substring(7)}`;
}
