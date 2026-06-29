import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Sparkles, BookOpen, Video, FileText, ListChecks } from "lucide-react";

export const Route = createFileRoute("/hoc-sinh/hoc-lieu")({
  head: () => ({ meta: [{ title: "Học liệu tăng cường – Học sinh" }] }),
  component: Page,
});

const ITEMS = [
  { id: 1, title: "Bộ luyện tập Toán nâng cao Lớp 4", subject: "Toán", kind: "Bài tập", icon: ListChecks, color: "bg-amber-100 text-amber-700" },
  { id: 2, title: "Video: Mẹo nhớ bảng cửu chương nhanh", subject: "Toán", kind: "Video", icon: Video, color: "bg-rose-100 text-rose-700" },
  { id: 3, title: "Truyện hay luyện đọc – Tập 1", subject: "Tiếng Việt", kind: "Tài liệu", icon: BookOpen, color: "bg-sky-100 text-sky-700" },
  { id: 4, title: "Đề ôn cuối kỳ – Toán Lớp 4", subject: "Toán", kind: "Đề ôn", icon: FileText, color: "bg-violet-100 text-violet-700" },
  { id: 5, title: "Sổ tay từ vựng Tiếng Anh Lớp 4", subject: "Tiếng Anh", kind: "Tài liệu", icon: BookOpen, color: "bg-emerald-100 text-emerald-700" },
  { id: 6, title: "Trắc nghiệm Tự nhiên & Xã hội", subject: "TN&XH", kind: "Bài tập", icon: ListChecks, color: "bg-cyan-100 text-cyan-700" },
];

function Page() {
  return (
    <AppShell role="student">
      <section className="bg-white rounded-2xl border shadow-sm p-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-5 w-5 text-indigo-700" />
          <h2 className="text-xl font-bold text-slate-800">Học liệu tăng cường</h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">Các học liệu do LMS cung cấp riêng cho em để tự học thêm.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ITEMS.map((it) => (
            <div key={it.id} className="rounded-xl border p-4 hover:shadow transition flex items-start gap-3">
              <span className={`h-10 w-10 rounded-md flex items-center justify-center shrink-0 ${it.color}`}>
                <it.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-slate-800">{it.title}</div>
                <div className="text-[11px] text-slate-500">{it.subject} · {it.kind}</div>
                <button className="mt-2 text-xs font-semibold text-indigo-700 hover:underline">Mở học liệu</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
