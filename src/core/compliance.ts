import type { ComplianceCheckItem, ComplianceScore, PIIFinding, PIIType, SeverityLevel } from '../types';

export function calculateComplianceScore(findings: PIIFinding[]): ComplianceScore {
  const initialScore = 100;
  
  const findingsCount: Record<PIIType, number> = {
    TCKN: 0,
    VKN: 0,
    IBAN: 0,
    CREDIT_CARD: 0,
    PHONE: 0,
    EMAIL: 0,
    FULL_NAME: 0,
    ADDRESS: 0,
    API_KEY: 0,
    JWT_TOKEN: 0,
    HEALTH_DATA: 0,
    IP_ADDRESS: 0,
  };

  const severityCounts: Record<SeverityLevel, number> = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };

  for (const f of findings) {
    findingsCount[f.type] = (findingsCount[f.type] || 0) + 1;
    severityCounts[f.severity] = (severityCounts[f.severity] || 0) + 1;
  }

  // Ceza Puanı Hesabı
  let deduction = 0;
  deduction += Math.min(severityCounts.CRITICAL * 25, 60);
  deduction += Math.min(severityCounts.HIGH * 15, 30);
  deduction += Math.min(severityCounts.MEDIUM * 8, 20);
  deduction += Math.min(severityCounts.LOW * 3, 10);

  const rawScore = Math.max(0, initialScore - deduction);
  const score = findings.length === 0 ? 100 : Math.round(rawScore);

  let grade: ComplianceScore['grade'] = 'F';
  let riskLevel: ComplianceScore['riskLevel'] = 'KRITIK';

  if (severityCounts.CRITICAL >= 2 || score < 50) {
    grade = 'F';
    riskLevel = 'KRITIK';
  } else if (score >= 95) {
    grade = 'A+';
    riskLevel = 'MINIMAL';
  } else if (score >= 85) {
    grade = 'A';
    riskLevel = 'DUSUK';
  } else if (score >= 70) {
    grade = 'B';
    riskLevel = 'ORTA';
  } else if (score >= 50) {
    grade = 'C';
    riskLevel = 'YUKSEK';
  } else {
    grade = 'D';
    riskLevel = 'KRITIK';
  }

  // KVKK 2026 Yeniden Değerleme İdari Para Cezası Risk Tahmini
  let fineMin = 0;
  let fineMax = 0;

  if (severityCounts.CRITICAL > 0) {
    fineMin = 1850000;
    fineMax = 9450000;
  } else if (severityCounts.HIGH > 0) {
    fineMin = 650000;
    fineMax = 3200000;
  } else if (severityCounts.MEDIUM > 0) {
    fineMin = 180000;
    fineMax = 950000;
  }

  const checks: ComplianceCheckItem[] = [
    {
      id: 'chk-kvkk-12',
      standard: 'KVKK',
      title: 'KVKK Md. 12 — Veri Güvenliği Yükümlülükleri',
      description: 'Veri sorumlusunun kişisel verilerin hukuka aykırı işlenmesini önlemek amacıyla uygun güvenlik düzeyini temin etmesi.',
      status: severityCounts.CRITICAL > 0 ? 'FAIL' : (severityCounts.HIGH > 0 ? 'WARN' : 'PASS'),
      recommendation: 'Açık TCKN, IBAN veya kimlik doğrulayıcılar test/log ortamlarında yer alamaz. Sentetik veri kullanın.'
    },
    {
      id: 'chk-kvkk-6',
      standard: 'KVKK',
      title: 'KVKK Md. 6 — Özel Nitelikli Kişisel Veri Güvenliği',
      description: 'Sağlık, genetik ve biyometrik verilerin Kurul tarafından belirlenen yeterli önlemler alınmaksızın işlenmemesi.',
      status: findingsCount.HEALTH_DATA > 0 ? 'FAIL' : 'PASS',
      recommendation: 'Sağlık verileri açıkta bırakılamaz. Tam anonimleştirme zorunludur.'
    },
    {
      id: 'chk-gdpr-32',
      standard: 'GDPR',
      title: 'GDPR Article 32 — Security of Processing',
      description: 'Kişisel verilerin takma adlı hale getirilmesi (Pseudonymisation) ve AES standardında şifrelenmesi.',
      status: (severityCounts.CRITICAL + severityCounts.HIGH) > 0 ? 'WARN' : 'PASS',
      recommendation: 'İlişkisel bütünlüğü koruyan Deterministik Takma Adlama (Pseudonymization) stratejisini aktive edin.'
    },
    {
      id: 'chk-pci-dss',
      standard: 'PCI-DSS',
      title: 'PCI-DSS v4.0 Req 3.3 — Kart Sahibi Verisi Korunumu',
      description: 'Birincil Hesap Numarasının (PAN) yalnızca ilk 6 ve son 4 hanesi hariç olmak üzere her yerde maskelenmesi zorunluluğu.',
      status: findingsCount.CREDIT_CARD > 0 ? 'FAIL' : 'PASS',
      recommendation: 'Ödeme kartları asla loglanmamalıdır. Luhn uyumlu sentetik test kartları kullanın.'
    },
    {
      id: 'chk-iso-27701',
      standard: 'ISO27701',
      title: 'ISO/IEC 27701 — Gizlilik Bilgi Yönetimi (PIMS)',
      description: 'Sıfır-Güven (Zero-Trust) prensibiyle verilerin istemci ortamından sunucuya sızdırılmaması kontrolü.',
      status: findingsCount.API_KEY + findingsCount.JWT_TOKEN > 0 ? 'FAIL' : 'PASS',
      recommendation: 'API anahtarlarını ve JWT token’larını kod depolarına veya LLM promptlarına yapıştırmaktan kaçının.'
    }
  ];

  return {
    score,
    grade,
    riskLevel,
    estimatedFineMinTRY: fineMin,
    estimatedFineMaxTRY: fineMax,
    findingsCount,
    totalFindings: findings.length,
    severityCounts,
    checks
  };
}
