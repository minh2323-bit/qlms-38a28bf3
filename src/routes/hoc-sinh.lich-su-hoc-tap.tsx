import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { History } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/hoc-sinh/lich-su-hoc-tap")({
  head: () => ({ meta: [{ title: "Lịch sử học tập – Học sinh" }] }),
  component: Page,
});

const HISTORY = [
  { id: "h1", date: "11/4/2026", title: "Luyện tập Quy đồng mẫu số", subject: "Toán", score: "9/10", time: "18 phút" },
  { id: "h2", date: "10/4/2026", title: "Đọc hiểu: Cây bàng", subject: "Tiếng Việt", score: "8/10", time: "22 phút" },
  { id: "h3", date: "09/4/2026", title: "Bài tập So sánh phân số", subject: "Toán", score: "10/10", time: "15 phút" },
  { id: "h4", date: "08/4/2026", title: "Luyện đọc Tiếng Anh – Unit 5", subject: "Tiếng Anh", score: "7/10", time: "20 phút" },
  { id: "h5", date: "07/4/2026", title: "Bài kiểm tra 15' – Hàng và lớp", subject: "Toán", score: "9/10", time: "14 phút" },
  { id: "h6", date: "06/4/2026", title: "Chính tả: Bài 4", subject: "Tiếng Việt", score: "8/10", time: "12 phút" },
];

function Page() {
  return (
    <AppShell role="student">
      <section className="bg-white rounded-2xl border shadow-sm">
        <div className="px-6 py-3 border-b flex items-center gap-2">
          <History className="h-5 w-5 text-indigo-700" />
          <h2 className="text-xl font-bold text-slate-800">Lịch sử học tập</h2>
        </div>
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
      </section>
    </AppShell>
  );
}
