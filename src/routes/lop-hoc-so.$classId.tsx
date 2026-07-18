import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useMemo, useState } from "react";
import {
  ArrowLeft, Copy, Users, ChevronDown, ChevronRight, Plus, MoveVertical,
  Video, FileText, ClipboardList, BookOpen, Image as ImageIcon, Presentation,
  GripVertical, MoreVertical, Check, Pencil, Trash2, X, FileCheck2, Clock,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

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
import { useCompletion } from "@/lib/material-progress-store";


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
export type ClassInfo = {
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
  const baseInfo: ClassInfo = CLASS_DB[classId] ?? fallback;
  const [info, setInfo] = useState<ClassInfo>(baseInfo);
  const [editOpen, setEditOpen] = useState(false);

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


  // Group by unitId → sections. Schedule-origin items sit in a dedicated group.
  type Group = { unitId: string; title: string; items: Material[] };
  const scheduleGroup: Group | null = useMemo(() => {
    const items = classMaterials.filter((m) => m.origin === "schedule");
    if (!items.length) return null;
    return { unitId: "_from_schedule", title: "Nội dung thêm từ Lịch báo giảng", items };
  }, [classMaterials]);

  const groups: Group[] = useMemo(() => {
    const map = new Map<string, Group>();
    classMaterials
      .filter((m) => m.origin !== "schedule")
      .forEach((m) => {
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
  const [taskPickerOpen, setTaskPickerOpen] = useState(false);
  const [testPickerOpen, setTestPickerOpen] = useState(false);
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

        <button
          onClick={() => setEditOpen(true)}
          className="absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-indigo-700 text-sm font-semibold shadow hover:bg-indigo-50"
        >
          <Pencil className="h-4 w-4" /> Tùy chỉnh
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
                <span className="opacity-90">Môn dạy:</span>
                <span className="font-semibold">{info.subjectsTaught.join(", ")}</span>
              </div>
            </div>

            {info.description && (
              <p className="mt-5 text-white/90 max-w-3xl leading-relaxed text-sm md:text-[15px]">
                {info.description}
              </p>
            )}

            {/* Deploy / Lock button */}
            <div className="mt-5 flex items-center gap-2 flex-wrap">
              {status === "draft" ? (
                <button
                  onClick={() => { setStatus("deployed"); toast.success("Đã triển khai lớp học"); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow"
                >
                  <Check className="h-4 w-4" /> Triển khai lớp học
                </button>
              ) : (
                <button
                  onClick={() => {
                    setLocked((v) => !v);
                    toast.success(locked ? "Đã mở khóa lớp học" : "Đã khóa lớp học");
                  }}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg shadow ${
                    locked
                      ? "bg-white text-indigo-700 hover:bg-slate-100"
                      : "bg-amber-500 hover:bg-amber-600 text-white"
                  }`}
                >
                  {locked ? "Mở khóa lớp học" : "Khóa lớp học"}
                </button>
              )}
              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                status === "draft"
                  ? "bg-amber-100 text-amber-700"
                  : locked
                    ? "bg-slate-200 text-slate-700"
                    : "bg-emerald-100 text-emerald-700"
              }`}>
                {status === "draft" ? "Bản nháp" : locked ? "Đã khóa" : "Đã triển khai"}
              </span>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="aspect-[4/3] rounded-xl overflow-hidden border-2 border-white/30 shadow-lg">
              <img src={info.thumb} alt={info.name} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Subject selector */}
      <section className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-5">
        <h2 className="text-sm font-bold text-slate-700 mb-3">Môn học phụ trách</h2>
        <div className="flex flex-wrap gap-2">
          {info.subjectsTaught.map((s) => {
            const active = selectedSubject === s;
            return (
              <button
                key={s}
                onClick={() => setSelectedSubject(s)}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold border transition ${
                  active
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:text-indigo-700"
                }`}
              >
                {s}
              </button>
            );
          })}
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
                <DropdownMenuItem className="cursor-pointer" onClick={() => setTaskPickerOpen(true)}>
                  <ClipboardList className="h-4 w-4 mr-2 text-amber-500" /> Thêm bài tập
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-5 space-y-3">

          {scheduleGroup && (
            <GroupRow
              group={scheduleGroup}
              reorder={false}
              expanded={isOpen(scheduleGroup.unitId)}
              onToggle={() => setExpanded((s) => ({ ...s, [scheduleGroup.unitId]: !isOpen(scheduleGroup.unitId) }))}
              onDragStart={() => {}}
              onDragOver={() => {}}
              onDrop={() => {}}
              dragging={false}
            />
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
          {orderedGroups.length === 0 && (
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

      {/* Bài kiểm tra */}
      <TestsSection classInfo={info} />

      {/* Lớp học trực tuyến */}
      <section className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
        <div className="mb-3 flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Lớp học trực tuyến</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Danh sách phòng học trực tuyến của lớp — đã đồng bộ với Lịch báo giảng.
            </p>
          </div>
          <button
            onClick={() => setLiveOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          >
            <Video className="h-4 w-4" /> Tạo lớp học trực tuyến
          </button>
        </div>
        {classLive.length > 0 ? (
          <LiveClassesSection items={classLive} />
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-6 text-center text-sm text-slate-500">
            Chưa có phòng học trực tuyến nào. Bấm <b>Tạo lớp học trực tuyến</b> để bắt đầu.
          </div>
        )}
      </section>


      {/* Hồ sơ giáo dục */}
      <EducationRecordsSection className={info.name} />

      <AnnouncementSection
        classRealId={info.lop}
        subject={selectedSubject}
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
              subject: selectedSubject,
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

      <TaskPickerDialog open={taskPickerOpen} onClose={() => setTaskPickerOpen(false)} />
      <TestPickerDialog open={testPickerOpen} onClose={() => setTestPickerOpen(false)} />

      <EditClassModal
        open={editOpen}
        info={info}
        onClose={() => setEditOpen(false)}
        onSave={(next) => { setInfo(next); setEditOpen(false); toast.success("Đã cập nhật thông tin lớp"); }}
      />
    </AppShell>
  );
}

/* ============================ Edit class modal ============================ */
function EditClassModal({
  open, info, onClose, onSave,
}: {
  open: boolean; info: ClassInfo;
  onClose: () => void;
  onSave: (next: ClassInfo) => void;
}) {
  const [name, setName] = useState(info.name);
  const [description, setDescription] = useState(info.description);
  const [thumb, setThumb] = useState(info.thumb);
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) { setName(info.name); setDescription(info.description); setThumb(info.thumb); }
  }, [open, info]);

  const onPickFile = (f: File | null) => {
    if (!f) return;
    const url = URL.createObjectURL(f);
    setThumb(url);
  };

  const canSave = name.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-indigo-600" /> Tùy chỉnh thông tin lớp
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="text-[11px] font-semibold uppercase text-slate-500">Khối</div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">Lớp {info.lop}</div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="text-[11px] font-semibold uppercase text-slate-500">Môn dạy</div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">{info.subjectsTaught.join(", ")}</div>
            </div>
            <div className="col-span-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="text-[11px] font-semibold uppercase text-slate-500">Cách đăng ký học sinh</div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">Qua mã lớp <span className="font-mono">{info.code}</span></div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 -mt-1">Không thể chỉnh sửa Khối, Môn dạy và cách thức đăng ký học sinh.</p>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Tên lớp <span className="text-rose-500">*</span></label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Ảnh đại diện</label>
            <div className="flex items-center gap-3">
              <div className="h-24 w-32 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                <img src={thumb} alt="thumb" className="w-full h-full object-cover" />
              </div>
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                >
                  <ImageIcon className="h-4 w-4" /> Đổi ảnh đại diện
                </button>
                <p className="text-[11px] text-slate-500 mt-1">Định dạng JPG/PNG, dung lượng &lt; 2MB.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:underline">Huỷ</button>
          <button
            disabled={!canSave}
            onClick={() => canSave && onSave({ ...info, name: name.trim(), description: description.trim(), thumb })}
            className={`px-5 py-2 text-sm font-semibold rounded-lg ${canSave ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
          >
            Lưu thay đổi
          </button>
        </div>
      </DialogContent>
    </Dialog>
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
  const { classId } = Route.useParams();
  const completed = useCompletion();
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
      <div className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition">
        {reorder && <GripVertical className="h-4 w-4 text-slate-400" />}
        <button
          type="button"
          onClick={onToggle}
          className="p-1 rounded hover:bg-slate-200 text-slate-500"
          aria-label={expanded ? "Thu gọn" : "Mở rộng"}
        >
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        {group.items[0] ? (
          <Link
            to="/lop-hoc-so/$classId/hoc-lieu/$materialId"
            params={{ classId, materialId: group.items[0].id }}
            className="font-semibold text-slate-800 text-left flex-1 hover:text-indigo-700 truncate"
          >
            {group.title}
          </Link>
        ) : (
          <span className="font-semibold text-slate-800 text-left flex-1">{group.title}</span>
        )}
        <span className="text-xs text-slate-500 font-medium">
          {group.items.length} học liệu
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <span role="button" className="p-1 rounded hover:bg-slate-200 text-slate-500">
              <MoreVertical className="h-4 w-4" />
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="cursor-pointer"><Pencil className="h-4 w-4 mr-2" /> Đổi tên</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer"><Plus className="h-4 w-4 mr-2" /> Thêm học liệu vào bài</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-rose-600"><Trash2 className="h-4 w-4 mr-2" /> Xóa bài giảng</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {expanded && (
        <ul className="divide-y divide-slate-100">
          {group.items.map((c) => {
            const done = completed.has(c.id);
            return (
              <li key={c.id} className="pl-12 pr-4 py-2.5 flex items-center gap-3 hover:bg-slate-50">
                <span className="relative">
                  <ItemIcon kind={c.kind} />
                  {done && (
                    <span className="absolute -right-1 -bottom-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white inline-flex items-center justify-center">
                      <Check className="h-2 w-2 text-white" strokeWidth={3} />
                    </span>
                  )}
                </span>
                <Link
                  to="/lop-hoc-so/$classId/hoc-lieu/$materialId"
                  params={{ classId, materialId: c.id }}
                  className={`text-sm flex-1 truncate hover:text-indigo-700 ${done ? "text-slate-500 line-through" : "text-slate-700"}`}
                >
                  {c.title}
                </Link>
                {c.origin === "schedule" && (
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                    Từ lịch
                  </span>
                )}
                <span className="text-xs text-slate-500">{c.meta}</span>
              </li>
            );
          })}
          {group.items.length === 0 && (
            <li className="pl-12 pr-4 py-3 text-sm text-slate-400 italic">Chưa có học liệu trong bài giảng này.</li>
          )}
          <li className="pl-12 pr-4 py-2 border-t border-dashed border-slate-200 bg-slate-50/50">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-700 hover:text-indigo-900">
                  <Plus className="h-4 w-4" /> Thêm nội dung vào chủ đề này
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem className="cursor-pointer"><Presentation className="h-4 w-4 mr-2 text-indigo-500" /> Bài giảng</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer"><BookOpen className="h-4 w-4 mr-2 text-emerald-500" /> Học liệu</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer"><ClipboardList className="h-4 w-4 mr-2 text-amber-500" /> Bài tập</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
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

export function AddMaterialModal({
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

/* ============================ Education Records ============================ */

type EducationDoc = { id: string; name: string; size: string; uploadedAt: string; uploader: string };

function EducationRecordsSection({ className }: { className: string }) {
  const initialName = `Kế hoạch giáo dục ${className.replace(" Năm học", " năm học")}`;
  const [docs, setDocs] = useState<EducationDoc[]>([
    { id: "d1", name: `${initialName}.pdf`, size: "1.2 MB", uploadedAt: "05/09/2025", uploader: "Cô Nguyễn Thị Hoa" },
  ]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const sizeKb = f.size / 1024;
    const sizeText = sizeKb >= 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb.toFixed(0)} KB`;
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    setDocs((prev) => [
      { id: `d-${Date.now()}`, name: f.name, size: sizeText, uploadedAt: `${dd}/${mm}/${today.getFullYear()}`, uploader: "Bạn" },
      ...prev,
    ]);
    if (inputRef.current) inputRef.current.value = "";
    toast.success("Đã thêm tài liệu vào Hồ sơ giáo dục");
  };

  return (
    <section className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Hồ sơ giáo dục</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Nơi lưu trữ kế hoạch giáo dục, chương trình, và tài liệu liên quan tới lớp học.
          </p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> Thêm tài liệu
        </button>
        <input ref={inputRef} type="file" className="hidden" onChange={onPick} />
      </div>

      <ul className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
        {docs.map((d) => (
          <li key={d.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
            <span className="h-10 w-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-800 truncate">{d.name}</div>
              <div className="text-xs text-slate-500 mt-0.5">
                {d.size} • Tải lên {d.uploadedAt} bởi {d.uploader}
              </div>
            </div>
            <button
              onClick={() => toast.message("Tải xuống (demo)")}
              className="px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              Tải xuống
            </button>
            <button
              onClick={() => setDocs((p) => p.filter((x) => x.id !== d.id))}
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
              aria-label="Xóa"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
        {docs.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-slate-500">Chưa có tài liệu nào.</li>
        )}
      </ul>
    </section>
  );
}

/* ============================ Tests Section ============================ */

type TestItem = { id: string; name: string; startAt: string; endAt: string };

function TestsSection({ classInfo }: { classInfo: ClassInfo }) {
  const [open, setOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [tests, setTests] = useState<TestItem[]>([
    { id: "t1", name: "Kiểm tra 15 phút – Chương Phân số",  startAt: "05/07/2026 08:00", endAt: "05/07/2026 08:15" },
    { id: "t2", name: "Kiểm tra giữa kỳ II – Toán 4",       startAt: "10/07/2026 07:30", endAt: "10/07/2026 08:15" },
    { id: "t3", name: "Kiểm tra cuối chương – Số đo đại lượng", startAt: "18/07/2026 14:00", endAt: "18/07/2026 14:45" },
  ]);

  return (
    <section className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Bài kiểm tra</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Danh sách các bài kiểm tra giáo viên đã tạo cho lớp học.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700"
        >
          <Plus className="h-4 w-4" /> Thêm bài kiểm tra
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 overflow-hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center gap-3 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 transition text-left"
        >
          {open ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
          <span className="font-semibold text-slate-700 flex-1">Danh sách bài kiểm tra</span>
          <span className="text-xs text-slate-500 font-medium">{tests.length} bài</span>
        </button>
        {open && (
          <ul className="divide-y divide-slate-100">
            {tests.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
                <span className="h-9 w-9 rounded-lg inline-flex items-center justify-center bg-rose-50 text-rose-600 shrink-0">
                  <FileCheck2 className="h-4 w-4" />
                </span>
                <button
                  onClick={() => toast.message(`Xem chi tiết: ${t.name}`)}
                  className="text-sm font-semibold text-slate-800 hover:text-indigo-700 flex-1 truncate text-left"
                >
                  {t.name}
                </button>
                <span className="text-xs text-slate-500 inline-flex items-center gap-1.5 shrink-0">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {t.startAt} → {t.endAt}
                </span>
              </li>
            ))}
            {tests.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-slate-500">Chưa có bài kiểm tra nào.</li>
            )}
          </ul>
        )}
      </div>

      <AddTestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        classInfo={classInfo}
        onCreated={(name, startAt, endAt) => {
          setTests((prev) => [{ id: `t-${Date.now()}`, name, startAt, endAt }, ...prev]);
          setModalOpen(false);
          toast.success("Đã tạo bài kiểm tra");
        }}
      />
    </section>
  );
}


/* ============================ Task/Test pickers ============================ */

export function TaskPickerDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const opts = [
    { key: "practice", label: "Đề luyện tập", desc: "Tự tạo đề luyện tập với 6 dạng câu hỏi.",
      icon: FileText, color: "text-indigo-600 bg-indigo-50",
      go: () => navigate({ to: "/giao-bai-tap/tao-moi/de-luyen-tap" }) },
    { key: "reading", label: "Bài tập đọc - Tìm hiểu", desc: "Giao bài đọc kèm câu hỏi cho học sinh.",
      icon: BookOpen, color: "text-emerald-600 bg-emerald-50",
      go: () => navigate({ to: "/giao-bai-tap/tao-moi/bai-tap-doc" }) },
    { key: "licensed", label: "Bài tập bản quyền", desc: "Giao từ kho học liệu bản quyền có sẵn.",
      icon: FileCheck2, color: "text-amber-600 bg-amber-50",
      go: () => navigate({ to: "/giao-bai-tap" }) },
  ] as const;
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-amber-500" /> Chọn loại bài tập
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-600">Vui lòng chọn loại bài tập bạn muốn giao cho lớp.</p>
        <div className="grid grid-cols-3 gap-3 py-2">
          {opts.map((o) => (
            <button
              key={o.key}
              onClick={() => { o.go(); onClose(); }}
              className="rounded-xl border border-slate-200 p-4 text-center hover:border-indigo-300 hover:shadow-md transition"
            >
              <div className={`mx-auto h-11 w-11 rounded-full flex items-center justify-center ${o.color}`}>
                <o.icon className="h-5 w-5" />
              </div>
              <div className="mt-2 font-semibold text-slate-800 text-sm">{o.label}</div>
              <div className="text-[11px] text-slate-500 mt-1 leading-snug">{o.desc}</div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function TestPickerDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const opts = [
    { key: "bank", label: "Thêm từ Kho đề kiểm tra", desc: "Chọn đề có sẵn từ kho đề kiểm tra của bạn.",
      icon: BookOpen, color: "text-indigo-600 bg-indigo-50",
      go: () => navigate({ to: "/hoc-lieu/de-kiem-tra" }) },
    { key: "new", label: "Thêm mới", desc: "Tạo đề mới từ khung ma trận hoặc tự soạn.",
      icon: Plus, color: "text-emerald-600 bg-emerald-50",
      go: () => navigate({ to: "/hoc-lieu/de-kiem-tra" }) },
  ] as const;
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-rose-500" /> Thêm bài kiểm tra
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-2">
          {opts.map((o) => (
            <button
              key={o.key}
              onClick={() => { o.go(); onClose(); }}
              className="rounded-xl border border-slate-200 p-5 text-center hover:border-indigo-300 hover:shadow-md transition"
            >
              <div className={`mx-auto h-12 w-12 rounded-full flex items-center justify-center ${o.color}`}>
                <o.icon className="h-6 w-6" />
              </div>
              <div className="mt-3 font-semibold text-slate-800">{o.label}</div>
              <div className="text-xs text-slate-500 mt-1 leading-snug">{o.desc}</div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ============================ Add Test Modal ============================ */

function MultiUnitSelect({
  tree, value, onChange, disabled, placeholder,
}: {
  tree: ReturnType<typeof getTreeForClass>;
  value: string[];
  onChange: (v: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const toggle = (id: string) => {
    if (value.includes(id)) onChange(value.filter((x) => x !== id));
    else onChange([...value, id]);
  };
  const label =
    value.length === 0
      ? placeholder ?? "— Chọn đơn vị kiến thức —"
      : `Đã chọn ${value.length} đơn vị kiến thức`;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white hover:border-slate-300 disabled:bg-slate-50 disabled:text-slate-400"
      >
        <span className={value.length === 0 ? "text-slate-400" : "text-slate-700"}>{label}</span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>
      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-full max-h-72 overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg py-1">
          {tree.length === 0 && (
            <div className="px-3 py-2 text-xs text-slate-400">Không có dữ liệu.</div>
          )}
          {tree.map((ch) => (
            <div key={ch.id}>
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-500 uppercase bg-slate-50">
                {ch.title}
              </div>
              {ch.units.map((u) => {
                const checked = value.includes(u.id);
                return (
                  <label
                    key={u.id}
                    className="flex items-start gap-2 px-3 py-2 text-sm hover:bg-indigo-50/50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(u.id)}
                      className="mt-0.5 h-4 w-4 accent-indigo-600"
                    />
                    <span className="text-slate-700">{u.title}</span>
                  </label>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NumberStepper({
  value, onChange, min = 0, max = 999, step = 1,
}: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => {
        const v = Number(e.target.value);
        if (!Number.isNaN(v)) onChange(v);
      }}
      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
    />
  );
}

function AddTestModal({
  open, onClose, classInfo, onCreated,
}: {
  open: boolean;
  onClose: () => void;
  classInfo: ClassInfo;
  onCreated: (name: string, startAt: string, endAt: string) => void;
}) {
  // (1) Info
  const [name, setName] = useState("");
  const [subject, setSubject] = useState(classInfo.subject);
  const [chapterId, setChapterId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [gradeType, setGradeType] = useState<"none" | "h1">("h1");

  // (2) Config
  const [scaleOptions, setScaleOptions] = useState<number[]>([10, 100]);
  const [scale, setScale] = useState<string>("10");
  const [addingScale, setAddingScale] = useState(false);
  const [newScale, setNewScale] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [duration, setDuration] = useState(45);
  const [startAt, setStartAt] = useState("");
  const [attempts, setAttempts] = useState(1);
  const [showAnswers, setShowAnswers] = useState(false);
  const [shuffle, setShuffle] = useState(false);

  // (3) Students
  const students = STUDENT_DB[classInfo.lop] ?? [];
  const [selected, setSelected] = useState<Set<string>>(() => new Set(students.map((s) => s.id)));

  // Reset when opening
  React.useEffect(() => {
    if (!open) return;
    setName("");
    setSubject(classInfo.subject);
    setChapterId("");
    setUnitId("");
    setGradeType("h1");
    setScaleOptions([10, 100]);
    setScale("10");
    setAddingScale(false);
    setNewScale("");
    setMinScore(0);
    setDuration(45);
    setStartAt("");
    setAttempts(1);
    setShowAnswers(false);
    setShuffle(false);
    setSelected(new Set((STUDENT_DB[classInfo.lop] ?? []).map((s) => s.id)));
  }, [open, classInfo.lop, classInfo.subject]);

  const tree = useMemo(
    () => getTreeForClass(classInfo.lop, subject),
    [classInfo.lop, subject],
  );

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

  const canCreate =
    name.trim().length > 0 &&
    !!chapterId && !!unitId &&
    !!scale &&
    duration > 0 &&
    startAt.trim().length > 0 &&
    attempts > 0;

  const handleCreate = () => {
    if (!canCreate) return;
    // Compute rough end time = start + duration minutes (best-effort format).
    const d = new Date(startAt);
    let startFmt = startAt.replace("T", " ");
    let endFmt = startFmt;
    if (!Number.isNaN(d.getTime())) {
      const end = new Date(d.getTime() + duration * 60_000);
      const fmt = (x: Date) => {
        const p = (n: number) => String(n).padStart(2, "0");
        return `${p(x.getDate())}/${p(x.getMonth() + 1)}/${x.getFullYear()} ${p(x.getHours())}:${p(x.getMinutes())}`;
      };
      startFmt = fmt(d);
      endFmt = fmt(end);
    }
    onCreated(name.trim(), startFmt, endFmt);
  };

  const handleAddScale = () => {
    const n = Number(newScale);
    if (!Number.isFinite(n) || n <= 0) {
      toast.error("Thang điểm phải là số dương");
      return;
    }
    if (!scaleOptions.includes(n)) {
      setScaleOptions((p) => [...p, n]);
    }
    setScale(String(n));
    setNewScale("");
    setAddingScale(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileCheck2 className="h-5 w-5 text-rose-500" /> Thêm bài kiểm tra mới
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Section 1 */}
          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-bold text-slate-800 mb-3">1. Thông tin bài kiểm tra</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Tên bài kiểm tra <span className="text-rose-500">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Kiểm tra 15 phút – Chương Phân số"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Môn</label>
                  <select
                    value={subject}
                    onChange={(e) => { setSubject(e.target.value); setChapterId(""); setUnitId(""); }}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
                  >
                    {(classInfo.subjectsTaught ?? [classInfo.subject]).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Chương/Chủ đề <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={chapterId}
                    onChange={(e) => { setChapterId(e.target.value); setUnitId(""); }}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="">— Chọn chương —</option>
                    {tree.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Bài học <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={unitId}
                    onChange={(e) => setUnitId(e.target.value)}
                    disabled={!chapterId}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">{!chapterId ? "— Chọn chương trước —" : "— Chọn bài học —"}</option>
                    {(tree.find((c) => c.id === chapterId)?.units ?? []).map((u) => (
                      <option key={u.id} value={u.id}>{u.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Loại điểm</label>
                <select
                  value={gradeType}
                  onChange={(e) => setGradeType(e.target.value as "none" | "h1")}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
                >
                  <option value="none">Kiểm tra không lấy điểm</option>
                  <option value="h1">Lấy điểm hệ số 1</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-bold text-slate-800 mb-3">2. Cấu hình đề</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Thang điểm <span className="text-rose-500">*</span>
                </label>
                {addingScale ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={newScale}
                      onChange={(e) => setNewScale(e.target.value)}
                      placeholder="Nhập số"
                      className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
                    />
                    <button
                      onClick={handleAddScale}
                      className="px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      Thêm
                    </button>
                    <button
                      onClick={() => { setAddingScale(false); setNewScale(""); }}
                      className="px-2 py-2 text-slate-500 hover:text-slate-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <select
                    value={scale}
                    onChange={(e) => {
                      if (e.target.value === "__add") setAddingScale(true);
                      else setScale(e.target.value);
                    }}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
                  >
                    {scaleOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                    <option value="__add">+ Thêm thang điểm</option>
                  </select>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Điểm tối thiểu</label>
                <NumberStepper value={minScore} onChange={setMinScore} min={0} max={Number(scale) || 100} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Thời gian làm (phút) <span className="text-rose-500">*</span>
                </label>
                <NumberStepper value={duration} onChange={setDuration} min={1} max={600} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Số lượt làm bài <span className="text-rose-500">*</span>
                </label>
                <NumberStepper value={attempts} onChange={setAttempts} min={1} max={20} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Thời gian bắt đầu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Đến giờ, học sinh click vào rồi ấn "Làm bài" mới hiển thị đề.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAnswers}
                  onChange={(e) => setShowAnswers(e.target.checked)}
                  className="h-4 w-4 accent-indigo-600"
                />
                Cho phép xem đáp án sau khi nộp
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shuffle}
                  onChange={(e) => setShuffle(e.target.checked)}
                  className="h-4 w-4 accent-indigo-600"
                />
                Xáo trộn đề và đáp án ngẫu nhiên
              </label>
            </div>
          </div>

          {/* Section 3 */}
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800">3. Danh sách học sinh kiểm tra</h3>
              <div className="text-xs text-slate-600">
                Đã chọn: <span className="font-bold text-indigo-700">{selected.size}</span> / {students.length} học sinh
              </div>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 sticky top-0">
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

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              Đóng
            </button>
            <button
              onClick={handleCreate}
              disabled={!canCreate}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
            >
              <Check className="h-4 w-4" /> Tạo bài kiểm tra
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

