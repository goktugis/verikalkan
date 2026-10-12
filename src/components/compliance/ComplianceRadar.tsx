import React, { useState } from 'react';
import type { ComplianceScore, PIIFinding } from '../../types';
import { 
  AlertTriangle, 
  FileCheck2, 
  Scale, 
  CheckCircle, 
  XCircle, 
  Printer,
  FileText,
  ShieldAlert
} from 'lucide-react';

interface ComplianceRadarProps {
  compliance: ComplianceScore;
  findings: PIIFinding[];
}

export const ComplianceRadar: React.FC<ComplianceRadarProps> = ({ compliance }) => {
  const [showReportModal, setShowReportModal] = useState(false);

  const getScoreColor = () => {
    if (compliance.score >= 85) return 'text-emerald-400 stroke-emerald-500';
    if (compliance.score >= 70) return 'text-cyan-400 stroke-cyan-500';
    if (compliance.score >= 50) return 'text-amber-400 stroke-amber-500';
    return 'text-rose-400 stroke-rose-500';
  };

  const getRiskBadge = () => {
    switch (compliance.riskLevel) {
      case 'MINIMAL':
        return { label: 'MİNİMAL RİSK (A+)', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'DUSUK':
        return { label: 'DÜŞÜK RİSK (A)', bg: 'bg-teal-500/20 text-teal-300 border-teal-500/40' };
      case 'ORTA':
        return { label: 'ORTA RİSK (B)', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'YUKSEK':
        return { label: 'YÜKSEK RİSK (C)', bg: 'bg-orange-500/20 text-orange-300 border-orange-500/40' };
      case 'KRITIK':
        return { label: 'KRİTİK HUKUKİ RİSK (F)', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
    }
  };

  const riskBadge = getRiskBadge();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-cyan-950/20 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                KVKK (6698) & GDPR Uyumluluk ve Yasal Risk Radarı
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Verilerinizin yasal regülasyonlar, idari para cezası riskleri ve teknik güvenlik denetim karşılığı
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowReportModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 text-xs font-semibold shadow-lg shadow-emerald-500/10 transition-all hover:scale-[1.02]"
        >
          <FileText className="w-4 h-4" />
          <span>Resmi Denetim Raporu Oluştur (PDF)</span>
        </button>
      </div>

      {/* Main KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI 1: Circular Compliance Score */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Genel Uyumluluk Skoru
          </div>

          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG circular meter */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-slate-800"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className={`transition-all duration-1000 ${getScoreColor()}`}
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * compliance.score) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-extrabold font-mono tracking-tight text-white">
                {compliance.score}
              </span>
              <span className="text-[11px] font-semibold text-slate-400">/ 100</span>
            </div>
          </div>

          <div className="mt-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${riskBadge.bg}`}>
              {riskBadge.label}
            </span>
          </div>
        </div>

        {/* KPI 2: Penalty Risk Range */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                KVKK 2026 Tahmini Ceza Riski
              </span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>

            <div className="mt-4">
              {compliance.estimatedFineMaxTRY > 0 ? (
                <div>
                  <div className="text-2xl font-bold font-mono text-rose-400">
                    ₺{compliance.estimatedFineMinTRY.toLocaleString('tr-TR')} — ₺{compliance.estimatedFineMaxTRY.toLocaleString('tr-TR')}
                  </div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    6698 Sayılı KVKK Madde 18 uyarınca 2026 yılı yeniden değerleme oranlarına göre veri güvenliği ihlali durumunda uygulanabilecek potansiyel idari para cezası skalasıdır.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    ₺0 — Risk Yok
                  </div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Mevcut veri setinde KVKK veya GDPR kapsamına giren açık hassas veri tespit edilmedi.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Kritik İhlal Sayısı:</span>
            <span className="font-mono font-bold text-rose-400">{compliance.severityCounts.CRITICAL}</span>
          </div>
        </div>

        {/* KPI 3: Severity Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Bulgu Şiddet Dağılımı
            </span>
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-rose-400 font-medium">Kritik (TCKN, IBAN, Kart, Secrets)</span>
                <span className="font-mono text-slate-200">{compliance.severityCounts.CRITICAL}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-rose-500 rounded-full" 
                  style={{ width: `${Math.min(100, compliance.severityCounts.CRITICAL * 25)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-amber-400 font-medium">Yüksek (VKN, Telefon, Ad Soyad)</span>
                <span className="font-mono text-slate-200">{compliance.severityCounts.HIGH}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full" 
                  style={{ width: `${Math.min(100, compliance.severityCounts.HIGH * 20)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-yellow-400 font-medium">Orta (E-posta, IP, Konum)</span>
                <span className="font-mono text-slate-200">{compliance.severityCounts.MEDIUM}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 rounded-full" 
                  style={{ width: `${Math.min(100, compliance.severityCounts.MEDIUM * 15)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex justify-between">
            <span>Toplam İncelenen Hassas Alan:</span>
            <span className="font-mono font-bold text-white">{compliance.totalFindings}</span>
          </div>
        </div>
      </div>

      {/* Compliance Standards Checklist */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-emerald-400" />
          <span>Mevzuat & Standart Kontrol Listesi</span>
        </h3>

        <div className="space-y-3">
          {compliance.checks.map((chk) => (
            <div
              key={chk.id}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1 max-w-3xl">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-200">{chk.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                    {chk.standard}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {chk.description}
                </p>
                <p className="text-xs text-emerald-400/90 font-medium">
                  💡 Tavsiye: {chk.recommendation}
                </p>
              </div>

              <div>
                {chk.status === 'PASS' && (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>BAŞARILI</span>
                  </span>
                )}
                {chk.status === 'WARN' && (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>UYARI</span>
                  </span>
                )}
                {chk.status === 'FAIL' && (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>UYUMSUZ</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official Audit Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Scale className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-white text-sm">Resmi KVKK & GDPR Güvenlik Denetim Belgesi</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center space-x-1 px-3 py-1 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Yazdır / PDF Kaydet</span>
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-3 py-1 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto font-sans space-y-6 text-slate-200 text-xs leading-relaxed bg-[#0a0f1d]">
              <div className="border-b border-slate-800 pb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-base font-bold text-white">VERİKALKAN GÜVENLİK VE KVKK UYUMLULUK RAPORU</h1>
                  <p className="text-[11px] text-slate-400">Rapor Kimliği: VK-AUDIT-{Date.now()}</p>
                  <p className="text-[11px] text-slate-400">Tarih: {new Date().toLocaleDateString('tr-TR')} {new Date().toLocaleTimeString('tr-TR')}</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded text-sm font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    SKOR: {compliance.score}/100 ({compliance.grade})
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">1. YÜRÜTME ÖZETİ</h4>
                <p className="text-slate-300">
                  İncelenen veri kümesinde toplam <strong>{compliance.totalFindings}</strong> adet hassas veri tespit edilmiştir. 
                  Risk seviyesi <strong>{compliance.riskLevel}</strong> olarak sınıflandırılmıştır. 
                  Veri güvenliği ihlali halinde 6698 Sayılı Kanun Madde 18 kapsamında tahmini idari para cezası riski 
                  <strong> ₺{compliance.estimatedFineMinTRY.toLocaleString('tr-TR')} - ₺{compliance.estimatedFineMaxTRY.toLocaleString('tr-TR')}</strong> aralığındadır.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white mb-2">2. MEVZUAT UYGUNLUK DENETİMİ</h4>
                <div className="space-y-2">
                  {compliance.checks.map(c => (
                    <div key={c.id} className="p-2.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
                      <div>
                        <div className="font-bold text-slate-200">{c.title}</div>
                        <div className="text-slate-400 text-[11px]">{c.description}</div>
                      </div>
                      <span className="font-mono font-bold text-[11px]">{c.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">3. TEKNİK TAVSİYELER</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  <li>Tüm geliştirici ve test ortamlarında gerçek TCKN ve IBAN yerine VeriKalkan Sentetik Veri Fabrikası kullanılmalıdır.</li>
                  <li>Sistem loglarında ödeme kartı (PAN) numaraları asla loglanmamalı, PCI-DSS v4.0 uyarınca ilk 4 ve son 4 harici yıldızlanmalıdır.</li>
                  <li>API anahtarları ve JWT belirteçleri istemci depolama ve açık repolardan arındırılmalıdır.</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 text-center">
                Bu belge VeriKalkan Studio açık kaynaklı istemci taraflı analiz motoru tarafından otomatik olarak üretilmiştir.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
