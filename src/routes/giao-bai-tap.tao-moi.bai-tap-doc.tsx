import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Info, ListChecks, Users, Check, ArrowLeft, Plus, Trash2,
  Upload, Link as LinkIcon, FileText, Video, X, Search, Eye, Save, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

import { getKnowledgeTree } from "@/lib/knowledge-tree";

export const Route = createFileRoute("/giao-bai-tap/tao-moi/bai-tap-doc")({
  head: () => ({ meta: [{ title: "Tạo bài tập đọc - Tìm hiểu" }] }),
  component: Page,
});

/* ---------- Data ---------- */
const GRADES = ["1", "2", "3", "4", "5"];
const SUBJECTS = ["Toán", "Tiếng Việt", "Khoa học", "Đạo đức"];
const CLASSES_BY_GRADE: Record<string, string[]> = {
  "1": ["1A", "1B", "1C"],
  "3": ["3A", "3B", "3C", "3D"],
  "4": ["4A", "4B", "4C", "4D"],
  "5": ["5A", "5B"],
  "2": ["2A", "2B"],
};
const ASSIGN_CLASS_OPTIONS = [
  "Lớp Toán 4A - Cô Hoa",
  "Lớp Toán 4B - Cô Hoa",
  "Lớp Tiếng Việt 4A - Cô Lan",
  "Lớp bổ túc Toán 4",
  "Lớp ôn thi HSG Tiếng Anh",
];
const KNOWLEDGE_UNITS = [
  "Số tự nhiên",
  "Phân số",
  "Đọc hiểu văn bản",
  "Tập làm văn",
  "Đại lượng & đo lường",
];

type Student = { id: string; code: string; name: string };
const STUDENT_DB: Record<string, Student[]> = {
  "4A": [
    { id: "s1", code: "0123456783", name: "Nguyễn An" },
    { id: "s2", code: "0365427720", name: "Mai Huyền" },
    { id: "s3", code: "0123456787", name: "Trần Bảo" },
    { id: "s4", code: "0348844088", name: "Thanh Vân" },
    { id: "s5", code: "0335773123", name: "Vũ Huy Hoàng" },
    { id: "s6", code: "0912125548", name: "Phạm Tất Thắng" },
    { id: "s7", code: "0934778812", name: "Lê Minh Châu" },
  ],
  "4B": [
    { id: "s9", code: "0901123456", name: "Đỗ Quang Huy" },
    { id: "s10", code: "0901123457", name: "Nguyễn Bích Ngọc" },
  ],
  "3A": [
    { id: "s14", code: "0903334456", name: "Trịnh Mỹ Duyên" },
    { id: "s15", code: "0903334457", name: "Phan Đức Anh" },
  ],
};

/* ---------- Types ---------- */
type QKind = "single" | "multi" | "essay";
const Q_LABEL: Record<QKind, string> = {
  single: "Trắc nghiệm 1 đáp án",
  multi: "Trắc nghiệm nhiều đáp án",
  essay: "Tự luận",
};

type Question = {
  id: string;
  kind: QKind;
  text: string;
  options: { text: string; correct: boolean }[];
  score: number;
};

type ContentItem = {
  id: string;
  name: string;
  kind: "file" | "link";
  url?: string;
  questions: Question[];
};

/* ---------- Stepper ---------- */
const STEPS = [
  { id: 1, name: "Thông tin bài tập", icon: Info },
  { id: 2, name: "Nội dung bài tập", icon: ListChecks },
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

/* ============================ Page ============================ */
function Page() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1
  const [title, setTitle] = useState("");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [klass, setKlass] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [assignedClasses, setAssignedClasses] = useState<Set<string>>(new Set());
  const [assignPickerOpen, setAssignPickerOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [assignedAt, setAssignedAt] = useState("");
  const [assignedTime, setAssignedTime] = useState("08:00");
  const [dueAt, setDueAt] = useState("");
  const [dueTime, setDueTime] = useState("23:59");
  const [scale, setScale] = useState("10");
  const [opts, setOpts] = useState({
    lateSubmit: false,
    showScore: true,
    showAnswers: false,
    exportGrade: false,
  });
  const tree = useMemo(() => getKnowledgeTree(grade, subject), [grade, subject]);

  const step1Valid = title.trim() && grade && subject && klass && chapterId && unitId &&
    assignedAt && dueAt && scale;

  // Step 2
  const [taskContent, setTaskContent] = useState("");
  const [graded, setGraded] = useState(true);
  const [contents, setContents] = useState<ContentItem[]>([
    { id: `c-${Date.now()}`, name: "", kind: "file", questions: [] },
  ]);
  const [activeContentId, setActiveContentId] = useState<string>(contents[0].id);
  const activeContent = contents.find((c) => c.id === activeContentId);

  // Tổng điểm dùng chung cho TẤT CẢ câu hỏi trên tất cả nội dung (phải = 10 nếu chấm điểm)
  const totalScore = useMemo(
    () => contents.reduce((s, c) => s + c.questions.reduce((ss, q) => ss + (q.score || 0), 0), 0),
    [contents],
  );
  const totalQuestions = contents.reduce((s, c) => s + c.questions.length, 0);
  const allContentsHaveQuestions = contents.every((c) => c.name && c.questions.length > 0);
  const step2Valid = allContentsHaveQuestions && (!graded || totalScore === 10);


  // Step 3
  const [pickedClass, setPickedClass] = useState<string>("");
  const [pickedStudents, setPickedStudents] = useState<Set<string>>(new Set());
  const [studentQ, setStudentQ] = useState("");

  const classStudents = pickedClass ? (STUDENT_DB[pickedClass] ?? []) : [];
  const filteredStudents = classStudents.filter((s) =>
    s.name.toLowerCase().includes(studentQ.toLowerCase()) || s.code.includes(studentQ));

  const step3Valid = pickedStudents.size > 0;

  /* ---------- Handlers Step 2 ---------- */
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addContent = () => {
    const nc: ContentItem = { id: `c-${Date.now()}`, name: "", kind: "file", questions: [] };
    setContents((p) => [...p, nc]);
    setActiveContentId(nc.id);
  };
  const removeContent = (id: string) => {
    setContents((p) => {
      const nxt = p.filter((c) => c.id !== id);
      if (nxt.length === 0) {
        const fresh: ContentItem = { id: `c-${Date.now()}`, name: "", kind: "file", questions: [] };
        setActiveContentId(fresh.id);
        return [fresh];
      }
      if (id === activeContentId) setActiveContentId(nxt[0].id);
      return nxt;
    });
  };
  const updateContent = (id: string, patch: Partial<ContentItem>) => {
    setContents((p) => p.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };
  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !activeContent) return;
    updateContent(activeContent.id, { name: f.name, kind: "file" });
    toast.success(`Đã tải: ${f.name}`);
    e.target.value = "";
  };

  const addQuestion = (kind: QKind) => {
    if (!activeContent) return;
    const q: Question = {
      id: `q-${Date.now()}`,
      kind,
      text: "",
      options: kind === "essay" ? [] : [
        { text: "", correct: false }, { text: "", correct: false },
        { text: "", correct: false }, { text: "", correct: false },
      ],
      score: 0,
    };
    updateContent(activeContent.id, { questions: [...activeContent.questions, q] });
  };
  const updateQuestion = (qid: string, patch: Partial<Question>) => {
    if (!activeContent) return;
    updateContent(activeContent.id, {
      questions: activeContent.questions.map((q) => (q.id === qid ? { ...q, ...patch } : q)),
    });
  };
  const removeQuestion = (qid: string) => {
    if (!activeContent) return;
    updateContent(activeContent.id, {
      questions: activeContent.questions.filter((q) => q.id !== qid),
    });
  };

  const toggleStudent = (id: string) => {
    setPickedStudents((prev) => {
      const nxt = new Set(prev);
      if (nxt.has(id)) nxt.delete(id); else nxt.add(id);
      return nxt;
    });
  };
  const toggleAllStudents = () => {
    if (pickedStudents.size === filteredStudents.length) {
      setPickedStudents(new Set());
    } else {
      setPickedStudents(new Set(filteredStudents.map((s) => s.id)));
    }
  };

  const submit = () => {
    toast.success("Đã tạo bài tập đọc - Tìm hiểu");
    navigate({ to: "/giao-bai-tap" });
  };

  /* =============================== Render =============================== */
  return (
    <AppShell role="teacher">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/giao-bai-tap" className="p-2 rounded-md hover:bg-slate-100">
              <ArrowLeft className="h-5 w-5 text-slate-700" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Tạo bài tập đọc - Tìm hiểu</h1>
              <p className="text-sm text-slate-500">Điền thông tin, thêm nội dung & câu hỏi rồi gán cho học sinh.</p>
            </div>
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
                placeholder="VD: Đọc hiểu: Cây bàng mùa hè" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Khối <span className="text-rose-500">*</span></label>
                <Select value={grade} onValueChange={(v) => { setGrade(v); setKlass(""); setChapterId(""); setUnitId(""); }}>
                  <SelectTrigger><SelectValue placeholder="Chọn khối" /></SelectTrigger>
                  <SelectContent>{GRADES.map((g) => <SelectItem key={g} value={g}>Khối {g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Môn <span className="text-rose-500">*</span></label>
                <Select value={subject} onValueChange={(v) => { setSubject(v); setChapterId(""); setUnitId(""); }}>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Chương/Chủ đề <span className="text-rose-500">*</span></label>
                <Select value={chapterId} onValueChange={(v) => { setChapterId(v); setUnitId(""); }} disabled={!subject}>
                  <SelectTrigger><SelectValue placeholder={!subject ? "Chọn môn trước" : "Chọn chương/chủ đề"} /></SelectTrigger>
                  <SelectContent>
                    {tree.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Bài học <span className="text-rose-500">*</span></label>
                <Select value={unitId} onValueChange={setUnitId} disabled={!chapterId}>
                  <SelectTrigger><SelectValue placeholder={!chapterId ? "Chọn chương trước" : "Chọn bài học"} /></SelectTrigger>
                  <SelectContent>
                    {(tree.find((c) => c.id === chapterId)?.units ?? []).map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">Lớp học gán <span className="text-rose-500">*</span></label>
              <Popover open={assignPickerOpen} onOpenChange={setAssignPickerOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-md border border-slate-200 bg-white hover:bg-slate-50"
                  >
                    <span className={assignedClasses.size ? "text-slate-800" : "text-slate-400"}>
                      {assignedClasses.size
                        ? Array.from(assignedClasses).join(", ")
                        : "Chọn lớp học để gán bài tập"}
                    </span>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-2" align="start">
                  <ul className="max-h-64 overflow-auto">
                    {ASSIGN_CLASS_OPTIONS.map((c) => (
                      <li key={c}>
                        <label className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer">
                          <Checkbox
                            checked={assignedClasses.has(c)}
                            onCheckedChange={() => {
                              setAssignedClasses((prev) => {
                                const nxt = new Set(prev);
                                if (nxt.has(c)) nxt.delete(c); else nxt.add(c);
                                return nxt;
                              });
                            }}
                          />
                          <span className="text-sm text-slate-700">{c}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </PopoverContent>
              </Popover>
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
                    <Checkbox
                      checked={opts[o.k as keyof typeof opts]}
                      onCheckedChange={(v) => setOpts((p) => ({ ...p, [o.k]: !!v }))}
                    />
                    <span className="text-sm text-slate-700">{o.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <Button
                onClick={() => setStep(2)}
                disabled={!step1Valid}
                className="bg-indigo-700 hover:bg-indigo-800 text-white"
              >
                Tiếp theo
              </Button>
            </div>
          </div>
        )}

        {/* ============ STEP 2 ============ */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Box: Nhập nội dung bài tập */}
            <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-3">
              <h2 className="text-base font-bold text-slate-800">Nhập nội dung bài tập</h2>
              <Input
                value={taskContent}
                onChange={(e) => setTaskContent(e.target.value)}
                placeholder="VD: Đọc kỹ 2 văn bản dưới đây rồi trả lời các câu hỏi."
              />
            </div>

            {/* Box: Nội dung bài tập */}
            <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-4 flex-wrap">
                  <h2 className="text-base font-bold text-slate-800">Nội dung bài tập</h2>
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <Checkbox checked={graded} onCheckedChange={(v) => setGraded(!!v)} />
                    <span>Lấy điểm cho bài tập này</span>
                  </label>
                </div>
                {graded && (
                  <div className={`text-sm font-bold px-3 py-1.5 rounded border ${
                    totalScore === 10 ? "text-emerald-700 border-emerald-200 bg-emerald-50"
                    : "text-amber-700 border-amber-200 bg-amber-50"}`}>
                    {totalScore}/10
                  </div>
                )}
              </div>
              <div className="text-xs text-slate-500">
                {graded
                  ? `Tổng điểm của ${totalQuestions} câu hỏi trên tất cả nội dung phải bằng 10.`
                  : "Bài tập không tính điểm — học sinh chỉ cần hoàn thành."}
              </div>

              {/* Horizontal list of contents */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {contents.map((c, i) => {
                  const active = c.id === activeContentId;
                  return (
                    <div key={c.id}
                      onClick={() => setActiveContentId(c.id)}
                      className={`shrink-0 w-64 rounded-lg border p-3 cursor-pointer transition ${
                        active ? "border-indigo-500 bg-white ring-2 ring-indigo-100"
                        : "border-slate-200 bg-white hover:border-indigo-300"}`}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-semibold text-indigo-700">NỘI DUNG {i + 1}</div>
                        <button onClick={(e) => { e.stopPropagation(); removeContent(c.id); }}
                          className="text-slate-400 hover:text-rose-600">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="mt-2 space-y-2">
                        <Input
                          value={c.name}
                          onChange={(e) => updateContent(c.id, { name: e.target.value })}
                          placeholder="Tên tài liệu"
                          className="h-8 text-sm"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex items-center gap-2">
                          {c.kind === "file" ? (
                            <>
                              <Button size="sm" variant="outline" className="gap-1 h-8"
                                onClick={(e) => { e.stopPropagation(); setActiveContentId(c.id); fileInputRef.current?.click(); }}>
                                <Upload className="h-3.5 w-3.5" /> Tải file
                              </Button>
                              <Button size="sm" variant="ghost" className="gap-1 h-8"
                                onClick={(e) => { e.stopPropagation(); updateContent(c.id, { kind: "link", url: "" }); }}>
                                <LinkIcon className="h-3.5 w-3.5" /> Dán link
                              </Button>
                            </>
                          ) : (
                            <Input
                              value={c.url ?? ""}
                              onChange={(e) => updateContent(c.id, { url: e.target.value })}
                              placeholder="Dán link (doc/video)"
                              className="h-8 text-sm"
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {c.questions.length} câu hỏi
                        </div>
                      </div>
                    </div>
                  );
                })}
                <button
                  onClick={addContent}
                  className="shrink-0 w-40 rounded-lg border-2 border-dashed border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 flex flex-col items-center justify-center gap-1 py-6"
                >
                  <Plus className="h-5 w-5" />
                  <span className="text-sm font-medium">Thêm nội dung</span>
                </button>
                <input type="file" ref={fileInputRef} className="hidden" onChange={onPickFile} />
              </div>

              {/* Questions for active content (below) */}
              <div className="border rounded-xl p-4 space-y-3 bg-slate-50/40">
                {!activeContent ? (
                  <div className="text-sm text-slate-500 text-center py-10">Chọn 1 nội dung để thêm câu hỏi</div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="text-xs text-slate-500">Câu hỏi cho</div>
                        <div className="text-sm font-semibold text-slate-800 truncate">
                          {activeContent.name || "(Chưa đặt tên)"}
                        </div>
                      </div>
                      <Select onValueChange={(v) => addQuestion(v as QKind)}>
                        <SelectTrigger className="w-[190px] h-9">
                          <div className="flex items-center gap-1 text-sm">
                            <Plus className="h-4 w-4" /> <SelectValue placeholder="Thêm câu hỏi" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">{Q_LABEL.single}</SelectItem>
                          <SelectItem value="multi">{Q_LABEL.multi}</SelectItem>
                          <SelectItem value="essay">{Q_LABEL.essay}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {activeContent.questions.length === 0 && (
                      <div className="text-sm text-slate-400 text-center py-8 border-2 border-dashed rounded-lg bg-white">
                        Chưa có câu hỏi. Chọn loại câu hỏi để thêm.
                      </div>
                    )}

                    <div className="space-y-3">
                      {activeContent.questions.map((q, qi) => (
                        <div key={q.id} className="border rounded-lg p-3 space-y-2 bg-white">
                          <div className="flex items-center justify-between">
                            <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
                              Câu {qi + 1} · {Q_LABEL[q.kind]}
                            </Badge>
                            <div className="flex items-center gap-2">
                              {graded && (
                                <div className="flex items-center gap-1 text-xs">
                                  <Input
                                    type="number" min={0} max={10} step={0.5}
                                    value={q.score}
                                    onChange={(e) => updateQuestion(q.id, { score: Number(e.target.value) })}
                                    className="h-8 w-16"
                                  />
                                  <span className="text-slate-500">điểm</span>
                                </div>
                              )}
                              <button onClick={() => removeQuestion(q.id)}
                                className="text-slate-400 hover:text-rose-600">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <Textarea
                            value={q.text}
                            onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                            placeholder={q.kind === "essay"
                              ? "VD: Viết đoạn văn 20 câu mô tả tình cảm của bạn A trong văn bản"
                              : "Nhập nội dung câu hỏi..."}
                            rows={2}
                          />

                          {q.kind !== "essay" && (
                            <div className="space-y-1.5">
                              {q.options.map((op, oi) => (
                                <div key={oi} className="flex items-center gap-2">
                                  {q.kind === "single" ? (
                                    <input
                                      type="radio"
                                      name={`q-${q.id}`}
                                      checked={op.correct}
                                      onChange={() => updateQuestion(q.id, {
                                        options: q.options.map((x, i) => ({ ...x, correct: i === oi })),
                                      })}
                                    />
                                  ) : (
                                    <Checkbox
                                      checked={op.correct}
                                      onCheckedChange={(v) => updateQuestion(q.id, {
                                        options: q.options.map((x, i) => i === oi ? { ...x, correct: !!v } : x),
                                      })}
                                    />
                                  )}
                                  <Input
                                    value={op.text}
                                    onChange={(e) => updateQuestion(q.id, {
                                      options: q.options.map((x, i) => i === oi ? { ...x, text: e.target.value } : x),
                                    })}
                                    placeholder={`Đáp án ${String.fromCharCode(65 + oi)}`}
                                    className="h-8 text-sm"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại
                </Button>
                <div className="flex items-center gap-3">
                  {!step2Valid && (
                    <span className="text-xs text-amber-600">
                      {graded
                        ? "Mỗi nội dung cần có tên & câu hỏi, tổng điểm tất cả câu = 10."
                        : "Mỗi nội dung cần có tên và ít nhất 1 câu hỏi."}
                    </span>
                  )}
                  <Button onClick={() => setStep(3)} disabled={!step2Valid}
                    className="bg-indigo-700 hover:bg-indigo-800 text-white">
                    Tiếp theo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* ============ STEP 3 ============ */}
        {step === 3 && (
          <div className="grid grid-cols-12 gap-4">
            {/* Left summary */}
            <div className="col-span-4 bg-white rounded-2xl border shadow-sm p-4 space-y-3 h-fit">
              <div className="text-xs font-semibold text-indigo-700">TÓM TẮT</div>
              <div>
                <div className="text-xs text-slate-500">Tên bài tập</div>
                <div className="text-sm font-bold text-slate-800">{title}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Hạn nộp</div>
                <div className="text-sm font-semibold text-rose-600">
                  {dueAt} {dueTime}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Nội dung ({contents.length})</div>
                <div className="grid grid-cols-2 gap-2">
                  {contents.map((c, i) => (
                    <div key={c.id} className="rounded-lg border bg-slate-50 px-3 py-2">
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] text-slate-500">Nội dung {i + 1}</div>
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-100 rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center">
                          {c.questions.length}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-slate-800 truncate">
                        {c.name || `Tài liệu ${i + 1}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right students */}
            <div className="col-span-8 bg-white rounded-2xl border shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Danh sách học sinh</h2>
                  <p className="text-xs text-slate-500">
                    Chọn lớp rồi chọn học sinh để gán bài tập.
                  </p>
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
                        onCheckedChange={toggleAllStudents}
                      />
                    </div>
                  </div>
                  <ul className="divide-y max-h-[380px] overflow-y-auto">
                    {filteredStudents.map((s, i) => (
                      <li key={s.id} className="grid grid-cols-12 gap-2 px-3 py-2 items-center hover:bg-slate-50">
                        <div className="col-span-1 text-sm text-slate-500">{String(i + 1).padStart(2, "0")}</div>
                        <div className="col-span-6 text-sm font-medium text-slate-800">{s.name}</div>
                        <div className="col-span-4 text-sm text-slate-600">{s.code}</div>
                        <div className="col-span-1 text-right">
                          <Checkbox
                            checked={pickedStudents.has(s.id)}
                            onCheckedChange={() => toggleStudent(s.id)}
                          />
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
                  <Button variant="outline" onClick={() => toast.success("Đã lưu nháp bài tập")}>
                    <Save className="h-4 w-4 mr-1" /> Lưu nháp
                  </Button>
                  <Button variant="outline" onClick={() => setPreviewOpen(true)}>
                    <Eye className="h-4 w-4 mr-1" /> Xem trước
                  </Button>
                  <Button onClick={submit} disabled={!step3Valid}
                    className="bg-indigo-700 hover:bg-indigo-800 text-white">
                    Thêm bài tập
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-indigo-700">Xem trước bài tập</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="rounded-xl bg-indigo-50/60 border border-indigo-100 p-3">
              <div className="text-lg font-bold text-slate-800">{title || "(Chưa có tên bài tập)"}</div>
              <div className="text-xs text-slate-500 mt-1">
                Khối {grade || "—"} · {subject || "—"} · Lớp {klass || "—"}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Info2 label="Chương/Chủ đề" value={tree.find((c) => c.id === chapterId)?.title || "—"} />
              <Info2 label="Bài học" value={tree.find((c) => c.id === chapterId)?.units.find((u) => u.id === unitId)?.title || "—"} />
              <Info2 label="Ngày giao" value={`${assignedAt || "—"} ${assignedTime}`} />
              <Info2 label="Hạn nộp" value={`${dueAt || "—"} ${dueTime}`} />
              <Info2 label="Thang điểm" value={`${scale} điểm`} />
              <Info2 label="Số học sinh" value={`${pickedStudents.size} học sinh`} />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Lớp học gán</div>
              <div className="flex flex-wrap gap-1.5">
                {assignedClasses.size === 0
                  ? <span className="text-slate-400 text-sm">— chưa chọn —</span>
                  : Array.from(assignedClasses).map((c) => (
                      <Badge key={c} variant="secondary">{c}</Badge>
                    ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Nội dung ({contents.length})</div>
              <ul className="space-y-1.5">
                {contents.map((c, i) => (
                  <li key={c.id} className="flex items-center justify-between rounded-lg border bg-slate-50 px-3 py-2">
                    <span className="text-sm font-semibold text-slate-800">
                      {i + 1}. {c.name || `Tài liệu ${i + 1}`}
                    </span>
                    <span className="text-xs text-slate-500">{c.questions.length} câu hỏi</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Info2({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white px-3 py-2">
      <div className="text-[11px] uppercase text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-slate-800">{value}</div>
    </div>
  );
}

