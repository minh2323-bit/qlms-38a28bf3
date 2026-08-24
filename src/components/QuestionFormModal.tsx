// Popup "Thêm mới" cho từng dạng câu hỏi – dùng chung cho mọi luồng trong LMS.
import { useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Plus, X, CircleDot, CheckSquare, FileText, ToggleLeft, Move,
  TextCursorInput, Link2, ArrowUpDown, PencilLine, HelpCircle, ListChecks,
  ArrowUpDown as SwapIcon, GripVertical,
} from "lucide-react";
import { KNOWLEDGE_TREE } from "@/lib/knowledge-tree";
import { toast } from "sonner";

export type QuestionType =
  | "single" | "multiple" | "essay" | "short" | "truefalse"
  | "drag" | "fill" | "match" | "order";

export const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  single: "Trắc nghiệm 1 đáp án",
  multiple: "Trắc nghiệm nhiều đáp án",
  essay: "Tự luận",
  short: "Trả lời ngắn",
  truefalse: "Đúng - Sai",
  drag: "Kéo thả",
  fill: "Điền khuyết",
  match: "Nối",
  order: "Sắp xếp",
};

export const QUESTION_TYPE_OPTIONS: {
  key: QuestionType; title: string; desc: string; Icon: typeof CircleDot; bg: string; color: string;
}[] = [
  { key: "single", title: "Trắc nghiệm 1 đáp án", desc: "Chọn 1 phương án đúng", Icon: CircleDot, bg: "bg-indigo-50", color: "text-indigo-600" },
  { key: "multiple", title: "Trắc nghiệm nhiều đáp án", desc: "Chọn nhiều phương án đúng", Icon: CheckSquare, bg: "bg-violet-50", color: "text-violet-600" },
  { key: "essay", title: "Tự luận", desc: "Học sinh trả lời tự luận", Icon: FileText, bg: "bg-amber-50", color: "text-amber-600" },
  { key: "short", title: "Trả lời ngắn", desc: "Nhập đáp án ngắn, chấm tự động", Icon: PencilLine, bg: "bg-orange-50", color: "text-orange-600" },
  { key: "truefalse", title: "Đúng - Sai", desc: "Chọn Đ hoặc S cho từng mệnh đề", Icon: ToggleLeft, bg: "bg-emerald-50", color: "text-emerald-600" },
  { key: "drag", title: "Kéo thả", desc: "Kéo thả các từ vào đúng vị trí", Icon: Move, bg: "bg-sky-50", color: "text-sky-600" },
  { key: "fill", title: "Điền khuyết", desc: "Điền từ vào chỗ trống", Icon: TextCursorInput, bg: "bg-teal-50", color: "text-teal-600" },
  { key: "match", title: "Nối", desc: "Nối các đáp án tương ứng", Icon: Link2, bg: "bg-rose-50", color: "text-rose-600" },
  { key: "order", title: "Sắp xếp", desc: "Sắp xếp các mục theo thứ tự đúng", Icon: ArrowUpDown, bg: "bg-fuchsia-50", color: "text-fuchsia-600" },
];

export function QuestionTypeIcon({ type, className = "h-4 w-4" }: { type: QuestionType; className?: string }) {
  const o = QUESTION_TYPE_OPTIONS.find((x) => x.key === type)!;
  return <o.Icon className={`${className} ${o.color}`} />;
}

export type QuestionDraft = {
  type: QuestionType;
  level: string;
  grade: string;
  subject: string;
  chapter: string;
  lesson: string;
  share: string;
  /** Nội dung câu hỏi (hoặc tiêu đề nhóm với dạng Đúng-Sai / Nối) */
  content: string;
  /** Tiêu đề câu hỏi với dạng Kéo thả / Điền khuyết */
  title?: string;
  explain?: string;
  answers?: { text: string; correct: boolean }[];
  /** Trả lời ngắn */
  shortAnswers?: string[];
  caseSensitive?: boolean;
  /** Đúng - Sai */
  tfItems?: { text: string; correct: boolean }[];
  /** Kéo thả: đáp án đúng theo thứ tự + đáp án nhiễu */
  dragAnswers?: string[];
  dragDistractors?: string[];
  /** Điền khuyết: mỗi chỗ trống là 1 mảng các cách viết được chấp nhận */
  fillAnswers?: string[][];
  /** Nối */
  pairs?: { left: string; right: string }[];
  /** Sắp xếp */
  orderItems?: string[];
  orderLayout?: "vertical" | "horizontal";
};

const LEVELS = ["Nhận biết", "Thông hiểu", "Vận dụng", "Vận dụng cao"];
const GRADES = ["1", "2", "3", "4", "5"];
const SUBJECTS = ["Toán", "Tiếng Việt", "Tiếng Anh", "Tự nhiên và Xã hội", "Đạo đức"];

/* ───────────── Popup chọn dạng câu hỏi ───────────── */
export function PickQuestionTypeModal({
  open, onClose, onPick,
}: { open: boolean; onClose: () => void; onPick: (t: QuestionType) => void }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader><DialogTitle className="text-indigo-700">Chọn dạng câu hỏi</DialogTitle></DialogHeader>
        <div className="grid grid-cols-3 gap-3">
          {QUESTION_TYPE_OPTIONS.map(({ key, title, desc, Icon, bg, color }) => (
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

function SectionHead({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b bg-indigo-50/70 rounded-t-xl">
      {icon}
      <span className="font-semibold text-slate-800">{title}</span>
    </div>
  );
}

function Req() { return <span className="text-rose-500">*</span>; }

function RowInput({
  index, value, onChange, onRemove, placeholder,
}: { index: number; value: string; onChange: (v: string) => void; onRemove?: () => void; placeholder: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-6 text-sm font-semibold text-slate-500">{index}.</span>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="flex-1" />
      {onRemove && (
        <button onClick={onRemove} className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function AddRow({ index, label, onClick }: { index: number; label: string; onClick: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-6 text-sm font-semibold text-slate-400">{index}.</span>
      <button onClick={onClick} className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-700 cursor-pointer">
        <Plus className="h-4 w-4" /> {label}
      </button>
    </div>
  );
}

/* ───────────── Popup thêm mới câu hỏi ───────────── */
export function QuestionFormModal({
  type, showShare = true, lockMeta, onClose, onSave,
}: {
  type: QuestionType;
  showShare?: boolean;
  lockMeta?: Partial<Pick<QuestionDraft, "grade" | "subject" | "chapter" | "lesson">>;
  onClose: () => void;
  onSave: (q: QuestionDraft) => void;
}) {
  const [grade, setGrade] = useState(lockMeta?.grade ?? "");
  const [subject, setSubject] = useState(lockMeta?.subject ?? "");
  const [chapter, setChapter] = useState(lockMeta?.chapter ?? "");
  const [lesson, setLesson] = useState(lockMeta?.lesson ?? "");
  const [share, setShare] = useState("none");
  const [level, setLevel] = useState("Nhận biết");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [explain, setExplain] = useState("");

  const [answers, setAnswers] = useState([
    { text: "", correct: false }, { text: "", correct: false },
    { text: "", correct: false }, { text: "", correct: false },
  ]);
  const [shortAnswers, setShortAnswers] = useState<string[]>([""]);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [tfItems, setTfItems] = useState([
    { text: "", correct: true }, { text: "", correct: true }, { text: "", correct: true },
  ]);
  const [dragAnswers, setDragAnswers] = useState<string[]>([""]);
  const [dragDistractors, setDragDistractors] = useState<string[]>([""]);
  const [fillAnswers, setFillAnswers] = useState<string[][]>([[""]]);
  const [pairs, setPairs] = useState([{ left: "", right: "" }, { left: "", right: "" }]);
  const [orderItems, setOrderItems] = useState<string[]>(["", "", ""]);
  const [orderLayout, setOrderLayout] = useState<"vertical" | "horizontal">("vertical");

  const lessons = useMemo(() => KNOWLEDGE_TREE.find((c) => c.id === chapter)?.units ?? [], [chapter]);

  const isSingle = type === "single";
  const isChoice = type === "single" || type === "multiple";
  const isTF = type === "truefalse";
  const isMatch = type === "match";
  const hasTitle = type === "drag" || type === "fill";
  const contentLabel = isTF || isMatch ? "Tiêu đề nhóm câu hỏi" : hasTitle ? "Nội dung câu hỏi" : "Nội dung câu hỏi";

  const insertBlank = (which: "drag" | "fill") => {
    const n = (content.match(/\[\(\d+\)\]/g)?.length ?? 0) + 1;
    setContent((c) => `${c}${c && !c.endsWith(" ") ? " " : ""}[(${n})]`);
    if (which === "fill") setFillAnswers((p) => (p.length >= n ? p : [...p, [""]]));
    else setDragAnswers((p) => (p.length >= n ? p : [...p, ""]));
  };

  const submit = () => {
    if (!grade) return toast.error("Vui lòng chọn Khối học");
    if (!subject) return toast.error("Vui lòng chọn Môn học");
    if (!chapter) return toast.error("Vui lòng chọn Chương học");
    if (!lesson) return toast.error("Vui lòng chọn Bài học");
    if (hasTitle && !title.trim()) return toast.error("Nhập tiêu đề câu hỏi");
    if (!content.trim()) return toast.error(`Nhập ${contentLabel.toLowerCase()}`);
    if (isChoice && answers.filter((a) => a.text.trim()).length < 2) return toast.error("Cần ít nhất 2 phương án trả lời");
    if (isChoice && !answers.some((a) => a.correct && a.text.trim())) return toast.error("Chọn ít nhất 1 đáp án đúng");
    if (type === "short" && !shortAnswers.some((a) => a.trim())) return toast.error("Nhập ít nhất 1 câu trả lời được chấp nhận");
    if (isTF && tfItems.filter((t) => t.text.trim()).length < 2) return toast.error("Cần ít nhất 2 mệnh đề");
    if (type === "drag" && !dragAnswers.some((a) => a.trim())) return toast.error("Nhập đáp án đúng cho ô trống");
    if (type === "fill" && !fillAnswers.some((g) => g.some((a) => a.trim()))) return toast.error("Nhập từ cần điền cho chỗ trống");
    if (isMatch && pairs.filter((p) => p.left.trim() && p.right.trim()).length < 2) return toast.error("Cần ít nhất 2 cặp nối");
    if (type === "order" && orderItems.filter((o) => o.trim()).length < 2) return toast.error("Cần ít nhất 2 mục cần sắp xếp");

    onSave({
      type, level, grade, subject, chapter, lesson, share,
      content, title: hasTitle ? title : undefined, explain,
      answers: isChoice ? answers.filter((a) => a.text.trim()) : undefined,
      shortAnswers: type === "short" ? shortAnswers.filter((a) => a.trim()) : undefined,
      caseSensitive: type === "short" || type === "fill" ? caseSensitive : undefined,
      tfItems: isTF ? tfItems.filter((t) => t.text.trim()) : undefined,
      dragAnswers: type === "drag" ? dragAnswers.filter((a) => a.trim()) : undefined,
      dragDistractors: type === "drag" ? dragDistractors.filter((a) => a.trim()) : undefined,
      fillAnswers: type === "fill" ? fillAnswers.map((g) => g.filter((a) => a.trim())).filter((g) => g.length) : undefined,
      pairs: isMatch ? pairs.filter((p) => p.left.trim() && p.right.trim()) : undefined,
      orderItems: type === "order" ? orderItems.filter((o) => o.trim()) : undefined,
      orderLayout: type === "order" ? orderLayout : undefined,
    });
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-6xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-indigo-700">Thêm mới - {QUESTION_TYPE_LABEL[type]}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-12 gap-5">
          {/* Thông tin chung */}
          <div className="col-span-12 lg:col-span-4">
            <div className="rounded-xl border h-full">
              <SectionHead icon={<ListChecks className="h-4 w-4 text-indigo-600" />} title="Thông tin chung" />
              <div className="p-4 space-y-4">
                <div>
                  <Label className="text-sm">Khối học <Req /></Label>
                  <Select value={grade} onValueChange={setGrade} disabled={!!lockMeta?.grade}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Chọn khối học" /></SelectTrigger>
                    <SelectContent>{GRADES.map((g) => <SelectItem key={g} value={g}>Khối {g}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Môn học <Req /></Label>
                  <Select value={subject} onValueChange={setSubject} disabled={!!lockMeta?.subject}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Chọn môn học" /></SelectTrigger>
                    <SelectContent>{SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Chương học <Req /></Label>
                  <Select value={chapter} onValueChange={(v) => { setChapter(v); setLesson(""); }}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Chọn chương học" /></SelectTrigger>
                    <SelectContent>
                      {KNOWLEDGE_TREE.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Bài học <Req /></Label>
                  <Select value={lesson} onValueChange={setLesson} disabled={!chapter}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={chapter ? "Chọn bài học" : "Chọn chương trước"} />
                    </SelectTrigger>
                    <SelectContent>
                      {lessons.map((u) => <SelectItem key={u.id} value={u.id}>{u.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {showShare && (
                  <div>
                    <Label className="text-sm">Chia sẻ</Label>
                    <Select value={share} onValueChange={setShare}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Không chia sẻ</SelectItem>
                        <SelectItem value="group">Chia sẻ tổ chuyên môn</SelectItem>
                        <SelectItem value="school">Chia sẻ toàn trường</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Nội dung câu hỏi */}
          <div className="col-span-12 lg:col-span-8">
            <div className="rounded-xl border h-full">
              <SectionHead icon={<HelpCircle className="h-4 w-4 text-indigo-600" />} title="Nội dung câu hỏi" />
              <div className="p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Label className="text-sm font-semibold">
                    {hasTitle ? "Tiêu đề câu hỏi" : contentLabel} <Req />
                  </Label>
                  <div className="flex flex-wrap gap-1.5">
                    {LEVELS.map((l) => (
                      <button key={l} onClick={() => setLevel(l)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                          level === l ? "bg-indigo-600 text-white shadow" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}>{l}</button>
                    ))}
                  </div>
                </div>

                {hasTitle ? (
                  <>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)}
                      placeholder={type === "drag"
                        ? "Nhập tiêu đề... VD: Kéo thả các từ vào vị trí tương ứng để hoàn thành câu dưới đây"
                        : "Nhập tiêu đề... VD: Hoàn thành câu sau bằng cách điền từ thích hợp"} />
                    <div>
                      <Label className="text-sm font-semibold">Nội dung câu hỏi <Req /></Label>
                      <Textarea value={content} onChange={(e) => setContent(e.target.value)}
                        placeholder="Nhập nội dung câu hỏi.." className="mt-1.5 min-h-[90px]" />
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-[13px] italic text-slate-500">
                          {type === "drag"
                            ? "Đặt con trỏ trong nội dung rồi bấm để tạo ô trống [(n)]."
                            : "Đặt con trỏ trong nội dung rồi bấm để chèn chỗ trống."}
                        </p>
                        <button onClick={() => insertBlank(type === "drag" ? "drag" : "fill")}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer">
                          <Plus className="h-4 w-4" /> {type === "drag" ? "Chèn ô trống" : "Chèn chỗ trống"}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <Textarea value={content} onChange={(e) => setContent(e.target.value)}
                    placeholder="Nhập nội dung câu hỏi.." className="min-h-[100px]" />
                )}

                {/* Trắc nghiệm */}
                {isChoice && (
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Các phương án trả lời <Req /></Label>
                    <div className="space-y-2">
                      {answers.map((a, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-6 text-sm font-semibold text-slate-500">{String.fromCharCode(65 + i)}.</span>
                          <input
                            type={isSingle ? "radio" : "checkbox"}
                            checked={a.correct}
                            onChange={(e) => setAnswers((prev) => prev.map((x, idx) =>
                              idx === i ? { ...x, correct: isSingle ? true : e.target.checked }
                                : isSingle ? { ...x, correct: false } : x))}
                            className="accent-indigo-600 h-4 w-4"
                          />
                          <Input value={a.text} className="flex-1"
                            onChange={(e) => setAnswers((p) => p.map((x, idx) => idx === i ? { ...x, text: e.target.value } : x))}
                            placeholder={`Phương án ${String.fromCharCode(65 + i)}`} />
                          <button onClick={() => setAnswers((p) => p.filter((_, idx) => idx !== i))}
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"><X className="h-4 w-4" /></button>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="mt-3 gap-1.5"
                      onClick={() => setAnswers((p) => [...p, { text: "", correct: false }])}>
                      <Plus className="h-4 w-4" /> Thêm phương án
                    </Button>
                  </div>
                )}

                {/* Trả lời ngắn */}
                {type === "short" && (
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Các câu trả lời được chấp nhận <Req /></Label>
                    <div className="space-y-2">
                      {shortAnswers.map((a, i) => (
                        <RowInput key={i} index={i + 1} value={a} placeholder="Nhập câu trả lời..."
                          onChange={(v) => setShortAnswers((p) => p.map((x, idx) => idx === i ? v : x))}
                          onRemove={shortAnswers.length > 1 ? () => setShortAnswers((p) => p.filter((_, idx) => idx !== i)) : undefined} />
                      ))}
                      <AddRow index={shortAnswers.length + 1} label="Thêm câu trả lời"
                        onClick={() => setShortAnswers((p) => [...p, ""])} />
                    </div>
                    <label className="mt-3 flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)}
                        className="accent-indigo-600 h-4 w-4" />
                      Phân biệt chữ hoa/thường
                    </label>
                  </div>
                )}

                {/* Đúng - Sai */}
                {isTF && (
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Các mệnh đề <Req /></Label>
                    <div className="space-y-2">
                      {tfItems.map((t, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-6 text-sm font-semibold text-slate-500">{i + 1}.</span>
                          <Input value={t.text} className="flex-1" placeholder={`Nhập mệnh đề ${i + 1}`}
                            onChange={(e) => setTfItems((p) => p.map((x, idx) => idx === i ? { ...x, text: e.target.value } : x))} />
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => setTfItems((p) => p.map((x, idx) => idx === i ? { ...x, correct: true } : x))}
                              className={`w-10 h-9 rounded-md text-sm font-bold border cursor-pointer transition ${
                                t.correct ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-500 hover:bg-slate-50"
                              }`}>Đ</button>
                            <button onClick={() => setTfItems((p) => p.map((x, idx) => idx === i ? { ...x, correct: false } : x))}
                              className={`w-10 h-9 rounded-md text-sm font-bold border cursor-pointer transition ${
                                !t.correct ? "bg-rose-600 text-white border-rose-600" : "bg-white text-rose-500 border-rose-200 hover:bg-rose-50"
                              }`}>S</button>
                          </div>
                          <button onClick={() => setTfItems((p) => p.filter((_, idx) => idx !== i))}
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"><X className="h-4 w-4" /></button>
                        </div>
                      ))}
                      <AddRow index={tfItems.length + 1} label="Thêm mệnh đề"
                        onClick={() => setTfItems((p) => [...p, { text: "", correct: true }])} />
                    </div>
                  </div>
                )}

                {/* Kéo thả */}
                {type === "drag" && (
                  <>
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Đáp án đúng (theo thứ tự đúng)</Label>
                      <div className="space-y-2">
                        {dragAnswers.map((a, i) => (
                          <RowInput key={i} index={i + 1} value={a} placeholder="Nhập nội dung..."
                            onChange={(v) => setDragAnswers((p) => p.map((x, idx) => idx === i ? v : x))}
                            onRemove={dragAnswers.length > 1 ? () => setDragAnswers((p) => p.filter((_, idx) => idx !== i)) : undefined} />
                        ))}
                        <AddRow index={dragAnswers.length + 1} label="Thêm đáp án đúng"
                          onClick={() => setDragAnswers((p) => [...p, ""])} />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Đáp án nhiễu</Label>
                      <div className="space-y-2">
                        {dragDistractors.map((a, i) => (
                          <RowInput key={i} index={i + 1} value={a} placeholder="Nhập nội dung..."
                            onChange={(v) => setDragDistractors((p) => p.map((x, idx) => idx === i ? v : x))}
                            onRemove={dragDistractors.length > 1 ? () => setDragDistractors((p) => p.filter((_, idx) => idx !== i)) : undefined} />
                        ))}
                        <AddRow index={dragDistractors.length + 1} label="Thêm đáp án nhiễu"
                          onClick={() => setDragDistractors((p) => [...p, ""])} />
                      </div>
                    </div>
                  </>
                )}

                {/* Điền khuyết – mỗi cách viết đúng là một ô riêng */}
                {type === "fill" && (
                  <div>
                    <Label className="text-sm font-semibold block">Các từ cần điền (theo thứ tự chỗ trống)</Label>
                    <p className="text-[13px] italic text-slate-500 mt-1">
                      Mỗi chỗ trống có thể nhập nhiều đáp án đúng, mỗi cách viết nhập ở một ô riêng.
                    </p>
                    <div className="mt-2 space-y-3">
                      {fillAnswers.map((group, gi) => (
                        <div key={gi} className="rounded-lg border p-3 bg-slate-50/60">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-slate-700">Chỗ trống {gi + 1}</span>
                            {fillAnswers.length > 1 && (
                              <button onClick={() => setFillAnswers((p) => p.filter((_, i) => i !== gi))}
                                className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"><X className="h-4 w-4" /></button>
                            )}
                          </div>
                          <div className="space-y-2">
                            {group.map((a, ai) => (
                              <RowInput key={ai} index={ai + 1} value={a} placeholder="Nhập một cách viết đúng..."
                                onChange={(v) => setFillAnswers((p) => p.map((g, i) =>
                                  i === gi ? g.map((x, j) => j === ai ? v : x) : g))}
                                onRemove={group.length > 1
                                  ? () => setFillAnswers((p) => p.map((g, i) => i === gi ? g.filter((_, j) => j !== ai) : g))
                                  : undefined} />
                            ))}
                            <AddRow index={group.length + 1} label="Thêm cách viết đúng khác"
                              onClick={() => setFillAnswers((p) => p.map((g, i) => i === gi ? [...g, ""] : g))} />
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" className="gap-1.5" onClick={() => setFillAnswers((p) => [...p, [""]])}>
                        <Plus className="h-4 w-4" /> Thêm chỗ trống
                      </Button>
                    </div>
                    <label className="mt-3 flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)}
                        className="accent-indigo-600 h-4 w-4" />
                      Phân biệt chữ hoa/thường
                    </label>
                  </div>
                )}

                {/* Nối */}
                {isMatch && (
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Cặp nối <Req /></Label>
                    <div className="space-y-2">
                      {pairs.map((p, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input value={p.left} className="flex-1" placeholder="Nhập nội dung cột trái"
                            onChange={(e) => setPairs((prev) => prev.map((x, idx) => idx === i ? { ...x, left: e.target.value } : x))} />
                          <SwapIcon className="h-4 w-4 text-slate-400 shrink-0" />
                          <Input value={p.right} className="flex-1" placeholder="Nhập nội dung cột phải"
                            onChange={(e) => setPairs((prev) => prev.map((x, idx) => idx === i ? { ...x, right: e.target.value } : x))} />
                          <button onClick={() => setPairs((prev) => prev.filter((_, idx) => idx !== i))}
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"><X className="h-4 w-4" /></button>
                        </div>
                      ))}
                      <AddRow index={pairs.length + 1} label="Thêm cặp nối"
                        onClick={() => setPairs((p) => [...p, { left: "", right: "" }])} />
                    </div>
                  </div>
                )}

                {/* Sắp xếp */}
                {type === "order" && (
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Các mục cần sắp xếp (theo thứ tự đúng) <Req /></Label>
                    <div className="flex items-center gap-6 mb-3">
                      {(["vertical", "horizontal"] as const).map((v) => (
                        <label key={v} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                          <input type="radio" checked={orderLayout === v} onChange={() => setOrderLayout(v)}
                            className="accent-indigo-600 h-4 w-4" />
                          {v === "vertical" ? "Sắp xếp chiều dọc" : "Sắp xếp chiều ngang"}
                        </label>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {orderItems.map((o, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-slate-300 shrink-0" />
                          <span className="w-6 text-sm font-semibold text-slate-500">{i + 1}.</span>
                          <Input value={o} className="flex-1" placeholder="Nhập nội dung mục cần sắp xếp"
                            onChange={(e) => setOrderItems((p) => p.map((x, idx) => idx === i ? e.target.value : x))} />
                          <button onClick={() => setOrderItems((p) => p.filter((_, idx) => idx !== i))}
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"><X className="h-4 w-4" /></button>
                        </div>
                      ))}
                      <AddRow index={orderItems.length + 1} label="Thêm mục" onClick={() => setOrderItems((p) => [...p, ""])} />
                    </div>
                  </div>
                )}

                {/* Hướng dẫn giải */}
                <div>
                  <Label className="text-sm font-semibold">Hướng dẫn giải</Label>
                  <Textarea value={explain} onChange={(e) => setExplain(e.target.value)}
                    placeholder="Nhập hướng dẫn giải (nếu có)" className="mt-1.5 min-h-[80px]" />
                </div>
              </div>
            </div>
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
