import { useState } from 'react';
import AudioPlayer from '../components/AudioPlayer';
import dialogues from '../data/dialogues.json';

export default function Listening() {
  const [filter, setFilter] = useState('Tất cả');
  const [selected, setSelected] = useState(null);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN'; u.rate = 0.8;
      window.speechSynthesis.speak(u);
    }
  };

  const filtered = filter === 'Tất cả' ? dialogues : dialogues.filter(d => d.level === filter);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">🎧 Luyện nghe</h1>
        <p className="text-gray-500">Hội thoại HSK1–HSK2 với phụ đề tiếng Việt · Sử dụng Web Speech API</p>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-700">
        <strong>ℹ️ Lưu ý:</strong> Âm thanh được tạo bởi Web Speech API (Text-to-Speech) của trình duyệt.
        Hãy bật âm thanh và dùng Chrome/Edge để có chất lượng tốt nhất.
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {['Tất cả', 'HSK1', 'HSK2'].map(l => (
          <button key={l} onClick={() => { setFilter(l); setSelected(null); }}
            className={`px-5 py-2 rounded-full text-sm font-medium border-2 transition-all
              ${filter === l ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
            {l}
          </button>
        ))}
      </div>

      {selected !== null ? (
        <div>
          <button onClick={() => setSelected(null)}
            className="mb-4 flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium">
            ← Quay lại danh sách
          </button>
          <AudioPlayer dialogue={filtered[selected]} onSpeak={speak} />
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((d, i) => (
            <div key={d.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer"
              onClick={() => setSelected(i)}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                      ${d.level === 'HSK1' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {d.level}
                    </span>
                    <h3 className="font-semibold text-gray-800">{d.title}</h3>
                  </div>
                  <p className="hanzi text-sm text-gray-400">{d.titleZh}</p>
                  <p className="text-xs text-gray-400 mt-1">{d.lines.length} câu thoại</p>
                </div>
                <div className="text-3xl">▶</div>
              </div>

              {/* Preview first line */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="hanzi text-sm text-gray-600 truncate">{d.lines[0]?.text}</p>
                <p className="text-xs text-gray-400 truncate">{d.lines[0]?.translation}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
