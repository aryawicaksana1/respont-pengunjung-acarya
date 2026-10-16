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

export function normalizeImageUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // Convert Google Drive sharing link to direct embed URL
  // Format 1: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  const gDriveMatch1 = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (gDriveMatch1 && gDriveMatch1[1]) {
    return `https://lh3.googleusercontent.com/d/${gDriveMatch1[1]}`;
  }

  // Format 2: https://drive.google.com/open?id=FILE_ID
  const gDriveMatch2 = trimmed.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (gDriveMatch2 && gDriveMatch2[1]) {
    return `https://lh3.googleusercontent.com/d/${gDriveMatch2[1]}`;
  }

  // Convert Dropbox share link dl=0 to raw=1
  if (trimmed.includes('dropbox.com') && trimmed.includes('dl=0')) {
    return trimmed.replace('dl=0', 'raw=1');
  }

  return trimmed;
}

/**
 * Kompresi file gambar di sisi client (browser) menggunakan Canvas.
 * Mengurangi ukuran file foto dari beberapa MB menjadi ~100-250KB sehingga
 * cepat dan aman dikirim serta disimpan ke spreadsheet tanpa membebani kuota data.
 */
export function compressImageFile(
  file: File,
  maxWidth = 960,
  maxHeight = 640,
  quality = 0.72
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof FileReader === 'undefined') {
      reject(new Error('FileReader not supported'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        let resultData = '';
        try {
          const webpData = canvas.toDataURL('image/webp', quality);
          if (webpData.startsWith('data:image/webp')) {
            resultData = webpData;
          }
        } catch {
          // ignore fallback
        }
        if (!resultData) {
          resultData = canvas.toDataURL('image/jpeg', quality);
        }

        // Jika ukuran string masih lebih dari 40,000 karakter, kecilkan lebih lanjut agar aman di Google Sheet
        if (resultData.length > 42000) {
          const smallerCanvas = document.createElement('canvas');
          smallerCanvas.width = Math.round(width * 0.7);
          smallerCanvas.height = Math.round(height * 0.7);
          const sCtx = smallerCanvas.getContext('2d');
          if (sCtx) {
            sCtx.drawImage(canvas, 0, 0, smallerCanvas.width, smallerCanvas.height);
            try {
              const sWebp = smallerCanvas.toDataURL('image/webp', 0.6);
              if (sWebp.startsWith('data:image/webp')) {
                resolve(sWebp);
                return;
              }
            } catch {}
            resolve(smallerCanvas.toDataURL('image/jpeg', 0.6));
            return;
          }
        }

        resolve(resultData);
      };
      img.onerror = () => reject(new Error('Gagal memproses gambar'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.readAsDataURL(file);
  });
}

export function getGoogleAppsScriptCode(): string {
  return `/**
 * ============================================================================
 * GOOGLE APPS SCRIPT: PENDAPAT, BUKU TAMU & FOTO KOST ACARYA 1 & 2
 * ============================================================================
 * Script ini berfungsi sebagai Webhook backend otomatis yang:
 * 1. Menerima data ulasan pengunjung & menyimpannya rapi di sheet "Tanggapan Pengunjung".
 * 2. Menyimpan dan menyinkronkan Foto Kost Acarya 1 & 2 secara permanen di sheet "Foto_Kost".
 *    (Mendukung URL gambar langsung, Google Drive link, maupun upload foto langsung).
 * 3. Mendukung sinkronisasi penghapusan 2 arah: jika baris ulasan di spreadsheet dihapus
 *    oleh pengelola, ulasan di website juga otomatis hilang!
 * 4. Menyediakan endpoint GET dan POST yang aman dari balapan data dengan LockService.
 * ============================================================================
 */

// Nama Tab Sheet ulasan pengunjung
var SHEET_NAME = "Tanggapan Pengunjung";
// Nama Tab Sheet foto kost permanen
var SHEET_PHOTOS = "Foto_Kost";

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(15000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

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

    // ========================================================================
    // AKSI 1: SIMPAN FOTO KOST PERMANEN KE TAB "Foto_Kost"
    // ========================================================================
    if (data.action === "save_photo") {
      var photoSheet = ss.getSheetByName(SHEET_PHOTOS);
      if (!photoSheet) {
        photoSheet = ss.insertSheet(SHEET_PHOTOS);
      }
      setupPhotosSheetHeader(photoSheet);

      var branch = data.branch || "Kost Acarya 2";
      var photoUrl = data.photoUrl || "";
      var now = new Date();
      var timestampWIB = Utilities.formatDate(now, "Asia/Jakarta", "dd/MM/yyyy HH:mm:ss");

      // Jika berupa base64 upload, simpan otomatis ke Google Drive pemilik agar memiliki URL permanen
      if (photoUrl.indexOf("data:image/") === 0) {
        try {
          var commaIdx = photoUrl.indexOf(",");
          var header = photoUrl.substring(0, commaIdx);
          var mimeMatch = header.match(/data:([^;]+)/);
          var mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
          var base64Data = photoUrl.substring(commaIdx + 1);
          var decoded = Utilities.base64Decode(base64Data);
          var ext = mimeType.indexOf("webp") !== -1 ? ".webp" : (mimeType.indexOf("png") !== -1 ? ".png" : ".jpg");
          var filename = branch.replace(/[^a-zA-Z0-9]/g, "_") + "_foto" + ext;
          var blob = Utilities.newBlob(decoded, mimeType, filename);
          
          var file = DriveApp.createFile(blob);
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          photoUrl = "https://lh3.googleusercontent.com/d/" + file.getId();
        } catch (driveErr) {
          // Jika DriveApp belum ada izin, batasi string agar aman dari limit 50,000 karakter sel spreadsheet
          if (photoUrl.length > 49000) {
            photoUrl = photoUrl.substring(0, 49000);
          }
        }
      }

      var lastRow = photoSheet.getLastRow();
      var foundRow = -1;

      if (lastRow > 1) {
        var existingData = photoSheet.getRange(2, 1, lastRow - 1, 1).getValues();
        for (var i = 0; i < existingData.length; i++) {
          if (String(existingData[i][0]).trim().toLowerCase() === branch.trim().toLowerCase()) {
            foundRow = i + 2;
            break;
          }
        }
      }

      if (foundRow > 0) {
        photoSheet.getRange(foundRow, 2).setValue(photoUrl);
        photoSheet.getRange(foundRow, 3).setValue(timestampWIB);
      } else {
        photoSheet.appendRow([branch, photoUrl, timestampWIB]);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: "save_photo",
        message: "Foto " + branch + " berhasil disimpan permanen ke Google Sheet!",
        branch: branch,
        photoUrl: photoUrl,
        timestamp: timestampWIB
      })).setMimeType(ContentService.MimeType.JSON);
    }
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

// Endpoint GET untuk membaca data buku tamu dari Google Sheet atau cek status (Mendukung Sinkronisasi & Penghapusan 2-Arah serta Foto Permanen)
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var action = (e && e.parameter && e.parameter.action) ? String(e.parameter.action).trim() : "read";

    // 1. Aksi Khusus: Ambil Data Foto Kost
    if (action === "get_photos") {
      var photos = getPhotosFromSheet(ss);
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: "get_photos",
        photos: photos,
        timestamp: Utilities.formatDate(new Date(), "Asia/Jakarta", "dd/MM/yyyy HH:mm:ss")
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Aksi Standar: Baca Data Buku Tamu & Sekaligus Ambil Foto Terbaru
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      setupSheetHeader(sheet);
    }

    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    var currentPhotos = getPhotosFromSheet(ss);

    // Jika sheet masih kosong atau hanya baris header
    if (lastRow <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        total: 0,
        feedbacks: [],
        photos: currentPhotos,
        timestamp: Utilities.formatDate(new Date(), "Asia/Jakarta", "dd/MM/yyyy HH:mm:ss")
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Ambil seluruh baris ulasan mulai dari baris ke-2 (Baris yang dihapus di sheet otomatis TIDAK akan ada di sini)
    var data = sheet.getRange(2, 1, lastRow - 1, Math.max(lastCol, 17)).getValues();
    var feedbacks = [];

    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var nama = row[2] ? String(row[2]).trim() : "";
      if (!nama || nama === "-") continue; // Lewati baris kosong atau terhapus

      var rawTimestamp = row[0];
      var formattedDate = "";
      if (rawTimestamp instanceof Date) {
        formattedDate = Utilities.formatDate(rawTimestamp, "Asia/Jakarta", "dd/MM/yyyy HH:mm");
      } else {
        formattedDate = String(rawTimestamp || "");
      }

      var tglKunjungan = row[6];
      if (tglKunjungan instanceof Date) {
        tglKunjungan = Utilities.formatDate(tglKunjungan, "Asia/Jakarta", "yyyy-MM-dd");
      } else {
        tglKunjungan = String(tglKunjungan || "");
      }

      var jam = row[7];
      if (jam instanceof Date) {
        jam = Utilities.formatDate(jam, "Asia/Jakarta", "HH:mm");
      } else {
        jam = String(jam || "");
      }

      feedbacks.push({
        id: "gs_" + (i + 2) + "_" + encodeURIComponent(nama),
        timestamp: formattedDate,
        kostLokasi: row[1] ? String(row[1]) : "Kost Acarya 2",
        nama: nama,
        whatsapp: row[3] ? String(row[3]) : "",
        kategori: row[4] ? String(row[4]) : "pengunjung_umum",
        kamarTujuan: row[5] ? String(row[5]) : "",
        tanggalKunjungan: tglKunjungan,
        waktuKunjungan: jam,
        ratingKeseluruhan: Number(row[8]) || 5,
        ratingKebersihan: Number(row[9]) || 5,
        ratingKeamanan: Number(row[10]) || 5,
        ratingFasilitas: Number(row[11]) || 5,
        ratingPelayanan: Number(row[12]) || 5,
        rataRataSkor: Number(row[13]) || 5,
        kesanPositif: row[14] ? String(row[14]) : "",
        saranPerbaikan: row[15] ? String(row[15]) : "",
        rekomendasi: row[16] ? String(row[16]) : "ya",
        synced: true
      });
    }

    // Urutkan dari data ulasan paling baru
    feedbacks.reverse();

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      total: feedbacks.length,
      feedbacks: feedbacks,
      photos: currentPhotos,
      timestamp: Utilities.formatDate(new Date(), "Asia/Jakarta", "dd/MM/yyyy HH:mm:ss")
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Gagal membaca baris Google Sheet: " + err.toString(),
      feedbacks: [],
      photos: {}
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Membaca URL foto Kost Acarya 1 & 2 dari tab Foto_Kost
 */
function getPhotosFromSheet(ss) {
  var photoObj = {};
  try {
    var photoSheet = ss.getSheetByName(SHEET_PHOTOS);
    if (!photoSheet) return photoObj;

    var lastRow = photoSheet.getLastRow();
    if (lastRow <= 1) return photoObj;

    var data = photoSheet.getRange(2, 1, lastRow - 1, 2).getValues();
    for (var i = 0; i < data.length; i++) {
      var branchName = String(data[i][0]).trim().toLowerCase();
      var photoUrl = String(data[i][1] || "").trim();
      if (!photoUrl) continue;

      if (branchName.indexOf("acarya 1") !== -1 || branchName.indexOf("cabang 1") !== -1) {
        photoObj.acarya1 = photoUrl;
      } else if (branchName.indexOf("acarya 2") !== -1 || branchName.indexOf("cabang 2") !== -1) {
        photoObj.acarya2 = photoUrl;
      }
    }
  } catch (e) {
    // abaikan jika tab belum ada
  }
  return photoObj;
}

/**
 * Header untuk tab Foto_Kost
 */
function setupPhotosSheetHeader(sheet) {
  if (sheet.getLastRow() === 0) {
    var headers = ["Cabang Kost", "URL Foto Bangunan", "Terakhir Diperbarui (WIB)"];
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#0F766E"); // Teal elegan
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    headerRange.setVerticalAlignment("middle");
    sheet.setRowHeight(1, 35);
    sheet.setColumnWidth(1, 180);
    sheet.setColumnWidth(2, 420);
    sheet.setColumnWidth(3, 200);
  }
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
