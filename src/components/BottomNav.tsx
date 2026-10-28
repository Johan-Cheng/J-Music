import React from 'react';
import { Flame, Search, Library, HeartHandshake, User } from 'lucide-react';
import { ActiveTab } from '../types/music.ts';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  favoritesCount?: number;
}

interface NavItem {
  key: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  favoritesCount = 0,
}) => {
  const items: NavItem[] = [
    { key: 'home', label: 'Home', icon: Flame },
    { key: 'search', label: 'Cari', icon: Search },
    { key: 'library', label: 'Library', icon: Library, badge: favoritesCount },
    { key: 'donasi', label: 'Donasi', icon: HeartHandshake },
    { key: 'profil', label: 'Profil', icon: User },
  ];

  return (
    <nav
      aria-label="Navigasi Utama"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#071122]/95 backdrop-blur-xl border-t border-cyan-500/15 pb-[env(safe-area-inset-bottom,8px)] transition-all"
    >
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1.5">
        {items.map((item) => {
          const isActive = activeTab === item.key;
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              aria-label={`Buka tab ${item.label}`}
              className={`relative flex flex-col items-center justify-center min-w-[58px] min-h-[48px] px-2 py-1 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-[#00D9FF]'
                  : 'text-slate-400 hover:text-slate-200 active:scale-95'
              }`}
            >
              {/* Active neon highlight aura */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/15 to-transparent rounded-2xl -z-10 border border-cyan-500/25 shadow-[0_0_12px_rgba(0,217,255,0.2)]" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(0,217,255,0.7)]' : ''
                  }`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#FF5FC8] text-[9px] font-bold text-white flex items-center justify-center shadow-[0_0_6px_rgba(255,95,200,0.6)]">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[11px] font-semibold tracking-tight mt-1 transition-colors ${
                  isActive ? 'text-[#00D9FF]' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>

              {/* Indicator dot */}
              {isActive && (
                <span className="w-1.5 h-1.5 bg-[#00D9FF] rounded-full mt-0.5 shadow-[0_0_5px_#00D9FF]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
