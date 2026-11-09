export const SCORE_SUBJECTS = ["Toán", "Tiếng Việt", "Tiếng Anh"];

export function filterScoreSubjects<T extends { mon: string }>(rows: T[], selected: readonly string[]): T[] {
  return rows.filter((row) => selected.includes(row.mon));
}