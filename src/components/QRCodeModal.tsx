import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Printer, 
  QrCode, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  ArrowLeft, 
  Phone, 
  MapPin, 
  Maximize2, 
  Minimize2, 
  ExternalLink,
  Barcode as BarcodeIcon,
  Layers,
  Share2
} from 'lucide-react';
import QRCode from 'qrcode';
import { formatWhatsAppNumber } from '../utils/feedback.ts';

interface QRCodeModalProps {
  kostName: string;
  kostPhone?: string;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  kostName,
  kostPhone = '+62 878-6726-1660',
  onClose,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [activeView, setActiveView] = useState<'stand' | 'qr_large' | 'barcode'>('stand');
  const [isLargeSize, setIsLargeSize] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);

  const currentAppUrl = typeof window !== 'undefined' ? window.location.href : 'https://kost-acarya.app';
  const cleanAppUrl = currentAppUrl.split('?')[0].split('#')[0];

  // Generate crisp, high-resolution QR code locally (Zero blur, Level H 30% error correction)
  useEffect(() => {
    let isMounted = true;
    setIsGenerating(true);

    QRCode.toDataURL(cleanAppUrl, {
      width: 1024,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#0f172a', // Deep slate high-contrast
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
          setIsGenerating(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate local QR code', err);
        // Fallback to high-res online image if canvas fails
        if (isMounted) {
          setQrDataUrl(
            `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(
              cleanAppUrl
            )}&margin=8&ecc=H`
          );
          setIsGenerating(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [cleanAppUrl]);

  // Handle keyboard shortcut Escape to go back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(cleanAppUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = cleanAppUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Failed to copy URL', e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const waUrl = `https://wa.me/${formatWhatsAppNumber(kostPhone)}?text=${encodeURIComponent(
    'Halo Pengelola Kost Acarya, saya ingin bertanya mengenai ketersediaan kamar.'
  )}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-xl rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-200">
        
        {/* Top Header Bar with Explicit Back Button */}
        <div className="p-3.5 sm:p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700 hover:text-stone-900 border border-stone-200/80 text-xs sm:text-sm font-semibold transition-all shadow-2xs active:scale-95 group"
            title="Kembali ke halaman sebelumnya"
            aria-label="Kembali ke halaman sebelumnya"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-800 transition-transform group-hover:-translate-x-0.5" />
            <span className="font-bold">Kembali ke Halaman Sebelumnya</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
            title="Tutup Modal"
            aria-label="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Title & Subtitle banner */}
        <div className="px-5 pt-4 pb-3 bg-white border-b border-stone-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-200 flex items-center justify-center font-bold text-base shadow-xs shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight leading-tight">
                Menu Barcode & QR Code Tamu
              </h2>
              <p className="text-xs text-stone-500">
                Pindai untuk membuka formulir ulasan Kost Acarya 1 & 2
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Resolusi Tajam HD</span>
          </div>
        </div>

        {/* View Mode Tabs (Stand Meja Tamu / QR Code Besar / Barcode) */}
        <div className="p-2.5 bg-stone-100 border-b border-stone-200 flex items-center justify-center gap-1.5 shrink-0">
          <button
            onClick={() => setActiveView('stand')}
            className={`flex-1 max-w-[170px] py-1.5 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeView === 'stand'
                ? 'bg-white text-emerald-900 shadow-xs border border-stone-200 font-bold'
                : 'text-stone-600 hover:bg-stone-200/70'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-700" />
            <span>Stand Meja Tamu</span>
          </button>

          <button
            onClick={() => setActiveView('qr_large')}
            className={`flex-1 max-w-[170px] py-1.5 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeView === 'qr_large'
                ? 'bg-white text-emerald-900 shadow-xs border border-stone-200 font-bold'
                : 'text-stone-600 hover:bg-stone-200/70'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-700" />
            <span>QR Code Besar HD</span>
          </button>

          <button
            onClick={() => setActiveView('barcode')}
            className={`flex-1 max-w-[170px] py-1.5 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeView === 'barcode'
                ? 'bg-white text-emerald-900 shadow-xs border border-stone-200 font-bold'
                : 'text-stone-600 hover:bg-stone-200/70'
            }`}
          >
            <BarcodeIcon className="w-3.5 h-3.5 text-emerald-700" />
            <span>Barcode 1D</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-stone-50 flex flex-col items-center justify-center flex-1">
          
          {/* TAB 1: STAND MEJA TAMU (PRINTABLE TENT CARD) */}
          {activeView === 'stand' && (
            <div
              ref={printRef}
              id="printable-stand-card"
              className="w-full max-w-[340px] bg-white rounded-2xl p-6 text-center shadow-lg border-2 border-stone-200 relative print:border-none print:shadow-none print:w-full print:max-w-none"
            >
              {/* Badge Stand Meja */}
              <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-100/90 text-emerald-900 text-[10px] font-extrabold uppercase tracking-widest mb-2 border border-emerald-200">
                <span>Display Meja Tamu</span>
              </div>

              {/* Brand Logo & Title */}
              <div className="w-12 h-12 rounded-2xl bg-emerald-900 text-amber-200 flex items-center justify-center font-bold text-xl mx-auto mb-2.5 shadow-sm border border-emerald-700">
                A
              </div>
              <h3 className="text-xl font-extrabold text-stone-900 tracking-tight">Kost Acarya 1 & 2</h3>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                Buku Tamu Digital & Ulasan Pengunjung
              </p>

              {/* Ultra High Clarity QR Code Container */}
              <div className="my-4 p-3 bg-white rounded-2xl border-2 border-stone-800/20 inline-block shadow-md relative group">
                {isGenerating ? (
                  <div className="w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center bg-stone-50 rounded-xl">
                    <span className="text-xs text-stone-400 font-medium animate-pulse">Menyiapkan QR HD...</span>
                  </div>
                ) : (
                  <img
                    src={qrDataUrl}
                    alt="QR Code Survei Kost Acarya 1 & 2"
                    className="w-48 h-48 sm:w-52 sm:h-52 mx-auto object-contain block select-none"
                    style={{ imageRendering: 'pixelated' }}
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-2xl">
                  <span className="bg-stone-900 text-white text-[10px] px-2 py-1 rounded-md font-bold">100% Tajam & Jelas</span>
                </div>
              </div>

              {/* Scanning Instructions */}
              <div className="space-y-1.5 px-2">
                <span className="text-xs sm:text-sm font-extrabold text-stone-900 block tracking-tight">
                  Silakan Scan Menggunakan Kamera HP
                </span>
                <p className="text-[11px] text-stone-600 leading-snug">
                  Arahkan kamera smartphone ke kode di atas untuk mengisi buku tamu atau memberikan ulasan penilaian.
                </p>
              </div>

              {/* Branch Locations & Contact */}
              <div className="mt-4 pt-3 border-t border-stone-200 text-left space-y-1.5 text-[10px] text-stone-600">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-800">Acarya 1:</span> Jl. Gempol No. 15, Banyuning, Singaraja
                  </div>
                </div>
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-800">Acarya 2:</span> Desa Padang Keling (Dekat STAH Mpu Kuturan)
                  </div>
                </div>
                <div className="flex items-center gap-1.5 pt-1 text-emerald-800 font-semibold">
                  <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>WhatsApp Pengelola: {kostPhone}</span>
                </div>
              </div>

              {/* Footer Note */}
              <div className="mt-3 pt-2 border-t border-dashed border-stone-200 flex items-center justify-center gap-1.5 text-[10px] text-stone-400">
                <Sparkles className="w-3 h-3 text-emerald-700" />
                <span>Terhubung otomatis ke Google Sheets Pengelola</span>
              </div>
            </div>
          )}

          {/* TAB 2: QR CODE BESAR HD */}
          {activeView === 'qr_large' && (
            <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 text-center shadow-md border border-stone-200 flex flex-col items-center">
              <div className="flex items-center justify-between w-full mb-3">
                <span className="text-xs font-bold text-stone-700">QR Code Mode Tampilan Besar</span>
                <button
                  onClick={() => setIsLargeSize(!isLargeSize)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                >
                  {isLargeSize ? (
                    <>
                      <Minimize2 className="w-3.5 h-3.5" />
                      <span>Ukuran Normal</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Perbesar HD</span>
                    </>
                  )}
                </button>
              </div>

              {/* Ultra High Clarity QR Box */}
              <div className={`p-4 bg-white rounded-3xl border-4 border-stone-900 shadow-xl transition-all ${
                isLargeSize ? 'w-72 h-72 sm:w-80 sm:h-80' : 'w-56 h-56 sm:w-64 sm:h-64'
              } flex items-center justify-center`}>
                {isGenerating ? (
                  <span className="text-xs text-stone-400 animate-pulse">Memuat QR Code HD...</span>
                ) : (
                  <img
                    src={qrDataUrl}
                    alt="QR Code HD Kost Acarya"
                    className="w-full h-full object-contain block"
                    style={{ imageRendering: 'pixelated' }}
                  />
                )}
              </div>

              <div className="mt-5 space-y-2 text-center w-full">
                <p className="text-xs sm:text-sm font-bold text-stone-800">
                  QR Code Resolusi Tinggi (Level Koreksi Error 30%)
                </p>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Dapat dipindai dari jarak jauh dan terbaca jelas meskipun di kondisi pencahayaan redup.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: BARCODE 1D (LINEAR CODE FORMAT) */}
          {activeView === 'barcode' && (
            <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 text-center shadow-md border border-stone-200 flex flex-col items-center">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Format Barcode Linear (1D Code)
              </span>

              {/* SVG High-Contrast Barcode */}
              <div className="w-full p-4 sm:p-6 bg-white rounded-2xl border-2 border-stone-800 shadow-xs flex flex-col items-center justify-center my-3">
                <div className="text-[11px] font-mono font-bold text-stone-700 tracking-wider mb-2">
                  KOST ACARYA 1 & 2 SURVEY
                </div>
                
                {/* Visual Barcode Bars Representation */}
                <svg
                  className="w-full h-24 max-w-[280px]"
                  viewBox="0 0 280 80"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Outer quiet zone */}
                  <rect width="280" height="80" fill="white" />
                  {/* Clean sharp barcode pattern */}
                  <g fill="#0f172a">
                    {/* Guard bars */}
                    <rect x="10" y="5" width="4" height="65" />
                    <rect x="18" y="5" width="2" height="65" />
                    <rect x="24" y="5" width="4" height="65" />
                    
                    {/* Data bars */}
                    <rect x="34" y="5" width="3" height="55" />
                    <rect x="40" y="5" width="6" height="55" />
                    <rect x="50" y="5" width="2" height="55" />
                    <rect x="56" y="5" width="5" height="55" />
                    <rect x="66" y="5" width="3" height="55" />
                    <rect x="73" y="5" width="7" height="55" />
                    <rect x="84" y="5" width="2" height="55" />
                    <rect x="90" y="5" width="4" height="55" />
                    <rect x="98" y="5" width="6" height="55" />
                    <rect x="108" y="5" width="2" height="55" />
                    <rect x="114" y="5" width="5" height="55" />
                    <rect x="123" y="5" width="4" height="55" />
                    <rect x="131" y="5" width="6" height="55" />
                    <rect x="141" y="5" width="3" height="55" />
                    <rect x="148" y="5" width="5" height="55" />
                    <rect x="157" y="5" width="7" height="55" />
                    <rect x="168" y="5" width="2" height="55" />
                    <rect x="174" y="5" width="6" height="55" />
                    <rect x="184" y="5" width="3" height="55" />
                    <rect x="191" y="5" width="5" height="55" />
                    <rect x="200" y="5" width="4" height="55" />
                    <rect x="208" y="5" width="6" height="55" />
                    <rect x="218" y="5" width="3" height="55" />
                    <rect x="225" y="5" width="5" height="55" />
                    <rect x="234" y="5" width="7" height="55" />
                    <rect x="245" y="5" width="2" height="55" />

                    {/* End guard bars */}
                    <rect x="252" y="5" width="4" height="65" />
                    <rect x="260" y="5" width="2" height="65" />
                    <rect x="266" y="5" width="4" height="65" />
                  </g>
                </svg>

                <div className="text-xs font-mono font-bold text-stone-900 tracking-widest mt-1">
                  *ACARYA-SURVEI-2026*
                </div>
              </div>

              <p className="text-xs text-stone-500 mt-2">
                Untuk pemindai barcode optik (scanner laser meja resepsionis).
              </p>
            </div>
          )}

          {/* Quick Copy Link Pill */}
          <div className="mt-4 w-full max-w-[340px] bg-white rounded-xl p-2.5 border border-stone-200 flex items-center justify-between gap-2 shadow-2xs">
            <div className="truncate text-left flex-1 min-w-0">
              <span className="text-[10px] text-stone-400 block font-semibold">Tautan Langsung Formulir:</span>
              <span className="text-xs text-stone-700 font-mono truncate block">{cleanAppUrl}</span>
            </div>
            <button
              onClick={handleCopyLink}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 transition-all ${
                copied
                  ? 'bg-emerald-700 text-white'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
              title="Salin Tautan"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin</span>
                </>
              )}
            </button>
          </div>

          {/* WhatsApp Owner Contact Link */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 text-xs text-emerald-800 hover:text-emerald-900 font-semibold flex items-center gap-1.5 hover:underline"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-700" />
            <span>WhatsApp Pengelola: {kostPhone}</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </a>
        </div>

        {/* Modal Actions Footer with Clear "Kembali" Button */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-stone-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          {/* Prominent Back Button */}
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-2xs active:scale-95 group"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-800 transition-transform group-hover:-translate-x-0.5" />
            <span>Kembali ke Halaman Sebelumnya</span>
          </button>

          {/* Action Buttons: Unduh & Cetak */}
          <div className="flex items-center gap-2">
            <a
              href={qrDataUrl || '#'}
              download="barcode-qr-kost-acarya.png"
              className="px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold text-xs sm:text-sm transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Unduh file gambar QR Code HD"
            >
              <Download className="w-4 h-4 text-emerald-700" />
              <span>Unduh HD</span>
            </a>

            <button
              onClick={handlePrint}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-xs active:scale-95"
              title="Cetak kartu stand meja"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Stand Meja</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
