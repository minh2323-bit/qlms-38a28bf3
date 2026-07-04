import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  Home, BookOpen, FolderKanban, BarChart3, GraduationCap, Settings,
  Bell, Library, BookOpenCheck, ListChecks, Users, Trophy, TrendingUp,
  ClipboardList, Video, Building2, School, Landmark,
  Grid3x3, FileCheck2, BookMarked, UserCog, UsersRound, SlidersHorizontal, Brain, Tag,
  ChevronDown, Sparkles, Route as RouteIcon, BookOpen as BookOpenIcon,
} from "lucide-react";
import teacherAvatar from "@/assets/teacher-avatar.jpg";
import studentAvatar from "@/assets/student-avatar.jpg";
import qlmsLogo from "@/assets/qlms-logo.png";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type SubItem = { icon: typeof Home; label: string; to?: string };
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
      { icon: ClipboardList, label: "Giao bài tập, nhiệm vụ", to: "/giao-bai-tap" },
      { icon: Video, label: "Lớp học trực tuyến", to: "/lop-truc-tuyen" },
    ],
  },
  {
    icon: BookOpen,
    label: "Học liệu\n& Bài kiểm tra",
    submenu: [
      { icon: Tag, label: "Học liệu bản quyền" },
      { icon: Library, label: "Kho học liệu của tôi", to: "/hoc-lieu/kho-hoc-lieu" },
      { icon: BookOpenCheck, label: "Ngân hàng câu hỏi", to: "/hoc-lieu/ngan-hang-cau-hoi" },
      { icon: ListChecks, label: "Đề kiểm tra", to: "/hoc-lieu/de-kiem-tra" },
    ],
  },
  {
    icon: FolderKanban,
    label: "Kỳ thi",
    submenu: [
      { icon: Landmark, label: "Kỳ thi cấp Sở" },
      { icon: Building2, label: "Kỳ thi cấp Xã/Phường" },
      { icon: School, label: "Kỳ thi cấp Trường" },
      { icon: BookOpenCheck, label: "Ngân hàng câu hỏi" },
      { icon: Grid3x3, label: "Khung ma trận đề" },
      { icon: FileCheck2, label: "Ngân hàng đề thi" },
    ],
  },
  {
    icon: BarChart3,
    label: "Thống kê\n& Báo cáo",
    submenu: [
      { icon: TrendingUp, label: "Hoạt động giảng dạy" },
      { icon: Users, label: "Hoạt động cá nhân" },
    ],
  },
  {
    icon: Settings,
    label: "Hệ thống",
    submenu: [
      { icon: BookOpen, label: "Môn học" },
      { icon: Brain, label: "Định danh kiến thức" },
      { icon: UserCog, label: "Tài khoản Người dùng" },
      { icon: UsersRound, label: "Tài khoản học sinh" },
      { icon: SlidersHorizontal, label: "Cấu hình hệ thống" },
      { icon: Trophy, label: "Mức độ nhận thức" },
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
  { icon: Sparkles, label: "Học liệu\ntăng cường", to: "/hoc-sinh/hoc-lieu" },
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

export function SidebarNav({ role = "teacher" }: { role?: "teacher" | "student" }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const NAV = role === "student" ? STUDENT_NAV : TEACHER_NAV;
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
                    return s.to ? (
                      <Link key={s.label} to={s.to} className={subCls}>
                        <s.icon className="h-4 w-4 text-indigo-600 shrink-0" />
                        <span>{s.label}</span>
                      </Link>
                    ) : (
                      <button key={s.label} className={subCls}>
                        <s.icon className="h-4 w-4 text-indigo-600 shrink-0" />
                        <span>{s.label}</span>
                      </button>
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

export function TopBar({ role = "teacher" }: { role?: "teacher" | "student" }) {
  const isStudent = role === "student";
  const name = isStudent ? "Phí Song Ngân" : "G/v Phùng Thúy Hằng";
  const subtitle = isStudent ? "Học sinh · Lớp 4A" : "Giáo viên";
  const greeting = isStudent ? "Chào mừng," : "Xin chào,";
  const avatar = isStudent ? studentAvatar : teacherAvatar;
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
              <Link to="/hoc-sinh" className="flex items-center gap-2 cursor-pointer">
                <img src={studentAvatar} className="h-7 w-7 rounded-full object-cover" alt="" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Học sinh</span>
                  <span className="text-[11px] text-slate-500">Phí Song Ngân · 4A</span>
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function AppShell({ children, role: roleProp }: { children: React.ReactNode; role?: "teacher" | "student" }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const role: "teacher" | "student" = roleProp ?? (pathname.startsWith("/hoc-sinh") ? "student" : "teacher");
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
