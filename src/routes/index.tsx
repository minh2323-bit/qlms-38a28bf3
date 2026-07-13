import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useMemo, useEffect } from "react";
import {
  Home, BookOpen, FolderKanban, BarChart3, GraduationCap, Settings,
  ClipboardCheck, CalendarClock, Sun, Sunset, Moon,
  ChevronLeft, ChevronRight, ChevronDown, Plus, Search, X,
  FileText, Presentation, ListChecks, BookOpenCheck, Pencil,
  Bell, BookMarked, Users, FileCheck2, Library, Trophy, TrendingUp,
  Video, FileType2, Move, Copy, Database, Trash2, BellRing,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
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
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer,
} from "recharts";
import teacherAvatar from "@/assets/teacher-avatar.jpg";
import qlmsLogo from "@/assets/qlms-logo.png";
import { AppShell } from "@/components/AppShell";
import { toast } from "sonner";
import { KNOWLEDGE_TREE, getChapterOfUnit, getKnowledgeTree } from "@/lib/knowledge-tree";
import {
  useMaterials, addMaterial, moveMaterials, copyMaterialsWithOverrides, removeMaterial, type Material, type MaterialKind,
} from "@/lib/teaching-store";
import {
  useLiveClasses, PERIOD_TIMES, formatTimeRange, isLiveEnded, isEvening,
  type LiveClass,
} from "@/lib/live-class-store";
import { LiveClassStatsModal } from "@/components/LiveClassStatsModal";
import { WEEKS, DAY_DATES } from "@/lib/school-weeks";
import { AddMaterialModal, TaskPickerDialog, TestPickerDialog, type ClassInfo } from "@/routes/lop-hoc-so.$classId";


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

// WEEKS + DAY_DATES nay được sinh từ src/lib/school-weeks.ts (bắt đầu 5/9 hằng năm).
const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

// KNOWLEDGE_TREE moved to src/lib/knowledge-tree.ts

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

  // Tuần 1 — Số tự nhiên & Phân số (Toán 4)
  g[30][0][1] = makeLesson("l1",  "3A", "Khái niệm phân số", "u3-khainiem");
  g[30][1][1] = makeLesson("l2",  "3A", "Luyện tập phân số", "u3-khainiem");
  g[30][1][2] = makeLesson("l3",  "3B", "Khái niệm phân số", "u3-khainiem");
  g[30][2][1] = makeLesson("l4",  "3C", "Khái niệm phân số", "u3-khainiem");
  g[30][2][3] = makeLesson("l5",  "4A", "Ôn tập số tự nhiên", "u1-sotunhien");
  g[30][3][1] = makeLesson("l6",  "3D", "Tính chất cơ bản của phân số", "u3-tinhchat");
  g[30][3][2] = makeLesson("l7",  "4B", "Hàng và lớp", "u1-sotunhien");
  g[30][4][1] = makeLesson("l8",  "4A", "So sánh các số tự nhiên", "u1-sosanh");
  g[30][4][2] = makeLesson("l9",  "4C", "Ôn tập số tự nhiên", "u1-sotunhien");
  g[30][0][6] = makeLesson("l10", "3A", "Bài tập phân số (chiều)", "u3-khainiem");
  g[30][2][6] = makeLesson("l11", "4B", "Luyện tập số có nhiều chữ số", "u1-sotunhien");
  g[30][4][6] = makeLesson("l12", "3C", "Rút gọn phân số", "u3-rutgon");

  // Tuần 2 — Quy đồng / So sánh phân số & Làm tròn số tự nhiên
  g[31][0][1] = makeLesson("l13", "3A", "Quy đồng mẫu số", "u3-quydong");
  g[31][1][1] = makeLesson("l14", "3B", "Quy đồng mẫu số", "u3-quydong");
  g[31][1][2] = makeLesson("l15", "3A", "So sánh các phân số", "u3-sosanh");
  g[31][2][1] = makeLesson("l16", "3C", "Quy đồng mẫu số", "u3-quydong");
  g[31][2][2] = makeLesson("l17", "4A", "Làm tròn số tự nhiên", "u1-lamtron");
  g[31][3][1] = makeLesson("l18", "3D", "So sánh các phân số", "u3-sosanh");
  g[31][3][2] = makeLesson("l19", "4B", "Làm tròn số tự nhiên", "u1-lamtron");
  g[31][4][2] = makeLesson("l20", "4C", "So sánh các phân số", "u3-sosanh");

  // Tuần 3 — Phép tính phân số & Hình học/Đo lường
  g[32][0][1] = makeLesson("l21", "3A", "Phép cộng phân số", "u4-cong");
  g[32][1][1] = makeLesson("l22", "3B", "Phép trừ phân số", "u4-tru");
  g[32][2][1] = makeLesson("l23", "4A", "Tìm số trung bình cộng", "u2-trungbinh");
  g[32][3][2] = makeLesson("l24", "3A", "Hình bình hành", "u5-binhhanh");
  g[32][4][2] = makeLesson("l25", "4B", "Ki-lô-mét vuông", "u6-km2");

  return g;
};

const MATERIAL_META: Record<MaterialKind, { icon: typeof FileText; bg: string; fg: string }> = {
  syllabus: { icon: BookOpen,       bg: "bg-indigo-100",  fg: "text-indigo-700" },
  slide:    { icon: Presentation,   bg: "bg-purple-100",  fg: "text-purple-700" },
  doc:      { icon: FileType2,      bg: "bg-sky-100",     fg: "text-sky-700" },
  exercise: { icon: ClipboardCheck, bg: "bg-amber-100",   fg: "text-amber-700" },
  video:    { icon: Video,          bg: "bg-rose-100",    fg: "text-rose-700" },
  image:    { icon: FileType2,      bg: "bg-emerald-100", fg: "text-emerald-700" },
};

// MATERIALS_SEED moved into src/lib/teaching-store.ts

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

function findLiveSlot(startAt: string): { week: number; day: number; period: number } | null {
  const d = new Date(startAt);
  const key = `${d.getDate()}/${d.getMonth() + 1}`;
  for (const w of WEEKS) {
    const dayIdx = (DAY_DATES[w.idx] ?? []).indexOf(key);
    if (dayIdx < 0) continue;
    const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    for (const [p, [s, e]] of Object.entries(PERIOD_TIMES)) {
      if (time >= s && time <= e) return { week: w.idx, day: dayIdx, period: Number(p) };
    }
  }
  return null;
}

// Trả về (week, day) cho một lớp diễn ra buổi tối, nếu rơi vào một ngày của lịch.
function findEveningSlot(startAt: string): { week: number; day: number } | null {
  if (!isEvening(startAt)) return null;
  const d = new Date(startAt);
  const key = `${d.getDate()}/${d.getMonth() + 1}`;
  for (const w of WEEKS) {
    const dayIdx = (DAY_DATES[w.idx] ?? []).indexOf(key);
    if (dayIdx >= 0) return { week: w.idx, day: dayIdx };
  }
  return null;
}

function TeacherHome() {
  const [grid, setGrid] = useState<WeekGrid>(() => buildGrid());
  const [weekIdx, setWeekIdx] = useState(30); // Tuần 30 (cuối tháng 3) — nơi có sẵn dữ liệu demo
  const [classFilter, setClassFilter] = useState<"ALL" | ClassId>("ALL");
  const [showTree, setShowTree] = useState(false);
  const [focusUnit, setFocusUnit] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeLive, setActiveLive] = useState<LiveClass | null>(null);

  const liveAll = useLiveClasses();
  // map slot key "w-d-p" -> live class (respecting class filter)
  const liveBySlot = useMemo(() => {
    const map = new Map<string, LiveClass>();
    for (const lc of liveAll) {
      if (classFilter !== "ALL" && lc.classRealId !== classFilter) continue;
      const slot = findLiveSlot(lc.startAt);
      if (!slot) continue;
      map.set(`${slot.week}-${slot.day}-${slot.period}`, lc);
    }
    return map;
  }, [liveAll, classFilter]);

  // map "w-d" -> LiveClass[] (buổi tối, không chia tiết)
  const eveningByDay = useMemo(() => {
    const map = new Map<string, LiveClass[]>();
    for (const lc of liveAll) {
      if (classFilter !== "ALL" && lc.classRealId !== classFilter) continue;
      const slot = findEveningSlot(lc.startAt);
      if (!slot) continue;
      const k = `${slot.week}-${slot.day}`;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(lc);
    }
    return map;
  }, [liveAll, classFilter]);

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
    <AppShell>
      <>

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
                Chủ đề & Bài học
              </Button>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-800">Lịch báo giảng</h2>
                <Button
                  onClick={() => toast.success("Đã cập nhật lịch báo giảng từ CSDL")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-9 px-4 font-bold shadow-md"
                >
                  <Database className="h-4 w-4" /> Cập nhật từ CSDL
                </Button>
              </div>
              <div className="flex items-center gap-1 rounded-lg border bg-slate-50 px-2 py-1">
                <Button variant="ghost" size="icon" className="h-7 w-7"
                  onClick={() => setWeekIdx(Math.max(1, weekIdx - 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-slate-100 transition">
                      <CalendarClock className="h-4 w-4 text-slate-500" />
                      <span className="text-sm font-medium">{week.label} · {week.range}</span>
                      <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-64 max-h-80 overflow-y-auto">
                    {WEEKS.map((w) => (
                      <DropdownMenuItem
                        key={w.idx}
                        onClick={() => setWeekIdx(w.idx)}
                        className={`flex items-center justify-between gap-2 cursor-pointer ${w.idx === weekIdx ? "bg-indigo-50 text-indigo-700 font-semibold" : ""}`}
                      >
                        <span>{w.label}</span>
                        <span className="text-xs text-slate-500">{w.range}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
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
                  liveBySlot={liveBySlot}
                  eveningByDay={eveningByDay}
                  onPickLive={(lc) => setActiveLive(lc)}
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

          {activeLive && (
            <LiveClassPopup live={activeLive} onClose={() => setActiveLive(null)} />
          )}
      </>
    </AppShell>

  );
}




/* ----- Dashboard ----- */
type PendingTask = { name: string; deadline: string; overdue: boolean };
type PendingStudent = { name: string; klass: string; tasks: PendingTask[] };
const PENDING_STUDENTS: PendingStudent[] = [
  { name: "Nguyễn An",        klass: "4A", tasks: [
    { name: "Ôn tập cộng trừ phân số", deadline: "02/07/2026", overdue: true },
    { name: "Luyện đề 02",             deadline: "05/07/2026", overdue: false },
  ]},
  { name: "Trần Bảo",         klass: "4A", tasks: [
    { name: "Ôn tập cộng trừ phân số", deadline: "02/07/2026", overdue: true },
  ]},
  { name: "Vũ Huy Hoàng",     klass: "4B", tasks: [
    { name: "Đọc hiểu: Cây bàng",       deadline: "01/07/2026", overdue: true },
    { name: "Luyện đề 01",              deadline: "04/07/2026", overdue: false },
    { name: "Ôn tập cộng trừ phân số",  deadline: "02/07/2026", overdue: true },
  ]},
  { name: "Phạm Tất Thắng",   klass: "4B", tasks: [
    { name: "Đọc hiểu: Cây bàng", deadline: "01/07/2026", overdue: true },
  ]},
  { name: "Lê Minh Châu",     klass: "3A", tasks: [
    { name: "Bài tập đọc số 10 000", deadline: "06/07/2026", overdue: false },
  ]},
  { name: "Hoàng Khánh Linh", klass: "3C", tasks: [
    { name: "Bài tập đọc số 10 000", deadline: "06/07/2026", overdue: false },
    { name: "Luyện đề 01",           deadline: "04/07/2026", overdue: false },
  ]},
  { name: "Đỗ Quang Huy",     klass: "4A", tasks: [
    { name: "Luyện đề 02", deadline: "05/07/2026", overdue: false },
  ]},
  { name: "Nguyễn Bích Ngọc", klass: "4C", tasks: [
    { name: "Ôn tập cộng trừ phân số", deadline: "02/07/2026", overdue: true },
  ]},
  { name: "Bùi Tiến Dũng",    klass: "3D", tasks: [
    { name: "Bài tập đọc số 10 000", deadline: "06/07/2026", overdue: false },
  ]},
  { name: "Mai Huyền",        klass: "3B", tasks: [
    { name: "Luyện đề 01", deadline: "04/07/2026", overdue: false },
  ]},
];

function DashboardSection() {
  const [openPending, setOpenPending] = useState(false);
  const navigate = Route.useNavigate();


  return (
    <>
      <section className="bg-white rounded-2xl border shadow-sm p-3">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* 1. Bài tập cần chấm */}
          <button
            type="button"
            onClick={() => navigate({ to: "/giao-bai-tap", search: { highlight: "ungraded" } })}
            className="relative flex items-center gap-2.5 rounded-xl border border-slate-200 p-2.5 overflow-hidden text-left cursor-pointer hover:shadow-md hover:border-indigo-300 hover:-translate-y-0.5 transition"
          >
            <span className="absolute left-0 top-0 h-full w-1 bg-blue-500" />
            <span className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-blue-50">
              <ClipboardCheck className="h-5 w-5 text-blue-600" />
            </span>
            <div className="min-w-0">
              <div className="text-2xl font-black leading-none text-blue-600">10</div>
              <div className="text-[12px] font-semibold text-slate-800 mt-1 leading-tight">bài tập cần chấm</div>
              <div className="text-[10px] text-slate-500 mt-0.5">100 bài tập đã giao</div>
            </div>
          </button>

          {/* 2. Học sinh chưa nộp bài */}
          <button
            type="button"
            onClick={() => setOpenPending(true)}
            className="relative flex items-center gap-2.5 rounded-xl border border-slate-200 p-2.5 overflow-hidden text-left cursor-pointer hover:shadow-md hover:border-indigo-300 hover:-translate-y-0.5 transition"
          >
            <span className="absolute left-0 top-0 h-full w-1 bg-amber-500" />
            <span className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-amber-50">
              <Users className="h-5 w-5 text-amber-600" />
            </span>
            <div className="min-w-0">
              <div className="text-2xl font-black leading-none text-amber-600">10</div>
              <div className="text-[12px] font-semibold text-slate-800 mt-1 leading-tight">Học sinh chưa nộp bài</div>
            </div>
          </button>

          {/* 3. Merged: Bài giảng/Học liệu đã tạo + sử dụng tuần này */}
          <div className="relative rounded-xl border border-slate-200 overflow-hidden lg:col-span-3 grid grid-cols-2 divide-x divide-slate-200">
            <span className="absolute left-0 top-0 h-full w-1 bg-emerald-500" />
            <div className="flex items-center gap-2.5 p-2.5">
              <span className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-emerald-50">
                <Presentation className="h-5 w-5 text-emerald-600" />
              </span>
              <div className="min-w-0">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <div className="text-2xl font-black leading-none text-emerald-600">10</div>
                  <div className="text-[12px] font-semibold text-slate-800 leading-tight">Bài giảng đã tạo</div>
                </div>
                <div className="flex items-baseline gap-1.5 mt-1 flex-wrap">
                  <div className="text-2xl font-black leading-none text-emerald-600">50</div>
                  <div className="text-[12px] font-semibold text-slate-800 leading-tight">Học liệu đã tạo</div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2.5">
              <span className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-violet-50">
                <BookOpenCheck className="h-5 w-5 text-violet-600" />
              </span>
              <div className="min-w-0">
                <div className="text-2xl font-black leading-none text-violet-600">5</div>
                <div className="text-[12px] font-semibold text-slate-800 mt-1 leading-tight">Bài giảng/Học liệu sử dụng tuần này</div>
              </div>
            </div>
          </div>


          {/* 4. Bài kiểm tra chưa chấm */}
          <div className="relative flex items-center gap-2.5 rounded-xl border border-slate-200 p-2.5 overflow-hidden">
            <span className="absolute left-0 top-0 h-full w-1 bg-rose-500" />
            <span className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-rose-50">
              <FileCheck2 className="h-5 w-5 text-rose-600" />
            </span>
            <div className="min-w-0">
              <div className="text-2xl font-black leading-none text-rose-600">10</div>
              <div className="text-[12px] font-semibold text-slate-800 mt-1 leading-tight">Bài kiểm tra chưa chấm</div>
              <div className="text-[10px] text-slate-500 mt-0.5">100 bài kiểm tra đã tạo</div>
            </div>
          </div>
        </div>
      </section>

      <PendingStudentsDialog open={openPending} onOpenChange={setOpenPending} />
    </>
  );
}

function PendingStudentsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [classFilter, setClassFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "overdue" | "on_time">("ALL");

  const classOptions = useMemo(
    () => Array.from(new Set(PENDING_STUDENTS.map((s) => s.klass))).sort(),
    [],
  );

  const rows = useMemo(() => {
    return PENDING_STUDENTS
      .filter((s) => classFilter === "ALL" || s.klass === classFilter)
      .map((s) => ({
        ...s,
        tasks: s.tasks.filter((t) =>
          statusFilter === "ALL" ? true :
          statusFilter === "overdue" ? t.overdue : !t.overdue,
        ),
      }))
      .filter((s) => s.tasks.length > 0);
  }, [classFilter, statusFilter]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4 pr-6">
            <DialogTitle>Học sinh chưa nộp bài</DialogTitle>
            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white gap-1"
              onClick={() => toast.success("Đã gửi nhắc nhở tới tất cả học sinh chưa nộp bài")}
            >
              <Bell className="h-4 w-4" /> Nhắc nhở tất cả
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-3 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Lớp:</span>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả lớp</SelectItem>
                {classOptions.map((c) => <SelectItem key={c} value={c}>Lớp {c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Trạng thái:</span>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
              <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                <SelectItem value="overdue">Quá hạn</SelectItem>
                <SelectItem value="on_time">Chưa quá hạn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-lg border overflow-hidden max-h-[60vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left">Họ và tên</th>
                <th className="px-3 py-2 text-left w-20">Lớp</th>
                <th className="px-3 py-2 text-left">Bài tập chưa nộp</th>
                <th className="px-3 py-2 text-center w-24">Nhắc nhở</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((s) => (
                <tr key={s.name} className="hover:bg-slate-50 align-top">
                  <td className="px-3 py-2 font-medium text-slate-800">{s.name}</td>
                  <td className="px-3 py-2">{s.klass}</td>
                  <td className="px-3 py-2">
                    <ul className="space-y-1.5">
                      {s.tasks.map((t, i) => (
                        <li key={i} className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center rounded-full text-[11px] px-2 py-0.5 border ${
                            t.overdue
                              ? "bg-rose-50 border-rose-200 text-rose-700"
                              : "bg-emerald-50 border-emerald-200 text-emerald-700"
                          }`}>
                            {t.name}
                          </span>
                          <span className={`text-[11px] ${t.overdue ? "text-rose-600 font-semibold" : "text-slate-500"}`}>
                            Hạn: {t.deadline}{t.overdue ? " · Quá hạn" : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => toast.success(`Đã nhắc nhở ${s.name}`)}
                      className="p-1.5 rounded-md hover:bg-amber-50 text-amber-600"
                      title="Nhắc nhở"
                    >
                      <Bell className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={4} className="px-3 py-8 text-center text-slate-400 italic">Không có học sinh phù hợp bộ lọc.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ----- Knowledge Tree Side Panel ----- */
function KnowledgeTree({
  onPickUnit, activeUnit, onClose,
}: { onPickUnit: (id: string, week: number) => void; activeUnit: string | null; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [grade, setGrade] = useState("4");
  const [subject, setSubject] = useState("toan");
  const tree = getKnowledgeTree(grade, subject);
  return (
    <div className="w-72 shrink-0 border-r bg-slate-50/60 p-4 space-y-3 animate-in slide-in-from-left-4 duration-200">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">Chủ đề & Bài học</span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex gap-2">
        <Select value={grade} onValueChange={setGrade}>
          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Khối" /></SelectTrigger>
          <SelectContent>
            {[1,2,3,4,5].map((k) => <SelectItem key={k} value={String(k)}>Khối {k}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={subject} onValueChange={setSubject}>
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
        {tree.length === 0 && (
          <div className="text-xs text-slate-400 italic px-2 py-6 text-center border border-dashed rounded-lg">
            Chưa có dữ liệu cây kiến thức cho Khối {grade} – {subject === "toan" ? "Toán" : "Tiếng Việt"}.
          </div>
        )}
        {tree.map((ch) => (
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
  liveBySlot, eveningByDay, onPickLive,
}: {
  week: number; grid: WeekGrid; classFilter: "ALL" | ClassId;
  focusUnit: string | null; onPickLesson: (id: string) => void;
  activeLessonId: string | null;
  liveBySlot: Map<string, LiveClass>;
  eveningByDay: Map<string, LiveClass[]>;
  onPickLive: (lc: LiveClass) => void;
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

  const renderCell = (d: number, p: number, afternoonBg: boolean) => {
    const l = cellFor(d, p);
    const isFocus = l && focusUnit && l.unitId === focusUnit;
    const isActive = l && activeLessonId === l.id;
    const live = liveBySlot.get(`${week}-${d}-${p}`);
    return (
      <td key={d} className={`border border-slate-200 p-1 align-top h-10 ${afternoonBg ? "bg-purple-50/30" : ""}`}>
        {l && (
          <button
            onClick={() => onPickLesson(l.id)}
            className={`w-full text-left p-2 rounded-md text-[13px] leading-snug transition ${
              CLASS_COLORS[l.class]
            } ${isFocus ? "ring-2 ring-yellow-400 animate-pulse shadow-lg scale-[1.02]" : ""} ${
              isActive ? "ring-2 ring-indigo-700 shadow-md" : "hover:shadow hover:-translate-y-0.5"
            }`}
          >
            <div className="font-bold text-[13px]">{l.class}</div>
            <div className="text-[13px] opacity-80">Toán</div>
            <div className="truncate font-medium text-[13px]">
              <span className="opacity-70">Nội dung:</span> {l.topic}
            </div>
          </button>
        )}
        {live && (
          <button
            onClick={(e) => { e.stopPropagation(); onPickLive(live); }}
            title={live.name}
            className={`mt-1 w-full inline-flex items-center gap-1 px-1.5 py-1 rounded-md text-[13px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition`}
          >
            <Video className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{formatTimeRange(live.startAt, live.endAt)}</span>
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
          {morning.map((p, idx) => (
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
              {DAYS.map((_, d) => renderCell(d, p, false))}
            </tr>
          ))}
          {afternoon.map((p, idx) => (
            <tr key={p}>
              {idx === 0 && (
                <td rowSpan={5} className="border border-indigo-800 bg-purple-50 text-purple-700 text-center align-middle font-semibold p-2 w-20">
                  <div className="flex flex-col items-center gap-2">
                    <Sunset className="h-5 w-5 text-purple-500" />
                    <span>Buổi chiều</span>
                  </div>
                </td>
              )}
              <td className="border border-indigo-800 text-center font-semibold p-1 w-16 bg-white text-indigo-700">
                Tiết {p}
              </td>
              {DAYS.map((_, d) => renderCell(d, p, true))}
            </tr>
          ))}
          {/* Evening row — chỉ phân theo ngày, không chia tiết */}
          {(() => {
            const hasAny = DAYS.some((_, d) => (eveningByDay.get(`${week}-${d}`) ?? []).length > 0);
            if (!hasAny) return null;
            return (
              <tr>
                <td colSpan={2} className="border border-indigo-800 bg-indigo-50 text-indigo-700 text-center align-middle font-semibold p-2 rounded-bl-lg">
                  <div className="flex flex-col items-center gap-1">
                    <Moon className="h-5 w-5 text-indigo-500" />
                    <span>Buổi tối</span>
                  </div>
                </td>
                {DAYS.map((_, d) => {
                  const list = eveningByDay.get(`${week}-${d}`) ?? [];
                  return (
                    <td key={d} className="border border-slate-200 p-1 align-top h-14 bg-indigo-50/30">
                      <div className="flex flex-col gap-1">
                        {list.map((lc) => (
                          <button
                            key={lc.id}
                            onClick={() => onPickLive(lc)}
                            title={lc.name}
                            className="w-full text-left inline-flex items-center gap-1 px-1.5 py-1 rounded-md text-[13px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
                          >
                            <Video className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{formatTimeRange(lc.startAt, lc.endAt)}</span>
                          </button>
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

/* ----- Live class popup ----- */
function LiveClassPopup({ live, onClose }: { live: LiveClass; onClose: () => void }) {
  const [showStats, setShowStats] = useState(false);
  const ended = isLiveEnded(live);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b bg-gradient-to-r from-emerald-50 to-teal-50 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <span className="h-9 w-9 rounded-lg inline-flex items-center justify-center bg-emerald-600 text-white shrink-0">
              <Video className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-800 truncate">{live.name}</h3>
              <p className="text-xs text-emerald-700 font-medium mt-0.5">
                Lớp học trực tuyến {ended && <span className="ml-1 text-slate-500">· Đã kết thúc</span>}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/60 text-slate-500 shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-2.5 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-slate-500">Lớp</span>
            <span className="font-semibold text-slate-800">{live.classRealId}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-slate-500">Môn</span>
            <span className="font-semibold text-slate-800">{live.subject}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-slate-500">Thời gian</span>
            <span className="font-semibold text-slate-800">
              {formatTimeRange(live.startAt, live.endAt)}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-slate-500">Số lượng học sinh</span>
            <span className="font-semibold text-slate-800 inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              {live.studentCount}
            </span>
          </div>
          {live.description && (
            <div className="pt-2 border-t text-slate-600 text-xs leading-relaxed">
              {live.description}
            </div>
          )}
        </div>
        <div className="px-5 py-3 border-t bg-slate-50 flex justify-end">
          {ended ? (
            <button
              onClick={() => setShowStats(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <BarChart3 className="h-4 w-4" /> Xem thống kê
            </button>
          ) : (
            <a
              href={live.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Video className="h-4 w-4" /> Vào lớp ngay
            </a>
          )}
        </div>
      </div>
      {showStats && <LiveClassStatsModal live={live} onClose={() => setShowStats(false)} />}
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
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [moveOpen, setMoveOpen] = useState<null | "move" | "copy">(null);
  useEffect(() => { setEditMode(false); setSelected(new Set()); }, [lesson.id]);
  useEffect(() => { if (!editMode) setSelected(new Set()); }, [editMode]);

  const allMaterials = useMaterials();
  const materials = useMemo(
    () => allMaterials.filter(
      (m) => m.classRealId === lesson.class
          && m.subject === lesson.subject
          && m.unitId === lesson.unitId,
    ),
    [allMaterials, lesson.class, lesson.subject, lesson.unitId],
  );

  const [adding, setAdding] = useState<null | { kind: MaterialKind; label: string }>(null);
  const [addMatOpen, setAddMatOpen] = useState<null | "lesson" | "material" | "exercise">(null);
  const [taskPickerOpen, setTaskPickerOpen] = useState(false);
  const [testPickerOpen, setTestPickerOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<null | Material>(null);

  // ClassInfo synth cho các popup dùng chung với Lớp học số
  const classInfoForModal: ClassInfo = useMemo(() => ({
    id: `lbg-${lesson.class}`,
    name: `Lớp ${lesson.class}`,
    code: `LH-${lesson.class}`,
    students: 40,
    teacher: "Giáo viên",
    thumb: "",
    description: "",
    lop: lesson.class,
    subject: lesson.subject,
    status: "deployed",
    subjectsTaught: [lesson.subject],
  }), [lesson.class, lesson.subject]);

  const onDragStart = (e: React.DragEvent, mId: string) => {
    e.dataTransfer.setData("mId", mId);
    e.dataTransfer.effectAllowed = "move";
  };
  const onDropToSlot = (e: React.DragEvent, day: number, period: number) => {
    e.preventDefault();
    const mId = e.dataTransfer.getData("mId");
    const occ = grid[weekIdx]?.[day]?.[period];
    if (mId && occ) {
      // Chuyển học liệu sang tiết đã có (cùng của mình)
      moveMaterials([mId], { classRealId: occ.class, subject: occ.subject, unitId: occ.unitId });
      toast.success(`Đã chuyển học liệu sang tiết ${occ.class} – ${occ.topic}`);
      return;
    }
    if (mId && !occ) {
      // Tạo tiết mới ở ô trống, mang theo tiêu đề học liệu
      const m = allMaterials.find((x) => x.id === mId);
      const next: WeekGrid = JSON.parse(JSON.stringify(grid));
      next[weekIdx][day][period] = {
        ...lesson,
        id: `${lesson.id}-mv-${mId}-${day}-${period}`,
        topic: m?.title ?? lesson.topic,
      };
      setGrid(next);
    }
  };

  const groups: { title: string; icon: typeof Presentation; defaultKind: MaterialKind; filter: (m: Material) => boolean }[] = [
    { title: "Bài giảng",       icon: Presentation,   defaultKind: "slide",    filter: (m) => m.kind === "slide" || m.kind === "syllabus" || m.kind === "video" },
    { title: "Học liệu",        icon: BookOpenCheck,  defaultKind: "doc",      filter: (m) => m.kind === "doc" || m.kind === "image" },
    { title: "Bài tập về nhà",  icon: FileText,       defaultKind: "exercise", filter: (m) => m.kind === "exercise" },
  ];

  const quickAdd = (kind: MaterialKind, label: string) => setAdding({ kind, label });
  const submitAdd = (title: string, meta: string, unitId: string) => {
    if (!adding) return;
    addMaterial({
      classRealId: lesson.class, subject: lesson.subject, unitId,
      kind: adding.kind, title, meta: meta || undefined, origin: "schedule",
    });
    setAdding(null);
    toast.success(`Đã thêm vào lớp ${lesson.class} – đồng bộ Lớp học số`);
  };

  const toggleSel = (id: string) => setSelected((s) => {
    const next = new Set(s);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const doMoveOrCopyMany = (targets: Lesson[], mode: "move" | "copy") => {
    const ids = Array.from(selected);
    if (!targets.length || !ids.length) { setMoveOpen(null); return; }
    if (mode === "move") {
      const target = targets[0];
      moveMaterials(ids, { classRealId: target.class, subject: target.subject, unitId: target.unitId });
      toast.success(`Đã di chuyển ${ids.length} học liệu sang tiết ${target.class} – ${target.topic}`);
    } else {
      targets.forEach((t) => copyMaterials(ids, { classRealId: t.class, subject: t.subject, unitId: t.unitId }));
      toast.success(`Đã tạo bản sao ${ids.length} học liệu sang ${targets.length} tiết`);
    }
    setSelected(new Set());
    setMoveOpen(null);
  };

  return (
    <aside className="w-[340px] shrink-0 border-l bg-slate-50/60 flex flex-col animate-in slide-in-from-right-4 duration-200">
      <div className="px-4 py-3 border-b bg-white flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-800">Học liệu của tiết</h3>
            <Badge variant="outline" className="text-[10px]">{lesson.class} · {lesson.subject}</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{lesson.topic}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="px-4 py-3 border-b bg-white space-y-2">
        {!editMode && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center justify-center gap-2 rounded-lg py-3 text-[15px] font-semibold text-white shadow-md hover:shadow-lg transition bg-gradient-to-r from-indigo-700 via-purple-600 to-fuchsia-500">
                <Plus className="h-5 w-5" /> Thêm nội dung mới
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setAddMatOpen("lesson")}>
                <Presentation className="h-4 w-4 mr-2" />Bài giảng
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAddMatOpen("material")}><BookOpenCheck className="h-4 w-4 mr-2" />Học liệu</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTestPickerOpen(true)}><ListChecks className="h-4 w-4 mr-2" />Bài kiểm tra</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTaskPickerOpen(true)}><FileText className="h-4 w-4 mr-2" />Bài tập</DropdownMenuItem>
              <DropdownMenuItem onClick={() => quickAdd("doc", "Lời nhắc")}><BellRing className="h-4 w-4 mr-2" />Lời nhắc</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {editMode && (
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              disabled={selected.size === 0}
              onClick={() => setMoveOpen("copy")}
            >
              <Copy className="h-4 w-4" /> Tạo bản sao {selected.size > 0 && `(${selected.size})`}
            </Button>
            <Button
              size="sm"
              className="gap-1 bg-indigo-700 hover:bg-indigo-800"
              disabled={selected.size === 0}
              onClick={() => setMoveOpen("move")}
            >
              <Move className="h-4 w-4" /> Di chuyển {selected.size > 0 && `(${selected.size})`}
            </Button>
          </div>
        )}
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
              <b>Chế độ sắp xếp:</b> Tick chọn học liệu rồi bấm <b>Di chuyển</b> / <b>Tạo bản sao</b>, hoặc <b>kéo–thả</b> trực tiếp sang tiết khác trên lịch bên dưới.
            </p>
          </div>
        )}

        {groups.map((g) => {
          const items = materials.filter(g.filter);
          const itemIds = items.map((m) => m.id);
          const allChecked = itemIds.length > 0 && itemIds.every((id) => selected.has(id));
          const someChecked = itemIds.some((id) => selected.has(id));
          const toggleAll = () => setSelected((s) => {
            const next = new Set(s);
            if (allChecked) itemIds.forEach((id) => next.delete(id));
            else itemIds.forEach((id) => next.add(id));
            return next;
          });
          const isBaiGiang = g.title === "Bài giảng";
          return (
            <div key={g.title} className="bg-white rounded-xl border overflow-hidden">
              <div className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 border-b">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  {editMode && itemIds.length > 0 && (
                    <Checkbox
                      checked={allChecked ? true : someChecked ? "indeterminate" : false}
                      onCheckedChange={toggleAll}
                      className="shrink-0"
                      title="Chọn tất cả"
                    />
                  )}
                  <g.icon className="h-4 w-4 text-indigo-700" />
                  {g.title}
                </div>
                {!editMode && (
                  <button
                    onClick={() => quickAdd(g.defaultKind, g.title)}
                    className="h-6 w-6 rounded-full bg-indigo-700 text-white flex items-center justify-center hover:bg-indigo-800 transition"
                    title={`Thêm ${g.title.toLowerCase()}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              {items.length === 0 ? (
                <p className="text-xs text-slate-400 italic px-3 py-3">Chưa có nội dung</p>
              ) : (
                <ul>
                  {items.map((m) => {
                    const meta = MATERIAL_META[m.kind];
                    const checked = selected.has(m.id);
                    // Bài giảng: đồng nhất icon & meta = "N chủ đề, M học liệu"
                    const displayIcon = isBaiGiang ? Presentation : meta.icon;
                    const displayBg = isBaiGiang ? "bg-purple-100" : meta.bg;
                    const displayFg = isBaiGiang ? "text-purple-700" : meta.fg;
                    const h = m.id.length;
                    const displayMeta = isBaiGiang
                      ? `${(h % 5) + 2} chủ đề · ${(h % 8) + 3} học liệu`
                      : m.meta;
                    return (
                      <li
                        key={m.id}
                        draggable={editMode}
                        onDragStart={(e) => onDragStart(e, m.id)}
                        className={`flex items-center justify-between gap-2 px-3 py-2 text-sm border-t first:border-t-0 transition hover:bg-indigo-50 ${
                          editMode ? "cursor-grab active:cursor-grabbing bg-indigo-50/40 ring-1 ring-inset ring-indigo-100" : ""
                        } ${checked ? "bg-indigo-100" : ""}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {editMode && (
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() => toggleSel(m.id)}
                              className="shrink-0"
                            />
                          )}
                          <span className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${displayBg}`}>
                            {React.createElement(displayIcon, { className: `h-4 w-4 ${displayFg}` })}
                          </span>
                          <div className="min-w-0">
                            <div className="text-slate-700 truncate">{m.title}</div>
                            {displayMeta && <div className="text-[10px] text-slate-400">{displayMeta}</div>}
                          </div>
                        </div>
                        {!editMode && (
                          <button
                            onClick={() => setConfirmRemove(m)}
                            title="Gỡ bỏ khỏi tiết học"
                            className="h-6 w-6 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center shrink-0 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}

      </div>

      {adding && (
        <QuickAddModal
          label={adding.label}
          defaultUnitId={lesson.unitId}
          onCancel={() => setAdding(null)}
          onSubmit={submitAdd}
        />
      )}

      {addMatOpen && (
        <AddMaterialModal
          mode={addMatOpen}
          classInfo={classInfoForModal}
          onClose={() => setAddMatOpen(null)}
          onSubmit={(m) => {
            addMaterial({
              classRealId: lesson.class,
              subject: lesson.subject,
              origin: "schedule",
              ...m,
            });
            setAddMatOpen(null);
            toast.success("Đã thêm – đã đồng bộ Lớp học số & Lịch báo giảng");
          }}
        />
      )}

      <TaskPickerDialog open={taskPickerOpen} onClose={() => setTaskPickerOpen(false)} />
      <TestPickerDialog open={testPickerOpen} onClose={() => setTestPickerOpen(false)} />

      {moveOpen && (
        <PickLessonModal
          mode={moveOpen}
          count={selected.size}
          weekIdx={weekIdx}
          grid={grid}
          excludeLessonId={lesson.id}
          onCancel={() => setMoveOpen(null)}
          onPickMany={(targets) => doMoveOrCopyMany(targets, moveOpen)}
        />
      )}

      <Dialog open={!!confirmRemove} onOpenChange={(o) => !o && setConfirmRemove(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Trash2 className="h-5 w-5 text-rose-500" /> Gỡ nội dung khỏi tiết học
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 leading-relaxed">
            Bạn xác nhận gỡ nội dung <b>{confirmRemove?.title}</b> khỏi Tiết học trên Lịch báo giảng.
            Nội dung này vẫn sẽ hiển thị trong Lớp học.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmRemove(null)}>Hủy</Button>
            <Button
              size="sm"
              className="bg-rose-600 hover:bg-rose-700"
              onClick={() => {
                if (confirmRemove) {
                  removeMaterial(confirmRemove.id);
                  toast.success("Đã gỡ nội dung khỏi tiết học");
                }
                setConfirmRemove(null);
              }}
            >
              Gỡ bỏ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
}

function PickLessonModal({
  mode, count, weekIdx, grid, excludeLessonId, onCancel, onPickMany,
}: {
  mode: "move" | "copy"; count: number;
  weekIdx: number; grid: WeekGrid; excludeLessonId: string;
  onCancel: () => void; onPickMany: (lessons: Lesson[]) => void;
}) {
  const title = mode === "move" ? "Di chuyển học liệu" : "Tạo bản sao học liệu";
  const week = grid[weekIdx] ?? [];
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const togglePick = (occ: Lesson) => {
    if (mode === "move") { onPickMany([occ]); return; }
    setPicked((prev) => {
      const n = new Set(prev);
      if (n.has(occ.id)) n.delete(occ.id); else n.add(occ.id);
      return n;
    });
  };
  const confirmCopy = () => {
    const lessons: Lesson[] = [];
    for (let p = 1; p <= 10; p++) {
      for (let di = 0; di < 7; di++) {
        const occ = week[di]?.[p];
        if (occ && picked.has(occ.id)) lessons.push(occ);
      }
    }
    if (lessons.length) onPickMany(lessons);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <div>
            <h3 className="text-base font-bold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500">
              {mode === "copy"
                ? <>Chọn <b>một hoặc nhiều tiết</b> đích để tạo bản sao <b>{count}</b> học liệu đã chọn.</>
                : <>Chọn tiết đích trên Lịch báo giảng cho <b>{count}</b> học liệu đã chọn.</>}
            </p>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 overflow-x-auto">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))] gap-1 mb-1">
              <div />
              {DAYS.map((d) => (
                <div key={d} className="text-xs font-semibold text-center text-slate-600">{d}</div>
              ))}
            </div>
            {[1,2,3,4,5].map((p) => (
              <div key={p} className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))] gap-1 mb-1">
                <div className="text-xs font-semibold text-slate-500 flex items-center justify-center bg-slate-50 rounded">Tiết {p}</div>
                {DAYS.map((_, di) => {
                  const occ = week[di]?.[p];
                  const isSelf = occ?.id === excludeLessonId;
                  if (!occ) {
                    return (
                      <div key={di} className="h-14 rounded border border-dashed border-slate-200 bg-slate-50/50 text-[10px] text-slate-300 flex items-center justify-center">
                        Trống
                      </div>
                    );
                  }
                  const isPicked = picked.has(occ.id);
                  return (
                    <button
                      key={di}
                      disabled={isSelf}
                      onClick={() => togglePick(occ)}
                      className={`h-14 rounded border p-1.5 text-left text-[11px] transition ${
                        isSelf
                          ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                          : `${CLASS_COLORS[occ.class]} hover:ring-2 hover:ring-indigo-400 cursor-pointer ${isPicked ? "ring-2 ring-indigo-500" : ""}`
                      }`}
                    >
                      <div className="font-semibold flex items-center justify-between gap-1">
                        <span>{occ.class} · {occ.subject}</span>
                        {mode === "copy" && !isSelf && isPicked && <span className="text-indigo-600">✓</span>}
                      </div>
                      <div className="truncate">{occ.topic}</div>
                      {isSelf && <div className="text-[9px] italic">Tiết hiện tại</div>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="px-5 py-3 border-t bg-slate-50 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>Hủy</Button>
          {mode === "copy" && (
            <Button size="sm" disabled={!picked.size} onClick={confirmCopy}>
              Tạo bản sao ({picked.size})
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickAddModal({
  label, defaultUnitId, onCancel, onSubmit,
}: {
  label: string;
  defaultUnitId: string;
  onCancel: () => void;
  onSubmit: (title: string, meta: string, unitId: string) => void;
}) {
  const initialChapter = getChapterOfUnit(defaultUnitId)?.id ?? KNOWLEDGE_TREE[0].id;
  const [chapterId, setChapterId] = useState(initialChapter);
  const [unitId, setUnitId] = useState(defaultUnitId);
  const [title, setTitle] = useState("");
  const [meta, setMeta] = useState("");

  const chapter = KNOWLEDGE_TREE.find((c) => c.id === chapterId) ?? KNOWLEDGE_TREE[0];
  const canSubmit = !!chapterId && !!unitId && title.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="text-base font-bold text-slate-800">Thêm {label.toLowerCase()}</h3>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Chương <span className="text-rose-500">*</span>
            </label>
            <select
              value={chapterId}
              onChange={(e) => {
                const ch = KNOWLEDGE_TREE.find((c) => c.id === e.target.value);
                setChapterId(e.target.value);
                setUnitId(ch?.units[0]?.id ?? "");
              }}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              {KNOWLEDGE_TREE.map((ch) => (
                <option key={ch.id} value={ch.id}>{ch.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Bài <span className="text-rose-500">*</span>
            </label>
            <select
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">— Chọn bài —</option>
              {chapter.units.map((u) => (
                <option key={u.id} value={u.id}>{u.title}</option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Bài này sẽ đồng bộ sang đúng nội dung tiết học bên Lớp học số.
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Tiêu đề</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`VD: ${label} – ...`} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Thời lượng / Số trang</label>
            <Input value={meta} onChange={(e) => setMeta(e.target.value)} placeholder="VD: 12 slide, 8 trang, 12:35" />
          </div>
        </div>
        <div className="px-5 py-3 border-t bg-slate-50 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>Hủy</Button>
          <Button size="sm" disabled={!canSubmit} onClick={() => onSubmit(title.trim(), meta.trim(), unitId)}>
            Thêm & đồng bộ
          </Button>
        </div>
      </div>
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
