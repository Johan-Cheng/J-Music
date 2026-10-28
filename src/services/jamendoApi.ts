import { Track, GenreCategory } from '../types/music.ts';
import { getAudiusTrendingTracks, searchAudiusTracks } from './musicSearch.ts';
import { FALLBACK_TRACKS, AUDIUS_DEFAULT_TRACKS } from './jamendoFallback.ts';
import { filterTracks } from '../utils/musicLogic.ts';

const API_BASE = '/api/music';

/**
 * Fetch trending tracks: AUDIUS is DEFAULT primary provider
 */
export async function fetchTrendingTracks(): Promise<Track[]> {
  try {
    const audiusTracks = await getAudiusTrendingTracks(25);
    if (audiusTracks && audiusTracks.length > 0) {
      return audiusTracks;
    }
  } catch (err) {
    console.warn('[musicApi] Audius trending error, checking fallback:', err);
  }

  // Secondary fallback to server trending proxy
  try {
    const res = await fetch(`${API_BASE}/trending?provider=audius`);
    if (res.ok) {
      const data = await res.json();
      if (data.tracks && Array.isArray(data.tracks) && data.tracks.length > 0) {
        return data.tracks;
      }
    }
  } catch (err) {
    console.warn('[musicApi] Server trending fallback failed:', err);
  }

  return AUDIUS_DEFAULT_TRACKS;
}

/**
 * Search tracks: AUDIUS is DEFAULT primary provider
 */
export async function searchTracks(
  query: string,
  genre?: string,
  limit = 25,
  offset = 0,
  downloadableOnly = false
): Promise<Track[]> {
  try {
    const audiusResults = await searchAudiusTracks(query, downloadableOnly, genre, limit, offset);
    if (audiusResults && audiusResults.length > 0) {
      return audiusResults;
    }
  } catch (err) {
    console.warn('[musicApi] Audius search failed, checking secondary:', err);
  }

  // Secondary fallback: query server proxy (Jamendo or cached seed)
  try {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (genre && genre !== 'all') params.append('genre', genre);
    params.append('limit', String(limit));
    params.append('offset', String(offset));
    params.append('provider', 'secondary');

    const res = await fetch(`${API_BASE}/search?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.tracks && Array.isArray(data.tracks) && data.tracks.length > 0) {
        return data.tracks;
      }
    }
  } catch {
    // ignore
  }

  return filterTracks(FALLBACK_TRACKS, query, genre);
}

export async function fetchTrackById(id: string): Promise<Track | null> {
  try {
    const res = await fetch(`${API_BASE}/track/${id}`);
    if (res.ok) {
      const data = await res.json();
      return data.track || null;
    }
  } catch (err) {
    console.warn('[musicApi] Track fetch failed:', err);
  }
  return FALLBACK_TRACKS.find((t) => t.id === id) || null;
}

export async function fetchGenres(): Promise<GenreCategory[]> {
  try {
    const res = await fetch(`${API_BASE}/genres`);
    if (res.ok) {
      const data = await res.json();
      return data.genres || [];
    }
  } catch {
    // fallback
  }

  return [
    { id: 'all', name: 'Semua', tag: 'all', color: '#00D9FF', gradient: 'from-cyan-500 to-blue-600' },
    { id: 'edm', name: 'EDM / Dance', tag: 'Electronic', color: '#00D9FF', gradient: 'from-cyan-400 to-blue-700' },
    { id: 'chill', name: 'Chill & Lo-Fi', tag: 'Chill', color: '#67FFD4', gradient: 'from-teal-400 to-emerald-600' },
    { id: 'indonesia', name: 'Indonesia', tag: 'indonesia', color: '#FF5FC8', gradient: 'from-rose-500 to-orange-500' },
    { id: 'pop', name: 'Pop', tag: 'Pop', color: '#FF5FC8', gradient: 'from-pink-500 to-rose-600' },
    { id: 'hiphop', name: 'Hip-Hop / Rap', tag: 'Hip-Hop', color: '#C6FF55', gradient: 'from-lime-400 to-green-600' },
    { id: 'jazz', name: 'Jazz & Soul', tag: 'Jazz', color: '#9C7BFF', gradient: 'from-purple-500 to-indigo-600' },
    { id: 'rock', name: 'Rock / Alternative', tag: 'Rock', color: '#FF5FC8', gradient: 'from-red-500 to-pink-600' },
    { id: 'worship', name: 'Rohani / Worship', tag: 'Worship', color: '#67FFD4', gradient: 'from-teal-300 to-cyan-600' },
    { id: 'mandarin', name: 'Mandarin / Asian', tag: 'mandarin', color: '#9C7BFF', gradient: 'from-violet-500 to-purple-700' },
    { id: 'soundtrack', name: 'Soundtrack & Ambient', tag: 'Ambient', color: '#00D9FF', gradient: 'from-blue-500 to-cyan-600' },
  ];
}

export async function fetchAppConfig() {
  try {
    const res = await fetch('/api/app-config');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // ignore
  }

  return {
    appName: 'J-Music',
    version: '1.0.0',
    primaryProvider: 'audius',
    donation: {
      title: 'Dukung Pengembangan Neon Music Hub (J-Music)',
      recipient: 'Johan',
      contact: '0813-41-300-100',
      methods: [
        { id: 'spay', name: 'ShopeePay', icon: 'shopee', verified: true, instruction: 'Transfer via ShopeePay ke Johan: 0813-41-300-100' },
        { id: 'gopay', name: 'GoPay', icon: 'gopay', verified: true, instruction: 'Transfer via GoPay ke Johan: 0813-41-300-100' },
        { id: 'ovo', name: 'OVO', icon: 'ovo', verified: true, instruction: 'Transfer via OVO ke Johan: 0813-41-300-100' },
        { id: 'dana', name: 'DANA', icon: 'dana', verified: true, instruction: 'Transfer via DANA ke Johan: 0813-41-300-100' }
      ],
      warning: 'Nomor kontak tidak otomatis berarti nomor akun penerima pada semua dompet digital. Selalu konfirmasi ke pemilik sebelum transaksi transfer besar.',
      privacy: 'Aplikasi tidak meminta PIN, OTP, atau password wallet.'
    }
  };
}
