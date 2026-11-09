import { SCORE_SUBJECTS, filterScoreSubjects } from "./score-subjects";

export const ASSESSMENT_COLUMNS = [1, 2, 3, 4, 5].map((n) => ({ key: `dgtx${n}`, label: n === 4 ? "Điểm GKI" : n === 5 ? "Điểm CKI" : `Điểm ĐGTX ${n}` }));
export const ASSESSMENT_CLASSES = ["3A", "3B", "4A", "4B", "5A", "5B"];
export type AssessmentRow = { id: string; name: string; cccd: string; dob: string; khoi: string; lop: string; mon: string; scores: Record<string, string> };
const names = ["Nguyễn Minh Anh", "Trần Gia Bảo", "Lê Khánh Chi", "Phạm Đức Duy", "Hoàng Thu Hà", "Vũ Quang Huy"];
export const ASSESSMENT_ROWS: AssessmentRow[] = ASSESSMENT_CLASSES.flatMap((lop, ci) => names.map((name, i) => ({
  id: `${lop}-${i}`, name, cccd: `0012190${String(10000 + ci * 100 + i * 37)}`,
  dob: `${String(i * 4 + 1).padStart(2, "0")}/${String(ci + 1).padStart(2, "0")}/${2019 - (Number(lop[0]) - 3)}`,
  khoi: lop[0], lop, mon: SCORE_SUBJECTS[(ci + i) % SCORE_SUBJECTS.length],
  scores: Object.fromEntries(ASSESSMENT_COLUMNS.map((c, j) => [c.key, j === 4 && i % 2 === 0 ? "" : String(6 + ((i + ci + j) % 9) * 0.5)])),
})));
export function filterAssessmentRows(rows: AssessmentRow[], query: string, grades: string[], classes: string[], subjects: readonly string[] = SCORE_SUBJECTS) {
  return filterScoreSubjects(rows, subjects).filter((r) => r.name.toLocaleLowerCase("vi").includes(query.trim().toLocaleLowerCase("vi"))
    && (grades.length === 0 || grades.includes(r.khoi)) && (classes.length === 0 || classes.includes(r.lop)));
}