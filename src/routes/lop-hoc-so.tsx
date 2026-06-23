import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  GraduationCap, Presentation as PresentationIcon, Users, MoreVertical,
  LayoutGrid, List as ListIcon, Plus, Copy, Trash2, Search, ChevronDown,
  CheckSquare, Check,
} from "lucide-react";
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

export const Route = createFileRoute("/lop-hoc-so")({
  head: () => ({
    meta: [
      { title: "Lớp học số – LMS Giáo viên | Tiểu học Tô Hiệu" },
      { name: "description", content: "Quản lý các lớp học số và bài giảng." },
    ],
  }),
  component: DigitalClassesPage,
});

type ClassRow = {
  name: string; lop: string; subject: string;
  baiGiang: number; hocLieu: number; hocSinh: number;
  thumb: string;
};

const CLASSES: ClassRow[] = [
  { name: "Lớp 4A năm học 2025 - 2026", lop: "4A", subject: "Toán", baiGiang: 15, hocLieu: 15, hocSinh: 40, thumb: thumbLop4A },
  { name: "Lớp 3D năm học 2025 - 2026", lop: "3D", subject: "Toán", baiGiang: 15, hocLieu: 15, hocSinh: 40, thumb: thumbLop3D },
  { name: "Lớp 3A năm học 2025 - 2026", lop: "3A", subject: "Toán", baiGiang: 12, hocLieu: 18, hocSinh: 38, thumb: thumbLop3A },
  { name: "Lớp 3B năm học 2025 - 2026", lop: "3B", subject: "Toán", baiGiang: 14, hocLieu: 16, hocSinh: 42, thumb: thumbLop3B },
  { name: "Lớp 3C năm học 2025 - 2026", lop: "3C", subject: "Toán", baiGiang: 13, hocLieu: 14, hocSinh: 39, thumb: thumbLop3C },
  { name: "Các bạn học sinh cần ôn tập đặc biệt", lop: "4B, 4C, 4D", subject: "Toán", baiGiang: 16, hocLieu: 17, hocSinh: 41, thumb: thumbLop4BReview },
  { name: "Lớp 4C năm học 2025 - 2026", lop: "4C", subject: "Toán", baiGiang: 15, hocLieu: 15, hocSinh: 40, thumb: thumbLop4C },
];

const TOTAL_LESSONS = 8;

function DigitalClassesPage() {
  const [classView, setClassView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [khoi, setKhoi] = useState("");
  const [mon, setMon] = useState("");
  const [classSelectMode, setClassSelectMode] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set());

  const toggleClassSel = (id: string) => setSelectedClasses((s) => {
    const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const exitClassSelect = () => { setClassSelectMode(false); setSelectedClasses(new Set()); };

  const filteredClasses = CLASSES.filter((c) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    const matchKhoi = !khoi || c.lop.includes(khoi);
    const matchMon = !mon || c.subject === mon;
    return matchSearch && matchKhoi && matchMon;
  });

  return (
    <AppShell>
      <>
        {/* Top stat cards */}
        <section className="grid grid-cols-3 gap-4">
          <StatCard color="emerald" label="Lớp học đã tạo" value={CLASSES.length} icon={<GraduationCap className="h-7 w-7 text-emerald-600" />} />
          <StatCard color="indigo" label="Bài giảng đã tạo" value={TOTAL_LESSONS} icon={<PresentationIcon className="h-7 w-7 text-indigo-600" />} />
          <StatCard color="slate" label="Tổng số học sinh tham dự" value={CLASSES.reduce((s, c) => s + c.hocSinh, 0)} icon={<Users className="h-7 w-7 text-slate-600" />} />
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
                  placeholder="Tìm tên học liệu"
                  className="pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white w-64 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <FilterSelect value={khoi} onChange={setKhoi} placeholder="Khối" options={["3", "4", "5"]} />
              <FilterSelect value={mon} onChange={setMon} placeholder="Môn" options={["Toán", "Tiếng Việt", "Tiếng Anh"]} />
            </div>
            <div className="flex flex-col items-end gap-2">
              <button className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-semibold px-5 py-3 rounded-xl shadow-md">
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

          <div className={classView === "grid" ? "grid grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
            {filteredClasses.map((c) => (
              <ClassCard
                key={c.name}
                c={c}
                selectMode={classSelectMode}
                selected={selectedClasses.has(c.name)}
                onToggleSelect={() => toggleClassSel(c.name)}
                onEnterSelect={() => { setClassSelectMode(true); toggleClassSel(c.name); }}
              />
            ))}
          </div>
        </section>
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

function ClassCard({ c, selectMode, selected, onToggleSelect, onEnterSelect }: { c: ClassRow } & SelectProps) {
  return (
    <div
      className={`relative bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition ${selected ? "ring-2 ring-indigo-500" : ""}`}
      onClick={selectMode ? onToggleSelect : undefined}
      role={selectMode ? "button" : undefined}
    >
      {selectMode && <SelectCircle selected={selected} onClick={onToggleSelect} />}
      <div className="h-28 bg-slate-100 overflow-hidden">
        <img src={c.thumb} alt={c.name} loading="lazy" className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-slate-800">{c.name}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button onClick={(e) => e.stopPropagation()} className="p-1 rounded hover:bg-slate-100 text-slate-500">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer" onClick={onEnterSelect}>
                <CheckSquare className="h-4 w-4 mr-2 text-indigo-500" /> Chọn nhiều
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Copy className="h-4 w-4 mr-2 text-sky-500" /> Tạo bản sao
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-rose-600">
                <Trash2 className="h-4 w-4 mr-2" /> Xóa lớp học
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-y-1 text-sm text-slate-600">
          <div><span className="font-medium text-slate-500">Khối/Lớp:</span> {c.lop}</div>
          <div><span className="font-medium text-slate-500">Môn:</span> {c.subject}</div>
          <div><span className="font-medium text-slate-500">Số bài giảng:</span> {c.baiGiang}</div>
          <div><span className="font-medium text-slate-500">Số học liệu:</span> {c.hocLieu}</div>
        </div>
        <div className="mt-3 pt-3 border-t flex items-center justify-end text-sm text-slate-600">
          <Users className="h-4 w-4 mr-1.5" /> {c.hocSinh} học sinh
        </div>
      </div>
    </div>
  );
}
