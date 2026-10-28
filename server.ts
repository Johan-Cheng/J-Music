import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { FALLBACK_TRACKS, AUDIUS_DEFAULT_TRACKS } from './src/services/jamendoFallback.ts';
import { filterTracks } from './src/utils/musicLogic.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Audius is DEFAULT per addendum
const AUDIUS_API_KEY = process.env.AUDIUS_API_KEY || process.env.VITE_AUDIUS_API_KEY || '0x933750e552b6493fdf53df4c0d1bc47301d9b43c';
const AUDIUS_REST_BASE = 'https://api.audius.co/v1';

// Jamendo as secondary fallback
const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID || '7bd3449a';

app.use(express.json());

// In-memory cache to respect Audius 10 req/s rate limits and boost speed
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return entry.data as T;
  }
  return null;
}

function setCache(key: string, data: unknown) {
  if (cache.size > 250) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
}

// 1. App Configuration (Audius default, Johan Donation, Jamendo secondary)
app.get('/api/app-config', (_req: Request, res: Response) => {
  res.json({
    appName: 'J-Music',
    version: '1.0.0',
    primaryProvider: 'audius',
    secondaryProvider: 'jamendo',
    audius: {
      status: 'active',
      plan: 'Official Free Tier (500k req/mo, 10 req/s)',
      apiKeyConfigured: true,
    },
    donation: {
      title: 'Dukung Pengembangan Neon Music Hub (J-Music)',
      recipient: 'Johan',
      contact: '0813-41-300-100',
      methods: [
        {
          id: 'spay',
          name: 'ShopeePay',
          icon: 'shopee',
          verified: true,
          instruction: 'Transfer via aplikasi Shopee/ShopeePay ke kontak terverifikasi Johan: 0813-41-300-100'
        },
        {
          id: 'gopay',
          name: 'GoPay',
          icon: 'gopay',
          verified: true,
          instruction: 'Transfer via aplikasi Gojek/GoPay ke kontak terverifikasi Johan: 0813-41-300-100'
        },
        {
          id: 'ovo',
          name: 'OVO',
          icon: 'ovo',
          verified: true,
          instruction: 'Transfer via aplikasi OVO ke kontak terverifikasi Johan: 0813-41-300-100'
        },
        {
          id: 'dana',
          name: 'DANA',
          icon: 'dana',
          verified: true,
          instruction: 'Transfer via aplikasi DANA ke kontak terverifikasi Johan: 0813-41-300-100'
        }
      ],
      warning: 'Nomor kontak tidak otomatis berarti nomor akun penerima pada semua dompet digital. Selalu konfirmasi ke pemilik sebelum transaksi transfer besar.',
      privacy: 'Aplikasi tidak meminta PIN, OTP, atau password wallet. Aplikasi tidak menyimpan kredensial pembayaran.'
    },
    attribution: {
      primary: 'Powered by Audius Open Audio Protocol & API',
      secondary: 'Jamendo Music API v3.0 fallback',
      audiusTerms: 'https://audius.co/terms-of-use',
    }
  });
});

// Helper to normalize Audius track
function normalizeAudiusTrack(raw: any) {
  const artwork =
    raw.artwork?.['480x480'] ||
    raw.artwork?.['1000x1000'] ||
    raw.artwork?.['150x150'] ||
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400';

  const trackId = String(raw.id || raw.track_id);
  const streamUrl = `https://api.audius.co/v1/tracks/${trackId}/stream?api_key=${AUDIUS_API_KEY}`;
  const downloadUrl = `https://api.audius.co/v1/tracks/${trackId}/download?api_key=${AUDIUS_API_KEY}`;
  const isDownloadable = Boolean(raw.downloadable || raw.is_downloadable);

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
    provider: 'audius' as const,
    is_stream_gated: Boolean(raw.is_stream_gated),
    is_download_gated: Boolean(raw.is_download_gated),
    play_count: Number(raw.play_count) || 0,
  };
}

// 2. Music Search: AUDIUS is DEFAULT primary provider
app.get('/api/music/search', async (req: Request, res: Response) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const genre = typeof req.query.genre === 'string' ? req.query.genre.trim() : '';
  const limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 50);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const downloadableOnly = req.query.downloadable === 'true';

  const cacheKey = `search:audius:${query}:${genre}:${limit}:${offset}:${downloadableOnly}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return res.json({ success: true, fromCache: true, provider: 'audius', tracks: cached });
  }

  // Primary: Audius API
  try {
    const searchQuery = query || genre || 'trending';
    const params = new URLSearchParams({
      api_key: AUDIUS_API_KEY,
      query: searchQuery,
      limit: String(limit),
      offset: String(offset),
      sort_method: 'relevant',
    });
    if (downloadableOnly) {
      params.append('only_downloadable', 'true');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const audiusResponse = await fetch(`${AUDIUS_REST_BASE}/tracks/search?${params.toString()}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (audiusResponse.ok) {
      const data = await audiusResponse.json();
      if (data && Array.isArray(data.data) && data.data.length > 0) {
        const tracks = data.data.map(normalizeAudiusTrack);
        setCache(cacheKey, tracks);
        return res.json({ success: true, provider: 'audius', count: tracks.length, tracks });
      }
    }
  } catch (err: any) {
    console.warn('[Audius Search Warn]', err?.message || err);
  }

  // Secondary Fallback: Filter fallback/seed tracks
  const filtered = filterTracks(FALLBACK_TRACKS, query, genre);
  const resultList = filtered.length > 0 ? filtered : AUDIUS_DEFAULT_TRACKS;
  return res.json({
    success: true,
    fallback: true,
    provider: 'audius-fallback',
    count: resultList.length,
    tracks: resultList,
  });
});

// 3. Trending Tracks: AUDIUS is DEFAULT primary provider
app.get('/api/music/trending', async (req: Request, res: Response) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 50);
  const cacheKey = `trending:audius:${limit}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return res.json({ success: true, fromCache: true, provider: 'audius', tracks: cached });
  }

  // Primary: Audius Trending API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const audiusUrl = `${AUDIUS_REST_BASE}/tracks/trending?api_key=${AUDIUS_API_KEY}&limit=${limit}`;
    const audiusResponse = await fetch(audiusUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (audiusResponse.ok) {
      const data = await audiusResponse.json();
      if (data && Array.isArray(data.data) && data.data.length > 0) {
        const tracks = data.data.map(normalizeAudiusTrack);
        setCache(cacheKey, tracks);
        return res.json({ success: true, provider: 'audius', count: tracks.length, tracks });
      }
    }
  } catch (err: any) {
    console.warn('[Audius Trending Warn]', err?.message || err);
  }

  // Fallback to default trending tracks
  return res.json({
    success: true,
    fallback: true,
    provider: 'audius-default',
    count: AUDIUS_DEFAULT_TRACKS.length,
    tracks: AUDIUS_DEFAULT_TRACKS,
  });
});

// 4. Track Details by ID
app.get('/api/music/track/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const response = await fetch(`${AUDIUS_REST_BASE}/tracks/${id}?api_key=${AUDIUS_API_KEY}`);
    if (response.ok) {
      const data = await response.json();
      if (data?.data) {
        return res.json({ success: true, provider: 'audius', track: normalizeAudiusTrack(data.data) });
      }
    }
  } catch {
    // ignore
  }

  const fallback = FALLBACK_TRACKS.find((t) => t.id === id);
  if (fallback) {
    return res.json({ success: true, provider: fallback.provider, track: fallback });
  }

  res.status(404).json({ success: false, error: 'Track tidak ditemukan di Audius' });
});

// 5. Curated Genres and Categories
app.get('/api/music/genres', (_req: Request, res: Response) => {
  res.json({
    genres: [
      { id: 'all', name: 'Semua', tag: 'all', color: '#00D9FF' },
      { id: 'electronic', name: 'EDM / Dance', tag: 'Electronic', color: '#00D9FF' },
      { id: 'chill', name: 'Chill & Lo-Fi', tag: 'Chill', color: '#67FFD4' },
      { id: 'indonesia', name: 'Indonesia', tag: 'indonesia', color: '#FF5FC8' },
      { id: 'pop', name: 'Pop', tag: 'Pop', color: '#FF5FC8' },
      { id: 'hiphop', name: 'Hip-Hop / Rap', tag: 'Hip-Hop', color: '#C6FF55' },
      { id: 'jazz', name: 'Jazz & Soul', tag: 'Jazz', color: '#9C7BFF' },
      { id: 'rock', name: 'Rock', tag: 'Rock', color: '#FF5FC8' },
      { id: 'worship', name: 'Rohani / Worship', tag: 'Worship', color: '#67FFD4' },
      { id: 'mandarin', name: 'Mandarin / Asian', tag: 'mandarin', color: '#9C7BFF' },
      { id: 'ambient', name: 'Ambient & OST', tag: 'Ambient', color: '#00D9FF' },
    ]
  });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[J-Music Server] Audius Default Provider active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[J-Music Server Error]', err);
});
