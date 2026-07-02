import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ArrowLeft, Check, Lock, ChevronDown, Video, FileText, ClipboardList,
  BookOpen, Image as ImageIcon, Presentation, PlayCircle,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useMaterials, type MaterialKind, type Material } from "@/lib/teaching-store";
import { getUnitTitle } from "@/lib/knowledge-tree";
import { useCompletion, markCompleted } from "@/lib/material-progress-store";
import { toast } from "sonner";

export const Route = createFileRoute("/lop-hoc-so/$classId/hoc-lieu/$materialId")({
  head: () => ({ meta: [{ title: "Học liệu – LMS" }] }),
  component: MaterialDetailPage,
});

function MaterialDetailPage() {
  const { classId, materialId } = Route.useParams();
  const navigate = useNavigate();
  const materials = useMaterials();
  const completed = useCompletion();

  const material = materials.find((m) => m.id === materialId);
  const siblings = useMemo(() => {
    if (!material) return [] as Material[];
    return materials.filter(
      (m) =>
        m.classRealId === material.classRealId &&
        m.subject === material.subject &&
        m.unitId === material.unitId,
    );
  }, [materials, material]);

  if (!material) {
    return (
      <AppShell>
        <div className="p-8 text-center text-slate-500">
          Không tìm thấy học liệu.{" "}
          <Link to="/lop-hoc-so/$classId" params={{ classId }} className="text-indigo-600 underline">
            Quay lại lớp
          </Link>
        </div>
      </AppShell>
    );
  }

  const unitTitle =
    material.unitId === "_misc" ? "Học liệu khác" : getUnitTitle(material.unitId);

  const doneCount = siblings.filter((s) => completed.has(s.id)).length;
  const pct = siblings.length ? Math.round((doneCount / siblings.length) * 100) : 0;

  const currentIndex = siblings.findIndex((s) => s.id === material.id);

  const handleFinish = () => {
    markCompleted(material.id);
    toast.success("Đã đánh dấu hoàn thành");
    const next = siblings[currentIndex + 1];
    if (next) {
      navigate({
        to: "/lop-hoc-so/$classId/hoc-lieu/$materialId",
        params: { classId, materialId: next.id },
      });
    }
  };

  return (
    <AppShell>
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Main content */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <button
              onClick={() => navigate({ to: "/lop-hoc-so/$classId", params: { classId } })}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-700"
            >
              <ArrowLeft className="h-4 w-4" /> Quay lại
            </button>
            <button
              onClick={handleFinish}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow"
            >
              <Check className="h-4 w-4" /> Hoàn thành
            </button>
          </div>

          <h1 className="mt-4 text-xl md:text-2xl font-bold text-slate-800">
            {material.title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {unitTitle} · {kindLabel(material.kind)}{material.meta ? ` · ${material.meta}` : ""}
          </p>

          <div className="mt-5">
            <MaterialViewer material={material} />
          </div>
        </section>

        {/* Right side: progress + list */}
        <aside className="space-y-4">
          {/* Progress card — style hình 1 */}
          <div
            className="rounded-2xl overflow-hidden border border-indigo-200 shadow-sm text-white"
            style={{ background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)" }}
          >
            <div className="p-5">
              <div className="flex items-center gap-3">
                <span className="h-11 w-11 rounded-xl bg-white/20 inline-flex items-center justify-center">
                  <BookOpen className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="text-xs uppercase font-semibold opacity-80">Chủ đề</div>
                  <div className="font-bold truncate">{unitTitle}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs">
                <span className="bg-white/20 px-2 py-1 rounded-md font-semibold">
                  {siblings.length} học liệu
                </span>
                <span className="ml-auto font-bold text-lg">{pct}%</span>
              </div>
              <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-300 to-rose-400 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-2 text-xs opacity-90">
                {doneCount}/{siblings.length} hoàn thành
              </div>
            </div>
          </div>

          {/* Timeline list */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="px-4 py-3 border-b flex items-center gap-2">
              <ChevronDown className="h-4 w-4 text-slate-500" />
              <span className="font-bold text-slate-800 text-sm">Danh sách học liệu</span>
            </div>
            <ol className="relative py-3">
              <span
                aria-hidden
                className="absolute left-[34px] top-4 bottom-4 w-px bg-slate-200"
              />
              {siblings.map((s, i) => {
                const active = s.id === material.id;
                const done = completed.has(s.id);
                const locked = !done && !active && i > 0 && !completed.has(siblings[i - 1].id);
                return (
                  <li key={s.id} className="relative">
                    <Link
                      to="/lop-hoc-so/$classId/hoc-lieu/$materialId"
                      params={{ classId, materialId: s.id }}
                      className={`group flex items-center gap-3 pl-3 pr-4 py-2 transition ${
                        active ? "bg-indigo-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <TimelineIcon kind={s.kind} done={done} active={active} locked={locked} />
                      <div className="min-w-0 flex-1">
                        <div className={`text-sm font-semibold truncate ${
                          active ? "text-indigo-700" : "text-slate-800"
                        }`}>
                          {s.title}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <PlayCircle className="h-3 w-3 text-indigo-500" />
                          {kindLabel(s.kind)}
                        </div>
                      </div>
                      {locked && <Lock className="h-3.5 w-3.5 text-slate-400" />}
                    </Link>
                  </li>
                );
              })}
              {siblings.length === 0 && (
                <li className="px-4 py-6 text-sm text-slate-400 italic text-center">
                  Không có học liệu khác trong chủ đề.
                </li>
              )}
            </ol>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function TimelineIcon({
  kind, done, active, locked,
}: { kind: MaterialKind; done: boolean; active: boolean; locked: boolean }) {
  const { Icon, cls } = ICON_MAP[kind];
  return (
    <span className="relative shrink-0">
      <span
        className={`h-11 w-11 rounded-full inline-flex items-center justify-center border-4 ${
          active
            ? "bg-white border-indigo-200 ring-2 ring-indigo-400"
            : done
              ? "bg-white border-emerald-100"
              : locked
                ? "bg-slate-50 border-slate-100"
                : "bg-white border-rose-100"
        }`}
      >
        <span className={`h-8 w-8 rounded-full inline-flex items-center justify-center ${
          done ? "bg-emerald-50 text-emerald-600" : locked ? "bg-slate-100 text-slate-400" : cls
        }`}>
          <Icon className="h-4 w-4" />
        </span>
      </span>
      {done && (
        <span className="absolute -right-0.5 -bottom-0.5 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white inline-flex items-center justify-center">
          <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
        </span>
      )}
    </span>
  );
}

const ICON_MAP: Record<MaterialKind, { Icon: typeof Video; cls: string }> = {
  video:    { Icon: Video,         cls: "bg-rose-50 text-rose-600" },
  slide:    { Icon: Presentation,  cls: "bg-indigo-50 text-indigo-600" },
  doc:      { Icon: FileText,      cls: "bg-sky-50 text-sky-600" },
  image:    { Icon: ImageIcon,     cls: "bg-emerald-50 text-emerald-600" },
  exercise: { Icon: ClipboardList, cls: "bg-amber-50 text-amber-600" },
  syllabus: { Icon: BookOpen,      cls: "bg-violet-50 text-violet-600" },
};

function kindLabel(k: MaterialKind): string {
  return { video: "Video", slide: "Slide", doc: "Tài liệu", image: "Hình ảnh", exercise: "Bài tập", syllabus: "Tổng quan" }[k];
}

function MaterialViewer({ material }: { material: Material }) {
  if (material.kind === "video") {
    return (
      <div className="rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video">
        <iframe
          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
          title={material.title}
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }
  if (material.kind === "exercise") {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
        <h3 className="font-bold text-slate-800 mb-3">Bài tập</h3>
        <ol className="space-y-3 list-decimal ml-5 text-sm text-slate-700">
          <li>Tính: 245 + 137 = ?</li>
          <li>Số nào sau đây lớn hơn: 4.235 hay 4.253?</li>
          <li>Chọn phân số bằng 1/2: 2/4, 3/5, 5/8.</li>
        </ol>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-10 text-center">
      <div className="mx-auto h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
        {(() => { const { Icon } = ICON_MAP[material.kind]; return <Icon className="h-8 w-8" />; })()}
      </div>
      <h3 className="font-bold text-slate-800">{material.title}</h3>
      <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
        Nội dung {kindLabel(material.kind).toLowerCase()} sẽ được hiển thị tại đây.
      </p>
      <button className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700">
        Mở nội dung
      </button>
    </div>
  );
}
