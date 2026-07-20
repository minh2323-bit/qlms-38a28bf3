import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Presentation as PresentationIcon, Users, MoreVertical,
  LayoutGrid, List as ListIcon, Plus, Copy, Trash2, Search, ChevronDown,
  Calendar as CalendarIcon, SlidersHorizontal, Share2, FileSpreadsheet, CheckSquare, Check,
  SquarePen, ChevronRight, FileText, Video, ClipboardList, Gamepad2, Pencil,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";


import thumbPhanSo from "@/assets/thumb-phan-so.jpg";
import thumbSoThapPhan from "@/assets/thumb-so-thap-phan.jpg";
import thumbHinhHoc from "@/assets/thumb-hinh-hoc.jpg";
import thumbDoLuong from "@/assets/thumb-do-luong.jpg";
import thumbPhanTram from "@/assets/thumb-phan-tram.jpg";
import thumbSoTuNhien from "@/assets/thumb-so-tu-nhien.jpg";

export const Route = createFileRoute("/hoc-lieu/bai-giang/")({
  head: () => ({
    meta: [
      { title: "Bài giảng – Học liệu & Bài kiểm tra | Tiểu học Tô Hiệu" },
      { name: "description", content: "Quản lý bài giảng và học liệu." },
    ],
  }),
  component: LessonsPage,
});

type LessonCard = {
  title: string; khoi: string; subject: string;
  author: string; classes: string;
  approved: boolean; shared: "noi-bo" | "hanoi" | "none";
  thumb: string;
  releaseDate: string;
  loai: string;
  chapter: string;
};

const LESSON_TYPES = ["Bài giảng điện tử", "Video", "Tài liệu"];
const LESSON_STATUSES = ["Đã duyệt", "Chờ duyệt"];

const CHAPTERS: Record<string, string[]> = {
  "Lớp 3-Toán": [
    "Chương 1: Số tự nhiên",
    "Chương 2: Các phép tính với số tự nhiên",
    "Chương 3: Phân số",
    "Chương 4: Các phép tính với phân số",
    "Chương 5: Hình học",
    "Chương 6: Đo lường",
  ],
  "Lớp 4-Toán": [
    "Chương 1: Số tự nhiên",
    "Chương 2: Bốn phép tính với số tự nhiên",
    "Chương 3: Số thập phân",
    "Chương 4: Các phép tính với số thập phân",
    "Chương 5: Tỉ số phần trăm",
    "Chương 6: Hình học",
  ],
};

const LESSONS: LessonCard[] = [
  { title: "Học về phân số", khoi: "Lớp 3", subject: "Toán", author: "Phùng Thúy Hằng", classes: "4A; 4B; 4C", approved: true, shared: "noi-bo", thumb: thumbPhanSo, releaseDate: "15/09/2025", loai: "Bài giảng điện tử", chapter: "Chương 3: Phân số" },
  { title: "Số thập phân và phép so sánh", khoi: "Lớp 3", subject: "Toán", author: "Phùng Thúy Hằng", classes: "4A; 4B; 4C", approved: false, shared: "none", thumb: thumbSoThapPhan, releaseDate: "22/09/2025", loai: "Bài giảng điện tử", chapter: "Chương 4: Các phép tính với phân số" },
  { title: "Hình học trực quan", khoi: "Lớp 3", subject: "Toán", author: "Hanoi Study (Nguyễn Văn A)", classes: "4A; 4B; 4C", approved: true, shared: "noi-bo", thumb: thumbHinhHoc, releaseDate: "05/10/2025", loai: "Video", chapter: "Chương 5: Hình học" },
  { title: "Đo lường và đơn vị đo", khoi: "Lớp 4", subject: "Toán", author: "Phùng Thúy Hằng", classes: "3A; 3B; 3C", approved: true, shared: "hanoi", thumb: thumbDoLuong, releaseDate: "12/10/2025", loai: "Tài liệu", chapter: "Chương 6: Đo lường" },
  { title: "Tỉ số phần trăm", khoi: "Lớp 4", subject: "Toán", author: "Trần Minh Khôi", classes: "4A; 4B", approved: true, shared: "noi-bo", thumb: thumbPhanTram, releaseDate: "19/10/2025", loai: "Bài giảng điện tử", chapter: "Chương 5: Tỉ số phần trăm" },
  { title: "Số tự nhiên và phép tính", khoi: "Lớp 3", subject: "Toán", author: "Phùng Thúy Hằng", classes: "3A; 3B; 3C; 3D", approved: false, shared: "none", thumb: thumbSoTuNhien, releaseDate: "28/10/2025", loai: "Bài giảng điện tử", chapter: "Chương 1: Số tự nhiên" },
  { title: "Làm tròn số thập phân", khoi: "Lớp 4", subject: "Toán", author: "Phùng Thúy Hằng", classes: "4A; 4B", approved: true, shared: "noi-bo", thumb: thumbSoThapPhan, releaseDate: "03/11/2025", loai: "Video", chapter: "Chương 3: Số thập phân" },
  { title: "Các phép tính với phân số", khoi: "Lớp 3", subject: "Toán", author: "Lê Thị Hoa", classes: "3A; 3D", approved: true, shared: "hanoi", thumb: thumbPhanSo, releaseDate: "10/11/2025", loai: "Bài giảng điện tử", chapter: "Chương 4: Các phép tính với phân số" },
];

function LessonsPage() {
  const [lessonView, setLessonView] = useState<"grid" | "list">("grid");
  const [lessonSearch, setLessonSearch] = useState("");
  const [lessonKhoi, setLessonKhoi] = useState("");
  const [lessonMon, setLessonMon] = useState("");
  const [lessonChuong, setLessonChuong] = useState("");
  const [lessonLoai, setLessonLoai] = useState("");
  const [lessonTrangThai, setLessonTrangThai] = useState("");
  const [lessonFromDate, setLessonFromDate] = useState("");
  const [lessonToDate, setLessonToDate] = useState("");
  const [filterOpen, setFilterOpen] = useState(true);
  const [lessonSelectMode, setLessonSelectMode] = useState(false);
  const [selectedLessons, setSelectedLessons] = useState<Set<string>>(new Set());
  const [addSourceOpen, setAddSourceOpen] = useState(false);
  const navigate = useNavigate();

  const toggleLessonSel = (id: string) => setSelectedLessons((s) => {
    const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const exitLessonSelect = () => { setLessonSelectMode(false); setSelectedLessons(new Set()); };

  const chapterOptions = (lessonKhoi && lessonMon) ? CHAPTERS[`${lessonKhoi}-${lessonMon}`] || [] : [];

  const parseDmy = (s: string) => {
    const [d, m, y] = s.split("/").map(Number);
    return new Date(y, m - 1, d).getTime();
  };
  const filteredLessons = LESSONS.filter((l) => {
    const matchSearch = !lessonSearch || l.title.toLowerCase().includes(lessonSearch.toLowerCase());
    const matchKhoi = !lessonKhoi || l.khoi === lessonKhoi;
    const matchMon = !lessonMon || l.subject === lessonMon;
    const matchChuong = !lessonChuong || l.chapter === lessonChuong;
    const matchLoai = !lessonLoai || l.loai === lessonLoai;
    const matchTrang = !lessonTrangThai || (lessonTrangThai === "Đã duyệt" ? l.approved : !l.approved);
    const lessonTs = parseDmy(l.releaseDate);
    const matchFrom = !lessonFromDate || lessonTs >= new Date(lessonFromDate).getTime();
    const matchTo = !lessonToDate || lessonTs <= new Date(lessonToDate).getTime();
    return matchSearch && matchKhoi && matchMon && matchChuong && matchLoai && matchTrang && matchFrom && matchTo;
  });

  const activeFilterCount = [lessonKhoi, lessonMon, lessonLoai, lessonTrangThai, lessonFromDate || lessonToDate ? "1" : ""].filter(Boolean).length;
  const resetLessonFilters = () => {
    setLessonKhoi(""); setLessonMon(""); setLessonChuong("");
    setLessonLoai(""); setLessonTrangThai("");
    setLessonFromDate(""); setLessonToDate("");
  };

  const approvedCount = LESSONS.filter((l) => l.approved).length;
  const pendingCount = LESSONS.length - approvedCount;

  return (
    <AppShell>
      <>
        {/* Top stat cards */}
        <section className="grid grid-cols-3 gap-4">
          <StatCard color="indigo" label="Bài giảng đã tạo" value={LESSONS.length} icon={<PresentationIcon className="h-7 w-7 text-indigo-600" />} />
          <StatCard color="emerald" label="Đã duyệt" value={approvedCount} icon={<Check className="h-7 w-7 text-emerald-600" />} />
          <StatCard color="amber" label="Chờ duyệt" value={pendingCount} icon={<ClipboardList className="h-7 w-7 text-amber-600" />} />
        </section>

        <section>
          {/* Top action row */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={lessonSearch}
                  onChange={(e) => setLessonSearch(e.target.value)}
                  placeholder="Tìm tên bài giảng"
                  className="pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white w-64 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <button
                onClick={() => setFilterOpen((v) => !v)}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border transition ${filterOpen ? "bg-indigo-100 border-indigo-300 text-indigo-700" : "bg-white border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700"}`}
              >
                <SlidersHorizontal className="h-4 w-4" /> Bộ lọc
                {activeFilterCount > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-indigo-600 text-white text-xs">{activeFilterCount}</span>
                )}
              </button>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                {lessonSelectMode && (
                  <>
                    <span className="text-sm text-slate-600 mr-1">Đã chọn <b className="text-indigo-700">{selectedLessons.size}</b></span>
                    <button onClick={exitLessonSelect} className="px-3 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">Hủy</button>
                  </>
                )}
                <button className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm disabled:opacity-50" disabled={lessonSelectMode && selectedLessons.size === 0}>
                  <Share2 className="h-4 w-4" /> Chia sẻ
                </button>
                <button className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm disabled:opacity-50" disabled={lessonSelectMode && selectedLessons.size === 0}>
                  <Trash2 className="h-4 w-4" /> Xóa bài giảng
                </button>
                <button className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm">
                  <FileSpreadsheet className="h-4 w-4" /> Xuất excel
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLessonView("list")}
                  className={`px-2 py-1.5 rounded-md border text-xs flex items-center gap-1 ${lessonView === "list" ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "bg-white border-slate-200 text-slate-600"}`}
                >
                  <ListIcon className="h-3.5 w-3.5" /> List view
                </button>
                <button
                  onClick={() => setLessonView("grid")}
                  className={`px-2 py-1.5 rounded-md border text-xs flex items-center gap-1 ${lessonView === "grid" ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "bg-white border-slate-200 text-slate-600"}`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" /> Grid
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-5 items-start">
            {/* Sidebar: Bộ lọc (toggle) */}
            {filterOpen && (
              <aside className="w-[240px] shrink-0 rounded-2xl border border-indigo-100 bg-white p-4 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-800">Bộ lọc</h3>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={resetLessonFilters}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Xóa lọc
                    </button>
                  )}
                </div>
                <PanelField label="Khối">
                  <PanelSelect value={lessonKhoi} onChange={(v) => { setLessonKhoi(v); setLessonChuong(""); }} placeholder="Tất cả" options={["Lớp 3", "Lớp 4"]} />
                </PanelField>
                <PanelField label="Môn">
                  <PanelSelect value={lessonMon} onChange={(v) => { setLessonMon(v); setLessonChuong(""); }} placeholder="Tất cả" options={["Toán"]} />
                </PanelField>
                {chapterOptions.length > 0 && (
                  <PanelField label="Chương/Chủ đề">
                    <PanelSelect value={lessonChuong} onChange={setLessonChuong} placeholder="Tất cả" options={chapterOptions} />
                  </PanelField>
                )}
                <PanelField label="Loại học liệu">
                  <PanelSelect value={lessonLoai} onChange={setLessonLoai} placeholder="Tất cả" options={LESSON_TYPES} />
                </PanelField>
                <PanelField label="Trạng thái">
                  <PanelSelect value={lessonTrangThai} onChange={setLessonTrangThai} placeholder="Tất cả" options={LESSON_STATUSES} />
                </PanelField>
                <PanelField label="Ngày phát hành">
                  <div className="rounded-lg border border-slate-200 bg-white px-2 py-2 flex items-center gap-1 hover:border-indigo-300 hover:bg-indigo-50/40 transition">
                    <input
                      type="date"
                      value={lessonFromDate}
                      onChange={(e) => setLessonFromDate(e.target.value)}
                      className="flex-1 min-w-0 text-xs text-slate-700 focus:outline-none bg-transparent"
                    />
                    <span className="text-slate-400 text-xs">-</span>
                    <input
                      type="date"
                      value={lessonToDate}
                      onChange={(e) => setLessonToDate(e.target.value)}
                      className="flex-1 min-w-0 text-xs text-slate-700 focus:outline-none bg-transparent"
                    />
                    <CalendarIcon className="h-4 w-4 text-slate-400 shrink-0" />
                  </div>
                </PanelField>
              </aside>
            )}

            {/* Lessons content */}
            <div className="flex-1 min-w-0">
              {lessonView === "grid" ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setAddSourceOpen(true)}
                    className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-4 text-center transition hover:border-indigo-400 hover:bg-indigo-50/40 min-h-[220px]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm transition group-hover:scale-105">
                      <Plus className="h-6 w-6 text-indigo-600" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-700">Thêm bài giảng mới</p>
                  </button>


                  {filteredLessons.map((l) => (
                    <LessonCardView
                      key={l.title + l.author}
                      l={l}
                      selectMode={lessonSelectMode}
                      selected={selectedLessons.has(l.title + l.author)}
                      onToggleSelect={() => toggleLessonSel(l.title + l.author)}
                      onEnterSelect={() => { setLessonSelectMode(true); toggleLessonSel(l.title + l.author); }}
                    />
                  ))}
                </div>
              ) : (
                <LessonsTable
                  lessons={filteredLessons}
                  selectMode={lessonSelectMode}
                  selected={selectedLessons}
                  onToggle={(id) => toggleLessonSel(id)}
                  onToggleAll={() => {
                    const ids = filteredLessons.map((l) => l.title + l.author);
                    const allSelected = ids.every((id) => selectedLessons.has(id));
                    setLessonSelectMode(true);
                    setSelectedLessons(allSelected ? new Set() : new Set(ids));
                  }}
                />
              )}
            </div>
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

function PanelField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-700">{label}</label>
      {children}
    </div>
  );
}

function PanelSelect({ value, onChange, placeholder, options }: { value: string; onChange: (v: string) => void; placeholder: string; options: string[] }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none pl-3 pr-9 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-indigo-50/60 hover:border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}

type StatColor = "emerald" | "indigo" | "slate" | "amber";
function StatCard({ color, label, value, icon }: { color: StatColor; label: string; value: number; icon: React.ReactNode }) {
  const accent = {
    emerald: "border-l-emerald-500",
    indigo: "border-l-indigo-600",
    slate: "border-l-slate-400",
    amber: "border-l-amber-500",
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

export function slugifyLesson(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function LessonCardView({ l, selectMode, selected, onToggleSelect, onEnterSelect }: { l: LessonCard } & SelectProps) {
  const navigate = useNavigate();
  const [shareState, setShareState] = useState<"noi-bo" | "hanoi" | "none">(l.shared);
  const canShare = l.approved && shareState !== "hanoi";
  const isShared = shareState === "hanoi";
  const slug = slugifyLesson(l.title);
  const handleCardClick = (e: React.MouseEvent) => {
    if (selectMode) { onToggleSelect(); return; }
    const target = e.target as HTMLElement;
    if (target.closest("button, a")) return;
    (e.currentTarget.querySelector("[data-lesson-link]") as HTMLAnchorElement | null)?.click();
  };
  const handleEdit = () => {
    navigate({
      to: "/hoc-lieu/bai-giang/tao-moi",
      search: { edit: slug, title: l.title, khoi: l.khoi, mon: l.subject },
    });
  };
  return (
    <div
      className={`relative bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col hover:shadow-md transition cursor-pointer ${selected ? "ring-2 ring-indigo-500" : ""}`}
      onClick={handleCardClick}
      role="button"
    >
      {selectMode && <SelectCircle selected={selected} onClick={onToggleSelect} />}
      <div className="h-28 bg-slate-100 overflow-hidden">
        <img src={l.thumb} alt={l.title} loading="lazy" className="w-full h-full object-cover" />
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link
            data-lesson-link
            to="/hoc-lieu/bai-giang/$lessonSlug"
            params={{ lessonSlug: slug }}
            className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2 hover:text-indigo-700"
          >
            {l.title}
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button onClick={(e) => e.stopPropagation()} className="p-1 rounded hover:bg-slate-100 text-slate-500 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer" onClick={onEnterSelect}>
                <CheckSquare className="h-4 w-4 mr-2 text-indigo-500" /> Chọn nhiều
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={handleEdit}>
                <Pencil className="h-4 w-4 mr-2 text-emerald-500" /> Sửa
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Copy className="h-4 w-4 mr-2 text-sky-500" /> Tạo bản sao
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-rose-600">
                <Trash2 className="h-4 w-4 mr-2" /> Xóa bài giảng
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-y-1 text-xs text-slate-600">
          <div><span className="text-slate-500">Khối:</span> {l.khoi}</div>
          <div><span className="text-slate-500">Môn:</span> {l.subject}</div>
        </div>
        <p className="mt-1 text-xs text-slate-600"><span className="text-slate-500">Tác giả:</span> {l.author}</p>
        <p className="text-xs text-slate-600"><span className="text-slate-500">Danh sách lớp gán:</span> {l.classes}</p>
        <p className="text-xs text-slate-600"><span className="text-slate-500">Ngày phát hành:</span> {l.releaseDate}</p>
        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-500">Trạng thái:</span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${l.approved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
            {l.approved ? "Đã duyệt" : "Chờ duyệt"}
          </span>
          {shareState === "noi-bo" && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">Chia sẻ nội bộ</span>
          )}
          {shareState === "hanoi" && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">Đã chia sẻ Hanoi Study</span>
          )}
        </div>
        {isShared ? (
          <div className="mt-3 space-y-1.5">
            <div className="text-center text-xs font-semibold text-slate-500">Chờ Sở Duyệt</div>
            <button
              onClick={(e) => { e.stopPropagation(); setShareState("noi-bo"); }}
              className="w-full py-2 rounded-lg text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition"
            >
              Thu hồi
            </button>
          </div>
        ) : (
          <button
            disabled={!canShare}
            onClick={(e) => { e.stopPropagation(); if (canShare) setShareState("hanoi"); }}
            className={`mt-3 w-full py-2 rounded-lg text-sm font-semibold transition ${
              canShare
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-slate-200 text-slate-500 cursor-not-allowed"
            }`}
          >
            Chia sẻ lên Hanoi Study
          </button>
        )}
      </div>
    </div>
  );
}


type LessonTopic = { name: string; items: string[] };
type LessonContent = { topics: LessonTopic[]; materials: string[]; quizzes: string[] };

function buildLessonContent(l: LessonCard): LessonContent {
  return {
    topics: [
      { name: "Khởi động", items: [`Video mở đầu - ${l.title}`, `Slide dẫn nhập - ${l.title}`] },
      { name: "Hình thành kiến thức", items: [`Bài giảng chính - ${l.title}`, `Tài liệu lý thuyết - ${l.title}`, `Video minh họa - ${l.title}`] },
      { name: "Luyện tập", items: [`Phiếu bài tập - ${l.title}`, `Trò chơi tương tác - ${l.title}`] },
    ],
    materials: [`Tài liệu tham khảo - ${l.title}`, `Slide tổng kết - ${l.title}`],
    quizzes: [`Bài kiểm tra 15 phút - ${l.title}`],
  };
}

function getMaterialMeta(item: string) {
  const lower = item.toLowerCase();
  if (lower.includes("video")) return { icon: Video, label: "Video", color: "text-rose-600" };
  if (lower.includes("slide") || lower.includes("bài giảng chính")) return { icon: PresentationIcon, label: "Slide / Bài giảng", color: "text-indigo-600" };
  if (lower.includes("bài kiểm tra") || lower.includes("kiểm tra")) return { icon: ClipboardList, label: "Bài kiểm tra", color: "text-amber-600" };
  if (lower.includes("trò chơi") || lower.includes("game")) return { icon: Gamepad2, label: "Trò chơi tương tác", color: "text-violet-600" };
  return { icon: FileText, label: "Tài liệu", color: "text-sky-600" };
}

function MaterialItem({ item }: { item: string }) {
  const { icon: Icon, label, color } = getMaterialMeta(item);
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1.5 text-sm text-slate-700 hover:text-slate-900 cursor-help">
            <Icon className={`h-4 w-4 shrink-0 ${color}`} />
            {item}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p><span className="font-semibold">{label}:</span> {item}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function LessonsTable({
  lessons, selectMode, selected, onToggle, onToggleAll,
}: {
  lessons: LessonCard[];
  selectMode: boolean;
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggleExpand = (key: string) => setExpanded((s) => {
    const n = new Set(s); n.has(key) ? n.delete(key) : n.add(key); return n;
  });

  const allIds = lessons.map((l) => l.title + l.author);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-x-auto">
      <table className="w-full text-base">
        <thead>
          <tr className="bg-indigo-700 text-white text-left">
            <th className="px-3 py-3 font-semibold w-14 text-center">STT</th>
            <th className="px-3 py-3 font-semibold w-12 text-center">
              <button
                onClick={onToggleAll}
                className={`h-5 w-5 rounded border-2 flex items-center justify-center mx-auto ${allSelected ? "bg-white border-white" : "border-white/80 bg-transparent"}`}
                aria-label="Chọn tất cả"
              >
                {allSelected && <Check className="h-3.5 w-3.5 text-indigo-700" />}
              </button>
            </th>
            <th className="px-3 py-3 font-semibold w-14 text-center">Sửa</th>
            <th className="px-4 py-3 font-semibold">Tên bài giảng</th>
            <th className="px-4 py-3 font-semibold">Tác giả</th>
            <th className="px-4 py-3 font-semibold whitespace-nowrap">Ngày phát hành</th>
            <th className="px-4 py-3 font-semibold min-w-[280px]">Học liệu</th>
            <th className="px-4 py-3 font-semibold text-center w-56">Chia sẻ lên HanoiStudy</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-slate-200 bg-white">
            <td colSpan={8} className="px-4 py-5">
              <Link
                to="/hoc-lieu/bai-giang/tao-moi"
                className="mx-auto flex flex-col items-center justify-center gap-1.5 group w-fit"
              >
                <span className="h-11 w-11 rounded-full bg-sky-100 border-2 border-sky-300 flex items-center justify-center text-sky-500 group-hover:bg-sky-200 transition">
                  <Plus className="h-6 w-6" strokeWidth={2.5} />
                </span>
                <span className="text-sm font-medium text-sky-600">Thêm bài giảng mới</span>
              </Link>
            </td>
          </tr>
          {lessons.map((l, i) => {
            const id = l.title + l.author;
            const isSel = selected.has(id);
            const content = buildLessonContent(l);
            return (
              <tr key={id} className={`border-t border-slate-200 align-top ${isSel ? "bg-indigo-50" : i % 2 === 1 ? "bg-indigo-50/40" : "bg-white"}`}>
                <td className="px-3 py-4 text-center text-slate-700 font-semibold">{i + 1}</td>
                <td className="px-3 py-4 text-center">
                  <button
                    onClick={() => onToggle(id)}
                    className={`h-5 w-5 rounded border-2 flex items-center justify-center mx-auto transition ${isSel ? "bg-indigo-600 border-indigo-600" : "border-slate-300 bg-white hover:border-indigo-400"}`}
                    aria-label="Chọn"
                  >
                    {isSel && <Check className="h-3.5 w-3.5 text-white" />}
                  </button>
                </td>
                <td className="px-3 py-4 text-center">
                  <button className="h-8 w-8 rounded-md border border-slate-200 bg-white text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 inline-flex items-center justify-center" aria-label="Sửa">
                    <SquarePen className="h-4 w-4" />
                  </button>
                </td>
                <td className="px-4 py-4">
                  <Link to="/hoc-lieu/bai-giang/$lessonSlug" params={{ lessonSlug: slugifyLesson(l.title) }} className="font-semibold text-slate-800 hover:text-indigo-700">{l.title}</Link>
                  <div className="mt-1">
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${l.approved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {l.approved ? "Đã duyệt" : "Chờ duyệt"}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-slate-600">{l.khoi}; {l.subject}</div>
                </td>
                <td className="px-4 py-4 text-slate-700">{l.author}</td>
                <td className="px-4 py-4 text-slate-700 whitespace-nowrap">{l.releaseDate}</td>
                <td className="px-4 py-4">
                  <ul className="space-y-1.5">
                    {content.topics.map((t) => {
                      const key = id + "::" + t.name;
                      const open = expanded.has(key);
                      return (
                        <li key={t.name} className="list-none">
                          <button
                            onClick={() => toggleExpand(key)}
                            className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 hover:text-indigo-700"
                          >
                            <ChevronRight className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`} />
                            {t.name}
                          </button>
                          {open && (
                            <div className="ml-6 mt-1.5 mb-1 flex flex-wrap gap-1.5">
                              {t.items.map((it) => (
                                <MaterialItem key={it} item={it} />
                              ))}
                            </div>
                          )}
                        </li>
                      );
                    })}
                    {content.materials.map((m) => (
                      <li key={m} className="ml-5 list-none flex flex-wrap gap-1.5">
                        <MaterialItem item={m} />
                      </li>
                    ))}
                    {content.quizzes.map((q) => (
                      <li key={q} className="ml-5 list-none flex flex-wrap gap-1.5">
                        <MaterialItem item={q} />
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-4 py-4 text-center">
                  {l.shared === "hanoi" ? (
                    <span className="text-emerald-600 font-semibold">Sở Đã Duyệt</span>
                  ) : (
                    <button
                      disabled={!l.approved}
                      className={`px-5 py-2 rounded-lg text-sm font-semibold ${l.approved ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-slate-200 text-slate-500 cursor-not-allowed"}`}
                    >
                      Chia sẻ
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
