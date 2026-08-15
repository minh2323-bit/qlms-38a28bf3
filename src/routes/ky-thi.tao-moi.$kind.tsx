import { useMemo, useState } from "react";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Check, ChevronLeft, ChevronDown, FileCheck2, Pencil, Upload, Plus, X, Search, Copy,
  FileSpreadsheet, Trash2, RefreshCw, Wand2, Library, Target, ListChecks,
  ArrowUpDown, ToggleLeft, PenLine, GripVertical, Type as TypeIcon, Link2,
} from "lucide-react";
import { toast } from "sonner";
import { GRADES, SUBJECTS } from "@/lib/shared-exam-bank";
import { getKnowledgeTree } from "@/lib/knowledge-tree";


export const Route = createFileRoute("/ky-thi/tao-moi/$kind")({
  head: () => ({
    meta: [
      { title: "Thêm mới kỳ thi | Tiểu học Tô Hiệu" },
      { name: "description", content: "Tạo kỳ thi cấp Trường theo 4 bước: thông tin kỳ thi, nội dung đề, quản lý thí sinh và quản lý ca thi." },
      { property: "og:title", content: "Thêm mới kỳ thi" },
      { property: "og:description", content: "Tạo kỳ thi cấp Trường theo 4 bước: thông tin kỳ thi, nội dung đề, quản lý thí sinh và quản lý ca thi." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const SCORE_TYPES = [
  "Không lấy điểm",
  "Điểm 45 phút",
  "Điểm thi giữa học kỳ I",
  "Điểm thi cuối học kỳ I",
  "Điểm thi giữa học kỳ II",
  "Điểm thi cuối học kỳ II",
];

const SCHOOL_EXAMS = [
  { id: "se1", name: "Đề thi cuối kỳ I – Toán 4", grade: "4", subject: "Toán", questions: 25, minutes: 45 },
  { id: "se2", name: "Đề thi giữa kỳ – Tiếng Việt 4", grade: "4", subject: "Tiếng Việt", questions: 20, minutes: 40 },
  { id: "se3", name: "Đề khảo sát chất lượng đầu năm – Toán 3", grade: "3", subject: "Toán", questions: 18, minutes: 40 },
  { id: "se4", name: "Đề thi thử học sinh giỏi – Tiếng Anh 5", grade: "5", subject: "Tiếng Anh", questions: 30, minutes: 60 },
  { id: "se5", name: "Đề thi cuối kỳ II – Toán 4", grade: "4", subject: "Toán", questions: 22, minutes: 45 },
];

type BankQ = { id: string; content: string; type: string; level: string; grade: string; subject: string; topic: string };

const BANK: BankQ[] = [
  { id: "bq1", content: "Số nào lớn nhất trong các số sau: 3 210, 3 120, 3 201, 3 102?", type: "Trắc nghiệm 1 đáp án", level: "Nhận biết", grade: "4", subject: "Toán", topic: "Chủ đề 1: Các số đến 100 000" },
  { id: "bq2", content: "Chọn các số chia hết cho cả 2 và 5:", type: "Trắc nghiệm nhiều đáp án", level: "Thông hiểu", grade: "4", subject: "Toán", topic: "Chủ đề 3: Dấu hiệu chia hết" },
  { id: "bq3", content: "Trình bày cách tìm hai số khi biết tổng và hiệu của chúng.", type: "Tự luận", level: "Vận dụng", grade: "4", subject: "Toán", topic: "Chủ đề 2: Tổng và hiệu" },
  { id: "bq4", content: "Các phát biểu sau đúng hay sai?", type: "Đúng/Sai", level: "Vận dụng", grade: "4", subject: "Toán", topic: "Chủ đề 3: Số tự nhiên" },
  { id: "bq5", content: "Kéo thả các số vào đúng vị trí trên trục số.", type: "Kéo thả", level: "Nhận biết", grade: "4", subject: "Toán", topic: "Chủ đề 2: Trục số" },
  { id: "bq6", content: "Điền số thích hợp vào chỗ trống: 12 + ... = 20", type: "Điền khuyết", level: "Thông hiểu", grade: "3", subject: "Toán", topic: "Chủ đề 3: Phép cộng trong phạm vi 100" },
  { id: "bq7", content: "Nối phép tính ở cột A với kết quả đúng ở cột B.", type: "Nối từ", level: "Nhận biết", grade: "3", subject: "Toán", topic: "Chủ đề 4: Phép cộng, phép trừ" },
  { id: "bq8", content: "Sắp xếp các câu sau thành đoạn văn hoàn chỉnh.", type: "Sắp xếp", level: "Vận dụng", grade: "4", subject: "Tiếng Việt", topic: "Chủ đề 4: Đọc hiểu" },
];

const NEW_TYPES = [
  { label: "Trắc nghiệm 1 đáp án", icon: Target, cls: "bg-rose-50 text-rose-600" },
  { label: "Trắc nghiệm nhiều đáp án", icon: ListChecks, cls: "bg-emerald-50 text-emerald-600" },
  { label: "Tự luận", icon: TypeIcon, cls: "bg-slate-100 text-slate-600" },
  { label: "Kéo thả", icon: GripVertical, cls: "bg-violet-50 text-violet-600" },
  { label: "Điền khuyết", icon: PenLine, cls: "bg-amber-50 text-amber-600" },
  { label: "Đúng/Sai", icon: ToggleLeft, cls: "bg-sky-50 text-sky-600" },
  { label: "Nối từ", icon: Link2, cls: "bg-teal-50 text-teal-600" },
  { label: "Sắp xếp", icon: ArrowUpDown, cls: "bg-emerald-50 text-emerald-600" },
];

const CANDIDATE_POOL = [
  { id: "s1", cccd: "0123456783", name: "Nguyễn Hải An", sex: "Nam", dob: "15/03/2016", grade: "4", klass: "4A" },
  { id: "s2", cccd: "0365427720", name: "Mai Thị Huyền", sex: "Nữ", dob: "02/07/2016", grade: "4", klass: "4A" },
  { id: "s3", cccd: "0123456787", name: "Trần Gia Bảo", sex: "Nam", dob: "21/11/2016", grade: "4", klass: "4B" },
  { id: "s4", cccd: "0348844088", name: "Đỗ Thanh Vân", sex: "Nữ", dob: "08/05/2016", grade: "4", klass: "4B" },
  { id: "s5", cccd: "0335773123", name: "Vũ Huy Hoàng", sex: "Nam", dob: "30/09/2016", grade: "4", klass: "4C" },
  { id: "s6", cccd: "0912125548", name: "Phạm Tất Thắng", sex: "Nam", dob: "12/12/2016", grade: "4", klass: "4C" },
  { id: "s7", cccd: "0771233456", name: "Lê Khánh Linh", sex: "Nữ", dob: "19/01/2017", grade: "3", klass: "3A" },
  { id: "s8", cccd: "0668121999", name: "Bùi Minh Quân", sex: "Nam", dob: "27/04/2017", grade: "3", klass: "3B" },
  { id: "s9", cccd: "0559120034", name: "Ngô Phương Mai", sex: "Nữ", dob: "05/08/2015", grade: "5", klass: "5A" },
  { id: "s10", cccd: "0442988177", name: "Đặng Nam Phúc", sex: "Nam", dob: "14/10/2015", grade: "5", klass: "5B" },
];

/** Giáo viên toàn trường – dùng cho field Người chấm */
const CURRENT_TEACHER = "Nguyễn Thị Hạnh (bạn)";
const TEACHERS = [
  CURRENT_TEACHER,
  "Trần Thu Hương – Toán",
  "Lê Minh Tuấn – Toán",
  "Phạm Ngọc Lan – Tiếng Việt",
  "Đỗ Hải Yến – Tiếng Việt",
  "Vũ Quang Huy – Tiếng Anh",
  "Bùi Thanh Mai – Tiếng Anh",
  "Ngô Văn Kiên – Tin học",
];

/** Kỳ thi nguồn để sao chép thí sinh */
const SOURCE_EXAMS = [
  "[Kỳ thi ôn tập] Trường (đề từ tệp)",
  "[Kỳ thi chính thức] Kiểm tra giữa kỳ II – Trường Tô Hiệu",
  "[Kỳ thi chính thức] Kiểm tra cuối kỳ I – Trường Tô Hiệu",
  "[Kỳ thi ôn tập] Đề ôn cuối kỳ – Toán 4",
];

type Shift = { id: string; code: string; name: string; count: number };

function Page() {
  const { kind } = useParams({ from: "/ky-thi/tao-moi/$kind" });
  const navigate = useNavigate();
  const isPractice = kind === "on-tap";
  const backTo = isPractice ? "/ky-thi/on-tap" : "/ky-thi/chinh-thuc";
  const heading = isPractice ? "Thêm mới kỳ thi ôn tập" : "Thêm mới kỳ thi chính thức";

  const [step, setStep] = useState(1);

  /* ---------- Bước 1 ---------- */
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [graders, setGraders] = useState<string[]>([CURRENT_TEACHER]);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [duration, setDuration] = useState("45");
  const [maxScore, setMaxScore] = useState("10");
  const [scoreType, setScoreType] = useState("");
  const [showScore, setShowScore] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);
  const [showWork, setShowWork] = useState(false);
  const [limitStudents, setLimitStudents] = useState(false);


  const tree = useMemo(
    () => (grade && subject ? getKnowledgeTree(grade, subject) : []),
    [grade, subject],
  );

  const canNext1 = !!name && !!grade && !!subject && !!startAt && !!duration && !!maxScore && !!scoreType;

  /* ---------- Bước 2 ---------- */
  const [mode, setMode] = useState<"bank-exam" | "compose" | "upload">("bank-exam");
  const [pickedExam, setPickedExam] = useState("");
  const [questions, setQuestions] = useState<BankQ[]>([]);
  const [bankOpen, setBankOpen] = useState(false);
  const [bankGrade, setBankGrade] = useState("4");
  const [bankSubject, setBankSubject] = useState("Toán");
  const [bankType, setBankType] = useState("all");
  const [bankQuery, setBankQuery] = useState("");
  const [bankPicked, setBankPicked] = useState<string[]>([]);

  const bankRows = BANK.filter(
    (b) =>
      b.grade === bankGrade &&
      b.subject === bankSubject &&
      (bankType === "all" || b.type === bankType) &&
      (bankQuery.trim() === "" ||
        `${b.content} ${b.topic}`.toLowerCase().includes(bankQuery.trim().toLowerCase())),
  );

  const useExam = () => {
    const ex = SCHOOL_EXAMS.find((e) => e.id === pickedExam);
    if (!ex) return;
    setQuestions(
      Array.from({ length: Math.min(ex.questions, 8) }, (_, i) => ({
        id: `${ex.id}-q${i + 1}`,
        content: `Câu ${i + 1} – ${ex.name}`,
        type: i % 3 === 0 ? "Tự luận" : "Trắc nghiệm 1 đáp án",
        level: ["Nhận biết", "Thông hiểu", "Vận dụng"][i % 3],
        grade: ex.grade,
        subject: ex.subject,
        topic: "Lấy từ đề thi của trường",
      })),
    );
    toast.success(`Đã sử dụng "${ex.name}" cho kỳ thi.`);
  };

  const addFromBank = () => {
    const picked = BANK.filter((b) => bankPicked.includes(b.id) && !questions.some((q) => q.id === b.id));
    setQuestions((qs) => [...qs, ...picked]);
    setBankPicked([]);
    setBankOpen(false);
    toast.success(`Đã thêm ${picked.length} câu hỏi vào đề.`);
  };

  /* ---------- Bước 3 ---------- */
  const [fGrade, setFGrade] = useState("4");
  const [fClass, setFClass] = useState("all");
  const [fCccd, setFCccd] = useState("");
  const [fName, setFName] = useState("");
  const [candidates, setCandidates] = useState<string[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [addPicked, setAddPicked] = useState<string[]>([]);
  const [selCand, setSelCand] = useState<string[]>([]);
  const [copyOpen, setCopyOpen] = useState(false);
  const [copySource, setCopySource] = useState(SOURCE_EXAMS[0]);
  const [copyShiftMode, setCopyShiftMode] = useState("none");
  const [addGrade, setAddGrade] = useState("4");
  const [addClass, setAddClass] = useState("all");
  const [addName, setAddName] = useState("");
  const [addCccd, setAddCccd] = useState("");


  const classes = Array.from(new Set(CANDIDATE_POOL.filter((c) => c.grade === fGrade).map((c) => c.klass)));
  const candRows = CANDIDATE_POOL.filter(
    (c) =>
      candidates.includes(c.id) &&
      c.grade === fGrade &&
      (fClass === "all" || c.klass === fClass) &&
      (fCccd.trim() === "" || c.cccd.includes(fCccd.trim())) &&
      (fName.trim() === "" || c.name.toLowerCase().includes(fName.trim().toLowerCase())),
  );

  /* ---------- Bước 4 ---------- */
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selShifts, setSelShifts] = useState<string[]>([]);
  const [shiftOpen, setShiftOpen] = useState(false);
  const [editShift, setEditShift] = useState<Shift | null>(null);
  const [sCode, setSCode] = useState("");
  const [sName, setSName] = useState("");
  const [sCount, setSCount] = useState("20");

  const arranged = shifts.reduce((a, s) => a + s.count, 0);

  const saveShift = () => {
    if (!sCode || !sName) return;
    if (editShift) {
      setShifts((v) => v.map((s) => (s.id === editShift.id ? { ...s, code: sCode, name: sName, count: Number(sCount) || 0 } : s)));
    } else {
      setShifts((v) => [...v, { id: `ca${Date.now()}`, code: sCode, name: sName, count: Number(sCount) || 0 }]);
    }
    setShiftOpen(false);
    setEditShift(null);
  };

  const STEPS = [
    { n: 1, label: "Thông tin kỳ thi" },
    { n: 2, label: "Nội dung kỳ thi" },
    { n: 3, label: `Quản lý thí sinh (${candidates.length})` },
    ...(isPractice ? [] : [{ n: 4, label: "Quản lý ca thi" }]),
  ];
  const lastStep = STEPS[STEPS.length - 1].n;


  const canGo = (n: number) => n === 1 || canNext1;

  return (
    <AppShell>
      <section className="bg-white rounded-2xl border shadow-sm">
        <div className="px-6 py-4 border-b flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: backTo })}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800">{heading}</h1>
            <p className="text-sm text-slate-500 mt-0.5">Kỳ thi cấp Trường – hoàn thành {STEPS.length} bước để phát hành kỳ thi.</p>
          </div>

        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between px-6 pt-4 pb-6 border-b">
          {STEPS.map((s, i) => {
            const done =
              (s.n === 1 && canNext1 && step !== 1) ||
              (s.n === 2 && questions.length > 0 && step !== 2) ||
              (s.n === 3 && candidates.length > 0 && step !== 3) ||
              (s.n === 4 && shifts.length > 0 && step !== 4);
            return (
              <div key={s.n} className="flex-1 flex items-center">
                <button
                  type="button"
                  disabled={!canGo(s.n)}
                  onClick={() => canGo(s.n) && setStep(s.n)}
                  className="flex flex-col items-center flex-1 cursor-pointer disabled:cursor-default"
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    done ? "bg-emerald-500 text-white"
                      : step >= s.n ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                  }`}>
                    {done ? <Check className="h-5 w-5" strokeWidth={3} /> : s.n}
                  </div>
                  <div className="mt-2 text-xs text-slate-500">BƯỚC {s.n}</div>
                  <div className={`text-sm font-semibold mt-0.5 ${step === s.n ? "text-slate-800" : "text-slate-500"}`}>
                    {s.label}
                  </div>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 -mt-10 ${step > s.n ? "bg-indigo-600" : "bg-slate-200"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* ---------------- Bước 1 ---------------- */}
        {step === 1 && (
          <div className="p-6 space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="rounded-xl border overflow-hidden">
                <div className="px-4 py-3 bg-indigo-50/70 border-b flex items-center gap-2 text-indigo-700 font-semibold">
                  <FileCheck2 className="h-4 w-4" /> Thông tin kỳ thi
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <Label className="text-sm">Tên kỳ thi <span className="text-rose-500">*</span></Label>
                    <Input className="mt-1" placeholder="VD: Kiểm tra cuối kỳ II – Trường Tô Hiệu"
                      value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">Khối <span className="text-rose-500">*</span></Label>
                      <Select value={grade} onValueChange={(v) => { setGrade(v); setChapter(""); }}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Chọn khối" /></SelectTrigger>
                        <SelectContent>
                          {GRADES.map((g) => <SelectItem key={g} value={g}>Khối {g}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm">Môn <span className="text-rose-500">*</span></Label>
                      <Select value={subject} onValueChange={(v) => { setSubject(v); setChapter(""); }}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Chọn môn" /></SelectTrigger>
                        <SelectContent>
                          {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm">Chương / Chủ đề</Label>
                    <Select value={chapter} onValueChange={setChapter} disabled={!tree.length}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={tree.length ? "— Cả môn —" : "— Chọn khối & môn trước —"} />
                      </SelectTrigger>
                      <SelectContent>
                        {tree.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm">Người chấm</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="mt-1 w-full justify-between font-normal">
                          <span className="truncate text-left">
                            {graders.length ? `${graders.length} giáo viên: ${graders.join(", ")}` : "Chọn giáo viên chấm"}
                          </span>
                          <ChevronDown className="h-4 w-4 opacity-60" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-80 p-2 max-h-72 overflow-auto">
                        {TEACHERS.map((t) => (
                          <label key={t} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50 cursor-pointer text-sm">
                            <Checkbox
                              checked={graders.includes(t)}
                              onCheckedChange={() =>
                                setGraders((v) => v.includes(t) ? v.filter((x) => x !== t) : [...v, t])
                              }
                            />
                            {t}
                          </label>
                        ))}
                      </PopoverContent>
                    </Popover>
                    <p className="text-xs text-slate-500 mt-1">Các giáo viên có quyền chấm nếu kỳ thi có chứa câu hỏi tự luận</p>
                  </div>

                </div>
              </div>

              <div className="rounded-xl border overflow-hidden">
                <div className="px-4 py-3 bg-indigo-50/70 border-b flex items-center gap-2 text-indigo-700 font-semibold">
                  <Wand2 className="h-4 w-4" /> Tùy chọn thêm
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">Thời gian bắt đầu <span className="text-rose-500">*</span></Label>
                      <Input type="datetime-local" className="mt-1" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
                      <p className="text-xs text-slate-500 mt-1">Thời gian mở đề cho học sinh tham gia kiểm tra</p>
                    </div>
                    <div>
                      <Label className="text-sm">Thời gian đóng đề</Label>
                      <Input type="datetime-local" className="mt-1" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
                      <p className="text-xs text-slate-500 mt-1">Hạn chót mở đề để học sinh có thể vào làm</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">Thời gian làm bài <span className="text-rose-500">*</span></Label>
                      <div className="flex items-center gap-2">
                        <Input className="mt-1" value={duration} onChange={(e) => setDuration(e.target.value)} />
                        <span className="text-sm text-slate-500 mt-1">phút</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm">Thang điểm <span className="text-rose-500">*</span></Label>
                      <div className="flex items-center gap-2">
                        <Select value={maxScore} onValueChange={setMaxScore}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                            <SelectItem value="custom">Tùy chỉnh</SelectItem>
                          </SelectContent>
                        </Select>
                        <span className="text-sm text-slate-500 mt-1">điểm</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm">Loại điểm <span className="text-rose-500">*</span></Label>
                    <Select value={scoreType} onValueChange={setScoreType}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Chọn loại điểm" /></SelectTrigger>
                      <SelectContent>
                        {SCORE_TYPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {[
                    { label: "Cho phép xem điểm sau khi nộp", v: showScore, set: setShowScore },
                    { label: "Cho phép xem đáp án sau khi nộp", v: showAnswers, set: setShowAnswers },
                    { label: "Cho phép xem bài làm sau khi nộp", v: showWork, set: setShowWork },
                  ].map((t) => (
                    <div key={t.label} className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">{t.label}</span>
                      <Switch checked={t.v} onCheckedChange={t.set} />
                    </div>
                  ))}
                  <div className="flex items-start justify-between gap-4 pt-2 border-t">
                    <div>
                      <div className="text-sm text-slate-700">Giới hạn học sinh tham gia</div>
                      <p className="text-xs text-slate-500 mt-1">
                        OFF: Học sinh cả trường có thể thấy kỳ thi và tự tham gia<br />
                        ON: Quản trị viên ghi danh học sinh được tham gia
                      </p>
                    </div>
                    <Switch className="mt-1" checked={limitStudents} onCheckedChange={setLimitStudents} />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => navigate({ to: backTo })}>Đóng</Button>
              <Button className="bg-indigo-700 hover:bg-indigo-800" disabled={!canNext1} onClick={() => setStep(2)}>

                Tiếp theo
              </Button>
            </div>
          </div>
        )}

        {/* ---------------- Bước 2 ---------------- */}
        {step === 2 && (
          <div className="p-6 space-y-5">
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { key: "bank-exam" as const, title: "Thêm từ Đề thi của trường", desc: "Chọn một đề thi đã biên soạn sẵn.", icon: FileCheck2, cls: "bg-emerald-500" },
                { key: "compose" as const, title: "Thêm mới", desc: "Thêm thủ công hoặc lấy từ Ngân hàng câu hỏi kỳ thi.", icon: Pencil, cls: "bg-indigo-600" },
                { key: "upload" as const, title: "Tải lên từ tệp", desc: "Tải PDF, ảnh, Word… và khai báo đáp án.", icon: Upload, cls: "bg-amber-500" },
              ].map((b) => (
                <button
                  key={b.key}
                  onClick={() => setMode(b.key)}
                  className={`text-left rounded-xl border p-4 flex gap-3 transition ${
                    mode === b.key ? "border-indigo-500 ring-2 ring-indigo-100 bg-indigo-50/40" : "hover:border-indigo-300"
                  }`}
                >
                  <div className={`h-11 w-11 shrink-0 rounded-xl ${b.cls} text-white flex items-center justify-center`}>
                    <b.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">{b.title}</div>
                    <div className="text-sm text-slate-500 mt-0.5">{b.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            {mode === "bank-exam" && (
              <div className="rounded-xl border">
                <div className="px-4 py-3 border-b flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Danh sách đề thi của trường</span>
                  <Button className="bg-indigo-700 hover:bg-indigo-800" disabled={!pickedExam} onClick={useExam}>
                    Sử dụng
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12" />
                      <TableHead>Tên đề thi</TableHead>
                      <TableHead className="text-center">Khối</TableHead>
                      <TableHead>Môn</TableHead>
                      <TableHead className="text-center">Số câu</TableHead>
                      <TableHead className="text-center">Thời gian</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SCHOOL_EXAMS.map((e) => (
                      <TableRow key={e.id} className="cursor-pointer" onClick={() => setPickedExam(e.id)}>
                        <TableCell>
                          <input type="radio" checked={pickedExam === e.id} onChange={() => setPickedExam(e.id)} />
                        </TableCell>
                        <TableCell className="font-medium text-slate-800">{e.name}</TableCell>
                        <TableCell className="text-center">{e.grade}</TableCell>
                        <TableCell>{e.subject}</TableCell>
                        <TableCell className="text-center">{e.questions}</TableCell>
                        <TableCell className="text-center">{e.minutes} phút</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {mode === "upload" && (
              <div className="rounded-xl border border-dashed p-12 text-center">
                <Upload className="h-8 w-8 mx-auto text-slate-400" />
                <div className="mt-3 font-semibold text-slate-700">Tải lên tệp đề thi</div>
                <p className="text-sm text-slate-500 mt-1">Hỗ trợ PDF, ảnh, Word… sau khi tải lên có thể khai báo đáp án.</p>
                <Button variant="outline" className="mt-4" onClick={() => toast.info("Chọn tệp đề thi để tải lên.")}>
                  Chọn tệp
                </Button>
              </div>
            )}

            {(mode === "compose" || questions.length > 0) && (
              <div className="grid lg:grid-cols-[340px_1fr] gap-5">
                {mode === "compose" && (
                  <div>
                    <div className="font-semibold text-slate-800 mb-2">Thêm câu hỏi</div>
                    <button
                      onClick={() => setBankOpen(true)}
                      className="w-full text-left rounded-xl border p-3 flex gap-3 hover:border-indigo-300"
                    >
                      <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                        <Library className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">Thêm từ ngân hàng câu hỏi kỳ thi</div>
                        <div className="text-sm text-slate-500">Chọn nhiều câu đã có sẵn trong ngân hàng.</div>
                      </div>
                    </button>
                    <div className="text-sm text-slate-500 mt-4 mb-2">Hoặc soạn câu hỏi mới</div>
                    <div className="grid grid-cols-2 gap-2">
                      {NEW_TYPES.map((t) => (
                        <button
                          key={t.label}
                          onClick={() =>
                            setQuestions((qs) => [...qs, {
                              id: `new${Date.now()}${qs.length}`, content: `Câu hỏi mới – ${t.label}`,
                              type: t.label, level: "Nhận biết", grade, subject, topic: "Soạn mới",
                            }])
                          }
                          className="rounded-xl border p-3 flex items-center gap-2 text-sm text-slate-700 hover:border-indigo-300"
                        >
                          <span className={`h-8 w-8 rounded-lg flex items-center justify-center ${t.cls}`}>
                            <t.icon className="h-4 w-4" />
                          </span>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className={mode === "compose" ? "" : "lg:col-span-2"}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-slate-800">Đề đang soạn</div>
                    <div className="text-sm text-slate-500">
                      <b className="text-slate-800">{questions.length}</b> câu · <b className="text-slate-800">0</b>/{maxScore} điểm
                    </div>
                  </div>
                  <div className="rounded-xl border min-h-64 p-4">
                    {questions.length === 0 ? (
                      <div className="py-16 text-center text-slate-400">
                        <Target className="h-8 w-8 mx-auto" />
                        <div className="font-semibold text-slate-600 mt-3">Đề chưa có câu hỏi nào</div>
                        <p className="text-sm mt-1">Thêm câu từ ngân hàng câu hỏi, hoặc soạn câu mới bằng các ô bên trái.</p>
                      </div>
                    ) : (
                      <ol className="space-y-2">
                        {questions.map((q, i) => (
                          <li key={q.id} className="rounded-lg border p-3 flex items-start gap-3">
                            <span className="text-sm font-semibold text-slate-500 mt-0.5">{i + 1}.</span>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-slate-800">{q.content}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{q.type} · {q.level} · {q.topic}</div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setQuestions((v) => v.filter((x) => x.id !== q.id))}>
                              <X className="h-4 w-4" />
                            </Button>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>Quay lại</Button>
                <Button variant="outline" onClick={() => navigate({ to: backTo })}>Đóng</Button>
              </div>
              <Button className="bg-indigo-700 hover:bg-indigo-800" onClick={() => setStep(3)}>Tiếp theo</Button>

            </div>
          </div>
        )}

        {/* ---------------- Bước 3 ---------------- */}
        {step === 3 && (
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap gap-2 justify-end">
              <Button className="bg-indigo-700 hover:bg-indigo-800" onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4" /> Thêm thí sinh
              </Button>
              <Button variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50"
                disabled={!selCand.length}
                onClick={() => { setCandidates((c) => c.filter((id) => !selCand.includes(id))); setSelCand([]); toast.success("Đã xóa thí sinh."); }}>
                <Trash2 className="h-4 w-4" /> Xóa thí sinh
              </Button>
              <Button variant="outline" onClick={() => toast.success("Đang xuất excel danh sách thí sinh.")}>
                <FileSpreadsheet className="h-4 w-4" /> Xuất excel thí sinh
              </Button>
            </div>

            <div className="grid md:grid-cols-4 gap-3">
              <div>
                <Label className="text-sm">Khối học</Label>
                <Select value={fGrade} onValueChange={(v) => { setFGrade(v); setFClass("all"); }}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GRADES.map((g) => <SelectItem key={g} value={g}>Khối {g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Lớp học</Label>
                <Select value={fClass} onValueChange={setFClass}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">— Tất cả —</SelectItem>
                    {classes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Số CCCD</Label>
                <Input className="mt-1" placeholder="Nhập số CCCD" value={fCccd} onChange={(e) => setFCccd(e.target.value)} />
              </div>
              <div>
                <Label className="text-sm">Họ tên</Label>
                <Input className="mt-1" placeholder="Nhập họ tên" value={fName} onChange={(e) => setFName(e.target.value)} />
              </div>
            </div>

            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-14 text-center">STT</TableHead>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={candRows.length > 0 && candRows.every((c) => selCand.includes(c.id))}
                        onCheckedChange={(v) => setSelCand(v ? candRows.map((c) => c.id) : [])}
                      />
                    </TableHead>
                    <TableHead>Số CCCD</TableHead>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Ngày sinh</TableHead>
                    <TableHead>Lớp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-slate-400 py-8">Không có dữ liệu.</TableCell>
                    </TableRow>
                  ) : candRows.map((c, i) => (
                    <TableRow key={c.id}>
                      <TableCell className="text-center">{i + 1}</TableCell>
                      <TableCell>
                        <Checkbox
                          checked={selCand.includes(c.id)}
                          onCheckedChange={() => setSelCand((s) => s.includes(c.id) ? s.filter((x) => x !== c.id) : [...s, c.id])}
                        />
                      </TableCell>
                      <TableCell>{c.cccd}</TableCell>
                      <TableCell className="font-medium text-slate-800">{c.name}</TableCell>
                      <TableCell>{c.dob}</TableCell>
                      <TableCell>{c.klass}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>Quay lại</Button>
              <Button className="bg-indigo-700 hover:bg-indigo-800" onClick={() => setStep(4)}>Tiếp theo</Button>
            </div>
          </div>
        )}

        {/* ---------------- Bước 4 ---------------- */}
        {step === 4 && (
          <div className="p-6 space-y-4">
            <div className="text-sm font-semibold text-rose-600">
              Đã xếp {Math.min(arranged, candidates.length)}/{candidates.length} thí sinh vào các ca thi.
              Còn {Math.max(candidates.length - arranged, 0)} thí sinh chưa được xếp vào ca thi
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              <Button className="bg-indigo-700 hover:bg-indigo-800"
                onClick={() => { setEditShift(null); setSCode(""); setSName(""); setSCount("20"); setShiftOpen(true); }}>
                Thêm ca thi
              </Button>
              <Button variant="outline" onClick={() => {
                if (!shifts.length) return toast.error("Chưa có ca thi nào.");
                const per = Math.ceil(candidates.length / shifts.length);
                setShifts((v) => v.map((s) => ({ ...s, count: per })));
                toast.success("Đã sắp xếp thí sinh tự động.");
              }}>
                Sắp xếp thí sinh tự động
              </Button>
              <Button variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50"
                disabled={!selShifts.length}
                onClick={() => { setShifts((v) => v.filter((s) => !selShifts.includes(s.id))); setSelShifts([]); }}>
                Xóa ca thi đã chọn
              </Button>
              <Button variant="outline" onClick={() => toast.success("Đã làm mới danh sách ca thi.")}>
                <RefreshCw className="h-4 w-4" /> Làm mới
              </Button>
            </div>

            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-14 text-center">STT</TableHead>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={shifts.length > 0 && shifts.every((s) => selShifts.includes(s.id))}
                        onCheckedChange={(v) => setSelShifts(v ? shifts.map((s) => s.id) : [])}
                      />
                    </TableHead>
                    <TableHead className="text-center">Sửa ca thi</TableHead>
                    <TableHead className="text-center">Xem thí sinh ca thi</TableHead>
                    <TableHead>Mã ca thi</TableHead>
                    <TableHead>Tên ca thi</TableHead>
                    <TableHead className="text-right">Số lượng thí sinh</TableHead>
                    <TableHead className="text-center">Chia thí sinh chủ động theo ca thi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shifts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-slate-400 py-8">Chưa có ca thi nào.</TableCell>
                    </TableRow>
                  ) : shifts.map((s, i) => (
                    <TableRow key={s.id}>
                      <TableCell className="text-center">{i + 1}</TableCell>
                      <TableCell>
                        <Checkbox
                          checked={selShifts.includes(s.id)}
                          onCheckedChange={() => setSelShifts((v) => v.includes(s.id) ? v.filter((x) => x !== s.id) : [...v, s.id])}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <button className="text-indigo-700 hover:underline"
                          onClick={() => { setEditShift(s); setSCode(s.code); setSName(s.name); setSCount(String(s.count)); setShiftOpen(true); }}>
                          Sửa
                        </button>
                      </TableCell>
                      <TableCell className="text-center">
                        <button className="text-indigo-700 hover:underline" onClick={() => toast.info(`Xem ${s.count} thí sinh của ca ${s.code}.`)}>
                          Xem
                        </button>
                      </TableCell>
                      <TableCell>{s.code}</TableCell>
                      <TableCell>{s.name}</TableCell>
                      <TableCell className="text-right">{s.count}</TableCell>
                      <TableCell className="text-center text-sm">
                        <button className="text-indigo-700 hover:underline" onClick={() => toast.info("Thêm thí sinh vào ca thi.")}>Thêm</button>
                        <span className="mx-2 text-slate-300">||</span>
                        <button className="text-indigo-700 hover:underline" onClick={() => toast.info("Xóa thí sinh khỏi ca thi.")}>Xóa thí sinh</button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>Quay lại</Button>
              <Button className="bg-indigo-700 hover:bg-indigo-800"
                onClick={() => { toast.success("Đã tạo kỳ thi."); navigate({ to: backTo }); }}>
                Hoàn tất
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Popup ngân hàng câu hỏi kỳ thi */}
      <Dialog open={bankOpen} onOpenChange={setBankOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Chọn câu hỏi từ ngân hàng</DialogTitle>
            <p className="text-sm text-slate-500">Chọn một hoặc nhiều câu hỏi để thêm vào đề</p>
          </DialogHeader>
          <div className="flex flex-wrap gap-2">
            <Select value={bankGrade} onValueChange={setBankGrade}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>{GRADES.map((g) => <SelectItem key={g} value={g}>Khối {g}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={bankSubject} onValueChange={setBankSubject}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>{SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={bankType} onValueChange={setBankType}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {NEW_TYPES.map((t) => <SelectItem key={t.label} value={t.label}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="relative flex-1 min-w-56">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input className="pl-9" placeholder="Tìm theo nội dung câu hỏi, chương, bài học"
                value={bankQuery} onChange={(e) => setBankQuery(e.target.value)} />
            </div>
          </div>
          <div className="max-h-96 overflow-auto rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={bankRows.length > 0 && bankRows.every((b) => bankPicked.includes(b.id))}
                      onCheckedChange={(v) => setBankPicked(v ? bankRows.map((b) => b.id) : [])}
                    />
                  </TableHead>
                  <TableHead>Câu hỏi</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Mức độ</TableHead>
                  <TableHead>Khối</TableHead>
                  <TableHead>Môn</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bankRows.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-slate-400 py-8">Không có câu hỏi phù hợp.</TableCell></TableRow>
                ) : bankRows.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <Checkbox
                        checked={bankPicked.includes(b.id)}
                        onCheckedChange={() => setBankPicked((v) => v.includes(b.id) ? v.filter((x) => x !== b.id) : [...v, b.id])}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-800">{b.content}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{b.topic}</div>
                    </TableCell>
                    <TableCell className="text-sm">{b.type}</TableCell>
                    <TableCell className="text-sm">{b.level}</TableCell>
                    <TableCell className="text-sm">Khối {b.grade}</TableCell>
                    <TableCell className="text-sm">{b.subject}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter className="items-center sm:justify-between">
            <span className="text-sm text-slate-600">Đã chọn: <b className="text-indigo-700">{bankPicked.length}</b> câu hỏi</span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setBankOpen(false)}>Hủy</Button>
              <Button className="bg-indigo-700 hover:bg-indigo-800" disabled={!bankPicked.length} onClick={addFromBank}>
                <Plus className="h-4 w-4" /> Thêm vào đề
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Popup thêm thí sinh */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Thêm thí sinh</DialogTitle></DialogHeader>
          <div className="max-h-96 overflow-auto rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-12" />
                  <TableHead>Số CCCD</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Ngày sinh</TableHead>
                  <TableHead>Lớp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {CANDIDATE_POOL.filter((c) => !candidates.includes(c.id)).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Checkbox
                        checked={addPicked.includes(c.id)}
                        onCheckedChange={() => setAddPicked((v) => v.includes(c.id) ? v.filter((x) => x !== c.id) : [...v, c.id])}
                      />
                    </TableCell>
                    <TableCell>{c.cccd}</TableCell>
                    <TableCell className="font-medium text-slate-800">{c.name}</TableCell>
                    <TableCell>{c.dob}</TableCell>
                    <TableCell>{c.klass}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Hủy</Button>
            <Button className="bg-indigo-700 hover:bg-indigo-800" disabled={!addPicked.length}
              onClick={() => { setCandidates((c) => [...c, ...addPicked]); setAddPicked([]); setAddOpen(false); toast.success("Đã thêm thí sinh."); }}>
              Thêm vào kỳ thi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Popup ca thi */}
      <Dialog open={shiftOpen} onOpenChange={setShiftOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editShift ? "Sửa ca thi" : "Thêm ca thi"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-sm">Mã ca thi <span className="text-rose-500">*</span></Label>
              <Input className="mt-1" value={sCode} onChange={(e) => setSCode(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm">Tên ca thi <span className="text-rose-500">*</span></Label>
              <Input className="mt-1" value={sName} onChange={(e) => setSName(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm">Số lượng thí sinh</Label>
              <Input className="mt-1" value={sCount} onChange={(e) => setSCount(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShiftOpen(false)}>Hủy</Button>
            <Button className="bg-indigo-700 hover:bg-indigo-800" disabled={!sCode || !sName} onClick={saveShift}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
