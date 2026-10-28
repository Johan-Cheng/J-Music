import { Track, Playlist, AppSettings, UserProfile } from '../types/music.ts';
import { FALLBACK_TRACKS } from './jamendoFallback.ts';

const STORAGE_KEYS = {
  FAVORITES: 'jmusic_favorites_v1',
  PLAYLISTS: 'jmusic_playlists_v1',
  RECENT: 'jmusic_recent_v1',
  SETTINGS: 'jmusic_settings_v1',
  PROFILE: 'jmusic_profile_v1',
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark-neon',
  reducedMotion: false,
  audioQuality: 'high',
  volume: 0.85,
  providerPriority: 'audius',
};

const DEFAULT_USER: UserProfile = {
  uid: 'guest_user_default',
  isGuest: true,
  displayName: 'Tamu Neon (Guest)',
};

export const StorageService = {
  // Favorites
  getFavorites(): Track[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (!data) {
        // Seed initial favorite with first fallback track
        const initial = [FALLBACK_TRACKS[0]];
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(data);
    } catch {
      return [FALLBACK_TRACKS[0]];
    }
  },

  isFavorite(trackId: string): boolean {
    const favorites = this.getFavorites();
    return favorites.some((t) => t.id === trackId);
  },

  toggleFavorite(track: Track): boolean {
    const favorites = this.getFavorites();
    const index = favorites.findIndex((t) => t.id === track.id);
    let isNowFavorite = false;

    if (index >= 0) {
      favorites.splice(index, 1);
      isNowFavorite = false;
    } else {
      favorites.unshift(track);
      isNowFavorite = true;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
    return isNowFavorite;
  },

  // Playlists
  getPlaylists(): Playlist[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
      if (!data) {
        // Initial default playlist
        const initial: Playlist[] = [
          {
            id: 'pl_neon_pulse',
            name: 'Cyberpunk & Chill',
            description: 'Koleksi pilihan musik neon futuristik untuk fokus',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tracks: [FALLBACK_TRACKS[0], FALLBACK_TRACKS[1], FALLBACK_TRACKS[2]],
          },
        ];
        localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  createPlaylist(name: string, description = ''): Playlist {
    const playlists = this.getPlaylists();
    const newPlaylist: Playlist = {
      id: `pl_${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tracks: [],
    };
    playlists.unshift(newPlaylist);
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
    return newPlaylist;
  },

  renamePlaylist(id: string, newName: string): boolean {
    const playlists = this.getPlaylists();
    const target = playlists.find((p) => p.id === id);
    if (!target) return false;
    target.name = newName.trim();
    target.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
    return true;
  },

  deletePlaylist(id: string): boolean {
    let playlists = this.getPlaylists();
    const beforeLen = playlists.length;
    playlists = playlists.filter((p) => p.id !== id);
    if (playlists.length !== beforeLen) {
      localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
      return true;
    }
    return false;
  },

  addTrackToPlaylist(playlistId: string, track: Track): boolean {
    const playlists = this.getPlaylists();
    const target = playlists.find((p) => p.id === playlistId);
    if (!target) return false;
    if (target.tracks.some((t) => t.id === track.id)) {
      return false; // already in playlist
    }
    target.tracks.unshift(track);
    target.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
    return true;
  },

  removeTrackFromPlaylist(playlistId: string, trackId: string): boolean {
    const playlists = this.getPlaylists();
    const target = playlists.find((p) => p.id === playlistId);
    if (!target) return false;
    target.tracks = target.tracks.filter((t) => t.id !== trackId);
    target.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
    return true;
  },

  // Recent History
  getRecentTracks(): Track[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECENT);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addRecentTrack(track: Track): void {
    let recent = this.getRecentTracks();
    recent = recent.filter((t) => t.id !== track.id);
    recent.unshift(track);
    if (recent.length > 30) recent = recent.slice(0, 30);
    try {
      localStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(recent));
    } catch (e) {
      console.warn('Recent save failed:', e);
    }
  },

  clearRecentTracks(): void {
    localStorage.removeItem(STORAGE_KEYS.RECENT);
  },

  // Settings
  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  },

  // Profile & Sync
  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  },

  setProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },
};
