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
  // ----- Thêm nhiều lớp sắp diễn ra cho lớp 4A -----
  {
    id: "lc-seed-upcoming-4a-tonight",
    classRealId: "4A",
    subject: "Toán",
    name: "Ôn tập cuối tuần – Số tự nhiên",
    unitId: "u1-sotunhien",
    startAt: nowOffset(60 * 5),          // ~5h nữa (hôm nay)
    endAt: nowOffset(60 * 5 + 45),
    link: "https://meet.google.com/tonight-4a",
    description: "Buổi ôn tập cuối tuần.",
    studentCount: 28,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "lc-seed-upcoming-4a-tomorrow-am",
    classRealId: "4A",
    subject: "Tiếng Việt",
    name: "Đọc hiểu – Câu chuyện mùa xuân",
    unitId: "u-tv-doc",
    startAt: nowOffset(60 * 22),         // sáng ngày mai
    endAt: nowOffset(60 * 22 + 45),
    link: "https://meet.google.com/tomorrow-am-4a",
    description: "Sáng mai: luyện đọc hiểu.",
    studentCount: 30,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "lc-seed-upcoming-4a-tomorrow-pm",
    classRealId: "4A",
    subject: "Toán",
    name: "Luyện tập Phân số nâng cao",
    unitId: "u3-khainiem",
    startAt: nowOffset(60 * 30),         // chiều mai
    endAt: nowOffset(60 * 30 + 45),
    link: "https://meet.google.com/tomorrow-pm-4a",
    description: "Chiều mai: luyện tập phân số.",
    studentCount: 27,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "lc-seed-upcoming-4a-d3",
    classRealId: "4A",
    subject: "Tiếng Anh",
    name: "Speaking Club – Unit 5",
    unitId: "u-en-5",
    startAt: nowOffset(60 * 52),         // 2 ngày nữa
    endAt: nowOffset(60 * 52 + 45),
    link: "https://meet.google.com/d3-4a",
    description: "Buổi luyện nói tiếng Anh.",
    studentCount: 26,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lc-seed-upcoming-4a-d4",
    classRealId: "4A",
    subject: "Khoa học",
    name: "Thí nghiệm nước và không khí",
    unitId: "u-kh-1",
    startAt: nowOffset(60 * 76),         // 3 ngày nữa
    endAt: nowOffset(60 * 76 + 45),
    link: "https://meet.google.com/d4-4a",
    description: "Buổi thí nghiệm.",
    studentCount: 29,
    createdAt: new Date().toISOString(),
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

export function updateLiveClass(id: string, patch: Partial<Omit<LiveClass, "id" | "createdAt">>): void {
  items = items.map((it) => (it.id === id ? { ...it, ...patch } : it));
  emit();
}

export function getLiveClassById(id: string): LiveClass | undefined {
  return items.find((l) => l.id === id);
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

export type AttendanceSession = { joinAt: string; leaveAt: string };
export type Attendee = {
  name: string;
  dob: string;               // "DD/MM/YYYY"
  sessions: AttendanceSession[];
  joinAt: string;            // first session (backward compat)
  leaveAt: string;           // last session (backward compat)
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
  let seed = 0;
  for (const ch of lc.id) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };
  // Đảm bảo "Phí Song Ngân" luôn có mặt ở vị trí 0 để demo popup thống kê của học sinh.
  const CURRENT_STUDENT = "Phí Song Ngân";
  return Array.from({ length: lc.studentCount }, (_, i) => {
    const name = i === 0
      ? CURRENT_STUDENT
      : ATTENDEE_POOL[(i + (seed % ATTENDEE_POOL.length)) % ATTENDEE_POOL.length];
    const day = Math.floor(rand() * 28) + 1;
    const month = Math.floor(rand() * 12) + 1;
    const year = 2015 + Math.floor(rand() * 2);
    const dob = `${pad(day)}/${pad(month)}/${year}`;

    const r = rand();
    // Học sinh hiện tại luôn có 3 lần vào/ra để minh họa việc thoát và vào lại.
    const sessionCount = i === 0 ? 3 : r < 0.5 ? 1 : r < 0.8 ? 2 : 3;
    const sessions: AttendanceSession[] = [];
    let cursor = Math.floor(rand() * 4);
    for (let s = 0; s < sessionCount; s++) {
      const join = addMinutes(startTime, cursor);
      cursor += 5 + Math.floor(rand() * 12);
      const leave = s === sessionCount - 1
        ? addMinutes(endTime, -(rand() < 0.15 ? Math.floor(rand() * 8) + 1 : 0))
        : addMinutes(startTime, cursor);
      sessions.push({ joinAt: join, leaveAt: leave });
      cursor += 2 + Math.floor(rand() * 5); // khoảng nghỉ ra ngoài
    }
    return {
      name, dob, sessions,
      joinAt: sessions[0].joinAt,
      leaveAt: sessions[sessions.length - 1].leaveAt,
    };
  });
}
