// Mock store cho Khung ma trận đề.
export type MatrixRow = {
  id: string;
  chapterId: string;
  chapterTitle: string;
  lessonId: string;
  lessonTitle: string;
  // counts[group][level] : group = tn | tnn | tl ; level = 0 Biết, 1 Hiểu, 2 VD
  counts: Record<MatrixGroup, [number, number, number]>;
};

export type MatrixGroup = "tn" | "tnn" | "tl";

export const MATRIX_GROUPS: { key: MatrixGroup; label: string }[] = [
  { key: "tn", label: "Trắc nghiệm" },
  { key: "tnn", label: "Trắc nghiệm nhiều đáp án" },
  { key: "tl", label: "Tự luận" },
];

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
  rows: MatrixRow[];
};

export function emptyCounts(): Record<MatrixGroup, [number, number, number]> {
  return { tn: [0, 0, 0], tnn: [0, 0, 0], tl: [0, 0, 0] };
}

export function rowTotal(r: MatrixRow) {
  return MATRIX_GROUPS.reduce(
    (s, g) => s + r.counts[g.key].reduce((a, b) => a + (b || 0), 0),
    0,
  );
}

export function matrixTotal(rows: MatrixRow[]) {
  return rows.reduce((s, r) => s + rowTotal(r), 0);
}

const SEED: ExamMatrix[] = [
  { id: "m1", name: "Ma trận cuối kỳ Toán 4", grade: "4", subject: "Toán", count: 20, minutes: 45, maxScore: 10, rows: [] },
  { id: "m2", name: "Ma trận giữa kỳ Toán 3", grade: "3", subject: "Toán", count: 15, minutes: 40, maxScore: 10, rows: [] },
  { id: "m3", name: "Ma trận Tiếng Việt 4 - Đọc hiểu", grade: "4", subject: "Tiếng Việt", count: 12, minutes: 35, maxScore: 10, rows: [] },
  { id: "m4", name: "Ma trận Khoa học 4", grade: "4", subject: "Khoa học", count: 18, minutes: 45, maxScore: 10, rows: [] },
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
