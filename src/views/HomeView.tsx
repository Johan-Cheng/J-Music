import React from 'react';
import { Sparkles, Play, Disc, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { Track, GenreCategory } from '../types/music.ts';
import { TrackCard } from '../components/TrackCard.tsx';

interface HomeViewProps {
  trendingTracks: Track[];
  recommendedTracks: Track[];
  genres: GenreCategory[];
  currentTrack: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
  favorites: Track[];
  onPlay: (track: Track) => void;
  onPlayAll: (tracks: Track[]) => void;
  onSelectGenre: (genreTag: string) => void;
  onToggleFavorite: (track: Track) => void;
  onOpenPlaylistModal: (track: Track) => void;
  onOpenDownloadGate: (track: Track) => void;
  onRefresh: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  trendingTracks,
  recommendedTracks,
  genres,
  currentTrack,
  isPlaying,
  isLoading,
  favorites,
  onPlay,
  onPlayAll,
  onSelectGenre,
  onToggleFavorite,
  onOpenPlaylistModal,
  onOpenDownloadGate,
  onRefresh,
}) => {
  return (
    <div className="space-y-6 pb-28 animate-fade-in">
      {/* Hero Banner with Custom Photo & Animated Musical Accessories */}
      <section style={{ display: 'none' }} className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-[#0B1C32] via-[#071122] to-[#120f2e] border border-cyan-500/25 shadow-[0_0_25px_rgba(0,217,255,0.15)] flex flex-col items-center text-center">
        {/* Animated Background Stars & Floating Musical Notes (♩, ♪, ♫, ♬, 🎵, 🎶) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Stars */}
          <span className="absolute top-2 left-6 text-yellow-300 animate-ping text-xs">⭐</span>
          <span className="absolute top-8 right-8 text-[#67FFD4] animate-pulse text-sm">✨</span>
          <span className="absolute bottom-4 left-1/4 text-[#00D9FF] animate-bounce text-xs">🌟</span>
          <span className="absolute top-1/2 right-4 text-pink-400 animate-ping text-xs" style={{ animationDuration: '3s' }}>✨</span>

          {/* Floating colorful musical notes */}
          <span className="absolute top-3 left-1/3 text-[#00D9FF] animate-bounce text-base font-extrabold" style={{ animationDuration: '2.2s' }}>♩</span>
          <span className="absolute top-10 right-1/4 text-[#FF5FC8] animate-pulse text-lg font-bold" style={{ animationDuration: '1.8s' }}>♪</span>
          <span className="absolute bottom-6 right-1/3 text-[#67FFD4] animate-bounce text-xl font-bold" style={{ animationDuration: '2.5s' }}>♫</span>
          <span className="absolute top-1/3 left-4 text-purple-400 animate-pulse text-lg" style={{ animationDuration: '2s' }}>♬</span>
          <span className="absolute bottom-8 left-12 text-cyan-300 animate-bounce text-lg" style={{ animationDuration: '3s' }}>🎵</span>
          <span className="absolute top-5 right-12 text-yellow-400 animate-pulse text-xl" style={{ animationDuration: '2.7s' }}>🎶</span>
        </div>

        {/* User requested custom photo with animated effects */}
        <div className="relative z-10 my-2">
          <div className="relative w-32 h-32 mx-auto rounded-3xl p-1 bg-gradient-to-tr from-[#00D9FF] via-[#67FFD4] to-[#FF5FC8] shadow-[0_0_25px_rgba(0,217,255,0.4)] animate-pulse">
            <div className="w-full h-full rounded-[22px] overflow-hidden bg-[#071122]">
              <img
                src="https://jambijohan0-cpu.github.io/Johan/img/J-Music.png"
                alt="J-Music Art"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Genre Chips Carousel */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-extrabold text-white tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00D9FF] shadow-[0_0_6px_#00D9FF]" />
            Genre & Kategori
          </h3>
          <span className="text-[11px] text-slate-400">Pilih untuk filter</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {genres.map((g) => (
            <button
              key={g.id}
              onClick={() => onSelectGenre(g.tag)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 bg-[#0B1C32]/80 hover:bg-cyan-950/80 text-slate-200 hover:text-[#00D9FF] border border-cyan-500/20 hover:border-cyan-500/50 transition-all active:scale-95 shadow-sm"
            >
              {g.name}
            </button>
          ))}
        </div>
      </section>

      {/* Trending Tracks Section */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#00D9FF] to-[#FF5FC8] shadow-[0_0_8px_#00D9FF]" />
            <h3 className="text-sm font-extrabold text-white tracking-wide">
              Sedang Trending
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
              Auto Trending (ID, US, KR, CN)
            </span>
            <button
              onClick={onRefresh}
              className="p-1 text-slate-400 hover:text-white"
              title="Segarkan"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          {trendingTracks.slice(0, 10).map((track, idx) => (
            <TrackCard
              key={`${track.id}-${idx}`}
              track={track}
              isCurrent={currentTrack?.id === track.id}
              isPlaying={isPlaying && currentTrack?.id === track.id}
              isFavorite={favorites.some((f) => f.id === track.id)}
              onPlay={onPlay}
              onToggleFavorite={onToggleFavorite}
              onOpenPlaylistModal={onOpenPlaylistModal}
              onOpenDownloadGate={onOpenDownloadGate}
            />
          ))}
        </div>
      </section>

      {/* Recommended Section */}
      {recommendedTracks.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-extrabold text-white tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#67FFD4] shadow-[0_0_6px_#67FFD4]" />
              Pilihan Khusus Untuk Anda
            </h3>
          </div>

          <div className="space-y-2.5">
            {recommendedTracks.map((track, idx) => (
              <TrackCard
                key={`rec-${track.id}-${idx}`}
                track={track}
                isCurrent={currentTrack?.id === track.id}
                isPlaying={isPlaying && currentTrack?.id === track.id}
                isFavorite={favorites.some((f) => f.id === track.id)}
                onPlay={onPlay}
                onToggleFavorite={onToggleFavorite}
                onOpenPlaylistModal={onOpenPlaylistModal}
                onOpenDownloadGate={onOpenDownloadGate}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
