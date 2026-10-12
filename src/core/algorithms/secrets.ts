/**
 * API Anahtarı, JWT ve Gizli Bilgi (Secrets) Algılama Motoru
 */

/**
 * Shannon Entropi Hesaplama (Gizli anahtarları ve rastgele token'ları tespit etmek için)
 */
export function calculateShannonEntropy(str: string): number {
  if (!str) return 0;
  const len = str.length;
  const frequencies = new Map<string, number>();

  for (let i = 0; i < len; i++) {
    const char = str[i];
    frequencies.set(char, (frequencies.get(char) || 0) + 1);
  }

  let entropy = 0;
  for (const count of frequencies.values()) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }

  return entropy;
}

/**
 * JWT Doğrulama ve Güvenli Başlık Ayrıştırma
 */
export function parseJWT(token: string): { isValid: boolean; header?: any; payload?: any } {
  try {
    const parts = token.trim().split('.');
    if (parts.length !== 3) return { isValid: false };

    const decodeBase64Url = (str: string) => {
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) base64 += '=';
      return JSON.parse(atob(base64));
    };

    const header = decodeBase64Url(parts[0]);
    const payload = decodeBase64Url(parts[1]);

    return { isValid: true, header, payload };
  } catch {
    return { isValid: false };
  }
}

/**
 * Gizli anahtarı maskele (Örn: sk-proj-1234567890 -> sk-proj-***...***7890)
 */
export function maskSecret(secret: string): string {
  if (!secret) return '********';
  if (secret.length <= 8) return '********';
  return `${secret.substring(0, 4)}********${secret.substring(secret.length - 4)}`;
}
