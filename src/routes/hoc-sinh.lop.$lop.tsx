import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft, Users, ChevronDown, ChevronRight,
  Video, FileText, ClipboardList, BookOpen, Image as ImageIcon, Presentation,
  BarChart3,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import thumbLop4A from "@/assets/thumb-lop-4a.jpg";
import { getUnitTitle } from "@/lib/knowledge-tree";
import { useMaterials, type MaterialKind, type Material } from "@/lib/teaching-store";
import {
  useLiveClasses, formatTimeRange, formatDate, isLiveEnded, type LiveClass,
} from "@/lib/live-class-store";
import { LiveClassStatsModal } from "@/components/LiveClassStatsModal";
import { AnnouncementSection } from "@/components/AnnouncementSection";

export const Route = createFileRoute("/hoc-sinh/lop/$lop")({
  head: () => ({ meta: [{ title: "Chi tiết lớp học – Học sinh" }] }),
  component: Page,
});

// Chương trình GDPT 2018 – Lớp 4
const SUBJECTS_LOP4 = [
  "Toán", "Tiếng Việt", "Tiếng Anh", "Khoa học",
  "Lịch sử & Địa lí", "Đạo đức", "Tin học", "Công nghệ",
  "Âm nhạc", "Mĩ thuật", "Giáo dục thể chất", "HĐ trải nghiệm",
];

// Mỗi môn có một giáo viên phụ trách
const TEACHERS_BY_SUBJECT: Record<string, string> = {
  "Toán": "Cô Phùng Thuý Hằng",
  "Tiếng Việt": "Cô Nguyễn Thị Hoa",
  "Tiếng Anh": "Thầy Trần Minh Quân",
  "Khoa học": "Cô Lê Thị Mai",
  "Lịch sử & Địa lí": "Thầy Đỗ Văn Nam",
  "Đạo đức": "Cô Bùi Thị Hạnh",
  "Tin học": "Thầy Phạm Quốc Anh",
  "Công nghệ": "Thầy Nguyễn Đức Long",
  "Âm nhạc": "Cô Vũ Bích Ngọc",
  "Mĩ thuật": "Cô Trần Thanh Thảo",
  "Giáo dục thể chất": "Thầy Hoàng Văn Bình",
  "HĐ trải nghiệm": "Cô Lý Thu Trang",
};

function Page() {
  const { lop } = Route.useParams();
  const navigate = useNavigate();
  const allMaterials = useMaterials();
  const allLive = useLiveClasses();
  const [subject, setSubject] = useState<string>("Toán");

  const teacherOfSubject = TEACHERS_BY_SUBJECT[subject] ?? "Cô Nguyễn Thị Hoa";

  const info = {
    name: `Lớp ${lop} Năm học 2025 - 2026`,
    code: `LH-${lop}-T2526`,
    teacher: teacherOfSubject,
    students: 40,
    thumb: thumbLop4A,
    description: `Lớp ${lop} của em — xem tất cả bài giảng, học liệu và thông báo từ giáo viên theo từng môn học.`,
  };

  const classMaterials = useMemo(
    () => allMaterials.filter((m) => m.classRealId === lop && m.subject === subject),
    [allMaterials, lop, subject],
  );
  const classLive = useMemo(
    () => allLive
      .filter((l) => l.classRealId === lop && l.subject === subject)
      .sort((a, b) => a.startAt.localeCompare(b.startAt)),
    [allLive, lop, subject],
  );

  type Group = { unitId: string; title: string; items: Material[] };
  const groups: Group[] = useMemo(() => {
    const map = new Map<string, Group>();
    classMaterials.forEach((m) => {
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

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const isOpen = (id: string) => expanded[id] ?? true;

  const totals = {
    lessons: groups.length,
    items: groups.reduce((s, g) => s + g.items.length, 0),
  };

  return (
    <AppShell role="student">
      {/* Banner */}
      <section
        className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm"
        style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #9333ea 100%)" }}
      >
        <button
          onClick={() => navigate({ to: "/hoc-sinh/lop-bai-giang" })}
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
              </div>
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-lg px-3 py-1.5">
                <Users className="h-4 w-4" />
                {info.students} học sinh
              </div>
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-lg px-3 py-1.5">
                <span className="opacity-90">Giáo viên:</span>
                <span className="font-semibold">{info.teacher}</span>
              </div>
            </div>
            <p className="mt-5 text-white/90 max-w-3xl leading-relaxed text-sm md:text-[15px]">
              {info.description}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="aspect-[4/3] rounded-xl overflow-hidden border-2 border-white/30 shadow-lg">
              <img src={info.thumb} alt={info.name} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Subject selector */}
      <section className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
        <h2 className="text-sm font-bold text-slate-700 mb-3">Chọn môn học</h2>
        <div className="flex flex-wrap gap-2">
          {SUBJECTS_LOP4.map((s) => {
            const active = subject === s;
            return (
              <button
                key={s}
                onClick={() => setSubject(s)}
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

      {/* 1. Thông báo */}
      <AnnouncementSection
        classRealId={lop}
        subject={subject}
        teacherName={info.teacher}
      />

      {/* 2. Nội dung học liệu môn học */}
      <section className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Nội dung môn {subject}</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {totals.lessons} chương/chủ đề • {totals.items} học liệu • GV: <span className="font-semibold text-slate-700">{info.teacher}</span>
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {groups.map((g) => (
            <div key={g.unitId} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <button
                onClick={() =>
                  setExpanded((s) => ({ ...s, [g.unitId]: !isOpen(g.unitId) }))
                }
                className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition"
              >
                {isOpen(g.unitId) ? (
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                )}
                <span className="font-semibold text-slate-800 text-left flex-1">{g.title}</span>
                <span className="text-xs text-slate-500 font-medium">
                  {g.items.length} học liệu
                </span>
              </button>
              {isOpen(g.unitId) && (
                <ul className="divide-y divide-slate-100">
                  {g.items.map((c) => (
                    <li key={c.id} className="pl-12 pr-4 py-2.5 flex items-center gap-3 hover:bg-slate-50">
                      <ItemIcon kind={c.kind} />
                      <span className="text-sm text-slate-700 flex-1 truncate">{c.title}</span>
                      <span className="text-xs text-slate-500">{c.meta}</span>
                      <button className="text-xs font-semibold text-indigo-700 hover:underline">
                        Mở
                      </button>
                    </li>
                  ))}
                  {g.items.length === 0 && (
                    <li className="pl-12 pr-4 py-3 text-sm text-slate-400 italic">
                      Chưa có học liệu trong bài giảng này.
                    </li>
                  )}
                </ul>
              )}
            </div>
          ))}

          {groups.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              Giáo viên chưa cập nhật học liệu cho môn <b>{subject}</b>.
            </div>
          )}
        </div>
      </section>

      {/* 3. Lớp học trực tuyến */}
      {classLive.length > 0 && (
        <section className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Lớp học trực tuyến — {subject}</h2>
          <LiveClassesSection items={classLive} />
        </section>
      )}

      <div className="mt-6">
        <Link
          to="/hoc-sinh/lop-bai-giang"
          className="text-sm font-medium text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại danh sách lớp
        </Link>
      </div>
    </AppShell>
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

function LiveClassesSection({ items }: { items: LiveClass[] }) {
  const [open, setOpen] = useState(true);
  const [stats, setStats] = useState<LiveClass | null>(null);
  return (
    <div className="rounded-xl border border-emerald-200 bg-white overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-50 hover:bg-emerald-100 transition"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 text-emerald-700" />
        ) : (
          <ChevronRight className="h-4 w-4 text-emerald-700" />
        )}
        <span className="h-7 w-7 rounded-lg inline-flex items-center justify-center bg-emerald-100 text-emerald-700">
          <Video className="h-4 w-4" />
        </span>
        <span className="font-semibold text-emerald-800 text-left flex-1">
          Lớp học trực tuyến
        </span>
        <span className="text-xs text-emerald-700 font-medium">{items.length} lớp</span>
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
