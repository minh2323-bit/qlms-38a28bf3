import { useMemo, useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { FilterSelect } from "@/components/ExamBankShared";
import { getSession, getCandidates } from "@/lib/exam-sessions";
import { ArrowLeft, FileText, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/ky-thi/tra-cuu/$examId")({
  head: () => ({
    meta: [
      { title: "Tra cứu kết quả kỳ thi | Tiểu học Tô Hiệu" },
      { name: "description", content: "Tra cứu chi tiết kết quả từng thí sinh: thời gian thi, điểm, lượt vi phạm và điểm cuối." },
      { property: "og:title", content: "Tra cứu kết quả kỳ thi" },
      { property: "og:description", content: "Tra cứu chi tiết kết quả từng thí sinh: thời gian thi, điểm, lượt vi phạm và điểm cuối." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const { examId } = Route.useParams();
  const router = useRouter();
  const session = getSession(examId);
  const [klass, setKlass] = useState("all");
  const [cccd, setCccd] = useState("");
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const all = useMemo(() => (session ? getCandidates(session) : []), [session]);
  const rows = useMemo(
    () => all.filter((c) =>
      (klass === "all" || c.klass === klass)
      && (cccd.trim() === "" || c.cccd.includes(cccd.trim()))
      && (name.trim() === "" || c.name.toLowerCase().includes(name.trim().toLowerCase()))),
    [all, klass, cccd, name],
  );

  if (!session) {
    return <AppShell><div className="p-8 text-slate-500">Không tìm thấy kỳ thi.</div></AppShell>;
  }

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
            <h1 className="text-lg font-bold text-indigo-700">Tra cứu kết quả kỳ thi – {session.name}</h1>
            <p className="text-sm text-slate-500">
              {session.date} · {session.timeRange} · Khối {session.grade} · {session.subject}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.success("Đang xuất PDF...")}>
              <FileText className="h-4 w-4" /> Xuất PDF
            </Button>
            <Button className="bg-indigo-700 hover:bg-indigo-800" onClick={() => toast.success("Đang xuất Excel...")}>
              <FileSpreadsheet className="h-4 w-4" /> Xuất excel
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <FilterSelect label="Lớp" value={klass} onChange={setKlass} allLabel="– Tất cả –"
              options={classes.map((c) => ({ value: c, label: c }))} />
            <div>
              <Label className="text-sm">Mã CCCD</Label>
              <Input className="mt-1 bg-white" value={cccd} onChange={(e) => setCccd(e.target.value)} placeholder="Nhập mã CCCD" />
            </div>
            <div>
              <Label className="text-sm">Họ tên</Label>
              <Input className="mt-1 bg-white" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập họ tên" />
            </div>
          </div>

          <div className="rounded-xl border overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-12 text-center">STT</TableHead>
                  <TableHead className="w-12 text-center">
                    <Checkbox checked={allChecked}
                      onCheckedChange={() => setSelected(allChecked ? [] : rows.map((r) => r.cccd))}
                      aria-label="Chọn tất cả" />
                  </TableHead>
                  <TableHead>Họ và tên</TableHead>
                  <TableHead className="w-40">Mã CCCD</TableHead>
                  <TableHead className="text-center w-24">Lớp</TableHead>
                  <TableHead className="text-center w-52">Thời gian thi – Thời gian nộp</TableHead>
                  <TableHead className="text-center w-20">Điểm</TableHead>
                  <TableHead className="text-center w-28">Lượt vi phạm</TableHead>
                  <TableHead className="text-center w-24">Điểm cuối</TableHead>
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
                    <TableCell className="font-semibold text-slate-800">{c.name}</TableCell>
                    <TableCell>{c.cccd}</TableCell>
                    <TableCell className="text-center">{c.klass}</TableCell>
                    <TableCell className="text-center text-sm">
                      <div>{c.startAt}</div>
                      <div className="text-slate-500">{c.submitAt}</div>
                    </TableCell>
                    <TableCell className="text-center">{c.score ?? "—"}</TableCell>
                    <TableCell className="text-center">
                      {c.violations > 0
                        ? <span className="text-rose-600 font-semibold">{c.violations}</span>
                        : <span className="text-slate-400">0</span>}
                    </TableCell>
                    <TableCell className="text-center font-semibold text-indigo-700">{c.finalScore ?? "—"}</TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-slate-500 py-10">Không có dữ liệu.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="text-sm text-slate-500">Tổng {rows.length} bản ghi</div>
        </div>
      </section>
    </AppShell>
  );
}
