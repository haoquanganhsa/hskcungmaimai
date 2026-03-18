import { useState, useRef, useEffect } from 'react';

export default function AudioPlayer({ dialogue, onSpeak }) {
  const [playing, setPlaying] = useState(false);
  const [currentLine, setCurrentLine] = useState(-1);
  const [showSub, setShowSub] = useState(true);
  const playingRef = useRef(false);
  const timerRef = useRef(null);

  // Cleanup khi unmount hoặc đổi dialogue
  useEffect(() => {
    return () => {
      playingRef.current = false;
      window.speechSynthesis?.cancel();
      clearTimeout(timerRef.current);
    };
  }, [dialogue]);

  const speakerColor = (speaker) => {
    const colors = ['text-blue-600', 'text-purple-600', 'text-green-600', 'text-orange-600'];
    const idx = [...new Set(dialogue.lines.map(l => l.speaker))].indexOf(speaker);
    return colors[idx % colors.length] || 'text-gray-600';
  };

  // Đọc một dòng, trả về Promise resolve khi đọc xong
  const speakLine = (text) => {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) { resolve(); return; }
      window.speechSynthesis.cancel();

      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN';
      u.rate = 0.8;
      u.pitch = 1;

      u.onend = () => resolve();
      u.onerror = () => resolve(); // vẫn tiếp tục nếu lỗi

      window.speechSynthesis.speak(u);
    });
  };

  // Nghỉ giữa các câu
  const pause = (ms) => new Promise(resolve => {
    timerRef.current = setTimeout(resolve, ms);
  });

  const playAll = async () => {
    if (playing) {
      // Dừng lại
      playingRef.current = false;
      setPlaying(false);
      setCurrentLine(-1);
      window.speechSynthesis?.cancel();
      clearTimeout(timerRef.current);
      return;
    }

    setPlaying(true);
    playingRef.current = true;

    for (let i = 0; i < dialogue.lines.length; i++) {
      if (!playingRef.current) break;

      setCurrentLine(i);
      await speakLine(dialogue.lines[i].text);

      // Nghỉ 600ms giữa các câu (nếu vẫn đang phát)
      if (playingRef.current && i < dialogue.lines.length - 1) {
        await pause(600);
      }
    }

    if (playingRef.current) {
      setPlaying(false);
      setCurrentLine(-1);
      playingRef.current = false;
    }
  };

  const speakSingle = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = 0.8;
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base">{dialogue.title}</h3>
            <p className="hanzi text-blue-200 text-sm mt-0.5">{dialogue.titleZh}</p>
          </div>
          <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {dialogue.level}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <button onClick={playAll}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all
              ${playing ? 'bg-red-500 hover:bg-red-600' : 'bg-white text-blue-700 hover:bg-blue-50'}`}>
            {playing ? '⏹ Dừng lại' : '▶ Phát toàn bộ'}
          </button>
          <button onClick={() => setShowSub(!showSub)}
            className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-sm font-medium transition-all">
            {showSub ? '🙈 Ẩn dịch' : '👁 Hiện dịch'}
          </button>
          {playing && (
            <span className="text-blue-200 text-xs animate-pulse">
              🔊 Đang phát câu {currentLine + 1}/{dialogue.lines.length}...
            </span>
          )}
        </div>
      </div>

      {/* Dialogue lines */}
      <div className="p-4 space-y-2">
        {dialogue.lines.map((line, i) => (
          <div key={i}
            className={`p-3 rounded-xl transition-all duration-300 border
              ${currentLine === i
                ? 'bg-blue-50 border-blue-300 shadow-sm scale-[1.01]'
                : 'bg-gray-50 border-transparent'}`}>
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0
                ${currentLine === i ? 'bg-blue-500' : 'bg-gray-400'}`}>
                {line.speaker[0]}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold ${speakerColor(line.speaker)}`}>{line.speaker}</span>
                  <button
                    onClick={() => speakSingle(line.text)}
                    className="text-gray-400 hover:text-blue-500 active:text-blue-700 transition-colors text-xs"
                    title="Phát âm dòng này">
                    🔊
                  </button>
                  {currentLine === i && playing && (
                    <span className="text-xs text-blue-400 animate-pulse">đang đọc...</span>
                  )}
                </div>
                <p className="hanzi text-gray-800 text-base leading-relaxed">{line.text}</p>
                {line.pinyin && (
                  <p className="text-blue-400 text-xs font-medium mt-0.5">{line.pinyin}</p>
                )}
                {showSub && (
                  <p className="text-sm text-gray-500 mt-1 italic">{line.translation}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
