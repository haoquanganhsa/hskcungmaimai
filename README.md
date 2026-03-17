# 汉语学习 - HSK Learning App

Website học tiếng Trung HSK1 & HSK2 cho người Việt, xây dựng với **Next.js** + **TailwindCSS**.

## Cấu trúc dự án

```
hsk-app/
├── pages/
│   ├── _app.js          # App wrapper + Layout
│   ├── index.js         # Trang chủ
│   ├── vocabulary.js    # Thư viện từ vựng + Flashcard
│   ├── quiz.js          # Bài tập trắc nghiệm
│   ├── listening.js     # Luyện nghe hội thoại
│   ├── writing.js       # Luyện viết chữ Hán
│   └── speaking.js      # Luyện nói
│   └── progress.js      # Dashboard tiến độ
├── components/
│   ├── Navbar.js        # Navigation bar
│   ├── Flashcard.js     # Component thẻ từ vựng
│   ├── QuizQuestion.js  # Component câu hỏi quiz
│   └── AudioPlayer.js   # Component phát âm hội thoại
├── data/
│   ├── HSK1.json        # 30 từ vựng HSK1
│   ├── HSK2.json        # 30 từ vựng HSK2
│   └── dialogues.json   # 4 đoạn hội thoại
└── styles/
    └── globals.css      # Global styles + animations
```

## Cài đặt và chạy

```bash
# 1. Cài dependencies
npm install

# 2. Chạy development server
npm run dev

# 3. Mở trình duyệt tại
http://localhost:3000
```

## Tính năng

| Tính năng | Trang | Mô tả |
|-----------|-------|--------|
| 📚 Flashcard | /vocabulary | Thẻ lật có chữ Hán, pinyin, nghĩa, ví dụ |
| 🔊 Phát âm | /vocabulary | Web Speech API (TTS tiếng Trung) |
| ✏️ Quiz MCQ | /quiz | 10 câu trắc nghiệm, tính điểm |
| 🎧 Luyện nghe | /listening | 4 hội thoại HSK1-2, phụ đề Việt |
| 🖊️ Luyện viết | /writing | Gõ chữ Hán, kiểm tra đúng/sai |
| 📊 Tiến độ | /progress | Dashboard: từ đã học, điểm quiz, streak |

## Dữ liệu lưu trữ

Tất cả được lưu trong **localStorage**:
- `learned`: mảng ID các từ đã học
- `quizHistory`: lịch sử các lần làm quiz
- `streak`: số ngày học liên tiếp
- `lastStudy`: ngày học gần nhất

## Mở rộng thêm

- Thêm từ vựng: chỉnh sửa `data/HSK1.json` và `data/HSK2.json`
- Thêm hội thoại: chỉnh sửa `data/dialogues.json`
- Kết nối Firebase: thay `localStorage` bằng Firestore
- Thêm HSK3-6: tạo thêm file `HSK3.json`, `HSK4.json`...
