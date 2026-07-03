import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  ClipboardList, Plus, MoreVertical, Search, Calendar as CalendarIcon,
  Pencil, BellRing, CalendarClock, Trash2, FileText, BookOpen, Crown, Filter, X,
  FileText as FileIcon, Timer, ClipboardEdit,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/giao-bai-tap/")({
  head: () => ({ meta: [{ title: "Giao bài tập, nhiệm vụ" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    highlight: typeof s.highlight === "string" ? (s.highlight as string) : undefined,
  }),
  component: Page,
});

/* ---------- Types & seed ---------- */
type TaskKind = "practice" | "reading" | "licensed";
const KIND_LABEL: Record<TaskKind, string> = {
  practice: "Đề luyện tập",
  reading: "Bài tập đọc - Tìm hiểu",
  licensed: "Bài tập bản quyền",
};

type Task = {
  id: string;
  title: string;
  subject: string;   // Toán / Tiếng Việt / ...
  grade: string;     // "3" | "4" | "5"
  classes: string[]; // ["4A","4B"]
  kind: TaskKind;
  assignedAt: string; // ISO
  dueAt: string;      // ISO with time
  submitted: number;
  totalStudents: number;
  graded: number;
  licensed?: boolean;
};

const now = new Date();
const iso = (d: Date) => d.toISOString();
const addDays = (n: number) => { const d = new Date(now); d.setDate(d.getDate() + n); return d; };

const SEED: Task[] = [
  { id: "t1", title: "Ôn tập cộng trừ phân số", subject: "Toán", grade: "4",
    classes: ["4A", "4C", "4D"], kind: "practice",
    assignedAt: iso(addDays(-3)), dueAt: iso(addDays(2)),
    submitted: 0, totalStudents: 96, graded: 0 },
  { id: "t2", title: "Bài tập hè số 1", subject: "Toán", grade: "1",
    classes: ["1A","1B","1C","1D","1E","1G"], kind: "licensed", licensed: true,
    assignedAt: iso(addDays(-10)), dueAt: iso(addDays(-4)),
    submitted: 0, totalStudents: 177, graded: 0 },
  { id: "t3", title: "Đọc, viết các số trong phạm vi 10 000", subject: "Toán", grade: "3",
    classes: ["3A","3C","3D","3E"], kind: "reading", licensed: true,
    assignedAt: iso(addDays(-15)), dueAt: iso(addDays(-8)),
    submitted: 0, totalStudents: 129, graded: 0 },
  { id: "t4", title: "Luyện tập số tự nhiên & làm tròn", subject: "Toán", grade: "4",
    classes: ["4A"], kind: "practice",
    assignedAt: iso(addDays(-2)), dueAt: iso(addDays(5)),
    submitted: 12, totalStudents: 32, graded: 5 },
  { id: "t5", title: "Đọc hiểu: Cây bàng", subject: "Tiếng Việt", grade: "4",
    classes: ["4A","4B"], kind: "reading",
    assignedAt: iso(addDays(-6)), dueAt: iso(addDays(-1)),
    submitted: 40, totalStudents: 64, graded: 30 },
];

const SUBJECTS = ["Toán", "Tiếng Việt", "Khoa học", "Đạo đức"];
const GRADES = ["1", "2", "3", "4", "5"];
const CLASSES_BY_GRADE: Record<string, string[]> = {
  "1": ["1A","1B","1C","1D","1E","1G"],
  "2": ["2A","2B","2C"],
  "3": ["3A","3B","3C","3D","3E"],
  "4": ["4A","4B","4C","4D"],
  "5": ["5A","5B","5C"],
};

/* ---------- Utils ---------- */
function fmtDate(s: string, withTime = false) {
  const d = new Date(s);
  const p = (n: number) => String(n).padStart(2, "0");
  const base = `${p(d.getDate())}/${p(d.getMonth()+1)}/${d.getFullYear()}`;
  return withTime ? `${base}, ${p(d.getHours())}:${p(d.getMinutes())}` : base;
}
function isOverdue(t: Task) { return new Date(t.dueAt).getTime() < Date.now(); }

/* ---------- Page ---------- */
function Page() {
  const navigate = useNavigate();
  const { highlight } = Route.useSearch();
  const highlightUngraded = highlight === "ungraded";
  const [tasks, setTasks] = useState<Task[]>(SEED);

  // filters
  const [grade, setGrade] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [klass, setKlass] = useState<string>("");
  const [assignedFrom, setAssignedFrom] = useState<string>("");
  const [dueBefore, setDueBefore] = useState<string>("");
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<string>("");
  const [status, setStatus] = useState<string>(""); // "overdue" | "active"
  const [licensedOpen, setLicensedOpen] = useState(false);

  const filtered = useMemo(() => tasks.filter((t) => {
    if (grade && t.grade !== grade) return false;
    if (subject && t.subject !== subject) return false;
    if (klass && !t.classes.includes(klass)) return false;
    if (assignedFrom && new Date(t.assignedAt) < new Date(assignedFrom)) return false;
    if (dueBefore && new Date(t.dueAt) > new Date(dueBefore + "T23:59")) return false;
    if (q && !t.title.toLowerCase().includes(q.toLowerCase())) return false;
    if (kind && t.kind !== (kind as TaskKind)) return false;
    if (status === "overdue" && !isOverdue(t)) return false;
    if (status === "active" && isOverdue(t)) return false;
    return true;
  }), [tasks, grade, subject, klass, assignedFrom, dueBefore, q, kind, status]);

  const hasAnyFilter = grade || subject || klass || assignedFrom || dueBefore || q || kind || status;
  const clearFilters = () => {
    setGrade(""); setSubject(""); setKlass("");
    setAssignedFrom(""); setDueBefore(""); setQ(""); setKind(""); setStatus("");
  };

  const addQuick = (k: TaskKind) => {
    const t: Task = {
      id: `t-${Date.now()}`,
      title: `Bài tập mới – ${KIND_LABEL[k]}`,
      subject: "Toán", grade: "4", classes: ["4A"], kind: k,
      assignedAt: iso(new Date()), dueAt: iso(addDays(7)),
      submitted: 0, totalStudents: 32, graded: 0,
      licensed: k === "licensed",
    };
    setTasks((prev) => [t, ...prev]);
    toast.success(`Đã tạo ${KIND_LABEL[k]}`);
  };

  const remove = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.success("Đã xóa bài tập");
  };
  const remind = (t: Task) => toast.success(`Đã gửi nhắc nộp: ${t.title}`);
  const extend = (id: string) => {
    setTasks((prev) => prev.map((t) => t.id === id
      ? { ...t, dueAt: iso(new Date(new Date(t.dueAt).getTime() + 3*86400000)) }
      : t));
    toast.success("Đã gia hạn thêm 3 ngày");
  };

  return (
    <AppShell role="teacher">
      <section className="bg-white rounded-2xl border shadow-sm">
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-indigo-700" />
            <h2 className="text-lg font-bold text-slate-800">Giao bài tập, nhiệm vụ</h2>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-indigo-700 hover:bg-indigo-800 text-white gap-1">
                <Plus className="h-4 w-4" /> Thêm bài tập mới
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate({ to: "/giao-bai-tap/tao-moi/de-luyen-tap" })}>
                <FileText className="h-4 w-4 mr-2 text-indigo-600" /> Đề luyện tập
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/giao-bai-tap/tao-moi/bai-tap-doc" })}>
                <BookOpen className="h-4 w-4 mr-2 text-emerald-600" /> Bài tập đọc - Tìm hiểu
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLicensedOpen(true)}>
                <Crown className="h-4 w-4 mr-2 text-amber-600" /> Bài tập bản quyền
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Filters */}
        <div className="px-5 py-4 space-y-3 border-b bg-slate-50/50">
          {/* Row 1: cascade Khối → Môn → Lớp */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <Select value={grade} onValueChange={(v) => { setGrade(v); setKlass(""); }}>
              <SelectTrigger className="w-[140px] bg-white"><SelectValue placeholder="Khối" /></SelectTrigger>
              <SelectContent>
                {GRADES.map((g) => <SelectItem key={g} value={g}>Khối {g}</SelectItem>)}
              </SelectContent>
            </Select>
            {grade && (
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="w-[160px] bg-white"><SelectValue placeholder="Môn học" /></SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            {grade && subject && (
              <Select value={klass} onValueChange={setKlass}>
                <SelectTrigger className="w-[140px] bg-white"><SelectValue placeholder="Lớp" /></SelectTrigger>
                <SelectContent>
                  {(CLASSES_BY_GRADE[grade] ?? []).map((c) => <SelectItem key={c} value={c}>Lớp {c}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            {hasAnyFilter && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto text-slate-600">
                <X className="h-4 w-4 mr-1" /> Xóa lọc
              </Button>
            )}
          </div>

          {/* Row 2: date filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <CalendarIcon className="h-4 w-4 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
              <Input type="date" value={assignedFrom} onChange={(e) => setAssignedFrom(e.target.value)}
                className="pl-8 w-[180px] bg-white" placeholder="Ngày giao" />
            </div>
            <div className="relative">
              <CalendarIcon className="h-4 w-4 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
              <Input type="date" value={dueBefore} onChange={(e) => setDueBefore(e.target.value)}
                className="pl-8 w-[180px] bg-white" placeholder="Hạn nộp" />
            </div>
          </div>

          {/* Row 3: search + kind + status */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="h-4 w-4 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
              <Input value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm theo tên bài tập..." className="pl-8 bg-white" />
            </div>
            <Select value={kind} onValueChange={setKind}>
              <SelectTrigger className="w-[200px] bg-white"><SelectValue placeholder="Loại bài tập" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="practice">Đề luyện tập</SelectItem>
                <SelectItem value="reading">Bài tập đọc - Tìm hiểu</SelectItem>
                <SelectItem value="licensed">Bài tập bản quyền</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[170px] bg-white"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Chưa hết hạn</SelectItem>
                <SelectItem value="overdue">Hết hạn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* List */}
        <ul className="p-5 space-y-3">
          {filtered.length === 0 && (
            <li className="text-center text-slate-500 py-10 text-sm">
              Không có bài tập nào phù hợp.
            </li>
          )}
          {filtered.map((t) => {
            const overdue = isOverdue(t);
            const isHighlighted = highlightUngraded && t.graded === 0;
            return (
              <li
                key={t.id}
                onClick={() => navigate({ to: "/giao-bai-tap/$taskId", params: { taskId: t.id } })}
                className={`rounded-xl border bg-white p-4 hover:shadow-md hover:border-indigo-200 transition cursor-pointer ${
                  isHighlighted ? "ring-2 ring-amber-400 border-amber-300 bg-amber-50/40 shadow-md" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-800">{t.title}</h3>
                      {t.licensed && <Crown className="h-4 w-4 text-amber-500" />}
                      {overdue ? (
                        <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">Hết hạn</Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Chưa hết hạn</Badge>
                      )}
                    </div>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-[13px] text-slate-600">
                      <div><span className="text-slate-500">Ngày giao:</span> {fmtDate(t.assignedAt)}</div>
                      <div><span className="text-slate-500">Hạn nộp:</span> {fmtDate(t.dueAt, true)}</div>
                      <div><span className="text-slate-500">Lớp:</span> {t.classes.join(", ")}</div>
                      <div><span className="text-slate-500">Môn:</span> {t.subject}</div>
                      <div className="md:col-span-4">
                        <span className="text-slate-500">Loại:</span>{" "}
                        <span className="font-medium">{KIND_LABEL[t.kind]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats box */}
                  <div className="shrink-0 rounded-lg border bg-slate-50 px-4 py-2 text-center">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[11px] text-slate-500">Đã nộp</div>
                        <div className="text-sm font-bold text-indigo-700">
                          {t.submitted}<span className="text-slate-400">/{t.totalStudents}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-500">Đã chấm</div>
                        <div className="text-sm font-bold text-emerald-700">{t.graded}</div>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-md hover:bg-slate-100 shrink-0"
                      >
                        <MoreVertical className="h-4 w-4 text-slate-600" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => toast("Mở form chỉnh sửa")}>
                        <Pencil className="h-4 w-4 mr-2" /> Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => remind(t)}>
                        <BellRing className="h-4 w-4 mr-2" /> Nhắc nộp
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => extend(t.id)}>
                        <CalendarClock className="h-4 w-4 mr-2" /> Gia hạn
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => remove(t.id)} className="text-rose-600">
                        <Trash2 className="h-4 w-4 mr-2" /> Xóa bài
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <Dialog open={licensedOpen} onOpenChange={setLicensedOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <Crown className="h-5 w-5 text-amber-500" /> Chọn loại bài tập bản quyền
            </DialogTitle>
          </DialogHeader>
          <p className="text-center text-sky-700 font-semibold">
            Vui lòng chọn loại hình học liệu bạn muốn sử dụng để giao bài tập cho học sinh.
          </p>
          <div className="grid grid-cols-3 gap-4 py-2">
            {[
              { key: "material", icon: FileIcon, color: "text-violet-600 bg-violet-50",
                title: "Học liệu", desc: "Giao bài tập từ kho học liệu bản quyền có sẵn." },
              { key: "bank", icon: Timer, color: "text-orange-500 bg-orange-50",
                title: "Bộ câu hỏi", desc: "Tạo bài tập bằng cách chọn các bộ câu hỏi từ học liệu." },
              { key: "custom", icon: ClipboardEdit, color: "text-teal-600 bg-teal-50",
                title: "Biên soạn tùy chỉnh", desc: "Tạo bài tập bằng cách chọn các câu hỏi từ học liệu." },
            ].map((o) => (
              <button key={o.key}
                onClick={() => { setLicensedOpen(false); addQuick("licensed"); }}
                className="rounded-2xl border-2 border-slate-100 bg-white p-6 text-center hover:border-indigo-300 hover:shadow-md transition group">
                <div className={`h-16 w-16 rounded-xl mx-auto flex items-center justify-center ${o.color}`}>
                  <o.icon className="h-8 w-8" />
                </div>
                <div className="mt-4 text-base font-bold text-sky-700 group-hover:text-indigo-700">{o.title}</div>
                <div className="mt-1 text-xs text-slate-500 leading-relaxed">{o.desc}</div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
