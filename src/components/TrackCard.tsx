import React, { useState } from 'react';
import { Play, Pause, Heart, MoreVertical, Plus, Download, Share2, Disc3 } from 'lucide-react';
import { Track } from '../types/music.ts';
import { formatDuration } from '../utils/musicLogic.ts';

interface TrackCardProps {
  track: Track;
  isPlaying: boolean;
  isCurrent: boolean;
  isFavorite: boolean;
  onPlay: (track: Track) => void;
  onToggleFavorite: (track: Track) => void;
  onOpenPlaylistModal: (track: Track) => void;
  onOpenDownloadGate: (track: Track) => void;
}

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  isPlaying,
  isCurrent,
  isFavorite,
  onPlay,
  onToggleFavorite,
  onOpenPlaylistModal,
  onOpenDownloadGate,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleShare = async () => {
    setMenuOpen(false);
    const shareData = {
      title: `${track.name} - ${track.artist_name}`,
      text: `Dengarkan lagu "${track.name}" oleh ${track.artist_name} di J-Music Hub`,
      url: track.shorturl || window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(shareData.url);
      alert('Tautan lagu disalin ke clipboard!');
    }
  };

  return (
    <div
      className={`group relative flex items-center gap-3 p-2.5 rounded-2xl transition-all duration-200 border ${
        isCurrent
          ? 'bg-[#0B1C32]/90 border-cyan-400/40 shadow-[0_0_15px_rgba(0,217,255,0.15)] ring-1 ring-cyan-500/30'
          : 'bg-[#0B1C32]/60 hover:bg-[#0E223D]/70 border-slate-800/80 hover:border-slate-700/60'
      }`}
    >
      {/* Artwork with play overlay */}
      <div
        className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 cursor-pointer shadow-md bg-slate-800"
        onClick={() => onPlay(track)}
      >
        <img
          src={track.image}
          alt={track.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200';
          }}
        />

        {/* Play / Pause overlay */}
        <div
          className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${
            isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          {isCurrent && isPlaying ? (
            <div className="w-8 h-8 rounded-full bg-[#00D9FF] flex items-center justify-center text-black shadow-[0_0_10px_#00D9FF]">
              <Pause className="w-4 h-4 fill-current" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#00D9FF] flex items-center justify-center text-black shadow-[0_0_10px_#00D9FF]">
              <Play className="w-4 h-4 fill-current translate-x-0.5" />
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onPlay(track)}>
        <p
          className={`text-xs sm:text-sm font-bold truncate leading-tight transition-colors ${
            isCurrent ? 'text-[#00D9FF]' : 'text-white group-hover:text-cyan-200'
          }`}
        >
          {track.name}
        </p>
        <p className="text-[11px] text-slate-400 truncate mt-0.5">{track.artist_name}</p>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-slate-400 font-mono">
            {formatDuration(track.duration)}
          </span>
          {track.provider === 'audius' ? (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/40 font-semibold tracking-wide">
              Audius
            </span>
          ) : (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
              Jamendo
            </span>
          )}
          {track.genres && track.genres[0] && (
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-800 text-cyan-300/80 border border-slate-700 font-medium truncate max-w-[80px]">
              {track.genres[0]}
            </span>
          )}
          {track.audiodownload_allowed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDownloadGate(track);
              }}
              className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30 cursor-pointer font-medium transition-colors"
              title="Klik untuk Unduh File Resmi"
            >
              Unduh Aktif
            </button>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onToggleFavorite(track)}
          aria-label={isFavorite ? `Hapus ${track.name} dari favorit` : `Tambah ${track.name} ke favorit`}
          className={`p-2 rounded-xl transition-all ${
            isFavorite
              ? 'text-[#FF5FC8] hover:text-pink-400 drop-shadow-[0_0_6px_rgba(255,95,200,0.6)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Opsi lainnya"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 z-30 w-44 py-1.5 rounded-xl bg-[#071122] border border-cyan-500/30 shadow-xl backdrop-blur-xl animate-fade-in text-xs">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenPlaylistModal(track);
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2 text-left text-slate-200 hover:bg-slate-800 hover:text-[#00D9FF]"
                >
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Simpan ke Playlist</span>
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenDownloadGate(track);
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2 text-left text-slate-200 hover:bg-slate-800 hover:text-[#67FFD4]"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Unduh & Lisensi CC</span>
                </button>

                <button
                  onClick={handleShare}
                  className="w-full px-3 py-2 flex items-center gap-2 text-left text-slate-200 hover:bg-slate-800 hover:text-[#FF5FC8]"
                >
                  <Share2 className="w-3.5 h-3.5 text-pink-400" />
                  <span>Bagikan Tautan</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
