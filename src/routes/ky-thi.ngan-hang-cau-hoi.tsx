import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Plus, Search, X, ChevronDown, CircleDot, CheckSquare, FileText, Move,
  TextCursorInput, Link2, ToggleLeft, ArrowUpDown,
  SlidersHorizontal, Check, Ban, MinusCircle, Eye,
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
  TYPE_LABEL, LEVELS, GRADES, SUBJECTS, PROPOSERS,
  type QType, type Level, type ApprovalStatus,
  chapterTitle, lessonTitle,
} from "@/lib/shared-exam-bank";
import {
  FilterSelect, ApprovalTag, RejectReasonModal, StatusSideTabs,
  ConfirmRemoveModal, ViewRejectReasonModal, nowStamp,
} from "@/components/ExamBankShared";
import { ImportQuestionsModal } from "@/components/ImportQuestionsModal";
import {
  PickQuestionTypeModal, QuestionFormModal, QuestionTypeIcon, type QuestionDraft,
} from "@/components/QuestionFormModal";
import { draftExtras, type QuestionExtras } from "@/components/QuestionExtras";
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
type Question = QuestionExtras & {
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

/** Bộ câu hỏi hệ thống bóc tách được từ tệp Word/PDF/Excel người dùng tải lên. */
const IMPORT_TEMPLATE: Omit<Question, "id" | "proposer" | "status">[] = [
  {
    content: "Số 45 678 đọc là gì?", type: "single", level: "Nhận biết",
    grade: "4", subject: "Toán", chapter: "t4-ch1", lesson: "t4-b1",
    answers: [
      { text: "Bốn mươi lăm nghìn sáu trăm bảy mươi tám", correct: true },
      { text: "Bốn nghìn năm trăm sáu mươi bảy tám", correct: false },
      { text: "Bốn trăm năm mươi sáu nghìn bảy tám", correct: false },
      { text: "Bốn mươi lăm nghìn bảy trăm sáu mươi tám", correct: false },
    ],
  },
  {
    content: "Chọn các số chia hết cho 5:", type: "multiple", level: "Thông hiểu",
    grade: "4", subject: "Toán", chapter: "t4-ch1", lesson: "t4-b2",
    answers: [
      { text: "125", correct: true }, { text: "232", correct: false },
      { text: "540", correct: true }, { text: "705", correct: true },
    ],
  },
  {
    content: "Điền số thích hợp vào chỗ trống: 2 km 300 m = ... m", type: "fill",
    level: "Thông hiểu", grade: "4", subject: "Toán", chapter: "t4-ch1", lesson: "t4-b3",
  },
  {
    content: "Nêu cách tính chu vi hình chữ nhật và cho một ví dụ minh họa.", type: "essay",
    level: "Vận dụng", grade: "4", subject: "Toán", chapter: "t4-ch1", lesson: "t4-b5",
  },
];

export function TypeIcon({ type }: { type: QType }) {
  return <QuestionTypeIcon type={type} />;
}

/** Chuyển dữ liệu popup thêm mới thành câu hỏi trong ngân hàng dùng chung. */
function draftToShared(d: QuestionDraft): Question {
  return {
    id: `sq_${Date.now()}`,
    content: d.title || d.content,
    type: d.type,
    level: d.level as Level,
    proposer: "Phùng Thúy Hằng",
    grade: d.grade, subject: d.subject, chapter: d.chapter, lesson: d.lesson,
    status: "approved",
    answers: d.answers,
    tfTitle: d.type === "truefalse" ? d.content : undefined,
    tfItems: d.tfItems,
  };
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
  const [importing, setImporting] = useState(false);

  /** Đọc bộ câu hỏi trong tệp và chuyển thành câu hỏi trên hệ thống (chờ duyệt). */
  const importFromFile = (fileName: string) => {
    const stamp = Date.now();
    const parsed: Question[] = IMPORT_TEMPLATE.map((q, i) => ({
      ...q,
      id: `imp-${stamp}-${i}`,
      proposer: PROPOSERS[0],
      status: "pending",
    }));
    setItems((p) => [...parsed, ...p]);
    setImporting(false);
    setTab("pending");
    toast.success(`Đã đọc ${parsed.length} câu hỏi từ tệp "${fileName}" và thêm vào danh sách chờ duyệt`);
  };

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
    if (f.proposer !== "all" && q.proposer !== f.proposer) return false;
    return true;
  }), [items, applied, tab]);

  const activeCount = useMemo(
    () => Object.entries(applied).filter(([k, v]) => (k === "keyword" ? v !== "" : v !== "all")).length,
    [applied],
  );

  const approve = (q: Question) => {
    setItems((p) => p.map((x) => x.id === q.id ? { ...x, status: "approved", rejectReason: undefined } : x));
    toast.success("Đã duyệt câu hỏi vào ngân hàng dùng chung");
  };
  const doReject = (q: Question, reason: string) => {
    setItems((p) => p.map((x) => x.id === q.id
      ? { ...x, status: "rejected", rejectReason: reason, rejectedAt: nowStamp() } : x));
    setRejecting(null);
    toast.success("Đã từ chối câu hỏi");
  };
  const removeOne = (q: Question) => {
    setItems((p) => p.filter((x) => x.id !== q.id));
    setRemoving(null);
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
                  <DropdownMenuItem onClick={() => setImporting(true)}>
                    Thêm mới từ tệp
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

        <div className="p-3 flex gap-3 items-start">
          <StatusSideTabs value={tab} onChange={setTab} counts={counts} />
          <div className="flex-1 min-w-0 overflow-x-auto">
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
                <TableHead className="w-44 text-center">
                  {tab === "rejected" ? "Thời gian từ chối" : "Hành động"}
                </TableHead>
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
                    {tab === "rejected" ? (
                      <div className="flex items-center justify-center gap-1.5 text-sm text-slate-700">
                        <span>{q.rejectedAt ?? "—"}</span>
                        <button
                          title="Xem lý do từ chối"
                          onClick={() => setViewReason(q)}
                          className="p-1 rounded-md text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    ) : tab === "approved" ? (
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => setRemoving(q)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <MinusCircle className="h-4 w-4" /> Gỡ bỏ
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => approve(q)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                        >
                          <Check className="h-4 w-4" /> Duyệt
                        </button>
                        <button
                          onClick={() => setRejecting(q)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Ban className="h-4 w-4" /> Từ chối
                        </button>
                      </div>
                    )}
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

      <PickQuestionTypeModal open={pickType} onClose={() => setPickType(false)}
        onPick={(t) => { setPickType(false); setCreating(t); }} />

      {creating && (
        <QuestionFormModal
          type={creating}
          showShare={false}
          onClose={() => setCreating(null)}
          onSave={(d) => { const q = draftToShared(d); setItems((p) => [q, ...p]); setCreating(null); toast.success("Đã thêm câu hỏi vào ngân hàng dùng chung"); }}
        />
      )}

      {removing && (
        <ConfirmRemoveModal
          message="Bạn xác nhận xóa câu hỏi khỏi kho chung?"
          onClose={() => setRemoving(null)}
          onConfirm={() => removeOne(removing)}
        />
      )}

      {viewReason && (
        <ViewRejectReasonModal reason={viewReason.rejectReason} at={viewReason.rejectedAt}
          onClose={() => setViewReason(null)} />
      )}

      {rejecting && (
        <RejectReasonModal name={rejecting.content} proposer={rejecting.proposer}
          onClose={() => setRejecting(null)}
          onConfirm={(reason) => doReject(rejecting, reason)} />
      )}
      {importing && (
        <ImportQuestionsModal onClose={() => setImporting(false)} onConfirm={importFromFile} />
      )}
    </AppShell>
  );
}

