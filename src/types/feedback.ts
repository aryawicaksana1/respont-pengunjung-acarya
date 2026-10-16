export type VisitorCategory = 
  | 'calon_penghuni'
  | 'tamu_penghuni'
  | 'keluarga'
  | 'vendor'
  | 'lainnya';

export type RecommendationChoice = 'ya' | 'mungkin' | 'tidak';

export type KostBranch = 'Kost Acarya 1' | 'Kost Acarya 2';

export interface VisitorFeedback {
  id: string;
  timestamp: string; // ISO string
  kostLokasi: KostBranch;
  nama: string;
  whatsapp: string;
  kategori: VisitorCategory;
  kamarTujuan?: string; // Nomor kamar atau nama penghuni yang dikunjungi
  tanggalKunjungan: string; // YYYY-MM-DD
  waktuKunjungan: string; // HH:mm
  ratingKeseluruhan: number; // 1-5
  ratingKebersihan: number; // 1-5
  ratingKeamanan: number; // 1-5
  ratingFasilitas: number; // 1-5
  ratingPelayanan: number; // 1-5
  kesanPositif: string;
  saranPerbaikan: string;
  rekomendasi: RecommendationChoice;
  synced: boolean;
  syncTimestamp?: string;
  syncError?: string;
}

export interface AppSettings {
  googleAppsScriptUrl: string;
  kostName: string;
  kostAddress: string;
  kostPhone: string;
  visitingHours: string;
  adminPin: string;
  adminEmail: string;
}
