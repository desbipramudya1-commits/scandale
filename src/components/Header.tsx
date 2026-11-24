import React, { useState, useEffect, useRef } from 'react';
import { Camera, BookOpen, History, Award, Volume2, VolumeX, Sun, Moon, Menu, X, ChevronRight } from 'lucide-react';

interface HeaderProps {
  onOpenGuide: () => void;
  onOpenHistory: () => void;
  onOpenQuiz: () => void;
  historyCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenGuide,
  onOpenHistory,
  onOpenQuiz,
  historyCount,
  soundEnabled,
  onToggleSound,
  theme,
  onToggleTheme,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Close menu on ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <header className="sticky top-2 sm:top-3.5 z-40 w-full px-3 sm:px-6 pointer-events-none transition-all">
      {/* Floating Oval Memanjang Navigation Bar (Target: header > div:nth-of-type(1)) */}
      <div className="mx-auto flex max-w-2xl sm:max-w-3xl items-center justify-between rounded-full border border-stone-200/90 dark:border-stone-800/90 bg-white/95 dark:bg-[#0e131d]/95 backdrop-blur-xl px-2.5 py-1.5 sm:px-4 sm:py-2 shadow-xl shadow-black/5 dark:shadow-black/25 pointer-events-auto transition-all duration-200">
        {/* Brand: Circular Camera Badge & Bold Split Logo */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Circular Camera Badge with subtle emerald ring */}
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-emerald-500/50 bg-emerald-500/10 text-emerald-500 dark:border-emerald-500/60 dark:bg-emerald-500/15 shadow-xs shadow-emerald-500/20 shrink-0 transition-transform hover:scale-105">
            <Camera className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-emerald-500 dark:text-emerald-400" />
          </div>

          {/* Bold Brand Title: SCANDALE & Tagline */}
          <div className="flex flex-col justify-center min-w-0 leading-none select-none">
            <div className="flex items-center text-sm sm:text-base font-black tracking-wider leading-tight">
              <span className="text-stone-900 dark:text-white">SCAN</span>
              <span className="text-emerald-500 dark:text-emerald-400">DALE</span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-medium text-stone-500 dark:text-stone-400 tracking-tight leading-tight mt-0.5 truncate">
              Scan Dulu Baru Lo Tau
            </span>
          </div>
        </div>

        {/* Circular Action Buttons Row (Matches Screenshot Layout) */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* 1. Button Edukasi */}
          <button
            type="button"
            onClick={onOpenGuide}
            className="flex h-8.5 w-8.5 sm:h-9.5 sm:w-9.5 items-center justify-center rounded-full border border-stone-200 dark:border-stone-800 bg-stone-100/80 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 hover:scale-105 hover:text-emerald-500 transition-all shadow-2xs"
            title="Buka Edukasi Pilah Sampah"
          >
            <BookOpen className="h-4 w-4 shrink-0" />
          </button>

          {/* 2. Circular Sound Toggle Button (Green Ring Style) */}
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Matikan Suara Shutter' : 'Aktifkan Suara Shutter'}
            className={`flex h-8.5 w-8.5 sm:h-9.5 sm:w-9.5 items-center justify-center rounded-full border transition-all shadow-2xs ${
              soundEnabled
                ? 'border-emerald-500/90 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20 hover:scale-105'
                : 'border-stone-200 dark:border-stone-800 bg-stone-100/80 dark:bg-stone-800/80 text-stone-400 hover:scale-105'
            }`}
            title={soundEnabled ? 'Suara Shutter Aktif' : 'Suara Senyap'}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {/* 3. Circular Light/Dark Mode Button (Green Accent Style) */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            className="flex h-8.5 w-8.5 sm:h-9.5 sm:w-9.5 items-center justify-center rounded-full border border-stone-200 dark:border-stone-800 bg-stone-100/80 dark:bg-stone-800/80 text-emerald-600 dark:text-emerald-400 hover:scale-105 transition-all shadow-2xs"
            title={theme === 'dark' ? 'Mode Gelap (Klik untuk Mode Terang)' : 'Mode Terang (Klik untuk Mode Gelap)'}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-emerald-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="h-4 w-4 text-emerald-600 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* 4. Circular Strip 3 Hamburger Button (3 Stripes Style as in Screenshot) */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Tutup Menu Navigasi' : 'Buka Menu Navigasi'}
            aria-expanded={isMenuOpen}
            className={`flex h-8.5 w-8.5 sm:h-9.5 sm:w-9.5 items-center justify-center rounded-full border transition-all shadow-2xs ${
              isMenuOpen
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                : 'border-stone-200 dark:border-stone-800 bg-stone-100/80 dark:bg-stone-800/80 text-stone-700 dark:text-stone-200 hover:scale-105'
            }`}
            title="Menu Navigasi Tambahan"
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Dropdown Menu yang Muncul saat User Klik Strip 3 (Centered Pop Up) */}
      {isMenuOpen && (
        <>
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 z-40 bg-stone-900/30 dark:bg-black/50 backdrop-blur-xs transition-opacity pointer-events-auto"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Floating Minimalist Menu Panel Centered */}
          <div
            ref={menuRef}
            className="absolute left-1/2 -translate-x-1/2 top-full mt-2.5 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-3xl border border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 p-3.5 shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-2 duration-150 pointer-events-auto"
          >
            <div className="mb-2.5 flex items-center justify-between border-b border-stone-100 dark:border-stone-800/80 pb-2 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                Menu Tambahan
              </span>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                title="Tutup Menu"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              {/* 1. Riwayat Scan */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenHistory();
                }}
                className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/80 transition-colors group text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                    <History className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block font-semibold">Riwayat Scan</span>
                    <span className="block text-[11px] font-normal text-stone-500 dark:text-stone-400">
                      Lihat hasil pemindaian sebelumnya
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {historyCount > 0 && (
                    <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[10px] font-bold text-white tabular-nums">
                      {historyCount}
                    </span>
                  )}
                  <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
                </div>
              </button>

              {/* 2. Kuis Edukasi Pilah Sampah */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenQuiz();
                }}
                className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/80 transition-colors group text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-500 dark:text-amber-400 group-hover:scale-105 transition-transform">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block font-semibold">Kuis Edukasi</span>
                    <span className="block text-[11px] font-normal text-stone-500 dark:text-stone-400">
                      Uji pemahaman 3 kategori sampah
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
              </button>

              {/* 3. Panduan Pilah Sampah Lengkap */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenGuide();
                }}
                className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/80 transition-colors group text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-500 dark:text-blue-400 group-hover:scale-105 transition-transform">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block font-semibold">Panduan Lengkap</span>
                    <span className="block text-[11px] font-normal text-stone-500 dark:text-stone-400">
                      Standar Organik, Anorganik, B3
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
              </button>

              {/* 4. Suara Shutter Kamera Toggle */}
              <button
                type="button"
                onClick={onToggleSound}
                className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/80 transition-colors group text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 group-hover:scale-105 transition-transform">
                    {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </div>
                  <div>
                    <span className="block font-semibold">Suara Shutter Kamera</span>
                    <span className="block text-[11px] font-normal text-stone-500 dark:text-stone-400">
                      {soundEnabled ? 'Suara aktif berbunyi' : 'Senyap / Tanpa bunyi'}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    soundEnabled
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                      : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                  }`}
                >
                  {soundEnabled ? 'AKTIF' : 'SENYAP'}
                </span>
              </button>

              {/* 5. Emergancy Call WhatsApp */}
              <a
                href={`https://wa.me/6285735896723?text=${encodeURIComponent(`Selamat pagi/siang Bapak/Ibu,

Mohon maaf mengganggu waktunya sebentar. Perkenalkan, saya:

Nama: [Masukkan Nama Anda]
NIM: [Masukkan NIM Anda]
Program Studi: ....

Saya ingin melaporkan kendala terkait operasional tempat sampah pintar pada sistem website pemilahan sampah di area kampus:

* Jenis Kendala: [Contoh: Tempat Sampah Anorganik Penuh]
* Lokasi Tempat Sampah: [Sebutkan titik lokasi]
* Waktu Kejadian: [Sebutkan hari, tanggal, dan jam]

Laporan ini dikirimkan otomatis melalui fitur darurat pada sistem web agar segera mendapat penanganan dari tim terkait. 

Atas perhatian, bantuan, dan kerja samanya, saya ucapkan banyak terima kasih.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 transition-colors group text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#25D366] text-white shadow-2xs group-hover:scale-105 transition-transform">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block font-semibold">Emergancy Call WhatsApp</span>
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
              </a>
            </div>

            {/* Quick 3-Bin Color Palette Legend */}
            <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800/80 px-2 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Organik
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400" /> Anorganik
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> B3
              </span>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
