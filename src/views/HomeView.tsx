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
      {/* Hero Banner with Neon Techno Light styling */}
      <section className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#0B1C32] via-[#071122] to-[#120f2e] border border-cyan-500/25 shadow-[0_0_25px_rgba(0,217,255,0.15)]">
        {/* Glow backdrop spots */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#FF5FC8]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-bold text-[#00D9FF] mb-3">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>AUDIUS DEFAULT • NEON MUSIC HUB</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
            Eksplorasi Musik Legal & <span className="text-[#00D9FF]">Futuristik</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-sm leading-relaxed">
            Streaming resmi via Audius API sebagai provider utama dan fallback Jamendo. Simpan playlist, unduh lagu yang diizinkan kreator.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 mt-4">
            <button
              onClick={() => onPlayAll(trendingTracks)}
              disabled={trendingTracks.length === 0}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#00D9FF] to-[#67FFD4] text-slate-950 hover:brightness-110 flex items-center gap-2 shadow-[0_0_15px_rgba(0,217,255,0.4)] active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Putar Semua Trending</span>
            </button>

            <button
              onClick={onRefresh}
              aria-label="Segarkan lagu"
              className="px-3 py-2.5 rounded-xl text-xs bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 flex items-center gap-1.5 border border-slate-700/60 active:scale-95 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Segarkan</span>
            </button>
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

      {/* Trending Tracks List */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-extrabold text-white tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF5FC8] shadow-[0_0_6px_#FF5FC8]" />
            Sedang Trending
          </h3>
          <span className="text-[11px] text-[#00D9FF] font-medium">Audius API (Default)</span>
        </div>

        {isLoading && trendingTracks.length === 0 ? (
          <div className="space-y-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-16 rounded-2xl bg-slate-800/40 animate-pulse border border-slate-800"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {trendingTracks.slice(0, 6).map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                isPlaying={isPlaying && currentTrack?.id === track.id}
                isCurrent={currentTrack?.id === track.id}
                isFavorite={favorites.some((f) => f.id === track.id)}
                onPlay={onPlay}
                onToggleFavorite={onToggleFavorite}
                onOpenPlaylistModal={onOpenPlaylistModal}
                onOpenDownloadGate={onOpenDownloadGate}
              />
            ))}
          </div>
        )}
      </section>

      {/* Recommended for You */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-extrabold text-white tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#67FFD4] shadow-[0_0_6px_#67FFD4]" />
            Rekomendasi Pilihan
          </h3>
          <span className="text-[11px] text-slate-400">Chill & Techno</span>
        </div>

        <div className="space-y-2">
          {recommendedTracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              isPlaying={isPlaying && currentTrack?.id === track.id}
              isCurrent={currentTrack?.id === track.id}
              isFavorite={favorites.some((f) => f.id === track.id)}
              onPlay={onPlay}
              onToggleFavorite={onToggleFavorite}
              onOpenPlaylistModal={onOpenPlaylistModal}
              onOpenDownloadGate={onOpenDownloadGate}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
