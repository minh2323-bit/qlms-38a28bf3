import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Plus, Trash2, Share2, Search, Pencil, X, ChevronDown,
  CircleDot, CheckSquare, FileText, Move, TextCursorInput, Link2, ToggleLeft,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export const Route = createFileRoute("/hoc-lieu/ngan-hang-cau-hoi")({
  head: () => ({
    meta: [
      { title: "Ngân hàng câu hỏi – Học liệu & Bài kiểm tra | Tiểu học Tô Hiệu" },
      { name: "description", content: "Ngân hàng câu hỏi của giáo viên." },
    ],
  }),
  component: NganHangCauHoiPage,
});

type QType = "single" | "multiple" | "essay" | "truefalse" | "drag" | "fill" | "match";
type Level = "Nhận biết" | "Thông hiểu" | "Vận dụng" | "Vận dụng cao";

type Answer = { text: string; correct: boolean };
type TFItem = { text: string; correct: boolean };
type Question = {
  id: string;
  content: string;
  type: QType;
  level: Level;
  source: string;
  updatedAt: string;
  grade?: string;
  subject?: string;
  chapter?: string;
  answers?: Answer[];
  tfTitle?: string;
  tfItems?: TFItem[];
};

const TYPE_LABEL: Record<QType, string> = {
  single: "Trắc nghiệm 1 đáp án",
  multiple: "Trắc nghiệm nhiều đáp án",
  essay: "Tự luận",
  truefalse: "Đúng - Sai",
  drag: "Kéo thả",
  fill: "Điền khuyết",
  match: "Nối",
};

const LEVELS: Level[] = ["Nhận biết", "Thông hiểu", "Vận dụng", "Vận dụng cao"];

const SEED: Question[] = [
  {
    id: "q1", content: "Số nào lớn nhất trong các số sau: 3 210, 3 120, 3 201, 3 102?",
    type: "single", level: "Nhận biết", source: "Phùng Thúy Hằng", updatedAt: "12/06/2026",
    grade: "4", subject: "Toán", chapter: "ch1",
    answers: [
      { text: "3 210", correct: true },
      { text: "3 120", correct: false },
      { text: "3 201", correct: false },
      { text: "3 102", correct: false },
    ],
  },
  {
    id: "q2", content: "Chọn các phân số bằng 1/2:",
    type: "multiple", level: "Thông hiểu", source: "Kho nội bộ · Nguyễn Văn A", updatedAt: "20/05/2026",
    grade: "4", subject: "Toán",
    answers: [
      { text: "2/4", correct: true }, { text: "3/6", correct: true },
      { text: "2/3", correct: false }, { text: "5/10", correct: true },
    ],
  },
  {
    id: "q3", content: "Trình bày cách tìm hai số khi biết tổng và hiệu của chúng.",
    type: "essay", level: "Vận dụng", source: "Phùng Thúy Hằng", updatedAt: "02/06/2026",
    grade: "4", subject: "Toán",
  },
  {
    id: "q4", content: "Các phát biểu sau đúng hay sai?",
    type: "truefalse", level: "Nhận biết", source: "Phùng Thúy Hằng", updatedAt: "28/06/2026",
    grade: "4", subject: "Toán",
    tfTitle: "Xét các mệnh đề về số tự nhiên",
    tfItems: [
      { text: "Số 0 là số tự nhiên bé nhất.", correct: true },
      { text: "Mọi số chẵn đều chia hết cho 4.", correct: false },
      { text: "Số 1 vừa là số nguyên tố vừa là hợp số.", correct: false },
    ],
  },
];

function today() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function TypeIcon({ type }: { type: QType }) {
  const map = {
    single: <CircleDot className="h-4 w-4 text-indigo-600" />,
    multiple: <CheckSquare className="h-4 w-4 text-violet-600" />,
    essay: <FileText className="h-4 w-4 text-amber-600" />,
    truefalse: <ToggleLeft className="h-4 w-4 text-emerald-600" />,
    drag: <Move className="h-4 w-4 text-sky-600" />,
    fill: <TextCursorInput className="h-4 w-4 text-teal-600" />,
    match: <Link2 className="h-4 w-4 text-rose-600" />,
  } as const;
  return map[type];
}

function NganHangCauHoiPage() {
  const [items, setItems] = useState<Question[]>(SEED);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [keyword, setKeyword] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<string>("all");

  const [pickType, setPickType] = useState(false);
  const [fromFile, setFromFile] = useState(false);
  const [creating, setCreating] = useState<QType | null>(null);
  const [viewing, setViewing] = useState<Question | null>(null);

  const filtered = useMemo(() => {
    return items.filter((q) => {
      if (keyword && !q.content.toLowerCase().includes(keyword.toLowerCase())) return false;
      if (filterType !== "all" && q.type !== filterType) return false;
      if (filterLevel !== "all" && q.level !== filterLevel) return false;
      return true;
    });
  }, [items, keyword, filterType, filterLevel]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((q) => q.id)));
  };

  const removeSelected = () => {
    if (selected.size === 0) return toast.error("Chưa chọn câu hỏi nào");
    setItems((prev) => prev.filter((q) => !selected.has(q.id)));
    setSelected(new Set());
    toast.success("Đã xóa câu hỏi đã chọn");
  };
  const shareSelected = () => {
    if (selected.size === 0) return toast.error("Chưa chọn câu hỏi nào");
    toast.success(`Đã chia sẻ ${selected.size} câu hỏi lên kho nội bộ`);
  };

  const handleCreated = (q: Question) => {
    setItems((prev) => [q, ...prev]);
    setCreating(null);
    toast.success("Đã thêm câu hỏi mới");
  };

  return (
    <AppShell>
      <div className="bg-white rounded-2xl border shadow-sm">
        {/* Header + action buttons */}
        <div className="p-4 flex items-center justify-between border-b">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Ngân hàng câu hỏi</h1>
            <p className="text-xs text-slate-500 mt-0.5">Quản lý câu hỏi để sử dụng trong bài kiểm tra và bài tập.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={removeSelected} className="gap-1.5">
              <Trash2 className="h-4 w-4" /> Xóa
            </Button>
            <Button variant="outline" onClick={shareSelected} className="gap-1.5">
              <Share2 className="h-4 w-4" /> Chia sẻ
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-1.5 bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4" /> Thêm mới <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => toast.info("Mở Kho chia sẻ...")}>
                  Thêm từ Kho chia sẻ
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFromFile(true)}>
                  Thêm từ tệp
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setPickType(true)}>
                  Thêm mới
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Filter */}
        <div className="p-4 flex flex-wrap items-center gap-3 border-b bg-slate-50/60">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo nội dung câu hỏi..."
              className="pl-8 bg-white"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-52 bg-white"><SelectValue placeholder="Loại câu hỏi" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại câu hỏi</SelectItem>
              {(Object.keys(TYPE_LABEL) as QType[]).map((k) => (
                <SelectItem key={k} value={k}>{TYPE_LABEL[k]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterLevel} onValueChange={setFilterLevel}>
            <SelectTrigger className="w-48 bg-white"><SelectValue placeholder="Mức độ nhận thức" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả mức độ</SelectItem>
              {LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="ml-auto text-xs text-slate-500">
            Đã chọn <span className="font-semibold text-slate-700">{selected.size}</span> / {filtered.length}
          </div>
        </div>

        {/* Table */}
        <div className="p-2">
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
                <TableHead>Câu hỏi</TableHead>
                <TableHead className="w-52">Loại câu hỏi</TableHead>
                <TableHead className="w-40">Mức độ nhận thức</TableHead>
                <TableHead className="w-48">Nguồn</TableHead>
                <TableHead className="w-36">Ngày cập nhật cuối</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((q, i) => (
                <TableRow key={q.id} className="hover:bg-indigo-50/40">
                  <TableCell className="text-center text-slate-500">{i + 1}</TableCell>
                  <TableCell>
                    <Checkbox checked={selected.has(q.id)} onCheckedChange={() => toggle(q.id)} />
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => setViewing(q)}
                      className="text-left text-slate-800 hover:text-indigo-700 hover:underline line-clamp-2 cursor-pointer"
                    >
                      {q.content}
                    </button>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-700">
                      <TypeIcon type={q.type} /> {TYPE_LABEL[q.type]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-700 border border-amber-200">
                      {q.level}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{q.source}</TableCell>
                  <TableCell className="text-sm text-slate-600">{q.updatedAt}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-slate-500 py-10">
                    Không có câu hỏi phù hợp.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pick type modal */}
      <PickTypeModal
        open={pickType}
        onClose={() => setPickType(false)}
        onPick={(t) => { setPickType(false); setCreating(t); }}
      />

      {/* From file modal */}
      <FromFileModal open={fromFile} onClose={() => setFromFile(false)} />

      {/* Create modal (single/multiple/truefalse and others fallback single form) */}
      {creating && (
        <CreateQuestionModal
          type={creating}
          onClose={() => setCreating(null)}
          onSave={handleCreated}
        />
      )}

      {/* View question modal */}
      {viewing && (
        <ViewQuestionModal
          question={viewing}
          onClose={() => setViewing(null)}
          onEdit={() => { setCreating(viewing.type); setViewing(null); }}
        />
      )}
    </AppShell>
  );
}

/* ─────────────────  Pick type modal (ảnh 1)  ───────────────── */
function PickTypeModal({
  open, onClose, onPick,
}: { open: boolean; onClose: () => void; onPick: (t: QType) => void }) {
  const options: { key: QType; title: string; desc: string; Icon: typeof CircleDot; bg: string; color: string }[] = [
    { key: "single", title: "Trắc nghiệm 1 đáp án", desc: "Chọn 1 phương án đúng", Icon: CircleDot, bg: "bg-indigo-50", color: "text-indigo-600" },
    { key: "multiple", title: "Trắc nghiệm nhiều đáp án", desc: "Chọn nhiều phương án đúng", Icon: CheckSquare, bg: "bg-violet-50", color: "text-violet-600" },
    { key: "essay", title: "Tự luận", desc: "Học sinh trả lời tự luận", Icon: FileText, bg: "bg-amber-50", color: "text-amber-600" },
    { key: "truefalse", title: "Đúng - Sai", desc: "Chọn Đ hoặc S cho từng mệnh đề", Icon: ToggleLeft, bg: "bg-emerald-50", color: "text-emerald-600" },
    { key: "drag", title: "Kéo thả", desc: "Sắp xếp các mục theo thứ tự", Icon: Move, bg: "bg-sky-50", color: "text-sky-600" },
    { key: "fill", title: "Điền khuyết", desc: "Điền từ vào chỗ trống", Icon: TextCursorInput, bg: "bg-teal-50", color: "text-teal-600" },
    { key: "match", title: "Nối", desc: "Nối các đáp án tương ứng", Icon: Link2, bg: "bg-rose-50", color: "text-rose-600" },
  ];
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-indigo-700">Chọn dạng câu hỏi</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-3">
          {options.map(({ key, title, desc, Icon, bg, color }) => (
            <button
              key={key}
              onClick={() => onPick(key)}
              className="text-left rounded-xl border border-slate-200 p-4 hover:border-indigo-400 hover:shadow-md transition cursor-pointer"
            >
              <span className={`inline-flex h-11 w-11 rounded-xl items-center justify-center ${bg} mb-3`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </span>
              <div className="font-semibold text-slate-800 text-sm">{title}</div>
              <div className="text-xs text-slate-500 mt-1">{desc}</div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────────  From file modal (ảnh 2)  ───────────────── */
function FromFileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-indigo-700">Thêm câu hỏi từ tệp</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {[
            { i: 1, label: "Word dạng bảng" },
            { i: 2, label: "Excel câu hỏi text" },
          ].map((o) => (
            <button
              key={o.i}
              onClick={() => { toast.info(`Chọn tệp ${o.label}...`); onClose(); }}
              className="w-full flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:border-indigo-400 hover:bg-indigo-50/40 transition text-left cursor-pointer"
            >
              <span className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-semibold text-sm">
                {o.i}.
              </span>
              <span className="text-sm text-slate-700 font-medium">{o.label}</span>
            </button>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────────  Create question modal (ảnh 3)  ───────────────── */
function CreateQuestionModal({
  type, onClose, onSave,
}: { type: QType; onClose: () => void; onSave: (q: Question) => void }) {
  const [grade, setGrade] = useState("4");
  const [subject, setSubject] = useState("Toán");
  const [chapter, setChapter] = useState("");
  const [level, setLevel] = useState<Level>("Nhận biết");
  const [content, setContent] = useState("");
  const [shuffle, setShuffle] = useState(true);

  // multiple-choice answers
  const [answers, setAnswers] = useState<Answer[]>([
    { text: "", correct: false }, { text: "", correct: false },
    { text: "", correct: false }, { text: "", correct: false },
  ]);

  // true/false
  const [tfTitle, setTfTitle] = useState("");
  const [tfItems, setTfItems] = useState<TFItem[]>([
    { text: "", correct: true },
    { text: "", correct: true },
    { text: "", correct: true },
  ]);

  const isSingle = type === "single";
  const isMultiple = type === "multiple";
  const isTF = type === "truefalse";
  const isChoice = isSingle || isMultiple;

  const setAnswer = (idx: number, patch: Partial<Answer>) => {
    setAnswers((prev) => prev.map((a, i) => {
      if (i !== idx) {
        // radio behavior for single: uncheck others
        if (isSingle && patch.correct === true) return { ...a, correct: false };
        return a;
      }
      return { ...a, ...patch };
    }));
  };
  const addAnswer = () => setAnswers((p) => [...p, { text: "", correct: false }]);
  const removeAnswer = (i: number) => setAnswers((p) => p.filter((_, idx) => idx !== i));

  const setTf = (i: number, patch: Partial<TFItem>) =>
    setTfItems((prev) => prev.map((t, idx) => idx === i ? { ...t, ...patch } : t));
  const addTf = () => setTfItems((p) => [...p, { text: "", correct: true }]);
  const removeTf = (i: number) => setTfItems((p) => p.filter((_, idx) => idx !== i));

  const submit = () => {
    if (!grade || !subject) return toast.error("Vui lòng chọn Khối và Môn học");
    if (isTF && !tfTitle.trim()) return toast.error("Nhập tiêu đề nhóm câu hỏi Đúng - Sai");
    if (!isTF && !content.trim()) return toast.error("Nhập nội dung câu hỏi");
    if (isChoice && answers.filter((a) => a.text.trim()).length < 2) {
      return toast.error("Cần ít nhất 2 phương án trả lời");
    }
    if (isChoice && !answers.some((a) => a.correct)) {
      return toast.error("Chọn ít nhất 1 đáp án đúng");
    }

    const q: Question = {
      id: `q_${Date.now()}`,
      content: isTF ? tfTitle : content,
      type,
      level,
      source: "Phùng Thúy Hằng",
      updatedAt: today(),
      grade, subject, chapter,
      answers: isChoice ? answers.filter((a) => a.text.trim()) : undefined,
      tfTitle: isTF ? tfTitle : undefined,
      tfItems: isTF ? tfItems.filter((t) => t.text.trim()) : undefined,
    };
    onSave(q);
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-6xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-indigo-700">Thêm mới · {TYPE_LABEL[type]}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-12 gap-6">
          {/* Left column */}
          <div className="col-span-4 space-y-4">
            <div>
              <Label className="text-sm">Khối học <span className="text-rose-500">*</span></Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["1","2","3","4","5"].map((g) => <SelectItem key={g} value={g}>Khối {g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Môn học <span className="text-rose-500">*</span></Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Toán","Tiếng Việt","Tiếng Anh","Tự nhiên và Xã hội","Đạo đức"].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Chương học <span className="text-rose-500">*</span></Label>
              <Select value={chapter} onValueChange={setChapter}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Chọn chương" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ch1">Số và Phép tính – Số tự nhiên</SelectItem>
                  <SelectItem value="ch2">Số và Phép tính – Phân số</SelectItem>
                  <SelectItem value="ch3">Hình học và Đo lường</SelectItem>
                  <SelectItem value="ch4">Một số yếu tố Thống kê</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Chia sẻ nội bộ</Label>
              <Select defaultValue="none">
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không chia sẻ</SelectItem>
                  <SelectItem value="school">Chia sẻ toàn trường</SelectItem>
                  <SelectItem value="group">Chia sẻ tổ chuyên môn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right column */}
          <div className="col-span-8 space-y-4">
            {/* Level tabs */}
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">
                  {isTF ? "Tiêu đề nhóm câu hỏi" : "Nội dung câu hỏi"} <span className="text-rose-500">*</span>
                </Label>
                <div className="flex gap-1">
                  {LEVELS.map((l) => (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                        level === l ? "bg-indigo-600 text-white shadow" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              {isTF ? (
                <Input
                  value={tfTitle}
                  onChange={(e) => setTfTitle(e.target.value)}
                  placeholder="Ví dụ: Xét tính đúng - sai của các mệnh đề sau..."
                  className="mt-2"
                />
              ) : (
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Nhập nội dung câu hỏi..."
                  className="mt-2 min-h-[120px]"
                />
              )}
            </div>

            {/* Answers area */}
            {isChoice && (
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Label className="text-sm">Câu trả lời <span className="text-rose-500">*</span></Label>
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input type="checkbox" checked={shuffle} onChange={(e) => setShuffle(e.target.checked)} className="accent-indigo-600" />
                    Hoán vị đáp án
                  </label>
                </div>
                <div className="space-y-2">
                  {answers.map((a, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-6 text-sm font-semibold text-slate-600">{String.fromCharCode(65 + i)}.</span>
                      {isSingle ? (
                        <input
                          type="radio"
                          checked={a.correct}
                          onChange={() => setAnswer(i, { correct: true })}
                          className="accent-indigo-600 h-4 w-4"
                        />
                      ) : (
                        <input
                          type="checkbox"
                          checked={a.correct}
                          onChange={(e) => setAnswer(i, { correct: e.target.checked })}
                          className="accent-indigo-600 h-4 w-4"
                        />
                      )}
                      <Input
                        value={a.text}
                        onChange={(e) => setAnswer(i, { text: e.target.value })}
                        placeholder={`Phương án ${String.fromCharCode(65 + i)}`}
                      />
                      <button onClick={() => removeAnswer(i)} className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" onClick={addAnswer} className="mt-3 gap-1.5">
                  <Plus className="h-4 w-4" /> Thêm câu trả lời
                </Button>
              </div>
            )}

            {isTF && (
              <div>
                <Label className="text-sm mb-2 block">Các mệnh đề <span className="text-rose-500">*</span></Label>
                <div className="space-y-2">
                  {tfItems.map((t, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-6 text-sm font-semibold text-slate-600">{i + 1}.</span>
                      <Input
                        value={t.text}
                        onChange={(e) => setTf(i, { text: e.target.value })}
                        placeholder="Nhập mệnh đề..."
                        className="flex-1"
                      />
                      <div className="flex items-center gap-1 border rounded-md overflow-hidden">
                        <button
                          onClick={() => setTf(i, { correct: true })}
                          className={`px-3 py-1.5 text-xs font-semibold cursor-pointer transition ${
                            t.correct ? "bg-emerald-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
                          }`}
                        >Đ</button>
                        <button
                          onClick={() => setTf(i, { correct: false })}
                          className={`px-3 py-1.5 text-xs font-semibold cursor-pointer transition ${
                            !t.correct ? "bg-rose-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
                          }`}
                        >S</button>
                      </div>
                      <button onClick={() => removeTf(i)} className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" onClick={addTf} className="mt-3 gap-1.5">
                  <Plus className="h-4 w-4" /> Thêm mệnh đề
                </Button>
              </div>
            )}

            {!isChoice && !isTF && (
              <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 bg-slate-50">
                Dạng câu hỏi <span className="font-semibold text-slate-700">{TYPE_LABEL[type]}</span> – nội dung sẽ được cấu hình trong biên tập chi tiết.
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Đóng</Button>
          <Button onClick={submit} className="bg-indigo-600 hover:bg-indigo-700">Ghi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────────  View question modal  ───────────────── */
function ViewQuestionModal({
  question, onClose, onEdit,
}: { question: Question; onClose: () => void; onEdit: () => void }) {
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="text-indigo-700">Chi tiết câu hỏi</DialogTitle>
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 cursor-pointer"
              title="Sửa"
            >
              <Pencil className="h-4 w-4" /> Sửa
            </button>
          </div>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 inline-flex items-center gap-1">
              <TypeIcon type={question.type} /> {TYPE_LABEL[question.type]}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {question.level}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border">
              Nguồn: {question.source}
            </span>
          </div>
          <div className="rounded-lg bg-slate-50 border p-3 text-sm text-slate-800 whitespace-pre-line">
            {question.content}
          </div>

          {question.answers && (
            <div className="space-y-1.5">
              {question.answers.map((a, i) => (
                <div key={i} className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                  a.correct ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-white text-slate-700"
                }`}>
                  <span className="font-semibold w-6">{String.fromCharCode(65 + i)}.</span>
                  <span className="flex-1">{a.text}</span>
                  {a.correct && <span className="text-xs font-semibold">Đáp án đúng</span>}
                </div>
              ))}
            </div>
          )}

          {question.tfItems && (
            <div className="space-y-1.5">
              {question.tfItems.map((t, i) => (
                <div key={i} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm bg-white">
                  <span className="font-semibold w-6">{i + 1}.</span>
                  <span className="flex-1 text-slate-700">{t.text}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    t.correct ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                  }`}>{t.correct ? "Đ" : "S"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
