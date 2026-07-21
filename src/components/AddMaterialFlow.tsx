import { useState } from "react";
import {
  Video, PlayCircle, Presentation, FileText, Type, Music, FileBox, Code2,
  X, Upload, Link as LinkIcon, Plus, Trash2, Eye, Pencil,
  ListChecks, MoveHorizontal, GripVertical, PenLine, ArrowLeftRight, Type as TypeIcon,
} from "lucide-react";
import {
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

/* ============= Ordered list of material types (SHARED) ============= */

export type MaterialTypeKey =
  | "video" | "interactive" | "slide" | "doc" | "text" | "audio" | "scorm" | "iframe";

export const MATERIAL_TYPE_LIST: {
  key: MaterialTypeKey; label: string; Icon: typeof Video; color: string; bg: string;
}[] = [
  { key: "video",       label: "Video",                    Icon: Video,        color: "text-rose-600",    bg: "bg-rose-50" },
  { key: "interactive", label: "Video tương tác",          Icon: PlayCircle,   color: "text-indigo-600",  bg: "bg-indigo-50" },
  { key: "slide",       label: "Slide/Bản trình chiếu",    Icon: Presentation, color: "text-orange-600",  bg: "bg-orange-50" },
  { key: "doc",         label: "Tài liệu văn bản",         Icon: FileText,     color: "text-sky-600",     bg: "bg-sky-50" },
  { key: "text",        label: "Nội dung thuần",           Icon: Type,         color: "text-slate-600",   bg: "bg-slate-100" },
  { key: "audio",       label: "Âm thanh",                 Icon: Music,        color: "text-amber-600",   bg: "bg-amber-50" },
  { key: "scorm",       label: "Scorm",                    Icon: FileBox,      color: "text-violet-600",  bg: "bg-violet-50" },
  { key: "iframe",      label: "IFrame",                   Icon: Code2,        color: "text-emerald-600", bg: "bg-emerald-50" },
];

/* ============= Menu items (drop into any DropdownMenuContent) ============= */

export function AddMaterialMenuItems({
  onSelect,
}: {
  onSelect: (t: MaterialTypeKey) => void;
}) {
  return (
    <>
      {MATERIAL_TYPE_LIST.map((t, i) => {
        const Icon = t.Icon;
        return (
          <DropdownMenuItem
            key={t.key}
            className="cursor-pointer gap-2"
            onSelect={(e) => { e.preventDefault(); onSelect(t.key); }}
          >
            <span className="text-slate-400 text-xs w-4">{i + 1}.</span>
            <Icon className={`h-4 w-4 ${t.color}`} />
            <span>{t.label}</span>
          </DropdownMenuItem>
        );
      })}
    </>
  );
}

/* ============= Main modal dispatcher ============= */

export function MaterialFormModal({
  type, onClose, onSaved,
}: {
  type: MaterialTypeKey;
  onClose: () => void;
  onSaved?: (payload: { title: string; type: MaterialTypeKey }) => void;
}) {
  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        {type === "video" && <VideoForm onClose={onClose} onSaved={onSaved} />}
        {type === "interactive" && <InteractiveVideoForm onClose={onClose} onSaved={onSaved} />}
        {type !== "video" && type !== "interactive" && (
          <GenericForm type={type} onClose={onClose} onSaved={onSaved} />
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ============= Shared form building blocks ============= */

function TitleRow({ text }: { text: string }) {
  return (
    <DialogHeader>
      <DialogTitle className="text-xl font-bold text-sky-700">{text}</DialogTitle>
    </DialogHeader>
  );
}

function Field({ label, required, children, className }: {
  label: string; required?: boolean; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-bold text-slate-800 mb-1.5">
        {label}{required && <span className="text-rose-500"> *</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 ${props.className ?? ""}`}
    />
  );
}

function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 ${props.className ?? ""}`}
    />
  );
}

function CommonMaterialFields({
  ten, setTen, uploadMode, setUploadMode, source, setSource,
}: {
  ten: string; setTen: (v: string) => void;
  uploadMode: string; setUploadMode: (v: string) => void;
  source: string; setSource: (v: string) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Tên học liệu" required>
          <TextInput value={ten} onChange={(e) => setTen(e.target.value)} />
        </Field>
        <Field label="Lớp gán">
          <TextInput placeholder="VD: Lớp 4A – Toán" />
        </Field>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <Field label="Khối" required>
          <SelectInput defaultValue="">
            <option value="" disabled>—</option>
            <option>Lớp 3</option>
            <option>Lớp 4</option>
            <option>Lớp 5</option>
          </SelectInput>
        </Field>
        <Field label="Môn" required>
          <SelectInput defaultValue="">
            <option value="" disabled>—</option>
            <option>Toán</option>
            <option>Tiếng Việt</option>
          </SelectInput>
        </Field>
        <Field label="Chương/Chủ đề">
          <TextInput />
        </Field>
        <Field label="Bài học">
          <TextInput />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Hình thức tải nội dung" required>
          <SelectInput value={uploadMode} onChange={(e) => setUploadMode(e.target.value)}>
            <option value="file">Tệp trong thiết bị</option>
            <option value="link">Đường dẫn</option>
          </SelectInput>
        </Field>
        <Field label="Tải tệp/Đường dẫn" required>
          {uploadMode === "link" ? (
            <TextInput
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Dán liên kết YouTube/Vimeo/Drive…"
            />
          ) : (
            <label className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer text-slate-600">
              <Upload className="h-4 w-4 text-indigo-600" />
              <span className="truncate">{source || "Chọn tệp để tải lên"}</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => setSource(e.target.files?.[0]?.name ?? "")}
              />
            </label>
          )}
        </Field>
      </div>
      <Field label="Mô tả">
        <textarea
          rows={3}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
        />
      </Field>
    </>
  );
}

/* ============= Video form ============= */

const COMPLETION_MODES = [
  { key: "time", label: "Sau khoảng thời gian" },
  { key: "question", label: "Sau khi trả lời câu hỏi" },
  { key: "manual", label: "Sau khi Học sinh click hoàn thành" },
] as const;
type CompletionMode = (typeof COMPLETION_MODES)[number]["key"];

function VideoForm({
  onClose, onSaved,
}: {
  onClose: () => void;
  onSaved?: (p: { title: string; type: MaterialTypeKey }) => void;
}) {
  const [ten, setTen] = useState("");
  const [uploadMode, setUploadMode] = useState("file");
  const [source, setSource] = useState("");
  const [completion, setCompletion] = useState<CompletionMode>("time");
  const [questions, setQuestions] = useState<{ id: string; text: string }[]>([]);
  const [addQOpen, setAddQOpen] = useState<null | string>(null);

  const submit = () => {
    if (!ten.trim()) return toast.error("Vui lòng nhập tên học liệu");
    onSaved?.({ title: ten.trim(), type: "video" });
    toast.success("Đã thêm học liệu video");
    onClose();
  };

  return (
    <div className="space-y-5">
      <TitleRow text="Thêm học liệu video" />
      <CommonMaterialFields
        ten={ten} setTen={setTen}
        uploadMode={uploadMode} setUploadMode={setUploadMode}
        source={source} setSource={setSource}
      />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Cách tính hoàn thành">
          <SelectInput
            value={completion}
            onChange={(e) => setCompletion(e.target.value as CompletionMode)}
          >
            {COMPLETION_MODES.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </SelectInput>
        </Field>
        {completion === "time" && (
          <Field label="Mốc thời gian">
            <div className="flex items-center gap-2">
              <TextInput placeholder="00:00:00" defaultValue="00:00:00" className="max-w-40" />
              <span className="text-xs italic text-slate-500">Thời lượng video học liệu: <b>00:12:20</b></span>
            </div>
          </Field>
        )}
        {completion === "question" && (
          <Field label="Thang điểm">
            <SelectInput defaultValue="10">
              {[5, 10, 20, 100].map((n) => <option key={n} value={n}>{n}</option>)}
            </SelectInput>
          </Field>
        )}
      </div>

      {completion === "question" && (
        <QuestionListSection
          questions={questions}
          setQuestions={setQuestions}
          onOpenAdd={(qType) => setAddQOpen(qType)}
        />
      )}

      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button variant="outline" size="sm" onClick={onClose}>Hủy</Button>
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={submit}>Lưu học liệu</Button>
      </div>

      {addQOpen && (
        <AddQuestionModal
          type={addQOpen}
          onClose={() => setAddQOpen(null)}
          onSaved={(q) => {
            setQuestions((s) => [...s, q]);
            setAddQOpen(null);
            toast.success("Đã thêm câu hỏi");
          }}
        />
      )}
    </div>
  );
}

/* ============= Interactive video form ============= */

function InteractiveVideoForm({
  onClose, onSaved,
}: {
  onClose: () => void;
  onSaved?: (p: { title: string; type: MaterialTypeKey }) => void;
}) {
  const [ten, setTen] = useState("");
  const [uploadMode, setUploadMode] = useState("file");
  const [source, setSource] = useState("");
  const [questions, setQuestions] = useState<{ id: string; text: string; at?: string }[]>([]);
  const [addQOpen, setAddQOpen] = useState<null | string>(null);

  const submit = () => {
    if (!ten.trim()) return toast.error("Vui lòng nhập tên học liệu");
    onSaved?.({ title: ten.trim(), type: "interactive" });
    toast.success("Đã thêm học liệu video tương tác");
    onClose();
  };

  const hasSource = source.trim().length > 0;

  return (
    <div className="space-y-5">
      <TitleRow text="Thêm học liệu video tương tác" />
      <CommonMaterialFields
        ten={ten} setTen={setTen}
        uploadMode={uploadMode} setUploadMode={setUploadMode}
        source={source} setSource={setSource}
      />

      <div className="grid grid-cols-2 gap-6 border-t pt-5">
        {/* Video preview */}
        <div>
          <h4 className="text-sm font-bold text-sky-700 mb-2">Thêm tương tác</h4>
          <div className="aspect-video rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center overflow-hidden">
            {hasSource ? (
              <div className="text-center text-slate-500">
                <PlayCircle className="h-12 w-12 mx-auto text-indigo-500" />
                <p className="text-xs mt-2 px-3 truncate max-w-full">{source}</p>
              </div>
            ) : (
              <div className="text-center text-slate-400 text-xs px-4">
                <Video className="h-10 w-10 mx-auto mb-2" />
                Video sẽ hiển thị khi tệp hoặc liên kết được gán thành công
              </div>
            )}
          </div>
        </div>

        {/* Question section */}
        <div>
          <h4 className="text-sm font-bold text-sky-700 mb-2">Thêm câu hỏi tương tác</h4>
          <QuestionTypeGrid onPick={(k) => setAddQOpen(k)} disabled={!hasSource} />
          <div className="mt-3 space-y-2">
            {questions.length === 0 && (
              <p className="text-xs italic text-slate-400 border border-dashed border-slate-200 rounded-lg p-3 text-center">
                Chưa có câu hỏi tương tác nào. Chọn dạng câu hỏi ở trên để thêm.
              </p>
            )}
            {questions.map((q, i) => (
              <div key={q.id} className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-white text-sm">
                <span className="text-xs text-slate-400 w-5">{i + 1}.</span>
                <div className="flex-1 min-w-0 truncate text-slate-700">{q.text}</div>
                {q.at && (
                  <span className="text-[11px] font-mono text-emerald-600">{q.at}</span>
                )}
                <button
                  onClick={() => setQuestions((s) => s.filter((x) => x.id !== q.id))}
                  className="h-7 w-7 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button variant="outline" size="sm" onClick={onClose}>Hủy</Button>
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={submit}>Lưu học liệu</Button>
      </div>

      {addQOpen && (
        <AddQuestionModal
          type={addQOpen}
          onClose={() => setAddQOpen(null)}
          onSaved={(q) => {
            setQuestions((s) => [...s, q]);
            setAddQOpen(null);
            toast.success("Đã thêm câu hỏi");
          }}
        />
      )}
    </div>
  );
}

/* ============= Generic form (Slide / Doc / Text / Audio / Scorm / IFrame) ============= */

function GenericForm({
  type, onClose, onSaved,
}: {
  type: MaterialTypeKey;
  onClose: () => void;
  onSaved?: (p: { title: string; type: MaterialTypeKey }) => void;
}) {
  const meta = MATERIAL_TYPE_LIST.find((m) => m.key === type)!;
  const [ten, setTen] = useState("");
  const [uploadMode, setUploadMode] = useState("file");
  const [source, setSource] = useState("");

  const needsSource = type !== "text";

  const submit = () => {
    if (!ten.trim()) return toast.error("Vui lòng nhập tên học liệu");
    onSaved?.({ title: ten.trim(), type });
    toast.success(`Đã thêm học liệu ${meta.label.toLowerCase()}`);
    onClose();
  };

  return (
    <div className="space-y-5">
      <TitleRow text={`Thêm học liệu ${meta.label.toLowerCase()}`} />
      {needsSource ? (
        <CommonMaterialFields
          ten={ten} setTen={setTen}
          uploadMode={uploadMode} setUploadMode={setUploadMode}
          source={source} setSource={setSource}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tên học liệu" required>
              <TextInput value={ten} onChange={(e) => setTen(e.target.value)} />
            </Field>
            <Field label="Lớp gán"><TextInput /></Field>
          </div>
          <Field label="Nội dung">
            <textarea
              rows={8}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </Field>
        </>
      )}
      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button variant="outline" size="sm" onClick={onClose}>Hủy</Button>
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={submit}>Lưu học liệu</Button>
      </div>
    </div>
  );
}

/* ============= Question type grid (shared) ============= */

const QUESTION_TYPES = [
  { key: "mcq",      label: "Trắc nghiệm",       Icon: ListChecks },
  { key: "drag",     label: "Kéo thả",           Icon: MoveHorizontal },
  { key: "reorder",  label: "Sắp xếp",           Icon: GripVertical },
  { key: "fill",     label: "Điền khuyết",       Icon: PenLine },
  { key: "match",    label: "Nối",               Icon: ArrowLeftRight },
  { key: "essay",    label: "Tự luận",           Icon: TypeIcon },
];

function QuestionTypeGrid({
  onPick, disabled,
}: {
  onPick: (k: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {QUESTION_TYPES.map((q) => {
        const Icon = q.Icon;
        return (
          <button
            key={q.key}
            type="button"
            disabled={disabled}
            onClick={() => onPick(q.key)}
            className="border border-slate-200 rounded-lg px-2 py-2 text-xs font-medium text-slate-700 bg-white hover:border-indigo-300 hover:bg-indigo-50 flex flex-col items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
            title={q.label}
          >
            <Icon className="h-4 w-4 text-indigo-600" />
            {q.label}
          </button>
        );
      })}
    </div>
  );
}

function QuestionListSection({
  questions, setQuestions, onOpenAdd,
}: {
  questions: { id: string; text: string }[];
  setQuestions: React.Dispatch<React.SetStateAction<{ id: string; text: string }[]>>;
  onOpenAdd: (k: string) => void;
}) {
  return (
    <div className="border-t pt-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-800">Câu hỏi</h4>
        <span className="text-xs text-slate-500">Thêm câu hỏi để học sinh trả lời khi xem video</span>
      </div>
      <QuestionTypeGrid onPick={onOpenAdd} />
      <div className="space-y-1">
        {questions.length === 0 && (
          <p className="text-xs italic text-slate-400 border border-dashed border-slate-200 rounded-lg p-3 text-center">
            Chưa có câu hỏi nào.
          </p>
        )}
        {questions.map((q, i) => (
          <div key={q.id} className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 text-sm">
            <span className="text-xs text-slate-400 w-5">{i + 1}.</span>
            <div className="flex-1 truncate text-slate-700">{q.text}</div>
            <button
              onClick={() => setQuestions((s) => s.filter((x) => x.id !== q.id))}
              className="h-7 w-7 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============= Add-question sub-modal ============= */

function AddQuestionModal({
  type, onClose, onSaved,
}: {
  type: string;
  onClose: () => void;
  onSaved: (q: { id: string; text: string; at?: string }) => void;
}) {
  const label = QUESTION_TYPES.find((q) => q.key === type)?.label ?? "câu hỏi";
  const [question, setQuestion] = useState("");
  const [time, setTime] = useState("00:00");
  const [pauseVideo, setPauseVideo] = useState(true);
  const [requireCorrect, setRequireCorrect] = useState(true);
  const [allowRetry, setAllowRetry] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answers, setAnswers] = useState<{ text: string; correct: boolean }[]>([
    { text: "", correct: false }, { text: "", correct: false }, { text: "", correct: false }, { text: "", correct: false },
  ]);

  const submit = () => {
    if (!question.trim()) return toast.error("Vui lòng nhập câu hỏi");
    onSaved({
      id: `q-${Date.now()}`,
      text: question.trim(),
      at: time,
    });
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sky-700 text-base font-bold">Thêm: {label}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Thời gian hiển thị" required>
              <TextInput value={time} onChange={(e) => setTime(e.target.value)} placeholder="00:00" />
            </Field>
            <label className="inline-flex items-start gap-2 pt-6 text-sm">
              <Checkbox checked={requireCorrect} onCheckedChange={(v) => setRequireCorrect(!!v)} />
              <span className="font-semibold text-slate-700">Yêu cầu trả lời đúng để ghi nhận hoàn thành học liệu</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <Checkbox checked={pauseVideo} onCheckedChange={(v) => setPauseVideo(!!v)} />
              <span>Tạm dừng video</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <Checkbox checked={allowRetry} onCheckedChange={(v) => setAllowRetry(!!v)} />
              <span>Cho phép làm lại</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <Checkbox checked={showAnswer} onCheckedChange={(v) => setShowAnswer(!!v)} />
              <span>Xem đáp án</span>
            </label>
          </div>

          <Field label="Câu hỏi" required>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
            />
          </Field>

          {(type === "mcq" || type === "drag") && (
            <Field label="Câu trả lời" required>
              <div className="space-y-2">
                {answers.map((a, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700 w-6">{String.fromCharCode(65 + i)}.</span>
                    <Checkbox
                      checked={a.correct}
                      onCheckedChange={(v) => setAnswers((s) => s.map((x, ix) => ix === i ? { ...x, correct: !!v } : x))}
                    />
                    <input
                      value={a.text}
                      onChange={(e) => setAnswers((s) => s.map((x, ix) => ix === i ? { ...x, text: e.target.value } : x))}
                      className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                    <button
                      onClick={() => setAnswers((s) => s.filter((_, ix) => ix !== i))}
                      className="h-8 w-8 text-slate-400 hover:text-rose-600 flex items-center justify-center"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setAnswers((s) => [...s, { text: "", correct: false }])}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg"
                >
                  <Plus className="h-3.5 w-3.5" /> Thêm câu trả lời
                </button>
              </div>
            </Field>
          )}

          {type === "fill" && (
            <Field label="Đáp án (mỗi chỗ trống 1 dòng)" required>
              <textarea
                rows={3}
                placeholder="VD:&#10;số 5&#10;phân số"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
              />
            </Field>
          )}

          {type === "match" && (
            <Field label="Cặp nối (A | B)" required>
              <textarea
                rows={4}
                placeholder="VD:&#10;1/2 | 0.5&#10;3/4 | 0.75"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
              />
            </Field>
          )}

          {type === "reorder" && (
            <Field label="Các phần tử cần sắp xếp (mỗi dòng 1 mục)" required>
              <textarea
                rows={4}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
              />
            </Field>
          )}

          {type === "essay" && (
            <Field label="Đáp án mẫu (không bắt buộc)">
              <textarea
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
              />
            </Field>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t">
          <Button variant="outline" size="sm" onClick={onClose}>Hủy</Button>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={submit}>Thêm câu hỏi</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ============= Convenience: single-piece controller ============= */

export function useMaterialFlow() {
  const [pending, setPending] = useState<MaterialTypeKey | null>(null);
  return {
    open: (k: MaterialTypeKey) => setPending(k),
    close: () => setPending(null),
    node: (onSaved?: (p: { title: string; type: MaterialTypeKey }) => void) =>
      pending ? (
        <MaterialFormModal
          type={pending}
          onClose={() => setPending(null)}
          onSaved={onSaved}
        />
      ) : null,
  };
}
