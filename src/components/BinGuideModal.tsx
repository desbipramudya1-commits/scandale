import React, { useState } from 'react';
import { X, Leaf, Recycle, AlertOctagon, Check, AlertCircle, Info } from 'lucide-react';
import { BIN_GUIDES, BinInfo } from '../data/binGuide';
import { BinCategory } from '../types';

interface BinGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BinGuideModal: React.FC<BinGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<BinCategory>('organik');

  if (!isOpen) return null;

  const currentGuide: BinInfo = BIN_GUIDES[activeTab];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xl transition-colors">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 px-5 py-4 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Panduan Edukasi 3 Tong Sampah
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/60 p-2 gap-2">
          {/* Organik Tab */}
          <button
            onClick={() => setActiveTab('organik')}
            className={`flex flex-col items-center justify-center rounded-xl py-2.5 px-2 transition-all ${
              activeTab === 'organik'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/80 font-semibold'
            }`}
          >
            <Leaf className="h-4 w-4 mb-1" />
            <span className="text-xs">Hijau (Organik)</span>
          </button>

          {/* Anorganik Tab */}
          <button
            onClick={() => setActiveTab('anorganik')}
            className={`flex flex-col items-center justify-center rounded-xl py-2.5 px-2 transition-all ${
              activeTab === 'anorganik'
                ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/80 font-semibold'
            }`}
          >
            <Recycle className="h-4 w-4 mb-1" />
            <span className="text-xs">Kuning (Anorganik)</span>
          </button>

          {/* B3 Tab */}
          <button
            onClick={() => setActiveTab('b3')}
            className={`flex flex-col items-center justify-center rounded-xl py-2.5 px-2 transition-all ${
              activeTab === 'b3'
                ? 'bg-rose-600 text-white font-bold shadow-xs'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/80 font-semibold'
            }`}
          >
            <AlertOctagon className="h-4 w-4 mb-1" />
            <span className="text-xs">Merah (B3)</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Title & Description */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-bold ${currentGuide.badgeColor}`}>
                {currentGuide.colorName}
              </span>
              <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">{currentGuide.subtitle}</span>
            </div>
            <h3 className="text-xl font-extrabold text-stone-900 dark:text-stone-100">{currentGuide.title}</h3>
            <p className="mt-1.5 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              {currentGuide.description}
            </p>
          </div>

          {/* Examples Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Allowed items */}
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/30 p-4">
              <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider mb-2.5">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Sampah Yang Masuk Di Sini</span>
              </div>
              <ul className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300">
                {currentGuide.examples.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Prohibited items */}
            <div className="rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50/40 dark:bg-rose-950/30 p-4">
              <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-300 font-bold text-xs uppercase tracking-wider mb-2.5">
                <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                <span>Dilarang / Jangan Dimasukkan</span>
              </div>
              <ul className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300">
                {currentGuide.notAllowed.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-600 dark:text-rose-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Processing method */}
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 mb-1">
              Metode Pengolahan Resmi
            </h4>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              {currentGuide.processingMethod}
            </p>
          </div>

          {/* Environmental Fact */}
          <div className="rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/40 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1">
              Fakta Dampak Nyata
            </h4>
            <p className="text-xs text-emerald-950 dark:text-emerald-200 font-medium leading-relaxed">
              {currentGuide.impactFact}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 px-5 py-3 text-right">
          <button
            onClick={onClose}
            className="rounded-xl bg-stone-900 dark:bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800 dark:hover:bg-emerald-500 transition-colors"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
