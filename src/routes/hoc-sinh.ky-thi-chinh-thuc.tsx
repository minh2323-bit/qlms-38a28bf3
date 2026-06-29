import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { Landmark, Building2, School, FileCheck2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/hoc-sinh/ky-thi-chinh-thuc")({
  head: () => ({ meta: [{ title: "Kỳ thi chính thức – Học sinh" }] }),
  component: Page,
});

type Exam = { id: string; name: string; date: string; subject: string; status: "upcoming" | "done"; score?: string };

const DATA: Record<"so" | "xa" | "truong", Exam[]> = {
  so: [
    { id: "s1", name: "Khảo sát chất lượng cuối kỳ – Sở GD&ĐT", date: "20/5/2026", subject: "Toán", status: "upcoming" },
    { id: "s2", name: "Khảo sát chất lượng giữa kỳ – Sở GD&ĐT", date: "12/3/2026", subject: "Toán", status: "done", score: "8.5" },
  ],
  xa: [
    { id: "x1", name: "Kỳ thi cấp Xã – Môn Toán", date: "15/5/2026", subject: "Toán", status: "upcoming" },
  ],
  truong: [
    { id: "t1", name: "Kiểm tra cuối kỳ – Trường Tô Hiệu", date: "10/5/2026", subject: "Toán", status: "upcoming" },
    { id: "t2", name: "Kiểm tra giữa kỳ – Trường Tô Hiệu", date: "05/3/2026", subject: "Tiếng Việt", status: "done", score: "9.0" },
  ],
};

const TABS = [
  { key: "so" as const, label: "Sở", icon: Landmark },
  { key: "xa" as const, label: "Xã/Phường", icon: Building2 },
  { key: "truong" as const, label: "Trường", icon: School },
];

function Page() {
  const [tab, setTab] = useState<"so" | "xa" | "truong">("so");
  const list = DATA[tab];
  return (
    <AppShell role="student">
      <section className="bg-white rounded-2xl border shadow-sm">
        <div className="px-6 py-3 border-b flex items-center gap-2">
          <FileCheck2 className="h-5 w-5 text-indigo-700" />
          <h2 className="text-xl font-bold text-slate-800">Kỳ thi chính thức</h2>
        </div>
        <div className="px-6 pt-4 flex gap-2 border-b">
          {TABS.map((t) => (
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
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          {list.map((e) => (
            <div key={e.id} className="rounded-xl border p-4 hover:shadow transition">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-slate-800">{e.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{e.subject} · {e.date}</div>
                </div>
                {e.status === "done" ? (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Điểm: {e.score}</Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Sắp thi</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
