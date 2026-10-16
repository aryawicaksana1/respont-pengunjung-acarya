import React, { useState } from 'react';
import { 
  Star, 
  Send, 
  User, 
  Phone, 
  Building2, 
  Calendar, 
  Clock, 
  Heart, 
  MessageSquare, 
  ThumbsUp, 
  AlertCircle, 
  Sparkles, 
  Shield, 
  Smile, 
  CheckCircle2,
  MapPin,
  Check,
  Home,
  Camera,
  Eye,
  ZoomIn
} from 'lucide-react';
import type { VisitorCategory, RecommendationChoice, VisitorFeedback, KostBranch } from '../types/feedback.ts';
import { validateFeedback, getRatingSentimentLabel } from '../utils/feedback.ts';
import { KostPhotoModal } from './KostPhotoModal.tsx';
import { KostAcarya1Illustration } from './KostAcaryaIllustrations.tsx';

interface FeedbackFormProps {
  onSubmit: (feedback: Omit<VisitorFeedback, 'id' | 'timestamp' | 'synced' | 'syncTimestamp' | 'syncError'>) => Promise<void>;
  isSubmitting: boolean;
  isSheetsConfigured: boolean;
  onOpenGuide: () => void;
  isAdmin?: boolean;
  adminPin?: string;
  onAdminLoginSuccess?: () => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  onSubmit,
  isSubmitting,
  isSheetsConfigured,
  onOpenGuide,
  isAdmin = false,
  adminPin = 'acaryasingaraja',
  onAdminLoginSuccess,
}) => {
  // Current date & time defaults
  const today = new Date();
  const defaultDate = today.toISOString().split('T')[0];
  const defaultTime = today.toTimeString().slice(0, 5);

  // Selected Kost Branch (Acarya 1 or Acarya 2)
  const [kostLokasi, setKostLokasi] = useState<KostBranch | null>(null);

  // Custom Kost photos (persisted in localStorage)
  const [acarya1Image, setAcarya1Image] = useState<string>(() => {
    try {
      return localStorage.getItem('kost_acarya_1_image') || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80';
    } catch {
      return 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80';
    }
  });

  const [acarya2Image, setAcarya2Image] = useState<string>(() => {
    try {
      return localStorage.getItem('kost_acarya_2_image') || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80';
    } catch {
      return 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80';
    }
  });

  const [photoModalBranch, setPhotoModalBranch] = useState<KostBranch | null>(null);

  const handleSaveCustomImage = (branch: KostBranch, newImageUrl: string) => {
    if (branch === 'Kost Acarya 1') {
      setAcarya1Image(newImageUrl);
      setImg1Error(false);
      try {
        localStorage.setItem('kost_acarya_1_image', newImageUrl);
      } catch (e) {
        console.warn('LocalStorage save failed', e);
      }
    } else {
      setAcarya2Image(newImageUrl);
      setImg2Error(false);
      try {
        localStorage.setItem('kost_acarya_2_image', newImageUrl);
      } catch (e) {
        console.warn('LocalStorage save failed', e);
      }
    }
  };

  const handleResetDefaultImage = (branch: KostBranch) => {
    if (branch === 'Kost Acarya 1') {
      const defaultUrl = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80';
      setAcarya1Image(defaultUrl);
      setImg1Error(false);
      try {
        localStorage.removeItem('kost_acarya_1_image');
      } catch (e) {
        console.warn('LocalStorage remove failed', e);
      }
    } else {
      const defaultUrl = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80';
      setAcarya2Image(defaultUrl);
      setImg2Error(false);
      try {
        localStorage.removeItem('kost_acarya_2_image');
      } catch (e) {
        console.warn('LocalStorage remove failed', e);
      }
    }
  };

  const [nama, setNama] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [kategori, setKategori] = useState<VisitorCategory>('calon_penghuni');
  const [kamarTujuan, setKamarTujuan] = useState('');
  const [tanggalKunjungan, setTanggalKunjungan] = useState(defaultDate);
  const [waktuKunjungan, setWaktuKunjungan] = useState(defaultTime);

  // Ratings
  const [ratingKeseluruhan, setRatingKeseluruhan] = useState<number>(5);
  const [ratingKebersihan, setRatingKebersihan] = useState<number>(5);
  const [ratingKeamanan, setRatingKeamanan] = useState<number>(5);
  const [ratingFasilitas, setRatingFasilitas] = useState<number>(5);
  const [ratingPelayanan, setRatingPelayanan] = useState<number>(5);

  // Qualitative feedback
  const [kesanPositif, setKesanPositif] = useState('');
  const [saranPerbaikan, setSaranPerbaikan] = useState('');
  const [rekomendasi, setRekomendasi] = useState<RecommendationChoice>('ya');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [img1Error, setImg1Error] = useState(false);
  const [img2Error, setImg2Error] = useState(false);

  const handleSelectKost = (branch: KostBranch) => {
    setKostLokasi(branch);
    if (errors.kostLokasi) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.kostLokasi;
        return next;
      });
    }
  };

  const handleAutofillDemo = () => {
    setKostLokasi('Kost Acarya 2');
    setNama('Rian Pratama');
    setWhatsapp('081234567890');
    setKategori('calon_penghuni');
    setKamarTujuan('Survei Kamar Lt 2');
    setRatingKeseluruhan(5);
    setRatingKebersihan(5);
    setRatingKeamanan(5);
    setRatingFasilitas(4);
    setRatingPelayanan(5);
    setKesanPositif('Suasana kost sangat tenang, asri, dan bersih. Kamar mandi luar wangi dan area parkirnya rapi.');
    setSaranPerbaikan('Bisa dipertimbangkan penambahan microwave atau dispenser air panas di dapur bersama.');
    setRekomendasi('ya');
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToValidate = {
      kostLokasi: kostLokasi || undefined,
      nama,
      whatsapp,
      kategori,
      kamarTujuan,
      tanggalKunjungan,
      waktuKunjungan,
      ratingKeseluruhan,
      ratingKebersihan,
      ratingKeamanan,
      ratingFasilitas,
      ratingPelayanan,
      kesanPositif,
      saranPerbaikan,
      rekomendasi,
    };

    const validation = validateFeedback(dataToValidate);
    if (!validation.isValid) {
      setErrors(validation.errors);
      if (validation.errors.kostLokasi) {
        const element = document.getElementById('kost-selection-section');
        element?.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 250, behavior: 'smooth' });
      }
      return;
    }

    setErrors({});
    await onSubmit({
      ...dataToValidate,
      kostLokasi: kostLokasi as KostBranch,
    });
  };

  // Helper for rendering star rating buttons
  const renderStarInput = (
    value: number,
    onChange: (val: number) => void,
    name: string,
    label: string
  ) => {
    return (
      <div className="flex items-center gap-1.5" role="group" aria-label={label}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1.5 text-stone-300 hover:text-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded-lg transition-transform active:scale-95"
            aria-label={`${name}: ${star} dari 5 bintang`}
          >
            <Star
              className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${
                star <= value ? 'text-amber-400 fill-amber-400' : 'text-stone-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const sentiment = getRatingSentimentLabel(ratingKeseluruhan);

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4 sm:px-6">
      {/* Hero Welcome Card */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-850 to-stone-900 rounded-3xl p-6 sm:p-10 text-white shadow-md relative overflow-hidden mb-8">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <span className="text-xs font-semibold tracking-wider uppercase text-amber-200 bg-emerald-950/70 border border-emerald-700/60 px-3 py-1 rounded-full backdrop-blur-xs">
              Kost Acarya Singaraja · Buku Tamu & Ulasan
            </span>
            <button
              type="button"
              onClick={handleAutofillDemo}
              className="text-xs font-semibold bg-white/15 hover:bg-white/25 text-white px-3.5 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 border border-white/20 active:scale-95"
              title="Isi form otomatis dengan contoh data nyata"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Contoh Data Cepat</span>
            </button>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Buku Tamu & Suara Pengunjung
          </h1>
          <p className="text-stone-200 text-sm sm:text-base leading-relaxed max-w-2xl">
            Selamat datang di Kost Acarya! Kami memiliki 2 lokasi hunian di Singaraja (<strong>Kost Acarya 1</strong> & <strong>Kost Acarya 2</strong>). Silakan pilih lokasi kost yang Anda kunjungi di bawah ini sebelum membagikan ulasan, kepuasan, dan saran perbaikan Anda.
          </p>

          <div className="mt-6 pt-5 border-t border-white/15 flex flex-wrap items-center gap-4 text-xs text-stone-300">
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              Tersimpan Otomatis ke Google Sheet Pengelola
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Home className="w-4 h-4 text-amber-300" />
              Pilih Acarya 1 atau Acarya 2
            </span>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-700/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Sheets Integration Notification */}
      {!isSheetsConfigured && (
        <div className="mb-8 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-amber-900">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-stone-900">Google Sheet Belum Dihubungkan</p>
              <p className="text-stone-600 text-xs sm:text-sm mt-0.5">
                Data tetap akan tersimpan rapi di perangkat ini. Sambungkan Google Apps Script agar tanggapan masuk otomatis ke spreadsheet.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenGuide}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-800 text-white hover:bg-amber-900 transition-colors shrink-0 self-start sm:self-auto"
          >
            Buka Panduan
          </button>
        </div>
      )}

      {/* STEP 1: Interactive Location Selection Cards (Kost Acarya 1 vs Kost Acarya 2) */}
      <div
        id="kost-selection-section"
        className={`bg-white rounded-3xl border transition-all p-6 sm:p-8 shadow-xs mb-8 ${
          errors.kostLokasi
            ? 'border-rose-400 ring-2 ring-rose-300 bg-rose-50/10'
            : kostLokasi
            ? 'border-emerald-200 bg-emerald-50/20'
            : 'border-stone-200'
        }`}
      >
        <div className="pb-4 mb-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-colors ${
                kostLokasi
                  ? 'bg-emerald-800 text-white'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              {kostLokasi ? <Check className="w-5 h-5 stroke-[3]" /> : '1'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <span>Pilih Lokasi Kost yang Dikunjungi</span>
                <span className="text-rose-500 font-bold">*</span>
              </h2>
              <p className="text-xs text-stone-500">
                Klik kartu foto di bawah ini untuk menentukan kost yang ingin Anda beri kritik atau saran
              </p>
            </div>
          </div>

          {kostLokasi && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-900 border border-emerald-300 text-xs font-bold self-start sm:self-auto animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Terpilih: {kostLokasi}</span>
            </div>
          )}
        </div>

        {/* Validation Error Banner for Kost Location */}
        {errors.kostLokasi && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs sm:text-sm font-medium flex items-center gap-2 animate-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errors.kostLokasi}</span>
          </div>
        )}

        {/* 2 Visual Interactive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Card 1: Kost Acarya 1 */}
          <div
            onClick={() => handleSelectKost('Kost Acarya 1')}
            className={`group cursor-pointer rounded-2xl border-2 transition-all duration-200 overflow-hidden flex flex-col justify-between ${
              kostLokasi === 'Kost Acarya 1'
                ? 'border-emerald-700 ring-4 ring-emerald-700/20 bg-emerald-50/50 shadow-md scale-[1.01]'
                : 'border-stone-200 bg-white hover:border-emerald-400 hover:shadow-md'
            }`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelectKost('Kost Acarya 1');
              }
            }}
            aria-pressed={kostLokasi === 'Kost Acarya 1'}
          >
            <div>
              {/* Photo Container */}
              <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                {!img1Error ? (
                  <img
                    src={acarya1Image}
                    alt="Foto Kost Acarya 1"
                    onError={() => setImg1Error(true)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full relative">
                    <KostAcarya1Illustration className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Overlays & Badges */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-stone-950/30 pointer-events-none" />

                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-stone-900/80 backdrop-blur-xs text-white border border-white/20">
                    Cabang 1
                  </span>
                  <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-emerald-800/90 text-amber-200 backdrop-blur-xs">
                    Singaraja
                  </span>
                </div>

                {/* Quick Photo Actions */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                  {kostLokasi === 'Kost Acarya 1' && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-md flex items-center gap-1 animate-in zoom-in-75">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Dipilih</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoModalBranch('Kost Acarya 1');
                    }}
                    className="p-1.5 rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur-xs transition-colors border border-white/20 shadow-xs"
                    title="Perbesar / Ganti Gambar Kost Acarya 1"
                    aria-label="Perbesar / Ganti Gambar Kost Acarya 1"
                  >
                    <ZoomIn className="w-4 h-4 text-amber-300" />
                  </button>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-lg font-extrabold tracking-tight leading-snug drop-shadow-sm">
                    Kost Acarya 1
                  </h3>
                  <p className="text-[11px] text-stone-200 flex items-center gap-1 drop-shadow-sm truncate">
                    <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Jl. Acarya I, Banyuning · Lingkungan Asri & Tenang</span>
                  </p>
                </div>
              </div>

              {/* Card Body Details */}
              <div className="p-4 sm:p-5 space-y-3">
                <div className="text-xs text-stone-600 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-medium text-stone-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                    <span>Kamar Nyaman, Suasana Sejuk & Tenang</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                    <span>Dapur Bersama, Kulkas & Ruang Tamu</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                    <span>Parkir Motor Berpagar Aman</span>
                  </div>
                </div>

                {/* Photo action pill */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                  <span className="text-stone-500 font-medium flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-stone-400" />
                    Foto Bangunan Acarya 1
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoModalBranch('Kost Acarya 1');
                    }}
                    className={`font-bold hover:underline flex items-center gap-1 transition-colors ${
                      isAdmin ? 'text-emerald-700 hover:text-emerald-900' : 'text-stone-600 hover:text-emerald-800'
                    }`}
                  >
                    <span>{isAdmin ? 'Kelola / Ganti Foto' : 'Lihat Foto'}</span>
                    {isAdmin ? <Camera className="w-3 h-3 text-emerald-700" /> : <Eye className="w-3 h-3 text-stone-500" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Selection Action Button */}
            <div className="p-4 pt-0">
              <div
                className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  kostLokasi === 'Kost Acarya 1'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-stone-100 group-hover:bg-emerald-50 text-stone-700 group-hover:text-emerald-900 border border-stone-200 group-hover:border-emerald-300'
                }`}
              >
                {kostLokasi === 'Kost Acarya 1' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>✓ Kost Acarya 1 Dipilih</span>
                  </>
                ) : (
                  <span>Klik untuk Pilih Kost Acarya 1</span>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Kost Acarya 2 */}
          <div
            onClick={() => handleSelectKost('Kost Acarya 2')}
            className={`group cursor-pointer rounded-2xl border-2 transition-all duration-200 overflow-hidden flex flex-col justify-between ${
              kostLokasi === 'Kost Acarya 2'
                ? 'border-emerald-700 ring-4 ring-emerald-700/20 bg-emerald-50/50 shadow-md scale-[1.01]'
                : 'border-stone-200 bg-white hover:border-emerald-400 hover:shadow-md'
            }`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelectKost('Kost Acarya 2');
              }
            }}
            aria-pressed={kostLokasi === 'Kost Acarya 2'}
          >
            <div>
              {/* Photo Container */}
              <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                {!img2Error ? (
                  <img
                    src={acarya2Image}
                    alt="Foto Kost Acarya 2"
                    onError={() => setImg2Error(true)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-950 to-stone-900 flex flex-col items-center justify-center text-white p-4">
                    <Building2 className="w-10 h-10 text-emerald-300 mb-2" />
                    <span className="font-bold text-sm">Kost Acarya 2</span>
                    <span className="text-[11px] text-emerald-200">Padang Keling · Dekat STAH</span>
                  </div>
                )}

                {/* Overlays & Badges */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-stone-950/30 pointer-events-none" />

                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-stone-900/80 backdrop-blur-xs text-white border border-white/20">
                    Cabang 2
                  </span>
                  <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-emerald-800/90 text-amber-200 backdrop-blur-xs">
                    Padang Keling
                  </span>
                </div>

                {/* Quick Photo Actions */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                  {kostLokasi === 'Kost Acarya 2' && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-md flex items-center gap-1 animate-in zoom-in-75">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Dipilih</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoModalBranch('Kost Acarya 2');
                    }}
                    className="p-1.5 rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur-xs transition-colors border border-white/20 shadow-xs"
                    title={isAdmin ? "Perbesar / Kelola Foto Kost Acarya 2" : "Lihat Foto Kost Acarya 2"}
                    aria-label="Lihat / Ganti Gambar Kost Acarya 2"
                  >
                    <ZoomIn className="w-4 h-4 text-amber-300" />
                  </button>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-lg font-extrabold tracking-tight leading-snug drop-shadow-sm">
                    Kost Acarya 2
                  </h3>
                  <p className="text-[11px] text-stone-200 flex items-center gap-1 drop-shadow-sm truncate">
                    <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Desa Padang Keling (Dekat STAH Mpu Kuturan)</span>
                  </p>
                </div>
              </div>

              {/* Card Body Details */}
              <div className="p-4 sm:p-5 space-y-3">
                <div className="text-xs text-stone-600 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-medium text-stone-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                    <span>Gedung Modern 2 Lantai, Kamar Mandi Dalam</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                    <span>Dekat Kampus STAH Mpu Kuturan Singaraja</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                    <span>Kamera CCTV 24 Jam, WiFi Cepat & Pagar Aman</span>
                  </div>
                </div>

                {/* Photo action pill */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                  <span className="text-stone-500 font-medium flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-stone-400" />
                    Foto Bangunan Acarya 2
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoModalBranch('Kost Acarya 2');
                    }}
                    className={`font-bold hover:underline flex items-center gap-1 transition-colors ${
                      isAdmin ? 'text-emerald-700 hover:text-emerald-900' : 'text-stone-600 hover:text-emerald-800'
                    }`}
                  >
                    <span>{isAdmin ? 'Kelola / Ganti Foto' : 'Lihat Foto'}</span>
                    {isAdmin ? <Camera className="w-3 h-3 text-emerald-700" /> : <Eye className="w-3 h-3 text-stone-500" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Selection Action Button */}
            <div className="p-4 pt-0">
              <div
                className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  kostLokasi === 'Kost Acarya 2'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-stone-100 group-hover:bg-emerald-50 text-stone-700 group-hover:text-emerald-900 border border-stone-200 group-hover:border-emerald-300'
                }`}
              >
                {kostLokasi === 'Kost Acarya 2' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>✓ Kost Acarya 2 Dipilih</span>
                  </>
                ) : (
                  <span>Klik untuk Pilih Kost Acarya 2</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Selected notification banner */}
        {kostLokasi && (
          <div className="mt-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm text-emerald-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                Formulir di bawah siap mencatat ulasan untuk: <strong>{kostLokasi}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setKostLokasi(kostLokasi === 'Kost Acarya 1' ? 'Kost Acarya 2' : 'Kost Acarya 1')}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline self-start sm:self-auto"
            >
              Ganti ke {kostLokasi === 'Kost Acarya 1' ? 'Kost Acarya 2' : 'Kost Acarya 1'}
            </button>
          </div>
        )}
      </div>

      {/* Main Survey Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 2: Data Pengunjung */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs">
          <div className="pb-4 mb-6 border-b border-stone-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                Data Diri & Identitas Kunjungan
              </h2>
              <p className="text-xs text-stone-500">
                {kostLokasi ? `Kunjungan ke ${kostLokasi}` : 'Agar pengelola mengenali kunjungan Anda'}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Nama */}
            <div>
              <label htmlFor="nama" className="block text-sm font-semibold text-stone-900 mb-1.5">
                Nama Lengkap Anda <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="nama"
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Rizky Kurniawan / Ibu Heni"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 ${
                    errors.nama
                      ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-stone-300 focus:ring-emerald-700 bg-white'
                  }`}
                />
              </div>
              {errors.nama && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.nama}
                </p>
              )}
            </div>

            {/* No WhatsApp */}
            <div>
              <label htmlFor="whatsapp" className="block text-sm font-semibold text-stone-900 mb-1.5">
                Nomor WhatsApp / HP <span className="text-stone-400 font-normal text-xs">(Opsional, untuk info/konfirmasi)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="whatsapp"
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 ${
                    errors.whatsapp
                      ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-stone-300 focus:ring-emerald-700 bg-white'
                  }`}
                />
              </div>
              {errors.whatsapp && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.whatsapp}
                </p>
              )}
            </div>

            {/* Kategori Kunjungan */}
            <div>
              <label htmlFor="kategori" className="block text-sm font-semibold text-stone-900 mb-1.5">
                Kategori Kunjungan ke {kostLokasi || 'Kost Acarya'} <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'calon_penghuni', label: 'Calon Penghuni', desc: 'Survei kamar / tanya sewa' },
                  { id: 'tamu_penghuni', label: 'Tamu Penghuni', desc: 'Menjenguk rekan/teman kos' },
                  { id: 'keluarga', label: 'Keluarga / Orang Tua', desc: 'Mengunjungi anak/kerabat' },
                  { id: 'vendor', label: 'Kurir / Rekan / Vendor', desc: 'Pengantaran / pekerjaan' },
                  { id: 'lainnya', label: 'Pengunjung Lainnya', desc: 'Kepentingan lainnya' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setKategori(item.id as VisitorCategory)}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      kategori === item.id
                        ? 'border-emerald-700 bg-emerald-50/60 ring-1 ring-emerald-700'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="text-sm font-semibold text-stone-900">{item.label}</div>
                    <div className="text-xs text-stone-500">{item.desc}</div>
                  </button>
                ))}
              </div>
              {errors.kategori && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.kategori}</p>
              )}
            </div>

            {/* Kamar / Penghuni Dituju jika Tamu */}
            {kategori === 'tamu_penghuni' && (
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                <label htmlFor="kamarTujuan" className="block text-sm font-semibold text-stone-900 mb-1.5">
                  Nomor Kamar atau Nama Teman Penghuni yang Dikunjungi <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    id="kamarTujuan"
                    type="text"
                    value={kamarTujuan}
                    onChange={(e) => setKamarTujuan(e.target.value)}
                    placeholder="Contoh: Kamar 12 (Andi) / Lantai 2"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 ${
                      errors.kamarTujuan
                        ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/20'
                        : 'border-stone-300 focus:ring-emerald-700 bg-white'
                    }`}
                  />
                </div>
                {errors.kamarTujuan && (
                  <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.kamarTujuan}</p>
                )}
              </div>
            )}

            {/* Tanggal & Waktu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tanggal" className="block text-sm font-semibold text-stone-900 mb-1.5">
                  Tanggal Kunjungan
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    id="tanggal"
                    type="date"
                    value={tanggalKunjungan}
                    onChange={(e) => setTanggalKunjungan(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="waktu" className="block text-sm font-semibold text-stone-900 mb-1.5">
                  Jam Kunjungan
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <input
                    id="waktu"
                    type="time"
                    value={waktuKunjungan}
                    onChange={(e) => setWaktuKunjungan(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Penilaian & Rating */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs">
          <div className="pb-4 mb-6 border-b border-stone-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                Penilaian Pengalaman di {kostLokasi || 'Kost Acarya'}
              </h2>
              <p className="text-xs text-stone-500">Berikan bintang 1 (sangat kurang) sampai 5 (sangat memuaskan)</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Rating Keseluruhan */}
            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 text-center">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1">
                Rating Kepuasan Keseluruhan {kostLokasi ? `(${kostLokasi})` : ''}
              </span>
              <div className="flex justify-center my-2">
                {renderStarInput(ratingKeseluruhan, setRatingKeseluruhan, 'Rating Keseluruhan', 'Rating Keseluruhan')}
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-white">
                <span className={sentiment.color.split(' ')[0]}>{sentiment.label}</span>
                <span className="text-stone-400">·</span>
                <span className="text-stone-600 font-normal">{sentiment.description}</span>
              </div>
            </div>

            {/* Aspek-Aspek Rinci */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-stone-900">Penilaian Aspek Spesifik:</h3>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl border border-stone-100 bg-stone-50/50">
                <div>
                  <span className="text-sm font-semibold text-stone-900 block">1. Kebersihan & Kenyamanan</span>
                  <span className="text-xs text-stone-500">Koridor, ruang tamu bersama, kamar mandi luar, keasrian tanaman</span>
                </div>
                {renderStarInput(ratingKebersihan, setRatingKebersihan, 'Kebersihan', 'Kebersihan & Kenyamanan')}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl border border-stone-100 bg-stone-50/50">
                <div>
                  <span className="text-sm font-semibold text-stone-900 block">2. Keamanan & Ketertiban</span>
                  <span className="text-xs text-stone-500">Pintu pagar, CCTV, area parkir, suasana tenang tidak bising</span>
                </div>
                {renderStarInput(ratingKeamanan, setRatingKeamanan, 'Keamanan', 'Keamanan & Ketertiban')}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl border border-stone-100 bg-stone-50/50">
                <div>
                  <span className="text-sm font-semibold text-stone-900 block">3. Fasilitas Kost</span>
                  <span className="text-xs text-stone-500">Koneksi WiFi, parkir kendaraan, dapur bersama / air minum dispenser</span>
                </div>
                {renderStarInput(ratingFasilitas, setRatingFasilitas, 'Fasilitas', 'Fasilitas Kost')}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl border border-stone-100 bg-stone-50/50">
                <div>
                  <span className="text-sm font-semibold text-stone-900 block">4. Pelayanan & Keramahan</span>
                  <span className="text-xs text-stone-500">Keramahan penjaga kost, kejelasan petunjuk, respon bantuan</span>
                </div>
                {renderStarInput(ratingPelayanan, setRatingPelayanan, 'Pelayanan', 'Pelayanan & Keramahan')}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Kesan & Kritik Saran */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs">
          <div className="pb-4 mb-6 border-b border-stone-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                Kritik, Saran & Pendapat untuk {kostLokasi || 'Kost Acarya'}
              </h2>
              <p className="text-xs text-stone-500">
                Suara Anda sangat berarti untuk kemajuan dan kenyamanan {kostLokasi || 'Kost Acarya'}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Kesan Positif */}
            <div>
              <label htmlFor="kesanPositif" className="block text-sm font-semibold text-stone-900 mb-1.5 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Hal yang Paling Berkesan atau Anda Sukai</span>
              </label>
              <textarea
                id="kesanPositif"
                rows={3}
                value={kesanPositif}
                onChange={(e) => setKesanPositif(e.target.value)}
                placeholder="Contoh: Suasana sejuk, kamar mandi sangat bersih, penjaga kos ramah saat survei kamar..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
              />
            </div>

            {/* Saran & Masukan */}
            <div>
              <label htmlFor="saranPerbaikan" className="block text-sm font-semibold text-stone-900 mb-1.5 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-700" />
                <span>Kritik, Masukan & Saran Perbaikan</span>
              </label>
              <textarea
                id="saranPerbaikan"
                rows={3}
                value={saranPerbaikan}
                onChange={(e) => setSaranPerbaikan(e.target.value)}
                placeholder="Contoh: Parkir motor bisa diberi kanopi tambahan, mohon tambahkan gantungan baju di area cuci..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
              />
            </div>

            {/* Rekomendasi */}
            <div>
              <label className="block text-sm font-semibold text-stone-900 mb-2 flex items-center gap-1.5">
                <ThumbsUp className="w-4 h-4 text-emerald-700" />
                <span>Apakah Anda bersedia merekomendasikan {kostLokasi || 'Kost Acarya'} ke teman atau kerabat?</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {[
                  { id: 'ya', label: 'Ya, Pasti!', desc: 'Sangat recommended' },
                  { id: 'mungkin', label: 'Mungkin', desc: 'Perlu pertimbangan' },
                  { id: 'tidak', label: 'Belum', desc: 'Belum sesuai kebutuhan' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRekomendasi(item.id as RecommendationChoice)}
                    className={`p-3.5 rounded-xl border text-left sm:text-center transition-all min-h-[48px] ${
                      rekomendasi === item.id
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-700'
                        : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <div className="text-sm">{item.label}</div>
                    <div className="text-[11px] font-normal text-stone-500 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.99]"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Menyimpan & Mengirim ke Google Sheet...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Kirim Pendapat Kunjungan</span>
              </>
            )}
          </button>
          <p className="text-center text-xs text-stone-500 mt-3 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            Tanggapan Anda langsung tercatat rapi secara otomatis ke spreadsheet.
          </p>
        </div>
      </form>

      {/* Kost Photo Viewer & Customizer Modal */}
      {photoModalBranch && (
        <KostPhotoModal
          branch={photoModalBranch}
          currentImage={photoModalBranch === 'Kost Acarya 1' ? acarya1Image : acarya2Image}
          onSaveImage={handleSaveCustomImage}
          onResetDefault={handleResetDefaultImage}
          onClose={() => setPhotoModalBranch(null)}
          isAdmin={isAdmin}
          storedPin={adminPin}
          onAdminUnlocked={onAdminLoginSuccess}
        />
      )}
    </div>
  );
};
