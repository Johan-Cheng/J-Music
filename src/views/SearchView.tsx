import React, { useState, useEffect, useCallback } from 'react';
import { Search as SearchIcon, X, RotateCcw, Music, DownloadCloud, Sparkles } from 'lucide-react';
import { Track } from '../types/music.ts';
import { TrackCard } from '../components/TrackCard.tsx';
import { searchTracks } from '../services/jamendoApi.ts';

interface SearchViewProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  favorites: Track[];
  initialGenre?: string;
  onPlay: (track: Track) => void;
  onToggleFavorite: (track: Track) => void;
  onOpenPlaylistModal: (track: Track) => void;
  onOpenDownloadGate: (track: Track) => void;
}

const FILTER_TAGS = [
  { label: 'Semua', value: 'all' },
  { label: 'EDM / Dance', value: 'Electronic' },
  { label: 'Chill & Lo-Fi', value: 'Chill' },
  { label: 'Indonesia', value: 'indonesia' },
  { label: 'Barat / Pop', value: 'Pop' },
  { label: 'Jazz', value: 'Jazz' },
  { label: 'Rock', value: 'Rock' },
  { label: 'Rohani / Worship', value: 'Worship' },
  { label: 'Mandarin', value: 'mandarin' },
  { label: 'Instrumental', value: 'Instrumental' },
  { label: 'Hip-Hop', value: 'Hip-Hop' },
];

const SORT_OPTIONS = [
  { label: 'Paling Relevan', value: 'relevance' },
  { label: 'Populer / Play Count', value: 'plays' },
  { label: 'Durasi Terpendek', value: 'duration_asc' },
  { label: 'Durasi Terpanjang', value: 'duration_desc' },
  { label: 'Judul (A-Z)', value: 'title_asc' },
];

export const SearchView: React.FC<SearchViewProps> = ({
  currentTrack,
  isPlaying,
  favorites,
  initialGenre = 'all',
  onPlay,
  onToggleFavorite,
  onOpenPlaylistModal,
  onOpenDownloadGate,
}) => {
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(initialGenre);
  const [downloadableOnly, setDownloadableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [results, setResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialGenre) {
      setSelectedTag(initialGenre);
    }
  }, [initialGenre]);

  const performSearch = useCallback(
    async (q: string, tag: string, downloadable: boolean) => {
      setIsLoading(true);
      setHasSearched(true);
      try {
        const tracks = await searchTracks(q, tag, 28, 0, downloadable);
        setResults(tracks);
      } catch (err) {
        console.warn('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Debounced search (350-400ms per PDF)
  useEffect(() => {
    const handler = setTimeout(() => {
      performSearch(query, selectedTag, downloadableOnly);
    }, 400);

    return () => clearTimeout(handler);
  }, [query, selectedTag, downloadableOnly, performSearch]);

  const handleResetFilters = () => {
    setQuery('');
    setSelectedTag('all');
    setDownloadableOnly(false);
    setSortBy('relevance');
  };

  // Client-side sort
  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === 'plays') return (b.play_count || 0) - (a.play_count || 0);
    if (sortBy === 'duration_asc') return a.duration - b.duration;
    if (sortBy === 'duration_desc') return b.duration - a.duration;
    if (sortBy === 'title_asc') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div className="space-y-4 pb-28 animate-fade-in">
      {/* Permanent thumb-friendly search bar */}
      <div className="sticky top-14 z-30 pt-1 pb-2 bg-[#071122]/90 backdrop-blur-md space-y-2">
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-slate-400">
            <SearchIcon className="w-4 h-4 text-[#00D9FF]" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari lagu di Audius (artis, judul, genre)..."
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#0B1C32] border border-cyan-500/30 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,217,255,0.25)] transition-all"
            autoFocus={false}
          />

          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Hapus kata kunci"
              className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills with Downloadable filter per addendum page 3 */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {/* Downloadable toggle pill */}
          <button
            onClick={() => setDownloadableOnly(!downloadableOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all ${
              downloadableOnly
                ? 'bg-[#67FFD4] text-slate-950 font-bold shadow-[0_0_10px_rgba(103,255,212,0.4)]'
                : 'bg-[#0B1C32]/80 text-emerald-300 hover:bg-emerald-950/40 border border-emerald-500/40'
            }`}
          >
            <DownloadCloud className="w-3.5 h-3.5" />
            <span>Bisa Diunduh</span>
          </button>

          {FILTER_TAGS.map((tag) => {
            const active = selectedTag === tag.value;
            return (
              <button
                key={tag.value}
                onClick={() => setSelectedTag(tag.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  active
                    ? 'bg-[#00D9FF] text-slate-950 shadow-[0_0_10px_rgba(0,217,255,0.4)]'
                    : 'bg-[#0B1C32]/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {tag.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort & Status bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div className="flex items-center gap-1.5">
          <span>{sortedResults.length} track ditemukan</span>
          {(query || selectedTag !== 'all' || downloadableOnly) && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-[#00D9FF] hover:underline font-medium text-[11px]"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <label htmlFor="search-sort-select" className="text-[11px] text-slate-400">Urutkan:</label>
          <select
            id="search-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#0B1C32] text-xs text-slate-300 border border-slate-700 rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-400"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Results */}
      {isLoading ? (
        <div className="space-y-2.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-16 rounded-2xl bg-[#0B1C32]/60 animate-pulse border border-slate-800"
            />
          ))}
        </div>
      ) : sortedResults.length > 0 ? (
        <div className="space-y-2">
          {sortedResults.map((track) => (
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
      ) : hasSearched ? (
        /* Empty State as explicitly required by PDF page 5: "Belum ditemukan di Audius" */
        <div className="text-center py-16 px-4 rounded-3xl bg-[#0B1C32]/40 border border-slate-800">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-[#00D9FF]">
            <Music className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Belum ditemukan di Audius</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Tidak ada track yang cocok dengan kriteria pencarian ini. Coba kata kunci lain, ganti genre, atau nonaktifkan filter unduhan.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-black transition-all"
          >
            Lihat Semua Koleksi Audius
          </button>
        </div>
      ) : null}
    </div>
  );
};
