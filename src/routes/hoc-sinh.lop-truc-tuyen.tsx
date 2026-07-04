import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Video, Calendar, User, BarChart3, X, Radio } from "lucide-react";
import {
  useLiveClasses,
  formatTimeRange,
  formatDate,
  getAttendees,
  type LiveClass,
} from "@/lib/live-class-store";

export const Route = createFileRoute("/hoc-sinh/lop-truc-tuyen")({
  head: () => ({ meta: [{ title: "Lớp học trực tuyến – Học sinh" }] }),
  component: Page,
});

const STUDENT_CLASS = "4A";
const TEACHER_NAME = "Phùng Thúy Hằng";
const STUDENT_NAME = "Phí Song Ngân";

type Status = "live" | "upcoming" | "ended";

function classify(lc: LiveClass, now: number): Status {
  const s = new Date(lc.startAt).getTime();
  const e = new Date(lc.endAt).getTime();
  if (now < s) return "upcoming";
  if (now > e) return "ended";
  return "live";
}

function Page() {
  const all = useLiveClasses().filter((l) => l.classRealId === STUDENT_CLASS);
  // Tránh hydration mismatch: chỉ tính trạng thái sau khi mount client.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  const [tab, setTab] = useState<"upcoming" | "ended">("upcoming");
  const [statsFor, setStatsFor] = useState<LiveClass | null>(null);

  const { live, upcoming, ended } = useMemo(() => {
    if (now == null) return { live: [] as LiveClass[], upcoming: [] as LiveClass[], ended: [] as LiveClass[] };
    const live: LiveClass[] = [];
    const upcoming: LiveClass[] = [];
    const ended: LiveClass[] = [];
    for (const lc of all) {
      const st = classify(lc, now);
      if (st === "live") live.push(lc);
      else if (st === "upcoming") upcoming.push(lc);
      else ended.push(lc);
    }
    upcoming.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
    ended.sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());
    return { live, upcoming, ended };
  }, [all, now]);

  return (
    <AppShell role="student">
      {/* Section 1: Lớp đang diễn ra */}
      <section className="bg-white rounded-2xl border shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Radio className="h-5 w-5 text-emerald-600" />
          <h2 className="text-xl font-bold text-slate-800">Lớp học đang diễn ra</h2>
          {now != null && (
            <span className="ml-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              {live.length}
            </span>
          )}
        </div>

        {now == null ? (
          <div className="h-24 rounded-xl bg-slate-50 animate-pulse" />
        ) : live.length === 0 ? (
          <p className="text-sm text-slate-500">Hiện không có lớp học trực tuyến nào đang diễn ra.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {live.map((lc) => (
              <li
                key={lc.id}
                className="rounded-xl border-2 border-emerald-400 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate text-base">
                      {stripName(lc.name)}
                    </h3>
                    <p className="text-sm text-slate-600 mt-0.5">{lc.subject} · Lớp {lc.classRealId}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold bg-emerald-600 text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    Đang diễn ra
                  </span>
                </div>
                <div className="mt-3 text-sm text-slate-700 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" /> {formatDate(lc.startAt)} · {formatTimeRange(lc.startAt, lc.endAt)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="h-4 w-4" /> Giáo viên: {TEACHER_NAME}
                  </div>
                </div>
                <a
                  href={lc.link} target="_blank" rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <Video className="h-4 w-4" /> Vào lớp
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Section 2: Tabs */}
      <section className="bg-white rounded-2xl border shadow-sm p-6">
        <div className="flex items-center gap-2 border-b border-slate-200 mb-4">
          <TabBtn
            active={tab === "upcoming"}
            onClick={() => setTab("upcoming")}
            label="Sắp diễn ra"
            count={now == null ? undefined : upcoming.length}
          />
          <TabBtn
            active={tab === "ended"}
            onClick={() => setTab("ended")}
            label="Đã kết thúc"
            count={now == null ? undefined : ended.length}
          />
        </div>

        {now == null ? (
          <div className="h-24 rounded-xl bg-slate-50 animate-pulse" />
        ) : tab === "upcoming" ? (
          upcoming.length === 0 ? (
            <p className="text-sm text-slate-500">Chưa có lớp học sắp diễn ra.</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcoming.map((lc) => (
                <UpcomingCard key={lc.id} lc={lc} soon={isTodayOrTomorrow(lc.startAt, now)} />
              ))}
            </ul>
          )
        ) : ended.length === 0 ? (
          <p className="text-sm text-slate-500">Chưa có lớp học nào đã kết thúc.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ended.map((lc) => (
              <EndedCard key={lc.id} lc={lc} onStats={() => setStatsFor(lc)} />
            ))}
          </ul>
        )}
      </section>

      {statsFor && (
        <MyAttendanceModal live={statsFor} onClose={() => setStatsFor(null)} />
      )}
    </AppShell>
  );
}

/* Buổi học có bắt đầu vào hôm nay hoặc ngày mai (so với thời điểm hiện tại). */
function isTodayOrTomorrow(startAt: string, now: number): boolean {
  const s = new Date(startAt);
  const n = new Date(now);
  const startDay = new Date(s.getFullYear(), s.getMonth(), s.getDate()).getTime();
  const today = new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime();
  const diffDays = Math.round((startDay - today) / (24 * 60 * 60 * 1000));
  return diffDays === 0 || diffDays === 1;
}

/* Bỏ các đuôi "– buổi trực tuyến", "– đang diễn ra", "- ..." khỏi tên lớp */
function stripName(name: string): string {
  return name
    .replace(/\s*[–-]\s*buổi trực tuyến\s*$/i, "")
    .replace(/\s*[–-]\s*đang diễn ra\s*$/i, "")
    .replace(/\s*[–-]\s*sắp diễn ra\s*$/i, "")
    .trim();
}

function TabBtn({
  active, onClick, label, count,
}: { active: boolean; onClick: () => void; label: string; count?: number }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2.5 text-sm font-semibold transition ${
        active ? "text-indigo-700" : "text-slate-500 hover:text-slate-700"
      }`}
    >
      <span className="inline-flex items-center gap-1.5">
        {label}
        {typeof count === "number" && (
          <span className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] rounded-full ${
            active ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"
          }`}>{count}</span>
        )}
      </span>
      {active && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-indigo-600 rounded-full" />}
    </button>
  );
}

function UpcomingCard({ lc }: { lc: LiveClass }) {
  return (
    <li className="rounded-xl border p-4 hover:shadow transition bg-white">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-800 truncate">{stripName(lc.name)}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{lc.subject} · Lớp {lc.classRealId}</p>
        </div>
        <span className="inline-flex items-center rounded-md border border-orange-200 bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
          Sắp diễn ra
        </span>
      </div>
      <div className="mt-3 text-xs text-slate-600 space-y-1">
        <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {formatDate(lc.startAt)} · {formatTimeRange(lc.startAt, lc.endAt)}</div>
        <div className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Giáo viên: {TEACHER_NAME}</div>
      </div>
    </li>
  );
}

function EndedCard({ lc, onStats }: { lc: LiveClass; onStats: () => void }) {
  return (
    <li className="rounded-xl border p-4 bg-white">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-800 truncate">{stripName(lc.name)}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{lc.subject} · Lớp {lc.classRealId}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
            Đã kết thúc
          </span>
          <button
            onClick={onStats}
            className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700 hover:underline inline-flex items-center gap-1"
          >
            <BarChart3 className="h-3 w-3" /> Xem thống kê
          </button>
        </div>
      </div>
      <div className="mt-3 text-xs text-slate-600 space-y-1">
        <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {formatDate(lc.startAt)} · {formatTimeRange(lc.startAt, lc.endAt)}</div>
        <div className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Giáo viên: {TEACHER_NAME}</div>
      </div>
    </li>
  );
}

function MyAttendanceModal({ live, onClose }: { live: LiveClass; onClose: () => void }) {
  // Lấy sessions của "học sinh hiện tại" (mock: chọn attendee đầu tiên khớp tên hoặc phần tử [0]).
  const attendees = useMemo(() => getAttendees(live), [live]);
  const me = attendees.find((a) => a.name === STUDENT_NAME) ?? attendees[0];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b bg-gradient-to-r from-slate-50 to-indigo-50 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <span className="h-9 w-9 rounded-lg inline-flex items-center justify-center bg-indigo-600 text-white shrink-0">
              <BarChart3 className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-800 truncate">Thời gian tham dự của bạn</h3>
              <p className="text-xs text-slate-600 mt-0.5 truncate">
                {stripName(live.name)} · {formatDate(live.startAt)} · {formatTimeRange(live.startAt, live.endAt)}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/60 text-slate-500 shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="text-sm text-slate-600 mb-2">
            Học sinh: <span className="font-semibold text-slate-800">{STUDENT_NAME}</span>
          </div>
          <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2 text-left font-semibold w-16">Lần</th>
                <th className="px-3 py-2 text-left font-semibold">Thời gian vào</th>
                <th className="px-3 py-2 text-left font-semibold">Thời gian ra</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {me?.sessions.map((s, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-3 py-2 text-slate-500">#{i + 1}</td>
                  <td className="px-3 py-2 font-mono text-slate-700">{s.joinAt}</td>
                  <td className="px-3 py-2 font-mono text-slate-700">{s.leaveAt}</td>
                </tr>
              )) ?? null}
              {(!me || me.sessions.length === 0) && (
                <tr><td colSpan={3} className="px-3 py-6 text-center text-sm text-slate-400 italic">Không có dữ liệu tham dự.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t bg-slate-50 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
