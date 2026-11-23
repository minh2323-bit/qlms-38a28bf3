import { describe, expect, test } from "bun:test";
import { emptyDtiOverviewFilter, gradesInLabel, matchesDtiOverview } from "./dti-overview-filter";
import { UNITS } from "@/components/ReportFilters";

describe("DTI overview scope", () => {
  test("reset includes all grades and units", () => {
    expect(matchesDtiOverview("Lớp 3A", [3], emptyDtiOverviewFilter())).toBe(true);
  });
  test("grade filters teaching classes without including other grades", () => {
    const filter = { ...emptyDtiOverviewFilter(), grade: "3" };
    expect(matchesDtiOverview("3A", [3], filter)).toBe(true);
    expect(matchesDtiOverview("4A", [4], filter)).toBe(false);
    expect(gradesInLabel("Khối 1-5")).toEqual([1, 2, 3, 4, 5]);
  });
  test("each mock row belongs to exactly one of the three units", () => {
    expect(UNITS.filter(unit => matchesDtiOverview("HS2026001", [4], { ...emptyDtiOverviewFilter(), unit }))).toHaveLength(1);
  });
  test("an out-of-period activity is excluded", () => {
    expect(matchesDtiOverview("HS2026001", [4], { ...emptyDtiOverviewFilter(), from: "2000-01-01", to: "2000-01-31" })).toBe(false);
    expect(matchesDtiOverview("HS2026001", [4], { ...emptyDtiOverviewFilter(), from: "2000-01-01", to: "9999-12-31" })).toBe(true);
  });
});