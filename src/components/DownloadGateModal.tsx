import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Download,
  CheckCircle,
  Info,
  Play,
  Copy,
  Check,
  Globe,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { Track } from '../types/music.ts';
import { checkDownloadCompliance, buildVideoFKUrl } from '../utils/musicLogic.ts';

interface DownloadGateModalProps {
  track: Track | null;
  isOpen: boolean;
  onClose: () => void;
  onPlayTrack?: (track: Track) => void;
}

export const DownloadGateModal: React.FC<DownloadGateModalProps> = ({
  track,
  isOpen,
  onClose,
  onPlayTrack,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [showVideoFKDialog, setShowVideoFKDialog] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  if (!isOpen || !track) return null;

  const compliance = checkDownloadCompliance(track);
  const isAudius = track.provider === 'audius';

  const handleOfficialDownload = async () => {
    if (!compliance.downloadUrl) return;

    setIsDownloading(true);
    setDownloadError(null);

    try {
      const response = await fetch(compliance.downloadUrl);

      if (!response.ok) {
        throw new Error(`Server status ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      const cleanFileName = `${track.artist_name} - ${track.name}.mp3`.replace(/[/\\?%*:|"<>]/g, '-');
      anchor.download = cleanFileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(blobUrl);

      setTimeout(() => setIsDownloading(false), 1500);
    } catch (err) {
      console.warn('[Official Download Error]', err);
      setIsDownloading(false);
      setDownloadError(
        'Unduhan ditolak oleh server Audius. Silakan buka halaman resmi lagu di Audius untuk mengakses pilihan alternatif dari kreator.'
      );
    }
  };

  const handleCopyLink = async () => {
    setCopyError(null);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(compliance.officialUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = compliance.officialUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.warn('[Copy Link Error]', err);
      setCopyError('Gagal menyalin otomatis. Silakan salin tautan secara manual: ' + compliance.officialUrl);
    }
  };

  const handleOpenVideoFK = () => {
    try {
      const searchUrl = buildVideoFKUrl(compliance.officialUrl);
      const newWin = window.open(searchUrl, '_blank', 'noopener,noreferrer');
      if (!newWin) {
        alert('Browser Anda memblokir jendela baru. Harap izinkan pop-up untuk membuka pencarian VideoFK.');
      }
    } catch (err) {
      console.warn('[VideoFK Open Error]', err);
      alert('Gagal membuka VideoFK. Silakan buka https://www.videofk.com/ secara manual.');
    }
  };

  const handleOpenPermalink = () => {
    window.open(compliance.officialUrl, '_blank', 'noopener,noreferrer');
  };

  const handlePlayNow = () => {
    if (onPlayTrack && track) {
      onPlayTrack(track);
      onClose();
    }
  };

  const handleCloseAll = () => {
    setDownloadError(null);
    setShowVideoFKDialog(false);
    setCopySuccess(false);
    setCopyError(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="download-modal-title"
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div
        className="relative w-full max-w-md bg-[#0B1C32] border border-cyan-500/30 rounded-t-3xl sm:rounded-3xl p-5 shadow-[0_0_35px_rgba(0,217,255,0.2)] text-slate-100 max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {showVideoFKDialog ? (
          /* ====================================================== */
          /* MODAL 2: DIALOG "PILIH METODE DOWNLOAD" & VIDEOFK        */
          /* ====================================================== */
          <div className="space-y-4 animate-fade-in">
            {/* Header Dialog */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowVideoFKDialog(false)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                  aria-label="Kembali ke Verifikasi Lisensi"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 id="download-modal-title" className="text-base font-extrabold text-white">
                    Pilih Metode Download
                  </h2>
                  <p className="text-[11px] text-cyan-400">VideoFK Search Helper</p>
                </div>
              </div>

              <button
                onClick={handleCloseAll}
                aria-label="Tutup dialog"
                className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Explanation Banner */}
            <div className="p-3.5 rounded-2xl bg-cyan-950/50 border border-cyan-500/30 text-xs text-cyan-200 leading-relaxed space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-white">
                <Sparkles className="w-4 h-4 text-[#00D9FF] shrink-0" />
                <span>Panduan Layanan Eksternal</span>
              </div>
              <p>
                Download resmi Audius adalah pilihan utama jika kreator mengizinkannya. VideoFK merupakan layanan eksternal dan dukungan untuk URL Audius belum terverifikasi.
              </p>
            </div>

            {/* Copy Link Status Toast */}
            {copySuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
                <Check className="w-4 h-4 text-[#67FFD4] shrink-0" />
                <span>Tautan lagu resmi Audius berhasil disalin ke clipboard!</span>
              </div>
            )}

            {copyError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs leading-relaxed">
                {copyError}
              </div>
            )}

            {/* Instruction Warning per Requirement */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 leading-relaxed space-y-1">
              <p className="font-semibold text-amber-300">⚠️ Peringatan Penggunaan:</p>
              <p>
                Tempel tautan hanya untuk konten yang Anda miliki atau yang memang diizinkan untuk diunduh. Dukungan VideoFK terhadap tautan ini bergantung pada layanan pihak ketiga.
              </p>
              {!compliance.eligible && (
                <p className="text-amber-200/90 italic pt-1 border-t border-slate-800 mt-1">
                  Catatan: Audius menyatakan kreator belum mengizinkan download publik untuk lagu ini. Aplikasi tidak mengklaim VideoFK dapat mengunduh lagu yang dibatasi.
                </p>
              )}
            </div>

            {/* Action Buttons list */}
            <div className="space-y-2 pt-1">
              {/* Option A: Download Resmi Audius (Hanya tampil jika diizinkan) */}
              {compliance.eligible && compliance.canDirectDownload && (
                <button
                  onClick={handleOfficialDownload}
                  disabled={isDownloading}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-[#00D9FF] to-[#67FFD4] text-slate-950 hover:brightness-110 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,217,255,0.3)] active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
                  <span>
                    {isDownloading ? 'Mengunduh File Resmi...' : 'Download Resmi Audius (Rekomendasi)'}
                  </span>
                </button>
              )}

              {/* Option B: Salin Tautan Lagu */}
              <button
                onClick={handleCopyLink}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700/90 text-cyan-300 border border-cyan-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                {copySuccess ? <Check className="w-4 h-4 text-[#67FFD4]" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                <span>{copySuccess ? 'Tautan Disalin!' : 'Salin Tautan Lagu Audius'}</span>
              </button>

              {/* Option C: Buka VideoFK Search with encoded URL */}
              <button
                onClick={handleOpenVideoFK}
                className="w-full py-3 px-4 rounded-xl font-extrabold text-xs bg-cyan-950/80 hover:bg-cyan-900/80 text-[#00D9FF] border border-cyan-400/50 flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(0,217,255,0.2)] transition-all active:scale-[0.98]"
              >
                <Globe className="w-4 h-4 text-[#00D9FF]" />
                <span>Buka VideoFK Search</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70 ml-1" />
              </button>

              {/* Option D: Kembali ke Aplikasi */}
              <button
                onClick={handleCloseAll}
                className="w-full py-2.5 text-xs font-semibold text-slate-400 hover:text-white text-center transition-colors pt-2"
              >
                Kembali ke Aplikasi
              </button>
            </div>
          </div>
        ) : (
          /* ====================================================== */
          /* MODAL 1: UTAMA HALAMAN VERIFIKASI IZIN & LISENSI        */
          /* ====================================================== */
          <div className="space-y-4 animate-fade-in">
            {/* Header bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-[#00D9FF]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 id="download-modal-title" className="text-base font-bold text-white">
                    Verifikasi Izin & Lisensi
                  </h2>
                  <p className="text-xs text-cyan-400/80">
                    {isAudius ? 'Audius Open Audio Protocol (Default)' : 'Jamendo API Compliance Gate'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseAll}
                aria-label="Tutup jendela unduh"
                className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Track brief */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <img
                src={track.image}
                alt={track.name}
                className="w-14 h-14 rounded-xl object-cover border border-cyan-500/20 shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200';
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{track.name}</p>
                <p className="text-xs text-slate-400 truncate">{track.artist_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-semibold uppercase">
                    {track.provider || 'audius'}
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono">ID: {track.id}</span>
                </div>
              </div>
            </div>

            {/* Server Download Error Alert */}
            {downloadError ? (
              <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-300">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Gagal Mengunduh dari Server</span>
                </div>
                <p className="leading-relaxed">{downloadError}</p>
                <button
                  onClick={handleOpenPermalink}
                  className="w-full py-2 px-3 rounded-xl bg-rose-900/80 hover:bg-rose-800 text-white font-semibold flex items-center justify-center gap-1.5 transition-all mt-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Halaman Lagu di Audius</span>
                </button>
              </div>
            ) : (
              /* Compliance Status box */
              <div
                className={`p-3.5 rounded-2xl border ${
                  compliance.eligible
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                    : 'bg-slate-900/80 border-slate-700/60 text-slate-300'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {compliance.eligible ? (
                    <CheckCircle className="w-5 h-5 text-[#67FFD4] shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs">
                    <p className="font-semibold text-white mb-0.5">
                      {compliance.eligible ? 'Izin Unduh Artis Aktif' : 'Status Unduh'}
                    </p>
                    <p className="text-slate-300 leading-relaxed">{compliance.reason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Legal notice */}
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                <Info className="w-3.5 h-3.5" />
                <span>
                  {isAudius ? 'Ketentuan Lisensi Resmi Audius' : 'Ketentuan Lisensi Resmi Jamendo'}
                </span>
              </div>
              <p>
                {isAudius
                  ? 'Musik pada Audius diunggah langsung oleh artis/kreator independen. Hak unduh diatur sepenuhnya oleh artis per-track untuk penggunaan non-komersial.'
                  : 'Semua musik di Jamendo dilindungi oleh lisensi Creative Commons untuk keperluan non-komersial.'}
              </p>
            </div>

            {/* Action buttons list */}
            <div className="space-y-2">
              {/* Button 1: Download Resmi Audius (if allowed) */}
              {compliance.eligible && compliance.canDirectDownload && !downloadError && (
                <button
                  onClick={handleOfficialDownload}
                  disabled={isDownloading}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-[#00D9FF] to-[#67FFD4] text-slate-950 hover:brightness-110 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,217,255,0.3)] active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
                  <span>
                    {isDownloading ? 'Mengunduh File Resmi...' : 'Download Resmi Audius'}
                  </span>
                </button>
              )}

              {/* Button 2: VideoFK Option Button */}
              <button
                onClick={() => setShowVideoFKDialog(true)}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-cyan-950/80 hover:bg-cyan-900/80 text-[#00D9FF] border border-cyan-400/50 hover:border-cyan-300 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,217,255,0.25)] active:scale-[0.98] transition-all"
              >
                <Download className="w-4 h-4 text-[#00D9FF]" />
                <span>⬇ Download via VideoFK</span>
              </button>

              {/* Row: Putar Lagu & Buka di Audius */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handlePlayNow}
                  className="py-2.5 px-3 rounded-xl font-bold text-xs bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-black border border-cyan-500/40 flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Putar Lagu</span>
                </button>

                <button
                  onClick={handleOpenPermalink}
                  className="py-2.5 px-3 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka di {isAudius ? 'Audius' : 'Jamendo'}</span>
                </button>
              </div>

              <button
                onClick={handleCloseAll}
                className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 text-center transition-colors pt-1"
              >
                Kembali ke Aplikasi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
