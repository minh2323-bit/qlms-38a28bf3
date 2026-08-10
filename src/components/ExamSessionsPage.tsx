import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { FilterSelect } from "@/components/ExamBankShared";
import { GRADES, SUBJECTS } from "@/lib/shared-exam-bank";
import { Search, Eye, Landmark, Building2, School, RotateCcw } from "lucide-react";

export type ExamLevel = "truong" | "xa" | "so";
export type ExamStatus = "upcoming" | "ongoing" | "done";

export type ExamSession = {
  id: string;
  name: string;
  level: ExamLevel;
  grade: string;
  subject: string;
  date: string;
  minutes: number;
  students: number;
  submitted: number;
  status: ExamStatus;
  avgScore: number;
  /** phân bố điểm: [<5, 5-6.4, 6.5-7.9, 8-10] */
  dist: [number, number, number, number];
};

const TABS: { key: ExamLevel; label: string; icon: typeof School }[] = [
  { key: "truong", label: "Kỳ thi cấp Trường", icon: School },
  { key: "xa", label: "Kỳ thi cấp Xã/Phường", icon: Building2 },
  { key: "so", label: "Kỳ thi cấp Sở", icon: Landmark },
];

const STATUS_META: Record<ExamStatus, { label: string; cls: string }> = {
  upcoming: { label: "Sắp diễn ra", cls: "bg-amber-100 text-amber-700 hover:bg-amber-100" },
  ongoing: { label: "Đang diễn ra", cls: "bg-sky-100 text-sky-700 hover:bg-sky-100" },
  done: { label: "Đã kết thúc", cls: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" },
};

const DIST_LABELS = ["Dưới 5", "5 – 6,4", "6,5 – 7,9", "8 – 10"];
const DIST_COLORS = ["bg-rose-500", "bg-amber-500", "bg-sky-500", "bg-emerald-500"];

export function ExamSessionsPage({
  title, subtitle, icon: Icon, data,
}: {
  title: string;
  subtitle: string;
  icon: typeof School;
  data: ExamSession[];
}) {
  const [tab, setTab] = useState<ExamLevel>("truong");
  const [q, setQ] = useState("");
  const [grade, setGrade] = useState("all");
  const [subject, setSubject] = useState("all");
  const [status, setStatus] = useState("all");
  const [detail, setDetail] = useState<ExamSession | null>(null);

  const rows = useMemo(
    () => data.filter((e) =>
      e.level === tab
      && (q.trim() === "" || e.name.toLowerCase().includes(q.trim().toLowerCase()))
      && (grade === "all" || e.grade === grade)
      && (subject === "all" || e.subject === subject)
      && (status === "all" || e.status === status)),
    [data, tab, q, grade, subject, status],
  );

  const reset = () => { setQ(""); setGrade("all"); setSubject("all"); setStatus("all"); };

  return (
    <AppShell>
      <section className="bg-white rounded-2xl border shadow-sm">
        <div className="px-6 py-4 border-b flex items-start gap-3">
          <Icon className="h-6 w-6 text-indigo-700 mt-0.5" />
          <div>
            <h1 className="text-xl font-bold text-slate-800">{title}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
          </div>
        </div>

        <div className="px-6 pt-4 flex gap-2 border-b">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition flex items-center gap-1.5 ${
                tab === t.key
                  ? "border-indigo-700 text-indigo-700"
                  : "border-transparent text-slate-600 hover:text-indigo-700"
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Tìm kiếm</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  className="pl-9 bg-white"
                  placeholder="Tìm theo tên kỳ thi..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
            </div>
            <FilterSelect
              label="Khối" value={grade} onChange={setGrade} allLabel="Tất cả khối"
              options={GRADES.map((g) => ({ value: g, label: `Khối ${g}` }))}
            />
            <FilterSelect
              label="Môn" value={subject} onChange={setSubject} allLabel="Tất cả môn"
              options={SUBJECTS.map((s) => ({ value: s, label: s }))}
            />
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <FilterSelect
                  label="Trạng thái" value={status} onChange={setStatus} allLabel="Tất cả trạng thái"
                  options={(Object.keys(STATUS_META) as ExamStatus[]).map((s) => ({ value: s, label: STATUS_META[s].label }))}
                />
              </div>
              <Button variant="outline" onClick={reset} title="Đặt lại bộ lọc">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-14 text-center">STT</TableHead>
                  <TableHead>Tên kỳ thi</TableHead>
                  <TableHead className="text-center w-20">Khối</TableHead>
                  <TableHead className="w-36">Môn</TableHead>
                  <TableHead className="text-center w-32">Thời gian</TableHead>
                  <TableHead className="text-center w-28">Số học sinh</TableHead>
                  <TableHead className="text-center w-36">Trạng thái</TableHead>
                  <TableHead className="text-center w-36">Thống kê kết quả</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((e, i) => (
                  <TableRow key={e.id} className="hover:bg-slate-50">
                    <TableCell className="text-center text-slate-500">{i + 1}</TableCell>
                    <TableCell className="font-semibold text-slate-800">{e.name}</TableCell>
                    <TableCell className="text-center">{e.grade}</TableCell>
                    <TableCell>{e.subject}</TableCell>
                    <TableCell className="text-center text-sm">
                      <div className="font-medium text-slate-700">{e.date}</div>
                      <div className="text-xs text-slate-500">{e.minutes} phút</div>
                    </TableCell>
                    <TableCell className="text-center">{e.students}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={STATUS_META[e.status].cls}>{STATUS_META[e.status].label}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() => setDetail(e)}
                        title="Xem chi tiết thống kê"
                        aria-label={`Xem chi tiết thống kê ${e.name}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border text-indigo-700 hover:bg-indigo-50"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-slate-500 py-10">
                      Không có kỳ thi nào phù hợp bộ lọc.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      <Dialog open={!!detail} onOpenChange={(v) => !v && setDetail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thống kê kết quả</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-slate-50 p-3 text-sm">
                <div className="font-semibold text-slate-800">{detail.name}</div>
                <div className="text-slate-500 mt-0.5">
                  Khối {detail.grade} · {detail.subject} · {detail.date} · {detail.minutes} phút
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Học sinh dự thi", value: detail.students },
                  { label: "Đã nộp bài", value: detail.submitted },
                  {
                    label: "Tỷ lệ nộp",
                    value: `${detail.students ? Math.round((detail.submitted / detail.students) * 100) : 0}%`,
                  },
                  { label: "Điểm trung bình", value: detail.avgScore.toFixed(1) },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border p-3 text-center">
                    <div className="text-2xl font-bold text-indigo-700">{s.value}</div>
                    <div className="text-xs text-slate-500 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-700 mb-2">Phân bố điểm</div>
                <div className="space-y-2">
                  {detail.dist.map((v, i) => {
                    const total = detail.dist.reduce((a, b) => a + b, 0) || 1;
                    return (
                      <div key={DIST_LABELS[i]} className="flex items-center gap-3 text-sm">
                        <div className="w-20 text-slate-600">{DIST_LABELS[i]}</div>
                        <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
                          <div className={`h-full ${DIST_COLORS[i]}`} style={{ width: `${(v / total) * 100}%` }} />
                        </div>
                        <div className="w-24 text-right text-slate-600">
                          {v} HS ({Math.round((v / total) * 100)}%)
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
