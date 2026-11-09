/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import { SCORE_SUBJECTS, filterScoreSubjects } from "./score-subjects";
import { ASSESSMENT_ROWS, filterAssessmentRows } from "./assessment-scores";

describe("shared score-transfer subject selection", () => {
  test("all subjects selected initially keeps every row", () => {
    expect(filterScoreSubjects(ASSESSMENT_ROWS, SCORE_SUBJECTS)).toHaveLength(36);
  });
  test("multiple selected subjects exclude unchecked subjects", () => {
    const rows = filterScoreSubjects(ASSESSMENT_ROWS, ["Toán", "Tiếng Anh"]);
    expect(rows).toHaveLength(24);
    expect(rows.some((row) => row.mon === "Tiếng Việt")).toBe(false);
    expect(new Set(rows.map((row) => row.mon))).toEqual(new Set(["Toán", "Tiếng Anh"]));
  });
  test("unchecking every subject returns no rows", () => {
    expect(filterScoreSubjects(ASSESSMENT_ROWS, [])).toEqual([]);
  });
  test("subjects combine with selected grades and classes", () => {
    const rows = filterAssessmentRows(ASSESSMENT_ROWS, "", ["3", "4"], ["3A", "4B"], ["Toán", "Tiếng Anh"]);
    expect(rows).toHaveLength(8);
    expect(rows.every((row) => ["3A", "4B"].includes(row.lop) && ["Toán", "Tiếng Anh"].includes(row.mon))).toBe(true);
  });
});