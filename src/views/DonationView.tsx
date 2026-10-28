import React, { useState } from 'react';
import { HeartHandshake, Copy, Check, ShieldCheck, AlertTriangle, Phone, Wallet, ExternalLink, HelpCircle } from 'lucide-react';

interface DonationViewProps {
  onBackToHome: () => void;
}

export const DonationView: React.FC<DonationViewProps> = ({ onBackToHome }) => {
  const [copied, setCopied] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'shopee' | 'gopay' | 'ovo' | 'dana'>('shopee');

  const DONATION_INFO = {
    title: 'Dukung Pengembangan Neon Music Hub',
    recipient: 'Johan',
    contact: '0813-41-300-100',
    methods: [
      {
        id: 'shopee' as const,
        name: 'ShopeePay',
        color: '#EE4D2D',
        badge: 'ShopeePay',
        steps: [
          'Buka aplikasi Shopee di ponsel Anda.',
          'Pilih menu ShopeePay → Transfer ke Kontak / Nomor HP.',
          'Ketik nomor kontak terverifikasi: 0813-41-300-100.',
          'Pastikan nama penerima tertuju kepada Johan sebelum konfirmasi.',
          'Masukkan nominal donasi sukarela dan selesaikan transaksi.'
        ]
      },
      {
        id: 'gopay' as const,
        name: 'GoPay',
        color: '#00AED6',
        badge: 'Gojek / GoPay',
        steps: [
          'Buka aplikasi Gojek atau GoPay.',
          'Pilih menu Transfer / Kirim ke Kontak Telepon.',
          'Ketik nomor tujuan: 0813-41-300-100.',
          'Cek verifikasi nama akun atas nama Johan.',
          'Kirimkan donasi sukarela untuk server & pengembangan aplikasi.'
        ]
      },
      {
        id: 'ovo' as const,
        name: 'OVO',
        color: '#4C3494',
        badge: 'OVO Cash',
        steps: [
          'Buka aplikasi OVO Anda.',
          'Pilih menu Transfer → Sesama OVO.',
          'Masukkan nomor ponsel: 0813-41-300-100.',
          'Periksa nama penerima Johan pada layar konfirmasi.',
          'Kirim donasi apresiasi.'
        ]
      },
      {
        id: 'dana' as const,
        name: 'DANA',
        color: '#118EEA',
        badge: 'Dompet DANA',
        steps: [
          'Buka aplikasi DANA di HP Android.',
          'Pilih menu Kirim → Kirim ke Nomor Telepon.',
          'Masukkan nomor: 0813-41-300-100.',
          'Pastikan penerima sesuai (Johan).',
          'Selesaikan pengiriman donasi.'
        ]
      }
    ]
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(DONATION_INFO.contact);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const currentMethod = DONATION_INFO.methods.find((m) => m.id === selectedMethod) || DONATION_INFO.methods[0];

  return (
    <div className="space-y-5 pb-28 animate-fade-in">
      {/* Top Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-[#0B1C32] via-[#071122] to-[#1a113a] border border-cyan-500/30 shadow-[0_0_30px_rgba(0,217,255,0.18)]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-[#00D9FF] flex items-center justify-center shadow-[0_0_15px_rgba(0,217,255,0.3)]">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              {DONATION_INFO.title}
            </h2>
            <p className="text-xs text-cyan-300/80 font-medium">J-Music Open Creator Support</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Neon Music Hub (J-Music) disediakan secara gratis dan legal dengan lisensi Creative Commons. Donasi sukarela Anda sangat berharga untuk pemeliharaan server proxy, kuota API, dan update fitur.
        </p>

        {/* Recipient Details Box */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Penerima Resmi
              </p>
              <p className="text-base font-extrabold text-white flex items-center gap-1.5 mt-0.5">
                <span>{DONATION_INFO.recipient}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  Terverifikasi
                </span>
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Kontak Donasi
              </p>
              <p className="text-sm font-mono font-bold text-[#00D9FF] mt-0.5">
                {DONATION_INFO.contact}
              </p>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-cyan-500/15 hover:bg-cyan-500/25 text-[#00D9FF] border border-cyan-500/40 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">Nomor Kontak Berhasil Disalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Salin Nomor Kontak (0813-41-300-100)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Payment methods selector */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 px-1 flex items-center gap-2">
          <Wallet className="w-4 h-4 text-cyan-400" />
          Pilihan Dompet Digital (E-Wallet)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DONATION_INFO.methods.map((method) => {
            const isSelected = selectedMethod === method.id;
            return (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  isSelected
                    ? 'bg-[#0B1C32] border-[#00D9FF] shadow-[0_0_15px_rgba(0,217,255,0.25)]'
                    : 'bg-[#0B1C32]/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full mx-auto mb-1.5"
                  style={{ backgroundColor: method.color }}
                />
                <p className="text-xs font-bold text-white">{method.name}</p>
                <span className="text-[10px] text-cyan-400/80">Petunjuk</span>
              </button>
            );
          })}
        </div>

        {/* Selected method instructions */}
        <div className="p-4 rounded-2xl bg-[#0B1C32]/80 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-700/50">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: currentMethod.color }}
              />
              Langkah Transfer via {currentMethod.name}
            </span>
            <span className="text-[10px] font-mono text-cyan-400">Penerima: Johan</span>
          </div>

          <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
            {currentMethod.steps.map((step, idx) => (
              <li key={idx} className="pl-1">
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Strict Compliance & Security notice from PDF page 9 */}
      <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-2 text-xs text-amber-200">
        <div className="flex items-center gap-2 font-bold text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Peringatan Keamanan & Ketentuan Resmi</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          <strong>Penting:</strong> Nomor kontak tidak otomatis berarti nomor akun penerima pada semua dompet digital. Selalu konfirmasikan ke pemilik sebelum melakukan transaksi transfer bernilai besar. Aplikasi ini <strong>tidak menghasilkan QRIS atau payment URL palsu</strong> demi menjaga integritas dan keamanan donatur.
        </p>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          <strong>Privasi Aman:</strong> Aplikasi tidak pernah meminta PIN, OTP, password e-wallet, atau nomor kartu perbankan Anda. Aplikasi ini tidak menyimpan kredensial pembayaran apapun.
        </p>
      </div>

      {/* Return to app button */}
      <button
        onClick={onBackToHome}
        className="w-full py-3 rounded-2xl font-bold text-xs bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-700 transition-colors"
      >
        Kembali ke Beranda Musik
      </button>
    </div>
  );
};
