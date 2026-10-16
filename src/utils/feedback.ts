import type { VisitorCategory, RecommendationChoice, VisitorFeedback } from '../types/feedback.ts';

export const CATEGORY_LABELS: Record<VisitorCategory, string> = {
  calon_penghuni: 'Calon Penghuni (Survei Kamar)',
  tamu_penghuni: 'Tamu dari Penghuni Kost',
  keluarga: 'Keluarga / Orang Tua Penghuni',
  vendor: 'Kurir / Vendor / Rekan',
  lainnya: 'Pengunjung Lainnya',
};

export const RECOMMENDATION_LABELS: Record<RecommendationChoice, string> = {
  ya: 'Pasti Merekomendasikan',
  mungkin: 'Mungkin',
  tidak: 'Belum untuk Saat Ini',
};

export function getVisitorCategoryLabel(kategori: string): string {
  return CATEGORY_LABELS[kategori as VisitorCategory] || kategori || 'Pengunjung';
}

export function verifyAdminPin(enteredPin: string, storedPin?: string): boolean {
  if (!enteredPin) return false;
  const target = (storedPin || 'acaryasingaraja').trim().toLowerCase();
  return enteredPin.trim().toLowerCase() === target;
}

export function formatWhatsAppNumber(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    return '62' + cleaned.slice(1);
  }
  if (cleaned.startsWith('62')) {
    return cleaned;
  }
  if (cleaned.length >= 8) {
    return '62' + cleaned;
  }
  return cleaned;
}

export function validateFeedback(data: Partial<VisitorFeedback>): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.kostLokasi) {
    errors.kostLokasi = 'Pilih lokasi kost yang dikunjungi (Kost Acarya 1 atau Kost Acarya 2).';
  }

  if (!data.nama || data.nama.trim().length < 2) {
    errors.nama = 'Nama pengunjung wajib diisi (minimal 2 karakter).';
  }

  if (!data.kategori) {
    errors.kategori = 'Pilih kategori kunjungan Anda.';
  }

  if (data.kategori === 'tamu_penghuni' && (!data.kamarTujuan || data.kamarTujuan.trim().length === 0)) {
    errors.kamarTujuan = 'Harap isi nomor kamar atau nama teman penghuni yang dikunjungi.';
  }

  if (data.whatsapp && data.whatsapp.trim().length > 0) {
    const cleaned = data.whatsapp.replace(/[^0-9]/g, '');
    if (cleaned.length < 9 || cleaned.length > 15) {
      errors.whatsapp = 'Nomor WhatsApp tidak valid (antara 9 - 15 digit angka).';
    }
  }

  if (!data.ratingKeseluruhan || data.ratingKeseluruhan < 1 || data.ratingKeseluruhan > 5) {
    errors.ratingKeseluruhan = 'Berikan penilaian rating keseluruhan (1 - 5 bintang).';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function calculateOverallAverage(ratings: {
  ratingKeseluruhan: number;
  ratingKebersihan: number;
  ratingKeamanan: number;
  ratingFasilitas: number;
  ratingPelayanan: number;
}): number {
  const items = [
    ratings.ratingKeseluruhan,
    ratings.ratingKebersihan,
    ratings.ratingKeamanan,
    ratings.ratingFasilitas,
    ratings.ratingPelayanan,
  ].filter(r => typeof r === 'number' && r > 0);

  if (items.length === 0) return 0;
  const sum = items.reduce((acc, curr) => acc + curr, 0);
  return Number((sum / items.length).toFixed(1));
}

export function getRatingSentimentLabel(rating: number): { label: string; color: string; description: string } {
  if (rating >= 5) {
    return {
      label: 'Sangat Puas',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      description: 'Pengalaman luar biasa menyenangkan!',
    };
  }
  if (rating >= 4) {
    return {
      label: 'Puas',
      color: 'text-teal-700 bg-teal-50 border-teal-200',
      description: 'Kunjungan nyaman & terawat baik.',
    };
  }
  if (rating >= 3) {
    return {
      label: 'Cukup',
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      description: 'Cukup baik, ada ruang untuk peningkatan.',
    };
  }
  if (rating >= 2) {
    return {
      label: 'Kurang Puas',
      color: 'text-orange-700 bg-orange-50 border-orange-200',
      description: 'Ada beberapa hal yang perlu diperhatikan pengelola.',
    };
  }
  return {
    label: 'Kecewa',
    color: 'text-rose-700 bg-rose-50 border-rose-200',
    description: 'Pengalaman kunjungan kurang memuaskan.',
  };
}

export function formatIndonesianDate(isoOrDateString: string): string {
  try {
    const d = new Date(isoOrDateString);
    if (isNaN(d.getTime())) return isoOrDateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    }).format(d);
  } catch {
    return isoOrDateString;
  }
}

export function generateSpreadsheetCSV(feedbacks: VisitorFeedback[]): string {
  const headers = [
    'Waktu Catat',
    'Lokasi Kost',
    'Nama Pengunjung',
    'No. WhatsApp',
    'Kategori Kunjungan',
    'Kamar/Penghuni Dituju',
    'Tanggal Kunjungan',
    'Jam Kunjungan',
    'Rating Keseluruhan',
    'Rating Kebersihan',
    'Rating Keamanan',
    'Rating Fasilitas',
    'Rating Pelayanan',
    'Rata-rata Skor',
    'Kesan & Hal Disukai',
    'Kritik & Saran Perbaikan',
    'Rekomendasi',
    'Status Sinkron Google Sheet',
  ];

  const escapeCSV = (field: unknown): string => {
    if (field === null || field === undefined) return '""';
    const str = String(field).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = feedbacks.map(f => {
    const avgScore = calculateOverallAverage({
      ratingKeseluruhan: f.ratingKeseluruhan,
      ratingKebersihan: f.ratingKebersihan,
      ratingKeamanan: f.ratingKeamanan,
      ratingFasilitas: f.ratingFasilitas,
      ratingPelayanan: f.ratingPelayanan,
    });

    return [
      escapeCSV(formatIndonesianDate(f.timestamp)),
      escapeCSV(f.kostLokasi || 'Kost Acarya 2'),
      escapeCSV(f.nama),
      escapeCSV(f.whatsapp || '-'),
      escapeCSV(getVisitorCategoryLabel(f.kategori)),
      escapeCSV(f.kamarTujuan || '-'),
      escapeCSV(f.tanggalKunjungan),
      escapeCSV(f.waktuKunjungan),
      escapeCSV(f.ratingKeseluruhan),
      escapeCSV(f.ratingKebersihan),
      escapeCSV(f.ratingKeamanan),
      escapeCSV(f.ratingFasilitas),
      escapeCSV(f.ratingPelayanan),
      escapeCSV(avgScore),
      escapeCSV(f.kesanPositif || '-'),
      escapeCSV(f.saranPerbaikan || '-'),
      escapeCSV(RECOMMENDATION_LABELS[f.rekomendasi] || f.rekomendasi),
      escapeCSV(f.synced ? 'Tersinkron' : 'Lokal'),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

export function getGoogleAppsScriptCode(): string {
  return `/**
 * ============================================================================
 * GOOGLE APPS SCRIPT: PENDAPAT & BUKU TAMU KOST ACARYA 2
 * ============================================================================
 * Script ini berfungsi sebagai Webhook backend otomatis yang menerima data
 * tanggapan/survei pengunjung dari Webapp Kost Acarya 2 dan menyimpannya secara
 * rapi ke Google Spreadsheet.
 *
 * FITUR OTOMATIS:
 * 1. Otomatis membuat Header Berwarna Rapi & Freeze Baris Pertama jika sheet baru.
 * 2. Format Timestamp Waktu Indonesia Barat (WIB).
 * 3. Menghitung Rata-rata Skor Penilaian secara presisi.
 * 4. Auto-resize lebar kolom agar teks tidak terpotong.
 * 5. Aman dari balapan request dengan LockService.
 * ============================================================================
 */

// Nama Tab Sheet yang digunakan (Bisa diubah jika diinginkan)
var SHEET_NAME = "Tanggapan Pengunjung";

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Tunggu maksimal 15 detik jika ada pengiriman bersamaan
  lock.tryLock(15000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    
    // Jika tab belum ada, buat tab baru dengan nama tersebut
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    // Inisialisasi format tabel jika masih kosong
    setupSheetHeader(sheet);

    // Parsing data JSON atau parameter Form
    var data = {};
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else {
      data = e.parameter || {};
    }

    // Waktu pencatatan (WIB)
    var now = new Date();
    var timestampWIB = Utilities.formatDate(now, "Asia/Jakarta", "dd/MM/yyyy HH:mm:ss");

    // Hitung rata-rata rating
    var ratings = [
      Number(data.ratingKeseluruhan) || 0,
      Number(data.ratingKebersihan) || 0,
      Number(data.ratingKeamanan) || 0,
      Number(data.ratingFasilitas) || 0,
      Number(data.ratingPelayanan) || 0
    ].filter(function(r) { return r > 0; });
    
    var avgScore = 0;
    if (ratings.length > 0) {
      var total = ratings.reduce(function(a, b) { return a + b; }, 0);
      avgScore = (total / ratings.length).toFixed(1);
    }

    // Susun baris data spreadsheet
    var newRow = [
      timestampWIB,                          // Kolom A: Waktu Masuk (WIB)
      data.kostLokasi || "Kost Acarya 2",    // Kolom B: Lokasi Kost (Acarya 1 / Acarya 2)
      data.nama || "-",                      // Kolom C: Nama Pengunjung
      data.whatsapp ? "'" + data.whatsapp : "-", // Kolom D: No WhatsApp
      data.kategoriLabel || data.kategori || "-", // Kolom E: Kategori Kunjungan
      data.kamarTujuan || "-",               // Kolom F: Kamar / Penghuni Dituju
      data.tanggalKunjungan || "-",          // Kolom G: Tanggal Kunjungan
      data.waktuKunjungan || "-",            // Kolom H: Jam Kunjungan
      data.ratingKeseluruhan || 0,           // Kolom I: Rating Keseluruhan (1-5)
      data.ratingKebersihan || 0,            // Kolom J: Kebersihan (1-5)
      data.ratingKeamanan || 0,              // Kolom K: Keamanan (1-5)
      data.ratingFasilitas || 0,             // Kolom L: Fasilitas (1-5)
      data.ratingPelayanan || 0,             // Kolom M: Pelayanan Pengelola (1-5)
      avgScore,                              // Kolom N: Rata-Rata Skor
      data.kesanPositif || "-",              // Kolom O: Hal yang Paling Disukai
      data.saranPerbaikan || "-",            // Kolom P: Kritik & Saran Perbaikan
      data.rekomendasiLabel || data.rekomendasi || "-" // Kolom Q: Rekomendasi
    ];

    sheet.appendRow(newRow);

    // Beri format alignment pada baris baru
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1, 1, 17).setVerticalAlignment("middle");
    sheet.getRange(lastRow, 9, 1, 6).setHorizontalAlignment("center"); // Rating di tengah

    // Response Sukses
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Terima kasih! Pendapat Anda berhasil dicatat di Spreadsheet Kost Acarya.",
      timestamp: timestampWIB,
      rowNumber: lastRow
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Gagal menyimpan ke spreadsheet: " + err.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

// Endpoint GET untuk mengecek status Web App
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "Webhook Google Apps Script - Kost Acarya",
    timestamp: Utilities.formatDate(new Date(), "Asia/Jakarta", "dd/MM/yyyy HH:mm:ss")
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Membuat Header Indah & Terstruktur bila sheet masih kosong
 */
function setupSheetHeader(sheet) {
  if (sheet.getLastRow() === 0) {
    var headers = [
      "Waktu Pencatatan (WIB)",
      "Lokasi Kost",
      "Nama Pengunjung",
      "No. WhatsApp",
      "Kategori Kunjungan",
      "Kamar / Dituju",
      "Tgl Kunjungan",
      "Jam",
      "Rating Umum",
      "Kebersihan",
      "Keamanan",
      "Fasilitas",
      "Pelayanan",
      "Rata-Rata",
      "Kesan Positif",
      "Kritik & Saran",
      "Rekomendasi"
    ];

    sheet.appendRow(headers);

    // Style Header: Latar Emerald Hijau Elegan, Teks Putih Tebal
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#065F46"); // Emerald gelap elegan
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    headerRange.setVerticalAlignment("middle");
    sheet.setRowHeight(1, 38);

    // Freeze baris header pertama
    sheet.setFrozenRows(1);

    // Atur lebar default kolom
    sheet.setColumnWidth(1, 170); // Waktu
    sheet.setColumnWidth(2, 140); // Lokasi Kost
    sheet.setColumnWidth(3, 180); // Nama
    sheet.setColumnWidth(4, 140); // WhatsApp
    sheet.setColumnWidth(5, 200); // Kategori
    sheet.setColumnWidth(6, 140); // Kamar
    sheet.setColumnWidth(15, 280); // Kesan
    sheet.setColumnWidth(16, 280); // Saran
  }
}
`;
}
