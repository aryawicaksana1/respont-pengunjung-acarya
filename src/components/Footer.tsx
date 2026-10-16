import React from 'react';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  QrCode, 
  PenLine, 
  Wifi, 
  Sparkles,
  ExternalLink,
  Info
} from 'lucide-react';
import type { AppSettings } from '../types/feedback.ts';
import { formatWhatsAppNumber } from '../utils/feedback.ts';

interface FooterProps {
  settings: AppSettings;
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  onAdminLogout: () => void;
  onNavigateForm: () => void;
  onOpenInfo: () => void;
  onOpenQR: () => void;
  onNavigateAdmin: (target: 'dashboard' | 'guide') => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  isAdmin,
  onOpenAdminLogin,
  onAdminLogout,
  onNavigateForm,
  onOpenInfo,
  onOpenQR,
  onNavigateAdmin,
}) => {
  const waUrl = `https://wa.me/${formatWhatsAppNumber(settings.kostPhone)}?text=${encodeURIComponent(
    'Halo Pengelola Kost Acarya 2, saya ingin berkonsultasi seputar info kost / kunjungan.'
  )}`;

  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800">
      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-amber-200 flex items-center justify-center font-bold text-lg shadow-sm">
                A
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white block leading-tight">
                  Kost Acarya
                </span>
                <span className="text-xs text-stone-400 block leading-tight">
                  Cabang 1 & Cabang 2 Singaraja
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              Hunian kost mahasiswa dan profesional yang asri, bersih, aman, dan nyaman di Singaraja, Bali. Kami mengutamakan ketenangan, privasi, dan kebersamaan seluruh penghuni.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Pendapat Tamu Terhubung ke Google Sheet</span>
            </div>
          </div>

          {/* Quick Links: Navigasi Tamu */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <PenLine className="w-3.5 h-3.5 text-emerald-400" />
              <span>Navigasi Tamu</span>
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-400">
              <li>
                <button
                  onClick={onNavigateForm}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>Formulir Pendapat Kunjungan</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenInfo}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>Info Kost & Jam Bertamu</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenInfo}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>Tata Tertib Tamu & Pengunjung</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenQR}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cetak Barcode & QR Meja Tamu</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Lokasi 2 Cabang Kost Acarya */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>2 Lokasi Kost Singaraja</span>
            </h3>
            <div className="space-y-3 text-xs text-stone-400">
              <div className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/60">
                <span className="font-semibold text-teal-300 block mb-0.5">Kost Acarya 1</span>
                <span>Jl. Acarya I, Singaraja (Suasana Asri & Tenang)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/60">
                <span className="font-semibold text-emerald-300 block mb-0.5">Kost Acarya 2</span>
                <span>Desa Padang Keling, Singaraja (Dekat STAH Mpu Kuturan)</span>
              </div>
              <div className="flex items-center gap-2 text-stone-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>CCTV 24 Jam & Pagar Aman di Kedua Lokasi</span>
              </div>
            </div>
          </div>

          {/* Kontak & Jam Berkunjung */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Kontak & Kunjungan</span>
            </h3>
            <div className="space-y-3 text-xs sm:text-sm text-stone-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Singaraja, Buleleng, Bali</span>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-stone-200 block">Jam Bertamu:</span>
                  <span>{settings.visitingHours}</span>
                </div>
              </div>

              <div className="pt-1 flex flex-col gap-2">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-xs transition-colors shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp Pengelola ({settings.kostPhone})</span>
                </a>

                {settings.adminEmail && (
                  <a
                    href={`mailto:${settings.adminEmail}`}
                    className="inline-flex items-center gap-2 text-xs text-stone-400 hover:text-white transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{settings.adminEmail}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Panel Quick Bar & Bottom Footer Strip */}
      <div className="border-t border-stone-800 bg-stone-950 py-5 text-xs text-stone-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-stone-500 text-center sm:text-left">
            <span>© 2026 {settings.kostName}. Hak cipta dilindungi.</span>
            <span>·</span>
            <span>Buku Tamu & Survei Kunjungan</span>
          </div>

          {/* Admin Gated Trigger */}
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <div className="flex items-center gap-3 bg-emerald-950/80 border border-emerald-700/60 rounded-xl px-3.5 py-1.5 text-xs">
                <span className="flex items-center gap-1.5 text-emerald-300 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Mode Admin Aktif
                </span>
                <span className="text-emerald-800">|</span>
                <button
                  onClick={() => onNavigateAdmin('dashboard')}
                  className="text-stone-300 hover:text-white transition-colors underline"
                >
                  Buku Tamu
                </button>
                <span className="text-emerald-800">|</span>
                <button
                  onClick={() => onNavigateAdmin('guide')}
                  className="text-stone-300 hover:text-white transition-colors underline"
                >
                  Google Sheet
                </button>
                <span className="text-emerald-800">|</span>
                <button
                  onClick={onAdminLogout}
                  className="text-rose-400 hover:text-rose-300 font-semibold transition-colors"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-700 hover:border-stone-500 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white transition-all text-xs"
                title="Hanya untuk pemilik / pengelola Kost Acarya 2"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Akses Pengelola Kost (Login Admin)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
