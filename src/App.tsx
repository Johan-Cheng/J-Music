/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Track, Playlist, AppSettings, UserProfile, ActiveTab, GenreCategory } from './types/music.ts';
import { StorageService } from './services/storageService.ts';
import { fetchTrendingTracks, fetchGenres, searchTracks } from './services/jamendoApi.ts';
import { BackgroundCanvas } from './components/BackgroundCanvas.tsx';
import { Header } from './components/Header.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { MiniPlayer } from './components/MiniPlayer.tsx';
import { FullPlayerModal } from './components/FullPlayerModal.tsx';
import { DownloadGateModal } from './components/DownloadGateModal.tsx';
import { PlaylistModal } from './components/PlaylistModal.tsx';
import { HomeView } from './views/HomeView.tsx';
import { SearchView } from './views/SearchView.tsx';
import { LibraryView } from './views/LibraryView.tsx';
import { DonationView } from './views/DonationView.tsx';
import { ProfileView } from './views/ProfileView.tsx';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function App() {
  // Splash / Onboarding screen (Page 3 of PDF) - accepts ?autostart=1 per Ultra Mode
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('autostart') === '1') {
      return false;
    }
    return !sessionStorage.getItem('jmusic_splash_seen');
  });

  // App navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [searchInitialGenre, setSearchInitialGenre] = useState<string>('all');

  // App data
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [recommendedTracks, setRecommendedTracks] = useState<Track[]>([]);
  const [genres, setGenres] = useState<GenreCategory[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Persistence data
  const [favorites, setFavorites] = useState<Track[]>(() => StorageService.getFavorites());
  const [playlists, setPlaylists] = useState<Playlist[]>(() => StorageService.getPlaylists());
  const [recentTracks, setRecentTracks] = useState<Track[]>(() => StorageService.getRecentTracks());
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());
  const [user, setUser] = useState<UserProfile>(() => StorageService.getProfile());

  // Player state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(settings.volume);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');

  // Modals
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [downloadGateTrack, setDownloadGateTrack] = useState<Track | null>(null);
  const [playlistModalTrack, setPlaylistModalTrack] = useState<Track | null>(null);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);

  // Fetch initial tracks & genres
  useEffect(() => {
    async function loadInitialData() {
      setIsDataLoading(true);
      try {
        const [trending, genreList] = await Promise.all([
          fetchTrendingTracks(),
          fetchGenres(),
        ]);
        setTrendingTracks(trending);
        setGenres(genreList);

        // Curated recommendation subset
        if (trending.length > 6) {
          setRecommendedTracks(trending.slice(6, 12));
        } else {
          setRecommendedTracks(trending);
        }
      } catch (err) {
        console.warn('Initial data load warning:', err);
      } finally {
        setIsDataLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Sync volume to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Handle Play track
  const handlePlayTrack = (track: Track) => {
    if (currentTrack?.id === track.id) {
      // Toggle current
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play().catch(console.warn);
        setIsPlaying(true);
      }
      return;
    }

    // Set new track
    setCurrentTrack(track);
    setIsAudioLoading(true);
    setAudioError(false);
    setCurrentTime(0);

    // Add to recent
    StorageService.addRecentTrack(track);
    setRecentTracks(StorageService.getRecentTracks());

    // Ensure queue has this track
    if (!queue.some((t) => t.id === track.id)) {
      setQueue((prev) => [track, ...prev]);
    }

    if (audioRef.current) {
      audioRef.current.src = track.audio;
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsAudioLoading(false);
        })
        .catch((err) => {
          console.warn('Playback error:', err);
          setIsAudioLoading(false);
          setAudioError(true);
        });
    }
  };

  const handlePlayAll = (tracks: Track[]) => {
    if (!tracks || tracks.length === 0) return;
    setQueue(tracks);
    handlePlayTrack(tracks[0]);
  };

  const handleTogglePlay = () => {
    if (!currentTrack && trendingTracks.length > 0) {
      handlePlayTrack(trendingTracks[0]);
      return;
    }
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setAudioError(true));
    }
  };

  const handleNext = () => {
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack?.id);
    let nextIndex = 0;

    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (currentIndex >= 0 && currentIndex < queue.length - 1) {
      nextIndex = currentIndex + 1;
    } else if (repeatMode === 'all') {
      nextIndex = 0;
    } else {
      return; // end of queue
    }

    handlePlayTrack(queue[nextIndex]);
  };

  const handlePrev = () => {
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack?.id);
    let prevIndex = queue.length - 1;

    if (currentTime > 4) {
      // If played > 4s, seek to 0
      if (audioRef.current) audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    if (currentIndex > 0) {
      prevIndex = currentIndex - 1;
    }
    handlePlayTrack(queue[prevIndex]);
  };

  const handleSeek = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolume(clamped);
    StorageService.saveSettings({ volume: clamped });
  };

  // Audio lifecycle event handlers
  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || currentTrack?.duration || 0);
      setIsAudioLoading(false);
    }
  };

  const onEnded = () => {
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.warn);
      }
    } else {
      handleNext();
    }
  };

  const onAudioError = () => {
    setIsAudioLoading(false);
    setAudioError(true);
  };

  // Favorites toggle
  const handleToggleFavorite = (track: Track) => {
    StorageService.toggleFavorite(track);
    setFavorites(StorageService.getFavorites());
  };

  // Playlist management
  const handleCreatePlaylist = (name: string, description: string) => {
    StorageService.createPlaylist(name, description);
    setPlaylists(StorageService.getPlaylists());
  };

  const handleAddToPlaylist = (playlistId: string, track: Track) => {
    StorageService.addTrackToPlaylist(playlistId, track);
    setPlaylists(StorageService.getPlaylists());
  };

  const handleDeletePlaylist = (playlistId: string) => {
    StorageService.deletePlaylist(playlistId);
    setPlaylists(StorageService.getPlaylists());
  };

  const handleRenamePlaylist = (playlistId: string, newName: string) => {
    StorageService.renamePlaylist(playlistId, newName);
    setPlaylists(StorageService.getPlaylists());
  };

  const handleRemoveFromPlaylist = (playlistId: string, trackId: string) => {
    StorageService.removeTrackFromPlaylist(playlistId, trackId);
    setPlaylists(StorageService.getPlaylists());
  };

  // Settings update
  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = StorageService.saveSettings(newSettings);
    setSettings(updated);
  };

  // Auth toggle simulation / cloud sync
  const handleToggleAuth = () => {
    if (user.isGuest) {
      const loggedUser: UserProfile = {
        uid: 'user_google_' + Math.random().toString(36).substring(2, 9),
        isGuest: false,
        displayName: 'Johan Music Lover (Google Sync)',
        email: 'user@example.com',
      };
      StorageService.setProfile(loggedUser);
      setUser(loggedUser);
      alert('Berhasil masuk akun! Data favorit & playlist Anda telah disinkronkan.');
    } else {
      const guestUser: UserProfile = {
        uid: 'guest_' + Math.random().toString(36).substring(2, 8),
        isGuest: true,
        displayName: 'Tamu Neon (Guest)',
      };
      StorageService.setProfile(guestUser);
      setUser(guestUser);
    }
  };

  // Navigation handlers
  const handleSelectGenreFromHome = (tag: string) => {
    setSearchInitialGenre(tag);
    setActiveTab('search');
  };

  const handleDismissSplash = () => {
    sessionStorage.setItem('jmusic_splash_seen', 'true');
    setShowSplash(false);
  };

  return (
    <div
      className={`min-h-screen bg-[#071122] text-slate-100 flex flex-col justify-between selection:bg-[#00D9FF] selection:text-black ${
        settings.theme === 'techno-high-contrast' ? 'contrast-125' : ''
      }`}
    >
      {/* Background Neon Notes Particles */}
      <BackgroundCanvas reducedMotion={settings.reducedMotion} />

      {/* Hidden Native Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
        onError={onAudioError}
        preload="metadata"
      />

      {/* Splash / Onboarding Modal (Page 3 PDF) */}
      {showSplash && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071122]/95 backdrop-blur-xl animate-fade-in"
        >
          <div className="max-w-sm w-full p-6 rounded-3xl bg-[#0B1C32] border border-cyan-500/30 text-center shadow-[0_0_40px_rgba(0,217,255,0.25)]">
            <div className="relative w-20 h-20 mx-auto mb-4 rounded-full p-1 bg-gradient-to-tr from-[#00D9FF] via-[#67FFD4] to-[#FF5FC8] shadow-[0_0_20px_rgba(0,217,255,0.4)]">
              <div className="w-full h-full rounded-full bg-[#071122] flex items-center justify-center">
                <span className="text-3xl font-black bg-gradient-to-r from-[#00D9FF] to-[#67FFD4] bg-clip-text text-transparent">
                  J
                </span>
              </div>
            </div>

            <h2 className="text-xl font-extrabold text-white tracking-wide">
              J-Music Neon Hub
            </h2>
            <p className="text-xs text-cyan-400 font-medium uppercase tracking-wider mt-0.5">
              Android Music Experience
            </p>

            <p className="text-xs text-slate-300 my-4 leading-relaxed">
              Pencarian musik, pemutar online resmi, koleksi pribadi, dan download yang berizin Creative Commons.
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleDismissSplash}
                className="w-full py-3 rounded-2xl font-bold text-xs bg-gradient-to-r from-[#00D9FF] to-[#67FFD4] text-slate-950 hover:brightness-110 flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,217,255,0.4)] active:scale-95 transition-all"
              >
                <span>Mulai Mendengarkan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleDismissSplash}
                className="py-2 text-xs text-slate-400 hover:text-white"
              >
                Lewati
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container constrained to Mobile-First max width */}
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col relative px-4">
        {/* App Top Header */}
        <Header
          onSearchClick={() => setActiveTab('search')}
          onProfileClick={() => setActiveTab('profil')}
          user={user}
          isPlaying={isPlaying}
          activeTab={activeTab}
        />

        {/* View Router */}
        <main className="flex-1 mt-4">
          {activeTab === 'home' && (
            <HomeView
              trendingTracks={trendingTracks}
              recommendedTracks={recommendedTracks}
              genres={genres}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              isLoading={isDataLoading}
              favorites={favorites}
              onPlay={handlePlayTrack}
              onPlayAll={handlePlayAll}
              onSelectGenre={handleSelectGenreFromHome}
              onToggleFavorite={handleToggleFavorite}
              onOpenPlaylistModal={(track) => {
                setPlaylistModalTrack(track);
                setIsPlaylistModalOpen(true);
              }}
              onOpenDownloadGate={(track) => setDownloadGateTrack(track)}
              onRefresh={async () => {
                setIsDataLoading(true);
                const fresh = await fetchTrendingTracks();
                setTrendingTracks(fresh);
                setIsDataLoading(false);
              }}
            />
          )}

          {activeTab === 'search' && (
            <SearchView
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              favorites={favorites}
              initialGenre={searchInitialGenre}
              onPlay={handlePlayTrack}
              onToggleFavorite={handleToggleFavorite}
              onOpenPlaylistModal={(track) => {
                setPlaylistModalTrack(track);
                setIsPlaylistModalOpen(true);
              }}
              onOpenDownloadGate={(track) => setDownloadGateTrack(track)}
            />
          )}

          {activeTab === 'library' && (
            <LibraryView
              favorites={favorites}
              playlists={playlists}
              recentTracks={recentTracks}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlay={handlePlayTrack}
              onPlayAll={handlePlayAll}
              onToggleFavorite={handleToggleFavorite}
              onOpenPlaylistModal={(track) => {
                setPlaylistModalTrack(track);
                setIsPlaylistModalOpen(true);
              }}
              onOpenDownloadGate={(track) => setDownloadGateTrack(track)}
              onDeletePlaylist={handleDeletePlaylist}
              onRemoveFromPlaylist={handleRemoveFromPlaylist}
              onClearRecent={() => {
                StorageService.clearRecentTracks();
                setRecentTracks([]);
              }}
            />
          )}

          {activeTab === 'donasi' && (
            <DonationView onBackToHome={() => setActiveTab('home')} />
          )}

          {activeTab === 'profil' && (
            <ProfileView
              user={user}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onToggleAuth={handleToggleAuth}
            />
          )}
        </main>
      </div>

      {/* Mini Player docking persistently above Bottom Nav */}
      {!isFullPlayerOpen && (
        <MiniPlayer
          track={currentTrack}
          isPlaying={isPlaying}
          isLoading={isAudioLoading}
          hasError={audioError}
          progressPercent={duration > 0 ? (currentTime / duration) * 100 : 0}
          onTogglePlay={handleTogglePlay}
          onNext={handleNext}
          onOpenFullPlayer={() => setIsFullPlayerOpen(true)}
          onRetry={() => {
            if (currentTrack) handlePlayTrack(currentTrack);
          }}
        />
      )}

      {/* Full Player Modal */}
      <FullPlayerModal
        isOpen={isFullPlayerOpen}
        onClose={() => setIsFullPlayerOpen(false)}
        track={currentTrack}
        isPlaying={isPlaying}
        isLoading={isAudioLoading}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isShuffle={isShuffle}
        repeatMode={repeatMode}
        isFavorite={currentTrack ? favorites.some((f) => f.id === currentTrack.id) : false}
        queue={queue}
        onTogglePlay={handleTogglePlay}
        onSeek={handleSeek}
        onNext={handleNext}
        onPrev={handlePrev}
        onToggleShuffle={() => setIsShuffle(!isShuffle)}
        onToggleRepeat={() => {
          if (repeatMode === 'off') setRepeatMode('all');
          else if (repeatMode === 'all') setRepeatMode('one');
          else setRepeatMode('off');
        }}
        onVolumeChange={handleVolumeChange}
        onToggleFavorite={handleToggleFavorite}
        onSelectQueueTrack={handlePlayTrack}
        onOpenDownloadGate={(track) => setDownloadGateTrack(track)}
      />

      {/* Download Gate & Compliance Modal */}
      <DownloadGateModal
        isOpen={Boolean(downloadGateTrack)}
        track={downloadGateTrack}
        onClose={() => setDownloadGateTrack(null)}
        onPlayTrack={handlePlayTrack}
      />

      {/* Playlist Selector & Creator Modal */}
      <PlaylistModal
        isOpen={isPlaylistModalOpen}
        onClose={() => {
          setIsPlaylistModalOpen(false);
          setPlaylistModalTrack(null);
        }}
        trackToAdd={playlistModalTrack}
        playlists={playlists}
        onCreatePlaylist={handleCreatePlaylist}
        onAddToPlaylist={handleAddToPlaylist}
        onDeletePlaylist={handleDeletePlaylist}
        onRenamePlaylist={handleRenamePlaylist}
      />

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        favoritesCount={favorites.length}
      />
    </div>
  );
}
