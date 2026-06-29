import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ClipboardList, ListChecks, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/hoc-sinh/nhiem-vu")({
  head: () => ({ meta: [{ title: "Nhiệm vụ & Bài tập – Học sinh" }] }),
  component: Page,
});

const TASKS = [
  { id: "t1", title: "Bài tập Toán: Số tự nhiên & làm tròn", subject: "Toán", due: "Hạn: 14/4/2026", status: "todo" as const },
  { id: "t2", title: "Phiếu luyện tập số trung bình cộng", subject: "Toán", due: "Hạn: 16/4/2026", status: "todo" as const },
  { id: "t3", title: "Viết đoạn văn ngắn về quê hương", subject: "Tiếng Việt", due: "Hạn: 15/4/2026", status: "todo" as const },
  { id: "t4", title: "Bài tập So sánh phân số", subject: "Toán", due: "Đã nộp 10/4", status: "graded" as const, score: "9/10" },
  { id: "t5", title: "Đọc hiểu bài: Cây bàng", subject: "Tiếng Việt", due: "Đã nộp 09/4", status: "graded" as const, score: "8/10" },
  { id: "t6", title: "Bài tập Quy đồng mẫu số", subject: "Toán", due: "Đã nộp 08/4", status: "graded" as const, score: "10/10" },
];

function Page() {
  const todo = TASKS.filter((t) => t.status === "todo");
  const graded = TASKS.filter((t) => t.status === "graded");
  return (
    <AppShell role="student">
      <section className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-indigo-700" />
          <h2 className="text-xl font-bold text-slate-800">Nhiệm vụ, bài tập</h2>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <h3 className="font-semibold text-slate-800">Cần hoàn thành ({todo.length})</h3>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {todo.map((t) => (
              <li key={t.id} className="rounded-xl border p-3 flex items-start justify-between gap-3 hover:shadow transition">
                <div>
                  <div className="text-sm font-semibold text-slate-800">{t.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{t.subject} · {t.due}</div>
                </div>
                <button className="text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 px-3 py-1.5 rounded-md shrink-0">
                  Làm bài
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <h3 className="font-semibold text-slate-800">Bài giáo viên vừa chấm ({graded.length})</h3>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {graded.map((t) => (
              <li key={t.id} className="rounded-xl border p-3 flex items-start justify-between gap-3 hover:shadow transition">
                <div>
                  <div className="text-sm font-semibold text-slate-800">{t.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{t.subject} · {t.due}</div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 shrink-0">{t.score}</Badge>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <div className="hidden"><ListChecks /></div>
    </AppShell>
  );
}
