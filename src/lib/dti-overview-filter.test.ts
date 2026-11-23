import { describe, expect, test } from "bun:test";
import { emptyDtiOverviewFilter, gradesInLabel, matchesDtiOverview, homeworkCompletion } from "./dti-overview-filter";
import { UNITS } from "@/components/ReportFilters";

describe("DTI overview scope", () => {
  test("homework completion uses submitted assignments, not lesson-content activity", () => {
    expect(homeworkCompletion([{ homework: 76, homeworkAssigned: 80 }, { homework: 72, homeworkAssigned: 80 }])).toEqual({ completed: 148, assigned: 160, rate: 92.5 });
    expect(homeworkCompletion([])).toEqual({ completed: 0, assigned: 0, rate: 0 });
  });
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