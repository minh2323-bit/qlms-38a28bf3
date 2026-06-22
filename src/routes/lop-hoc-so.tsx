import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  GraduationCap, Presentation as PresentationIcon, Users, MoreVertical,
  LayoutGrid, List as ListIcon, Plus, Copy, Trash2,
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
  { name: "Lớp 4B năm học 2025 - 2026", lop: "4B", subject: "Toán", baiGiang: 16, hocLieu: 17, hocSinh: 41, thumb: thumbLop4B },
  { name: "Lớp 4C năm học 2025 - 2026", lop: "4C", subject: "Toán", baiGiang: 15, hocLieu: 15, hocSinh: 40, thumb: thumbLop4C },
];

type LessonCard = {
  title: string; khoi: string; subject: string;
  author: string; classes: string;
  approved: boolean; shared: "noi-bo" | "hanoi" | "none";
  thumb: string;
};

const LESSONS: LessonCard[] = [
  { title: "Học về phân số", khoi: "Lớp 3", subject: "Toán", author: "Phùng Thúy Hằng", classes: "4A; 4B; 4C", approved: true, shared: "noi-bo", thumb: thumbPhanSo },
  { title: "Số thập phân và phép so sánh", khoi: "Lớp 3", subject: "Toán", author: "Phùng Thúy Hằng", classes: "4A; 4B; 4C", approved: false, shared: "none", thumb: thumbSoThapPhan },
  { title: "Hình học trực quan", khoi: "Lớp 3", subject: "Toán", author: "Hanoi Study (Nguyễn Văn A)", classes: "4A; 4B; 4C", approved: true, shared: "noi-bo", thumb: thumbHinhHoc },
  { title: "Đo lường và đơn vị đo", khoi: "Lớp 4", subject: "Toán", author: "Phùng Thúy Hằng", classes: "3A; 3B; 3C", approved: true, shared: "hanoi", thumb: thumbDoLuong },
  { title: "Tỉ số phần trăm", khoi: "Lớp 4", subject: "Toán", author: "Trần Minh Khôi", classes: "4A; 4B", approved: true, shared: "noi-bo", thumb: thumbPhanTram },
  { title: "Số tự nhiên và phép tính", khoi: "Lớp 3", subject: "Toán", author: "Phùng Thúy Hằng", classes: "3A; 3B; 3C; 3D", approved: false, shared: "none", thumb: thumbSoTuNhien },
  { title: "Làm tròn số thập phân", khoi: "Lớp 4", subject: "Toán", author: "Phùng Thúy Hằng", classes: "4A; 4B", approved: true, shared: "noi-bo", thumb: thumbSoThapPhan },
  { title: "Các phép tính với phân số", khoi: "Lớp 3", subject: "Toán", author: "Lê Thị Hoa", classes: "3A; 3D", approved: true, shared: "hanoi", thumb: thumbPhanSo },
];

function DigitalClassesPage() {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <AppShell>
      <>
        {/* Top stat cards */}
        <section className="grid grid-cols-3 gap-4">
          <StatCard color="emerald" label="Lớp học đã tạo" value={CLASSES.length} icon={<GraduationCap className="h-7 w-7 text-emerald-600" />} />
          <StatCard color="indigo" label="Bài giảng đã tạo" value={LESSONS.length} icon={<PresentationIcon className="h-7 w-7 text-indigo-600" />} />
          <StatCard color="slate" label="Tổng số học sinh tham dự" value={CLASSES.reduce((s, c) => s + c.hocSinh, 0)} icon={<Users className="h-7 w-7 text-slate-600" />} />
        </section>

        {/* My classes */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-800">Lớp học của tôi</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView("list")}
                className={`px-2 py-1.5 rounded-md border text-xs flex items-center gap-1 ${view === "list" ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "bg-white border-slate-200 text-slate-600"}`}
              >
                <ListIcon className="h-3.5 w-3.5" /> List view
              </button>
              <button
                onClick={() => setView("grid")}
                className={`px-2 py-1.5 rounded-md border text-xs flex items-center gap-1 ${view === "grid" ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "bg-white border-slate-200 text-slate-600"}`}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Grid
              </button>
            </div>
          </div>
          <div className={view === "grid" ? "grid grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
            {CLASSES.map((c) => <ClassCard key={c.name} c={c} />)}
          </div>
        </section>

        {/* Lessons */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">Bài giảng</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {LESSONS.map((l) => <LessonCardView key={l.title + l.author} l={l} />)}
            <button className="border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 min-h-[280px] transition">
              <Plus className="h-8 w-8" />
              <span className="font-medium">Thêm bài giảng mới</span>
            </button>
          </div>
        </section>
      </>
    </AppShell>
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
      <div className="h-28 bg-gradient-to-br from-indigo-100 via-violet-100 to-rose-100 flex items-center justify-center">
        <GraduationCap className="h-14 w-14 text-white/80 drop-shadow" />
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
        <p className="text-xs text-slate-600"><span className="text-slate-500">Chương/Chủ đề:</span></p>
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
