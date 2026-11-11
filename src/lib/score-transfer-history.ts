export type ScoreTransferEvent = { at: string; person: string };

// Mock transfer receipts belong to the current source, not to a replacement source.
export function appendScoreTransfer(history: ScoreTransferEvent[] = [], person: string, at = new Date().toISOString()): ScoreTransferEvent[] {
  return [...history, { person, at }];
}

export function formatScoreTransferTime(at: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    day: "2-digit", month: "2-digit", year: "numeric",
  }).formatToParts(new Date(at));
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${value("hour")}:${value("minute")} - ${value("day")}/${value("month")}/${value("year")}`;
}

export function examTransferProgress(rows: { id: string; [key: string]: string }[], key: string, transferredIds: string[]) {
  const scored = rows.filter((row) => (row[key] ?? "").trim() !== "");
  return { moved: scored.filter((row) => transferredIds.includes(row.id)).length, withScore: scored.length };
}