
import React, { useState } from 'react';
import { searchGameLore, findNearbyPortals, solveComplexPuzzle } from '../services/geminiService';
import { Language } from '../types';
import { translations } from '../translations';

const QuestLog: React.FC<{ lang: Language, onQuestDone?: () => void }> = ({ lang, onQuestDone }) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'lore' | 'map' | 'puzzle'>('lore');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string, sources?: any[] } | null>(null);

  const handleSearch = async () => {
    if (activeTab !== 'map' && !query) return;
    setLoading(true);
    setResult(null);
    try {
      if (activeTab === 'lore') {
        const res = await searchGameLore(query);
        setResult(res);
      } else if (activeTab === 'puzzle') {
        const res = await solveComplexPuzzle(query);
        setResult({ text: res });
      } else if (activeTab === 'map') {
        if (!navigator.geolocation) {
           alert(lang === 'pt' ? "GPS não suportado." : "GPS not supported.");
           return;
        }
        navigator.geolocation.getCurrentPosition(async (pos) => {
           const res = await findNearbyPortals(pos.coords.latitude, pos.coords.longitude);
           setResult(res);
        }, (err) => {
           console.error(err);
           alert(lang === 'pt' ? "GPS bloqueado ou falhou." : "GPS blocked or failed.");
           setLoading(false);
        });
      }
      if (onQuestDone) onQuestDone();
    } catch (e) {
      console.error(e);
      alert(lang === 'pt' ? "O Oráculo está instável." : "The Oracle is unstable.");
    } finally {
      if (activeTab !== 'map') setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 pb-20">
      <div className="flex bg-slate-800/50 rounded-2xl p-1.5 gap-1 border border-slate-700/50 shadow-inner">
        <TabBtn active={activeTab === 'lore'} label={t.questLore} onClick={() => { setActiveTab('lore'); setResult(null); }} />
        <TabBtn active={activeTab === 'map'} label={t.questMap} onClick={() => { setActiveTab('map'); setResult(null); }} />
        <TabBtn active={activeTab === 'puzzle'} label={t.questPuzzle} onClick={() => { setActiveTab('puzzle'); setResult(null); }} />
      </div>

      <div className="bg-slate-800/30 border border-slate-700 rounded-3xl p-5 space-y-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
        
        <div className="space-y-3 relative z-10">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] px-1">
            {activeTab === 'lore' && t.questLoreSub}
            {activeTab === 'map' && t.questMapSub}
            {activeTab === 'puzzle' && t.questPuzzleSub}
          </p>
          {activeTab !== 'map' && (
            <input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={activeTab === 'lore' ? (lang === 'pt' ? "Ex: Segredos dos Dragões" : "E.g., Secrets of Dragons") : (lang === 'pt' ? "Desafio do Oráculo..." : "Oracle challenge...")}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-cyan-500 outline-none text-white transition-all shadow-inner"
            />
          )}
          <button 
            onClick={handleSearch}
            disabled={loading}
            className="w-full py-4 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-cyan-400 font-game font-bold rounded-xl transition-all border border-slate-600 shadow-lg active:scale-95"
          >
            {loading ? t.questScanning : t.questConsult}
          </button>
        </div>

        {result && (
          <div className="animate-in fade-in zoom-in-95 duration-500 mt-6 space-y-5">
             <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-700/50 shadow-inner max-h-[450px] overflow-y-auto custom-scrollbar">
                <div className="prose prose-invert prose-sm max-w-none">
                   <p className="whitespace-pre-wrap text-slate-300 leading-relaxed font-medium">
                     {result.text}
                   </p>
                </div>
                
                {result.sources && result.sources.length > 0 && (
                  <div className="pt-6 mt-6 border-t border-slate-800 space-y-3">
                    <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">{lang === 'pt' ? 'ARQUIVOS VERIFICADOS' : 'VERIFIED ARCHIVES'}</p>
                    <div className="flex flex-col gap-2">
                      {result.sources.map((s, i) => (
                        <a 
                          key={i} 
                          href={s.web?.uri || s.maps?.uri} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:bg-slate-800 transition-colors"
                        >
                          <svg className="w-3 h-3 text-cyan-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                          <span className="text-[10px] text-cyan-400 underline font-bold truncate">
                            {s.web?.title || s.maps?.title || "Visit Source"}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TabBtn = ({ active, label, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex-1 py-2.5 text-[9px] font-game font-bold uppercase rounded-xl transition-all duration-300 ${active ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
  >
    {label}
  </button>
);

export default QuestLog;
