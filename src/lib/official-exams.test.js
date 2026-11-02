import { describe, test, expect } from "bun:test";
import { approvalForCreator, canCreateOfficial, canSeeOfficial, canActOnShift, validateOfficialExam } from "./official-exams";

const shift = { id: "shift-1", code: "CA01", name: "Ca 1", start: "2026-11-05T07:30", end: "2026-11-05T08:15", closeAt: "2026-11-05T08:00", studentIds: ["hs1"], paperIds: ["p1"], graders: ["GV được giao"], supervisors: ["GV được giao"] };
const exam = { id: "test", name: "Kỳ thi kiểm tra", grade: "4", subject: "Toán", chapter: "", level: "truong", approval: "approved", phase: "upcoming", creator: "principal", shiftMode: "single", start: shift.start, end: shift.end, duration: 45, maxScore: 10, scoreType: "Không lấy điểm", limitStudents: true, students: [{ id: "hs1" }], papers: [{ id: "p1", code: "001001", variants: ["001002"] }], shifts: [shift] };

describe("official exam requirements", () => {
  test("BGH-created exams do not require approval", () => expect(approvalForCreator("principal")).toBe("approved"));
  test("department head/deputy exams require BGH approval", () => expect(approvalForCreator("leader")).toBe("pending"));
  test("teachers cannot create official exams", () => expect(canCreateOfficial("teacher")).toBe(false));
  test("teachers see approved exams before their start", () => expect(canSeeOfficial(exam, "teacher")).toBe(true));
  test("teachers cannot see pending exams", () => expect(canSeeOfficial({ ...exam, approval: "pending" }, "teacher")).toBe(false));
  test("teachers grade only assigned sessions", () => {
    expect(canActOnShift(exam, shift, "teacher", "GV được giao", "grade")).toBe(true);
    expect(canActOnShift(exam, shift, "teacher", "GV khác", "grade")).toBe(false);
  });
  test("teachers monitor only assigned sessions", () => {
    expect(canActOnShift(exam, shift, "teacher", "GV được giao", "monitor")).toBe(true);
    expect(canActOnShift(exam, shift, "teacher", "GV khác", "monitor")).toBe(false);
  });
  test("one-session exams contain exactly one valid session", () => {
    expect(validateOfficialExam(exam)).toBe("");
    expect(validateOfficialExam({ ...exam, shifts: [] })).not.toBe("");
  });
  test("multiple-session exams need at least two sessions", () => {
    expect(validateOfficialExam({ ...exam, shiftMode: "multi" })).not.toBe("");
    expect(validateOfficialExam({ ...exam, shiftMode: "multi", shifts: [shift, { ...shift, id: "shift-2", code: "CA02", studentIds: [], start: "2026-11-05T09:00", end: "2026-11-05T09:45", closeAt: "" }] })).toBe("");
  });
  test("a candidate cannot be assigned to multiple sessions", () => {
    expect(validateOfficialExam({ ...exam, shiftMode: "multi", shifts: [shift, { ...shift, id: "shift-2", code: "CA02" }] })).toBe("Một thí sinh không được xếp vào nhiều ca thi.");
  });
});