import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Link as LinkIcon, 
  RotateCcw, 
  Check, 
  Sparkles, 
  Image as ImageIcon, 
  MapPin, 
  ZoomIn, 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowLeft,
  Cloud,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';
import type { KostBranch } from '../types/feedback.ts';
import { verifyAdminPin, normalizeImageUrl, compressImageFile } from '../utils/feedback.ts';

interface KostPhotoModalProps {
  branch: KostBranch;
  currentImage: string;
  onSaveImage: (branch: KostBranch, newImageUrl: string) => Promise<void> | void;
  onResetDefault: (branch: KostBranch) => void;
  onClose: () => void;
  isAdmin?: boolean;
  storedPin?: string;
  onAdminUnlocked?: () => void;
  isSavingOnline?: boolean;
  isLegacyScript?: boolean;
  onOpenGuide?: () => void;
}

export const PRESET_PHOTOS_ACARYA_1 = [
  {
    title: 'Tropis Asri Singaraja (Default)',
    url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
    desc: 'Nuansa hijau sejuk dengan tanaman hias dan teras teduh Banyuning.',
  },
  {
    title: 'Hunian Tropis Bali Asri',
    url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80',
    desc: 'Taman tropis, pencahayaan alami, dan suasana tenang.',
  },
  {
    title: 'Kost Minimalis 2 Lantai',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    desc: 'Desain bersih kontemporer dengan area parkir berpagar.',
  },
  {
    title: 'Kamar & Teras Santai',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    desc: 'Kamar luas, sirkulasi udara bebas, dan lorong rapi.',
  },
];

export const PRESET_PHOTOS_ACARYA_2 = [
  {
    title: 'Modern Padang Keling (Default)',
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    desc: 'Bangunan dua lantai modern di Desa Padang Keling, dekat kampus STAH Mpu Kuturan Singaraja.',
  },
  {
    title: 'Balkon Minimalis Cerah',
    url: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1200&q=80',
    desc: 'Aksen putih estetik dengan pencahayaan terang dan pengawasan CCTV.',
  },
  {
    title: 'Interior Kamar Nyaman',
    url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    desc: 'Kamar mandi dalam, kasur empuk, dan meja belajar nyaman.',
  },
];

export const KostPhotoModal: React.FC<KostPhotoModalProps> = ({
  branch,
  currentImage,
  onSaveImage,
  onResetDefault,
  onClose,
  isAdmin = false,
  storedPin = 'acaryasingaraja',
  onAdminUnlocked,
  isSavingOnline = false,
  isLegacyScript = false,
  onOpenGuide,
}) => {
  const [activeTab, setActiveTab] = useState<'view' | 'upload' | 'preset'>('view');
  const [urlInput, setUrlInput] = useState('');
  const [previewUrl, setPreviewUrl] = useState(currentImage);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Local admin verification state for in-modal unlocking
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const effectiveIsAdmin = isAdmin || isUnlocked;
  const presets = branch === 'Kost Acarya 1' ? PRESET_PHOTOS_ACARYA_1 : PRESET_PHOTOS_ACARYA_2;
  const isAcarya1 = branch === 'Kost Acarya 1';

  // Handle local file upload with smart Canvas compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!effectiveIsAdmin) {
      setUploadError('Hanya Admin yang memiliki hak mengganti foto kost.');
      return;
    }
    setUploadError(null);
    setSyncStatusMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Harap pilih file gambar (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal 10MB. Coba pilih foto lain.');
      return;
    }

    try {
      setIsCompressing(true);
      const optimizedDataUrl = await compressImageFile(file, 1280, 850, 0.82);
      setPreviewUrl(optimizedDataUrl);
      setIsCompressing(false);
      await onSaveImage(branch, optimizedDataUrl);
      setSyncStatusMsg('Foto berhasil diunggah dan disimpan permanen untuk semua pengunjung!');
      setActiveTab('view');
    } catch (err) {
      setIsCompressing(false);
      setUploadError('Gagal memproses gambar. Coba format file lain.');
    }
  };

  const handleApplyUrl = async () => {
    if (!effectiveIsAdmin) {
      setUploadError('Hanya Admin yang memiliki hak mengganti foto kost.');
      return;
    }
    if (!urlInput.trim()) return;
    try {
      const normalized = normalizeImageUrl(urlInput.trim());
      new URL(normalized);
      setPreviewUrl(normalized);
      setUrlInput('');
      setSyncStatusMsg('Tautan foto berhasil disimpan ke Google Sheet & aktif untuk semua pengunjung!');
      await onSaveImage(branch, normalized);
      setActiveTab('view');
    } catch {
      setUploadError('Format URL tidak valid. Pastikan diawali https://');
    }
  };

  const handleSelectPreset = async (url: string) => {
    if (!effectiveIsAdmin) {
      setUploadError('Hanya Admin yang memiliki hak mengganti foto kost.');
      return;
    }
    setPreviewUrl(url);
    setSyncStatusMsg('Preset foto terpilih dan disimpan permanen untuk semua pengunjung!');
    await onSaveImage(branch, url);
    setActiveTab('view');
  };

  const handleReset = () => {
    if (!effectiveIsAdmin) {
      return;
    }
    onResetDefault(branch);
    const defaultUrl = isAcarya1 ? PRESET_PHOTOS_ACARYA_1[0].url : PRESET_PHOTOS_ACARYA_2[0].url;
    setPreviewUrl(defaultUrl);
    setSyncStatusMsg('Foto berhasil direset ke foto bawaan awal.');
    setActiveTab('view');
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPin(pinInput, storedPin)) {
      setIsUnlocked(true);
      setPinError(false);
      setPinInput('');
      try {
        localStorage.setItem('kost_acarya_is_admin', 'true');
      } catch (err) {
        console.error(err);
      }
      onAdminUnlocked?.();
    } else {
      setPinError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Header with Back Button */}
        <div className="bg-stone-900 text-white p-5 sm:p-6 relative border-b border-stone-800 shrink-0">
          <div className="flex items-center justify-between gap-3 mb-2">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors border border-white/15"
              aria-label="Kembali ke formulir"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
                <ImageIcon className="w-4 h-4" />
                <span>Foto Bangunan & Kartu Kost</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2.5">
                <span>{branch}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-800 text-emerald-200 font-medium">
                  {isAcarya1 ? 'Cabang 1 · Banyuning' : 'Cabang 2 · Padang Keling'}
                </span>
              </h2>
            </div>

            {effectiveIsAdmin ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-800/90 text-emerald-200 border border-emerald-600/40">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>Mode Admin</span>
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-stone-800 text-stone-300 border border-stone-700">
                <Lock className="w-3 h-3 text-amber-400" />
                <span>Foto Dilindungi</span>
              </span>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-stone-200 px-4 pt-2 bg-stone-50 text-xs sm:text-sm font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('view')}
            className={`px-4 py-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'view'
                ? 'border-emerald-700 text-emerald-900 bg-white font-bold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <ZoomIn className="w-4 h-4" />
            <span>Lihat Foto Penuh</span>
          </button>
          
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-emerald-700 text-emerald-900 bg-white font-bold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            {effectiveIsAdmin ? <Upload className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5 text-amber-600" />}
            <span>Unggah Foto Sendiri</span>
            {!effectiveIsAdmin && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-800 font-bold ml-1">
                Admin
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('preset')}
            className={`px-4 py-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'preset'
                ? 'border-emerald-700 text-emerald-900 bg-white font-bold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            {effectiveIsAdmin ? <Sparkles className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5 text-amber-600" />}
            <span>Pilihan Estetik</span>
            {!effectiveIsAdmin && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-800 font-bold ml-1">
                Admin
              </span>
            )}
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {syncStatusMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between gap-2 shadow-2xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{syncStatusMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setSyncStatusMsg(null)}
                className="text-emerald-700 hover:text-emerald-950 font-bold text-sm px-1.5 py-0.5 rounded-md hover:bg-emerald-100"
              >
                ✕
              </button>
            </div>
          )}

          {/* Alert jika script Google Apps Script di spreadsheet masih versi lama */}
          {isLegacyScript && (
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs space-y-2 shadow-xs animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-extrabold text-amber-950 text-sm">
                    Penting: Kode Google Apps Script di Spreadsheet Anda Perlu Diperbarui!
                  </p>
                  <p className="text-amber-800 leading-relaxed text-xs">
                    Foto yang Anda ubah <strong>sudah tersimpan di peramban ini</strong>, tetapi <strong>pengunjung lain belum bisa melihatnya</strong> karena Google Apps Script di spreadsheet Anda masih menggunakan kode versi lama yang belum memiliki fitur penyimpanan foto permanen (tab <em>Foto_Kost</em>).
                  </p>
                </div>
              </div>
              {onOpenGuide && (
                <div className="pt-1 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenGuide();
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <span>Buka Panduan & Salin Kode Baru Sekarang</span>
                    <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 1: VIEW FULL PHOTO */}
          {activeTab === 'view' && (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-stone-950 aspect-[16/10] shadow-md border border-stone-200">
                <img
                  src={previewUrl}
                  alt={`Foto ${branch}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 mb-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {isAcarya1 
                        ? 'Jl. Acarya I, Banyuning, Singaraja, Bali' 
                        : 'Desa Padang Keling (Dekat STAH Mpu Kuturan), Singaraja, Bali'}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold">{branch}</h3>
                  <p className="text-xs text-stone-200 mt-0.5 line-clamp-2">
                    {isAcarya1
                      ? 'Hunian kost asri, tenang, sejuk, dan aman di Banyuning. Fasilitas lengkap dengan dapur bersama, kulkas, dan parkir motor aman.'
                      : 'Hunian modern strategis di Desa Padang Keling dekat kampus STAH Mpu Kuturan. Dilengkapi CCTV 24 jam, kamar mandi dalam, dan WiFi.'}
                  </p>
                </div>
              </div>

              {/* Action buttons under image */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                {effectiveIsAdmin ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('upload')}
                      className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-800 text-white hover:bg-emerald-900 transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Unggah Foto Asli {branch}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('preset')}
                      className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-stone-100 text-stone-800 hover:bg-stone-200 transition-colors flex items-center gap-1.5 border border-stone-200"
                    >
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Pilih Preset Foto</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors flex items-center gap-1 p-2"
                      title="Kembalikan ke foto bawaan awal"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Default</span>
                    </button>
                  </div>
                ) : (
                  <div className="w-full p-3.5 rounded-2xl bg-stone-100 border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-xs text-stone-600 text-center sm:text-left">
                      <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Hanya <strong>Admin pengelola</strong> yang dapat mengganti atau mengunggah foto kost.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('upload')}
                      className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs flex items-center gap-1.5 shrink-0 transition-colors"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      <span>Masuk Admin</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2 & 3: IF NOT ADMIN -> SHOW ADMIN PIN UNLOCK */}
          {!effectiveIsAdmin && (activeTab === 'upload' || activeTab === 'preset') && (
            <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 text-center space-y-4 max-w-md mx-auto my-4 animate-in fade-in duration-200">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
                <Lock className="w-6 h-6" />
              </div>
              
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  Akses Khusus Admin Pengelola
                </h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Untuk menjaga integritas informasi hunian, perubahan dan unggahan foto {branch} hanya dapat dilakukan oleh pemilik/admin resmi Kost Acarya.
                </p>
              </div>

              <form onSubmit={handleVerifyPin} className="space-y-3 pt-2 text-left">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Masukkan PIN Admin:
                  </label>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      value={pinInput}
                      onChange={(e) => {
                        setPinInput(e.target.value);
                        setPinError(false);
                      }}
                      placeholder="Masukkan PIN Admin Kost Acarya"
                      className={`w-full pl-3 pr-10 py-2.5 rounded-xl border text-sm font-mono focus:outline-hidden focus:ring-2 ${
                        pinError
                          ? 'border-rose-400 bg-rose-50/50 focus:ring-rose-500 text-rose-900'
                          : 'border-stone-300 focus:ring-emerald-700'
                      }`}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {pinError && (
                    <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      PIN salah. Masukkan PIN Admin yang sesuai.
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('view')}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-semibold text-xs transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-300" />
                    <span>Verifikasi PIN</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: UPLOAD (ONLY WHEN EFFECTIVE IS ADMIN) */}
          {effectiveIsAdmin && activeTab === 'upload' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs sm:text-sm text-emerald-950 flex items-start gap-3">
                <Cloud className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Penyimpanan Terpusat & Permanen: {branch}</p>
                  <p className="text-emerald-800 text-xs mt-0.5 leading-relaxed">
                    Setiap foto yang Anda unggah atau masukkan melalui link akan tersimpan di Google Sheet dan otomatis tampil ke seluruh pengunjung website di perangkat mana pun tanpa perlu diatur ulang.
                  </p>
                </div>
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {isCompressing && (
                <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-semibold flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-teal-700 animate-spin shrink-0" />
                  <span>Sedang mengoptimalkan resolusi gambar untuk pengunggahan cepat...</span>
                </div>
              )}

              {isSavingOnline && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-emerald-700 animate-spin shrink-0" />
                  <span>Sedang menyinkronkan foto ke Google Sheet...</span>
                </div>
              )}

              {/* File Drop / Select Area */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="kost-photo-file-input"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-emerald-400 hover:border-emerald-600 hover:bg-emerald-50/30 rounded-2xl p-6 sm:p-8 text-center transition-all flex flex-col items-center justify-center gap-3 bg-stone-50"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-900">
                    Klik untuk Memilih Foto dari HP / Komputer
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    Mendukung file JPG, PNG, atau WebP (Otomatis dikompresi agar hemat kuota)
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isCompressing || isSavingOnline}
                  className="mt-2 px-4 py-2 rounded-xl bg-emerald-800 text-white font-semibold text-xs shadow-xs hover:bg-emerald-900 transition-colors disabled:opacity-50"
                >
                  Pilih File Foto
                </button>
              </div>

              {/* Or paste link */}
              <div className="pt-2 border-t border-stone-200">
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Atau Masukkan Tautan / Link Gambar (URL):
                </label>
                <p className="text-[11px] text-stone-500 mb-2">
                  Mendukung link publik dari Google Drive, ImgBB, Unsplash, atau hosting gambar lainnya.
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="https://drive.google.com/file/d/... atau https://contoh.com/foto.jpg"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    disabled={isSavingOnline || !urlInput.trim()}
                    className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors shrink-0 disabled:opacity-50"
                  >
                    Terapkan URL
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRESETS (ONLY WHEN EFFECTIVE IS ADMIN) */}
          {effectiveIsAdmin && activeTab === 'preset' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <p className="text-xs text-stone-600">
                Pilih salah satu preset foto arsitektur berkualitas tinggi untuk merepresentasikan {branch}:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {presets.map((preset, idx) => {
                  const isCurrent = previewUrl === preset.url;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectPreset(preset.url)}
                      className={`cursor-pointer rounded-2xl border-2 overflow-hidden transition-all text-left flex flex-col justify-between ${
                        isCurrent
                          ? 'border-emerald-700 ring-2 ring-emerald-700/20 bg-emerald-50/40 shadow-xs'
                          : 'border-stone-200 hover:border-emerald-400 hover:shadow-xs'
                      }`}
                    >
                      <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden">
                        <img
                          src={preset.url}
                          alt={preset.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {isCurrent && (
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-800 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Sedang Digunakan</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-bold text-stone-900">{preset.title}</p>
                        <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">{preset.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Back Button */}
        <div className="bg-stone-50 border-t border-stone-200 p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-stone-500 text-center sm:text-left">
            {effectiveIsAdmin 
              ? 'Perubahan foto akan langsung terlihat pada kartu pemilihan di formulir.'
              : 'Foto ini digunakan sebagai identitas cabang Kost Acarya.'}
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs sm:text-sm hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Formulir</span>
          </button>
        </div>

      </div>
    </div>
  );
};
