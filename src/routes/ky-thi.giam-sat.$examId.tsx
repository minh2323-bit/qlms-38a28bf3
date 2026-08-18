import { useMemo, useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { FilterSelect } from "@/components/ExamBankShared";
import {
  getSession, getCandidates, CANDIDATE_STATUS_META, type CandidateStatus,
} from "@/lib/exam-sessions";
import { ArrowLeft, Search, ShieldAlert, RotateCcw, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/ky-thi/giam-sat/$examId")({
  head: () => ({
    meta: [
      { title: "Giám sát / Theo dõi kỳ thi | Tiểu học Tô Hiệu" },
      { name: "description", content: "Theo dõi trực tiếp tình trạng làm bài của thí sinh trong kỳ thi đang diễn ra." },
      { property: "og:title", content: "Giám sát kỳ thi" },
      { property: "og:description", content: "Theo dõi trực tiếp tình trạng làm bài của thí sinh trong kỳ thi đang diễn ra." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const STATUS_KEYS = Object.keys(CANDIDATE_STATUS_META) as CandidateStatus[];

function Donut({ counts, total }: { counts: Record<CandidateStatus, number>; total: number }) {
  const r = 120;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg viewBox="0 0 320 320" className="w-full max-w-[380px] mx-auto">
      <circle cx="160" cy="160" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="56" />
      {STATUS_KEYS.map((k) => {
        const v = total ? counts[k] / total : 0;
        const seg = (
          <circle
            key={k}
            cx="160" cy="160" r={r} fill="none"
            stroke={CANDIDATE_STATUS_META[k].color}
            strokeWidth="56"
            strokeDasharray={`${v * c} ${c}`}
            strokeDashoffset={-offset * c}
            transform="rotate(-90 160 160)"
          />
        );
        offset += v;
        return seg;
      })}
      <circle cx="160" cy="160" r="86" fill="white" />
      <text x="160" y="150" textAnchor="middle" className="fill-slate-800" fontSize="40" fontWeight="700">{total}</text>
      <text x="160" y="180" textAnchor="middle" className="fill-slate-500" fontSize="16">thí sinh</text>
    </svg>
  );
}

function Page() {
  const { examId } = Route.useParams();
  const router = useRouter();
  const session = getSession(examId);
  const [grade, setGrade] = useState("all");
  const [klass, setKlass] = useState("all");
  const [status, setStatus] = useState("all");
  const [code, setCode] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const all = useMemo(() => (session ? getCandidates(session) : []), [session]);
  const rows = useMemo(
    () => all.filter((c) =>
      (grade === "all" || c.klass.startsWith(grade))
      && (klass === "all" || c.klass === klass)
      && (status === "all" || c.status === status)
      && (code.trim() === "" || c.cccd.includes(code.trim()) || c.name.toLowerCase().includes(code.trim().toLowerCase()))),
    [all, grade, klass, status, code],
  );

  const counts = useMemo(() => {
    const base = { absent: 0, submitted: 0, doing: 0, failed: 0 } as Record<CandidateStatus, number>;
    all.forEach((c) => { base[c.status] += 1; });
    return base;
  }, [all]);

  if (!session) {
    return <AppShell><div className="p-8 text-slate-500">Không tìm thấy kỳ thi.</div></AppShell>;
  }

  const isXa = session.level === "xa";
  const classes = Array.from(new Set(all.map((c) => c.klass))).sort();
  const allChecked = rows.length > 0 && rows.every((r) => selected.includes(r.cccd));

  return (
    <AppShell>
      <section className="bg-white rounded-2xl border shadow-sm">
        <div className="px-6 py-4 border-b flex items-center gap-3 flex-wrap">
          <Button variant="outline" onClick={() => router.history.back()}>
            <ArrowLeft className="h-4 w-4" /> Quay lại
          </Button>
          <div className="flex-1 min-w-[220px]">
            <h1 className="text-lg font-bold text-indigo-700">
              {isXa ? "Theo dõi kỳ thi" : "Giám sát kỳ thi"} – {session.name}
            </h1>
            <p className="text-sm text-slate-500">
              {session.date} · {session.timeRange} · Khối {session.grade} · {session.subject}
            </p>
          </div>
          <div className="flex gap-2">
            {!isXa && (
              <>
                <Button variant="outline" disabled={!selected.length}
                  onClick={() => { toast.success(`Đã ghi nhận vi phạm quy chế cho ${selected.length} thí sinh.`); setSelected([]); }}>
                  <ShieldAlert className="h-4 w-4" /> Vi phạm quy chế thi
                </Button>
                <Button variant="outline" disabled={!selected.length}
                  onClick={() => { toast.success(`Đã cho ${selected.length} thí sinh thi lại.`); setSelected([]); }}>
                  <RotateCcw className="h-4 w-4" /> Cho thi lại
                </Button>
              </>
            )}
            <Button className="bg-indigo-700 hover:bg-indigo-800" onClick={() => toast.success("Đang xuất Excel...")}>
              <FileSpreadsheet className="h-4 w-4" /> Xuất excel
            </Button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <FilterSelect label="Khối" value={grade} onChange={setGrade} allLabel="Tất cả khối"
                options={["1", "2", "3", "4", "5"].map((g) => ({ value: g, label: `Khối ${g}` }))} />
              <FilterSelect label="Lớp" value={klass} onChange={setKlass} allLabel="Tất cả lớp"
                options={classes.map((c) => ({ value: c, label: c }))} />
              <FilterSelect label="Trạng thái" value={status} onChange={setStatus} allLabel="Tất cả trạng thái"
                options={STATUS_KEYS.map((k) => ({ value: k, label: CANDIDATE_STATUS_META[k].label }))} />
            </div>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="pl-9 bg-white" placeholder="Mã thí sinh / họ tên"
                value={code} onChange={(e) => setCode(e.target.value)} />
            </div>

            <div className="rounded-xl border overflow-x-auto">
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-12 text-center">STT</TableHead>
                    <TableHead className="w-12 text-center">
                      <Checkbox checked={allChecked}
                        onCheckedChange={() => setSelected(allChecked ? [] : rows.map((r) => r.cccd))}
                        aria-label="Chọn tất cả" />
                    </TableHead>
                    <TableHead>Thông tin thí sinh</TableHead>
                    <TableHead className="text-center w-24">Lớp</TableHead>
                    <TableHead className="text-center w-40">Thời gian thi</TableHead>
                    <TableHead className="text-center w-52">Trạng thái</TableHead>
                    <TableHead className="text-center w-24">Điểm thi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((c, i) => (
                    <TableRow key={c.cccd} className="hover:bg-slate-50">
                      <TableCell className="text-center text-slate-500">{i + 1}</TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={selected.includes(c.cccd)}
                          onCheckedChange={() => setSelected((s) => s.includes(c.cccd) ? s.filter((x) => x !== c.cccd) : [...s, c.cccd])}
                          aria-label={`Chọn ${c.name}`} />
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-slate-800">{c.name}</div>
                        <div className="text-xs text-slate-500">Mã: {c.cccd}</div>
                      </TableCell>
                      <TableCell className="text-center">{c.klass}</TableCell>
                      <TableCell className="text-center text-sm">{c.startAt}</TableCell>
                      <TableCell className="text-center text-sm">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full" style={{ background: CANDIDATE_STATUS_META[c.status].color }} />
                          {CANDIDATE_STATUS_META[c.status].label}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">{c.score ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-slate-500 py-10">Không có dữ liệu.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="rounded-xl border p-6">
            <div className="text-sm font-semibold text-slate-700 mb-4">Tình trạng làm bài</div>
            <Donut counts={counts} total={all.length} />
            <div className="mt-6 space-y-2">
              {STATUS_KEYS.map((k) => (
                <div key={k} className="flex items-center gap-2 text-sm">
                  <span className="h-3 w-3 rounded-full" style={{ background: CANDIDATE_STATUS_META[k].color }} />
                  <span className="flex-1 text-slate-600">{CANDIDATE_STATUS_META[k].label}</span>
                  <span className="font-semibold text-slate-800">
                    {counts[k]} ({all.length ? Math.round((counts[k] / all.length) * 100) : 0}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
