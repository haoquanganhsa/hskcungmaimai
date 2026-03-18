import { useState, useEffect } from 'react';
import QuizQuestion from '../components/QuizQuestion';
import hsk1 from '../data/HSK1.json';
import hsk2 from '../data/HSK2.json';

const allWords = [...hsk1, ...hsk2];
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function getOptions(correct, pool) {
  const others = shuffle(pool.filter(w => w.id !== correct.id)).slice(0, 3).map(w => w.meaning);
  return shuffle([correct.meaning, ...others]);
}
const QUIZ_LENGTH = 10;

export default function Quiz() {
  const [level, setLevel]       = useState('Tất cả');
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent]   = useState(0);
  const [score, setScore]       = useState(0);
  const [done, setDone]         = useState(false);
  const [history, setHistory]   = useState([]);
  const [canNext, setCanNext]   = useState(false);

  useEffect(() => { setHistory(JSON.parse(localStorage.getItem('quizHistory') || '[]')); }, []);

  const pool = level === 'Tất cả' ? allWords : allWords.filter(w => w.level === level);

  const startQuiz = () => {
    const q = shuffle(pool).slice(0, Math.min(QUIZ_LENGTH, pool.length)).map(w => ({
      word: w, options: getOptions(w, pool),
    }));
    setQuestions(q); setCurrent(0); setScore(0); setDone(false); setCanNext(false);
  };

  const handleAnswer = (isCorrect) => {
    if (isCorrect) setScore(s => s + 1);
    setCanNext(true);
  };

  const nextQuestion = () => {
    if (current + 1 >= questions.length) {
      const record = { date: new Date().toLocaleDateString('vi'), score, total: questions.length, level };
      const hist = [record, ...history].slice(0, 20);
      localStorage.setItem('quizHistory', JSON.stringify(hist));
      setHistory(hist); setDone(true);
    } else {
      setCurrent(c => c + 1); setCanNext(false);
    }
  };

  const grade = questions.length ? score / questions.length : 0;
  const gradeLabel = grade >= 0.8 ? ['🏆 Xuất sắc!', 'text-green-600'] : grade >= 0.6 ? ['👍 Khá tốt!', 'text-blue-600'] : ['📚 Cần ôn thêm', 'text-orange-600'];

  // Menu chọn cấp độ
  if (!questions.length) return (
    <div className="max-w-md mx-auto px-4 py-4">
      <div className="text-center mb-4">
        <div className="text-4xl mb-1">✏️</div>
        <h1 className="text-xl font-bold text-gray-800 mb-0.5">Quiz trắc nghiệm</h1>
        <p className="text-sm text-gray-500">{QUIZ_LENGTH} câu · Chọn nghĩa tiếng Việt đúng</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
        <p className="text-xs font-semibold text-gray-600 mb-2">Chọn cấp độ:</p>
        <div className="flex gap-2">
          {['Tất cả', 'HSK1', 'HSK2'].map(l => (
            <button key={l} onClick={() => setLevel(l)}
              className={`flex-1 py-2 rounded-xl font-medium border-2 text-sm transition-all
                ${level === l ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <button onClick={startQuiz}
        className="w-full py-3 bg-blue-600 text-white font-bold text-base rounded-xl hover:bg-blue-700 transition-colors shadow-sm mb-3">
        🚀 Bắt đầu Quiz
      </button>

      {history.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-700 mb-2 text-sm">📜 Lịch sử gần đây</h3>
          <div className="space-y-1.5">
            {history.slice(0, 5).map((h, i) => (
              <div key={i} className="flex justify-between items-center text-xs">
                <span className="text-gray-500">{h.date} · {h.level}</span>
                <span className={`font-bold ${h.score / h.total >= 0.8 ? 'text-green-600' : h.score / h.total >= 0.6 ? 'text-blue-600' : 'text-orange-500'}`}>
                  {h.score}/{h.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Kết quả
  if (done) return (
    <div className="max-w-md mx-auto px-4 py-4 text-center fade-in">
      <div className="text-5xl mb-2">{grade >= 0.8 ? '🏆' : grade >= 0.6 ? '😊' : '📚'}</div>
      <h2 className={`text-2xl font-bold mb-1 ${gradeLabel[1]}`}>{gradeLabel[0]}</h2>
      <p className="text-gray-500 text-sm mb-3">Quiz {level} hoàn thành</p>

      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
        <div className="text-5xl font-bold text-blue-600 mb-1">{score}<span className="text-xl text-gray-400">/{questions.length}</span></div>
        <div className="text-gray-500 text-sm mb-2">Số câu đúng</div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${grade * 100}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-1">{Math.round(grade * 100)}% chính xác</p>
      </div>

      <div className="flex gap-2">
        <button onClick={startQuiz} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 text-sm">🔄 Làm lại</button>
        <button onClick={() => setQuestions([])} className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 text-sm">🏠 Menu</button>
      </div>
    </div>
  );

  // Đang làm quiz
  const q = questions[current];
  return (
    <div className="max-w-md mx-auto px-4 py-3">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-base font-bold text-gray-800">✏️ Quiz</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">Điểm: <strong className="text-blue-600">{score}</strong></span>
          <button onClick={() => setQuestions([])} className="text-xs text-gray-400 hover:text-gray-600">✕ Thoát</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <QuizQuestion
          question={q.word} options={q.options} correct={q.word.meaning}
          onAnswer={handleAnswer} questionNum={current + 1} total={questions.length}
        />
        {canNext && (
          <button onClick={nextQuestion}
            className="mt-3 w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors fade-in text-sm">
            {current + 1 >= questions.length ? '🎉 Xem kết quả' : 'Câu tiếp theo →'}
          </button>
        )}
      </div>
    </div>
  );
}
