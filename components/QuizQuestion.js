import { useState, useEffect } from 'react';

export default function QuizQuestion({ question, options, correct, onAnswer, questionNum, total }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => { setSelected(null); setRevealed(false); }, [question]);

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
    return 'border-gray-200 opacity-40';
  };

  return (
    <div className="fade-in">
      {/* Progress */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500">Câu {questionNum} / {total}</span>
        <div className="w-28 bg-gray-200 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${(questionNum / total) * 100}%` }} />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-blue-50 rounded-2xl p-5 md:p-8 text-center mb-5">
        <p className="text-xs md:text-sm text-blue-500 mb-2 font-medium">Chọn nghĩa tiếng Việt đúng:</p>
        <div className="hanzi text-5xl md:text-6xl font-medium text-gray-800 mb-2 leading-tight">{question.hanzi}</div>
        <div className="text-base md:text-lg text-blue-400 font-medium">{question.pinyin}</div>
      </div>

      {/* Options - 1 column on mobile for easier tapping */}
      <div className="flex flex-col gap-3">
        {options.map((opt, i) => (
          <button key={i} onClick={() => handleSelect(opt)}
            className={`w-full text-left px-4 py-4 rounded-xl border-2 font-medium transition-all duration-200 text-sm md:text-base min-h-[56px] ${getStyle(opt)}`}>
            <span className="text-gray-400 mr-2 font-normal">{['A','B','C','D'][i]}.</span>
            {opt}
            {revealed && opt === correct && <span className="float-right">✅</span>}
            {revealed && opt === selected && opt !== correct && <span className="float-right">❌</span>}
          </button>
        ))}
      </div>

      {/* Explanation */}
      {revealed && (
        <div className={`mt-4 p-4 rounded-xl fade-in ${selected === correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <p className={`font-semibold text-sm md:text-base ${selected === correct ? 'text-green-700' : 'text-red-700'}`}>
            {selected === correct ? '🎉 Chính xác!' : '❌ Chưa đúng!'}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            <span className="hanzi font-medium">{question.hanzi}</span> ({question.pinyin}) = <strong>{question.meaning}</strong>
          </p>
          <p className="text-xs text-gray-500 mt-1 hanzi">{question.example}</p>
          <p className="text-xs text-gray-400">{question.exampleVi}</p>
        </div>
      )}
    </div>
  );
}
