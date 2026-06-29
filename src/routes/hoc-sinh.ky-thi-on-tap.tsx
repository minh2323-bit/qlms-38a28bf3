import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { Landmark, Building2, School, BookOpenCheck } from "lucide-react";

export const Route = createFileRoute("/hoc-sinh/ky-thi-on-tap")({
  head: () => ({ meta: [{ title: "Kỳ thi ôn tập – Học sinh" }] }),
  component: Page,
});

const DATA: Record<"so" | "xa" | "truong", { id: string; name: string; subject: string; questions: number }[]> = {
  so: [
    { id: "os1", name: "Đề ôn cấp Sở số 1 – Toán", subject: "Toán", questions: 20 },
    { id: "os2", name: "Đề ôn cấp Sở số 2 – Toán", subject: "Toán", questions: 25 },
    { id: "os3", name: "Đề ôn cấp Sở – Tiếng Việt", subject: "Tiếng Việt", questions: 15 },
  ],
  xa: [
    { id: "ox1", name: "Đề ôn cấp Xã – Toán", subject: "Toán", questions: 18 },
  ],
  truong: [
    { id: "ot1", name: "Đề ôn cuối kỳ – Trường Tô Hiệu", subject: "Toán", questions: 22 },
    { id: "ot2", name: "Đề ôn cuối kỳ – Tiếng Việt", subject: "Tiếng Việt", questions: 20 },
  ],
};

const TABS = [
  { key: "so" as const, label: "Sở", icon: Landmark },
  { key: "xa" as const, label: "Xã/Phường", icon: Building2 },
  { key: "truong" as const, label: "Trường", icon: School },
];

function Page() {
  const [tab, setTab] = useState<"so" | "xa" | "truong">("so");
  return (
    <AppShell role="student">
      <section className="bg-white rounded-2xl border shadow-sm">
        <div className="px-6 py-3 border-b flex items-center gap-2">
          <BookOpenCheck className="h-5 w-5 text-indigo-700" />
          <h2 className="text-xl font-bold text-slate-800">Kỳ thi ôn tập</h2>
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
          {DATA[tab].map((e) => (
            <div key={e.id} className="rounded-xl border p-4 hover:shadow transition flex items-center justify-between gap-2">
              <div>
                <div className="font-semibold text-slate-800">{e.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{e.subject} · {e.questions} câu</div>
              </div>
              <button className="text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 px-3 py-1.5 rounded-md">
                Luyện ngay
              </button>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
