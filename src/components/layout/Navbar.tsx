import React from 'react';
import { Shield, Lock, Sparkles, Terminal, Database, FileCheck, Layers } from 'lucide-react';

interface NavbarProps {
  activeTab: 'scanner' | 'compliance' | 'synthetic' | 'mockApi' | 'lab';
  setActiveTab: (tab: 'scanner' | 'compliance' | 'synthetic' | 'mockApi' | 'lab') => void;
  onLoadPreset: () => void;
  findingsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onLoadPreset,
  findingsCount,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('scanner')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-violet-500/10 border border-emerald-500/40 shadow-lg shadow-emerald-500/10">
              <Shield className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  Veri<span className="text-emerald-400">Kalkan</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold font-mono tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 rounded">
                  v2.6
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Sıfır-Bilgi KVKK/GDPR Veri Maskeleme & Sentetik Veri Stüdyosu
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'scanner'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Hassas Veri & Maskeleme</span>
              {findingsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-full font-mono">
                  {findingsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('compliance')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'compliance'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>KVKK/GDPR Radarı</span>
            </button>

            <button
              onClick={() => setActiveTab('synthetic')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'synthetic'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Sentetik Veri Fabrikası</span>
            </button>

            <button
              onClick={() => setActiveTab('mockApi')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'mockApi'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Mock API Sandbox</span>
            </button>

            <button
              onClick={() => setActiveTab('lab')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'lab'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Algoritma Laboratuvarı</span>
            </button>
          </nav>

          {/* Air-gap Badge & Quick Actions */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-900 border border-emerald-900/50 text-[11px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Air-Gap Zero-Trust: %100 İstemcide</span>
            </div>

            <button
              onClick={onLoadPreset}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-all hover:border-emerald-500/50"
              title="Örnek Gerçekçi KVKK Veri Seti Yükle"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Demo Senaryo</span>
            </button>

            <a
              href="https://github.com/goktugis/verikalkan"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-colors"
              title="GitHub Reposu"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Tab Row */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 bg-slate-950/80 px-2 py-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('scanner')}
          className={`px-2.5 py-1 text-xs rounded font-medium whitespace-nowrap ${
            activeTab === 'scanner' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'
          }`}
        >
          Maskeleme
        </button>
        <button
          onClick={() => setActiveTab('compliance')}
          className={`px-2.5 py-1 text-xs rounded font-medium whitespace-nowrap ${
            activeTab === 'compliance' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'
          }`}
        >
          KVKK Radarı
        </button>
        <button
          onClick={() => setActiveTab('synthetic')}
          className={`px-2.5 py-1 text-xs rounded font-medium whitespace-nowrap ${
            activeTab === 'synthetic' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'
          }`}
        >
          Sentetik Veri
        </button>
        <button
          onClick={() => setActiveTab('mockApi')}
          className={`px-2.5 py-1 text-xs rounded font-medium whitespace-nowrap ${
            activeTab === 'mockApi' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'
          }`}
        >
          Mock API
        </button>
        <button
          onClick={() => setActiveTab('lab')}
          className={`px-2.5 py-1 text-xs rounded font-medium whitespace-nowrap ${
            activeTab === 'lab' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'
          }`}
        >
          Algoritma Lab
        </button>
      </div>
    </header>
  );
};
