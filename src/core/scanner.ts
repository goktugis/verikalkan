import type { PIIFinding, SeverityLevel } from '../types';
import { validateIBAN, maskIBAN } from './algorithms/iban';
import { validateCreditCard, maskCreditCard } from './algorithms/luhn';
import { maskSecret, parseJWT } from './algorithms/secrets';
import { validateTCKN, maskTCKN } from './algorithms/tckn';
import { validateVKN, maskVKN } from './algorithms/vkn';

// Yaygın Türkçe İsimler ve Soyisimler (NER heuristiği için)
const COMMON_TR_FIRSTNAMES = new Set([
  'ahmet', 'mehmet', 'mustafa', 'ali', 'hüseyin', 'hasan', 'ibrahim', 'ismail', 'osman',
  'fatma', 'ayşe', 'emine', 'hatice', 'zeynep', 'elif', 'meryem', 'özlem', 'gamze', 'büşra',
  'göktuğ', 'burak', 'emre', 'can', 'kaan', 'berk', 'mert', 'barış', 'deniz', 'cem', 'kerem',
  'selin', 'ece', 'ceren', 'damla', 'irem', 'dilara', 'sinem', 'begüm', 'hande', 'aslı',
  'arda', 'onur', 'serkan', 'hakan', 'murat', 'tolga', 'yusuf', 'ömer', 'eren', 'batuhan'
]);

const COMMON_TR_SURNAMES = new Set([
  'yılmaz', 'kaya', 'demir', 'çelik', 'şahin', 'yıldız', 'yıldırım', 'öztürk', 'aydın',
  'özdemir', 'arslan', 'doğan', 'kılıç', 'aslan', 'çetin', 'kara', 'koç', 'kurt', 'özkan',
  'şimşek', 'polat', 'özçelik', 'korkmaz', 'şeker', 'işeri', 'güler', 'aksoy', 'güneş',
  'avcı', 'keskin', 'aktaş', 'bozkurt', 'bayram', 'bulut', 'alkan', 'erdogan', 'türk'
]);

// Sağlık ve Özel Nitelikli Veri Anahtar Kelimeleri (KVKK Md. 6)
const HEALTH_TERMS = [
  'kan grubu', 'rh pozitif', 'rh negatif', '0 rh+', 'a rh+', 'b rh+', 'ab rh+',
  'diyabet', 'hipertansiyon', 'psikiyatri', 'depresyon', 'epilepsi', 'onkoloji',
  'reçete', 'tanı kodu', 'icd-10', 'covid-19', 'engelli raporu', 'anamnez'
];

export function scanForPII(text: string): PIIFinding[] {
  if (!text) return [];

  const findings: PIIFinding[] = [];
  let idCounter = 0;

  const addFinding = (
    type: PIIFinding['type'],
    label: string,
    value: string,
    start: number,
    end: number,
    severity: SeverityLevel,
    lawReference: string,
    suggestion: string,
    maskedSample?: string
  ) => {
    findings.push({
      id: `pii-${++idCounter}`,
      type,
      label,
      value,
      start,
      end,
      severity,
      lawReference,
      suggestion,
      maskedSample: maskedSample || '********'
    });
  };

  // 1. TCKN Taraması (11 basamaklı sayılar)
  const tcknRegex = /\b([1-9]\d{10})\b/g;
  let match: RegExpExecArray | null;
  while ((match = tcknRegex.exec(text)) !== null) {
    const candidate = match[1];
    if (validateTCKN(candidate)) {
      addFinding(
        'TCKN',
        'T.C. Kimlik Numarası',
        candidate,
        match.index,
        match.index + candidate.length,
        'CRITICAL',
        'KVKK Md. 12 & Md. 18 / TCK Md. 136',
        'Algoritmayı doğrulayan gerçek TCKN tespit edildi. Kesinlikle maskelenmeli veya sentetik veriyle değiştirilmelidir.',
        maskTCKN(candidate)
      );
    }
  }

  // 2. VKN Taraması (10 basamaklı sayılar)
  const vknRegex = /\b(\d{10})\b/g;
  while ((match = vknRegex.exec(text)) !== null) {
    const candidate = match[1];
    // TCKN ile çakışmayı önlemek için kontrol et
    if (!validateTCKN(candidate + '0') && validateVKN(candidate)) {
      addFinding(
        'VKN',
        'Vergi Kimlik Numarası',
        candidate,
        match.index,
        match.index + candidate.length,
        'HIGH',
        'KVKK Md. 12 & VUK',
        'Şirket veya şahıs tüzel kişilik vergi numarası tespit edildi. Maskelenmeli veya takma ad verilmelidir.',
        maskVKN(candidate)
      );
    }
  }

  // 3. IBAN Taraması (TR ile başlayan 26 haneli)
  const ibanRegex = /\b(TR\d{2}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{2})\b/gi;
  while ((match = ibanRegex.exec(text)) !== null) {
    const candidate = match[1];
    if (validateIBAN(candidate)) {
      addFinding(
        'IBAN',
        'Türkiye IBAN Bilgisi',
        candidate,
        match.index,
        match.index + candidate.length,
        'CRITICAL',
        'KVKK Md. 12 & BDDK Finansal Gizlilik',
        'Geçerli ISO 7064 banka hesap IBAN bilgisi tespit edildi. Sentetik IBAN veya kısmi maskeleme uygulanmalıdır.',
        maskIBAN(candidate)
      );
    }
  }

  // 4. Kredi Kartı Taraması (16 haneli gruplar)
  const cardRegex = /\b((?:4\d{3}|5[1-5]\d{2}|9792|3[47]\d{2})[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4})\b/g;
  while ((match = cardRegex.exec(text)) !== null) {
    const candidate = match[1];
    const { isValid, brand } = validateCreditCard(candidate);
    if (isValid) {
      addFinding(
        'CREDIT_CARD',
        `Kredi Kartı (${brand})`,
        candidate,
        match.index,
        match.index + candidate.length,
        'CRITICAL',
        'PCI-DSS v4.0 Req 3.3 & KVKK Md. 12',
        'Geçerli Luhn algoritmasını sağlayan ödeme kartı numarası sızdırılmış. Kart numarası ASLA açık saklanamaz!',
        maskCreditCard(candidate)
      );
    }
  }

  // 5. Telefon Numarası Taraması (+90, 05xx, 5xx)
  const phoneRegex = /(?:\+?90[\s-]?)?(?:0?5\d{2})[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}\b/g;
  while ((match = phoneRegex.exec(text)) !== null) {
    const candidate = match[0];
    if (candidate.replace(/\D/g, '').length >= 10) {
      addFinding(
        'PHONE',
        'GSM Telefon Numarası',
        candidate,
        match.index,
        match.index + candidate.length,
        'HIGH',
        'KVKK Md. 12 İletişim Verisi',
        'Kişisel mobil telefon numarası tespit edildi. Kısmi maskeleme (+90 532 *** ** 12) önerilir.',
        candidate.slice(0, 7) + '*** ** ' + candidate.slice(-2)
      );
    }
  }

  // 6. E-Posta Taraması
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  while ((match = emailRegex.exec(text)) !== null) {
    const candidate = match[0];
    const [user, domain] = candidate.split('@');
    const masked = `${user.slice(0, 2)}***@${domain}`;
    addFinding(
      'EMAIL',
      'E-Posta Adresi',
      candidate,
      match.index,
      match.index + candidate.length,
      'MEDIUM',
      'KVKK Md. 12 İletişim Verisi / GDPR Art. 6',
      'Elektronik posta adresi tespit edildi. Maskeleme veya sentetik e-posta değişimi yapılmalıdır.',
      masked
    );
  }

  // 7. Gizli Anahtarlar & API Tokens
  // JWT
  const jwtRegex = /\beyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]+\b/g;
  while ((match = jwtRegex.exec(text)) !== null) {
    const candidate = match[0];
    const jwtInfo = parseJWT(candidate);
    if (jwtInfo.isValid) {
      addFinding(
        'JWT_TOKEN',
        'JSON Web Token (JWT)',
        candidate,
        match.index,
        match.index + candidate.length,
        'CRITICAL',
        'OWASP Top 10 API1:2023 & KVKK Md. 12',
        'Sistem yetkilendirme veya kimlik doğrulama token’ı açıkta! Derhal revoke edilmeli ve maskelenmelidir.',
        maskSecret(candidate)
      );
    }
  }

  // Bearer Token & API Key (AWS, OpenAI, GitHub PAT, Generic)
  const tokenPatterns = [
    { regex: /\b(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{50,})\b/g, label: 'GitHub Personal Access Token' },
    { regex: /\b(sk-[a-zA-Z0-9_-]{20,})\b/g, label: 'OpenAI / LLM API Key' },
    { regex: /\b(AKIA[0-9A-Z]{16})\b/g, label: 'AWS Access Key ID' },
    { regex: /Bearer\s+([a-zA-Z0-9_\-\.]{24,})/gi, label: 'Bearer Kimlik Doğrulama Belirteci' },
    { regex: /-----BEGIN (?:RSA|EC|DSA|OPENSSH)?\s*PRIVATE KEY-----[\s\S]*?-----END (?:RSA|EC|DSA|OPENSSH)?\s*PRIVATE KEY-----/g, label: 'Özel Kriptografik Anahtar (Private Key)' }
  ];

  for (const { regex, label } of tokenPatterns) {
    while ((match = regex.exec(text)) !== null) {
      const candidate = match[0];
      addFinding(
        'API_KEY',
        label,
        candidate,
        match.index,
        match.index + candidate.length,
        'CRITICAL',
        'ISO 27001 A.9 & CIS Controls / KVKK Md. 12',
        'Üretim sistemlerine erişim sağlayan kritik gizli anahtar bulundu!',
        maskSecret(candidate)
      );
    }
  }

  // 8. Özel Nitelikli Sağlık Verileri (KVKK Md. 6)
  const lowerText = text.toLowerCase();
  for (const term of HEALTH_TERMS) {
    let termIndex = lowerText.indexOf(term);
    while (termIndex !== -1) {
      addFinding(
        'HEALTH_DATA',
        'Özel Nitelikli Sağlık / Biyometrik Veri',
        text.substring(termIndex, termIndex + term.length),
        termIndex,
        termIndex + term.length,
        'CRITICAL',
        'KVKK Md. 6 (Özel Nitelikli Kişisel Veri) & GDPR Art. 9',
        'Kan grubu, hastalık teşhisi veya tıbbi tanı verisi kanun kapsamında açık rıza olmadan ASLA işlenemez.',
        '[ÖZEL_NİTELİKLİ_SAĞLIK_VERİSİ]'
      );
      termIndex = lowerText.indexOf(term, termIndex + term.length);
    }
  }

  // 9. İsim ve Soyisim Heuristiği (Türkçe)
  const words = text.split(/[\s,;:\"'(){}\[\]]+/);
  let scanIndex = 0;
  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i].toLowerCase();
    const w2 = words[i + 1].toLowerCase();

    if (COMMON_TR_FIRSTNAMES.has(w1) && COMMON_TR_SURNAMES.has(w2)) {
      const fullName = `${words[i]} ${words[i + 1]}`;
      const foundIdx = text.indexOf(fullName, scanIndex);
      if (foundIdx !== -1) {
        addFinding(
          'FULL_NAME',
          'Ad ve Soyad',
          fullName,
          foundIdx,
          foundIdx + fullName.length,
          'HIGH',
          'KVKK Md. 3 Kimliği Belirli Kişi',
          'Açık gerçek kişi adı ve soyadı tespit edildi. Sentetik isimle değiştirilmeli veya takma ad atanmalıdır.',
          `${words[i][0]}*** ${words[i + 1][0]}***`
        );
        scanIndex = foundIdx + fullName.length;
      }
    }
  }

  // Sort findings by position
  return findings.sort((a, b) => a.start - b.end);
}
