import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Copy, 
  Check, 
  ExternalLink, 
  HelpCircle, 
  Play, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Database
} from 'lucide-react';
import { getGoogleAppsScriptCode } from '../utils/feedback.ts';
import { testGoogleAppsScriptConnection } from '../services/googleSheets.ts';

interface GoogleSheetsGuideModalProps {
  scriptUrl: string;
  onSaveUrl: (url: string) => void;
  onClose?: () => void;
}

export const GoogleSheetsGuideModal: React.FC<GoogleSheetsGuideModalProps> = ({
  scriptUrl,
  onSaveUrl,
}) => {
  const [currentUrl, setCurrentUrl] = useState(scriptUrl);
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const appsScriptCode = getGoogleAppsScriptCode();

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(appsScriptCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveUrl(currentUrl.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleTestConnection = async () => {
    if (!currentUrl) {
      setTestResult({
        success: false,
        message: 'Masukkan URL Google Apps Script terlebih dahulu.',
      });
      return;
    }
    setTesting(true);
    setTestResult(null);
    const result = await testGoogleAppsScriptConnection(currentUrl);
    setTesting(false);
    setTestResult(result);
  };

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-8 px-4 sm:px-6">
      {/* Header Info Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
              <Database className="w-4 h-4" />
              <span>Integrasi Google Sheets & Apps Script</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Panduan Menghubungkan Google Sheet Kost Acarya 2
            </h1>
            <p className="mt-2 text-stone-600 text-sm sm:text-base max-w-3xl leading-relaxed">
              Dengan Google Apps Script, setiap pengunjung yang mengisi formulir pendapat ini akan otomatis tersimpan langsung ke baris Google Spreadsheet pribadi pengelola Kost Acarya 2 tanpa biaya, tanpa database rumit, dan bisa diakses dari HP Anda kapan saja.
            </p>
          </div>

          <div className="shrink-0 flex flex-col gap-2">
            <a
              href="https://sheets.new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-xs"
            >
              <span>Buka Google Sheet Baru</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Input Web App URL */}
        <form onSubmit={handleSave} className="mt-6">
          <label htmlFor="gas-url" className="block text-sm font-semibold text-stone-900 mb-2">
            URL Aplikasi Web Google Apps Script (Webhook Endpoint)
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="gas-url"
              type="url"
              value={currentUrl}
              onChange={(e) => setCurrentUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
              className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent font-mono bg-stone-50"
            />
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="px-4 py-2.5 text-sm font-medium rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 text-emerald-700" />
                <span>{testing ? 'Menguji...' : 'Uji URL'}</span>
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white transition-colors shadow-xs"
              >
                Simpan URL
              </button>
            </div>
          </div>

          {savedSuccess && (
            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>URL Google Apps Script berhasil disimpan! Formulir siap mengirim data ke spreadsheet Anda.</span>
            </div>
          )}

          {testResult && (
            <div
              className={`mt-3 p-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border border-amber-200 text-amber-800'
              }`}
            >
              {testResult.success ? <Check className="w-4 h-4 shrink-0" /> : <HelpCircle className="w-4 h-4 shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}
        </form>
      </div>

      {/* Step by Step Tutorial */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs mb-8">
        <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
          <span>Langkah Mudah Memasang Kode ke Google Sheet (5 Menit)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl border border-stone-100 bg-stone-50/60 flex gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-white font-bold text-sm flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <h3 className="text-base font-semibold text-stone-900">Buat Google Spreadsheet</h3>
              <p className="text-sm text-stone-600 mt-1 leading-relaxed">
                Buka <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-medium">sheets.new</a> di browser Anda. Beri judul spreadsheet misalnya: <strong>&ldquo;Buku Tamu Kost Acarya 2&rdquo;</strong>.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-stone-100 bg-stone-50/60 flex gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-white font-bold text-sm flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <h3 className="text-base font-semibold text-stone-900">Buka Menu Apps Script</h3>
              <p className="text-sm text-stone-600 mt-1 leading-relaxed">
                Pada menu atas Google Sheet, klik <strong>Ekstensi (Extensions)</strong> &gt; pilih <strong>Apps Script</strong>. Tab editor baru akan terbuka.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-stone-100 bg-stone-50/60 flex gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-white font-bold text-sm flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <h3 className="text-base font-semibold text-stone-900">Salin & Tempel Kode</h3>
              <p className="text-sm text-stone-600 mt-1 leading-relaxed">
                Hapus seluruh isi file <code className="bg-stone-200 px-1 py-0.5 rounded text-xs">Code.gs</code> di Apps Script, lalu klik tombol <strong>&ldquo;Salin Kode Apps Script&rdquo;</strong> di bawah dan tempelkan ke editor. Simpan dengan menekan <kbd className="px-1.5 py-0.5 bg-stone-200 rounded text-xs">Ctrl + S</kbd>.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-stone-100 bg-stone-50/60 flex gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-white font-bold text-sm flex items-center justify-center shrink-0">
              4
            </div>
            <div>
              <h3 className="text-base font-semibold text-stone-900">Deploy sebagai Aplikasi Web</h3>
              <p className="text-sm text-stone-600 mt-1 leading-relaxed">
                Klik tombol biru <strong>Terapkan (Deploy)</strong> &gt; <strong>Deployment Baru (New Deployment)</strong>.
                Pilih jenis roda gigi <strong>Aplikasi Web (Web App)</strong>.
              </p>
              <div className="mt-2 text-xs bg-amber-50 text-amber-800 p-2.5 rounded-lg border border-amber-200">
                <strong>PENTING:</strong> Atur <em>Siapa yang memiliki akses (Who has access)</em> ke: <strong>Siapa saja (Anyone)</strong> agar pengunjung bisa mengirim tanpa login akun Google Anda.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-emerald-950 leading-relaxed">
            <strong>Langkah Terakhir:</strong> Setelah klik <em>Deploy</em>, salin <strong>URL Aplikasi Web (Web App URL)</strong> yang berakhiran <code className="bg-emerald-100 px-1 py-0.5 rounded">.../exec</code>, lalu tempelkan ke kolom input di atas dan tekan <strong>Simpan URL</strong>.
          </div>
        </div>

        {/* Feature highlight box */}
        <div className="mt-4 p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-700 space-y-1.5">
          <p className="font-bold text-stone-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>Fitur Baru pada Skrip Ini:</span>
          </p>
          <ul className="list-disc list-inside space-y-1 text-stone-600 text-xs pl-1">
            <li><strong>Foto Kost Permanen:</strong> Foto Kost Acarya 1 & 2 disimpan di tab <code className="bg-stone-200 px-1 py-0.5 rounded text-[11px]">Foto_Kost</code> sehingga otomatis tampil untuk seluruh pengunjung website di semua HP/laptop.</li>
            <li><strong>Sinkronisasi Hapus Baris:</strong> Jika Anda menghapus baris tanggapan di Google Sheet, ulasan di website juga akan otomatis terhapus saat dimuat ulang atau saat tombol <em>&ldquo;Segarkan dari Sheet&rdquo;</em> ditekan.</li>
          </ul>
        </div>

        {/* Troubleshooting Box: Kenapa foto belum berubah di HP/pengguna lain? */}
        <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-300 text-amber-950 text-xs sm:text-sm space-y-2.5 shadow-2xs">
          <div className="flex items-center gap-2 font-extrabold text-amber-900 text-sm sm:text-base">
            <HelpCircle className="w-5 h-5 text-amber-700 shrink-0" />
            <span>Kenapa foto yang sudah dirubah belum berubah di tampilan pengguna lain?</span>
          </div>
          <p className="text-amber-900 leading-relaxed text-xs sm:text-sm">
            Saat Anda mengubah foto di perangkat admin, foto langsung tersimpan di browser Anda. Namun, agar <strong>seluruh pengunjung lain otomatis melihat perubahan foto tersebut</strong>, Google Apps Script di spreadsheet Anda <strong>wajib menggunakan kode terbaru ini</strong> dan dilakukan <strong>&ldquo;Deployment Baru&rdquo;</strong>.
          </p>
          <div className="bg-white p-3.5 rounded-xl border border-amber-200 text-stone-800 space-y-1.5 text-xs">
            <p className="font-bold text-amber-950">Cara Mengaktifkannya Hanya 1 Menit:</p>
            <ol className="list-decimal list-inside space-y-1 text-stone-700 leading-relaxed">
              <li>Klik tombol <strong>&ldquo;Salin Seluruh Kode&rdquo;</strong> di kotak hitam di bawah.</li>
              <li>Buka spreadsheet Anda di <a href="https://sheets.google.com" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-medium">Google Sheets</a>, klik menu <strong>Ekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong>.</li>
              <li>Hapus semua isi file <code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-[11px]">Code.gs</code> lalu tempelkan (*Paste*) kode baru yang telah disalin tadi, lalu tekan <kbd className="px-1 bg-stone-200 rounded text-[10px]">Ctrl+S</kbd>.</li>
              <li><strong>LANGKAH KUNCI:</strong> Klik tombol biru <strong>Terapkan (Deploy)</strong> di kanan atas &gt; pilih <strong>Deployment Baru (New Deployment)</strong> &gt; Jenis: <strong>Aplikasi Web</strong> &gt; Akses: <strong>Siapa Saja (Anyone)</strong> &gt; Klik <strong>Terapkan (Deploy)</strong>.</li>
              <li>Selesai! Tab <em>Foto_Kost</em> akan otomatis dibuat di spreadsheet Anda dan foto akan langsung tampil untuk semua orang.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 bg-stone-900 text-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold text-amber-300">Code.gs</span>
              <span className="text-stone-400 text-xs">·</span>
              <span className="text-stone-400 text-xs">Otomatisasi Google Apps Script Kost Acarya 2</span>
            </div>
            <p className="text-stone-400 text-xs mt-1">
              Otomatis membuat baris, styling header hijau zamrud, format WIB, dan perhitungan rata-rata.
            </p>
          </div>

          <button
            onClick={handleCopyCode}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Berhasil Disalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Salin Seluruh Kode</span>
              </>
            )}
          </button>
        </div>

        <div className="relative">
          <pre className="p-4 sm:p-6 bg-stone-950 text-stone-200 font-mono text-xs overflow-x-auto max-h-[460px] leading-relaxed">
            <code>{appsScriptCode}</code>
          </pre>
        </div>

        {/* Structure preview footer */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>Format kolom otomatis: Tanggal (WIB), Nama, WA, Kategori, Kamar, 5 Aspek Rating, Ulasan Positif, Saran.</span>
          </div>
          <button
            onClick={handleCopyCode}
            className="text-emerald-700 hover:text-emerald-900 font-semibold inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Salin untuk Dipaste</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
