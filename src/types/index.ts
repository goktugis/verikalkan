export type PIIType = 
  | 'TCKN'
  | 'VKN'
  | 'IBAN'
  | 'CREDIT_CARD'
  | 'PHONE'
  | 'EMAIL'
  | 'FULL_NAME'
  | 'ADDRESS'
  | 'API_KEY'
  | 'JWT_TOKEN'
  | 'HEALTH_DATA'
  | 'IP_ADDRESS';

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface PIIFinding {
  id: string;
  type: PIIType;
  label: string;
  value: string;
  start: number;
  end: number;
  severity: SeverityLevel;
  lawReference: string; // e.g. "KVKK Md. 6" or "KVKK Md. 12"
  suggestion: string;
  maskedSample?: string;
}

export type MaskingStrategy = 
  | 'REDACT'          // Stars/Asterisks (e.g. 123*****89)
  | 'PSEUDONYMIZE'   // Deterministic HMAC hash (e.g. USER_8a92fb)
  | 'SYNTHETIC'      // Algorithmic valid fake data swap (fake TCKN, fake IBAN)
  | 'NOISE'          // Differential Privacy perturbation (+/- % variance)
  | 'VAULT';         // Reversible AES-256-GCM encryption

export interface MaskingConfig {
  strategy: MaskingStrategy;
  preserveFormat: boolean;
  maskingChar: string;
  noiseEpsilon: number; // For Differential Privacy
  salt: string;        // For Pseudonymization
  vaultPassword?: string; // For Reversible Encryption
  customReplacements?: Record<string, string>;
}

export interface ComplianceScore {
  score: number; // 0 - 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  riskLevel: 'MINIMAL' | 'DUSUK' | 'ORTA' | 'YUKSEK' | 'KRITIK';
  estimatedFineMinTRY: number;
  estimatedFineMaxTRY: number;
  findingsCount: Record<PIIType, number>;
  totalFindings: number;
  severityCounts: Record<SeverityLevel, number>;
  checks: ComplianceCheckItem[];
}

export interface ComplianceCheckItem {
  id: string;
  standard: 'KVKK' | 'GDPR' | 'PCI-DSS' | 'ISO27701';
  title: string;
  description: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  recommendation: string;
}

export type SchemaTemplateType = 'USERS' | 'BANKING' | 'ORDERS' | 'HEALTHCARE' | 'SYSTEM_LOGS';

export interface SyntheticField {
  name: string;
  type: 'tckn' | 'name' | 'email' | 'phone' | 'iban' | 'credit_card' | 'city' | 'salary' | 'date' | 'status' | 'id';
  label: string;
}

export interface MockApiResponse {
  status: number;
  statusText: string;
  latencyMs: number;
  headers: Record<string, string>;
  data: any;
}
