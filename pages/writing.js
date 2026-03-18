import { useState, useEffect } from 'react';
import hsk1 from '../data/HSK1.json';
import hsk2 from '../data/HSK2.json';

const allWords = [...hsk1, ...hsk2];
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function Writing() {
  const [mode, setMode]   = useState('hint');
  const [level, setLevel] = useState('Tất cả');
  const [pool, setPool]   = useState([]);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [history, setHistory] = useState([]);

  useEffect(() => { resetSession(); }, [level]);

  const resetSession = () => {
    const filtered = level === 'Tất cả' ? allWords : allWords.filter(w => w.level === level);
    setPool(shuffle(filtered));
    setCurrent(0); setInput(''); setResult(null); setScore({ correct: 0, wrong: 0 }); setHistory([]);
  };

  const word = pool[current];

  const check = () => {
    if (!input.trim()) return;
    const correct = input.trim() === word.hanzi;
    setScore(s => ({ ...s, [correct ? 'correct' : 'wrong']: s[correct ? 'correct' : 'wrong'] + 1 }));
    setHistory(h => [{ word, input: input.trim(), correct }, ...h]);
    if (correct) {
      setResult('correct');
      setTimeout(() => { setCurrent(c => (c + 1) % pool.length); setInput(''); setResult(null); }, 400);
    } else {
      setResult('wrong');
    }
  };

  const next = () => { setCurrent(c => (c + 1) % pool.length); setInput(''); setResult(null); };

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN'; u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };

  if (!word) return <div className="flex justify-center py-12 text-gray-400 text-sm">Đang tải...</div>;

  const total    = score.correct + score.wrong;
  const accuracy = total > 0 ? Math.round((score.correct / total) * 100) : 0;

  return (
    <div className="max-w-xl mx-auto px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-lg font-bold text-gray-800">🖊️ Luyện viết</h1>
          <p className="text-xs text-gray-500">Xem nghĩa + pinyin → Gõ chữ Hán</p>
        </div>
        <button onClick={resetSession} className="text-xs text-gray-400 hover:text-gray-600 underline">🔄 Làm lại</button>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 mb-3 flex flex-wrap gap-2 items-center">
        <div className="flex gap-1.5">
          {['Tất cả','HSK1','HSK2'].map(l => (
            <button key={l} onClick={() => setLevel(l)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${level === l ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-500'}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 ml-auto">
          {[{k:'hint',label:'Có gợi ý'},{k:'blank',label:'Không gợi ý'}].map(m => (
            <button key={m.k} onClick={() => setMode(m.k)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${mode === m.k ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-200 text-gray-500'}`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Score */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {[
          { label: '✅ Đúng', val: score.correct, color: 'text-green-600' },
          { label: '❌ Sai',  val: score.wrong,   color: 'text-red-500'  },
          { label: '🎯 %',   val: accuracy + '%', color: 'text-blue-600' },
          { label: '📝 Câu', val: current,        color: 'text-gray-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-2 text-center">
            <div className={`text-lg font-bold ${s.color}`}>{s.val}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Main card */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
        <div className="text-center mb-4">
          <div className="flex justify-center gap-2 mb-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${word.level === 'HSK1' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>{word.level}</span>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{word.category}</span>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-1">{word.meaning}</div>
          {mode === 'hint' && <div className="text-blue-500 text-base font-medium">{word.pinyin}</div>}
          <button onClick={() => speak(word.hanzi)} className="mt-1 text-gray-400 hover:text-blue-500 text-xs transition-colors">🔊 Nghe phát âm</button>
        </div>

        {/* Input */}
        <div className="flex flex-col md:flex-row gap-2">
          <input type="text" inputMode="text" value={input}
            onChange={e => { setInput(e.target.value); setResult(null); }}
            onKeyDown={e => e.key === 'Enter' && (result === 'wrong' ? next() : check())}
            placeholder="Gõ chữ Hán... (ví dụ: 你好)"
            className={`flex-1 border-2 rounded-xl px-4 py-3 text-xl hanzi focus:outline-none transition-all
              ${result === 'correct' ? 'border-green-400 bg-green-50' : result === 'wrong' ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'}`}
            disabled={result === 'correct'}
            autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" />
          {result !== 'correct' && (
            !result ? (
              <button onClick={check} className="h-12 px-5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 text-sm">Kiểm tra ✓</button>
            ) : (
              <button onClick={next} className="h-12 px-5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 text-sm">Tiếp →</button>
            )
          )}
        </div>

        {/* Result */}
        {result && (
          <div className={`mt-3 p-3 rounded-xl fade-in ${result === 'correct' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            {result === 'correct' ? (
              <div className="text-green-700">
                <p className="font-bold text-sm">🎉 Chính xác!</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs hanzi">{word.example}</p>
                  <button onClick={() => speak(word.example)}
                    className="text-green-500 hover:text-green-700 transition-colors flex-shrink-0">🔊</button>
                </div>
                {word.exampleVi && <p className="text-xs mt-0.5 italic">{word.exampleVi}</p>}
              </div>
            ) : (
              <div className="text-red-700">
                <p className="font-bold text-sm">❌ Chưa đúng! Đáp án: <span className="hanzi">{word.hanzi}</span></p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs hanzi">{word.example}</p>
                  <button onClick={() => speak(word.example)}
                    className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0">🔊</button>
                </div>
                {word.exampleVi && <p className="text-xs mt-0.5 italic">{word.exampleVi}</p>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-3">
          <h3 className="font-semibold text-gray-700 mb-2 text-xs">📜 Lịch sử</h3>
          <div className="space-y-1">
            {history.slice(0, 6).map((h, i) => (
              <div key={i} className="flex justify-between items-center text-xs">
                <span className="hanzi font-medium text-gray-700">{h.word.hanzi}</span>
                <span className="text-gray-400 mx-1">→</span>
                <span className="hanzi text-gray-600">{h.input}</span>
                <span>{h.correct ? '✅' : '❌'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}