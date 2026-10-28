import React from 'react';
import { Search, Radio, Sparkles, UserCheck } from 'lucide-react';
import { UserProfile, ActiveTab } from '../types/music.ts';

interface HeaderProps {
  onSearchClick: () => void;
  onProfileClick: () => void;
  user: UserProfile;
  isPlaying: boolean;
  activeTab: ActiveTab;
}

export const Header: React.FC<HeaderProps> = ({
  onSearchClick,
  onProfileClick,
  user,
  isPlaying,
  activeTab,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#071122]/85 backdrop-blur-md border-b border-cyan-500/15 px-4 py-3 transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        {/* Brand Orb & Title using J-Music photo link */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-[#0B1C32] to-[#FF5FC8] p-[1.5px] shadow-[0_0_15px_rgba(0,217,255,0.3)]">
            <div className="w-full h-full bg-[#071122] rounded-[14px] flex items-center justify-center relative overflow-hidden">
              <img
                src="https://jambijohan0-cpu.github.io/Johan/img/J-Music.png"
                alt="J-Music"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100';
                }}
              />
              {/* Subtle inner pulse when playing */}
              {isPlaying && (
                <div className="absolute inset-0 bg-cyan-400/20 animate-pulse rounded-full pointer-events-none" />
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-extrabold tracking-wide text-white flex items-center gap-1">
                J-Music
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-[#00D9FF] border border-cyan-500/30">
                Hub
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-tight">
              Neon Techno Light
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          {/* Audio active waves indicator */}
          {isPlaying && (
            <div className="flex items-end gap-[2px] h-4 px-2 py-0.5 bg-cyan-950/60 rounded-full border border-cyan-500/30">
              <span className="w-1 bg-[#00D9FF] rounded-full animate-bounce h-2" style={{ animationDelay: '0ms' }} />
              <span className="w-1 bg-[#67FFD4] rounded-full animate-bounce h-3.5" style={{ animationDelay: '150ms' }} />
              <span className="w-1 bg-[#FF5FC8] rounded-full animate-bounce h-2.5" style={{ animationDelay: '300ms' }} />
            </div>
          )}

          {activeTab !== 'search' && (
            <button
              onClick={onSearchClick}
              aria-label="Cari Lagu atau Artis"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 hover:text-[#00D9FF] border border-slate-700/50 hover:border-cyan-500/40 transition-all active:scale-95"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onProfileClick}
            aria-label="Pengaturan dan Profil"
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 border border-slate-700/50 hover:border-cyan-500/40 transition-all active:scale-95"
          >
            <div className="relative">
              <UserCheck className="w-4 h-4 text-[#67FFD4]" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#00D9FF] ring-2 ring-[#071122]" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
