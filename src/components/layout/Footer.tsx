import React from 'react';
import { ShieldCheck, Lock, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-[#070b14] py-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">VeriKalkan Studio</span>
            <span className="text-slate-500">—</span>
            <span>Zero-Trust KVKK (6698) & GDPR Article 32 Veri Koruma ve Sentetik Test Platformu</span>
          </div>

          <div className="flex items-center space-x-4 text-slate-400">
            <span className="flex items-center space-x-1 font-mono">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verileriniz Tarayıcıdan Asla Çıkmaz (Air-Gapped)</span>
            </span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <a
              href="https://github.com/goktugis"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center space-x-1"
            >
              <span>Göktuğ İşeri</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <div>
            Türkiye 6698 Sayılı KVKK ve AB GDPR Standartları Uyumluluk Referans Projesi. Açık Kaynak MIT Lisansı.
          </div>
          <div className="mt-2 sm:mt-0 font-mono text-[10px] text-slate-600">
            SHA-256 / AES-GCM-256 / ISO 7064 MOD 97-10 / LUHN MOD 10
          </div>
        </div>
      </div>
    </footer>
  );
};
