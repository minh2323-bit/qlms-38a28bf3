import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Plus, Search, X, ChevronDown, CircleDot, CheckSquare, FileText, Move,
  TextCursorInput, Link2, ToggleLeft, ArrowUpDown,
  SlidersHorizontal, Check, Ban, MinusCircle,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { KNOWLEDGE_TREE } from "@/lib/knowledge-tree";
import {
  TYPE_LABEL, LEVELS, GRADES, SUBJECTS, PROPOSERS, STATUS_LABEL,
  type QType, type Level, type ApprovalStatus,
  chapterTitle, lessonTitle,
} from "@/lib/shared-exam-bank";
import {
  FilterSelect, ApprovalTag, RejectReasonModal, StatusTabs,
  ConfirmRemoveModal, ViewRejectReasonModal, nowStamp,
} from "@/components/ExamBankShared";
import { toast } from "sonner";

export const Route = createFileRoute("/ky-thi/ngan-hang-cau-hoi")({
  head: () => ({
    meta: [
      { title: "Ngân hàng câu hỏi kỳ thi | Tiểu học Tô Hiệu" },
      { name: "description", content: "Ngân hàng câu hỏi dùng chung cả trường, phục vụ xây dựng đề thi và kỳ thi toàn trường." },
      { property: "og:title", content: "Ngân hàng câu hỏi kỳ thi" },
      { property: "og:description", content: "Ngân hàng câu hỏi dùng chung cả trường, phục vụ xây dựng đề thi và kỳ thi toàn trường." },
    ],
  }),
  component: Page,
});

/** Giáo viên hiện tại có quyền trực tiếp thêm mới câu hỏi dùng chung hay không. */
const CAN_CREATE = true;

type Answer = { text: string; correct: boolean };
type TFItem = { text: string; correct: boolean };
type Question = {
  id: string;
  content: string;
  type: QType;
  level: Level;
  proposer: string;
  grade?: string;
  subject?: string;
  chapter?: string;
  lesson?: string;
  status: ApprovalStatus;
  rejectReason?: string;
  rejectedAt?: string;
  answers?: Answer[];
  tfTitle?: string;
  tfItems?: TFItem[];
};

const SEED: Question[] = [
  {
    id: "sq1", content: "Số nào lớn nhất trong các số sau: 3 210, 3 120, 3 201, 3 102?",
    type: "single", level: "Nhận biết", proposer: "Phùng Thúy Hằng",
    grade: "4", subject: "Toán", chapter: "t4-ch1", lesson: "t4-b1", status: "approved",
    answers: [
      { text: "3 210", correct: true }, { text: "3 120", correct: false },
      { text: "3 201", correct: false }, { text: "3 102", correct: false },
    ],
  },
  {
    id: "sq2", content: "Chọn các phân số bằng 1/2:",
    type: "multiple", level: "Thông hiểu", proposer: "Nguyễn Văn A",
    grade: "4", subject: "Toán", chapter: "t4-ch3", lesson: "t4-b11", status: "pending",
    answers: [
      { text: "2/4", correct: true }, { text: "3/6", correct: true },
      { text: "2/3", correct: false }, { text: "5/10", correct: true },
    ],
  },
  {
    id: "sq3", content: "Trình bày cách tìm hai số khi biết tổng và hiệu của chúng.",
    type: "essay", level: "Vận dụng", proposer: "Trần Thị Bích",
    grade: "4", subject: "Toán", chapter: "t4-ch1", lesson: "t4-b5", status: "pending",
  },
  {
    id: "sq4", content: "Các phát biểu sau đúng hay sai?",
    type: "truefalse", level: "Nhận biết", proposer: "Lê Minh Châu",
    grade: "4", subject: "Toán", chapter: "t4-ch1", lesson: "t4-b3", status: "rejected",
    rejectReason: "Nội dung trùng với câu hỏi đã có trong ngân hàng.",
    rejectedAt: "12/08/2026 09:15",
    tfTitle: "Xét các mệnh đề về số tự nhiên",
    tfItems: [
      { text: "Số 0 là số tự nhiên bé nhất.", correct: true },
      { text: "Mọi số chẵn đều chia hết cho 4.", correct: false },
    ],
  },
  {
    id: "sq5", content: "Điền số thích hợp vào chỗ trống: 1 giờ 15 phút = ... phút",
    type: "fill", level: "Thông hiểu", proposer: "Đỗ Quang Huy",
    grade: "3", subject: "Toán", chapter: "t4-ch1", lesson: "t4-b2", status: "approved",
  },
];

export function TypeIcon({ type }: { type: QType }) {
  const map = {
    single: <CircleDot className="h-4 w-4 text-indigo-600" />,
    multiple: <CheckSquare className="h-4 w-4 text-violet-600" />,
    essay: <FileText className="h-4 w-4 text-amber-600" />,
    truefalse: <ToggleLeft className="h-4 w-4 text-emerald-600" />,
    drag: <Move className="h-4 w-4 text-sky-600" />,
    fill: <TextCursorInput className="h-4 w-4 text-teal-600" />,
    match: <Link2 className="h-4 w-4 text-rose-600" />,
    order: <ArrowUpDown className="h-4 w-4 text-fuchsia-600" />,
  } as const;
  return map[type];
}

type Filters = {
  keyword: string; type: string; level: string; grade: string;
  subject: string; chapter: string; lesson: string; status: string; proposer: string;
};
const EMPTY_FILTERS: Filters = {
  keyword: "", type: "all", level: "all", grade: "all",
  subject: "all", chapter: "all", lesson: "all", status: "all", proposer: "all",
};

function Page() {
  const [items, setItems] = useState<Question[]>(SEED);
  const [tab, setTab] = useState<ApprovalStatus>("pending");
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [panel, setPanel] = useState(false);

  const [pickType, setPickType] = useState(false);
  const [creating, setCreating] = useState<QType | null>(null);
  const [rejecting, setRejecting] = useState<Question | null>(null);
  const [removing, setRemoving] = useState<Question | null>(null);
  const [viewReason, setViewReason] = useState<Question | null>(null);

  const draftLessons = useMemo(
    () => KNOWLEDGE_TREE.find((c) => c.id === draft.chapter)?.units ?? [],
    [draft.chapter],
  );

  const counts = useMemo(() => ({
    pending: items.filter((q) => q.status === "pending").length,
    approved: items.filter((q) => q.status === "approved").length,
    rejected: items.filter((q) => q.status === "rejected").length,
  }), [items]);

  const filtered = useMemo(() => items.filter((q) => {
    const f = applied;
    if (q.status !== tab) return false;
    if (f.keyword && !q.content.toLowerCase().includes(f.keyword.toLowerCase())) return false;
    if (f.type !== "all" && q.type !== f.type) return false;
    if (f.level !== "all" && q.level !== f.level) return false;
    if (f.grade !== "all" && q.grade !== f.grade) return false;
    if (f.subject !== "all" && q.subject !== f.subject) return false;
    if (f.chapter !== "all" && q.chapter !== f.chapter) return false;
    if (f.lesson !== "all" && q.lesson !== f.lesson) return false;
    if (f.status !== "all" && q.status !== f.status) return false;
    if (f.proposer !== "all" && q.proposer !== f.proposer) return false;
    return true;
  }), [items, applied]);

  const activeCount = useMemo(
    () => Object.entries(applied).filter(([k, v]) => (k === "keyword" ? v !== "" : v !== "all")).length,
    [applied],
  );

  const approve = (q: Question) => {
    setItems((p) => p.map((x) => x.id === q.id ? { ...x, status: "approved", rejectReason: undefined } : x));
    toast.success("Đã duyệt câu hỏi vào ngân hàng dùng chung");
  };
  const doReject = (q: Question, reason: string) => {
    setItems((p) => p.map((x) => x.id === q.id ? { ...x, status: "rejected", rejectReason: reason } : x));
    setRejecting(null);
    toast.success("Đã từ chối câu hỏi");
  };
  const removeOne = (q: Question) => {
    setItems((p) => p.filter((x) => x.id !== q.id));
    toast.success("Đã gỡ câu hỏi khỏi ngân hàng dùng chung");
  };

  return (
    <AppShell>
      <div className="bg-white rounded-2xl border shadow-sm">
        <div className="p-4 flex items-center justify-between border-b gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Ngân hàng câu hỏi kỳ thi</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Ngân hàng câu hỏi dùng chung cả trường, đáp ứng chuyên môn để sử dụng xây dựng các đề thi, kỳ thi toàn trường.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {CAN_CREATE ? (
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
                  <DropdownMenuItem onClick={() => toast.info("Chọn tệp câu hỏi...")}>
                    Thêm từ tệp
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setPickType(true)}>Thêm mới</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button disabled className="gap-1.5" title="Chỉ giáo viên được phân quyền mới được thêm mới">
                <Plus className="h-4 w-4" /> Thêm mới
              </Button>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div className="px-4 py-3 flex items-center gap-3 border-b bg-slate-50/60">
          <Button variant="outline" className="gap-1.5" onClick={() => { setDraft(applied); setPanel(true); }}>
            <SlidersHorizontal className="h-4 w-4" /> Bộ lọc
            {activeCount > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-indigo-600 text-white text-[11px] font-semibold">
                {activeCount}
              </span>
            )}
          </Button>
          {activeCount > 0 && (
            <button
              onClick={() => { setApplied(EMPTY_FILTERS); setDraft(EMPTY_FILTERS); }}
              className="text-xs text-slate-500 hover:text-rose-600 cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          )}
          <div className="ml-auto text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{filtered.length}</span> câu hỏi
          </div>
        </div>

        <div className="p-2 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-12 text-center">STT</TableHead>
                <TableHead className="min-w-[260px]">Câu hỏi</TableHead>
                <TableHead className="w-20 text-center">Khối</TableHead>
                <TableHead className="w-28">Môn</TableHead>
                <TableHead className="min-w-[200px]">Chủ đề &amp; Bài học</TableHead>
                <TableHead className="w-44">Loại câu hỏi</TableHead>
                <TableHead className="w-32">Mức độ</TableHead>
                <TableHead className="w-40">Người đề xuất</TableHead>
                <TableHead className="w-40 text-center">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((q, i) => (
                <TableRow key={q.id} className="hover:bg-indigo-50/40 align-top">
                  <TableCell className="text-center text-slate-500">{i + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-start gap-2">
                      <span className="text-slate-800 line-clamp-2">{q.content}</span>
                      <ApprovalTag status={q.status} />
                    </div>
                    {q.status === "rejected" && q.rejectReason && (
                      <div className="text-[11px] text-rose-600 mt-1 italic">Lý do: {q.rejectReason}</div>
                    )}
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
                  <TableCell className="text-sm text-slate-600">{q.proposer}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1.5">
                      {q.status === "approved" ? (
                        <button
                          onClick={() => removeOne(q)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <MinusCircle className="h-4 w-4" /> Gỡ bỏ
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => approve(q)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                          >
                            <Check className="h-4 w-4" /> Duyệt
                          </button>
                          {q.status !== "rejected" && (
                            <button
                              onClick={() => setRejecting(q)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                            >
                              <Ban className="h-4 w-4" /> Từ chối
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-sm text-slate-500 py-10">
                    Không có câu hỏi phù hợp.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Filter side panel */}
      <Sheet open={panel} onOpenChange={setPanel}>
        <SheetContent side="left" className="w-[380px] sm:max-w-[380px] flex flex-col p-0">
          <SheetHeader className="px-5 py-4 border-b">
            <SheetTitle className="text-indigo-700">Bộ lọc câu hỏi</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <div>
              <Label className="text-sm">Từ khóa</Label>
              <div className="relative mt-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  className="pl-8"
                  value={draft.keyword}
                  onChange={(e) => setDraft({ ...draft, keyword: e.target.value })}
                  placeholder="Tìm theo nội dung câu hỏi..."
                />
              </div>
            </div>
            <FilterSelect label="Trạng thái" value={draft.status} onChange={(v) => setDraft({ ...draft, status: v })}
              allLabel="Tất cả trạng thái"
              options={(Object.keys(STATUS_LABEL) as ApprovalStatus[]).map((s) => ({ value: s, label: STATUS_LABEL[s] }))} />
            <FilterSelect label="Người đề xuất" value={draft.proposer} onChange={(v) => setDraft({ ...draft, proposer: v })}
              allLabel="Tất cả giáo viên trong tổ"
              options={PROPOSERS.map((p) => ({ value: p, label: p }))} />
            <FilterSelect label="Loại câu hỏi" value={draft.type} onChange={(v) => setDraft({ ...draft, type: v })}
              allLabel="Tất cả loại câu hỏi"
              options={(Object.keys(TYPE_LABEL) as QType[]).map((k) => ({ value: k, label: TYPE_LABEL[k] }))} />
            <FilterSelect label="Mức độ" value={draft.level} onChange={(v) => setDraft({ ...draft, level: v })}
              allLabel="Tất cả mức độ" options={LEVELS.map((l) => ({ value: l, label: l }))} />
            <FilterSelect label="Khối" value={draft.grade} onChange={(v) => setDraft({ ...draft, grade: v })}
              allLabel="Tất cả khối" options={GRADES.map((g) => ({ value: g, label: `Khối ${g}` }))} />
            <FilterSelect label="Môn" value={draft.subject} onChange={(v) => setDraft({ ...draft, subject: v })}
              allLabel="Tất cả môn" options={SUBJECTS.map((s) => ({ value: s, label: s }))} />
            <FilterSelect label="Chủ đề" value={draft.chapter}
              onChange={(v) => setDraft({ ...draft, chapter: v, lesson: "all" })}
              allLabel="Tất cả chủ đề" options={KNOWLEDGE_TREE.map((c) => ({ value: c.id, label: c.title }))} />
            <FilterSelect label="Bài học" value={draft.lesson} onChange={(v) => setDraft({ ...draft, lesson: v })}
              disabled={draft.chapter === "all"}
              allLabel="Tất cả bài học" options={draftLessons.map((u) => ({ value: u.id, label: u.title }))} />
          </div>
          <SheetFooter className="px-5 py-4 border-t flex-row gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setDraft(EMPTY_FILTERS)}>Đặt lại</Button>
            <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 gap-1.5"
              onClick={() => { setApplied(draft); setPanel(false); }}>
              <Search className="h-4 w-4" /> Tìm kiếm
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <PickTypeModal open={pickType} onClose={() => setPickType(false)}
        onPick={(t) => { setPickType(false); setCreating(t); }} />

      {creating && (
        <CreateQuestionModal
          type={creating}
          onClose={() => setCreating(null)}
          onSave={(q) => { setItems((p) => [q, ...p]); setCreating(null); toast.success("Đã thêm câu hỏi vào ngân hàng dùng chung"); }}
        />
      )}

      {rejecting && (
        <RejectReasonModal name={rejecting.content} proposer={rejecting.proposer}
          onClose={() => setRejecting(null)}
          onConfirm={(reason) => doReject(rejecting, reason)} />
      )}
    </AppShell>
  );
}

/* ───────────── Pick type modal ───────────── */
function PickTypeModal({
  open, onClose, onPick,
}: { open: boolean; onClose: () => void; onPick: (t: QType) => void }) {
  const options: { key: QType; title: string; desc: string; Icon: typeof CircleDot; bg: string; color: string }[] = [
    { key: "single", title: "Trắc nghiệm 1 đáp án", desc: "Chọn 1 phương án đúng", Icon: CircleDot, bg: "bg-indigo-50", color: "text-indigo-600" },
    { key: "multiple", title: "Trắc nghiệm nhiều đáp án", desc: "Chọn nhiều phương án đúng", Icon: CheckSquare, bg: "bg-violet-50", color: "text-violet-600" },
    { key: "essay", title: "Tự luận", desc: "Học sinh trả lời tự luận", Icon: FileText, bg: "bg-amber-50", color: "text-amber-600" },
    { key: "truefalse", title: "Đúng - Sai", desc: "Chọn Đ hoặc S cho từng mệnh đề", Icon: ToggleLeft, bg: "bg-emerald-50", color: "text-emerald-600" },
    { key: "drag", title: "Kéo thả", desc: "Kéo thả các mục vào đúng vị trí", Icon: Move, bg: "bg-sky-50", color: "text-sky-600" },
    { key: "fill", title: "Điền khuyết", desc: "Điền từ vào chỗ trống", Icon: TextCursorInput, bg: "bg-teal-50", color: "text-teal-600" },
    { key: "match", title: "Nối", desc: "Nối các đáp án tương ứng", Icon: Link2, bg: "bg-rose-50", color: "text-rose-600" },
    { key: "order", title: "Sắp xếp", desc: "Sắp xếp các mục theo thứ tự đúng", Icon: ArrowUpDown, bg: "bg-fuchsia-50", color: "text-fuchsia-600" },
  ];
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader><DialogTitle className="text-indigo-700">Chọn dạng câu hỏi</DialogTitle></DialogHeader>
        <div className="grid grid-cols-3 gap-3">
          {options.map(({ key, title, desc, Icon, bg, color }) => (
            <button key={key} onClick={() => onPick(key)}
              className="text-left rounded-xl border border-slate-200 p-4 hover:border-indigo-400 hover:shadow-md transition cursor-pointer">
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

/* ───────────── Create question modal (không có field Chia sẻ nội bộ) ───────────── */
function CreateQuestionModal({
  type, onClose, onSave,
}: { type: QType; onClose: () => void; onSave: (q: Question) => void }) {
  const [grade, setGrade] = useState("4");
  const [subject, setSubject] = useState("Toán");
  const [chapter, setChapter] = useState("");
  const [lesson, setLesson] = useState("");
  const [level, setLevel] = useState<Level>("Nhận biết");
  const [content, setContent] = useState("");
  const [shuffle, setShuffle] = useState(true);
  const [answers, setAnswers] = useState<Answer[]>([
    { text: "", correct: false }, { text: "", correct: false },
    { text: "", correct: false }, { text: "", correct: false },
  ]);
  const [tfTitle, setTfTitle] = useState("");
  const [tfItems, setTfItems] = useState<TFItem[]>([
    { text: "", correct: true }, { text: "", correct: true },
  ]);

  const lessons = useMemo(() => KNOWLEDGE_TREE.find((c) => c.id === chapter)?.units ?? [], [chapter]);
  const isSingle = type === "single";
  const isTF = type === "truefalse";
  const isChoice = isSingle || type === "multiple";

  const setAnswer = (idx: number, patch: Partial<Answer>) => {
    setAnswers((prev) => prev.map((a, i) => {
      if (i !== idx) return isSingle && patch.correct === true ? { ...a, correct: false } : a;
      return { ...a, ...patch };
    }));
  };
  const setTf = (i: number, patch: Partial<TFItem>) =>
    setTfItems((prev) => prev.map((t, idx) => idx === i ? { ...t, ...patch } : t));

  const submit = () => {
    if (!chapter) return toast.error("Vui lòng chọn Chương/Chủ đề");
    if (isTF && !tfTitle.trim()) return toast.error("Nhập tiêu đề nhóm câu hỏi Đúng - Sai");
    if (!isTF && !content.trim()) return toast.error("Nhập nội dung câu hỏi");
    if (isChoice && answers.filter((a) => a.text.trim()).length < 2) return toast.error("Cần ít nhất 2 phương án trả lời");
    if (isChoice && !answers.some((a) => a.correct)) return toast.error("Chọn ít nhất 1 đáp án đúng");
    onSave({
      id: `sq_${Date.now()}`,
      content: isTF ? tfTitle : content,
      type, level, proposer: "Phùng Thúy Hằng",
      grade, subject, chapter, lesson,
      status: "approved",
      answers: isChoice ? answers.filter((a) => a.text.trim()) : undefined,
      tfTitle: isTF ? tfTitle : undefined,
      tfItems: isTF ? tfItems.filter((t) => t.text.trim()) : undefined,
    });
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-6xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-indigo-700">Thêm mới · {TYPE_LABEL[type]}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-4 space-y-4">
            <div>
              <Label className="text-sm">Khối học <span className="text-rose-500">*</span></Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{GRADES.map((g) => <SelectItem key={g} value={g}>Khối {g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Môn học <span className="text-rose-500">*</span></Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Chương/Chủ đề <span className="text-rose-500">*</span></Label>
              <Select value={chapter} onValueChange={(v) => { setChapter(v); setLesson(""); }}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Chọn chương" /></SelectTrigger>
                <SelectContent>{KNOWLEDGE_TREE.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Bài học</Label>
              <Select value={lesson} onValueChange={setLesson} disabled={!chapter}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={chapter ? "Chọn bài học" : "Chọn chương trước"} /></SelectTrigger>
                <SelectContent>{lessons.map((u) => <SelectItem key={u.id} value={u.id}>{u.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="col-span-8 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">
                  {isTF ? "Tiêu đề nhóm câu hỏi" : "Nội dung câu hỏi"} <span className="text-rose-500">*</span>
                </Label>
                <div className="flex gap-1">
                  {LEVELS.map((l) => (
                    <button key={l} onClick={() => setLevel(l)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                        level === l ? "bg-indigo-600 text-white shadow" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}>{l}</button>
                  ))}
                </div>
              </div>
              {isTF ? (
                <Input value={tfTitle} onChange={(e) => setTfTitle(e.target.value)} className="mt-2"
                  placeholder="Ví dụ: Xét tính đúng - sai của các mệnh đề sau..." />
              ) : (
                <Textarea value={content} onChange={(e) => setContent(e.target.value)}
                  placeholder="Nhập nội dung câu hỏi..." className="mt-2 min-h-[120px]" />
              )}
            </div>

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
                        <input type="radio" checked={a.correct} onChange={() => setAnswer(i, { correct: true })} className="accent-indigo-600 h-4 w-4" />
                      ) : (
                        <input type="checkbox" checked={a.correct} onChange={(e) => setAnswer(i, { correct: e.target.checked })} className="accent-indigo-600 h-4 w-4" />
                      )}
                      <Input value={a.text} onChange={(e) => setAnswer(i, { text: e.target.value })}
                        placeholder={`Phương án ${String.fromCharCode(65 + i)}`} />
                      <button onClick={() => setAnswers((p) => p.filter((_, idx) => idx !== i))}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" onClick={() => setAnswers((p) => [...p, { text: "", correct: false }])} className="mt-3 gap-1.5">
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
                      <Input value={t.text} onChange={(e) => setTf(i, { text: e.target.value })} placeholder="Nhập mệnh đề..." className="flex-1" />
                      <div className="flex items-center gap-1 border rounded-md overflow-hidden">
                        <button onClick={() => setTf(i, { correct: true })}
                          className={`px-3 py-1.5 text-xs font-semibold cursor-pointer transition ${t.correct ? "bg-emerald-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}>Đ</button>
                        <button onClick={() => setTf(i, { correct: false })}
                          className={`px-3 py-1.5 text-xs font-semibold cursor-pointer transition ${!t.correct ? "bg-rose-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}>S</button>
                      </div>
                      <button onClick={() => setTfItems((p) => p.filter((_, idx) => idx !== i))}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"><X className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" onClick={() => setTfItems((p) => [...p, { text: "", correct: true }])} className="mt-3 gap-1.5">
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
