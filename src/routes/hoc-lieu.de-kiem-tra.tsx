import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  FileCheck2, Plus, Search, Filter, Upload, ChevronDown,
  Grid3x3, Send, ListChecks, MoreVertical, Copy, Share2, Trash2, CheckSquare,
  Eye, ClipboardList, BookOpen, Info,
} from "lucide-react";
import { toast } from "sonner";
import { getKnowledgeTree } from "@/lib/knowledge-tree";

export const Route = createFileRoute("/hoc-lieu/de-kiem-tra")({
  head: () => ({ meta: [{ title: "Đề & Bài kiểm tra – Học liệu" }] }),
  component: Page,
});

/* ---------- Data ---------- */
type CreateKind = "matrix" | "manual";
type ShareStatus = "" | "pending" | "approved";
type Test = {
  id: string;
  name: string;
  grade: string;
  subject: string;
  chapterId?: string;
  lessonId?: string;
  kind: CreateKind;
  duration: number;
  questions: number;
  maxScore: number;
  share: ShareStatus;
};

type Exam = {
  id: string;
  name: string;
  grade: string;
  subject: string;
  classAssigned: string;
  lectureAssigned?: string;
  startAt: string;
  upcoming?: boolean;
};

const SUBJECTS_BY_GRADE: Record<string, string[]> = {
  "3": ["Toán", "Tiếng Việt", "Đạo đức"],
  "4": ["Toán", "Tiếng Việt", "Khoa học", "Đạo đức"],
  "5": ["Toán", "Tiếng Việt", "Khoa học"],
};

const SEED: Test[] = [
  { id: "e1", name: "Kiểm tra giữa kỳ – Cộng trừ phân số", grade: "4", subject: "Toán", kind: "matrix", duration: 45, questions: 20, maxScore: 10, share: "approved" },
  { id: "e2", name: "Kiểm tra 15 phút – Số tự nhiên", grade: "4", subject: "Toán", kind: "manual", duration: 15, questions: 10, maxScore: 10, share: "pending" },
  { id: "e3", name: "Kiểm tra đọc hiểu – Cây bàng", grade: "4", subject: "Tiếng Việt", kind: "manual", duration: 30, questions: 12, maxScore: 10, share: "" },
  { id: "e4", name: "Kiểm tra cuối kỳ – Toán 3", grade: "3", subject: "Toán", kind: "matrix", duration: 60, questions: 25, maxScore: 10, share: "" },
  { id: "e5", name: "Đề luyện – Hình học lớp 4", grade: "4", subject: "Toán", kind: "matrix", duration: 45, questions: 18, maxScore: 10, share: "approved" },
];

const EXAM_SEED: Exam[] = [
  { id: "b1", name: "Bài kiểm tra ôn tập", grade: "4", subject: "Toán", classAssigned: "4A năm học 2025 - 2026", startAt: "20:00 15/06/2026", upcoming: true },
  { id: "b2", name: "Bài kiểm tra ôn tập học kỳ", grade: "4", subject: "Toán", classAssigned: "4C năm học 2025 - 2026", lectureAssigned: "Tìm hiểu phân số", startAt: "20:00 15/06/2026" },
  { id: "b3", name: "Bài kiểm tra ôn tập", grade: "4", subject: "Tiếng Việt", classAssigned: "4A năm học 2025 - 2026", startAt: "20:00 15/06/2026" },
  { id: "b4", name: "Bài kiểm tra giữa kỳ", grade: "3", subject: "Toán", classAssigned: "4A năm học 2025 - 2026", startAt: "20:00 15/06/2026" },
  { id: "b5", name: "Bài kiểm tra cuối kỳ", grade: "4", subject: "Toán", classAssigned: "4A năm học 2025 - 2026", startAt: "20:00 15/06/2026" },
];

type TabKey = "de" | "bai";

function Page() {
  const [tab, setTab] = useState<TabKey>("de");
  const [tests, setTests] = useState<Test[]>(SEED);
  const [exams, setExams] = useState<Exam[]>(EXAM_SEED);
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [kind, setKind] = useState("");
  const [q, setQ] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [matrixOpen, setMatrixOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState<null | CreateKind>(null);
  const [shareOne, setShareOne] = useState<Test | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Test | null>(null);
  const [confirmDeleteExam, setConfirmDeleteExam] = useState<Exam | null>(null);
  const [assignFrom, setAssignFrom] = useState<Test | null>(null);
  const [examWizard, setExamWizard] = useState(false);

  const subjectOptions = grade ? (SUBJECTS_BY_GRADE[grade] ?? []) : [];
  const tree = useMemo(
    () => (grade && subject ? getKnowledgeTree(grade, subject) : []),
    [grade, subject],
  );
  const lessonsOfChapter = useMemo(
    () => tree.find((c) => c.id === chapterId)?.units ?? [],
    [tree, chapterId],
  );

  const filtered = useMemo(() => tests.filter((t) => {
    if (grade && t.grade !== grade) return false;
    if (subject && t.subject !== subject) return false;
    if (chapterId && t.chapterId !== chapterId) return false;
    if (lessonId && t.lessonId !== lessonId) return false;
    if (kind && t.kind !== (kind as CreateKind)) return false;
    if (q && !t.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [tests, grade, subject, chapterId, lessonId, kind, q]);

  const filteredExams = useMemo(() => exams.filter((e) => {
    if (grade && e.grade !== grade) return false;
    if (subject && e.subject !== subject) return false;
    if (q && !e.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [exams, grade, subject, q]);

  const toggle = (id: string) => setSelected((prev) => {
    const s = new Set(prev);
    if (s.has(id)) s.delete(id); else s.add(id);
    return s;
  });
  const toggleAll = () => setSelected((prev) =>
    prev.size === filtered.length ? new Set() : new Set(filtered.map((t) => t.id)));

  const enableSelectMode = () => { setSelectMode(true); setSelected(new Set()); };
  const exitSelectMode = () => { setSelectMode(false); setSelected(new Set()); };

  const duplicate = (t: Test) => {
    const copy: Test = { ...t, id: `e-${Date.now()}`, name: `${t.name} (sao chép)`, share: "" };
    setTests((prev) => [copy, ...prev]);
    toast.success("Đã sao chép đề");
  };

  const doShare = (t: Test) => {
    setTests((prev) => prev.map((x) => x.id === t.id ? { ...x, share: "pending" } : x));
    toast.success("Đã gửi đề xuất chia sẻ. Chờ tổ trưởng duyệt.");
    setShareOne(null);
  };

  const doDelete = (t: Test) => {
    setTests((prev) => prev.filter((x) => x.id !== t.id));
    toast.success("Đã xóa đề kiểm tra");
    setConfirmDelete(null);
  };

  const duplicateExam = (e: Exam) => {
    setExams((prev) => [{ ...e, id: `b-${Date.now()}`, name: `${e.name} (sao chép)` }, ...prev]);
    toast.success("Đã sao chép bài kiểm tra");
  };
  const doDeleteExam = (e: Exam) => {
    setExams((prev) => prev.filter((x) => x.id !== e.id));
    toast.success("Đã xóa bài kiểm tra");
    setConfirmDeleteExam(null);
  };

  return (
    <AppShell role="teacher">
      <section className="bg-white rounded-2xl border shadow-sm">
        {/* Header + actions */}
        <div className="px-5 pt-4 border-b">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-indigo-700" />
              <h2 className="text-lg font-bold text-slate-800">Đề & Bài kiểm tra</h2>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {tab === "de" && selectMode && selected.size > 0 && (
                <Button variant="outline" className="gap-1" onClick={() => toast.success("Đã gửi đề xuất lên kho Đề của trường")}>
                  <Upload className="h-4 w-4" /> Đề xuất lên kho Đề của trường
                </Button>
              )}
              {tab === "de" && selectMode ? (
                <Button variant="outline" onClick={exitSelectMode}>Hủy chọn</Button>
              ) : null}
              {tab === "de" ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-indigo-700 hover:bg-indigo-800 text-white gap-1">
                      <Plus className="h-4 w-4" /> Tạo mới <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => setCreateOpen("matrix")}>
                      <Grid3x3 className="h-4 w-4 mr-2 text-indigo-600" /> Tạo từ khung ma trận
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCreateOpen("manual")}>
                      <FileCheck2 className="h-4 w-4 mr-2 text-emerald-600" /> Tạo mới
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button className="bg-indigo-700 hover:bg-indigo-800 text-white gap-1" onClick={() => setExamWizard(true)}>
                  <Plus className="h-4 w-4" /> Thêm bài kiểm tra mới
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex items-center gap-1">
            {([
              { k: "de", label: "Đề kiểm tra" },
              { k: "bai", label: "Bài kiểm tra" },
            ] as { k: TabKey; label: string }[]).map((t) => (
              <button
                key={t.k}
                onClick={() => { setTab(t.k); exitSelectMode(); }}
                className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition ${
                  tab === t.k
                    ? "border-indigo-600 text-indigo-700"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="px-5 py-4 border-b bg-slate-50/50 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <Select value={grade} onValueChange={(v) => { setGrade(v); setSubject(""); setChapterId(""); setLessonId(""); }}>
              <SelectTrigger className="w-[130px] bg-white"><SelectValue placeholder="Khối" /></SelectTrigger>
              <SelectContent>
                {Object.keys(SUBJECTS_BY_GRADE).map((g) => <SelectItem key={g} value={g}>Khối {g}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={subject} onValueChange={(v) => { setSubject(v); setChapterId(""); setLessonId(""); }} disabled={!grade}>
              <SelectTrigger className="w-[150px] bg-white"><SelectValue placeholder="Môn học" /></SelectTrigger>
              <SelectContent>
                {subjectOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            {tab === "de" && (
              <>
                <Select value={chapterId} onValueChange={(v) => { setChapterId(v); setLessonId(""); }} disabled={!subject || tree.length === 0}>
                  <SelectTrigger className="w-[200px] bg-white"><SelectValue placeholder="Chương/Chủ đề" /></SelectTrigger>
                  <SelectContent>
                    {tree.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={lessonId} onValueChange={setLessonId} disabled={!chapterId}>
                  <SelectTrigger className="w-[200px] bg-white"><SelectValue placeholder="Bài học" /></SelectTrigger>
                  <SelectContent>
                    {lessonsOfChapter.map((u) => <SelectItem key={u.id} value={u.id}>{u.title}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={kind} onValueChange={setKind}>
                  <SelectTrigger className="w-[160px] bg-white"><SelectValue placeholder="Kiểu tạo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="matrix">Tạo từ khung ma trận</SelectItem>
                    <SelectItem value="manual">Tạo mới</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="h-4 w-4 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
              <Input value={q} onChange={(e) => setQ(e.target.value)}
                placeholder={tab === "de" ? "Tìm theo tên đề kiểm tra..." : "Tìm theo tên bài kiểm tra..."} className="pl-8 bg-white" />
            </div>
            {tab === "de" && (
              <Button variant="outline" className="gap-1 ml-auto" onClick={() => setMatrixOpen(true)}>
                <ListChecks className="h-4 w-4" /> Xem danh sách ma trận đề
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="p-5">
          {tab === "bai" ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-12 text-center">STT</TableHead>
                  <TableHead>Tên đề</TableHead>
                  <TableHead className="w-[90px]">Khối</TableHead>
                  <TableHead className="w-[110px]">Môn</TableHead>
                  <TableHead className="w-[180px]">Lớp gán</TableHead>
                  <TableHead className="w-[180px]">Bài giảng gán</TableHead>
                  <TableHead className="w-[160px]">Thời gian bắt đầu</TableHead>
                  <TableHead className="w-[100px] text-center">Thống kê</TableHead>
                  <TableHead className="w-[60px] text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExams.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-slate-500 py-8">
                      Chưa có bài kiểm tra nào được giao.
                    </TableCell>
                  </TableRow>
                )}
                {filteredExams.map((e, i) => (
                  <TableRow key={e.id} className="hover:bg-indigo-50/30">
                    <TableCell className="text-center text-slate-500">{i + 1}</TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-800 flex items-center gap-2">
                        {e.name}
                        {e.upcoming && (
                          <Badge className="text-[10px] bg-rose-100 text-rose-700 border border-rose-200">Sắp diễn ra</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-700">Khối {e.grade}</TableCell>
                    <TableCell className="text-slate-700">{e.subject}</TableCell>
                    <TableCell className="text-slate-700 text-sm">{e.classAssigned}</TableCell>
                    <TableCell className="text-slate-700 text-sm">{e.lectureAssigned ?? "—"}</TableCell>
                    <TableCell className="text-slate-700 text-sm whitespace-pre-line">
                      {e.startAt.split(" ").join("\n")}
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() => toast.success(`Xem thống kê: ${e.name}`)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-sky-50 text-sky-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => toast.message(`Sửa: ${e.name}`)}>
                            <FileCheck2 className="h-4 w-4 mr-2 text-slate-500" /> Sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicateExam(e)}>
                            <Copy className="h-4 w-4 mr-2 text-slate-500" /> Tạo bản sao
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-rose-600 focus:text-rose-700" onClick={() => setConfirmDeleteExam(e)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-12 text-center">STT</TableHead>
                {selectMode && (
                  <TableHead className="w-10">
                    <Checkbox
                      checked={filtered.length > 0 && selected.size === filtered.length}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                )}
                <TableHead>Tên đề</TableHead>
                <TableHead className="w-[90px]">Khối</TableHead>
                <TableHead className="w-[120px]">Môn</TableHead>
                <TableHead className="w-[110px]">Thời gian</TableHead>
                <TableHead className="w-[160px]">Số câu - Thang điểm</TableHead>
                <TableHead className="w-[110px] text-center">Giao bài</TableHead>
                <TableHead className="w-[60px] text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={selectMode ? 9 : 8} className="text-center text-slate-500 py-8">
                    Không có đề kiểm tra nào phù hợp.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((t, i) => (
                <TableRow key={t.id} className="hover:bg-indigo-50/30">
                  <TableCell className="text-center text-slate-500">{i + 1}</TableCell>
                  {selectMode && (
                    <TableCell>
                      <Checkbox
                        checked={selected.has(t.id)}
                        onCheckedChange={() => toggle(t.id)}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="font-medium text-slate-800">{t.name}</div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px]">
                        {t.kind === "matrix" ? "Ma trận" : "Tạo mới"}
                      </Badge>
                      {t.share === "pending" && (
                        <Badge className="text-[10px] bg-amber-100 text-amber-700 border border-amber-200">Chờ duyệt</Badge>
                      )}
                      {t.share === "approved" && (
                        <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border border-emerald-200">Đã duyệt</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-700">Khối {t.grade}</TableCell>
                  <TableCell className="text-slate-700">{t.subject}</TableCell>
                  <TableCell className="text-slate-700">{t.duration} phút</TableCell>
                  <TableCell className="text-slate-700">{t.questions} câu / {t.maxScore} điểm</TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => setAssignFrom(t)}
                    >
                      <Send className="h-3.5 w-3.5" /> Giao
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => duplicate(t)}>
                          <Copy className="h-4 w-4 mr-2 text-slate-500" /> Sao chép đề
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShareOne(t)}>
                          <Share2 className="h-4 w-4 mr-2 text-sky-600" /> Đề xuất chia sẻ
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={enableSelectMode}>
                          <CheckSquare className="h-4 w-4 mr-2 text-indigo-600" /> Chọn nhiều
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-rose-600 focus:text-rose-700" onClick={() => setConfirmDelete(t)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}

          {tab === "de" && selectMode && selected.size > 0 && (
            <div className="mt-3 text-sm text-slate-600">
              Đã chọn <b>{selected.size}</b> đề kiểm tra.{" "}
              <button
                className="text-rose-600 hover:underline"
                onClick={() => {
                  setTests((prev) => prev.filter((t) => !selected.has(t.id)));
                  setSelected(new Set());
                  toast.success("Đã xóa các đề đã chọn");
                }}
              >
                Xóa
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Matrix list dialog */}
      <Dialog open={matrixOpen} onOpenChange={setMatrixOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-indigo-600" /> Danh sách ma trận đề
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {[
              { name: "Ma trận cuối kỳ Toán 4", levels: 4, count: 20, grade: "4", subject: "Toán", minutes: 45 },
              { name: "Ma trận giữa kỳ Toán 3", levels: 3, count: 15, grade: "3", subject: "Toán", minutes: 40 },
              { name: "Ma trận Tiếng Việt 4 - Đọc hiểu", levels: 4, count: 12, grade: "4", subject: "Tiếng Việt", minutes: 35 },
              { name: "Ma trận Khoa học 4", levels: 3, count: 18, grade: "4", subject: "Khoa học", minutes: 45 },
            ].map((m) => (
              <div key={m.name} className="p-3 rounded-lg border hover:border-indigo-300 hover:bg-indigo-50/30 flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-800">{m.name}</div>
                  <div className="text-xs text-slate-500">
                    {m.levels} mức độ · {m.count} câu · Khối {m.grade} · {m.subject} · {m.minutes} phút
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => { setMatrixOpen(false); setCreateOpen("matrix"); }}>
                  Dùng
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Share confirm dialog */}
      <Dialog open={!!shareOne} onOpenChange={(o) => !o && setShareOne(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sky-700">Đề xuất chia sẻ lên kho Đề của trường</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Bạn xác nhận đề nghị chia sẻ đề <b>{shareOne?.name}</b> lên kho Đề của trường. Đề khi được duyệt có thể được sử dụng bởi các giáo viên khác trong trường.
          </p>
          <div className="text-sm text-slate-600">
            Người duyệt: <b className="text-slate-800">Cô Nguyễn Thị Hằng (Tổ trưởng tổ Toán)</b>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShareOne(null)}>Hủy</Button>
            <Button className="bg-sky-600 hover:bg-sky-700" onClick={() => shareOne && doShare(shareOne)}>
              Xác nhận
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm - Test */}
      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-rose-600">Xóa đề kiểm tra</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Bạn có chắc chắn muốn xóa đề <b>{confirmDelete?.name}</b>? Hành động này không thể hoàn tác.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Hủy</Button>
            <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => confirmDelete && doDelete(confirmDelete)}>
              Xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm - Exam */}
      <Dialog open={!!confirmDeleteExam} onOpenChange={(o) => !o && setConfirmDeleteExam(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-rose-600">Xóa bài kiểm tra</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Bạn có chắc chắn muốn xóa <b>{confirmDeleteExam?.name}</b>? Hành động này không thể hoàn tác.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDeleteExam(null)}>Hủy</Button>
            <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => confirmDeleteExam && doDeleteExam(confirmDeleteExam)}>
              Xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create dialog (demo) */}
      <Dialog open={createOpen !== null} onOpenChange={(o) => !o && setCreateOpen(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {createOpen === "matrix" ? "Tạo đề từ khung ma trận" : "Tạo đề mới"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            {createOpen === "matrix"
              ? "Chọn khung ma trận, hệ thống sẽ tự lấy câu hỏi từ Ngân hàng câu hỏi theo cấu trúc đã định nghĩa."
              : "Nhập thông tin cơ bản và tự chọn câu hỏi từ Ngân hàng câu hỏi để tạo đề mới."}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCreateOpen(null)}>Đóng</Button>
            <Button
              className="bg-indigo-700 hover:bg-indigo-800"
              onClick={() => {
                const t: Test = {
                  id: `e-${Date.now()}`,
                  name: createOpen === "matrix" ? "Đề mới từ ma trận" : "Đề tạo mới",
                  grade: "4", subject: "Toán",
                  kind: createOpen ?? "manual",
                  duration: 45, questions: 20, maxScore: 10,
                  share: "",
                };
                setTests((prev) => [t, ...prev]);
                setCreateOpen(null);
                toast.success("Đã tạo đề kiểm tra");
              }}
            >
              Tạo đề
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign-from-Đề popup */}
      <Dialog open={!!assignFrom} onOpenChange={(o) => !o && setAssignFrom(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chọn mục tiêu giao đề</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                toast.success(`Đã tạo Đề ôn tập từ: ${assignFrom?.name}`);
                setAssignFrom(null);
              }}
              className="text-left p-4 rounded-xl border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Giao bài tập - Đề ôn tập</div>
                  <div className="text-sm text-slate-500 mt-1">
                    Sử dụng đề <b>{assignFrom?.name}</b> để tạo Đề ôn tập
                  </div>
                </div>
              </div>
            </button>
            <button
              onClick={() => {
                setAssignFrom(null);
                setExamWizard(true);
              }}
              className="text-left p-4 rounded-xl border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 transition"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Tạo Bài kiểm tra</div>
                  <div className="text-sm text-slate-500 mt-1">
                    Sử dụng đề <b>{assignFrom?.name}</b> để tạo Bài kiểm tra cho học sinh
                  </div>
                </div>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Exam 3-step wizard */}
      <ExamWizard
        open={examWizard}
        onClose={() => setExamWizard(false)}
        onCreate={(name, gradeV, subjectV) => {
          setExams((prev) => [{
            id: `b-${Date.now()}`,
            name: name || "Bài kiểm tra mới",
            grade: gradeV || "4",
            subject: subjectV || "Toán",
            classAssigned: "4A năm học 2025 - 2026",
            startAt: "20:00 15/06/2026",
            upcoming: true,
          }, ...prev]);
          setExamWizard(false);
          setTab("bai");
          toast.success("Đã tạo bài kiểm tra");
        }}
      />
    </AppShell>
  );
}

/* ---------- Exam Wizard ---------- */

function ExamWizard({
  open, onClose, onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, grade: string, subject: string) => void;
}) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [assignedClass, setAssignedClass] = useState("");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [lesson, setLesson] = useState("");
  const [startAt, setStartAt] = useState("");
  const [duration, setDuration] = useState("");
  const [scoreType, setScoreType] = useState("");
  const [showAnswers, setShowAnswers] = useState(false);
  const [showScore, setShowScore] = useState(true);
  const [shuffle, setShuffle] = useState(true);
  const [gradeStep2, setGradeStep2] = useState("4");
  const [classStep2, setClassStep2] = useState("4A");
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());

  const subjects = grade ? (SUBJECTS_BY_GRADE[grade] ?? []) : [];
  const tree = useMemo(
    () => (grade && subject ? getKnowledgeTree(grade, subject) : []),
    [grade, subject],
  );
  const lessons = useMemo(
    () => tree.find((c) => c.id === chapter)?.units ?? [],
    [tree, chapter],
  );

  const reset = () => {
    setStep(1); setName(""); setAssignedClass(""); setGrade(""); setSubject("");
    setChapter(""); setLesson(""); setStartAt(""); setDuration(""); setScoreType("");
    setShowAnswers(false); setShowScore(true); setShuffle(true);
    setGradeStep2("4"); setClassStep2("4A"); setSelectedStudents(new Set());
  };

  const close = () => { reset(); onClose(); };

  const students = [
    { id: "01", code: "0123456783", name: "Nguyễn An", dob: "15/03/2015" },
    { id: "02", code: "0365427720", name: "Mai Huyền", dob: "02/07/2015" },
    { id: "03", code: "0123456787", name: "Trần Bảo", dob: "21/11/2015" },
    { id: "04", code: "0348844088", name: "Thanh Vân", dob: "08/05/2015" },
    { id: "05", code: "0335773123", name: "Vũ Huy Hoàng", dob: "30/09/2015" },
    { id: "06", code: "0912125548", name: "Phạm Tất Thắng", dob: "12/12/2015" },
    { id: "07", code: "0934778812", name: "Lê Minh Châu", dob: "04/02/2015" },
    { id: "08", code: "0978221190", name: "Hoàng Khánh Linh", dob: "19/06/2015" },
  ];

  const toggleStudent = (id: string) => setSelectedStudents((prev) => {
    const s = new Set(prev);
    if (s.has(id)) s.delete(id); else s.add(id);
    return s;
  });

  const canNext1 = name && grade && subject && duration && scoreType;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Tạo bài kiểm tra mới</DialogTitle>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center justify-between px-2 pt-2 pb-6 border-b">
          {[
            { n: 1, label: "Thông tin Bài kiểm tra" },
            { n: 2, label: "Nội dung Bài kiểm tra" },
            { n: 3, label: "Danh sách tham gia" },
          ].map((s, i) => (
            <div key={s.n} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= s.n ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                }`}>
                  {s.n}
                </div>
                <div className="mt-2 text-xs text-slate-500">BƯỚC {s.n}</div>
                <div className={`text-sm font-semibold mt-0.5 ${step === s.n ? "text-slate-800" : "text-slate-500"}`}>
                  {s.label}
                </div>
              </div>
              {i < 2 && <div className={`h-0.5 flex-1 -mt-10 ${step > s.n ? "bg-indigo-600" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-5 pt-4">
            <h3 className="font-semibold text-slate-800">Thông tin Bài kiểm tra</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Tên học liệu <span className="text-rose-500">*</span></label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Lớp gán</label>
                <Select value={assignedClass} onValueChange={setAssignedClass}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Chọn lớp" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4A">4A năm học 2025 - 2026</SelectItem>
                    <SelectItem value="4B">4B năm học 2025 - 2026</SelectItem>
                    <SelectItem value="4C">4C năm học 2025 - 2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Khối <span className="text-rose-500">*</span></label>
                <Select value={grade} onValueChange={(v) => { setGrade(v); setSubject(""); setChapter(""); setLesson(""); }}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Chọn" /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(SUBJECTS_BY_GRADE).map((g) => <SelectItem key={g} value={g}>Khối {g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Môn <span className="text-rose-500">*</span></label>
                <Select value={subject} onValueChange={(v) => { setSubject(v); setChapter(""); setLesson(""); }} disabled={!grade}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Chọn" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Chương/Chủ đề</label>
                <Select value={chapter} onValueChange={(v) => { setChapter(v); setLesson(""); }} disabled={!subject || tree.length === 0}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Chọn" /></SelectTrigger>
                  <SelectContent>
                    {tree.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Bài học</label>
                <Select value={lesson} onValueChange={setLesson} disabled={!chapter}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Chọn" /></SelectTrigger>
                  <SelectContent>
                    {lessons.map((u) => <SelectItem key={u.id} value={u.id}>{u.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Thời gian bắt đầu</label>
                <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Thời gian làm bài (phút) <span className="text-rose-500">*</span></label>
                <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Loại điểm <span className="text-rose-500">*</span></label>
                <Select value={scoreType} onValueChange={setScoreType}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Chọn" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mieng">Điểm miệng</SelectItem>
                    <SelectItem value="15p">Điểm 15 phút</SelectItem>
                    <SelectItem value="giuaky">Điểm giữa kỳ</SelectItem>
                    <SelectItem value="cuoiky">Điểm cuối kỳ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="pt-4 border-t">
              <h3 className="font-semibold text-slate-800 mb-3">Cấu hình Bài kiểm tra</h3>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-3 text-sm text-slate-700">
                  <Switch checked={showScore} onCheckedChange={setShowScore} /> Cho phép xem điểm sau khi nộp
                </label>
                <label className="flex items-center gap-3 text-sm text-slate-700">
                  <Switch checked={showAnswers} onCheckedChange={setShowAnswers} /> Cho phép xem đáp án sau khi nộp
                </label>
                <label className="flex items-center gap-3 text-sm text-slate-700">
                  <Switch checked={shuffle} onCheckedChange={setShuffle} /> Xáo trộn đề và câu hỏi ngẫu nhiên
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={close}>Đóng</Button>
              <Button className="bg-indigo-700 hover:bg-indigo-800" disabled={!canNext1} onClick={() => setStep(2)}>
                Tiếp theo
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Nội dung Bài kiểm tra</h3>
              <div className="flex items-center gap-3">
                <div className="text-sm text-slate-500">Thang điểm</div>
                <Input className="w-24" placeholder="10" />
                <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">0/10</span>
                <Button className="bg-indigo-700 hover:bg-indigo-800 gap-1">
                  <Plus className="h-4 w-4" /> Thêm câu hỏi
                </Button>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-12">STT</TableHead>
                    <TableHead>Câu hỏi</TableHead>
                    <TableHead className="w-[220px]">Đáp án</TableHead>
                    <TableHead className="w-20">Điểm</TableHead>
                    <TableHead className="w-24">Mức độ</TableHead>
                    <TableHead className="w-40">Loại câu hỏi</TableHead>
                    <TableHead className="w-28 text-center">Hoán vị đáp án</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>1</TableCell>
                    <TableCell className="text-slate-800">3000 + 210 = ?</TableCell>
                    <TableCell>
                      <div className="text-xs space-y-0.5">
                        <div className="px-2 py-1 rounded bg-emerald-50 text-emerald-700">A. 3.210 (đáp án đúng)</div>
                        <div className="px-2 py-1 text-slate-600">B. 3.120</div>
                        <div className="px-2 py-1 text-slate-600">C. 3.201</div>
                        <div className="px-2 py-1 text-slate-600">D. 3.021</div>
                      </div>
                    </TableCell>
                    <TableCell><Input className="w-16" defaultValue="1" /></TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-700 border border-amber-200">
                        Nhận biết
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-700">Trắc nghiệm nhiều đáp án</TableCell>
                    <TableCell className="text-center">
                      <Checkbox defaultChecked />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setStep(1)}>Quay lại</Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={close}>Đóng</Button>
                <Button className="bg-indigo-700 hover:bg-indigo-800" onClick={() => setStep(3)}>Tiếp theo</Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-4 pt-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-xs text-slate-500">Khối</div>
                    <Select value={gradeStep2} onValueChange={setGradeStep2}>
                      <SelectTrigger className="w-24 mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">Khối 3</SelectItem>
                        <SelectItem value="4">Khối 4</SelectItem>
                        <SelectItem value="5">Khối 5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Lớp</div>
                    <Select value={classStep2} onValueChange={setClassStep2}>
                      <SelectTrigger className="w-28 mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4A">Lớp 4A</SelectItem>
                        <SelectItem value="4B">Lớp 4B</SelectItem>
                        <SelectItem value="4C">Lớp 4C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="text-sm text-slate-500">Đã chọn: <b className="text-slate-800">{selectedStudents.size}</b> học sinh</div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-12">STT</TableHead>
                    <TableHead className="w-40">Mã định danh</TableHead>
                    <TableHead>Tên học sinh</TableHead>
                    <TableHead className="w-32">Ngày sinh</TableHead>
                    <TableHead className="w-12 text-center">
                      <Checkbox
                        checked={selectedStudents.size === students.length}
                        onCheckedChange={(v) => setSelectedStudents(v ? new Set(students.map((s) => s.id)) : new Set())}
                      />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="text-slate-500">{s.id}</TableCell>
                      <TableCell className="text-sm text-slate-700">{s.code}</TableCell>
                      <TableCell className="font-medium text-slate-800">{s.name}</TableCell>
                      <TableCell className="text-sm text-slate-600">{s.dob}</TableCell>
                      <TableCell className="text-center">
                        <Checkbox checked={selectedStudents.has(s.id)} onCheckedChange={() => toggleStudent(s.id)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setStep(2)}>Quay lại</Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                  onClick={() => { toast.success("Đã lưu nháp"); close(); }}
                >
                  Lưu nháp
                </Button>
                <Button
                  variant="outline"
                  className="border-sky-300 text-sky-700 hover:bg-sky-50"
                  onClick={() => toast.message("Xem trước bài kiểm tra")}
                >
                  <Eye className="h-4 w-4 mr-1" /> Xem trước
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => onCreate(name, grade, subject)}
                >
                  Tạo bài kiểm tra
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
