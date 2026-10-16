import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateFeedback,
  calculateOverallAverage,
  formatWhatsAppNumber,
  generateSpreadsheetCSV,
  getRatingSentimentLabel,
  getGoogleAppsScriptCode,
  verifyAdminPin,
  normalizeImageUrl,
} from './feedback.ts';
import type { VisitorFeedback } from '../types/feedback.ts';

test('verifyAdminPin validates correct and default PIN', () => {
  assert.equal(verifyAdminPin('acaryasingaraja'), true);
  assert.equal(verifyAdminPin('ACARYASINGARAJA'), true);
  assert.equal(verifyAdminPin('wrongpin'), false);
  assert.equal(verifyAdminPin('1234', '1234'), true);
  assert.equal(verifyAdminPin('', '1234'), false);
});

test('validateFeedback catches missing name and category', () => {
  const result = validateFeedback({});
  assert.equal(result.isValid, false);
  assert.ok(result.errors.kostLokasi);
  assert.ok(result.errors.nama);
  assert.ok(result.errors.kategori);
  assert.ok(result.errors.ratingKeseluruhan);
});

test('validateFeedback requires kamarTujuan if category is tamu_penghuni', () => {
  const result = validateFeedback({
    kostLokasi: 'Kost Acarya 1',
    nama: 'Budi Santoso',
    kategori: 'tamu_penghuni',
    ratingKeseluruhan: 5,
  });
  assert.equal(result.isValid, false);
  assert.ok(result.errors.kamarTujuan);

  const validResult = validateFeedback({
    kostLokasi: 'Kost Acarya 2',
    nama: 'Budi Santoso',
    kategori: 'tamu_penghuni',
    kamarTujuan: 'Kamar A-04 (Rizky)',
    ratingKeseluruhan: 5,
  });
  assert.equal(validResult.isValid, true);
  assert.equal(Object.keys(validResult.errors).length, 0);
});

test('calculateOverallAverage calculates precise 1-decimal average', () => {
  const avg = calculateOverallAverage({
    ratingKeseluruhan: 5,
    ratingKebersihan: 4,
    ratingKeamanan: 5,
    ratingFasilitas: 4,
    ratingPelayanan: 5,
  });
  assert.equal(avg, 4.6);
});

test('formatWhatsAppNumber standardizes Indonesian phone prefixes', () => {
  assert.equal(formatWhatsAppNumber('08123456789'), '628123456789');
  assert.equal(formatWhatsAppNumber('+62 812-3456-789'), '628123456789');
  assert.equal(formatWhatsAppNumber('628123456789'), '628123456789');
});

test('getRatingSentimentLabel gives correct sentiment', () => {
  assert.equal(getRatingSentimentLabel(5).label, 'Sangat Puas');
  assert.equal(getRatingSentimentLabel(3).label, 'Cukup');
  assert.equal(getRatingSentimentLabel(1).label, 'Kecewa');
});

test('generateSpreadsheetCSV generates valid formatted CSV with headers', () => {
  const sample: VisitorFeedback[] = [
    {
      id: 'fb-1',
      timestamp: '2026-10-15T10:00:00.000Z',
      kostLokasi: 'Kost Acarya 1',
      nama: 'Annisa Putri',
      whatsapp: '081298765432',
      kategori: 'calon_penghuni',
      kamarTujuan: 'Kamar Tipe Deluxe',
      tanggalKunjungan: '2026-10-15',
      waktuKunjungan: '10:00',
      ratingKeseluruhan: 5,
      ratingKebersihan: 5,
      ratingKeamanan: 5,
      ratingFasilitas: 4,
      ratingPelayanan: 5,
      kesanPositif: 'Lingkungan sangat asri dan bersih',
      saranPerbaikan: 'Bisa ditambah dispenser di lantai 2',
      rekomendasi: 'ya',
      synced: true,
    },
  ];

  const csv = generateSpreadsheetCSV(sample);
  assert.ok(csv.includes('Lokasi Kost'));
  assert.ok(csv.includes('Kost Acarya 1'));
  assert.ok(csv.includes('Nama Pengunjung'));
  assert.ok(csv.includes('Annisa Putri'));
  assert.ok(csv.includes('Lingkungan sangat asri dan bersih'));
});

test('getGoogleAppsScriptCode includes doPost, doGet, photo endpoints, and setupSheetHeader', () => {
  const code = getGoogleAppsScriptCode();
  assert.ok(code.includes('function doPost(e)'));
  assert.ok(code.includes('function doGet(e)'));
  assert.ok(code.includes('function setupSheetHeader(sheet)'));
  assert.ok(code.includes('SHEET_NAME'));
  assert.ok(code.includes('save_photo'));
  assert.ok(code.includes('get_photos'));
  assert.ok(code.includes('Foto_Kost'));
});

test('normalizeImageUrl converts Google Drive and Dropbox share links to direct embed URLs', () => {
  const gDriveViewUrl = 'https://drive.google.com/file/d/1AbC_xyz-987/view?usp=sharing';
  assert.equal(normalizeImageUrl(gDriveViewUrl), 'https://lh3.googleusercontent.com/d/1AbC_xyz-987');

  const gDriveOpenUrl = 'https://drive.google.com/open?id=2BbC_xyz-987';
  assert.equal(normalizeImageUrl(gDriveOpenUrl), 'https://lh3.googleusercontent.com/d/2BbC_xyz-987');

  const regularUrl = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914';
  assert.equal(normalizeImageUrl(regularUrl), regularUrl);

  const dropboxUrl = 'https://www.dropbox.com/s/12345/foto.jpg?dl=0';
  assert.equal(normalizeImageUrl(dropboxUrl), 'https://www.dropbox.com/s/12345/foto.jpg?raw=1');
});

