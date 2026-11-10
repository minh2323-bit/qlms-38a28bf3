/// <reference types="bun" />
import { expect, test } from "bun:test";
import { initialExamColumnSources, replaceExamColumnSource, type ExamScoreRow } from "./exam-score-columns";
const rows: ExamScoreRow[] = [{ id: "1", name: "An", cccd: "001", dob: "01/01/2019", khoi: "3", lop: "3A", mon: "Toán", gk1a: "8.5", ck1: "9" }];
const sources = initialExamColumnSources(rows, [{ key: "gk1a", label: "Điểm GKI" }, { key: "ck1", label: "Điểm CKI" }]);
test("all seeded exam scores have exam-only provenance and matching values", () => {
  for (const key of ["gk1a", "ck1"]) {
    expect(sources[key].source.kind).toBe("ky-thi");
    expect(sources[key].source.students[0].score).toBe(rows[0][key]);
    expect(sources[key].source.name.length).toBeGreaterThan(0);
    expect(sources[key].scoreDate).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  }
});
test("exam replacement rejects exercises and tests", () => {
  for (const kind of ["bai-tap", "bai-kiem-tra"] as const) expect(() => replaceExamColumnSource(rows, "gk1a", { ...sources.gk1a.source, kind }, new Set(), true)).toThrow("Chỉ được lấy điểm từ kỳ thi");
});
test("teachers and locked columns cannot replace exam sources", () => {
  expect(() => replaceExamColumnSource(rows, "gk1a", sources.gk1a.source, new Set(), false)).toThrow("Ban giám hiệu");
  expect(() => replaceExamColumnSource(rows, "gk1a", sources.gk1a.source, new Set(["gk1a"]), true)).toThrow("Mở khóa");
});
test("replacing an exam keeps other score columns unchanged", () => {
  const source = { ...sources.gk1a.source, students: [{ ...sources.gk1a.source.students[0], score: "7.5" }] };
  const next = replaceExamColumnSource(rows, "gk1a", source, new Set(), true);
  expect(next[0].gk1a).toBe("7.5");
  expect(next[0].ck1).toBe("9");
  expect(rows[0].gk1a).toBe("8.5");
});