import React, { useState, useRef, useEffect } from 'react';
import { ExternalLink, MessageCircle, Sparkles } from 'lucide-react';

interface EmergencyWhatsAppWidgetProps {
  phoneNumber?: string; // Default: '085735896723'
}

export const EmergencyWhatsAppWidget: React.FC<EmergencyWhatsAppWidgetProps> = ({
  phoneNumber = '085735896723',
}) => {
  const [isHolding, setIsHolding] = useState(false);
  const [isPopped, setIsPopped] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isTriggered, setIsTriggered] = useState(false);

  const holdTimerRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Normalize phone number to international WhatsApp format: 085735896723 -> 6285735896723
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const waTarget = cleanPhone.startsWith('0')
    ? '62' + cleanPhone.slice(1)
    : cleanPhone.startsWith('62')
    ? cleanPhone
    : '62' + cleanPhone;

  // Generate Current Time Format for template
  const getCurrentTimeString = () => {
    try {
      const now = new Date();
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const dayName = days[now.getDay()];
      const day = now.getDate();
      const month = months[now.getMonth()];
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      return `${dayName}, ${day} ${month} ${year} pk. ${hours}:${minutes} WIB`;
    } catch {
      return 'Hari ini';
    }
  };

  // Compile the exact template requested by the user
  const compiledMessage = `Selamat pagi/siang Bapak/Ibu,

Mohon maaf mengganggu waktunya sebentar. Perkenalkan, saya:

Nama: [Masukkan Nama Anda]
NIM: [Masukkan NIM Anda]
Program Studi: ....

Saya ingin melaporkan kendala terkait operasional tempat sampah pintar pada sistem website pemilahan sampah di area kampus:

* Jenis Kendala: [Contoh: Tempat Sampah Anorganik Penuh]
* Lokasi Tempat Sampah: [Sebutkan titik lokasi]
* Waktu Kejadian: ${getCurrentTimeString()}

Laporan ini dikirimkan otomatis melalui fitur darurat pada sistem web agar segera mendapat penanganan dari tim terkait. 

Atas perhatian, bantuan, dan kerja samanya, saya ucapkan banyak terima kasih.`;

  const waLink = `https://wa.me/${waTarget}?text=${encodeURIComponent(compiledMessage)}`;

  // Function to execute opening WhatsApp safely
  const launchWhatsApp = () => {
    setIsTriggered(true);
    setIsPopped(true);
    
    // Haptic feedback if supported on mobile devices
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate([40, 60, 80]);
      } catch {
        // Ignore vibration errors
      }
    }

    // Open WhatsApp link cleanly via anchor click
    const anchor = document.createElement('a');
    anchor.href = waLink;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    // Reset popup feedback state after 1.8s
    setTimeout(() => {
      setIsTriggered(false);
      setIsPopped(false);
      setHoldProgress(0);
      setIsHolding(false);
    }, 1800);
  };

  // Start Hold Action
  const handleHoldStart = () => {
    setIsHolding(true);
    setIsPopped(true);
    setHoldProgress(0);

    const startTime = Date.now();
    const duration = 600; // 600ms hold time for full trigger

    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      setHoldProgress(progress);

      if (progress >= 100) {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        launchWhatsApp();
      }
    }, 16);
  };

  // End Hold Action
  const handleHoldEnd = (wasCancelled = false) => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    if (!wasCancelled && holdProgress < 100 && !isTriggered) {
      // If user released quickly (tap/click), trigger pop-up animation and open WhatsApp
      launchWhatsApp();
    } else if (wasCancelled && !isTriggered) {
      setIsHolding(false);
      setIsPopped(false);
      setHoldProgress(0);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end pointer-events-auto select-none">
      {/* Pop Up Bubble Animation (Muncul mengambang saat user hover, klik, atau hold button) */}
      {(isPopped || isHolding || isTriggered) && (
        <div
          className={`mb-3 flex items-center gap-2 rounded-2xl px-3.5 py-2 shadow-2xl backdrop-blur-md border transition-all duration-300 ease-out transform ${
            isHolding
              ? 'scale-105 -translate-y-2 bg-stone-900/95 dark:bg-stone-950/95 border-emerald-500 text-white'
              : isTriggered
              ? 'scale-110 -translate-y-3 bg-[#25D366] text-white border-white/60 shadow-emerald-500/40'
              : 'scale-100 -translate-y-1 bg-white/95 dark:bg-stone-900/95 border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100'
          }`}
        >
          {/* Animated Mini Icon / Circular Progress */}
          <div className="relative flex h-5 w-5 items-center justify-center shrink-0">
            {isHolding && !isTriggered ? (
              <svg className="h-5 w-5 -rotate-90 text-emerald-400" viewBox="0 0 36 36">
                <path
                  className="text-stone-700"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400 transition-all duration-75"
                  strokeDasharray={`${holdProgress}, 100`}
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            ) : isTriggered ? (
              <Sparkles className="h-4 w-4 animate-spin text-white" />
            ) : (
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            )}
          </div>

          <div className="text-left leading-tight pr-1">
            <span className="block text-xs font-bold tracking-tight">
              {isTriggered
                ? 'Membuka WhatsApp...'
                : isHolding
                ? `Tahan untuk Kirim Laporan (${holdProgress}%)`
                : 'Panggilan Darurat WhatsApp'}
            </span>
            <span className="block text-[10px] opacity-80 font-medium">
              085735896723 · Otomatis Template Laporan
            </span>
          </div>

          {/* Tiny Arrow pointer */}
          <div
            className={`absolute -bottom-1.5 right-7 h-3 w-3 rotate-45 border-r border-b ${
              isHolding
                ? 'bg-stone-900 dark:bg-stone-950 border-emerald-500'
                : isTriggered
                ? 'bg-[#25D366] border-white/60'
                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
            }`}
          />
        </div>
      )}

      {/* Floating Action Button (CSS target: div#root > div:nth-of-type(1) > div:nth-of-type(1) > button:nth-of-type(1)) */}
      <button
        ref={buttonRef}
        type="button"
        onMouseEnter={() => setIsPopped(true)}
        onMouseLeave={() => {
          if (!isHolding && !isTriggered) setIsPopped(false);
        }}
        onPointerDown={handleHoldStart}
        onPointerUp={() => handleHoldEnd(false)}
        onPointerCancel={() => handleHoldEnd(true)}
        onTouchStart={handleHoldStart}
        onTouchEnd={() => handleHoldEnd(false)}
        onTouchCancel={() => handleHoldEnd(true)}
        aria-label="Emergancy Call WhatsApp (Klik atau Tahan untuk Menghubungi)"
        className={`relative group flex items-center gap-2.5 rounded-full px-4 py-2.5 sm:px-4.5 sm:py-3 text-white font-bold tracking-tight border-2 border-white cursor-pointer transition-all duration-300 ease-out shadow-lg shadow-black/15 ${
          isHolding
            ? 'scale-115 -translate-y-2 bg-[#1ebe5b] ring-4 ring-white/40 shadow-2xl shadow-emerald-500/50'
            : isTriggered
            ? 'scale-120 -translate-y-3 bg-[#128C7E] ring-6 ring-white/60 shadow-2xl shadow-emerald-500/60 animate-bounce'
            : 'scale-100 hover:scale-108 hover:-translate-y-1.5 active:scale-95 bg-[#25D366] hover:bg-[#20ba59]'
        }`}
        title="Klik atau tahan untuk menghubungi WhatsApp darurat (085735896723)"
      >
        {/* Pulsating Expanding Wave Rings during Hold */}
        {isHolding && (
          <>
            <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping pointer-events-none" />
            <span className="absolute -inset-1 rounded-full border-2 border-emerald-300/40 animate-pulse pointer-events-none" />
          </>
        )}

        {/* WhatsApp Icon */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg
            className={`h-5 w-5 sm:h-5.5 sm:w-5.5 fill-current transition-transform duration-300 ${
              isHolding ? 'scale-110 rotate-6' : isTriggered ? 'scale-125 -rotate-12' : 'group-hover:scale-105'
            }`}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>

          {/* Glowing Status Dot */}
          {!isHolding && !isTriggered && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
          )}
        </div>

        {/* Text Label: Emergancy Call */}
        <span className="text-xs sm:text-sm font-bold tracking-tight text-white whitespace-nowrap">
          {isTriggered ? 'Menghubungkan...' : 'Emergancy Call'}
        </span>
      </button>
    </div>
  );
};
