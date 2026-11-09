import { OFFICIAL_SESSIONS, getCandidates, type ExamLevel } from "./exam-sessions";
import type { OfficialExam } from "./official-exams";
import { isValidScore } from "./score";

export const IMPORT_SCORE_TYPES = [
  { value: "dgtx", label: "ĐGTX", column: "Điểm ĐGTX" },
  { value: "gk1", label: "ĐGGKI", column: "Điểm GKI" },
  { value: "ck1", label: "ĐGCKI", column: "Điểm CKI" },
  { value: "gk2", label: "ĐGGKII", column: "Điểm GKII" },
  { value: "ck2", label: "ĐGCKII", column: "Điểm CKII" },
] as const;
export type ImportScoreType = typeof IMPORT_SCORE_TYPES[number]["value"];
export type ImportStudent = { name: string; cccd: string; dob: string; khoi: string; lop: string; mon: string; score: string };
export type ScoreSourceExam = { id: string; name: string; date: string; level: ExamLevel; participantCount: number; students: ImportStudent[] };
export type ImportedScoreColumn = { key: string; label: string; scoreType: ImportScoreType; examId: string; examName: string };

export function scoreSourceExams(official: OfficialExam[]): ScoreSourceExam[] {
  const school = official.filter((e) => e.approval === "approved").map((e) => {
    const session = OFFICIAL_SESSIONS.find((s) => `official-${s.id}` === e.id);
    const students = session?.schoolCandidates == null ? e.students : e.students.slice(0, session.schoolCandidates);
    return ({
    id: e.id, name: e.name, date: e.start.slice(0, 10).split("-").reverse().join("/"), level: e.level,
    participantCount: students.length,
    students: students.map((s) => {
      const score = e.attempts[s.id]?.score;
      return { name: s.name, cccd: s.cccd, dob: s.dob, khoi: e.grade, lop: s.klass, mon: e.subject, score: score == null ? "" : String(score) };
    }),
  }); });
  const department = OFFICIAL_SESSIONS.filter((e) => e.level === "so" && e.approval === "approved").map((e) => {
    const candidates = getCandidates(e);
    return { id: `official-${e.id}`, name: e.name, date: e.date, level: e.level, participantCount: candidates.length,
      students: candidates.map((s) => ({ name: s.name, cccd: s.cccd, dob: "", khoi: e.grade, lop: s.klass, mon: e.subject, score: s.finalScore == null ? "" : String(s.finalScore) })) };
  });
  return [...department, ...school];
}

export function filterSourceExams(exams: ScoreSourceExam[], addedIds: string[], query: string, level: string) {
  return exams.filter((e) => !addedIds.includes(e.id) && (level === "all" || e.level === level)
    && e.name.toLocaleLowerCase("vi").includes(query.trim().toLocaleLowerCase("vi")));
}

export function importExamColumn(exam: ScoreSourceExam, scoreType: ImportScoreType, addedIds: string[]): ImportedScoreColumn {
  if (addedIds.includes(exam.id)) throw new Error("Kỳ thi đã được lấy điểm trong bảng.");
  const type = IMPORT_SCORE_TYPES.find((t) => t.value === scoreType);
  if (!type) throw new Error("Chọn loại điểm.");
  if (exam.students.some((s) => !isValidScore(s.score))) throw new Error("Kỳ thi có điểm ngoài thang 0–10 hoặc quá một chữ số thập phân.");
  return { key: `import-${exam.id}`, label: type.column, scoreType, examId: exam.id, examName: exam.name };
}

export function sameScoreStudent(row: { cccd: string; mon: string }, student: ImportStudent) {
  return Boolean(row.cccd && student.cccd && row.cccd === student.cccd && row.mon === student.mon);
}