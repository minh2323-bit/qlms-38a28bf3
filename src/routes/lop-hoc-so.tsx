import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  GraduationCap, Presentation as PresentationIcon, Users, MoreVertical,
  LayoutGrid, List as ListIcon, Plus, Copy, Trash2, Search, ChevronDown,
  Calendar as CalendarIcon, SlidersHorizontal, X,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import thumbPhanSo from "@/assets/thumb-phan-so.jpg";
import thumbSoThapPhan from "@/assets/thumb-so-thap-phan.jpg";
import thumbHinhHoc from "@/assets/thumb-hinh-hoc.jpg";
import thumbDoLuong from "@/assets/thumb-do-luong.jpg";
import thumbPhanTram from "@/assets/thumb-phan-tram.jpg";
import thumbSoTuNhien from "@/assets/thumb-so-tu-nhien.jpg";
import thumbLop4A from "@/assets/thumb-lop-4a.jpg";
import thumbLop3D from "@/assets/thumb-lop-3d.jpg";
import thumbLop3A from "@/assets/thumb-lop-3a.jpg";
import thumbLop3B from "@/assets/thumb-lop-3b.jpg";
import thumbLop3C from "@/assets/thumb-lop-3c.jpg";
import thumbLop4B from "@/assets/thumb-lop-4b.jpg";
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


function DigitalClassesPage() {
  const [classView, setClassView] = useState<"grid" | "list">("grid");
  const [lessonView, setLessonView] = useState<"grid" | "list">("grid");
  const [tab, setTab] = useState<"classes" | "lessons">("classes");
  const [search, setSearch] = useState("");
  const [khoi, setKhoi] = useState("");
  const [mon, setMon] = useState("");
  const [lessonSearch, setLessonSearch] = useState("");
  const [lessonKhoi, setLessonKhoi] = useState("");
  const [lessonMon, setLessonMon] = useState("");
  const [lessonChuong, setLessonChuong] = useState("");
  const [lessonLoai, setLessonLoai] = useState("");
  const [lessonTrangThai, setLessonTrangThai] = useState("");
  const [lessonFromDate, setLessonFromDate] = useState("");
  const [lessonToDate, setLessonToDate] = useState("");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  const chapterOptions = (lessonKhoi && lessonMon) ? CHAPTERS[`${lessonKhoi}-${lessonMon}`] || [] : [];

  const filteredClasses = CLASSES.filter((c) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    const matchKhoi = !khoi || c.lop.includes(khoi);
    const matchMon = !mon || c.subject === mon;
    return matchSearch && matchKhoi && matchMon;
  });

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

  return (
    <AppShell>
      <>
        {/* Top stat cards */}
        <section className="grid grid-cols-3 gap-4">
          <StatCard color="emerald" label="Lớp học đã tạo" value={CLASSES.length} icon={<GraduationCap className="h-7 w-7 text-emerald-600" />} />
          <StatCard color="indigo" label="Bài giảng đã tạo" value={LESSONS.length} icon={<PresentationIcon className="h-7 w-7 text-indigo-600" />} />
          <StatCard color="slate" label="Tổng số học sinh tham dự" value={CLASSES.reduce((s, c) => s + c.hocSinh, 0)} icon={<Users className="h-7 w-7 text-slate-600" />} />
        </section>

        {/* Tabs */}
        <div className="border-b border-slate-200 flex items-center gap-6">
          <button
            onClick={() => setTab("classes")}
            className={`py-3 text-xl font-bold border-b-2 transition ${tab === "classes" ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            Lớp học của tôi
          </button>
          <button
            onClick={() => setTab("lessons")}
            className={`py-3 text-xl font-bold border-b-2 transition ${tab === "lessons" ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            Bài giảng
          </button>
        </div>

        {tab === "classes" && (
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
              {filteredClasses.map((c) => <ClassCard key={c.name} c={c} />)}
            </div>
          </section>
        )}

        {tab === "lessons" && (
          <section>
            {/* Filter bar */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div className="flex flex-col gap-2 flex-1 min-w-[300px]">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={lessonSearch}
                      onChange={(e) => setLessonSearch(e.target.value)}
                      placeholder="Tìm tên bài giảng"
                      className="pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white w-64 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <FilterSelect value={lessonKhoi} onChange={(v) => { setLessonKhoi(v); setLessonChuong(""); }} placeholder="Khối" options={["Lớp 3", "Lớp 4"]} />
                  <FilterSelect value={lessonMon} onChange={(v) => { setLessonMon(v); setLessonChuong(""); }} placeholder="Môn" options={["Toán"]} />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {chapterOptions.length > 0 && (
                    <FilterSelect value={lessonChuong} onChange={setLessonChuong} placeholder="Chương/Chủ đề" options={chapterOptions} />
                  )}
                  <FilterSelect value={lessonLoai} onChange={setLessonLoai} placeholder="Loại học liệu" options={LESSON_TYPES} />
                  <FilterSelect value={lessonTrangThai} onChange={setLessonTrangThai} placeholder="Trạng thái" options={LESSON_STATUSES} />
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-semibold px-5 py-3 rounded-xl shadow-md">
                  <Plus className="h-5 w-5" /> Thêm bài giảng mới
                </button>
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

            {lessonView === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <button className="border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 min-h-[280px] transition">
                  <Plus className="h-8 w-8" />
                  <span className="font-medium">Thêm bài giảng mới</span>
                </button>
                {filteredLessons.map((l) => <LessonCardView key={l.title + l.author} l={l} />)}
              </div>
            ) : (
              <LessonsTable lessons={filteredLessons} />
            )}
          </section>
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

function ClassCard({ c }: { c: ClassRow }) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition">
      <div className="h-28 bg-slate-100 overflow-hidden">
        <img src={c.thumb} alt={c.name} loading="lazy" className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-slate-800">{c.name}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded hover:bg-slate-100 text-slate-500">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer">
                <Copy className="h-4 w-4 mr-2 text-sky-500" /> Tạo bản sao
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-rose-600">
                <Trash2 className="h-4 w-4 mr-2" /> Xóa lớp học
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-y-1 text-sm text-slate-600">
          <div><span className="font-medium text-slate-500">Lớp:</span> {c.lop}</div>
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

function LessonCardView({ l }: { l: LessonCard }) {
  const canShare = l.approved && l.shared !== "hanoi";
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col hover:shadow-md transition">
      <div className="h-36 bg-slate-100 overflow-hidden">
        <img src={l.thumb} alt={l.title} loading="lazy" className="w-full h-full object-cover" />
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-800">{l.title}</h3>
          <button className="p-1 rounded hover:bg-slate-100 text-slate-500 shrink-0">
            <MoreVertical className="h-4 w-4" />
          </button>
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
          {l.shared === "noi-bo" && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">Chia sẻ nội bộ</span>
          )}
          {l.shared === "hanoi" && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">Đã chia sẻ Hanoi Study</span>
          )}
        </div>
        <button
          disabled={!canShare}
          className={`mt-3 w-full py-2 rounded-lg text-sm font-semibold transition ${
            canShare
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "bg-slate-200 text-slate-500 cursor-not-allowed"
          }`}
        >
          Chia sẻ lên Hanoi Study
        </button>
      </div>
    </div>
  );
}

function LessonsTable({ lessons }: { lessons: LessonCard[] }) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-x-auto">
      <table className="w-full text-base">
        <thead>
          <tr className="bg-indigo-700 text-white text-left">
            <th className="px-4 py-3 font-semibold w-14 text-center">STT</th>
            <th className="px-4 py-3 font-semibold">Tên bài giảng</th>
            <th className="px-4 py-3 font-semibold">Tác giả</th>
            <th className="px-4 py-3 font-semibold">Ngày phát hành</th>
            <th className="px-4 py-3 font-semibold text-center w-56">Chia sẻ lên HanoiStudy</th>
          </tr>
        </thead>
        <tbody>
          {lessons.map((l, i) => (
            <tr key={l.title + l.author} className={`border-t border-slate-200 ${i % 2 === 1 ? "bg-indigo-50/40" : "bg-white"}`}>
              <td className="px-4 py-4 text-center text-slate-700 font-semibold">{i + 1}</td>
              <td className="px-4 py-4">
                <div className="font-semibold text-slate-800">{l.title}</div>
                <div className="mt-1">
                  <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${l.approved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {l.approved ? "Đã duyệt" : "Chờ duyệt"}
                  </span>
                </div>
                <div className="mt-1 text-sm text-slate-600">{l.khoi}; {l.subject}</div>
              </td>
              <td className="px-4 py-4 text-slate-700">{l.author}</td>
              <td className="px-4 py-4 text-slate-700">{l.releaseDate}</td>
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
