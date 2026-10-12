import { describe, expect, it } from 'vitest';
import { generateValidIBAN } from '../core/algorithms/iban';
import { generateValidTCKN } from '../core/algorithms/tckn';
import { sanitizeText } from '../core/sanitizer';
import { scanForPII } from '../core/scanner';

describe('Sanitizer ve Maskeleme Motoru', () => {
  it('REDACT stratejisi ile TCKN ve IBAN gizlenmelidir', async () => {
    const tckn = generateValidTCKN();
    const iban = generateValidIBAN();
    const raw = `TC: ${tckn}, IBAN: ${iban}`;
    const findings = scanForPII(raw);

    const { sanitizedText } = await sanitizeText(raw, findings, {
      strategy: 'REDACT',
      preserveFormat: true,
      maskingChar: '*',
      noiseEpsilon: 1.0,
      salt: 'test-salt'
    });

    expect(sanitizedText).not.toContain(tckn);
    expect(sanitizedText).not.toContain(iban);
    expect(sanitizedText).toContain('*****');
  });

  it('SYNTHETIC stratejisi ile yeni geçerli sentetik TCKN ve IBAN üretilmelidir', async () => {
    const tckn = generateValidTCKN();
    const iban = generateValidIBAN();
    const raw = `TC: ${tckn}, IBAN: ${iban}`;
    const findings = scanForPII(raw);

    const { sanitizedText } = await sanitizeText(raw, findings, {
      strategy: 'SYNTHETIC',
      preserveFormat: true,
      maskingChar: '*',
      noiseEpsilon: 1.0,
      salt: 'test-salt'
    });

    expect(sanitizedText).not.toContain(tckn);
    expect(sanitizedText).not.toContain(iban);
    // Üretilen yeni sentetik veri de TCKN ve IBAN formatına uymalı
    const newFindings = scanForPII(sanitizedText);
    expect(newFindings.length).toBeGreaterThan(0);
  });

  it('PSEUDONYMIZE stratejisi ile tutarlı tokenlar atanmalıdır', async () => {
    const tckn = generateValidTCKN();
    const raw = `Kullanıcı ${tckn} sisteme giriş yaptı. ${tckn} tekrar görüldü.`;
    const findings = scanForPII(raw);

    const { sanitizedText } = await sanitizeText(raw, findings, {
      strategy: 'PSEUDONYMIZE',
      preserveFormat: true,
      maskingChar: '*',
      noiseEpsilon: 1.0,
      salt: 'fixed-salt'
    });

    expect(sanitizedText).not.toContain(tckn);
    expect(sanitizedText).toContain('ANON_TCKN_');
  });
});
