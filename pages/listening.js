import { useState } from 'react';
import AudioPlayer from '../components/AudioPlayer';
import dialogues from '../data/dialogues.json';

export default function Listening() {
  const [filter, setFilter]   = useState('Tất cả');
  const [selected, setSelected] = useState(null);

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN'; u.rate = 0.8;
    window.speechSynthesis.speak(u);
  };

  const filtered = filter === 'Tất cả' ? dialogues : dialogues.filter(d => d.level === filter);

  return (
    <div className="max-w-2xl mx-auto px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-lg font-bold text-gray-800">🎧 Luyện nghe</h1>
          <p className="text-xs text-gray-500">Hội thoại HSK1–HSK2 · Web Speech API</p>
        </div>
        <div className="flex gap-1.5">
          {['Tất cả','HSK1','HSK2'].map(l => (
            <button key={l} onClick={() => { setFilter(l); setSelected(null); }}
              className={`px-3 py-1 rounded-full text-xs font-medium border-2 transition-all ${filter === l ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-500'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-3 text-xs text-blue-700">
        ℹ️ Dùng Chrome/Edge để nghe tốt nhất. Bật âm thanh trước khi phát.
      </div>

      {selected !== null ? (
        <div>
          <button onClick={() => setSelected(null)} className="mb-3 flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium">
            ← Quay lại danh sách
          </button>
          <AudioPlayer dialogue={filtered[selected]} onSpeak={speak} />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((d, i) => (
            <div key={d.id} onClick={() => setSelected(i)}
              className="bg-white rounded-xl border border-gray-100 p-3 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${d.level === 'HSK1' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{d.level}</span>
                    <h3 className="font-semibold text-gray-800 text-sm">{d.title}</h3>
                  </div>
                  <p className="hanzi text-xs text-gray-400">{d.titleZh} · {d.lines.length} câu</p>
                </div>
                <span className="text-gray-400 text-lg">▶</span>
              </div>
              <p className="hanzi text-xs text-gray-500 mt-1.5 truncate">{d.lines[0]?.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
