export interface Track {
  id: string;
  name: string;
  artist_name: string;
  artist_id?: string;
  artist_handle?: string;
  album_name?: string;
  album_id?: string;
  duration: number; // in seconds
  image: string; // cover image URL
  audio: string; // stream URL
  audiodownload?: string; // direct download URL if allowed
  audiodownload_allowed: boolean; // boolean flag for downloadable track
  license_ccurl?: string; // Creative Commons or copyright license link
  shorturl?: string; // Official track link (Audius permalink or Jamendo URL)
  shareurl?: string;
  genres?: string[];
  tags?: string[];
  release_date?: string;
  provider: 'audius' | 'jamendo'; // Default 'audius' per addendum
  is_stream_gated?: boolean;
  is_download_gated?: boolean;
  play_count?: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  tracks: Track[];
}

export interface DonationConfig {
  title: string;
  recipient: string;
  contact: string;
  methods: {
    id: string;
    name: string;
    icon: string;
    verified: boolean;
    instruction: string;
  }[];
  warning: string;
  privacy: string;
}

export interface AppSettings {
  theme: 'dark-neon' | 'techno-high-contrast';
  reducedMotion: boolean;
  audioQuality: 'normal' | 'high';
  volume: number;
  providerPriority: 'audius' | 'jamendo'; // Default 'audius'
}

export interface UserProfile {
  uid: string;
  isGuest: boolean;
  displayName: string;
  email?: string;
  avatarUrl?: string;
}

export type ActiveTab = 'home' | 'search' | 'library' | 'donasi' | 'profil';

export interface GenreCategory {
  id: string;
  name: string;
  tag: string;
  color: string;
  gradient: string;
}
