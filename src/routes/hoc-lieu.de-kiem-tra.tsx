import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  grade: string;         // "3" | "4"
  subject: string;       // "Toán" ...
  chapterId?: string;
  lessonId?: string;
  kind: CreateKind;
  duration: number;      // minutes
  questions: number;
  maxScore: number;
  share: ShareStatus;
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

type TabKey = "de" | "bai";

function Page() {
  const [tab, setTab] = useState<TabKey>("de");
  const [tests, setTests] = useState<Test[]>(SEED);
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
              {selectMode && selected.size > 0 && (
                <Button variant="outline" className="gap-1" onClick={() => toast.success("Đã gửi đề xuất lên kho Đề của trường")}>
                  <Upload className="h-4 w-4" /> Đề xuất lên kho Đề của trường
                </Button>
              )}
              {selectMode ? (
                <Button variant="outline" onClick={exitSelectMode}>Hủy chọn</Button>
              ) : null}
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
                onClick={() => setTab(t.k)}
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
            <div className="relative flex-1 min-w-[220px]">
              <Search className="h-4 w-4 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
              <Input value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm theo tên đề kiểm tra..." className="pl-8 bg-white" />
            </div>
            <Button variant="outline" className="gap-1 ml-auto" onClick={() => setMatrixOpen(true)}>
              <ListChecks className="h-4 w-4" /> Xem danh sách ma trận đề
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="p-5">
          {tab === "bai" ? (
            <div className="py-16 text-center text-slate-500">
              Chưa có bài kiểm tra nào được giao.
            </div>
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
                      onClick={() => toast.success(`Đã mở giao đề: ${t.name}`)}
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

          {selectMode && selected.size > 0 && (
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

      {/* Delete confirm */}
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
    </AppShell>
  );
}
