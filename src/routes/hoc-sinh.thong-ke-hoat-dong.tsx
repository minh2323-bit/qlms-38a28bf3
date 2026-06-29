import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TrendingUp, Clock, Target, Award } from "lucide-react";

export const Route = createFileRoute("/hoc-sinh/thong-ke-hoat-dong")({
  head: () => ({ meta: [{ title: "Thống kê hoạt động – Học sinh" }] }),
  component: Page,
});

const STATS = [
  { label: "Tổng thời gian học tuần này", value: "8h 25'", icon: Clock, color: "bg-sky-50 text-sky-700" },
  { label: "Bài tập đã hoàn thành", value: "27", icon: Target, color: "bg-emerald-50 text-emerald-700" },
  { label: "Điểm trung bình", value: "8.6", icon: Award, color: "bg-amber-50 text-amber-700" },
  { label: "Chuỗi học liên tục", value: "12 ngày", icon: TrendingUp, color: "bg-indigo-50 text-indigo-700" },
];

const BY_SUBJECT = [
  { name: "Toán", minutes: 220, percent: 70 },
  { name: "Tiếng Việt", minutes: 160, percent: 55 },
  { name: "Tiếng Anh", minutes: 95, percent: 35 },
  { name: "Tự nhiên và xã hội", minutes: 60, percent: 22 },
];

function Page() {
  return (
    <AppShell role="student">
      <section className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-700" />
          <h2 className="text-xl font-bold text-slate-800">Thống kê hoạt động</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-xl border p-4">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div className="text-2xl font-black text-slate-800">{s.value}</div>
              <div className="text-xs text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div>
          <h3 className="font-semibold text-slate-800 mb-3">Thời lượng học theo môn (tuần này)</h3>
          <ul className="space-y-3">
            {BY_SUBJECT.map((b) => (
              <li key={b.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{b.name}</span>
                  <span className="text-slate-500">{Math.floor(b.minutes / 60)}h {b.minutes % 60}'</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${b.percent}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </AppShell>
  );
}
