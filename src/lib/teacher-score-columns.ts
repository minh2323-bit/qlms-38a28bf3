import { ASSESSMENT_COLUMNS, type AssessmentRow } from "./assessment-scores";
import { isValidScore } from "./score";
import type { ScoreTransferEvent } from "./score-transfer-history";
import { sameScoreStudent, type ScoreSourceExam } from "./exam-score-import";

export type TeacherScoreScope = { grade: string; klass: string; subject: string };
export type TeacherScoreSources = Record<string, Record<string, { source: ScoreSourceExam; scoreDate: string; transfers?: ScoreTransferEvent[] }>>;

// Seed provenance from the same literal mock scores, not from the picker's independent content scores.
export function initialTeacherScoreSources(rows: AssessmentRow[]): TeacherScoreSources {
  const sources: TeacherScoreSources = {};
  for (const row of rows) {
    const scopeKey = `${row.khoi}/${row.lop}/${row.mon}`;
    if (sources[scopeKey]) continue;
    const students = rows.filter((student) => inTeacherScope(student, { grade: row.khoi, klass: row.lop, subject: row.mon }));
    sources[scopeKey] = Object.fromEntries(ASSESSMENT_COLUMNS.map((column, index) => {
      const isExam = index >= 3;
      const date = ["12/09/2026", "20/09/2026", "25/09/2026", "30/10/2026", "06/11/2026"][index];
      return [column.key, {
        scoreDate: date,
        source: {
          id: `seed-${scopeKey}-${column.key}`, kind: isExam ? "ky-thi" : index === 0 ? "bai-tap" : "bai-kiem-tra", level: "truong",
          name: `${isExam ? index === 3 ? "Kỳ thi giữa học kỳ I" : "Kỳ thi cuối học kỳ I" : index === 0 ? "Bài tập đánh giá thường xuyên 1" : `Bài kiểm tra đánh giá thường xuyên ${index + 1}`} – ${row.mon} – Lớp ${row.lop}`,
          date, participantCount: students.length,
          students: students.map((student) => ({ ...student, score: student.scores[column.key] ?? "" })),
        },
      }];
    }));
  }
  return sources;
}
export function defaultTeacherScope(rows: AssessmentRow[]): TeacherScoreScope {
  const grade = [...new Set(rows.map((r) => r.khoi))].sort((a, b) => Number(a) - Number(b))[0] ?? "";
  const klass = [...new Set(rows.filter((r) => r.khoi === grade).map((r) => r.lop))].sort((a, b) => a.localeCompare(b, "vi", { numeric: true }))[0] ?? "";
  const subject = rows.find((r) => r.lop === klass)?.mon ?? "";
  return { grade, klass, subject };
}
export function transferProgress(rows: AssessmentRow[], key: string, transferredIds: string[]) {
  const withScore = rows.filter((r) => (r.scores[key] ?? "") !== "").length;
  const moved = Math.min(withScore, transferredIds.filter((id) => rows.some((r) => r.id === id)).length);
  return { moved, withScore };
}
export function showTransferTag(progress: { moved: number; withScore: number }) {
  return progress.moved >= 1;
}
export function inTeacherScope(row: { khoi: string; lop: string; mon: string }, scope: TeacherScoreScope) {
  return Boolean(scope.grade && scope.klass && scope.subject && row.khoi === scope.grade && row.lop === scope.klass && row.mon === scope.subject);
}
export function replaceTeacherScoreSource(rows: AssessmentRow[], key: string, source: ScoreSourceExam, scope: TeacherScoreScope, locked: ReadonlySet<string>) {
  if (locked.has(key)) throw new Error("Mở khóa cột điểm trước khi đổi nguồn.");
  if (source.students.some((s) => !isValidScore(s.score))) throw new Error("Nguồn có điểm không hợp lệ.");
  if (!source.students.some((s) => inTeacherScope(s, scope))) throw new Error("Nguồn không có học sinh thuộc Khối – Lớp – Môn đã chọn.");
  return rows.map((r) => inTeacherScope(r, scope) ? { ...r, scores: { ...r.scores, [key]: source.students.find((s) => sameScoreStudent(r, s))?.score ?? "" } } : r);
}