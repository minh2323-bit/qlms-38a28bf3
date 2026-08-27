import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { PersonalStoragePanel } from "@/components/storage/PersonalStoragePanel";

export const Route = createFileRoute("/he-thong/quan-ly-dung-luong")({
  validateSearch: (search: Record<string, unknown>) => ({
    role: search.role === "principal" ? ("principal" as const) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Quản lý dung lượng lưu trữ | QLMS" },
      { name: "description", content: "Theo dõi dung lượng bộ nhớ toàn trường và cá nhân: tỉ lệ đã dùng theo loại học liệu, bảng dung lượng theo giáo viên và danh sách tệp cá nhân." },
      { property: "og:title", content: "Quản lý dung lượng lưu trữ" },
      { property: "og:description", content: "Dung lượng bộ nhớ toàn trường và cá nhân trên hệ thống LMS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StoragePage,
});

type Seg = { label: string; gb: number; color: string };

const SCHOOL: { used: number; total: number; segs: Seg[] } = {
  used: 172,
  total: 256,
  segs: [
    { label: "Ảnh", gb: 62.06, color: "bg-rose-400" },
    { label: "Video", gb: 34.36, color: "bg-violet-400" },
    { label: "Tài liệu", gb: 45.2, color: "bg-sky-400" },
    { label: "Âm thanh", gb: 30.38, color: "bg-amber-400" },
  ],
};

const TEACHERS = [
  { name: "Phùng Thúy Hằng", dob: "20/5/1999", subjects: "Toán, Lý", classes: "4A; 4B", size: "100 MB" },
  { name: "Nguyễn Thị Lan", dob: "12/3/1988", subjects: "Toán", classes: "3A; 3B", size: "50 MB" },
  { name: "Trần Văn Hải", dob: "02/9/1990", subjects: "Tiếng Việt", classes: "5A", size: "20 MB" },
  { name: "Phạm Thu Hà", dob: "17/7/1992", subjects: "Tiếng Anh", classes: "4C; 5B", size: "20 MB" },
  { name: "Lê Minh Đức", dob: "30/1/1985", subjects: "Âm nhạc", classes: "2A", size: "12 MB" },
];

function fmt(n: number) {
  return n.toLocaleString("vi-VN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function StoragePage() {
  const { role } = Route.useSearch();
  const isPrincipal = role === "principal";
  const [tab, setTab] = useState<"school" | "personal">("school");
  const [q, setQ] = useState("");
  const pct = Math.round((SCHOOL.used / SCHOOL.total) * 100);

  const rows = useMemo(
    () => TEACHERS.filter((t) => t.name.toLowerCase().includes(q.trim().toLowerCase())),
    [q],
  );

  return (
    <AppShell role={role}>
      <section className="space-y-4">
        <div>
          <h1 className="text-[19px] font-bold text-slate-800">Quản lý dung lượng</h1>
          {!isPrincipal && (
            <p className="text-[13px] text-slate-500">
              Quản lý dung lượng cá nhân bạn đã sử dụng trên hệ thống LMS.
            </p>
          )}
        </div>

        {isPrincipal && (
          <div className="flex items-center gap-6 border-b">
            {([
              ["school", "Dung lượng bộ nhớ toàn trường"],
              ["personal", "Dung lượng bộ nhớ cá nhân"],
            ] as const).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                className={`pb-2 text-[15px] font-bold transition ${
                  tab === k
                    ? "text-slate-800 border-b-2 border-indigo-600"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {(!isPrincipal || tab === "personal") && <PersonalStoragePanel />}

        {isPrincipal && tab === "school" && (
          <>
            <div className="bg-white rounded-xl border p-5 max-w-2xl">
              <p className="flex items-end gap-2">
                <span className="text-4xl font-bold text-slate-800">{pct}%</span>
                <span className="text-[15px] text-slate-500 mb-1">đã dùng</span>
              </p>

              <div className="mt-4 flex items-center justify-between text-[14px] text-slate-500">
                <span>{SCHOOL.used} GB</span>
                <span>{SCHOOL.total} GB</span>
              </div>
              <div className="mt-1 h-4 w-full rounded-full bg-slate-100 overflow-hidden flex">
                {SCHOOL.segs.map((s) => (
                  <div
                    key={s.label}
                    className={s.color}
                    style={{ width: `${(s.gb / SCHOOL.total) * 100}%` }}
                    title={`${s.label}: ${fmt(s.gb)} GB`}
                  />
                ))}
              </div>

              <ul className="mt-4 space-y-2">
                {SCHOOL.segs.map((s) => (
                  <li key={s.label} className="flex items-center justify-between text-[14px]">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className={`h-2.5 w-6 rounded-full ${s.color}`} />
                      {s.label}
                    </span>
                    <span className="font-semibold text-slate-800">{fmt(s.gb)} GB</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl border">
              <div className="p-3 border-b flex items-center gap-3">
                <h2 className="text-[15px] font-semibold text-slate-800">
                  Dung lượng sử dụng theo giáo viên
                </h2>
                <div className="ml-auto relative">
                  <Search className="h-4 w-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Tìm giáo viên..."
                    className="h-9 w-[220px] pl-8 text-[13px]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead className="bg-indigo-50 text-slate-700">
                    <tr>
                      {["STT", "Tên giáo viên", "Ngày sinh", "Môn dạy", "Lớp phụ trách", "Dung lượng sử dụng"].map((h) => (
                        <th key={h} className="px-3 py-2 font-semibold text-center whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((t, i) => (
                      <tr key={t.name} className="border-t text-center">
                        <td className="px-3 py-2 text-slate-500">{i + 1}</td>
                        <td className="px-3 py-2 font-semibold text-slate-800 text-left">{t.name}</td>
                        <td className="px-3 py-2 text-slate-500">{t.dob}</td>
                        <td className="px-3 py-2 text-slate-600">{t.subjects}</td>
                        <td className="px-3 py-2 text-sky-600">{t.classes}</td>
                        <td className="px-3 py-2 font-semibold text-slate-800">{t.size}</td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-center text-slate-400">
                          Không tìm thấy giáo viên phù hợp
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>
    </AppShell>
  );
}
