/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import { ASSESSMENT_ROWS, filterAssessmentRows, unlockAssessmentColumn } from "./assessment-scores";
import { isValidScore } from "./score";
describe("assessment score transfer rules", () => {
  test("teachers can unlock a confirmed assessment column without unlocking other scores", () => {
    const locked = new Set(["dgtx1", "dgtx2", "dgtx3"]);
    const next = unlockAssessmentColumn(locked, "dgtx1");
    expect(next.has("dgtx1")).toBe(false);
    expect([...next]).toEqual(["dgtx2", "dgtx3"]);
    expect(locked.has("dgtx1")).toBe(true);
  });
  test("scores accept 0 and 10 but reject values outside 0–10", () => {
    expect(isValidScore("0")).toBe(true);
    expect(isValidScore("10")).toBe(true);
    expect(isValidScore("10.1")).toBe(false);
    expect(isValidScore("-1")).toBe(false);
  });
  test("scores allow one decimal digit with a dot only", () => {
    expect(isValidScore("8.5")).toBe(true);
    expect(isValidScore("8.55")).toBe(false);
    expect(isValidScore("8,5")).toBe(false);
  });
  test("grades and classes allow multiple selections", () => {
    const rows = filterAssessmentRows(ASSESSMENT_ROWS, "", ["3", "4"], ["3A", "4B"]);
    expect(rows).toHaveLength(12);
    expect([...new Set(rows.map((r) => r.lop))]).toEqual(["3A", "4B"]);
  });
});