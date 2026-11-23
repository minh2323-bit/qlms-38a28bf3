import { matchUnitRange } from "@/components/ReportFilters";

export type DtiOverviewFilter = { unit: string; grade: string; from: string; to: string };
export const emptyDtiOverviewFilter = (): DtiOverviewFilter => ({ unit: "all", grade: "all", from: "", to: "" });

/** Reuse the report's stable mock unit/activity assignments for all overview rows. */
export function matchesDtiOverview(key: string, grades: number[], filter: DtiOverviewFilter) {
  if (filter.grade !== "all" && !grades.includes(Number(filter.grade))) return false;
  if (!filter.from && !filter.to) return matchUnitRange(key, filter.unit);
  const from = new Date(`${filter.from || "1900-01-01"}T00:00:00`);
  const to = new Date(`${filter.to || "9999-12-31"}T00:00:00`);
  return matchUnitRange(key, filter.unit, { from, to });
}

export function gradesInLabel(label: string): number[] {
  if (label.includes("Khối 1-5")) return [1, 2, 3, 4, 5];
  return [...new Set((label.match(/[1-5]/g) || []).map(Number))];
}

export function homeworkCompletion(rows: { homework: number; homeworkAssigned: number }[]) {
  const completed = rows.reduce((sum, row) => sum + row.homework, 0);
  const assigned = rows.reduce((sum, row) => sum + row.homeworkAssigned, 0);
  return { completed, assigned, rate: assigned ? Math.round(completed / assigned * 1000) / 10 : 0 };
}