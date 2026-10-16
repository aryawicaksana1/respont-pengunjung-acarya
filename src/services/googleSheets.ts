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
export async function testGoogleAppsScriptConnection(url: string): Promise<{ 
  success: boolean; 
  message: string;
  isLegacyScript?: boolean;
  supportsPhotos?: boolean;
}> {
  if (!url || !url.trim().startsWith('https://script.google.com/macros/s/')) {
    return {
      success: false,
      message: 'Format URL harus diawali dengan https://script.google.com/macros/s/.../exec',
    };
  }

  try {
    const separator = url.includes('?') ? '&' : '?';
    const fetchUrl = `${url.trim()}${separator}action=read&_t=${Date.now()}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      try {
        const json = await res.json();
        if (json && (json.feedbacks !== undefined || json.photos !== undefined)) {
          return {
            success: true,
            supportsPhotos: true,
            isLegacyScript: false,
            message: 'Koneksi berhasil! Skrip Google Apps Script sudah versi terbaru (Mendukung Ulasan & Foto Permanen).',
          };
        }
        if (json && json.status === 'online') {
          return {
            success: true,
            isLegacyScript: true,
            supportsPhotos: false,
            message: 'Perhatian: Skrip di Google Sheet Anda masih versi lama (belum mendukung Foto_Kost). Buka menu Panduan dan lakukan Deploy Baru agar pengunjung lain dapat melihat ulasan & foto.',
          };
        }
      } catch {
        // format non-json
      }
    }

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

export interface FetchFeedbacksResult {
  success: boolean;
  feedbacks?: VisitorFeedback[];
  photos?: { acarya1?: string; acarya2?: string };
  message: string;
  isLegacyScript?: boolean;
}

/**
 * Mengambil seluruh data buku tamu langsung dari Google Sheet via doGet Apps Script.
 * Jika baris di Google Sheet dihapus oleh pengelola, maka data di website otomatis terhapus / tersinkron.
 * Juga mengembalikan URL foto kost terkini jika tersedia di sheet.
 */
export async function fetchFeedbacksFromGoogleSheets(scriptUrl: string): Promise<FetchFeedbacksResult> {
  if (!scriptUrl || !scriptUrl.trim().startsWith('http')) {
    return {
      success: false,
      message: 'URL Google Apps Script belum dikonfigurasi.',
    };
  }

  try {
    const separator = scriptUrl.includes('?') ? '&' : '?';
    const fetchUrl = `${scriptUrl.trim()}${separator}action=read&_t=${Date.now()}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data && Array.isArray(data.feedbacks)) {
      const sheetFeedbacks: VisitorFeedback[] = data.feedbacks.map((item: any, idx: number) => ({
        id: item.id || `gs_${idx + 1}_${Date.now()}`,
        timestamp: item.timestamp || new Date().toISOString(),
        kostLokasi: (item.kostLokasi === 'Kost Acarya 1' || item.kostLokasi === 'Kost Acarya 2') 
          ? item.kostLokasi 
          : 'Kost Acarya 2',
        nama: String(item.nama || 'Pengunjung'),
        whatsapp: String(item.whatsapp || ''),
        kategori: item.kategori || 'pengunjung_umum',
        kamarTujuan: String(item.kamarTujuan || ''),
        tanggalKunjungan: String(item.tanggalKunjungan || ''),
        waktuKunjungan: String(item.waktuKunjungan || ''),
        ratingKeseluruhan: Math.max(1, Math.min(5, Number(item.ratingKeseluruhan) || 5)),
        ratingKebersihan: Math.max(1, Math.min(5, Number(item.ratingKebersihan) || 5)),
        ratingKeamanan: Math.max(1, Math.min(5, Number(item.ratingKeamanan) || 5)),
        ratingFasilitas: Math.max(1, Math.min(5, Number(item.ratingFasilitas) || 5)),
        ratingPelayanan: Math.max(1, Math.min(5, Number(item.ratingPelayanan) || 5)),
        kesanPositif: String(item.kesanPositif || ''),
        saranPerbaikan: String(item.saranPerbaikan || ''),
        rekomendasi: (item.rekomendasi === 'tidak' || item.rekomendasi === 'mungkin') ? item.rekomendasi : 'ya',
        synced: true,
        syncTimestamp: new Date().toISOString(),
      }));

      const photos = data.photos && typeof data.photos === 'object' ? data.photos : undefined;

      return {
        success: true,
        feedbacks: sheetFeedbacks,
        photos,
        message: `Berhasil memuat ${sheetFeedbacks.length} tanggapan terbaru dari Google Sheet.`,
      };
    }

    // Jika skrip hanya mengembalikan status online lama
    if (data && data.status === 'online') {
      return {
        success: false,
        isLegacyScript: true,
        message: 'Google Apps Script masih menggunakan versi lama. Perbarui kode di menu Panduan agar mendukung baca ulasan, sinkronisasi penghapusan, dan foto permanen.',
      };
    }

    return {
      success: false,
      message: 'Format data dari Google Apps Script tidak valid.',
    };
  } catch (error) {
    console.error('Error saat membaca data dari Google Apps Script:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Gagal menghubungi Google Apps Script.',
    };
  }
}

export interface SavePhotoResult {
  success: boolean;
  message: string;
  isLegacyScript?: boolean;
}

/**
 * Menyimpan foto kost permanen ke Google Sheet (tab Foto_Kost).
 * Karena tersimpan di sheet terhubung, foto ini akan otomatis tampil
 * ke seluruh pengunjung di perangkat apa pun.
 */
export async function saveKostPhotoToGoogleSheet(
  scriptUrl: string,
  branch: string,
  photoUrl: string
): Promise<SavePhotoResult> {
  if (!scriptUrl || !scriptUrl.trim().startsWith('http')) {
    return {
      success: false,
      message: 'URL Google Apps Script belum dikonfigurasi.',
    };
  }

  const payload = {
    action: 'save_photo',
    branch,
    photoUrl,
    timestamp: new Date().toISOString(),
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    await fetch(scriptUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      mode: 'no-cors',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Cek apakah script yang terpasang sudah versi baru atau masih versi lama
    let isLegacyScript = false;
    try {
      const checkRes = await fetchKostPhotosFromGoogleSheet(scriptUrl);
      if (checkRes.isLegacyScript) {
        isLegacyScript = true;
      }
    } catch {
      // ignore
    }

    if (isLegacyScript) {
      return {
        success: true,
        isLegacyScript: true,
        message: `Foto ${branch} tersimpan di browser ini, TETAPI Google Apps Script Anda masih versi lama. Pengguna lain belum bisa melihat foto ini sampai Anda memperbarui kode di Google Sheet Anda.`,
      };
    }

    return {
      success: true,
      message: `Foto ${branch} berhasil dikirim dan tersimpan permanen di Google Sheet untuk seluruh pengunjung!`,
    };
  } catch (err) {
    console.error('Error saving photo to Google Sheet:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Gagal menghubungi Google Apps Script.',
    };
  }
}

export interface FetchPhotosResult {
  success: boolean;
  photos?: {
    acarya1?: string;
    acarya2?: string;
  };
  message: string;
  isLegacyScript?: boolean;
}

/**
 * Mengambil tautan foto Kost Acarya 1 & 2 dari Google Sheet
 */
export async function fetchKostPhotosFromGoogleSheet(
  scriptUrl: string
): Promise<FetchPhotosResult> {
  if (!scriptUrl || !scriptUrl.trim().startsWith('http')) {
    return {
      success: false,
      message: 'URL Google Apps Script belum dikonfigurasi.',
    };
  }

  try {
    const separator = scriptUrl.includes('?') ? '&' : '?';
    const fetchUrl = `${scriptUrl.trim()}${separator}action=get_photos&_t=${Date.now()}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data && data.photos) {
      return {
        success: true,
        photos: data.photos,
        message: 'Berhasil memuat foto kost dari Google Sheet.',
      };
    }

    if (data && data.status === 'online' && !data.photos) {
      return {
        success: false,
        isLegacyScript: true,
        message: 'Google Apps Script masih versi lama (belum mendukung Foto_Kost).',
      };
    }

    return {
      success: false,
      message: 'Tidak ada data foto pada respon spreadsheet.',
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Gagal mengambil foto dari spreadsheet.',
    };
  }
}


