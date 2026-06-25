import { useSyncExternalStore } from "react";

export type LiveClass = {
  id: string;
  classRealId: string;   // "4A", "3D", ...
  subject: string;       // "Toán", "Tiếng Việt"
  name: string;
  unitId: string;
  startAt: string;       // "YYYY-MM-DDTHH:mm" (local)
  endAt: string;
  link: string;          // Google Meet / Zoom / Teams URL
  description?: string;
  studentCount: number;
  createdAt: string;     // ISO
};

type Listener = () => void;

// Seed một lớp trực tuyến để demo đồng bộ sang Lịch báo giảng.
// 2/4/2026 08:00 -> trùng Tiết 1, Thứ 4, Tuần 1 của lớp 4A – Toán.
let items: LiveClass[] = [
  {
    id: "lc-seed-1",
    classRealId: "4A",
    subject: "Toán",
    name: "Ôn tập Số tự nhiên – buổi trực tuyến",
    unitId: "u1-sotunhien",
    startAt: "2026-04-02T08:00",
    endAt: "2026-04-02T08:45",
    link: "https://meet.google.com/abc-defg-hij",
    description: "Buổi học trực tuyến qua Google Meet cho lớp 4A.",
    studentCount: 32,
    createdAt: "2026-03-30T10:00:00.000Z",
  },
];

const listeners = new Set<Listener>();
function emit() { listeners.forEach((l) => l()); }
function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `lc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function addLiveClass(lc: Omit<LiveClass, "id" | "createdAt">): LiveClass {
  const next: LiveClass = { ...lc, id: uid(), createdAt: new Date().toISOString() };
  items = [...items, next];
  emit();
  return next;
}

export function listLiveClassesForClass(classRealId: string, subject: string): LiveClass[] {
  return items.filter((l) => l.classRealId === classRealId && l.subject === subject);
}

export function getAllLiveClasses(): LiveClass[] {
  return items;
}

export function subscribe(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useLiveClasses(): LiveClass[] {
  return useSyncExternalStore(
    (l) => subscribe(l),
    () => items,
    () => items,
  );
}

/* ---------- Schedule mapping helpers ---------- */
// Khung giờ tiết học (1 buổi sáng 5 tiết + 1 buổi chiều 5 tiết)
export const PERIOD_TIMES: Record<number, [string, string]> = {
  1:  ["07:30", "08:15"],
  2:  ["08:20", "09:05"],
  3:  ["09:25", "10:10"],
  4:  ["10:15", "11:00"],
  5:  ["11:05", "11:50"],
  6:  ["14:00", "14:45"],
  7:  ["14:50", "15:35"],
  8:  ["15:55", "16:40"],
  9:  ["16:45", "17:30"],
  10: ["17:35", "18:20"],
};

export function formatTimeRange(startAt: string, endAt: string): string {
  const s = new Date(startAt);
  const e = new Date(endAt);
  const fmt = (d: Date) =>
    `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${fmt(s)} – ${fmt(e)}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}
