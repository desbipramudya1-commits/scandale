/**
 * Konfigurasi Engine Machine Learning Berbasis Browser (Client-Side)
 * -----------------------------------------------------------------
 * Anda dapat mengganti TEACHABLE_MACHINE_MODEL_URL di bawah ini dengan
 * URL model Teachable Machine custom Anda (mis. dari ekspor TensorFlow.js
 * Teachable Machine: "https://teachablemachine.withgoogle.com/models/XXXXXXXX/").
 *
 * Jika dikosongkan (''), aplikasi otomatis menggunakan kombinasi model bawaan
 * TensorFlow.js (MobileNet v2 + COCO-SSD) + Analisis Tekstur & Struktur Material.
 */

export const ML_CONFIG = {
  // Slot URL Model Teachable Machine Custom (akhiri dengan tanda '/')
  TEACHABLE_MACHINE_MODEL_URL: '',

  // Kunci penyimpanan lokal untuk URL custom dari antarmuka pengaturan model
  STORAGE_KEY_TM_URL: 'scandale_tm_model_url_v1',

  // Jumlah frame untuk penstabilan hasil (mencegah label berkedip saat kamera bergerak)
  STABILIZATION_WINDOW_FRAMES: 4,

  // Interval inferensi real-time pada kamera aktif (milidetik)
  LIVE_INFERENCE_INTERVAL_MS: 450,

  // Ambang batas minimal confidence agar prediksi dipertimbangkan
  MIN_CONFIDENCE_THRESHOLD: 0.48,
};

export function getTeachableMachineUrl(): string {
  try {
    const saved = localStorage.getItem(ML_CONFIG.STORAGE_KEY_TM_URL);
    if (saved && saved.trim().length > 0) {
      return normalizeModelBaseUrl(saved.trim());
    }
  } catch {
    // Abaikan jika localStorage tidak tersedia
  }
  return ML_CONFIG.TEACHABLE_MACHINE_MODEL_URL
    ? normalizeModelBaseUrl(ML_CONFIG.TEACHABLE_MACHINE_MODEL_URL)
    : '';
}

export function setTeachableMachineUrl(url: string): string {
  const normalized = url.trim() ? normalizeModelBaseUrl(url.trim()) : '';
  try {
    if (normalized) {
      localStorage.setItem(ML_CONFIG.STORAGE_KEY_TM_URL, normalized);
    } else {
      localStorage.removeItem(ML_CONFIG.STORAGE_KEY_TM_URL);
    }
  } catch {
    // Abaikan error storage
  }
  return normalized;
}

export function normalizeModelBaseUrl(url: string): string {
  let clean = url.trim();
  if (clean.endsWith('model.json')) {
    clean = clean.slice(0, -'model.json'.length);
  }
  if (!clean.endsWith('/')) {
    clean += '/';
  }
  return clean;
}
