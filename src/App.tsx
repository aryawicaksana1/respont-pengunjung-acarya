import React, { useState, useEffect } from 'react';
import type { VisitorFeedback, AppSettings, KostBranch } from './types/feedback.ts';
import { DEFAULT_SETTINGS, INITIAL_FEEDBACK_SEED } from './data/seedData.ts';
import { Header } from './components/Header.tsx';
import { FeedbackForm } from './components/FeedbackForm.tsx';
import { SuccessState } from './components/SuccessState.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { GoogleSheetsGuideModal } from './components/GoogleSheetsGuideModal.tsx';
import { KostInfoModal } from './components/KostInfoModal.tsx';
import { QRCodeModal } from './components/QRCodeModal.tsx';
import { AdminLoginModal } from './components/AdminLoginModal.tsx';
import { Footer } from './components/Footer.tsx';
import { 
  sendFeedbackToGoogleAppsScript, 
  fetchFeedbacksFromGoogleSheets,
  saveKostPhotoToGoogleSheet,
  fetchKostPhotosFromGoogleSheet
} from './services/googleSheets.ts';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'dashboard' | 'guide'>('form');

  // Load state from localStorage or seed
  const [feedbacks, setFeedbacks] = useState<VisitorFeedback[]>(() => {
    try {
      const saved = localStorage.getItem('kost_acarya_feedbacks');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load feedbacks from localStorage', e);
    }
    return INITIAL_FEEDBACK_SEED;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('kost_acarya_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          kostPhone:
            parsed.kostPhone &&
            parsed.kostPhone !== '0812-3456-7890' &&
            parsed.kostPhone !== '081234567890'
              ? parsed.kostPhone
              : DEFAULT_SETTINGS.kostPhone,
          kostAddress:
            parsed.kostAddress && parsed.kostAddress.includes('Jl. Acarya No. 2')
              ? DEFAULT_SETTINGS.kostAddress
              : parsed.kostAddress || DEFAULT_SETTINGS.kostAddress,
          adminPin:
            parsed.adminPin && parsed.adminPin !== 'acarya2026'
              ? parsed.adminPin
              : 'acaryasingaraja',
          googleAppsScriptUrl:
            parsed.googleAppsScriptUrl && parsed.googleAppsScriptUrl.trim().length > 0
              ? parsed.googleAppsScriptUrl
              : DEFAULT_SETTINGS.googleAppsScriptUrl,
        };
      }
    } catch (e) {
      console.error('Failed to load settings from localStorage', e);
    }
    return DEFAULT_SETTINGS;
  });

  // Admin authentication state
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem('kost_acarya_is_admin') === 'true' ||
        sessionStorage.getItem('kost_acarya_is_admin') === 'true'
      );
    } catch {
      return false;
    }
  });

  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [pendingAdminTab, setPendingAdminTab] = useState<'dashboard' | 'guide' | null>(null);

  const [lastSubmission, setLastSubmission] = useState<VisitorFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isLegacyScriptDetected, setIsLegacyScriptDetected] = useState(false);

  // Centralized Kost Photos (Shared & synced via Google Sheet)
  const [acarya1Image, setAcarya1Image] = useState<string>(() => {
    try {
      return (
        localStorage.getItem('kost_acarya_1_image') ||
        settings.kostAcarya1Image ||
        DEFAULT_SETTINGS.kostAcarya1Image ||
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'
      );
    } catch {
      return DEFAULT_SETTINGS.kostAcarya1Image || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80';
    }
  });

  const [acarya2Image, setAcarya2Image] = useState<string>(() => {
    try {
      return (
        localStorage.getItem('kost_acarya_2_image') ||
        settings.kostAcarya2Image ||
        DEFAULT_SETTINGS.kostAcarya2Image ||
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
      );
    } catch {
      return DEFAULT_SETTINGS.kostAcarya2Image || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80';
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kost_acarya_feedbacks', JSON.stringify(feedbacks));
    } catch (e) {
      console.error('Failed to save feedbacks to localStorage', e);
    }
  }, [feedbacks]);

  useEffect(() => {
    try {
      localStorage.setItem('kost_acarya_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  }, [settings]);

  // Otomatis sinkronkan buku tamu dan foto terbaru dari Google Sheet saat web dibuka.
  // Jika baris di Google Sheet dihapus oleh pengelola, ulasan di web juga otomatis terhapus!
  useEffect(() => {
    let isMounted = true;
    async function loadDataFromGoogleSheet() {
      if (!settings.googleAppsScriptUrl) return;

      try {
        const res = await fetchFeedbacksFromGoogleSheets(settings.googleAppsScriptUrl);
        if (!isMounted) return;

        if (res.isLegacyScript) {
          setIsLegacyScriptDetected(true);
        } else if (res.success) {
          setIsLegacyScriptDetected(false);
        }

        if (res.success && res.feedbacks) {
          // Sinkronisasi data ulasan resmi dari Google Sheet
          setFeedbacks(res.feedbacks);
        }

        if (res.photos) {
          if (res.photos.acarya1) {
            setAcarya1Image(res.photos.acarya1);
            try {
              localStorage.setItem('kost_acarya_1_image', res.photos.acarya1);
            } catch {}
          }
          if (res.photos.acarya2) {
            setAcarya2Image(res.photos.acarya2);
            try {
              localStorage.setItem('kost_acarya_2_image', res.photos.acarya2);
            } catch {}
          }
        } else {
          // Extra check jika skrip lama merespon read tanpa photos
          const photoRes = await fetchKostPhotosFromGoogleSheet(settings.googleAppsScriptUrl);
          if (isMounted) {
            if (photoRes.isLegacyScript) {
              setIsLegacyScriptDetected(true);
            }
            if (photoRes.success && photoRes.photos) {
              if (photoRes.photos.acarya1) {
                setAcarya1Image(photoRes.photos.acarya1);
                try {
                  localStorage.setItem('kost_acarya_1_image', photoRes.photos.acarya1);
                } catch {}
              }
              if (photoRes.photos.acarya2) {
                setAcarya2Image(photoRes.photos.acarya2);
                try {
                  localStorage.setItem('kost_acarya_2_image', photoRes.photos.acarya2);
                } catch {}
              }
            }
          }
        }
      } catch (err) {
        console.warn('Initial Google Sheet sync skipped', err);
      }
    }

    loadDataFromGoogleSheet();

    return () => {
      isMounted = false;
    };
  }, [settings.googleAppsScriptUrl]);

  // Guard active tab if not admin
  useEffect(() => {
    if (!isAdmin && (activeTab === 'dashboard' || activeTab === 'guide')) {
      setActiveTab('form');
    }
  }, [isAdmin, activeTab]);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const handleOpenAdminLogin = (targetTab?: 'dashboard' | 'guide') => {
    if (targetTab) {
      setPendingAdminTab(targetTab);
    } else {
      setPendingAdminTab('dashboard');
    }
    setShowAdminLoginModal(true);
  };

  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    setShowAdminLoginModal(false);
    showToast('success', 'Berhasil masuk sebagai Admin Kost Acarya 2!');
    if (pendingAdminTab) {
      setActiveTab(pendingAdminTab);
      setPendingAdminTab(null);
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleAdminLogout = () => {
    try {
      localStorage.removeItem('kost_acarya_is_admin');
      sessionStorage.removeItem('kost_acarya_is_admin');
    } catch (e) {
      console.error(e);
    }
    setIsAdmin(false);
    setActiveTab('form');
    showToast('info', 'Anda telah keluar dari mode Admin pengelola.');
  };

  const handleSaveScriptUrl = (url: string) => {
    setSettings((prev) => ({
      ...prev,
      googleAppsScriptUrl: url,
    }));
    showToast('success', 'URL Google Apps Script berhasil disimpan!');
  };

  const handleSubmitFeedback = async (
    data: Omit<VisitorFeedback, 'id' | 'timestamp' | 'synced' | 'syncTimestamp' | 'syncError'>
  ) => {
    setIsSubmitting(true);
    const newId = 'fb_' + Date.now();
    const nowIso = new Date().toISOString();

    let synced = false;
    let syncError: string | undefined;

    if (settings.googleAppsScriptUrl && settings.googleAppsScriptUrl.trim().length > 0) {
      const feedbackPayload: VisitorFeedback = {
        ...data,
        id: newId,
        timestamp: nowIso,
        synced: false,
      };

      const sendResult = await sendFeedbackToGoogleAppsScript(
        settings.googleAppsScriptUrl,
        feedbackPayload
      );

      if (sendResult.success) {
        synced = true;
      } else {
        syncError = sendResult.message;
      }
    }

    const createdFeedback: VisitorFeedback = {
      ...data,
      id: newId,
      timestamp: nowIso,
      synced,
      syncTimestamp: synced ? nowIso : undefined,
      syncError,
    };

    setFeedbacks((prev) => [createdFeedback, ...prev]);
    setLastSubmission(createdFeedback);
    setIsSubmitting(false);

    if (synced) {
      showToast('success', 'Tanggapan Anda telah terkirim dan dicatat di Google Sheet!');
    } else if (settings.googleAppsScriptUrl) {
      showToast('info', 'Tanggapan tersimpan di sistem lokal (Koneksi Sheet terhambat).');
    } else {
      showToast('info', 'Tanggapan tersimpan di sistem lokal (Sheet belum dihubungkan).');
    }
  };

  const handleSyncAll = async () => {
    if (!settings.googleAppsScriptUrl) {
      setActiveTab('guide');
      showToast('info', 'Harap masukkan URL Google Apps Script Anda terlebih dahulu.');
      return;
    }

    const unsyncedList = feedbacks.filter((f) => !f.synced);
    if (unsyncedList.length === 0) {
      showToast('info', 'Semua data sudah tersinkron ke Google Sheet.');
      return;
    }

    setIsSyncing(true);
    let successCount = 0;

    const updatedFeedbacks = [...feedbacks];

    for (const item of unsyncedList) {
      const res = await sendFeedbackToGoogleAppsScript(settings.googleAppsScriptUrl, item);
      if (res.success) {
        successCount++;
        const index = updatedFeedbacks.findIndex((f) => f.id === item.id);
        if (index !== -1) {
          updatedFeedbacks[index] = {
            ...updatedFeedbacks[index],
            synced: true,
            syncTimestamp: new Date().toISOString(),
            syncError: undefined,
          };
        }
      }
    }

    setFeedbacks(updatedFeedbacks);
    setIsSyncing(false);

    if (successCount > 0) {
      showToast('success', `Berhasil menyinkronkan ${successCount} data ke Google Spreadsheet!`);
    } else {
      showToast('error', 'Gagal menyinkronkan ke Google Spreadsheet. Periksa kembali URL Apps Script Anda.');
    }
  };

  const handleSaveKostPhoto = async (branch: KostBranch, newImageUrl: string) => {
    setIsSavingPhoto(true);
    if (branch === 'Kost Acarya 1') {
      setAcarya1Image(newImageUrl);
      try {
        localStorage.setItem('kost_acarya_1_image', newImageUrl);
      } catch {}
    } else {
      setAcarya2Image(newImageUrl);
      try {
        localStorage.setItem('kost_acarya_2_image', newImageUrl);
      } catch {}
    }

    if (settings.googleAppsScriptUrl) {
      const res = await saveKostPhotoToGoogleSheet(settings.googleAppsScriptUrl, branch, newImageUrl);
      setIsSavingPhoto(false);
      if (res.isLegacyScript) {
        setIsLegacyScriptDetected(true);
        showToast('info', `Foto tersimpan di browser ini. Perbarui kode Google Sheet Anda agar tampil untuk pengunjung lain.`);
      } else if (res.success) {
        setIsLegacyScriptDetected(false);
        showToast('success', `Foto ${branch} berhasil disimpan permanen ke Google Sheet untuk seluruh pengunjung!`);
      } else {
        showToast('info', `Foto ${branch} disimpan di sistem peramban lokal.`);
      }
    } else {
      setIsSavingPhoto(false);
      showToast('info', `Foto ${branch} disimpan lokal (Google Sheet belum terhubung).`);
    }
  };

  const handleResetKostPhoto = (branch: KostBranch) => {
    if (branch === 'Kost Acarya 1') {
      const def = DEFAULT_SETTINGS.kostAcarya1Image || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80';
      setAcarya1Image(def);
      try {
        localStorage.removeItem('kost_acarya_1_image');
      } catch {}
    } else {
      const def = DEFAULT_SETTINGS.kostAcarya2Image || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80';
      setAcarya2Image(def);
      try {
        localStorage.removeItem('kost_acarya_2_image');
      } catch {}
    }
    showToast('info', `Foto ${branch} dikembalikan ke foto bawaan.`);
  };

  const handleRefreshFromSheet = async () => {
    if (!settings.googleAppsScriptUrl) {
      showToast('info', 'URL Google Apps Script belum dikonfigurasi.');
      return;
    }
    setIsSyncing(true);
    try {
      const res = await fetchFeedbacksFromGoogleSheets(settings.googleAppsScriptUrl);
      if (res.success && res.feedbacks) {
        setFeedbacks(res.feedbacks);
        if (res.photos) {
          if (res.photos.acarya1) setAcarya1Image(res.photos.acarya1);
          if (res.photos.acarya2) setAcarya2Image(res.photos.acarya2);
        }
        showToast('success', `Data buku tamu tersinkron! (${res.feedbacks.length} data aktif dari Google Sheet).`);
      } else {
        showToast('error', res.message || 'Gagal menyegarkan data dari Google Sheet.');
      }
    } catch {
      showToast('error', 'Gagal menyambung ke server Google Apps Script.');
    } finally {
      setIsSyncing(false);
    }
  };

  const isSheetsConfigured = Boolean(
    settings.googleAppsScriptUrl && settings.googleAppsScriptUrl.trim().startsWith('https://')
  );

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-800">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'form') {
            setLastSubmission(null);
          }
        }}
        onOpenInfo={() => setShowInfoModal(true)}
        onOpenQR={() => setShowQRModal(true)}
        isSheetsConfigured={isSheetsConfigured}
        isAdmin={isAdmin}
        onOpenAdminLogin={handleOpenAdminLogin}
        onAdminLogout={handleAdminLogout}
      />

      {/* Admin Legacy Script Warning Banner */}
      {isAdmin && isLegacyScriptDetected && (
        <div className="bg-amber-100 border-b border-amber-300 px-4 py-3 shadow-2xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-amber-950">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-800 shrink-0" />
              <span>
                <strong>Perhatian Admin:</strong> Skrip Google Apps Script di Spreadsheet Anda masih versi lama. Foto kost dan sinkronisasi penghapusan belum aktif untuk pengunjung lain sampai Anda memperbarui kode di Google Sheet.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('guide')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs shrink-0 transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <span>Buka Panduan & Salin Kode</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-4 duration-300">
          <div
            className={`px-4 py-3 rounded-2xl shadow-lg border flex items-center gap-3 text-xs sm:text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : toast.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700'
                : 'bg-stone-900 text-white border-stone-700'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-amber-300 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'form' && (
          <>
            {lastSubmission ? (
              <SuccessState
                lastSubmission={lastSubmission}
                onReset={() => setLastSubmission(null)}
                onOpenDashboard={() => {
                  if (isAdmin) {
                    setActiveTab('dashboard');
                  } else {
                    handleOpenAdminLogin('dashboard');
                  }
                }}
                kostPhone={settings.kostPhone}
              />
            ) : (
              <FeedbackForm
                onSubmit={handleSubmitFeedback}
                isSubmitting={isSubmitting}
                isSheetsConfigured={isSheetsConfigured}
                isAdmin={isAdmin}
                adminPin={settings.adminPin}
                onAdminLoginSuccess={() => {
                  setIsAdmin(true);
                  showToast('success', 'Akses Admin berhasil dibuka!');
                }}
                onOpenGuide={() => {
                  if (isAdmin) {
                    setActiveTab('guide');
                  } else {
                    handleOpenAdminLogin('guide');
                  }
                }}
                acarya1Image={acarya1Image}
                acarya2Image={acarya2Image}
                onSaveCustomImage={handleSaveKostPhoto}
                onResetDefaultImage={handleResetKostPhoto}
                isSavingPhotoOnline={isSavingPhoto}
                isLegacyScript={isLegacyScriptDetected}
              />
            )}
          </>
        )}

        {/* Protected Dashboard - only rendered if admin */}
        {activeTab === 'dashboard' && isAdmin && (
          <DashboardView
            feedbacks={feedbacks}
            onSyncAll={handleSyncAll}
            onRefreshFromSheet={handleRefreshFromSheet}
            isSyncing={isSyncing}
            isSheetsConfigured={isSheetsConfigured}
            onOpenGuide={() => setActiveTab('guide')}
          />
        )}

        {/* Protected Google Sheet Guide - only rendered if admin */}
        {activeTab === 'guide' && isAdmin && (
          <GoogleSheetsGuideModal
            scriptUrl={settings.googleAppsScriptUrl}
            onSaveUrl={handleSaveScriptUrl}
          />
        )}
      </main>

      {/* Modern Comprehensive Footer */}
      <Footer
        settings={settings}
        isAdmin={isAdmin}
        onOpenAdminLogin={() => handleOpenAdminLogin()}
        onAdminLogout={handleAdminLogout}
        onNavigateForm={() => {
          setActiveTab('form');
          setLastSubmission(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenInfo={() => setShowInfoModal(true)}
        onOpenQR={() => setShowQRModal(true)}
        onNavigateAdmin={(target) => {
          if (isAdmin) {
            setActiveTab(target);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            handleOpenAdminLogin(target);
          }
        }}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => {
          setShowAdminLoginModal(false);
          setPendingAdminTab(null);
        }}
        onLoginSuccess={handleAdminLoginSuccess}
        storedPin={settings.adminPin}
        targetTabName={
          pendingAdminTab === 'dashboard'
            ? 'Buku Tamu & Rekapitulasi'
            : pendingAdminTab === 'guide'
            ? 'Pengaturan Google Apps Script'
            : 'Menu Khusus Pengelola'
        }
      />

      {/* Info Kost Modal */}
      {showInfoModal && (
        <KostInfoModal
          settings={settings}
          onClose={() => setShowInfoModal(false)}
        />
      )}

      {/* Stand QR Modal */}
      {showQRModal && (
        <QRCodeModal
          kostName={settings.kostName}
          kostPhone={settings.kostPhone}
          onClose={() => setShowQRModal(false)}
        />
      )}
    </div>
  );
}
