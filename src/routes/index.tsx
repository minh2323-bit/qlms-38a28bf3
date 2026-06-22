import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  Home, BookOpen, FolderKanban, BarChart3, GraduationCap, Settings,
  ClipboardCheck, AlarmClock, MessageSquareWarning, CalendarClock, CalendarCheck,
  ChevronLeft, ChevronRight, ChevronDown, Plus, Search, X, Sun, Sunset,
  FileText, Presentation, ListChecks, BookOpenCheck, Pencil, GripVertical,
  Bell, BookMarked,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer,
} from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trang chủ – LMS Giáo viên | Tiểu học Tô Hiệu" },
      { name: "description", content: "Trang chủ giáo viên: dashboard, lịch báo giảng tương tác và biểu đồ kết quả học tập." },
    ],
  }),
  component: TeacherHome,
});

/* ---------------- Data ---------------- */
const CLASSES = ["3A", "3B", "3C", "3D"] as const;
type ClassId = typeof CLASSES[number];

const SUBJECT_COLORS: Record<string, string> = {
  "Toán": "bg-blue-100 text-blue-900 border-l-4 border-blue-500",
  "Tiếng Việt": "bg-emerald-100 text-emerald-900 border-l-4 border-emerald-500",
  "TNXH": "bg-amber-100 text-amber-900 border-l-4 border-amber-500",
  "Đạo đức": "bg-rose-100 text-rose-900 border-l-4 border-rose-500",
};

type Lesson = {
  id: string; class: ClassId; subject: keyof typeof SUBJECT_COLORS;
  topic: string; unitId: string;
};

// week index -> day(0..6) -> period(1..10) -> Lesson | null
type WeekGrid = Record<number, Record<number, Record<number, Lesson | null>>>;

const makeLesson = (id: string, c: ClassId, subject: keyof typeof SUBJECT_COLORS, topic: string, unitId: string): Lesson =>
  ({ id, class: c, subject, topic, unitId });

const WEEKS = [
  { idx: 1, label: "Tuần 1", range: "31/3 – 6/4/2026", start: "31/3" },
  { idx: 2, label: "Tuần 2", range: "7/4 – 13/4/2026", start: "7/4" },
  { idx: 3, label: "Tuần 3", range: "14/4 – 20/4/2026", start: "14/4" },
];

const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
const DAY_DATES: Record<number, string[]> = {
  1: ["31/3", "1/4", "2/4", "3/4", "4/4", "5/4", "6/4"],
  2: ["7/4", "8/4", "9/4", "10/4", "11/4", "12/4", "13/4"],
  3: ["14/4", "15/4", "16/4", "17/4", "18/4", "19/4", "20/4"],
};

// Knowledge tree (Toán Khối 3)
const KNOWLEDGE_TREE = [
  {
    id: "ch1", title: "Chương 1 – Số và phép tính",
    units: [
      { id: "u-tn", title: "Số tự nhiên & các phép tính với số tự nhiên", week: 1 },
      { id: "u-ps", title: "Phân số", week: 1 },
      { id: "u-stp", title: "Số thập phân", week: 2 },
      { id: "u-sstp", title: "So sánh các số thập phân", week: 2 },
      { id: "u-lt", title: "Làm tròn số thập phân", week: 2 },
      { id: "u-pct", title: "Các phép tính với số thập phân", week: 3 },
      { id: "u-tsl", title: "Tỉ số. Tỉ số phần trăm", week: 3 },
    ],
  },
  {
    id: "ch2", title: "Chương 2 – Hình học & Đo lường",
    units: [
      { id: "u-hh", title: "Hình học trực quan", week: 3 },
      { id: "u-dl", title: "Đo lường", week: 3 },
    ],
  },
];

// Build grid with sample data — unit "u-ps" is in week 1
const buildGrid = (): WeekGrid => {
  const empty = (): WeekGrid => {
    const w: WeekGrid = {};
    for (const wk of WEEKS) {
      w[wk.idx] = {};
      for (let d = 0; d < 7; d++) {
        w[wk.idx][d] = {};
        for (let p = 1; p <= 10; p++) w[wk.idx][d][p] = null;
      }
    }
    return w;
  };
  const g = empty();
  // Tuần 1 — Phân số
  g[1][0][1] = makeLesson("l1", "3A", "Toán", "Tìm hiểu về phân số", "u-ps");
  g[1][1][1] = makeLesson("l2", "3A", "Toán", "Tìm hiểu về phân số", "u-ps");
  g[1][1][2] = makeLesson("l3", "3A", "Toán", "Luyện tập phân số", "u-ps");
  g[1][2][1] = makeLesson("l4", "3B", "Toán", "Tìm hiểu về phân số", "u-ps");
  g[1][3][1] = makeLesson("l5", "3C", "Toán", "Tìm hiểu về phân số", "u-ps");
  g[1][0][3] = makeLesson("l6", "3A", "Tiếng Việt", "Tập đọc: Bóng mây", "u-tn");
  g[1][2][2] = makeLesson("l7", "3B", "TNXH", "Cây xanh quanh em", "u-tn");
  g[1][4][2] = makeLesson("l8", "3A", "Đạo đức", "Kính trọng thầy cô", "u-tn");
  // Tuần 2 — Số thập phân
  g[2][0][1] = makeLesson("l9", "3A", "Toán", "Khái niệm số thập phân", "u-stp");
  g[2][1][2] = makeLesson("l10", "3A", "Toán", "So sánh số thập phân", "u-sstp");
  g[2][2][1] = makeLesson("l11", "3B", "Toán", "Khái niệm số thập phân", "u-stp");
  // Tuần 3
  g[3][0][1] = makeLesson("l12", "3A", "Toán", "Cộng số thập phân", "u-pct");
  g[3][3][2] = makeLesson("l13", "3A", "Toán", "Hình học trực quan", "u-hh");
  return g;
};

const MATERIALS_SEED: Record<string, { type: "slide" | "doc" | "ex" | "syllabus"; title: string }[]> = {
  "u-ps": [
    { type: "syllabus", title: "Tổng quan kiến thức phân số" },
    { type: "slide", title: "Syllabus chương học" },
    { type: "doc", title: "Phương pháp đặt tính phép cộng, trừ phân số" },
    { type: "ex", title: "Phiếu luyện tập 12" },
  ],
  "u-stp": [
    { type: "slide", title: "Slide bài giảng – Số thập phân" },
    { type: "ex", title: "Bài tập về nhà số 7" },
  ],
};

const CHART_DATA = [
  { name: "Bài tập:\nPhân số", done_ok: 28, done_no: 14, undone: 6 },
  { name: "Bài giảng:\nHỗn số", done_ok: 22, done_no: 18, undone: 8 },
  { name: "Nhiệm vụ:\nLàm đề 01", done_ok: 30, done_no: 12, undone: 6 },
];

/* ---------------- Components ---------------- */

function TeacherHome() {
  const [grid, setGrid] = useState<WeekGrid>(() => buildGrid());
  const [weekIdx, setWeekIdx] = useState(1);
  const [classFilter, setClassFilter] = useState<"ALL" | ClassId>("ALL");
  const [showTree, setShowTree] = useState(false);
  const [focusUnit, setFocusUnit] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  // Clear focus highlight after 3s
  useEffect(() => {
    if (!focusUnit) return;
    const t = setTimeout(() => setFocusUnit(null), 3000);
    return () => clearTimeout(t);
  }, [focusUnit]);

  const week = WEEKS.find((w) => w.idx === weekIdx)!;
  const activeLesson = useMemo(() => {
    if (!activeLessonId) return null;
    for (const wk of Object.values(grid))
      for (const day of Object.values(wk))
        for (const p of Object.values(day))
          if (p && p.id === activeLessonId) return p;
    return null;
  }, [activeLessonId, grid]);

  const handlePickUnit = (unitId: string, targetWeek: number) => {
    setWeekIdx(targetWeek);
    setFocusUnit(unitId);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <SidebarNav />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar />
        <main className="flex-1 p-6 space-y-6">
          <DashboardSection />

          {/* Schedule Section */}
          <section className="bg-white rounded-2xl border shadow-sm">
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b">
              <div className="flex items-center gap-3">
                <Button
                  variant={showTree ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowTree((v) => !v)}
                  className="gap-2"
                >
                  <BookMarked className="h-4 w-4" />
                  Cây kiến thức
                </Button>
                <h2 className="text-xl font-bold text-slate-800">Lịch báo giảng</h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-lg border bg-slate-50 px-2 py-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7"
                    onClick={() => setWeekIdx(Math.max(1, weekIdx - 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <CalendarClock className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium px-2">{week.label} · {week.range}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7"
                    onClick={() => setWeekIdx(Math.min(WEEKS.length, weekIdx + 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex rounded-lg border bg-slate-50 p-1">
                  {(["ALL", ...CLASSES] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setClassFilter(c)}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                        classFilter === c
                          ? "bg-blue-600 text-white shadow"
                          : "text-slate-600 hover:bg-white"
                      }`}
                    >
                      {c === "ALL" ? "Tất cả" : c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex">
              {showTree && !activeLesson && (
                <KnowledgeTree
                  onPickUnit={handlePickUnit}
                  activeUnit={focusUnit}
                  onClose={() => setShowTree(false)}
                />
              )}
              <div className="flex-1 min-w-0 p-4 overflow-x-auto">
                <ScheduleGrid
                  week={week.idx}
                  grid={grid}
                  classFilter={classFilter}
                  focusUnit={focusUnit}
                  onPickLesson={(id) => {
                    setShowTree(false);
                    setActiveLessonId(id);
                  }}
                  activeLessonId={activeLessonId}
                />
                <Legend2 />
              </div>
              {activeLesson && (
                <LessonPanel
                  lesson={activeLesson}
                  onClose={() => setActiveLessonId(null)}
                  grid={grid}
                  setGrid={setGrid}
                  weekIdx={weekIdx}
                />
              )}
            </div>
          </section>

          {/* Chart Section */}
          <ChartSection />
        </main>
      </div>
    </div>
  );
}

/* ----- Sidebar ----- */
function SidebarNav() {
  const items = [
    { icon: Home, label: "Trang chủ", active: true },
    { icon: GraduationCap, label: "Lớp học số" },
    { icon: BookOpen, label: "Học liệu\n& Bài kiểm tra" },
    { icon: BarChart3, label: "Thống kê\n& Báo cáo" },
    { icon: FolderKanban, label: "Kỳ thi" },
    { icon: Settings, label: "Thiết lập" },
  ];
  return (
    <aside className="w-24 bg-slate-100 border-r flex flex-col items-center py-4 gap-1 shrink-0">
      <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm mb-2">
        QLMS
      </div>
      {items.map((it) => (
        <button
          key={it.label}
          className={`w-20 py-3 rounded-xl flex flex-col items-center gap-1 text-[11px] font-medium leading-tight whitespace-pre-line text-center transition ${
            it.active
              ? "bg-blue-600 text-white shadow"
              : "text-slate-600 hover:bg-white"
          }`}
        >
          <it.icon className="h-5 w-5" />
          {it.label}
        </button>
      ))}
    </aside>
  );
}

function TopBar() {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0">
      <div>
        <p className="text-sm text-slate-500">Xin chào,</p>
        <p className="text-base font-semibold text-slate-800">G/v Phùng Thúy Hằng</p>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-slate-100">
          <Bell className="h-5 w-5 text-slate-600" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500" />
        </button>
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-800">Tiểu học Tô Hiệu</p>
          <p className="text-xs text-slate-500">Giáo viên</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-rose-500" />
      </div>
    </header>
  );
}

/* ----- Dashboard ----- */
function DashboardSection() {
  const reminders = [
    { count: 3, label: "Bài tập cần chấm", color: "bg-rose-500", icon: ClipboardCheck },
    { count: 3, label: "Bài tập hết hạn", color: "bg-rose-500", icon: AlarmClock },
    { count: 2, label: "Phản hồi học sinh", color: "bg-rose-500", icon: MessageSquareWarning },
    { count: 3, label: "Kỳ thi sắp diễn ra", color: "bg-amber-500", icon: CalendarClock },
    { count: 3, label: "Kỳ thi đang diễn ra", color: "bg-emerald-500", icon: CalendarCheck },
  ];
  return (
    <section className="bg-white rounded-2xl border shadow-sm p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">Thống kê</h3>
          <div className="grid grid-cols-3 gap-3">
            <StatCard value="6" label="Bài giảng khóa học" sub="Đang giảng dạy: 4 · Bản nháp: 2" color="bg-emerald-50 text-emerald-700" />
            <StatCard value="109" label="Bài tập đã giao" sub="Đang mở: 72 · Đã đóng: 37" color="bg-blue-50 text-blue-700" />
            <StatCard value="0" label="Học liệu trong kho" sub="Tài liệu cá nhân" color="bg-violet-50 text-violet-700" />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">Nhắc việc</h3>
          <div className="grid grid-cols-3 gap-3">
            {reminders.map((r) => (
              <button
                key={r.label}
                className={`${r.color} text-white rounded-xl p-3 text-left flex items-start gap-2 hover:opacity-90 transition shadow-sm`}
              >
                <r.icon className="h-5 w-5 mt-0.5 shrink-0" />
                <div>
                  <div className="text-2xl font-black leading-none">{r.count}</div>
                  <div className="text-xs font-semibold mt-1 leading-tight">{r.label}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ value, label, sub, color }: { value: string; label: string; sub: string; color: string }) {
  return (
    <div className={`${color} rounded-xl p-4`}>
      <div className="text-3xl font-black leading-none">{value}</div>
      <div className="text-sm font-semibold mt-2">{label}</div>
      <div className="text-[11px] opacity-75 mt-1 leading-tight">{sub}</div>
    </div>
  );
}

/* ----- Knowledge Tree Side Panel ----- */
function KnowledgeTree({
  onPickUnit, activeUnit, onClose,
}: { onPickUnit: (id: string, week: number) => void; activeUnit: string | null; onClose: () => void }) {
  const [q, setQ] = useState("");
  return (
    <div className="w-72 shrink-0 border-r bg-slate-50/60 p-4 space-y-3 animate-in slide-in-from-left-4 duration-200">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">Cây kiến thức</span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex gap-2">
        <Select defaultValue="5">
          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Khối" /></SelectTrigger>
          <SelectContent>
            {[1,2,3,4,5].map((k) => <SelectItem key={k} value={String(k)}>Khối {k}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select defaultValue="toan">
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="toan">Toán</SelectItem>
            <SelectItem value="tv">Tiếng Việt</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <Input
          value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm chương…"
          className="h-8 pl-7 text-xs"
        />
      </div>
      <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
        {KNOWLEDGE_TREE.map((ch) => (
          <details key={ch.id} open className="group">
            <summary className="cursor-pointer text-xs font-bold text-slate-700 uppercase py-1 flex items-center gap-1">
              <ChevronDown className="h-3 w-3 group-open:rotate-0 -rotate-90 transition" />
              {ch.title}
            </summary>
            <ul className="pl-4 mt-1 space-y-0.5 border-l border-slate-200 ml-1.5">
              {ch.units
                .filter((u) => !q || u.title.toLowerCase().includes(q.toLowerCase()))
                .map((u) => (
                <li key={u.id}>
                  <button
                    onClick={() => onPickUnit(u.id, u.week)}
                    className={`w-full text-left text-xs px-2 py-1.5 rounded-md transition ${
                      activeUnit === u.id
                        ? "bg-blue-600 text-white font-semibold"
                        : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                  >
                    {u.title}
                  </button>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </div>
  );
}

/* ----- Schedule Grid ----- */
function ScheduleGrid({
  week, grid, classFilter, focusUnit, onPickLesson, activeLessonId,
}: {
  week: number; grid: WeekGrid; classFilter: "ALL" | ClassId;
  focusUnit: string | null; onPickLesson: (id: string) => void;
  activeLessonId: string | null;
}) {
  const morning = [1, 2, 3, 4, 5];
  const afternoon = [6, 7, 8, 9, 10];
  const dates = DAY_DATES[week] ?? [];

  const cellFor = (d: number, p: number) => {
    const l = grid[week]?.[d]?.[p];
    if (!l) return null;
    if (classFilter !== "ALL" && l.class !== classFilter) return null;
    return l;
  };

  return (
    <div className="min-w-[900px]">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="w-16 bg-slate-100 border p-2 font-semibold text-slate-600">Buổi</th>
            <th className="w-16 bg-slate-100 border p-2 font-semibold text-slate-600">Tiết</th>
            {DAYS.map((d, i) => (
              <th key={d} className="bg-blue-700 text-white border border-blue-800 p-2 font-bold">
                {d}<div className="text-[10px] font-normal opacity-90">({dates[i]}/2026)</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...morning, ...afternoon].map((p, idx) => {
            const isFirstMorning = p === 1;
            const isFirstAfternoon = p === 6;
            return (
              <tr key={p}>
                {isFirstMorning && (
                  <td rowSpan={5} className="border bg-amber-50 text-center align-middle">
                    <Sun className="h-5 w-5 mx-auto text-amber-500" />
                    <div className="text-[11px] font-semibold mt-1">Buổi<br/>sáng</div>
                  </td>
                )}
                {isFirstAfternoon && (
                  <td rowSpan={5} className="border bg-orange-50 text-center align-middle">
                    <Sunset className="h-5 w-5 mx-auto text-orange-500" />
                    <div className="text-[11px] font-semibold mt-1">Buổi<br/>chiều</div>
                  </td>
                )}
                <td className="border bg-slate-50 text-center font-semibold p-2">Tiết {p}</td>
                {DAYS.map((_, d) => {
                  const l = cellFor(d, p);
                  const isFocus = l && focusUnit && l.unitId === focusUnit;
                  return (
                    <td key={d} className="border p-1 align-top h-16">
                      {l && (
                        <button
                          onClick={() => onPickLesson(l.id)}
                          className={`w-full h-full text-left p-1.5 rounded-md text-[11px] leading-tight transition ${
                            SUBJECT_COLORS[l.subject]
                          } ${isFocus ? "ring-2 ring-yellow-400 animate-pulse shadow-lg scale-[1.02]" : "hover:shadow"}`}
                        >
                          <div className="font-bold">{l.class}</div>
                          <div className="text-[10px] opacity-80">{l.subject}</div>
                          <div className="truncate font-medium">{l.topic}</div>
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Legend2() {
  return (
    <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-600">
      <span className="font-semibold">Môn học:</span>
      {Object.entries(SUBJECT_COLORS).map(([s, c]) => (
        <span key={s} className={`px-2 py-0.5 rounded ${c}`}>{s}</span>
      ))}
    </div>
  );
}

/* ----- Lesson Drawer ----- */
function LessonDrawer({
  lesson, onClose, grid, setGrid, weekIdx,
}: {
  lesson: Lesson | null; onClose: () => void;
  grid: WeekGrid; setGrid: (g: WeekGrid) => void; weekIdx: number;
}) {
  const [editMode, setEditMode] = useState(false);

  useEffect(() => { if (!lesson) setEditMode(false); }, [lesson]);

  const materials = lesson ? (MATERIALS_SEED[lesson.unitId] ?? []) : [];

  const onDragStart = (e: React.DragEvent, mIdx: number) => {
    e.dataTransfer.setData("mIdx", String(mIdx));
  };
  const onDropToSlot = (e: React.DragEvent, day: number, period: number) => {
    e.preventDefault();
    if (!lesson) return;
    const idx = Number(e.dataTransfer.getData("mIdx"));
    const newId = `${lesson.id}-mv-${idx}-${day}-${period}`;
    const next: WeekGrid = JSON.parse(JSON.stringify(grid));
    if (!next[weekIdx][day][period]) {
      next[weekIdx][day][period] = {
        ...lesson, id: newId, topic: materials[idx]?.title ?? lesson.topic,
      };
      setGrid(next);
    }
  };

  return (
    <Sheet open={!!lesson} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        {lesson && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center justify-between">
                <span>Học liệu của tiết</span>
                <Badge variant="outline">{lesson.class} · {lesson.subject}</Badge>
              </SheetTitle>
              <p className="text-sm text-slate-500">{lesson.topic}</p>
            </SheetHeader>

            <div className="mt-4 flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4" /> Thêm nội dung mới
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem><Presentation className="h-4 w-4 mr-2" />Bài giảng</DropdownMenuItem>
                  <DropdownMenuItem><BookOpenCheck className="h-4 w-4 mr-2" />Học liệu</DropdownMenuItem>
                  <DropdownMenuItem><ListChecks className="h-4 w-4 mr-2" />Bài kiểm tra</DropdownMenuItem>
                  <DropdownMenuItem><FileText className="h-4 w-4 mr-2" />Bài tập</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                size="sm"
                variant={editMode ? "default" : "outline"}
                className="gap-1"
                onClick={() => setEditMode((v) => !v)}
              >
                <Pencil className="h-4 w-4" /> {editMode ? "Xong" : "Sửa"}
              </Button>
            </div>

            <div className="mt-4 space-y-4">
              <MaterialGroup title="Bài giảng" items={materials.filter((m) => m.type === "slide" || m.type === "syllabus")}
                editMode={editMode} onDragStart={onDragStart} />
              <MaterialGroup title="Học liệu" items={materials.filter((m) => m.type === "doc")}
                editMode={editMode} onDragStart={onDragStart} />
              <MaterialGroup title="Bài tập về nhà" items={materials.filter((m) => m.type === "ex")}
                editMode={editMode} onDragStart={onDragStart} />
            </div>

            {editMode && (
              <div className="mt-6 border-t pt-4">
                <p className="text-xs text-slate-500 mb-2">
                  Kéo học liệu vào ô trống bên dưới để gắn sang tiết khác trong tuần này.
                </p>
                <MiniWeek
                  weekIdx={weekIdx} grid={grid}
                  classFilter={lesson.class}
                  onDropToSlot={onDropToSlot}
                />
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function MaterialGroup({
  title, items, editMode, onDragStart,
}: {
  title: string;
  items: { type: string; title: string }[];
  editMode: boolean;
  onDragStart: (e: React.DragEvent, mIdx: number) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className="text-sm font-bold text-slate-700 mb-2">{title}</h4>
      <ul className="space-y-1.5">
        {items.map((m, i) => (
          <li
            key={m.title}
            draggable={editMode}
            onDragStart={(e) => onDragStart(e, i)}
            className={`flex items-center gap-2 text-sm p-2 rounded-lg border bg-white hover:bg-slate-50 transition ${
              editMode ? "cursor-grab active:cursor-grabbing border-dashed border-blue-300" : ""
            }`}
          >
            {editMode && <GripVertical className="h-4 w-4 text-slate-400" />}
            <FileText className="h-4 w-4 text-blue-600 shrink-0" />
            <span className="text-blue-700 hover:underline truncate">{m.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MiniWeek({
  weekIdx, grid, classFilter, onDropToSlot,
}: {
  weekIdx: number; grid: WeekGrid; classFilter: ClassId;
  onDropToSlot: (e: React.DragEvent, day: number, period: number) => void;
}) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {DAYS.map((d, di) => (
        <div key={d} className="text-[10px] font-semibold text-center text-slate-500">{d.replace("Thứ ", "T")}</div>
      ))}
      {[1,2,3,4,5].map((p) => (
        DAYS.map((_, di) => {
          const occ = grid[weekIdx]?.[di]?.[p];
          const sameClass = occ && occ.class === classFilter;
          return (
            <div
              key={`${p}-${di}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDropToSlot(e, di, p)}
              className={`h-10 rounded border text-[9px] p-0.5 ${
                occ
                  ? sameClass ? "bg-blue-100 border-blue-300" : "bg-slate-100 border-slate-200"
                  : "border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50"
              }`}
            >
              {occ ? <span className="font-semibold">{occ.class}</span> : <span className="text-slate-300">T{p}</span>}
            </div>
          );
        })
      ))}
    </div>
  );
}

/* ----- Chart ----- */
function ChartSection() {
  return (
    <section className="bg-white rounded-2xl border shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Biểu đồ kết quả học tập</h2>
          <p className="text-sm text-slate-500">Số học sinh theo trạng thái bài tập</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronLeft className="h-4 w-4" /></Button>
          <span className="font-medium">15/6/2026 – 21/6/2026</span>
          <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={CHART_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis label={{ value: "Số học sinh", angle: -90, position: "insideLeft", style: { fontSize: 12 } }} />
            <Legend />
            <Bar dataKey="done_ok" name="Đã hoàn thành & Đạt yêu cầu" fill="#22c55e" radius={[4,4,0,0]} />
            <Bar dataKey="done_no" name="Đã hoàn thành & Chưa đạt yêu cầu" fill="#f59e0b" radius={[4,4,0,0]} />
            <Bar dataKey="undone" name="Chưa hoàn thành" fill="#3b82f6" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
