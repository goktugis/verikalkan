import type { SchemaTemplateType } from '../types';
import { generateValidIBAN } from './algorithms/iban';
import { generateValidCard, maskCreditCard } from './algorithms/luhn';
import { generateValidTCKN } from './algorithms/tckn';
import { generateValidVKN } from './algorithms/vkn';
import { perturbNumeric } from './algorithms/differential';

const CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Eskişehir', 'Gaziantep', 'Konya', 'Kocaeli', 'Adana'];

const FIRST_NAMES = [
  'Ahmet', 'Mehmet', 'Mustafa', 'Ali', 'Zeynep', 'Ayşe', 'Fatma', 'Elif',
  'Göktuğ', 'Burak', 'Emre', 'Can', 'Selin', 'Ece', 'Damla', 'İrem', 'Mert', 'Kaan'
];

const LAST_NAMES = [
  'Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Yıldız', 'Aydın', 'Özdemir',
  'İşeri', 'Polat', 'Koç', 'Kurt', 'Şimşek', 'Arslan', 'Güler', 'Aksoy'
];

const BLOOD_TYPES = ['0 Rh+', '0 Rh-', 'A Rh+', 'A Rh-', 'B Rh+', 'B Rh-', 'AB Rh+', 'AB Rh-'];

const CLINICS = ['Kardiyoloji', 'Göz Hastalıkları', 'Dahiliye', 'Ortopedi', 'Nöroloji', 'Dermatoloji', 'Kulak Burun Boğaz'];

export function generateSyntheticDataset(
  template: SchemaTemplateType,
  count: number = 20,
  applyDifferentialPrivacy: boolean = false
): Record<string, any>[] {
  const dataset: Record<string, any>[] = [];

  for (let i = 1; i <= count; i++) {
    const fn = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const ln = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const fullName = `${fn} ${ln}`;
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];

    if (template === 'USERS') {
      const baseSalary = 45000 + Math.floor(Math.random() * 65000);
      const salary = applyDifferentialPrivacy ? perturbNumeric(baseSalary, 1.2, 35000, 150000) : baseSalary;

      dataset.push({
        id: `USR_${i.toString().padStart(4, '0')}`,
        tckn: generateValidTCKN(),
        ad_soyad: fullName,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@ornek-sirket.com`,
        telefon: `+90 532 ${Math.floor(100 + Math.random() * 900)} ${Math.floor(10 + Math.random() * 90)} ${Math.floor(10 + Math.random() * 90)}`,
        sehir: city,
        aylik_gelir: salary,
        kvkk_onay: true,
        kayit_tarihi: `2026-0${(i % 9) + 1}-15`
      });
    } else if (template === 'BANKING') {
      const baseAmount = 500 + Math.floor(Math.random() * 25000);
      const amount = applyDifferentialPrivacy ? perturbNumeric(baseAmount, 0.8, 50, 100000) : baseAmount;

      dataset.push({
        islem_id: `TX_${10000 + i}`,
        musteri_id: `USR_${(i % 10 + 1).toString().padStart(4, '0')}`,
        alici_iban: generateValidIBAN(),
        tutar: amount,
        para_birimi: 'TRY',
        islem_tipi: ['FAST Havale', 'EFT', 'POS Harcama', 'Fatura Ödeme'][i % 4],
        kart_maskesi: maskCreditCard(generateValidCard('TROY')),
        islem_tarihi: `2026-10-${(i % 28 + 1).toString().padStart(2, '0')} 14:30:00`
      });
    } else if (template === 'ORDERS') {
      dataset.push({
        siparis_kodu: `ORD-2026-${5000 + i}`,
        alici_adi: fullName,
        fatura_vkn: generateValidVKN(),
        sevk_sehri: city,
        toplam_tutar: Math.floor(250 + Math.random() * 4500),
        kargo_takip: `TR-KRG-${Math.floor(1000000 + Math.random() * 9000000)}`,
        durum: ['Kargoya Verildi', 'Teslim Edildi', 'Hazırlanıyor', 'Onaylandı'][i % 4]
      });
    } else if (template === 'HEALTHCARE') {
      dataset.push({
        randevu_id: `RND-2026-${1000 + i}`,
        hasta_tckn: generateValidTCKN(),
        hasta_adi: fullName,
        poliklinik: CLINICS[i % CLINICS.length],
        kan_grubu: BLOOD_TYPES[i % BLOOD_TYPES.length],
        hekim: `Uzm. Dr. ${FIRST_NAMES[(i + 3) % FIRST_NAMES.length]} ${LAST_NAMES[(i + 2) % LAST_NAMES.length]}`,
        tarih: `2026-10-${(i % 28 + 1).toString().padStart(2, '0')}`
      });
    } else if (template === 'SYSTEM_LOGS') {
      dataset.push({
        timestamp: new Date(Date.now() - (count - i) * 60000).toISOString(),
        seviye: ['INFO', 'WARN', 'INFO', 'DEBUG', 'ERROR'][i % 5],
        servis: ['auth-service', 'payment-gateway', 'user-api', 'notification-worker'][i % 4],
        ip: `192.168.1.${(i % 250) + 1}`,
        endpoint: ['/api/v1/auth/login', '/api/v1/users/profile', '/api/v1/payments/charge', '/api/v1/sanitizer/scan'][i % 4],
        http_status: [200, 201, 200, 400, 500][i % 5],
        sure_ms: Math.floor(12 + Math.random() * 120)
      });
    }
  }

  return dataset;
}

export function exportDatasetAsCSV(dataset: Record<string, any>[]): string {
  if (!dataset || dataset.length === 0) return '';
  const headers = Object.keys(dataset[0]);
  const rows = dataset.map(row => 
    headers.map(h => {
      const val = row[h];
      if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

export function exportDatasetAsSQL(tableName: string, dataset: Record<string, any>[]): string {
  if (!dataset || dataset.length === 0) return '';
  const headers = Object.keys(dataset[0]);
  const columns = headers.join(', ');

  const inserts = dataset.map(row => {
    const values = headers.map(h => {
      const val = row[h];
      if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
      if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
      if (val === null || val === undefined) return 'NULL';
      return val;
    }).join(', ');
    return `INSERT INTO ${tableName} (${columns}) VALUES (${values});`;
  });

  return `-- VeriKalkan Studio KVKK/GDPR Uyumlu Sentetik Veri Dökümü
-- Tablo: ${tableName}
-- Üretim Tarihi: ${new Date().toISOString()}
-- Güvenlik Modeli: Zero-Trust Synthetic Air-Gap

CREATE TABLE IF NOT EXISTS ${tableName} (
${headers.map(h => `    ${h} VARCHAR(255)`).join(',\n')}
);

${inserts.join('\n')}`;
}

export function exportDatasetAsTypeScript(interfaceName: string, dataset: Record<string, any>[]): string {
  if (!dataset || dataset.length === 0) return '';
  const sample = dataset[0];
  const fields = Object.entries(sample).map(([k, v]) => {
    const t = typeof v;
    return `  ${k}: ${t};`;
  }).join('\n');

  return `/**
 * VeriKalkan Studio Sentetik Veri Arayüzü
 */
export interface ${interfaceName} {
${fields}
}

export const mock${interfaceName}List: ${interfaceName}[] = ${JSON.stringify(dataset, null, 2)};
`;
}
