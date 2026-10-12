import React, { useState } from 'react';
import type { MaskingConfig, MaskingStrategy, PIIFinding } from '../../types';
import { TokenBadge } from './TokenBadge';
import { 
  Shield, 
  Copy, 
  Check, 
  Download, 
  FileCode, 
  Sparkles, 
  Trash2, 
  Upload, 
  Sliders, 
  CheckCircle2, 
  ArrowRight,
  Eye,
  Database,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LiveScannerViewProps {
  inputText: string;
  setInputText: (val: string) => void;
  findings: PIIFinding[];
  sanitizedText: string;
  maskingConfig: MaskingConfig;
  setMaskingConfig: React.Dispatch<React.SetStateAction<MaskingConfig>>;
  onLoadPreset: (type?: string) => void;
}

export const LiveScannerView: React.FC<LiveScannerViewProps> = ({
  inputText,
  setInputText,
  findings,
  sanitizedText,
  maskingConfig,
  setMaskingConfig,
  onLoadPreset,
}) => {
  const [selectedFinding, setSelectedFinding] = useState<PIIFinding | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeFormat, setActiveFormat] = useState<'JSON' | 'TEXT' | 'SQL' | 'LOG'>('JSON');

  const handleCopy = () => {
    navigator.clipboard.writeText(sanitizedText);
    setCopied(true);
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([sanitizedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `verikalkan-sanitized-${Date.now()}.${activeFormat.toLowerCase() === 'json' ? 'json' : 'txt'}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setInputText(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const strategyDescriptions: Record<MaskingStrategy, { title: string; desc: string; icon: any }> = {
    REDACT: {
      title: 'Kısmi Maskeleme (Redaction)',
      desc: 'Hassas karakterleri yıldızlar (123*****89). Ekran görüntüleri ve loglar için ideal.',
      icon: Eye
    },
    PSEUDONYMIZE: {
      title: 'Kriptografik Takma Ad (Pseudonymize)',
      desc: 'Deterministik HMAC-SHA256 ile tutarlı tokenlar (ANON_USER_8a2f). Foreign key JOIN ilişkilerini korur.',
      icon: Database
    },
    SYNTHETIC: {
      title: 'Algoritmik Sentetik Değiştirme (Synthetic Swap)',
      desc: 'Geçerli sahte TCKN, sahte TR IBAN, Troy kartı ve Türkçe isimlerle birebir değiştirir. Testler kırılmaz!',
      icon: Sparkles
    },
    NOISE: {
      title: 'Diferansiyel Gizlilik (Perturbation)',
      desc: 'Sayısal alanlara Laplace gürültüsü ekler, genel istatistiksel dağılımı korur.',
      icon: Sliders
    },
    VAULT: {
      title: 'Kriptografik Kasa (AES-256-GCM Vault)',
      desc: 'İstemci tarafında parola ile şifreler. İstendiğinde orijinal veriye geri dönülebilir.',
      icon: Lock
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-emerald-950/20 border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Canlı Hassas Veri Tarayıcısı & Maskeleme Motoru</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-normal">
              15+ Algoritma Aktif
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Geliştirme, test veya yapay zeka promptlarınızda kullanılan verilerdeki TCKN, IBAN, Kredi Kartı ve API Anahtarlarını sıfır sızıntı ile arındırın.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Hazır Örnekler:</span>
          <button
            onClick={() => { setActiveFormat('JSON'); onLoadPreset('ecommerce'); }}
            className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            🛒 E-Ticaret (JSON)
          </button>
          <button
            onClick={() => { setActiveFormat('LOG'); onLoadPreset('banking'); }}
            className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            💳 Banka Logu
          </button>
          <button
            onClick={() => { setActiveFormat('SQL'); onLoadPreset('sql'); }}
            className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            🗄️ SQL INSERT
          </button>
          <button
            onClick={() => { setActiveFormat('TEXT'); onLoadPreset('secrets'); }}
            className="px-2.5 py-1 text-xs rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 transition-colors"
          >
            ⚠️ API Key Sızıntısı
          </button>
        </div>
      </div>

      {/* Masking Strategy Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {(Object.keys(strategyDescriptions) as MaskingStrategy[]).map((strat) => {
          const info = strategyDescriptions[strat];
          const Icon = info.icon;
          const isSelected = maskingConfig.strategy === strat;
          return (
            <div
              key={strat}
              onClick={() => setMaskingConfig(prev => ({ ...prev, strategy: strat }))}
              className={`p-3.5 rounded-xl cursor-pointer border transition-all ${
                isSelected
                  ? 'bg-emerald-950/30 border-emerald-500 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-xs font-semibold ${isSelected ? 'text-emerald-300' : 'text-slate-200'}`}>
                  {info.title.split(' ')[0]}
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {info.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main Dual Editor: Original Input vs Sanitized Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Original Input */}
        <div className="flex flex-col h-[520px] rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950/70 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-200">Girdi Metni / Yüklenen Veri</span>
              <span className="text-[10px] text-slate-500 font-mono">({inputText.length} karakter)</span>
            </div>

            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded border border-slate-700 cursor-pointer transition-colors">
                <Upload className="w-3 h-3" />
                <span>Dosya Yükle</span>
                <input type="file" onChange={handleFileUpload} className="hidden" accept=".json,.csv,.sql,.txt,.log" />
              </label>

              <button
                onClick={() => setInputText('')}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                title="Temizle"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Text Area */}
          <div className="relative flex-1 p-3 font-mono text-xs overflow-auto bg-[#070b14]">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Buraya denetlemek istediğiniz JSON, CSV, SQL, Log veya ham metni yapıştırın ya da yukarıdaki örnek senaryolardan birini seçin..."
              className="w-full h-full bg-transparent text-slate-200 resize-none outline-none leading-relaxed font-mono"
              spellCheck={false}
            />
          </div>

          {/* Detected Tokens Mini Bar */}
          <div className="px-4 py-2.5 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-2 overflow-x-auto max-w-[85%] py-1">
              <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap">Bulgular:</span>
              {findings.length === 0 ? (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Temiz: Hassas PII verisi tespit edilmedi
                </span>
              ) : (
                findings.slice(0, 5).map((f) => (
                  <TokenBadge
                    key={f.id}
                    finding={f}
                    isSelected={selectedFinding?.id === f.id}
                    onClick={() => setSelectedFinding(f)}
                  />
                ))
              )}
              {findings.length > 5 && (
                <span className="text-[10px] text-slate-400 font-mono">+{findings.length - 5} daha</span>
              )}
            </div>

            <div className="text-[11px] font-mono text-slate-400">
              {findings.length} Bulgu
            </div>
          </div>
        </div>

        {/* Right: Sanitized Output */}
        <div className="flex flex-col h-[520px] rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950/70 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-200">
                Arındırılmış Çıktı ({strategyDescriptions[maskingConfig.strategy].title.split(' ')[0]})
              </span>
              <span className="text-[10px] text-emerald-400/90 font-mono bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">
                Güvenli & KVKK Uyumlu
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 px-2.5 py-1 text-xs text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded border border-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Kopyalandı!' : 'Kopyala'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center space-x-1 px-2.5 py-1 text-xs text-emerald-300 hover:text-emerald-200 bg-emerald-950/60 hover:bg-emerald-900/60 rounded border border-emerald-800/60 transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>İndir</span>
              </button>
            </div>
          </div>

          {/* Text Area */}
          <div className="relative flex-1 p-3 font-mono text-xs overflow-auto bg-[#050811] text-emerald-100/90">
            <pre className="whitespace-pre-wrap leading-relaxed">
              {sanitizedText || '// Çıktı burada görünecek...'}
            </pre>
          </div>

          {/* Footer Info */}
          <div className="px-4 py-2.5 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Sıfır Sunucu İletişimi: Tüm işlemler Web Worker / yerel bellek içinde tamamlandı.
            </span>
            <span className="font-mono text-slate-500">
              Diff: {findings.length} veri bloğu dönüştürüldü
            </span>
          </div>
        </div>
      </div>

      {/* Selected Finding Detail Drawer */}
      {selectedFinding && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white">{selectedFinding.label}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Şiddet: {selectedFinding.severity}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                Mevzuat: {selectedFinding.lawReference}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {selectedFinding.suggestion}
            </p>
            <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
              <span>Orijinal Değer:</span>
              <code className="text-rose-400 bg-rose-950/40 px-1 py-0.5 rounded">{selectedFinding.value}</code>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <span>Maskeli Örnek:</span>
              <code className="text-emerald-400 bg-emerald-950/40 px-1 py-0.5 rounded">{selectedFinding.maskedSample}</code>
            </div>
          </div>

          <button
            onClick={() => setSelectedFinding(null)}
            className="px-3 py-1 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            Kapat
          </button>
        </div>
      )}
    </div>
  );
};
