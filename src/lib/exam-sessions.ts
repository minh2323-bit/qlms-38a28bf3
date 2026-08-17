// Dữ liệu dùng chung cho Kỳ thi chính thức & Kỳ thi ôn tập.
export type ExamLevel = "truong" | "xa" | "so";
export type ExamEffect = "upcoming" | "ongoing" | "done";
export type ExamApproval = "approved" | "pending";

export type ExamSession = {
  id: string;
  name: string;
  level: ExamLevel;
  grade: string;
  subject: string;
  chapter: string;
  /** dd/mm/yyyy */
  date: string;
  timeRange: string;
  minutes: number;
  approval: ExamApproval;
  effect: ExamEffect;
  registered: number;
  attended: number;
  originalCount: number;
  permutedCodes: string[];
  /** Ca thi do GV thiết lập (nếu có) – hiển thị thay cho thời gian tổ chức mặc định. */
  shift?: { name: string; start: string; end: string };
};

export const CHAPTERS = [
  "Chương 1. Ôn tập và bổ sung",
  "Chương 2. Số thập phân",
  "Chương 3. Hình học",
  "Chương 4. Đọc hiểu",
];

export const EFFECT_META: Record<ExamEffect, { label: string; cls: string }> = {
  upcoming: { label: "Sắp diễn ra", cls: "bg-amber-100 text-amber-700 border-amber-200" },
  ongoing: { label: "Đang diễn ra", cls: "bg-sky-100 text-sky-700 border-sky-200" },
  done: { label: "Đã kết thúc", cls: "bg-slate-100 text-slate-600 border-slate-200" },
};

export const OFFICIAL_SESSIONS: ExamSession[] = [
  { id: "c1", name: "Kiểm tra cuối kỳ II – Trường Tô Hiệu", level: "truong", grade: "4", subject: "Toán", chapter: "Chương 2. Số thập phân", date: "10/05/2026", timeRange: "07:30 – 08:15", minutes: 45, approval: "approved", effect: "upcoming", registered: 120, attended: 0, originalCount: 2, permutedCodes: ["TH401", "TH402", "TH403", "TH404"], shift: { name: "Ca 1", start: "07:30", end: "08:15" } },
  { id: "c2", name: "Kiểm tra giữa kỳ II – Trường Tô Hiệu", level: "truong", grade: "4", subject: "Tiếng Việt", chapter: "Chương 4. Đọc hiểu", date: "05/03/2026", timeRange: "08:00 – 08:40", minutes: 40, approval: "approved", effect: "done", registered: 120, attended: 118, originalCount: 1, permutedCodes: ["TV401", "TV402"] },
  { id: "c3", name: "Kiểm tra cuối kỳ I – Trường Tô Hiệu", level: "truong", grade: "3", subject: "Toán", chapter: "Chương 1. Ôn tập và bổ sung", date: "22/12/2025", timeRange: "09:00 – 09:40", minutes: 40, approval: "approved", effect: "done", registered: 96, attended: 95, originalCount: 2, permutedCodes: ["TH301", "TH302", "TH303"] },
  { id: "c4", name: "Kỳ thi cấp Xã – Môn Toán", level: "xa", grade: "4", subject: "Toán", chapter: "Chương 3. Hình học", date: "15/05/2026", timeRange: "07:30 – 08:30", minutes: 60, approval: "pending", effect: "upcoming", registered: 64, attended: 0, originalCount: 1, permutedCodes: ["XA401", "XA402"] },
  { id: "c5", name: "Kỳ thi cấp Xã – Môn Tiếng Việt", level: "xa", grade: "5", subject: "Tiếng Việt", chapter: "Chương 4. Đọc hiểu", date: "18/04/2026", timeRange: "07:30 – 08:30", minutes: 60, approval: "approved", effect: "done", registered: 58, attended: 57, originalCount: 2, permutedCodes: ["XA501", "XA502", "XA503"] },
  { id: "c6", name: "Khảo sát chất lượng cuối kỳ – Sở GD&ĐT", level: "so", grade: "5", subject: "Toán", chapter: "Chương 2. Số thập phân", date: "11/08/2026", timeRange: "07:30 – 08:30", minutes: 60, approval: "approved", effect: "ongoing", registered: 150, attended: 143, originalCount: 3, permutedCodes: ["SO501", "SO502", "SO503", "SO504", "SO505", "SO506"] },
  { id: "c7", name: "Khảo sát chất lượng giữa kỳ – Sở GD&ĐT", level: "so", grade: "5", subject: "Tiếng Việt", chapter: "Chương 4. Đọc hiểu", date: "12/03/2026", timeRange: "14:00 – 15:00", minutes: 60, approval: "approved", effect: "done", registered: 150, attended: 147, originalCount: 2, permutedCodes: ["SO511", "SO512", "SO513"] },
];

export const PRACTICE_SESSIONS: ExamSession[] = [
  { id: "o1", name: "Đề ôn cuối kỳ – Trường Tô Hiệu (Toán)", level: "truong", grade: "4", subject: "Toán", chapter: "Chương 2. Số thập phân", date: "11/08/2026", timeRange: "07:00 – 07:45", minutes: 45, approval: "approved", effect: "ongoing", registered: 120, attended: 104, originalCount: 1, permutedCodes: ["OT401", "OT402"] },
  { id: "o2", name: "Đề ôn cuối kỳ – Trường Tô Hiệu (Tiếng Việt)", level: "truong", grade: "4", subject: "Tiếng Việt", chapter: "Chương 4. Đọc hiểu", date: "28/04/2026", timeRange: "08:00 – 08:40", minutes: 40, approval: "approved", effect: "done", registered: 120, attended: 112, originalCount: 2, permutedCodes: ["OTV41", "OTV42", "OTV43"] },
  { id: "o3", name: "Đề ôn giữa kỳ – Trường Tô Hiệu (Toán 3)", level: "truong", grade: "3", subject: "Toán", chapter: "Chương 1. Ôn tập và bổ sung", date: "18/02/2026", timeRange: "09:00 – 09:35", minutes: 35, approval: "pending", effect: "done", registered: 96, attended: 88, originalCount: 1, permutedCodes: ["OT301", "OT302"] },
  { id: "o4", name: "Đề ôn cấp Xã – Toán", level: "xa", grade: "4", subject: "Toán", chapter: "Chương 3. Hình học", date: "11/08/2026", timeRange: "13:30 – 14:15", minutes: 45, approval: "approved", effect: "ongoing", registered: 64, attended: 51, originalCount: 2, permutedCodes: ["OXA41", "OXA42", "OXA43"] },
  { id: "o5", name: "Đề ôn cấp Xã – Tiếng Anh", level: "xa", grade: "5", subject: "Tiếng Anh", chapter: "Chương 4. Đọc hiểu", date: "10/04/2026", timeRange: "14:00 – 14:40", minutes: 40, approval: "approved", effect: "done", registered: 58, attended: 55, originalCount: 1, permutedCodes: ["OXA51", "OXA52"] },
  { id: "o6", name: "Đề ôn cấp Sở số 1 – Toán", level: "so", grade: "5", subject: "Toán", chapter: "Chương 2. Số thập phân", date: "12/05/2026", timeRange: "07:30 – 08:30", minutes: 60, approval: "pending", effect: "upcoming", registered: 150, attended: 0, originalCount: 3, permutedCodes: ["OSO51", "OSO52", "OSO53", "OSO54"] },
  { id: "o7", name: "Đề ôn cấp Sở – Tiếng Việt", level: "so", grade: "5", subject: "Tiếng Việt", chapter: "Chương 4. Đọc hiểu", date: "20/02/2026", timeRange: "07:30 – 08:30", minutes: 60, approval: "approved", effect: "done", registered: 150, attended: 142, originalCount: 2, permutedCodes: ["OSOV1", "OSOV2", "OSOV3"] },
];

/* ----- Bổ sung thêm nhiều kỳ thi cho đủ 3 cấp × 3 hiệu lực ----- */
const MORE_OFFICIAL: ExamSession[] = [
  { id: "c8", name: "Kiểm tra định kỳ tháng 9 – Trường Tô Hiệu", level: "truong", grade: "5", subject: "Toán", chapter: "Chương 1. Ôn tập và bổ sung", date: "20/09/2026", timeRange: "07:30 – 08:10", minutes: 40, approval: "pending", effect: "upcoming", registered: 132, attended: 0, originalCount: 2, permutedCodes: ["TH511", "TH512", "TH513"], shift: { name: "Ca 1", start: "07:30", end: "08:10" } },
  { id: "c9", name: "Kiểm tra định kỳ tháng 10 – Trường Tô Hiệu", level: "truong", grade: "3", subject: "Tiếng Việt", chapter: "Chương 4. Đọc hiểu", date: "12/10/2026", timeRange: "08:00 – 08:40", minutes: 40, approval: "approved", effect: "upcoming", registered: 98, attended: 0, originalCount: 1, permutedCodes: ["TV311", "TV312"], shift: { name: "Ca 2", start: "08:00", end: "08:40" } },
  { id: "c10", name: "Khảo sát đầu năm – Trường Tô Hiệu (Tiếng Anh)", level: "truong", grade: "4", subject: "Tiếng Anh", chapter: "Chương 4. Đọc hiểu", date: "11/08/2026", timeRange: "09:00 – 09:45", minutes: 45, approval: "approved", effect: "ongoing", registered: 120, attended: 111, originalCount: 2, permutedCodes: ["TA401", "TA402", "TA403"], shift: { name: "Ca 1", start: "09:00", end: "09:45" } },
  { id: "c11", name: "Kiểm tra chuyên đề Toán – Trường Tô Hiệu", level: "truong", grade: "5", subject: "Toán", chapter: "Chương 3. Hình học", date: "11/08/2026", timeRange: "13:30 – 14:15", minutes: 45, approval: "approved", effect: "ongoing", registered: 132, attended: 126, originalCount: 3, permutedCodes: ["TH521", "TH522", "TH523", "TH524"] },
  { id: "c12", name: "Kiểm tra giữa kỳ I – Trường Tô Hiệu (Toán 5)", level: "truong", grade: "5", subject: "Toán", chapter: "Chương 2. Số thập phân", date: "28/10/2025", timeRange: "07:30 – 08:15", minutes: 45, approval: "approved", effect: "done", registered: 132, attended: 130, originalCount: 2, permutedCodes: ["TH531", "TH532", "TH533"] },
  { id: "c13", name: "Kiểm tra cuối kỳ I – Trường Tô Hiệu (Tiếng Anh)", level: "truong", grade: "4", subject: "Tiếng Anh", chapter: "Chương 4. Đọc hiểu", date: "26/12/2025", timeRange: "09:00 – 09:40", minutes: 40, approval: "approved", effect: "done", registered: 120, attended: 117, originalCount: 1, permutedCodes: ["TA411", "TA412"] },
  { id: "c14", name: "Kỳ thi cấp Xã – Học sinh giỏi Toán", level: "xa", grade: "5", subject: "Toán", chapter: "Chương 3. Hình học", date: "11/08/2026", timeRange: "07:30 – 08:30", minutes: 60, approval: "approved", effect: "ongoing", registered: 72, attended: 68, originalCount: 2, permutedCodes: ["XA511", "XA512", "XA513"] },
  { id: "c15", name: "Kỳ thi cấp Xã – Tiếng Anh", level: "xa", grade: "4", subject: "Tiếng Anh", chapter: "Chương 4. Đọc hiểu", date: "22/09/2026", timeRange: "08:00 – 08:50", minutes: 50, approval: "pending", effect: "upcoming", registered: 60, attended: 0, originalCount: 1, permutedCodes: ["XA421", "XA422"] },
  { id: "c16", name: "Kỳ thi cấp Sở – Học sinh giỏi Toán", level: "so", grade: "5", subject: "Toán", chapter: "Chương 3. Hình học", date: "05/10/2026", timeRange: "07:30 – 08:30", minutes: 60, approval: "pending", effect: "upcoming", registered: 150, attended: 0, originalCount: 2, permutedCodes: ["SO521", "SO522", "SO523"], shift: { name: "Ca 1", start: "07:30", end: "08:30" } },
  { id: "c17", name: "Khảo sát chất lượng đầu năm – Sở GD&ĐT", level: "so", grade: "4", subject: "Tiếng Việt", chapter: "Chương 4. Đọc hiểu", date: "11/08/2026", timeRange: "14:00 – 15:00", minutes: 60, approval: "approved", effect: "ongoing", registered: 144, attended: 138, originalCount: 3, permutedCodes: ["SO441", "SO442", "SO443", "SO444"] },
  { id: "c18", name: "Khảo sát chất lượng cuối kỳ I – Sở GD&ĐT", level: "so", grade: "4", subject: "Toán", chapter: "Chương 2. Số thập phân", date: "20/12/2025", timeRange: "07:30 – 08:30", minutes: 60, approval: "approved", effect: "done", registered: 144, attended: 141, originalCount: 2, permutedCodes: ["SO451", "SO452", "SO453"] },
];

const MORE_PRACTICE: ExamSession[] = [
  { id: "o8", name: "Đề ôn đầu năm – Trường Tô Hiệu (Toán 5)", level: "truong", grade: "5", subject: "Toán", chapter: "Chương 1. Ôn tập và bổ sung", date: "15/09/2026", timeRange: "07:30 – 08:10", minutes: 40, approval: "pending", effect: "upcoming", registered: 132, attended: 0, originalCount: 2, permutedCodes: ["OT511", "OT512", "OT513"] },
  { id: "o9", name: "Đề ôn chuyên đề Hình học – Trường Tô Hiệu", level: "truong", grade: "4", subject: "Toán", chapter: "Chương 3. Hình học", date: "02/10/2026", timeRange: "08:00 – 08:40", minutes: 40, approval: "approved", effect: "upcoming", registered: 120, attended: 0, originalCount: 1, permutedCodes: ["OT431", "OT432"] },
  { id: "o10", name: "Đề ôn Tiếng Anh – Trường Tô Hiệu", level: "truong", grade: "4", subject: "Tiếng Anh", chapter: "Chương 4. Đọc hiểu", date: "11/08/2026", timeRange: "09:30 – 10:10", minutes: 40, approval: "approved", effect: "ongoing", registered: 120, attended: 98, originalCount: 2, permutedCodes: ["OTA41", "OTA42", "OTA43"] },
  { id: "o11", name: "Đề ôn giữa kỳ I – Trường Tô Hiệu (Tiếng Việt 5)", level: "truong", grade: "5", subject: "Tiếng Việt", chapter: "Chương 4. Đọc hiểu", date: "30/10/2025", timeRange: "08:00 – 08:40", minutes: 40, approval: "approved", effect: "done", registered: 132, attended: 125, originalCount: 2, permutedCodes: ["OTV51", "OTV52", "OTV53"] },
  { id: "o12", name: "Đề ôn cuối kỳ I – Trường Tô Hiệu (Toán 3)", level: "truong", grade: "3", subject: "Toán", chapter: "Chương 1. Ôn tập và bổ sung", date: "18/12/2025", timeRange: "09:00 – 09:35", minutes: 35, approval: "approved", effect: "done", registered: 96, attended: 92, originalCount: 1, permutedCodes: ["OT331", "OT332"] },
  { id: "o13", name: "Đề ôn cấp Xã – Tiếng Việt", level: "xa", grade: "4", subject: "Tiếng Việt", chapter: "Chương 4. Đọc hiểu", date: "11/08/2026", timeRange: "15:00 – 15:40", minutes: 40, approval: "approved", effect: "ongoing", registered: 64, attended: 49, originalCount: 1, permutedCodes: ["OXV41", "OXV42"] },
  { id: "o14", name: "Đề ôn cấp Xã – Toán 5", level: "xa", grade: "5", subject: "Toán", chapter: "Chương 2. Số thập phân", date: "25/09/2026", timeRange: "07:30 – 08:15", minutes: 45, approval: "pending", effect: "upcoming", registered: 58, attended: 0, originalCount: 2, permutedCodes: ["OXT51", "OXT52", "OXT53"] },
  { id: "o15", name: "Đề ôn cấp Sở số 2 – Tiếng Việt", level: "so", grade: "4", subject: "Tiếng Việt", chapter: "Chương 4. Đọc hiểu", date: "11/08/2026", timeRange: "07:30 – 08:30", minutes: 60, approval: "approved", effect: "ongoing", registered: 144, attended: 130, originalCount: 2, permutedCodes: ["OSV41", "OSV42", "OSV43"] },
  { id: "o16", name: "Đề ôn cấp Sở – Toán 4", level: "so", grade: "4", subject: "Toán", chapter: "Chương 3. Hình học", date: "08/12/2025", timeRange: "07:30 – 08:30", minutes: 60, approval: "approved", effect: "done", registered: 144, attended: 139, originalCount: 3, permutedCodes: ["OST41", "OST42", "OST43", "OST44"] },
];

OFFICIAL_SESSIONS.push(...MORE_OFFICIAL);
PRACTICE_SESSIONS.push(...MORE_PRACTICE);

export const ALL_SESSIONS = [...OFFICIAL_SESSIONS, ...PRACTICE_SESSIONS];

export function getSession(id: string) {
  return ALL_SESSIONS.find((s) => s.id === id);
}

/** Danh sách đề gốc của một kỳ thi (sinh ổn định theo id). */
export function getOriginalPapers(session: ExamSession) {
  const prefix = session.permutedCodes[0]?.slice(0, 3) ?? "DE";
  return Array.from({ length: session.originalCount }, (_, i) => ({
    id: `${session.id}-g${i + 1}`,
    code: `${prefix}-G${i + 1}`,
    name: `Đề gốc số ${i + 1} – ${session.subject} khối ${session.grade}`,
  }));
}



/** Danh sách câu hỏi của một đề hoán vị (thứ tự xáo trộn ổn định theo mã đề). */
export function getPermutedPaper(session: ExamSession, code: string) {
  const seed = hash(session.id + code);
  const total = 10;
  const base = Array.from({ length: total }, (_, i) => ({
    no: i + 1,
    text: `Câu hỏi gốc số ${i + 1} – ${session.subject} khối ${session.grade}`,
    type: i % 4 === 3 ? "Tự luận" : i % 3 === 1 ? "Đúng/Sai" : "Trắc nghiệm",
    score: i % 4 === 3 ? 2 : 1,
  }));
  const order = base
    .map((q, i) => ({ q, k: (seed + i * 7919) % 997 }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.q);
  return { code, questions: order };
}

/* ---------------- Thí sinh (sinh dữ liệu ổn định theo id) ---------------- */

export type CandidateStatus = "absent" | "submitted" | "doing" | "failed";

export const CANDIDATE_STATUS_META: Record<CandidateStatus, { label: string; color: string }> = {
  absent: { label: "Chưa vào thi, vắng thi", color: "#2563eb" },
  submitted: { label: "Đã nộp bài", color: "#10b981" },
  doing: { label: "Đang thi", color: "#f59e0b" },
  failed: { label: "Lỗi không nộp được bài", color: "#ef4444" },
};

export type Candidate = {
  stt: number;
  name: string;
  cccd: string;
  klass: string;
  startAt: string;
  submitAt: string;
  score: number | null;
  violations: number;
  finalScore: number | null;
  status: CandidateStatus;
};

const FIRST = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Đỗ", "Vũ", "Bùi", "Đặng", "Ngô"];
const MID = ["Văn", "Thị", "Minh", "Quang", "Khánh", "Gia", "Hải", "Thu"];
const LAST = ["An", "Bình", "Chi", "Dũng", "Hà", "Khang", "Linh", "Mai", "Nam", "Phúc", "Quân", "Trang"];

function hash(s: string) {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100000;
  return h;
}

export function getCandidates(session: ExamSession): Candidate[] {
  const base = hash(session.id);
  const n = Math.min(session.registered, 24);
  const attendedRatio = session.registered ? session.attended / session.registered : 0;
  return Array.from({ length: n }, (_, i) => {
    const r = (base + i * 37) % 100;
    const attended = i < Math.round(n * attendedRatio);
    const status: CandidateStatus = !attended
      ? "absent"
      : session.effect === "ongoing"
        ? (r % 9 === 0 ? "failed" : r % 3 === 0 ? "submitted" : "doing")
        : "submitted";
    const scored = status === "submitted" && session.effect !== "upcoming";
    const score = scored ? Math.round((4 + (r % 61) / 10) * 10) / 10 : null;
    const violations = attended ? (r % 7 === 0 ? 1 : r % 23 === 0 ? 2 : 0) : 0;
    const finalScore = score === null ? null : Math.max(0, Math.round((score - violations * 0.5) * 10) / 10);
    const [start] = session.timeRange.split(" – ");
    const mm = String((Number(start.slice(3, 5)) + (r % 12)) % 60).padStart(2, "0");
    return {
      stt: i + 1,
      name: `${FIRST[r % FIRST.length]} ${MID[(r + i) % MID.length]} ${LAST[(r + i * 3) % LAST.length]}`,
      cccd: String(1000000000 + ((base * 7919 + i * 104729) % 899999999)),
      klass: `${session.grade}${"ABCD"[(r + i) % 4]}`,
      startAt: attended ? `${session.date} ${start}` : "—",
      submitAt: status === "submitted" ? `${session.date} ${start.slice(0, 3)}${mm}` : "—",
      score,
      violations,
      finalScore,
      status,
    };
  });
}
