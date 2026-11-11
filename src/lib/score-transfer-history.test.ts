/// <reference types="bun" />
import { expect, test } from "bun:test";
import { appendScoreTransfer, examTransferProgress, formatScoreTransferTime } from "./score-transfer-history";

test("a transfer receipt records the exact transfer person and time", () => {
  const history = appendScoreTransfer([], "Nguyễn Thị Mai Lan - Hiệu trưởng", "2026-11-11T03:54:00Z");
  expect(history).toEqual([{ person: "Nguyễn Thị Mai Lan - Hiệu trưởng", at: "2026-11-11T03:54:00Z" }]);
});
test("two transfers retain both times and transferers without mutating the previous receipt", () => {
  const first = appendScoreTransfer([], "Nguyễn Thị Mai Lan - Hiệu trưởng", "2026-11-11T03:54:00Z");
  const second = appendScoreTransfer(first, "Nguyễn Thị Mai Lan - Hiệu trưởng", "2026-11-12T04:15:00Z");
  expect(first).toHaveLength(1);
  expect(second.map((event) => formatScoreTransferTime(event.at))).toEqual(["10:54 - 11/11/2026", "11:15 - 12/11/2026"]);
  expect(second.map((event) => event.person)).toEqual(["Nguyễn Thị Mai Lan - Hiệu trưởng", "Nguyễn Thị Mai Lan - Hiệu trưởng"]);
});
test("exam tags track 45 of 50 scored students until the next transfer", () => {
  const rows = Array.from({ length: 50 }, (_, index) => ({ id: String(index), ck1: "8.5" }));
  expect(examTransferProgress(rows, "ck1", [])).toEqual({ moved: 0, withScore: 50 });
  expect(examTransferProgress(rows, "ck1", rows.slice(0, 45).map((row) => row.id))).toEqual({ moved: 45, withScore: 50 });
  expect(examTransferProgress(rows, "ck1", rows.map((row) => row.id))).toEqual({ moved: 50, withScore: 50 });
});