import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import {
  Users, BookOpen, Video, ClipboardList, FileCheck2, AlertTriangle,
  ShieldCheck, TrendingUp, CalendarCheck, Search, ArrowRight, CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/hieu-truong")({
  head: () => ({
    meta: [
      { title: "Trang chủ Hiệu trưởng – Giám sát hoạt động giảng dạy | QLMS" },
      { name: "description", content: "Bảng điều hành của Hiệu trưởng: theo dõi hoạt động hằng ngày của toàn bộ giáo viên trên LMS, tiến độ lịch báo giảng, học liệu, bài kiểm tra và các nội dung chờ duyệt." },
      { property: "og:title", content: "Trang chủ Hiệu trưởng – Giám sát hoạt động giảng dạy" },
      { property: "og:description", content: "Theo dõi hoạt động hằng ngày của toàn bộ giáo viên trên LMS: lịch báo giảng, học liệu, bài kiểm tra và nội dung chờ duyệt." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrincipalHome,
});

/* ---------------- Mock data ---------------- */
const KPI = [
  { label: "Giáo viên hoạt động hôm nay", value: "38/42", sub: "90% tổng số giáo viên", icon: Users, color: "bg-indigo-50 text-indigo-600" },
  { label: "Tiết đã báo giảng hôm nay", value: "186", sub: "12 tiết chưa gán bài học", icon: CalendarCheck, color: "bg-sky-50 text-sky-600" },
  { label: "Bài giảng mới trong tuần", value: "57", sub: "+14 so với tuần trước", icon: BookOpen, color: "bg-violet-50 text-violet-600" },
  { label: "Học liệu tải lên trong tuần", value: "243", sub: "68 học liệu bản quyền", icon: Video, color: "bg-teal-50 text-teal-600" },
  { label: "Bài tập / nhiệm vụ đã giao", value: "129", sub: "94 đã chấm xong", icon: ClipboardList, color: "bg-amber-50 text-amber-600" },
  { label: "Bài kiểm tra đang mở", value: "18", sub: "6 kỳ thi ôn tập cấp trường", icon: FileCheck2, color: "bg-emerald-50 text-emerald-600" },
  { label: "Nội dung chờ duyệt", value: "23", sub: "15 câu hỏi · 8 đề thi", icon: ShieldCheck, color: "bg-rose-50 text-rose-600" },
  { label: "Giáo viên chưa hoạt động ≥ 3 ngày", value: "4", sub: "Cần nhắc nhở", icon: AlertTriangle, color: "bg-orange-50 text-orange-600" },
];

const WEEK_ACTIVITY = [
  { day: "T2", "Bài giảng": 12, "Học liệu": 41, "Bài tập": 23 },
  { day: "T3", "Bài giảng": 9, "Học liệu": 36, "Bài tập": 19 },
  { day: "T4", "Bài giảng": 14, "Học liệu": 52, "Bài tập": 28 },
  { day: "T5", "Bài giảng": 8, "Học liệu": 33, "Bài tập": 21 },
  { day: "T6", "Bài giảng": 10, "Học liệu": 45, "Bài tập": 26 },
  { day: "T7", "Bài giảng": 4, "Học liệu": 21, "Bài tập": 9 },
  { day: "CN", "Bài giảng": 2, "Học liệu": 15, "Bài tập": 3 },
];

const GROUP_SHARE = [
  { name: "Tổ Toán", value: 34, color: "#6366f1" },
  { name: "Tổ Tiếng Việt", value: 28, color: "#10b981" },
  { name: "Tổ Tiếng Anh", value: 18, color: "#0ea5e9" },
  { name: "Tổ Năng khiếu", value: 12, color: "#f59e0b" },
  { name: "Tổ khác", value: 8, color: "#f43f5e" },
];

type TeacherRow = {
  name: string; group: string; grade: string;
  lbg: string; lectures: number; materials: number; tasks: number; graded: string;
  lastActive: string; status: "active" | "low" | "idle";
};

const TEACHERS: TeacherRow[] = [
  { name: "Phùng Thúy Hằng", group: "Tổ Toán", grade: "Khối 4", lbg: "5/5", lectures: 4, materials: 18, tasks: 6, graded: "42/45", lastActive: "5 phút trước", status: "active" },
  { name: "Nguyễn Thu Trang", group: "Tổ Tiếng Việt", grade: "Khối 3", lbg: "4/5", lectures: 3, materials: 12, tasks: 4, graded: "30/38", lastActive: "22 phút trước", status: "active" },
  { name: "Lê Minh Đức", group: "Tổ Tiếng Anh", grade: "Khối 5", lbg: "5/5", lectures: 2, materials: 9, tasks: 5, graded: "51/51", lastActive: "1 giờ trước", status: "active" },
  { name: "Trần Bích Ngọc", group: "Tổ Toán", grade: "Khối 3", lbg: "3/5", lectures: 1, materials: 4, tasks: 2, graded: "12/26", lastActive: "3 giờ trước", status: "low" },
  { name: "Hoàng Văn Sơn", group: "Tổ Năng khiếu", grade: "Khối 1", lbg: "2/4", lectures: 0, materials: 2, tasks: 1, graded: "8/10", lastActive: "Hôm qua", status: "low" },
  { name: "Đỗ Thanh Huyền", group: "Tổ Tiếng Việt", grade: "Khối 2", lbg: "5/5", lectures: 5, materials: 21, tasks: 7, graded: "60/60", lastActive: "12 phút trước", status: "active" },
  { name: "Vũ Quang Hải", group: "Tổ Tiếng Anh", grade: "Khối 4", lbg: "0/4", lectures: 0, materials: 0, tasks: 0, graded: "0/14", lastActive: "4 ngày trước", status: "idle" },
  { name: "Phạm Hồng Nhung", group: "Tổ Năng khiếu", grade: "Khối 5", lbg: "0/3", lectures: 0, materials: 1, tasks: 0, graded: "3/9", lastActive: "5 ngày trước", status: "idle" },
];

const STATUS_META: Record<TeacherRow["status"], { label: string; cls: string }> = {
  active: { label: "Hoạt động tốt", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  low: { label: "Hoạt động thấp", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  idle: { label: "Chưa hoạt động", cls: "bg-rose-50 text-rose-700 border-rose-200" },
};

const PENDING = [
  { type: "Câu hỏi", title: "Bộ 15 câu hỏi Toán 4 – Phân số", author: "Trần Bích Ngọc", time: "Hôm nay 08:12", to: "/ky-thi/ngan-hang-cau-hoi" },
  { type: "Đề thi", title: "Đề khảo sát giữa kỳ II – Tiếng Việt 3", author: "Nguyễn Thu Trang", time: "Hôm nay 07:40", to: "/ky-thi/de-thi" },
  { type: "Đề thi", title: "Đề ôn tập cuối năm – Toán 5", author: "Lê Minh Đức", time: "Hôm qua 16:05", to: "/ky-thi/de-thi" },
  { type: "Câu hỏi", title: "Bộ 8 câu hỏi Tiếng Anh 4 – Unit 12", author: "Vũ Quang Hải", time: "Hôm qua 14:22", to: "/ky-thi/ngan-hang-cau-hoi" },
];

/* ---------------- Page ---------------- */
function PrincipalHome() {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("all");
  const [status, setStatus] = useState("all");

  const rows = useMemo(() => TEACHERS.filter((t) => {
    if (q.trim() && !t.name.toLowerCase().includes(q.trim().toLowerCase())) return false;
    if (group !== "all" && t.group !== group) return false;
    if (status !== "all" && t.status !== status) return false;
    return true;
  }), [q, group, status]);

  return (
    <AppShell role="principal">
      {/* Header */}
      <section className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Bảng điều hành Hiệu trưởng</h1>
          <p className="text-sm text-indigo-100 mt-1">
            Tình hình hoạt động của toàn bộ giáo viên trên LMS – Trường Tiểu học Tô Hiệu · Năm học 2025 - 2026
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-white/15 border border-white/30 text-white text-[12px] font-medium">
            <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Toàn quyền tạo kỳ thi &amp; đề thi (không cần duyệt)
          </Badge>
        </div>
      </section>

      {/* KPI */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {KPI.map((k) => (
          <div key={k.label} className="bg-white rounded-xl border p-4 flex items-start gap-3">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${k.color}`}>
              <k.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] text-slate-500 leading-tight">{k.label}</p>
              <p className="text-2xl font-bold text-slate-800 leading-tight mt-0.5">{k.value}</p>
              <p className="text-[12px] text-slate-400 mt-0.5">{k.sub}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[15px] font-semibold text-slate-800">Hoạt động giáo viên trong tuần</h2>
            <span className="text-[12px] text-slate-400 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> Toàn trường
            </span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={WEEK_ACTIVITY} barCategoryGap="22%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Học liệu" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={22} />
              <Bar dataKey="Bài giảng" fill="#10b981" radius={[4, 4, 0, 0]} barSize={22} />
              <Bar dataKey="Bài tập" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <h2 className="text-[15px] font-semibold text-slate-800 mb-2">Tỷ trọng đóng góp học liệu theo tổ</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={GROUP_SHARE} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {GROUP_SHARE.map((g) => <Cell key={g.name} fill={g.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => `${v}%`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Teacher activity table */}
      <section className="bg-white rounded-xl border">
        <div className="p-4 flex flex-wrap items-center gap-2 border-b">
          <h2 className="text-[15px] font-semibold text-slate-800 mr-auto">Hoạt động của giáo viên hôm nay</h2>
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <Input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo tên giáo viên"
              className="pl-8 h-9 w-56 text-[13px]"
            />
          </div>
          <Select value={group} onValueChange={setGroup}>
            <SelectTrigger className="h-9 w-44 text-[13px]"><SelectValue placeholder="Tổ chuyên môn" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả tổ chuyên môn</SelectItem>
              {GROUP_SHARE.filter((g) => g.name !== "Tổ khác").map((g) => (
                <SelectItem key={g.name} value={g.name}>{g.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-9 w-40 text-[13px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Hoạt động tốt</SelectItem>
              <SelectItem value="low">Hoạt động thấp</SelectItem>
              <SelectItem value="idle">Chưa hoạt động</SelectItem>
            </SelectContent>
          </Select>
          <Button asChild variant="outline" className="h-9 text-[13px]">
            <Link to="/thong-ke">Xem thống kê chi tiết <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2 text-center font-semibold w-12">STT</th>
                <th className="px-3 py-2 text-left font-semibold">Giáo viên</th>
                <th className="px-3 py-2 text-left font-semibold">Tổ / Khối</th>
                <th className="px-3 py-2 text-center font-semibold">Tiết đã báo giảng</th>
                <th className="px-3 py-2 text-center font-semibold">Bài giảng mới</th>
                <th className="px-3 py-2 text-center font-semibold">Học liệu tải lên</th>
                <th className="px-3 py-2 text-center font-semibold">Bài tập đã giao</th>
                <th className="px-3 py-2 text-center font-semibold">Tiến độ chấm</th>
                <th className="px-3 py-2 text-left font-semibold">Truy cập gần nhất</th>
                <th className="px-3 py-2 text-center font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t, i) => (
                <tr key={t.name} className="border-t hover:bg-slate-50/60">
                  <td className="px-3 py-2 text-center text-slate-500">{i + 1}</td>
                  <td className="px-3 py-2 font-semibold text-slate-800">{t.name}</td>
                  <td className="px-3 py-2 text-slate-600">{t.group} · {t.grade}</td>
                  <td className="px-3 py-2 text-center text-slate-700">{t.lbg}</td>
                  <td className="px-3 py-2 text-center text-slate-700">{t.lectures}</td>
                  <td className="px-3 py-2 text-center text-slate-700">{t.materials}</td>
                  <td className="px-3 py-2 text-center text-slate-700">{t.tasks}</td>
                  <td className="px-3 py-2 text-center text-slate-700">{t.graded}</td>
                  <td className="px-3 py-2 text-slate-500">{t.lastActive}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full border text-[12px] ${STATUS_META[t.status].cls}`}>
                      {STATUS_META[t.status].label}
                    </span>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={10} className="px-3 py-8 text-center text-slate-400">Không có giáo viên phù hợp bộ lọc.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pending approvals + reminders */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border lg:col-span-2">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-slate-800">Nội dung giáo viên đề xuất chờ duyệt</h2>
            <Badge variant="secondary" className="text-[12px]">{PENDING.length} mục mới</Badge>
          </div>
          <ul className="divide-y">
            {PENDING.map((p) => (
              <li key={p.title} className="px-4 py-3 flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded-full text-[12px] border shrink-0 ${
                  p.type === "Đề thi" ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-sky-50 text-sky-700 border-sky-200"}`}>
                  {p.type}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-slate-800 truncate">{p.title}</p>
                  <p className="text-[12px] text-slate-500">{p.author} · {p.time}</p>
                </div>
                <Button asChild size="sm" variant="outline" className="h-8 text-[12px]">
                  <Link to={p.to}>Xem &amp; duyệt</Link>
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl border p-4 space-y-3">
          <h2 className="text-[15px] font-semibold text-slate-800">Cần lưu ý hôm nay</h2>
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
            <p className="text-[13px] font-semibold text-rose-700 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" /> 4 giáo viên chưa hoạt động ≥ 3 ngày
            </p>
            <p className="text-[12px] text-rose-600 mt-1">Vũ Quang Hải, Phạm Hồng Nhung, và 2 giáo viên khác.</p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-[13px] font-semibold text-amber-700 flex items-center gap-1">
              <CalendarCheck className="h-4 w-4" /> 12 tiết báo giảng chưa gán bài học
            </p>
            <p className="text-[12px] text-amber-600 mt-1">Chủ yếu ở Khối 1 và Khối 5.</p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-[13px] font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> 94/129 bài tập đã chấm xong
            </p>
            <p className="text-[12px] text-emerald-600 mt-1">Tỷ lệ chấm đúng hạn đạt 87%.</p>
          </div>
          <Button asChild className="w-full h-9 text-[13px]">
            <Link to="/ky-thi/chinh-thuc">Tạo kỳ thi cấp trường</Link>
          </Button>
        </div>
      </section>
    </AppShell>
  );
}
