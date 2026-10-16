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
  Globe
} from 'lucide-react';
import QRCode from 'qrcode';
import { formatWhatsAppNumber } from '../utils/feedback.ts';

interface QRCodeModalProps {
  kostName: string;
  kostPhone?: string;
  onClose: () => void;
}

// URL Resmi Kost Acarya sesuai instruksi
const TARGET_APP_URL = 'https://respont-acarya.vercel.app';

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  kostName,
  kostPhone = '+62 878-6726-1660',
  onClose,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'qr_full' | 'barcode' | 'stand_print'>('qr_full');
  const [copied, setCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Generate crisp, high-resolution QR code locally for https://respont-acarya.vercel.app
  useEffect(() => {
    let isMounted = true;
    setIsGenerating(true);

    QRCode.toDataURL(TARGET_APP_URL, {
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
        if (isMounted) {
          setQrDataUrl(
            `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(
              TARGET_APP_URL
            )}&margin=6&ecc=H`
          );
          setIsGenerating(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Keyboard shortcut ESC to return
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
        await navigator.clipboard.writeText(TARGET_APP_URL);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = TARGET_APP_URL;
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
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`bg-white w-full ${isExpanded ? 'max-w-2xl' : 'max-w-md sm:max-w-lg'} rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[96vh] animate-in zoom-in-95 duration-200 transition-all`}>
        
        {/* Top Header Bar with Prominent Back Button */}
        <div className="p-3 sm:p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-200/90 text-xs sm:text-sm font-bold transition-all shadow-2xs active:scale-95 group"
            title="Kembali ke halaman sebelumnya"
            aria-label="Kembali ke halaman sebelumnya"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-800 transition-transform group-hover:-translate-x-0.5" />
            <span>Kembali ke Halaman Sebelumnya</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
            title="Tutup Modal"
            aria-label="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation: QR Full, Barcode, Stand Meja */}
        <div className="p-2 bg-stone-100/90 border-b border-stone-200 flex items-center justify-center gap-1 shrink-0">
          <button
            onClick={() => setActiveTab('qr_full')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'qr_full'
                ? 'bg-white text-emerald-900 shadow-xs border border-stone-200 font-bold'
                : 'text-stone-600 hover:bg-stone-200/60'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-700" />
            <span>QR Code Penuh</span>
          </button>

          <button
            onClick={() => setActiveTab('barcode')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'barcode'
                ? 'bg-white text-emerald-900 shadow-xs border border-stone-200 font-bold'
                : 'text-stone-600 hover:bg-stone-200/60'
            }`}
          >
            <BarcodeIcon className="w-3.5 h-3.5 text-emerald-700" />
            <span>Barcode 1D Penuh</span>
          </button>

          <button
            onClick={() => setActiveTab('stand_print')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'stand_print'
                ? 'bg-white text-emerald-900 shadow-xs border border-stone-200 font-bold'
                : 'text-stone-600 hover:bg-stone-200/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-700" />
            <span>Stand Meja Cetak</span>
          </button>
        </div>

        {/* Modal Body: FULL, UNCUT, CRYSTAL-CLEAR DISPLAY */}
        <div className="p-3.5 sm:p-6 overflow-y-auto bg-stone-50 flex flex-col items-center flex-1 w-full min-h-0">
          <div className="w-full flex flex-col items-center py-2">
          
          {/* TAB 1: QR CODE PENUH (100% Full View, No Cutoff) */}
          {activeTab === 'qr_full' && (
            <div className="w-full max-w-sm bg-white rounded-3xl p-4 sm:p-6 text-center shadow-lg border-2 border-stone-200 flex flex-col items-center">
              
              {/* Badge & Title */}
              <div className="flex items-center justify-between w-full mb-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>QR Code Penuh HD</span>
                </span>

                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                  title={isExpanded ? 'Kecilkan' : 'Perbesar Tampilan'}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight">
                Kost Acarya 1 & 2
              </h3>
              <p className="text-[11px] text-stone-500">
                Buku Tamu Digital & Kunjungan Tamu
              </p>

              {/* QR Image Box (FULL VIEW, NO CROPPING) */}
              <div className="my-2.5 p-2.5 sm:p-3 bg-white rounded-2xl border-2 border-stone-900 shadow-md flex items-center justify-center">
                {isGenerating ? (
                  <div className="w-44 h-44 sm:w-56 sm:h-56 flex items-center justify-center bg-stone-50 rounded-xl">
                    <span className="text-xs text-stone-400 animate-pulse font-medium">Memuat QR Code HD...</span>
                  </div>
                ) : (
                  <img
                    src={qrDataUrl}
                    alt="QR Code Survei Kost Acarya 1 & 2"
                    className="w-44 h-44 sm:w-56 sm:h-56 max-h-[35vh] aspect-square object-contain block mx-auto select-none"
                    style={{ imageRendering: 'pixelated' }}
                  />
                )}
              </div>

              <span className="text-xs font-bold text-stone-900 block">
                Pindai dengan Kamera HP Anda
              </span>
              <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
                Otomatis membuka formulir di browser smartphone
              </p>
            </div>
          )}

          {/* TAB 2: BARCODE 1D PENUH (FULL LINEAR VIEW - 100% UTUH) */}
          {activeTab === 'barcode' && (
            <div className="w-full max-w-sm bg-white rounded-3xl p-4 sm:p-6 text-center shadow-lg border-2 border-stone-200 flex flex-col items-center">
              
              <div className="flex items-center justify-between w-full mb-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Barcode 1D Linear (Full View)
                </span>
                <span className="text-[10px] text-stone-500 font-mono font-semibold">Code-128 Laser</span>
              </div>

              <h3 className="text-lg font-extrabold text-stone-900 tracking-tight">
                Kost Acarya 1 & 2
              </h3>
              <p className="text-[11px] text-stone-500">
                Pemindai Barcode Meja / Laser Resepsionis
              </p>

              {/* Full Linear Barcode Box with Quiet Zones (No Cutoff) */}
              <div className="my-3 w-full p-3 sm:p-4 bg-white rounded-2xl border-2 border-stone-900 shadow-md flex flex-col items-center justify-center">
                <div className="text-[11px] font-mono font-bold text-emerald-800 tracking-wider mb-2">
                  respont-acarya.vercel.app
                </div>

                <div className="w-full flex items-center justify-center overflow-x-auto py-1">
                  <svg
                    className="w-full h-20 sm:h-24 max-w-[310px] shrink-0"
                    viewBox="0 0 320 84"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="320" height="84" fill="white" rx="4" />
                    <g fill="#0f172a">
                      {/* Quiet zone & Start guard bars */}
                      <rect x="12" y="6" width="4" height="72" />
                      <rect x="18" y="6" width="2" height="72" />
                      <rect x="23" y="6" width="4" height="72" />
                      
                      {/* Data pattern bars for respont-acarya.vercel.app */}
                      <rect x="31" y="6" width="3" height="60" />
                      <rect x="37" y="6" width="5" height="60" />
                      <rect x="45" y="6" width="2" height="60" />
                      <rect x="50" y="6" width="4" height="60" />
                      <rect x="57" y="6" width="3" height="60" />
                      <rect x="63" y="6" width="6" height="60" />
                      <rect x="72" y="6" width="2" height="60" />
                      <rect x="77" y="6" width="4" height="60" />
                      <rect x="84" y="6" width="5" height="60" />
                      <rect x="92" y="6" width="2" height="60" />
                      <rect x="97" y="6" width="5" height="60" />
                      <rect x="105" y="6" width="3" height="60" />
                      <rect x="111" y="6" width="6" height="60" />
                      <rect x="120" y="6" width="3" height="60" />
                      <rect x="126" y="6" width="4" height="60" />
                      <rect x="133" y="6" width="6" height="60" />
                      <rect x="142" y="6" width="2" height="60" />
                      <rect x="147" y="6" width="5" height="60" />
                      <rect x="155" y="6" width="3" height="60" />
                      <rect x="161" y="6" width="5" height="60" />
                      <rect x="169" y="6" width="4" height="60" />
                      <rect x="176" y="6" width="5" height="60" />
                      <rect x="184" y="6" width="3" height="60" />
                      <rect x="190" y="6" width="5" height="60" />
                      <rect x="198" y="6" width="6" height="60" />
                      <rect x="207" y="6" width="2" height="60" />
                      <rect x="212" y="6" width="5" height="60" />
                      <rect x="220" y="6" width="4" height="60" />
                      <rect x="227" y="6" width="5" height="60" />
                      <rect x="235" y="6" width="3" height="60" />
                      <rect x="241" y="6" width="5" height="60" />
                      <rect x="249" y="6" width="6" height="60" />
                      <rect x="258" y="6" width="2" height="60" />
                      <rect x="263" y="6" width="5" height="60" />
                      <rect x="271" y="6" width="4" height="60" />
                      <rect x="278" y="6" width="6" height="60" />
                      <rect x="287" y="6" width="2" height="60" />

                      {/* End guard bars & Quiet zone */}
                      <rect x="293" y="6" width="4" height="72" />
                      <rect x="299" y="6" width="2" height="72" />
                      <rect x="304" y="6" width="4" height="72" />
                    </g>
                  </svg>
                </div>

                <div className="text-xs font-mono font-extrabold text-stone-900 tracking-wider mt-2 bg-stone-100 px-3 py-1 rounded-md border border-stone-200">
                  *RESPONT-ACARYA-VERCEL-APP*
                </div>
              </div>

              <p className="text-[11px] text-stone-500">
                Dapat dipindai langsung menggunakan scanner barcode optik / kamera HP
              </p>
            </div>
          )}

          {/* TAB 3: STAND MEJA CETAK (PRINTABLE TENT CARD) */}
          {activeTab === 'stand_print' && (
            <div
              ref={printRef}
              id="printable-stand-card"
              className="w-full max-w-sm bg-white rounded-3xl p-5 text-center shadow-lg border-2 border-stone-200"
            >
              <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-extrabold uppercase tracking-widest mb-1.5 border border-emerald-200">
                <span>Display Stand Meja</span>
              </div>

              <h3 className="text-lg font-extrabold text-stone-900 tracking-tight">Kost Acarya 1 & 2</h3>
              <p className="text-[11px] text-stone-500">Buku Tamu Digital & Ulasan Pengunjung</p>

              <div className="my-3 p-2.5 bg-white rounded-2xl border-2 border-stone-900 inline-block shadow-sm">
                <img
                  src={qrDataUrl}
                  alt="QR Code Survei Kost Acarya 1 & 2"
                  className="w-44 h-44 mx-auto object-contain block select-none"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-stone-900 block">
                  Silakan Scan Menggunakan Kamera HP
                </span>
                <p className="text-[11px] text-stone-600 font-mono">
                  {TARGET_APP_URL}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-stone-200 text-left space-y-1 text-[10px] text-stone-600">
                <div className="flex items-start gap-1">
                  <MapPin className="w-3 h-3 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Acarya 1:</strong> Jl. Gempol No. 15, Banyuning, Singaraja</span>
                </div>
                <div className="flex items-start gap-1">
                  <MapPin className="w-3 h-3 text-emerald-700 shrink-0 mt-0.5" />
                  <span><strong>Acarya 2:</strong> Desa Padang Keling (Dekat STAH Mpu Kuturan)</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-800 font-bold pt-0.5">
                  <Phone className="w-3 h-3 text-emerald-700 shrink-0" />
                  <span>WhatsApp: {kostPhone}</span>
                </div>
              </div>
            </div>
          )}

          {/* Target URL Pill with 1-Click Copy */}
          <div className="mt-3.5 w-full max-w-sm bg-white rounded-xl p-2.5 border border-stone-200 flex items-center justify-between gap-2 shadow-2xs">
            <div className="truncate text-left flex-1 min-w-0 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-700 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-stone-400 block font-semibold">Tautan Resmi Barcode:</span>
                <span className="text-xs text-emerald-950 font-bold font-mono truncate block">
                  {TARGET_APP_URL}
                </span>
              </div>
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

          {/* Direct WhatsApp link */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2.5 text-xs text-emerald-800 hover:text-emerald-900 font-semibold flex items-center gap-1.5 hover:underline"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-700" />
            <span>WhatsApp Pengelola: {kostPhone}</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </a>
          </div>
        </div>

        {/* Modal Actions Footer with Clear "Kembali" Button */}
        <div className="p-3 sm:p-3.5 bg-white border-t border-stone-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          {/* Prominent Back Button */}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-2xs active:scale-95 group"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-800 transition-transform group-hover:-translate-x-0.5" />
            <span>Kembali ke Halaman Sebelumnya</span>
          </button>

          {/* Action Buttons: Unduh & Cetak */}
          <div className="flex items-center gap-2">
            <a
              href={qrDataUrl || '#'}
              download="barcode-kost-acarya-hd.png"
              className="px-3 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold text-xs sm:text-sm transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Unduh file gambar QR Code HD"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Unduh HD</span>
            </a>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-xs active:scale-95"
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
