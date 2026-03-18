import { useState, useEffect } from 'react';

export default function QuizQuestion({ question, options, correct, onAnswer, questionNum, total }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => { setSelected(null); setRevealed(false); }, [question]);

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN'; u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };

  const handleSelect = (opt) => {
    if (revealed) return;
    setSelected(opt);
    setRevealed(true);
    onAnswer(opt === correct);
  };

  const getStyle = (opt) => {
    if (!revealed) return 'border-gray-200 hover:border-blue-400 hover:bg-blue-50 active:bg-blue-100 cursor-pointer';
    if (opt === correct) return 'border-green-400 bg-green-50 text-green-800';
    if (opt === selected && opt !== correct) return 'border-red-400 bg-red-50 text-red-800';
    return 'border-gray-100 opacity-40';
  };

  return (
    <div className="fade-in">
      {/* Progress */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-500">Câu {questionNum} / {total}</span>
        <div className="w-24 bg-gray-200 rounded-full h-1.5">
          <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${(questionNum / total) * 100}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className="bg-blue-50 rounded-xl p-4 text-center mb-3">
        <p className="text-xs text-blue-500 mb-1 font-medium">Chọn nghĩa đúng:</p>
        <div className="flex items-center justify-center gap-2">
          <div className="hanzi text-5xl font-medium text-gray-800 leading-tight">{question.hanzi}</div>
          <button onClick={() => speak(question.hanzi)}
            className="text-blue-400 hover:text-blue-600 transition-colors text-lg flex-shrink-0"
            title="Phát âm từ">🔊</button>
        </div>
        <div className="text-sm text-blue-400 font-medium mt-1">{question.pinyin}</div>
      </div>

      {/* Options — 2x2 grid */}
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt, i) => (
          <button key={i} onClick={() => handleSelect(opt)}
            className={`text-left px-3 py-3 rounded-xl border-2 font-medium transition-all text-sm min-h-[52px] ${getStyle(opt)}`}>
            <span className="text-gray-400 mr-1 font-normal text-xs">{['A','B','C','D'][i]}.</span>
            {opt}
            {revealed && opt === correct && <span className="float-right text-xs">✅</span>}
            {revealed && opt === selected && opt !== correct && <span className="float-right text-xs">❌</span>}
          </button>
        ))}
      </div>

      {/* Giải thích */}
      {revealed && (
        <div className={`mt-2 p-3 rounded-xl fade-in text-sm ${selected === correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <p className={`font-semibold text-sm ${selected === correct ? 'text-green-700' : 'text-red-700'}`}>
            {selected === correct ? '🎉 Chính xác!' : '❌ Chưa đúng!'}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">
            <span className="hanzi font-medium">{question.hanzi}</span> ({question.pinyin}) = <strong>{question.meaning}</strong>
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-gray-400 hanzi">{question.example}</p>
            {question.example && (
              <button onClick={() => speak(question.example)}
                className="text-gray-400 hover:text-blue-500 transition-colors flex-shrink-0"
                title="Nghe câu ví dụ">🔊</button>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5 italic">{question.exampleVi}</p>
        </div>
      )}
    </div>
  );
}