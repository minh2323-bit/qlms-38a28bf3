import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  Crown,
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

import { INDEXES, PIES, HLBQ_PURPOSE, HLBQ_FORMAT, HLBQ_ROWS, MONTHLY } from "@/lib/school-statistics";
const C = ["#6366f1", "#10b981", "#0ea5e9", "#f59e0b", "#f43f5e", "#8b5cf6"];
const FORMAT_COLOR: Record<string, string> = {
  "Bộ câu hỏi": "bg-violet-50 text-violet-700",
  "Video tương tác": "bg-rose-50 text-rose-700",
  "Sách giáo viên": "bg-sky-50 text-sky-700",
};

/* ---------------- Page ---------------- */
function SchoolStatsPage() {
  useEffect(() => {
    if (window.location.hash === "#hlbq") {
      setTimeout(() => document.getElementById("hlbq")?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, []);
  return (
    <AppShell role="principal">
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Thống kê của trường</h1>
          <p className="text-sm text-slate-500">
            Thống kê tổng hợp tài nguyên trên LMS của nhà trường và nhà cung cấp học liệu bản quyền.
          </p>
        </div>

        {/* Section: Thống kê tài nguyên nhà trường */}
        <section className="bg-white rounded-2xl border shadow-sm p-6 space-y-5">
          <h2 className="text-lg font-bold text-indigo-700">Thống kê tài nguyên nhà trường</h2>

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

        {/* Section: Thống kê Học liệu bản quyền */}
        <section id="hlbq" className="bg-white rounded-2xl border shadow-sm p-6 space-y-5 scroll-mt-4">
          <h2 className="text-lg font-bold text-amber-700 flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" /> Thống kê Học liệu bản quyền
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "Phân loại theo mục đích sử dụng của Giáo viên", data: HLBQ_PURPOSE },
              { title: "Phân loại theo định dạng", data: HLBQ_FORMAT },
            ].map((p) => (
              <div key={p.title} className="rounded-xl border p-4">
                <h3 className="text-sm font-bold text-slate-700 mb-1 min-h-[40px]">{p.title}</h3>
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie data={p.data} dataKey="value" nameKey="name" innerRadius={44} outerRadius={72} paddingAngle={2} stroke="#fff" strokeWidth={2}>
                      {p.data.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => v.toLocaleString("vi-VN")} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead>
              <tr className="text-slate-500 border-b bg-slate-50/60">
                <th className="text-center font-semibold py-2.5 px-3 w-14">STT</th>
                <th className="text-left font-semibold py-2.5 px-3">Tên học liệu</th>
                <th className="text-center font-semibold py-2.5 px-3">Lượt sử dụng</th>
                <th className="text-center font-semibold py-2.5 px-3">Khối</th>
                <th className="text-center font-semibold py-2.5 px-3">Môn</th>
                <th className="text-center font-semibold py-2.5 px-3">Nhà cung cấp</th>
                <th className="text-center font-semibold py-2.5 px-3">Định dạng</th>
              </tr>
              </thead>
              <tbody>
                {HLBQ_ROWS.map((r, i) => (
                  <tr key={r.name} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="text-center py-2.5 px-3 font-semibold text-slate-700">{i + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-indigo-700">{r.name}</td>
                    <td className="text-center py-2.5 px-3 font-bold text-amber-600">{r.uses.toLocaleString("vi-VN")}</td>
                    <td className="text-center py-2.5 px-3 text-slate-600">{r.grade}</td>
                    <td className="text-center py-2.5 px-3 text-slate-600">{r.subject}</td>
                    <td className="text-center py-2.5 px-3 text-slate-600">{r.provider}</td>
                    <td className="text-center py-2.5 px-3">
                      <span className={`inline-block rounded-md text-xs font-semibold px-2 py-1 ${FORMAT_COLOR[r.format]}`}>{r.format}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </AppShell>
  );
}
