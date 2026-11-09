/// <reference types="bun" />
import { expect, test } from "bun:test";
import { filterSourceExams, importExamColumn, sameScoreStudent, type ScoreSourceExam } from "./exam-score-import";
const exam: ScoreSourceExam = { id: "xa-1", name: "Kỳ thi cấp Xã Toán", level: "xa", date: "09/11/2026", participantCount: 1, students: [{ name: "An", cccd: "123", dob: "", khoi: "4", lop: "4A", mon: "Toán", score: "8.5" }] };
test("already-added exams are excluded regardless of selected score type", () => {
  expect(filterSourceExams([exam], ["xa-1"], "", "all")).toHaveLength(0);
  expect(() => importExamColumn(exam, "ck1", ["xa-1"])).toThrow();
});
test("exam search combines with single level selection", () => {
  expect(filterSourceExams([exam], [], "TOÁN", "xa")).toHaveLength(1);
  expect(filterSourceExams([exam], [], "Toán", "so")).toHaveLength(0);
  expect(filterSourceExams([exam], [], "Tiếng Anh", "all")).toHaveLength(0);
});
test("five score choices produce distinct destination types without overwriting old keys", () => {
  for (const type of ["dgtx", "gk1", "ck1", "gk2", "ck2"] as const) {
    expect(importExamColumn(exam, type, []).scoreType).toBe(type);
    expect(importExamColumn(exam, type, []).key).toBe("import-xa-1");
  }
});
test("scores require 0–10 and a single decimal digit", () => {
  expect(importExamColumn(exam, "gk1", []).label).toBe("Điểm GKI");
  for (const score of ["10.1", "8.55", "8,5"]) expect(() => importExamColumn({ ...exam, students: [{ ...exam.students[0], score }] }, "gk1", [])).toThrow();
});
test("score matching requires both student identity and subject", () => {
  expect(sameScoreStudent({ cccd: "123", mon: "Toán" }, exam.students[0])).toBe(true);
  expect(sameScoreStudent({ cccd: "456", mon: "Toán" }, exam.students[0])).toBe(false);
  expect(sameScoreStudent({ cccd: "123", mon: "Tiếng Anh" }, exam.students[0])).toBe(false);
});