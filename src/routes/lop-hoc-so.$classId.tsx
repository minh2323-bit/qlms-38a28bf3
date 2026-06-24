import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft, Copy, Users, ChevronDown, ChevronRight, Plus, MoveVertical,
  Video, FileText, ClipboardList, BookOpen, Image as ImageIcon, Presentation,
  GripVertical, MoreVertical, Check, Pencil, Trash2,
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

export const Route = createFileRoute("/lop-hoc-so/$classId")({
  head: () => ({
    meta: [
      { title: "Chi tiết lớp học – LMS Giáo viên" },
      { name: "description", content: "Quản lý nội dung lớp học số." },
    ],
  }),
  component: ClassDetailPage,
});

/* ============================ Mock data ============================ */

type ClassInfo = {
  id: string; name: string; code: string; students: number;
  teacher: string; thumb: string; description: string;
};

const CLASS_DB: Record<string, ClassInfo> = {
  c1: { id: "c1", name: "Lớp 4A - Toán năm học 2025 - 2026", code: "LH-4A-T2526", students: 40, teacher: "Cô Nguyễn Thị Hoa", thumb: thumbLop4A, description: "Lớp Toán nâng cao dành cho học sinh lớp 4A. Trọng tâm: các dạng toán tư duy, hình học cơ bản và giải toán có lời văn theo chương trình GDPT 2018." },
  c2: { id: "c2", name: "Lớp 4A - Tiếng Việt năm học 2025 - 2026", code: "LH-4A-TV2526", students: 40, teacher: "Cô Nguyễn Thị Hoa", thumb: thumbLop4A, description: "Lớp Tiếng Việt 4A theo chương trình GDPT 2018." },
  c3: { id: "c3", name: "Lớp 3D năm học 2025 - 2026", code: "LH-3D-2526", students: 40, teacher: "Cô Trần Thanh Mai", thumb: thumbLop3D, description: "Lớp 3D – Toán cơ bản." },
  c4: { id: "c4", name: "Lớp 3A năm học 2025 - 2026", code: "LH-3A-2526", students: 38, teacher: "Cô Lê Thu Hà", thumb: thumbLop3A, description: "Lớp 3A – Toán." },
  c5: { id: "c5", name: "Lớp 3B năm học 2025 - 2026", code: "LH-3B-2526", students: 42, teacher: "Thầy Phạm Văn Nam", thumb: thumbLop3B, description: "Lớp 3B – Toán cơ bản (bản nháp)." },
  c6: { id: "c6", name: "Lớp 3C năm học 2025 - 2026", code: "LH-3C-2526", students: 39, teacher: "Cô Đỗ Mỹ Linh", thumb: thumbLop3C, description: "Lớp 3C – Toán." },
  c7: { id: "c7", name: "Các bạn học sinh cần ôn tập đặc biệt", code: "LH-REVIEW-2526", students: 41, teacher: "Cô Nguyễn Thị Hoa", thumb: thumbLop4BReview, description: "Lớp ghép dành cho học sinh khối 4 cần ôn tập kiến thức nền." },
  c8: { id: "c8", name: "Lớp 4C năm học 2025 - 2026", code: "LH-4C-2526", students: 40, teacher: "Thầy Hoàng Anh Tuấn", thumb: thumbLop4C, description: "Lớp 4C – Toán." },
};

type ItemKind = "video" | "slide" | "doc" | "image" | "exercise";
type ContentItem = {
  id: string; title: string; kind: ItemKind;
  /** duration string for video; for non-video use pages/slides */
  meta: string;
};
type SectionNode =
  | { type: "lesson"; id: string; title: string; children: ContentItem[] }
  | { type: "item"; id: string; item: ContentItem };

const INITIAL_NODES: SectionNode[] = [
  {
    type: "lesson", id: "l1", title: "Bài 1: Số tự nhiên và phép cộng",
    children: [
      { id: "l1-1", title: "Video bài giảng: Giới thiệu số tự nhiên", kind: "video", meta: "12:35" },
      { id: "l1-2", title: "Slide bài giảng", kind: "slide", meta: "24 slide" },
      { id: "l1-3", title: "Tài liệu đọc thêm", kind: "doc", meta: "8 trang" },
      { id: "l1-4", title: "Bài tập luyện tập tại lớp", kind: "exercise", meta: "10 câu" },
    ],
  },
  {
    type: "lesson", id: "l2", title: "Bài 2: Phép trừ và so sánh số",
    children: [
      { id: "l2-1", title: "Video bài giảng: Phép trừ có nhớ", kind: "video", meta: "10:12" },
      { id: "l2-2", title: "Slide bài giảng", kind: "slide", meta: "18 slide" },
      { id: "l2-3", title: "Phiếu bài tập", kind: "exercise", meta: "12 câu" },
    ],
  },
  { type: "item", id: "i1", item: { id: "i1", title: "Hình ảnh minh họa: Bảng số 1 - 100", kind: "image", meta: "1 trang" } },
  { type: "item", id: "i2", item: { id: "i2", title: "Tài liệu tham khảo: Toán tư duy lớp 4", kind: "doc", meta: "32 trang" } },
  { type: "item", id: "i3", item: { id: "i3", title: "Bài kiểm tra giữa kỳ", kind: "exercise", meta: "20 câu" } },
];

/* ============================ Page ============================ */

function ClassDetailPage() {
  const { classId } = Route.useParams();
  const navigate = useNavigate();
  const info = CLASS_DB[classId] ?? {
    id: classId, name: "Lớp học",
    code: `LH-${classId.toUpperCase()}`,
    students: 0, teacher: "—", thumb: thumbLop4A,
    description: "",
  };

  const [nodes, setNodes] = useState<SectionNode[]>(INITIAL_NODES);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ l1: true, l2: true });
  const [reorder, setReorder] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  const totals = useMemo(() => {
    let lessons = 0, items = 0;
    nodes.forEach((n) => {
      if (n.type === "lesson") { lessons++; items += n.children.length; }
      else items++;
    });
    return { lessons, items };
  }, [nodes]);

  const copyCode = async () => {
    try { await navigator.clipboard.writeText(info.code); toast.success("Đã sao chép mã lớp"); }
    catch { toast.error("Không thể sao chép"); }
  };

  /* drag & drop on top-level nodes */
  const onDragStart = (id: string) => setDragId(id);
  const onDragOver = (e: React.DragEvent) => { if (reorder && dragId) e.preventDefault(); };
  const onDrop = (overId: string) => {
    if (!dragId || dragId === overId) return;
    setNodes((arr) => {
      const from = arr.findIndex((n) => n.id === dragId);
      const to = arr.findIndex((n) => n.id === overId);
      if (from < 0 || to < 0) return arr;
      const copy = [...arr];
      const [m] = copy.splice(from, 1);
      copy.splice(to, 0, m);
      return copy;
    });
    setDragId(null);
  };

  return (
    <AppShell>
      {/* Top banner with class info */}
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
                <button
                  onClick={copyCode}
                  className="p-1 rounded hover:bg-white/20"
                  aria-label="Sao chép mã lớp"
                  title="Sao chép mã lớp"
                >
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
              {totals.lessons} bài giảng • {totals.items} mục nội dung
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
                <DropdownMenuItem className="cursor-pointer" onClick={() => toast.message("Thêm bài giảng (demo)")}>
                  <Presentation className="h-4 w-4 mr-2 text-indigo-500" /> Thêm bài giảng
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => toast.message("Thêm học liệu (demo)")}>
                  <BookOpen className="h-4 w-4 mr-2 text-emerald-500" /> Thêm học liệu
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => toast.message("Thêm bài tập (demo)")}>
                  <ClipboardList className="h-4 w-4 mr-2 text-amber-500" /> Thêm bài tập
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {nodes.map((n) => (
            <NodeRow
              key={n.id}
              node={n}
              reorder={reorder}
              expanded={!!expanded[n.id]}
              onToggle={() => setExpanded((s) => ({ ...s, [n.id]: !s[n.id] }))}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              dragging={dragId === n.id}
            />
          ))}
        </div>

        <div className="mt-4">
          <Link
            to="/lop-hoc-so"
            className="text-sm font-medium text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại danh sách lớp
          </Link>
        </div>
      </section>
    </AppShell>
  );
}

/* ============================ Node row ============================ */

function NodeRow({
  node, reorder, expanded, onToggle, onDragStart, onDragOver, onDrop, dragging,
}: {
  node: SectionNode;
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
        onDragStart: () => onDragStart(node.id),
        onDragOver,
        onDrop: () => onDrop(node.id),
      }
    : {};

  if (node.type === "lesson") {
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
          <span className="font-semibold text-slate-800 text-left flex-1">{node.title}</span>
          <span className="text-xs text-slate-500 font-medium">
            {node.children.length} học liệu
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <span
                role="button"
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded hover:bg-slate-200 text-slate-500"
              >
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
            {node.children.map((c) => (
              <li key={c.id} className="pl-12 pr-4 py-2.5 flex items-center gap-3 hover:bg-slate-50">
                <ItemIcon kind={c.kind} />
                <span className="text-sm text-slate-700 flex-1 truncate">{c.title}</span>
                <span className="text-xs text-slate-500">{c.meta}</span>
              </li>
            ))}
            {node.children.length === 0 && (
              <li className="pl-12 pr-4 py-3 text-sm text-slate-400 italic">Chưa có học liệu trong bài giảng này.</li>
            )}
          </ul>
        )}
      </div>
    );
  }

  // standalone item
  return (
    <div
      {...draggableProps}
      className={`rounded-xl border border-slate-200 bg-white px-4 py-3 flex items-center gap-3 hover:bg-slate-50 ${
        dragging ? "opacity-50" : ""
      } ${reorder ? "cursor-move" : ""}`}
    >
      {reorder && <GripVertical className="h-4 w-4 text-slate-400" />}
      <ItemIcon kind={node.item.kind} />
      <span className="text-sm font-medium text-slate-700 flex-1 truncate">{node.item.title}</span>
      <span className="text-xs text-slate-500">{node.item.meta}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-1 rounded hover:bg-slate-100 text-slate-400">
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="cursor-pointer"><Pencil className="h-4 w-4 mr-2" /> Chỉnh sửa</DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer"><Check className="h-4 w-4 mr-2" /> Gán cho học sinh</DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer text-rose-600"><Trash2 className="h-4 w-4 mr-2" /> Xóa</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ItemIcon({ kind }: { kind: ItemKind }) {
  const map = {
    video:    { Icon: Video,         cls: "bg-rose-50 text-rose-600" },
    slide:    { Icon: Presentation,  cls: "bg-indigo-50 text-indigo-600" },
    doc:      { Icon: FileText,      cls: "bg-sky-50 text-sky-600" },
    image:    { Icon: ImageIcon,     cls: "bg-emerald-50 text-emerald-600" },
    exercise: { Icon: ClipboardList, cls: "bg-amber-50 text-amber-600" },
  } as const;
  const { Icon, cls } = map[kind];
  return (
    <span className={`h-7 w-7 rounded-lg inline-flex items-center justify-center ${cls}`}>
      <Icon className="h-4 w-4" />
    </span>
  );
}
