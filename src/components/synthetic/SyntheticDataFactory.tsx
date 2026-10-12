import React, { useState, useEffect } from 'react';
import type { SchemaTemplateType } from '../../types';
import { 
  exportDatasetAsCSV, 
  exportDatasetAsSQL, 
  exportDatasetAsTypeScript, 
  generateSyntheticDataset 
} from '../../core/synthetic';
import { 
  Database, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  Sliders, 
  FileSpreadsheet, 
  FileCode2, 
  Code,
  CheckCircle2,
  Table
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SyntheticDataFactory: React.FC = () => {
  const [template, setTemplate] = useState<SchemaTemplateType>('USERS');
  const [rowCount, setRowCount] = useState<number>(15);
  const [enableDP, setEnableDP] = useState<boolean>(true);
  const [dataset, setDataset] = useState<Record<string, any>[]>([]);
  const [activeView, setActiveView] = useState<'TABLE' | 'JSON' | 'SQL' | 'TS'>('TABLE');
  const [copied, setCopied] = useState(false);

  const generateData = () => {
    const data = generateSyntheticDataset(template, rowCount, enableDP);
    setDataset(data);
  };

  useEffect(() => {
    generateData();
  }, [template, rowCount, enableDP]);

  const handleDownload = (format: 'json' | 'csv' | 'sql') => {
    let content = '';
    let mime = 'text/plain;charset=utf-8';
    let filename = `verikalkan_${template.toLowerCase()}_${Date.now()}.${format}`;

    if (format === 'json') {
      content = JSON.stringify(dataset, null, 2);
      mime = 'application/json;charset=utf-8';
    } else if (format === 'csv') {
      content = exportDatasetAsCSV(dataset);
      mime = 'text/csv;charset=utf-8';
    } else if (format === 'sql') {
      content = exportDatasetAsSQL(`verikalkan_${template.toLowerCase()}`, dataset);
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const schemaTitles: Record<SchemaTemplateType, { name: string; desc: string; icon: string }> = {
    USERS: { name: 'Kullanıcı & Müşteri', desc: 'TCKN, Ad-Soyad, Telefon, E-posta, Gelir, KVKK Onayı', icon: '👤' },
    BANKING: { name: 'Finansal Hareketler', desc: 'Banka IBAN, FAST/EFT Tutarı, Maskeli Kart, İşlem Tipi', icon: '💳' },
    ORDERS: { name: 'E-Ticaret Siparişleri', desc: 'Sipariş Kodu, Alıcı, VKN Fatura, Kargo Kodu, Tutar', icon: '📦' },
    HEALTHCARE: { name: 'Sağlık & Randevular', desc: 'Protokol, Hasta TCKN, Poliklinik, Kan Grubu, Hekim', icon: '🏥' },
    SYSTEM_LOGS: { name: 'Mikroservis Logları', desc: 'Timestamp, Seviye, HTTP Status, Latency, Endpoint', icon: '🖥️' }
  };

  const headers = dataset.length > 0 ? Object.keys(dataset[0]) : [];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-emerald-950/20 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Sentetik İlişkisel Test Verisi Fabrikası (Foundry)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Staging ve yerel ortamlarınız için %100 geçerli algoritmalı (TCKN, IBAN, VKN, Luhn) sahte veri üretin
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={generateData}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 text-xs font-semibold shadow-lg shadow-emerald-500/10 transition-all hover:scale-[1.02]"
        >
          <RefreshCw className="w-4 h-4 animate-spin-reverse" />
          <span>Yeniden Sentetik Üret</span>
        </button>
      </div>

      {/* Schema Template Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {(Object.keys(schemaTitles) as SchemaTemplateType[]).map((st) => {
          const item = schemaTitles[st];
          const isSelected = template === st;
          return (
            <div
              key={st}
              onClick={() => setTemplate(st)}
              className={`p-3.5 rounded-xl cursor-pointer border transition-all ${
                isSelected
                  ? 'bg-emerald-950/30 border-emerald-500 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{item.icon}</span>
                <span className={`text-xs font-bold ${isSelected ? 'text-emerald-300' : 'text-slate-200'}`}>
                  {item.name}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Controls Bar: Count slider + DP Toggle + View Switcher */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          {/* Row Count Slider */}
          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-300 font-medium">Satır Sayısı:</span>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={rowCount}
              onChange={(e) => setRowCount(Number(e.target.value))}
              className="w-32 accent-emerald-500 cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
              {rowCount} Satır
            </span>
          </div>

          {/* Differential Privacy Toggle */}
          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={enableDP}
              onChange={(e) => setEnableDP(e.target.checked)}
              className="rounded accent-emerald-500 w-4 h-4"
            />
            <span className="text-xs text-slate-300 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Diferansiyel Gizlilik (Laplace Varyansı)</span>
            </span>
          </label>
        </div>

        {/* View Switcher & Exporters */}
        <div className="flex items-center space-x-2">
          <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center space-x-1">
            <button
              onClick={() => setActiveView('TABLE')}
              className={`px-2.5 py-1 text-xs rounded font-medium flex items-center space-x-1 ${
                activeView === 'TABLE' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Table className="w-3 h-3" />
              <span>Tablo</span>
            </button>
            <button
              onClick={() => setActiveView('JSON')}
              className={`px-2.5 py-1 text-xs rounded font-medium flex items-center space-x-1 ${
                activeView === 'JSON' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode2 className="w-3 h-3" />
              <span>JSON</span>
            </button>
            <button
              onClick={() => setActiveView('SQL')}
              className={`px-2.5 py-1 text-xs rounded font-medium flex items-center space-x-1 ${
                activeView === 'SQL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-3 h-3" />
              <span>SQL</span>
            </button>
            <button
              onClick={() => setActiveView('TS')}
              className={`px-2.5 py-1 text-xs rounded font-medium flex items-center space-x-1 ${
                activeView === 'TS' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3 h-3" />
              <span>TypeScript</span>
            </button>
          </div>

          <button
            onClick={() => handleDownload('json')}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
            title="JSON İndir"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDownload('csv')}
            className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60"
            title="CSV İndir"
          >
            <FileSpreadsheet className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDownload('sql')}
            className="p-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/60"
            title="SQL INSERT Dökümü İndir"
          >
            <Database className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        {activeView === 'TABLE' && (
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-300 uppercase tracking-wider sticky top-0 border-b border-slate-800">
                <tr>
                  {headers.map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-[#070b14]">
                {dataset.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    {headers.map((h) => (
                      <td key={h} className="px-4 py-2.5 text-slate-300 whitespace-nowrap">
                        {typeof row[h] === 'boolean' ? (
                          <span className="text-emerald-400">TRUE</span>
                        ) : typeof row[h] === 'number' ? (
                          <span className="text-amber-300">{row[h].toLocaleString('tr-TR')}</span>
                        ) : (
                          String(row[h])
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeView === 'JSON' && (
          <div className="relative p-4 bg-[#050811] text-xs font-mono text-emerald-300 max-h-[500px] overflow-auto">
            <button
              onClick={() => handleCopyCode(JSON.stringify(dataset, null, 2))}
              className="absolute top-4 right-4 flex items-center space-x-1 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs border border-slate-700"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
            </button>
            <pre>{JSON.stringify(dataset, null, 2)}</pre>
          </div>
        )}

        {activeView === 'SQL' && (
          <div className="relative p-4 bg-[#050811] text-xs font-mono text-cyan-300 max-h-[500px] overflow-auto">
            <button
              onClick={() => handleCopyCode(exportDatasetAsSQL(`verikalkan_${template.toLowerCase()}`, dataset))}
              className="absolute top-4 right-4 flex items-center space-x-1 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs border border-slate-700"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
            </button>
            <pre className="whitespace-pre-wrap">{exportDatasetAsSQL(`verikalkan_${template.toLowerCase()}`, dataset)}</pre>
          </div>
        )}

        {activeView === 'TS' && (
          <div className="relative p-4 bg-[#050811] text-xs font-mono text-amber-200 max-h-[500px] overflow-auto">
            <button
              onClick={() => handleCopyCode(exportDatasetAsTypeScript(`${template.charAt(0) + template.slice(1).toLowerCase()}Entity`, dataset))}
              className="absolute top-4 right-4 flex items-center space-x-1 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs border border-slate-700"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
            </button>
            <pre className="whitespace-pre-wrap">{exportDatasetAsTypeScript(`${template.charAt(0) + template.slice(1).toLowerCase()}Entity`, dataset)}</pre>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            TCKN & IBAN algoritmaları ISO 7064 & Nüfus İdaresi kurallarına %100 uygundur.
          </span>
          <span className="font-mono text-slate-500">
            Toplam {dataset.length} sentetik kayıt oluşturuldu
          </span>
        </div>
      </div>
    </div>
  );
};
