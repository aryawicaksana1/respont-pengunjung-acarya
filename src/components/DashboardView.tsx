import React, { useState } from 'react';
import { 
  Download, 
  Search, 
  Filter, 
  Star, 
  RefreshCw, 
  Sparkles, 
  Building2, 
  FileSpreadsheet,
  CheckCircle,
  Clock,
  ThumbsUp,
  MessageSquare,
  Shield,
  Layers,
  HeartHandshake
} from 'lucide-react';
import type { VisitorFeedback, VisitorCategory } from '../types/feedback.ts';
import { 
  getVisitorCategoryLabel, 
  formatIndonesianDate, 
  generateSpreadsheetCSV,
  calculateOverallAverage,
  RECOMMENDATION_LABELS 
} from '../utils/feedback.ts';

import { Home } from 'lucide-react';

interface DashboardViewProps {
  feedbacks: VisitorFeedback[];
  onSyncAll: () => Promise<void>;
  isSyncing: boolean;
  isSheetsConfigured: boolean;
  onOpenGuide: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  feedbacks,
  onSyncAll,
  isSyncing,
  isSheetsConfigured,
  onOpenGuide,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<'all' | 'Kost Acarya 1' | 'Kost Acarya 2'>('all');

  // Count by location
  const acarya1Count = feedbacks.filter((f) => f.kostLokasi === 'Kost Acarya 1').length;
  const acarya2Count = feedbacks.filter((f) => f.kostLokasi === 'Kost Acarya 2' || !f.kostLokasi).length;

  // Filter feedback
  const filteredFeedbacks = feedbacks.filter((f) => {
    const matchesSearch = 
      f.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.kamarTujuan && f.kamarTujuan.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.kesanPositif && f.kesanPositif.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.saranPerbaikan && f.saranPerbaikan.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || f.kategori === selectedCategory;
    const matchesLocation = 
      selectedLocation === 'all' || 
      (selectedLocation === 'Kost Acarya 1' && f.kostLokasi === 'Kost Acarya 1') ||
      (selectedLocation === 'Kost Acarya 2' && (f.kostLokasi === 'Kost Acarya 2' || !f.kostLokasi));

    return matchesSearch && matchesCategory && matchesLocation;
  });

  // Calculate KPIs on filtered view
  const totalCount = filteredFeedbacks.length;
  const avgOverall = totalCount > 0 
    ? (filteredFeedbacks.reduce((acc, curr) => acc + curr.ratingKeseluruhan, 0) / totalCount).toFixed(1)
    : '0.0';

  const avgKebersihan = totalCount > 0
    ? (filteredFeedbacks.reduce((acc, curr) => acc + curr.ratingKebersihan, 0) / totalCount).toFixed(1)
    : '0.0';

  const avgKeamanan = totalCount > 0
    ? (filteredFeedbacks.reduce((acc, curr) => acc + curr.ratingKeamanan, 0) / totalCount).toFixed(1)
    : '0.0';

  const avgFasilitas = totalCount > 0
    ? (filteredFeedbacks.reduce((acc, curr) => acc + curr.ratingFasilitas, 0) / totalCount).toFixed(1)
    : '0.0';

  const avgPelayanan = totalCount > 0
    ? (filteredFeedbacks.reduce((acc, curr) => acc + curr.ratingPelayanan, 0) / totalCount).toFixed(1)
    : '0.0';

  const recommendYesCount = filteredFeedbacks.filter((f) => f.rekomendasi === 'ya').length;
  const recommendPercent = totalCount > 0 ? Math.round((recommendYesCount / totalCount) * 100) : 0;
  const unsyncedCount = feedbacks.filter((f) => !f.synced).length;

  const handleDownloadCSV = () => {
    const csvContent = generateSpreadsheetCSV(filteredFeedbacks.length > 0 ? filteredFeedbacks : feedbacks);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `buku_tamu_kost_acarya_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Rekapitulasi Kunjungan Kost Acarya 1 & 2</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Buku Tamu & Indeks Kepuasan Pengunjung
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Daftar seluruh ulasan, kritik, dan saran pengunjung untuk Kost Acarya 1 & Kost Acarya 2.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {unsyncedCount > 0 && isSheetsConfigured && (
            <button
              onClick={onSyncAll}
              disabled={isSyncing}
              className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : `Kirim ${unsyncedCount} Data ke Sheet`}</span>
            </button>
          )}

          <button
            onClick={handleDownloadCSV}
            className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Ekspor CSV / Excel</span>
          </button>
        </div>
      </div>

      {/* Location Filter Strip (Kost Acarya 1 vs 2) */}
      <div className="bg-stone-100/80 p-1.5 rounded-2xl border border-stone-200/80 mb-6 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider px-3 hidden sm:inline">
          Filter Lokasi:
        </span>
        <button
          onClick={() => setSelectedLocation('all')}
          className={`flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
            selectedLocation === 'all'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          Semua Cabang ({feedbacks.length})
        </button>
        <button
          onClick={() => setSelectedLocation('Kost Acarya 1')}
          className={`flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            selectedLocation === 'Kost Acarya 1'
              ? 'bg-teal-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-teal-900 hover:bg-white/60'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Kost Acarya 1 ({acarya1Count})</span>
        </button>
        <button
          onClick={() => setSelectedLocation('Kost Acarya 2')}
          className={`flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            selectedLocation === 'Kost Acarya 2'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-emerald-900 hover:bg-white/60'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Kost Acarya 2 ({acarya2Count})</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
        {/* Total Kunjungan */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 block mb-1">
            Total Tamu ({selectedLocation === 'all' ? 'Semua' : selectedLocation})
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-mono tabular-nums">
            {totalCount}
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">
            Acarya 1: {acarya1Count} · Acarya 2: {acarya2Count}
          </span>
        </div>

        {/* Rating Keseluruhan */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 block mb-1">Skor Rata-Rata</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-500 font-mono tabular-nums">
              {avgOverall}
            </span>
            <span className="text-xs text-stone-400">/ 5.0</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-700 font-medium">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Tingkat Kepuasan</span>
          </div>
        </div>

        {/* Kebersihan & Keamanan */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 block mb-1">Kebersihan & Asri</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-mono tabular-nums">
              {avgKebersihan}
            </span>
            <span className="text-xs text-stone-400">/ 5.0</span>
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" /> Area bersama & toilet
          </span>
        </div>

        {/* Keamanan & Ketertiban */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 block mb-1">Keamanan & Tertib</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-mono tabular-nums">
              {avgKeamanan}
            </span>
            <span className="text-xs text-stone-400">/ 5.0</span>
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-600" /> Pagar & ketenangan
          </span>
        </div>

        {/* Rekomendasi */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs col-span-2 lg:col-span-1">
          <span className="text-xs font-semibold text-stone-500 block mb-1">Rekomendasi</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-800 font-mono tabular-nums">
            {recommendPercent}%
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block flex items-center gap-1">
            <ThumbsUp className="w-3 h-3 text-emerald-600" /> Bersedia referensikan
          </span>
        </div>
      </div>

      {/* Aspect Rating Mini Summary Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs mb-8">
        <h2 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
          <span>
            Rincian 4 Pilar Pengalaman {selectedLocation === 'all' ? 'Kost Acarya (Semua Cabang)' : selectedLocation}:
          </span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between">
            <span className="text-xs text-stone-600">Kebersihan Lingkungan</span>
            <div className="flex items-center gap-1 font-bold font-mono text-emerald-800 text-xs">
              <span>{avgKebersihan}</span>
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline" />
            </div>
          </div>
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between">
            <span className="text-xs text-stone-600">Keamanan & Ketertiban</span>
            <div className="flex items-center gap-1 font-bold font-mono text-emerald-800 text-xs">
              <span>{avgKeamanan}</span>
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline" />
            </div>
          </div>
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between">
            <span className="text-xs text-stone-600">Fasilitas Kost (WiFi/Parkir)</span>
            <div className="flex items-center gap-1 font-bold font-mono text-emerald-800 text-xs">
              <span>{avgFasilitas}</span>
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline" />
            </div>
          </div>
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between">
            <span className="text-xs text-stone-600">Pelayanan & Keramahan</span>
            <div className="flex items-center gap-1 font-bold font-mono text-emerald-800 text-xs">
              <span>{avgPelayanan}</span>
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, kamar, saran..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-stone-50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-stone-400 shrink-0" />
          {[
            { id: 'all', label: 'Semua Kunjungan' },
            { id: 'calon_penghuni', label: 'Calon Penghuni' },
            { id: 'tamu_penghuni', label: 'Tamu Penghuni' },
            { id: 'keluarga', label: 'Keluarga' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:text-stone-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* List of Visitor Reviews */}
      {filteredFeedbacks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <MessageSquare className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-900">Belum Ada Tanggapan Ditemukan</h3>
          <p className="text-stone-500 text-xs sm:text-sm mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'Tidak ada data pengunjung yang cocok dengan kata kunci pencarian Anda.'
              : 'Belum ada tanggapan masuk. Silakan isi formulir atau bagikan QR Code.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFeedbacks.map((f) => {
            const overallScore = calculateOverallAverage({
              ratingKeseluruhan: f.ratingKeseluruhan,
              ratingKebersihan: f.ratingKebersihan,
              ratingKeamanan: f.ratingKeamanan,
              ratingFasilitas: f.ratingFasilitas,
              ratingPelayanan: f.ratingPelayanan,
            });

            return (
              <div
                key={f.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:border-stone-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top card info */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-sm shrink-0">
                        {f.nama.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <h4 className="text-sm font-bold text-stone-900 leading-tight">{f.nama}</h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                              f.kostLokasi === 'Kost Acarya 1'
                                ? 'bg-teal-50 text-teal-800 border-teal-300'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            }`}
                          >
                            {f.kostLokasi === 'Kost Acarya 1' ? (
                              <Home className="w-2.5 h-2.5 text-teal-700" />
                            ) : (
                              <Building2 className="w-2.5 h-2.5 text-emerald-700" />
                            )}
                            <span>{f.kostLokasi || 'Kost Acarya 2'}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-stone-500">
                          <span>{getVisitorCategoryLabel(f.kategori)}</span>
                          {f.kamarTujuan && (
                            <>
                              <span>·</span>
                              <span className="font-medium text-stone-700">{f.kamarTujuan}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>{f.ratingKeseluruhan}</span>
                      </div>
                      <span className="text-[10px] text-stone-400 block font-mono">
                        Rata-rata: {overallScore}
                      </span>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center gap-2 text-[11px] text-stone-400 my-2.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{f.tanggalKunjungan} jam {f.waktuKunjungan} WIB</span>
                    <span>·</span>
                    <span className={f.synced ? 'text-emerald-700 font-medium' : 'text-stone-400'}>
                      {f.synced ? 'Tersimpan di Sheet' : 'Tersimpan Lokal'}
                    </span>
                  </div>

                  {/* Aspect ratings */}
                  <div className="grid grid-cols-4 gap-1.5 my-3 text-center text-[10px] text-stone-600">
                    <div className="p-1.5 rounded-lg bg-stone-50 border border-stone-100">
                      <span className="block text-stone-400">Kebersihan</span>
                      <span className="font-bold text-stone-900">{f.ratingKebersihan}★</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-stone-50 border border-stone-100">
                      <span className="block text-stone-400">Keamanan</span>
                      <span className="font-bold text-stone-900">{f.ratingKeamanan}★</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-stone-50 border border-stone-100">
                      <span className="block text-stone-400">Fasilitas</span>
                      <span className="font-bold text-stone-900">{f.ratingFasilitas}★</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-stone-50 border border-stone-100">
                      <span className="block text-stone-400">Pelayanan</span>
                      <span className="font-bold text-stone-900">{f.ratingPelayanan}★</span>
                    </div>
                  </div>

                  {/* Kesan & Saran */}
                  {f.kesanPositif && (
                    <div className="my-2 p-2.5 rounded-xl bg-emerald-50/40 border border-emerald-100 text-xs">
                      <span className="font-semibold text-emerald-900 block mb-0.5">Hal yang Disukai:</span>
                      <p className="text-stone-700 italic">&ldquo;{f.kesanPositif}&rdquo;</p>
                    </div>
                  )}

                  {f.saranPerbaikan && (
                    <div className="my-2 p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                      <span className="font-semibold text-stone-900 block mb-0.5">Saran & Masukan:</span>
                      <p className="text-stone-700">&ldquo;{f.saranPerbaikan}&rdquo;</p>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3.5 h-3.5 text-emerald-700" />
                    Rekomendasi: <strong>{RECOMMENDATION_LABELS[f.rekomendasi]}</strong>
                  </span>
                  {f.whatsapp && (
                    <span className="font-mono text-stone-400">{f.whatsapp}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
