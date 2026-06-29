import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Video, Users, Calendar } from "lucide-react";
import { useLiveClasses, formatTimeRange, isLiveEnded } from "@/lib/live-class-store";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/hoc-sinh/lop-truc-tuyen")({
  head: () => ({ meta: [{ title: "Lớp học trực tuyến – Học sinh" }] }),
  component: Page,
});

const STUDENT_CLASS = "4A";

function Page() {
  const lives = useLiveClasses().filter((l) => l.classRealId === STUDENT_CLASS);
  return (
    <AppShell role="student">
      <section className="bg-white rounded-2xl border shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Video className="h-5 w-5 text-emerald-600" />
          <h2 className="text-xl font-bold text-slate-800">Lớp học trực tuyến</h2>
        </div>

        {lives.length === 0 && (
          <p className="text-sm text-slate-500">Chưa có lớp học trực tuyến nào được lên lịch.</p>
        )}

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {lives.map((lc) => {
            const ended = isLiveEnded(lc);
            return (
              <li key={lc.id} className="rounded-xl border p-4 hover:shadow transition">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate">{lc.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{lc.subject} · Lớp {lc.classRealId}</p>
                  </div>
                  <Badge className={ended ? "bg-slate-100 text-slate-600" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"}>
                    {ended ? "Đã kết thúc" : "Sắp diễn ra"}
                  </Badge>
                </div>
                <div className="mt-3 text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(lc.startAt).toLocaleDateString("vi-VN")} · {formatTimeRange(lc.startAt, lc.endAt)}</div>
                  <div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {lc.studentCount} học sinh</div>
                </div>
                {!ended && (
                  <a
                    href={lc.link} target="_blank" rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <Video className="h-3.5 w-3.5" /> Vào lớp
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </AppShell>
  );
}
