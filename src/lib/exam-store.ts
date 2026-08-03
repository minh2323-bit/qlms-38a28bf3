// Mock store cho Đề kiểm tra (dùng chung giữa danh sách và trang chi tiết đề).
export type ExamKind = "manual" | "matrix";
export type ExamShareStatus = "" | "pending" | "approved";

export type ExamQuestion = {
  id: string;
  stem: string;
  opts: string[];
  correct: number;
  level: "Nhận biết" | "Thông hiểu" | "Vận dụng";
  type: string;
  lessonTitle: string;
  score: number;
};

export type TestItem = {
  id: string;
  name: string;
  grade: string;
  subject: string;
  chapterId?: string;
  lessonId?: string;
  kind: ExamKind;
  duration: number;
  questions: number;
  maxScore: number;
  share: ExamShareStatus;
  /** Chỉ có với đề sinh từ khung ma trận */
  matrixId?: string;
};

export const TEST_SEED: TestItem[] = [
  { id: "e1", name: "Kiểm tra giữa kỳ – Cộng trừ phân số", grade: "4", subject: "Toán", kind: "matrix", duration: 45, questions: 20, maxScore: 10, share: "approved", matrixId: "m1" },
  { id: "e2", name: "Kiểm tra 15 phút – Số tự nhiên", grade: "4", subject: "Toán", kind: "manual", duration: 15, questions: 10, maxScore: 10, share: "pending" },
  { id: "e3", name: "Kiểm tra đọc hiểu – Cây bàng", grade: "4", subject: "Tiếng Việt", kind: "manual", duration: 30, questions: 12, maxScore: 10, share: "" },
  { id: "e4", name: "Kiểm tra cuối kỳ – Toán 3", grade: "3", subject: "Toán", kind: "matrix", duration: 60, questions: 25, maxScore: 10, share: "", matrixId: "m2" },
  { id: "e5", name: "Đề luyện – Hình học lớp 4", grade: "4", subject: "Toán", kind: "matrix", duration: 45, questions: 18, maxScore: 10, share: "approved", matrixId: "m1" },
];

let TESTS: TestItem[] = [...TEST_SEED];

export function listTests() {
  return TESTS;
}

export function getTest(id: string) {
  return TESTS.find((t) => t.id === id);
}

export function saveTest(t: TestItem) {
  TESTS = [t, ...TESTS.filter((x) => x.id !== t.id)];
  return t;
}

export function updateTest(id: string, patch: Partial<TestItem>) {
  TESTS = TESTS.map((t) => (t.id === id ? { ...t, ...patch } : t));
  return getTest(id);
}

const BANK: Omit<ExamQuestion, "id" | "level" | "lessonTitle" | "score">[] = [
  {
    stem: "Kết quả của phép tính 1/2 + 1/3 là",
    opts: ["2/5", "5/6", "1/6", "3/5"], correct: 1, type: "Trắc nghiệm 1 đáp án",
  },
  {
    stem: "Số liền sau của số 99 999 là số nào?",
    opts: ["99 998", "100 000", "99 990", "100 001"], correct: 1, type: "Trắc nghiệm 1 đáp án",
  },
  {
    stem: "Kết quả của phép tính 3 200 + 4 500 là",
    opts: ["7 700", "7 600", "8 700", "6 700"], correct: 0, type: "Trắc nghiệm 1 đáp án",
  },
  {
    stem: "Trong các số sau, số nào là số chẵn?",
    opts: ["1 235", "4 671", "8 904", "7 777"], correct: 2, type: "Trắc nghiệm 1 đáp án",
  },
  {
    stem: "Phân số 6/8 rút gọn thành",
    opts: ["3/4", "2/3", "4/6", "1/2"], correct: 0, type: "Trắc nghiệm 1 đáp án",
  },
  {
    stem: "Giá trị của biểu thức 120 : 4 + 15 là",
    opts: ["45", "30", "50", "35"], correct: 0, type: "Trắc nghiệm 1 đáp án",
  },
];

const LESSONS = [
  "Bài 1: Ôn tập các số đến 100 000",
  "Bài 2: Ôn tập các phép tính",
  "Bài 3: Phân số",
  "Bài 4: Biểu thức số",
];

const LEVELS = ["Nhận biết", "Thông hiểu", "Vận dụng"] as const;

/** Sinh danh sách câu hỏi mock cho một đề. */
export function getTestQuestions(t: TestItem): ExamQuestion[] {
  const n = t.questions || 10;
  const score = Math.round((t.maxScore / n) * 100) / 100;
  return Array.from({ length: n }, (_, i) => {
    const b = BANK[i % BANK.length];
    return {
      id: `${t.id}-q${i + 1}`,
      stem: b.stem,
      opts: b.opts,
      correct: b.correct,
      type: b.type,
      level: LEVELS[i < n * 0.4 ? 0 : i < n * 0.8 ? 1 : 2],
      lessonTitle: LESSONS[i % LESSONS.length],
      score,
    };
  });
}
