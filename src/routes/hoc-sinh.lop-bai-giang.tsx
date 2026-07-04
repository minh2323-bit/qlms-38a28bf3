import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useMemo, useState } from "react";
import { BookMarked, Search, Hash, ChevronDown, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import thumb4A from "@/assets/thumb-lop-4a.jpg";
import thumbBoTucToan from "@/assets/thumb-bo-tuc-toan.jpg";
import thumbOnThiHsgAnh from "@/assets/thumb-on-thi-hsg-anh.jpg";
import thumbPhanSo from "@/assets/thumb-phan-so.jpg";
import thumbSoThapPhan from "@/assets/thumb-so-thap-phan.jpg";
import thumbHinhHoc from "@/assets/thumb-hinh-hoc.jpg";
import thumbDoLuong from "@/assets/thumb-do-luong.jpg";
import thumbPhanTram from "@/assets/thumb-phan-tram.jpg";
import thumbSoTuNhien from "@/assets/thumb-so-tu-nhien.jpg";

export const Route = createFileRoute("/hoc-sinh/lop-bai-giang")({
  head: () => ({ meta: [{ title: "Lớp học & Bài giảng – Học sinh" }] }),
  component: Page,
});

const STUDENT_CLASS = "4A";

type ClassStatus = "dang-hoc" | "dang-trien-khai" | "da-khoa";

type ClassCard = {
  id: string;
  name: string;
  code: string;
  status: ClassStatus;
  year: string;
  description: string;
  thumb: string;
  href?: { to: "/hoc-sinh/lop/$lop"; params: { lop: string } };
};

const CLASSES: ClassCard[] = [
  {
    id: "4A",
    name: "Lớp 4A",
    code: "LH-4A-T2526",
    status: "dang-hoc",
    year: "Năm học 2025 – 2026",
    description: "Lớp học của em — nơi xem tất cả bài giảng, học liệu và thông báo từ giáo viên.",
    thumb: thumb4A,
    href: { to: "/hoc-sinh/lop/$lop", params: { lop: STUDENT_CLASS } },
  },
  {
    id: "BT-TOAN",
    name: "Lớp bổ túc Toán",
    code: "LH-BT-TOAN-2526",
    status: "dang-trien-khai",
    year: "Năm học 2025 – 2026",
    description: "Lớp bổ túc kiến thức Toán cơ bản dành cho học sinh cần củng cố nền tảng.",
    thumb: thumbBoTucToan,
  },
  {
    id: "HSG-ANH",
    name: "Lớp ôn thi HSG Tiếng Anh",
    code: "LH-HSG-ANH-2526",
    status: "dang-trien-khai",
    year: "Năm học 2025 – 2026",
    description: "Lớp bồi dưỡng học sinh giỏi Tiếng Anh, luyện đề và mở rộng nâng cao.",
    thumb: thumbOnThiHsgAnh,
  },
];

const STATUS_META: Record<ClassStatus, { label: string; cls: string }> = {
  "dang-hoc":         { label: "Đang học",       cls: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" },
  "dang-trien-khai":  { label: "Đang triển khai", cls: "bg-sky-100 text-sky-700 hover:bg-sky-100" },
  "da-khoa":          { label: "Đã khoá",        cls: "bg-slate-200 text-slate-600 hover:bg-slate-200" },
};

function Page() {
  const [tab, setTab] = useState<"lop" | "baigiang">("lop");
  const [qName, setQName] = useState("");
  const [qCode, setQCode] = useState("");

  const materials = useMaterials().filter((m) => m.classRealId === STUDENT_CLASS);
  const baiGiang = materials.filter((m) => m.kind === "slide" || m.kind === "syllabus");

  const filtered = useMemo(() => {
    const n = qName.trim().toLowerCase();
    const c = qCode.trim().toLowerCase();
    return CLASSES.filter((cl) => {
      if (n && !cl.name.toLowerCase().includes(n)) return false;
      if (c && !cl.code.toLowerCase().includes(c)) return false;
      return true;
    });
  }, [qName, qCode]);

  return (
    <AppShell role="student">
      <section className="bg-white rounded-2xl border shadow-sm">
        <div className="px-6 py-3 border-b flex items-center gap-2">
          <BookMarked className="h-5 w-5 text-indigo-700" />
          <h2 className="text-xl font-bold text-slate-800">Lớp học / Bài giảng</h2>
        </div>
        <div className="px-6 pt-4 flex gap-2 border-b">
          {([
            { key: "lop", label: "Lớp học" },
            { key: "baigiang", label: "Bài giảng" },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
                tab === t.key ? "border-indigo-700 text-indigo-700" : "border-transparent text-slate-600 hover:text-indigo-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === "lop" ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    value={qName}
                    onChange={(e) => setQName(e.target.value)}
                    placeholder="Tìm theo tên lớp học…"
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                  />
                </div>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    value={qCode}
                    onChange={(e) => setQCode(e.target.value)}
                    placeholder="Tìm bằng mã lớp học…"
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                  />
                </div>
              </div>

              {filtered.length === 0 ? (
                <p className="text-sm text-slate-500 italic">Không tìm thấy lớp học nào khớp bộ lọc.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((cl) => {
                    const meta = STATUS_META[cl.status];
                    const inner = (
                      <>
                        <img src={cl.thumb} alt={cl.name} className="h-36 w-full object-cover" loading="lazy" />
                        <div className="p-4 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-slate-800">{cl.name}</h3>
                            <Badge className={meta.cls}>{meta.label}</Badge>
                          </div>
                          <p className="text-xs text-slate-500">Mã lớp: <span className="font-mono">{cl.code}</span></p>
                          <p className="text-xs text-slate-500">{cl.year}</p>
                          <p className="text-sm text-slate-600 mt-1">{cl.description}</p>
                        </div>
                      </>
                    );
                    const base = "rounded-xl border overflow-hidden transition block bg-white";
                    return cl.href ? (
                      <Link
                        key={cl.id}
                        to={cl.href.to}
                        params={cl.href.params}
                        className={`${base} hover:shadow-md hover:border-indigo-300`}
                      >
                        {inner}
                      </Link>
                    ) : (
                      <div key={cl.id} className={`${base} opacity-95`}>
                        {inner}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {baiGiang.length === 0 && (
                <p className="text-sm text-slate-500 col-span-2">Chưa có bài giảng nào.</p>
              )}
              {baiGiang.map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-xl border p-3 hover:shadow transition">
                  <span className="h-10 w-10 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Presentation className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-800 truncate">{m.title}</div>
                    <div className="text-[11px] text-slate-500">{m.subject} · {m.meta ?? "Bài giảng"}</div>
                  </div>
                  <button className="text-xs font-semibold text-indigo-700 hover:underline">Mở</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}

// silence unused warnings
void FileText; void Video; void ListChecks;
