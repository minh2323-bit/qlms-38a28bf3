import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { Route as RouteIcon, History, Sparkles, TrendingUp, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/hoc-sinh/lo-trinh")({
  head: () => ({ meta: [{ title: "Lộ trình học tập – Học sinh" }] }),
  component: Page,
});

const HISTORY = [
  { id: "h1", date: "11/4/2026", title: "Luyện tập Quy đồng mẫu số", subject: "Toán", score: "9/10", time: "18 phút" },
  { id: "h2", date: "10/4/2026", title: "Đọc hiểu: Cây bàng", subject: "Tiếng Việt", score: "8/10", time: "22 phút" },
  { id: "h3", date: "09/4/2026", title: "Bài tập So sánh phân số", subject: "Toán", score: "10/10", time: "15 phút" },
  { id: "h4", date: "08/4/2026", title: "Luyện đọc Tiếng Anh – Unit 5", subject: "Tiếng Anh", score: "7/10", time: "20 phút" },
];

const STRENGTHS = ["Phân số & phép tính phân số", "Đọc hiểu văn bản ngắn"];
const WEAKNESSES = ["Làm tròn số tự nhiên có nhiều chữ số", "Từ vựng Tiếng Anh chủ đề Gia đình"];
const SUGGESTED = [
  { title: "Ôn lại: Làm tròn số tự nhiên", reason: "Em làm sai 2/5 câu gần nhất", subject: "Toán" },
  { title: "Luyện đọc Truyện ngắn – Tập 1", reason: "Tăng tốc độ đọc hiểu", subject: "Tiếng Việt" },
  { title: "Flashcard từ vựng – Family", reason: "Củng cố điểm yếu Tiếng Anh", subject: "Tiếng Anh" },
];

function Page() {
  const [tab, setTab] = useState<"history" | "ai">("history");
  return (
    <AppShell role="student">
      <section className="bg-white rounded-2xl border shadow-sm">
        <div className="px-6 py-3 border-b flex items-center gap-2">
          <RouteIcon className="h-5 w-5 text-indigo-700" />
          <h2 className="text-xl font-bold text-slate-800">Lộ trình học tập</h2>
        </div>
        <div className="px-6 pt-4 flex gap-2 border-b">
          {([
            { key: "history" as const, label: "Lịch sử học", icon: History },
            { key: "ai" as const, label: "Đánh giá cá nhân hóa", icon: Sparkles },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition flex items-center gap-1.5 ${
                tab === t.key ? "border-indigo-700 text-indigo-700" : "border-transparent text-slate-600 hover:text-indigo-700"
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {tab === "history" ? (
          <div className="p-6">
            <ul className="divide-y border rounded-xl overflow-hidden">
              {HISTORY.map((h) => (
                <li key={h.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{h.title}</div>
                    <div className="text-[11px] text-slate-500">{h.date} · {h.subject} · {h.time}</div>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">{h.score}</Badge>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Box title="Điểm mạnh" icon={TrendingUp} color="emerald" items={STRENGTHS} />
              <Box title="Cần cải thiện" icon={BookOpen} color="amber" items={WEAKNESSES} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-indigo-700" /> Gợi ý học tiếp theo
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {SUGGESTED.map((s, i) => (
                  <li key={i} className="rounded-xl border p-4 hover:shadow transition">
                    <div className="text-sm font-semibold text-slate-800">{s.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{s.subject}</div>
                    <p className="text-xs text-slate-600 mt-2">{s.reason}</p>
                    <button className="mt-3 text-xs font-semibold text-indigo-700 hover:underline">Bắt đầu</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}

function Box({ title, icon: Icon, color, items }: { title: string; icon: typeof TrendingUp; color: "emerald" | "amber"; items: string[] }) {
  const cls = color === "emerald"
    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
    : "bg-amber-50 border-amber-200 text-amber-800";
  return (
    <div className={`rounded-xl border p-4 ${cls}`}>
      <div className="flex items-center gap-2 font-semibold mb-2"><Icon className="h-4 w-4" /> {title}</div>
      <ul className="space-y-1 text-sm">
        {items.map((it) => <li key={it}>• {it}</li>)}
      </ul>
    </div>
  );
}
