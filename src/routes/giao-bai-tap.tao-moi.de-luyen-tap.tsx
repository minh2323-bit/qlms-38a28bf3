import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Info, ListChecks, Users, Check, ArrowLeft, Plus, Trash2, Search,
  Database, Upload, PenLine, ChevronDown, X,
  CircleDot, CheckSquare, FileText, Move, TextCursorInput, Link2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/giao-bai-tap/tao-moi/de-luyen-tap")({
  head: () => ({ meta: [{ title: "Tạo đề luyện tập" }] }),
  component: Page,
});

/* ---------- Data ---------- */
const GRADES = ["1", "2", "3", "4", "5"];
const SUBJECTS = ["Toán", "Tiếng Việt", "Khoa học", "Đạo đức"];
const CLASSES_BY_GRADE: Record<string, string[]> = {
  "1": ["1A", "1B", "1C"],
  "2": ["2A", "2B"],
  "3": ["3A", "3B", "3C", "3D"],
  "4": ["4A", "4B", "4C", "4D"],
  "5": ["5A", "5B"],
};
const KNOWLEDGE_UNITS = [
  "Số tự nhiên", "Phân số", "Đọc hiểu văn bản", "Tập làm văn", "Đại lượng & đo lường",
];
const CHAPTERS = [
  "Chủ đề 10 : PHÂN SỐ",
  "Chủ đề 9 : SỐ THẬP PHÂN",
  "Chủ đề 8 : ĐẠI LƯỢNG",
];

type Student = { id: string; code: string; name: string };
const STUDENT_DB: Record<string, Student[]> = {
  "4A": [
    { id: "s1", code: "0123456783", name: "Nguyễn An" },
    { id: "s2", code: "0365427720", name: "Mai Huyền" },
    { id: "s3", code: "0123456787", name: "Trần Bảo" },
    { id: "s4", code: "0348844088", name: "Thanh Vân" },
    { id: "s5", code: "0335773123", name: "Vũ Huy Hoàng" },
  ],
  "4B": [
    { id: "s9", code: "0901123456", name: "Đỗ Quang Huy" },
    { id: "s10", code: "0901123457", name: "Nguyễn Bích Ngọc" },
  ],
  "3A": [
    { id: "s14", code: "0903334456", name: "Trịnh Mỹ Duyên" },
  ],
};

/* ---------- Types ---------- */
type QKind = "single" | "multi" | "essay" | "drag" | "fill" | "match";
const Q_LABEL: Record<QKind, string> = {
  single: "Trắc nghiệm 1 đáp án",
  multi: "Trắc nghiệm nhiều đáp án",
  essay: "Tự luận",
  drag: "Kéo thả",
  fill: "Điền từ vào chỗ trống",
  match: "Nối",
};
const Q_BADGE: Record<QKind, string> = {
  single: "bg-indigo-100 text-indigo-700",
  multi: "bg-violet-100 text-violet-700",
  essay: "bg-amber-100 text-amber-700",
  drag: "bg-sky-100 text-sky-700",
  fill: "bg-emerald-100 text-emerald-700",
  match: "bg-rose-100 text-rose-700",
};

type Option = { text: string; correct: boolean };
type MatchPair = { left: string; right: string };
type Question = {
  id: string;
  kind: QKind;
  text: string;
  score: number;
  options?: Option[];       // single/multi
  fileName?: string;        // essay
  hint?: string;            // essay
  items?: string[];         // drag / fill answers
  pairs?: MatchPair[];      // match
};

/* ---------- Stepper ---------- */
const STEPS = [
  { id: 1, name: "Thông tin bài tập", icon: Info },
  { id: 2, name: "Thêm nội dung", icon: ListChecks },
  { id: 3, name: "Danh sách học sinh", icon: Users },
] as const;

function Stepper({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="bg-white border border-indigo-100 rounded-2xl shadow-sm px-6 py-5">
      <div className="flex items-start justify-between gap-4">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          const done = current > s.id;
          const active = current === s.id;
          return (
            <div key={s.id} className="flex-1 flex items-start">
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center border-2 transition ${
                  done ? "bg-emerald-500 border-emerald-500 text-white"
                  : active ? "bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-100"
                  : "bg-white border-slate-200 text-slate-400"}`}>
                  {done ? <Check className="h-5 w-5" strokeWidth={3} /> : <Icon className="h-5 w-5" />}
                </div>
                <div className="mt-2 text-center">
                  <div className={`text-[11px] font-semibold ${active ? "text-indigo-700" : done ? "text-emerald-600" : "text-slate-400"}`}>
                    BƯỚC {s.id}
                  </div>
                  <div className={`text-sm font-bold mt-0.5 ${active ? "text-slate-800" : done ? "text-slate-700" : "text-slate-400"}`}>
                    {s.name}
                  </div>
                </div>
              </div>
              {idx < STEPS.length - 1 && (
                <div className="flex-1 mt-6 mx-2">
                  <div className={`h-1 rounded-full ${done ? "bg-emerald-500" : "bg-slate-200"}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================ Manual Question Modal ============================ */
function ManualQuestionModal({
  open, kind, onClose, onSave,
}: {
  open: boolean;
  kind: QKind | null;
  onClose: () => void;
  onSave: (q: Question) => void;
}) {
  const [score, setScore] = useState(1);
  const [text, setText] = useState("");
  const [hint, setHint] = useState("");
  const [options, setOptions] = useState<Option[]>([
    { text: "", correct: false }, { text: "", correct: false },
    { text: "", correct: false }, { text: "", correct: false },
  ]);
  const [items, setItems] = useState<string[]>(["", ""]);
  const [pairs, setPairs] = useState<MatchPair[]>([
    { left: "", right: "" }, { left: "", right: "" },
  ]);
  const [fileName, setFileName] = useState<string | undefined>();

  // reset on open
  useMemo(() => {
    if (open) {
      setScore(1); setText(""); setHint(""); setFileName(undefined);
      setOptions([
        { text: "", correct: false }, { text: "", correct: false },
        { text: "", correct: false }, { text: "", correct: false },
      ]);
      setItems(["", ""]);
      setPairs([{ left: "", right: "" }, { left: "", right: "" }]);
    }
  }, [open]);

  if (!kind) return null;

  const title = `Thêm mới câu hỏi ${
    kind === "single" ? "chọn 1 đáp án"
    : kind === "multi" ? "chọn nhiều đáp án"
    : kind === "essay" ? "tự luận"
    : kind === "drag" ? "kéo thả"
    : kind === "fill" ? "điền từ vào chỗ trống"
    : "nối"
  }`;

  const save = () => {
    if (!text.trim()) { toast.error("Vui lòng nhập nội dung câu hỏi"); return; }
    const q: Question = {
      id: `q-${Date.now()}`, kind, text, score,
    };
    if (kind === "single" || kind === "multi") {
      q.options = options.filter((o) => o.text.trim());
      if (!q.options.some((o) => o.correct)) { toast.error("Chọn ít nhất một đáp án đúng"); return; }
    } else if (kind === "essay") {
      q.fileName = fileName; q.hint = hint;
    } else if (kind === "drag" || kind === "fill") {
      q.items = items.filter((x) => x.trim());
    } else if (kind === "match") {
      q.pairs = pairs.filter((p) => p.left.trim() && p.right.trim());
    }
    onSave(q);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-sky-700">{title}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-12 gap-5 max-h-[65vh] overflow-y-auto pr-1">
          <div className="col-span-3">
            <label className="text-sm font-semibold text-slate-700 mb-1 block">Điểm câu</label>
            <Input type="number" min={0} step={0.5} value={score}
              onChange={(e) => setScore(Number(e.target.value) || 0)} />
          </div>

          <div className="col-span-9 space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">
                Nội dung câu hỏi <span className="text-rose-500">*</span>
              </label>
              <Textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} />
            </div>

            {(kind === "single" || kind === "multi") && (
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">
                  Câu trả lời <span className="text-rose-500">*</span>
                </label>
                <div className="border rounded-lg p-3 space-y-2">
                  {options.map((op, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 font-bold text-slate-600">{String.fromCharCode(65 + i)}.</div>
                      {kind === "single" ? (
                        <input type="radio" name="correct" checked={op.correct}
                          onChange={() => setOptions(options.map((o, j) => ({ ...o, correct: i === j })))} />
                      ) : (
                        <Checkbox checked={op.correct}
                          onCheckedChange={(v) => setOptions(options.map((o, j) => j === i ? { ...o, correct: !!v } : o))} />
                      )}
                      <Input value={op.text} onChange={(e) =>
                        setOptions(options.map((o, j) => j === i ? { ...o, text: e.target.value } : o))} />
                      <button className="text-slate-400 hover:text-rose-600"
                        onClick={() => setOptions(options.filter((_, j) => j !== i))}>
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <Button size="sm" variant="outline" onClick={() =>
                    setOptions([...options, { text: "", correct: false }])}>
                    <Plus className="h-4 w-4 mr-1" /> Thêm đáp án
                  </Button>
                </div>
              </div>
            )}

            {kind === "essay" && (
              <>
                <div>
                  <Button className="bg-sky-600 hover:bg-sky-700 text-white">
                    <Upload className="h-4 w-4 mr-1" /> Chọn tệp bài tập
                  </Button>
                  <p className="text-xs text-slate-500 mt-2">
                    Dung lượng Tối đa 4MB. Định dạng cho phép: Ảnh, PDF, Word, Excel, PowerPoint.
                  </p>
                  {fileName && <div className="text-xs text-emerald-600 mt-1">Đã chọn: {fileName}</div>}
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 block">Hướng dẫn giải</label>
                  <Textarea rows={3} value={hint} onChange={(e) => setHint(e.target.value)} />
                </div>
              </>
            )}

            {(kind === "drag" || kind === "fill") && (
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">
                  {kind === "drag" ? "Các mục kéo thả (theo thứ tự đúng)" : "Các từ cần điền (theo thứ tự chỗ trống)"}
                </label>
                <div className="border rounded-lg p-3 space-y-2">
                  {items.map((it, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-6 text-sm text-slate-500">{i + 1}.</div>
                      <Input value={it} onChange={(e) =>
                        setItems(items.map((x, j) => j === i ? e.target.value : x))} />
                      <button className="text-slate-400 hover:text-rose-600"
                        onClick={() => setItems(items.filter((_, j) => j !== i))}>
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <Button size="sm" variant="outline" onClick={() => setItems([...items, ""])}>
                    <Plus className="h-4 w-4 mr-1" /> Thêm mục
                  </Button>
                </div>
              </div>
            )}

            {kind === "match" && (
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Cặp nối</label>
                <div className="border rounded-lg p-3 space-y-2">
                  {pairs.map((p, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input placeholder="Cột trái" value={p.left}
                        onChange={(e) => setPairs(pairs.map((x, j) => j === i ? { ...x, left: e.target.value } : x))} />
                      <span className="text-slate-400">↔</span>
                      <Input placeholder="Cột phải" value={p.right}
                        onChange={(e) => setPairs(pairs.map((x, j) => j === i ? { ...x, right: e.target.value } : x))} />
                      <button className="text-slate-400 hover:text-rose-600"
                        onClick={() => setPairs(pairs.filter((_, j) => j !== i))}>
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <Button size="sm" variant="outline" onClick={() =>
                    setPairs([...pairs, { left: "", right: "" }])}>
                    <Plus className="h-4 w-4 mr-1" /> Thêm cặp
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={save} className="bg-indigo-700 hover:bg-indigo-800 text-white">Lưu câu hỏi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============================ Question Bank Modal ============================ */
function BankModal({
  open, onClose, onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (qs: Question[]) => void;
}) {
  const [grade, setGrade] = useState("4");
  const [subject, setSubject] = useState("Toán");
  const [chapter, setChapter] = useState(CHAPTERS[0]);
  const [taskName, setTaskName] = useState("");
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());

  // Mock bank – empty by default matching image
  const rows: Question[] = [];

  const confirm = () => {
    onAdd(rows.filter((r) => picked.has(r.id)));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle className="text-sky-700">
            Chọn câu hỏi từ ngân hàng (Đã thêm {picked.size}/10 câu)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex justify-end gap-2">
            <Button onClick={confirm} className="bg-sky-600 hover:bg-sky-700 text-white">Chọn câu hỏi</Button>
            <Button variant="outline" onClick={onClose}>Đóng</Button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-slate-500">Khối học</label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{GRADES.map((g) => <SelectItem key={g} value={g}>Khối {g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-slate-500">Môn học</label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-slate-500">Chương học</label>
              <Select value={chapter} onValueChange={setChapter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CHAPTERS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-slate-500">Tên bài tập</label>
              <Input value={taskName} onChange={(e) => setTaskName(e.target.value)}
                placeholder="Luyện tập Phép tính với số thập phân" />
            </div>
          </div>

          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tên câu hỏi" />
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 bg-sky-700 text-white text-sm font-semibold">
              <div className="col-span-1 px-3 py-2">STT</div>
              <div className="col-span-1 px-3 py-2 text-center">
                <Checkbox className="border-white" />
              </div>
              <div className="col-span-6 px-3 py-2">Nội dung câu hỏi và đáp án</div>
              <div className="col-span-4 px-3 py-2">Thông tin câu hỏi</div>
            </div>
            <div className="bg-slate-50 text-center text-sm text-slate-500 py-10">
              Không có dữ liệu.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ============================ Page ============================ */
function Page() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1
  const [title, setTitle] = useState("");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [klass, setKlass] = useState("");
  const [unit, setUnit] = useState("");
  const [assignedAt, setAssignedAt] = useState("");
  const [assignedTime, setAssignedTime] = useState("08:00");
  const [dueAt, setDueAt] = useState("");
  const [dueTime, setDueTime] = useState("23:59");
  const [scale, setScale] = useState("10");
  const [opts, setOpts] = useState({
    lateSubmit: false, showScore: true, showAnswers: false, exportGrade: false,
  });
  const step1Valid = title.trim() && grade && subject && klass && unit && assignedAt && dueAt && scale;

  // Step 2
  const [questions, setQuestions] = useState<Question[]>([]);
  const [manualKind, setManualKind] = useState<QKind | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);
  const totalScore = useMemo(() => questions.reduce((s, q) => s + (q.score || 0), 0), [questions]);
  const step2Valid = questions.length > 0;

  const addQuestion = (q: Question) => {
    setQuestions((p) => [...p, q]);
    setManualKind(null);
    toast.success("Đã thêm câu hỏi");
  };
  const removeQuestion = (id: string) => setQuestions((p) => p.filter((q) => q.id !== id));

  const onImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    toast.success(`Đã nhập file: ${f.name}`);
    e.target.value = "";
  };

  // Step 3
  const [pickedClass, setPickedClass] = useState("");
  const [pickedStudents, setPickedStudents] = useState<Set<string>>(new Set());
  const [studentQ, setStudentQ] = useState("");
  const classStudents = pickedClass ? (STUDENT_DB[pickedClass] ?? []) : [];
  const filteredStudents = classStudents.filter((s) =>
    s.name.toLowerCase().includes(studentQ.toLowerCase()) || s.code.includes(studentQ));
  const step3Valid = pickedStudents.size > 0;
  const toggleStudent = (id: string) => {
    setPickedStudents((prev) => {
      const nxt = new Set(prev);
      if (nxt.has(id)) nxt.delete(id); else nxt.add(id);
      return nxt;
    });
  };
  const toggleAllStudents = () => {
    if (pickedStudents.size === filteredStudents.length) setPickedStudents(new Set());
    else setPickedStudents(new Set(filteredStudents.map((s) => s.id)));
  };

  const submit = () => {
    toast.success("Đã tạo đề luyện tập");
    navigate({ to: "/giao-bai-tap" });
  };

  /* ---------- render answer preview cell ---------- */
  const renderAnswer = (q: Question) => {
    if (q.kind === "single" || q.kind === "multi") {
      return (
        <div className="space-y-0.5">
          {q.options?.map((o, i) => (
            <div key={i} className={`text-xs ${o.correct ? "text-emerald-700 font-semibold" : "text-slate-600"}`}>
              {String.fromCharCode(65 + i)}. {o.text || <i className="text-slate-400">(trống)</i>} {o.correct && "✓"}
            </div>
          ))}
        </div>
      );
    }
    if (q.kind === "essay") return <span className="text-xs text-slate-500 italic">Học sinh tự trả lời</span>;
    if (q.kind === "drag" || q.kind === "fill")
      return <div className="text-xs text-slate-600">{q.items?.join(" | ") || "-"}</div>;
    if (q.kind === "match")
      return (
        <div className="space-y-0.5">
          {q.pairs?.map((p, i) => (
            <div key={i} className="text-xs text-slate-600">{p.left} ↔ {p.right}</div>
          ))}
        </div>
      );
    return null;
  };

  /* =============================== Render =============================== */
  return (
    <AppShell role="teacher">
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Link to="/giao-bai-tap" className="p-2 rounded-md hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5 text-slate-700" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Tạo đề luyện tập</h1>
            <p className="text-sm text-slate-500">Điền thông tin, thêm câu hỏi rồi gán cho học sinh.</p>
          </div>
        </div>

        <Stepper current={step} />

        {/* ============ STEP 1 ============ */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-5">
            <h2 className="text-base font-bold text-slate-800">Thông tin bài tập</h2>

            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">
                Tên bài tập <span className="text-rose-500">*</span>
              </label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Luyện tập phép tính với phân số" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Khối <span className="text-rose-500">*</span></label>
                <Select value={grade} onValueChange={(v) => { setGrade(v); setKlass(""); }}>
                  <SelectTrigger><SelectValue placeholder="Chọn khối" /></SelectTrigger>
                  <SelectContent>{GRADES.map((g) => <SelectItem key={g} value={g}>Khối {g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Môn <span className="text-rose-500">*</span></label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger><SelectValue placeholder="Chọn môn" /></SelectTrigger>
                  <SelectContent>{SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Lớp <span className="text-rose-500">*</span></label>
                <Select value={klass} onValueChange={setKlass} disabled={!grade}>
                  <SelectTrigger><SelectValue placeholder="Chọn lớp" /></SelectTrigger>
                  <SelectContent>
                    {(CLASSES_BY_GRADE[grade] ?? []).map((c) => <SelectItem key={c} value={c}>Lớp {c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">Đơn vị kiến thức <span className="text-rose-500">*</span></label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger><SelectValue placeholder="Chọn đơn vị kiến thức" /></SelectTrigger>
                <SelectContent>{KNOWLEDGE_UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Ngày giao <span className="text-rose-500">*</span></label>
                <div className="flex gap-2">
                  <Input type="date" value={assignedAt} onChange={(e) => setAssignedAt(e.target.value)} />
                  <Input type="time" value={assignedTime} onChange={(e) => setAssignedTime(e.target.value)} className="w-32" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Hạn nộp <span className="text-rose-500">*</span></label>
                <div className="flex gap-2">
                  <Input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
                  <Input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} className="w-32" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">Thang điểm</label>
              <Select value={scale} onValueChange={setScale}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["10", "20", "50", "100"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Tùy chọn</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { k: "lateSubmit", label: "Cho phép nộp khi quá hạn" },
                  { k: "showScore", label: "Cho phép xem điểm" },
                  { k: "showAnswers", label: "Cho phép xem đáp án" },
                  { k: "exportGrade", label: "Cho phép nhập điểm sang CSDL" },
                ].map((o) => (
                  <label key={o.k} className="flex items-center gap-2 border rounded-lg px-3 py-2 hover:bg-slate-50 cursor-pointer">
                    <Checkbox checked={opts[o.k as keyof typeof opts]}
                      onCheckedChange={(v) => setOpts((p) => ({ ...p, [o.k]: !!v }))} />
                    <span className="text-sm text-slate-700">{o.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <Button onClick={() => setStep(2)} disabled={!step1Valid}
                className="bg-indigo-700 hover:bg-indigo-800 text-white">Tiếp theo</Button>
            </div>
          </div>
        )}

        {/* ============ STEP 2 ============ */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">Thêm nội dung</h2>
              <div className="text-sm text-slate-600">
                Tổng điểm: <b className="text-indigo-700">{totalScore}</b> / {scale}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={() => setBankOpen(true)} className="gap-1">
                <Database className="h-4 w-4" /> Thêm từ ngân hàng câu hỏi
              </Button>

              <label className="inline-flex">
                <input type="file" className="hidden" onChange={onImportFile}
                  accept=".xlsx,.xls,.csv,.docx" />
                <span className="inline-flex items-center gap-1 h-9 rounded-md px-3 border bg-white text-sm font-medium shadow-sm hover:bg-slate-50 cursor-pointer">
                  <Upload className="h-4 w-4" /> Thêm từ file
                </span>
              </label>

              <Button onClick={() => setPickerOpen(true)} className="bg-indigo-700 hover:bg-indigo-800 text-white gap-1">
                <PenLine className="h-4 w-4" /> Thêm thủ công <ChevronDown className="h-4 w-4" />
              </Button>

            </div>

            <div className="border rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-slate-100 text-[11px] font-semibold text-slate-600 uppercase">
                <div className="col-span-1">STT</div>
                <div className="col-span-4">Câu hỏi</div>
                <div className="col-span-3">Đáp án</div>
                <div className="col-span-1">Điểm</div>
                <div className="col-span-2">Loại câu hỏi</div>
                <div className="col-span-1"></div>
              </div>
              {questions.length === 0 ? (
                <div className="text-sm text-slate-500 text-center py-10">
                  Chưa có câu hỏi nào. Sử dụng các nút phía trên để thêm.
                </div>
              ) : (
                <ul className="divide-y">
                  {questions.map((q, i) => (
                    <li key={q.id} className="grid grid-cols-12 gap-2 px-3 py-3 items-start hover:bg-slate-50">
                      <div className="col-span-1 text-sm text-slate-500 pt-0.5">{String(i + 1).padStart(2, "0")}</div>
                      <div className="col-span-4 text-sm text-slate-800 line-clamp-3">{q.text}</div>
                      <div className="col-span-3">{renderAnswer(q)}</div>
                      <div className="col-span-1 text-sm font-semibold text-indigo-700">{q.score}</div>
                      <div className="col-span-2">
                        <span className={`inline-flex items-center rounded-full text-[11px] font-semibold px-2 py-0.5 ${Q_BADGE[q.kind]}`}>
                          {Q_LABEL[q.kind]}
                        </span>
                      </div>
                      <div className="col-span-1 text-right">
                        <button onClick={() => removeQuestion(q.id)} className="text-slate-400 hover:text-rose-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <Button variant="ghost" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại
              </Button>
              <Button onClick={() => setStep(3)} disabled={!step2Valid}
                className="bg-indigo-700 hover:bg-indigo-800 text-white">Tiếp theo</Button>
            </div>
          </div>
        )}

        {/* ============ STEP 3 ============ */}
        {step === 3 && (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4 bg-white rounded-2xl border shadow-sm p-4 space-y-3 h-fit">
              <div className="text-xs font-semibold text-indigo-700">TÓM TẮT</div>
              <div>
                <div className="text-xs text-slate-500">Tên bài tập</div>
                <div className="text-sm font-bold text-slate-800">{title}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Hạn nộp</div>
                <div className="text-sm font-semibold text-rose-600">{dueAt} {dueTime}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Số câu hỏi</div>
                <div className="text-sm font-bold text-indigo-700">{questions.length} câu · Tổng {totalScore} điểm</div>
              </div>
            </div>

            <div className="col-span-8 bg-white rounded-2xl border shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Danh sách học sinh</h2>
                  <p className="text-xs text-slate-500">Chọn lớp rồi chọn học sinh để gán bài tập.</p>
                </div>
                <Select value={pickedClass} onValueChange={(v) => { setPickedClass(v); setPickedStudents(new Set()); }}>
                  <SelectTrigger className="w-32"><SelectValue placeholder="Chọn lớp" /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(STUDENT_DB).map((k) => <SelectItem key={k} value={k}>Lớp {k}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <Search className="h-4 w-4 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <Input value={studentQ} onChange={(e) => setStudentQ(e.target.value)}
                  placeholder="Tìm tên hoặc mã học sinh..." className="pl-8" />
              </div>

              {!pickedClass ? (
                <div className="text-sm text-slate-500 text-center py-10 border rounded-xl">
                  Chọn một lớp để hiển thị học sinh.
                </div>
              ) : (
                <div className="border rounded-xl overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase">
                    <div className="col-span-1">STT</div>
                    <div className="col-span-6">Họ và tên</div>
                    <div className="col-span-4">Mã HS</div>
                    <div className="col-span-1 text-right">
                      <Checkbox
                        checked={filteredStudents.length > 0 && pickedStudents.size === filteredStudents.length}
                        onCheckedChange={toggleAllStudents} />
                    </div>
                  </div>
                  <ul className="divide-y max-h-[380px] overflow-y-auto">
                    {filteredStudents.map((s, i) => (
                      <li key={s.id} className="grid grid-cols-12 gap-2 px-3 py-2 items-center hover:bg-slate-50">
                        <div className="col-span-1 text-sm text-slate-500">{String(i + 1).padStart(2, "0")}</div>
                        <div className="col-span-6 text-sm font-medium text-slate-800">{s.name}</div>
                        <div className="col-span-4 text-sm text-slate-600">{s.code}</div>
                        <div className="col-span-1 text-right">
                          <Checkbox checked={pickedStudents.has(s.id)} onCheckedChange={() => toggleStudent(s.id)} />
                        </div>
                      </li>
                    ))}
                    {filteredStudents.length === 0 && (
                      <li className="text-sm text-slate-500 text-center py-8">Không có học sinh phù hợp.</li>
                    )}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại
                </Button>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600">
                    Đã chọn <b className="text-indigo-700">{pickedStudents.size}</b> học sinh
                  </span>
                  <Button onClick={submit} disabled={!step3Valid}
                    className="bg-indigo-700 hover:bg-indigo-800 text-white">Thêm bài tập</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ManualQuestionModal
        open={manualKind !== null}
        kind={manualKind}
        onClose={() => setManualKind(null)}
        onSave={addQuestion}
      />
      <BankModal open={bankOpen} onClose={() => setBankOpen(false)} onAdd={(qs) => {
        setQuestions((p) => [...p, ...qs]);
        toast.success(`Đã thêm ${qs.length} câu`);
      }} />
    </AppShell>
  );
}
