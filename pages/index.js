import Link from 'next/link';
import { useEffect, useState } from 'react';

const features = [
  { icon: '📚', title: 'Thư viện từ vựng', desc: '60+ từ HSK1 & HSK2 với Flashcard tương tác, phát âm và ví dụ câu', href: '/vocabulary', color: 'from-blue-500 to-blue-600' },
  { icon: '✏️', title: 'Bài quiz trắc nghiệm', desc: 'Kiểm tra kiến thức ngay lập tức với quiz nhiều lựa chọn, tính điểm', href: '/quiz', color: 'from-purple-500 to-purple-600' },
  { icon: '🎧', title: 'Luyện nghe', desc: 'Hội thoại thực tế cấp HSK1-HSK2, có phụ đề tiếng Việt', href: '/listening', color: 'from-pink-500 to-pink-600' },
  { icon: '🖊️', title: 'Luyện viết', desc: 'Gõ chữ Hán và kiểm tra đúng/sai theo từ vựng đã học', href: '/writing', color: 'from-orange-500 to-orange-600' },
  { icon: '📊', title: 'Theo dõi tiến độ', desc: 'Dashboard cá nhân: số từ đã học, điểm quiz, streak học mỗi ngày', href: '/progress', color: 'from-green-500 to-green-600' },
];

const roadmap = [
  { level: 'HSK 1', words: '150 từ', topics: 'Chào hỏi, Gia đình, Số đếm, Thời gian', color: 'bg-green-100 border-green-300 text-green-800', badge: 'bg-green-500' },
  { level: 'HSK 2', words: '300 từ', topics: 'Công việc, Địa điểm, Cảm xúc, Liên từ', color: 'bg-blue-100 border-blue-300 text-blue-800', badge: 'bg-blue-500' },
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
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
      {/* Hero */}
      <div className="text-center mb-14 fade-in">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full mb-6 border border-blue-200">
          🇨🇳 Học tiếng Trung từ cơ bản đến HSK cùng Mai Mai
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
          Học tiếng Trung{' '}
          <span className="text-blue-600">thật dễ</span> với
          <br />
          <span className="hanzi text-4xl md:text-6xl text-blue-700">Mai Mai - 汉语学习</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8">
          Lộ trình từ vựng HSK1–HSK2 dành cho người Việt mới bắt đầu. Học qua Flashcard, Quiz, Nghe và Viết.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/vocabulary"
            className="px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
            🚀 Bắt đầu học ngay
          </Link>
          <Link href="/quiz"
            className="px-8 py-3.5 border-2 border-blue-200 text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors">
            ✏️ Làm thử Quiz
          </Link>
        </div>
      </div>

      {/* Stats (if any) */}
      {stats.wordsLearned > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white mb-10 fade-in">
          <h2 className="font-semibold text-blue-100 mb-3 text-sm">📈 Tiến độ của bạn</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><div className="text-3xl font-bold">{stats.wordsLearned}</div><div className="text-blue-200 text-xs">Từ đã học</div></div>
            <div><div className="text-3xl font-bold">{stats.quizDone}</div><div className="text-blue-200 text-xs">Quiz hoàn thành</div></div>
            <div><div className="text-3xl font-bold">{stats.streak}🔥</div><div className="text-blue-200 text-xs">Ngày liên tiếp</div></div>
          </div>
        </div>
      )}

      {/* Roadmap */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Lộ trình học HSK</h2>
        <p className="text-gray-500 mb-6">Bắt đầu từ HSK1 rồi tiến lên HSK2 theo thứ tự</p>
        <div className="grid md:grid-cols-2 gap-4">
          {roadmap.map((r, i) => (
            <div key={i} className={`border-2 rounded-2xl p-6 ${r.color}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className={`${r.badge} text-white text-sm font-bold px-3 py-1 rounded-full`}>{r.level}</span>
                <span className="font-semibold">{r.words}</span>
              </div>
              <p className="text-sm opacity-80">{r.topics}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Tính năng học tập</h2>
        <p className="text-gray-500 mb-6">Đa dạng phương pháp giúp bạn ghi nhớ từ vựng hiệu quả</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <Link key={i} href={f.href}
              className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <h3 className="font-bold text-amber-800 mb-3">💡 Mẹo học tiếng Trung hiệu quả</h3>
        <ul className="space-y-2 text-sm text-amber-700">
          <li>✅ Học 10 từ mỗi ngày thay vì cố học nhiều trong một lần</li>
          <li>✅ Phát âm to thành tiếng khi học Flashcard</li>
          <li>✅ Luyện nghe hội thoại ngắn để quen với âm điệu</li>
          <li>✅ Viết lại chữ Hán giúp ghi nhớ lâu hơn</li>
        </ul>
      </div>
    </div>
  );
}
