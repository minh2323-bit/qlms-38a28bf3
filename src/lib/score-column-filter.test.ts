/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import { visibleScoreColumns } from "./score-column-filter";

const columns = [{ key: "gk1a" }, { key: "gk1b" }, { key: "ck1" }];
describe("score type selection", () => {
  test("all available score columns are initially selected", () => {
    expect(visibleScoreColumns(columns, [])).toEqual(columns);
  });
  test("unchecked score columns are hidden independently", () => {
    expect(visibleScoreColumns(columns, ["gk1a", "ck1"])).toEqual([{ key: "gk1b" }]);
  });
  test("unchecking every column leaves no visible scores", () => {
    expect(visibleScoreColumns(columns, columns.map((column) => column.key))).toEqual([]);
  });
  test("selection never adds score columns unavailable to teachers", () => {
    expect(visibleScoreColumns(columns.filter((column) => column.key === "ck1"), [])).toEqual([{ key: "ck1" }]);
  });
});