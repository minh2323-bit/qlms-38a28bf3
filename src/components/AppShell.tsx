import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home, BookOpen, FolderKanban, BarChart3, GraduationCap, Settings,
  Bell, Library, BookOpenCheck, ListChecks, Users, Trophy, TrendingUp,
  ClipboardList, Video, Building2, School, Landmark,
  Grid3x3, FileCheck2, BookMarked, UserCog, UsersRound, SlidersHorizontal, Brain, Tag,
} from "lucide-react";
import teacherAvatar from "@/assets/teacher-avatar.jpg";
import qlmsLogo from "@/assets/qlms-logo.png";

type SubItem = { icon: typeof Home; label: string; to?: string };
type NavItem = {
  icon: typeof Home;
  label: string;
  to?: string;
  submenu?: SubItem[];
};

const NAV: NavItem[] = [
  { icon: Home, label: "Trang chủ", to: "/" },
  {
    icon: GraduationCap,
    label: "Hoạt động\ngiảng dạy",
    to: "/lop-hoc-so",
    submenu: [
      { icon: School, label: "Lớp học của tôi", to: "/lop-hoc-so" },
      { icon: ClipboardList, label: "Giao bài tập, nhiệm vụ" },
    ],
  },
  {
    icon: BookOpen,
    label: "Học liệu\n& Bài kiểm tra",
    submenu: [
      { icon: BookMarked, label: "Bài giảng", to: "/hoc-lieu/bai-giang" },
      { icon: Tag, label: "Học liệu bản quyền" },
      { icon: Library, label: "Kho học liệu" },
      { icon: Video, label: "Video tương tác" },
      { icon: BookOpenCheck, label: "Ngân hàng câu hỏi" },
      { icon: ListChecks, label: "Đề kiểm tra" },
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

export function SidebarNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="w-24 bg-slate-100 border-r flex flex-col items-center py-4 gap-1 shrink-0">
      <div className="w-16 h-16 flex items-center justify-center mb-2">
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

export function TopBar() {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0">
      <div>
        <p className="text-sm text-slate-500">Xin chào,</p>
        <p className="text-base font-semibold text-slate-800">G/v Phùng Thúy Hằng</p>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-slate-100">
          <Bell className="h-5 w-5 text-slate-600" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500" />
        </button>
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-800">Tiểu học Tô Hiệu</p>
          <p className="text-xs text-slate-500">Giáo viên</p>
        </div>
        <img
          src={teacherAvatar}
          alt="Ảnh đại diện giáo viên"
          width={40}
          height={40}
          loading="lazy"
          className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-100"
        />
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <SidebarNav />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar />
        <main className="flex-1 p-4 space-y-4 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
