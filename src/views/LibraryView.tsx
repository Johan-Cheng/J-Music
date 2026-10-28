import React, { useState } from 'react';
import { Heart, ListMusic, History, Plus, Play, Trash2, Folder, Disc } from 'lucide-react';
import { Track, Playlist } from '../types/music.ts';
import { TrackCard } from '../components/TrackCard.tsx';

interface LibraryViewProps {
  favorites: Track[];
  playlists: Playlist[];
  recentTracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlay: (track: Track) => void;
  onPlayAll: (tracks: Track[]) => void;
  onToggleFavorite: (track: Track) => void;
  onOpenPlaylistModal: (track: Track | null) => void;
  onOpenDownloadGate: (track: Track) => void;
  onDeletePlaylist: (playlistId: string) => void;
  onRemoveFromPlaylist: (playlistId: string, trackId: string) => void;
  onClearRecent: () => void;
}

type LibraryTab = 'favorites' | 'playlists' | 'recent';

export const LibraryView: React.FC<LibraryViewProps> = ({
  favorites,
  playlists,
  recentTracks,
  currentTrack,
  isPlaying,
  onPlay,
  onPlayAll,
  onToggleFavorite,
  onOpenPlaylistModal,
  onOpenDownloadGate,
  onDeletePlaylist,
  onRemoveFromPlaylist,
  onClearRecent,
}) => {
  const [tab, setTab] = useState<LibraryTab>('favorites');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  // If a playlist is selected for detail view
  if (selectedPlaylist) {
    const freshPl = playlists.find((p) => p.id === selectedPlaylist.id) || selectedPlaylist;

    return (
      <div className="space-y-4 pb-28 animate-fade-in">
        {/* Back and playlist header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedPlaylist(null)}
            className="text-xs font-semibold text-[#00D9FF] hover:underline flex items-center gap-1"
          >
            ← Kembali ke Semua Playlist
          </button>

          <button
            onClick={() => {
              if (confirm(`Hapus playlist "${freshPl.name}"?`)) {
                onDeletePlaylist(freshPl.id);
                setSelectedPlaylist(null);
              }
            }}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Hapus Playlist
          </button>
        </div>

        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0B1C32] to-[#071122] border border-cyan-500/25">
          <div className="flex items-center gap-3.5">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-[#00D9FF] shadow-[0_0_15px_rgba(0,217,255,0.25)]">
              <Folder className="w-8 h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-extrabold text-white truncate">{freshPl.name}</h2>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {freshPl.description || 'Koleksi playlist pribadi'}
              </p>
              <p className="text-[11px] text-cyan-400 font-mono mt-1">
                {freshPl.tracks.length} trek lagu
              </p>
            </div>
          </div>

          {freshPl.tracks.length > 0 && (
            <button
              onClick={() => onPlayAll(freshPl.tracks)}
              className="mt-4 w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#00D9FF] to-[#67FFD4] text-slate-950 flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(0,217,255,0.3)] active:scale-98"
            >
              <Play className="w-4 h-4 fill-current" /> Putar Semua Lagu
            </button>
          )}
        </div>

        {/* Tracks in playlist */}
        <div className="space-y-2">
          {freshPl.tracks.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Belum ada lagu dalam playlist ini. Tambahkan lagu dari hasil pencarian atau halaman utama.
            </div>
          ) : (
            freshPl.tracks.map((track) => (
              <div key={track.id} className="relative group">
                <TrackCard
                  track={track}
                  isPlaying={isPlaying && currentTrack?.id === track.id}
                  isCurrent={currentTrack?.id === track.id}
                  isFavorite={favorites.some((f) => f.id === track.id)}
                  onPlay={onPlay}
                  onToggleFavorite={onToggleFavorite}
                  onOpenPlaylistModal={() => onOpenPlaylistModal(track)}
                  onOpenDownloadGate={onOpenDownloadGate}
                />
                <button
                  onClick={() => onRemoveFromPlaylist(freshPl.id, track.id)}
                  aria-label={`Hapus ${track.name} dari playlist`}
                  className="absolute right-12 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Keluarkan dari playlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-28 animate-fade-in">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0B1C32] border border-cyan-500/20">
        <button
          onClick={() => setTab('favorites')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            tab === 'favorites'
              ? 'bg-[#00D9FF] text-slate-950 shadow-[0_0_10px_rgba(0,217,255,0.4)]'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Favorit ({favorites.length})</span>
        </button>

        <button
          onClick={() => setTab('playlists')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            tab === 'playlists'
              ? 'bg-[#00D9FF] text-slate-950 shadow-[0_0_10px_rgba(0,217,255,0.4)]'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <ListMusic className="w-3.5 h-3.5" />
          <span>Playlist ({playlists.length})</span>
        </button>

        <button
          onClick={() => setTab('recent')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            tab === 'recent'
              ? 'bg-[#00D9FF] text-slate-950 shadow-[0_0_10px_rgba(0,217,255,0.4)]'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Riwayat ({recentTracks.length})</span>
        </button>
      </div>

      {/* Tab 1: Favorites */}
      {tab === 'favorites' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-slate-400">
              Lagu yang kamu beri tanda suka tersimpan di sini
            </p>
            {favorites.length > 0 && (
              <button
                onClick={() => onPlayAll(favorites)}
                className="text-xs font-bold text-[#67FFD4] hover:underline flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-current" /> Putar Semua
              </button>
            )}
          </div>

          {favorites.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-3xl bg-[#0B1C32]/40 border border-slate-800">
              <Heart className="w-12 h-12 mx-auto mb-2 text-slate-600" />
              <p className="text-xs font-semibold text-white">Belum ada lagu favorit</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Ketuk ikon hati pada lagu manapun untuk menyimpannya ke koleksi.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {favorites.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  isPlaying={isPlaying && currentTrack?.id === track.id}
                  isCurrent={currentTrack?.id === track.id}
                  isFavorite={true}
                  onPlay={onPlay}
                  onToggleFavorite={onToggleFavorite}
                  onOpenPlaylistModal={() => onOpenPlaylistModal(track)}
                  onOpenDownloadGate={onOpenDownloadGate}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Playlists */}
      {tab === 'playlists' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-slate-400">Atur lagu sesuai mood dan aktivitasmu</p>
            <button
              onClick={() => onOpenPlaylistModal(null)}
              className="text-xs font-bold text-[#00D9FF] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Buat Baru
            </button>
          </div>

          <div className="space-y-2.5">
            {playlists.map((pl) => (
              <div
                key={pl.id}
                onClick={() => setSelectedPlaylist(pl)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0B1C32]/70 hover:bg-[#0E223D] border border-cyan-500/20 cursor-pointer transition-all active:scale-98"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600/40 to-purple-600/40 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shrink-0">
                    <Disc className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{pl.name}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {pl.tracks.length} lagu {pl.description ? `• ${pl.description}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-cyan-400 font-semibold">Buka →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Recent History */}
      {tab === 'recent' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-slate-400">Lagu yang baru saja kamu dengarkan</p>
            {recentTracks.length > 0 && (
              <button
                onClick={onClearRecent}
                className="text-xs text-rose-400 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Bersihkan
              </button>
            )}
          </div>

          {recentTracks.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-3xl bg-[#0B1C32]/40 border border-slate-800">
              <History className="w-12 h-12 mx-auto mb-2 text-slate-600" />
              <p className="text-xs font-semibold text-white">Belum ada riwayat putar</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Lagu yang kamu putar akan muncul di sini secara otomatis.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTracks.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  isPlaying={isPlaying && currentTrack?.id === track.id}
                  isCurrent={currentTrack?.id === track.id}
                  isFavorite={favorites.some((f) => f.id === track.id)}
                  onPlay={onPlay}
                  onToggleFavorite={onToggleFavorite}
                  onOpenPlaylistModal={() => onOpenPlaylistModal(track)}
                  onOpenDownloadGate={onOpenDownloadGate}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
