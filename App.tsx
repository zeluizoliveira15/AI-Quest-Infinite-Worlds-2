
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import CharacterCreator from './components/CharacterCreator';
import QuestLog from './components/QuestLog';
import NPCVoice from './components/NPCVoice';
import CinematicStudio from './components/CinematicStudio';
import { GameTab, Language } from './types';
import { translations } from './translations';

const MANA_MAX = 100;
const MANA_REGEN_TIME = 60000; // 1 mana per minute
const MANA_REGEN_AMOUNT = 1;

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GameTab>(GameTab.HOME);
  const [lang, setLang] = useState<Language>('en');
  const [xp, setXp] = useState(0);
  const [mana, setMana] = useState(MANA_MAX);
  const [lastRegen, setLastRegen] = useState(Date.now());

  useEffect(() => {
    const userLang = navigator.language.toLowerCase();
    if (userLang.startsWith('pt')) setLang('pt');
    
    setXp(parseInt(localStorage.getItem('ai_quest_xp') || '0'));
    setMana(parseInt(localStorage.getItem('ai_quest_mana') || MANA_MAX.toString()));
    setLastRegen(parseInt(localStorage.getItem('ai_quest_last_regen') || Date.now().toString()));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = now - lastRegen;
      if (diff >= MANA_REGEN_TIME && mana < MANA_MAX) {
        const amount = Math.floor(diff / MANA_REGEN_TIME);
        const newMana = Math.min(MANA_MAX, mana + amount);
        setMana(newMana);
        setLastRegen(now);
        localStorage.setItem('ai_quest_mana', newMana.toString());
        localStorage.setItem('ai_quest_last_regen', now.toString());
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [mana, lastRegen]);

  const t = translations[lang];

  const addXp = (amount: number) => {
    const newXp = xp + amount;
    setXp(newXp);
    localStorage.setItem('ai_quest_xp', newXp.toString());
    vibrate(50);
  };

  const spendMana = (amount: number) => {
    if (mana >= amount) {
      const newMana = mana - amount;
      setMana(newMana);
      localStorage.setItem('ai_quest_mana', newMana.toString());
      return true;
    }
    return false;
  };

  const vibrate = (ms: number) => {
    if ('vibrate' in navigator) navigator.vibrate(ms);
  };

  const handleNavigate = (tab: GameTab) => {
    vibrate(10);
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case GameTab.HOME: return (
        <HomeView 
          t={t} 
          onNavigate={handleNavigate} 
          lang={lang} 
          xp={xp} 
          mana={mana} 
          setMana={(m) => {
            setMana(m);
            localStorage.setItem('ai_quest_mana', m.toString());
          }}
          addXp={addXp}
          vibrate={vibrate}
        />
      );
      case GameTab.CREATOR: return (
        <CharacterCreator 
          lang={lang} 
          onHeroCreated={() => addXp(150)} 
          mana={mana} 
          spendMana={spendMana}
          vibrate={vibrate}
        />
      );
      case GameTab.LIVE: return <NPCVoice lang={lang} />;
      case GameTab.QUESTS: return <QuestLog lang={lang} onQuestDone={() => addXp(100)} vibrate={vibrate} />;
      case GameTab.STUDIO: return (
        <CinematicStudio 
          lang={lang} 
          mana={mana} 
          spendMana={spendMana}
          vibrate={vibrate}
        />
      );
      default: return null;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={handleNavigate} 
      lang={lang} 
      setLang={(l) => { vibrate(20); setLang(l); }} 
      level={Math.floor(xp / 500) + 1}
      mana={mana}
    >
      {renderContent()}
    </Layout>
  );
};

const HomeView: React.FC<{ 
  onNavigate: (tab: GameTab) => void, 
  t: any, 
  lang: Language, 
  xp: number, 
  mana: number, 
  setMana: (m: number) => void,
  addXp: (x: number) => void,
  vibrate: (m: number) => void
}> = ({ onNavigate, t, lang, xp, mana, setMana, addXp, vibrate }) => {
  const [vaultCount, setVaultCount] = useState(0);
  const [dailyReady, setDailyReady] = useState(false);
  const level = Math.floor(xp / 500) + 1;
  const currentXpInLevel = xp % 500;
  const xpPercent = (currentXpInLevel / 500) * 100;

  useEffect(() => {
    const heroes = JSON.parse(localStorage.getItem('ai_quest_heroes') || '[]');
    setVaultCount(heroes.length);

    const lastDaily = localStorage.getItem('ai_quest_last_daily');
    const today = new Date().toDateString();
    if (lastDaily !== today) setDailyReady(true);
  }, []);

  const collectDaily = () => {
    if (!dailyReady) return;
    vibrate(100);
    setMana(Math.min(MANA_MAX, mana + 50));
    addXp(200);
    localStorage.setItem('ai_quest_last_daily', new Date().toDateString());
    setDailyReady(false);
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-700 pb-28">
      <div className="relative h-80 rounded-[3rem] overflow-hidden shadow-2xl border-2 border-slate-800/50 group">
        <img 
          src="./logo.png" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3000ms]" 
          alt="AI Quest Logo" 
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/aiquest${lang}/800/800`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
        <div className="absolute bottom-8 left-8 right-8 space-y-4">
          <div>
            <h2 className="text-4xl font-game font-bold text-white mb-1 leading-tight drop-shadow-lg">{t.welcome}</h2>
            <p className="text-cyan-400 font-game text-[10px] tracking-[0.4em] uppercase">{t.welcomeSub}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-[9px] font-game text-slate-400 font-bold tracking-widest uppercase">
               <span>LEVEL {level}</span>
               <span className="text-cyan-400">{currentXpInLevel} / 500 XP</span>
            </div>
            <div className="w-full h-2 bg-slate-900/80 rounded-full border border-slate-700/50 overflow-hidden shadow-inner">
               <div className="h-full bg-gradient-to-r from-cyan-600 to-blue-400 transition-all duration-1000 shadow-[0_0_10px_rgba(34,211,238,0.5)]" style={{ width: `${xpPercent}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={collectDaily}
        disabled={!dailyReady}
        className={`w-full py-4 rounded-2xl font-game text-[10px] font-bold tracking-[0.2em] transition-all border-2 shadow-lg active:scale-95 ${dailyReady ? 'bg-cyan-600/20 border-cyan-500 text-cyan-400 animate-pulse' : 'bg-slate-800/30 border-slate-700 text-slate-600 opacity-60'}`}
      >
        {dailyReady ? t.collectDaily : t.dailyCollected}
      </button>

      <div className="grid grid-cols-2 gap-4">
        <MenuCard title={t.homeForge} subtitle={t.homeForgeSub} onClick={() => onNavigate(GameTab.CREATOR)} color="from-cyan-500 to-blue-500" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2.5" strokeLinecap="round"/></svg>} />
        <MenuCard title={t.homeLive} subtitle={t.homeLiveSub} onClick={() => onNavigate(GameTab.LIVE)} color="from-purple-500 to-pink-500" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4" strokeWidth="2" strokeLinecap="round"/></svg>} />
        <MenuCard title={t.homeQuests} subtitle={t.homeQuestsSub} onClick={() => onNavigate(GameTab.QUESTS)} color="from-emerald-500 to-teal-500" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2" strokeLinecap="round"/></svg>} />
        <MenuCard title={t.homeVeo} subtitle={t.homeVeoSub} onClick={() => onNavigate(GameTab.STUDIO)} color="from-amber-500 to-orange-500" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 10l4.5 2.2a1 1 0 010 1.7L15 14" strokeWidth="2" strokeLinecap="round"/></svg>} />
      </div>

      <div className="bg-slate-800/20 rounded-[2.5rem] p-8 border border-slate-800/50 shadow-inner">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-game text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{t.activityTitle}</h3>
          <span className="text-[9px] font-bold text-cyan-500 bg-cyan-950/40 px-3 py-1.5 rounded-full border border-cyan-800/30 shadow-lg">{vaultCount} {lang === 'pt' ? 'HERÓIS' : 'HEROES'}</span>
        </div>
        <div className="space-y-6">
          {[1, 2].map(i => (
            <div key={i} className="flex gap-4 items-center animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${i*200}ms` }}>
              <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 p-0.5 overflow-hidden shrink-0 shadow-lg">
                 <img src={`https://picsum.photos/seed/hero${i}/120/120`} alt="Avatar" className="w-full h-full object-cover rounded-xl opacity-80" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-slate-400 font-medium">
                  <span className="font-game text-[9px] text-cyan-400 tracking-tight">Vanguard_{i*7}</span> {lang === 'pt' ? 'descobriu um portal antigo.' : 'discovered an ancient portal.'}
                </p>
                <p className="text-[8px] text-slate-600 font-bold uppercase mt-1.5">{i * 3}m {lang === 'pt' ? 'atrás' : 'ago'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MenuCard: React.FC<{ title: string, subtitle: string, onClick: () => void, color: string, icon: React.ReactNode }> = ({ title, subtitle, onClick, color, icon }) => (
  <button onClick={onClick} className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-[2.5rem] text-left hover:border-cyan-500/50 transition-all active:scale-[0.96] group relative overflow-hidden shadow-xl">
    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-[0.05] rounded-full -translate-y-12 translate-x-12`}></div>
    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${color} mb-5 flex items-center justify-center text-white shadow-lg shadow-black/20 group-hover:rotate-12 transition-transform`}>
      {icon}
    </div>
    <h4 className="font-game text-[11px] font-bold text-white mb-1.5 uppercase tracking-tighter leading-tight">{title}</h4>
    <p className="text-[9px] text-slate-500 font-medium leading-relaxed">{subtitle}</p>
  </button>
);

export default App;
