import { useState, useEffect, useRef } from 'react';
import hsk1 from '../data/HSK1.json';
import hsk2 from '../data/HSK2.json';
import dialogues from '../data/dialogues.json';

const allWords = [...hsk1, ...hsk2];
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function similarity(a, b) {
  a = a.trim().replace(/\s/g, '');
  b = b.trim().replace(/\s/g, '');
  if (a === b) return 100;
  if (!a || !b) return 0;
  let match = 0;
  const aChars = [...a];
  const bChars = [...b];
  const used = new Array(bChars.length).fill(false);
  for (let i = 0; i < aChars.length; i++) {
    for (let j = 0; j < bChars.length; j++) {
      if (!used[j] && aChars[i] === bChars[j]) { match++; used[j] = true; break; }
    }
  }
  return Math.round((2 * match) / (aChars.length + bChars.length) * 100);
}

function getGrade(pct) {
  if (pct === 100) return { label: '🏆 Hoàn hảo!',  color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' };
  if (pct >= 80)   return { label: '🎉 Xuất sắc!',  color: 'text-green-600',  bg: 'bg-green-50 border-green-200' };
  if (pct >= 60)   return { label: '👍 Khá tốt!',   color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200' };
  if (pct >= 40)   return { label: '💪 Cố lên!',    color: 'text-orange-500', bg: 'bg-orange-50 border-orange-200' };
  return            { label: '🔄 Thử lại nhé!',     color: 'text-red-500',    bg: 'bg-red-50 border-red-200' };
}

export default function Speaking() {
  const [mode, setMode]           = useState('word');
  const [level, setLevel]         = useState('Tất cả');
  const [current, setCurrent]     = useState(0);
  const [pool, setPool]           = useState([]);
  const [listening, setListening] = useState(false);
  const [result, setResult]       = useState(null);
  const [history, setHistory]     = useState([]);
  const [supported, setSupported] = useState(true);
  const [score, setScore]         = useState({ good: 0, bad: 0 });
  const [userAudioUrl, setUserAudioUrl]   = useState(null);
  const [isPlayingUser, setIsPlayingUser] = useState(false);

  const recognizerRef = useRef(null);
  const mediaRecRef   = useRef(null);
  const chunksRef     = useRef([]);
  const userAudioRef  = useRef(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSupported(false);
    }
    buildPool(mode, level);
    return () => { if (userAudioUrl) URL.revokeObjectURL(userAudioUrl); };
  }, []);

  useEffect(() => { buildPool(mode, level); }, [mode, level]);

  const buildPool = (m, lv) => {
    if (m === 'word') {
      const filtered = lv === 'Tất cả' ? allWords : allWords.filter(w => w.level === lv);
      setPool(shuffle(filtered));
    } else {
      const lines = [];
      dialogues.forEach(d => {
        if (lv === 'Tất cả' || d.level === lv)
          d.lines.forEach(l => lines.push({ hanzi: l.text, meaning: l.translation, level: d.level }));
      });
      setPool(shuffle(lines));
    }
    setCurrent(0); setResult(null); setUserAudioUrl(null);
  };

  const item = pool[current] || null;

  // Phát âm mẫu bằng Web Speech API
  const speakSample = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = 0.8;
    u.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const zhVoice = voices.find(v => v.lang === 'zh-CN') || voices.find(v => v.lang.startsWith('zh'));
    if (zhVoice) u.voice = zhVoice;
    window.speechSynthesis.speak(u);
  };

  // Phát lại giọng người dùng
  const playUserAudio = () => {
    if (!userAudioUrl || !userAudioRef.current) return;
    if (isPlayingUser) {
      userAudioRef.current.pause();
      userAudioRef.current.currentTime = 0;
      setIsPlayingUser(false);
      return;
    }
    userAudioRef.current.play();
    setIsPlayingUser(true);
  };

  // Ghi âm + nhận diện giọng nói
  const startListening = async () => {
    if (!supported) return;
    if (userAudioUrl) URL.revokeObjectURL(userAudioUrl);
    setUserAudioUrl(null);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // MediaRecorder — ghi lại để phát lại
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecRef.current = recorder;
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setUserAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();

      // SpeechRecognition — nhận diện văn bản
      const SR  = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SR();
      rec.lang = 'zh-CN';
      rec.continuous = false;
      rec.interimResults = false;
      rec.maxAlternatives = 3;

      rec.onstart = () => setListening(true);

      rec.onresult = (e) => {
        let best = '', bestPct = 0;
        for (let i = 0; i < e.results[0].length; i++) {
          const heard = e.results[0][i].transcript;
          const pct = similarity(item.hanzi, heard);
          if (pct > bestPct) { bestPct = pct; best = heard; }
        }
        if (mediaRecRef.current?.state === 'recording') mediaRecRef.current.stop();
        setResult({ heard: best, pct: bestPct });
        setListening(false);
        setHistory(h => [{ hanzi: item.hanzi, heard: best, pct: bestPct }, ...h].slice(0, 20));
        if (bestPct >= 60) setScore(s => ({ ...s, good: s.good + 1 }));
        else               setScore(s => ({ ...s, bad:  s.bad  + 1 }));
      };

      rec.onerror = (e) => {
        setListening(false);
        if (mediaRecRef.current?.state === 'recording') mediaRecRef.current.stop();
        if (e.error === 'no-speech') setResult({ heard: '(không nghe thấy)', pct: 0 });
        else if (e.error === 'not-allowed') alert('Vui lòng cho phép microphone trong cài đặt trình duyệt!');
      };

      rec.onend = () => setListening(false);
      recognizerRef.current = rec;
      rec.start();

    } catch {
      alert('Không truy cập được microphone. Hãy cho phép quyền mic trong trình duyệt!');
    }
  };

  const stopListening = () => {
    recognizerRef.current?.stop();
    if (mediaRecRef.current?.state === 'recording') mediaRecRef.current.stop();
    setListening(false);
  };

  const next = () => {
    setCurrent(c => (c + 1) % pool.length);
    setResult(null); setUserAudioUrl(null); setIsPlayingUser(false);
  };

  const retry = () => {
    setResult(null); setUserAudioUrl(null); setIsPlayingUser(false);
  };

  const total    = score.good + score.bad;
  const accuracy = total > 0 ? Math.round((score.good / total) * 100) : 0;

  if (!supported) return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-4">😢</div>
      <h2 className="text-xl font-bold text-gray-700 mb-3">Trình duyệt không hỗ trợ</h2>
      <p className="text-gray-500 mb-4">Tính năng luyện nói cần trình duyệt hỗ trợ Web Speech API.</p>
      <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700 text-left">
        <p className="font-semibold mb-2">✅ Trình duyệt được hỗ trợ:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Chrome (Android & máy tính)</li>
          <li>Edge (Android & máy tính)</li>
        </ul>
        <p className="font-semibold mt-3 mb-2">❌ Không hỗ trợ:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Mọi trình duyệt trên iPhone/iPad (iOS)</li>
          <li>Firefox</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto px-4 py-6">

      {/* Hidden audio để phát lại giọng người dùng */}
      {userAudioUrl && (
        <audio ref={userAudioRef} src={userAudioUrl}
          onEnded={() => setIsPlayingUser(false)}
          onPause={() => setIsPlayingUser(false)} />
      )}

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">🎤 Luyện nói</h1>
        <p className="text-gray-500 text-sm">Nghe mẫu → Nói lại → Xem % độ chính xác</p>
      </div>

      {/* Score */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: '✅ Đúng',      val: score.good,     color: 'text-green-600' },
          { label: '❌ Sai',       val: score.bad,      color: 'text-red-500'   },
          { label: '🎯 Chính xác', val: accuracy + '%', color: 'text-blue-600'  },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
            <div className={`text-xl font-bold ${s.color}`}>{s.val}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5 space-y-3">
        <div className="flex gap-2">
          {[{ k:'word', label:'📝 Từ vựng' }, { k:'sentence', label:'💬 Hội thoại' }].map(m => (
            <button key={m.k} onClick={() => setMode(m.k)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all
                ${mode === m.k ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600'}`}>
              {m.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {['Tất cả','HSK1','HSK2'].map(l => (
            <button key={l} onClick={() => setLevel(l)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all
                ${level === l ? 'bg-green-500 text-white border-green-500' : 'border-gray-200 text-gray-500'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Main card */}
      {item && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">

          {/* Từ / câu */}
          <div className="text-center mb-5">
            <div className="flex justify-center gap-2 mb-3">
              <span className={`text-xs font-bold px-3 py-1 rounded-full
                ${(item.level || 'HSK1') === 'HSK1' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                {item.level || 'HSK'}
              </span>
              <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                {current + 1} / {pool.length}
              </span>
            </div>
            <div className={`hanzi font-medium text-gray-800 mb-2
              ${mode === 'word' ? 'text-6xl' : 'text-2xl leading-relaxed'}`}>
              {item.hanzi}
            </div>
            {mode === 'word' && item.pinyin && (
              <div className="text-blue-400 text-base font-medium mb-1">{item.pinyin}</div>
            )}
            <div className="text-gray-500 text-sm">{item.meaning || item.exampleVi}</div>
          </div>

          {/* Nút nghe mẫu */}
          <button onClick={() => speakSample(item.hanzi)}
            className="w-full py-3 mb-3 rounded-xl bg-blue-50 text-blue-600 font-semibold text-sm
              hover:bg-blue-100 active:bg-blue-200 transition-colors flex items-center justify-center gap-2">
            🔊 Nghe phát âm mẫu
          </button>

          {/* Nút ghi âm */}
          {!result && (
            <button onClick={listening ? stopListening : startListening}
              className={`w-full py-4 rounded-xl font-bold text-base transition-all
                flex items-center justify-center gap-3
                ${listening
                  ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 active:scale-95'}`}>
              {listening
                ? <><span className="text-2xl">⏹</span> Đang nghe... bấm để dừng</>
                : <><span className="text-2xl">🎤</span> Bấm và nói tiếng Trung</>}
            </button>
          )}

          {/* Kết quả */}
          {result && (() => {
            const grade = getGrade(result.pct);
            return (
              <div className={`rounded-xl border p-4 fade-in ${grade.bg}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`font-bold text-lg ${grade.color}`}>{grade.label}</span>
                  <span className={`text-3xl font-black ${grade.color}`}>{result.pct}%</span>
                </div>

                <div className="w-full bg-white rounded-full h-3 mb-4 overflow-hidden">
                  <div className={`h-3 rounded-full transition-all duration-700
                    ${result.pct >= 80 ? 'bg-green-400' : result.pct >= 60 ? 'bg-blue-400' : result.pct >= 40 ? 'bg-orange-400' : 'bg-red-400'}`}
                    style={{ width: `${result.pct}%` }} />
                </div>

                <div className="space-y-2 text-sm mb-4 bg-white/60 rounded-lg p-3">
                  <div className="flex gap-2 items-center">
                    <span className="text-gray-400 w-20 flex-shrink-0 text-xs">Đáp án:</span>
                    <span className="hanzi font-bold text-gray-800 text-base">{item.hanzi}</span>
                    <button onClick={() => speakSample(item.hanzi)}
                      className="ml-auto text-blue-400 hover:text-blue-600 text-xs px-2 py-1 rounded-lg bg-blue-50">
                      🔊 mẫu
                    </button>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-gray-400 w-20 flex-shrink-0 text-xs">Bạn nói:</span>
                    <span className={`hanzi font-bold text-base ${result.pct >= 60 ? 'text-green-600' : 'text-red-500'}`}>
                      {result.heard || '(không nhận ra)'}
                    </span>
                    {userAudioUrl && (
                      <button onClick={playUserAudio}
                        className={`ml-auto text-xs px-2 py-1 rounded-lg flex items-center gap-1 transition-colors
                          ${isPlayingUser
                            ? 'bg-orange-100 text-orange-600 animate-pulse'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {isPlayingUser ? '⏹ dừng' : '▶ nghe lại'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={retry}
                    className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50">
                    🔄 Thử lại
                  </button>
                  <button onClick={next}
                    className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700">
                    Tiếp theo →
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Hướng dẫn */}
      {!listening && !result && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 mb-4">
          <p className="font-semibold mb-2">💡 Hướng dẫn:</p>
          <ol className="space-y-1.5 list-decimal list-inside">
            <li>Bấm <strong>"Nghe phát âm mẫu"</strong> để nghe trước</li>
            <li>Bấm <strong>"Bấm và nói"</strong> rồi đọc to tiếng Trung</li>
            <li>Xem kết quả và nghe lại giọng của bạn để so sánh</li>
          </ol>
          <p className="mt-2 text-xs text-amber-600">⚠️ Chỉ hỗ trợ Chrome / Edge trên Android và máy tính không hỗ trợ ios</p>
        </div>
      )}

      {/* Lịch sử */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">📜 Lịch sử luyện tập</h3>
          <div className="space-y-2">
            {history.slice(0, 8).map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="hanzi text-gray-700 flex-1 truncate">{h.hanzi}</span>
                <span className="text-gray-300">→</span>
                <span className={`hanzi flex-1 truncate ${h.pct >= 60 ? 'text-green-600' : 'text-red-400'}`}>
                  {h.heard}
                </span>
                <span className={`font-bold text-xs px-2 py-0.5 rounded-full flex-shrink-0
                  ${h.pct >= 80 ? 'bg-green-100 text-green-700' : h.pct >= 60 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-600'}`}>
                  {h.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}