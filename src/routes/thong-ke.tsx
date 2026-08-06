import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  BookOpen, ClipboardList, FileText, Video, Users, TrendingUp, Clock, Award,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";

export const Route = createFileRoute("/thong-ke")({
  head: () => ({
    meta: [
      { title: "Thống kê giảng dạy & học tập – QLMS" },
      { name: "description", content: "Tổng hợp thống kê hoạt động cá nhân của giáo viên và kết quả học tập của học sinh theo từng lớp." },
      { property: "og:title", content: "Thống kê giảng dạy & học tập – QLMS" },
      { property: "og:description", content: "Tổng hợp thống kê hoạt động cá nhân của giáo viên và kết quả học tập của học sinh theo từng lớp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

/* ---------------- Mock data ---------------- */
const PERSONAL = [
  { label: "Bài giảng đã tạo", value: 32, sub: "+4 trong tháng này", icon: BookOpen, color: "bg-indigo-50 text-indigo-700" },
  { label: "Học liệu đã tải lên", value: 148, sub: "Video, slide, tài liệu", icon: Video, color: "bg-sky-50 text-sky-700" },
  { label: "Bài tập / nhiệm vụ đã giao", value: 57, sub: "42 đã chấm xong", icon: ClipboardList, color: "bg-amber-50 text-amber-700" },
  { label: "Đề & bài kiểm tra", value: 21, sub: "8 đề sinh từ ma trận", icon: FileText, color: "bg-emerald-50 text-emerald-700" },
  { label: "Câu hỏi trong ngân hàng", value: 386, sub: "112 đã chia sẻ nội bộ", icon: Award, color: "bg-rose-50 text-rose-700" },
  { label: "Lớp học phụ trách", value: 7, sub: "1 lớp chủ nhiệm (4A)", icon: Users, color: "bg-violet-50 text-violet-700" },
  { label: "Lớp trực tuyến đã tổ chức", value: 18, sub: "Tổng 24 giờ dạy", icon: Clock, color: "bg-teal-50 text-teal-700" },
  { label: "Lượt học sinh truy cập học liệu", value: 2140, sub: "30 ngày gần nhất", icon: TrendingUp, color: "bg-orange-50 text-orange-700" },
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
  { name: "Slide", value: 38 },
  { name: "Tài liệu", value: 34 },
  { name: "Phiếu bài tập", value: 18 },
  { name: "Khác", value: 12 },
];
const PIE_COLORS = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#f43f5e"];

const CLASS_TREND = [
  { week: "Tuần 1", "4A": 7.2, "4B": 6.8, "3A": 7.0 },
  { week: "Tuần 2", "4A": 7.6, "4B": 7.1, "3A": 7.3 },
  { week: "Tuần 3", "4A": 8.0, "4B": 7.4, "3A": 7.1 },
  { week: "Tuần 4", "4A": 8.3, "4B": 7.9, "3A": 7.6 },
  { week: "Tuần 5", "4A": 8.6, "4B": 8.0, "3A": 7.9 },
];

type Row = {
  name: string; viewed: number; minutes: number; done: number; total: number;
  avg: number; favorite: string;
};

function seedRows(names: string[], seed: number): Row[] {
  const subs = ["Toán", "Tiếng Việt", "Tiếng Anh", "Khoa học"];
  return names.map((name, i) => {
    const k = (i * 7 + seed * 13) % 17;
    return {
      name,
      viewed: 12 + k * 2,
      minutes: 180 + k * 23,
      done: 8 + (k % 9),
      total: 18,
      avg: Math.round((6 + (k % 5) + (k % 3) * 0.4) * 10) / 10,
      favorite: subs[(i + seed) % subs.length],
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
  "3A": seedRows([
    "Mai Đức Anh", "Chu Phương Thảo", "Đặng Gia Bảo", "Trương Hà My", "Lưu Minh Khang",
    "Võ Thị Kim Chi", "Nguyễn Đình Phong",
  ], 3),
};

type SortKey = "viewed" | "minutes" | "done" | "avg";

/* ---------------- Page ---------------- */
function Page() {
  const classes = Object.keys(CLASS_STUDENTS);
  const [cls, setCls] = useState(classes[0]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("viewed");

  const rows = useMemo(() => {
    const list = CLASS_STUDENTS[cls] ?? [];
    return list
      .filter((r) => r.name.toLowerCase().includes(q.trim().toLowerCase()))
      .slice()
      .sort((a, b) => b[sort] - a[sort]);
  }, [cls, q, sort]);

  const classAvg = useMemo(() => {
    const list = CLASS_STUDENTS[cls] ?? [];
    if (!list.length) return { avg: 0, minutes: 0, rate: 0 };
    const avg = list.reduce((s, r) => s + r.avg, 0) / list.length;
    const minutes = Math.round(list.reduce((s, r) => s + r.minutes, 0) / list.length);
    const rate = Math.round(
      (list.reduce((s, r) => s + r.done / r.total, 0) / list.length) * 100,
    );
    return { avg: Math.round(avg * 10) / 10, minutes, rate };
  }, [cls]);

  return (
    <AppShell role="teacher">
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Thống kê &amp; Báo cáo</h1>
          <p className="text-sm text-slate-500">
            Tổng hợp hoạt động giảng dạy của bạn và kết quả học tập của học sinh theo từng lớp.
          </p>
        </div>

        {/* ---------- Section 1: cá nhân ---------- */}
        <section className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-800">1. Thống kê hoạt động cá nhân</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PERSONAL.map((s) => (
              <div key={s.label} className="rounded-xl border p-4">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="text-2xl font-black text-slate-800">{s.value.toLocaleString("vi-VN")}</div>
                <div className="text-[13px] font-semibold text-slate-700 mt-1">{s.label}</div>
                <div className="text-xs text-slate-500">{s.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- Section 2: học sinh theo lớp ---------- */}
        <section className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-800">2. Thống kê học tập của học sinh</h2>
            <div className="text-sm font-semibold text-indigo-700">
              Sĩ số: {(CLASS_STUDENTS[cls] ?? []).length}
            </div>
          </div>

          {/* tab chuyển lớp */}
          <div className="flex flex-wrap items-center gap-2">
            {classes.map((c) => (
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
              <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger className="h-9 w-[190px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewed">Sắp xếp: Học liệu đã xem</SelectItem>
                  <SelectItem value="minutes">Sắp xếp: Số phút đã học</SelectItem>
                  <SelectItem value="done">Sắp xếp: Bài đã hoàn thành</SelectItem>
                  <SelectItem value="avg">Sắp xếp: Điểm trung bình</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border p-3">
              <div className="text-xs text-slate-500">Điểm TB lớp</div>
              <div className="text-xl font-black text-slate-800">{classAvg.avg}</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-slate-500">Thời lượng học TB</div>
              <div className="text-xl font-black text-slate-800">
                {Math.floor(classAvg.minutes / 60)}h {classAvg.minutes % 60}'
              </div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-slate-500">Tỉ lệ hoàn thành bài tập</div>
              <div className="text-xl font-black text-slate-800">{classAvg.rate}%</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 border-b">
                  <th className="text-center font-semibold py-2 px-3 w-14">STT</th>
                  <th className="text-left font-semibold py-2 px-3">Họ và tên</th>
                  <th className="text-center font-semibold py-2 px-3">Học liệu đã xem</th>
                  <th className="text-center font-semibold py-2 px-3">Số phút đã học</th>
                  <th className="text-center font-semibold py-2 px-3">Bài tập hoàn thành</th>
                  <th className="text-center font-semibold py-2 px-3">Điểm TB</th>
                  <th className="text-center font-semibold py-2 px-3">Môn yêu thích</th>
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
                    <td className="text-center py-2.5 px-3 text-slate-600">{r.favorite}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={7} className="text-center text-slate-400 py-8">Không tìm thấy học sinh.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ---------- Section 3: biểu đồ ---------- */}
        <section className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-800">3. Biểu đồ phân tích</h2>

          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">
                Nội dung đã tạo theo tháng
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MONTHLY}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="baiGiang" name="Bài giảng" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="baiTap" name="Bài tập" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="kiemTra" name="Bài kiểm tra" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">
                Cơ cấu học liệu theo loại
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={MATERIAL_MIX} dataKey="value" nameKey="name" outerRadius={90} label>
                      {MATERIAL_MIX.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-2">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">
                Điểm trung bình theo tuần của các lớp
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={CLASS_TREND}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="week" fontSize={12} />
                    <YAxis domain={[5, 10]} fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="4A" stroke="#6366f1" strokeWidth={2} />
                    <Line type="monotone" dataKey="4B" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="3A" stroke="#f43f5e" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
