import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { CheckCircle2, FileSpreadsheet, Filter, Lock, Unlock, MoreVertical, History, Trash2, RefreshCw, Search, TriangleAlert } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { initialExamColumnSources, replaceExamColumnSource, examColumnType } from "@/lib/exam-score-columns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { AppShell } from "@/components/AppShell";
import { ScoreTypeFilter } from "@/components/ScoreTypeFilter";
import { SubjectFilter } from "@/components/SubjectFilter";
import { SCORE_SUBJECTS, filterScoreSubjects } from "@/lib/score-subjects";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { useDemoAccount } from "@/lib/demo-account";
import { downloadCsv } from "@/lib/report-export";
import { isValidScore } from "@/lib/score";
import { visibleScoreColumns } from "@/lib/score-column-filter";
import { ExamScorePicker } from "@/components/ExamScorePicker";
import { importExamColumn, sameScoreStudent, type ImportedScoreColumn, type ImportScoreType, type ScoreSourceExam } from "@/lib/exam-score-import";

export const Route = createFileRoute("/ky-thi/chuyen-diem")({
  head: () => ({
    meta: [
      { title: "Chuyển điểm thi sang CSDL | QLMS" },
      { name: "description", content: "Rà soát, chỉnh sửa và chuyển điểm GKI, CKI, GKII, CKII của học sinh sang cơ sở dữ liệu ngành." },
      { property: "og:title", content: "Chuyển điểm thi sang CSDL" },
      { property: "og:description", content: "Bảng điểm kỳ thi theo khối, lớp và nút xác nhận chuyển điểm sang CSDL." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ScoreTransferPage,
});

type ScoreKey = string;
type Row = { id: string; name: string; cccd: string; dob: string; khoi: string; lop: string; mon: string } & Record<ScoreKey, string>;

const NAMES = ["Nguyễn Minh Anh", "Trần Gia Bảo", "Lê Khánh Chi", "Phạm Đức Duy", "Hoàng Thu Hà", "Vũ Quang Huy", "Đặng Ngọc Lan", "Bùi Hải Long", "Phí Song Ngân", "Đỗ Minh Quân", "Ngô Thảo Vy", "Lý Tuấn Kiệt"];
const CLASSES = ["3A", "3B", "4A", "4B", "5A", "5B"];
const INITIAL: Row[] = CLASSES.flatMap((lop, ci) =>
  NAMES.slice(0, 6).map((_, i) => {
    const n = NAMES[(i + ci * 2) % NAMES.length];
    const seed = (i * 7 + ci * 3) % 10;
    const sc = (k: number) => (Math.min(10, 5 + ((seed + k) % 6) + ((seed + k) % 2) * 0.5)).toFixed(1).replace(/\.0$/, "");
    const year = 2019 - (Number(lop[0]) - 3);
    // GKI do 2 kỳ thi cùng chọn: phần lớn ở cột (1), một số ở cột (2), vài em có cả 2 (xung đột)
    const both = (i + ci) % 9 === 4;
    const inB = i % 3 === 2;
    return {
      id: `${lop}-${i}`, name: n, cccd: `0012190${String(ci * 100 + i * 37 + 10000).padStart(5, "0")}`, khoi: lop[0], lop,
      mon: SCORE_SUBJECTS[(ci + i) % SCORE_SUBJECTS.length],
      dob: `${String((i * 5 + ci) % 28 + 1).padStart(2, "0")}/${String((i + ci) % 12 + 1).padStart(2, "0")}/${year}`,
      gk1a: inB && !both ? "" : sc(0), gk1b: inB || both ? sc(4) : "",
      ck1: sc(1), gk2: sc(2), ck2: i === 5 ? "" : sc(3),
    };
  }),
);
const COLS: { key: ScoreKey; label: string; sub?: string }[] = [
  { key: "gk1a", label: "Điểm GKI", sub: "(1)" }, { key: "gk1b", label: "Điểm GKI", sub: "(2)" },
  { key: "ck1", label: "Điểm CKI" }, { key: "gk2", label: "Điểm GKII" }, { key: "ck2", label: "Điểm CKII" },
];
const conflict = (r: Row) => r.gk1a.trim() !== "" && r.gk1b.trim() !== "";

function MultiCheck({ label, value, options, onChange }: { label: string; value: string[]; options: { v: string; l: string }[]; onChange: (v: string[]) => void }) {
  const toggle = (k: string) => onChange(value.includes(k) ? value.filter((x) => x !== k) : [...value, k]);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-1.5 font-normal">
          <Filter className="h-4 w-4" />{label}: {value.length === 0 ? "Tất cả" : options.filter((o) => value.includes(o.v)).map((o) => o.v).join(", ")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-2" align="start">
        {options.map((o) => (
          <label key={o.v} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-muted">
            <Checkbox checked={value.includes(o.v)} onCheckedChange={() => toggle(o.v)} />{o.l}
          </label>
        ))}
        <div className="mt-2 border-t pt-2 flex justify-end"><Button variant="ghost" size="sm" onClick={() => onChange([])}>Tất cả</Button></div>
      </PopoverContent>
    </Popover>
  );
}

function ScoreTransferPage() {
  const account = useDemoAccount();
  const canEdit = account === "principal";
  const [rows, setRows] = useState(INITIAL);
  const [importedCols, setImportedCols] = useState<ImportedScoreColumn[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [sources, setSources] = useState(() => initialExamColumnSources(INITIAL, COLS));
  const [trace, setTrace] = useState<{ key: string; label: string } | null>(null);
  const [replacement, setReplacement] = useState<{ key: string; label: string; scoreType: ImportScoreType } | undefined>();
  const allCols: { key: string; label: string; sub?: string; examName?: string }[] = [...COLS, ...importedCols].filter((c) => !removed.includes(c.key));
  const [q, setQ] = useState("");
  const [khoi, setKhoi] = useState<string[]>([]);
  const [lop, setLop] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([...SCORE_SUBJECTS]);
  const [hiddenScoreKeys, setHiddenScoreKeys] = useState<string[]>([]);
  const [locked, setLocked] = useState<Set<ScoreKey>>(new Set(["ck1"]));
  const [transferred, setTransferred] = useState<string | null>(null);

  const lopOptions = CLASSES.filter((c) => khoi.length === 0 || khoi.includes(c[0]));
  const shown = useMemo(() => filterScoreSubjects(rows, subjects).filter((r) =>
    r.name.toLowerCase().includes(q.trim().toLowerCase()) && (khoi.length === 0 || khoi.includes(r.khoi)) && (lop.length === 0 || lop.includes(r.lop))), [rows, q, khoi, lop, subjects]);
  const invalid = rows.some((r) => allCols.some((c) => !isValidScore(r[c.key] ?? "")));
  const hasConflict = (r: Row) => allCols.some((c) => allCols.filter((other) => other.label === c.label && (r[other.key] ?? "").trim() !== "").length > 1);
  const conflicts = rows.filter(hasConflict).length;
  // GV chỉ thấy cột điểm BGH đã xác nhận chuyển sang CSDL
  const availableCols = canEdit ? allCols : allCols.filter((c) => locked.has(c.key));
  const filteredCols = visibleScoreColumns(availableCols, hiddenScoreKeys);
  const cols = [...new Set(filteredCols.map((c) => c.label))].flatMap((label) => filteredCols.filter((c) => c.label === label));
  const groups = [...new Set(cols.map((c) => c.label))].map((label) => ({ label, columns: cols.filter((c) => c.label === label) }));
  const addExam = (exam: ScoreSourceExam, type: ImportScoreType) => {
    if (!canEdit) return;
    if (exam.kind !== "ky-thi") throw new Error("Chỉ được lấy điểm từ kỳ thi.");
    const entry = { source: exam, scoreDate: new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date()) };
    if (replacement) {
      setRows(replaceExamColumnSource(rows, replacement.key, exam, locked, canEdit));
      setSources((previous) => ({ ...previous, [replacement.key]: entry }));
      setTransferred(null); toast.success("Đã đổi nguồn điểm kỳ thi (mô phỏng)."); return;
    }
    const column = importExamColumn(exam, type, importedCols.map((c) => c.examId));
    const next = rows.map((r) => ({ ...r, [column.key]: exam.students.find((s) => sameScoreStudent(r, s))?.score ?? "" }));
    for (const student of exam.students) {
      if (next.some((r) => sameScoreStudent(r, student))) continue;
      next.push({ id: `${exam.id}-${student.cccd}-${next.length}`, name: student.name, cccd: student.cccd, dob: student.dob, khoi: student.khoi, lop: student.lop, mon: student.mon,
        ...Object.fromEntries(allCols.map((c) => [c.key, ""])), [column.key]: student.score });
    }
    setSources((previous) => ({ ...previous, [column.key]: entry }));
    setRows(next); setImportedCols((previous) => [...previous, column]); setTransferred(null);
    toast.success(`Đã thêm điểm kỳ thi ${exam.name} (mô phỏng).`);
  };

  const update = (id: string, key: ScoreKey, v: string) => {
    if (!/^\d{0,2}(\.\d?)?$/.test(v)) return;
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [key]: v } : r)));
  };
  const unlock = (k: ScoreKey) => {
    if (!canEdit) { toast.error("Chỉ Ban giám hiệu được mở khóa cột điểm."); return; }
    setLocked((s) => { const n = new Set(s); n.delete(k); return n; });
    toast.success("Đã mở khóa cột điểm.");
  };

  const exportExcel = () => downloadCsv("chuyen-diem-csdl.csv",
    ["STT", "Họ và tên học sinh", "CCCD", "Ngày sinh", "Khối", "Lớp", "Môn", ...cols.map((c) => `${c.label}${c.sub ? " " + c.sub : ""}`)],
    shown.map((r, i) => [i + 1, r.name, r.cccd, r.dob, r.khoi, r.lop, r.mon, ...cols.map((c) => r[c.key])]));

  const confirm = () => {
    if (invalid) { toast.error("Có điểm không hợp lệ. Điểm phải trong thang 0–10, tối đa 1 chữ số thập phân."); return; }
    if (conflicts) { toast.error(`Có ${conflicts} học sinh có nhiều đầu điểm cùng loại. Vui lòng giữ 1 đầu điểm trước khi chuyển.`); return; }
    setLocked(new Set(allCols.filter((c) => rows.some((r) => (r[c.key] ?? "").trim() !== "")).map((c) => c.key)));
    setTransferred(new Date().toLocaleString("vi-VN"));
    toast.success(`Đã chuyển điểm của ${shown.length} học sinh sang CSDL.`);
  };

  const th = "px-3 py-2 font-medium whitespace-nowrap border-b";
  const columnMenu = (column: { key: string; label: string; sub?: string }) => (
    <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Thao tác ${column.label}${column.sub ? ` ${column.sub}` : ""}`} title={`Thao tác ${column.label}`} className="ml-0.5 h-6 w-4 align-middle"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
      {canEdit && <DropdownMenuItem disabled={!locked.has(column.key) && (invalid || !rows.some((r) => (r[column.key] ?? "") !== ""))} onSelect={() => { if (locked.has(column.key)) unlock(column.key); else setLocked((previous) => new Set([...previous, column.key])); setTransferred(null); }}>{locked.has(column.key) ? <Unlock /> : <Lock />}{locked.has(column.key) ? "Mở khóa" : "Chuyển điểm & Khóa"}</DropdownMenuItem>}
      <DropdownMenuItem onSelect={() => setTrace(column)}><History />Truy nguồn</DropdownMenuItem>
      {canEdit && <DropdownMenuItem disabled={locked.has(column.key)} onSelect={() => { setRemoved((previous) => [...previous, column.key]); setTransferred(null); }}><Trash2 />Gỡ cột</DropdownMenuItem>}
      {canEdit && <DropdownMenuItem disabled={locked.has(column.key)} onSelect={() => setReplacement({ key: column.key, label: `${column.label}${column.sub ? ` ${column.sub}` : ""}`, scoreType: importedCols.find((c) => c.key === column.key)?.scoreType ?? examColumnType(column.key) })}><RefreshCw />Đổi nguồn</DropdownMenuItem>}
    </DropdownMenuContent></DropdownMenu>
  );

  return (
    <AppShell>
      <Toaster />
      <div className="p-6 space-y-4 text-[13px]">
        <div>
          <h1 className="text-lg font-semibold">Chuyển điểm thi sang CSDL</h1>
          <p className="text-muted-foreground">
            {canEdit ? "Ban giám hiệu có thể chỉnh sửa điểm trước khi xác nhận chuyển." : "Chỉ Ban giám hiệu được sửa điểm."} Điểm thang 0–10, tối đa 1 chữ số thập phân, dùng dấu "." (VD: 8.5).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8 h-9" placeholder="Tìm tên học sinh" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <MultiCheck label="Khối" value={khoi} options={["3", "4", "5"].map((k) => ({ v: k, l: `Khối ${k}` }))}
            onChange={(v) => { setKhoi(v); setLop((l) => l.filter((c) => v.length === 0 || v.includes(c[0]))); }} />
          <MultiCheck label="Lớp" value={lop} options={lopOptions.map((c) => ({ v: c, l: `Lớp ${c}` }))} onChange={setLop} />
          <SubjectFilter selected={subjects} onChange={setSubjects} />
          <ScoreTypeFilter columns={availableCols} hiddenKeys={hiddenScoreKeys} onChange={setHiddenScoreKeys} />
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={exportExcel}><FileSpreadsheet className="h-4 w-4" />Xuất Excel</Button>
            <Button size="sm" onClick={confirm} disabled={!canEdit} className="bg-exam-success hover:bg-exam-success/90 text-primary-foreground"><CheckCircle2 className="h-4 w-4" />Xác nhận</Button>
          </div>
        </div>
        {conflicts > 0 && <p role="alert" className="flex items-start gap-2 rounded border border-destructive bg-destructive/10 px-3 py-2 text-foreground"><TriangleAlert className="h-4 w-4 shrink-0 mt-0.5" /><span>Có {conflicts} học sinh có nhiều đầu điểm cùng loại – được tô đỏ trong bảng.</span></p>}
        <p className="flex items-start gap-2 rounded border border-destructive bg-destructive/10 px-3 py-2 text-foreground"><TriangleAlert className="h-4 w-4 shrink-0 mt-0.5" /><span>Lưu ý: kiểm tra các học sinh đã có điểm GKI/CKI bên trang <Link to="/thong-ke/chuyen-diem" className="underline underline-offset-2 hover:text-primary">Chuyển điểm sang CSDL</Link>.</span></p>
        {transferred && <p className="text-exam-success">Đã chuyển điểm sang CSDL lúc {transferred}.</p>}
        <div className="rounded-lg border bg-card overflow-auto max-h-[70vh]">
          <table className="w-full border-separate border-spacing-0">
            <thead className="sticky top-0 bg-muted z-10">
              <tr>
                <th colSpan={7} className={`${th} text-center border-r`}>Thông tin học sinh</th>
                <th colSpan={Math.max(1, cols.length)} className={`${th} text-center`}>Điểm thi{canEdit && <ExamScorePicker addedIds={replacement ? [] : importedCols.map((c) => c.examId)} replacement={replacement} onReplacementClose={() => setReplacement(undefined)} onConfirm={addExam} />}</th>
              </tr>
              <tr className="text-left">
                {["STT", "Họ và tên học sinh", "CCCD", "Ngày sinh", "Khối", "Lớp", "Môn"].map((h, i) => (
                  <th key={h} rowSpan={2} className={`${th} ${i === 6 ? "border-r" : ""}`}>{h}</th>
                ))}
                {groups.map((group) => <th key={group.label} colSpan={group.columns.length} rowSpan={group.columns.length > 1 ? 1 : 2} className={`${th} text-center`} title={group.columns[0]?.examName}>{group.label}{group.columns.length === 1 && columnMenu(group.columns[0])}</th>)}
              </tr>
              <tr>
                {groups.filter((g) => g.columns.length > 1).flatMap((g) => g.columns.map((c, i) => <th key={c.key} className={`${th} text-center`} title={c.examName}>({i + 1}){columnMenu({ ...c, sub: `(${i + 1})` })}</th>))}
              </tr>
            </thead>
            <tbody>
              {shown.map((r, i) => {
                const clash = hasConflict(r);
                return (
                  <tr key={r.id} className={clash ? "bg-destructive/10" : ""}>
                    <td className="px-3 py-1.5 border-b">{i + 1}</td>
                    <td className={`px-3 py-1.5 border-b font-medium ${clash ? "text-destructive" : ""}`}>{r.name}</td>
                    <td className="px-3 py-1.5 border-b">{r.cccd}</td>
                    <td className="px-3 py-1.5 border-b">{r.dob}</td>
                    <td className="px-3 py-1.5 border-b">{r.khoi}</td>
                    <td className="px-3 py-1.5 border-b">{r.lop}</td>
                    <td className="px-3 py-1.5 border-b border-r whitespace-nowrap">{r.mon}</td>
                    {cols.map((c) => {
                      const v = r[c.key] ?? "";
                      const bad = !isValidScore(v) || (clash && allCols.filter((other) => other.label === c.label && (r[other.key] ?? "").trim() !== "").length > 1);
                      const isLocked = locked.has(c.key);
                      return (
                        <td key={c.key} className="px-3 py-1.5 border-b text-center">
                          {canEdit && !isLocked ? (
                            <Input inputMode="decimal" aria-label={`${c.label} ${c.sub ?? ""} ${r.name}`} value={v} onChange={(e) => update(r.id, c.key, e.target.value)}
                              className={`h-8 w-20 mx-auto text-center ${bad ? "border-destructive text-destructive bg-destructive/10" : ""}`}
                              title={clash ? "Học sinh có cả 2 đầu điểm GKI" : bad ? "Điểm từ 0 đến 10, tối đa 1 chữ số thập phân" : undefined} />
                          ) : <span className={bad ? "text-destructive font-semibold" : isLocked ? "text-muted-foreground" : ""}>{v || "–"}</span>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {shown.length === 0 && <tr><td colSpan={7 + cols.length} className="px-3 py-6 text-center text-muted-foreground">Không có học sinh phù hợp</td></tr>}
            </tbody>
          </table>
        </div>
        <Dialog open={Boolean(trace)} onOpenChange={(open) => { if (!open) setTrace(null); }}><DialogContent aria-describedby={undefined} className="max-w-3xl"><DialogHeader><DialogTitle>Truy nguồn điểm – {trace?.label}</DialogTitle></DialogHeader><div className="overflow-auto"><table className="w-full text-[13px]"><thead className="bg-muted"><tr>{["Loại", "Tên nội dung", "Ngày diễn ra", "Ngày có điểm"].map((label) => <th key={label} className="p-3 text-center font-medium">{label}</th>)}</tr></thead><tbody>{trace && sources[trace.key] && <tr><td className="p-3">Kỳ thi</td><td className="p-3">{sources[trace.key].source.name}</td><td className="p-3 text-center">{sources[trace.key].source.date}</td><td className="p-3 text-center">{sources[trace.key].scoreDate}</td></tr>}</tbody></table></div></DialogContent></Dialog>
      </div>
    </AppShell>
  );
}
