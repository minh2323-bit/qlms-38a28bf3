import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Search, Filter, FilterX, Columns3, Pencil, Download, Trash2, Database, RefreshCcw, ArrowUpDown, Check, GripVertical, Save,
} from "lucide-react";

export const Route = createFileRoute("/he-thong/danh-muc")({
  head: () => ({ meta: [{ title: "Danh mục – Hệ thống" }] }),
  component: Page,
});

type Tab = "mon-hoc" | "chuong-hoc" | "bai-hoc";
type Source = "school" | "system";

const GRADES = ["Khối 1", "Khối 2", "Khối 3", "Khối 4", "Khối 5"];
const SUBJECTS = ["Toán", "Tiếng Việt", "Đạo đức", "Tự nhiên và Xã hội", "Tiếng Anh", "Tin học", "STEM"];

/* ============================================================= */

type Subject = {
  id: string;
  grade: string;
  code: string;
  dbCode: string;
  name: string;
  visible: boolean;
  source: Source;
};

const SUBJECT_SEED: Subject[] = [
  { id: "s1", grade: "Khối 1", code: "0101", dbCode: "Toán (01)", name: "Toán", visible: true, source: "system" },
  { id: "s2", grade: "Khối 1", code: "0102", dbCode: "Tiếng Việt (02)", name: "Tiếng Việt", visible: true, source: "system" },
  { id: "s3", grade: "Khối 1", code: "0103", dbCode: "Đạo đức (03)", name: "Đạo đức", visible: true, source: "system" },
  { id: "s4", grade: "Khối 1", code: "0104", dbCode: "TN&XH (04)", name: "Tự nhiên và Xã hội", visible: true, source: "system" },
  { id: "s5", grade: "Khối 2", code: "0201", dbCode: "Toán (01)", name: "Toán", visible: true, source: "system" },
  { id: "s6", grade: "Khối 2", code: "0202", dbCode: "Tiếng Việt (02)", name: "Tiếng Việt", visible: true, source: "system" },
  { id: "s7", grade: "Khối 3", code: "0301", dbCode: "Toán (01)", name: "Toán", visible: true, source: "system" },
  { id: "s8", grade: "Khối 3", code: "0302", dbCode: "Tiếng Việt (02)", name: "Tiếng Việt", visible: true, source: "system" },
  { id: "s9", grade: "Khối 3", code: "0305", dbCode: "TA (05)", name: "Tiếng Anh", visible: false, source: "school" },
  { id: "s10", grade: "Khối 4", code: "0401", dbCode: "Toán (01)", name: "Toán", visible: true, source: "system" },
  { id: "s11", grade: "Khối 4", code: "0402", dbCode: "Tiếng Việt (02)", name: "Tiếng Việt", visible: true, source: "system" },
  { id: "s12", grade: "Khối 4", code: "0407", dbCode: "TH (07)", name: "Tin học", visible: true, source: "school" },
  { id: "s13", grade: "Khối 5", code: "0501", dbCode: "Toán (01)", name: "Toán", visible: true, source: "system" },
  { id: "s14", grade: "Khối 5", code: "0502", dbCode: "Tiếng Việt (02)", name: "Tiếng Việt", visible: true, source: "system" },
  { id: "s15", grade: "Khối 5", code: "0508", dbCode: "STEM (08)", name: "STEM", visible: false, source: "school" },
];

type Chapter = {
  id: string;
  grade: string;
  subject: string;
  code: string;
  name: string;
  visible: boolean;
  source: Source;
};

const CHAPTER_SEED: Chapter[] = [
  { id: "c1", grade: "Khối 1", subject: "Toán", code: "1", name: "Chủ đề 1: Các số đến 10", visible: true, source: "system" },
  { id: "c2", grade: "Khối 1", subject: "Toán", code: "2", name: "Chủ đề 2: Phép cộng, phép trừ trong phạm vi 10", visible: true, source: "system" },
  { id: "c3", grade: "Khối 1", subject: "Toán", code: "3", name: "Chủ đề 3: Các số trong phạm vi 100", visible: true, source: "system" },
  { id: "c4", grade: "Khối 1", subject: "Toán", code: "4", name: "Chủ đề 4: Phép cộng, phép trừ trong phạm vi 100", visible: true, source: "system" },
  { id: "c5", grade: "Khối 1", subject: "Toán", code: "5", name: "Ôn tập cuối học kì 1", visible: true, source: "system" },
  { id: "c6", grade: "Khối 1", subject: "Toán", code: "6", name: "Ôn tập cuối năm", visible: true, source: "system" },
  { id: "c7", grade: "Khối 1", subject: "Tiếng Việt", code: "1", name: "Chủ đề 1: Làm quen", visible: true, source: "system" },
  { id: "c8", grade: "Khối 4", subject: "Toán", code: "1", name: "Chủ đề 1: Số tự nhiên", visible: true, source: "system" },
  { id: "c9", grade: "Khối 4", subject: "Tiếng Việt", code: "1", name: "Tuổi thơ", visible: true, source: "system" },
];

type Lesson = {
  id: string;
  grade: string;
  subject: string;
  chapter: string;
  code: string;
  name: string;
  visible: boolean;
  source: Source;
};

const LESSON_SEED: Lesson[] = [
  { id: "l1", grade: "Khối 1", subject: "Toán", chapter: "Chủ đề 1: Các số đến 10", code: "1", name: "Trên - dưới. Phải - trái, trước - sau. Ở giữa", visible: true, source: "system" },
  { id: "l2", grade: "Khối 1", subject: "Toán", chapter: "Chủ đề 1: Các số đến 10", code: "2", name: "Hình vuông - hình tròn, hình tam giác - hình chữ nhật", visible: true, source: "system" },
  { id: "l3", grade: "Khối 1", subject: "Toán", chapter: "Chủ đề 1: Các số đến 10", code: "3", name: "Các số 1, 2, 3", visible: true, source: "system" },
  { id: "l4", grade: "Khối 1", subject: "Toán", chapter: "Chủ đề 1: Các số đến 10", code: "4", name: "Các số 4, 5, 6", visible: true, source: "system" },
  { id: "l5", grade: "Khối 1", subject: "Toán", chapter: "Chủ đề 1: Các số đến 10", code: "5", name: "Các số 7, 8, 9", visible: true, source: "system" },
  { id: "l6", grade: "Khối 1", subject: "Toán", chapter: "Chủ đề 1: Các số đến 10", code: "6", name: "Số 0", visible: true, source: "system" },
  { id: "l7", grade: "Khối 1", subject: "Toán", chapter: "Chủ đề 1: Các số đến 10", code: "7", name: "Số 10", visible: true, source: "system" },
  { id: "l8", grade: "Khối 1", subject: "Toán", chapter: "Chủ đề 1: Các số đến 10", code: "10", name: "Bé hơn, dấu <, Bằng nhau, dấu =", visible: true, source: "system" },
  { id: "l9", grade: "Khối 1", subject: "Toán", chapter: "Chủ đề 1: Các số đến 10", code: "11", name: "Luyện tập", visible: true, source: "system" },
  { id: "l10", grade: "Khối 1", subject: "Toán", chapter: "Chủ đề 1: Các số đến 10", code: "12", name: "Em ôn lại những gì đã học trang 27", visible: true, source: "system" },
];

/* ============================================================= */

function Page() {
  const [tab, setTab] = useState<Tab>("mon-hoc");

  return (
    <AppShell role="teacher">
      <div className="max-w-[1400px] mx-auto space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Danh mục</h1>
          <p className="text-sm text-slate-500">Quản lý danh mục Môn học, Chương học và Bài học của trường.</p>
        </div>

        <div className="inline-flex bg-white border rounded-xl p-1 shadow-sm">
          {[
            { id: "mon-hoc", label: "Môn học" },
            { id: "chuong-hoc", label: "Chương học" },
            { id: "bai-hoc", label: "Bài học" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as Tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
                tab === t.id ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "mon-hoc" && <MonHocPanel />}
        {tab === "chuong-hoc" && <ChuongHocPanel />}
        {tab === "bai-hoc" && <BaiHocPanel />}
      </div>
    </AppShell>
  );
}

/* ============================================================= */
/* Shared UI                                                      */
/* ============================================================= */

function SourceBadge({ source }: { source: Source }) {
  return source === "school" ? (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
      Trường tạo
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
      Từ hệ thống
    </span>
  );
}

function ActionBar({
  onAdd, showSort, onSort, sortMode, showStandardize,
}: {
  onAdd: () => void;
  showSort?: boolean;
  onSort?: () => void;
  sortMode?: boolean;
  showStandardize?: boolean;
}) {
  return (
    <div className="bg-white border rounded-xl px-4 py-3 flex items-center gap-2 flex-wrap">
      <button className="p-2 rounded-lg border text-slate-600 hover:bg-slate-50" title="Bộ lọc">
        <Filter className="h-4 w-4" />
      </button>
      <button className="p-2 rounded-lg border text-slate-600 hover:bg-slate-50" title="Xoá bộ lọc">
        <FilterX className="h-4 w-4" />
      </button>
      <div className="flex-1" />
      <button className="p-2 rounded-lg border text-slate-600 hover:bg-slate-50" title="Cột">
        <Columns3 className="h-4 w-4" />
      </button>
      {showSort && (
        <Button variant="outline" onClick={onSort} className={`border-sky-500 text-sky-600 hover:bg-sky-50 ${sortMode ? "bg-sky-50" : ""}`}>
          <ArrowUpDown className="h-4 w-4 mr-1.5" /> Sắp xếp
        </Button>
      )}
      <Button variant="outline" className="border-sky-500 text-sky-600 hover:bg-sky-50">
        <RefreshCcw className="h-4 w-4 mr-1.5" /> Lấy dữ liệu từ hệ thống
      </Button>
      {showStandardize && (
        <Button variant="outline" className="border-sky-500 text-sky-600 hover:bg-sky-50">
          <Database className="h-4 w-4 mr-1.5" /> Chuẩn hóa môn học
        </Button>
      )}
      <Button variant="outline" className="border-rose-500 text-rose-600 hover:bg-rose-50">
        <Trash2 className="h-4 w-4 mr-1.5" /> Xóa
      </Button>
      <Button onClick={onAdd} className="bg-sky-600 hover:bg-sky-700 text-white">Thêm mới</Button>
    </div>
  );
}

function FilterRow({ children, onExport }: { children: React.ReactNode; onExport?: () => void }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {children}
      <div className="flex-1" />
      <Button variant="outline" onClick={onExport} className="border-sky-500 text-sky-600 hover:bg-sky-50">
        <Download className="h-4 w-4 mr-1.5" /> Xuất excel
      </Button>
    </div>
  );
}

/* ============================================================= */
/* Môn học                                                        */
/* ============================================================= */

function MonHocPanel() {
  const [rows, setRows] = useState<Subject[]>(SUBJECT_SEED);
  const [grade, setGrade] = useState<string>("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortMode, setSortMode] = useState(false);
  const [sortDraft, setSortDraft] = useState<Subject[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [openAdd, setOpenAdd] = useState(false);

  const enterSort = () => { setSortDraft(rows); setSortMode(true); };
  const confirmSort = () => { setRows(sortDraft); setSortMode(false); };
  const cancelSort = () => setSortMode(false);

  const onDragStart = (id: string) => setDragId(id);
  const onDragOver = (e: React.DragEvent, overId: string) => {
    e.preventDefault();
    if (!dragId || dragId === overId) return;
    setSortDraft((prev) => {
      const from = prev.findIndex((r) => r.id === dragId);
      const to = prev.findIndex((r) => r.id === overId);
      if (from < 0 || to < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const source = sortMode ? sortDraft : rows;
  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return source.filter((r) => {
      if (grade !== "all" && r.grade !== grade) return false;
      if (kw && !r.name.toLowerCase().includes(kw)) return false;
      return true;
    });
  }, [source, grade, q]);

  const allChecked = filtered.length > 0 && filtered.every((r) => selected.has(r.id));
  const toggleAll = () => {
    const next = new Set(selected);
    if (allChecked) filtered.forEach((r) => next.delete(r.id));
    else filtered.forEach((r) => next.add(r.id));
    setSelected(next);
  };
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };
  const toggleVisible = (id: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, visible: !r.visible } : r)));
  };

  return (
    <div className="space-y-3">
      <ActionBar onAdd={() => setOpenAdd(true)} showSort onSort={enterSort} sortMode={sortMode} showStandardize />

      <FilterRow>
        <Select value={grade} onValueChange={setGrade}>
          <SelectTrigger className="w-56 bg-white"><SelectValue placeholder="Khối" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả khối</SelectItem>
            {GRADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm kiếm" className="pl-9 bg-white" />
        </div>
      </FilterRow>

      {sortMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
          <div className="text-sm text-amber-800">Kéo thả để sắp xếp lại thứ tự, sau đó nhấn <b>Xác nhận</b>.</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={cancelSort}>Hủy</Button>
            <Button onClick={confirmSort} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Check className="h-4 w-4 mr-1.5" /> Xác nhận
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-indigo-700 hover:bg-indigo-700">
              {sortMode && <TableHead className="text-white w-10"></TableHead>}
              <TableHead className="text-white text-center w-14">STT</TableHead>
              <TableHead className="text-white w-12"><Checkbox checked={allChecked} onCheckedChange={toggleAll} /></TableHead>
              <TableHead className="text-white w-16">Sửa</TableHead>
              <TableHead className="text-white">Khối</TableHead>
              <TableHead className="text-white text-right">Mã môn học</TableHead>
              <TableHead className="text-white">Mã môn học CSDL</TableHead>
              <TableHead className="text-white">Tên môn học</TableHead>
              <TableHead className="text-white text-center bg-indigo-800">Hiển thị</TableHead>
              <TableHead className="text-white text-center bg-indigo-800">Nguồn</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r, idx) => (
              <TableRow
                key={r.id}
                draggable={sortMode}
                onDragStart={() => onDragStart(r.id)}
                onDragOver={(e) => sortMode && onDragOver(e, r.id)}
                onDragEnd={() => setDragId(null)}
                className={`hover:bg-slate-50 ${sortMode ? "cursor-move" : ""} ${dragId === r.id ? "opacity-50" : ""}`}
              >
                {sortMode && <TableCell className="text-slate-400"><GripVertical className="h-4 w-4" /></TableCell>}
                <TableCell className="text-center">{idx + 1}</TableCell>
                <TableCell><Checkbox checked={selected.has(r.id)} onCheckedChange={() => toggleOne(r.id)} /></TableCell>
                <TableCell>
                  <button className="p-1.5 rounded-md border border-slate-200 hover:bg-slate-100 text-slate-600">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </TableCell>
                <TableCell>{r.grade}</TableCell>
                <TableCell className="text-right tabular-nums">{r.code}</TableCell>
                <TableCell>{r.dbCode}</TableCell>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell className="text-center"><Checkbox checked={r.visible} onCheckedChange={() => toggleVisible(r.id)} /></TableCell>
                <TableCell className="text-center"><SourceBadge source={r.source} /></TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={sortMode ? 10 : 9} className="text-center text-slate-500 py-8">Không có môn học phù hợp.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AddSubjectModal
        open={openAdd}
        onOpenChange={setOpenAdd}
        onSave={(s) => setRows((prev) => [...prev, { ...s, id: `s${Date.now()}`, source: "school" }])}
      />
    </div>
  );
}

function AddSubjectModal({
  open, onOpenChange, onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (s: Omit<Subject, "id" | "source">) => void;
}) {
  const [grade, setGrade] = useState("Khối 3");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [dbCode, setDbCode] = useState("");
  const [visible, setVisible] = useState(true);

  const submit = () => {
    if (!grade || !code || !name) return;
    onSave({ grade, code, name, dbCode, visible });
    onOpenChange(false);
    setCode(""); setName(""); setDbCode("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle className="text-sky-600">Thêm mới môn học</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <Label>Khối <span className="text-rose-500">*</span></Label>
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{GRADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Mã môn học <span className="text-rose-500">*</span></Label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Tên môn học <span className="text-rose-500">*</span></Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Môn học CSDL</Label>
            <Select value={dbCode} onValueChange={setDbCode}>
              <SelectTrigger><SelectValue placeholder="Chọn" /></SelectTrigger>
              <SelectContent>{SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-2 flex items-center gap-2 pt-1">
            <Switch checked={visible} onCheckedChange={setVisible} />
            <Label>Hiển thị</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
          <Button onClick={submit} className="bg-sky-600 hover:bg-sky-700 text-white">Ghi <Save className="h-4 w-4 ml-1.5" /></Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================= */
/* Chương học                                                     */
/* ============================================================= */

function ChuongHocPanel() {
  const [rows, setRows] = useState<Chapter[]>(CHAPTER_SEED);
  const [grade, setGrade] = useState("all");
  const [subject, setSubject] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openAdd, setOpenAdd] = useState(false);

  const filtered = useMemo(() => rows.filter((r) => {
    if (grade !== "all" && r.grade !== grade) return false;
    if (subject !== "all" && r.subject !== subject) return false;
    return true;
  }), [rows, grade, subject]);

  const allChecked = filtered.length > 0 && filtered.every((r) => selected.has(r.id));
  const toggleAll = () => {
    const next = new Set(selected);
    if (allChecked) filtered.forEach((r) => next.delete(r.id));
    else filtered.forEach((r) => next.add(r.id));
    setSelected(next);
  };
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };
  const toggleVisible = (id: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, visible: !r.visible } : r)));
  };

  return (
    <div className="space-y-3">
      <ActionBar onAdd={() => setOpenAdd(true)} />

      <FilterRow>
        <Select value={grade} onValueChange={setGrade}>
          <SelectTrigger className="w-48 bg-white"><SelectValue placeholder="Khối" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả khối</SelectItem>
            {GRADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={subject} onValueChange={setSubject}>
          <SelectTrigger className="w-48 bg-white"><SelectValue placeholder="Môn học" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả môn</SelectItem>
            {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </FilterRow>

      <div className="bg-white border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-indigo-700 hover:bg-indigo-700">
              <TableHead className="text-white text-center w-14">STT</TableHead>
              <TableHead className="text-white w-12"><Checkbox checked={allChecked} onCheckedChange={toggleAll} /></TableHead>
              <TableHead className="text-white w-16">Sửa</TableHead>
              <TableHead className="text-white">Khối</TableHead>
              <TableHead className="text-white">Môn học</TableHead>
              <TableHead className="text-white text-right">Mã chương mục</TableHead>
              <TableHead className="text-white">Tên chương mục</TableHead>
              <TableHead className="text-white text-center bg-indigo-800">Hiển thị</TableHead>
              <TableHead className="text-white text-center bg-indigo-800">Nguồn</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r, idx) => (
              <TableRow key={r.id} className="hover:bg-slate-50">
                <TableCell className="text-center">{idx + 1}</TableCell>
                <TableCell><Checkbox checked={selected.has(r.id)} onCheckedChange={() => toggleOne(r.id)} /></TableCell>
                <TableCell>
                  <button className="p-1.5 rounded-md border border-slate-200 hover:bg-slate-100 text-slate-600">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </TableCell>
                <TableCell>{r.grade}</TableCell>
                <TableCell>{r.subject}</TableCell>
                <TableCell className="text-right tabular-nums">{r.code}</TableCell>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell className="text-center"><Checkbox checked={r.visible} onCheckedChange={() => toggleVisible(r.id)} /></TableCell>
                <TableCell className="text-center"><SourceBadge source={r.source} /></TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={9} className="text-center text-slate-500 py-8">Không có chương học phù hợp.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AddChapterModal
        open={openAdd}
        onOpenChange={setOpenAdd}
        onSave={(c) => setRows((prev) => [...prev, { ...c, id: `c${Date.now()}`, source: "school" }])}
      />
    </div>
  );
}

function AddChapterModal({
  open, onOpenChange, onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (c: Omit<Chapter, "id" | "source">) => void;
}) {
  const [grade, setGrade] = useState("Khối 1");
  const [subject, setSubject] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [visible, setVisible] = useState(true);

  const submit = () => {
    if (!grade || !subject || !code || !name) return;
    onSave({ grade, subject, code, name, visible });
    onOpenChange(false);
    setCode(""); setName(""); setSubject("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle className="text-sky-600">Thêm mới chương mục</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <Label>Khối <span className="text-rose-500">*</span></Label>
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{GRADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Môn học <span className="text-rose-500">*</span></Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger><SelectValue placeholder="Chọn" /></SelectTrigger>
              <SelectContent>{SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Mã chương mục <span className="text-rose-500">*</span></Label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Tên chương mục <span className="text-rose-500">*</span></Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="col-span-2 flex items-center gap-2 pt-1">
            <Switch checked={visible} onCheckedChange={setVisible} />
            <Label>Hiển thị</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
          <Button onClick={submit} className="bg-sky-600 hover:bg-sky-700 text-white">Ghi <Save className="h-4 w-4 ml-1.5" /></Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================= */
/* Bài học                                                        */
/* ============================================================= */

function BaiHocPanel() {
  const [rows, setRows] = useState<Lesson[]>(LESSON_SEED);
  const [grade, setGrade] = useState("all");
  const [subject, setSubject] = useState("all");
  const [chapter, setChapter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openAdd, setOpenAdd] = useState(false);

  const chapters = useMemo(() => Array.from(new Set(CHAPTER_SEED.map((c) => c.name))), []);

  const filtered = useMemo(() => rows.filter((r) => {
    if (grade !== "all" && r.grade !== grade) return false;
    if (subject !== "all" && r.subject !== subject) return false;
    if (chapter !== "all" && r.chapter !== chapter) return false;
    return true;
  }), [rows, grade, subject, chapter]);

  const allChecked = filtered.length > 0 && filtered.every((r) => selected.has(r.id));
  const toggleAll = () => {
    const next = new Set(selected);
    if (allChecked) filtered.forEach((r) => next.delete(r.id));
    else filtered.forEach((r) => next.add(r.id));
    setSelected(next);
  };
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };
  const toggleVisible = (id: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, visible: !r.visible } : r)));
  };

  return (
    <div className="space-y-3">
      <ActionBar onAdd={() => setOpenAdd(true)} />

      <FilterRow>
        <Select value={grade} onValueChange={setGrade}>
          <SelectTrigger className="w-40 bg-white"><SelectValue placeholder="Khối" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả khối</SelectItem>
            {GRADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={subject} onValueChange={setSubject}>
          <SelectTrigger className="w-44 bg-white"><SelectValue placeholder="Môn học" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả môn</SelectItem>
            {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={chapter} onValueChange={setChapter}>
          <SelectTrigger className="w-64 bg-white"><SelectValue placeholder="Chương mục" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả chương mục</SelectItem>
            {chapters.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </FilterRow>

      <div className="bg-white border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-indigo-700 hover:bg-indigo-700">
              <TableHead className="text-white text-center w-14">STT</TableHead>
              <TableHead className="text-white w-12"><Checkbox checked={allChecked} onCheckedChange={toggleAll} /></TableHead>
              <TableHead className="text-white w-16">Sửa</TableHead>
              <TableHead className="text-white">Khối</TableHead>
              <TableHead className="text-white">Môn học</TableHead>
              <TableHead className="text-white text-right">Mã chương mục</TableHead>
              <TableHead className="text-white">Tên chương mục</TableHead>
              <TableHead className="text-white text-right">Mã bài học</TableHead>
              <TableHead className="text-white">Tên bài học</TableHead>
              <TableHead className="text-white text-center bg-indigo-800">Hiển thị</TableHead>
              <TableHead className="text-white text-center bg-indigo-800">Nguồn</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r, idx) => {
              const chapterCode = CHAPTER_SEED.find((c) => c.name === r.chapter)?.code ?? "";
              return (
                <TableRow key={r.id} className="hover:bg-slate-50">
                  <TableCell className="text-center">{idx + 1}</TableCell>
                  <TableCell><Checkbox checked={selected.has(r.id)} onCheckedChange={() => toggleOne(r.id)} /></TableCell>
                  <TableCell>
                    <button className="p-1.5 rounded-md border border-slate-200 hover:bg-slate-100 text-slate-600">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </TableCell>
                  <TableCell>{r.grade}</TableCell>
                  <TableCell>{r.subject}</TableCell>
                  <TableCell className="text-right tabular-nums">{chapterCode}</TableCell>
                  <TableCell>{r.chapter}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.code}</TableCell>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="text-center"><Checkbox checked={r.visible} onCheckedChange={() => toggleVisible(r.id)} /></TableCell>
                  <TableCell className="text-center"><SourceBadge source={r.source} /></TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={11} className="text-center text-slate-500 py-8">Không có bài học phù hợp.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AddLessonModal
        open={openAdd}
        onOpenChange={setOpenAdd}
        chapters={chapters}
        onSave={(l) => setRows((prev) => [...prev, { ...l, id: `l${Date.now()}`, source: "school" }])}
      />
    </div>
  );
}

function AddLessonModal({
  open, onOpenChange, chapters, onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  chapters: string[];
  onSave: (l: Omit<Lesson, "id" | "source">) => void;
}) {
  const [grade, setGrade] = useState("Khối 1");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [visible, setVisible] = useState(true);

  const submit = () => {
    if (!grade || !subject || !chapter || !code || !name) return;
    onSave({ grade, subject, chapter, code, name, visible });
    onOpenChange(false);
    setSubject(""); setChapter(""); setCode(""); setName("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle className="text-sky-600">Thêm mới bài học</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <Label>Khối <span className="text-rose-500">*</span></Label>
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{GRADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Môn học <span className="text-rose-500">*</span></Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger><SelectValue placeholder="Chọn" /></SelectTrigger>
              <SelectContent>{SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label>Chương mục <span className="text-rose-500">*</span></Label>
            <Select value={chapter} onValueChange={setChapter}>
              <SelectTrigger><SelectValue placeholder="Chọn" /></SelectTrigger>
              <SelectContent>{chapters.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Mã bài học <span className="text-rose-500">*</span></Label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Tên bài học <span className="text-rose-500">*</span></Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="col-span-2 flex items-center gap-2 pt-1">
            <Switch checked={visible} onCheckedChange={setVisible} />
            <Label>Hiển thị</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
          <Button onClick={submit} className="bg-sky-600 hover:bg-sky-700 text-white">Ghi <Save className="h-4 w-4 ml-1.5" /></Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
