import { describe, expect, test } from "bun:test";
import { emptyDtiOverviewFilter } from "./dti-overview-filter";
import { INDEXES, PIES, MONTHLY, schoolStatisticsForFilter, scopedSchoolValue } from "./school-statistics";

describe("shared school statistics", () => {
  test("unfiltered overview preserves every original school index and donut value", () => {
    const data = schoolStatisticsForFilter(emptyDtiOverviewFilter());
    expect(data.indexes.map(row => row.count)).toEqual(INDEXES.map(row => Number(row.value.replaceAll(".", ""))));
    expect(data.pies).toEqual(PIES);
    expect(data.monthly.map(({ hocLieu: _, ...row }) => row)).toEqual(MONTHLY);
    expect(data.monthly.every(row => row.hocLieu > 0)).toBe(true);
  });
  test("each school resource belongs to one grade and grade totals reconcile", () => {
    const counts = [1, 2, 3, 4, 5].map(grade => scopedSchoolValue("Học liệu đã tải lên", 2418, { ...emptyDtiOverviewFilter(), grade: String(grade) }));
    expect(counts.reduce((sum, value) => sum + value, 0)).toBe(2418);
    expect(counts.every(value => value > 0 && value < 2418)).toBe(true);
  });
  test("copyright rows respect the same submitted grade and empty date scope", () => {
    const data = schoolStatisticsForFilter({ ...emptyDtiOverviewFilter(), grade: "3" });
    expect(data.copyrightRows).toHaveLength(3);
    expect(data.copyrightRows.every(row => row.grade === "Khối 3")).toBe(true);
    const empty = schoolStatisticsForFilter({ ...emptyDtiOverviewFilter(), from: "2000-01-01", to: "2000-01-31" });
    expect(empty.indexes.map(row => row.count)).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
    expect(empty.copyrightRows).toHaveLength(0);
  });
});