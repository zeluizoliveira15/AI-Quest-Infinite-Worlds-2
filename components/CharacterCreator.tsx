
import React, { useState, useEffect } from 'react';
import { generateGameImage, editImagePrompt } from '../services/geminiService';
import { Language, Character, CharacterStats } from '../types';
import { translations } from '../translations';

const AUTO_SAVE_INTERVAL = 15000;
const MANA_COST = 20;

interface CharacterCreatorProps {
  lang: Language;
  onHeroCreated?: () => void;
  mana: number;
  spendMana: (amount: number) => boolean;
  vibrate: (ms: number) => void;
}

const CharacterCreator: React.FC<CharacterCreatorProps> = ({ lang, onHeroCreated, mana, spendMana, vibrate }) => {
  const t = translations[lang];
  const [hasKey, setHasKey] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [size, setSize] = useState('1K');
  const [image, setImage] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [charName, setCharName] = useState('');
  const [charStats, setCharStats] = useState<CharacterStats | null>(null);
  const [showVault, setShowVault] = useState(false);
  const [savedHeroes, setSavedHeroes] = useState<Character[]>([]);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'name'>('latest');
  const [activeTooltip, setActiveTooltip] = useState<'aspect' | 'quality' | null>(null);

  useEffect(() => {
    checkKey();
    loadVault();
    checkDraft();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (prompt || charName || image) {
        saveDraft();
      }
    }, AUTO_SAVE_INTERVAL);
    return () => clearInterval(timer);
  }, [prompt, charName, image, aspectRatio, size, charStats]);

  const checkKey = async () => {
    const selected = await window.aistudio.hasSelectedApiKey();
    setHasKey(selected);
  };

  const loadVault = () => {
    const data = localStorage.getItem('ai_quest_heroes');
    if (data) setSavedHeroes(JSON.parse(data));
  };

  const checkDraft = () => {
    const draft = localStorage.getItem('ai_quest_draft');
    if (draft && !prompt && !image) {
      setShowResumePrompt(true);
    }
  };

  const saveDraft = () => {
    const draft = { prompt, aspectRatio, size, image, charName, charStats, timestamp: Date.now() };
    localStorage.setItem('ai_quest_draft', JSON.stringify(draft));
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    if (mana < MANA_COST) {
      alert(t.outOfMana + ": " + t.outOfManaSub);
      return;
    }

    setLoading(true);
    vibrate(50);
    try {
      const result = await generateGameImage(prompt, aspectRatio, size);
      spendMana(MANA_COST);
      setImage(result);
      vibrate(100);
      setCharStats({
        power: Math.floor(Math.random() * 51) + 40,
        agility: Math.floor(Math.random() * 51) + 40,
        magic: Math.floor(Math.random() * 51) + 40,
      });
      saveDraft();
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes("Requested entity was not found")) {
        setHasKey(false);
      } else {
        alert(lang === 'pt' ? "Erro na geração." : "Generation failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!image || !charName) return;
    vibrate(40);
    const newHero: Character = {
      id: crypto.randomUUID(),
      name: charName,
      imageUrl: image,
      description: prompt,
      stats: charStats || { power: 10, agility: 10, magic: 10 },
      createdAt: Date.now(),
    };
    const updated = [newHero, ...savedHeroes];
    setSavedHeroes(updated);
    localStorage.setItem('ai_quest_heroes', JSON.stringify(updated));
    setImage(null);
    setPrompt('');
    setCharName('');
    setShowVault(true);
    if (onHeroCreated) onHeroCreated();
  };

  return (
    <div className="p-4 space-y-6 pb-24 overflow-hidden relative min-h-screen">
      <div className="flex justify-between items-center sticky top-0 z-40 py-2 bg-slate-900/80 backdrop-blur">
        <h2 className="text-xl font-game font-bold text-cyan-400">{showVault ? t.vaultTitle : t.forgeTitle}</h2>
        <button onClick={() => { vibrate(10); setShowVault(!showVault); }} className="flex items-center gap-2 text-[10px] font-bold bg-slate-800 border border-slate-700 px-4 py-2 rounded-full text-cyan-400 shadow-lg">
          {showVault ? (lang === 'pt' ? "VOLTAR" : "BACK") : t.viewVault}
        </button>
      </div>

      <div className="relative">
        <div className={`transition-all duration-500 ${showVault ? 'opacity-0 -translate-x-full pointer-events-none absolute w-full' : 'opacity-100 translate-x-0 relative'}`}>
          <div className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700 shadow-xl space-y-5">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t.forgePlaceholder}
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-sm h-28 focus:ring-2 focus:ring-cyan-500 outline-none text-white"
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-1 block">{t.forgeAspect}</label>
                <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none">
                  <option value="1:1">1:1 Square</option>
                  <option value="9:16">9:16 Cinema</option>
                  <option value="16:9">16:9 Wide</option>
                </select>
              </div>
              <div className="relative">
                <label className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-1 block">{t.forgeQuality}</label>
                <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none">
                  <option value="1K">1K Balanced</option>
                  <option value="2K">2K Pro</option>
                </select>
              </div>
            </div>
            
            <button onClick={handleGenerate} disabled={loading || !prompt} className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 disabled:from-slate-800 text-white font-game font-bold rounded-2xl transition-all shadow-lg text-[11px] tracking-widest relative group overflow-hidden">
               <span className="relative z-10">{loading ? t.forgeLoading : `${t.forgeButton} (-${MANA_COST} MANA)`}</span>
               {!loading && <div className="absolute inset-0 bg-white/10 translate-y-full group-active:translate-y-0 transition-transform"></div>}
            </button>
          </div>

          {image && (
            <div className="mt-6 space-y-4 animate-in zoom-in-95 duration-500">
              <img src={image} alt="Hero" className="w-full rounded-[2.5rem] border-4 border-slate-800 shadow-2xl" />
              <div className="bg-slate-800/80 rounded-[2rem] p-6 border border-slate-700 shadow-xl space-y-5">
                <div className="grid grid-cols-3 gap-3">
                   <StatBox label={t.statsPower} val={charStats?.power} color="text-red-400" />
                   <StatBox label={t.statsAgility} val={charStats?.agility} color="text-green-400" />
                   <StatBox label={t.statsMagic} val={charStats?.magic} color="text-blue-400" />
                </div>
                <div className="space-y-3">
                  <input value={charName} onChange={(e) => setCharName(e.target.value)} placeholder={t.charNamePlaceholder} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm text-white outline-none" />
                  <button onClick={handleSave} disabled={!charName} className="w-full py-4 bg-emerald-600 text-white font-game font-bold rounded-xl shadow-lg text-[10px] tracking-widest">
                    {t.saveCharacter}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={`transition-all duration-500 ${!showVault ? 'opacity-0 translate-x-full pointer-events-none absolute w-full' : 'opacity-100 translate-x-0 relative'}`}>
          <div className="grid grid-cols-1 gap-6">
            {savedHeroes.length === 0 ? (
              <p className="text-center py-20 text-slate-500 italic">{t.noCharacters}</p>
            ) : (
              savedHeroes.map((hero) => (
                <div key={hero.id} className="bg-slate-800/40 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <img src={hero.imageUrl} alt={hero.name} className="w-full h-56 object-cover" />
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-center">
                          <h4 className="font-game text-cyan-400 text-lg">{hero.name}</h4>
                          <button onClick={() => vibrate(10)} className="p-2 bg-slate-900 rounded-full border border-slate-700 text-cyan-500">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                          </button>
                      </div>
                      <p className="text-xs text-slate-400 italic">"{hero.description}"</p>
                      <div className="grid grid-cols-3 gap-2">
                          <SmallStat label={t.statsPower} val={hero.stats.power} color="text-red-400" />
                          <SmallStat label={t.statsAgility} val={hero.stats.agility} color="text-green-400" />
                          <SmallStat label={t.statsMagic} val={hero.stats.magic} color="text-blue-400" />
                      </div>
                    </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, val, color }: any) => (
  <div className="text-center bg-slate-900/50 p-3 rounded-2xl border border-slate-700/50 shadow-inner">
    <p className="text-[8px] uppercase text-slate-500 font-bold mb-1">{label}</p>
    <p className={`text-xl font-game ${color}`}>{val}</p>
  </div>
);

const SmallStat = ({ label, val, color }: any) => (
  <div className="text-center bg-slate-900/80 p-2 rounded-xl border border-slate-700">
    <p className="text-[7px] text-slate-500 uppercase font-bold mb-0.5">{label}</p>
    <p className={`text-[10px] font-game ${color}`}>{val}</p>
  </div>
);

export default CharacterCreator;
