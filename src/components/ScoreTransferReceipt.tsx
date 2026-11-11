import { formatScoreTransferTime, type ScoreTransferEvent } from "@/lib/score-transfer-history";

export function ScoreTransferTag({ moved, withScore }: { moved: number; withScore: number }) {
  if (moved < 1) return null;
  return <span className="inline-flex items-center gap-1 rounded-md border border-exam-success/40 bg-exam-success-tint px-1.5 py-0.5 font-normal text-exam-success">Đã chuyển<span className="rounded border border-exam-success/50 bg-exam-success/20 px-1.5 py-px font-medium tabular-nums">{moved}/{withScore}</span></span>;
}

export function ScoreTransferHistoryCells({ history = [], showPerson = false }: { history?: ScoreTransferEvent[]; showPerson?: boolean }) {
  return <>{showPerson && <td className="p-3 align-top whitespace-nowrap">{history.map((event, index) => <div key={index} className="min-h-6">{event.person}</div>)}</td>}<td className="p-3 text-center align-top whitespace-nowrap">{history.map((event, index) => <div key={index} className="min-h-6 tabular-nums">{formatScoreTransferTime(event.at)}</div>)}</td></>;
}