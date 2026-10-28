import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Volume2,
  VolumeX,
  ListMusic,
  Download,
  Share2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Track } from '../types/music.ts';
import { formatDuration } from '../utils/musicLogic.ts';

interface FullPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  isFavorite: boolean;
  queue: Track[];
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onVolumeChange: (volume: number) => void;
  onToggleFavorite: (track: Track) => void;
  onSelectQueueTrack: (track: Track) => void;
  onOpenDownloadGate: (track: Track) => void;
}

export const FullPlayerModal: React.FC<FullPlayerModalProps> = ({
  isOpen,
  onClose,
  track,
  isPlaying,
  isLoading,
  currentTime,
  duration,
  volume,
  isShuffle,
  repeatMode,
  isFavorite,
  queue,
  onTogglePlay,
  onSeek,
  onNext,
  onPrev,
  onToggleShuffle,
  onToggleRepeat,
  onVolumeChange,
  onToggleFavorite,
  onSelectQueueTrack,
  onOpenDownloadGate,
}) => {
  const [showQueue, setShowQueue] = useState(false);
  const visualizerCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Audio spectrum simulation on canvas
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const canvas = visualizerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const barCount = 28;
    const heights = new Array(barCount).fill(4);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        // Dynamic pulsating frequency bars based on audio time
        const target = Math.sin(Date.now() * 0.006 + i * 0.4) * 0.5 + 0.5;
        const randomness = Math.sin(Date.now() * 0.012 + i * 1.2) * 0.3;
        const norm = Math.max(0.1, Math.min(1, target + randomness));
        heights[i] += (norm * canvas.height * 0.85 - heights[i]) * 0.25;

        const x = i * (barWidth + 2);
        const y = canvas.height - heights[i];

        // Gradient from cyan to mint to pink
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#00D9FF');
        gradient.addColorStop(0.5, '#67FFD4');
        gradient.addColorStop(1, '#FF5FC8');

        ctx.fillStyle = gradient;
        ctx.shadowColor = '#00D9FF';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, heights[i], [3, 3, 0, 0]);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, isPlaying]);

  if (!isOpen || !track) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleShare = async () => {
    const shareData = {
      title: `${track.name} - ${track.artist_name}`,
      text: `Dengarkan lagu "${track.name}" di J-Music Hub`,
      url: track.shorturl || window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareData.url);
      alert('Tautan lagu disalin ke clipboard!');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-title"
      className="fixed inset-0 z-[60] flex flex-col justify-between bg-[#071122]/98 backdrop-blur-2xl text-slate-100 overflow-y-auto no-scrollbar animate-slide-up pb-8"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2 max-w-md mx-auto w-full">
        <button
          onClick={onClose}
          aria-label="Tutup pemutar penuh"
          className="w-10 h-10 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 flex items-center justify-center text-slate-300 active:scale-95 transition-all"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
            Sedang Diputar
          </p>
          <p className="text-xs text-slate-400 font-medium">J-Music Neon Hub</p>
        </div>

        <button
          onClick={() => setShowQueue(!showQueue)}
          aria-label="Buka antrean lagu"
          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
            showQueue
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(0,217,255,0.5)]'
              : 'bg-slate-800/80 text-slate-300 hover:text-white'
          }`}
        >
          <ListMusic className="w-5 h-5" />
        </button>
      </div>

      {/* Main Body */}
      <div className="max-w-md mx-auto w-full px-6 py-4 flex-1 flex flex-col justify-around">
        {showQueue ? (
          /* Queue Drawer */
          <div className="flex-1 max-h-[380px] overflow-y-auto no-scrollbar space-y-2 py-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
              Daftar Antrean ({queue.length} Lagu)
            </h3>
            {queue.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                onClick={() => {
                  onSelectQueueTrack(item);
                  setShowQueue(false);
                }}
                className={`flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer border transition-colors ${
                  item.id === track.id
                    ? 'bg-cyan-950/60 border-cyan-400/40 text-cyan-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="text-xs font-mono text-slate-400 w-5 text-center">
                  {idx + 1}
                </span>
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-10 h-10 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{item.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{item.artist_name}</p>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {formatDuration(item.duration)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          /* Normal View: Artwork, visualizer & title */
          <div className="flex flex-col items-center">
            {/* Glowing Neon Vinyl Orb Artwork */}
            <div className="relative my-4">
              <div
                className={`relative w-64 h-64 sm:w-72 sm:h-72 rounded-full p-2 bg-gradient-to-tr from-cyan-500 via-[#0B1C32] to-[#FF5FC8] shadow-[0_0_35px_rgba(0,217,255,0.3)] transition-all ${
                  isPlaying ? 'rotate-slow' : ''
                }`}
              >
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-cyan-400/30 relative">
                  <img
                    src={track.image}
                    alt={track.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500';
                    }}
                  />
                  {/* Center vinyl pin */}
                  <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-[#071122] border-2 border-cyan-400 flex items-center justify-center shadow-inner">
                    <div className="w-3.5 h-3.5 rounded-full bg-cyan-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Canvas Frequency Visualizer */}
            <div className="w-full max-w-xs h-10 my-2">
              <canvas
                ref={visualizerCanvasRef}
                width={260}
                height={40}
                className="w-full h-full opacity-80"
              />
            </div>

            {/* Track Info */}
            <div className="w-full flex items-center justify-between mt-2">
              <div className="flex-1 min-w-0 pr-3">
                <h2 id="player-title" className="text-lg sm:text-xl font-extrabold text-white truncate">
                  {track.name}
                </h2>
                <p className="text-sm text-cyan-300 font-semibold truncate mt-0.5">
                  {track.artist_name}
                </p>
                {track.album_name && (
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    Album: {track.album_name}
                  </p>
                )}
              </div>

              <button
                onClick={() => onToggleFavorite(track)}
                aria-label={isFavorite ? 'Hapus favorit' : 'Tambah favorit'}
                className={`p-3 rounded-2xl bg-slate-800/80 transition-all ${
                  isFavorite
                    ? 'text-[#FF5FC8] shadow-[0_0_12px_rgba(255,95,200,0.5)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        )}

        {/* Progress Seeker */}
        <div className="w-full my-4">
          <div className="relative flex items-center group">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => onSeek(Number(e.target.value))}
              className="w-full h-2 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-[#00D9FF] focus:outline-none"
            />
          </div>
          <div className="flex justify-between text-xs font-mono text-slate-400 mt-1">
            <span>{formatDuration(currentTime)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between w-full px-2">
          <button
            onClick={onToggleShuffle}
            aria-label="Acak antrean lagu"
            className={`p-2.5 rounded-xl transition-colors ${
              isShuffle ? 'text-[#00D9FF] bg-cyan-950/60' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={onPrev}
            aria-label="Lagu sebelumnya"
            className="p-3 rounded-2xl text-slate-200 hover:text-white active:scale-90 transition-transform"
          >
            <SkipBack className="w-6 h-6" />
          </button>

          {/* Primary Play Button */}
          <button
            onClick={onTogglePlay}
            aria-label={isPlaying ? 'Jeda' : 'Putar'}
            disabled={isLoading}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#00D9FF] via-[#67FFD4] to-[#00D9FF] text-slate-950 flex items-center justify-center font-black shadow-[0_0_25px_rgba(0,217,255,0.6)] active:scale-90 hover:scale-105 transition-all"
          >
            {isLoading ? (
              <span className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current translate-x-0.5" />
            )}
          </button>

          <button
            onClick={onNext}
            aria-label="Lagu berikutnya"
            className="p-3 rounded-2xl text-slate-200 hover:text-white active:scale-90 transition-transform"
          >
            <SkipForward className="w-6 h-6" />
          </button>

          <button
            onClick={onToggleRepeat}
            aria-label="Ulang lagu"
            className={`p-2.5 rounded-xl transition-colors ${
              repeatMode !== 'off'
                ? 'text-[#00D9FF] bg-cyan-950/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-5 h-5 text-[#67FFD4]" />
            ) : (
              <Repeat className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-3 w-full px-2 my-2">
          <button
            onClick={() => onVolumeChange(volume > 0 ? 0 : 0.8)}
            aria-label={volume === 0 ? 'Bunyikan suara' : 'Bisukan suara'}
            className="text-slate-400 hover:text-slate-200"
          >
            {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="w-full h-1.5 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-[#67FFD4] focus:outline-none"
          />
        </div>

        {/* Footer actions: Download gate, Share, Jamendo attribution */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => onOpenDownloadGate(track)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 font-medium"
          >
            <Download className="w-3.5 h-3.5 text-[#00D9FF]" />
            <span>Unduh / Lisensi</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 font-medium"
          >
            <Share2 className="w-3.5 h-3.5 text-pink-400" />
            <span>Bagikan</span>
          </button>

          <a
            href={track.shorturl || `https://audius.co/tracks/${track.id}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-400"
          >
            <span>{track.provider === 'audius' ? 'Audius' : 'Jamendo'}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
