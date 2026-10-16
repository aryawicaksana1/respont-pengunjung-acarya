# Sinkronisasi Foto Kost Permanen Multi-Pengguna & Penyempurnaan Barcode Tamu Penuh

Implementasi sistem sinkronisasi foto kost secara permanen dan terpusat melalui Google Sheet yang terhubung, sehingga setiap perubahan foto oleh Admin langsung terlihat oleh seluruh pengunjung website di perangkat mana pun. Rencana ini juga mencakup dukungan ganda (upload file gambar & tautan URL), sinkronisasi dua arah buku tamu dari Google Sheet, serta optimalisasi visual Barcode & QR Code agar tampil 100% utuh tanpa terpotong untuk domain `respont-acarya.vercel.app`.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan jawaban klarifikasi yang telah Anda berikan:
> 1. **Penyimpanan Terpusat**: Data tautan foto kost disimpan dan disinkronkan langsung ke **Google Sheet** yang terhubung, bukan hanya di browser lokal.
> 2. **Metode Ganti Foto**: Admin dapat mengganti foto melalui **upload file gambar** dari galeri HP/laptop maupun memasukkan **tautan URL foto publik**.
> 3. **Tampilan Barcode & QR Code**: Ditampilkan secara penuh (*full view*) tanpa terpotong di semua ukuran layar smartphone dan desktop dengan tautan resmi `https://respont-acarya.vercel.app`.
> 4. **Sinkronisasi Buku Tamu**: Jika baris di Google Sheet dihapus oleh pengelola, data ulasan di website juga akan otomatis terhapus saat memuat ulang atau menekan tombol segarkan data.

---

## 1. Overview & Core Concept

- **Apa yang Dibangun**:
  - **Sistem Distribusi Foto Kost Terpusat**: Saat Admin mengubah foto Kost Acarya 1 atau Kost Acarya 2, foto tersebut dikirim ke Google Apps Script / Google Spreadsheet dan dicatat di tab khusus (`Foto_Kost` / `Config`). Setiap pengunjung yang membuka website akan otomatis mengambil data foto terbaru dari Google Sheet sehingga perubahan terlihat oleh semua orang.
  - **Dukungan Upload & URL**: Admin dapat mengunggah file foto langsung (otomatis dioptimalkan dan dikirim) atau menempelkan tautan URL gambar (Google Drive, ImgBB, Unsplash, dll).
  - **Tampilan Barcode & QR Code Penuh (No Cutoff)**: Memperbaiki tata letak modal dan kanvas barcode/QR code agar proporsional, responsif, dan tidak terpotong di layar HP vertikal maupun desktop.
  - **Penghapusan Sinkron Buku Tamu**: Memastikan pengambilan data ulasan `action=read` dari Google Apps Script menjadi sumber kebenaran (*single source of truth*) buku tamu.

- **Target Pengguna**:
  - **Pengunjung & Calon Penghuni Kost**: Melihat foto terbaru dan akurat dari bangunan Kost Acarya 1 dan Kost Acarya 2, serta dapat memindai QR code/barcode tanpa kendala.
  - **Pengelola & Admin Kost**: Memperbarui foto kapan saja dengan perlindungan PIN admin (`acaryasingaraja`), dan yakin perubahan tersebut langsung tampil ke seluruh calon penghuni.

---

## 2. User Experience & Visual Design

### A. Alur Pengalaman Pengguna (Key User Flows)

1. **Alur Admin Mengganti Foto**:
   - Admin membuka modal Foto Kost melalui tombol kamera/edit di kartu kost (dengan PIN `acaryasingaraja`).
   - Admin memilih antara:
     - **Tab Upload File**: Memilih foto dari galeri HP atau laptop. Foto otomatis dikompresi agar ringan dan dimuat cepat.
     - **Tab Tautan URL**: Memasukkan tautan gambar langsung dari internet.
     - **Tab Preset Galeri**: Memilih dari opsi foto beresolusi tinggi yang telah dikurasi.
   - Admin menekan **"Simpan & Terapkan ke Semua Pengunjung"**.
   - Sistem mengirim pembaruan ke Google Apps Script dan memperbarui status tampilan dengan indikator sukses hijau.

2. **Alur Pengunjung Membuka Website**:
   - Pengunjung membuka `respont-acarya.vercel.app`.
   - Website melakukan inisialisasi dan memanggil endpoint Google Apps Script untuk memeriksa apakah ada foto kost terbaru dan ulasan terbaru.
   - Foto yang ditampilkan adalah foto terbaru yang disetel oleh Admin, bukan hanya foto bawaan browser.

3. **Alur Tampilan Barcode & QR Code Penuh**:
   - Pengunjung atau staf menekan menu **"Barcode & QR"** di header atau footer.
   - Modal muncul dengan tinggi fleksibel yang pas di layar (`max-h-[90vh]`), memastikan seluruh batas luar QR code dan garis Barcode 1D terlihat utuh 100% tanpa perlu scroll rumit.
   - Tombol **"Kembali ke Halaman Sebelumnya"** tetap berada di posisi atas yang mudah dijangkau.

### B. Identitas Visual & Bahasa Desain

- **Palet Warna**:
  - Dominan Kanvas: Warm Off-White / Pure White (`#FAFAF9` / `#FFFFFF`).
  - Aksen Primer: Emerald Bali Tropis (`#065F46` / `#047857`) melambangkan kenyamanan dan keasrian Kost Acarya Singaraja.
  - Netral Kontras: Slate Deep Stone (`#0F172A` / `#1C1917`) untuk QR code beresolusi tinggi dan teks tajam.
- **Tipografi**:
  - Judul: Plus Jakarta Sans (600–800) dengan `tracking-tight`.
  - Body: Plus Jakarta Sans / Inter readable.
  - Barcode / Angka: Tabular mono (`font-mono tabular-nums`).
- **Aturan Zero-Pill & Anti-Clutter**:
  - Tidak ada badge pill bertumpuk; menggunakan metadata teks bersih dengan pemisah titik (`·`).
  - Feedback visual tombol $\le 200\text{ms}$ dengan transisi halus.

---

## 3. Key Product Decisions & Trade-Offs

### Keputusan 1: Mekanisme Sinkronisasi Foto via Google Sheet
- **Pendekatan Terpilih**: Menambahkan endpoint `action=save_photo` dan `action=get_photos` pada Google Apps Script, serta menyimpan tautan foto di tab `Foto_Kost` di spreadsheet.
- **Alasan**: User telah memiliki spreadsheet aktif untuk buku tamu. Mengintegrasikan foto ke Google Sheet yang sama menjaga seluruh aset kost terpusat di satu akun Google pengelola tanpa memerlukan biaya server tambahan.
- **Fallback**: Jika koneksi Google Sheet offline atau sedang dimuat, sistem otomatis menggunakan cache lokal dan default gambar cadangan berkualitas tinggi agar tidak terjadi layar kosong.

### Keputusan 2: Penanganan Barcode "Terpotong" (Cutoff Fix)
- **Pendekatan Terpilih**: 
  - Memberikan `viewBox` responsif dengan padding aman (quiet zone) pada SVG Barcode Code-128.
  - Membatasi ukuran kontainer maksimal (`max-w-[280px]` di mobile) dengan `aspect-ratio` terkunci dan `shrink-0`.
  - Menghilangkan scrollbar vertikal yang memotong setengah bagian bawah kartu.

### Keputusan 3: Penyelarasan Buku Tamu yang Terhapus di Google Sheet
- **Pendekatan Terpilih**: Saat memuat ulang atau menekan tombol sinkronisasi, data lokal buku tamu disinkronkan sepenuhnya mengikuti data baris aktif di Google Sheet (`feedbacks = sheetData`). Jika baris di Google Sheet dihapus oleh admin, website otomatis menghapusnya dari daftar tampilan publik.

---

## 4. Technical Architecture & Data Strategy

### Diagram Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────────┐
│                      PENGUNJUNG / ADMIN                         │
│                  (respont-acarya.vercel.app)                    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       REACT CLIENT APP                          │
│                                                                 │
│  ┌───────────────────────┐             ┌─────────────────────┐  │
│  │   FeedbackForm.tsx    │             │   QRCodeModal.tsx   │  │
│  │  - Kost Photo Viewer  │             │  - Full QR Code HD  │  │
│  │  - Admin Upload / URL │             │  - Full 1D Barcode  │  │
│  │  - Live Photo Preview │             │  - Stand Meja Print │  │
│  └───────────┬───────────┘             └─────────────────────┘  │
│              │                                                  │
│              ▼                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │             googleSheets.ts (Service Layer)               │  │
│  │  - sendFeedbackToGoogleAppsScript()                       │  │
│  │  - fetchFeedbacksFromGoogleSheets()                       │  │
│  │  - saveKostPhotoToGoogleSheet(branch, photoUrl)           │  │
│  │  - fetchKostPhotosFromGoogleSheet()                       │  │
│  └───────────────────────────┬───────────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                               │ HTTPS GET/POST (JSON / no-cors)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   GOOGLE APPS SCRIPT WEB APP                    │
│                     (script.google.com)                         │
│                                                                 │
│   doGet(e)  ──► action=read       ──► Baca ulasan buku tamu     │
│             ──► action=get_photos ──► Baca foto kost aktif      │
│                                                                 │
│   doPost(e) ──► action=feedback   ──► Tambah ulasan baru        │
│             ──► action=save_photo ──► Simpan foto Acarya 1 & 2  │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   GOOGLE SPREADSHEET KOST                       │
│                                                                 │
│   [Sheet: Tanggapan Pengunjung]  ──► Baris ulasan tamu          │
│   [Sheet: Foto_Kost]             ──► URL foto Acarya 1 & 2      │
└─────────────────────────────────────────────────────────────────┘
```

### Rencana File & Modifikasi

1. **`src/services/googleSheets.ts`**:
   - Tambahkan fungsi `saveKostPhotoToGoogleSheet(scriptUrl, branch, photoUrl)`.
   - Tambahkan fungsi `fetchKostPhotosFromGoogleSheet(scriptUrl)`.
   - Pastikan `fetchFeedbacksFromGoogleSheets()` menimpa daftar ulasan lama agar ulasan yang dihapus di Google Sheet tidak muncul lagi di web.

2. **`src/components/KostPhotoModal.tsx`**:
   - Tambahkan integrasi penyimpanan online ke Google Sheet.
   - Sediakan tombol upload file dengan konversi kompresi gambar lokal (Canvas WebP/JPEG) atau opsi input tautan URL langsung.
   - Berikan feedback status sinkronisasi online kepada admin ("Tersimpan di Google Sheet & berlaku untuk semua pengunjung").

3. **`src/components/QRCodeModal.tsx`**:
   - Perbaiki kontainer modal dan kartu Barcode 1D agar tidak terpotong (menggunakan `overflow-visible`, rasio SVG proporsional, dan padding vertikal pas).
   - Pastikan teks dan target barcode secara eksklusif menggunakan `https://respont-acarya.vercel.app`.

4. **`src/components/GoogleAppsScriptGuide.tsx`**:
   - Perbarui kode skrip Google Apps Script siap salin yang mencakup penanganan `save_photo`, `get_photos`, dan penghapusan baris otomatis.

5. **`src/App.tsx` & `src/components/FeedbackForm.tsx`**:
   - Panggil `fetchKostPhotosFromGoogleSheet` saat inisialisasi aplikasi untuk memuat foto terbaru yang tersimpan di Google Sheet.
   - Terapkan foto tersebut ke seluruh komponen tampilan kost.
