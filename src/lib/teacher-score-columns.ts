import type { AssessmentRow } from "./assessment-scores";
import { isValidScore } from "./score";
import { sameScoreStudent, type ScoreSourceExam } from "./exam-score-import";

export type TeacherScoreScope = { grade: string; klass: string; subject: string };
export function defaultTeacherScope(rows: AssessmentRow[]): TeacherScoreScope {
  const grade = [...new Set(rows.map((r) => r.khoi))].sort((a, b) => Number(a) - Number(b))[0] ?? "";
  const klass = [...new Set(rows.filter((r) => r.khoi === grade).map((r) => r.lop))].sort((a, b) => a.localeCompare(b, "vi", { numeric: true }))[0] ?? "";
  const subject = rows.find((r) => r.lop === klass)?.mon ?? "";
  return { grade, klass, subject };
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