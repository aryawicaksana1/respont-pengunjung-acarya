import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  QrCode, 
  Info, 
  BookOpen, 
  PenLine, 
  Lock, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X,
  Phone,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'form' | 'dashboard' | 'guide';
  setActiveTab: (tab: 'form' | 'dashboard' | 'guide') => void;
  onOpenInfo: () => void;
  onOpenQR: () => void;
  isSheetsConfigured: boolean;
  isAdmin: boolean;
  onOpenAdminLogin: (targetTab?: 'dashboard' | 'guide') => void;
  onAdminLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenInfo,
  onOpenQR,
  isSheetsConfigured,
  isAdmin,
  onOpenAdminLogin,
  onAdminLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (tab: 'form' | 'dashboard' | 'guide') => {
    setMobileMenuOpen(false);
    if (tab === 'form') {
      setActiveTab('form');
      return;
    }
    // Protected admin tabs
    if (!isAdmin) {
      onOpenAdminLogin(tab);
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 h-16">
            {/* Zone 1: Brand Wordmark */}
            <button
              onClick={() => {
                setActiveTab('form');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 text-left focus-visible:outline-emerald-600 rounded-md p-1 -ml-1 transition-opacity hover:opacity-85"
              aria-label="Ke Halaman Utama Kost Acarya"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-800 text-amber-200 flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                A
              </div>
              <div className="min-w-0">
                <span className="text-base sm:text-lg font-bold tracking-tight text-stone-900 block leading-tight truncate">
                  Kost Acarya
                </span>
                <span className="text-[11px] text-stone-500 block leading-tight truncate hidden xs:block">
                  Cabang 1 & 2 Singaraja
                </span>
              </div>
            </button>

            {/* Zone 2: Desktop Navigation Links (hidden on mobile) */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              <button
                onClick={() => handleNavClick('form')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'form'
                    ? 'bg-stone-100 text-stone-950 font-semibold'
                    : 'text-stone-600 hover:text-stone-950 hover:bg-stone-50'
                }`}
              >
                <PenLine className="w-4 h-4 text-emerald-700" />
                <span>Isi Pendapat</span>
              </button>

              {/* Buku Tamu (Admin Gated) */}
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'dashboard'
                    ? 'bg-stone-100 text-stone-950 font-semibold'
                    : 'text-stone-600 hover:text-stone-950 hover:bg-stone-50'
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <span>Buku Tamu & Rekap</span>
                {!isAdmin && <Lock className="w-3.5 h-3.5 text-stone-400 shrink-0" />}
              </button>

              {/* Panduan Google Sheet (Admin Gated) */}
              <button
                onClick={() => handleNavClick('guide')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'guide'
                    ? 'bg-stone-100 text-stone-950 font-semibold'
                    : 'text-stone-600 hover:text-stone-950 hover:bg-stone-50'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>Panduan Google Sheet</span>
                {!isAdmin && <Lock className="w-3.5 h-3.5 text-stone-400 shrink-0" />}
              </button>

              <button
                onClick={onOpenInfo}
                className="px-3 py-2 text-sm font-medium text-stone-600 hover:text-stone-950 hover:bg-stone-50 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <Info className="w-4 h-4 text-stone-400" />
                <span>Info Kost</span>
              </button>
            </nav>

            {/* Zone 3: Desktop Actions & Mobile Hamburger Controls */}
            <div className="flex items-center gap-2">
              {/* Stand QR & Barcode Trigger (Desktop & Mobile) */}
              <button
                onClick={onOpenQR}
                className="min-h-[44px] px-3 py-2 text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 rounded-xl transition-all border border-emerald-200 flex items-center gap-1.5 shadow-2xs shrink-0"
                title="Buka Menu Barcode & QR Code Tamu"
                aria-label="Menu Barcode & QR Code"
              >
                <QrCode className="w-4 h-4 text-emerald-800 shrink-0" />
                <span className="hidden sm:inline font-semibold">Barcode & QR</span>
              </button>

              {/* Desktop Admin Action Buttons */}
              <div className="hidden md:flex items-center gap-2">
                {isAdmin ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActiveTab('guide')}
                      className={`min-h-[44px] px-4 py-2 text-sm font-semibold rounded-xl transition-all flex items-center gap-2 shadow-xs whitespace-nowrap ${
                        isSheetsConfigured
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                          : 'bg-emerald-800 text-white hover:bg-emerald-900'
                      }`}
                    >
                      <FileSpreadsheet className="w-4 h-4 shrink-0" />
                      <span>{isSheetsConfigured ? 'Sheet Terhubung' : 'Sambungkan Sheet'}</span>
                    </button>
                    <button
                      onClick={onAdminLogout}
                      className="min-h-[44px] min-w-[44px] p-2 text-stone-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors border border-stone-200 flex items-center justify-center"
                      title="Keluar dari Mode Admin"
                      aria-label="Logout Admin"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onOpenAdminLogin()}
                    className="min-h-[44px] px-4 py-2 text-sm font-semibold rounded-xl bg-stone-900 hover:bg-stone-800 text-white transition-all flex items-center gap-2 shadow-xs whitespace-nowrap"
                    title="Masuk sebagai Pemilik/Pengelola Kost"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-300" />
                    <span>Login Admin</span>
                  </button>
                )}
              </div>

              {/* Mobile Hamburger Toggle Button (visible ONLY on mobile / small screens) */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden min-h-[44px] min-w-[44px] p-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-xl transition-colors border border-stone-200 flex items-center justify-center focus-visible:outline-emerald-600"
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-stone-900" />
                ) : (
                  <Menu className="w-5 h-5 text-stone-900" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Down / Fullscreen Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 md:hidden flex flex-col pt-16 animate-in fade-in duration-200">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs -z-10"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Menu Container */}
          <div className="bg-white border-b border-stone-200 shadow-xl overflow-y-auto max-h-[calc(100vh-4rem)] p-5 space-y-6 animate-in slide-in-from-top-4 duration-200">
            {/* Header info badge */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-900">Kost Acarya 1 & 2</span>
                <span>·</span>
                <span className="text-[11px] text-stone-500">Menu Navigasi</span>
              </div>
              {isAdmin ? (
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-700" />
                  Mode Admin
                </span>
              ) : (
                <span className="text-[11px] text-stone-400">Mode Pengunjung</span>
              )}
            </div>

            {/* Primary Nav Links */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                Halaman Utama
              </span>

              {/* Form Kunjungan */}
              <button
                onClick={() => handleNavClick('form')}
                className={`w-full min-h-[48px] px-4 py-3 rounded-xl flex items-center justify-between transition-colors text-left ${
                  activeTab === 'form'
                    ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200'
                    : 'text-stone-700 hover:bg-stone-50 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <PenLine className="w-4 h-4 text-emerald-800" />
                  <span className="text-sm">Isi Pendapat Kunjungan</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>

              {/* Buku Tamu (Admin Gated) */}
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`w-full min-h-[48px] px-4 py-3 rounded-xl flex items-center justify-between transition-colors text-left ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200'
                    : 'text-stone-700 hover:bg-stone-50 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-emerald-800" />
                  <div>
                    <span className="text-sm block">Buku Tamu & Rekapitulasi</span>
                    {!isAdmin && (
                      <span className="text-[11px] text-stone-400 font-normal">
                        Khusus Pemilik / Pengelola Kost
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isAdmin && <Lock className="w-3.5 h-3.5 text-amber-600" />}
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </div>
              </button>

              {/* Panduan Google Sheet (Admin Gated) */}
              <button
                onClick={() => handleNavClick('guide')}
                className={`w-full min-h-[48px] px-4 py-3 rounded-xl flex items-center justify-between transition-colors text-left ${
                  activeTab === 'guide'
                    ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200'
                    : 'text-stone-700 hover:bg-stone-50 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-800" />
                  <div>
                    <span className="text-sm block">Panduan Google Apps Script</span>
                    <span className="text-[11px] text-stone-400 font-normal">
                      {isSheetsConfigured ? 'Spreadsheet Terhubung' : 'Webhook & Database'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isAdmin && <Lock className="w-3.5 h-3.5 text-amber-600" />}
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </div>
              </button>
            </div>

            {/* Quick Actions & Info */}
            <div className="space-y-1.5 pt-2 border-t border-stone-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                Informasi & Bantuan Tamu
              </span>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenInfo();
                }}
                className="w-full min-h-[48px] px-4 py-3 rounded-xl flex items-center justify-between text-stone-700 hover:bg-stone-50 text-left font-medium"
              >
                <div className="flex items-center gap-3">
                  <Info className="w-4 h-4 text-stone-500" />
                  <span className="text-sm">Info Kost & Jam Bertamu</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenQR();
                }}
                className="w-full min-h-[50px] px-4 py-3 rounded-xl flex items-center justify-between text-stone-800 bg-emerald-50/70 border border-emerald-200/80 hover:bg-emerald-100/70 text-left font-medium transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-800 text-amber-200 flex items-center justify-center shrink-0">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-stone-900 block">Menu Barcode & QR Code</span>
                    <span className="text-[11px] text-stone-500">Scan meja tamu & cetak stand</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>
            </div>

            {/* Admin Authentication Box in Drawer */}
            <div className="pt-2 border-t border-stone-100">
              {isAdmin ? (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      Mode Admin Aktif
                    </span>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onAdminLogout();
                      }}
                      className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Anda memiliki akses penuh untuk melihat rekap buku tamu dan mengatur Google Sheet.
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdminLogin();
                  }}
                  className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-stone-900 text-white font-semibold text-xs sm:text-sm hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <Lock className="w-4 h-4 text-amber-300" />
                  <span>Login Pengelola Kost (Admin)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
