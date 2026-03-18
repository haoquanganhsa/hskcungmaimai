import { useState, useEffect, useRef } from 'react';

export default function Flashcard({ word, onNext, onPrev, current, total, onSpeak }) {
  const [flipped, setFlipped] = useState(false);
  const touchStartX = useRef(null);

  useEffect(() => { setFlipped(false); }, [word]);

  // Tự phát âm khi chuyển sang từ mới
  useEffect(() => {
    if (!word) return;
    const t = setTimeout(() => onSpeak(word.hanzi), 300);
    return () => clearTimeout(t);
  }, [word?.hanzi]);

  // Phím mũi tên trái/phải để chuyển thẻ, Space để lật
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft')  onPrev();
      if (e.key === ' ') { e.preventDefault(); setFlipped(f => !f); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onNext, onPrev]);

  if (!word) return null;

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? onNext() : onPrev(); }
    touchStartX.current = null;
  };

  const levelColor = word.level === 'HSK1' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700';

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Progress */}
      <div className="w-full">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Thẻ {current} / {total}</span>
          <span>{Math.round((current / total) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${(current / total) * 100}%` }} />
        </div>
      </div>

      <p className="md:hidden text-xs text-gray-400">← Vuốt trái/phải để chuyển thẻ →</p>
      <p className="hidden md:block text-xs text-gray-400">← → chuyển thẻ · Space lật thẻ</p>

      {/* Card */}
      <div className="card-flip w-full max-w-md mx-auto h-44 md:h-52 cursor-pointer select-none"
        onClick={() => setFlipped(!flipped)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}>
        <div className={`card-flip-inner relative w-full h-full ${flipped ? 'flipped' : ''}`}>
          {/* Mặt trước */}
          <div className="card-front absolute inset-0 bg-white rounded-xl shadow-sm border border-blue-100 flex flex-col items-center justify-center gap-2 p-4">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${levelColor}`}>{word.level} · {word.category}</span>
            <div className="hanzi text-5xl md:text-6xl font-medium text-gray-800">{word.hanzi}</div>
            <p className="text-xs text-gray-400">Bấm để xem nghĩa</p>
          </div>
          {/* Mặt sau */}
          <div className="card-back absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2 p-4 text-white">
            <div className="hanzi text-3xl font-medium">{word.hanzi}</div>
            <div className="text-lg font-semibold text-blue-100">{word.pinyin}</div>
            <div className="text-xl font-bold">{word.meaning}</div>
            <div className="text-center mt-1">
              <div className="flex items-center justify-center gap-2">
                <p className="hanzi text-sm text-blue-200">{word.example}</p>
                {word.example && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onSpeak(word.example); }}
                    className="text-blue-300 hover:text-white transition-colors flex-shrink-0"
                    title="Nghe câu ví dụ">
                    🔊
                  </button>
                )}
              </div>
              <p className="text-xs text-blue-300 mt-0.5">{word.exampleVi}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 w-full">
        <button onClick={onPrev} className="flex-1 md:flex-none h-10 px-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium text-sm">← Trước</button>
        <button onClick={() => onSpeak(word.hanzi)} className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center flex-shrink-0">🔊</button>
        <button onClick={() => setFlipped(!flipped)} className="flex-1 md:flex-none h-10 px-3 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium text-sm">
          {flipped ? '↩ Lật lại' : '↩ Xem nghĩa'}
        </button>
        <button onClick={onNext} className="flex-1 md:flex-none h-10 px-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm">Tiếp →</button>
      </div>
    </div>
  );
}