import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft, ListChecks, FileCheck2, Users, ChevronDown, Check, X,
  Video, FileText, Music, BookOpen, HelpCircle,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { BAN_QUYEN_SETS, getSetContent, KIND_META, type BanQuyenMaterial } from "@/lib/ban-quyen-data";
import { toast } from "sonner";

type Mode = "giao-bai" | "bai-giang" | "kiem-tra";
const VALID: Mode[] = ["giao-bai", "bai-giang", "kiem-tra"];

const MODE_META: Record<Mode, { label: string; icon: React.ComponentType<{ className?: string }>; }> = {
  "giao-bai":  { label: "Giao bài",     icon: Users },
  "bai-giang": { label: "Bài giảng",    icon: ListChecks },
  "kiem-tra":  { label: "Đề kiểm tra",  icon: FileCheck2 },
};

export const Route = createFileRoute("/hoc-lieu/ban-quyen/tao-moi/$mode")({
  head: () => ({
    meta: [
      { title: "Tạo mới từ Kho học liệu bản quyền | Tiểu học Tô Hiệu" },
      { name: "description", content: "Chọn học liệu bản quyền để tạo bài giảng, bài kiểm tra hoặc giao bài." },
    ],
  }),
  component: BanQuyenTaoMoiPage,
});

function iconOfKind(k: BanQuyenMaterial["kind"]) {
  const map = { video: Video, questions: HelpCircle, book: BookOpen, doc: FileText, audio: Music } as const;
  return map[k];
}

function BanQuyenTaoMoiPage() {
  const raw = Route.useParams().mode as Mode;
  const mode: Mode = VALID.includes(raw) ? raw : "bai-giang";
  const navigate = useNavigate();
  const meta = MODE_META[mode];
  const Icon = meta.icon;

  if (mode === "kiem-tra") return <TestCompilerPage />;


  // Left: book (set) list
  const books = BAN_QUYEN_SETS.slice(0, 6);
  const [bookId, setBookId] = useState<string | null>(null);
  const chapters = useMemo(() => (bookId ? getSetContent(bookId) : []), [bookId]);
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const chapter = chapters.find(c => c.id === activeChapter) ?? chapters[0];
  const lesson = chapter?.lessons.find(l => l.id === activeLesson) ?? chapter?.lessons[0];

  const pickBook = (id: string) => {
    setBookId(id);
    const tree = getSetContent(id);
    setActiveChapter(tree[0]?.id ?? null);
    setActiveLesson(tree[0]?.lessons[0]?.id ?? null);
    setSelected(new Set());
  };

  const isSelectable = (_m: BanQuyenMaterial) => true;

  const toggle = (id: string, disabled: boolean) => {
    if (disabled) return;
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const confirm = () => {
    if (selected.size === 0) return toast.error("Vui lòng chọn ít nhất 1 học liệu.");
    const set = books.find(b => b.id === bookId);
    const gradeNum = set?.grade.replace(/[^0-9]/g, "") ?? "";
    // Build items payload matching bai-giang hydration shape
    const items: { id: string; title: string; kind: BanQuyenMaterial["kind"]; chapterId: string; chapterTitle: string }[] = [];
    for (const ch of chapters) {
      for (const l of ch.lessons) {
        for (const sec of l.sections) {
          for (const m of sec.materials) {
            if (selected.has(m.id)) {
              items.push({ id: m.id, title: m.title, kind: m.kind, chapterId: ch.id, chapterTitle: ch.title });
            }
          }
        }
      }
    }
    sessionStorage.setItem("banquyen.preselected", JSON.stringify({
      mode: mode === "bai-giang" ? "lesson" : "assign",
      setId: bookId, setTitle: set?.title, grade: gradeNum, subject: set?.subject, items,
    }));
    if (mode === "bai-giang") navigate({ to: "/hoc-lieu/bai-giang/tao-moi", search: { from: "banquyen", khoi: gradeNum ? `Lớp ${gradeNum}` : undefined, mon: set?.subject } });
    else navigate({ to: "/giao-bai-tap" });
    toast.success(`Đã chọn ${selected.size} học liệu.`);
  };

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Link to="/hoc-lieu/ban-quyen" className="h-10 w-10 grid place-items-center rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-indigo-100 grid place-items-center text-indigo-600"><Icon className="h-5 w-5" /></div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Tạo mới: {meta.label}</h1>
              <p className="text-sm italic text-slate-500">Chọn 1 bộ học liệu bản quyền, sau đó tick các học liệu cần dùng.</p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-end gap-2">
          <div className="text-sm text-slate-600 mr-2">
            Đang chọn <b className="text-indigo-700">{selected.size}</b> học liệu
          </div>
          <button onClick={() => setSelected(new Set())} className="px-3 py-2 text-sm font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5">
            <X className="h-4 w-4" /> Bỏ chọn
          </button>
          <button
            onClick={confirm}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-700 text-white hover:bg-indigo-800 inline-flex items-center gap-1.5"
          >
            <Check className="h-4 w-4" /> Xác nhận ({selected.size})
          </button>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Tên sách */}
          <aside className="col-span-12 md:col-span-3 lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-3 py-3 border-b bg-slate-50 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-600" />
              <div className="text-sm font-bold text-slate-700">Tên sách</div>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              {books.map(b => {
                const active = bookId === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => pickBook(b.id)}
                    className={`relative w-full text-left px-3 py-3 border-b last:border-b-0 text-sm ${active ? "bg-indigo-50 border-l-4 border-indigo-600 text-indigo-700 font-semibold" : "text-slate-700 hover:bg-slate-50"}`}
                  >
                    <div className="absolute top-0 right-0 rotate-45 translate-x-3 -translate-y-1 bg-blue-600 text-white text-[9px] font-bold px-4 py-0.5 shadow">HEID</div>
                    {b.title.replace(/theo Chương trình GDPT/i, "Theo SGK")}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Mục lục */}
          <aside className="col-span-12 md:col-span-4 lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-3 py-3 border-b bg-slate-50 flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-indigo-600" />
              <div className="text-sm font-bold text-slate-700">Mục lục</div>
            </div>
            {!bookId ? (
              <div className="p-6 text-sm text-slate-500 text-center">Chọn 1 bộ sách để xem mục lục.</div>
            ) : (
              <div className="max-h-[70vh] overflow-y-auto">
                {chapters.map(ch => (
                  <div key={ch.id} className="border-b last:border-b-0">
                    <button
                      onClick={() => setActiveChapter(ch.id)}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm font-semibold ${activeChapter === ch.id ? "text-indigo-700 bg-indigo-50" : "text-slate-700 hover:bg-slate-50"}`}
                    >
                      {ch.title}
                      <ChevronDown className={`h-4 w-4 transition ${activeChapter === ch.id ? "rotate-180" : ""}`} />
                    </button>
                    {activeChapter === ch.id && (
                      <ul>
                        {ch.lessons.map(l => (
                          <li key={l.id}>
                            <button
                              onClick={() => setActiveLesson(l.id)}
                              className={`w-full text-left px-3 py-2 text-sm border-l-4 ${activeLesson === l.id ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold" : "border-transparent text-slate-600 hover:bg-slate-50"}`}
                            >
                              {l.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </aside>

          {/* Content list */}
          <section className="col-span-12 md:col-span-5 lg:col-span-7 space-y-3">
            {!bookId ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
                Vui lòng chọn 1 bộ học liệu ở cột bên trái.
              </div>
            ) : (
              lesson?.sections.map(sec => (
                <div key={sec.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <div className="px-4 py-3 border-b bg-slate-50 flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-indigo-600" />
                    <div className="text-sm font-bold text-slate-800">{sec.title}</div>
                  </div>
                  <ul>
                    {sec.materials.map(m => {
                      const IconM = iconOfKind(m.kind);
                      const kmeta = KIND_META[m.kind];
                      const selectable = isSelectable(m);
                      const disabled = !selectable;
                      const checked = selected.has(m.id);
                      return (
                        <li key={m.id} className={`flex items-center gap-3 px-4 py-3 border-b last:border-b-0 ${disabled ? "opacity-50" : ""}`}>
                          <span className={`h-9 w-9 rounded-full grid place-items-center ${kmeta.bg} ${kmeta.color} shrink-0`}>
                            <IconM className="h-4 w-4" />
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-slate-800 truncate">{m.title}</div>
                            <div className="text-[11px] text-slate-500">{kmeta.label}</div>
                          </div>
                          <button
                            onClick={() => toggle(m.id, disabled)}
                            disabled={disabled}
                            className={`h-6 w-6 rounded-md grid place-items-center border shrink-0 ${checked ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-300 text-transparent"} ${disabled ? "cursor-not-allowed" : ""}`}
                          >
                            <Check className="h-4 w-4" strokeWidth={3} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}

/* ==================== Test Compiler (Tạo bài kiểm tra từ bản quyền) ==================== */

import { BAN_QUYEN_SUBJECTS, BAN_QUYEN_GRADES } from "@/lib/ban-quyen-data";
import { Plus, Minus, ArrowRight } from "lucide-react";

type PickerPick = { subject: string; grade: string; setId: string; setTitle: string; chapterId: string; chapterTitle: string; lessonId: string; lessonTitle: string };

type QItem = { id: string; text: string; type: "Trắc nghiệm" | "Đúng/Sai" | "Điền khuyết" | "Tự luận"; difficulty: "Dễ" | "TB" | "Khó" };

function mockQuestionsFor(lessonId: string): QItem[] {
  const types: QItem["type"][] = ["Trắc nghiệm", "Đúng/Sai", "Điền khuyết", "Tự luận"];
  const diffs: QItem["difficulty"][] = ["Dễ", "TB", "Khó"];
  const stems = [
    "Số nào lớn nhất trong các số sau",
    "Kết quả của phép tính 235 + 148 là",
    "Điền số thích hợp vào chỗ trống: 1m = ___ mm",
    "Hình nào dưới đây là hình vuông?",
    "So sánh hai số 812 và 821",
    "Đơn vị đo độ dài phù hợp cho chiều dài cái bút chì là",
    "Phép chia 24 : 4 có kết quả là",
    "Tìm x biết x + 15 = 42",
  ];
  return Array.from({ length: 12 }).map((_, i) => ({
    id: `${lessonId}-q${i}`,
    text: stems[(i + lessonId.length) % stems.length],
    type: types[i % types.length],
    difficulty: diffs[i % diffs.length],
  }));
}

function TestCompilerPage() {
  const navigate = useNavigate();
  const [picker, setPicker] = useState(true);
  const [pick, setPick] = useState<PickerPick | null>(null);
  const [pool, setPool] = useState<QItem[]>([]);
  const [chosen, setChosen] = useState<QItem[]>([]);

  const onConfirmPicker = (p: PickerPick) => {
    setPick(p);
    setPool(mockQuestionsFor(p.lessonId));
    setPicker(false);
  };

  const addQ = (q: QItem) => {
    if (chosen.find(c => c.id === q.id)) return;
    setChosen(prev => [...prev, q]);
  };
  const removeQ = (id: string) => setChosen(prev => prev.filter(c => c.id !== id));

  const confirm = () => {
    if (chosen.length === 0) return toast.error("Vui lòng chọn ít nhất 1 câu hỏi.");
    sessionStorage.setItem("banquyen.preselected", JSON.stringify({
      mode: "test",
      setId: pick?.setId, setTitle: pick?.setTitle,
      grade: pick?.grade.replace(/[^0-9]/g, ""), subject: pick?.subject,
      chapterTitle: pick?.chapterTitle, lessonTitle: pick?.lessonTitle,
      questions: chosen,
    }));
    toast.success(`Đã biên soạn ${chosen.length} câu hỏi.`);
    navigate({ to: "/hoc-lieu/de-kiem-tra" });
  };

  const diffColor: Record<QItem["difficulty"], string> = {
    "Dễ": "bg-emerald-100 text-emerald-700",
    "TB": "bg-amber-100 text-amber-700",
    "Khó": "bg-rose-100 text-rose-700",
  };

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Link to="/hoc-lieu/ban-quyen" className="h-10 w-10 grid place-items-center rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2 flex-1">
            <div className="h-10 w-10 rounded-xl bg-indigo-100 grid place-items-center text-indigo-600"><FileCheck2 className="h-5 w-5" /></div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-extrabold text-slate-900">Tạo mới: Đề kiểm tra</h1>
              <p className="text-sm italic text-slate-500 truncate">
                {pick ? `${pick.subject} · ${pick.grade} · ${pick.setTitle} · ${pick.lessonTitle}` : "Chọn bài học từ Kho bản quyền, sau đó biên soạn câu hỏi."}
              </p>
            </div>
          </div>
          <button onClick={() => setPicker(true)} className="px-3 py-2 text-sm font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">
            Đổi bài học
          </button>
          <button onClick={confirm} className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-700 text-white hover:bg-indigo-800 inline-flex items-center gap-1.5">
            <Check className="h-4 w-4" /> Xác nhận ({chosen.length})
          </button>
        </div>

        {!pick ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
            Chưa chọn bài học. <button className="text-indigo-700 font-semibold underline" onClick={() => setPicker(true)}>Chọn bài học ngay</button>.
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-4">
            {/* Left: pool */}
            <section className="col-span-12 md:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b bg-slate-50 flex items-center justify-between">
                <div className="text-sm font-bold text-slate-800">Bộ câu hỏi bản quyền</div>
                <div className="text-xs text-slate-500">{pool.length} câu</div>
              </div>
              <ul className="max-h-[65vh] overflow-y-auto divide-y">
                {pool.map((q, i) => {
                  const picked = !!chosen.find(c => c.id === q.id);
                  return (
                    <li key={q.id} className={`px-4 py-3 flex items-start gap-3 ${picked ? "bg-indigo-50/40" : "hover:bg-slate-50"}`}>
                      <div className="text-xs font-bold text-slate-400 w-6 pt-0.5">{i + 1}.</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-800">{q.text}</div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">{q.type}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${diffColor[q.difficulty]}`}>{q.difficulty}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => addQ(q)}
                        disabled={picked}
                        className={`h-7 w-7 grid place-items-center rounded-md border shrink-0 ${picked ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed" : "bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50"}`}
                        title="Thêm sang đề"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* Right: chosen */}
            <section className="col-span-12 md:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b bg-indigo-50 flex items-center justify-between">
                <div className="text-sm font-bold text-indigo-800">Câu hỏi đã chọn cho đề</div>
                <div className="text-xs text-indigo-700 font-semibold">{chosen.length} câu</div>
              </div>
              {chosen.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">Chưa có câu hỏi. Nhấn <Plus className="h-3 w-3 inline" /> hoặc mũi tên ở cột trái để thêm.</div>
              ) : (
                <ul className="max-h-[65vh] overflow-y-auto divide-y">
                  {chosen.map((q, i) => (
                    <li key={q.id} className="px-4 py-3 flex items-start gap-3">
                      <div className="text-xs font-bold text-indigo-600 w-6 pt-0.5">{i + 1}.</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-800">{q.text}</div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">{q.type}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${diffColor[q.difficulty]}`}>{q.difficulty}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeQ(q.id)}
                        className="h-7 w-7 grid place-items-center rounded-md border border-rose-200 text-rose-600 hover:bg-rose-50 shrink-0"
                        title="Bỏ khỏi đề"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>

      {picker && (
        <LessonPickerModal
          initial={pick ?? undefined}
          onClose={() => setPicker(false)}
          onConfirm={onConfirmPicker}
        />
      )}
    </AppShell>
  );
}

function LessonPickerModal({ initial, onClose, onConfirm }: {
  initial?: PickerPick;
  onClose: () => void;
  onConfirm: (p: PickerPick) => void;
}) {
  const [subject, setSubject] = useState<string | null>(initial?.subject ?? null);
  const [grade, setGrade] = useState<string | null>(initial?.grade ?? null);
  const [setId, setSetId] = useState<string | null>(initial?.setId ?? null);
  const [chapterId, setChapterId] = useState<string | null>(initial?.chapterId ?? null);
  const [lessonId, setLessonId] = useState<string | null>(initial?.lessonId ?? null);

  const books = useMemo(
    () => (subject && grade ? BAN_QUYEN_SETS.filter(s => s.subject === subject && s.grade === grade) : []),
    [subject, grade],
  );
  const chapters = useMemo(() => (setId ? getSetContent(setId) : []), [setId]);
  const chapter = chapters.find(c => c.id === chapterId);

  const canConfirm = subject && grade && setId && chapterId && lessonId;

  const doConfirm = () => {
    if (!canConfirm) return;
    const set = books.find(b => b.id === setId)!;
    const ch = chapters.find(c => c.id === chapterId)!;
    const l = ch.lessons.find(x => x.id === lessonId)!;
    onConfirm({
      subject: subject!, grade: grade!, setId: setId!, setTitle: set.title,
      chapterId: chapterId!, chapterTitle: ch.title, lessonId: lessonId!, lessonTitle: l.title,
    });
  };

  const step = !subject ? 1 : !grade ? 2 : !setId ? 3 : 4;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 grid place-items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Chọn bài học</h2>
            <p className="text-xs italic text-slate-500">Chọn tuần tự: Môn → Lớp → Bộ sách → Bài học</p>
          </div>
          <button onClick={onClose} className="h-9 w-9 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-500"><X className="h-5 w-5" /></button>
        </div>

        {/* Breadcrumb */}
        <div className="px-6 py-2 border-b bg-slate-50 flex items-center gap-2 text-xs flex-wrap">
          {[
            { i: 1, k: "Môn", v: subject, reset: () => { setSubject(null); setGrade(null); setSetId(null); setChapterId(null); setLessonId(null); } },
            { i: 2, k: "Lớp", v: grade, reset: () => { setGrade(null); setSetId(null); setChapterId(null); setLessonId(null); } },
            { i: 3, k: "Bộ sách", v: setId ? (books.find(b => b.id === setId)?.title ?? "") : null, reset: () => { setSetId(null); setChapterId(null); setLessonId(null); } },
            { i: 4, k: "Bài học", v: lessonId ? (chapter?.lessons.find(l => l.id === lessonId)?.title ?? "") : null, reset: () => { setChapterId(null); setLessonId(null); } },
          ].map((s, idx, arr) => (
            <div key={s.i} className="flex items-center gap-1">
              <button onClick={s.reset} className={`px-2 py-1 rounded font-semibold ${s.v ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" : step === s.i ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                {s.k}{s.v ? `: ${String(s.v).length > 30 ? String(s.v).slice(0, 30) + "…" : s.v}` : ""}
              </button>
              {idx < arr.length - 1 && <ChevronDown className="h-3 w-3 -rotate-90 text-slate-400" />}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {BAN_QUYEN_SUBJECTS.map(s => (
                <button key={s.key} onClick={() => setSubject(s.key)} className="px-4 py-6 rounded-xl border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 text-sm font-bold text-slate-800">
                  {s.label}
                </button>
              ))}
            </div>
          )}
          {step === 2 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {BAN_QUYEN_GRADES.map(g => (
                <button key={g} onClick={() => setGrade(g)} className="px-4 py-6 rounded-xl border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 text-sm font-bold text-slate-800">
                  {g}
                </button>
              ))}
            </div>
          )}
          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {books.length === 0 ? (
                <div className="col-span-2 text-center text-sm text-slate-500 py-8">Không có bộ sách phù hợp.</div>
              ) : books.map(b => (
                <button key={b.id} onClick={() => setSetId(b.id)} className="p-4 rounded-xl border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 text-left">
                  <div className="text-sm font-bold text-slate-800">{b.title}</div>
                  <div className="text-xs text-slate-500 mt-1">{b.publisher} · {b.source}</div>
                </button>
              ))}
            </div>
          )}
          {step === 4 && (
            <div className="space-y-3">
              {chapters.map(ch => (
                <div key={ch.id} className="border rounded-xl overflow-hidden">
                  <button onClick={() => { setChapterId(ch.id); setLessonId(null); }} className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold ${chapterId === ch.id ? "bg-indigo-50 text-indigo-700" : "bg-slate-50 text-slate-700 hover:bg-slate-100"}`}>
                    {ch.title}
                    <ChevronDown className={`h-4 w-4 transition ${chapterId === ch.id ? "rotate-180" : ""}`} />
                  </button>
                  {chapterId === ch.id && (
                    <ul className="divide-y">
                      {ch.lessons.map(l => (
                        <li key={l.id}>
                          <button onClick={() => setLessonId(l.id)} className={`w-full text-left px-4 py-2.5 text-sm border-l-4 ${lessonId === l.id ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold" : "border-transparent text-slate-600 hover:bg-slate-50"}`}>
                            {l.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t flex items-center justify-end gap-2 bg-slate-50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100">Hủy</button>
          <button onClick={doConfirm} disabled={!canConfirm} className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-700 text-white hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5">
            <Check className="h-4 w-4" /> Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

