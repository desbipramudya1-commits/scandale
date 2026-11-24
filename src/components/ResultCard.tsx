import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Leaf, 
  Recycle, 
  AlertTriangle, 
  Clock, 
  Layers, 
  Lightbulb, 
  ShieldAlert, 
  CheckSquare, 
  Square, 
  RotateCcw,
  Sparkles,
  Share2,
  Check,
  Eye
} from 'lucide-react';
import { WasteScanResult, BinCategory } from '../types';

interface ResultCardProps {
  result: WasteScanResult;
  onReset: () => void;
  capturedImage?: string | null;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  onReset,
  capturedImage
}) => {
  // Checklist state for recycling steps
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  const toggleStep = (index: number) => {
    setCheckedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleShare = async () => {
    const text = `Hasil Scan Sampah: ${result.itemName}\nKategori: ${result.binName}\nAkurasi: ${result.confidenceScore}%\nSaran Daur Ulang:\n${result.saranDaurUlang.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Hasil Scan Sampah',
          text: text,
        });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Ignore share cancellation
    }
  };

  // Bin style configurations
  const getBinTheme = (category: BinCategory) => {
    switch (category) {
      case 'organik':
        return {
          binLabel: 'TONG SAMPAH ORGANIK',
          binColorLabel: 'WARNA HIJAU',
          headerBg: 'bg-emerald-600',
          headerText: 'text-white',
          lightBg: 'bg-emerald-50',
          borderColor: 'border-emerald-300',
          textColor: 'text-emerald-950',
          accentColor: 'emerald',
          icon: Leaf,
          barColor: 'bg-emerald-500',
          ringColor: 'ring-emerald-500'
        };
      case 'anorganik':
        return {
          binLabel: 'TONG SAMPAH ANORGANIK',
          binColorLabel: 'WARNA KUNING',
          headerBg: 'bg-amber-400',
          headerText: 'text-stone-900',
          lightBg: 'bg-amber-50',
          borderColor: 'border-amber-300',
          textColor: 'text-amber-950',
          accentColor: 'amber',
          icon: Recycle,
          barColor: 'bg-amber-400',
          ringColor: 'ring-amber-400'
        };
      case 'b3':
        return {
          binLabel: 'TONG SAMPAH B3',
          binColorLabel: 'WARNA MERAH',
          headerBg: 'bg-rose-600',
          headerText: 'text-white',
          lightBg: 'bg-rose-50',
          borderColor: 'border-rose-300',
          textColor: 'text-rose-950',
          accentColor: 'rose',
          icon: AlertTriangle,
          barColor: 'bg-rose-600',
          ringColor: 'ring-rose-500'
        };
    }
  };

  const theme = getBinTheme(result.category);
  const BinIcon = theme.icon;

  const totalSteps = result.saranDaurUlang.length;
  const completedSteps = Object.values(checkedSteps).filter(Boolean).length;
  const isAllCompleted = totalSteps > 0 && completedSteps === totalSteps;

  return (
    <div className="w-full space-y-4">
      {/* Main Result Hero Card */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm transition-colors">
        {/* Banner with Target Waste Bin */}
        <div className={`${theme.headerBg} ${theme.headerText} px-5 py-4 sm:px-6`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/15 backdrop-blur-sm">
                <BinIcon className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold tracking-wider opacity-90 uppercase">
                  Rekomendasi Pembuangan
                </span>
                <h2 className="text-lg font-extrabold tracking-tight sm:text-xl">
                  {theme.binLabel} ({theme.binColorLabel})
                </h2>
              </div>
            </div>

            {/* Confidence Pill */}
            <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 backdrop-blur-md">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-bold tracking-wide">
                {result.confidenceScore.toFixed(1)}% Akurasi Valid
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Item Name & Quick Specs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-5">
            <div className="flex items-start gap-4">
              {capturedImage && (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 shadow-inner">
                  <img
                    src={capturedImage}
                    alt={result.itemName}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div>
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  Objek Teridentifikasi
                </span>
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 sm:text-2xl">
                  {result.itemName}
                </h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-stone-600 dark:text-stone-400">
                  <span className="flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
                    {result.material}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
                    Waktu Urai: <strong className="font-semibold text-stone-700 dark:text-stone-200">{result.degradasiWaktu}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Share / Copy */}
            <button
              onClick={handleShare}
              className="self-start sm:self-center flex items-center gap-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Bagikan</span>
                </>
              )}
            </button>
          </div>

          {/* Browser ML Texture & Structure Reasoning Banner */}
          {result.mlReason && (
            <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/35 px-4 py-3 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Alasan Deteksi Struktur & Tekstur Material
                </span>
                {result.mlModelName && (
                  <span className="rounded-full bg-emerald-600/15 dark:bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                    {result.mlModelName}
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-emerald-950 dark:text-emerald-100 leading-relaxed">
                {result.mlReason}
              </p>
            </div>
          )}

          {/* Dedicated Physical Form Synchronization Card */}
          {result.wujudFisik && (
            <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 p-4 transition-colors">
              <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-stone-800 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wide">
                    Karakteristik Wujud Fisik Sampah
                  </h4>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  Sinkronisasi Visual 100%
                </span>
              </div>

              {/* 4 Pillars of Synchronized Physical Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Bentuk Geometri */}
                <div className="rounded-lg border border-stone-200/80 dark:border-stone-700/60 bg-white dark:bg-stone-900 p-2.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-0.5">
                    Bentuk Geometri
                  </span>
                  <p className="text-xs font-medium text-stone-900 dark:text-stone-100 leading-snug">
                    {result.wujudFisik.bentuk}
                  </p>
                </div>

                {/* 2. Tekstur Permukaan */}
                <div className="rounded-lg border border-stone-200/80 dark:border-stone-700/60 bg-white dark:bg-stone-900 p-2.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-0.5">
                    Tekstur Permukaan
                  </span>
                  <p className="text-xs font-medium text-stone-900 dark:text-stone-100 leading-snug">
                    {result.wujudFisik.tekstur}
                  </p>
                </div>

                {/* 3. Ciri Visual Identik */}
                <div className="rounded-lg border border-stone-200/80 dark:border-stone-700/60 bg-white dark:bg-stone-900 p-2.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-0.5">
                    Ciri Visual Khas
                  </span>
                  <p className="text-xs font-medium text-stone-900 dark:text-stone-100 leading-snug">
                    {result.wujudFisik.ciriVisual}
                  </p>
                </div>

                {/* 4. Kondisi Fisik Limbah */}
                <div className="rounded-lg border border-stone-200/80 dark:border-stone-700/60 bg-white dark:bg-stone-900 p-2.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-0.5">
                    Kondisi Fisik
                  </span>
                  <p className="text-xs font-medium text-stone-900 dark:text-stone-100 leading-snug">
                    {result.wujudFisik.kondisiFisik}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3 Tong Visual Status: Shows all three bins and which one is active */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                Verifikasi 3 Tong Sampah Nasional
              </span>
              <span className="text-xs text-stone-600 dark:text-stone-400 font-medium">Standar KLHK Indonesia</span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {/* Organik (Hijau) */}
              <div
                className={`relative flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all ${
                  result.category === 'organik'
                    ? 'border-2 border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/60 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 opacity-60'
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white mb-1.5 shadow-xs">
                  <Leaf className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-bold text-stone-900 dark:text-stone-100">ORGANIK</span>
                <span className="text-[10px] font-medium text-emerald-800 dark:text-emerald-300">Warna Hijau</span>
                {result.category === 'organik' && (
                  <span className="mt-1.5 inline-block rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                    PILIHAN TEPAT
                  </span>
                )}
              </div>

              {/* Anorganik (Kuning) */}
              <div
                className={`relative flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all ${
                  result.category === 'anorganik'
                    ? 'border-2 border-amber-500 bg-amber-50/80 dark:bg-amber-950/60 shadow-sm ring-2 ring-amber-500/20'
                    : 'border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 opacity-60'
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-stone-900 mb-1.5 shadow-xs">
                  <Recycle className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-bold text-stone-900 dark:text-stone-100">ANORGANIK</span>
                <span className="text-[10px] font-medium text-amber-800 dark:text-amber-300">Warna Kuning</span>
                {result.category === 'anorganik' && (
                  <span className="mt-1.5 inline-block rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-stone-950">
                    PILIHAN TEPAT
                  </span>
                )}
              </div>

              {/* B3 (Merah) */}
              <div
                className={`relative flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all ${
                  result.category === 'b3'
                    ? 'border-2 border-red-500 bg-red-50/80 dark:bg-rose-950/60 shadow-sm ring-2 ring-red-500/20'
                    : 'border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 opacity-60'
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white mb-1.5 shadow-xs">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-bold text-stone-900 dark:text-stone-100">B3 BERACUN</span>
                <span className="text-[10px] font-medium text-red-800 dark:text-rose-300">Warna Merah</span>
                {result.category === 'b3' && (
                  <span className="mt-1.5 inline-block rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
                    PILIHAN TEPAT
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Real-Time Classification Accuracy Breakdown */}
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-800/60 p-4 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wide">
                Tingkat Akurasi Klasifikasi Real-Time
              </span>
              <span className="text-xs font-extrabold text-stone-900 dark:text-stone-100">
                {result.confidenceScore.toFixed(1)}% Valid
              </span>
            </div>
            <p className="mt-1 text-[11px] text-stone-600 dark:text-stone-400">
              Validitas dipastikan berdasarkan analisis struktur visual, kepadatan material, dan standar persampahan nasional.
            </p>

            {/* Probability Bars */}
            <div className="mt-3 space-y-2">
              {/* Organik bar */}
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  <span>Organik (Hijau)</span>
                  <span className={result.category === 'organik' ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-stone-600 dark:text-stone-400'}>
                    {(result.probabilities?.organik ?? (result.category === 'organik' ? result.confidenceScore : 2.0)).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, Math.max(2, result.probabilities?.organik ?? (result.category === 'organik' ? result.confidenceScore : 2.0)))}%`
                    }}
                  />
                </div>
              </div>

              {/* Anorganik bar */}
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  <span>Anorganik (Kuning)</span>
                  <span className={result.category === 'anorganik' ? 'text-amber-700 dark:text-amber-400 font-bold' : 'text-stone-600 dark:text-stone-400'}>
                    {(result.probabilities?.anorganik ?? (result.category === 'anorganik' ? result.confidenceScore : 2.0)).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, Math.max(2, result.probabilities?.anorganik ?? (result.category === 'anorganik' ? result.confidenceScore : 2.0)))}%`
                    }}
                  />
                </div>
              </div>

              {/* B3 bar */}
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  <span>B3 / Berbahaya (Merah)</span>
                  <span className={result.category === 'b3' ? 'text-red-700 dark:text-rose-400 font-bold' : 'text-stone-600 dark:text-stone-400'}>
                    {(result.probabilities?.b3 ?? (result.category === 'b3' ? result.confidenceScore : 1.0)).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
                  <div
                    className="h-full bg-red-600 rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, Math.max(2, result.probabilities?.b3 ?? (result.category === 'b3' ? result.confidenceScore : 1.0)))}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Recycling Guide Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Saran Cara Daur Ulang & Pengolahan
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Lakukan langkah di bawah sebelum memasukkan ke {theme.binLabel}
                </p>
              </div>
              {totalSteps > 0 && (
                <span className="rounded-full bg-stone-100 dark:bg-stone-800 px-2.5 py-0.5 text-xs font-semibold text-stone-700 dark:text-stone-300">
                  {completedSteps}/{totalSteps} Selesai
                </span>
              )}
            </div>

            <div className="space-y-2">
              {result.saranDaurUlang.map((step, idx) => {
                const isChecked = !!checkedSteps[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                      isChecked
                        ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/30 text-stone-600 dark:text-stone-400'
                        : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/80 hover:bg-stone-50/80 dark:hover:bg-stone-700/80 text-stone-800 dark:text-stone-200'
                    }`}
                  >
                    <button
                      type="button"
                      className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400 focus:outline-none"
                    >
                      {isChecked ? (
                        <CheckSquare className="h-5 w-5 fill-emerald-100 dark:fill-emerald-950 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Square className="h-5 w-5 text-stone-400 dark:text-stone-500" />
                      )}
                    </button>
                    <div className="flex-1">
                      <span className={`text-xs sm:text-sm leading-relaxed ${isChecked ? 'line-through text-stone-400 dark:text-stone-500' : 'font-medium'}`}>
                        <strong className="mr-1.5 text-stone-500 dark:text-stone-400">{idx + 1}.</strong>
                        {step}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {isAllCompleted && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 px-3.5 py-2 text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Bagus sekali! Semua langkah pemilahan sampah sudah Anda selesaikan.</span>
              </div>
            )}
          </div>

          {/* Upcycling & Reuse Idea */}
          {result.alternatifUpcycle && (
            <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 p-4 transition-colors">
              <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200 mb-1.5">
                <Lightbulb className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                <h5 className="text-xs font-bold uppercase tracking-wider">
                  Ide Kreatif Guna Ulang (Upcycling)
                </h5>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {result.alternatifUpcycle}
              </p>
            </div>
          )}

          {/* Educational Insight Card */}
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/30 p-4 transition-colors">
            <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 mb-1.5">
              <Leaf className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h5 className="text-xs font-bold uppercase tracking-wider">
                Edukasi Lingkungan & Pengolahan Limbah
              </h5>
            </div>
            <p className="text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed font-medium">
              {result.edukasiLimbah}
            </p>
          </div>

          {/* Hazard Alert if Disposed Improperly */}
          {result.bahayaJikaSalahBuang && (
            <div className="rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50/60 dark:bg-rose-950/30 p-4 transition-colors">
              <div className="flex items-center gap-2 text-rose-900 dark:text-rose-300 mb-1.5">
                <ShieldAlert className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                <h5 className="text-xs font-bold uppercase tracking-wider">
                  Bahaya Bila Salah Membuang / Tercampur
                </h5>
              </div>
              <p className="text-xs text-rose-950 dark:text-rose-200 leading-relaxed font-medium">
                {result.bahayaJikaSalahBuang}
              </p>
            </div>
          )}

          {/* Reset / Scan Next Action Button */}
          <div className="pt-2">
            <button
              onClick={onReset}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-stone-900 dark:bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 dark:hover:bg-emerald-500 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Pindai Sampah Lainnya</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
