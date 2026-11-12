/// <reference types="bun" />
import { expect, test } from "bun:test";
import { assignedSourceClasses, sourceForAssignedClasses, filterSourceExams, importExamColumn, sameScoreStudent, scoreSourceAssessments, scoreSourceClasses, type ScoreSourceExam } from "./exam-score-import";
const exam: ScoreSourceExam = { id: "xa-1", name: "Kỳ thi cấp Xã Toán", level: "xa", kind: "ky-thi", date: "09/11/2026", participantCount: 1, students: [{ name: "An", cccd: "123", dob: "", khoi: "4", lop: "4A", mon: "Toán", score: "8.5" }] };
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
test("content filter keeps only the chosen kind and level filter only narrows exams", () => {
  const baiTap = scoreSourceAssessments().find((e) => e.kind === "bai-tap")!;
  const sources = [exam, baiTap];
  expect(filterSourceExams(sources, [], "", "all", "bai-tap")).toEqual([baiTap]);
  expect(filterSourceExams(sources, [], "", "all", "ky-thi")).toEqual([exam]);
  expect(filterSourceExams(sources, [], "", "so", "all")).toEqual([baiTap]);
});
test("every assessment source has importable 0–10 single-decimal scores", () => {
  for (const source of scoreSourceAssessments()) {
    expect(source.students.length).toBeGreaterThan(0);
    expect(() => importExamColumn(source, "dgtx", [])).not.toThrow();
  }
});
test("class filter keeps only contents that have students in the chosen class", () => {
  const baiTap = scoreSourceAssessments().filter((e) => e.kind === "bai-tap");
  const lop = baiTap[0].students[0].lop;
  expect(filterSourceExams(baiTap, [], "", "all", "bai-tap", lop)).toHaveLength(baiTap.length);
  expect(filterSourceExams(baiTap, [], "", "all", "bai-tap", "9Z")).toHaveLength(0);
  expect(scoreSourceClasses(baiTap, "bai-tap")).toContain(lop);
});
test("exam rows ignore the class filter and keep the level filter", () => {
  const sources = [exam, ...scoreSourceAssessments()];
  expect(filterSourceExams(sources, [], "", "all", "ky-thi", "9Z")).toEqual([exam]);
  expect(filterSourceExams(sources, [], "", "xa", "ky-thi", "all")).toEqual([exam]);
  expect(filterSourceExams(sources, [], "", "so", "ky-thi", "all")).toHaveLength(0);
});

test("no content selection provides no class options or import", () => {
  expect(assignedSourceClasses()).toEqual([]);
  expect(sourceForAssignedClasses(undefined, ["4A"])).toBeUndefined();
});

test("content assigned to one class offers only that class, selected in full", () => {
  const assignment = { ...exam, kind: "bai-tap" as const };
  const defaults = assignedSourceClasses(assignment);
  expect(defaults).toEqual(["4A"]);
  expect(sourceForAssignedClasses(assignment, defaults)?.students).toEqual(assignment.students);
});

test("switching content updates the full assigned class selection", () => {
  const assignment = { ...exam, students: [...exam.students, { ...exam.students[0], cccd: "456", lop: "5B" }] };
  expect(assignedSourceClasses(exam)).toEqual(["4A"]);
  expect(assignedSourceClasses(assignment)).toEqual(["4A", "5B"]);
  expect(sourceForAssignedClasses(assignment, assignedSourceClasses(assignment))?.participantCount).toBe(2);
});

test("unchecking all classes blocks import and selecting a class imports only its students", () => {
  const assignment = { ...exam, students: [...exam.students, { ...exam.students[0], cccd: "456", lop: "5B" }] };
  expect(sourceForAssignedClasses(assignment, [])).toBeUndefined();
  expect(sourceForAssignedClasses(assignment, ["5B"])?.students.map((s) => s.cccd)).toEqual(["456"]);
  expect(sourceForAssignedClasses(assignment, ["9Z"])).toBeUndefined();
});
