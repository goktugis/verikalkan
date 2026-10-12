import type { MaskingConfig, PIIFinding } from '../types';
import { generateValidIBAN, maskIBAN } from './algorithms/iban';
import { generateValidCard, maskCreditCard } from './algorithms/luhn';
import { encryptToVault } from './algorithms/vault';
import { generateValidTCKN, maskTCKN } from './algorithms/tckn';
import { generateValidVKN, maskVKN } from './algorithms/vkn';

// Sentetik Türkçe İsim Havuzu
const SYNTHETIC_NAMES = [
  'Barış Yıldız', 'Ece Çelik', 'Emre Demir', 'Selin Aydın', 'Kaan Kaya',
  'Damla Şahin', 'Mert Öztürk', 'İrem Doğan', 'Can Kılıç', 'Zeynep Arslan',
  'Onur Polat', 'Begüm Kurt', 'Serkan Şimşek', 'Ceren Koç', 'Eren Güler'
];

/**
 * Basit deterministik hash üreteci (Pseudonymization için)
 */
function pseudoHash(input: string, salt: string = 'verikalkan'): string {
  let h = 0x811c9dc5;
  const str = `${salt}:${input}`;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export async function sanitizeText(
  originalText: string,
  findings: PIIFinding[],
  config: MaskingConfig
): Promise<{ sanitizedText: string; replacementMap: Map<string, string> }> {
  if (!originalText || findings.length === 0) {
    return { sanitizedText: originalText, replacementMap: new Map() };
  }

  const replacementMap = new Map<string, string>();
  let nameCounter = 0;

  // Process findings in reverse order of index to maintain offset consistency
  const sortedFindings = [...findings].sort((a, b) => b.start - a.start);
  let text = originalText;

  for (const finding of sortedFindings) {
    let replacement = '';

    switch (config.strategy) {
      case 'REDACT':
        if (finding.type === 'TCKN') replacement = maskTCKN(finding.value);
        else if (finding.type === 'VKN') replacement = maskVKN(finding.value);
        else if (finding.type === 'IBAN') replacement = maskIBAN(finding.value);
        else if (finding.type === 'CREDIT_CARD') replacement = maskCreditCard(finding.value);
        else if (finding.type === 'EMAIL') {
          const parts = finding.value.split('@');
          replacement = `${parts[0].slice(0, 2)}***@${parts[1]}`;
        } else if (finding.type === 'PHONE') {
          replacement = `${finding.value.slice(0, 6)} *** ** ${finding.value.slice(-2)}`;
        } else if (finding.type === 'FULL_NAME') {
          replacement = '[GİZLENMİŞ_İSİM]';
        } else if (finding.type === 'HEALTH_DATA') {
          replacement = '[ÖZEL_NİTELİKLİ_VERİ]';
        } else {
          replacement = config.maskingChar.repeat(Math.min(finding.value.length, 12));
        }
        break;

      case 'PSEUDONYMIZE': {
        const hash = pseudoHash(finding.value, config.salt);
        replacement = `ANON_${finding.type}_${hash}`;
        break;
      }

      case 'SYNTHETIC':
        if (finding.type === 'TCKN') {
          replacement = generateValidTCKN();
        } else if (finding.type === 'VKN') {
          replacement = generateValidVKN();
        } else if (finding.type === 'IBAN') {
          replacement = generateValidIBAN();
        } else if (finding.type === 'CREDIT_CARD') {
          replacement = generateValidCard('TROY');
        } else if (finding.type === 'FULL_NAME') {
          replacement = SYNTHETIC_NAMES[nameCounter % SYNTHETIC_NAMES.length];
          nameCounter++;
        } else if (finding.type === 'EMAIL') {
          const rand = Math.floor(100 + Math.random() * 900);
          replacement = `sentetik.kullanici.${rand}@testcorp.local`;
        } else if (finding.type === 'PHONE') {
          const rand = Math.floor(1000 + Math.random() * 9000);
          replacement = `+90 532 000 ${rand.toString().slice(0, 2)} ${rand.toString().slice(2)}`;
        } else if (finding.type === 'API_KEY' || finding.type === 'JWT_TOKEN') {
          replacement = 'vk_dummy_mock_secret_token_xyz999';
        } else {
          replacement = `SENTETIK_${finding.type}_VAL`;
        }
        break;

      case 'VAULT':
        replacement = await encryptToVault(finding.value, config.vaultPassword);
        break;

      case 'NOISE':
        // Differential privacy / noise replacement for generic tokens
        replacement = `[DP_GÜRÜLTÜLÜ_${finding.type}]`;
        break;

      default:
        replacement = '********';
    }

    replacementMap.set(finding.value, replacement);
    text = text.substring(0, finding.start) + replacement + text.substring(finding.end);
  }

  return { sanitizedText: text, replacementMap };
}
