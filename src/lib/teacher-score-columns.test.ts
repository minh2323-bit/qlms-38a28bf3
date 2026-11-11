/// <reference types="bun" />
import { expect, test } from "bun:test";
import { ASSESSMENT_COLUMNS, ASSESSMENT_ROWS } from "./assessment-scores";
import { scoreSourceAssessments } from "./exam-score-import";
import { defaultTeacherScope, initialTeacherScoreSources, inTeacherScope, replaceTeacherScoreSource, transferProgress } from "./teacher-score-columns";

test("100% of existing teacher scores have scoped content provenance matching their value", () => {
  const sources = initialTeacherScoreSources(ASSESSMENT_ROWS);
  let checked = 0;
  for (const row of ASSESSMENT_ROWS) {
    for (const column of ASSESSMENT_COLUMNS) {
      if (!row.scores[column.key]) continue;
      const entry = sources[`${row.khoi}/${row.lop}/${row.mon}`]?.[column.key];
      expect(entry).toBeDefined();
      expect(entry.source.name.length).toBeGreaterThan(0);
      expect(["bai-tap", "bai-kiem-tra", "ky-thi"]).toContain(entry.source.kind);
      expect(entry.source.date).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
      expect(entry.scoreDate).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
      expect(entry.source.students.find((student) => student.cccd === row.cccd && student.mon === row.mon)?.score).toBe(row.scores[column.key]);
      checked++;
    }
  }
  expect(checked).toBe(162);
});

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
test("transfer tag counts students transferred at lock time against students with scores", () => {
  const scope = { grade: "3", klass: "3A", subject: "Toán" };
  const scoped = ASSESSMENT_ROWS.filter((r) => inTeacherScope(r, scope));
  expect(transferProgress(scoped, "dgtx1", [])).toEqual({ moved: 0, withScore: 2 });
  const transferred = scoped.filter((r) => r.scores.dgtx5).map((r) => r.id);
  expect(transferred).toHaveLength(1);
  expect(transferProgress(scoped, "dgtx5", transferred)).toEqual({ moved: 1, withScore: 1 });
  const filled = scoped.map((r) => ({ ...r, scores: { ...r.scores, dgtx5: r.scores.dgtx5 || "8" } }));
  expect(transferProgress(filled, "dgtx5", transferred)).toEqual({ moved: 1, withScore: 2 });
});
test("locked columns cannot replace their source", () => {
  expect(() => replaceTeacherScoreSource(ASSESSMENT_ROWS, "dgtx1", scoreSourceAssessments()[0], defaultTeacherScope(ASSESSMENT_ROWS), new Set(["dgtx1"]))).toThrow("Mở khóa");
});