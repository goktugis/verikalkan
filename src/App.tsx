import { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LiveScannerView } from './components/scanner/LiveScannerView';
import { ComplianceRadar } from './components/compliance/ComplianceRadar';
import { SyntheticDataFactory } from './components/synthetic/SyntheticDataFactory';
import { MockApiSandbox } from './components/mockApi/MockApiSandbox';
import { CustomRulesLab } from './components/rules/CustomRulesLab';
import type { MaskingConfig, PIIFinding } from './types';
import { scanForPII } from './core/scanner';
import { sanitizeText } from './core/sanitizer';
import { calculateComplianceScore } from './core/compliance';
import { generateValidTCKN } from './core/algorithms/tckn';
import { generateValidIBAN } from './core/algorithms/iban';
import { generateValidCard } from './core/algorithms/luhn';
import { generateValidVKN } from './core/algorithms/vkn';

export function App() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'compliance' | 'synthetic' | 'mockApi' | 'lab'>('scanner');
  
  // Masking config
  const [maskingConfig, setMaskingConfig] = useState<MaskingConfig>({
    strategy: 'SYNTHETIC',
    preserveFormat: true,
    maskingChar: '*',
    noiseEpsilon: 1.0,
    salt: 'verikalkan-prod-salt-2026',
    vaultPassword: 'VeriKalkan-Safe-Vault-2026'
  });

  // Sample initial text with real Turkish test data
  const initialSample = `{
  "musteri_id": "USR-9921",
  "tckn": "10000000146",
  "ad_soyad": "Ahmet Yılmaz",
  "telefon": "+90 532 555 44 33",
  "email": "ahmet.yilmaz@sirket.com",
  "banka_hesabi": {
    "iban": "TR330006200000012345678901",
    "kart_no": "9792000012345678",
    "bakiye_try": 145000
  },
  "saglik_notu": "Kan grubu 0 Rh+ olup diyabet gecmisi mevcuttur",
  "sistem_erisim": {
    "api_token": "sk-proj-9821hdkjas77239102830129381023",
    "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMDAwMDAwMDE0NiIsIm5hbWUiOiJBaG1ldCBZaWxtYXoiLCJpYXQiOjE1MTYyMzkwMjJ9.4AdTjF56-sample-hash"
  }
}`;

  const [inputText, setInputText] = useState<string>(initialSample);
  const [findings, setFindings] = useState<PIIFinding[]>([]);
  const [sanitizedText, setSanitizedText] = useState<string>('');

  // Scan & sanitize whenever input or config changes
  useEffect(() => {
    const f = scanForPII(inputText);
    setFindings(f);

    sanitizeText(inputText, f, maskingConfig).then(({ sanitizedText: st }) => {
      setSanitizedText(st);
    });
  }, [inputText, maskingConfig]);

  const compliance = calculateComplianceScore(findings);

  const handleLoadPreset = (type: string = 'ecommerce') => {
    const tckn = generateValidTCKN();
    const iban = generateValidIBAN();
    const card = generateValidCard('TROY');
    const vkn = generateValidVKN();

    if (type === 'ecommerce') {
      setInputText(`{
  "siparis_no": "TR-ORD-2026-9912",
  "alici_bilgileri": {
    "tckn": "${tckn}",
    "ad_soyad": "Mehmet Demir",
    "telefon": "+90 533 111 22 33",
    "email": "mehmet.demir@ornek.com",
    "teslimat_adresi": "Atatürk Mah. Karanfil Sok. No:14 Kadıköy / İstanbul"
  },
  "odeme": {
    "kart_numarasi": "${card}",
    "iban": "${iban}",
    "tutar_try": 4850.00
  }
}`);
    } else if (type === 'banking') {
      setInputText(`[2026-10-12 14:32:01.402] [INFO] [fast-transfer-service]
İşlem Başlatıldı: TX_881920
Kaynak Müşteri: Göktuğ İşeri (TCKN: ${tckn})
Hedef IBAN: ${iban}
Transfer Tutarı: ₺75.000,00 TRY
Açıklama: "Ekim 2026 Danışmanlık ve Yazılım Hizmet Bedeli"
Kanal: Mobil Şube (IP: 192.168.1.105)
Durum: BDDK FAST Havale Onaylandı.`);
    } else if (type === 'sql') {
      setInputText(`-- PostgreSQL Üretim Veritabanı Müşteri Dökümü (DUMP)
INSERT INTO musteriler (id, tckn, vkn, ad_soyad, iban, telefon, email, aylik_gelir)
VALUES 
  ('USR_1', '${tckn}', '${vkn}', 'Ali Çelik', '${iban}', '+90 535 888 77 66', 'ali.celik@holding.com', 92000),
  ('USR_2', '${generateValidTCKN()}', '${generateValidVKN()}', 'Zeynep Kaya', '${generateValidIBAN()}', '+90 542 999 00 11', 'zeynep.kaya@tech.com', 125000);`);
    } else if (type === 'secrets') {
      setInputText(`curl -X POST "https://api.openai.com/v1/chat/completions" \\
  -H "Authorization: Bearer sk-proj-abCDefGhIjKlMnOpQrStUvWxYz1234567890" \\
  -H "X-GitHub-Token: ghp_111122223333444455556666777788889999" \\
  -H "X-Client-ID: AKIAIOSFODNN7EXAMPLE" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "user", "content": "Müşterimiz Ahmet Yılmaz için TCKN: ${tckn} ve IBAN: ${iban} verilerini analiz et"}
    ]
  }'`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080d1a] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLoadPreset={() => handleLoadPreset('ecommerce')}
        findingsCount={findings.length}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'scanner' && (
          <LiveScannerView
            inputText={inputText}
            setInputText={setInputText}
            findings={findings}
            sanitizedText={sanitizedText}
            maskingConfig={maskingConfig}
            setMaskingConfig={setMaskingConfig}
            onLoadPreset={handleLoadPreset}
          />
        )}

        {activeTab === 'compliance' && (
          <ComplianceRadar
            compliance={compliance}
            findings={findings}
          />
        )}

        {activeTab === 'synthetic' && (
          <SyntheticDataFactory />
        )}

        {activeTab === 'mockApi' && (
          <MockApiSandbox />
        )}

        {activeTab === 'lab' && (
          <CustomRulesLab />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
