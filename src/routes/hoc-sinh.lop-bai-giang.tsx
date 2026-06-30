import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { BookMarked, Presentation, FileText, Video, ListChecks } from "lucide-react";
import { useMaterials } from "@/lib/teaching-store";
import { Badge } from "@/components/ui/badge";
import thumb4A from "@/assets/thumb-lop-4a.jpg";

export const Route = createFileRoute("/hoc-sinh/lop-bai-giang")({
  head: () => ({ meta: [{ title: "Lớp học & Bài giảng – Học sinh" }] }),
  component: Page,
});

const STUDENT_CLASS = "4A";

function Page() {
  const [tab, setTab] = useState<"lop" | "baigiang">("lop");
  const materials = useMaterials().filter((m) => m.classRealId === STUDENT_CLASS);
  const baiGiang = materials.filter((m) => m.kind === "slide" || m.kind === "syllabus");

  return (
    <AppShell role="student">
      <section className="bg-white rounded-2xl border shadow-sm">
        <div className="px-6 py-3 border-b flex items-center gap-2">
          <BookMarked className="h-5 w-5 text-indigo-700" />
          <h2 className="text-xl font-bold text-slate-800">Lớp học / Bài giảng</h2>
        </div>
        <div className="px-6 pt-4 flex gap-2 border-b">
          {([
            { key: "lop", label: "Lớp học" },
            { key: "baigiang", label: "Bài giảng" },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
                tab === t.key ? "border-indigo-700 text-indigo-700" : "border-transparent text-slate-600 hover:text-indigo-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === "lop" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                to="/hoc-sinh/lop/$lop"
                params={{ lop: STUDENT_CLASS }}
                className="rounded-xl border overflow-hidden hover:shadow-md hover:border-indigo-300 transition block"
              >
                <img src={thumb4A} alt={`Lớp ${STUDENT_CLASS}`} className="h-36 w-full object-cover" loading="lazy" />
                <div className="p-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800">Lớp {STUDENT_CLASS}</h3>
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Đang học</Badge>
                  </div>
                  <p className="text-xs text-slate-500">Năm học 2025 – 2026</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Lớp học của em — nơi xem tất cả bài giảng, học liệu và thông báo từ giáo viên.
                  </p>
                </div>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {baiGiang.length === 0 && (
                <p className="text-sm text-slate-500 col-span-2">Chưa có bài giảng nào.</p>
              )}
              {baiGiang.map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-xl border p-3 hover:shadow transition">
                  <span className="h-10 w-10 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Presentation className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-800 truncate">{m.title}</div>
                    <div className="text-[11px] text-slate-500">{m.subject} · {m.meta ?? "Bài giảng"}</div>
                  </div>
                  <button className="text-xs font-semibold text-indigo-700 hover:underline">Mở</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}

// silence unused warnings
void FileText; void Video; void ListChecks;
