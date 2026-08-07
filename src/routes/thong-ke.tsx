import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  BookOpen, ClipboardList, FileText, Video, Clock, Award, BadgeCheck, FileCheck2,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
} from "recharts";

export const Route = createFileRoute("/thong-ke")({
  head: () => ({
    meta: [
      { title: "Thống kê hoạt động giảng dạy – QLMS" },
      { name: "description", content: "Tổng hợp hoạt động giảng dạy của bạn và kết quả học tập của học sinh theo từng lớp." },
      { property: "og:title", content: "Thống kê hoạt động giảng dạy – QLMS" },
      { property: "og:description", content: "Tổng hợp hoạt động giảng dạy của bạn và kết quả học tập của học sinh theo từng lớp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

/* ---------------- Mock data ---------------- */
const OVERVIEW = [
  { label: "Học liệu đã tải lên", value: 148, sub: "+30 học liệu so với 30 ngày gần nhất", icon: Video, color: "bg-sky-50 text-sky-600" },
  { label: "Bài giảng đã tạo", value: 32, sub: "+30 học liệu so với 30 ngày gần nhất", icon: BookOpen, color: "bg-indigo-50 text-indigo-600" },
  { label: "Học liệu bản quyền đã sử dụng", value: 148, sub: "Từ kho bản quyền của trường", icon: BadgeCheck, color: "bg-violet-50 text-violet-600" },
  { label: "Lớp trực tuyến đã tổ chức", value: 18, sub: "Tổng 24 giờ dạy", icon: Clock, color: "bg-teal-50 text-teal-600" },
  { label: "Câu hỏi trong ngân hàng", value: 386, sub: "112 đã chia sẻ nội bộ", icon: Award, color: "bg-rose-50 text-rose-600" },
  { label: "Đề kiểm tra", value: 21, sub: "8 đề sinh từ ma trận", icon: FileText, color: "bg-emerald-50 text-emerald-600" },
  { label: "Bài kiểm tra đã tạo", value: 57, sub: "42 đã chấm xong", icon: FileCheck2, color: "bg-amber-50 text-amber-600" },
  { label: "Bài tập / nhiệm vụ đã giao", value: 57, sub: "42 đã chấm xong", icon: ClipboardList, color: "bg-orange-50 text-orange-600" },
];

const MONTHLY = [
  { month: "T1", baiGiang: 3, baiTap: 5, kiemTra: 2 },
  { month: "T2", baiGiang: 4, baiTap: 7, kiemTra: 1 },
  { month: "T3", baiGiang: 6, baiTap: 8, kiemTra: 3 },
  { month: "T4", baiGiang: 5, baiTap: 6, kiemTra: 2 },
  { month: "T5", baiGiang: 7, baiTap: 11, kiemTra: 4 },
  { month: "T6", baiGiang: 7, baiTap: 9, kiemTra: 3 },
];

const MATERIAL_MIX = [
  { name: "Video", value: 46 },
  { name: "Bài giảng", value: 38 },
  { name: "Tài liệu", value: 34 },
  { name: "Phiếu bài tập", value: 18 },
  { name: "Khác", value: 12 },
];

const QUESTION_MIX = [
  { name: "Trắc nghiệm 1 đáp án", value: 146 },
  { name: "Đúng - Sai", value: 82 },
  { name: "Điền khuyết", value: 64 },
  { name: "Nối / Kéo thả", value: 52 },
  { name: "Tự luận", value: 42 },
];

const PIE_COLORS = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#f43f5e"];

type Row = {
  name: string; viewed: number; minutes: number; done: number; total: number;
  avg: number; testDone: number; testTotal: number; testAvg: number; subject: string;
};

const SUBJECTS = ["Toán", "Tiếng Việt", "Tiếng Anh", "Khoa học"];

function seedRows(names: string[], seed: number): Row[] {
  return names.map((name, i) => {
    const k = (i * 7 + seed * 13) % 17;
    return {
      name,
      viewed: 12 + k * 2,
      minutes: 180 + k * 23,
      done: 8 + (k % 9),
      total: 18,
      avg: Math.round((6 + (k % 5) + (k % 3) * 0.4) * 10) / 10,
      testDone: 3 + (k % 6),
      testTotal: 9,
      testAvg: Math.round((6.5 + (k % 4) + (k % 2) * 0.5) * 10) / 10,
      subject: SUBJECTS[(i + seed) % SUBJECTS.length],
    };
  });
}

const CLASS_STUDENTS: Record<string, Row[]> = {
  "4A": seedRows([
    "Trần Đăng Khôi", "Lê Minh Đức", "Phạm Đức Duy", "Nguyễn Thu Hà", "Đỗ Bảo Ngọc",
    "Vũ Gia Hân", "Hoàng Nam Anh", "Bùi Khánh Linh", "Ngô Tuấn Kiệt", "Lý Thanh Mai",
  ], 1),
  "4B": seedRows([
    "Đinh Quang Huy", "Trịnh Mỹ Duyên", "Phan Nhật Minh", "Cao Thùy Dương", "Tạ Anh Quân",
    "Dương Hải Yến", "Lâm Bảo Long", "Hồ Ngọc Diệp",
  ], 2),
  "4C": seedRows([
    "Nguyễn Bảo Trâm", "Trần Quốc Bảo", "Lê Hải Đăng", "Phạm Yến Nhi", "Đặng Minh Quang",
    "Vương Thu Trang", "Tô Gia Bách",
  ], 5),
  "3A": seedRows([
    "Mai Đức Anh", "Chu Phương Thảo", "Đặng Gia Bảo", "Trương Hà My", "Lưu Minh Khang",
    "Võ Thị Kim Chi", "Nguyễn Đình Phong",
  ], 3),
  "3B": seedRows([
    "Hoàng Thảo Vy", "Nguyễn Tiến Dũng", "Phạm Bảo Châu", "Đỗ Hữu Nam", "Lê Khánh Vân",
    "Trần Gia Huy",
  ], 6),
  "3C": seedRows([
    "Bùi Thanh Tú", "Nguyễn Hà Linh", "Vũ Đình Trọng", "Phan Mỹ Anh", "Lý Quốc Khánh",
    "Đào Thu Uyên",
  ], 7),
  "3D": seedRows([
    "Ngô Bảo Khang", "Trịnh Thùy Linh", "Đỗ Minh Tâm", "Nguyễn Phúc An", "Hà Diệu Linh",
    "Lê Tuấn Tài", "Phạm Ngọc Ánh",
  ], 4),
};

const CLASS_ORDER = ["4A", "4B", "4C", "3A", "3B", "3C", "3D"];

/* ---------------- Page ---------------- */
function Page() {
  const [cls, setCls] = useState(CLASS_ORDER[0]);
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]);

  const rows = useMemo(() => {
    const list = CLASS_STUDENTS[cls] ?? [];
    return list.filter(
      (r) =>
        r.name.toLowerCase().includes(q.trim().toLowerCase()) &&
        r.subject === subject,
    );
  }, [cls, q, subject]);

  const summary = useMemo(() => {
    const list = CLASS_STUDENTS[cls] ?? [];
    if (!list.length) return { views: 0, minutes: 0, rateBG: 0, rateBT: 0, testAvg: 0 };
    const views = list.reduce((s, r) => s + r.viewed, 0);
    const minutes = Math.round(list.reduce((s, r) => s + r.minutes, 0) / list.length);
    const rateBG = Math.round((list.reduce((s, r) => s + r.viewed / 40, 0) / list.length) * 100);
    const rateBT = Math.round((list.reduce((s, r) => s + r.done / r.total, 0) / list.length) * 100);
    const testAvg = Math.round((list.reduce((s, r) => s + r.testAvg, 0) / list.length) * 10) / 10;
    return { views, minutes, rateBG: Math.min(rateBG, 100), rateBT, testAvg };
  }, [cls]);

  return (
    <AppShell role="teacher">
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Thống kê hoạt động giảng dạy</h1>
          <p className="text-sm text-slate-500">
            Tổng hợp hoạt động giảng dạy của bạn và kết quả học tập của học sinh theo từng lớp.
          </p>
        </div>

        {/* ---------- Section 1 ---------- */}
        <section className="bg-white rounded-2xl border shadow-sm p-6 space-y-5">
          <h2 className="text-lg font-bold text-indigo-700">
            Tổng quan Hoạt động giảng dạy và Kiểm tra đánh giá
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {OVERVIEW.map((s) => (
              <div key={s.label} className="rounded-xl border p-4 hover:shadow-sm transition">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="text-2xl font-black text-slate-800">{s.value.toLocaleString("vi-VN")}</div>
                <div className="text-[13px] font-semibold text-slate-700 mt-1">{s.label}</div>
                <div className="text-xs text-slate-500">{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6 pt-2">
            <div className="space-y-6">
              <DonutCard title="Thống kê Học liệu theo loại" data={MATERIAL_MIX} />
              <DonutCard title="Thống kê Ngân hàng câu hỏi theo loại" data={QUESTION_MIX} />
            </div>

            <div className="lg:col-span-2">
              <h3 className="text-sm font-bold text-slate-700 mb-2">Nội dung đã tạo theo tháng</h3>
              <div className="h-[300px] rounded-xl border p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MONTHLY} barGap={10} barCategoryGap="14%">
                    <defs>
                      <linearGradient id="gBG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                      <linearGradient id="gBT" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#0ea5e9" />
                      </linearGradient>
                      <linearGradient id="gKT" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#eef2f7" vertical={false} />
                    <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
                    <YAxis fontSize={12} allowDecimals={false} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 13, fontWeight: 600 }} />
                    <Bar dataKey="baiGiang" name="Bài giảng" fill="url(#gBG)" radius={[6, 6, 0, 0]} maxBarSize={56} />
                    <Bar dataKey="baiTap" name="Bài tập" fill="url(#gBT)" radius={[6, 6, 0, 0]} maxBarSize={56} />
                    <Bar dataKey="kiemTra" name="Bài kiểm tra" fill="url(#gKT)" radius={[6, 6, 0, 0]} maxBarSize={56} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Section 2 ---------- */}
        <section className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-indigo-700">Thống kê chi tiết theo lớp</h2>
            <div className="text-sm font-semibold text-slate-600">
              Sĩ số: {(CLASS_STUDENTS[cls] ?? []).length}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {CLASS_ORDER.map((c) => (
              <button
                key={c}
                onClick={() => setCls(c)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition ${
                  c === cls
                    ? "bg-indigo-700 text-primary-foreground border-indigo-700"
                    : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                }`}
              >
                Lớp {c}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm học sinh..."
                className="h-9 w-56"
              />
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="h-9 w-[150px]"><SelectValue placeholder="Môn" /></SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <MiniStat label="Lượt học sinh truy cập BG/HL" note="30 ngày gần nhất" value={`${summary.views.toLocaleString("vi-VN")} lượt`} />
            <MiniStat label="Thời gian học trung bình" value={`${summary.minutes} phút`} />
            <MiniStat label="Tỷ lệ hoàn thành BG/HL" value={`${summary.rateBG}%`} />
            <MiniStat label="Tỷ lệ hoàn thành bài tập" value={`${summary.rateBT}%`} />
            <MiniStat label="Điểm Kiểm tra TB" value={String(summary.testAvg)} />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 border-b bg-slate-50/60">
                  <th className="text-center font-semibold py-2.5 px-3 w-14">STT</th>
                  <th className="text-left font-semibold py-2.5 px-3">Họ và tên</th>
                  <th className="text-center font-semibold py-2.5 px-3">BG/HL đã xem</th>
                  <th className="text-center font-semibold py-2.5 px-3">Số phút đã học</th>
                  <th className="text-center font-semibold py-2.5 px-3">Bài tập hoàn thành</th>
                  <th className="text-center font-semibold py-2.5 px-3">Điểm TB bài tập</th>
                  <th className="text-center font-semibold py-2.5 px-3">Bài kiểm tra đã làm</th>
                  <th className="text-center font-semibold py-2.5 px-3">Điểm TB bài kiểm tra</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.name} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="text-center py-2.5 px-3 font-semibold text-slate-700">{i + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{r.name}</td>
                    <td className="text-center py-2.5 px-3">{r.viewed}</td>
                    <td className="text-center py-2.5 px-3">{r.minutes}</td>
                    <td className="text-center py-2.5 px-3">{r.done}/{r.total}</td>
                    <td className="text-center py-2.5 px-3 font-bold text-indigo-700">{r.avg}</td>
                    <td className="text-center py-2.5 px-3">{r.testDone}/{r.testTotal}</td>
                    <td className="text-center py-2.5 px-3 font-bold text-emerald-700">{r.testAvg}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={8} className="text-center text-slate-400 py-8">Không tìm thấy học sinh.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function MiniStat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-xl border p-3">
      <div className="text-xs font-semibold text-slate-600">{label}</div>
      {note && <div className="text-[11px] italic text-slate-400">{note}</div>}
      <div className="text-lg font-black text-slate-800 mt-1">{value}</div>
    </div>
  );
}

function DonutCard({ title, data }: { title: string; data: { name: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="rounded-xl border p-3">
      <h3 className="text-sm font-bold text-slate-700 mb-1">{title}</h3>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={42}
              outerRadius={68}
              paddingAngle={3}
              stroke="#fff"
              strokeWidth={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-1.5 text-[11px] text-slate-600">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
            <span className="truncate">{d.name}</span>
            <span className="ml-auto font-semibold text-slate-800">
              {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
