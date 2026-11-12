import { isValidScore } from "./score";
import type { ScoreTransferEvent } from "./score-transfer-history";
import { sameScoreStudent, type ImportScoreType, type ScoreSourceExam } from "./exam-score-import";

export type ExamScoreRow = { id: string; name: string; cccd: string; dob: string; khoi: string; lop: string; mon: string } & Record<string, string>;
export type ExamColumnSource = { source: ScoreSourceExam; scoreDate: string; transfers?: ScoreTransferEvent[] };
export function examColumnType(key: string): ImportScoreType {
  return key.startsWith("gk1") ? "gk1" : key === "ck1" ? "ck1" : key === "gk2" ? "gk2" : "ck2";
}
export function initialExamColumnSources(rows: ExamScoreRow[], columns: { key: string; label: string; sub?: string }[]): Record<string, ExamColumnSource> {
  return Object.fromEntries(columns.map((column, index) => {
    const date = ["20/10/2026", "23/10/2026", "25/12/2026", "19/03/2027", "20/05/2027"][index] ?? "20/10/2026";
    return [column.key, { scoreDate: date, source: {
      id: `seed-exam-${column.key}`, kind: "ky-thi", examType: "official", level: "truong", name: `Kỳ thi ${column.label.replace("Điểm ", "")}${column.sub ? ` ${column.sub}` : ""} cấp trường`, date,
      participantCount: rows.filter((row) => row[column.key] !== "").length,
      students: rows.map((row) => ({ ...row, score: row[column.key] ?? "" })),
    } }];
  }));
}
export function replaceExamColumnSource(rows: ExamScoreRow[], key: string, source: ScoreSourceExam, locked: ReadonlySet<string>, canEdit: boolean) {
  if (!canEdit) throw new Error("Chỉ Ban giám hiệu được đổi nguồn điểm.");
  if (locked.has(key)) throw new Error("Mở khóa cột điểm trước khi đổi nguồn.");
  if (source.kind !== "ky-thi") throw new Error("Chỉ được lấy điểm từ kỳ thi.");
  if (source.students.some((student) => !isValidScore(student.score))) throw new Error("Nguồn có điểm không hợp lệ.");
  const next = rows.map((row) => ({ ...row, [key]: source.students.find((student) => sameScoreStudent(row, student))?.score ?? "" }));
  for (const student of source.students) {
    if (next.some((row) => sameScoreStudent(row, student))) continue;
    next.push({ id: `${source.id}-${student.cccd}-${next.length}`, name: student.name, cccd: student.cccd, dob: student.dob, khoi: student.khoi, lop: student.lop, mon: student.mon, [key]: student.score });
  }
  return next;
}