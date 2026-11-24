import React from 'react';
import { X, Trash2, Clock, CheckCircle2, Leaf, Recycle, AlertTriangle, ArrowRight } from 'lucide-react';
import { ScanHistoryItem } from '../types';

interface ScanHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: ScanHistoryItem[];
  onSelectItem: (item: ScanHistoryItem) => void;
  onClearHistory: () => void;
}

export const ScanHistoryDrawer: React.FC<ScanHistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectItem,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  // Calculate environmental impacts
  const totalScans = history.length;
  const totalOrganik = history.filter(h => h.category === 'organik').length;
  const totalAnorganik = history.filter(h => h.category === 'anorganik').length;
  const totalB3 = history.filter(h => h.category === 'b3').length;

  const estimatedCarbonSavedKg = (totalOrganik * 0.25 + totalAnorganik * 0.45 + totalB3 * 0.8).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="flex h-full w-full max-w-md flex-col border-l border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-2xl transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Riwayat Pemilahan</h2>
            <p className="text-xs text-stone-600 dark:text-stone-400">{totalScans} sampah telah dipilah</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Eco Metric Summary Box */}
        {totalScans > 0 && (
          <div className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/50 p-4">
            <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
              Dampak Ekologis Anda
            </span>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/40 p-2">
                <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">{totalOrganik}</span>
                <p className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300">Organik</p>
              </div>
              <div className="rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/60 dark:bg-amber-950/40 p-2">
                <span className="text-sm font-black text-amber-700 dark:text-amber-400">{totalAnorganik}</span>
                <p className="text-[10px] font-semibold text-amber-800 dark:text-amber-300">Anorganik</p>
              </div>
              <div className="rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50/60 dark:bg-rose-950/40 p-2">
                <span className="text-sm font-black text-rose-700 dark:text-rose-400">{totalB3}</span>
                <p className="text-[10px] font-semibold text-rose-800 dark:text-rose-300">B3</p>
              </div>
            </div>
            <p className="mt-2 text-center text-xs text-stone-600 dark:text-stone-400 font-medium">
              🌱 Mengurangi estimasi <strong className="text-emerald-700 dark:text-emerald-400">{estimatedCarbonSavedKg} kg CO₂e</strong> emisi TPA
            </p>
          </div>
        )}

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-stone-400">
              <Clock className="h-10 w-10 stroke-[1.5] mb-2 text-stone-300 dark:text-stone-600" />
              <p className="text-sm font-semibold text-stone-600 dark:text-stone-300">Belum ada riwayat pemindaian</p>
              <p className="mt-1 text-xs text-stone-400 dark:text-stone-500 max-w-xs">
                Arahkan kamera ke sampah atau pilih contoh sampah di halaman utama untuk mulai memilah.
              </p>
            </div>
          ) : (
            history.map((item) => {
              const dateStr = new Date(item.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              const badgeColor =
                item.category === 'organik'
                  ? 'bg-emerald-100 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300'
                  : item.category === 'anorganik'
                  ? 'bg-amber-100 dark:bg-amber-950/90 text-amber-900 dark:text-amber-300'
                  : 'bg-rose-100 dark:bg-rose-950/90 text-rose-800 dark:text-rose-300';

              const Icon =
                item.category === 'organik'
                  ? Leaf
                  : item.category === 'anorganik'
                  ? Recycle
                  : AlertTriangle;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectItem(item);
                    onClose();
                  }}
                  className="flex items-center justify-between rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/80 p-3 hover:border-stone-300 dark:hover:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-700/60">
                      <Icon className="h-4 w-4 text-stone-700 dark:text-stone-300" />
                    </div>
                    <div>
                      <h4 className="line-clamp-1 text-xs font-bold text-stone-900 dark:text-stone-100">
                        {item.itemName}
                      </h4>
                      {item.wujudFisik?.bentuk && (
                        <p className="line-clamp-1 text-[10px] text-stone-600 dark:text-stone-400 font-medium">
                          Wujud: {item.wujudFisik.bentuk}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`rounded-md px-1.5 py-0.2 text-[10px] font-bold ${badgeColor}`}>
                          {item.binName.split(' ')[2] || item.category}
                        </span>
                        <span className="text-[10px] text-stone-400 dark:text-stone-500">
                          {item.confidenceScore.toFixed(0)}% akurasi · {dateStr}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-stone-400 dark:text-stone-500" />
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 p-4">
            <button
              onClick={onClearHistory}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 py-2.5 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Hapus Semua Riwayat</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
