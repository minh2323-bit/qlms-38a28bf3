/// <reference types="bun" />
import { expect, test } from "bun:test";
import { ASSESSMENT_ROWS } from "./assessment-scores";
import { scoreSourceAssessments } from "./exam-score-import";
import { defaultTeacherScope, inTeacherScope, replaceTeacherScoreSource } from "./teacher-score-columns";

test("teacher defaults to smallest grade and first A class with a single subject", () => {
  expect(defaultTeacherScope([...ASSESSMENT_ROWS].reverse())).toEqual({ grade: "3", klass: "3A", subject: "Tiếng Anh" });
  expect(defaultTeacherScope(ASSESSMENT_ROWS)).toEqual({ grade: "3", klass: "3A", subject: "Toán" });
});
test("empty and all selections cannot match students", () => {
  expect(inTeacherScope(ASSESSMENT_ROWS[0], { grade: "", klass: "3A", subject: "Toán" })).toBe(false);
  expect(inTeacherScope(ASSESSMENT_ROWS[0], { grade: "3", klass: "all", subject: "Toán" })).toBe(false);
});
test("source replacement only changes the target column in the selected class and subject", () => {
  const source = scoreSourceAssessments()[0];
  const scope = { grade: "3", klass: "3A", subject: "Toán" };
  const result = replaceTeacherScoreSource(ASSESSMENT_ROWS, "dgtx1", source, scope, new Set());
  expect(result[0].scores.dgtx1).toBe("5");
  expect(result[0].scores.dgtx2).toBe(ASSESSMENT_ROWS[0].scores.dgtx2);
  expect(result[1]).toBe(ASSESSMENT_ROWS[1]);
  expect(result.find((r) => r.lop === "3B")).toBe(ASSESSMENT_ROWS.find((r) => r.lop === "3B"));
});
test("locked columns cannot replace their source", () => {
  expect(() => replaceTeacherScoreSource(ASSESSMENT_ROWS, "dgtx1", scoreSourceAssessments()[0], defaultTeacherScope(ASSESSMENT_ROWS), new Set(["dgtx1"]))).toThrow("Mở khóa");
});