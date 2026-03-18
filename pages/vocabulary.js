import { useState, useEffect } from 'react';
import Flashcard from '../components/Flashcard';
import hsk1 from '../data/HSK1.json';
import hsk2 from '../data/HSK2.json';
import { useRouter } from 'next/router';

const allWords = [...hsk1, ...hsk2];
const categories = ['Tất cả', ...new Set(allWords.map(w => w.category))];

export default function Vocabulary() {
  const router = useRouter();
  const [level, setLevel]     = useState('Tất cả');
  const [category, setCategory] = useState('Tất cả');
  const [mode, setMode]       = useState('flashcard');
  const [idx, setIdx]         = useState(0);
  const [learned, setLearned] = useState([]);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    setLearned(JSON.parse(localStorage.getItem('learned') || '[]'));
  }, []);

  // Reset về flashcard mỗi khi navigate vào trang /vocabulary
  useEffect(() => {
    const handleRouteComplete = (url) => {
      if (url.startsWith('/vocabulary')) {
        setMode('flashcard');
        setIdx(0);
      }
    };
    router.events.on('routeChangeComplete', handleRouteComplete);
    return () => router.events.off('routeChangeComplete', handleRouteComplete);
  }, [router.events]);

  const handleSetMode = (m) => {
    setMode(m);
    setIdx(0);
  };

  const saveStreak = () => {
    const today = new Date().toDateString();
    if (localStorage.getItem('lastStudy') !== today) {
      localStorage.setItem('lastStudy', today);
      localStorage.setItem('streak', parseInt(localStorage.getItem('streak') || '0') + 1);
    }
  };

  const filtered = allWords.filter(w => {
    const matchLevel = level === 'Tất cả' || w.level === level;
    const matchCat   = category === 'Tất cả' || w.category === category;
    const matchSearch = !search || w.hanzi.includes(search) || w.meaning.toLowerCase().includes(search.toLowerCase()) || w.pinyin.includes(search);
    return matchLevel && matchCat && matchSearch;
  });

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN'; u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };

  const markLearned = (id) => {
    const next = learned.includes(id) ? learned.filter(x => x !== id) : [...learned, id];
    setLearned(next);
    localStorage.setItem('learned', JSON.stringify(next));
    saveStreak();
  };

  const next = () => {
    const newIdx = (idx + 1) % filtered.length;
    setIdx(newIdx);
    setTimeout(() => speak(filtered[newIdx].hanzi), 300);
  };
  const prev = () => {
    const newIdx = (idx - 1 + filtered.length) % filtered.length;
    setIdx(newIdx);
    setTimeout(() => speak(filtered[newIdx].hanzi), 300);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-lg font-bold text-gray-800">📚 Từ vựng</h1>
          <p className="text-xs text-gray-500">{filtered.length} từ · {learned.length} đã học</p>
        </div>
        <div className="flex gap-1.5">
          <button type="button" onClick={(e) => { e.stopPropagation(); handleSetMode('flashcard'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${mode === 'flashcard' ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            🃏 Flashcard
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); handleSetMode('list'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${mode === 'list' ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            📋 Danh sách
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 mb-3 space-y-2">
        <input type="text" placeholder="🔍 Tìm kiếm..."
          value={search} onChange={e => { setSearch(e.target.value); setIdx(0); }}
          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400" />
        <div className="flex gap-1.5">
          {['Tất cả','HSK1','HSK2'].map(l => (
            <button key={l} onClick={() => { setLevel(l); setIdx(0); }}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${level === l ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-500'}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {categories.map(c => (
            <button key={c} onClick={() => { setCategory(c); setIdx(0); }}
              className={`px-2 py-0.5 rounded-full text-xs font-medium border transition-all ${category === c ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 text-gray-400'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">Không tìm thấy từ nào 😅</div>
      ) : mode === 'flashcard' ? (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-500">Từ {idx + 1} / {filtered.length}</span>
            <button onClick={() => markLearned(filtered[idx].id)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-all border ${learned.includes(filtered[idx].id) ? 'bg-green-100 text-green-700 border-green-300' : 'border-gray-200 text-gray-500'}`}>
              {learned.includes(filtered[idx].id) ? '✅ Đã học' : '⬜ Đánh dấu đã học'}
            </button>
          </div>
          <Flashcard word={filtered[idx]} onNext={next} onPrev={prev} current={idx + 1} total={filtered.length} onSpeak={speak} />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-2">
          {filtered.map(w => (
            <div key={w.id} className={`bg-white rounded-xl border p-3 hover:shadow-sm transition-all ${learned.includes(w.id) ? 'border-green-200 bg-green-50' : 'border-gray-100'}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="hanzi text-2xl font-medium text-gray-800">{w.hanzi}</span>
                    <span className="text-blue-500 text-xs">{w.pinyin}</span>
                    <button onClick={() => speak(w.hanzi)} className="text-gray-400 hover:text-blue-500 text-xs">🔊</button>
                  </div>
                  <p className="font-semibold text-gray-700 text-sm">{w.meaning}</p>
                  <p className="hanzi text-xs text-gray-400 mt-0.5 truncate">{w.example}</p>
                  {w.exampleVi && <p className="text-xs text-gray-400 italic truncate">{w.exampleVi}</p>}
                </div>
                <div className="flex flex-col items-end gap-1 ml-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${w.level === 'HSK1' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>{w.level}</span>
                  <button onClick={() => markLearned(w.id)} className="text-base">{learned.includes(w.id) ? '✅' : '⬜'}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
