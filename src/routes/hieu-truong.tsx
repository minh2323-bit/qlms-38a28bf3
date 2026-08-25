import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
} from "recharts";
import {
  Video, BookOpen, HelpCircle, Crown, UserX, FileWarning,
  CalendarX2, GraduationCap, ChevronDown, ChevronUp, Check, X, User,
} from "lucide-react";

export const Route = createFileRoute("/hieu-truong")({
  head: () => ({
    meta: [
      { title: "Trang chủ Hiệu trưởng – Giám sát hoạt động giảng dạy | QLMS" },
      { name: "description", content: "Bảng điều hành của Hiệu trưởng: kỳ thi cần duyệt, thống kê hoạt động của trường trên EneStudy và tiến độ soạn nội dung theo tiết học của từng lớp." },
      { property: "og:title", content: "Trang chủ Hiệu trưởng – Giám sát hoạt động giảng dạy" },
      { property: "og:description", content: "Kỳ thi cần duyệt, thống kê hoạt động trường và tiến độ soạn nội dung theo lớp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrincipalHome,
});

/* ---------------- Mock data ---------------- */
type PendingExam = {
  id: string; name: string; grade: string; subject: string; start: string; to: string;
};

const PENDING_EXAMS_SEED: PendingExam[] = [
  { id: "e1", name: "[HEID] Ngoại ngữ - Ôn luyện", grade: "Khối 4", subject: "Tiếng Anh", start: "31/08/2026, 00:00", to: "/ky-thi/on-tap" },
  { id: "e2", name: "Khảo sát giữa kỳ II – Toán 5", grade: "Khối 5", subject: "Toán", start: "12/09/2026, 07:30", to: "/ky-thi/chinh-thuc" },
  { id: "e3", name: "Kiểm tra cuối kỳ – Tiếng Việt 3", grade: "Khối 3", subject: "Tiếng Việt", start: "20/09/2026, 08:00", to: "/ky-thi/chinh-thuc" },
];

const ROW1 = [
  { label: "HL đã tải lên", value: "2.418", icon: Video, color: "bg-indigo-50 text-indigo-600" },
  { label: "BG đã tạo", value: "864", icon: BookOpen, color: "bg-emerald-50 text-emerald-600" },
  { label: "Ngân hàng câu hỏi", value: "12.507", icon: HelpCircle, color: "bg-sky-50 text-sky-600" },
  {
    label: "Lượt sử dụng Học liệu bản quyền", value: "1.236", icon: Crown, color: "bg-amber-50 text-amber-600",
    sub: "Số lượt sử dụng HLBQ để tạo bài tập, bài giảng, đề kiểm tra",
  },
];

const ROW2 = [
  { label: "G/v chưa đăng nhập trên 7 ngày", value: "5", icon: UserX, color: "bg-rose-50 text-rose-600" },
  { label: "G/v chưa từng tạo nội dung", value: "3", icon: FileWarning, color: "bg-orange-50 text-orange-600", sub: "Bao gồm bài giảng, học liệu, bài tập, bài kiểm tra" },
  { label: "Tiết học chưa tạo nội dung", value: "127", icon: CalendarX2, color: "bg-violet-50 text-violet-600", sub: "Bao gồm bài giảng, học liệu, bài tập, bài kiểm tra" },
  { label: "Học sinh chưa tham gia học", value: "42", icon: GraduationCap, color: "bg-teal-50 text-teal-600", sub: "Số học sinh chưa từng tham gia học và làm bài trên LMS" },
];

const HL_SHARE = [
  { name: "Tổ Toán", value: 34, color: "#6366f1" },
  { name: "Tổ Tiếng Việt", value: 28, color: "#10b981" },
  { name: "Tổ Tiếng Anh", value: 18, color: "#0ea5e9" },
  { name: "Tổ Năng khiếu", value: 12, color: "#f59e0b" },
  { name: "Tổ khác", value: 8, color: "#f43f5e" },
];

const NHCH_SHARE = [
  { name: "Tổ Toán", value: 41, color: "#6366f1" },
  { name: "Tổ Tiếng Việt", value: 24, color: "#10b981" },
  { name: "Tổ Tiếng Anh", value: 21, color: "#0ea5e9" },
  { name: "Tổ Năng khiếu", value: 9, color: "#f59e0b" },
  { name: "Tổ khác", value: 5, color: "#f43f5e" },
];

const DAYS = [
  { label: "Thứ 2", date: "10/8/2026" },
  { label: "Thứ 3", date: "11/8/2026" },
  { label: "Thứ 4", date: "12/8/2026", today: true },
  { label: "Thứ 5", date: "13/8/2026" },
  { label: "Thứ 6", date: "14/8/2026" },
  { label: "Thứ 7", date: "15/8/2026" },
];

const GRADES = [1, 2, 3, 4, 5].map((g) => ({
  grade: g,
  classes: ["A", "B", "C", "D", "E", "G", "H"].map((s) => `${g}${s}`),
}));

/** Tiến độ soạn nội dung giả lập, ổn định theo tên lớp + ngày */
function slotStat(cls: string, dayIdx: number) {
  let h = dayIdx * 31;
  for (const ch of cls) h = (h * 33 + ch.charCodeAt(0)) % 997;
  const total = 3 + (h % 4); // 3..6
  const done = Math.max(2, total - (h % 3));
  return { done: Math.min(done, total), total };
}

/* ---------------- Page ---------------- */
function PrincipalHome() {
  const navigate = useNavigate();
  const [pending, setPending] = useState<PendingExam[]>(PENDING_EXAMS_SEED);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const removeExam = (id: string) => setPending((p) => p.filter((e) => e.id !== id));

  const gradeBlocks = useMemo(() => GRADES, []);

  return (
    <AppShell role="principal">
      {/* Kỳ thi cần duyệt */}
      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-[15px] font-semibold text-slate-800">Kỳ thi cần duyệt</h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {pending.map((e) => (
              <div
                key={e.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate({ to: e.to })}
                onKeyDown={(ev) => ev.key === "Enter" && navigate({ to: e.to })}
                className="bg-white rounded-xl border p-4 flex flex-wrap items-center gap-3 cursor-pointer hover:border-indigo-300 hover:shadow-sm transition"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold text-slate-800 flex items-center gap-1.5 truncate">
                    {e.name} <Crown className="h-4 w-4 text-amber-500 shrink-0" />
                  </p>
                  <p className="text-[13px] text-slate-500 mt-1">
                    {e.grade} · {e.subject} · Bắt đầu: {e.start}
                  </p>
                  <p className="text-[13px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> Người đề xuất: Nguyễn Tuấn Thành
                  </p>
                </div>
                <div className="flex items-center gap-2" onClick={(ev) => ev.stopPropagation()}>
                  <Button
                    variant="outline"
                    className="h-9 text-[13px] border-rose-200 text-rose-600 hover:bg-rose-50"
                    onClick={() => removeExam(e.id)}
                  >
                    <X className="h-4 w-4 mr-1" /> Từ chối
                  </Button>
                  <Button className="h-9 text-[13px]" onClick={() => removeExam(e.id)}>
                    <Check className="h-4 w-4 mr-1" /> Duyệt
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Thống kê hoạt động của trường */}
      <section className="space-y-3">
        <h2 className="text-[15px] font-semibold text-slate-800">
          Thống kê hoạt động của trường trên EneStudy
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...ROW1, ...ROW2].map((k) => (
            <div key={k.label} className="bg-white rounded-xl border p-4 flex items-start gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${k.color}`}>
                <k.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] text-slate-500 leading-tight">{k.label}</p>
                <p className="text-2xl font-bold text-slate-800 leading-tight mt-0.5">{k.value}</p>
                {"sub" in k && k.sub && (
                  <p className="text-[12px] text-slate-400 mt-0.5 leading-snug">{k.sub}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 2 biểu đồ tròn */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {[
            { title: "HL đóng góp theo tổ môn", data: HL_SHARE },
            { title: "NHCH đóng góp theo tổ môn", data: NHCH_SHARE },
          ].map((c) => (
            <div key={c.title} className="bg-white rounded-xl border p-4">
              <h3 className="text-[15px] font-semibold text-slate-800 mb-2">{c.title}</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={c.data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {c.data.map((g) => <Cell key={g.name} fill={g.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => `${v}%`} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      </section>

      {/* Bảng TKB theo ngày */}
      <section className="bg-white rounded-xl border">
        <div className="p-4 border-b flex flex-wrap items-center gap-2">
          <h2 className="text-[15px] font-semibold text-slate-800 mr-auto">
            Tiến độ soạn nội dung theo tiết học – Tuần 10/8 – 15/8/2026
          </h2>
          <span className="text-[12px] text-slate-400">Số tiết có ít nhất 1 nội dung / Tổng số tiết trong ngày</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2 text-left font-semibold w-24">Lớp</th>
                {DAYS.map((d) => (
                  <th key={d.label} className={`px-3 py-2 font-semibold text-center ${d.today ? "bg-indigo-50" : ""}`}>
                    <div>{d.label}</div>
                    <div className="text-[12px] font-normal text-slate-400">{d.date}</div>
                    {d.today && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[11px]">
                        Hôm nay
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gradeBlocks.map((g) => {
                const open = !!expanded[g.grade];
                const shown = open ? g.classes : g.classes.slice(0, 5);
                return (
                  <>
                    <tr key={`h-${g.grade}`} className="bg-amber-50/60">
                      <td colSpan={DAYS.length + 1} className="px-3 py-1.5 text-[13px] font-semibold text-amber-700">
                        Khối {g.grade} · {g.classes.length} lớp
                      </td>
                    </tr>
                    {shown.map((cls) => (
                      <tr key={cls} className="border-t">
                        <td className="px-3 py-2 font-semibold text-slate-800">{cls}</td>
                        {DAYS.map((d, i) => {
                          const { done, total } = slotStat(cls, i);
                          const full = done === total;
                          return (
                            <td key={d.label} className="px-2 py-2">
                              <div className={`rounded-lg border text-center py-2 ${
                                full
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                  : "bg-amber-50 border-amber-200 text-amber-700"
                              }`}>
                                <div className="font-bold">{done}/{total}</div>
                                <div className="text-[12px]">tiết đã soạn</div>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    {g.classes.length > 5 && (
                      <tr key={`m-${g.grade}`} className="border-t">
                        <td colSpan={DAYS.length + 1} className="px-3 py-2 text-center">
                          <Button
                            variant="ghost"
                            className="h-8 text-[13px] text-indigo-600"
                            onClick={() => setExpanded((p) => ({ ...p, [g.grade]: !open }))}
                          >
                            {open ? (<>Thu gọn <ChevronUp className="h-4 w-4 ml-1" /></>)
                              : (<>Xem thêm {g.classes.length - 5} lớp <ChevronDown className="h-4 w-4 ml-1" /></>)}
                          </Button>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t text-right">
          <Button asChild variant="outline" className="h-9 text-[13px]">
            <Link to="/thong-ke">Xem thống kê chi tiết</Link>
          </Button>
        </div>
      </section>
    </AppShell>
  );
}
