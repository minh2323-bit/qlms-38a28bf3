import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Users, Search, UserRound, CalendarDays, BookMarked, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/input";

import thumbLop4A from "@/assets/thumb-lop-4a.jpg";
import thumbLop3D from "@/assets/thumb-lop-3d.jpg";
import thumbLop3A from "@/assets/thumb-lop-3a.jpg";
import thumbLop3B from "@/assets/thumb-lop-3b.jpg";
import thumbLop3C from "@/assets/thumb-lop-3c.jpg";
import thumbLop4B from "@/assets/thumb-lop-4b.jpg";
import thumbLop4BReview from "@/assets/thumb-lop-4b-review.jpg";
import thumbLop4C from "@/assets/thumb-lop-4c.jpg";
import thumbBoTuc from "@/assets/thumb-bo-tuc-toan.jpg";
import thumbHsgAnh from "@/assets/thumb-on-thi-hsg-anh.jpg";

export const Route = createFileRoute("/hieu-truong_/lop-hoc")({
  head: () => ({
    meta: [
      { title: "Lớp học – Hiệu trưởng | Tiểu học Tô Hiệu" },
      { name: "description", content: "Lớp học của tôi và lớp học của toàn trường, theo PCCM và tự tạo." },
      { property: "og:title", content: "Lớp học – Hiệu trưởng | Tiểu học Tô Hiệu" },
      { property: "og:description", content: "Lớp học của tôi và lớp học của toàn trường, theo PCCM và tự tạo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrincipalClassesPage,
});

type Cls = {
  id: string; name: string; subject: string; thumb: string;
  baiGiang: number; hocLieu: number; hocSinh: number;
  status: "draft" | "deployed";
  teacher?: string; createdAt?: string;
};

const MY_PCCM: Cls[] = [
  { id: "c1", name: "Lớp 4A Năm học 2025 - 2026", subject: "Toán", thumb: thumbLop4A, baiGiang: 15, hocLieu: 15, hocSinh: 40, status: "deployed" },
  { id: "c4", name: "Lớp 3A Năm học 2025 - 2026", subject: "Toán", thumb: thumbLop3A, baiGiang: 12, hocLieu: 18, hocSinh: 38, status: "deployed" },
];
const MY_SELF: Cls[] = [
  { id: "c7", name: "Ôn tập Toán khối 4 (4B, 4C, 4D)", subject: "Toán", thumb: thumbLop4BReview, baiGiang: 8, hocLieu: 11, hocSinh: 120, status: "draft" },
];
const SCHOOL_PCCM: Cls[] = [
  { id: "c3", name: "Lớp 3D Năm học 2025 - 2026", subject: "Tiếng Việt", thumb: thumbLop3D, baiGiang: 15, hocLieu: 15, hocSinh: 40, status: "deployed", teacher: "Cô Nguyễn Thu Trang", createdAt: "05/09/2025" },
  { id: "c5", name: "Lớp 3B Năm học 2025 - 2026", subject: "Tiếng Anh", thumb: thumbLop3B, baiGiang: 14, hocLieu: 16, hocSinh: 42, status: "draft", teacher: "Thầy Trần Minh Quân", createdAt: "06/09/2025" },
  { id: "c6", name: "Lớp 3C Năm học 2025 - 2026", subject: "Khoa học", thumb: thumbLop3C, baiGiang: 13, hocLieu: 14, hocSinh: 39, status: "deployed", teacher: "Cô Lê Thị Mai", createdAt: "06/09/2025" },
  { id: "c8", name: "Lớp 4C Năm học 2025 - 2026", subject: "Toán", thumb: thumbLop4C, baiGiang: 15, hocLieu: 15, hocSinh: 40, status: "deployed", teacher: "Cô Phùng Thuý Hằng", createdAt: "08/09/2025" },
  { id: "c1", name: "Lớp 4B Năm học 2025 - 2026", subject: "Tin học", thumb: thumbLop4B, baiGiang: 9, hocLieu: 12, hocSinh: 41, status: "deployed", teacher: "Thầy Phạm Quốc Anh", createdAt: "10/09/2025" },
];
const SCHOOL_SELF: Cls[] = [
  { id: "c7", name: "Lớp bổ túc học sinh Toán", subject: "Toán", thumb: thumbBoTuc, baiGiang: 6, hocLieu: 9, hocSinh: 25, status: "deployed", teacher: "Cô Phùng Thuý Hằng", createdAt: "12/10/2025" },
  { id: "c7", name: "Lớp ôn thi học sinh giỏi Tiếng Anh", subject: "Tiếng Anh", thumb: thumbHsgAnh, baiGiang: 10, hocLieu: 14, hocSinh: 18, status: "draft", teacher: "Thầy Trần Minh Quân", createdAt: "20/10/2025" },
];

function PrincipalClassesPage() {
  const [tab, setTab] = useState<"mine" | "school">("mine");
  const [q, setQ] = useState("");
  const f = (l: Cls[]) => l.filter((c) => c.name.toLowerCase().includes(q.trim().toLowerCase()) || (c.teacher ?? "").toLowerCase().includes(q.trim().toLowerCase()));
  const [pccm, self] = useMemo(
    () => (tab === "mine" ? [f(MY_PCCM), f(MY_SELF)] : [f(SCHOOL_PCCM), f(SCHOOL_SELF)]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tab, q],
  );

  return (
    <AppShell role="principal">
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Lớp học</h1>
          <p className="text-sm text-slate-500">Quản lý lớp học bạn giảng dạy và theo dõi các lớp học của toàn trường.</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b">
          <div className="flex gap-1">
            {([["mine", "Lớp học của tôi"], ["school", "Lớp học của trường"]] as const).map(([k, l]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${tab === k ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="relative mb-2">
            <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-slate-400" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tab === "mine" ? "Tìm lớp học..." : "Tìm lớp học, giáo viên..."} className="h-9 w-64 pl-8" />
          </div>
        </div>

        <Section title="Lớp học theo PCCM" icon={<BookMarked className="h-4 w-4" />} list={pccm} showOwner={tab === "school"} />
        <Section title="Lớp học tự tạo" icon={<Sparkles className="h-4 w-4" />} list={self} showOwner={tab === "school"} />
      </div>
    </AppShell>
  );
}

function Section({ title, icon, list, showOwner }: { title: string; icon: React.ReactNode; list: Cls[]; showOwner: boolean }) {
  return (
    <section className="bg-white rounded-2xl border shadow-sm p-5 space-y-3">
      <h2 className="flex items-center gap-2 text-base font-bold text-indigo-700">
        {icon} {title} <span className="text-xs font-semibold text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">{list.length}</span>
      </h2>
      {list.length ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {list.map((c, i) => <ClassCard key={`${c.name}-${i}`} c={c} showOwner={showOwner} />)}
        </div>
      ) : (
        <p className="text-sm text-slate-400 py-6 text-center">Không có lớp học.</p>
      )}
    </section>
  );
}

function ClassCard({ c, showOwner }: { c: Cls; showOwner: boolean }) {
  const navigate = useNavigate();
  return (
    <div
      role="button"
      onClick={() => navigate({ to: "/lop-hoc-so/$classId", params: { classId: c.id } })}
      className="bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer"
    >
      <div className="h-28 relative bg-slate-100">
        <img src={c.thumb} alt={c.name} loading="lazy" className="w-full h-full object-cover" />
        <span className={`absolute top-1.5 right-1.5 rounded-full text-[10px] font-semibold px-2 py-0.5 shadow ${c.status === "deployed" ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-700"}`}>
          {c.status === "deployed" ? "Đã triển khai" : "Chưa triển khai"}
        </span>
      </div>
      <div className="p-3 space-y-1.5">
        <h3 className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">{c.name}</h3>
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="rounded-full bg-indigo-50 text-indigo-700 px-2 py-0.5 font-semibold">{c.subject}</span>
          <span><span className="text-slate-500">BG:</span> {c.baiGiang}</span>
          <span><span className="text-slate-500">HL:</span> {c.hocLieu}</span>
        </div>
        {showOwner && (
          <div className="pt-1.5 border-t space-y-1 text-xs text-slate-600">
            <div className="flex items-center gap-1.5"><UserRound className="h-3.5 w-3.5 text-slate-400" /> GV tạo: <b className="text-slate-800">{c.teacher}</b></div>
            <div className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-slate-400" /> Ngày tạo: {c.createdAt}</div>
          </div>
        )}
        <div className="pt-1.5 border-t flex justify-end text-xs text-slate-600">
          <Users className="h-3.5 w-3.5 mr-1" /> {c.hocSinh} học sinh
        </div>
      </div>
    </div>
  );
}
