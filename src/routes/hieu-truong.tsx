import { Fragment, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Video, BookOpen, HardDrive, Crown, UserX, FileWarning,
  CalendarX2, GraduationCap, Check, X, User, Bell, Eye,
  ChevronLeft, ChevronRight, TrendingUp,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { WEEKS, getCurrentWeekIdx } from "@/lib/school-weeks";


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
  { label: "Học liệu đã tải lên", value: "2.418", icon: Video, color: "bg-indigo-50 text-indigo-600", trend: 15 },
  { label: "Bài giảng đã tạo", value: "864", icon: BookOpen, color: "bg-emerald-50 text-emerald-600", trend: 8 },
  {
    label: "Lượt sử dụng Học liệu bản quyền", value: "1.236", icon: Crown, color: "bg-amber-50 text-amber-600",
    sub: "Số lượt sử dụng HLBQ để tạo bài tập, bài giảng, đề kiểm tra",
  },
  {
    label: "Dung lượng đã sử dụng", value: "324 GB", icon: HardDrive, color: "bg-sky-50 text-sky-600",
    storage: { used: 324, total: 500 },
    action: "storage" as const,
  },
];


const ROW2 = [
  { label: "G/v chưa đăng nhập trên 7 ngày", value: "5", icon: UserX, color: "bg-rose-50 text-rose-600", action: "remind-login" as const },
  { label: "G/v chưa từng tạo nội dung", value: "3", icon: FileWarning, color: "bg-orange-50 text-orange-600", sub: "Bao gồm bài giảng, học liệu, bài tập, bài kiểm tra", action: "remind-content" as const },
  { label: "Tiết học chưa tạo nội dung", value: "127", icon: CalendarX2, color: "bg-violet-50 text-violet-600", sub: "Bao gồm bài giảng, học liệu, bài tập, bài kiểm tra" },
  { label: "Học sinh chưa tham gia học", value: "42", icon: GraduationCap, color: "bg-teal-50 text-teal-600", sub: "Số học sinh chưa từng tham gia học và làm bài trên LMS", action: "view-students" as const },
];

const TEACHERS_NO_LOGIN = [
  { id: "t1", name: "Nguyễn Thị Lan", team: "Tổ Toán", info: "Đăng nhập gần nhất: 12/8/2026" },
  { id: "t2", name: "Trần Văn Hải", team: "Tổ Tiếng Việt", info: "Đăng nhập gần nhất: 10/8/2026" },
  { id: "t3", name: "Phạm Thu Hà", team: "Tổ Tiếng Anh", info: "Đăng nhập gần nhất: 08/8/2026" },
  { id: "t4", name: "Lê Minh Đức", team: "Tổ Năng khiếu", info: "Đăng nhập gần nhất: 05/8/2026" },
  { id: "t5", name: "Đỗ Quang Huy", team: "Tổ Toán", info: "Đăng nhập gần nhất: 02/8/2026" },
];

const TEACHERS_NO_CONTENT = [
  { id: "c1", name: "Vũ Thị Mai", team: "Tổ Tiếng Việt", info: "Chưa có nội dung nào" },
  { id: "c2", name: "Hoàng Văn Nam", team: "Tổ Toán", info: "Chưa có nội dung nào" },
  { id: "c3", name: "Ngô Thị Hạnh", team: "Tổ Năng khiếu", info: "Chưa có nội dung nào" },
];

const STUDENTS_INACTIVE = [
  { id: "s1", name: "Nguyễn Bảo An", team: "Lớp 1A", info: "Chưa từng đăng nhập" },
  { id: "s2", name: "Trần Gia Bảo", team: "Lớp 2B", info: "Chưa làm bài nào" },
  { id: "s3", name: "Lê Khánh Chi", team: "Lớp 3C", info: "Chưa từng đăng nhập" },
  { id: "s4", name: "Phạm Minh Dũng", team: "Lớp 4A", info: "Chưa làm bài nào" },
  { id: "s5", name: "Đặng Thùy Dương", team: "Lớp 5B", info: "Chưa từng đăng nhập" },
];


type DayCol = { label: string; date: string; today?: boolean };

/** 6 ngày (Thứ 2 → Thứ 7) của tuần học được chọn */
function buildDays(weekIdx: number): DayCol[] {
  const w = WEEKS.find((x) => x.idx === weekIdx) ?? WEEKS[0];
  const start = new Date(w.start);
  // lùi về thứ 2 của tuần chứa ngày bắt đầu
  const shift = (start.getDay() + 6) % 7;
  const monday = new Date(start);
  monday.setDate(start.getDate() - shift);
  const todayKey = new Date().toDateString();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      label: `Thứ ${i + 2}`,
      date: `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`,
      today: d.toDateString() === todayKey,
    };
  });
}

const GRADES = [1, 2, 3, 4, 5].map((g) => ({
  grade: g,
  classes: ["A", "B", "C", "D", "E", "G", "H"].map((s) => `${g}${s}`),
}));

/** Tiến độ soạn nội dung giả lập, ổn định theo tên lớp + ngày */
function slotStat(cls: string, dayIdx: number) {
  let h = dayIdx * 31;
  for (const ch of cls) h = (h * 33 + ch.charCodeAt(0)) % 997;
  const total = 3 + (h % 4); // 3..6
  // một vài ngày chưa soạn nội dung nào (0 tiết) để cảnh báo
  if (h % 7 === 0) return { done: 0, total };
  const done = Math.max(1, total - (h % 3));
  return { done: Math.min(done, total), total };
}

/* ---------------- Page ---------------- */
function PrincipalHome() {
  const navigate = useNavigate();
  const [pending, setPending] = useState<PendingExam[]>(PENDING_EXAMS_SEED);
  const [dialog, setDialog] = useState<"remind-login" | "remind-content" | "view-students" | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const dialogCfg = useMemo(() => {
    if (dialog === "remind-content")
      return { title: "Giáo viên chưa từng tạo nội dung", desc: "Chọn giáo viên để gửi nhắc nhở tạo nội dung.", rows: TEACHERS_NO_CONTENT, colTeam: "Tổ môn" };
    if (dialog === "view-students")
      return { title: "Học sinh chưa tham gia học", desc: "Chọn học sinh để gửi nhắc nhở tham gia học trên LMS.", rows: STUDENTS_INACTIVE, colTeam: "Lớp" };
    return { title: "Giáo viên chưa đăng nhập trên 7 ngày", desc: "Chọn giáo viên để gửi nhắc nhở đăng nhập hệ thống.", rows: TEACHERS_NO_LOGIN, colTeam: "Tổ môn" };
  }, [dialog]);

  useEffect(() => { setSelected([]); }, [dialog]);

  const removeExam = (id: string) => setPending((p) => p.filter((e) => e.id !== id));

  const [weekIdx, setWeekIdx] = useState(getCurrentWeekIdx());
  const [grade, setGrade] = useState("1");

  const week = WEEKS.find((w) => w.idx === weekIdx) ?? WEEKS[0];
  const DAYS = useMemo(() => buildDays(weekIdx), [weekIdx]);
  const gradeBlocks = useMemo(
    () => GRADES.filter((g) => String(g.grade) === grade),
    [grade],
  );


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
                  <Button className="h-9 text-[13px] bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => removeExam(e.id)}>
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
          {[...ROW1, ...ROW2].map((k) => {
            const action = ("action" in k ? k.action : undefined) as "remind-login" | "remind-content" | "view-students" | undefined;
            return (
            <div key={k.label} className="bg-white rounded-xl border p-4 flex items-start gap-3 relative">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${k.color}`}>
                <k.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 pr-7">
                <p className="text-[13px] text-slate-500 leading-tight">{k.label}</p>
                <p className="text-2xl font-bold text-slate-800 leading-tight mt-0.5">{k.value}</p>
                {"trend" in k && typeof k.trend === "number" && (
                  <p className="text-[12px] font-semibold text-emerald-600 mt-0.5 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" /> +{k.trend}% so với tháng trước
                  </p>
                )}
                {"sub" in k && k.sub && (
                  <p className="text-[12px] text-slate-400 mt-0.5 leading-snug">{k.sub}</p>
                )}
                {"storage" in k && k.storage && (
                  <div className="mt-2">
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-sky-500"
                        style={{ width: `${Math.round((k.storage.used / k.storage.total) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[12px] text-slate-400 mt-1">
                      {k.storage.used} GB / {k.storage.total} GB tổng dung lượng trường
                      ({Math.round((k.storage.used / k.storage.total) * 100)}%)
                    </p>
                  </div>
                )}
              </div>
              {action === "storage" ? (
                <Link
                  to="/he-thong/quan-ly-dung-luong"
                  aria-label="Sang trang Quản lý dung lượng"
                  title="Quản lý dung lượng"
                  className="absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center text-white shadow-sm transition bg-sky-500 hover:bg-sky-600"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              ) : action ? (
                <button
                  type="button"
                  aria-label={action === "view-students" ? "Xem danh sách học sinh" : "Nhắc nhở giáo viên"}
                  title={action === "view-students" ? "Xem danh sách" : "Nhắc nhở"}
                  onClick={() => setDialog(action)}
                  className={`absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center text-white shadow-sm transition ${
                    action === "view-students"
                      ? "bg-teal-500 hover:bg-teal-600"
                      : "bg-indigo-500 hover:bg-indigo-600 animate-pulse"
                  }`}
                >
                  {action === "view-students" ? <Eye className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                  {action !== "view-students" && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
                  )}
                </button>
              ) : null}

            </div>
            );
          })}

        </div>

      </section>

      {/* Tiến độ soạn nội dung cho tuần học */}
      <section className="space-y-3">
        <h2 className="text-[15px] font-semibold text-slate-800">
          Tiến độ soạn nội dung cho tuần học
        </h2>

        <div className="bg-white rounded-xl border">
          <div className="p-3 border-b flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg border px-1 py-0.5">
              <Button
                variant="ghost" size="icon" className="h-8 w-8"
                aria-label="Tuần trước"
                disabled={weekIdx <= 1}
                onClick={() => setWeekIdx((w) => Math.max(1, w - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-2 text-center min-w-[190px]">
                <div className="text-[13px] font-semibold text-slate-800">{week.label}</div>
                <div className="text-[12px] text-slate-500">{week.range}</div>
              </div>
              <Button
                variant="ghost" size="icon" className="h-8 w-8"
                aria-label="Tuần sau"
                disabled={weekIdx >= WEEKS.length}
                onClick={() => setWeekIdx((w) => Math.min(WEEKS.length, w + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger className="h-9 w-[150px] text-[13px]">
                <SelectValue placeholder="Lọc theo khối" />
              </SelectTrigger>
              <SelectContent>
                {GRADES.map((g) => (
                  <SelectItem key={g.grade} value={String(g.grade)}>Khối {g.grade}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="ml-auto text-[12px] text-slate-400">
              Số tiết có ít nhất 1 nội dung / Tổng số tiết trong ngày
            </span>
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
                return (
                  <Fragment key={g.grade}>
                    <tr key={`h-${g.grade}`} className="bg-sky-50">
                      <td colSpan={DAYS.length + 1} className="px-3 py-1.5 text-[13px] font-semibold text-sky-700">
                        Khối {g.grade} · {g.classes.length} lớp
                      </td>

                    </tr>
                    {g.classes.map((cls) => (
                      <tr key={cls} className="border-t">
                        <td className="px-3 py-2 font-semibold text-slate-800">{cls}</td>
                        {DAYS.map((d, i) => {
                          const { done, total } = slotStat(cls, i);
                          const full = done === total;
                          const empty = done === 0;
                          return (
                            <td key={d.label} className="px-2 py-2">
                              <div className={`rounded-lg border text-center py-2 ${
                                empty
                                  ? "bg-rose-50 border-rose-300 text-rose-700"
                                  : full
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
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t text-right">
          <Button asChild variant="outline" className="h-9 text-[13px]">
            <Link to="/hieu-truong/thong-ke-truong">Xem thống kê chi tiết</Link>
          </Button>
        </div>
        </div>
      </section>

      {/* Popup nhắc nhở / xem danh sách */}
      <Dialog open={dialog !== null} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[16px]">{dialogCfg.title}</DialogTitle>
            <DialogDescription className="text-[13px]">{dialogCfg.desc}</DialogDescription>
          </DialogHeader>
          <div className="max-h-[380px] overflow-auto border rounded-lg">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="w-10 px-3 py-2">
                    <Checkbox
                      checked={selected.length > 0 && selected.length === dialogCfg.rows.length}
                      onCheckedChange={(v) =>
                        setSelected(v ? dialogCfg.rows.map((r) => r.id) : [])
                      }
                    />
                  </th>
                  <th className="px-3 py-2 text-left">Họ và tên</th>
                  <th className="px-3 py-2 text-left">{dialogCfg.colTeam}</th>
                  <th className="px-3 py-2 text-left">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {dialogCfg.rows.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-3 py-2">
                      <Checkbox
                        checked={selected.includes(r.id)}
                        onCheckedChange={(v) =>
                          setSelected((p) => (v ? [...p, r.id] : p.filter((x) => x !== r.id)))
                        }
                      />
                    </td>
                    <td className="px-3 py-2 font-semibold text-slate-800">{r.name}</td>
                    <td className="px-3 py-2 text-slate-600">{r.team}</td>
                    <td className="px-3 py-2 text-slate-500">{r.info}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DialogFooter>
            <Button variant="outline" className="h-9 text-[13px]" onClick={() => setDialog(null)}>
              Đóng
            </Button>
            <Button
              className="h-9 text-[13px]"
              disabled={selected.length === 0}
              onClick={() => {
                toast.success(`Đã gửi nhắc nhở tới ${selected.length} người`);
                setDialog(null);
              }}
            >
              <Bell className="h-4 w-4 mr-1" /> Gửi nhắc nhở ({selected.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

