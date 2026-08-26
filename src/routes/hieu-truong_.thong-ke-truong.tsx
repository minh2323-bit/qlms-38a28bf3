import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  Video, BookOpen, HelpCircle, Crown, FileText, ClipboardList, FileCheck2, Landmark,
  TrendingUp, TrendingDown,
} from "lucide-react";

export const Route = createFileRoute("/hieu-truong_/thong-ke-truong")({
  head: () => ({
    meta: [
      { title: "Thống kê của trường – Tài nguyên số & hoạt động giáo viên | QLMS" },
      { name: "description", content: "Tổng hợp tài nguyên số của trường: học liệu, bài giảng, ngân hàng câu hỏi, đề kiểm tra, kỳ thi và thống kê hoạt động của từng giáo viên." },
      { property: "og:title", content: "Thống kê của trường – Tài nguyên số & hoạt động giáo viên" },
      { property: "og:description", content: "Chỉ số tài nguyên số, biểu đồ đóng góp theo tổ môn và bảng thống kê hoạt động giáo viên toàn trường." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SchoolStatsPage,
});

/* ---------------- Mock data ---------------- */
type Idx = {
  label: string; value: string; icon: typeof Video; color: string;
  sub?: string; growth?: number;
};

const INDEXES: Idx[] = [
  { label: "Học liệu đã tải lên", value: "2.418", icon: Video, color: "bg-indigo-50 text-indigo-600", growth: 15 },
  { label: "Bài giảng", value: "864", icon: BookOpen, color: "bg-emerald-50 text-emerald-600", growth: 24 },
  { label: "Ngân hàng câu hỏi", value: "12.507", icon: HelpCircle, color: "bg-sky-50 text-sky-600", growth: 312 },
  {
    label: "Lượt sử dụng học liệu bản quyền", value: "1.236", icon: Crown, color: "bg-amber-50 text-amber-600",
    sub: "Số lượt sử dụng HLBQ để tạo bài tập, bài giảng, đề kiểm tra",
  },
  { label: "Đề kiểm tra", value: "512", icon: FileText, color: "bg-violet-50 text-violet-600", growth: 18 },
  { label: "Bài tập về nhà đã giao", value: "1.874", icon: ClipboardList, color: "bg-orange-50 text-orange-600", growth: 46 },
  { label: "Bài kiểm tra đã tạo", value: "946", icon: FileCheck2, color: "bg-rose-50 text-rose-600", growth: -8 },
  { label: "Kỳ thi đã tạo", value: "38", icon: Landmark, color: "bg-teal-50 text-teal-600" },
];

const C = ["#6366f1", "#10b981", "#0ea5e9", "#f59e0b", "#f43f5e", "#8b5cf6"];

const PIES: { title: string; data: { name: string; value: number }[]; unit?: string }[] = [
  {
    title: "HL đóng góp theo tổ môn",
    data: [
      { name: "Tổ Toán", value: 34 }, { name: "Tổ Tiếng Việt", value: 28 },
      { name: "Tổ Tiếng Anh", value: 18 }, { name: "Tổ Năng khiếu", value: 12 },
      { name: "Tổ khác", value: 8 },
    ],
    unit: "%",
  },
  {
    title: "Ngân hàng câu hỏi đóng góp theo tổ môn",
    data: [
      { name: "Tổ Toán", value: 41 }, { name: "Tổ Tiếng Việt", value: 24 },
      { name: "Tổ Tiếng Anh", value: 21 }, { name: "Tổ Năng khiếu", value: 9 },
      { name: "Tổ khác", value: 5 },
    ],
    unit: "%",
  },
  {
    title: "Phân loại mục đích sử dụng Học liệu bản quyền",
    data: [
      { name: "Tạo bài giảng", value: 486 }, { name: "Tạo bài tập", value: 352 },
      { name: "Tạo đề kiểm tra", value: 264 }, { name: "Tạo kỳ thi", value: 134 },
    ],
  },
  {
    title: "Ngân hàng câu hỏi theo loại",
    data: [
      { name: "Trắc nghiệm", value: 5240 }, { name: "Đúng - Sai", value: 2180 },
      { name: "Điền khuyết", value: 1640 }, { name: "Nối / Kéo thả", value: 1520 },
      { name: "Trả lời ngắn", value: 1120 }, { name: "Tự luận", value: 807 },
    ],
  },
  {
    title: "Ngân hàng câu hỏi theo mức độ nhận thức",
    data: [
      { name: "Nhận biết", value: 4820 }, { name: "Thông hiểu", value: 4210 },
      { name: "Vận dụng", value: 2660 }, { name: "Vận dụng cao", value: 817 },
    ],
  },
  {
    title: "Học liệu theo loại",
    data: [
      { name: "Video", value: 862 }, { name: "Bài giảng", value: 640 },
      { name: "Tài liệu", value: 512 }, { name: "Âm thanh", value: 218 },
      { name: "Scorm / IFrame", value: 186 },
    ],
  },
];

const MONTHLY = [
  { month: "T1", baiGiang: 62, baiTap: 128, kiemTra: 41 },
  { month: "T2", baiGiang: 74, baiTap: 156, kiemTra: 28 },
  { month: "T3", baiGiang: 112, baiTap: 198, kiemTra: 66 },
  { month: "T4", baiGiang: 98, baiTap: 172, kiemTra: 52 },
  { month: "T5", baiGiang: 136, baiTap: 246, kiemTra: 88 },
  { month: "T6", baiGiang: 128, baiTap: 214, kiemTra: 74 },
  { month: "T7", baiGiang: 84, baiTap: 132, kiemTra: 36 },
  { month: "T8", baiGiang: 156, baiTap: 288, kiemTra: 102 },
  { month: "T9", baiGiang: 182, baiTap: 324, kiemTra: 128 },
  { month: "T10", baiGiang: 164, baiTap: 302, kiemTra: 116 },
  { month: "T11", baiGiang: 148, baiTap: 276, kiemTra: 98 },
  { month: "T12", baiGiang: 132, baiTap: 238, kiemTra: 84 },
];

/* ---------------- Page ---------------- */
function SchoolStatsPage() {
  return (
    <AppShell role="principal">
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Thống kê của trường</h1>
          <p className="text-sm text-slate-500">
            Tổng hợp tài nguyên số và hoạt động của toàn bộ giáo viên trong trường.
          </p>
        </div>

        {/* Section: Thống kê Tài nguyên số */}
        <section className="bg-white rounded-2xl border shadow-sm p-6 space-y-5">
          <h2 className="text-lg font-bold text-indigo-700">Thống kê Tài nguyên số</h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {INDEXES.map((k) => (
              <div key={k.label} className="rounded-xl border p-4 hover:shadow-sm transition">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center mb-3 ${k.color}`}>
                  <k.icon className="h-5 w-5" />
                </div>
                <div className="text-2xl font-black text-slate-800">{k.value}</div>
                <div className="text-[13px] font-semibold text-slate-700 mt-1">{k.label}</div>
                {k.growth !== undefined && (
                  <div className={`mt-1.5 flex items-center gap-1 text-xs font-bold ${k.growth >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {k.growth >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    <span>{Math.abs(k.growth).toLocaleString("vi-VN")} so với tháng trước</span>
                  </div>
                )}
                {k.sub && <div className="text-xs text-slate-500 mt-0.5">{k.sub}</div>}
              </div>
            ))}
          </div>

          {/* 6 biểu đồ tròn */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PIES.map((p) => (
              <div key={p.title} className="rounded-xl border p-4">
                <h3 className="text-sm font-bold text-slate-700 mb-1 min-h-[40px]">{p.title}</h3>
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie data={p.data} dataKey="value" nameKey="name" innerRadius={44} outerRadius={72} paddingAngle={2} stroke="#fff" strokeWidth={2}>
                      {p.data.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                      formatter={(v: number) => `${v.toLocaleString("vi-VN")}${p.unit ?? ""}`}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>

          {/* Biểu đồ cột theo tháng */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-2">Nội dung đã tạo theo tháng</h3>
            <div className="rounded-xl border p-3 overflow-x-auto">
              <div className="h-[320px]" style={{ minWidth: Math.max(640, MONTHLY.length * 96) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MONTHLY} barGap={10} barCategoryGap="14%">
                  <defs>
                    <linearGradient id="sBG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" /><stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                    <linearGradient id="sBT" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" /><stop offset="100%" stopColor="#0ea5e9" />
                    </linearGradient>
                    <linearGradient id="sKT" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#eef2f7" vertical={false} />
                  <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
                  <YAxis fontSize={12} allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 13, fontWeight: 600 }} />
                  <Bar dataKey="baiGiang" name="Bài giảng" fill="url(#sBG)" radius={[6, 6, 0, 0]} maxBarSize={56} />
                  <Bar dataKey="baiTap" name="Bài tập" fill="url(#sBT)" radius={[6, 6, 0, 0]} maxBarSize={56} />
                  <Bar dataKey="kiemTra" name="Bài kiểm tra" fill="url(#sKT)" radius={[6, 6, 0, 0]} maxBarSize={56} />
                </BarChart>
              </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

      </div>
    </AppShell>
  );
}
