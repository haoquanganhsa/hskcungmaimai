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
  const [level, setLevel] = useState('Tất cả');
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [done, setDone] = useState(false);
  const [history, setHistory] = useState([]);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    setHistory(JSON.parse(localStorage.getItem('quizHistory') || '[]'));
  }, []);

  const pool = level === 'Tất cả' ? allWords : allWords.filter(w => w.level === level);

  const startQuiz = () => {
    const q = shuffle(pool).slice(0, Math.min(QUIZ_LENGTH, pool.length)).map(w => ({
      word: w,
      options: getOptions(w, pool),
    }));
    setQuestions(q); setCurrent(0); setScore(0); setDone(false); setAnswered(false); setCanNext(false);
  };

  const handleAnswer = (isCorrect) => {
    if (isCorrect) setScore(s => s + 1);
    setAnswered(true); setCanNext(true);
  };

  const nextQuestion = () => {
    if (current + 1 >= questions.length) {
      const newScore = score + (answered ? 0 : 0);
      const record = { date: new Date().toLocaleDateString('vi'), score, total: questions.length, level };
      const hist = [record, ...history].slice(0, 20);
      localStorage.setItem('quizHistory', JSON.stringify(hist));
      setHistory(hist);
      setDone(true);
    } else {
      setCurrent(c => c + 1); setAnswered(false); setCanNext(false);
    }
  };

  const grade = score / questions.length;
  const gradeLabel = grade >= 0.8 ? ['🏆 Xuất sắc!', 'text-green-600'] : grade >= 0.6 ? ['👍 Khá tốt!', 'text-blue-600'] : ['📚 Cần ôn thêm', 'text-orange-600'];

  if (!questions.length) return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-4">✏️</div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz trắc nghiệm</h1>
      <p className="text-gray-500 mb-8">{QUIZ_LENGTH} câu · Chọn nghĩa tiếng Việt đúng của chữ Hán</p>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <p className="text-sm font-semibold text-gray-600 mb-3">Chọn cấp độ:</p>
        <div className="flex justify-center gap-3">
          {['Tất cả', 'HSK1', 'HSK2'].map(l => (
            <button key={l} onClick={() => setLevel(l)}
              className={`px-6 py-2.5 rounded-xl font-medium border-2 transition-all
                ${level === l ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <button onClick={startQuiz}
        className="w-full py-4 bg-blue-600 text-white font-bold text-lg rounded-xl hover:bg-blue-700 transition-colors shadow-sm pulse">
        🚀 Bắt đầu Quiz
      </button>

      {history.length > 0 && (
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-5 text-left">
          <h3 className="font-semibold text-gray-700 mb-3">📜 Lịch sử quiz gần đây</h3>
          <div className="space-y-2">
            {history.slice(0, 5).map((h, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
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

  if (done) return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center fade-in">
      <div className="text-7xl mb-4">{grade >= 0.8 ? '🏆' : grade >= 0.6 ? '😊' : '📚'}</div>
      <h2 className={`text-3xl font-bold mb-2 ${gradeLabel[1]}`}>{gradeLabel[0]}</h2>
      <p className="text-gray-500 mb-6">Quiz {level} hoàn thành</p>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="text-6xl font-bold text-blue-600 mb-2">{score}<span className="text-2xl text-gray-400">/{questions.length}</span></div>
        <div className="text-gray-500 mb-4">Số câu đúng</div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className="bg-blue-500 h-3 rounded-full transition-all" style={{ width: `${grade * 100}%` }} />
        </div>
        <p className="text-sm text-gray-400 mt-2">{Math.round(grade * 100)}% chính xác</p>
      </div>

      <div className="flex gap-3">
        <button onClick={startQuiz}
          className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
          🔄 Làm lại
        </button>
        <button onClick={() => { setQuestions([]); }}
          className="flex-1 py-3.5 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors">
          🏠 Menu
        </button>
      </div>
    </div>
  );

  const q = questions[current];
  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-800">✏️ Quiz</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Điểm: <strong className="text-blue-600">{score}</strong></span>
          <button onClick={() => setQuestions([])} className="text-sm text-gray-400 hover:text-gray-600">✕ Thoát</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <QuizQuestion
          question={q.word}
          options={q.options}
          correct={q.word.meaning}
          onAnswer={handleAnswer}
          questionNum={current + 1}
          total={questions.length}
        />

        {canNext && (
          <button onClick={nextQuestion}
            className="mt-5 w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors fade-in">
            {current + 1 >= questions.length ? '🎉 Xem kết quả' : 'Câu tiếp theo →'}
          </button>
        )}
      </div>
    </div>
  );
}
