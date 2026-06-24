import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft, Copy, Users, ChevronDown, ChevronRight, Plus, MoveVertical,
  Video, FileText, ClipboardList, BookOpen, Image as ImageIcon, Presentation,
  GripVertical, MoreVertical, Check, Pencil, Trash2, X,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import thumbLop4A from "@/assets/thumb-lop-4a.jpg";
import thumbLop3D from "@/assets/thumb-lop-3d.jpg";
import thumbLop3A from "@/assets/thumb-lop-3a.jpg";
import thumbLop3B from "@/assets/thumb-lop-3b.jpg";
import thumbLop3C from "@/assets/thumb-lop-3c.jpg";
import thumbLop4BReview from "@/assets/thumb-lop-4b-review.jpg";
import thumbLop4C from "@/assets/thumb-lop-4c.jpg";

import { KNOWLEDGE_TREE, getUnitTitle, getChapterOfUnit } from "@/lib/knowledge-tree";
import {
  useMaterials, addMaterial, type MaterialKind, type Material,
} from "@/lib/teaching-store";

export const Route = createFileRoute("/lop-hoc-so/$classId")({
  head: () => ({
    meta: [
      { title: "Chi tiết lớp học – LMS Giáo viên" },
      { name: "description", content: "Quản lý nội dung lớp học số." },
    ],
  }),
  component: ClassDetailPage,
});

/* ============================ Mock class info ============================ */

type ClassInfo = {
  id: string; name: string; code: string; students: number;
  teacher: string; thumb: string; description: string;
  /** real class id used for sync with lịch báo giảng */
  lop: string;
  subject: string;
};

const CLASS_DB: Record<string, ClassInfo> = {
  c1: { id: "c1", name: "Lớp 4A - Toán năm học 2025 - 2026", code: "LH-4A-T2526", students: 40, teacher: "Cô Nguyễn Thị Hoa", thumb: thumbLop4A, description: "Lớp Toán nâng cao dành cho học sinh lớp 4A.", lop: "4A", subject: "Toán" },
  c2: { id: "c2", name: "Lớp 4A - Tiếng Việt năm học 2025 - 2026", code: "LH-4A-TV2526", students: 40, teacher: "Cô Nguyễn Thị Hoa", thumb: thumbLop4A, description: "Lớp Tiếng Việt 4A theo chương trình GDPT 2018.", lop: "4A", subject: "Tiếng Việt" },
  c3: { id: "c3", name: "Lớp 3D năm học 2025 - 2026", code: "LH-3D-2526", students: 40, teacher: "Cô Trần Thanh Mai", thumb: thumbLop3D, description: "Lớp 3D – Toán cơ bản.", lop: "3D", subject: "Toán" },
  c4: { id: "c4", name: "Lớp 3A năm học 2025 - 2026", code: "LH-3A-2526", students: 38, teacher: "Cô Lê Thu Hà", thumb: thumbLop3A, description: "Lớp 3A – Toán.", lop: "3A", subject: "Toán" },
  c5: { id: "c5", name: "Lớp 3B năm học 2025 - 2026", code: "LH-3B-2526", students: 42, teacher: "Thầy Phạm Văn Nam", thumb: thumbLop3B, description: "Lớp 3B – Toán cơ bản (bản nháp).", lop: "3B", subject: "Toán" },
  c6: { id: "c6", name: "Lớp 3C năm học 2025 - 2026", code: "LH-3C-2526", students: 39, teacher: "Cô Đỗ Mỹ Linh", thumb: thumbLop3C, description: "Lớp 3C – Toán.", lop: "3C", subject: "Toán" },
  c7: { id: "c7", name: "Các bạn học sinh cần ôn tập đặc biệt", code: "LH-REVIEW-2526", students: 41, teacher: "Cô Nguyễn Thị Hoa", thumb: thumbLop4BReview, description: "Lớp ghép dành cho học sinh khối 4 cần ôn tập kiến thức nền.", lop: "4B", subject: "Toán" },
  c8: { id: "c8", name: "Lớp 4C năm học 2025 - 2026", code: "LH-4C-2526", students: 40, teacher: "Thầy Hoàng Anh Tuấn", thumb: thumbLop4C, description: "Lớp 4C – Toán.", lop: "4C", subject: "Toán" },
};

/* ============================ Page ============================ */

function ClassDetailPage() {
  const { classId } = Route.useParams();
  const navigate = useNavigate();
  const info: ClassInfo = CLASS_DB[classId] ?? {
    id: classId, name: "Lớp học", code: `LH-${classId.toUpperCase()}`,
    students: 0, teacher: "—", thumb: thumbLop4A, description: "",
    lop: "4A", subject: "Toán",
  };

  const allMaterials = useMaterials();
  const classMaterials = useMemo(
    () => allMaterials.filter((m) => m.classRealId === info.lop && m.subject === info.subject),
    [allMaterials, info.lop, info.subject],
  );

  // Group by unitId → sections
  type Group = { unitId: string; title: string; items: Material[] };
  const groups: Group[] = useMemo(() => {
    const map = new Map<string, Group>();
    classMaterials.forEach((m) => {
      const key = m.unitId || "_misc";
      if (!map.has(key)) {
        map.set(key, {
          unitId: key,
          title: key === "_misc" ? "Học liệu khác" : getUnitTitle(key),
          items: [],
        });
      }
      map.get(key)!.items.push(m);
    });
    return Array.from(map.values());
  }, [classMaterials]);

  const [order, setOrder] = useState<string[] | null>(null);
  const orderedGroups = useMemo(() => {
    if (!order) return groups;
    const known = new Set(groups.map((g) => g.unitId));
    const sorted = order.filter((id) => known.has(id))
      .map((id) => groups.find((g) => g.unitId === id)!);
    const rest = groups.filter((g) => !order.includes(g.unitId));
    return [...sorted, ...rest];
  }, [groups, order]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const isOpen = (id: string) => expanded[id] ?? true;

  const [reorder, setReorder] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  const totals = useMemo(() => {
    const lessons = orderedGroups.length;
    const items = orderedGroups.reduce((s, g) => s + g.items.length, 0);
    return { lessons, items };
  }, [orderedGroups]);

  const copyCode = async () => {
    try { await navigator.clipboard.writeText(info.code); toast.success("Đã sao chép mã lớp"); }
    catch { toast.error("Không thể sao chép"); }
  };

  /* drag & drop on top-level groups */
  const onDragStart = (id: string) => setDragId(id);
  const onDragOver = (e: React.DragEvent) => { if (reorder && dragId) e.preventDefault(); };
  const onDrop = (overId: string) => {
    if (!dragId || dragId === overId) return;
    const current = orderedGroups.map((g) => g.unitId);
    const from = current.indexOf(dragId);
    const to = current.indexOf(overId);
    if (from < 0 || to < 0) return;
    const copy = [...current];
    const [m] = copy.splice(from, 1);
    copy.splice(to, 0, m);
    setOrder(copy);
    setDragId(null);
  };

  /* add modal */
  const [addOpen, setAddOpen] = useState<null | { kind: "lesson" | "material" | "exercise" }>(null);
  const handleAdd = (m: { unitId: string; kind: MaterialKind; title: string; meta?: string }) => {
    addMaterial({
      classRealId: info.lop, subject: info.subject, origin: "class",
      ...m,
    });
    setAddOpen(null);
    toast.success("Đã thêm – đã đồng bộ sang Lịch báo giảng");
  };

  return (
    <AppShell>
      {/* Top banner */}
      <section
        className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm"
        style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #9333ea 100%)" }}
      >
        <button
          onClick={() => navigate({ to: "/lop-hoc-so" })}
          className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-sm font-medium backdrop-blur"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </button>

        <div className="grid md:grid-cols-[1fr_280px] gap-6 p-6 md:p-8">
          <div className="text-white pt-10 md:pt-0">
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">{info.name}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-lg px-3 py-1.5">
                <span className="opacity-90">Mã lớp:</span>
                <span className="font-semibold tracking-wide">{info.code}</span>
                <button onClick={copyCode} className="p-1 rounded hover:bg-white/20" aria-label="Sao chép mã lớp" title="Sao chép mã lớp">
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                onClick={() => toast.message("Mở danh sách học sinh (demo)")}
                className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur rounded-lg px-3 py-1.5 font-medium"
                title="Xem danh sách học sinh"
              >
                <Users className="h-4 w-4" />
                {info.students} học sinh
              </button>

              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-lg px-3 py-1.5">
                <span className="opacity-90">Giáo viên:</span>
                <span className="font-semibold">{info.teacher}</span>
              </div>

              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-lg px-3 py-1.5">
                <span className="opacity-90">Lớp · Môn:</span>
                <span className="font-semibold">{info.lop} · {info.subject}</span>
              </div>
            </div>

            {info.description && (
              <p className="mt-5 text-white/90 max-w-3xl leading-relaxed text-sm md:text-[15px]">
                {info.description}
              </p>
            )}
          </div>

          <div className="hidden md:block">
            <div className="aspect-[4/3] rounded-xl overflow-hidden border-2 border-white/30 shadow-lg">
              <img src={info.thumb} alt={info.name} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* White content section */}
      <section className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Nội dung lớp học</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {totals.lessons} chương/chủ đề • {totals.items} học liệu — đồng bộ với Lịch báo giảng
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setReorder((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg border transition ${
                reorder
                  ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <MoveVertical className="h-4 w-4" />
              {reorder ? "Xong sắp xếp" : "Sắp xếp"}
            </button>
            <button
              onClick={() => toast.message("Thêm chủ đề / Mục lục (demo)")}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" /> Thêm chủ đề/Mục lục
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                  <Plus className="h-4 w-4" /> Thêm nội dung
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="cursor-pointer" onClick={() => setAddOpen({ kind: "lesson" })}>
                  <Presentation className="h-4 w-4 mr-2 text-indigo-500" /> Thêm bài giảng
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => setAddOpen({ kind: "material" })}>
                  <BookOpen className="h-4 w-4 mr-2 text-emerald-500" /> Thêm học liệu
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => setAddOpen({ kind: "exercise" })}>
                  <ClipboardList className="h-4 w-4 mr-2 text-amber-500" /> Thêm bài tập
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {orderedGroups.map((g) => (
            <GroupRow
              key={g.unitId}
              group={g}
              reorder={reorder}
              expanded={isOpen(g.unitId)}
              onToggle={() => setExpanded((s) => ({ ...s, [g.unitId]: !isOpen(g.unitId) }))}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              dragging={dragId === g.unitId}
            />
          ))}
          {orderedGroups.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              Chưa có học liệu nào. Bấm <b className="text-indigo-700">Thêm nội dung</b> để bắt đầu.
            </div>
          )}
        </div>

        <div className="mt-4">
          <Link to="/lop-hoc-so" className="text-sm font-medium text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Quay lại danh sách lớp
          </Link>
        </div>
      </section>

      {addOpen && (
        <AddMaterialModal
          mode={addOpen.kind}
          onClose={() => setAddOpen(null)}
          onSubmit={handleAdd}
        />
      )}
    </AppShell>
  );
}

/* ============================ Group row ============================ */

function GroupRow({
  group, reorder, expanded, onToggle, onDragStart, onDragOver, onDrop, dragging,
}: {
  group: { unitId: string; title: string; items: Material[] };
  reorder: boolean;
  expanded: boolean;
  onToggle: () => void;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (overId: string) => void;
  dragging: boolean;
}) {
  const draggableProps = reorder
    ? {
        draggable: true,
        onDragStart: () => onDragStart(group.unitId),
        onDragOver,
        onDrop: () => onDrop(group.unitId),
      }
    : {};

  return (
    <div
      {...draggableProps}
      className={`rounded-xl border border-slate-200 bg-white overflow-hidden ${
        dragging ? "opacity-50" : ""
      } ${reorder ? "cursor-move" : ""}`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition"
      >
        {reorder && <GripVertical className="h-4 w-4 text-slate-400" />}
        {expanded ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
        <Presentation className="h-4 w-4 text-indigo-600" />
        <span className="font-semibold text-slate-800 text-left flex-1">{group.title}</span>
        <span className="text-xs text-slate-500 font-medium">
          {group.items.length} học liệu
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <span role="button" onClick={(e) => e.stopPropagation()} className="p-1 rounded hover:bg-slate-200 text-slate-500">
              <MoreVertical className="h-4 w-4" />
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="cursor-pointer"><Pencil className="h-4 w-4 mr-2" /> Đổi tên</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer"><Plus className="h-4 w-4 mr-2" /> Thêm học liệu vào bài</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-rose-600"><Trash2 className="h-4 w-4 mr-2" /> Xóa bài giảng</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </button>

      {expanded && (
        <ul className="divide-y divide-slate-100">
          {group.items.map((c) => (
            <li key={c.id} className="pl-12 pr-4 py-2.5 flex items-center gap-3 hover:bg-slate-50">
              <ItemIcon kind={c.kind} />
              <span className="text-sm text-slate-700 flex-1 truncate">{c.title}</span>
              {c.origin === "schedule" && (
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                  Từ lịch
                </span>
              )}
              <span className="text-xs text-slate-500">{c.meta}</span>
            </li>
          ))}
          {group.items.length === 0 && (
            <li className="pl-12 pr-4 py-3 text-sm text-slate-400 italic">Chưa có học liệu trong bài giảng này.</li>
          )}
        </ul>
      )}
    </div>
  );
}

function ItemIcon({ kind }: { kind: MaterialKind }) {
  const map = {
    video:    { Icon: Video,         cls: "bg-rose-50 text-rose-600" },
    slide:    { Icon: Presentation,  cls: "bg-indigo-50 text-indigo-600" },
    doc:      { Icon: FileText,      cls: "bg-sky-50 text-sky-600" },
    image:    { Icon: ImageIcon,     cls: "bg-emerald-50 text-emerald-600" },
    exercise: { Icon: ClipboardList, cls: "bg-amber-50 text-amber-600" },
    syllabus: { Icon: BookOpen,      cls: "bg-violet-50 text-violet-600" },
  } as const;
  const { Icon, cls } = map[kind];
  return (
    <span className={`h-7 w-7 rounded-lg inline-flex items-center justify-center ${cls}`}>
      <Icon className="h-4 w-4" />
    </span>
  );
}

/* ============================ Add modal ============================ */

const KIND_OPTIONS: { kind: MaterialKind; label: string; metaHint: string }[] = [
  { kind: "slide",    label: "Slide bài giảng", metaHint: "ví dụ: 24 slide" },
  { kind: "video",    label: "Video bài giảng", metaHint: "ví dụ: 12:35" },
  { kind: "doc",      label: "Tài liệu",        metaHint: "ví dụ: 8 trang" },
  { kind: "image",    label: "Hình ảnh",        metaHint: "ví dụ: 1 trang" },
  { kind: "exercise", label: "Bài tập",         metaHint: "ví dụ: 10 câu" },
  { kind: "syllabus", label: "Tổng quan/Mục lục", metaHint: "ví dụ: 1 trang" },
];

function AddMaterialModal({
  mode, onClose, onSubmit,
}: {
  mode: "lesson" | "material" | "exercise";
  onClose: () => void;
  onSubmit: (m: { unitId: string; kind: MaterialKind; title: string; meta?: string }) => void;
}) {
  const defaultKind: MaterialKind =
    mode === "lesson" ? "slide" : mode === "exercise" ? "exercise" : "doc";

  const [unitId, setUnitId] = useState<string>("");
  const [kind, setKind] = useState<MaterialKind>(defaultKind);
  const [title, setTitle] = useState("");
  const [meta, setMeta] = useState("");

  const titleLabel =
    mode === "lesson" ? "Thêm bài giảng" :
    mode === "exercise" ? "Thêm bài tập" : "Thêm học liệu";

  const canSubmit = unitId && title.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-slate-800">{titleLabel}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Chương / Chủ đề <span className="text-rose-500">*</span>
            </label>
            <select
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">— Chọn nội dung theo chương trình —</option>
              {KNOWLEDGE_TREE.map((ch) => (
                <optgroup key={ch.id} label={ch.title}>
                  {ch.units.map((u) => (
                    <option key={u.id} value={u.id}>{u.title}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Đơn vị kiến thức này dùng chung với Lịch báo giảng — bài giảng sẽ tự động đồng bộ.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Loại nội dung</label>
            <div className="grid grid-cols-3 gap-2">
              {KIND_OPTIONS.map((k) => (
                <button
                  key={k.kind}
                  type="button"
                  onClick={() => setKind(k.kind)}
                  className={`px-2 py-2 rounded-lg border text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                    kind === k.kind
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  <span className="truncate">{k.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Tiêu đề <span className="text-rose-500">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Slide bài giảng – Phép cộng phân số"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Thời lượng / Số trang
            </label>
            <input
              value={meta}
              onChange={(e) => setMeta(e.target.value)}
              placeholder={KIND_OPTIONS.find((k) => k.kind === kind)?.metaHint}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
          >
            Hủy
          </button>
          <button
            onClick={() => canSubmit && onSubmit({ unitId, kind, title: title.trim(), meta: meta.trim() || undefined })}
            disabled={!canSubmit}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
          >
            <Check className="h-4 w-4" /> Thêm & đồng bộ
          </button>
        </div>
      </div>
    </div>
  );
}
