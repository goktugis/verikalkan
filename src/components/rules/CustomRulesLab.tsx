import React, { useState } from 'react';
import { generateValidTCKN, validateTCKN } from '../../core/algorithms/tckn';
import { generateValidVKN, validateVKN } from '../../core/algorithms/vkn';
import { formatIBAN, generateValidIBAN, validateIBAN } from '../../core/algorithms/iban';
import { generateValidCard, validateCreditCard } from '../../core/algorithms/luhn';
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Info, 
  Calculator
} from 'lucide-react';

export const CustomRulesLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'TCKN' | 'VKN' | 'IBAN' | 'CARD'>('TCKN');

  // TCKN State
  const [tcknInput, setTcknInput] = useState<string>('10000000146');
  
  // VKN State
  const [vknInput, setVknInput] = useState<string>('1234567890');

  // IBAN State
  const [ibanInput, setIbanInput] = useState<string>('TR330006200000012345678901');

  // Card State
  const [cardInput, setCardInput] = useState<string>('9792000012345678');

  // TCKN math calculation
  const cleanTckn = tcknInput.trim().replace(/\D/g, '');
  const isTcknValid = validateTCKN(cleanTckn);
  const tcknDigits = cleanTckn.split('').map(Number);
  const oddSum = tcknDigits.length === 11 ? tcknDigits[0] + tcknDigits[2] + tcknDigits[4] + tcknDigits[6] + tcknDigits[8] : 0;
  const evenSum = tcknDigits.length === 11 ? tcknDigits[1] + tcknDigits[3] + tcknDigits[5] + tcknDigits[7] : 0;
  const expected10 = tcknDigits.length === 11 ? (((oddSum * 7) - evenSum) % 10 + 10) % 10 : 0;
  const sum10 = tcknDigits.length === 11 ? tcknDigits.slice(0, 10).reduce((a, b) => a + b, 0) : 0;
  const expected11 = sum10 % 10;

  // VKN math calculation
  const isVknValid = validateVKN(vknInput);

  // IBAN math calculation
  const isIbanValid = validateIBAN(ibanInput);

  // Card math calculation
  const cardValidation = validateCreditCard(cardInput);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-emerald-950/20 border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Algoritma & Matematiksel Doğrulama Laboratuvarı
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Türkiye ve küresel finans standartlarındaki sağlama algoritmalarını adım adım inceleyin ve test edin
            </p>
          </div>
        </div>

        {/* Tab row */}
        <div className="flex items-center space-x-2 mt-6 border-b border-slate-800 pb-2">
          {(['TCKN', 'VKN', 'IBAN', 'CARD'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {tab === 'TCKN' && 'T.C. Kimlik No (TCKN)'}
              {tab === 'VKN' && 'Vergi Kimlik No (VKN)'}
              {tab === 'IBAN' && 'TR IBAN (ISO 7064)'}
              {tab === 'CARD' && 'Ödeme Kartı (Luhn MOD 10)'}
            </button>
          ))}
        </div>
      </div>

      {/* TCKN Lab */}
      {activeTab === 'TCKN' && (
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 w-full sm:w-auto">
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Test Edilecek TCKN (11 Hane):
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  maxLength={11}
                  value={tcknInput}
                  onChange={(e) => setTcknInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 font-mono text-sm text-white border border-slate-700 outline-none focus:border-emerald-500 transition-colors"
                />
                <button
                  onClick={() => setTcknInput(generateValidTCKN())}
                  className="px-3 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/40 transition-colors flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Rastgele Geçerli Üret</span>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-5">
              {isTcknValid ? (
                <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>GEÇERLİ TCKN</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>GEÇERSİZ TCKN</span>
                </div>
              )}
            </div>
          </div>

          {/* Mathematical breakdown */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4 text-xs font-mono">
            <div className="font-bold text-slate-200 flex items-center gap-1.5 font-sans">
              <Info className="w-4 h-4 text-emerald-400" />
              <span>Matematiksel Kural Analiz Adımları:</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block mb-1">1) 10. Hane Formülü</span>
                <p className="text-slate-200">Tek Haneler (1,3,5,7,9): {oddSum}</p>
                <p className="text-slate-200">Çift Haneler (2,4,6,8): {evenSum}</p>
                <p className="text-emerald-400 font-bold mt-1">
                  (({oddSum} × 7) - {evenSum}) % 10 = {expected10} (Mevcut: {tcknDigits[9] ?? '?'})
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block mb-1">2) 11. Hane Formülü</span>
                <p className="text-slate-200">İlk 10 Hane Toplamı: {sum10}</p>
                <p className="text-emerald-400 font-bold mt-1">
                  {sum10} % 10 = {expected11} (Mevcut: {tcknDigits[10] ?? '?'})
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VKN Lab */}
      {activeTab === 'VKN' && (
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 w-full sm:w-auto">
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Test Edilecek VKN (10 Hane):
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  maxLength={10}
                  value={vknInput}
                  onChange={(e) => setVknInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 font-mono text-sm text-white border border-slate-700 outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => setVknInput(generateValidVKN())}
                  className="px-3 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/40 flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Rastgele Geçerli Üret</span>
                </button>
              </div>
            </div>

            <div className="pt-5">
              {isVknValid ? (
                <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>GEÇERLİ VKN</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>GEÇERSİZ VKN</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* IBAN Lab */}
      {activeTab === 'IBAN' && (
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 w-full sm:w-auto">
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Test Edilecek TR IBAN (26 Karakter):
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  maxLength={34}
                  value={ibanInput}
                  onChange={(e) => setIbanInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 font-mono text-sm text-white border border-slate-700 outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => setIbanInput(generateValidIBAN())}
                  className="px-3 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/40 flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Rastgele Geçerli Üret</span>
                </button>
              </div>
            </div>

            <div className="pt-5">
              {isIbanValid ? (
                <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>GEÇERLİ ISO 7064 IBAN</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>GEÇERSİZ IBAN</span>
                </div>
              )}
            </div>
          </div>
          <div className="p-3 bg-slate-950 font-mono text-xs text-slate-400 rounded-lg">
            Biçimlendirilmiş: {formatIBAN(ibanInput)}
          </div>
        </div>
      )}

      {/* Credit Card Lab */}
      {activeTab === 'CARD' && (
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 w-full sm:w-auto">
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Test Edilecek Kart Numarası (Luhn MOD 10):
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  maxLength={19}
                  value={cardInput}
                  onChange={(e) => setCardInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 font-mono text-sm text-white border border-slate-700 outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => setCardInput(generateValidCard('TROY'))}
                  className="px-3 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/40 flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Troy Kart Üret</span>
                </button>
                <button
                  onClick={() => setCardInput(generateValidCard('VISA'))}
                  className="px-3 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold border border-cyan-500/40 flex items-center space-x-1"
                >
                  <span>Visa Üret</span>
                </button>
              </div>
            </div>

            <div className="pt-5">
              {cardValidation.isValid ? (
                <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>GEÇERLİ ({cardValidation.brand})</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>GEÇERSİZ KART</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
