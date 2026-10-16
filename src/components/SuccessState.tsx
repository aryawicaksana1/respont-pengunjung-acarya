import React from 'react';
import { CheckCircle2, RotateCcw, FileSpreadsheet, Heart, Share2 } from 'lucide-react';
import type { VisitorFeedback } from '../types/feedback.ts';
import { getVisitorCategoryLabel, formatWhatsAppNumber } from '../utils/feedback.ts';

interface SuccessStateProps {
  lastSubmission: VisitorFeedback;
  onReset: () => void;
  onOpenDashboard: () => void;
  kostPhone: string;
}

export const SuccessState: React.FC<SuccessStateProps> = ({
  lastSubmission,
  onReset,
  onOpenDashboard,
  kostPhone,
}) => {
  const waLink = `https://wa.me/${formatWhatsAppNumber(kostPhone)}?text=${encodeURIComponent(
    `Halo Pengelola ${lastSubmission.kostLokasi || 'Kost Acarya'}, saya ${lastSubmission.nama} baru saja mengisi buku tamu / survei kunjungan.`
  )}`;

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6">
      <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 shadow-sm text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center mb-6 shadow-xs animate-in zoom-in-50 duration-300">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          {lastSubmission.synced ? 'Tersimpan di Google Spreadsheet' : 'Tersimpan di Sistem Lokal'}
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-4 mb-2">
          Terima Kasih Banyak, {lastSubmission.nama}!
        </h1>
        <p className="text-stone-600 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
          Pendapat dan masukan Anda mengenai kunjungan ke <strong className="text-stone-900">{lastSubmission.kostLokasi || 'Kost Acarya'}</strong> telah berhasil kami catat. Setiap masukan sangat berharga untuk kenyamanan seluruh penghuni dan tamu kami.
        </p>

        {/* Summary Card */}
        <div className="my-8 p-5 rounded-2xl bg-stone-50 border border-stone-200 text-left space-y-3 text-xs sm:text-sm">
          <div className="flex justify-between items-center pb-2 border-b border-stone-200 text-stone-500">
            <span className="font-semibold text-emerald-900">{lastSubmission.kostLokasi || 'Kost Acarya'}</span>
            <span className="font-mono">{lastSubmission.tanggalKunjungan} · {lastSubmission.waktuKunjungan} WIB</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-stone-700">
            <div>
              <span className="text-stone-400 block text-[11px]">Kategori</span>
              <span className="font-semibold text-stone-900">{getVisitorCategoryLabel(lastSubmission.kategori)}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[11px]">Rating Keseluruhan</span>
              <span className="font-semibold text-amber-600 flex items-center gap-1">
                ★ {lastSubmission.ratingKeseluruhan} / 5
              </span>
            </div>
          </div>

          {lastSubmission.kamarTujuan && (
            <div>
              <span className="text-stone-400 block text-[11px]">Tujuan / Kamar</span>
              <span className="font-semibold text-stone-900">{lastSubmission.kamarTujuan}</span>
            </div>
          )}

          {lastSubmission.kesanPositif && (
            <div className="pt-2 border-t border-stone-100">
              <span className="text-stone-400 block text-[11px] flex items-center gap-1">
                <Heart className="w-3 h-3 text-rose-500" /> Yang Disukai:
              </span>
              <p className="italic text-stone-700 mt-0.5">&ldquo;{lastSubmission.kesanPositif}&rdquo;</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onReset}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-800 text-white font-semibold text-sm hover:bg-emerald-900 transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Isi Formulir Baru</span>
          </button>

          <button
            onClick={onOpenDashboard}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-stone-300 text-stone-800 font-semibold text-sm hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Lihat Rekap Tanggapan</span>
          </button>

          {kostPhone && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold text-sm hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4 text-emerald-700" />
              <span>Chat Pengelola Kost</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
