import { Track } from '../types/music.ts';

/**
 * Format duration in seconds into mm:ss or hh:mm:ss format
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const totalSeconds = Math.floor(seconds);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const paddedSecs = secs < 10 ? `0${secs}` : `${secs}`;

  if (hrs > 0) {
    const paddedMins = mins < 10 ? `0${mins}` : `${mins}`;
    return `${hrs}:${paddedMins}:${paddedSecs}`;
  }

  return `${mins}:${paddedSecs}`;
}

/**
 * Build VideoFK search URL with proper encoding and parameters
 */
export function buildVideoFKUrl(trackPermalink: string): string {
  const url = new URL("https://www.videofk.com/search");
  url.searchParams.set("url", trackPermalink);
  url.searchParams.set("select", "");
  return url.toString();
}

/**
 * Checks download eligibility according to Audius and Jamendo API rules and blueprint constraints
 */
export function checkDownloadCompliance(track: Track): {
  eligible: boolean;
  canDirectDownload: boolean;
  reason: string;
  license: string;
  officialUrl: string;
  downloadUrl?: string;
  provider: 'audius' | 'jamendo';
} {
  const provider = track.provider || 'audius';

  if (provider === 'audius') {
    const officialUrl = track.shorturl || `https://audius.co`;
    const licenseUrl = track.license_ccurl || 'https://audius.co/terms-of-use';

    if (track.is_download_gated) {
      return {
        eligible: false,
        canDirectDownload: false,
        reason: 'Track memiliki akses bersyarat (token/gated) di Audius. Silakan buka halaman resmi untuk instruksi akses.',
        license: licenseUrl,
        officialUrl,
        provider: 'audius',
      };
    }

    if (typeof track.audiodownload_allowed === 'undefined' || track.audiodownload_allowed === null) {
      return {
        eligible: false,
        canDirectDownload: false,
        reason: 'Status izin unduh tidak tersedia untuk lagu ini. Gunakan fitur streaming resmi.',
        license: licenseUrl,
        officialUrl,
        provider: 'audius',
      };
    }

    if (!track.audiodownload_allowed) {
      return {
        eligible: false,
        canDirectDownload: false,
        reason: 'Lagu ini hanya tersedia untuk streaming. Kreator belum mengizinkan download publik.',
        license: licenseUrl,
        officialUrl,
        provider: 'audius',
      };
    }

    return {
      eligible: true,
      canDirectDownload: Boolean(track.audiodownload),
      reason: 'Track ditandai dapat diunduh resmi dari kreator melalui Audius API.',
      license: licenseUrl,
      officialUrl,
      downloadUrl: track.audiodownload,
      provider: 'audius',
    };
  }

  // Jamendo compliance
  const licenseUrl = track.license_ccurl || 'https://creativecommons.org/licenses/by-nc-sa/3.0/';
  const officialUrl = track.shorturl || `https://www.jamendo.com/track/${track.id}`;

  if (!track.audiodownload_allowed) {
    return {
      eligible: false,
      canDirectDownload: false,
      reason: 'Lagu ini hanya tersedia untuk streaming. Kreator belum mengizinkan download publik.',
      license: licenseUrl,
      officialUrl,
      provider: 'jamendo',
    };
  }

  if (!track.audiodownload) {
    return {
      eligible: false,
      canDirectDownload: false,
      reason: 'URL audio download resmi tidak disediakan oleh Jamendo API untuk track ini.',
      license: licenseUrl,
      officialUrl,
      provider: 'jamendo',
    };
  }

  return {
    eligible: true,
    canDirectDownload: Boolean(track.audiodownload),
    reason: 'Track memiliki izin unduh dari artis sesuai lisensi Creative Commons Jamendo.',
    license: licenseUrl,
    officialUrl,
    downloadUrl: track.audiodownload,
    provider: 'jamendo',
  };
}

/**
 * Deduplicate tracks by their ID
 */
export function deduplicateTracks(tracks: Track[]): Track[] {
  const seen = new Set<string>();
  return tracks.filter((t) => {
    if (!t || !t.id || seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
}

/**
 * Filter tracks by search query across title, artist name, and tags
 */
export function filterTracks(tracks: Track[], query: string, genre?: string): Track[] {
  const q = query.trim().toLowerCase();
  const g = genre && genre !== 'all' ? genre.toLowerCase() : null;

  return tracks.filter((track) => {
    const matchesQuery =
      !q ||
      track.name.toLowerCase().includes(q) ||
      track.artist_name.toLowerCase().includes(q) ||
      (track.album_name && track.album_name.toLowerCase().includes(q)) ||
      (track.genres && track.genres.some((item) => item.toLowerCase().includes(q))) ||
      (track.tags && track.tags.some((item) => item.toLowerCase().includes(q)));

    const matchesGenre =
      !g ||
      (track.genres && track.genres.some((item) => item.toLowerCase().includes(g))) ||
      (track.tags && track.tags.some((item) => item.toLowerCase().includes(g))) ||
      track.name.toLowerCase().includes(g);

    return matchesQuery && matchesGenre;
  });
}

/**
 * Validate playlist name according to constraints
 */
export function validatePlaylistName(name: string): { valid: boolean; error?: string } {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Nama playlist tidak boleh kosong' };
  }
  if (trimmed.length > 50) {
    return { valid: false, error: 'Nama playlist maksimal 50 karakter' };
  }
  return { valid: true };
}
