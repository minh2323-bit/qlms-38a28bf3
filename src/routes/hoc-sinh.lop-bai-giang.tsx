import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useMemo, useState } from "react";
import { BookMarked, Search, Hash, ChevronDown, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/ProgressRing";
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
    status: "da-khoa",
    year: "Năm học 2025 – 2026",
    description: "Lớp bổ túc kiến thức Toán cơ bản dành cho học sinh cần củng cố nền tảng.",
    thumb: thumbBoTucToan,
  },
  {
    id: "HSG-ANH",
    name: "Lớp ôn thi HSG Tiếng Anh",
    code: "LH-HSG-ANH-2526",
    status: "dang-hoc",
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

type LectureType = "Bài giảng điện tử" | "Video" | "Tài liệu" | "Slide" | "Bài tập";
type Lecture = {
  id: string;
  title: string;
  khoi: string;
  subject: string;
  author: string;
  releaseDate: string;
  loai: LectureType[];
  thumb: string;
  autoEnrolled?: boolean;
  progress?: number; // 0..100
};

const LECTURES: Lecture[] = [
  { id: "bg1", title: "Học về phân số", khoi: "Lớp 4", subject: "Toán", author: "Cô Phùng Thuý Hằng", releaseDate: "15/09/2025", loai: ["Bài giảng điện tử", "Slide", "Bài tập"], thumb: thumbPhanSo, autoEnrolled: true, progress: 45 },
  { id: "bg2", title: "Số thập phân và phép so sánh", khoi: "Lớp 4", subject: "Toán", author: "Cô Phùng Thuý Hằng", releaseDate: "22/09/2025", loai: ["Bài giảng điện tử", "Slide"], thumb: thumbSoThapPhan, autoEnrolled: true, progress: 72 },
  { id: "bg3", title: "Hình học trực quan", khoi: "Lớp 4", subject: "Toán", author: "Hanoi Study (Thầy Nguyễn Văn A)", releaseDate: "05/10/2025", loai: ["Video"], thumb: thumbHinhHoc, progress: 30 },
  { id: "bg4", title: "Đo lường và đơn vị đo", khoi: "Lớp 4", subject: "Toán", author: "Cô Phùng Thuý Hằng", releaseDate: "12/10/2025", loai: ["Tài liệu", "Bài tập"], thumb: thumbDoLuong, autoEnrolled: true, progress: 60 },
  { id: "bg5", title: "Tỉ số phần trăm nâng cao", khoi: "Lớp 4", subject: "Toán", author: "Thầy Trần Minh Khôi", releaseDate: "19/10/2025", loai: ["Bài giảng điện tử", "Video"], thumb: thumbPhanTram, progress: 15 },
  { id: "bg6", title: "Số tự nhiên và phép tính", khoi: "Lớp 4", subject: "Toán", author: "Cô Phùng Thuý Hằng", releaseDate: "28/10/2025", loai: ["Bài giảng điện tử", "Slide", "Bài tập"], thumb: thumbSoTuNhien, autoEnrolled: true, progress: 88 },
  { id: "bg7", title: "Luyện đọc hiểu Tiếng Việt 4", khoi: "Lớp 4", subject: "Tiếng Việt", author: "Cô Nguyễn Thị Hoa", releaseDate: "03/11/2025", loai: ["Tài liệu"], thumb: thumb4A, autoEnrolled: true, progress: 0 },
  { id: "bg8", title: "Câu lạc bộ Tiếng Anh giao tiếp", khoi: "Lớp 4", subject: "Tiếng Anh", author: "Thầy Trần Minh Quân", releaseDate: "10/11/2025", loai: ["Video", "Bài tập"], thumb: thumbOnThiHsgAnh, progress: 20 },
  { id: "bg9", title: "Bổ trợ Toán cơ bản – Lớp 4", khoi: "Lớp 4", subject: "Toán", author: "Cô Phùng Thuý Hằng", releaseDate: "15/11/2025", loai: ["Bài giảng điện tử", "Tài liệu"], thumb: thumbBoTucToan, progress: 0 },
];

const SUBJECT_OPTIONS = ["Tất cả", "Toán", "Tiếng Việt", "Tiếng Anh"] as const;
const TYPE_OPTIONS = ["Tất cả", "Bài giảng điện tử", "Video", "Tài liệu", "Slide", "Bài tập"] as const;

const TYPE_TAG_STYLES: Record<LectureType, string> = {
  "Bài giảng điện tử": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Video":             "bg-rose-100 text-rose-700 border-rose-200",
  "Tài liệu":          "bg-amber-100 text-amber-700 border-amber-200",
  "Slide":             "bg-sky-100 text-sky-700 border-sky-200",
  "Bài tập":           "bg-emerald-100 text-emerald-700 border-emerald-200",
};

function Page() {
  const [tab, setTab] = useState<"lop" | "baigiang">("lop");
  const [qName, setQName] = useState("");
  const [qCode, setQCode] = useState("");

  // Bài giảng tab state
  const [bgSubject, setBgSubject] = useState<string>("Tất cả");
  const [bgType, setBgType] = useState<string>("Tất cả");
  const [enrolled, setEnrolled] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const n = qName.trim().toLowerCase();
    const c = qCode.trim().toLowerCase();
    return CLASSES.filter((cl) => {
      if (n && !cl.name.toLowerCase().includes(n)) return false;
      if (c && !cl.code.toLowerCase().includes(c)) return false;
      return true;
    });
  }, [qName, qCode]);

  const filteredLectures = useMemo(() => {
    return LECTURES.filter((l) => {
      if (bgSubject !== "Tất cả" && l.subject !== bgSubject) return false;
      if (bgType !== "Tất cả" && !l.loai.includes(bgType as LectureType)) return false;
      return true;
    });
  }, [bgSubject, bgType]);

  const toggleEnroll = (id: string) =>
    setEnrolled((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filtered.map((cl) => {
                    const meta = STATUS_META[cl.status];
                    const inner = (
                      <>
                        <img src={cl.thumb} alt={cl.name} className="h-32 w-full object-cover" loading="lazy" />
                        <div className="p-3.5 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-slate-800 text-[15px]">{cl.name}</h3>
                            <Badge className={meta.cls}>{meta.label}</Badge>
                          </div>
                          <p className="text-[13px] text-slate-600"><span className="font-bold text-slate-700">Mã lớp:</span> <span className="font-mono">{cl.code}</span></p>
                          <p className="text-[13px] text-slate-600">{cl.year}</p>
                          <p className="text-xs text-slate-500 mt-1 leading-snug">{cl.description}</p>
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
            <>
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <FilterSelect
                  label="Môn"
                  value={bgSubject}
                  onChange={setBgSubject}
                  options={SUBJECT_OPTIONS as unknown as string[]}
                />
                <FilterSelect
                  label="Loại học liệu"
                  value={bgType}
                  onChange={setBgType}
                  options={TYPE_OPTIONS as unknown as string[]}
                />
                <span className="text-base font-bold text-indigo-700 ml-auto bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                  {filteredLectures.length} bài giảng
                </span>
              </div>

              {filteredLectures.length === 0 ? (
                <p className="text-sm text-slate-500 italic">Không có bài giảng phù hợp.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredLectures.map((l) => {
                    const isEnrolled = enrolled.has(l.id);
                    const auto = !!l.autoEnrolled;
                    return (
                      <div key={l.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col hover:shadow-md hover:border-indigo-300 transition">
                        <div className="relative">
                          <img src={l.thumb} alt={l.title} className="h-32 w-full object-cover" loading="lazy" />
                          <span className="absolute top-2 right-2 bg-white rounded-full p-0.5 shadow">
                            <ProgressRing value={l.progress ?? 0} size={40} stroke={3.5} />
                          </span>
                        </div>
                        <div className="p-3.5 flex flex-col flex-1">
                          <h3 className="font-bold text-slate-800 text-[15px] leading-snug">{l.title}</h3>
                          <div className="mt-2 space-y-1 text-[13px] text-slate-700">
                            <div className="flex gap-4">
                              <div><span className="font-bold text-slate-700">Khối:</span> <span>{l.khoi}</span></div>
                              <div><span className="font-bold text-slate-700">Môn:</span> <span>{l.subject}</span></div>
                            </div>
                            <div><span className="font-bold text-slate-700">GV:</span> <span>{l.author}</span></div>
                            <div><span className="font-bold text-slate-700">Ngày phát hành:</span> <span>{l.releaseDate}</span></div>
                            <div className="pt-1 flex flex-wrap gap-1.5">
                              {l.loai.map((t) => (
                                <span
                                  key={t}
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${TYPE_TAG_STYLES[t]}`}
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="mt-4">
                            {auto ? (
                              <button
                                disabled
                                className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-100 text-slate-500 text-[13px] font-semibold cursor-not-allowed border border-slate-200"
                              >
                                <CheckCircle2 className="h-4 w-4" /> Giáo viên tự động ghi danh
                              </button>
                            ) : (
                              <button
                                onClick={() => toggleEnroll(l.id)}
                                className={`w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition ${
                                  isEnrolled
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                                }`}
                              >
                                {isEnrolled ? (<><CheckCircle2 className="h-4 w-4" /> Đã ghi danh</>) : "Ghi danh"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </AppShell>
  );
}

function FilterSelect({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="text-slate-600 font-medium">{label}:</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-200 hover:border-indigo-300"
        >
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    </label>
  );
}

