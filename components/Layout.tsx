
import React from 'react';
import { GameTab, Language } from '../types';
import { translations } from '../translations';

interface LayoutProps {
  activeTab: GameTab;
  setActiveTab: (tab: GameTab) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  level: number;
  mana: number;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, lang, setLang, level, mana, children }) => {
  const t = translations[lang];

  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-slate-900 relative">
      <header className="safe-area-top p-4 flex flex-col border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-[60] shadow-xl">
        <div className="flex items-center justify-between w-full mb-3">
          <h1 className="text-xl font-game font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{t.title}</h1>
          <div className="flex gap-3 items-center">
             <button 
               onClick={() => setLang(lang === 'en' ? 'pt' : 'en')}
               className="text-[9px] font-bold bg-slate-800/50 border border-slate-700 px-3 py-1.5 rounded-full text-slate-400 hover:text-cyan-400 transition-all"
             >
               {lang === 'en' ? '🇺🇸 EN' : '🇧🇷 PT'}
             </button>
             <div className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 flex items-center gap-2 shadow-inner ring-2 ring-cyan-500/10">
               <span className="text-[10px] font-bold text-cyan-500">LV{level}</span>
             </div>
          </div>
        </div>
        
        <div className="w-full flex items-center gap-3 px-1">
           <span className="text-[8px] font-game font-bold text-slate-500 tracking-widest">{t.manaLabel}</span>
           <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div 
                className={`h-full transition-all duration-500 ${mana < 20 ? 'bg-red-500' : 'bg-cyan-500'} shadow-[0_0_10px_rgba(34,211,238,0.3)]`} 
                style={{ width: `${mana}%` }}
              ></div>
           </div>
           <span className="text-[9px] font-bold text-slate-400">{mana}%</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
        {children}
      </main>

      <nav className="safe-area-bottom fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-950/90 backdrop-blur-2xl border-t border-slate-800/50 px-2 py-5 flex justify-around items-center z-[60] shadow-[0_-15px_40px_rgba(0,0,0,0.6)]">
        <NavButton 
          active={activeTab === GameTab.HOME} 
          onClick={() => setActiveTab(GameTab.HOME)} 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>}
          label={t.navHome} 
        />
        <NavButton 
          active={activeTab === GameTab.CREATOR} 
          onClick={() => setActiveTab(GameTab.CREATOR)} 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
          label={t.navHero} 
        />
        <NavButton 
          active={activeTab === GameTab.LIVE} 
          onClick={() => setActiveTab(GameTab.LIVE)} 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>}
          label={t.navLive} 
        />
        <NavButton 
          active={activeTab === GameTab.QUESTS} 
          onClick={() => setActiveTab(GameTab.QUESTS)} 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
          label={t.navQuests} 
        />
        <NavButton 
          active={activeTab === GameTab.STUDIO} 
          onClick={() => setActiveTab(GameTab.STUDIO)} 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>}
          label={t.navVeo} 
        />
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center space-y-1 w-16 transition-all duration-300 active:scale-75 ${active ? 'text-cyan-400' : 'text-slate-500'}`}
  >
    <div className={`p-1.5 rounded-2xl transition-all duration-300 ${active ? 'bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.3)]' : ''}`}>
      {icon}
    </div>
    <span className={`text-[8px] font-game font-bold uppercase tracking-[0.1em] transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
  </button>
);

export default Layout;
