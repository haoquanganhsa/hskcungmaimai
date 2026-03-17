import { useState, useEffect } from 'react';
import hsk1 from '../data/HSK1.json';
import hsk2 from '../data/HSK2.json';

const allWords = [...hsk1, ...hsk2];
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function Writing() {
  const [mode, setMode] = useState('hint'); // hint | blank
  const [level, setLevel] = useState('Tất cả');
  const [pool, setPool] = useState([]);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null); // null | 'correct' | 'wrong'
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
    setResult(correct ? 'correct' : 'wrong');
    setScore(s => ({ ...s, [correct ? 'correct' : 'wrong']: s[correct ? 'correct' : 'wrong'] + 1 }));
    setHistory(h => [{ word, input: input.trim(), correct }, ...h]);
  };

  const next = () => {
    setCurrent(c => (c + 1) % pool.length);
    setInput(''); setResult(null);
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN'; u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  };

  if (!word) return <div className="flex justify-center py-20 text-gray-400">Đang tải...</div>;

  const total = score.correct + score.wrong;
  const accuracy = total > 0 ? Math.round((score.correct / total) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">🖊️ Luyện viết</h1>
        <p className="text-gray-500">Xem nghĩa + pinyin → Gõ chữ Hán tương ứng</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          {['Tất cả', 'HSK1', 'HSK2'].map(l => (
            <button key={l} onClick={() => setLevel(l)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border-2 transition-all
                ${level === l ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600'}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {[{k:'hint', label:'Có gợi ý'}, {k:'blank', label:'Không gợi ý'}].map(m => (
            <button key={m.k} onClick={() => setMode(m.k)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border-2 transition-all
                ${mode === m.k ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-200 text-gray-600'}`}>
              {m.label}
            </button>
          ))}
        </div>
        <button onClick={resetSession} className="text-sm text-gray-400 hover:text-gray-600 underline">🔄 Làm lại</button>
      </div>

      {/* Score bar */}
      <div className="flex gap-4 mb-6">
        {[
          { label: '✅ Đúng', val: score.correct, color: 'text-green-600' },
          { label: '❌ Sai', val: score.wrong, color: 'text-red-500' },
          { label: '🎯 Chính xác', val: accuracy + '%', color: 'text-blue-600' },
          { label: '📝 Đã làm', val: current, color: 'text-gray-600' },
        ].map((s, i) => (
          <div key={i} className="flex-1 bg-white rounded-xl border border-gray-100 p-3 text-center">
            <div className={`text-xl font-bold ${s.color}`}>{s.val}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-4 fade-in">
        <div className="text-center mb-6">
          <div className="flex justify-center gap-2 mb-4">
            <span className={`text-xs font-bold px-3 py-1 rounded-full
              ${word.level === 'HSK1' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
              {word.level}
            </span>
            <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">{word.category}</span>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-2">{word.meaning}</div>
          {mode === 'hint' && (
            <div className="text-lg text-blue-500 font-medium">{word.pinyin}</div>
          )}
          <button onClick={() => speak(word.hanzi)} className="mt-3 text-gray-400 hover:text-blue-500 text-sm transition-colors">
            🔊 Nghe phát âm
          </button>
        </div>

        {/* Input */}
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            inputMode="text"
            value={input}
            onChange={e => { setInput(e.target.value); setResult(null); }}
            onKeyDown={e => e.key === 'Enter' && (result ? next() : check())}
            placeholder="Gõ chữ Hán vào đây... (ví dụ: 你好)"
            className={`flex-1 border-2 rounded-xl px-4 py-4 text-xl hanzi focus:outline-none transition-all
              ${result === 'correct' ? 'border-green-400 bg-green-50' : result === 'wrong' ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'}`}
            disabled={!!result}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          {!result ? (
            <button onClick={check}
              className="w-full md:w-auto h-14 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors text-base">
              Kiểm tra ✓
            </button>
          ) : (
            <button onClick={next}
              className="w-full md:w-auto h-14 px-6 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 active:bg-green-800 transition-colors text-base">
              Tiếp theo →
            </button>
          )}
        </div>

        {/* Result */}
        {result && (
          <div className={`mt-4 p-4 rounded-xl fade-in ${result === 'correct' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            {result === 'correct' ? (
              <div className="text-green-700">
                <p className="font-bold">🎉 Chính xác!</p>
                <p className="text-sm mt-1 hanzi">{word.example}</p>
                <p className="text-xs text-green-600 mt-0.5">{word.exampleVi}</p>
              </div>
            ) : (
              <div className="text-red-700">
                <p className="font-bold">❌ Chưa đúng!</p>
                <p className="text-sm mt-1">Đáp án đúng: <span className="hanzi font-bold text-red-800">{word.hanzi}</span></p>
                <p className="text-sm hanzi text-red-600 mt-1">{word.example}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">📜 Lịch sử gần đây</h3>
          <div className="space-y-2">
            {history.slice(0, 8).map((h, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className={`hanzi font-medium ${h.correct ? 'text-green-700' : 'text-red-600'}`}>{h.word.hanzi}</span>
                <span className="text-gray-400 mx-2">→ bạn gõ:</span>
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
