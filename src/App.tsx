import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CameraScanner } from './components/CameraScanner';
import { ResultCard } from './components/ResultCard';
import { BinGuideModal } from './components/BinGuideModal';
import { ScanHistoryDrawer } from './components/ScanHistoryDrawer';
import { EcoQuizModal } from './components/EcoQuizModal';
import { EmergencyWhatsAppWidget } from './components/EmergencyWhatsAppWidget';
import { WasteScanResult, ScanHistoryItem } from './types';
import { PRESET_SAMPLES } from './data/presetSamples';
import { playSuccessChime } from './utils/audio';
import { MLDetectionOutput } from './utils/mlVisionEngine';
import { Leaf, Recycle, AlertTriangle, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';

const STORAGE_KEY = 'scan_sampah_history_v1';
const SOUND_KEY = 'scan_sampah_sound_enabled';
const THEME_KEY = 'scan_sampah_theme_mode';

export default function App() {
  const [currentResult, setCurrentResult] = useState<WasteScanResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Modals and Drawers
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // Settings, Theme & History
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === 'dark' || stored === 'light') return stored;
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // Default to light
    }
    return 'light';
  });
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);

  // Synchronize dark class on document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  // Load local storage on mount
  useEffect(() => {
    try {
      const storedHist = localStorage.getItem(STORAGE_KEY);
      if (storedHist) {
        setHistory(JSON.parse(storedHist));
      }
      const storedSound = localStorage.getItem(SOUND_KEY);
      if (storedSound !== null) {
        setSoundEnabled(storedSound === 'true');
      }
    } catch {
      // Ignore storage error
    }
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Save history helper
  const saveToHistory = (itemResult: WasteScanResult, image?: string) => {
    const newItem: ScanHistoryItem = {
      ...itemResult,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      imageUrl: image || itemResult.imageUrl,
    };

    const updated = [newItem, ...history].slice(0, 30);
    setHistory(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    try {
      localStorage.setItem(SOUND_KEY, String(next));
    } catch {
      // Ignore
    }
  };

  // Perform Waste Scan directly in browser via TensorFlow.js + Surface Structure ML
  const handleScan = async (
    imageBase64: string,
    targetKey?: string,
    mlDetection?: MLDetectionOutput
  ) => {
    setIsAnalyzing(true);
    setErrorBanner(null);
    setCapturedImage(imageBase64);

    // Simulasi jeda visual singkat agar transisi loading screen 3 Tong terasa mulus
    await new Promise((resolve) => setTimeout(resolve, 420));

    try {
      const targetMap: Record<string, number> = {
        sisa_makanan: 0,
        kulit_buah: 1,
        ampas_kopi: 2,
        daun_kering: 3,
        botol_gelas: 4,
        kantong_plastik: 5,
        kertas_buku: 6,
        styrofoam: 7,
        kaleng: 8,
        baterai: 9,
        lampu_rusak: 10,
        kabel_charger: 11,
        tisu_masker: 12,
        kaleng_aerosol: 13,
        tisu: 14,
        kardus: 15,
      };

      const resolvedKey = mlDetection?.targetKey || targetKey || 'botol_gelas';
      const matchIdx = targetMap[resolvedKey] !== undefined ? targetMap[resolvedKey] : 4;
      const baseSample = PRESET_SAMPLES[matchIdx]?.result || PRESET_SAMPLES[4].result;

      const confidence = mlDetection?.confidence ?? baseSample.confidenceScore;
      const category = mlDetection?.binCategory ?? baseSample.category;
      const remainder = Math.max(0.5, Number((100 - confidence).toFixed(1)));
      const splitA = Number((remainder * 0.65).toFixed(1));
      const splitB = Number((remainder - splitA).toFixed(1));

      const probabilities =
        category === 'organik'
          ? { organik: confidence, anorganik: splitA, b3: splitB }
          : category === 'b3'
          ? { organik: splitB, anorganik: splitA, b3: confidence }
          : { organik: splitA, anorganik: confidence, b3: splitB };

      const enrichedResult: WasteScanResult = {
        ...baseSample,
        itemName:
          mlDetection?.modelSource === 'tfjs_teachable_machine'
            ? mlDetection.materialName
            : baseSample.itemName,
        confidenceScore: confidence,
        probabilities,
        mlReason: mlDetection?.reason || baseSample.wujudFisik?.tekstur,
        mlModelName: mlDetection?.modelDisplayName || 'TensorFlow.js (MobileNet + COCO-SSD)',
        sumber: mlDetection?.modelSource || 'tfjs_mobilenet',
      };

      setCurrentResult(enrichedResult);
      saveToHistory(enrichedResult, imageBase64);
      if (soundEnabled) {
        playSuccessChime();
      }
    } catch (err) {
      console.warn('Client-side ML processing error:', err);
      const fallbackResult = PRESET_SAMPLES[4].result;
      setCurrentResult(fallbackResult);
      saveToHistory(fallbackResult, imageBase64);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setCurrentResult(null);
    setCapturedImage(null);
    setErrorBanner(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 font-sans text-stone-900 dark:text-stone-100 flex flex-col transition-colors duration-200">
      {/* Top Navigation */}
      <Header
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenQuiz={() => setIsQuizOpen(true)}
        historyCount={history.length}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Container */}
      <main className="mx-auto flex-1 w-full max-w-4xl px-4 py-4 sm:px-6 sm:py-6 space-y-5">
        {/* Error notification banner if any */}
        {errorBanner && (
          <div className="flex items-center justify-between rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 p-3 text-xs text-amber-900 dark:text-amber-200">
            <span>{errorBanner}</span>
            <button
              onClick={() => setErrorBanner(null)}
              className="font-bold underline text-amber-800 dark:text-amber-300"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Dynamic Display: Show Result Card if scanned, otherwise show live Camera Scanner */}
        {currentResult ? (
          <ResultCard
            result={currentResult}
            onReset={handleReset}
            capturedImage={capturedImage}
          />
        ) : (
          <div className="space-y-4">
            {/* Live Camera Scanner (Primary UI immediately visible on load) */}
            <CameraScanner
              onScan={handleScan}
              isAnalyzing={isAnalyzing}
              soundEnabled={soundEnabled}
            />

            {/* Quick 3-Bin Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {/* Hijau - Organik */}
              <div 
                onClick={() => setIsGuideOpen(true)}
                className="cursor-pointer group flex items-center gap-3 rounded-2xl border border-emerald-200/70 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/30 p-3 sm:p-3.5 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:shadow-xs"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs group-hover:scale-105 transition-transform">
                  <Leaf className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                      Tong Hijau
                    </span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                      · Organik
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400 truncate mt-0.5">
                    Sisa makanan, kulit buah, tisu, daun
                  </p>
                </div>
              </div>

              {/* Kuning - Anorganik */}
              <div 
                onClick={() => setIsGuideOpen(true)}
                className="cursor-pointer group flex items-center gap-3 rounded-2xl border border-amber-200/70 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/30 p-3 sm:p-3.5 transition-all hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:shadow-xs"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-stone-950 shadow-xs group-hover:scale-105 transition-transform">
                  <Recycle className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-amber-950 dark:text-amber-200">
                      Tong Kuning
                    </span>
                    <span className="text-[10px] text-amber-800 dark:text-amber-400 font-semibold">
                      · Anorganik
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400 truncate mt-0.5">
                    Botol plastik, kardus, styrofoam, kaleng
                  </p>
                </div>
              </div>

              {/* Merah - B3 */}
              <div 
                onClick={() => setIsGuideOpen(true)}
                className="cursor-pointer group flex items-center gap-3 rounded-2xl border border-rose-200/70 dark:border-rose-800/50 bg-rose-50/50 dark:bg-rose-950/30 p-3 sm:p-3.5 transition-all hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:shadow-xs"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs group-hover:scale-105 transition-transform">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-rose-950 dark:text-rose-200">
                      Tong Merah
                    </span>
                    <span className="text-[10px] text-rose-700 dark:text-rose-400 font-semibold">
                      · Limbah B3
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400 truncate mt-0.5">
                    Baterai, aerosol, e-waste, masker medis
                  </p>
                </div>
              </div>
            </div>

            {/* Educational Banner */}
            <div className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs transition-colors">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    Mengapa Memilah Sampah 3 Tong Sangat Penting?
                  </h3>
                  <p className="mt-0.5 text-xs text-stone-600 dark:text-stone-400 leading-relaxed max-w-lg">
                    Memilah sampah dari rumah memotong hingga 70% timbulan sampah di TPA dan mencegah limbah beracun B3 mencemari tanah serta air tanah kita.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsGuideOpen(true)}
                className="shrink-0 flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/80 px-3.5 py-2 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
              >
                <BookOpen className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Buka Panduan Lengkap</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 py-4 pb-20 sm:pb-5 text-center text-xs text-stone-600 dark:text-stone-400 transition-colors">
        <div className="mx-auto max-w-4xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 SCANDALE · Standar 3 Tong Sampah Nasional Indonesia</p>
          <div className="flex items-center gap-4 text-stone-600 dark:text-stone-400">
            <button onClick={() => setIsGuideOpen(true)} className="hover:text-stone-900 dark:hover:text-stone-200">
              Panduan Pemilahan
            </button>
            <span>·</span>
            <button onClick={() => setIsQuizOpen(true)} className="hover:text-stone-900 dark:hover:text-stone-200">
              Kuis Edukasi
            </button>
            <span>·</span>
            <button onClick={() => setIsHistoryOpen(true)} className="hover:text-stone-900 dark:hover:text-stone-200">
              Riwayat Scan
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <BinGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <ScanHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectItem={(item) => {
          setCurrentResult(item);
          setCapturedImage(item.imageUrl || null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onClearHistory={handleClearHistory}
      />

      <EcoQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
      />

      {/* Floating WhatsApp Emergency Call Widget */}
      <EmergencyWhatsAppWidget phoneNumber="085735896723" />
    </div>
  );
}
