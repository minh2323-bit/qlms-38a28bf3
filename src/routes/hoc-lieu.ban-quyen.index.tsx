import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  ChevronDown, ChevronLeft, ChevronRight, Plus, Users, ListChecks, FileCheck2, Star,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BAN_QUYEN_SETS, BAN_QUYEN_SUBJECTS, BAN_QUYEN_GRADES,
} from "@/lib/ban-quyen-data";

export const Route = createFileRoute("/hoc-lieu/ban-quyen/")({
  head: () => ({
    meta: [
      { title: "Kho học liệu bản quyền | Tiểu học Tô Hiệu" },
      { name: "description", content: "Duyệt kho học liệu bản quyền dùng chung của trường và HanoiStudy." },
    ],
  }),
  component: BanQuyenListPage,
});

function BanQuyenListPage() {
  const navigate = useNavigate();
  const [grade, setGrade] = useState<string>("Khối 3");
  const [subject, setSubject] = useState<string>("Tiếng Việt");
  const [publisher, setPublisher] = useState<string>("Kết nối tri thức");
  const scrollerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () => BAN_QUYEN_SETS.filter(s => s.grade === grade && s.subject === subject && (!publisher || s.publisher === publisher)),
    [grade, subject, publisher],
  );

  const publishers = ["Kết nối tri thức", "Cánh diều", "Chân trời sáng tạo"];

  const scrollBy = (dx: number) => scrollerRef.current?.scrollBy({ left: dx, behavior: "smooth" });

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-indigo-100 grid place-items-center">
            <Star className="h-6 w-6 text-indigo-600 fill-indigo-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Kho học liệu bản quyền</h1>
        </div>

        {/* Grade + Subject bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5 shrink-0">
              {grade} <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {BAN_QUYEN_GRADES.map(g => (
                <DropdownMenuItem key={g} onClick={() => setGrade(g)}>{g}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button onClick={() => scrollBy(-260)} className="h-8 w-8 grid place-items-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 shrink-0">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div ref={scrollerRef} className="flex-1 overflow-x-auto flex gap-2 scroll-smooth no-scrollbar">
            {BAN_QUYEN_SUBJECTS.map(s => {
              const active = subject === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setSubject(s.key)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold border whitespace-nowrap ${active ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
          <button onClick={() => scrollBy(260)} className="h-8 w-8 grid place-items-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 shrink-0">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Publisher + CTAs */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 inline-flex items-center gap-1.5">
              {publisher} <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {publishers.map(p => <DropdownMenuItem key={p} onClick={() => setPublisher(p)}>{p}</DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate({ to: "/hoc-lieu/ban-quyen/tao-moi/$mode", params: { mode: "kiem-tra" } })}
              className="px-4 py-2 rounded-lg bg-white border border-indigo-300 text-indigo-700 text-sm font-semibold hover:bg-indigo-50 inline-flex items-center gap-1.5"
            >
              <FileCheck2 className="h-4 w-4" /> Tạo bài kiểm tra
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger className="px-4 py-2 rounded-lg bg-indigo-700 text-white text-sm font-semibold hover:bg-indigo-800 inline-flex items-center gap-1.5">
                <Plus className="h-4 w-4" /> Tạo mới
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate({ to: "/hoc-lieu/ban-quyen/tao-moi/$mode", params: { mode: "kiem-tra" } })}>
                  <FileCheck2 className="h-4 w-4 mr-2" /> Đề kiểm tra
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/hoc-lieu/ban-quyen/tao-moi/$mode", params: { mode: "bai-giang" } })}>
                  <ListChecks className="h-4 w-4 mr-2" /> Bài giảng
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/hoc-lieu/ban-quyen/tao-moi/$mode", params: { mode: "giao-bai" } })}>
                  <Users className="h-4 w-4 mr-2" /> Giao bài
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(s => (
            <Link
              key={s.id}
              to="/hoc-lieu/ban-quyen/$setId"
              params={{ setId: s.id }}
              className="group rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden"
            >
              <div className={`relative aspect-[4/3] bg-gradient-to-br ${s.color} flex items-center justify-center overflow-hidden`}>
                <div className="absolute top-2 right-0 rotate-45 translate-x-4 -translate-y-0 bg-blue-600 text-white text-[10px] font-bold px-6 py-0.5 shadow">HEID</div>
                <div className="text-center px-3">
                  <div className="text-white font-black text-2xl leading-tight uppercase drop-shadow" style={{ WebkitTextStroke: "1px rgba(0,0,0,0.15)" }}>
                    {s.subject}
                  </div>
                  <div className="text-white font-black text-5xl leading-none drop-shadow mt-1">{s.grade.replace(/[^0-9]/g, "")}</div>
                  <div className="text-white/90 text-[10px] font-bold mt-2 tracking-wider">BỘ TRỢ SÁCH GIÁO KHOA</div>
                </div>
                <div className="absolute left-2 bottom-2 px-2 py-0.5 rounded-md bg-blue-600 text-white text-[11px] font-semibold">{s.subject}</div>
              </div>
              <div className="p-3">
                <div className="text-sm font-bold text-slate-800 line-clamp-1">{s.title}</div>
                <div className="text-xs text-slate-500 line-clamp-1 mt-0.5 flex items-center gap-2">
                  <span className="truncate">{s.subtitle}</span>
                  <span className="inline-flex items-center gap-0.5 text-slate-500 shrink-0"><Users className="h-3 w-3" />{s.learners}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1 text-slate-600"><ListChecks className="h-3.5 w-3.5" /> {s.totalUnits} Bài</span>
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full border-2 border-sky-400 text-sky-600 text-[10px] font-bold">{s.progress}%</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center text-sm text-slate-500 py-10">Không có bộ học liệu nào phù hợp.</div>
        )}
      </div>
    </AppShell>
  );
}
