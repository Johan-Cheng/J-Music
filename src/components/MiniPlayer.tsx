import React from 'react';
import { Play, Pause, SkipForward, Maximize2, AlertCircle } from 'lucide-react';
import { Track } from '../types/music.ts';

interface MiniPlayerProps {
  track: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  progressPercent: number;
  onTogglePlay: () => void;
  onNext: () => void;
  onOpenFullPlayer: () => void;
  onRetry?: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  track,
  isPlaying,
  isLoading,
  hasError,
  progressPercent,
  onTogglePlay,
  onNext,
  onOpenFullPlayer,
  onRetry,
}) => {
  if (!track) return null;

  return (
    <div
      className="fixed bottom-[64px] left-0 right-0 z-40 px-3 pb-1"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 4px)' }}
    >
      <div
        className="max-w-md mx-auto relative rounded-2xl bg-[#0B1C32]/95 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_20px_rgba(0,217,255,0.2)] overflow-hidden cursor-pointer"
        onClick={onOpenFullPlayer}
      >
        {/* Progress bar line at top */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-[#00D9FF] to-[#67FFD4] transition-all duration-200"
            style={{ width: `${Math.min(Math.max(progressPercent, 0), 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between p-2.5 gap-3">
          {/* Cover & Title */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-cyan-500/30">
              <img
                src={track.image}
                alt={track.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150';
                }}
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-cyan-500/20 animate-pulse pointer-events-none" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate leading-tight">
                {track.name}
              </p>
              <p className="text-[10px] text-cyan-300/80 truncate">
                {track.artist_name}
              </p>
            </div>
          </div>

          {/* Equalizer animation mini indicator */}
          {isPlaying && (
            <div className="hidden sm:flex items-end gap-[2px] h-3 px-1">
              <span className="w-0.5 bg-[#00D9FF] rounded-full animate-bounce h-2" />
              <span className="w-0.5 bg-[#67FFD4] rounded-full animate-bounce h-3" style={{ animationDelay: '100ms' }} />
              <span className="w-0.5 bg-[#FF5FC8] rounded-full animate-bounce h-1.5" style={{ animationDelay: '200ms' }} />
            </div>
          )}

          {/* Controls */}
          <div
            className="flex items-center gap-1.5 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {hasError ? (
              <button
                onClick={onRetry}
                className="px-2 py-1 text-[10px] rounded-lg bg-rose-950 text-rose-300 border border-rose-500/40 flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3" /> Coba Lagi
              </button>
            ) : (
              <button
                onClick={onTogglePlay}
                aria-label={isPlaying ? 'Jeda Musik' : 'Putar Musik'}
                disabled={isLoading}
                className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#00D9FF] to-[#67FFD4] text-slate-950 flex items-center justify-center font-bold shadow-[0_0_10px_rgba(0,217,255,0.4)] active:scale-90 transition-transform"
              >
                {isLoading ? (
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current translate-x-0.5" />
                )}
              </button>
            )}

            <button
              onClick={onNext}
              aria-label="Lagu Berikutnya"
              className="w-8 h-8 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white flex items-center justify-center active:scale-95 transition-all"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenFullPlayer}
              aria-label="Perbesar Pemutar Musik"
              className="w-8 h-8 rounded-xl bg-slate-800/40 text-slate-400 hover:text-cyan-400 flex items-center justify-center"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
