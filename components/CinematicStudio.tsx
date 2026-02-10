
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Language } from '../types';
import { translations } from '../translations';

const VIDEO_MANA_COST = 40;

interface CinematicStudioProps {
  lang: Language;
  mana: number;
  spendMana: (amount: number) => boolean;
  vibrate: (ms: number) => void;
}

const CinematicStudio: React.FC<CinematicStudioProps> = ({ lang, mana, spendMana, vibrate }) => {
  const t = translations[lang];
  const [hasKey, setHasKey] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkKey();
  }, []);

  const checkKey = async () => {
    const selected = await window.aistudio.hasSelectedApiKey();
    setHasKey(selected);
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    if (mana < VIDEO_MANA_COST) {
      alert(t.outOfMana);
      return;
    }

    setLoading(true);
    vibrate(60);
    setStatus(lang === 'pt' ? 'Conectando ao Tecelão...' : 'Summoning the Weaver...');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        config: {
          numberOfVideos: 1, resolution: '720p', aspectRatio
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 8000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        spendMana(VIDEO_MANA_COST);
        vibrate(120);
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
      }
    } catch (e: any) {
      console.error(e);
      alert(lang === 'pt' ? "Erro cósmico." : "Cosmic error.");
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="bg-slate-800/50 rounded-[2.5rem] p-8 border border-slate-700 shadow-2xl">
        <h2 className="text-xl font-game font-bold mb-6 text-cyan-400">{t.veoTitle}</h2>
        <div className="space-y-6">
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t.veoPlaceholder}
            className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-sm h-32 focus:ring-2 focus:ring-cyan-500 outline-none"
          />
          <div className="flex gap-4">
             <button onClick={() => { vibrate(10); setAspectRatio('16:9'); }} className={`flex-1 py-3 text-[10px] font-bold rounded-xl border transition-all ${aspectRatio === '16:9' ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>16:9 WIDE</button>
             <button onClick={() => { vibrate(10); setAspectRatio('9:16'); }} className={`flex-1 py-3 text-[10px] font-bold rounded-xl border transition-all ${aspectRatio === '9:16' ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>9:16 MOBILE</button>
          </div>
          <button onClick={handleGenerate} disabled={loading} className="w-full py-5 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 text-white font-game font-bold rounded-2xl shadow-xl tracking-widest text-[11px]">
            {loading ? t.veoLoading : `${t.veoButton} (-${VIDEO_MANA_COST} MANA)`}
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center py-10 space-y-4 animate-pulse">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-cyan-400 text-[10px] font-game font-bold tracking-widest uppercase">{status}</p>
        </div>
      )}

      {videoUrl && !loading && (
        <video src={videoUrl} controls className="w-full rounded-[2.5rem] border-4 border-cyan-900 shadow-2xl" />
      )}
    </div>
  );
};

export default CinematicStudio;
