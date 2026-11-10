import { ASSESSMENT_ROWS } from "./assessment-scores";
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
export const SCORE_CONTENT_KINDS = [
  { value: "bai-tap", label: "Bài tập" },
  { value: "bai-kiem-tra", label: "Bài kiểm tra" },
  { value: "ky-thi", label: "Kỳ thi" },
] as const;
export type ScoreContentKind = typeof SCORE_CONTENT_KINDS[number]["value"];
export type ScoreSourceExam = { id: string; name: string; date: string; level: ExamLevel; kind: ScoreContentKind; participantCount: number; students: ImportStudent[] };
export type ImportedScoreColumn = { key: string; label: string; scoreType: ImportScoreType; examId: string; examName: string };

export function scoreSourceExams(official: OfficialExam[]): ScoreSourceExam[] {
  const school = official.filter((e) => e.approval === "approved").map((e) => {
    const session = OFFICIAL_SESSIONS.find((s) => `official-${s.id}` === e.id);
    const students = session?.schoolCandidates == null ? e.students : e.students.slice(0, session.schoolCandidates);
    return ({
    id: e.id, name: e.name, date: e.start.slice(0, 10).split("-").reverse().join("/"), level: e.level, kind: "ky-thi" as const,
    participantCount: students.length,
    students: students.map((s) => {
      const score = e.attempts[s.id]?.score;
      return { name: s.name, cccd: s.cccd, dob: s.dob, khoi: e.grade, lop: s.klass, mon: e.subject, score: score == null ? "" : String(score) };
    }),
  }); });
  const department = OFFICIAL_SESSIONS.filter((e) => e.level === "so" && e.approval === "approved").map((e) => {
    const candidates = getCandidates(e);
    return { id: `official-${e.id}`, name: e.name, date: e.date, level: e.level, kind: "ky-thi" as const, participantCount: candidates.length,
      students: candidates.map((s) => ({ name: s.name, cccd: s.cccd, dob: "", khoi: e.grade, lop: s.klass, mon: e.subject, score: s.finalScore == null ? "" : String(s.finalScore) })) };
  });
  return [...department, ...school];
}

const ASSESSMENT_CONTENTS = [
  { id: "bt-quy-dong", kind: "bai-tap", name: "Bài tập quy đồng mẫu số", date: "12/09/2026", mon: "Toán" },
  { id: "bt-doc-hieu", kind: "bai-tap", name: "Bài tập đọc hiểu: Câu chuyện bó đũa", date: "15/09/2026", mon: "Tiếng Việt" },
  { id: "bt-tu-vung", kind: "bai-tap", name: "Bài tập từ vựng: My Family", date: "18/09/2026", mon: "Tiếng Anh" },
  { id: "kt-15p-toan", kind: "bai-kiem-tra", name: "Bài kiểm tra 15 phút: Phép nhân", date: "20/09/2026", mon: "Toán" },
  { id: "kt-chinh-ta", kind: "bai-kiem-tra", name: "Bài kiểm tra chính tả: Tuần 6", date: "22/09/2026", mon: "Tiếng Việt" },
  { id: "kt-1tiet-anh", kind: "bai-kiem-tra", name: "Bài kiểm tra 1 tiết: Unit 3", date: "25/09/2026", mon: "Tiếng Anh" },
] as const;

export function scoreSourceAssessments(): ScoreSourceExam[] {
  return ASSESSMENT_CONTENTS.map((content, ci) => {
    const students = ASSESSMENT_ROWS.filter((r) => r.mon === content.mon).slice(0, 12)
      .map((r, i) => ({ name: r.name, cccd: r.cccd, dob: r.dob, khoi: r.khoi, lop: r.lop, mon: r.mon, score: i >= 10 ? "" : String(5 + ((i + ci) % 11) * 0.5) }));
    return { id: content.id, name: content.name, date: content.date, level: "truong" as const, kind: content.kind, participantCount: students.length, students };
  });
}

export function scoreSourceClasses(sources: ScoreSourceExam[], content: string) {
  return [...new Set(sources.filter((s) => s.kind === content).flatMap((s) => s.students.map((st) => st.lop)))].sort((a, b) => a.localeCompare(b, "vi"));
}

export function filterSourceExams(exams: ScoreSourceExam[], addedIds: string[], query: string, level: string, content = "all", klass = "all") {
  return exams.filter((e) => !addedIds.includes(e.id) && (content === "all" || e.kind === content) && (level === "all" || e.kind !== "ky-thi" || e.level === level)
    && (klass === "all" || e.kind === "ky-thi" || e.students.some((s) => s.lop === klass))
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