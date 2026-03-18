import Link from 'next/link';
import { useEffect, useState } from 'react';

const features = [
  { icon: '📚', title: 'Từ vựng', href: '/vocabulary', color: 'bg-blue-500' },
  { icon: '✏️', title: 'Quiz',    href: '/quiz',       color: 'bg-purple-500' },
  { icon: '🎧', title: 'Nghe',    href: '/listening',  color: 'bg-pink-500' },
  { icon: '🎤', title: 'Nói',     href: '/speaking',   color: 'bg-red-500' },
  { icon: '🖊️', title: 'Viết',   href: '/writing',    color: 'bg-orange-500' },
  { icon: '📊', title: 'Tiến độ', href: '/progress',   color: 'bg-green-500' },
];

export default function Home() {
  const [stats, setStats] = useState({ wordsLearned: 0, quizDone: 0, streak: 0 });

  useEffect(() => {
    const learned = JSON.parse(localStorage.getItem('learned') || '[]').length;
    const quizDone = JSON.parse(localStorage.getItem('quizHistory') || '[]').length;
    const streak = parseInt(localStorage.getItem('streak') || '0');
    setStats({ wordsLearned: learned, quizDone, streak });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      {/* Hero */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-3 border border-blue-200">
          🇨🇳 Học tiếng Trung từ cơ bản đến thi HSK
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
          Học tiếng Trung <span className="text-blue-600">thật dễ</span>
        </h1>
        <p className="hanzi text-3xl md:text-4xl text-blue-700 font-medium mb-2">汉语学习</p>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-3">
          Lộ trình HSK1–HSK2 dành cho người Việt. Học qua Flashcard, Quiz, Nghe, Nói và Viết.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/vocabulary" className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm shadow-sm">
            🚀 Bắt đầu học ngay
          </Link>
          <Link href="/quiz" className="px-5 py-2 border-2 border-blue-200 text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors text-sm">
            ✏️ Làm thử Quiz
          </Link>
        </div>
      </div>

      {/* Stats nếu đã học */}
      {stats.wordsLearned > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-3 text-white mb-4">
          <p className="text-blue-100 text-xs mb-2 font-medium">📈 Tiến độ của bạn</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div><div className="text-xl font-bold">{stats.wordsLearned}</div><div className="text-blue-200 text-xs">Từ đã học</div></div>
            <div><div className="text-xl font-bold">{stats.quizDone}</div><div className="text-blue-200 text-xs">Quiz xong</div></div>
            <div><div className="text-xl font-bold">{stats.streak}🔥</div><div className="text-blue-200 text-xs">Ngày liên tiếp</div></div>
          </div>
        </div>
      )}

      {/* Feature grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
        {features.map((f, i) => (
          <Link key={i} href={f.href}
            className="flex flex-col items-center gap-1 bg-white rounded-xl p-3 border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all">
            <div className={`w-9 h-9 rounded-xl ${f.color} flex items-center justify-center text-lg`}>{f.icon}</div>
            <span className="text-xs font-medium text-gray-600">{f.title}</span>
          </Link>
        ))}
      </div>

      {/* Lộ trình + Tips ngang nhau */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h2 className="text-sm font-bold text-gray-700 mb-2">🗺️ Lộ trình học HSK</h2>
          <div className="space-y-2">
            {[
              { level: 'HSK 1', words: '150 từ', topics: 'Chào hỏi, Gia đình, Số đếm, Thời gian', color: 'bg-green-100 text-green-700' },
              { level: 'HSK 2', words: '300 từ', topics: 'Công việc, Địa điểm, Cảm xúc, Liên từ', color: 'bg-blue-100 text-blue-700' },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.color}`}>{r.level}</span>
                <span className="text-xs font-medium text-gray-600">{r.words}</span>
                <span className="text-xs text-gray-400 truncate">{r.topics}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="text-sm font-bold text-amber-800 mb-2">💡 Mẹo học hiệu quả</h3>
          <ul className="space-y-1 text-xs text-amber-700">
            <li>✅ Học 10 từ mỗi ngày, đều đặn</li>
            <li>✅ Phát âm to khi học Flashcard</li>
            <li>✅ Luyện nghe hội thoại thực tế</li>
            <li>✅ Viết lại chữ Hán giúp nhớ lâu</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
