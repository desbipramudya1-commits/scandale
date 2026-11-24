import React, { useState } from 'react';
import { X, Award, CheckCircle2, XCircle, RotateCcw, Leaf, Recycle, AlertTriangle } from 'lucide-react';
import { BinCategory } from '../types';

interface QuizQuestion {
  item: string;
  category: BinCategory;
  correctBin: string;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    item: 'Kulit Semangka & Sisa Makanan Dapur',
    category: 'organik',
    correctBin: 'Tong Hijau (Organik)',
    explanation: 'Merupakan sisa pangan hayati yang dapat diurai mikroba tanah menjadi kompos atau pakan ternak.'
  },
  {
    item: 'Baterai Bekas AA & Remote TV',
    category: 'b3',
    correctBin: 'Tong Merah (B3)',
    explanation: 'Mengandung logam berat timbal dan merkuri yang meracuni air tanah bila dibuang ke tempat sampah biasa.'
  },
  {
    item: 'Tisu Basah & Masker Medis Bekas',
    category: 'b3',
    correctBin: 'Tong Merah (B3)',
    explanation: 'Tisu basah dan masker terbuat dari polimer plastik sintetis yang membawa bakteri patogen dan tidak larut seperti tisu kertas.'
  },
  {
    item: 'Kaleng Aerosol / Semprotan Obat Nyamuk',
    category: 'b3',
    correctBin: 'Tong Merah (B3)',
    explanation: 'Bertekanan gas mudah meledak dan mengandung racun kimia, wajib masuk tong B3 dan dilarang ditusuk/dibakar.'
  },
  {
    item: 'E-Waste (Kabel USB & Charger HP Rusak)',
    category: 'b3',
    correctBin: 'Tong Merah (B3)',
    explanation: 'Mengandung insulator PVC berhalogen yang memicu gas dioksin beracun bila dibakar, wajib disetor ke drop box e-waste.'
  },
  {
    item: 'Styrofoam Kemasan Makanan Bersih',
    category: 'anorganik',
    correctBin: 'Tong Kuning (Anorganik)',
    explanation: 'Merupakan polimer plastik polistirena (EPS #6) yang tidak terurai alami namun dapat didaur ulang melalui proses pelelehan densifikasi.'
  },
  {
    item: 'Kantong Plastik Kresek Belanja',
    category: 'anorganik',
    correctBin: 'Tong Kuning (Anorganik)',
    explanation: 'Plastik lentur LDPE/HDPE bernilai daur ulang untuk diolah kembali menjadi bijih plastik atau ecobrick.'
  },
  {
    item: 'Ampas Kopi Bubuk & Daun Kering Kebun',
    category: 'organik',
    correctBin: 'Tong Hijau (Organik)',
    explanation: 'Ampas kopi dan daun kering kaya akan nitrogen dan karbon, sangat ideal untuk penyubur tanah dan komposter.'
  }
];

interface EcoQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EcoQuizModal: React.FC<EcoQuizModalProps> = ({ isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<BinCategory | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  if (!isOpen) return null;

  const currentQ = QUIZ_QUESTIONS[currentIndex];

  const handleSelectAnswer = (choice: BinCategory) => {
    if (isAnswered) return;
    setSelectedAnswer(choice);
    setIsAnswered(true);

    if (choice === currentQ.category) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setQuizFinished(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xl transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 px-5 py-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Kuis Cepat Pemilahan 3 Tong</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quiz Content */}
        <div className="p-5 space-y-4">
          {!quizFinished ? (
            <>
              {/* Progress */}
              <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-400 font-semibold">
                <span>Soal {currentIndex + 1} dari {QUIZ_QUESTIONS.length}</span>
                <span>Skor: {score} Poin</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                />
              </div>

              {/* Question card */}
              <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 p-5 text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Kemana sampah ini harus dibuang?
                </span>
                <h4 className="mt-2 text-lg font-extrabold text-stone-900 dark:text-stone-100">
                  {currentQ.item}
                </h4>
              </div>

              {/* 3 Bin Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleSelectAnswer('organik')}
                  disabled={isAnswered}
                  className={`flex flex-col items-center justify-center rounded-xl p-3 border text-center transition-all ${
                    isAnswered && currentQ.category === 'organik'
                      ? 'border-emerald-500 bg-emerald-100 dark:bg-emerald-950 text-emerald-950 dark:text-emerald-200 font-bold'
                      : isAnswered && selectedAnswer === 'organik' && currentQ.category !== 'organik'
                      ? 'border-rose-400 bg-rose-100 dark:bg-rose-950/80 text-rose-950 dark:text-rose-200'
                      : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/80 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 text-stone-800 dark:text-stone-200'
                  }`}
                >
                  <Leaf className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mb-1" />
                  <span className="text-xs font-bold">Tong Hijau</span>
                  <span className="text-[10px] text-stone-600 dark:text-stone-400">Organik</span>
                </button>

                <button
                  onClick={() => handleSelectAnswer('anorganik')}
                  disabled={isAnswered}
                  className={`flex flex-col items-center justify-center rounded-xl p-3 border text-center transition-all ${
                    isAnswered && currentQ.category === 'anorganik'
                      ? 'border-amber-500 bg-amber-100 dark:bg-amber-950 text-amber-950 dark:text-amber-200 font-bold'
                      : isAnswered && selectedAnswer === 'anorganik' && currentQ.category !== 'anorganik'
                      ? 'border-rose-400 bg-rose-100 dark:bg-rose-950/80 text-rose-950 dark:text-rose-200'
                      : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/80 hover:bg-amber-50/60 dark:hover:bg-amber-950/30 text-stone-800 dark:text-stone-200'
                  }`}
                >
                  <Recycle className="h-5 w-5 text-amber-500 dark:text-amber-400 mb-1" />
                  <span className="text-xs font-bold">Tong Kuning</span>
                  <span className="text-[10px] text-stone-600 dark:text-stone-400">Anorganik</span>
                </button>

                <button
                  onClick={() => handleSelectAnswer('b3')}
                  disabled={isAnswered}
                  className={`flex flex-col items-center justify-center rounded-xl p-3 border text-center transition-all ${
                    isAnswered && currentQ.category === 'b3'
                      ? 'border-rose-500 bg-rose-100 dark:bg-rose-950 text-rose-950 dark:text-rose-200 font-bold'
                      : isAnswered && selectedAnswer === 'b3' && currentQ.category !== 'b3'
                      ? 'border-rose-400 bg-rose-100 dark:bg-rose-950/80 text-rose-950 dark:text-rose-200'
                      : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/80 hover:bg-rose-50/60 dark:hover:bg-rose-950/30 text-stone-800 dark:text-stone-200'
                  }`}
                >
                  <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 mb-1" />
                  <span className="text-xs font-bold">Tong Merah</span>
                  <span className="text-[10px] text-stone-600 dark:text-stone-400">B3</span>
                </button>
              </div>

              {/* Feedback and explanation */}
              {isAnswered && (
                <div
                  className={`rounded-xl border p-3.5 text-xs ${
                    selectedAnswer === currentQ.category
                      ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200'
                      : 'border-rose-300 dark:border-rose-800/80 bg-rose-50 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    {selectedAnswer === currentQ.category ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Jawaban Tepat!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                        <span>Kurang Tepat, yang benar adalah {currentQ.correctBin}</span>
                      </>
                    )}
                  </div>
                  <p className="leading-relaxed text-stone-700 dark:text-stone-300">{currentQ.explanation}</p>
                  <button
                    onClick={handleNext}
                    className="mt-3 w-full rounded-lg bg-stone-900 dark:bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-stone-800 dark:hover:bg-emerald-500 transition-colors"
                  >
                    {currentIndex + 1 < QUIZ_QUESTIONS.length ? 'Lanjut Soal Berikutnya' : 'Lihat Hasil Akhir'}
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Finished screen */
            <div className="py-6 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                <Award className="h-8 w-8" />
              </div>
              <div>
                <h4 className="text-xl font-extrabold text-stone-900 dark:text-stone-100">Kuis Selesai!</h4>
                <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">
                  Anda berhasil menjawab <strong className="text-stone-900 dark:text-stone-100">{score}</strong> dari <strong className="text-stone-900 dark:text-stone-100">{QUIZ_QUESTIONS.length}</strong> pertanyaan dengan tepat.
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 p-4 text-xs text-stone-700 dark:text-stone-300">
                {score >= 5 ? (
                  <p className="font-semibold text-emerald-800 dark:text-emerald-400">
                    🌟 Luar biasa! Anda sudah sangat memahami prinsip pemilahan 3 Tong Sampah Organik, Anorganik, dan B3.
                  </p>
                ) : (
                  <p className="font-medium text-stone-700 dark:text-stone-300">
                    👍 Pemahaman dasar sudah baik! Buka menu Panduan Tong untuk terus memperdalam pemilahan sampah ramah lingkungan.
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleRestart}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 py-2.5 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Ulangi Kuis</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 rounded-xl bg-stone-900 dark:bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-stone-800 dark:hover:bg-emerald-500 transition-colors"
                >
                  Kembali ke Scanner
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
