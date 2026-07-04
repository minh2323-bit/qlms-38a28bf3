// Tuần học tính từ 5/9 hằng năm — dùng chung cho GV & HS.
// Năm học hiện tại: 2025-2026.

const YEAR_START = new Date(2025, 8, 5); // 5/9/2025
const TOTAL_WEEKS = 44;

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function fmtD(d: Date): string {
  return `${d.getDate()}/${d.getMonth() + 1}`;
}
function fmtDy(d: Date): string {
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

export type SchoolWeek = { idx: number; label: string; range: string; start: Date; end: Date };

export const WEEKS: SchoolWeek[] = Array.from({ length: TOTAL_WEEKS }, (_, i) => {
  const start = addDays(YEAR_START, i * 7);
  const end = addDays(start, 6);
  return {
    idx: i + 1,
    label: `Tuần ${i + 1}`,
    range: `${fmtD(start)} – ${fmtDy(end)}`,
    start,
    end,
  };
});

/** DAY_DATES[weekIdx] → 7 chuỗi "d/M" cho các ngày trong tuần. */
export const DAY_DATES: Record<number, string[]> = Object.fromEntries(
  WEEKS.map(({ idx, start }) => [
    idx,
    Array.from({ length: 7 }, (_, d) => fmtD(addDays(start, d))),
  ]),
);

/** Tuần chứa "ngày hôm nay" — fallback week 30 nếu ngoài năm học. */
export function getCurrentWeekIdx(now: Date = new Date()): number {
  const diff = Math.floor((now.getTime() - YEAR_START.getTime()) / (24 * 60 * 60 * 1000));
  const idx = Math.floor(diff / 7) + 1;
  if (idx < 1 || idx > TOTAL_WEEKS) return 30;
  return idx;
}
