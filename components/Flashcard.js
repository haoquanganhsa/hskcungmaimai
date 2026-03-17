import { useState, useEffect, useRef } from 'react';

export default function Flashcard({ word, onNext, onPrev, current, total, onSpeak }) {
  const [flipped, setFlipped] = useState(false);
  const touchStartX = useRef(null);

  useEffect(() => { setFlipped(false); }, [word]);

  if (!word) return null;

  // Swipe support
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? onNext() : onPrev(); }
    touchStartX.current = null;
  };

  const levelColor = word.level === 'HSK1'
    ? 'bg-green-100 text-green-700 border-green-200'
    : 'bg-purple-100 text-purple-700 border-purple-200';

  return (
    <div className="flex flex-col items-center gap-4 md:gap-6">
      {/* Progress */}
      <div className="w-full">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Thẻ {current} / {total}</span>
          <span>{Math.round((current / total) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(current / total) * 100}%` }} />
        </div>
      </div>

      {/* Swipe hint on mobile */}
      <p className="md:hidden text-xs text-gray-400">← Vuốt trái/phải để chuyển thẻ →</p>

      {/* Card */}
      <div
        className="card-flip w-full h-56 md:h-72 cursor-pointer select-none"
        onClick={() => setFlipped(!flipped)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className={`card-flip-inner relative w-full h-full ${flipped ? 'flipped' : ''}`}>
          {/* Front */}
          <div className="card-front absolute inset-0 bg-white rounded-2xl shadow-md border border-blue-100 flex flex-col items-center justify-center gap-2 p-4">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${levelColor}`}>
              {word.level} · {word.category}
            </span>
            <div className="hanzi text-6xl md:text-7xl font-medium text-gray-800 mt-1">{word.hanzi}</div>
            <p className="text-xs text-gray-400 mt-1">Bấm để xem nghĩa</p>
          </div>

          {/* Back */}
          <div className="card-back absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-md flex flex-col items-center justify-center gap-2 p-4 text-white">
            <div className="hanzi text-3xl md:text-4xl font-medium">{word.hanzi}</div>
            <div className="text-xl md:text-2xl font-semibold text-blue-100">{word.pinyin}</div>
            <div className="text-lg md:text-xl font-bold">{word.meaning}</div>
            <div className="mt-1 text-center">
              <p className="hanzi text-xs md:text-sm text-blue-200">{word.example}</p>
              <p className="text-xs text-blue-300 mt-1">{word.exampleVi}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls - bigger touch targets on mobile */}
      <div className="flex items-center justify-center gap-2 md:gap-4 w-full">
        <button onClick={onPrev}
          className="flex-1 md:flex-none h-12 md:h-auto px-3 md:px-5 md:py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 active:bg-gray-100 font-medium transition-colors text-sm md:text-base">
          ← Trước
        </button>

        <button onClick={() => onSpeak(word.hanzi)}
          className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 active:bg-blue-200 transition-colors flex items-center justify-center text-xl flex-shrink-0"
          title="Phát âm">
          🔊
        </button>

        <button onClick={() => setFlipped(!flipped)}
          className="flex-1 md:flex-none h-12 md:h-auto px-3 md:px-5 md:py-2.5 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 active:bg-blue-300 font-medium transition-colors text-sm md:text-base">
          {flipped ? '↩ Lật lại' : '↩ Xem nghĩa'}
        </button>

        <button onClick={onNext}
          className="flex-1 md:flex-none h-12 md:h-auto px-3 md:px-5 md:py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 font-medium transition-colors text-sm md:text-base">
          Tiếp →
        </button>
      </div>
    </div>
  );
}
