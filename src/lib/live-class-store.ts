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

// Helper tạo datetime-local string (YYYY-MM-DDTHH:mm) tương đối thời điểm hiện tại.
function nowOffset(minutes: number): string {
  const d = new Date(Date.now() + minutes * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

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
  {
    id: "lc-seed-2",
    classRealId: "4A",
    subject: "Toán",
    name: "Phụ đạo buổi tối – Phép cộng phân số",
    unitId: "u4-cong",
    startAt: "2026-04-03T19:30",
    endAt: "2026-04-03T20:30",
    link: "https://meet.google.com/evn-pqrs-tuv",
    description: "Buổi học tăng cường vào buổi tối cho học sinh lớp 4A.",
    studentCount: 18,
    createdAt: "2026-03-31T09:00:00.000Z",
  },
  // ----- Lớp đang diễn ra -----
  {
    id: "lc-seed-live-now",
    classRealId: "4A",
    subject: "Toán",
    name: "Luyện tập Phép nhân – đang diễn ra",
    unitId: "u2-nhan",
    startAt: nowOffset(-10),
    endAt: nowOffset(35),
    link: "https://meet.google.com/live-now-abc",
    description: "Buổi luyện tập đang diễn ra trực tuyến.",
    studentCount: 28,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  // ----- Lớp chuẩn bị diễn ra (sắp tới ~30 phút nữa) -----
  {
    id: "lc-seed-upcoming-1",
    classRealId: "4A",
    subject: "Toán",
    name: "Chữa bài tập Phân số – sắp diễn ra",
    unitId: "u4-tru",
    startAt: nowOffset(30),
    endAt: nowOffset(75),
    link: "https://zoom.us/j/upcoming-1",
    description: "Buổi chữa bài tập sắp bắt đầu.",
    studentCount: 30,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  // Một lớp khác sắp diễn ra cho lớp 3D – Toán để demo cây kiến thức lớp 3.
  {
    id: "lc-seed-upcoming-2",
    classRealId: "3D",
    subject: "Toán",
    name: "Bảng nhân 7 – Lớp học trực tuyến",
    unitId: "g3-u2-bn7",
    startAt: nowOffset(90),
    endAt: nowOffset(135),
    link: "https://teams.microsoft.com/l/meetup-join/upcoming-2",
    description: "Lớp ôn tập Bảng nhân 7 cho lớp 3D.",
    studentCount: 25,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
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

/* ---------- Status & Stats ---------- */
// Coi như "đã kết thúc" nếu thời điểm hiện tại > endAt.
export function isLiveEnded(lc: Pick<LiveClass, "endAt">): boolean {
  return new Date(lc.endAt).getTime() < Date.now();
}

// Lớp diễn ra vào buổi tối (sau khung tiết 10 — từ 18:30 trở đi).
export function isEvening(startAt: string): boolean {
  const d = new Date(startAt);
  const minutes = d.getHours() * 60 + d.getMinutes();
  return minutes >= 18 * 60 + 30;
}

export type Attendee = {
  name: string;
  joinAt: string;  // "HH:mm"
  leaveAt: string; // "HH:mm"
};

// Mock danh sách học sinh tham dự — sinh ổn định theo id để demo.
const ATTENDEE_POOL = [
  "Nguyễn An", "Mai Huyền", "Trần Bảo", "Thanh Vân", "Vũ Huy Hoàng",
  "Phạm Tất Thắng", "Lê Minh Châu", "Hoàng Khánh Linh", "Đỗ Quang Huy",
  "Nguyễn Bích Ngọc", "Bùi Tiến Dũng", "Hà Thu Phương", "Lý Văn Tài",
  "Trịnh Mỹ Duyên", "Phan Đức Anh", "Ngô Hồng Nhung", "Tô Quốc Việt",
  "Đặng Phương Mai", "Vũ Hà Trang", "Nguyễn Tuấn Kiệt", "Lê Bảo Châu",
  "Phạm Quang Minh", "Hoàng Thu Hằng", "Đinh Bảo Long", "Trần Mỹ Linh",
  "Nguyễn Đăng Khoa", "Bùi Hà My", "Lý Khánh Vy", "Phạm Hữu Phước",
  "Đỗ Nhật Nam", "Cao Thị Hoa", "Nguyễn Quỳnh Như",
];

function pad(n: number) { return String(n).padStart(2, "0"); }
function addMinutes(time: string, mins: number) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  return `${pad(Math.floor(total / 60) % 24)}:${pad(((total % 60) + 60) % 60)}`;
}

export function getAttendees(lc: LiveClass): Attendee[] {
  const startTime = `${pad(new Date(lc.startAt).getHours())}:${pad(new Date(lc.startAt).getMinutes())}`;
  const endTime = `${pad(new Date(lc.endAt).getHours())}:${pad(new Date(lc.endAt).getMinutes())}`;
  // Tạo seed đơn giản từ id để kết quả ổn định giữa các lần render.
  let seed = 0;
  for (const ch of lc.id) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };
  return Array.from({ length: lc.studentCount }, (_, i) => {
    const name = ATTENDEE_POOL[(i + (seed % ATTENDEE_POOL.length)) % ATTENDEE_POOL.length];
    const joinOffset = Math.floor(rand() * 4); // 0–3 phút sau khi bắt đầu
    const earlyLeave = rand() < 0.15 ? Math.floor(rand() * 10) + 1 : 0;
    return {
      name,
      joinAt: addMinutes(startTime, joinOffset),
      leaveAt: addMinutes(endTime, -earlyLeave),
    };
  });
}
