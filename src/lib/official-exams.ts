import { useSyncExternalStore } from "react";
import { OFFICIAL_SESSIONS, getCandidates, getPermutedPaper } from "./exam-sessions";
import type { DemoAccount } from "./demo-account";

export type ExamPerson = { id: string; name: string; klass: string; cccd: string; dob: string };
export type ExamPaper = { id: string; name: string; grade: string; subject: string; code: string; variants: string[]; questions: { text: string; type: string; score: number; answer: string }[] };
export type ExamShift = { id: string; code: string; name: string; start: string; end: string; closeAt: string; studentIds: string[]; paperIds: string[]; supervisors: string[]; graders: string[] };
export type OfficialExam = {
  id: string; name: string; grade: string; subject: string; chapter: string;
  level: "truong" | "xa"; approval: "approved" | "pending";
  phase: "upcoming" | "ongoing" | "done"; creator: DemoAccount;
  shiftMode: "single" | "multi"; start: string; end: string; closeAt: string;
  duration: number; maxScore: number; scoreType: string; limitStudents: boolean;
  showScore: boolean; showAnswers: boolean; showWork: boolean; showNames: boolean;
  students: ExamPerson[]; papers: ExamPaper[]; shifts: ExamShift[];
  graders: string[]; supervisors: string[];
  attempts: Record<string, { score: number | null; violations: string[]; retake: boolean; submitted: boolean }>;
  seeded?: boolean;
};

export const EXAM_TEACHERS = ["G/v Phùng Thúy Hằng", "Cô Lê Thị Mai", "Thầy Trần Minh Quân", "Thầy Phạm Quốc Anh", "Tổ trưởng Nguyễn Minh Khang", "H/t Nguyễn Thị Mai Lan"];
export const EXAM_STUDENTS: ExamPerson[] = [
  { id: "hs1", name: "Nguyễn Hải An", klass: "4A", cccd: "0123456783", dob: "15/03/2016" },
  { id: "hs2", name: "Mai Thị Huyền", klass: "4A", cccd: "0365427720", dob: "02/07/2016" },
  { id: "hs3", name: "Trần Gia Bảo", klass: "4B", cccd: "0123456787", dob: "21/11/2016" },
  { id: "hs4", name: "Đỗ Thanh Vân", klass: "4B", cccd: "0348844088", dob: "08/05/2016" },
  { id: "hs5", name: "Vũ Huy Hoàng", klass: "4C", cccd: "0335773123", dob: "30/09/2016" },
  { id: "hs6", name: "Phạm Tất Thắng", klass: "4C", cccd: "0912125548", dob: "12/12/2016" },
  { id: "hs7", name: "Lê Khánh Linh", klass: "3A", cccd: "0771233456", dob: "19/01/2017" },
  { id: "hs8", name: "Bùi Minh Quân", klass: "3B", cccd: "0668121999", dob: "27/04/2017" },
  { id: "hs9", name: "Ngô Phương Mai", klass: "5A", cccd: "0559120034", dob: "05/08/2015" },
  { id: "hs10", name: "Đặng Nam Phúc", klass: "5B", cccd: "0442988177", dob: "14/10/2015" },
];

function localTime(date: string, time: string) {
  const [d, m, y] = date.split("/");
  return `${y}-${m}-${d}T${time.trim()}`;
}

export const EXAM_PAPER_LIBRARY: ExamPaper[] = [
  ["p1", "Đề thi cuối kỳ I – Toán 4", "4", "Toán"],
  ["p2", "Đề thi giữa kỳ – Tiếng Việt 4", "4", "Tiếng Việt"],
  ["p3", "Đề khảo sát chất lượng đầu năm – Toán 3", "3", "Toán"],
  ["p4", "Đề thi học sinh giỏi – Tiếng Anh 5", "5", "Tiếng Anh"],
  ["p5", "Đề thi cuối kỳ II – Toán 4", "4", "Toán"],
].map(([id, name, grade, subject]) => ({
  id, name, grade, subject, code: "", variants: [],
  questions: getPermutedPaper({ ...OFFICIAL_SESSIONS[0], id, grade, subject }, "001").questions,
}));

let exams: OfficialExam[] = OFFICIAL_SESSIONS.filter((e) => e.level !== "so").map((e) => {
  const times = e.timeRange.split(" – ");
  const students = getCandidates(e).map((s, i) => ({ id: `${e.id}-hs${i}`, name: s.name, klass: s.klass, cccd: s.cccd, dob: "15/03/2016" }));
  const papers = Array.from({ length: e.originalCount }, (_, i) => ({
    id: `${e.id}-p${i}`, name: `Đề gốc số ${i + 1} – ${e.subject} khối ${e.grade}`, grade: e.grade, subject: e.subject,
    code: `${e.id.toUpperCase()}${i + 1}001`, variants: e.permutedCodes.filter((_, j) => j % e.originalCount === i),
    questions: getPermutedPaper(e, e.permutedCodes[i] ?? "001").questions,
  }));
  const graders = EXAM_TEACHERS.slice(0, 3);
  const supervisors = EXAM_TEACHERS.slice(0, 4);
  const shifts = (e.shifts ?? [{ name: "Ca 1", start: times[0], end: times[1] }]).map((s, i, arr) => ({
    id: `${e.id}-ca${i + 1}`, code: `CA${i + 1}`, name: s.name,
    start: localTime(e.date, s.start), end: localTime(e.date, s.end), closeAt: localTime(e.date, s.end),
    studentIds: students.filter((_, j) => j % arr.length === i).map((s) => s.id),
    paperIds: papers.map((p) => p.id), graders, supervisors,
  }));
  return {
    id: `official-${e.id}`, name: e.name, grade: e.grade, subject: e.subject, chapter: e.chapter,
    level: e.level as "truong" | "xa", approval: e.approval, phase: e.effect, creator: "leader",
    shiftMode: shifts.length > 1 ? "multi" : "single", start: shifts[0]?.start ?? "", end: shifts.at(-1)?.end ?? "",
    closeAt: shifts.at(-1)?.end ?? "", duration: e.minutes, maxScore: 10, scoreType: "Không lấy điểm",
    limitStudents: true, showScore: true, showAnswers: false, showWork: false, showNames: true,
    students, papers, shifts, graders, supervisors, seeded: true,
    attempts: Object.fromEntries(getCandidates(e).map((s, i) => [students[i].id, {
      score: s.finalScore, violations: Array.from({ length: s.violations }, () => "Vi phạm quy chế"),
      retake: false, submitted: s.status === "submitted",
    }])),
  };
});
const listeners = new Set<() => void>();
export function useOfficialExams() {
  return useSyncExternalStore((listener) => {
    listeners.add(listener); return () => { listeners.delete(listener); };
  }, () => exams, () => exams);
}
export function canCreateOfficial(role: DemoAccount) { return role === "principal" || role === "leader"; }
export function approvalForCreator(role: DemoAccount): OfficialExam["approval"] {
  if (!canCreateOfficial(role)) throw new Error("Tài khoản không có quyền tạo kỳ thi.");
  return role === "principal" ? "approved" : "pending";
}
export function canSeeOfficial(exam: OfficialExam, role: DemoAccount) {
  return exam.approval === "approved" || canCreateOfficial(role);
}
export function canManageOfficial(exam: OfficialExam, role: DemoAccount) {
  return role === "principal" || (role === "leader" && exam.creator === "leader" && exam.approval === "pending" && examPhase(exam) === "upcoming");
}
export function canActOnShift(exam: OfficialExam, shift: ExamShift, role: DemoAccount, name: string, action: "grade" | "monitor") {
  if (exam.approval !== "approved") return false;
  if (role === "principal" || role === "leader") return true;
  return (action === "grade" ? shift.graders : shift.supervisors).includes(name);
}
export function examPhase(exam: OfficialExam, now = new Date()): OfficialExam["phase"] {
  if (exam.seeded) return exam.phase;
  const start = new Date(exam.start).getTime(), end = new Date(exam.end).getTime();
  return now.getTime() < start ? "upcoming" : now.getTime() > end ? "done" : "ongoing";
}
export function validateOfficialExam(exam: OfficialExam): string {
  if (!exam.name.trim() || !exam.grade || !exam.subject || !exam.scoreType) return "Điền đầy đủ thông tin kỳ thi.";
  if (!Number.isFinite(exam.duration) || exam.duration <= 0 || ![10, 100].includes(exam.maxScore)) return "Thời gian làm bài và thang điểm không hợp lệ.";
  if (!exam.papers.length || exam.papers.some((p) => !p.code.trim() || !p.variants.length)) return "Chọn đề thi và sinh ít nhất một mã hoán vị cho từng đề.";
  const codes = exam.papers.flatMap((p) => [p.code, ...p.variants]);
  if (new Set(codes).size !== codes.length) return "Mã đề bị trùng.";
  if (exam.limitStudents && !exam.students.length) return "Chọn ít nhất một thí sinh.";
  if (exam.shiftMode === "single" && exam.shifts.length !== 1) return "Kỳ thi một ca phải có đúng một ca thi.";
  if (exam.shiftMode === "multi" && exam.shifts.length < 2) return "Kỳ thi nhiều ca cần ít nhất hai ca thi.";
  const assigned = exam.shifts.flatMap((s) => s.studentIds);
  if (new Set(assigned).size !== assigned.length) return "Một thí sinh không được xếp vào nhiều ca thi.";
  if (exam.limitStudents && exam.students.some((s) => !assigned.includes(s.id))) return "Còn thí sinh chưa được xếp ca.";
  const shiftCodes = exam.shifts.map((s) => s.code.trim());
  if (new Set(shiftCodes).size !== shiftCodes.length) return "Mã ca thi bị trùng.";
  for (const s of exam.shifts) {
    if (!s.name.trim() || !s.code.trim() || !s.start || !s.end || !Number.isFinite(Date.parse(s.start)) || !Number.isFinite(Date.parse(s.end)) || s.end <= s.start) return "Ca thi phải có tên, mã và thời gian kết thúc sau bắt đầu.";
    if (s.closeAt && (s.closeAt < s.start || s.closeAt > s.end)) return "Thời gian đóng đề phải nằm trong thời gian ca thi.";
    if (!s.paperIds.length || s.paperIds.some((id) => !exam.papers.some((p) => p.id === id))) return "Chọn đề thi sử dụng cho từng ca.";
    if (s.studentIds.some((id) => !exam.students.some((p) => p.id === id))) return "Thí sinh của ca phải thuộc kỳ thi.";
  }
  return "";
}
export function saveOfficialExam(exam: OfficialExam, role: DemoAccount) {
  const current = exams.find((e) => e.id === exam.id);
  if (current ? !canManageOfficial(current, role) : !canCreateOfficial(role)) throw new Error("Không có quyền quản lý kỳ thi.");
  if (current && examPhase(current) !== "upcoming") throw new Error("Không thể thay đổi cấu hình kỳ thi đã bắt đầu.");
  const error = validateOfficialExam(exam); if (error) throw new Error(error);
  const next = { ...exam, approval: current?.approval ?? approvalForCreator(role), creator: current?.creator ?? role };
  exams = current ? exams.map((e) => e.id === next.id ? next : e) : [next, ...exams];
  listeners.forEach((l) => l()); return next;
}
export function changeOfficialApproval(ids: string[], approval: OfficialExam["approval"], role: DemoAccount) {
  if (role !== "principal") throw new Error("Chỉ BGH được duyệt hoặc hủy duyệt kỳ thi.");
  if (exams.some((e) => ids.includes(e.id) && examPhase(e) !== "upcoming")) throw new Error("Chỉ thay đổi duyệt trước khi kỳ thi bắt đầu.");
  exams = exams.map((e) => ids.includes(e.id) ? { ...e, approval } : e); listeners.forEach((l) => l());
}
export function deleteOfficialExams(ids: string[], role: DemoAccount) {
  if (exams.some((e) => ids.includes(e.id) && (!canManageOfficial(e, role) || examPhase(e) !== "upcoming"))) throw new Error("Không có quyền xóa kỳ thi này.");
  exams = exams.filter((e) => !ids.includes(e.id)); listeners.forEach((l) => l());
}
export function updateAttempt(examId: string, shiftId: string, studentId: string, role: DemoAccount, name: string, action: "grade" | "violation" | "retake", value: number | string) {
  const exam = exams.find((e) => e.id === examId), shift = exam?.shifts.find((s) => s.id === shiftId);
  if (!exam || !shift || !shift.studentIds.includes(studentId) || !canActOnShift(exam, shift, role, name, action === "grade" ? "grade" : "monitor")) throw new Error("Bạn chưa được phân công cho ca thi này.");
  if (action !== "grade" && examPhase(exam) !== "ongoing") throw new Error("Chỉ thao tác giám sát khi kỳ thi đang diễn ra.");
  const old = exam.attempts[studentId] ?? { score: null, violations: [], retake: false, submitted: false };
  if (action === "grade" && (!old.submitted || !Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > exam.maxScore)) throw new Error("Bài chưa nộp hoặc điểm không hợp lệ.");
  const next = action === "grade" ? { ...old, score: Number(value) } : action === "violation" ? { ...old, violations: [...old.violations, String(value)] } : { ...old, retake: true };
  exams = exams.map((e) => e.id === examId ? { ...e, attempts: { ...e.attempts, [studentId]: next } } : e); listeners.forEach((l) => l());
}