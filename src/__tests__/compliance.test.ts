import { describe, expect, it } from 'vitest';
import { calculateComplianceScore } from '../core/compliance';
import type { PIIFinding } from '../types';

describe('KVKK ve GDPR Uyumluluk Skorlama Motoru', () => {
  it('bulgu olmadığında 100 tam puan ve A+ vermeli', () => {
    const result = calculateComplianceScore([]);
    expect(result.score).toBe(100);
    expect(result.grade).toBe('A+');
    expect(result.riskLevel).toBe('MINIMAL');
    expect(result.estimatedFineMinTRY).toBe(0);
  });

  it('kritik bulgularda risk seviyesi yükselmeli ve ceza tahmini hesaplanmalı', () => {
    const mockFindings: PIIFinding[] = [
      {
        id: '1',
        type: 'TCKN',
        label: 'T.C. Kimlik No',
        value: '12345678901',
        start: 0,
        end: 11,
        severity: 'CRITICAL',
        lawReference: 'KVKK Md. 12',
        suggestion: 'Maskele'
      },
      {
        id: '2',
        type: 'HEALTH_DATA',
        label: 'Sağlık Verisi',
        value: 'A Rh+',
        start: 20,
        end: 25,
        severity: 'CRITICAL',
        lawReference: 'KVKK Md. 6',
        suggestion: 'Anonimleştir'
      }
    ];

    const result = calculateComplianceScore(mockFindings);
    expect(result.score).toBeLessThan(70);
    expect(result.riskLevel).toBe('KRITIK');
    expect(result.estimatedFineMinTRY).toBeGreaterThan(1000000);
    expect(result.checks.some(c => c.id === 'chk-kvkk-6' && c.status === 'FAIL')).toBe(true);
  });
});
