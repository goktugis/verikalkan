import React, { useState } from 'react';
import { handleVirtualApiRequest } from '../../core/mockServer';
import type { VirtualRequest } from '../../core/mockServer';
import type { MockApiResponse } from '../../types';
import { 
  Terminal, 
  Copy, 
  Check, 
  Send, 
  Clock, 
  Code2,
  Server
} from 'lucide-react';

export const MockApiSandbox: React.FC = () => {
  const [method, setMethod] = useState<'GET' | 'POST'>('POST');
  const [endpoint, setEndpoint] = useState<string>('/api/v1/sanitize');
  const [latency, setLatency] = useState<number>(85);
  const [requestBody, setRequestBody] = useState<string>(JSON.stringify({
    user_id: "USR_1092",
    tckn: "10000000146",
    ad_soyad: "Ahmet Yılmaz",
    iban: "TR330006200000012345678901",
    kart: "9792000012345678"
  }, null, 2));

  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<MockApiResponse | null>(null);
  const [curlCopied, setCurlCopied] = useState<boolean>(false);

  const handleSend = async () => {
    setLoading(true);
    let parsedBody = undefined;
    if (method === 'POST') {
      try {
        parsedBody = JSON.parse(requestBody);
      } catch {
        parsedBody = requestBody;
      }
    }

    const req: VirtualRequest = {
      method,
      endpoint,
      body: parsedBody,
      simulatedLatencyMs: latency,
    };

    const res = await handleVirtualApiRequest(req);
    setResponse(res);
    setLoading(false);
  };

  const curlCommand = `curl -X ${method} "https://verikalkan.local${endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "X-Client: VeriKalkan-SDK" ${method === 'POST' ? `\\\n  -d '${requestBody.replace(/\n\s*/g, '')}'` : ''}`;

  const copyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCurlCopied(true);
    setTimeout(() => setCurlCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-violet-950/20 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Tarayıcı İçi Canlı Mock API Sunucusu (Playground)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Frontend ve mikroservis geliştiricileri için sıfır bağımlılıklı sanal REST API simülasyonu
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={copyCurl}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-all"
        >
          {curlCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>cURL Kopyala</span>
        </button>
      </div>

      {/* URL & Method Bar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-1 items-center space-x-2">
          {/* Method selector */}
          <select
            value={method}
            onChange={(e) => {
              const m = e.target.value as 'GET' | 'POST';
              setMethod(m);
              if (m === 'GET') setEndpoint('/api/v1/synthetic/users');
              else setEndpoint('/api/v1/sanitize');
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-950 text-emerald-400 font-mono text-xs font-bold border border-slate-800 outline-none"
          >
            <option value="POST">POST</option>
            <option value="GET">GET</option>
          </select>

          {/* Endpoint Selector */}
          <select
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 text-slate-200 font-mono text-xs border border-slate-800 outline-none"
          >
            <option value="/api/v1/sanitize">/api/v1/sanitize — Gönderilen JSON veriyi anında arındır</option>
            <option value="/api/v1/validate">/api/v1/validate — TCKN, VKN, IBAN, Kart algoritmik doğrulama</option>
            <option value="/api/v1/synthetic/users">/api/v1/synthetic/users — Hazır sentetik kullanıcı dökümü</option>
            <option value="/api/v1/compliance/audit">/api/v1/compliance/audit — Otomatik KVKK denetim skoru al</option>
          </select>
        </div>

        {/* Latency & Send button */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400">Gecikme:</span>
            <input
              type="range"
              min="20"
              max="500"
              step="10"
              value={latency}
              onChange={(e) => setLatency(Number(e.target.value))}
              className="w-24 accent-violet-500 cursor-pointer"
            />
            <span className="text-xs font-mono text-violet-400">{latency}ms</span>
          </div>

          <button
            onClick={handleSend}
            disabled={loading}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-spin text-xs">⏳</span>
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>İsteği Gönder</span>
          </button>
        </div>
      </div>

      {/* Dual Panel: Request Body vs Response JSON */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Request Payload */}
        <div className="flex flex-col h-[460px] rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
          <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span>İstek Gövdesi (JSON Payload)</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">application/json</span>
          </div>

          <div className="flex-1 p-3 bg-[#070b14] font-mono text-xs">
            {method === 'POST' ? (
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                className="w-full h-full bg-transparent text-slate-200 resize-none outline-none leading-relaxed font-mono"
                spellCheck={false}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-center">
                GET isteklerinde istek gövdesi gönderilmez. Endpoint parametreleri URL üzerinden iletilir.
              </div>
            )}
          </div>
        </div>

        {/* Right: Response Payload */}
        <div className="flex flex-col h-[460px] rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
          <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Server className="w-4 h-4 text-violet-400" />
              <span>API Yanıtı (HTTP Response)</span>
            </span>

            {response && (
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  response.status >= 200 && response.status < 300
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {response.status} {response.statusText}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{response.latencyMs}ms</span>
              </div>
            )}
          </div>

          <div className="flex-1 p-3 bg-[#050811] font-mono text-xs text-emerald-300 overflow-auto">
            {response ? (
              <pre className="leading-relaxed">{JSON.stringify(response.data, null, 2)}</pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center space-y-2">
                <Terminal className="w-8 h-8 text-slate-700" />
                <p>İstek göndermek için yukarıdaki "İsteği Gönder" butonuna tıklayın.</p>
              </div>
            )}
          </div>

          {response && (
            <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex justify-between">
              <span>x-powered-by: VeriKalkan-ZeroTrust-Engine/2026</span>
              <span>content-type: application/json</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
