// Mock store cho Khung ma trận đề.
export type MatrixGroup = string;

export type MatrixRow = {
  id: string;
  chapterId: string;
  chapterTitle: string;
  lessonId: string;
  lessonTitle: string;
  // counts[group][level] : level = 0 Biết, 1 Hiểu, 2 VD
  counts: Record<MatrixGroup, [number, number, number]>;
};

export type MatrixGroupDef = { key: MatrixGroup; label: string };

export const MATRIX_GROUPS: MatrixGroupDef[] = [
  { key: "tn", label: "Trắc nghiệm" },
  { key: "tnn", label: "Trắc nghiệm nhiều đáp án" },
  { key: "tl", label: "Tự luận" },
];

// Các dạng câu hỏi khác có thể bổ sung thành cột trong ma trận
// (đồng bộ với ngân hàng câu hỏi)
export const MATRIX_EXTRA_GROUPS: MatrixGroupDef[] = [
  { key: "dungsai", label: "Đúng - Sai" },
  { key: "dienkhuyet", label: "Điền khuyết" },
  { key: "noi", label: "Nối" },
  { key: "keotha", label: "Kéo thả" },
  { key: "sapxep", label: "Sắp xếp" },
  { key: "trloingan", label: "Trả lời ngắn" },
];

export const ALL_MATRIX_GROUPS: MatrixGroupDef[] = [...MATRIX_GROUPS, ...MATRIX_EXTRA_GROUPS];

export function groupLabel(key: MatrixGroup) {
  return ALL_MATRIX_GROUPS.find((g) => g.key === key)?.label ?? key;
}

export const MATRIX_LEVELS = ["Biết", "Hiểu", "VD"] as const;

export type ExamMatrix = {
  id: string;
  name: string;
  grade: string;
  subject: string;
  count: number;
  minutes: number;
  maxScore: number;
  type?: string;
  groups?: MatrixGroup[];
  rows: MatrixRow[];
};

export function emptyCounts(groups: MatrixGroup[] = MATRIX_GROUPS.map((g) => g.key)) {
  const out: Record<MatrixGroup, [number, number, number]> = {};
  groups.forEach((g) => { out[g] = [0, 0, 0]; });
  return out;
}

export function rowTotal(r: MatrixRow) {
  return Object.values(r.counts).reduce(
    (s, arr) => s + arr.reduce((a, b) => a + (b || 0), 0),
    0,
  );
}

export function matrixTotal(rows: MatrixRow[]) {
  return rows.reduce((s, r) => s + rowTotal(r), 0);
}


function seedRows(chapter: string, lessons: string[], base: number): MatrixRow[] {
  return lessons.map((title, i) => ({
    id: `seed-${base}-${i}`,
    chapterId: `seed-ch-${base}`,
    chapterTitle: chapter,
    lessonId: `seed-l-${base}-${i}`,
    lessonTitle: title,
    counts: {
      tn: [2 + (i % 2), 1, i % 2] as [number, number, number],
      tnn: [1, i % 2, 0] as [number, number, number],
      tl: [0, 1, 1] as [number, number, number],
    },
  }));
}

const SEED: ExamMatrix[] = [
  {
    id: "m1", name: "Ma trận cuối kỳ Toán 4", grade: "4", subject: "Toán",
    count: 20, minutes: 45, maxScore: 10, type: "chuong-bai",
    rows: seedRows("Chủ đề 1: Ôn tập và bổ sung", [
      "Bài 1: Ôn tập các số đến 100 000",
      "Bài 2: Ôn tập các phép tính trong phạm vi 100 000",
      "Bài 3: Số chẵn, số lẻ",
    ], 1),
  },
  {
    id: "m2", name: "Ma trận giữa kỳ Toán 3", grade: "3", subject: "Toán",
    count: 15, minutes: 40, maxScore: 10, type: "chuong-bai",
    rows: seedRows("Chủ đề 1: Ôn tập và bổ sung", [
      "Bài 1: Ôn tập các số đến 1 000",
      "Bài 2: Ôn tập phép cộng, phép trừ",
    ], 2),
  },
  {
    id: "m3", name: "Ma trận Tiếng Việt 4 - Đọc hiểu", grade: "4", subject: "Tiếng Việt",
    count: 12, minutes: 35, maxScore: 10, type: "chuong-bai",
    rows: seedRows("Chủ đề 1: Mỗi người một vẻ", [
      "Bài 1: Điều kì diệu",
      "Bài 2: Thi nhạc",
    ], 3),
  },
  {
    id: "m4", name: "Ma trận Khoa học 4", grade: "4", subject: "Khoa học",
    count: 18, minutes: 45, maxScore: 10, type: "chuong-bai",
    rows: seedRows("Chủ đề 1: Chất", [
      "Bài 1: Tính chất của nước",
      "Bài 2: Sự chuyển thể của nước",
    ], 4),
  },
];


let MATRICES: ExamMatrix[] = [...SEED];

export function listMatrices() {
  return MATRICES;
}

export function getMatrix(id: string) {
  return MATRICES.find((m) => m.id === id);
}

export function saveMatrix(m: Omit<ExamMatrix, "id"> & { id?: string }): ExamMatrix {
  const id = m.id ?? `m-${Date.now()}`;
  const next: ExamMatrix = { ...m, id };
  MATRICES = [next, ...MATRICES.filter((x) => x.id !== id)];
  return next;
}
