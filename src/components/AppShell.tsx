import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  Home, BookOpen, FolderKanban, BarChart3, GraduationCap, Settings,
  Bell, Library, BookOpenCheck, ListChecks, Users, Trophy, TrendingUp,
  ClipboardList, Video, School, Landmark,
  Grid3x3, FileCheck2, BookMarked, UserCog, UsersRound, SlidersHorizontal, Brain, Tag, HardDrive, Star,
  ChevronDown, Sparkles, Route as RouteIcon, BookOpen as BookOpenIcon,
  CalendarDays, Share2, Database, FileBarChart, ShieldCheck, CalendarRange,
} from "lucide-react";
import teacherAvatar from "@/assets/teacher-avatar.jpg";
import studentAvatar from "@/assets/student-avatar.jpg";
import principalAvatar from "@/assets/principal-avatar.jpg";
import qlmsLogo from "@/assets/qlms-logo.png";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type SubItem = { icon: typeof Home; label: string; to?: string; highlight?: boolean; search?: Record<string, unknown> };
type NavItem = {
  icon: typeof Home;
  label: string;
  to?: string;
  submenu?: SubItem[];
};

const TEACHER_NAV: NavItem[] = [
  { icon: Home, label: "Trang chủ", to: "/" },
  {
    icon: GraduationCap,
    label: "Hoạt động\ngiảng dạy",
    to: "/lop-hoc-so",
    submenu: [
      { icon: School, label: "Lớp học của tôi", to: "/lop-hoc-so" },
      { icon: BookMarked, label: "Bài giảng", to: "/hoc-lieu/bai-giang" },
      { icon: ClipboardList, label: "Bài tập, nhiệm vụ", to: "/giao-bai-tap" },
      { icon: Video, label: "Lớp học trực tuyến", to: "/lop-truc-tuyen" },
    ],
  },
  {
    icon: BookOpen,
    label: "Học liệu\n& Bài kiểm tra",
    submenu: [
      { icon: Tag, label: "Học liệu bản quyền", to: "/hoc-lieu/ban-quyen", highlight: true },
      { icon: Library, label: "Kho học liệu của tôi", to: "/hoc-lieu/kho-hoc-lieu" },
      { icon: UsersRound, label: "Học liệu chia sẻ nội bộ" },
      { icon: BookOpenCheck, label: "Ngân hàng câu hỏi", to: "/hoc-lieu/ngan-hang-cau-hoi" },
      { icon: ListChecks, label: "Đề & Bài kiểm tra", to: "/hoc-lieu/de-kiem-tra" },

    ],
  },
  {
    icon: FolderKanban,
    label: "Kỳ thi",
    submenu: [
      { icon: Landmark, label: "Kỳ thi chính thức", to: "/ky-thi/chinh-thuc" },
      { icon: School, label: "Kỳ thi ôn tập", to: "/ky-thi/on-tap" },

      { icon: BookOpenCheck, label: "Ngân hàng câu hỏi kỳ thi", to: "/ky-thi/ngan-hang-cau-hoi" },
      { icon: FileCheck2, label: "Đề thi kỳ thi", to: "/ky-thi/de-thi" },


    ],
  },
  {
    icon: BarChart3,
    label: "Thống kê\n& Báo cáo",
    submenu: [
      { icon: TrendingUp, label: "Thống kê", to: "/thong-ke" },
      { icon: BarChart3, label: "Báo cáo" },
    ],
  },
  {
    icon: Settings,
    label: "Hệ thống",
    submenu: [
      { icon: BookOpen, label: "Danh mục", to: "/he-thong/danh-muc" },
      { icon: HardDrive, label: "Quản lý dung lượng", to: "/he-thong/quan-ly-dung-luong" },
      { icon: HardDrive, label: "Dung lượng bộ nhớ cá nhân", to: "/he-thong/dung-luong-ca-nhan" },
    ],
  },
];

const STUDENT_NAV: NavItem[] = [
  { icon: Home, label: "Trang chủ", to: "/hoc-sinh" },
  {
    icon: GraduationCap,
    label: "Hoạt động\nhọc tập",
    submenu: [
      { icon: BookMarked, label: "Lớp học / Bài giảng", to: "/hoc-sinh/lop-bai-giang" },
      { icon: ClipboardList, label: "Nhiệm vụ, bài tập", to: "/hoc-sinh/nhiem-vu" },
      { icon: Video, label: "Lớp học trực tuyến", to: "/hoc-sinh/lop-truc-tuyen" },
    ],
  },
  { icon: Sparkles, label: "Học liệu\ntự ôn tập", to: "/hoc-sinh/hoc-lieu" },
  {
    icon: FolderKanban,
    label: "Kỳ thi",
    submenu: [
      { icon: Landmark, label: "Kỳ thi chính thức", to: "/hoc-sinh/ky-thi-chinh-thuc" },
      { icon: BookOpenIcon, label: "Kỳ thi ôn tập", to: "/hoc-sinh/ky-thi-on-tap" },
    ],
  },
  {
    icon: RouteIcon,
    label: "Lộ trình\nhọc tập",
    submenu: [
      { icon: ClipboardList, label: "Lịch sử học tập", to: "/hoc-sinh/lich-su-hoc-tap" },
      { icon: TrendingUp, label: "Thống kê hoạt động", to: "/hoc-sinh/thong-ke-hoat-dong" },
      { icon: Sparkles, label: "Cá nhân hóa lộ trình", to: "/hoc-sinh/lo-trinh" },
    ],
  },
];

const PRINCIPAL_NAV: NavItem[] = [
  { icon: Home, label: "Trang chủ", to: "/hieu-truong" },
  {
    icon: GraduationCap,
    label: "Hoạt động\ngiảng dạy",
    submenu: [
      { icon: CalendarDays, label: "Lịch báo giảng", to: "/hieu-truong/lich-bao-giang" },
      { icon: School, label: "Lớp học của tôi", to: "/lop-hoc-so" },
      { icon: BookMarked, label: "Bài giảng", to: "/hoc-lieu/bai-giang" },
      { icon: Library, label: "Kho học liệu của tôi", to: "/hoc-lieu/kho-hoc-lieu" },
      { icon: ClipboardList, label: "Nhiệm vụ, bài tập", to: "/giao-bai-tap" },
    ],
  },
  {
    icon: BookOpen,
    label: "Học liệu",
    submenu: [
      { icon: Tag, label: "Học liệu bản quyền", to: "/hoc-lieu/ban-quyen", highlight: true },
      { icon: Library, label: "Học liệu của tôi", to: "/hoc-lieu/kho-hoc-lieu" },
      { icon: BookOpenCheck, label: "Ngân hàng câu hỏi", to: "/hoc-lieu/ngan-hang-cau-hoi" },
      { icon: ListChecks, label: "Đề & Bài kiểm tra", to: "/hoc-lieu/de-kiem-tra" },
    ],
  },
  {
    icon: Share2,
    label: "Chia sẻ\nhọc liệu",
    submenu: [
      { icon: Library, label: "Kho học liệu chia sẻ" },
      { icon: UsersRound, label: "Học liệu chia sẻ" },
    ],
  },
  { icon: CalendarRange, label: "Thời khóa\nbiểu trường", to: "/hieu-truong/thoi-khoa-bieu" },
  {
    icon: FolderKanban,
    label: "Kỳ thi",
    submenu: [
      { icon: Landmark, label: "Kỳ thi chính thức", to: "/ky-thi/chinh-thuc" },
      { icon: School, label: "Kỳ thi ôn tập", to: "/ky-thi/on-tap" },
      { icon: BookOpenCheck, label: "Ngân hàng câu hỏi", to: "/ky-thi/ngan-hang-cau-hoi" },
      { icon: FileCheck2, label: "Đề thi và ma trận đề", to: "/ky-thi/de-thi" },
    ],
  },
  {
    icon: BarChart3,
    label: "Thống kê\n& Báo cáo",
    submenu: [
      { icon: TrendingUp, label: "Thống kê của trường", to: "/hieu-truong/thong-ke-truong" },
      { icon: BarChart3, label: "Hoạt động giảng dạy cá nhân", to: "/hieu-truong/hoat-dong-ca-nhan" },
      { icon: FileBarChart, label: "Báo cáo DTI", to: "/hieu-truong/bao-cao-dti" },
    ],
  },
  {
    icon: Settings,
    label: "Hệ thống",
    submenu: [
      { icon: BookOpen, label: "Danh mục", to: "/he-thong/danh-muc" },
      { icon: SlidersHorizontal, label: "Cấu hình hệ thống" },
      { icon: Users, label: "Tài khoản học sinh" },
      { icon: UserCog, label: "Tài khoản nhân sự" },
      { icon: Database, label: "Đồng bộ dữ liệu CSDL" },
      { icon: HardDrive, label: "Quản lý dung lượng", to: "/he-thong/quan-ly-dung-luong", search: { role: "principal" } },
      { icon: HardDrive, label: "Dung lượng bộ nhớ cá nhân", to: "/he-thong/dung-luong-ca-nhan", search: { role: "principal" } },
    ],
  },
];

const HOMEROOM_NAV: NavItem[] = TEACHER_NAV.map((it) =>
  it.label === "Trang chủ" ? { ...it, to: "/gvcn" } : it,
).flatMap((it) =>
  it.label === "Kỳ thi"
    ? [{ icon: CalendarRange, label: "Thời khóa\nbiểu", to: "/thoi-khoa-bieu" } as NavItem, it]
    : [it],
);

export type AppRole = "teacher" | "student" | "principal" | "homeroom";

export function SidebarNav({ role = "teacher" }: { role?: AppRole }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const NAV = role === "student" ? STUDENT_NAV
    : role === "principal" ? PRINCIPAL_NAV
    : role === "homeroom" ? HOMEROOM_NAV
    : TEACHER_NAV;
  return (
    <aside className="w-24 bg-slate-100 border-r flex flex-col items-center py-4 gap-1 shrink-0">
      <div className="w-16 h-16 flex items-center justify-center mb-1">
        <img src={qlmsLogo} alt="QLMS" className="h-full w-full object-contain" />
      </div>
      {NAV.map((it) => {
        const active = it.to ? pathname === it.to : false;
        const cls = `w-20 py-3 rounded-xl flex flex-col items-center gap-1 text-[11px] font-medium leading-tight whitespace-pre-line text-center transition ${
          active ? "bg-indigo-700 text-white shadow" : "text-slate-600 hover:bg-white"
        }`;
        const inner = (
          <>
            <it.icon className="h-5 w-5" />
            {it.label}
          </>
        );
        return (
          <div key={it.label} className="relative group w-20">
            {it.to ? (
              <Link to={it.to} className={cls}>{inner}</Link>
            ) : (
              <button className={cls}>{inner}</button>
            )}
            {it.submenu && (
              <div className="absolute left-full top-0 ml-1 hidden group-hover:block z-50 pl-1">
                <div className="bg-white border border-slate-200 rounded-xl shadow-lg py-2 w-56 animate-in fade-in slide-in-from-left-2 duration-150">
                  {it.submenu.map((s) => {
                    const subCls = "w-full px-3 py-2 flex items-center gap-2 text-left text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition";
                    const inner = (
                      <>
                        <s.icon className="h-4 w-4 text-indigo-600 shrink-0" />
                        <span className="flex-1">{s.label}</span>
                        {s.highlight && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-400 shrink-0" />}
                      </>
                    );
                    return s.to ? (
                      <Link key={s.label} to={s.to} search={(s.search ?? {}) as never} className={subCls}>{inner}</Link>
                    ) : (
                      <button key={s.label} className={subCls}>{inner}</button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
}

export function TopBar({ role = "teacher" }: { role?: AppRole }) {
  const isStudent = role === "student";
  const isPrincipal = role === "principal";
  const isHomeroom = role === "homeroom";
  const name = isStudent ? "Phí Song Ngân" : isPrincipal ? "H/t Nguyễn Thị Mai Lan" : isHomeroom ? "GVCN Trần Bích Ngọc" : "G/v Phùng Thúy Hằng";
  const subtitle = isStudent ? "Học sinh · Lớp 4A" : isPrincipal ? "Hiệu trưởng" : isHomeroom ? "Giáo viên chủ nhiệm · Lớp 4A" : "Giáo viên";
  const greeting = isStudent ? "Chào mừng," : "Xin chào,";
  const avatar = isStudent ? studentAvatar : isPrincipal ? principalAvatar : teacherAvatar;
  const YEARS = ["2025 - 2026", "2024 - 2025", "2023 - 2024", "2022 - 2023"];
  const [year, setYear] = useState(YEARS[0]);

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <div>
          <p className="text-sm text-slate-500">{greeting}</p>
          <p className="text-base font-semibold text-slate-800">{name}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              title={`Năm học ${year}`}
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 shadow-sm hover:shadow transition whitespace-nowrap"
            >
              <span className="text-[11px] uppercase tracking-wide text-indigo-500 font-semibold">Năm học</span>
              <span className="text-base font-bold">{year}</span>
              <ChevronDown className="h-4 w-4 text-indigo-500 group-hover:translate-y-0.5 transition" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel className="text-xs text-slate-500">Chọn năm học</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {YEARS.map((y) => (
              <DropdownMenuItem
                key={y}
                onSelect={() => setYear(y)}
                className={`cursor-pointer text-sm ${y === year ? "bg-indigo-50 text-indigo-700 font-semibold" : ""}`}
              >
                Năm học {y}
                {y !== YEARS[0] && <span className="ml-auto text-[10px] text-slate-400">Xem lại</span>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-slate-100">
          <Bell className="h-5 w-5 text-slate-600" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500" />
        </button>
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-800">Tiểu học Tô Hiệu</p>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 rounded-full pl-1 pr-2 py-0.5 hover:bg-slate-100 transition">
              <img
                src={avatar}
                alt="Ảnh đại diện"
                width={40}
                height={40}
                loading="lazy"
                className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-100"
              />
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-xs text-slate-500">Chuyển tài khoản</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/" className="flex items-center gap-2 cursor-pointer">
                <img src={teacherAvatar} className="h-7 w-7 rounded-full object-cover" alt="" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Giáo viên</span>
                  <span className="text-[11px] text-slate-500">Phùng Thúy Hằng</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/gvcn" className="flex items-center gap-2 cursor-pointer">
                <img src={teacherAvatar} className="h-7 w-7 rounded-full object-cover" alt="" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Giáo viên chủ nhiệm</span>
                  <span className="text-[11px] text-slate-500">Trần Bích Ngọc · 4A</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/hoc-sinh" className="flex items-center gap-2 cursor-pointer">
                <img src={studentAvatar} className="h-7 w-7 rounded-full object-cover" alt="" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Học sinh</span>
                  <span className="text-[11px] text-slate-500">Phí Song Ngân · 4A</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/hieu-truong" className="flex items-center gap-2 cursor-pointer">
                <img src={principalAvatar} className="h-7 w-7 rounded-full object-cover" alt="" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Hiệu trưởng</span>
                  <span className="text-[11px] text-slate-500">Nguyễn Thị Mai Lan</span>
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function AppShell({ children, role: roleProp }: { children: React.ReactNode; role?: AppRole }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const role: AppRole = roleProp
    ?? (pathname.startsWith("/hoc-sinh") ? "student"
      : pathname.startsWith("/hieu-truong") ? "principal"
      : pathname.startsWith("/gvcn") || pathname.startsWith("/thoi-khoa-bieu") ? "homeroom"
      : "teacher");
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <SidebarNav role={role} />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar role={role} />
        <main className="flex-1 p-4 space-y-4 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
