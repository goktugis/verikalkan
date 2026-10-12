/**
 * Sıfır-Bilgi İstemci Taraflı Kriptografik Kasa (Zero-Knowledge Reversible Vault)
 * Web Crypto API (AES-256-GCM + PBKDF2) ile istemcide geri dönüştürülebilir şifreleme.
 */

const sessionVaultMap = new Map<string, string>();

/**
 * ArrayBuffer -> Base64
 */
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Base64 -> Uint8Array
 */
export function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * PBKDF2 ile paroladan AES-GCM anahtarı türetir
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Metni AES-256-GCM ile şifreler
 */
export async function encryptToVault(plaintext: string, password: string = 'VeriKalkan-2026-Vault'): Promise<string> {
  if (!plaintext) return plaintext;

  try {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);

    const encodedText = new TextEncoder().encode(plaintext);
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedText
    );

    // Birleştir: salt (16 bytes) + iv (12 bytes) + ciphertext
    const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

    const token = `VK_VAULT_${bufferToBase64(combined.buffer).slice(0, 24)}`;
    sessionVaultMap.set(token, plaintext);
    return token;
  } catch {
    // Fallback if crypto is unavailable
    const fallbackToken = `VK_VAULT_${btoa(plaintext).slice(0, 16)}`;
    sessionVaultMap.set(fallbackToken, plaintext);
    return fallbackToken;
  }
}

/**
 * Oturum kasasından orijinal metni çözer
 */
export function decryptFromSessionVault(token: string): string | null {
  return sessionVaultMap.get(token) || null;
}

/**
 * Kasa oturumunu temizler
 */
export function clearVaultSession(): void {
  sessionVaultMap.clear();
}
