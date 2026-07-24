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

  const isSelectable = (m: BanQuyenMaterial) => {
    if (mode === "giao-bai") return true;
    if (mode === "kiem-tra") return m.kind === "questions";
    return true;
  };
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
    sessionStorage.setItem("banquyen.preselected", JSON.stringify({ mode, ids: Array.from(selected), setId: bookId }));
    if (mode === "bai-giang") navigate({ to: "/hoc-lieu/bai-giang/tao-moi", search: { from: "banquyen" } });
    else if (mode === "kiem-tra") navigate({ to: "/hoc-lieu/de-kiem-tra" });
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
            Đang chọn <b className="text-indigo-700">{selected.size}</b> học liệu {mode === "kiem-tra" ? "(chỉ Bộ câu hỏi)" : ""}
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
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={disabled}
                            onChange={() => toggle(m.id, disabled)}
                            className="h-4 w-4 accent-indigo-600 shrink-0"
                          />
                          <span className={`h-9 w-9 rounded-full grid place-items-center ${kmeta.bg} ${kmeta.color} shrink-0`}>
                            <IconM className="h-4 w-4" />
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-slate-800 truncate">{m.title}</div>
                            <div className="text-[11px] text-slate-500">{kmeta.label}</div>
                          </div>
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
