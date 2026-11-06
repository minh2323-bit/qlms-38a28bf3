/** Valid score: empty (not entered) or 0–10 with at most one decimal, using "." as separator. */
export function isValidScore(v: string): boolean {
  if (v === "") return true;
  if (!/^\d{1,2}(\.\d)?$/.test(v)) return false;
  const n = Number(v);
  return n >= 0 && n <= 10;
}
