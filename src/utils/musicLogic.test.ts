import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatDuration,
  checkDownloadCompliance,
  deduplicateTracks,
  filterTracks,
  validatePlaylistName,
} from './musicLogic.ts';
import { Track } from '../types/music.ts';

// Condition 1: downloadable = true
const mockAudiusTrackDownloadable: Track = {
  id: 'D7Kyv',
  name: 'Cyber Horizon Future',
  artist_name: 'Audius Neon Producer',
  duration: 195,
  image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300',
  audio: 'https://api.audius.co/v1/tracks/D7Kyv/stream?api_key=0x933750e552b6493fdf53df4c0d1bc47301d9b43c',
  audiodownload: 'https://api.audius.co/v1/tracks/D7Kyv/download?api_key=0x933750e552b6493fdf53df4c0d1bc47301d9b43c',
  audiodownload_allowed: true,
  provider: 'audius',
  shorturl: 'https://audius.co/neon/cyber-horizon',
  genres: ['Electronic', 'Techno'],
};

// Condition 2: downloadable = false
const mockAudiusTrackNotDownloadable: Track = {
  id: 'vL9Nx',
  name: 'Electric Neon Drive 2026',
  artist_name: 'HyperDrive',
  duration: 224,
  image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300',
  audio: 'https://api.audius.co/v1/tracks/vL9Nx/stream?api_key=0x933750e552b6493fdf53df4c0d1bc47301d9b43c',
  audiodownload_allowed: false, // Download explicitly disallowed
  provider: 'audius',
  shorturl: 'https://audius.co/hyperdrive/electric-neon-drive',
  genres: ['Pop', 'EDM'],
};

// Condition 3: Status download tidak tersedia (undefined / null)
const mockAudiusTrackUnknownStatus: Track = {
  id: 'Unknown123',
  name: 'Mystery Audio Stream',
  artist_name: 'Unknown Artist',
  duration: 180,
  image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300',
  audio: 'https://api.audius.co/v1/tracks/Unknown123/stream?api_key=0x933750e552b6493fdf53df4c0d1bc47301d9b43c',
  audiodownload_allowed: undefined as unknown as boolean, // Status missing
  provider: 'audius',
  shorturl: 'https://audius.co/tracks/Unknown123',
  genres: ['Chill'],
};

test('formatDuration formats seconds accurately into mm:ss and hh:mm:ss', () => {
  assert.equal(formatDuration(0), '0:00');
  assert.equal(formatDuration(45), '0:45');
  assert.equal(formatDuration(65), '1:05');
  assert.equal(formatDuration(195), '3:15');
  assert.equal(formatDuration(3665), '1:01:05');
  assert.equal(formatDuration(-10), '0:00');
});

test('Requirement 9 Condition 1: track downloadable=true activates download and retains audio streaming', () => {
  const compliance = checkDownloadCompliance(mockAudiusTrackDownloadable);
  assert.equal(compliance.eligible, true);
  assert.equal(compliance.canDirectDownload, true);
  assert.equal(compliance.downloadUrl, mockAudiusTrackDownloadable.audiodownload);
  assert.equal(compliance.provider, 'audius');
  // Streaming audio URL remains valid
  assert.ok(mockAudiusTrackDownloadable.audio.includes('/stream'));
});

test('Requirement 9 Condition 2: track downloadable=false disables download with friendly message and retains audio streaming', () => {
  const compliance = checkDownloadCompliance(mockAudiusTrackNotDownloadable);
  assert.equal(compliance.eligible, false);
  assert.equal(compliance.canDirectDownload, false);
  assert.equal(compliance.downloadUrl, undefined);
  assert.equal(
    compliance.reason,
    'Lagu ini hanya tersedia untuk streaming. Kreator belum mengizinkan download publik.'
  );
  // Streaming audio URL remains valid even when download is disabled
  assert.ok(mockAudiusTrackNotDownloadable.audio.includes('/stream'));
});

test('Requirement 9 Condition 3: track with unknown download status disables download safely and retains audio streaming', () => {
  const compliance = checkDownloadCompliance(mockAudiusTrackUnknownStatus);
  assert.equal(compliance.eligible, false);
  assert.equal(compliance.canDirectDownload, false);
  assert.equal(
    compliance.reason,
    'Status izin unduh tidak tersedia untuk lagu ini. Gunakan fitur streaming resmi.'
  );
  // Streaming audio URL remains valid
  assert.ok(mockAudiusTrackUnknownStatus.audio.includes('/stream'));
});

test('deduplicateTracks removes duplicates and preserves order', () => {
  const list = [mockAudiusTrackDownloadable, mockAudiusTrackNotDownloadable, mockAudiusTrackDownloadable];
  const unique = deduplicateTracks(list);
  assert.equal(unique.length, 2);
  assert.equal(unique[0].id, 'D7Kyv');
  assert.equal(unique[1].id, 'vL9Nx');
});

test('filterTracks searches by title, artist, and genre', () => {
  const tracks = [mockAudiusTrackDownloadable, mockAudiusTrackNotDownloadable];
  assert.equal(filterTracks(tracks, 'cyber').length, 1);
  assert.equal(filterTracks(tracks, 'hyperdrive').length, 1);
  assert.equal(filterTracks(tracks, '', 'electronic').length, 1);
  assert.equal(filterTracks(tracks, 'nonexistent').length, 0);
});

test('validatePlaylistName validates length and non-empty string', () => {
  assert.equal(validatePlaylistName('').valid, false);
  assert.equal(validatePlaylistName('   ').valid, false);
  assert.equal(validatePlaylistName('My Audius Playlist').valid, true);
  assert.equal(validatePlaylistName('a'.repeat(60)).valid, false);
});
