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
  FileCheck2, Plus, Search, Filter, FileDown, Upload, ChevronDown,
  Grid3x3, Send, ListChecks,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/hoc-lieu/de-kiem-tra")({
  head: () => ({ meta: [{ title: "Đề kiểm tra – Học liệu" }] }),
  component: Page,
});

/* ---------- Data ---------- */
type CreateKind = "matrix" | "manual";
type Test = {
  id: string;
  name: string;
  grade: string;         // "3" | "4"
  subject: string;       // "Toán" ...
  category: string;      // ĐVKT / danh mục
  kind: CreateKind;
  duration: number;      // minutes
  questions: number;
  maxScore: number;
};

const SUBJECTS_BY_GRADE: Record<string, string[]> = {
  "3": ["Toán", "Tiếng Việt", "Đạo đức"],
  "4": ["Toán", "Tiếng Việt", "Khoa học", "Đạo đức"],
  "5": ["Toán", "Tiếng Việt", "Khoa học"],
};
const CATS_BY_SUBJECT: Record<string, string[]> = {
  "Toán": ["Số học", "Hình học", "Đo lường", "Phân số"],
  "Tiếng Việt": ["Đọc hiểu", "Từ và câu", "Chính tả"],
  "Khoa học": ["Vật chất", "Sinh vật"],
  "Đạo đức": ["Kỹ năng sống"],
};

const SEED: Test[] = [
  { id: "e1", name: "Kiểm tra giữa kỳ – Cộng trừ phân số", grade: "4", subject: "Toán", category: "Phân số", kind: "matrix", duration: 45, questions: 20, maxScore: 10 },
  { id: "e2", name: "Kiểm tra 15 phút – Số tự nhiên", grade: "4", subject: "Toán", category: "Số học", kind: "manual", duration: 15, questions: 10, maxScore: 10 },
  { id: "e3", name: "Kiểm tra đọc hiểu – Cây bàng", grade: "4", subject: "Tiếng Việt", category: "Đọc hiểu", kind: "manual", duration: 30, questions: 12, maxScore: 10 },
  { id: "e4", name: "Kiểm tra cuối kỳ – Toán 3", grade: "3", subject: "Toán", category: "Số học", kind: "matrix", duration: 60, questions: 25, maxScore: 10 },
  { id: "e5", name: "Đề luyện – Hình học lớp 4", grade: "4", subject: "Toán", category: "Hình học", kind: "matrix", duration: 45, questions: 18, maxScore: 10 },
];

function Page() {
  const [tests, setTests] = useState<Test[]>(SEED);
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [kind, setKind] = useState("");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [matrixOpen, setMatrixOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState<null | CreateKind>(null);

  const filtered = useMemo(() => tests.filter((t) => {
    if (grade && t.grade !== grade) return false;
    if (subject && t.subject !== subject) return false;
    if (category && t.category !== category) return false;
    if (kind && t.kind !== (kind as CreateKind)) return false;
    if (q && !t.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [tests, grade, subject, category, kind, q]);

  const toggle = (id: string) => setSelected((prev) => {
    const s = new Set(prev);
    if (s.has(id)) s.delete(id); else s.add(id);
    return s;
  });
  const toggleAll = () => setSelected((prev) =>
    prev.size === filtered.length ? new Set() : new Set(filtered.map((t) => t.id)));

  const subjectOptions = grade ? (SUBJECTS_BY_GRADE[grade] ?? []) : [];
  const categoryOptions = subject ? (CATS_BY_SUBJECT[subject] ?? []) : [];

  return (
    <AppShell role="teacher">
      <section className="bg-white rounded-2xl border shadow-sm">
        {/* Header + actions */}
        <div className="px-5 py-4 flex items-center justify-between border-b flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-indigo-700" />
            <h2 className="text-lg font-bold text-slate-800">Đề kiểm tra</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" className="gap-1" onClick={() => toast.success("Đã xuất PDF (demo)")}>
              <FileDown className="h-4 w-4" /> Xuất PDF
            </Button>
            <Button variant="outline" className="gap-1" onClick={() => toast.success("Đã gửi đề xuất lên kho Đề của trường")}>
              <Upload className="h-4 w-4" /> Đề xuất lên kho Đề của trường
            </Button>
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

        {/* Filters */}
        <div className="px-5 py-4 border-b bg-slate-50/50 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <Select value={grade} onValueChange={(v) => { setGrade(v); setSubject(""); setCategory(""); }}>
              <SelectTrigger className="w-[140px] bg-white"><SelectValue placeholder="Khối" /></SelectTrigger>
              <SelectContent>
                {Object.keys(SUBJECTS_BY_GRADE).map((g) => <SelectItem key={g} value={g}>Khối {g}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={subject} onValueChange={(v) => { setSubject(v); setCategory(""); }} disabled={!grade}>
              <SelectTrigger className="w-[160px] bg-white"><SelectValue placeholder="Môn học" /></SelectTrigger>
              <SelectContent>
                {subjectOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory} disabled={!subject}>
              <SelectTrigger className="w-[200px] bg-white"><SelectValue placeholder="Danh mục kiến thức" /></SelectTrigger>
              <SelectContent>
                {categoryOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={kind} onValueChange={setKind}>
              <SelectTrigger className="w-[180px] bg-white"><SelectValue placeholder="Kiểu tạo" /></SelectTrigger>
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
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-12 text-center">STT</TableHead>
                <TableHead className="w-10">
                  <Checkbox
                    checked={filtered.length > 0 && selected.size === filtered.length}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Tên đề</TableHead>
                <TableHead className="w-[180px]">Khối - Môn</TableHead>
                <TableHead className="w-[110px]">Thời gian</TableHead>
                <TableHead className="w-[160px]">Số câu - Thang điểm</TableHead>
                <TableHead className="w-[110px] text-center">Giao bài</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                    Không có đề kiểm tra nào phù hợp.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((t, i) => (
                <TableRow key={t.id} className="hover:bg-indigo-50/30">
                  <TableCell className="text-center text-slate-500">{i + 1}</TableCell>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(t.id)}
                      onCheckedChange={() => toggle(t.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-800">{t.name}</div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px]">
                        {t.kind === "matrix" ? "Ma trận" : "Tạo mới"}
                      </Badge>
                      <span className="text-[11px] text-slate-500">• {t.category}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-700">Khối {t.grade} - {t.subject}</TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {selected.size > 0 && (
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
              { name: "Ma trận cuối kỳ Toán 4", info: "4 mức độ · 20 câu" },
              { name: "Ma trận giữa kỳ Toán 3", info: "3 mức độ · 15 câu" },
              { name: "Ma trận Tiếng Việt 4 - Đọc hiểu", info: "4 mức độ · 12 câu" },
              { name: "Ma trận Khoa học 4", info: "3 mức độ · 18 câu" },
            ].map((m) => (
              <div key={m.name} className="p-3 rounded-lg border hover:border-indigo-300 hover:bg-indigo-50/30 flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-800">{m.name}</div>
                  <div className="text-xs text-slate-500">{m.info}</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => { setMatrixOpen(false); setCreateOpen("matrix"); }}>
                  Dùng
                </Button>
              </div>
            ))}
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
                  grade: "4", subject: "Toán", category: "Số học",
                  kind: createOpen ?? "manual",
                  duration: 45, questions: 20, maxScore: 10,
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
