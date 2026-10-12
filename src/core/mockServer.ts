import type { MockApiResponse } from '../types';
import { validateIBAN } from './algorithms/iban';
import { validateCreditCard } from './algorithms/luhn';
import { validateTCKN } from './algorithms/tckn';
import { validateVKN } from './algorithms/vkn';
import { calculateComplianceScore } from './compliance';
import { sanitizeText } from './sanitizer';
import { scanForPII } from './scanner';
import { generateSyntheticDataset } from './synthetic';

export interface VirtualRequest {
  method: 'GET' | 'POST';
  endpoint: string;
  headers?: Record<string, string>;
  body?: any;
  simulatedLatencyMs?: number;
}

export async function handleVirtualApiRequest(req: VirtualRequest): Promise<MockApiResponse> {
  const latency = req.simulatedLatencyMs ?? Math.floor(60 + Math.random() * 80);
  
  // Latency sleep simulation
  await new Promise(resolve => setTimeout(resolve, latency));

  const standardHeaders = {
    'content-type': 'application/json; charset=utf-8',
    'x-powered-by': 'VeriKalkan-ZeroTrust-Engine/2026',
    'x-privacy-policy': 'KVKK-Md12-GDPR-Art32-Compliant',
    'x-latency-ms': latency.toString(),
  };

  const endpoint = req.endpoint.split('?')[0];

  if (endpoint === '/api/v1/sanitize' && req.method === 'POST') {
    const rawData = typeof req.body === 'string' ? req.body : JSON.stringify(req.body, null, 2);
    const findings = scanForPII(rawData);
    const { sanitizedText } = await sanitizeText(rawData, findings, {
      strategy: 'SYNTHETIC',
      preserveFormat: true,
      maskingChar: '*',
      noiseEpsilon: 1.0,
      salt: 'mock-salt-2026'
    });

    let sanitizedParsed = sanitizedText;
    try {
      sanitizedParsed = JSON.parse(sanitizedText);
    } catch {
      // keep raw string
    }

    return {
      status: 200,
      statusText: 'OK',
      latencyMs: latency,
      headers: standardHeaders,
      data: {
        success: true,
        findings_count: findings.length,
        sanitized_payload: sanitizedParsed,
        security_verdict: findings.length === 0 ? 'CLEAN' : 'SENSITIVE_DATA_REPLACED',
        timestamp: new Date().toISOString()
      }
    };
  }

  if (endpoint === '/api/v1/validate' && req.method === 'POST') {
    const { tckn, vkn, iban, card } = req.body || {};
    const results: Record<string, any> = {};

    if (tckn) results.tckn = { value: tckn, isValid: validateTCKN(tckn) };
    if (vkn) results.vkn = { value: vkn, isValid: validateVKN(vkn) };
    if (iban) results.iban = { value: iban, isValid: validateIBAN(iban) };
    if (card) results.card = { value: card, ...validateCreditCard(card) };

    const allValid = Object.values(results).every((r: any) => r.isValid);

    return {
      status: allValid ? 200 : 422,
      statusText: allValid ? 'OK' : 'Unprocessable Entity',
      latencyMs: latency,
      headers: standardHeaders,
      data: {
        success: allValid,
        validation_results: results,
        timestamp: new Date().toISOString()
      }
    };
  }

  if (endpoint === '/api/v1/synthetic/users' && req.method === 'GET') {
    const data = generateSyntheticDataset('USERS', 5, false);
    return {
      status: 200,
      statusText: 'OK',
      latencyMs: latency,
      headers: standardHeaders,
      data: {
        success: true,
        total: data.length,
        schema: 'USERS',
        data
      }
    };
  }

  if (endpoint === '/api/v1/compliance/audit' && req.method === 'POST') {
    const rawData = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const findings = scanForPII(rawData);
    const audit = calculateComplianceScore(findings);

    return {
      status: 200,
      statusText: 'OK',
      latencyMs: latency,
      headers: standardHeaders,
      data: {
        success: true,
        audit_summary: audit,
        findings
      }
    };
  }

  return {
    status: 404,
    statusText: 'Not Found',
    latencyMs: latency,
    headers: standardHeaders,
    data: {
      error: 'Not Found',
      message: `Endpoint ${req.method} ${req.endpoint} mevcut değil.`,
      available_endpoints: [
        'POST /api/v1/sanitize',
        'POST /api/v1/validate',
        'GET /api/v1/synthetic/users',
        'POST /api/v1/compliance/audit'
      ]
    }
  };
}
