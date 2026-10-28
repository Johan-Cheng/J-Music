import { Track } from '../types/music.ts';
import { AUDIUS_API_KEY, AUDIUS_REST_BASE } from '../lib/audius.ts';
import { filterTracks } from '../utils/musicLogic.ts';
import { AUDIUS_DEFAULT_TRACKS, FALLBACK_TRACKS } from './jamendoFallback.ts';

const searchCache = new Map<string, { data: Track[]; timestamp: number }>();
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes

export function normalizeAudiusTrack(raw: any): Track {
  const artwork =
    raw.artwork?.['480x480'] ||
    raw.artwork?.['1000x1000'] ||
    raw.artwork?.['150x150'] ||
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400';

  const trackId = String(raw.id || raw.track_id);
  const streamUrl = `https://api.audius.co/v1/tracks/${trackId}/stream?api_key=${AUDIUS_API_KEY}`;
  const downloadUrl = `https://api.audius.co/v1/tracks/${trackId}/download?api_key=${AUDIUS_API_KEY}`;

  // Strict official downloadable flag check per Requirement 1
  const isDownloadable = Boolean(raw.downloadable === true || raw.is_downloadable === true);

  const genres: string[] = [];
  if (raw.genre) genres.push(raw.genre);
  if (raw.mood) genres.push(raw.mood);

  const tags: string[] = [];
  if (raw.tags && typeof raw.tags === 'string') {
    tags.push(...raw.tags.split(',').map((t: string) => t.trim()));
  }

  const artistName = raw.user?.name || raw.user?.handle || 'Audius Creator';
  const artistHandle = raw.user?.handle || '';
  const permalink = raw.permalink ? `https://audius.co${raw.permalink}` : `https://audius.co/tracks/${trackId}`;

  return {
    id: trackId,
    name: raw.title || 'Untitled Track',
    artist_name: artistName,
    artist_handle: artistHandle,
    album_name: raw.album_name || '',
    duration: Number(raw.duration) || 180,
    image: artwork,
    audio: streamUrl,
    audiodownload: isDownloadable ? downloadUrl : undefined,
    audiodownload_allowed: isDownloadable,
    license_ccurl: 'https://audius.co/terms-of-use',
    shorturl: permalink,
    shareurl: permalink,
    genres: genres.length > 0 ? genres : ['Audius'],
    tags,
    release_date: raw.release_date || '',
    provider: 'audius',
    is_stream_gated: Boolean(raw.is_stream_gated),
    is_download_gated: Boolean(raw.is_download_gated),
    play_count: Number(raw.play_count) || 0,
  };
}

/**
 * Primary search function using Audius API as DEFAULT
 */
export async function searchAudiusTracks(
  query: string,
  downloadableOnly = false,
  genre?: string,
  limit = 25,
  offset = 0
): Promise<Track[]> {
  const cleanQuery = query.trim();
  const cacheKey = `audius:search:${cleanQuery}:${downloadableOnly}:${genre}:${limit}:${offset}`;

  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // Helper for strict downloadable filtering
  const filterStrictDownloadable = (tracks: Track[]) => {
    if (!downloadableOnly) return tracks;
    return tracks.filter(
      (t) => t.audiodownload_allowed === true && Boolean(t.audiodownload) && !t.is_download_gated
    );
  };

  // 1. Try server proxy endpoint first (which uses Audius as default)
  try {
    const params = new URLSearchParams();
    if (cleanQuery) params.append('q', cleanQuery);
    if (genre && genre !== 'all') params.append('genre', genre);
    params.append('limit', String(limit));
    params.append('offset', String(offset));
    if (downloadableOnly) params.append('downloadable', 'true');
    params.append('provider', 'audius');

    const res = await fetch(`/api/music/search?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.tracks && Array.isArray(data.tracks) && data.tracks.length > 0) {
        const strictTracks = filterStrictDownloadable(data.tracks);
        searchCache.set(cacheKey, { data: strictTracks, timestamp: Date.now() });
        return strictTracks;
      }
    }
  } catch (err) {
    console.warn('[searchAudiusTracks] Proxy search fallback to direct Audius REST', err);
  }

  // 2. Direct Audius REST call with API Key
  try {
    const audiusQuery = cleanQuery || genre || 'trending';
    const params = new URLSearchParams({
      api_key: AUDIUS_API_KEY,
      query: audiusQuery,
      limit: String(limit),
      offset: String(offset),
      sort_method: 'relevant',
    });
    if (downloadableOnly) {
      params.append('only_downloadable', 'true');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${AUDIUS_REST_BASE}/tracks/search?${params.toString()}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (response.ok) {
      const json = await response.json();
      if (json && Array.isArray(json.data) && json.data.length > 0) {
        const tracks = json.data.map(normalizeAudiusTrack);
        const strictTracks = filterStrictDownloadable(tracks);
        searchCache.set(cacheKey, { data: strictTracks, timestamp: Date.now() });
        return strictTracks;
      }
    }
  } catch (err) {
    console.warn('[searchAudiusTracks] Direct Audius REST query failed:', err);
  }

  // 3. Fallback to curated tracks
  const filtered = filterTracks(FALLBACK_TRACKS, cleanQuery, genre);
  const resultList = filtered.length > 0 ? filtered : AUDIUS_DEFAULT_TRACKS;
  return filterStrictDownloadable(resultList);
}

/**
 * Fetch Audius trending tracks (DEFAULT Provider)
 */
export async function getAudiusTrendingTracks(limit = 25): Promise<Track[]> {
  const cacheKey = `audius:trending:${limit}`;
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const res = await fetch(`/api/music/trending?provider=audius&limit=${limit}`);
    if (res.ok) {
      const data = await res.json();
      if (data.tracks && Array.isArray(data.tracks) && data.tracks.length > 0) {
        searchCache.set(cacheKey, { data: data.tracks, timestamp: Date.now() });
        return data.tracks;
      }
    }
  } catch (err) {
    console.warn('[getAudiusTrendingTracks] Proxy trending failed:', err);
  }

  // Direct Audius API fallback
  try {
    const res = await fetch(`${AUDIUS_REST_BASE}/tracks/trending?api_key=${AUDIUS_API_KEY}&limit=${limit}`);
    if (res.ok) {
      const json = await res.json();
      if (json && Array.isArray(json.data) && json.data.length > 0) {
        const tracks = json.data.map(normalizeAudiusTrack);
        searchCache.set(cacheKey, { data: tracks, timestamp: Date.now() });
        return tracks;
      }
    }
  } catch (err) {
    console.warn('[getAudiusTrendingTracks] Direct trending error:', err);
  }

  return AUDIUS_DEFAULT_TRACKS;
}
