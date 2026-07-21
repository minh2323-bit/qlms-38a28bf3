import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import {
  GraduationCap, Presentation as PresentationIcon, Users, MoreVertical,
  LayoutGrid, List as ListIcon, Plus, Copy, Trash2, Search, ChevronDown,
  CheckSquare, Check, X, ImagePlus, ArrowLeft, ArrowRight, Pencil,
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

export const Route = createFileRoute("/lop-hoc-so/")({
  head: () => ({
    meta: [
      { title: "Lớp học số – LMS Giáo viên | Tiểu học Tô Hiệu" },
      { name: "description", content: "Quản lý các lớp học số và bài giảng." },
    ],
  }),
  component: DigitalClassesPage,
});

type ClassStatus = "draft" | "deployed";
type ClassRow = {
  id: string;
  name: string; lop: string; subject: string;
  baiGiang: number; hocLieu: number; hocSinh: number;
  thumb: string;
  status: ClassStatus;
  homeroom?: boolean;
  userCreated?: boolean;
};

const CLASSES_SEED: ClassRow[] = [
  { id: "c1", name: "Lớp 4A Năm học 2025 - 2026", lop: "4A", subject: "Toán", baiGiang: 15, hocLieu: 15, hocSinh: 40, thumb: thumbLop4A, status: "deployed", homeroom: true },
  { id: "c3", name: "Lớp 3D Năm học 2025 - 2026", lop: "3D", subject: "Toán", baiGiang: 15, hocLieu: 15, hocSinh: 40, thumb: thumbLop3D, status: "deployed" },
  { id: "c4", name: "Lớp 3A Năm học 2025 - 2026", lop: "3A", subject: "Toán", baiGiang: 12, hocLieu: 18, hocSinh: 38, thumb: thumbLop3A, status: "deployed" },
  { id: "c5", name: "Lớp 3B Năm học 2025 - 2026", lop: "3B", subject: "Toán", baiGiang: 14, hocLieu: 16, hocSinh: 42, thumb: thumbLop3B, status: "draft" },
  { id: "c6", name: "Lớp 3C Năm học 2025 - 2026", lop: "3C", subject: "Toán", baiGiang: 13, hocLieu: 14, hocSinh: 39, thumb: thumbLop3C, status: "deployed" },
  { id: "c7", name: "Lớp 4B, 4C, 4D Năm học 2025 - 2026", lop: "4B, 4C, 4D", subject: "Toán", baiGiang: 16, hocLieu: 17, hocSinh: 41, thumb: thumbLop4BReview, status: "draft", userCreated: true },
  { id: "c8", name: "Lớp 4C Năm học 2025 - 2026", lop: "4C", subject: "Toán", baiGiang: 15, hocLieu: 15, hocSinh: 40, thumb: thumbLop4C, status: "deployed" },
];

const TOTAL_LESSONS = 8;

// Lớp giáo viên phụ trách (dùng cho cả 2 step trong popup)
const TEACHER_CLASSES = ["4A", "4B", "4C", "3A", "3B", "3C", "3D"];

// Sinh danh sách học sinh giả lập cho 1 lớp
function genStudents(lop: string): { id: string; name: string; code: string }[] {
  const base = 12;
  return Array.from({ length: base }).map((_, i) => ({
    id: `${lop}-${i + 1}`,
    name: `Học sinh ${lop} - ${String(i + 1).padStart(2, "0")}`,
    code: `${lop}${String(i + 1).padStart(7, "0")}`,
  }));
}

function generateId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function DigitalClassesPage() {
  const [classes, setClasses] = useState<ClassRow[]>(CLASSES_SEED);
  const [classView, setClassView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [khoi, setKhoi] = useState("");
  const [mon, setMon] = useState("");
  const [classSelectMode, setClassSelectMode] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set());
  const [openCreate, setOpenCreate] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRow | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    if (!highlightedId) return;
    const t = setTimeout(() => setHighlightedId(null), 3000);
    return () => clearTimeout(t);
  }, [highlightedId]);

  const toggleClassSel = (id: string) => setSelectedClasses((s) => {
    const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const exitClassSelect = () => { setClassSelectMode(false); setSelectedClasses(new Set()); };

  const filteredClasses = classes.filter((c) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    const matchKhoi = !khoi || c.lop.includes(khoi);
    const matchMon = !mon || c.subject === mon;
    return matchSearch && matchKhoi && matchMon;
  });

  const handleCreate = (row: ClassRow) => {
    if (editingClass) {
      setClasses((prev) => prev.map((c) => (c.id === editingClass.id ? { ...row, id: editingClass.id } : c)));
      setHighlightedId(editingClass.id);
      toast.success("Cập nhật lớp học thành công");
    } else {
      const newRow = { ...row, id: row.id || generateId() };
      setClasses((prev) => [newRow, ...prev]);
      setHighlightedId(newRow.id);
      toast.success("Thêm lớp học thành công");
    }
    setOpenCreate(false);
    setEditingClass(null);
  };


  return (
    <AppShell>
      <>
        {/* Top stat cards */}
        <section className="grid grid-cols-3 gap-4">
          <StatCard color="emerald" label="Lớp học đã tạo" value={classes.length} icon={<GraduationCap className="h-7 w-7 text-emerald-600" />} />
          <StatCard color="indigo" label="Bài giảng đã tạo" value={TOTAL_LESSONS} icon={<PresentationIcon className="h-7 w-7 text-indigo-600" />} />
          <StatCard color="slate" label="Tổng số học sinh tham dự" value={classes.reduce((s, c) => s + c.hocSinh, 0)} icon={<Users className="h-7 w-7 text-slate-600" />} />
        </section>

        <section>
          {/* Filter bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm tên lớp học"
                  className="pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white w-64 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <FilterSelect value={khoi} onChange={setKhoi} placeholder="Khối" options={["3", "4", "5"]} />
              <FilterSelect value={mon} onChange={setMon} placeholder="Môn" options={["Toán", "Tiếng Việt", "Tiếng Anh"]} />
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => setOpenCreate(true)}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-semibold px-5 py-3 rounded-xl shadow-md"
              >
                <Plus className="h-5 w-5" /> Thêm lớp học mới
              </button>
              {classSelectMode && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Đã chọn <b className="text-indigo-700">{selectedClasses.size}</b></span>
                  <button onClick={exitClassSelect} className="px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">Thoát chọn</button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setClassView("list")}
                  className={`px-2 py-1.5 rounded-md border text-xs flex items-center gap-1 ${classView === "list" ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "bg-white border-slate-200 text-slate-600"}`}
                >
                  <ListIcon className="h-3.5 w-3.5" /> List view
                </button>
                <button
                  onClick={() => setClassView("grid")}
                  className={`px-2 py-1.5 rounded-md border text-xs flex items-center gap-1 ${classView === "grid" ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "bg-white border-slate-200 text-slate-600"}`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" /> Grid
                </button>
              </div>
            </div>
          </div>

          <div className={classView === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" : "space-y-3"}>
            {filteredClasses.map((c) => (
              <ClassCard
                key={c.id}
                c={c}
                selectMode={classSelectMode}
                selected={selectedClasses.has(c.id)}
                onToggleSelect={() => toggleClassSel(c.id)}
                onEnterSelect={() => { setClassSelectMode(true); toggleClassSel(c.id); }}
                onEdit={() => { setEditingClass(c); setOpenCreate(true); }}
                isNew={c.id === highlightedId}
              />
            ))}
          </div>
        </section>

        {openCreate && (
          <CreateClassModal
            initial={editingClass}
            onClose={() => { setOpenCreate(false); setEditingClass(null); }}
            onSubmit={handleCreate}
          />
        )}

      </>
    </AppShell>
  );
}

function FilterSelect({ value, onChange, placeholder, options }: { value: string; onChange: (v: string) => void; placeholder: string; options: string[] }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}

function StatCard({ color, label, value, icon }: { color: "emerald" | "indigo" | "slate"; label: string; value: number; icon: React.ReactNode }) {
  const accent = {
    emerald: "border-l-emerald-500",
    indigo: "border-l-indigo-600",
    slate: "border-l-slate-400",
  }[color];
  return (
    <div className={`bg-white rounded-2xl border border-l-4 ${accent} shadow-sm px-5 py-4 flex items-center justify-between`}>
      <div>
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        <div className="mt-1 flex items-center gap-3">
          {icon}
          <span className="text-3xl font-bold text-indigo-700">{value}</span>
        </div>
      </div>
    </div>
  );
}

type SelectProps = {
  selectMode: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  onEnterSelect: () => void;
};

function SelectCircle({ selected, onClick }: { selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      aria-label={selected ? "Bỏ chọn" : "Chọn"}
      className={`absolute top-2 left-2 z-10 h-7 w-7 rounded-full border-2 flex items-center justify-center transition shadow ${selected ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white/90 border-slate-300 text-transparent hover:border-indigo-400"}`}
    >
      <Check className="h-4 w-4" strokeWidth={3} />
    </button>
  );
}

function StatusTag({ status }: { status: ClassStatus }) {
  if (status === "draft") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 border border-amber-200">
        Bản nháp
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
      Đã triển khai
    </span>
  );
}

function ClassCard({ c, selectMode, selected, onToggleSelect, onEnterSelect, onEdit, isNew }: { c: ClassRow; onEdit?: () => void } & SelectProps & { isNew?: boolean }) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (selectMode) { onToggleSelect(); return; }
    navigate({ to: "/lop-hoc-so/$classId", params: { classId: c.id } });
  };
  return (
    <div
      className={`relative bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer ${selected ? "ring-2 ring-indigo-500" : ""} ${isNew ? "class-highlight" : ""}`}
      onClick={handleClick}
      role="button"
    >
      {selectMode && <SelectCircle selected={selected} onClick={onToggleSelect} />}

      <div className="h-24 bg-slate-100 overflow-hidden relative">
        <img src={c.thumb} alt={c.name} loading="lazy" className="w-full h-full object-cover" />
        {c.homeroom && (
          <div className="absolute top-1.5 left-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 shadow">
              Lớp chủ nhiệm
            </span>
          </div>
        )}
        <div className="absolute top-1.5 right-1.5">
          <StatusTag status={c.status} />
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-1">
          <h3 className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">{c.name}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button onClick={(e) => e.stopPropagation()} className="p-0.5 rounded hover:bg-slate-100 text-slate-500 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                  <Pencil className="h-4 w-4 mr-2 text-emerald-500" /> Sửa
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="cursor-pointer">
                <Copy className="h-4 w-4 mr-2 text-sky-500" /> Tạo bản sao
              </DropdownMenuItem>
              {c.userCreated && (
                <DropdownMenuItem className="cursor-pointer text-rose-600">
                  <Trash2 className="h-4 w-4 mr-2" /> Xóa lớp học
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-600">
          <span><span className="text-slate-500">BG:</span> {c.baiGiang}</span>
          <span><span className="text-slate-500">HL:</span> {c.hocLieu}</span>
        </div>
        <div className="mt-2 pt-2 border-t flex items-center justify-end text-xs text-slate-600">
          <Users className="h-3.5 w-3.5 mr-1" /> {c.hocSinh} học sinh
        </div>
      </div>

    </div>
  );
}

/* ============================ Create Class Modal ============================ */

function CreateClassModal({
  onClose, onSubmit, initial,
}: {
  onClose: () => void;
  onSubmit: (row: ClassRow) => void;
  initial?: ClassRow | null;
}) {
  const isEdit = !!initial;
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1
  const autoCode = useMemo(() => (initial ? `LH-${initial.id.slice(-6).toUpperCase()}` : `LH-${Date.now().toString().slice(-6)}`), [initial]);
  const [tenLop, setTenLop] = useState(initial?.name ?? "");
  const [ganLop, setGanLop] = useState(initial?.lop ?? "");
  const [moTa, setMoTa] = useState("");
  const [khoi, setKhoi] = useState("");
  const [mon, setMon] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | null>(initial?.thumb ?? null);


  // Step 2
  const [pickedClass, setPickedClass] = useState<string>(initial?.lop ?? "");
  const [selectedStudents, setSelectedStudents] = useState<Record<string, { name: string; code: string; lop: string }>>({});
  const [studentSearch, setStudentSearch] = useState("");

  // Khi user chọn "Gán lớp học" ở bước 1 → tự đồng bộ lớp và tick full học sinh
  useEffect(() => {
    if (!ganLop) return;
    setPickedClass(ganLop);
    const list = genStudents(ganLop);
    setSelectedStudents((prev) => {
      const next = { ...prev };
      list.forEach((s) => { next[s.id] = { name: s.name, code: s.code, lop: ganLop }; });
      return next;
    });
  }, [ganLop]);

  const students = pickedClass ? genStudents(pickedClass) : [];
  const filteredStudents = students.filter((s) => !studentSearch || s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.code.includes(studentSearch));
  const allSelected = filteredStudents.length > 0 && filteredStudents.every((s) => selectedStudents[s.id]);

  const toggleStudent = (s: { id: string; name: string; code: string }) => {
    setSelectedStudents((prev) => {
      const next = { ...prev };
      if (next[s.id]) delete next[s.id];
      else next[s.id] = { name: s.name, code: s.code, lop: pickedClass };
      return next;
    });
  };
  const toggleAll = () => {
    setSelectedStudents((prev) => {
      const next = { ...prev };
      if (allSelected) {
        filteredStudents.forEach((s) => delete next[s.id]);
      } else {
        filteredStudents.forEach((s) => { next[s.id] = { name: s.name, code: s.code, lop: pickedClass }; });
      }
      return next;
    });
  };

  const canNext = tenLop.trim().length > 0;
  const totalStudents = Object.keys(selectedStudents).length;

  const buildRow = (status: ClassStatus): ClassRow => ({
    id: generateId(),
    name: tenLop || "Lớp học mới",
    lop: ganLop || pickedClass || "—",
    subject: "Toán",
    baiGiang: 0,
    hocLieu: 0,
    hocSinh: totalStudents,
    thumb: coverUrl || thumbLop4A,
    status,
    userCreated: true,
  });

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setCoverUrl(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-slate-800">{isEdit ? "Sửa lớp học" : "Thêm lớp học mới"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-3">
            <StepDot index={1} label="Thông tin lớp" active={step === 1} done={step > 1} onClick={() => setStep(1)} />
            <div className={`h-0.5 flex-1 ${step > 1 ? "bg-indigo-500" : "bg-slate-200"}`} />
            <StepDot index={2} label="Danh sách học sinh" active={step === 2} done={false} onClick={() => canNext && setStep(2)} />
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {step === 1 ? (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Mã lớp" required>
                <input value={autoCode} readOnly className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600" />
              </Field>
              <Field label="Tên lớp" required>
                <input
                  value={tenLop}
                  onChange={(e) => setTenLop(e.target.value)}
                  placeholder="VD: Lớp 4A Năm học 2025 - 2026"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </Field>
              <Field label="Gán lớp học">
                <div className="relative">
                  <select
                    value={ganLop}
                    onChange={(e) => setGanLop(e.target.value)}
                    className="appearance-none w-full rounded-lg border border-slate-200 bg-white px-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="">-- Gán lớp học số với 1 lớp học thực tế --</option>
                    {TEACHER_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                <p className="mt-1 text-xs text-slate-500 italic">
                  Chọn khi bạn muốn đồng bộ các học liệu của lớp lên lịch báo giảng
                </p>
              </Field>

              <Field label="Mô tả">
                <input
                  value={moTa}
                  onChange={(e) => setMoTa(e.target.value)}
                  placeholder="Mô tả ngắn về lớp học"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </Field>
              <div className="col-span-2">
                <Field label="Ảnh nền">
                  <label className="flex items-center justify-center gap-2 h-32 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer text-slate-500 text-sm overflow-hidden">
                    {coverUrl ? (
                      <img src={coverUrl} alt="cover" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <ImagePlus className="h-5 w-5" /> Bấm để chọn ảnh nền cho lớp học
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={onPickImage} />
                  </label>
                </Field>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Field label="Chọn lớp" required>
                <div className="relative">
                  <select
                    value={pickedClass}
                    onChange={(e) => setPickedClass(e.target.value)}
                    className="appearance-none w-full rounded-lg border border-slate-200 bg-white px-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="">-- Chọn lớp học có học sinh bạn muốn thêm --</option>
                    {TEACHER_CLASSES.map((c) => <option key={c} value={c}>Lớp {c}</option>)}
                  </select>
                  <ChevronDown className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </Field>

              {pickedClass ? (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-800">Danh sách học sinh</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                        Sĩ số: {students.length}
                      </span>
                    </div>
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder="Tìm tên học sinh..."
                        className="pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white w-56 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-[50px_1fr_1fr_50px] px-4 py-2 text-xs font-semibold text-slate-500 uppercase border-b">
                    <div>STT</div>
                    <div>Họ và tên</div>
                    <div>Mã học sinh</div>
                    <div className="flex justify-end">
                      <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 accent-indigo-600" />
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y">
                    {filteredStudents.map((s, idx) => {
                      const checked = !!selectedStudents[s.id];
                      return (
                        <label
                          key={s.id}
                          className={`grid grid-cols-[50px_1fr_1fr_50px] items-center px-4 py-2.5 text-sm cursor-pointer hover:bg-slate-50 ${checked ? "bg-indigo-50/40" : ""}`}
                        >
                          <div className="text-slate-500">{String(idx + 1).padStart(2, "0")}</div>
                          <div className="text-slate-700">{s.name}</div>
                          <div className="text-slate-500">{s.code}</div>
                          <div className="flex justify-end">
                            <input type="checkbox" checked={checked} onChange={() => toggleStudent(s)} className="h-4 w-4 accent-indigo-600" />
                          </div>
                        </label>
                      );
                    })}
                    {filteredStudents.length === 0 && (
                      <div className="px-4 py-6 text-sm text-slate-500 text-center">Không có học sinh phù hợp.</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  Vui lòng chọn 1 lớp để hiển thị danh sách học sinh.
                </div>
              )}

              {totalStudents > 0 && (
                <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-2.5 text-sm text-indigo-700">
                  Đã chọn <b>{totalStudents}</b> học sinh (có thể chọn lẫn nhiều lớp khác nhau).
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-slate-50 flex items-center justify-between">
          <div>
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              >
                <ArrowLeft className="h-4 w-4" /> Quay lại
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {step === 1 ? (
              <>
                <button onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100">
                  Hủy
                </button>
                <button
                  onClick={() => canNext && setStep(2)}
                  disabled={!canNext}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Tiếp tục <ArrowRight className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onSubmit(buildRow("draft"))}
                  className="px-5 py-2 text-sm font-semibold rounded-lg border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
                >
                  Lưu nháp
                </button>
                <button
                  onClick={() => onSubmit(buildRow("deployed"))}
                  disabled={totalStudents === 0}
                  className="px-5 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={totalStudents === 0 ? "Cần chọn ít nhất 1 học sinh" : undefined}
                >
                  {isEdit ? "Cập nhật" : "Tạo lớp học"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function StepDot({ index, label, active, done, onClick }: { index: number; label: string; active: boolean; done: boolean; onClick: () => void }) {
  const color = active
    ? "bg-indigo-600 text-white border-indigo-600"
    : done
    ? "bg-emerald-500 text-white border-emerald-500"
    : "bg-white text-slate-500 border-slate-300";
  return (
    <button onClick={onClick} className="flex items-center gap-2">
      <span className={`h-7 w-7 rounded-full border-2 font-semibold text-sm flex items-center justify-center ${color}`}>
        {done ? <Check className="h-4 w-4" /> : index}
      </span>
      <span className={`text-sm font-semibold ${active ? "text-indigo-700" : done ? "text-emerald-600" : "text-slate-500"}`}>
        {label}
      </span>
    </button>
  );
}
