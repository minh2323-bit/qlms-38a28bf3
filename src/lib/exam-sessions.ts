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
  /** Các ca thi do GV thiết lập (nếu có) – hiển thị thay cho thời gian tổ chức mặc định. */
  shifts?: { name: string; start: string; end: string }[];
  /** Cấp Xã/Phường: hạn đăng ký thí sinh (dd/mm/yyyy HH:mm) */
  regDeadline?: string;
  /** Cấp Xã/Phường: số thí sinh của trường đã dự thi/được cử */
  schoolCandidates?: number;
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
  { id: "c1", name: "Kiểm tra cuối kỳ II – Trường Tô Hiệu", level: "truong", grade: "4", subject: "Toán", chapter: "Chương 2. Số thập phân", date: "10/05/2026", timeRange: "07:30 – 08:15", minutes: 45, approval: "approved", effect: "upcoming", registered: 120, attended: 0, originalCount: 2, permutedCodes: ["TH401", "TH402", "TH403", "TH404"], shifts: [{ name: "Ca 1", start: "07:30", end: "08:15" }, { name: "Ca 2", start: "08:30", end: "09:15" }, { name: "Ca 3", start: "09:30", end: "10:15" }] },
  { id: "c2", name: "Kiểm tra giữa kỳ II – Trường Tô Hiệu", level: "truong", grade: "4", subject: "Tiếng Việt", chapter: "Chương 4. Đọc hiểu", date: "05/03/2026", timeRange: "08:00 – 08:40", minutes: 40, approval: "approved", effect: "done", registered: 120, attended: 118, originalCount: 1, permutedCodes: ["TV401", "TV402"] },
  { id: "c3", name: "Kiểm tra cuối kỳ I – Trường Tô Hiệu", level: "truong", grade: "3", subject: "Toán", chapter: "Chương 1. Ôn tập và bổ sung", date: "22/12/2025", timeRange: "09:00 – 09:40", minutes: 40, approval: "approved", effect: "done", registered: 96, attended: 95, originalCount: 2, permutedCodes: ["TH301", "TH302", "TH303"] },
  { id: "c4", name: "Kỳ thi cấp Xã – Môn Toán", level: "xa", grade: "4", subject: "Toán", chapter: "Chương 3. Hình học", date: "15/05/2026", timeRange: "07:30 – 08:30", minutes: 60, approval: "pending", effect: "upcoming", registered: 64, attended: 0, originalCount: 1, permutedCodes: ["XA401", "XA402"], regDeadline: "15/05/2026 17:00", schoolCandidates: 22 },
  { id: "c5", name: "Kỳ thi cấp Xã – Môn Tiếng Việt", level: "xa", grade: "5", subject: "Tiếng Việt", chapter: "Chương 4. Đọc hiểu", date: "18/04/2026", timeRange: "07:30 – 08:30", minutes: 60, approval: "approved", effect: "done", registered: 58, attended: 57, originalCount: 2, permutedCodes: ["XA501", "XA502", "XA503"], regDeadline: "18/04/2026 17:00", schoolCandidates: 20 },
  { id: "c6", name: "Khảo sát chất lượng cuối kỳ – Sở GD&ĐT", level: "so", grade: "5", subject: "Toán", chapter: "Chương 2. Số thập phân", date: "11/08/2026", timeRange: "07:30 – 08:30", minutes: 60, approval: "approved", effect: "ongoing", registered: 150, attended: 143, originalCount: 3, permutedCodes: ["SO501", "SO502", "SO503", "SO504", "SO505", "SO506"] },
  { id: "c7", name: "Khảo sát chất lượng giữa kỳ – Sở GD&ĐT", level: "so", grade: "5", subject: "Tiếng Việt", chapter: "Chương 4. Đọc hiểu", date: "12/03/2026", timeRange: "14:00 – 15:00", minutes: 60, approval: "approved", effect: "done", registered: 150, attended: 147, originalCount: 2, permutedCodes: ["SO511", "SO512", "SO513"] },
];

export const PRACTICE_SESSIONS: ExamSession[] = [
  { id: "o1", name: "Đề ôn cuối kỳ – Trường Tô Hiệu (Toán)", level: "truong", grade: "4", subject: "Toán", chapter: "Chương 2. Số thập phân", date: "11/08/2026", timeRange: "07:00 – 07:45", minutes: 45, approval: "approved", effect: "ongoing", registered: 120, attended: 104, originalCount: 1, permutedCodes: ["OT401", "OT402"] },
  { id: "o2", name: "Đề ôn cuối kỳ – Trường Tô Hiệu (Tiếng Việt)", level: "truong", grade: "4", subject: "Tiếng Việt", chapter: "Chương 4. Đọc hiểu", date: "28/04/2026", timeRange: "08:00 – 08:40", minutes: 40, approval: "approved", effect: "done", registered: 120, attended: 112, originalCount: 2, permutedCodes: ["OTV41", "OTV42", "OTV43"] },
  { id: "o3", name: "Đề ôn giữa kỳ – Trường Tô Hiệu (Toán 3)", level: "truong", grade: "3", subject: "Toán", chapter: "Chương 1. Ôn tập và bổ sung", date: "18/02/2026", timeRange: "09:00 – 09:35", minutes: 35, approval: "pending", effect: "done", registered: 96, attended: 88, originalCount: 1, permutedCodes: ["OT301", "OT302"] },
  { id: "o4", name: "Đề ôn cấp Xã – Toán", level: "xa", grade: "4", subject: "Toán", chapter: "Chương 3. Hình học", date: "11/08/2026", timeRange: "13:30 – 14:15", minutes: 45, approval: "approved", effect: "ongoing", registered: 64, attended: 51, originalCount: 2, permutedCodes: ["OXA41", "OXA42", "OXA43"], regDeadline: "11/08/2026 17:00", schoolCandidates: 22 },
  { id: "o5", name: "Đề ôn cấp Xã – Tiếng Anh", level: "xa", grade: "5", subject: "Tiếng Anh", chapter: "Chương 4. Đọc hiểu", date: "10/04/2026", timeRange: "14:00 – 14:40", minutes: 40, approval: "approved", effect: "done", registered: 58, attended: 55, originalCount: 1, permutedCodes: ["OXA51", "OXA52"], regDeadline: "10/04/2026 17:00", schoolCandidates: 20 },
  { id: "o6", name: "Đề ôn cấp Sở số 1 – Toán", level: "so", grade: "5", subject: "Toán", chapter: "Chương 2. Số thập phân", date: "12/05/2026", timeRange: "07:30 – 08:30", minutes: 60, approval: "pending", effect: "upcoming", registered: 150, attended: 0, originalCount: 3, permutedCodes: ["OSO51", "OSO52", "OSO53", "OSO54"] },
  { id: "o7", name: "Đề ôn cấp Sở – Tiếng Việt", level: "so", grade: "5", subject: "Tiếng Việt", chapter: "Chương 4. Đọc hiểu", date: "20/02/2026", timeRange: "07:30 – 08:30", minutes: 60, approval: "approved", effect: "done", registered: 150, attended: 142, originalCount: 2, permutedCodes: ["OSOV1", "OSOV2", "OSOV3"] },
];

/* ----- Bổ sung thêm nhiều kỳ thi cho đủ 3 cấp × 3 hiệu lực ----- */
const MORE_OFFICIAL: ExamSession[] = [
  { id: "c8", name: "Kiểm tra định kỳ tháng 9 – Trường Tô Hiệu", level: "truong", grade: "5", subject: "Toán", chapter: "Chương 1. Ôn tập và bổ sung", date: "20/09/2026", timeRange: "07:30 – 08:10", minutes: 40, approval: "pending", effect: "upcoming", registered: 132, attended: 0, originalCount: 2, permutedCodes: ["TH511", "TH512", "TH513"], shifts: [{ name: "Ca 1", start: "07:30", end: "08:10" }, { name: "Ca 2", start: "08:20", end: "09:00" }] },
  { id: "c9", name: "Kiểm tra định kỳ tháng 10 – Trường Tô Hiệu", level: "truong", grade: "3", subject: "Tiếng Việt", chapter: "Chương 4. Đọc hiểu", date: "12/10/2026", timeRange: "08:00 – 08:40", minutes: 40, approval: "approved", effect: "upcoming", registered: 98, attended: 0, originalCount: 1, permutedCodes: ["TV311", "TV312"], shifts: [{ name: "Ca 1", start: "07:00", end: "07:40" }, { name: "Ca 2", start: "08:00", end: "08:40" }, { name: "Ca 3", start: "09:00", end: "09:40" }, { name: "Ca 4", start: "10:00", end: "10:40" }] },
  { id: "c10", name: "Khảo sát đầu năm – Trường Tô Hiệu (Tiếng Anh)", level: "truong", grade: "4", subject: "Tiếng Anh", chapter: "Chương 4. Đọc hiểu", date: "11/08/2026", timeRange: "09:00 – 09:45", minutes: 45, approval: "approved", effect: "ongoing", registered: 120, attended: 111, originalCount: 2, permutedCodes: ["TA401", "TA402", "TA403"], shifts: [{ name: "Ca 1", start: "09:00", end: "09:45" }, { name: "Ca 2", start: "10:00", end: "10:45" }] },
  { id: "c11", name: "Kiểm tra chuyên đề Toán – Trường Tô Hiệu", level: "truong", grade: "5", subject: "Toán", chapter: "Chương 3. Hình học", date: "11/08/2026", timeRange: "13:30 – 14:15", minutes: 45, approval: "approved", effect: "ongoing", registered: 132, attended: 126, originalCount: 3, permutedCodes: ["TH521", "TH522", "TH523", "TH524"] },
  { id: "c12", name: "Kiểm tra giữa kỳ I – Trường Tô Hiệu (Toán 5)", level: "truong", grade: "5", subject: "Toán", chapter: "Chương 2. Số thập phân", date: "28/10/2025", timeRange: "07:30 – 08:15", minutes: 45, approval: "approved", effect: "done", registered: 132, attended: 130, originalCount: 2, permutedCodes: ["TH531", "TH532", "TH533"] },
  { id: "c13", name: "Kiểm tra cuối kỳ I – Trường Tô Hiệu (Tiếng Anh)", level: "truong", grade: "4", subject: "Tiếng Anh", chapter: "Chương 4. Đọc hiểu", date: "26/12/2025", timeRange: "09:00 – 09:40", minutes: 40, approval: "approved", effect: "done", registered: 120, attended: 117, originalCount: 1, permutedCodes: ["TA411", "TA412"] },
  { id: "c14", name: "Kỳ thi cấp Xã – Học sinh giỏi Toán", level: "xa", grade: "5", subject: "Toán", chapter: "Chương 3. Hình học", date: "11/08/2026", timeRange: "07:30 – 08:30", minutes: 60, approval: "approved", effect: "ongoing", registered: 72, attended: 68, originalCount: 2, permutedCodes: ["XA511", "XA512", "XA513"], regDeadline: "11/08/2026 17:00", schoolCandidates: 25 },
  { id: "c15", name: "Kỳ thi cấp Xã – Tiếng Anh", level: "xa", grade: "4", subject: "Tiếng Anh", chapter: "Chương 4. Đọc hiểu", date: "22/09/2026", timeRange: "08:00 – 08:50", minutes: 50, approval: "pending", effect: "upcoming", registered: 60, attended: 0, originalCount: 1, permutedCodes: ["XA421", "XA422"], regDeadline: "22/09/2026 17:00", schoolCandidates: 21 },
  { id: "c16", name: "Kỳ thi cấp Sở – Học sinh giỏi Toán", level: "so", grade: "5", subject: "Toán", chapter: "Chương 3. Hình học", date: "05/10/2026", timeRange: "07:30 – 08:30", minutes: 60, approval: "pending", effect: "upcoming", registered: 150, attended: 0, originalCount: 2, permutedCodes: ["SO521", "SO522", "SO523"], shifts: [{ name: "Ca 1", start: "07:30", end: "08:30" }, { name: "Ca 2", start: "09:00", end: "10:00" }] },
  { id: "c17", name: "Khảo sát chất lượng đầu năm – Sở GD&ĐT", level: "so", grade: "4", subject: "Tiếng Việt", chapter: "Chương 4. Đọc hiểu", date: "11/08/2026", timeRange: "14:00 – 15:00", minutes: 60, approval: "approved", effect: "ongoing", registered: 144, attended: 138, originalCount: 3, permutedCodes: ["SO441", "SO442", "SO443", "SO444"] },
  { id: "c18", name: "Khảo sát chất lượng cuối kỳ I – Sở GD&ĐT", level: "so", grade: "4", subject: "Toán", chapter: "Chương 2. Số thập phân", date: "20/12/2025", timeRange: "07:30 – 08:30", minutes: 60, approval: "approved", effect: "done", registered: 144, attended: 141, originalCount: 2, permutedCodes: ["SO451", "SO452", "SO453"] },
];

const MORE_PRACTICE: ExamSession[] = [
  { id: "o8", name: "Đề ôn đầu năm – Trường Tô Hiệu (Toán 5)", level: "truong", grade: "5", subject: "Toán", chapter: "Chương 1. Ôn tập và bổ sung", date: "15/09/2026", timeRange: "07:30 – 08:10", minutes: 40, approval: "pending", effect: "upcoming", registered: 132, attended: 0, originalCount: 2, permutedCodes: ["OT511", "OT512", "OT513"] },
  { id: "o9", name: "Đề ôn chuyên đề Hình học – Trường Tô Hiệu", level: "truong", grade: "4", subject: "Toán", chapter: "Chương 3. Hình học", date: "02/10/2026", timeRange: "08:00 – 08:40", minutes: 40, approval: "approved", effect: "upcoming", registered: 120, attended: 0, originalCount: 1, permutedCodes: ["OT431", "OT432"] },
  { id: "o10", name: "Đề ôn Tiếng Anh – Trường Tô Hiệu", level: "truong", grade: "4", subject: "Tiếng Anh", chapter: "Chương 4. Đọc hiểu", date: "11/08/2026", timeRange: "09:30 – 10:10", minutes: 40, approval: "approved", effect: "ongoing", registered: 120, attended: 98, originalCount: 2, permutedCodes: ["OTA41", "OTA42", "OTA43"] },
  { id: "o11", name: "Đề ôn giữa kỳ I – Trường Tô Hiệu (Tiếng Việt 5)", level: "truong", grade: "5", subject: "Tiếng Việt", chapter: "Chương 4. Đọc hiểu", date: "30/10/2025", timeRange: "08:00 – 08:40", minutes: 40, approval: "approved", effect: "done", registered: 132, attended: 125, originalCount: 2, permutedCodes: ["OTV51", "OTV52", "OTV53"] },
  { id: "o12", name: "Đề ôn cuối kỳ I – Trường Tô Hiệu (Toán 3)", level: "truong", grade: "3", subject: "Toán", chapter: "Chương 1. Ôn tập và bổ sung", date: "18/12/2025", timeRange: "09:00 – 09:35", minutes: 35, approval: "approved", effect: "done", registered: 96, attended: 92, originalCount: 1, permutedCodes: ["OT331", "OT332"] },
  { id: "o13", name: "Đề ôn cấp Xã – Tiếng Việt", level: "xa", grade: "4", subject: "Tiếng Việt", chapter: "Chương 4. Đọc hiểu", date: "11/08/2026", timeRange: "15:00 – 15:40", minutes: 40, approval: "approved", effect: "ongoing", registered: 64, attended: 49, originalCount: 1, permutedCodes: ["OXV41", "OXV42"], regDeadline: "11/08/2026 17:00", schoolCandidates: 22 },
  { id: "o14", name: "Đề ôn cấp Xã – Toán 5", level: "xa", grade: "5", subject: "Toán", chapter: "Chương 2. Số thập phân", date: "25/09/2026", timeRange: "07:30 – 08:15", minutes: 45, approval: "pending", effect: "upcoming", registered: 58, attended: 0, originalCount: 2, permutedCodes: ["OXT51", "OXT52", "OXT53"], regDeadline: "25/09/2026 17:00", schoolCandidates: 20 },
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



export type PaperQuestion = {
  no: number;
  text: string;
  type: string;
  score: number;
  options?: { key: string; text: string }[];
  answer: string;
  explain: string;
};

const QUESTION_POOL: Record<string, Omit<PaperQuestion, "no">[]> = {
  "Toán": [
    { text: "Số lớn nhất trong các số 3 210; 3 120; 3 201; 3 102 là số nào?", type: "Trắc nghiệm", score: 1, options: [{ key: "A", text: "3 210" }, { key: "B", text: "3 120" }, { key: "C", text: "3 201" }, { key: "D", text: "3 102" }], answer: "A. 3 210", explain: "So sánh lần lượt các chữ số từ hàng nghìn: cùng 3 nghìn, so hàng trăm 2 = 2 > 1, sau đó hàng chục 1 > 0." },
    { text: "Kết quả của phép tính 1 245 + 3 678 là bao nhiêu?", type: "Trắc nghiệm", score: 1, options: [{ key: "A", text: "4 823" }, { key: "B", text: "4 923" }, { key: "C", text: "4 913" }, { key: "D", text: "5 923" }], answer: "B. 4 923", explain: "1 245 + 3 678 = 4 923 (cộng lần lượt từ hàng đơn vị, nhớ 1 sang hàng chục và hàng trăm)." },
    { text: "Một hình chữ nhật có chiều dài 12 cm, chiều rộng 7 cm. Chu vi hình chữ nhật đó là:", type: "Trắc nghiệm", score: 1, options: [{ key: "A", text: "19 cm" }, { key: "B", text: "38 cm" }, { key: "C", text: "84 cm" }, { key: "D", text: "42 cm" }], answer: "B. 38 cm", explain: "Chu vi = (12 + 7) × 2 = 38 (cm)." },
    { text: "Các phát biểu sau đúng hay sai? a) Mọi số chia hết cho 10 đều chia hết cho 5. b) Số 0 là số lẻ.", type: "Đúng/Sai", score: 1, answer: "a) Đúng – b) Sai", explain: "Số chia hết cho 10 luôn có tận cùng là 0 nên chia hết cho 5. Số 0 là số chẵn." },
    { text: "Điền số thích hợp vào chỗ trống: 45 × ... = 450", type: "Điền khuyết", score: 1, answer: "10", explain: "450 : 45 = 10." },
    { text: "Một cửa hàng có 5 thùng sữa, mỗi thùng 24 hộp. Cửa hàng đã bán 37 hộp. Hỏi còn lại bao nhiêu hộp sữa?", type: "Tự luận", score: 2, answer: "83 hộp", explain: "Tổng số hộp: 5 × 24 = 120 (hộp). Số hộp còn lại: 120 − 37 = 83 (hộp)." },
    { text: "Phân số nào dưới đây bằng phân số 2/4?", type: "Trắc nghiệm", score: 1, options: [{ key: "A", text: "1/2" }, { key: "B", text: "2/3" }, { key: "C", text: "3/4" }, { key: "D", text: "4/6" }], answer: "A. 1/2", explain: "Rút gọn 2/4 bằng cách chia cả tử và mẫu cho 2 được 1/2." },
    { text: "Số thập phân 3,05 đọc là:", type: "Trắc nghiệm", score: 1, options: [{ key: "A", text: "Ba phẩy năm" }, { key: "B", text: "Ba phẩy không năm" }, { key: "C", text: "Ba mươi lăm" }, { key: "D", text: "Ba phẩy năm mươi" }], answer: "B. Ba phẩy không năm", explain: "Phần thập phân gồm hai chữ số 0 và 5 nên đọc là “không năm”." },
    { text: "Trình bày cách tìm hai số khi biết tổng của chúng là 48 và hiệu là 12.", type: "Tự luận", score: 2, answer: "Số lớn 30, số bé 18", explain: "Số lớn = (48 + 12) : 2 = 30; số bé = 30 − 12 = 18." },
    { text: "Sắp xếp các số sau theo thứ tự tăng dần: 5,7 ; 5,07 ; 5,70 ; 5,007", type: "Sắp xếp", score: 1, answer: "5,007 < 5,07 < 5,7 = 5,70", explain: "So sánh phần thập phân theo từng hàng: phần mười, phần trăm, phần nghìn." },
  ],
  "Tiếng Việt": [
    { text: "Từ nào dưới đây là từ láy?", type: "Trắc nghiệm", score: 1, options: [{ key: "A", text: "bạn bè" }, { key: "B", text: "lung linh" }, { key: "C", text: "sách vở" }, { key: "D", text: "học hành" }], answer: "B. lung linh", explain: "“lung linh” lặp lại âm đầu l – đây là từ láy; các từ còn lại là từ ghép." },
    { text: "Câu “Trên cành cây, những chú chim hót líu lo.” thuộc kiểu câu nào?", type: "Trắc nghiệm", score: 1, options: [{ key: "A", text: "Câu kể" }, { key: "B", text: "Câu hỏi" }, { key: "C", text: "Câu cảm" }, { key: "D", text: "Câu khiến" }], answer: "A. Câu kể", explain: "Câu dùng để kể lại sự việc, kết thúc bằng dấu chấm." },
    { text: "Xác định chủ ngữ trong câu: “Những cánh diều no gió bay cao trên bầu trời.”", type: "Điền khuyết", score: 1, answer: "Những cánh diều no gió", explain: "Bộ phận trả lời câu hỏi “Cái gì bay cao?”." },
    { text: "Các nhận định sau đúng hay sai? a) Danh từ chỉ sự vật. b) Động từ chỉ đặc điểm của sự vật.", type: "Đúng/Sai", score: 1, answer: "a) Đúng – b) Sai", explain: "Động từ chỉ hoạt động, trạng thái; chỉ đặc điểm là tính từ." },
    { text: "Tìm và ghi lại một hình ảnh so sánh trong câu: “Mặt trời đỏ rực như quả cầu lửa.”", type: "Tự luận", score: 2, answer: "Mặt trời … như quả cầu lửa", explain: "Hình ảnh so sánh dùng từ “như” để so sánh mặt trời với quả cầu lửa." },
    { text: "Từ trái nghĩa với “chăm chỉ” là:", type: "Trắc nghiệm", score: 1, options: [{ key: "A", text: "siêng năng" }, { key: "B", text: "cần cù" }, { key: "C", text: "lười biếng" }, { key: "D", text: "chịu khó" }], answer: "C. lười biếng", explain: "Các từ còn lại đều đồng nghĩa với “chăm chỉ”." },
    { text: "Dấu câu nào thích hợp điền vào cuối câu: “Bạn có thích đọc sách không ...”", type: "Điền khuyết", score: 1, answer: "Dấu chấm hỏi (?)", explain: "Đây là câu hỏi nên kết thúc bằng dấu chấm hỏi." },
    { text: "Viết đoạn văn 3 – 5 câu tả một người bạn thân của em.", type: "Tự luận", score: 2, answer: "Đoạn văn đủ ý: giới thiệu bạn, tả ngoại hình, tính cách, tình cảm của em", explain: "Chấm theo tiêu chí: đủ số câu, đúng chủ đề, dùng từ ngữ gợi tả, không sai chính tả." },
    { text: "Sắp xếp các câu sau thành đoạn văn hoàn chỉnh: (1) Em rất yêu quý chú. (2) Nhà em có nuôi một chú mèo. (3) Chú có bộ lông trắng muốt.", type: "Sắp xếp", score: 1, answer: "(2) – (3) – (1)", explain: "Trình tự: giới thiệu – miêu tả – nêu tình cảm." },
    { text: "Nối từ ở cột A với nghĩa đúng ở cột B: “nhân hậu” – “dũng cảm”.", type: "Nối từ", score: 1, answer: "nhân hậu = giàu lòng thương người; dũng cảm = gan dạ, không sợ nguy hiểm", explain: "Dựa vào nghĩa gốc của mỗi từ trong từ điển Tiếng Việt tiểu học." },
  ],
  "Tiếng Anh": [
    { text: "Choose the correct answer: She ___ to school every morning.", type: "Trắc nghiệm", score: 1, options: [{ key: "A", text: "go" }, { key: "B", text: "goes" }, { key: "C", text: "going" }, { key: "D", text: "gone" }], answer: "B. goes", explain: "Chủ ngữ ngôi thứ ba số ít ở thì hiện tại đơn nên động từ thêm -es." },
    { text: "What is the plural form of “child”?", type: "Trắc nghiệm", score: 1, options: [{ key: "A", text: "childs" }, { key: "B", text: "childes" }, { key: "C", text: "children" }, { key: "D", text: "childrens" }], answer: "C. children", explain: "“child” là danh từ số nhiều bất quy tắc." },
    { text: "Fill in the blank: There ___ four books on the table.", type: "Điền khuyết", score: 1, answer: "are", explain: "Danh từ số nhiều “books” đi với “are”." },
    { text: "True or False? a) “Monday” is the first day of the school week. b) “Winter” is a month.", type: "Đúng/Sai", score: 1, answer: "a) True – b) False", explain: "“Winter” là một mùa (season), không phải tháng." },
    { text: "Write 2 – 3 sentences about your favourite subject.", type: "Tự luận", score: 2, answer: "Ví dụ: My favourite subject is Maths. I like it because it is interesting.", explain: "Chấm theo tiêu chí: đúng cấu trúc câu, đúng chính tả, đủ số câu." },
    { text: "Choose the odd one out.", type: "Trắc nghiệm", score: 1, options: [{ key: "A", text: "apple" }, { key: "B", text: "banana" }, { key: "C", text: "orange" }, { key: "D", text: "table" }], answer: "D. table", explain: "Ba từ còn lại là trái cây." },
    { text: "Match the questions with the answers: “How old are you?” – “I'm nine years old.”", type: "Nối từ", score: 1, answer: "How old are you? → I'm nine years old.", explain: "Câu hỏi về tuổi được trả lời bằng số tuổi." },
    { text: "Put the words in order: /  is / name / My / Nam /", type: "Sắp xếp", score: 1, answer: "My name is Nam.", explain: "Trật tự câu: chủ ngữ – động từ to be – bổ ngữ." },
    { text: "Complete: I ___ (not like) fish.", type: "Điền khuyết", score: 1, answer: "don't like", explain: "Phủ định thì hiện tại đơn với chủ ngữ “I” dùng “don't”." },
    { text: "Write about your family (3 sentences).", type: "Tự luận", score: 2, answer: "Ví dụ: There are four people in my family...", explain: "Chấm theo tiêu chí: đủ ý, đúng ngữ pháp cơ bản." },
  ],
};

/** Danh sách câu hỏi của một đề hoán vị (thứ tự xáo trộn ổn định theo mã đề). */
export function getPermutedPaper(session: ExamSession, code: string) {
  const seed = hash(session.id + code);
  const pool = QUESTION_POOL[session.subject] ?? QUESTION_POOL["Toán"];
  const base: PaperQuestion[] = pool.map((q, i) => ({ ...q, no: i + 1 }));
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
