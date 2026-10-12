/**
 * Luhn Algoritması (MOD 10) ve Kredi Kartı Doğrulama/Üretim Motoru
 * Desteklenen kartlar: Troy, Visa, Mastercard, American Express
 */

export type CardBrand = 'TROY' | 'VISA' | 'MASTERCARD' | 'AMEX' | 'UNKNOWN';

export function getCardBrand(cleanCard: string): CardBrand {
  if (/^9792/.test(cleanCard)) return 'TROY';
  if (/^4/.test(cleanCard)) return 'VISA';
  if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(cleanCard)) return 'MASTERCARD';
  if (/^3[47]/.test(cleanCard)) return 'AMEX';
  return 'UNKNOWN';
}

export function validateLuhn(cardNumber: string): boolean {
  if (!cardNumber || typeof cardNumber !== 'string') return false;

  const clean = cardNumber.replace(/[\s-]/g, '');
  if (!/^\d{13,19}$/.test(clean)) return false;

  let sum = 0;
  let shouldDouble = false;

  // Sağdan sola doğru yürü
  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export function validateCreditCard(cardNumber: string): { isValid: boolean; brand: CardBrand } {
  const clean = cardNumber.replace(/[\s-]/g, '');
  const isValid = validateLuhn(clean);
  const brand = getCardBrand(clean);
  return { isValid, brand };
}

/**
 * Algoritmayı sağlayan geçerli test kart numarası üretir
 */
export function generateValidCard(brand: 'TROY' | 'VISA' | 'MASTERCARD' = 'TROY'): string {
  let prefix = '9792';
  let length = 16;

  if (brand === 'VISA') {
    prefix = '4' + Math.floor(100 + Math.random() * 900);
  } else if (brand === 'MASTERCARD') {
    prefix = '5' + (Math.floor(Math.random() * 5) + 1) + Math.floor(10 + Math.random() * 90);
  } else {
    // Troy
    prefix = '9792' + Math.floor(1000 + Math.random() * 9000);
  }

  const digits = prefix.split('').map(Number);
  while (digits.length < length - 1) {
    digits.push(Math.floor(Math.random() * 10));
  }

  // Luhn check digit hesapla
  let sum = 0;
  let shouldDouble = true; // because check digit will be at the end, so last known digit gets doubled
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i];
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  digits.push(checkDigit);

  return digits.join('');
}

/**
 * Kart Maskeleme (Örn: 9792 1234 5678 9012 -> 9792 **** **** 9012)
 */
export function maskCreditCard(cardNumber: string): string {
  const clean = cardNumber.replace(/[\s-]/g, '');
  if (clean.length < 12) return '**** **** **** ****';
  const first4 = clean.substring(0, 4);
  const last4 = clean.substring(clean.length - 4);
  return `${first4} **** **** ${last4}`;
}
