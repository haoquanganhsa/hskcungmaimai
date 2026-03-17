import { useState, useEffect } from 'react';
import hsk1 from '../data/HSK1.json';
import hsk2 from '../data/HSK2.json';
import Link from 'next/link';

const allWords = [...hsk1, ...hsk2];

export default function Progress() {
  const [learned, setLearned] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setLearned(JSON.parse(localStorage.getItem('learned') || '[]'));
    setQuizHistory(JSON.parse(localStorage.getItem('quizHistory') || '[]'));
    setStreak(parseInt(localStorage.getItem('streak') || '0'));
  }, []);

  const resetProgress = () => {
    if (confirm('Bạn có chắc muốn xóa toàn bộ tiến độ không?')) {
      localStorage.clear();
      setLearned([]); setQuizHistory([]); setStreak(0);
    }
  };

  const hsk1Learned = learned.filter(id => hsk1.find(w => w.id === id)).length;
  const hsk2Learned = learned.filter(id => hsk2.find(w => w.id === id)).length;
  const totalQuizScore = quizHistory.reduce((s, h) => s + h.score, 0);
  const totalQuizQ = quizHistory.reduce((s, h) => s + h.total, 0);
  const avgAccuracy = totalQuizQ > 0 ? Math.round((totalQuizScore / totalQuizQ) * 100) : 0;

  const categoryProgress = [...new Set(allWords.map(w => w.category))].map(cat => {
    const words = allWords.filter(w => w.category === cat);
    const done = words.filter(w => learned.includes(w.id)).length;
    return { cat, done, total: words.length, pct: Math.round((done / words.length) * 100) };
  }).sort((a, b) => b.pct - a.pct);

  const stats = [
    { label: 'Từ đã học', value: learned.length, total: allWords.length, icon: '📚', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Quiz hoàn thành', value: quizHistory.length, total: null, icon: '✏️', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Độ chính xác TB', value: avgAccuracy + '%', total: null, icon: '🎯', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Ngày học liên tiếp', value: streak, total: null, icon: '🔥', color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const overallPct = Math.round((learned.length / allWords.length) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-1">📊 Tiến độ học tập</h1>
          <p className="text-gray-500">Theo dõi hành trình học tiếng Trung của bạn</p>
        </div>
        <button onClick={resetProgress} className="text-sm text-red-400 hover:text-red-600 underline mt-1">
          Xóa tiến độ
        </button>
      </div>

      {learned.length === 0 && quizHistory.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🌱</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Bạn chưa bắt đầu học!</h2>
          <p className="text-gray-500 mb-6">Hãy bắt đầu với Flashcard hoặc Quiz nhé.</p>
          <div className="flex justify-center gap-3">
            <Link href="/vocabulary" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              📚 Học từ vựng
            </Link>
            <Link href="/quiz" className="px-6 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
              ✏️ Làm quiz
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Overall progress */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-blue-200 text-sm">Tổng tiến độ</p>
                <p className="text-4xl font-bold mt-1">{overallPct}%</p>
              </div>
              <div className="text-right text-sm text-blue-200">
                <p>{learned.length} / {allWords.length} từ</p>
                <p>đã học</p>
              </div>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div className="bg-white h-3 rounded-full transition-all" style={{ width: `${overallPct}%` }} />
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {stats.map((s, i) => (
              <div key={i} className={`${s.bg} rounded-2xl p-5`}>
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                {s.total && <div className="text-xs text-gray-500">/ {s.total} tổng</div>}
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* HSK Level progress */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {[
              { label: 'HSK 1', learned: hsk1Learned, total: hsk1.length, color: 'bg-green-500' },
              { label: 'HSK 2', learned: hsk2Learned, total: hsk2.length, color: 'bg-blue-500' },
            ].map((l, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-700">{l.label}</span>
                  <span className="text-sm text-gray-500">{l.learned}/{l.total} từ</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div className={`${l.color} h-2.5 rounded-full transition-all`}
                    style={{ width: `${Math.round((l.learned / l.total) * 100)}%` }} />
                </div>
                <p className="text-xs text-gray-400">{Math.round((l.learned / l.total) * 100)}% hoàn thành</p>
              </div>
            ))}
          </div>

          {/* Category breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
            <h3 className="font-semibold text-gray-700 mb-4">Tiến độ theo chủ đề</h3>
            <div className="space-y-3">
              {categoryProgress.map((c, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{c.cat}</span>
                    <span className="text-gray-400">{c.done}/{c.total}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-400 h-2 rounded-full transition-all"
                      style={{ width: `${c.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quiz history */}
          {quizHistory.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-700 mb-4">📜 Lịch sử quiz</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-100">
                      <th className="text-left pb-2">Ngày</th>
                      <th className="text-left pb-2">Cấp độ</th>
                      <th className="text-center pb-2">Điểm</th>
                      <th className="text-center pb-2">Tỉ lệ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizHistory.slice(0, 10).map((h, i) => {
                      const pct = Math.round((h.score / h.total) * 100);
                      return (
                        <tr key={i} className="border-b border-gray-50">
                          <td className="py-2 text-gray-500">{h.date}</td>
                          <td className="py-2">{h.level}</td>
                          <td className="py-2 text-center font-bold text-blue-600">{h.score}/{h.total}</td>
                          <td className="py-2 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                              ${pct >= 80 ? 'bg-green-100 text-green-700' : pct >= 60 ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                              {pct}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
