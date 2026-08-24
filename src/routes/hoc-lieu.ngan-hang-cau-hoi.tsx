import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Plus, Trash2, Share2, Search, Pencil, X, ChevronDown, MoreHorizontal, Copy,
  CircleDot, CheckSquare, FileText, Move, TextCursorInput, Link2, ToggleLeft,
  ArrowUpDown, Clock3, CheckCircle2,
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
import { KNOWLEDGE_TREE } from "@/lib/knowledge-tree";
import {
  PickQuestionTypeModal, QuestionFormModal, QuestionTypeIcon,
  QUESTION_TYPE_LABEL, type QuestionType, type QuestionDraft,
} from "@/components/QuestionFormModal";
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

type QType = QuestionType;
type Level = "Nhận biết" | "Thông hiểu" | "Vận dụng" | "Vận dụng cao";
type ShareStatus = "none" | "pending" | "approved";

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
  lesson?: string;
  shareStatus?: ShareStatus;
  answers?: Answer[];
  tfTitle?: string;
  tfItems?: TFItem[];
};

const TYPE_LABEL = QUESTION_TYPE_LABEL;

const LEVELS: Level[] = ["Nhận biết", "Thông hiểu", "Vận dụng", "Vận dụng cao"];
const GRADES = ["1", "2", "3", "4", "5"];
const SUBJECTS = ["Toán", "Tiếng Việt", "Tiếng Anh", "Tự nhiên và Xã hội", "Đạo đức"];
const REVIEWER_NAME = "Cô Nguyễn Thị Mai (Tổ trưởng tổ Toán)";

/** Look up chapter/lesson labels from KNOWLEDGE_TREE */
function chapterTitle(id?: string) {
  return KNOWLEDGE_TREE.find((c) => c.id === id)?.title ?? "";
}
function lessonTitle(chapId?: string, lesId?: string) {
  const ch = KNOWLEDGE_TREE.find((c) => c.id === chapId);
  return ch?.units.find((u) => u.id === lesId)?.title ?? "";
}

const SEED: Question[] = [
  {
    id: "q1", content: "Số nào lớn nhất trong các số sau: 3 210, 3 120, 3 201, 3 102?",
    type: "single", level: "Nhận biết", source: "Phùng Thúy Hằng", updatedAt: "12/06/2026",
    grade: "4", subject: "Toán", chapter: "t4-ch1", lesson: "t4-b1", shareStatus: "approved",
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
    grade: "4", subject: "Toán", chapter: "t4-ch3", lesson: "t4-b11", shareStatus: "pending",
    answers: [
      { text: "2/4", correct: true }, { text: "3/6", correct: true },
      { text: "2/3", correct: false }, { text: "5/10", correct: true },
    ],
  },
  {
    id: "q3", content: "Trình bày cách tìm hai số khi biết tổng và hiệu của chúng.",
    type: "essay", level: "Vận dụng", source: "Phùng Thúy Hằng", updatedAt: "02/06/2026",
    grade: "4", subject: "Toán", chapter: "t4-ch1", lesson: "t4-b5", shareStatus: "none",
  },
  {
    id: "q4", content: "Các phát biểu sau đúng hay sai?",
    type: "truefalse", level: "Nhận biết", source: "Phùng Thúy Hằng", updatedAt: "28/06/2026",
    grade: "4", subject: "Toán", chapter: "t4-ch1", lesson: "t4-b3", shareStatus: "none",
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

/** Chuyển dữ liệu popup thêm mới thành câu hỏi trong ngân hàng của giáo viên. */
function draftToQuestion(d: QuestionDraft): Question {
  return {
    id: `q_${Date.now()}`,
    content: d.title || d.content,
    type: d.type,
    level: d.level as Level,
    source: "Phùng Thúy Hằng",
    updatedAt: today(),
    grade: d.grade, subject: d.subject, chapter: d.chapter, lesson: d.lesson,
    shareStatus: "none",
    answers: d.answers,
    tfTitle: d.type === "truefalse" ? d.content : undefined,
    tfItems: d.tfItems,
  };
}

function TypeIcon({ type }: { type: QType }) {
  return <QuestionTypeIcon type={type} />;
}

function ShareStatusTag({ status }: { status: ShareStatus }) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock3 className="h-3 w-3" /> Chờ duyệt
      </span>
    );
  }
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="h-3 w-3" /> Đã duyệt
      </span>
    );
  }
  return null;
}

function NganHangCauHoiPage() {
  const [items, setItems] = useState<Question[]>(SEED);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [keyword, setKeyword] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [filterGrade, setFilterGrade] = useState<string>("all");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [filterChapter, setFilterChapter] = useState<string>("all");
  const [filterLesson, setFilterLesson] = useState<string>("all");

  const [pickType, setPickType] = useState(false);
  const [fromFile, setFromFile] = useState(false);
  const [creating, setCreating] = useState<QType | null>(null);
  const [viewing, setViewing] = useState<Question | null>(null);
  const [sharing, setSharing] = useState<Question[] | null>(null);

  const filterLessons = useMemo(
    () => KNOWLEDGE_TREE.find((c) => c.id === filterChapter)?.units ?? [],
    [filterChapter],
  );

  const filtered = useMemo(() => {
    return items.filter((q) => {
      if (keyword && !q.content.toLowerCase().includes(keyword.toLowerCase())) return false;
      if (filterType !== "all" && q.type !== filterType) return false;
      if (filterLevel !== "all" && q.level !== filterLevel) return false;
      if (filterGrade !== "all" && q.grade !== filterGrade) return false;
      if (filterSubject !== "all" && q.subject !== filterSubject) return false;
      if (filterChapter !== "all" && q.chapter !== filterChapter) return false;
      if (filterLesson !== "all" && q.lesson !== filterLesson) return false;
      return true;
    });
  }, [items, keyword, filterType, filterLevel, filterGrade, filterSubject, filterChapter, filterLesson]);

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
  const openShareSelected = () => {
    if (selected.size === 0) return toast.error("Chưa chọn câu hỏi nào");
    setSharing(items.filter((q) => selected.has(q.id)));
  };

  const handleCreated = (q: Question) => {
    setItems((prev) => [q, ...prev]);
    setCreating(null);
    toast.success("Đã thêm câu hỏi mới");
  };
  const duplicateOne = (q: Question) => {
    const clone: Question = { ...q, id: `q_${Date.now()}`, updatedAt: today(), shareStatus: "none", content: `${q.content} (bản sao)` };
    setItems((prev) => [clone, ...prev]);
    toast.success("Đã nhân bản câu hỏi");
  };
  const removeOne = (id: string) => {
    setItems((prev) => prev.filter((q) => q.id !== id));
    toast.success("Đã xóa câu hỏi");
  };

  const confirmShare = (ids: string[]) => {
    setItems((prev) => prev.map((q) => ids.includes(q.id) ? { ...q, shareStatus: "pending" } : q));
    setSharing(null);
    setSelected(new Set());
    toast.success(`Đã gửi ${ids.length} câu hỏi chờ tổ trưởng duyệt`);
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
            <Button variant="outline" onClick={openShareSelected} className="gap-1.5">
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

        {/* Filter row 1: search + type + level */}
        <div className="px-4 pt-4 flex flex-wrap items-center gap-3">
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

        {/* Filter row 2: khối / môn / chủ đề / bài học */}
        <div className="p-4 flex flex-wrap items-center gap-3 border-b bg-slate-50/60">
          <Select value={filterGrade} onValueChange={setFilterGrade}>
            <SelectTrigger className="w-36 bg-white"><SelectValue placeholder="Khối" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả khối</SelectItem>
              {GRADES.map((g) => <SelectItem key={g} value={g}>Khối {g}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterSubject} onValueChange={setFilterSubject}>
            <SelectTrigger className="w-44 bg-white"><SelectValue placeholder="Môn" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả môn</SelectItem>
              {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterChapter} onValueChange={(v) => { setFilterChapter(v); setFilterLesson("all"); }}>
            <SelectTrigger className="w-64 bg-white"><SelectValue placeholder="Chủ đề" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chủ đề</SelectItem>
              {KNOWLEDGE_TREE.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterLesson} onValueChange={setFilterLesson} disabled={filterChapter === "all"}>
            <SelectTrigger className="w-64 bg-white"><SelectValue placeholder="Bài học" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả bài học</SelectItem>
              {filterLessons.map((u) => <SelectItem key={u.id} value={u.id}>{u.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="p-2 overflow-x-auto">
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
                <TableHead className="min-w-[260px]">Câu hỏi</TableHead>
                <TableHead className="w-20 text-center">Khối</TableHead>
                <TableHead className="w-28">Môn</TableHead>
                <TableHead className="min-w-[220px]">Chủ đề &amp; Bài học</TableHead>
                <TableHead className="w-48">Loại câu hỏi</TableHead>
                <TableHead className="w-36">Mức độ</TableHead>
                <TableHead className="w-44">Nguồn</TableHead>
                
                <TableHead className="w-16 text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((q, i) => (
                <TableRow key={q.id} className="hover:bg-indigo-50/40 align-top">
                  <TableCell className="text-center text-slate-500">{i + 1}</TableCell>
                  <TableCell>
                    <Checkbox checked={selected.has(q.id)} onCheckedChange={() => toggle(q.id)} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => setViewing(q)}
                        className="text-left text-slate-800 hover:text-indigo-700 hover:underline line-clamp-2 cursor-pointer"
                      >
                        {q.content}
                      </button>
                      {q.shareStatus && q.shareStatus !== "none" && (
                        <ShareStatusTag status={q.shareStatus} />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm text-slate-700">{q.grade ? `Khối ${q.grade}` : "—"}</TableCell>
                  <TableCell className="text-sm text-slate-700">{q.subject ?? "—"}</TableCell>
                  <TableCell className="text-sm text-slate-700">
                    {q.chapter ? (
                      <div className="space-y-0.5">
                        <div className="font-medium text-slate-800 text-xs leading-snug">{chapterTitle(q.chapter)}</div>
                        {q.lesson && <div className="text-xs text-slate-500 leading-snug">{lessonTitle(q.chapter, q.lesson)}</div>}
                      </div>
                    ) : "—"}
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
                  
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="h-8 w-8 rounded-md hover:bg-slate-100 text-slate-500 inline-flex items-center justify-center">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => setSharing([q])} className="gap-2">
                          <Share2 className="h-4 w-4" /> Chia sẻ
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicateOne(q)} className="gap-2">
                          <Copy className="h-4 w-4" /> Nhân bản
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => removeOne(q.id)} className="gap-2 text-rose-600 focus:text-rose-700">
                          <Trash2 className="h-4 w-4" /> Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="text-center text-sm text-slate-500 py-10">
                    Không có câu hỏi phù hợp.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pick type modal */}
      <PickQuestionTypeModal
        open={pickType}
        onClose={() => setPickType(false)}
        onPick={(t) => { setPickType(false); setCreating(t); }}
      />

      {/* From file modal */}
      <FromFileModal open={fromFile} onClose={() => setFromFile(false)} />

      {/* Create modal */}
      {creating && (
        <QuestionFormModal
          type={creating}
          onClose={() => setCreating(null)}
          onSave={(d) => handleCreated(draftToQuestion(d))}
        />
      )}

      {/* Share confirmation modal */}
      {sharing && (
        <ShareQuestionModal
          questions={sharing}
          onClose={() => setSharing(null)}
          onConfirm={confirmShare}
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

/* ─────────────────  From file modal  ───────────────── */
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

/* ─────────────────  Share question modal  ───────────────── */
function ShareQuestionModal({
  questions, onClose, onConfirm,
}: { questions: Question[]; onClose: () => void; onConfirm: (ids: string[]) => void }) {
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-indigo-700">Chia sẻ lên Ngân hàng câu hỏi chung của trường</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm text-slate-700">
          <p>
            Bạn xác nhận đề nghị chia sẻ <b>{questions.length}</b> câu hỏi lên Ngân hàng câu hỏi của trường. Các câu hỏi bạn chia sẻ có thể:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>Được sử dụng bởi các giáo viên khác trong trường</li>
            <li>Được sử dụng để xây dựng các đề thi cấp trường</li>
          </ul>
          <div className="rounded-lg border bg-slate-50 p-3 text-sm">
            Người duyệt: <span className="font-bold text-slate-900">{REVIEWER_NAME}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => onConfirm(questions.map((q) => q.id))}>Xác nhận</Button>
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
            {question.shareStatus && question.shareStatus !== "none" && (
              <ShareStatusTag status={question.shareStatus} />
            )}
          </div>
          {(question.chapter || question.lesson) && (
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-700">{chapterTitle(question.chapter)}</span>
              {question.lesson && <span> · {lessonTitle(question.chapter, question.lesson)}</span>}
            </div>
          )}
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
