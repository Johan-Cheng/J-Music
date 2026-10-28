import React, { useState } from 'react';
import { X, Plus, FolderPlus, Check, Trash2, Edit2 } from 'lucide-react';
import { Track, Playlist } from '../types/music.ts';
import { validatePlaylistName } from '../utils/musicLogic.ts';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackToAdd: Track | null;
  playlists: Playlist[];
  onCreatePlaylist: (name: string, description: string) => void;
  onAddToPlaylist: (playlistId: string, track: Track) => void;
  onDeletePlaylist?: (playlistId: string) => void;
  onRenamePlaylist?: (playlistId: string, newName: string) => void;
}

export const PlaylistModal: React.FC<PlaylistModalProps> = ({
  isOpen,
  onClose,
  trackToAdd,
  playlists,
  onCreatePlaylist,
  onAddToPlaylist,
  onDeletePlaylist,
  onRenamePlaylist,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Rename state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validatePlaylistName(newTitle);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Nama playlist tidak valid');
      return;
    }

    onCreatePlaylist(newTitle, newDesc);
    setNewTitle('');
    setNewDesc('');
    setErrorMessage('');
    setIsCreating(false);
    setFeedback('Playlist berhasil dibuat!');
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleAdd = (playlist: Playlist) => {
    if (!trackToAdd) return;
    onAddToPlaylist(playlist.id, trackToAdd);
    setFeedback(`Ditambahkan ke "${playlist.name}"`);
    setTimeout(() => {
      setFeedback(null);
      onClose();
    }, 1200);
  };

  const handleSaveRename = (id: string) => {
    const val = validatePlaylistName(editName);
    if (!val.valid) return;
    if (onRenamePlaylist) {
      onRenamePlaylist(id, editName);
    }
    setEditingId(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="playlist-modal-title"
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div
        className="relative w-full max-w-md bg-[#0B1C32] border border-cyan-500/30 rounded-t-3xl sm:rounded-3xl p-5 shadow-[0_0_35px_rgba(0,217,255,0.2)] text-slate-100 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-[#00D9FF]">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 id="playlist-modal-title" className="text-base font-bold text-white">
                {trackToAdd ? 'Simpan ke Playlist' : 'Kelola Playlist'}
              </h2>
              {trackToAdd && (
                <p className="text-xs text-cyan-400/80 truncate max-w-[200px]">
                  {trackToAdd.name}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup jendela playlist"
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Create form or button */}
        <div className="my-3">
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs bg-cyan-500/15 hover:bg-cyan-500/25 text-[#00D9FF] border border-cyan-500/40 flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              Buat Playlist Baru
            </button>
          ) : (
            <form onSubmit={handleCreate} className="p-3.5 rounded-2xl bg-slate-900/70 border border-cyan-500/30 space-y-2.5">
              <label htmlFor="new-playlist-input" className="block text-xs font-semibold text-cyan-300">
                Nama Playlist Baru
              </label>
              <input
                id="new-playlist-input"
                type="text"
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="Contoh: Malam Syahdu / Synth Chill"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800/90 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                autoFocus
              />
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Deskripsi singkat (opsional)"
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-800/90 border border-slate-700 text-slate-300 focus:outline-none focus:border-cyan-400"
              />
              {errorMessage && (
                <p className="text-[11px] text-rose-400 font-medium">{errorMessage}</p>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold rounded-xl bg-[#00D9FF] text-slate-950 hover:brightness-110"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-2 text-xs rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Batal
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Playlist list */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar">
          {playlists.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Belum ada playlist buatan sendiri. Ketuk tombol di atas untuk membuat.
            </div>
          ) : (
            playlists.map((pl) => {
              const hasTrack = trackToAdd && pl.tracks.some((t) => t.id === trackToAdd.id);
              const isRenaming = editingId === pl.id;

              return (
                <div
                  key={pl.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/50 hover:bg-slate-800/60 border border-slate-800 transition-colors"
                >
                  {isRenaming ? (
                    <div className="flex items-center gap-2 flex-1 mr-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-2 py-1 text-xs rounded bg-slate-800 border border-cyan-500 text-white"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveRename(pl.id)}
                        className="px-2 py-1 text-xs bg-cyan-500 text-black font-semibold rounded"
                      >
                        OK
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => trackToAdd && handleAdd(pl)}
                    >
                      <p className="text-xs font-semibold text-white truncate hover:text-cyan-300">
                        {pl.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {pl.tracks.length} lagu {pl.description ? `• ${pl.description}` : ''}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    {trackToAdd && !hasTrack && (
                      <button
                        onClick={() => handleAdd(pl)}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-black transition-all"
                      >
                        Pilih
                      </button>
                    )}
                    {hasTrack && (
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium px-2 py-1">
                        <Check className="w-3 h-3" /> Ada
                      </span>
                    )}

                    {!trackToAdd && !isRenaming && (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(pl.id);
                            setEditName(pl.name);
                          }}
                          aria-label={`Ubah nama playlist ${pl.name}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {onDeletePlaylist && (
                          <button
                            onClick={() => {
                              if (confirm(`Hapus playlist "${pl.name}"?`)) {
                                onDeletePlaylist(pl.id);
                              }
                            }}
                            aria-label={`Hapus playlist ${pl.name}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
