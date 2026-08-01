import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft, ChevronDown, Plus, ListChecks, FileCheck2, Users,
  Video, FileText, Music, BookOpen, HelpCircle, X, Check, ExternalLink,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BAN_QUYEN_SETS, getSetContent, KIND_META, type BanQuyenMaterial } from "@/lib/ban-quyen-data";
import { toast } from "sonner";


export const Route = createFileRoute("/hoc-lieu/ban-quyen/$setId")({
  head: () => ({
    meta: [
      { title: "Chi tiết bộ học liệu | Tiểu học Tô Hiệu" },
      { name: "description", content: "Duyệt và chọn học liệu bản quyền để giao bài, tạo bài giảng hoặc bài kiểm tra." },
    ],
  }),
  component: SetDetailPage,
});

type Mode = "assign" | "lesson" | "test";

function iconOfKind(k: BanQuyenMaterial["kind"]) {
  const map = { video: Video, questions: HelpCircle, book: BookOpen, doc: FileText, audio: Music } as const;
  return map[k];
}

function SetDetailPage() {
  const { setId } = Route.useParams();
  const navigate = useNavigate();
  const set = BAN_QUYEN_SETS.find(s => s.id === setId);
  const chapters = useMemo(() => getSetContent(setId), [setId]);

  const [activeChapter, setActiveChapter] = useState(chapters[0]?.id);
  const [activeLesson, setActiveLesson] = useState(chapters[0]?.lessons[0]?.id);
  const [mode, setMode] = useState<Mode>("assign");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewMat, setPreviewMat] = useState<BanQuyenMaterial | null>(null);

  const chapter = chapters.find(c => c.id === activeChapter) ?? chapters[0];
  const lesson = chapter?.lessons.find(l => l.id === activeLesson) ?? chapter?.lessons[0];

  const toggle = (id: string, disabled: boolean) => {
    if (disabled) return;
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const enterMode = (m: Mode) => {
    setMode(m);
    setSelected(new Set());
  };

  const isSelectable = (m: BanQuyenMaterial) => {
    if (mode === "assign") return false;
    if (mode === "test") return m.kind === "questions";
    return true; // lesson: all
  };

  const confirmSelection = () => {
    if (selected.size === 0) {
      toast.error("Vui lòng chọn ít nhất 1 học liệu.");
      return;
    }
    // Build a rich payload so the lesson-create page can auto-fill topics & materials.
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
    const gradeNum = set?.grade.replace(/[^0-9]/g, "") ?? "";
    sessionStorage.setItem("banquyen.preselected", JSON.stringify({
      mode, setId, setTitle: set?.title, grade: gradeNum, subject: set?.subject, items,
    }));
    if (mode === "lesson") {
      toast.success(`Đã chọn ${selected.size} học liệu — chuyển sang tạo bài giảng.`);
      navigate({ to: "/hoc-lieu/bai-giang/tao-moi", search: { from: "banquyen", khoi: `Lớp ${gradeNum}`, mon: set?.subject } });
    } else {
      toast.success(`Đã chọn ${selected.size} bộ câu hỏi — chuyển sang tạo đề kiểm tra.`);
      navigate({ to: "/hoc-lieu/de-kiem-tra" });
    }
  };


  if (!set) {
    return (
      <AppShell>
        <div className="p-6">
          <Link to="/hoc-lieu/ban-quyen" className="text-indigo-600 text-sm font-semibold">← Quay lại kho học liệu bản quyền</Link>
          <div className="mt-4 text-slate-600">Không tìm thấy bộ học liệu.</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/hoc-lieu/ban-quyen" className="h-10 w-10 grid place-items-center rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Chi tiết bộ học liệu</h1>
            <p className="text-sm italic text-slate-500">Học liệu OLM/Bộ học liệu/{set.title} theo {set.publisher}</p>
          </div>
        </div>

        {/* Toolbar (right-aligned CTA) */}
        <div className="flex items-center justify-end gap-2">
          {mode !== "assign" && (
            <>
              <div className="text-sm text-slate-600 mr-2">
                Đang chọn <b className="text-indigo-700">{selected.size}</b> học liệu {mode === "test" ? "(chỉ Bộ câu hỏi)" : ""}
              </div>
              <button onClick={() => enterMode("assign")} className="px-3 py-2 text-sm font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5">
                <X className="h-4 w-4" /> Hủy
              </button>
              <button
                onClick={confirmSelection}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-700 text-white hover:bg-indigo-800 inline-flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" /> Xác nhận ({selected.size})
              </button>
            </>
          )}
          {mode === "assign" && (
            <DropdownMenu>
              <DropdownMenuTrigger className="px-4 py-2 rounded-lg bg-indigo-700 text-white text-sm font-semibold hover:bg-indigo-800 inline-flex items-center gap-1.5">
                <Plus className="h-4 w-4" /> Thêm mới <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => enterMode("test")}><FileCheck2 className="h-4 w-4 mr-2" /> Đề kiểm tra</DropdownMenuItem>
                <DropdownMenuItem onClick={() => enterMode("lesson")}><ListChecks className="h-4 w-4 mr-2" /> Bài giảng</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Body */}
        <div className="grid grid-cols-12 gap-4">
          {/* Mục lục */}
          <aside className="col-span-12 lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b bg-slate-50 flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-indigo-600" />
              <div className="text-sm font-bold text-slate-700">Mục lục</div>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              {chapters.map(ch => (
                <div key={ch.id} className="border-b last:border-b-0">
                  <button
                    onClick={() => setActiveChapter(ch.id)}
                    className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm font-semibold ${activeChapter === ch.id ? "text-indigo-700 bg-indigo-50" : "text-slate-700 hover:bg-slate-50"}`}
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
                            className={`w-full text-left px-4 py-2 text-sm border-l-4 ${activeLesson === l.id ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold" : "border-transparent text-slate-600 hover:bg-slate-50"}`}
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
          </aside>

          {/* Right list */}
          <section className="col-span-12 lg:col-span-9 space-y-3">
            <div className="flex items-center">
              <select className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700">
                <option>Loại học liệu</option>
                <option>Video</option><option>Bộ câu hỏi</option><option>Sách số</option>
              </select>
            </div>

            {lesson?.sections.map(sec => (
              <div key={sec.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="px-4 py-3 border-b bg-slate-50 flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-indigo-600" />
                  <div className="text-sm font-bold text-slate-800">{sec.title}</div>
                </div>
                <ul>
                  {sec.materials.map(m => {
                    const Icon = iconOfKind(m.kind);
                    const meta = KIND_META[m.kind];
                    const selectable = isSelectable(m);
                    const checked = selected.has(m.id);
                    const disabled = mode !== "assign" && !selectable;
                    const rowClick = () => {
                      if (mode === "assign") setPreviewMat(m);
                      else toggle(m.id, disabled);
                    };
                    return (
                      <li
                        key={m.id}
                        onClick={rowClick}
                        className={`group flex items-center gap-3 px-4 py-3 border-b last:border-b-0 cursor-pointer transition ${
                          disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-50/60"
                        } ${checked ? "bg-indigo-50" : ""}`}
                      >
                        <span className={`h-9 w-9 rounded-full grid place-items-center ${meta.bg} ${meta.color} shrink-0`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-indigo-700 group-hover:underline truncate inline-flex items-center gap-1">
                            {m.title}
                            <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 shrink-0" />
                          </div>
                          <div className="text-[11px] text-slate-500">{meta.label}</div>
                        </div>
                        {mode === "assign" ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={(e) => { e.stopPropagation(); toast.success(`Chọn giao bài: ${m.title}`); }}
                              className="px-3 py-1.5 text-xs font-semibold rounded-md bg-sky-100 text-sky-700 hover:bg-sky-200 inline-flex items-center gap-1"
                            >
                              <Users className="h-3.5 w-3.5" /> Chọn giao bài
                            </button>
                            {m.kind === "questions" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const gradeNum = set?.grade.replace(/[^0-9]/g, "") ?? "";
                                  sessionStorage.setItem("banquyen.preselected", JSON.stringify({
                                    mode: "test", setId, setTitle: set?.title, grade: gradeNum, subject: set?.subject,
                                    items: [{ id: m.id, title: m.title, kind: m.kind, chapterId: chapter?.id, chapterTitle: chapter?.title }],
                                  }));
                                  toast.success(`Tạo đề từ: ${m.title}`);
                                  navigate({ to: "/hoc-lieu/de-kiem-tra" });
                                }}
                                className="px-3 py-1.5 text-xs font-semibold rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 inline-flex items-center gap-1"
                              >
                                <FileCheck2 className="h-3.5 w-3.5" /> Tạo đề
                              </button>
                            )}
                          </div>
                        ) : (

                          <button
                            onClick={(e) => { e.stopPropagation(); toggle(m.id, disabled); }}
                            disabled={disabled}
                            className={`h-6 w-6 rounded-md grid place-items-center border shrink-0 ${checked ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-300 text-transparent"} ${disabled ? "cursor-not-allowed" : ""}`}
                          >
                            <Check className="h-4 w-4" strokeWidth={3} />
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>

              </div>
            ))}
          </section>
        </div>
      </div>

      {/* Preview material */}
      <Dialog open={!!previewMat} onOpenChange={(o) => !o && setPreviewMat(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-indigo-700">Xem nội dung học liệu</DialogTitle>
          </DialogHeader>
          {previewMat && (() => {
            const Icon = iconOfKind(previewMat.kind);
            const meta = KIND_META[previewMat.kind];
            return (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
                  <span className={`h-11 w-11 rounded-full grid place-items-center ${meta.bg} ${meta.color}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-base font-bold text-slate-800">{previewMat.title}</div>
                    <div className="text-xs text-slate-500">{meta.label} · {set?.title}</div>
                  </div>
                </div>
                <div className="aspect-video rounded-xl border bg-slate-50 grid place-items-center text-slate-400 text-sm">
                  Xem trước học liệu ({meta.label})
                </div>
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewMat(null)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

