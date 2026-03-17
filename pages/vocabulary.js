import { useState, useEffect } from 'react';
import Flashcard from '../components/Flashcard';
import hsk1 from '../data/HSK1.json';
import hsk2 from '../data/HSK2.json';

const allWords = [...hsk1, ...hsk2];
const categories = ['Tất cả', ...new Set(allWords.map(w => w.category))];

export default function Vocabulary() {
  const [level, setLevel] = useState('Tất cả');
  const [category, setCategory] = useState('Tất cả');
  const [mode, setMode] = useState('flashcard'); // flashcard | list
  const [idx, setIdx] = useState(0);
  const [learned, setLearned] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLearned(JSON.parse(localStorage.getItem('learned') || '[]'));
  }, []);

  const saveStreak = () => {
    const today = new Date().toDateString();
    const last = localStorage.getItem('lastStudy');
    if (last !== today) {
      localStorage.setItem('lastStudy', today);
      const s = parseInt(localStorage.getItem('streak') || '0') + 1;
      localStorage.setItem('streak', s);
    }
  };

  const filtered = allWords.filter(w => {
    const matchLevel = level === 'Tất cả' || w.level === level;
    const matchCat = category === 'Tất cả' || w.category === category;
    const matchSearch = !search || w.hanzi.includes(search) || w.meaning.toLowerCase().includes(search.toLowerCase()) || w.pinyin.includes(search);
    return matchLevel && matchCat && matchSearch;
  });

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN'; u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  };

  const markLearned = (id) => {
    const next = learned.includes(id) ? learned.filter(x => x !== id) : [...learned, id];
    setLearned(next);
    localStorage.setItem('learned', JSON.stringify(next));
    saveStreak();
  };

  const next = () => { setIdx((idx + 1) % filtered.length); };
  const prev = () => { setIdx((idx - 1 + filtered.length) % filtered.length); };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">📚 Thư viện từ vựng</h1>
        <p className="text-gray-500">HSK1 & HSK2 · {filtered.length} từ · {learned.length} đã học</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 space-y-4">
        {/* Search */}
        <input type="text" placeholder="🔍 Tìm kiếm (chữ Hán, pinyin, nghĩa)..."
          value={search} onChange={e => { setSearch(e.target.value); setIdx(0); }}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />

        <div className="flex flex-wrap gap-2 justify-between">
          {/* Level */}
          <div className="flex gap-2">
            {['Tất cả', 'HSK1', 'HSK2'].map(l => (
              <button key={l} onClick={() => { setLevel(l); setIdx(0); }}
                className={`px-3 md:px-4 py-2 rounded-full text-sm font-medium border transition-all
                  ${level === l ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                {l}
              </button>
            ))}
          </div>

          {/* View mode */}
          <div className="flex gap-2">
            <button onClick={() => setMode('flashcard')}
              className={`px-3 md:px-4 py-2 rounded-full text-sm font-medium border transition-all
                ${mode === 'flashcard' ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-200 text-gray-600'}`}>
              🃏 Flashcard
            </button>
            <button onClick={() => setMode('list')}
              className={`px-3 md:px-4 py-2 rounded-full text-sm font-medium border transition-all
                ${mode === 'list' ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-200 text-gray-600'}`}>
              📋 Danh sách
            </button>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(c => (
            <button key={c} onClick={() => { setCategory(c); setIdx(0); }}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all
                ${category === c ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 text-gray-500 hover:border-orange-300'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Không tìm thấy từ nào 😅</div>
      ) : mode === 'flashcard' ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500">Từ {idx + 1} / {filtered.length}</span>
            <button onClick={() => markLearned(filtered[idx].id)}
              className={`text-sm px-4 py-1.5 rounded-full font-medium transition-all
                ${learned.includes(filtered[idx].id) ? 'bg-green-100 text-green-700 border border-green-300' : 'border border-gray-200 text-gray-500 hover:border-green-300'}`}>
              {learned.includes(filtered[idx].id) ? '✅ Đã học' : '⬜ Đánh dấu đã học'}
            </button>
          </div>
          <Flashcard word={filtered[idx]} onNext={next} onPrev={prev}
            current={idx + 1} total={filtered.length} onSpeak={speak} />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map(w => (
            <div key={w.id} className={`bg-white rounded-xl border p-4 hover:shadow-sm transition-all
              ${learned.includes(w.id) ? 'border-green-200 bg-green-50' : 'border-gray-100'}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="hanzi text-2xl font-medium text-gray-800">{w.hanzi}</span>
                    <span className="text-blue-500 text-sm">{w.pinyin}</span>
                    <button onClick={() => speak(w.hanzi)} className="text-gray-400 hover:text-blue-500 text-sm">🔊</button>
                  </div>
                  <p className="font-semibold text-gray-700">{w.meaning}</p>
                  <p className="hanzi text-xs text-gray-400 mt-1">{w.example}</p>
                </div>
                <div className="flex flex-col items-end gap-1 ml-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${w.level === 'HSK1' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                    {w.level}
                  </span>
                  <button onClick={() => markLearned(w.id)}
                    className="text-lg transition-transform hover:scale-110">
                    {learned.includes(w.id) ? '✅' : '⬜'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
