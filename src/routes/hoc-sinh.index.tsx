import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ClipboardList, Video, CheckCircle2, ChevronLeft, ChevronRight, CalendarClock,
  Sun, Moon, X, BookOpen, Presentation, FileText, ListChecks,
  StickyNote, Bell, ArrowRight, AlertCircle, Crown, Trophy, Play,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMaterials, type MaterialKind } from "@/lib/teaching-store";
import { useLiveClasses, isEvening, formatTimeRange } from "@/lib/live-class-store";


export const Route = createFileRoute("/hoc-sinh/")({
  head: () => ({
    meta: [
      { title: "Trang chủ – Học sinh | Tiểu học Tô Hiệu" },
      { name: "description", content: "Trang chủ học sinh: nhiệm vụ cần làm, thời khóa biểu và học liệu của tiết học." },
    ],
  }),
  component: StudentHome,
});

/* ---------------- Data ---------------- */
const STUDENT_CLASS = "4A";

const SUBJECT_COLORS: Record<string, string> = {
  "Toán":                  "bg-violet-50 text-violet-900 border-l-4 border-violet-500",
  "Tiếng Việt":            "bg-emerald-50 text-emerald-900 border-l-4 border-emerald-500",
  "Ngữ văn":               "bg-emerald-50 text-emerald-900 border-l-4 border-emerald-500",
  "Tiếng Anh":             "bg-sky-50 text-sky-900 border-l-4 border-sky-500",
  "Đạo đức":               "bg-amber-50 text-amber-900 border-l-4 border-amber-500",
  "Giáo dục công dân":     "bg-fuchsia-50 text-fuchsia-900 border-l-4 border-fuchsia-500",
  "Tự nhiên và xã hội":    "bg-cyan-50 text-cyan-900 border-l-4 border-cyan-500",
  "HĐTN/GDĐP":             "bg-rose-50 text-rose-900 border-l-4 border-rose-500",
  "Giáo dục thể chất":     "bg-orange-50 text-orange-900 border-l-4 border-orange-500",
  "Âm nhạc":               "bg-pink-50 text-pink-900 border-l-4 border-pink-500",
};

type Period = {
  id: string;
  subject: string;
  teacher: string;
  unitId?: string; // optional mapping into teaching-store for materials
  topic?: string;
};

const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
const DAY_DATES = ["11", "12", "13", "14", "15", "16", "17"];

// Build weekly schedule mirroring the reference (image 2)
const SCHED: Record<number, Record<number, Period | null>> = {
  1: {
    0: null,
    1: { id: "p11", subject: "Giáo dục công dân", teacher: "Nguyễn Thị Trang" },
    2: { id: "p12", subject: "Toán", teacher: "Nguyễn Thị Thu Huyền", unitId: "u1-sotunhien", topic: "Ôn tập số tự nhiên" },
    3: { id: "p13", subject: "Ngữ văn", teacher: "Nguyễn Thị Trang" },
    4: { id: "p14", subject: "Đạo đức", teacher: "Nguyễn Thị Trang" },
    5: null, 6: null,
  },
  2: {
    0: { id: "p21", subject: "Toán", teacher: "Nguyễn Thị Trang", unitId: "u1-sotunhien", topic: "Hàng và lớp" },
    1: { id: "p22", subject: "Toán", teacher: "Nguyễn Thị Trang", unitId: "u1-sotunhien", topic: "Luyện tập" },
    2: { id: "p23", subject: "Tự nhiên và xã hội", teacher: "Nguyễn Thị Trang" },
    3: { id: "p24", subject: "Toán", teacher: "Nguyễn Thị Trang", unitId: "u1-lamtron", topic: "Làm tròn số tự nhiên" },
    4: { id: "p25", subject: "Toán", teacher: "Nguyễn Thị Trang", unitId: "u2-trungbinh", topic: "Tìm số trung bình cộng" },
    5: null, 6: null,
  },
  3: {
    0: { id: "p31", subject: "Giáo dục thể chất", teacher: "Nguyễn Thị Trang" },
    1: { id: "p32", subject: "Tiếng Anh", teacher: "Nguyễn Thị Thanh Nga" },
    2: { id: "p33", subject: "Tiếng Việt", teacher: "Nguyễn Thị Trang", unitId: "u3-khainiem", topic: "Khái niệm phân số" },
    3: { id: "p34", subject: "Tự nhiên và xã hội", teacher: "Nguyễn Thị Trang" },
    4: { id: "p35", subject: "Tiếng Việt", teacher: "Nguyễn Thị Trang" },
    5: null, 6: null,
  },
  4: {
    0: { id: "p41", subject: "Đạo đức", teacher: "Nguyễn Thị Trang" },
    1: { id: "p42", subject: "Tiếng Việt", teacher: "Nguyễn Thị Trang" },
    2: { id: "p43", subject: "HĐTN/GDĐP", teacher: "Phùng Thúy Hằng" },
    3: { id: "p44", subject: "Đạo đức", teacher: "Nguyễn Thị Trang" },
    4: { id: "p45", subject: "Tiếng Việt", teacher: "Nguyễn Thị Trang" },
    5: null, 6: null,
  },
  5: {
    0: { id: "p51", subject: "Đạo đức", teacher: "Nguyễn Thị Thu Ngàn" },
    1: { id: "p52", subject: "Âm nhạc", teacher: "Ngô Thị Hà Thu" },
    2: { id: "p53", subject: "Giáo dục công dân", teacher: "Nguyễn Thị Trang" },
    3: { id: "p54", subject: "Toán", teacher: "Nguyễn Thị Trang", unitId: "u1-sotunhien", topic: "Luyện tập" },
    4: null, 5: null, 6: null,
  },
};

const TEACHER_NOTES: Record<string, string> = {
  p12: "Các em ôn lại bảng giá trị các hàng trước khi vào lớp nhé.",
  p21: "Mang theo SGK Toán và vở bài tập, làm trước bài 1, 2 trang 12.",
  p24: "Đọc kỹ phần ghi nhớ về làm tròn số ở trang 18.",
  p33: "Chuẩn bị bút màu để vẽ minh hoạ phân số.",
  p43: "Mặc đồng phục thể thao, hoạt động trải nghiệm ngoài sân.",
};

const PERIODS = [1, 2, 3, 4, 5] as const;

function StudentHome() {
  const [activePeriod, setActivePeriod] = useState<{ day: number; period: number } | null>(null);
  const [tasksOpen, setTasksOpen] = useState(false);
  const liveAll = useLiveClasses();

  const myLive = useMemo(
    () => liveAll.filter((l) => l.classRealId === STUDENT_CLASS),
    [liveAll],
  );

  // Upcoming = bắt đầu trong 24h tới tính từ now
  const upcomingCount = useMemo(() => {
    const now = Date.now();
    const horizon = now + 24 * 60 * 60 * 1000;
    return myLive.filter((l) => {
      const t = new Date(l.startAt).getTime();
      return t >= now && t <= horizon;
    }).length;
  }, [myLive]);

  // Lớp đang diễn ra (now ∈ [startAt, endAt])
  const ongoingLive = useMemo(() => {
    const now = Date.now();
    return myLive.find(
      (l) => new Date(l.startAt).getTime() <= now && new Date(l.endAt).getTime() >= now,
    );
  }, [myLive]);

  // Buổi tối — map day index "10..17" -> evening lives
  const eveningByDay = useMemo(() => {
    const map = new Map<number, typeof myLive>();
    for (const lc of myLive) {
      if (!isEvening(lc.startAt)) continue;
      const d = new Date(lc.startAt);
      const dateNum = d.getDate();
      const idx = DAY_DATES.indexOf(String(dateNum));
      if (idx < 0) continue;
      if (!map.has(idx)) map.set(idx, []);
      map.get(idx)!.push(lc);
    }
    return map;
  }, [myLive]);

  const activePeriodObj = activePeriod
    ? SCHED[activePeriod.period]?.[activePeriod.day] ?? null
    : null;

  return (
    <AppShell role="student">
      <DashboardSection
        upcomingCount={upcomingCount}
        ongoingLive={ongoingLive}
        onOpenTasks={() => setTasksOpen(true)}
      />

      <section className="bg-white rounded-2xl border shadow-sm">
        <div className="px-6 py-3 border-b flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-800">Thời khóa biểu</h2>
          <div className="flex items-center gap-1 rounded-lg border bg-slate-50 px-2 py-1">
            <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronLeft className="h-4 w-4" /></Button>
            <CalendarClock className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium px-2">Tuần 2 · 11/4 – 17/4/2026</span>
            <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="flex">
          <div className="flex-1 min-w-0 p-4 overflow-x-auto">
            <ScheduleGrid
              activePeriod={activePeriod}
              onPick={(day, period) => setActivePeriod({ day, period })}
              eveningByDay={eveningByDay}
            />
          </div>
          {activePeriodObj && activePeriod && (
            <PeriodPanel
              period={activePeriodObj}
              day={activePeriod.day}
              periodIdx={activePeriod.period}
              onClose={() => setActivePeriod(null)}
            />
          )}
        </div>
      </section>

      <TasksDialog open={tasksOpen} onOpenChange={setTasksOpen} />
    </AppShell>
  );
}


/* ---------------- Dashboard ---------------- */
type LiveLite = { id: string; name: string; link: string; subject: string; startAt: string; endAt: string };

function DashboardSection({
  upcomingCount, ongoingLive, onOpenTasks,
}: {
  upcomingCount: number;
  ongoingLive: LiveLite | undefined;
  onOpenTasks: () => void;
}) {
  type Item = {
    value: string; label: string; sub: string;
    icon: typeof ClipboardList; bg: string; fg: string; bar: string;
    to?: string; onClick?: () => void;
  };
  const items: Item[] = [
    {
      value: "3", label: "Bài tập cần hoàn thành",
      sub: "2 bài Toán · 1 bài Tiếng Việt",
      icon: ClipboardList, bg: "bg-amber-50", fg: "text-amber-600", bar: "bg-amber-500",
      onClick: onOpenTasks,
    },
    {
      value: String(Math.max(upcomingCount, 3)), label: "Buổi học trực tuyến sắp diễn ra",
      sub: "Trong 24 giờ tới",
      icon: Video, bg: "bg-emerald-50", fg: "text-emerald-600", bar: "bg-emerald-500",
      to: "/hoc-sinh/lop-truc-tuyen",
    },
    {
      value: "2", label: "Kỳ thi sắp diễn ra",
      sub: "Toán · Tiếng Việt",
      icon: Trophy, bg: "bg-rose-50", fg: "text-rose-600", bar: "bg-rose-500",
      to: "/hoc-sinh/ky-thi-chinh-thuc",
    },
    {
      value: "3", label: "Bài giáo viên vừa chấm",
      sub: "Mới có điểm hôm nay",
      icon: CheckCircle2, bg: "bg-indigo-50", fg: "text-indigo-600", bar: "bg-indigo-500",
      to: "/hoc-sinh/nhiem-vu",
    },
  ];

  const cardCls = "relative flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:shadow-md hover:border-indigo-300 transition overflow-hidden group text-left";

  return (
    <section className="bg-white rounded-xl border shadow-sm p-3 space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {items.map((s) => {
          const inner = (
            <>
              <span className={`absolute left-0 top-0 h-full w-1 ${s.bar}`} />
              <span className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${s.bg}`}>
                <s.icon className={`h-5 w-5 ${s.fg}`} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-2xl font-black text-slate-800 leading-none">{s.value}</div>
                <div className="text-xs font-semibold text-slate-700 mt-1">{s.label}</div>
                <div className="text-[11px] text-slate-500">{s.sub}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition" />
            </>
          );
          return s.to ? (
            <Link key={s.label} to={s.to} className={cardCls}>{inner}</Link>
          ) : (
            <button key={s.label} onClick={s.onClick} className={cardCls}>{inner}</button>
          );
        })}
      </div>

      {ongoingLive && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 flex items-center gap-3">
          <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span className="absolute inset-0 rounded-full ring-2 ring-amber-400 animate-ping opacity-60" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-white uppercase tracking-wide">Đang diễn ra</span>
              <span className="text-sm font-semibold text-amber-900 truncate">{ongoingLive.name}</span>
            </div>
            <p className="text-[11px] text-amber-700 mt-0.5">
              {ongoingLive.subject} · {formatTimeRange(ongoingLive.startAt, ongoingLive.endAt)} · Vào muộn không cần tìm link, bấm “Vào ngay”.
            </p>
          </div>
          <a
            href={ongoingLive.link} target="_blank" rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-amber-600 text-white text-xs font-bold hover:bg-amber-700"
          >
            <Play className="h-3.5 w-3.5" /> Vào ngay
          </a>
        </div>
      )}
    </section>
  );
}

/* ---------------- Tasks Dialog (popup) ---------------- */
type Task = { id: string; title: string; subject: string; teacher: string; deadline: string; premium?: boolean };
const PENDING_TASKS: Task[] = [
  { id: "t1", title: "Làm tròn số đến hàng chục, hàng trăm", subject: "Toán", teacher: "Phùng Thúy Hằng", deadline: "18/06/2026, 12:15", premium: true },
  { id: "t2", title: "Luyện tập: So sánh phân số", subject: "Toán", teacher: "Nguyễn Thị Trang", deadline: "19/06/2026, 17:00" },
  { id: "t3", title: "Đọc hiểu: Cây bàng (bài tập 3)", subject: "Tiếng Việt", teacher: "Nguyễn Thị Trang", deadline: "20/06/2026, 22:00" },
];

function TasksDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-amber-600" />
            Nhiệm vụ, bài tập cần làm
          </DialogTitle>
        </DialogHeader>
        <ul className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {PENDING_TASKS.map((t) => (
            <li key={t.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:shadow-sm transition">
              <button className="h-8 w-8 rounded-full border bg-white text-slate-400 hover:text-indigo-700 hover:border-indigo-300 flex items-center justify-center shrink-0" aria-label="Quay lại">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="font-bold text-slate-800 text-sm truncate">{t.title}</h4>
                  {t.premium && <Crown className="h-4 w-4 text-emerald-500 shrink-0" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Hạn nộp: <span className="font-medium text-slate-700">{t.deadline}</span> · {t.subject}
                </p>
                <p className="text-[11px] text-slate-500">GV: {t.teacher}</p>
              </div>
              <button className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border-2 border-amber-400 bg-amber-50 text-amber-700 text-sm font-bold hover:bg-amber-100">
                Làm bài <Play className="h-3.5 w-3.5 fill-amber-700" />
              </button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}


/* ---------------- Schedule Grid ---------------- */
function ScheduleGrid({
  activePeriod, onPick, eveningByDay,
}: {
  activePeriod: { day: number; period: number } | null;
  onPick: (day: number, period: number) => void;
  eveningByDay: Map<number, ReturnType<typeof useLiveClasses>>;
}) {
  const renderCell = (d: number, p: number) => {
    const cell = SCHED[p]?.[d] ?? null;
    const isActive = activePeriod && activePeriod.day === d && activePeriod.period === p;
    return (
      <td key={d} className="border border-slate-200 p-1 align-top h-16">
        {cell && (
          <button
            onClick={() => onPick(d, p)}
            className={`w-full h-full text-left p-2 rounded-md text-[11px] leading-tight transition ${
              SUBJECT_COLORS[cell.subject] ?? "bg-slate-50 text-slate-800 border-l-4 border-slate-400"
            } ${isActive ? "ring-2 ring-indigo-700 shadow-md" : "hover:shadow hover:-translate-y-0.5"}`}
          >
            <div className="font-bold">{cell.subject}</div>
            <div className="text-[10px] opacity-80 truncate">G/v: {cell.teacher}</div>
          </button>
        )}
      </td>
    );
  };

  return (
    <div className="min-w-[900px]">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <th colSpan={2} className="bg-indigo-50 text-indigo-700 border border-indigo-200 p-2 font-bold rounded-tl-lg">
              Tiết
            </th>
            {DAYS.map((d, i) => (
              <th key={d} className={`border border-indigo-200 p-3 font-bold text-sm ${i === 6 ? "bg-sky-50 text-sky-700" : "bg-indigo-50 text-indigo-700"}`}>
                <div className="text-lg leading-tight">{DAY_DATES[i]}</div>
                <div className="text-[11px] font-medium opacity-90">{d}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERIODS.map((p, idx) => (
            <tr key={p}>
              {idx === 0 && (
                <td rowSpan={5} className="border border-indigo-200 bg-amber-50 text-amber-700 text-center align-middle font-semibold p-2 w-16">
                  <div className="flex flex-col items-center gap-2">
                    <Sun className="h-5 w-5 text-amber-500" />
                    <span className="text-[11px]">Sáng</span>
                  </div>
                </td>
              )}
              <td className="border border-indigo-200 text-center font-semibold p-2 w-16 bg-white text-indigo-700">
                Tiết {p}
              </td>
              {DAYS.map((_, d) => renderCell(d, p))}
            </tr>
          ))}
          {(() => {
            const hasEvening = DAYS.some((_, d) => (eveningByDay.get(d) ?? []).length > 0);
            if (!hasEvening) return null;
            return (
              <tr>
                <td colSpan={2} className="border border-indigo-200 bg-indigo-50 text-indigo-700 text-center align-middle font-semibold p-2 rounded-bl-lg">
                  <div className="flex flex-col items-center gap-1">
                    <Moon className="h-5 w-5 text-indigo-500" />
                    <span className="text-[11px]">Buổi tối</span>
                  </div>
                </td>
                {DAYS.map((_, d) => {
                  const list = eveningByDay.get(d) ?? [];
                  return (
                    <td key={d} className="border border-slate-200 p-1 align-top h-14 bg-indigo-50/30">
                      <div className="flex flex-col gap-1">
                        {list.map((lc) => (
                          <a
                            key={lc.id}
                            href={lc.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={lc.name}
                            className="w-full text-left inline-flex items-center gap-1 px-1.5 py-1 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
                          >
                            <Video className="h-3 w-3 shrink-0" />
                            <span className="truncate">{formatTimeRange(lc.startAt, lc.endAt)}</span>
                          </a>
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })()}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- Period Side Panel ---------------- */
const KIND_META: Record<MaterialKind, { icon: typeof FileText; label: string; bg: string; fg: string }> = {
  syllabus: { icon: BookOpen,     label: "Tổng quan", bg: "bg-indigo-100",  fg: "text-indigo-700" },
  slide:    { icon: Presentation, label: "Slide",     bg: "bg-purple-100",  fg: "text-purple-700" },
  doc:      { icon: FileText,     label: "Tài liệu",  bg: "bg-sky-100",     fg: "text-sky-700" },
  image:    { icon: FileText,     label: "Hình ảnh",  bg: "bg-emerald-100", fg: "text-emerald-700" },
  video:    { icon: Video,        label: "Video",     bg: "bg-rose-100",    fg: "text-rose-700" },
  exercise: { icon: ListChecks,   label: "Bài tập",   bg: "bg-amber-100",   fg: "text-amber-700" },
};

function PeriodPanel({
  period, day, periodIdx, onClose,
}: { period: Period; day: number; periodIdx: number; onClose: () => void }) {
  const all = useMaterials();
  const items = useMemo(() => {
    if (!period.unitId) return [];
    return all.filter(
      (m) => m.classRealId === STUDENT_CLASS && m.subject === period.subject && m.unitId === period.unitId,
    );
  }, [all, period.unitId, period.subject]);

  const exercises = items.filter((m) => m.kind === "exercise");
  const materials = items.filter((m) => m.kind !== "exercise");
  const note = TEACHER_NOTES[period.id];

  return (
    <aside className="w-[360px] shrink-0 border-l bg-slate-50/60 flex flex-col animate-in slide-in-from-right-4 duration-200">
      <div className="px-4 py-3 border-b bg-white flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-slate-800">{period.subject}</h3>
            <Badge variant="outline" className="text-[10px]">{DAYS[day]} · Tiết {periodIdx}</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            G/v: <span className="font-medium">{period.teacher}</span>
            {period.topic && <> · {period.topic}</>}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Bài tập trong tiết */}
        <Section title="Bài tập trong tiết" icon={ListChecks}>
          {exercises.length === 0 ? (
            <EmptyMsg>Tiết học này chưa có bài tập.</EmptyMsg>
          ) : (
            <ul className="divide-y">
              {exercises.map((m) => {
                const meta = KIND_META[m.kind];
                return (
                  <li key={m.id} className="flex items-center justify-between gap-2 px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${meta.bg}`}>
                        <meta.icon className={`h-4 w-4 ${meta.fg}`} />
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm text-slate-800 truncate">{m.title}</div>
                        {m.meta && <div className="text-[10px] text-slate-500">{m.meta}</div>}
                      </div>
                    </div>
                    <button className="text-[11px] font-semibold text-indigo-700 hover:underline shrink-0">Làm bài</button>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        {/* Học liệu dùng trong tiết */}
        <Section title="Học liệu dùng trong tiết" icon={BookOpen}>
          {materials.length === 0 ? (
            <EmptyMsg>Chưa có học liệu giáo viên gắn vào tiết này.</EmptyMsg>
          ) : (
            <ul className="divide-y">
              {materials.map((m) => {
                const meta = KIND_META[m.kind];
                return (
                  <li key={m.id} className="flex items-center justify-between gap-2 px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${meta.bg}`}>
                        <meta.icon className={`h-4 w-4 ${meta.fg}`} />
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm text-slate-800 truncate">{m.title}</div>
                        <div className="text-[10px] text-slate-500">{meta.label}{m.meta ? ` · ${m.meta}` : ""}</div>
                      </div>
                    </div>
                    <button className="text-[11px] font-semibold text-indigo-700 hover:underline shrink-0">Mở</button>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        {/* Ghi chú / lời nhắc của GV */}
        <Section title="Ghi chú & lời nhắc từ giáo viên" icon={StickyNote}>
          <div className="px-3 py-3 text-sm text-slate-700 leading-relaxed">
            {note ? (
              <div className="flex items-start gap-2">
                <Bell className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <p>{note}</p>
              </div>
            ) : (
              <EmptyMsg>Giáo viên chưa để lại lời nhắc cho tiết này.</EmptyMsg>
            )}
          </div>
        </Section>
      </div>
    </aside>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: typeof FileText; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b text-sm font-semibold text-slate-700">
        <Icon className="h-4 w-4 text-indigo-700" /> {title}
      </div>
      {children}
    </div>
  );
}
function EmptyMsg({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-slate-400 italic px-3 py-3">{children}</p>;
}
