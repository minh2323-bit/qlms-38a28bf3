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

import { getTreeForClass, getUnitTitle, getChapterOfUnit } from "@/lib/knowledge-tree";
import {
  useMaterials, addMaterial, type MaterialKind, type Material,
} from "@/lib/teaching-store";
import {
  useLiveClasses, addLiveClass, formatTimeRange, formatDate, isLiveEnded,
  type LiveClass,
} from "@/lib/live-class-store";
import { LiveClassStatsModal } from "@/components/LiveClassStatsModal";
import { AnnouncementSection } from "@/components/AnnouncementSection";
import { BarChart3 } from "lucide-react";


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

type ClassStatus = "draft" | "deployed";
type ClassInfo = {
  id: string; name: string; code: string; students: number;
  teacher: string; thumb: string; description: string;
  /** real class id used for sync with lịch báo giảng */
  lop: string;
  subject: string;
  status: ClassStatus;
  subjectsTaught: string[];
};

const CLASS_DB: Record<string, ClassInfo> = {
  c1: { id: "c1", name: "Lớp 4A Năm học 2025 - 2026", code: "LH-4A-T2526", students: 40, teacher: "Cô Nguyễn Thị Hoa", thumb: thumbLop4A, description: "Lớp học dành riêng cho lớp 4A. Thầy/cô có thể tạo các học liệu trong này để dễ dàng quản lý lộ trình học của lớp.", lop: "4A", subject: "Toán", status: "deployed", subjectsTaught: ["Toán", "Tiếng Việt", "Khoa học", "Đạo đức"] },
  c2: { id: "c2", name: "Lớp 4A Năm học 2025 - 2026", code: "LH-4A-TV2526", students: 40, teacher: "Cô Nguyễn Thị Hoa", thumb: thumbLop4A, description: "Lớp học dành riêng cho lớp 4A. Thầy/cô có thể tạo các học liệu trong này để dễ dàng quản lý lộ trình học của lớp.", lop: "4A", subject: "Tiếng Việt", status: "deployed", subjectsTaught: ["Toán", "Tiếng Việt", "Khoa học", "Đạo đức"] },
  c3: { id: "c3", name: "Lớp 3D Năm học 2025 - 2026", code: "LH-3D-2526", students: 40, teacher: "Cô Trần Thanh Mai", thumb: thumbLop3D, description: "Lớp học dành riêng cho lớp 3D. Thầy/cô có thể tạo các học liệu trong này để dễ dàng quản lý lộ trình học của lớp.", lop: "3D", subject: "Toán", status: "deployed", subjectsTaught: ["Toán", "Tiếng Việt", "Đạo đức"] },
  c4: { id: "c4", name: "Lớp 3A Năm học 2025 - 2026", code: "LH-3A-2526", students: 38, teacher: "Cô Lê Thu Hà", thumb: thumbLop3A, description: "Lớp học dành riêng cho lớp 3A. Thầy/cô có thể tạo các học liệu trong này để dễ dàng quản lý lộ trình học của lớp.", lop: "3A", subject: "Toán", status: "deployed", subjectsTaught: ["Toán", "Tiếng Việt"] },
  c5: { id: "c5", name: "Lớp 3B Năm học 2025 - 2026", code: "LH-3B-2526", students: 42, teacher: "Thầy Phạm Văn Nam", thumb: thumbLop3B, description: "Lớp học dành riêng cho lớp 3B. Thầy/cô có thể tạo các học liệu trong này để dễ dàng quản lý lộ trình học của lớp.", lop: "3B", subject: "Toán", status: "draft", subjectsTaught: ["Toán", "Khoa học"] },
  c6: { id: "c6", name: "Lớp 3C Năm học 2025 - 2026", code: "LH-3C-2526", students: 39, teacher: "Cô Đỗ Mỹ Linh", thumb: thumbLop3C, description: "Lớp học dành riêng cho lớp 3C. Thầy/cô có thể tạo các học liệu trong này để dễ dàng quản lý lộ trình học của lớp.", lop: "3C", subject: "Toán", status: "deployed", subjectsTaught: ["Toán"] },
  c7: { id: "c7", name: "Lớp 4B, 4C, 4D Năm học 2025 - 2026", code: "LH-REVIEW-2526", students: 41, teacher: "Cô Nguyễn Thị Hoa", thumb: thumbLop4BReview, description: "Lớp học dành riêng cho lớp 4B, 4C, 4D. Thầy/cô có thể tạo các học liệu trong này để dễ dàng quản lý lộ trình học của lớp.", lop: "4B", subject: "Toán", status: "draft", subjectsTaught: ["Toán"] },
  c8: { id: "c8", name: "Lớp 4C Năm học 2025 - 2026", code: "LH-4C-2526", students: 40, teacher: "Thầy Hoàng Anh Tuấn", thumb: thumbLop4C, description: "Lớp học dành riêng cho lớp 4C. Thầy/cô có thể tạo các học liệu trong này để dễ dàng quản lý lộ trình học của lớp.", lop: "4C", subject: "Toán", status: "deployed", subjectsTaught: ["Toán", "Khoa học"] },
};


/* ============================ Page ============================ */

function ClassDetailPage() {
  const { classId } = Route.useParams();
  const navigate = useNavigate();
  const fallback: ClassInfo = {
    id: classId, name: "Lớp học", code: `LH-${classId.toUpperCase()}`,
    students: 0, teacher: "—", thumb: thumbLop4A, description: "",
    lop: "4A", subject: "Toán", status: "draft", subjectsTaught: ["Toán"],
  };
  const info: ClassInfo = CLASS_DB[classId] ?? fallback;

  const [selectedSubject, setSelectedSubject] = useState<string>(info.subject);
  const [status, setStatus] = useState<ClassStatus>(info.status);
  const [locked, setLocked] = useState<boolean>(false);

  const allMaterials = useMaterials();
  const classMaterials = useMemo(
    () => allMaterials.filter((m) => m.classRealId === info.lop && m.subject === selectedSubject),
    [allMaterials, info.lop, selectedSubject],
  );

  const allLive = useLiveClasses();
  const classLive = useMemo(
    () => allLive.filter((l) => l.classRealId === info.lop && l.subject === selectedSubject)
      .sort((a, b) => a.startAt.localeCompare(b.startAt)),
    [allLive, info.lop, selectedSubject],
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
  const [liveOpen, setLiveOpen] = useState(false);
  const handleAdd = (m: { unitId: string; kind: MaterialKind; title: string; meta?: string }) => {
    addMaterial({
      classRealId: info.lop, subject: selectedSubject, origin: "class",
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
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setLiveOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            >
              <Video className="h-4 w-4" /> Tạo lớp học trực tuyến
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
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link
                    to="/hoc-lieu/bai-giang/tao-moi"
                    search={{
                      khoi: `Lớp ${info.lop.replace(/[^0-9]/g, "")}`,
                      mon: selectedSubject,
                      from: `lớp ${info.lop} – ${selectedSubject}`,

                    }}
                  >
                    <Presentation className="h-4 w-4 mr-2 text-indigo-500" /> Thêm bài giảng
                  </Link>
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
          {classLive.length > 0 && (
            <LiveClassesSection items={classLive} />
          )}

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
          {orderedGroups.length === 0 && classLive.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              Chưa có học liệu nào. Bấm <b className="text-indigo-700">Thêm nội dung</b> để bắt đầu.
            </div>
          )}
        </div>

        {orderedGroups.length > 1 && (
          <div className="mt-4 flex justify-end">
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
          </div>
        )}

        <div className="mt-4">
          <Link to="/lop-hoc-so" className="text-sm font-medium text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Quay lại danh sách lớp
          </Link>
        </div>
      </section>

      <AnnouncementSection
        classRealId={info.lop}
        subject={info.subject}
        teacherName={info.teacher}
      />


      {addOpen && (
        <AddMaterialModal
          mode={addOpen.kind}
          classInfo={info}
          onClose={() => setAddOpen(null)}
          onSubmit={handleAdd}
        />
      )}

      {liveOpen && (
        <LiveClassModal
          classInfo={info}
          onClose={() => setLiveOpen(false)}
          onCreated={(data) => {
            addLiveClass({
              classRealId: info.lop,
              subject: info.subject,
              name: data.name,
              unitId: data.unitId,
              startAt: data.startAt,
              endAt: data.endAt,
              link: data.link,
              description: data.description,
              studentCount: data.studentCount,
            });
            setLiveOpen(false);
            toast.success(`Đã tạo lớp học trực tuyến "${data.name}" – đã đồng bộ Lịch báo giảng`);
          }}
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

const KIND_OPTIONS: { kind: MaterialKind; label: string; metaHint: string; Icon: typeof Video }[] = [
  { kind: "slide",    label: "Slide bài giảng",   metaHint: "ví dụ: 24 slide", Icon: Presentation },
  { kind: "video",    label: "Video bài giảng",   metaHint: "ví dụ: 12:35",    Icon: Video },
  { kind: "doc",      label: "Tài liệu",          metaHint: "ví dụ: 8 trang",  Icon: FileText },
  { kind: "image",    label: "Hình ảnh",          metaHint: "ví dụ: 1 trang",  Icon: ImageIcon },
  { kind: "exercise", label: "Bài tập",           metaHint: "ví dụ: 10 câu",   Icon: ClipboardList },
  { kind: "syllabus", label: "Tổng quan/Mục lục", metaHint: "ví dụ: 1 trang",  Icon: BookOpen },
];

const COMPLETION_OPTIONS = [
  { value: "content",  label: "Sau khi đạt mức nội dung" },
  { value: "question", label: "Sau khi trả lời câu hỏi" },
  { value: "time",     label: "Sau khoảng thời gian" },
  { value: "manual",   label: "Học sinh tự click Hoàn thành" },
];

function AddMaterialModal({
  mode, classInfo, onClose, onSubmit,
}: {
  mode: "lesson" | "material" | "exercise";
  classInfo: ClassInfo;
  onClose: () => void;
  onSubmit: (m: { unitId: string; kind: MaterialKind; title: string; meta?: string }) => void;
}) {
  const tree = useMemo(() => getTreeForClass(classInfo.lop, classInfo.subject), [classInfo.lop, classInfo.subject]);
  const defaultKind: MaterialKind =
    mode === "lesson" ? "slide" : mode === "exercise" ? "exercise" : "video";

  // 2-step: chỉ áp dụng cho mode "material" (Thêm học liệu).
  const useSteps = mode === "material";
  const [step, setStep] = useState<1 | 2>(useSteps ? 1 : 2);
  const [kind, setKind] = useState<MaterialKind>(defaultKind);

  const [unitId, setUnitId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [meta, setMeta] = useState("");

  // Trường mở rộng cho Video / Tài liệu
  const [subject] = useState(classInfo.subject);
  const [uploadMode, setUploadMode] = useState<"link" | "file">("link");
  const [link, setLink] = useState("");
  const [fileName, setFileName] = useState("");
  const [description, setDescription] = useState("");
  const [completion, setCompletion] = useState("content");

  const isExtended = kind === "video" || kind === "doc";

  const titleLabel =
    mode === "lesson" ? "Thêm bài giảng" :
    mode === "exercise" ? "Thêm bài tập" : "Thêm học liệu";

  const canSubmit =
    !!unitId &&
    title.trim().length > 0 &&
    (!isExtended || (uploadMode === "link" ? link.trim().length > 0 : fileName.trim().length > 0));

  const handleSubmit = () => {
    if (!canSubmit) return;
    const finalMeta = isExtended
      ? (uploadMode === "link" ? "Liên kết" : fileName) + (meta.trim() ? ` · ${meta.trim()}` : "")
      : (meta.trim() || undefined);
    onSubmit({ unitId, kind, title: title.trim(), meta: finalMeta });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{titleLabel}</h2>
            {useSteps && (
              <p className="text-xs text-slate-500 mt-0.5">
                Bước {step}/2 · {step === 1 ? "Chọn loại học liệu" : "Thông tin chi tiết"}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* STEP 1 — chọn loại học liệu */}
        {useSteps && step === 1 && (
          <div className="px-6 py-5 space-y-3 overflow-y-auto">
            <p className="text-sm text-slate-600">Bạn muốn thêm loại học liệu nào?</p>
            <div className="grid grid-cols-2 gap-2">
              {KIND_OPTIONS.map((k) => {
                const Icon = k.Icon;
                const active = kind === k.kind;
                return (
                  <button
                    key={k.kind}
                    type="button"
                    onClick={() => setKind(k.kind)}
                    className={`px-3 py-3 rounded-xl border text-sm font-medium transition flex items-center gap-2 text-left ${
                      active
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? "text-white" : "text-indigo-500"}`} />
                    {k.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2 — form chi tiết */}
        {(!useSteps || step === 2) && (
          <div className="px-6 py-5 space-y-4 overflow-y-auto">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Tiêu đề <span className="text-rose-500">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Video bài giảng – Phép cộng phân số"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Môn</label>
                <input
                  value={subject}
                  readOnly
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Đơn vị kiến thức <span className="text-rose-500">*</span>
                </label>
                <select
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">— Chọn đơn vị kiến thức ({classInfo.subject} – Lớp {classInfo.lop.replace(/[^0-9]/g, "")}) —</option>
                  {tree.map((ch) => (
                    <optgroup key={ch.id} label={ch.title}>
                      {ch.units.map((u) => (
                        <option key={u.id} value={u.id}>{u.title}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-slate-500 -mt-2">
              Đơn vị kiến thức này dùng chung với Lịch báo giảng — học liệu sẽ tự đồng bộ vào đúng tiết.
            </p>

            {/* placeholder để giữ getChapterOfUnit khỏi unused */}
            {false && <span>{getUnitTitle(unitId)}{getChapterOfUnit(unitId)?.id}</span>}

            {!useSteps && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Loại nội dung</label>
                <div className="grid grid-cols-3 gap-2">
                  {KIND_OPTIONS.map((k) => (
                    <button
                      key={k.kind}
                      type="button"
                      onClick={() => setKind(k.kind)}
                      className={`px-2 py-2 rounded-lg border text-xs font-medium transition ${
                        kind === k.kind
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300"
                      }`}
                    >
                      {k.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isExtended && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Hình thức tải nội dung
                  </label>
                  <select
                    value={uploadMode}
                    onChange={(e) => setUploadMode(e.target.value as "link" | "file")}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="link">Copy liên kết</option>
                    <option value="file">Tải file lên</option>
                  </select>
                </div>

                {uploadMode === "link" ? (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Liên kết nội dung <span className="text-rose-500">*</span>
                    </label>
                    <input
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="Dán URL YouTube / Google Drive / PDF…"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Tải file <span className="text-rose-500">*</span>
                    </label>
                    <label className="flex items-center justify-center gap-2 px-3 py-6 text-sm rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-slate-600 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition">
                      <Plus className="h-4 w-4" />
                      {fileName || "Chọn file từ máy"}
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
                      />
                    </label>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mô tả</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Mô tả ngắn về học liệu, mục tiêu, ghi chú cho học sinh…"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Phương pháp đánh giá hoàn thành
                  </label>
                  <select
                    value={completion}
                    onChange={(e) => setCompletion(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    {COMPLETION_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {!isExtended && (
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
            )}
          </div>
        )}

        <div className="px-6 py-4 border-t bg-slate-50 flex items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
          >
            Hủy
          </button>
          <div className="flex items-center gap-2">
            {useSteps && step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" /> Quay lại
              </button>
            )}
            {useSteps && step === 1 ? (
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 inline-flex items-center gap-1.5"
              >
                Tiếp theo <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" /> Thêm & đồng bộ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================ Live class modal ============================ */

type Student = { id: string; code: string; name: string; dob: string };

const STUDENT_DB: Record<string, Student[]> = {
  "4A": [
    { id: "s1",  code: "0123456783", name: "Nguyễn An",        dob: "15/03/2015" },
    { id: "s2",  code: "0365427720", name: "Mai Huyền",        dob: "02/07/2015" },
    { id: "s3",  code: "0123456787", name: "Trần Bảo",         dob: "21/11/2015" },
    { id: "s4",  code: "0348844088", name: "Thanh Vân",        dob: "08/05/2015" },
    { id: "s5",  code: "0335773123", name: "Vũ Huy Hoàng",     dob: "30/09/2015" },
    { id: "s6",  code: "0912125548", name: "Phạm Tất Thắng",   dob: "12/12/2015" },
    { id: "s7",  code: "0934778812", name: "Lê Minh Châu",     dob: "04/02/2015" },
    { id: "s8",  code: "0978221190", name: "Hoàng Khánh Linh", dob: "19/06/2015" },
  ],
  "4B": [
    { id: "s9",  code: "0901123456", name: "Đỗ Quang Huy",     dob: "11/01/2015" },
    { id: "s10", code: "0901123457", name: "Nguyễn Bích Ngọc", dob: "23/04/2015" },
    { id: "s11", code: "0901123458", name: "Bùi Tiến Dũng",    dob: "07/08/2015" },
  ],
  "4C": [
    { id: "s12", code: "0902223456", name: "Hà Thu Phương",    dob: "14/03/2015" },
    { id: "s13", code: "0902223457", name: "Lý Văn Tài",       dob: "26/10/2015" },
  ],
  "3A": [
    { id: "s14", code: "0903334456", name: "Trịnh Mỹ Duyên",   dob: "05/05/2016" },
    { id: "s15", code: "0903334457", name: "Phan Đức Anh",     dob: "18/09/2016" },
  ],
  "3B": [
    { id: "s16", code: "0904445567", name: "Ngô Hồng Nhung",   dob: "22/02/2016" },
  ],
  "3C": [
    { id: "s17", code: "0905556678", name: "Tô Quốc Việt",     dob: "30/07/2016" },
  ],
  "3D": [
    { id: "s18", code: "0906667789", name: "Đặng Phương Mai",  dob: "11/11/2016" },
  ],
};

type LiveCreatePayload = {
  name: string; unitId: string; startAt: string; endAt: string;
  link: string; description?: string; studentCount: number;
};

function LiveClassModal({
  classInfo, onClose, onCreated,
}: {
  classInfo: ClassInfo;
  onClose: () => void;
  onCreated: (data: LiveCreatePayload) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const tree = useMemo(() => getTreeForClass(classInfo.lop, classInfo.subject), [classInfo.lop, classInfo.subject]);

  // Step 1 fields
  const [name, setName] = useState("");
  const [unitId, setUnitId] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");

  // Step 2 fields
  const grade = classInfo.lop.replace(/[^0-9]/g, ""); // "4A" -> "4"
  const [filterGrade, setFilterGrade] = useState(grade);
  const gradeClasses = useMemo(
    () => Object.keys(STUDENT_DB).filter((c) => c.startsWith(filterGrade)),
    [filterGrade],
  );
  const [filterClass, setFilterClass] = useState(classInfo.lop);
  const students = STUDENT_DB[filterClass] ?? [];
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allChecked = students.length > 0 && students.every((s) => selected.has(s.id));
  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allChecked) students.forEach((s) => next.delete(s.id));
      else students.forEach((s) => next.add(s.id));
      return next;
    });
  };
  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const linkValid = /^(https?:\/\/)?(meet\.google\.com|.*zoom\.us|teams\.microsoft\.com|.*teams\.live\.com)\//i.test(link.trim());

  const canNext =
    name.trim().length > 0 &&
    !!unitId &&
    !!startAt && !!endAt &&
    linkValid;

  const canCreate = selected.size > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Điền thông tin lớp học</h2>
            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                {classInfo.lop}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {classInfo.subject}
              </span>
              <span className="text-xs text-slate-500">· Bước {step}/2</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {step === 1 && (
              <button
                onClick={() => canNext && setStep(2)}
                disabled={!canNext}
                className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ghi
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {step === 1 && (
          <div className="px-6 py-5 space-y-4 overflow-y-auto">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Tên lớp <span className="text-rose-500">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Ôn tập Phép cộng phân số – Lớp 4A"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Đơn vị kiến thức học <span className="text-rose-500">*</span>
              </label>
              <select
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">— Chọn đơn vị kiến thức ({classInfo.subject} – Lớp {classInfo.lop.replace(/[^0-9]/g, "")}) —</option>
                {tree.map((ch) => (
                  <optgroup key={ch.id} label={ch.title}>
                    {ch.units.map((u) => (
                      <option key={u.id} value={u.id}>{u.title}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Bắt đầu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Kết thúc <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Đường dẫn liên kết tới lớp học <span className="text-rose-500">*</span>
              </label>
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://meet.google.com/... hoặc Zoom / Teams"
                className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                  link && !linkValid
                    ? "border-rose-300 focus:ring-rose-200"
                    : "border-slate-200 focus:ring-indigo-200"
                }`}
              />
              <p className={`mt-1 text-xs ${link && !linkValid ? "text-rose-500" : "text-slate-500"}`}>
                Chỉ chấp nhận liên kết Google Meet, Zoom hoặc Microsoft Teams.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mô tả lớp học</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Mục tiêu buổi học, yêu cầu chuẩn bị…"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="px-6 py-5 space-y-4 overflow-y-auto">
            <div className="flex items-center gap-3 flex-wrap">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Khối</label>
                <select
                  value={filterGrade}
                  onChange={(e) => {
                    setFilterGrade(e.target.value);
                    const first = Object.keys(STUDENT_DB).find((c) => c.startsWith(e.target.value));
                    if (first) setFilterClass(first);
                  }}
                  className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white"
                >
                  {["3", "4", "5"].map((g) => (
                    <option key={g} value={g}>Khối {g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Lớp</label>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white"
                >
                  {gradeClasses.map((c) => (
                    <option key={c} value={c}>Lớp {c}</option>
                  ))}
                </select>
              </div>
              <div className="ml-auto text-sm text-slate-600">
                Đã chọn: <span className="font-bold text-indigo-700">{selected.size}</span> học sinh
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold w-12">STT</th>
                    <th className="px-3 py-2 text-left font-semibold">Mã định danh</th>
                    <th className="px-3 py-2 text-left font-semibold">Tên học sinh</th>
                    <th className="px-3 py-2 text-left font-semibold">Ngày sinh</th>
                    <th className="px-3 py-2 text-center font-semibold w-14">
                      <input
                        type="checkbox"
                        checked={allChecked}
                        onChange={toggleAll}
                        className="h-4 w-4 accent-indigo-600 cursor-pointer"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((s, idx) => {
                    const checked = selected.has(s.id);
                    return (
                      <tr
                        key={s.id}
                        className={`hover:bg-slate-50 cursor-pointer ${checked ? "bg-indigo-50/40" : ""}`}
                        onClick={() => toggleOne(s.id)}
                      >
                        <td className="px-3 py-2 text-slate-500">{String(idx + 1).padStart(2, "0")}</td>
                        <td className="px-3 py-2 font-mono text-slate-700">{s.code}</td>
                        <td className="px-3 py-2 text-slate-800 font-medium">{s.name}</td>
                        <td className="px-3 py-2 text-slate-600">{s.dob}</td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleOne(s.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4 accent-indigo-600 cursor-pointer"
                          />
                        </td>
                      </tr>
                    );
                  })}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-sm text-slate-400 italic">
                        Không có học sinh nào trong lớp này.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="px-6 py-4 border-t bg-slate-50 flex items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
          >
            Hủy
          </button>
          <div className="flex items-center gap-2">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" /> Quay lại
              </button>
            )}
            {step === 1 ? (
              <button
                onClick={() => canNext && setStep(2)}
                disabled={!canNext}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
              >
                Tiếp tục <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => canCreate && onCreated({
                  name: name.trim(), unitId, startAt, endAt,
                  link: link.trim(), description: description.trim() || undefined,
                  studentCount: selected.size,
                })}
                disabled={!canCreate}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" /> Tạo lớp học
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================ Live classes list ============================ */

function LiveClassesSection({ items }: { items: LiveClass[] }) {
  const [open, setOpen] = useState(true);
  const [stats, setStats] = useState<LiveClass | null>(null);
  return (
    <div className="rounded-xl border border-emerald-200 bg-white overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-50 hover:bg-emerald-100 transition"
      >
        {open ? <ChevronDown className="h-4 w-4 text-emerald-700" /> : <ChevronRight className="h-4 w-4 text-emerald-700" />}
        <span className="h-7 w-7 rounded-lg inline-flex items-center justify-center bg-emerald-100 text-emerald-700">
          <Video className="h-4 w-4" />
        </span>
        <span className="font-semibold text-emerald-800 text-left flex-1">
          Lớp học trực tuyến đã tạo
        </span>
        <span className="text-xs text-emerald-700 font-medium">
          {items.length} lớp
        </span>
      </button>
      {open && (
        <ul className="divide-y divide-slate-100">
          {items.map((l) => {
            const ended = isLiveEnded(l);
            return (
              <li key={l.id} className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50">
                <span className="h-9 w-9 rounded-lg inline-flex items-center justify-center bg-emerald-50 text-emerald-700 shrink-0">
                  <Video className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-800 truncate flex items-center gap-2">
                    {l.name}
                    {ended && (
                      <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        Đã kết thúc
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3 flex-wrap">
                    <span>Ngày tạo: <b className="text-slate-700">{formatDate(l.createdAt)}</b></span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <b className="text-slate-700">{l.studentCount}</b> học sinh tham dự
                    </span>
                    <span className="text-slate-400">·</span>
                    <span>{formatTimeRange(l.startAt, l.endAt)}</span>
                  </div>
                </div>
                {ended ? (
                  <button
                    onClick={() => setStats(l)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    <BarChart3 className="h-3.5 w-3.5" /> Xem thống kê
                  </button>
                ) : (
                  <a
                    href={l.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <Video className="h-3.5 w-3.5" /> Vào lớp
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {stats && <LiveClassStatsModal live={stats} onClose={() => setStats(null)} />}
    </div>
  );
}
