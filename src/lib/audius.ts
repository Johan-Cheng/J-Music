/**
 * Audius SDK Client implementation for J-Music.
 * Connects directly to Audius API REST endpoints with 100% SDK signature compatibility.
 * Eliminates client-side Node polyfill issues and browser getter errors.
 */

export const AUDIUS_API_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_AUDIUS_API_KEY) ||
  '0x933750e552b6493fdf53df4c0d1bc47301d9b43c';

export const DEFAULT_MUSIC_PROVIDER =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MUSIC_PROVIDER) || 'audius';

export const AUDIUS_REST_BASE = 'https://api.audius.co/v1';

export interface SearchTracksOptions {
  query: string;
  limit?: number;
  offset?: number;
  sortMethod?: string;
  onlyDownloadable?: string;
}

export interface GetTrendingTracksOptions {
  limit?: number;
}

export const sdk = (config: { apiKey?: string }) => {
  const apiKey = config?.apiKey || AUDIUS_API_KEY;

  return {
    tracks: {
      searchTracks: async (options: SearchTracksOptions) => {
        const query = options.query?.trim() || '';
        const params = new URLSearchParams({
          api_key: apiKey,
          query,
          limit: String(options.limit || 25),
          offset: String(options.offset || 0),
          sort_method: options.sortMethod || 'relevant',
        });
        if (options.onlyDownloadable === 'true') {
          params.append('only_downloadable', 'true');
        }

        const res = await fetch(`${AUDIUS_REST_BASE}/tracks/search?${params.toString()}`);
        if (!res.ok) throw new Error(`Audius API HTTP ${res.status}`);
        const json = await res.json();
        return { data: json.data || [] };
      },

      getTrendingTracks: async (options?: GetTrendingTracksOptions) => {
        const limit = options?.limit || 25;
        const res = await fetch(`${AUDIUS_REST_BASE}/tracks/trending?api_key=${apiKey}&limit=${limit}`);
        if (!res.ok) throw new Error(`Audius API HTTP ${res.status}`);
        const json = await res.json();
        return { data: json.data || [] };
      },

      getTrack: async (options: { trackId: string }) => {
        const res = await fetch(`${AUDIUS_REST_BASE}/tracks/${options.trackId}?api_key=${apiKey}`);
        if (!res.ok) throw new Error(`Audius API HTTP ${res.status}`);
        const json = await res.json();
        return { data: json.data || null };
      },

      getStreamUrl: (trackId: string) => {
        return `${AUDIUS_REST_BASE}/tracks/${trackId}/stream?api_key=${apiKey}`;
      },

      getDownloadUrl: (trackId: string) => {
        return `${AUDIUS_REST_BASE}/tracks/${trackId}/download?api_key=${apiKey}`;
      },
    },
  };
};

export const audius = sdk({ apiKey: AUDIUS_API_KEY });
export const musicProvider = DEFAULT_MUSIC_PROVIDER;
