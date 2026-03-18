import { useState, useEffect } from 'react';
import hsk1 from '../data/HSK1.json';
import hsk2 from '../data/HSK2.json';
import Link from 'next/link';

const allWords = [...hsk1, ...hsk2];

export default function Progress() {
  const [learned, setLearned]         = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [streak, setStreak]           = useState(0);

  useEffect(() => {
    setLearned(JSON.parse(localStorage.getItem('learned') || '[]'));
    setQuizHistory(JSON.parse(localStorage.getItem('quizHistory') || '[]'));
    setStreak(parseInt(localStorage.getItem('streak') || '0'));
  }, []);

  const resetProgress = () => {
    if (!confirm('Bạn có chắc muốn xóa toàn bộ tiến độ không?')) return;
    localStorage.clear();
    setLearned([]); setQuizHistory([]); setStreak(0);
  };

  const hsk1Learned = learned.filter(id => hsk1.find(w => w.id === id)).length;
  const hsk2Learned = learned.filter(id => hsk2.find(w => w.id === id)).length;
  const totalQ      = quizHistory.reduce((s, h) => s + h.total, 0);
  const totalScore  = quizHistory.reduce((s, h) => s + h.score, 0);
  const avgAccuracy = totalQ > 0 ? Math.round((totalScore / totalQ) * 100) : 0;
  const overallPct  = Math.round((learned.length / allWords.length) * 100);

  const categoryProgress = [...new Set(allWords.map(w => w.category))].map(cat => {
    const words = allWords.filter(w => w.category === cat);
    const done  = words.filter(w => learned.includes(w.id)).length;
    return { cat, done, total: words.length, pct: Math.round((done / words.length) * 100) };
  }).sort((a, b) => b.pct - a.pct);

  if (learned.length === 0 && quizHistory.length === 0) return (
    <div className="max-w-xl mx-auto px-4 py-8 text-center">
      <div className="text-5xl mb-3">🌱</div>
      <h2 className="text-lg font-bold text-gray-700 mb-1">Bạn chưa bắt đầu học!</h2>
      <p className="text-gray-500 text-sm mb-4">Hãy bắt đầu với Flashcard hoặc Quiz nhé.</p>
      <div className="flex justify-center gap-2">
        <Link href="/vocabulary" className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 text-sm">📚 Học từ vựng</Link>
        <Link href="/quiz" className="px-5 py-2 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 text-sm">✏️ Làm quiz</Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-3">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-lg font-bold text-gray-800">📊 Tiến độ học tập</h1>
          <p className="text-xs text-gray-500">Theo dõi hành trình học tiếng Trung</p>
        </div>
        <button onClick={resetProgress} className="text-xs text-red-400 hover:text-red-600 underline">Xóa tiến độ</button>
      </div>

      {/* Overall */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white mb-3">
        <div className="flex justify-between items-center mb-2">
          <div>
            <p className="text-blue-200 text-xs">Tổng tiến độ</p>
            <p className="text-3xl font-bold">{overallPct}%</p>
          </div>
          <div className="text-right text-xs text-blue-200">
            <p>{learned.length} / {allWords.length} từ</p>
          </div>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div className="bg-white h-2 rounded-full transition-all" style={{ width: `${overallPct}%` }} />
        </div>
      </div>

      {/* Stats + HSK levels */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        {[
          { label: '📚 Từ đã học', val: learned.length, sub: `/ ${allWords.length}`, color: 'text-blue-600' },
          { label: '✏️ Quiz xong', val: quizHistory.length, sub: 'lần', color: 'text-purple-600' },
          { label: '🎯 Chính xác', val: avgAccuracy + '%', sub: 'trung bình', color: 'text-green-600' },
          { label: '🔥 Streak',    val: streak, sub: 'ngày', color: 'text-orange-500' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-3">
            <p className="text-xs text-gray-500 mb-0.5">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-xs text-gray-400">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {/* HSK progress */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">Tiến độ theo cấp độ</h3>
          <div className="space-y-3">
            {[
              { label: 'HSK 1', learned: hsk1Learned, total: hsk1.length, color: 'bg-green-500' },
              { label: 'HSK 2', learned: hsk2Learned, total: hsk2.length, color: 'bg-blue-500' },
            ].map((l, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-gray-700">{l.label}</span>
                  <span className="text-gray-500">{l.learned}/{l.total} từ · {Math.round((l.learned/l.total)*100)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`${l.color} h-2 rounded-full`} style={{ width: `${Math.round((l.learned/l.total)*100)}%` }} />
                </div>
              </div>
            ))}
          </div>

          <h3 className="font-semibold text-gray-700 mt-4 mb-2 text-sm">Theo chủ đề</h3>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {categoryProgress.map((c, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-gray-600">{c.cat}</span>
                  <span className="text-gray-400">{c.done}/{c.total}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quiz history */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">📜 Lịch sử quiz</h3>
          {quizHistory.length === 0 ? (
            <p className="text-gray-400 text-xs text-center py-4">Chưa làm quiz nào</p>
          ) : (
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {quizHistory.map((h, i) => {
                const pct = Math.round((h.score / h.total) * 100);
                return (
                  <div key={i} className="flex items-center gap-2 text-xs py-1 border-b border-gray-50">
                    <span className="text-gray-400 w-16 flex-shrink-0">{h.date}</span>
                    <span className="text-gray-500 flex-shrink-0">{h.level}</span>
                    <span className="font-bold text-blue-600 ml-auto">{h.score}/{h.total}</span>
                    <span className={`px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${pct >= 80 ? 'bg-green-100 text-green-700' : pct >= 60 ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-600'}`}>
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
