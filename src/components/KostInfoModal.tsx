import React from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Phone, 
  CheckCircle2, 
  Home, 
  ArrowLeft, 
  Sparkles,
  Building2,
  Navigation,
  MessageCircle,
  Wifi,
  KeyRound
} from 'lucide-react';
import type { AppSettings } from '../types/feedback.ts';
import { formatWhatsAppNumber } from '../utils/feedback.ts';

interface KostInfoModalProps {
  settings: AppSettings;
  onClose: () => void;
}

export const KostInfoModal: React.FC<KostInfoModalProps> = ({
  settings,
  onClose,
}) => {
  const waUrl = `https://wa.me/${formatWhatsAppNumber(settings.kostPhone)}?text=${encodeURIComponent(
    'Halo Pengelola Kost Acarya, saya ingin bertanya seputar info kost dan kunjungan.'
  )}`;

  const acarya1Image = localStorage.getItem('kost_acarya_1_image') || 
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80';
  const acarya2Image = localStorage.getItem('kost_acarya_2_image') || 
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Header with Prominent Back Button */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-5 sm:p-6 relative border-b border-emerald-800/60 shrink-0">
          <div className="flex items-center justify-between gap-3 mb-3">
            {/* Top Back Button */}
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-xs transition-colors border border-white/20"
              aria-label="Kembali ke Halaman Sebelumnya"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Tutup Informasi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-1">
            <Home className="w-4 h-4 text-amber-400" />
            <span>Profil Hunian & Buku Panduan Tamu</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Informasi Kost Acarya 1 & 2
          </h2>
          <p className="text-emerald-100/90 text-xs sm:text-sm mt-1 leading-relaxed">
            Dua cabang hunian strategis di Singaraja dengan lingkungan asri, aman, dan tertib.
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-sm flex-1">
          
          {/* Section: Lokasi 2 Cabang */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <span>2 Lokasi Cabang Kost</span>
              </span>
              <span className="text-[11px] text-stone-400 font-medium">Singaraja, Buleleng, Bali</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Acarya 1 */}
              <div className="rounded-2xl border border-teal-200 bg-teal-50/40 overflow-hidden flex flex-col justify-between shadow-xs hover:border-teal-300 transition-all">
                <div>
                  <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden">
                    <img
                      src={acarya1Image}
                      alt="Kost Acarya 1"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-900/90 text-teal-100 backdrop-blur-xs border border-white/20 shadow-xs">
                        Cabang 1
                      </span>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-stone-900 text-base">Kost Acarya 1</h3>
                    <p className="text-stone-600 text-xs flex items-start gap-1.5 leading-relaxed">
                      <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                      <span>Jl. Acarya I, Banyuning, Singaraja, Bali</span>
                    </p>
                    <div className="pt-2 border-t border-teal-200/60 space-y-1.5 text-xs text-stone-600">
                      <div className="flex items-center gap-1.5 font-medium text-stone-800">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>Karakter: Suasana Asri, Sejuk & Tenang</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Dapur bersama lengkap kulkas</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Parkir motor berpagar aman</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acarya 2 */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 overflow-hidden flex flex-col justify-between shadow-xs hover:border-emerald-300 transition-all">
                <div>
                  <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden">
                    <img
                      src={acarya2Image}
                      alt="Kost Acarya 2"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-900/90 text-emerald-100 backdrop-blur-xs border border-white/20 shadow-xs">
                        Cabang 2
                      </span>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-stone-900 text-base">Kost Acarya 2</h3>
                    <p className="text-stone-600 text-xs flex items-start gap-1.5 leading-relaxed font-medium text-emerald-950">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      <span>Desa Padang Keling (Dekat STAH Mpu Kuturan), Singaraja, Bali</span>
                    </p>
                    <div className="pt-2 border-t border-emerald-200/60 space-y-1.5 text-xs text-stone-600">
                      <div className="flex items-center gap-1.5 font-medium text-stone-800">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Karakter: Gedung Modern Strategis</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Dekat kampus STAH Mpu Kuturan</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Kamera CCTV 24 Jam & WiFi Cepat</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Jam Bertamu & Kunjungan */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-5 h-5 text-amber-800" />
            </div>
            <div className="space-y-1 flex-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block">
                Jam Berkunjung / Bertamu
              </span>
              <p className="font-bold text-stone-900 text-sm">
                {settings.visitingHours}
              </p>
              <p className="text-xs text-amber-950/80 leading-relaxed">
                Berlaku di Kost Acarya 1 & Acarya 2 untuk menjaga ketenangan, keamanan, dan waktu istirahat seluruh penghuni kost.
              </p>
            </div>
          </div>

          {/* Tata Tertib & Keamanan */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Tata Tertib Utama Tamu & Pengunjung</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-stone-600">
              <div className="p-2.5 rounded-xl bg-white border border-stone-200/70 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Tamu lawan jenis diterima di ruang tamu atau teras bersama.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-stone-200/70 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Kendaraan diparkir rapi di area parkir dan dikunci stang.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-stone-200/70 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Menjaga kebersihan dan membuang sampah pada tempatnya.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-stone-200/70 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Menjaga ketenangan bersama dan tidak memutar musik keras.</span>
              </div>
            </div>
          </div>

          {/* Kontak Langsung Pengelola */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
              Ada Pertanyaan Seputar Kost?
            </span>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Hubungi Pengelola via WhatsApp ({settings.kostPhone})</span>
            </a>
          </div>
        </div>

        {/* Modal Footer with Clear Back Button */}
        <div className="bg-stone-50 border-t border-stone-200 p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-stone-500 text-center sm:text-left">
            Siap memberikan kritik, saran, atau kesan Anda?
          </p>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Formulir</span>
          </button>
        </div>

      </div>
    </div>
  );
};
