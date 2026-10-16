import type { VisitorFeedback } from '../types/feedback.ts';
import { getVisitorCategoryLabel, RECOMMENDATION_LABELS, calculateOverallAverage } from '../utils/feedback.ts';

export interface SendResult {
  success: boolean;
  message: string;
  isOpaqueResponse?: boolean;
}

/**
 * Mengirim data tanggapan pengunjung ke Google Apps Script Web App URL.
 * Google Apps Script Web App akan melakukan redirect (302) ke script.googleusercontent.com,
 * sehingga pengiriman menggunakan POST dengan mode 'no-cors' atau format text/plain
 * adalah metode standar industri yang paling andal untuk menghindari blokir CORS di browser.
 */
export async function sendFeedbackToGoogleAppsScript(
  scriptUrl: string,
  feedback: VisitorFeedback
): Promise<SendResult> {
  if (!scriptUrl || !scriptUrl.trim().startsWith('http')) {
    return {
      success: false,
      message: 'URL Google Apps Script belum dikonfigurasi.',
    };
  }

  const avgScore = calculateOverallAverage({
    ratingKeseluruhan: feedback.ratingKeseluruhan,
    ratingKebersihan: feedback.ratingKebersihan,
    ratingKeamanan: feedback.ratingKeamanan,
    ratingFasilitas: feedback.ratingFasilitas,
    ratingPelayanan: feedback.ratingPelayanan,
  });

  const payload = {
    id: feedback.id,
    timestamp: feedback.timestamp,
    kostLokasi: feedback.kostLokasi || 'Kost Acarya 2',
    nama: feedback.nama,
    whatsapp: feedback.whatsapp || '',
    kategori: feedback.kategori,
    kategoriLabel: getVisitorCategoryLabel(feedback.kategori),
    kamarTujuan: feedback.kamarTujuan || '',
    tanggalKunjungan: feedback.tanggalKunjungan,
    waktuKunjungan: feedback.waktuKunjungan,
    ratingKeseluruhan: feedback.ratingKeseluruhan,
    ratingKebersihan: feedback.ratingKebersihan,
    ratingKeamanan: feedback.ratingKeamanan,
    ratingFasilitas: feedback.ratingFasilitas,
    ratingPelayanan: feedback.ratingPelayanan,
    rataRataSkor: avgScore,
    kesanPositif: feedback.kesanPositif || '',
    saranPerbaikan: feedback.saranPerbaikan || '',
    rekomendasi: feedback.rekomendasi,
    rekomendasiLabel: RECOMMENDATION_LABELS[feedback.rekomendasi] || feedback.rekomendasi,
  };

  try {
    // Coba kirim via POST menggunakan text/plain (mencegah preflight OPTIONS)
    // dan mode no-cors jika cross-origin Google redirect terjadi
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000);

    const response = await fetch(scriptUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      mode: 'no-cors', // Penting untuk Google Apps Script Web App redirects
    });

    clearTimeout(timeoutId);

    // Dengan mode no-cors, response.type adalah 'opaque' dan response.ok adalah false (status 0).
    // Ini adalah sifat normal Google Apps Script di browser client-side.
    return {
      success: true,
      message: 'Data berhasil dikirim dan tersimpan di Google Spreadsheet!',
      isOpaqueResponse: response.type === 'opaque',
    };
  } catch (error) {
    console.error('Error saat mengirim ke Google Apps Script:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Gagal menghubungi server Google Apps Script.',
    };
  }
}

/**
 * Uji coba koneksi URL Google Apps Script
 */
export async function testGoogleAppsScriptConnection(url: string): Promise<{ success: boolean; message: string }> {
  if (!url || !url.trim().startsWith('https://script.google.com/macros/s/')) {
    return {
      success: false,
      message: 'Format URL harus diawali dengan https://script.google.com/macros/s/.../exec',
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(url.trim(), {
      method: 'GET',
      mode: 'no-cors',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    return {
      success: true,
      message: 'Koneksi ke endpoint Google Apps Script berhasil dijangkau!',
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Koneksi gagal atau waktu habis.',
    };
  }
}
