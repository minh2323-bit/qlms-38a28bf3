import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  Home, BookOpen, FolderKanban, BarChart3, GraduationCap, Settings,
  ClipboardCheck, AlarmClock, MessageSquareWarning, CalendarClock, CalendarCheck,
  ChevronLeft, ChevronRight, ChevronDown, Plus, Search, X, Sun, Sunset,
  FileText, Presentation, ListChecks, BookOpenCheck, Pencil,
  Bell, BookMarked, Users, FileCheck2, Library, Trophy, TrendingUp, Clock,
  Video, FileType2, Move,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer,
} from "recharts";
import teacherAvatar from "@/assets/teacher-avatar.jpg";
import qlmsLogo from "@/assets/qlms-logo.png";

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
const CLASSES = ["3A", "3B", "3C", "3D", "4A", "4B", "4C"] as const;
type ClassId = typeof CLASSES[number];

// Each class gets a soft hue (all subject = Toán) so the schedule stays lively.
const CLASS_COLORS: Record<ClassId, string> = {
  "3A": "bg-blue-50 text-blue-900 border-l-4 border-blue-500",
  "3B": "bg-emerald-50 text-emerald-900 border-l-4 border-emerald-500",
  "3C": "bg-amber-50 text-amber-900 border-l-4 border-amber-500",
  "3D": "bg-rose-50 text-rose-900 border-l-4 border-rose-500",
  "4A": "bg-violet-50 text-violet-900 border-l-4 border-violet-500",
  "4B": "bg-cyan-50 text-cyan-900 border-l-4 border-cyan-500",
  "4C": "bg-fuchsia-50 text-fuchsia-900 border-l-4 border-fuchsia-500",
};

type Lesson = {
  id: string; class: ClassId; subject: "Toán";
  topic: string; unitId: string;
};

type WeekGrid = Record<number, Record<number, Record<number, Lesson | null>>>;

const makeLesson = (id: string, c: ClassId, topic: string, unitId: string): Lesson =>
  ({ id, class: c, subject: "Toán", topic, unitId });

const WEEKS = [
  { idx: 1, label: "Tuần 1", range: "31/3 – 6/4/2026" },
  { idx: 2, label: "Tuần 2", range: "7/4 – 13/4/2026" },
  { idx: 3, label: "Tuần 3", range: "14/4 – 20/4/2026" },
];

const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
const DAY_DATES: Record<number, string[]> = {
  1: ["31/3", "1/4", "2/4", "3/4", "4/4", "5/4", "6/4"],
  2: ["7/4", "8/4", "9/4", "10/4", "11/4", "12/4", "13/4"],
  3: ["14/4", "15/4", "16/4", "17/4", "18/4", "19/4", "20/4"],
};

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

  // Tuần 1 — Phân số / Số tự nhiên
  g[1][0][1] = makeLesson("l1",  "3A", "Tìm hiểu về phân số", "u-ps");
  g[1][1][1] = makeLesson("l2",  "3A", "Luyện tập phân số", "u-ps");
  g[1][1][2] = makeLesson("l3",  "3B", "Tìm hiểu về phân số", "u-ps");
  g[1][2][1] = makeLesson("l4",  "3C", "Tìm hiểu về phân số", "u-ps");
  g[1][2][3] = makeLesson("l5",  "4A", "Ôn tập số tự nhiên", "u-tn");
  g[1][3][1] = makeLesson("l6",  "3D", "Phân số bằng nhau", "u-ps");
  g[1][3][2] = makeLesson("l7",  "4B", "Phép cộng số tự nhiên", "u-tn");
  g[1][4][1] = makeLesson("l8",  "4A", "Phép trừ số tự nhiên", "u-tn");
  g[1][4][2] = makeLesson("l9",  "4C", "Ôn tập số tự nhiên", "u-tn");
  g[1][0][6] = makeLesson("l10", "3A", "Bài tập phân số (chiều)", "u-ps");
  g[1][2][6] = makeLesson("l11", "4B", "Luyện tập số tự nhiên", "u-tn");
  g[1][4][6] = makeLesson("l12", "3C", "Phân số bằng nhau", "u-ps");

  // Tuần 2 — Số thập phân
  g[2][0][1] = makeLesson("l13", "3A", "Khái niệm số thập phân", "u-stp");
  g[2][1][1] = makeLesson("l14", "3B", "Khái niệm số thập phân", "u-stp");
  g[2][1][2] = makeLesson("l15", "3A", "So sánh số thập phân", "u-sstp");
  g[2][2][1] = makeLesson("l16", "3C", "Khái niệm số thập phân", "u-stp");
  g[2][2][2] = makeLesson("l17", "4A", "Làm tròn số thập phân", "u-lt");
  g[2][3][1] = makeLesson("l18", "3D", "So sánh số thập phân", "u-sstp");
  g[2][3][2] = makeLesson("l19", "4B", "Làm tròn số thập phân", "u-lt");
  g[2][4][2] = makeLesson("l20", "4C", "So sánh số thập phân", "u-sstp");

  // Tuần 3
  g[3][0][1] = makeLesson("l21", "3A", "Cộng số thập phân", "u-pct");
  g[3][1][1] = makeLesson("l22", "3B", "Trừ số thập phân", "u-pct");
  g[3][2][1] = makeLesson("l23", "4A", "Tỉ số phần trăm", "u-tsl");
  g[3][3][2] = makeLesson("l24", "3A", "Hình học trực quan", "u-hh");
  g[3][4][2] = makeLesson("l25", "4B", "Đo lường thực hành", "u-dl");

  return g;
};

const MATERIALS_SEED: Record<string, { type: "slide" | "doc" | "ex" | "syllabus"; title: string }[]> = {
  "u-ps": [
    { type: "syllabus", title: "Tổng quan kiến thức phân số" },
    { type: "slide", title: "Slide bài giảng – Phân số" },
    { type: "doc", title: "Phương pháp cộng, trừ phân số" },
    { type: "ex", title: "Phiếu luyện tập số 12" },
  ],
  "u-stp": [
    { type: "slide", title: "Slide bài giảng – Số thập phân" },
    { type: "ex", title: "Bài tập về nhà số 7" },
  ],
  "u-tn": [
    { type: "slide", title: "Slide ôn tập số tự nhiên" },
    { type: "ex", title: "Phiếu bài tập số tự nhiên" },
  ],
};

// Chart data per class (and ALL = aggregate)
const CHART_DATA_BY_CLASS: Record<"ALL" | ClassId, { name: string; done_ok: number; done_no: number; undone: number }[]> = {
  ALL: [
    { name: "BT: Phân số",          done_ok: 168, done_no: 84,  undone: 36 },
    { name: "BT: So sánh PS",       done_ok: 152, done_no: 90,  undone: 44 },
    { name: "BG: Số thập phân",     done_ok: 142, done_no: 110, undone: 48 },
    { name: "BT: Cộng STP",         done_ok: 175, done_no: 78,  undone: 33 },
    { name: "BT: Trừ STP",          done_ok: 161, done_no: 92,  undone: 41 },
    { name: "BT: Làm tròn STP",     done_ok: 138, done_no: 105, undone: 51 },
    { name: "BT: Tỉ số %",          done_ok: 149, done_no: 96,  undone: 49 },
    { name: "BT: Luyện đề 01",      done_ok: 190, done_no: 72,  undone: 38 },
    { name: "BT: Luyện đề 02",      done_ok: 182, done_no: 80,  undone: 38 },
    { name: "KT: 15 phút Toán",     done_ok: 195, done_no: 70,  undone: 35 },
  ],
  "3A": [
    { name: "BT: Phân số",      done_ok: 28, done_no: 14, undone: 6 },
    { name: "BT: So sánh PS",   done_ok: 25, done_no: 15, undone: 8 },
    { name: "BG: Số thập phân", done_ok: 22, done_no: 18, undone: 8 },
    { name: "BT: Cộng STP",     done_ok: 30, done_no: 12, undone: 6 },
    { name: "BT: Trừ STP",      done_ok: 27, done_no: 14, undone: 7 },
    { name: "BT: Làm tròn STP", done_ok: 24, done_no: 16, undone: 8 },
    { name: "BT: Tỉ số %",      done_ok: 26, done_no: 15, undone: 7 },
    { name: "BT: Luyện đề 01",  done_ok: 30, done_no: 12, undone: 6 },
    { name: "BT: Luyện đề 02",  done_ok: 29, done_no: 13, undone: 6 },
    { name: "KT: 15 phút Toán", done_ok: 31, done_no: 11, undone: 6 },
  ],
  "3B": [
    { name: "BT: Phân số",      done_ok: 24, done_no: 12, undone: 9 },
    { name: "BT: So sánh PS",   done_ok: 22, done_no: 13, undone: 10 },
    { name: "BG: Số thập phân", done_ok: 20, done_no: 16, undone: 9 },
    { name: "BT: Cộng STP",     done_ok: 26, done_no: 10, undone: 9 },
    { name: "BT: Trừ STP",      done_ok: 23, done_no: 13, undone: 9 },
    { name: "BT: Làm tròn STP", done_ok: 21, done_no: 14, undone: 10 },
    { name: "BT: Tỉ số %",      done_ok: 23, done_no: 13, undone: 9 },
    { name: "BT: Luyện đề 01",  done_ok: 26, done_no: 10, undone: 9 },
    { name: "BT: Luyện đề 02",  done_ok: 25, done_no: 11, undone: 9 },
    { name: "KT: 15 phút Toán", done_ok: 27, done_no: 9,  undone: 9 },
  ],
  "3C": [
    { name: "BT: Phân số",      done_ok: 22, done_no: 13, undone: 7 },
    { name: "BT: So sánh PS",   done_ok: 20, done_no: 14, undone: 8 },
    { name: "BG: Số thập phân", done_ok: 19, done_no: 15, undone: 8 },
    { name: "BT: Cộng STP",     done_ok: 25, done_no: 11, undone: 6 },
    { name: "BT: Trừ STP",      done_ok: 22, done_no: 13, undone: 7 },
    { name: "BT: Làm tròn STP", done_ok: 20, done_no: 14, undone: 8 },
    { name: "BT: Tỉ số %",      done_ok: 21, done_no: 14, undone: 7 },
    { name: "BT: Luyện đề 01",  done_ok: 25, done_no: 11, undone: 6 },
    { name: "BT: Luyện đề 02",  done_ok: 24, done_no: 12, undone: 6 },
    { name: "KT: 15 phút Toán", done_ok: 26, done_no: 10, undone: 6 },
  ],
  "3D": [
    { name: "BT: Phân số",      done_ok: 21, done_no: 11, undone: 5 },
    { name: "BT: So sánh PS",   done_ok: 19, done_no: 12, undone: 6 },
    { name: "BG: Số thập phân", done_ok: 18, done_no: 14, undone: 6 },
    { name: "BT: Cộng STP",     done_ok: 24, done_no: 9,  undone: 5 },
    { name: "BT: Trừ STP",      done_ok: 21, done_no: 11, undone: 5 },
    { name: "BT: Làm tròn STP", done_ok: 19, done_no: 13, undone: 6 },
    { name: "BT: Tỉ số %",      done_ok: 20, done_no: 12, undone: 6 },
    { name: "BT: Luyện đề 01",  done_ok: 24, done_no: 9,  undone: 5 },
    { name: "BT: Luyện đề 02",  done_ok: 23, done_no: 10, undone: 5 },
    { name: "KT: 15 phút Toán", done_ok: 25, done_no: 8,  undone: 5 },
  ],
  "4A": [
    { name: "BT: Phân số",      done_ok: 26, done_no: 11, undone: 4 },
    { name: "BT: So sánh PS",   done_ok: 24, done_no: 13, undone: 5 },
    { name: "BG: Số thập phân", done_ok: 24, done_no: 13, undone: 6 },
    { name: "BT: Cộng STP",     done_ok: 28, done_no: 10, undone: 4 },
    { name: "BT: Trừ STP",      done_ok: 26, done_no: 11, undone: 4 },
    { name: "BT: Làm tròn STP", done_ok: 23, done_no: 14, undone: 5 },
    { name: "BT: Tỉ số %",      done_ok: 25, done_no: 12, undone: 5 },
    { name: "BT: Luyện đề 01",  done_ok: 28, done_no: 10, undone: 4 },
    { name: "BT: Luyện đề 02",  done_ok: 27, done_no: 11, undone: 4 },
    { name: "KT: 15 phút Toán", done_ok: 29, done_no: 9,  undone: 4 },
  ],
  "4B": [
    { name: "BT: Phân số",      done_ok: 25, done_no: 13, undone: 3 },
    { name: "BT: So sánh PS",   done_ok: 23, done_no: 14, undone: 4 },
    { name: "BG: Số thập phân", done_ok: 21, done_no: 17, undone: 5 },
    { name: "BT: Cộng STP",     done_ok: 30, done_no: 11, undone: 4 },
    { name: "BT: Trừ STP",      done_ok: 27, done_no: 12, undone: 4 },
    { name: "BT: Làm tròn STP", done_ok: 24, done_no: 14, undone: 5 },
    { name: "BT: Tỉ số %",      done_ok: 26, done_no: 13, undone: 4 },
    { name: "BT: Luyện đề 01",  done_ok: 30, done_no: 11, undone: 4 },
    { name: "BT: Luyện đề 02",  done_ok: 28, done_no: 12, undone: 4 },
    { name: "KT: 15 phút Toán", done_ok: 31, done_no: 10, undone: 4 },
  ],
  "4C": [
    { name: "BT: Phân số",      done_ok: 22, done_no: 10, undone: 2 },
    { name: "BT: So sánh PS",   done_ok: 20, done_no: 12, undone: 3 },
    { name: "BG: Số thập phân", done_ok: 18, done_no: 17, undone: 6 },
    { name: "BT: Cộng STP",     done_ok: 27, done_no: 9,  undone: 4 },
    { name: "BT: Trừ STP",      done_ok: 24, done_no: 11, undone: 4 },
    { name: "BT: Làm tròn STP", done_ok: 21, done_no: 13, undone: 5 },
    { name: "BT: Tỉ số %",      done_ok: 23, done_no: 12, undone: 4 },
    { name: "BT: Luyện đề 01",  done_ok: 27, done_no: 9,  undone: 4 },
    { name: "BT: Luyện đề 02",  done_ok: 26, done_no: 10, undone: 4 },
    { name: "KT: 15 phút Toán", done_ok: 28, done_no: 8,  undone: 4 },
  ],
};


/* ---------------- Components ---------------- */

function TeacherHome() {
  const [grid, setGrid] = useState<WeekGrid>(() => buildGrid());
  const [weekIdx, setWeekIdx] = useState(1);
  const [classFilter, setClassFilter] = useState<"ALL" | ClassId>("ALL");
  const [showTree, setShowTree] = useState(false);
  const [focusUnit, setFocusUnit] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

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
            {/* Row 1: Class filter (above title) */}
            <div className="px-6 pt-4 pb-3 flex items-center gap-2 flex-wrap border-b">
              <span className="text-xs font-semibold text-slate-500 uppercase mr-1">Lớp:</span>
              <button
                onClick={() => setClassFilter("ALL")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition ${
                  classFilter === "ALL"
                    ? "bg-indigo-700 text-white border-indigo-700 shadow"
                    : "bg-white text-slate-600 border-slate-200 hover:border-indigo-400 hover:text-indigo-700"
                }`}
              >
                Tất cả các lớp
              </button>
              {CLASSES.map((c) => {
                const active = classFilter === c;
                return (
                  <button
                    key={c}
                    onClick={() => setClassFilter(c)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition flex items-center gap-1.5 ${
                      active
                        ? "bg-indigo-700 text-white border-indigo-700 shadow"
                        : "bg-white text-slate-600 border-slate-200 hover:border-indigo-400 hover:text-indigo-700"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${
                      active ? "bg-white" :
                        c.startsWith("3") ? "bg-blue-500" : "bg-violet-500"
                    }`} />
                    Lớp {c}
                  </button>
                );
              })}
            </div>

            {/* Row 2: Knowledge tree toggle (left) · Title (center) · Week nav (right) */}
            <div className="px-6 py-3 border-b flex items-center justify-between gap-4">
              <Button
                variant={showTree ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setShowTree((v) => !v);
                  setActiveLessonId(null);
                }}
                className="gap-2"
              >
                <BookMarked className="h-4 w-4" />
                Cây kiến thức
              </Button>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-800">Lịch báo giảng</h2>
              </div>
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


          {/* Chart Section — driven by same classFilter */}
          <ChartSection classFilter={classFilter} />
        </main>
      </div>
    </div>
  );
}

/* ----- Sidebar ----- */
type NavItem = {
  icon: typeof Home;
  label: string;
  active?: boolean;
  submenu?: { icon: typeof Home; label: string }[];
};

function SidebarNav() {
  const items: NavItem[] = [
    { icon: Home, label: "Trang chủ", active: true },
    { icon: GraduationCap, label: "Lớp học số" },
    {
      icon: BookOpen,
      label: "Học liệu\n& Bài kiểm tra",
      submenu: [
        { icon: Library, label: "Kho học liệu" },
        { icon: BookOpenCheck, label: "Ngân hàng câu hỏi" },
        { icon: ListChecks, label: "Đề kiểm tra" },
      ],
    },
    {
      icon: BarChart3,
      label: "Thống kê\n& Báo cáo",
      submenu: [
        { icon: TrendingUp, label: "Thống kê hoạt động sử dụng" },
        { icon: Users, label: "Thống kê hoạt động của lớp" },
        { icon: Trophy, label: "Thống kê kết quả thi" },
      ],
    },
    { icon: FolderKanban, label: "Kỳ thi" },
    { icon: Settings, label: "Thiết lập" },
  ];
  return (
    <aside className="w-24 bg-slate-100 border-r flex flex-col items-center py-4 gap-1 shrink-0">
      <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-2 p-1.5">
        <img src={qlmsLogo} alt="QLMS" width={48} height={48} className="h-full w-full object-contain" />
      </div>
      {items.map((it) => (
        <div key={it.label} className="relative group w-20">
          <button
            className={`w-20 py-3 rounded-xl flex flex-col items-center gap-1 text-[11px] font-medium leading-tight whitespace-pre-line text-center transition ${
              it.active
                ? "bg-indigo-700 text-white shadow"
                : "text-slate-600 hover:bg-white"
            }`}
          >
            <it.icon className="h-5 w-5" />
            {it.label}
          </button>
          {it.submenu && (
            <div className="absolute left-full top-0 ml-1 hidden group-hover:block z-50 pl-1">
              <div className="bg-white border border-slate-200 rounded-xl shadow-lg py-2 w-56 animate-in fade-in slide-in-from-left-2 duration-150">
                {it.submenu.map((s) => (
                  <button
                    key={s.label}
                    className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
                  >
                    <s.icon className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
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
        <img
          src={teacherAvatar}
          alt="Ảnh đại diện giáo viên"
          width={40}
          height={40}
          loading="lazy"
          className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-100"
        />
      </div>
    </header>
  );
}

/* ----- Dashboard ----- */
function DashboardSection() {
  const stats = [
    { value: "6",   label: "Bài giảng",       sub: "Đang dạy 4 · Nháp 2",   icon: Presentation, accent: "text-emerald-600", bar: "bg-emerald-500" },
    { value: "109", label: "Bài tập đã giao", sub: "Mở 72 · Đóng 37",       icon: ClipboardCheck, accent: "text-blue-600",   bar: "bg-blue-500" },
    { value: "248", label: "Học liệu cá nhân",sub: "Slide 92 · Đề 156",     icon: Library,        accent: "text-violet-600", bar: "bg-violet-500" },
    { value: "186", label: "Học sinh đang dạy", sub: "Tại 7 lớp",          icon: Users,          accent: "text-cyan-600",   bar: "bg-cyan-500" },
    { value: "92%", label: "Tỉ lệ nộp bài",    sub: "Tăng 4% so với tuần trước", icon: TrendingUp, accent: "text-teal-600",   bar: "bg-teal-500" },
    { value: "8.4", label: "Điểm TB lớp",      sub: "Trên thang điểm 10",   icon: Trophy,         accent: "text-amber-600",  bar: "bg-amber-500" },
  ];

  const reminders = [
    { count: 3, label: "Bài tập cần chấm",     icon: ClipboardCheck,       accent: "text-rose-600",    bar: "bg-rose-500" },
    { count: 3, label: "Bài tập sắp hết hạn",  icon: AlarmClock,           accent: "text-orange-600",  bar: "bg-orange-500" },
    { count: 2, label: "Phản hồi học sinh",    icon: MessageSquareWarning, accent: "text-amber-600",   bar: "bg-amber-500" },
    { count: 3, label: "Kỳ thi sắp diễn ra",   icon: CalendarClock,        accent: "text-indigo-600",  bar: "bg-indigo-500" },
    { count: 3, label: "Kỳ thi đang diễn ra",  icon: CalendarCheck,        accent: "text-emerald-600", bar: "bg-emerald-500" },
    { count: 5, label: "Tiết dạy hôm nay",     icon: Clock,                accent: "text-sky-600",     bar: "bg-sky-500" },
  ];

  return (
    <section className="bg-white rounded-2xl border shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Dashboard</h2>
          <p className="text-sm text-slate-500">Tổng quan hoạt động giảng dạy của bạn</p>
        </div>
      </div>

      {/* Stats */}
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Thống kê chung</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="relative bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:-translate-y-0.5 transition overflow-hidden group"
          >
            <span className={`absolute left-0 top-0 h-full w-1 ${s.bar}`} />
            <div className="flex items-start justify-between">
              <div className="text-3xl font-black text-slate-800 leading-none">{s.value}</div>
              <s.icon className={`h-5 w-5 ${s.accent} opacity-80 group-hover:scale-110 transition`} />
            </div>
            <div className="text-sm font-semibold text-slate-700 mt-2">{s.label}</div>
            <div className="text-[11px] text-slate-500 mt-1 leading-tight">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Reminders — unified white card style, color only on accent */}
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Nhắc việc</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {reminders.map((r) => (
          <button
            key={r.label}
            className="relative bg-white rounded-xl border border-slate-200 p-4 text-left hover:shadow-md hover:-translate-y-0.5 transition overflow-hidden group"
          >
            <span className={`absolute left-0 top-0 h-full w-1 ${r.bar}`} />
            <div className="flex items-start justify-between">
              <div className={`text-3xl font-black leading-none ${r.accent}`}>{r.count}</div>
              <r.icon className={`h-5 w-5 ${r.accent} opacity-80 group-hover:scale-110 transition`} />
            </div>
            <div className="text-sm font-semibold text-slate-700 mt-2 leading-tight">{r.label}</div>
          </button>
        ))}
      </div>
    </section>
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
        <Select defaultValue="3">
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
                        ? "bg-indigo-700 text-white font-semibold"
                        : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
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
            <th colSpan={2} className="bg-indigo-700 text-white border border-indigo-800 p-2 font-bold rounded-tl-lg">
              Tiết học
            </th>
            {DAYS.map((d, i) => (
              <th key={d} className="bg-indigo-700 text-white border border-indigo-800 p-3 font-bold text-sm">
                {d}
                <div className="text-[10px] font-normal opacity-90">({dates[i]}/2026)</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {morning.map((p, idx) => {
            return (
              <tr key={p}>
                {idx === 0 && (
                  <td rowSpan={5} className="border border-indigo-800 bg-amber-50 text-amber-700 text-center align-middle font-semibold p-2 w-20">
                    <div className="flex flex-col items-center gap-2">
                      <Sun className="h-5 w-5 text-amber-500" />
                      <span>Buổi sáng</span>
                    </div>
                  </td>
                )}
                <td className="border border-indigo-800 text-center font-semibold p-1 w-16 bg-white text-indigo-700">
                  Tiết {p}
                </td>
                {DAYS.map((_, d) => {
                  const l = cellFor(d, p);
                  const isFocus = l && focusUnit && l.unitId === focusUnit;
                  const isActive = l && activeLessonId === l.id;
                  return (
                    <td key={d} className={`border border-slate-200 p-1 align-top h-10`}>
                      {l && (
                        <button
                          onClick={() => onPickLesson(l.id)}
                          className={`w-full h-full text-left p-1.5 rounded-md text-[11px] leading-tight transition ${
                            CLASS_COLORS[l.class]
                          } ${isFocus ? "ring-2 ring-yellow-400 animate-pulse shadow-lg scale-[1.02]" : ""} ${
                            isActive ? "ring-2 ring-indigo-700 shadow-md" : "hover:shadow hover:-translate-y-0.5"
                          }`}
                        >
                          <div className="font-bold">{l.class}</div>
                          <div className="text-[10px] opacity-80">Toán</div>
                          <div className="truncate font-medium">
                            <span className="opacity-70">Nội dung:</span> {l.topic}
                          </div>
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          {afternoon.map((p, idx) => {
            return (
              <tr key={p}>
                {idx === 0 && (
                  <td rowSpan={5} className="border border-indigo-800 bg-purple-50 text-purple-700 text-center align-middle font-semibold p-2 w-20 rounded-bl-lg">
                    <div className="flex flex-col items-center gap-2">
                      <Sunset className="h-5 w-5 text-purple-500" />
                      <span>Buổi chiều</span>
                    </div>
                  </td>
                )}
                <td className="border border-indigo-800 text-center font-semibold p-1 w-16 bg-white text-indigo-700">
                  Tiết {p}
                </td>
                {DAYS.map((_, d) => {
                  const l = cellFor(d, p);
                  const isFocus = l && focusUnit && l.unitId === focusUnit;
                  const isActive = l && activeLessonId === l.id;
                  return (
                    <td key={d} className={`border border-slate-200 p-1 align-top h-10 bg-purple-50/30`}>
                      {l && (
                        <button
                          onClick={() => onPickLesson(l.id)}
                          className={`w-full h-full text-left p-1.5 rounded-md text-[11px] leading-tight transition ${
                            CLASS_COLORS[l.class]
                          } ${isFocus ? "ring-2 ring-yellow-400 animate-pulse shadow-lg scale-[1.02]" : ""} ${
                            isActive ? "ring-2 ring-indigo-700 shadow-md" : "hover:shadow hover:-translate-y-0.5"
                          }`}
                        >
                          <div className="font-bold">{l.class}</div>
                          <div className="text-[10px] opacity-80">Toán</div>
                          <div className="truncate font-medium">
                            <span className="opacity-70">Nội dung:</span> {l.topic}
                          </div>
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
    <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-600">
      <span className="font-semibold mr-1">Chú thích lớp:</span>
      {CLASSES.map((c) => (
        <span key={c} className={`px-2 py-0.5 rounded ${CLASS_COLORS[c]}`}>Lớp {c}</span>
      ))}
    </div>
  );
}

/* ----- Lesson Panel ----- */
function LessonPanel({
  lesson, onClose, grid, setGrid, weekIdx,
}: {
  lesson: Lesson; onClose: () => void;
  grid: WeekGrid; setGrid: (g: WeekGrid) => void; weekIdx: number;
}) {
  const [editMode, setEditMode] = useState(false);
  useEffect(() => { setEditMode(false); }, [lesson.id]);

  const materials = MATERIALS_SEED[lesson.unitId] ?? [];

  const onDragStart = (e: React.DragEvent, mIdx: number) => {
    e.dataTransfer.setData("mIdx", String(mIdx));
  };
  const onDropToSlot = (e: React.DragEvent, day: number, period: number) => {
    e.preventDefault();
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

  const groups: { title: string; icon: typeof Presentation; filter: (m: { type: string }) => boolean }[] = [
    { title: "Bài giảng", icon: Presentation, filter: (m) => m.type === "slide" || m.type === "syllabus" },
    { title: "Học liệu", icon: BookOpenCheck, filter: (m) => m.type === "doc" },
    { title: "Bài tập về nhà", icon: FileText, filter: (m) => m.type === "ex" },
  ];

  return (
    <aside className="w-[340px] shrink-0 border-l bg-slate-50/60 flex flex-col animate-in slide-in-from-right-4 duration-200">
      <div className="px-4 py-3 border-b bg-white flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-800">Học liệu của tiết</h3>
            <Badge variant="outline" className="text-[10px]">{lesson.class} · Toán</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{lesson.topic}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="px-4 py-3 border-b bg-white space-y-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center justify-center gap-2 rounded-lg py-3 text-[15px] font-semibold text-white shadow-md hover:shadow-lg transition bg-gradient-to-r from-indigo-700 via-purple-600 to-fuchsia-500">
              <Plus className="h-5 w-5" /> Thêm nội dung mới
            </button>
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
          className="gap-1 w-full"
          onClick={() => setEditMode((v) => !v)}
        >
          <Pencil className="h-4 w-4" /> {editMode ? "Xong sắp xếp" : "Sửa / Sắp xếp lại"}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {editMode && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-2.5 flex items-start gap-2">
            <Move className="h-4 w-4 text-indigo-700 mt-0.5 shrink-0" />
            <p className="text-xs text-indigo-800 leading-snug">
              <b>Chế độ sắp xếp:</b> Kéo các học liệu bên dưới và <b>thả vào ô trống</b> trên lịch báo giảng để gắn sang ngày/tiết khác.
            </p>
          </div>
        )}

        {groups.map((g) => {
          const items = materials.filter(g.filter);
          return (
            <div key={g.title} className="bg-white rounded-xl border overflow-hidden">
              <div className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 border-b">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <g.icon className="h-4 w-4 text-indigo-700" />
                  {g.title}
                </div>
                <button className="h-6 w-6 rounded-full bg-indigo-700 text-white flex items-center justify-center hover:bg-indigo-800 transition">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              {items.length === 0 ? (
                <p className="text-xs text-slate-400 italic px-3 py-3">Chưa có nội dung</p>
              ) : (
                <ul>
                  {items.map((m) => {
                    const meta = MATERIAL_META[m.type];
                    return (
                      <li
                        key={m.title}
                        draggable={editMode}
                        onDragStart={(e) => onDragStart(e, materials.indexOf(m))}
                        className={`flex items-center justify-between gap-2 px-3 py-2 text-sm border-t first:border-t-0 transition hover:bg-indigo-50 ${
                          editMode ? "cursor-grab active:cursor-grabbing bg-indigo-50/40 ring-1 ring-inset ring-indigo-100" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${meta.bg}`}>
                            <meta.icon className={`h-4 w-4 ${meta.fg}`} />
                          </span>
                          <span className="text-slate-700 truncate">{m.title}</span>
                        </div>
                        <button className="h-5 w-5 rounded-full border border-indigo-300 text-indigo-700 flex items-center justify-center hover:bg-indigo-100 shrink-0">
                          <FileCheck2 className="h-3 w-3" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}

        {editMode && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs text-amber-800 font-medium mb-2">
              Lịch tuần này — thả vào ô trống để chuyển tiết:
            </p>
            <MiniWeek
              weekIdx={weekIdx} grid={grid}
              classFilter={lesson.class}
              onDropToSlot={onDropToSlot}
            />
          </div>
        )}
      </div>

    </aside>
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
      {DAYS.map((d) => (
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
                  ? sameClass ? "bg-indigo-100 border-indigo-300" : "bg-slate-100 border-slate-200"
                  : "border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50"
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
function ChartSection({ classFilter }: { classFilter: "ALL" | ClassId }) {
  const data = CHART_DATA_BY_CLASS[classFilter];
  const label = classFilter === "ALL" ? "Tất cả các lớp" : `Lớp ${classFilter}`;

  return (
    <section className="bg-white rounded-2xl border shadow-sm p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">Biểu đồ kết quả học tập</h2>
            <Badge className="bg-indigo-700 hover:bg-indigo-700">{label}</Badge>
          </div>
          <p className="text-sm text-slate-500">Số học sinh theo trạng thái bài tập · Môn Toán</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronLeft className="h-4 w-4" /></Button>
          <span className="font-medium">15/6/2026 – 21/6/2026</span>
          <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis label={{ value: "Số học sinh", angle: -90, position: "insideLeft", style: { fontSize: 12 } }} />
            <Legend />
            <Bar dataKey="done_ok" name="Đã hoàn thành & Đạt yêu cầu" fill="#22c55e" radius={[4,4,0,0]} />
            <Bar dataKey="done_no" name="Đã hoàn thành & Chưa đạt yêu cầu" fill="#f59e0b" radius={[4,4,0,0]} />
            <Bar dataKey="undone" name="Chưa hoàn thành" fill="#4f46e5" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
