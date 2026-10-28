import React, { useState } from 'react';
import {
  User,
  Sliders,
  Shield,
  FileText,
  Activity,
  CheckCircle,
  ExternalLink,
  Info,
  Sparkles,
  Volume2,
  RefreshCw,
  LogOut,
  LogIn,
  Radio,
} from 'lucide-react';
import { UserProfile, AppSettings } from '../types/music.ts';

interface ProfileViewProps {
  user: UserProfile;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onToggleAuth: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  settings,
  onUpdateSettings,
  onToggleAuth,
}) => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'attribution' | null>(null);
  const [apiPing, setApiPing] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  const testApiHealth = async () => {
    setIsPinging(true);
    const start = Date.now();
    try {
      const res = await fetch('/api/app-config');
      const time = Date.now() - start;
      if (res.ok) {
        setApiPing(`Audius Online • Response ${time}ms`);
      } else {
        setApiPing(`HTTP ${res.status}`);
      }
    } catch {
      setApiPing('Offline / Fallback aktif');
    } finally {
      setIsPinging(false);
    }
  };

  return (
    <div className="space-y-5 pb-28 animate-fade-in">
      {/* Account Profile Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0B1C32] to-[#071122] border border-cyan-500/25 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="relative w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-[#00D9FF] shadow-[0_0_15px_rgba(0,217,255,0.25)]">
            <User className="w-7 h-7" />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#67FFD4] border-2 border-[#071122]" />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-base font-extrabold text-white truncate">
              {user.displayName}
            </h2>
            <p className="text-xs text-cyan-300 font-mono mt-0.5">
              UID: {user.uid.slice(0, 14)}...
            </p>
            <div className="inline-flex items-center gap-1 mt-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-[#67FFD4]" />
              <span>{user.isGuest ? 'Mode Tamu (Penyimpanan Lokal)' : 'Tersinkron ke Cloud'}</span>
            </div>
          </div>
        </div>

        {/* Sync / Sign-in toggle */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            {user.isGuest
              ? 'Sinkronkan favorit dan playlist ke akun cloud'
              : 'Akun aktif dan tersinkronisasi'}
          </p>
          <button
            onClick={onToggleAuth}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-black border border-cyan-500/30 flex items-center gap-1.5 transition-all"
          >
            {user.isGuest ? (
              <>
                <LogIn className="w-3.5 h-3.5" /> Masuk Akun
              </>
            ) : (
              <>
                <LogOut className="w-3.5 h-3.5" /> Keluar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Settings section */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 px-1 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          Pengaturan & Provider
        </h3>

        <div className="rounded-2xl bg-[#0B1C32]/70 border border-slate-800 divide-y divide-slate-800">
          {/* Default Provider Indicator */}
          <div className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Provider Utama</span>
                <span className="px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px]">
                  DEFAULT
                </span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Audius Open Audio Protocol (@audius/sdk)
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#67FFD4] px-2 py-1 rounded bg-slate-800 border border-slate-700">
              Audius API
            </span>
          </div>

          {/* Reduced Motion Toggle */}
          <div className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Mode Reduced Motion</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Nonaktifkan animasi partikel not musik di latar belakang
              </p>
            </div>
            <button
              onClick={() => onUpdateSettings({ reducedMotion: !settings.reducedMotion })}
              aria-label="Toggle Reduced Motion"
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.reducedMotion ? 'bg-[#00D9FF]' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${
                  settings.reducedMotion ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Theme Selection */}
          <div className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Tema Visual</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Pilihan gaya warna neon futuristik
              </p>
            </div>
            <select
              value={settings.theme}
              onChange={(e) => onUpdateSettings({ theme: e.target.value as any })}
              className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-cyan-400"
            >
              <option value="dark-neon">Dark Neon Techno</option>
              <option value="techno-high-contrast">High Contrast Neon</option>
            </select>
          </div>
        </div>
      </section>

      {/* System Diagnostics & API Status */}
      <section className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 px-1 flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          Status Integrasi Audius API
        </h3>

        <div className="p-3.5 rounded-2xl bg-[#0B1C32]/70 border border-slate-800 text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Audius REST / SDK:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-cyan-300">{apiPing || 'Online (Default)'}</span>
              <button
                onClick={testApiHealth}
                aria-label="Cek status server"
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <RefreshCw className={`w-3 h-3 ${isPinging ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Paket Resmi Kuota:</span>
            <span className="font-mono text-emerald-400">500k req/bln • 10 req/detik</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">API Key Aktif:</span>
            <span className="font-mono text-slate-300 text-[10px]">
              0x933750e552b6...b43c (Public Client)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Provider Cadangan:</span>
            <span className="font-mono text-slate-400">Jamendo v3.0 (Aktif jika dibutuhkan)</span>
          </div>
        </div>
      </section>

      {/* Policy and attribution links */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <button
          onClick={() => setActiveModal('attribution')}
          className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-cyan-300 border border-slate-700/60 font-semibold"
        >
          Atribusi Musik
        </button>
        <button
          onClick={() => setActiveModal('privacy')}
          className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 font-semibold"
        >
          Kebijakan Privasi
        </button>
        <button
          onClick={() => setActiveModal('terms')}
          className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 font-semibold"
        >
          Ketentuan Layanan
        </button>
      </div>

      {/* Attribution / Policy Modal */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
        >
          <div className="relative w-full max-w-md bg-[#0B1C32] border border-cyan-500/30 rounded-3xl p-5 shadow-2xl max-h-[80vh] overflow-y-auto no-scrollbar text-xs leading-relaxed text-slate-300">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                {activeModal === 'attribution' && 'Atribusi & Lisensi Musik (Audius)'}
                {activeModal === 'privacy' && 'Kebijakan Privasi'}
                {activeModal === 'terms' && 'Syarat & Ketentuan Penggunaan'}
              </h4>
              <button
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {activeModal === 'attribution' && (
              <div className="space-y-2">
                <p>
                  Musik pada aplikasi <strong>J-Music (Neon Music Hub)</strong> didistribusikan melalui{' '}
                  <a
                    href="https://audius.co"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#00D9FF] underline"
                  >
                    Audius Open Audio Protocol
                  </a>{' '}
                  sebagai provider default, menggunakan client API resmi.
                </p>
                <p>
                  Setiap karya adalah hak milik masing-masing kreator yang mengunggah ke jaringan Audius. Izin pengunduhan sepenuhnya ditentukan oleh status <code>downloadable</code> dan aturan lisensi kreator.
                </p>
                <p>
                  Provider sekunder: Jamendo Music API v3.0 di bawah lisensi Creative Commons resmi.
                </p>
              </div>
            )}

            {activeModal === 'privacy' && (
              <div className="space-y-2">
                <p>
                  1. <strong>Data Lokal:</strong> Dalam Mode Tamu, playlist dan lagu favorit Anda disimpan secara privat di peramban lokal Anda.
                </p>
                <p>
                  2. <strong>Tidak Menyimpan Data Finansial:</strong> Aplikasi tidak pernah meminta ataupun menyimpan password, PIN, atau informasi dompet digital Anda.
                </p>
                <p>
                  3. <strong>Kredensial Aman:</strong> Tidak ada Bearer Token atau rahasia sensitif yang diekspos di kode frontend.
                </p>
              </div>
            )}

            {activeModal === 'terms' && (
              <div className="space-y-2">
                <p>
                  1. Pengguna dapat mendengarkan streaming musik untuk penggunaan pribadi non-komersial.
                </p>
                <p>
                  2. Pengunduhan lagu hanya diperbolehkan untuk lagu yang secara eksplisit memiliki izin unduh dari kreator.
                </p>
                <p>
                  3. Donasi kepada pengembang (Johan) bersifat sukarela dan tanpa paksaan.
                </p>
              </div>
            )}

            <button
              onClick={() => setActiveModal(null)}
              className="mt-4 w-full py-2 bg-[#00D9FF] text-slate-950 font-bold rounded-xl"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
