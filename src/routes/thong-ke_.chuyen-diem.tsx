import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, FileSpreadsheet, Filter, Lock, Search, MoreVertical, Unlock, History, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { ScoreTypeFilter } from "@/components/ScoreTypeFilter";
import { SCORE_SUBJECTS } from "@/lib/score-subjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { defaultTeacherScope, initialTeacherScoreSources, inTeacherScope, replaceTeacherScoreSource, transferProgress } from "@/lib/teacher-score-columns";
import { appendScoreTransfer } from "@/lib/score-transfer-history";
import { ScoreTransferTag, ScoreTransferHistoryCells } from "@/components/ScoreTransferReceipt";
import { SCORE_CONTENT_KINDS } from "@/lib/exam-score-import";
import { Toaster } from "@/components/ui/sonner";
import { ASSESSMENT_COLUMNS, ASSESSMENT_ROWS, filterAssessmentRows, unlockAssessmentColumn } from "@/lib/assessment-scores";
import { downloadCsv } from "@/lib/report-export";
import { isValidScore } from "@/lib/score";
import { visibleScoreColumns } from "@/lib/score-column-filter";
import { ExamScorePicker } from "@/components/ExamScorePicker";
import { importExamColumn, sameScoreStudent, type ImportedScoreColumn, type ImportScoreType, type ScoreSourceExam } from "@/lib/exam-score-import";

export const Route = createFileRoute("/thong-ke_/chuyen-diem")({
  head: () => ({ meta: [
    { title: "Chuyển điểm ĐGTX sang CSDL | QLMS" },
    { name: "description", content: "Bảng chuyển điểm đánh giá thường xuyên của giáo viên theo học sinh, khối và lớp." },
    { property: "og:title", content: "Chuyển điểm ĐGTX sang CSDL | QLMS" },
    { property: "og:description", content: "Rà soát và xác nhận điểm đánh giá thường xuyên theo lớp." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AssessmentTransferPage,
});

function SingleFilter({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <Select value={value} onValueChange={onChange}><SelectTrigger aria-label={label} className="w-44 h-9"><Filter className="h-4 w-4 shrink-0" /><span>{label}: <SelectValue /></span></SelectTrigger><SelectContent>{options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select>;
}

function AssessmentTransferPage() {
  const [rows, setRows] = useState(ASSESSMENT_ROWS);
  const [importedCols, setImportedCols] = useState<ImportedScoreColumn[]>([]);
  const allCols: { key: string; label: string; examName?: string }[] = [...ASSESSMENT_COLUMNS, ...importedCols];
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState(() => defaultTeacherScope(ASSESSMENT_ROWS));
  const scopeKey = `${scope.grade}/${scope.klass}/${scope.subject}`;
  const [removed, setRemoved] = useState<Record<string, string[]>>({});
  const [sources, setSources] = useState(() => initialTeacherScoreSources(ASSESSMENT_ROWS));
  const [trace, setTrace] = useState<{ key: string; label: string } | null>(null);
  const [replacement, setReplacement] = useState<{ key: string; label: string; scoreType: ImportScoreType } | undefined>();
  const [hiddenScoreKeys, setHiddenScoreKeys] = useState<string[]>([]);
  const availableCols = allCols.filter((c) => sources[scopeKey]?.[c.key] && !(removed[scopeKey] ?? []).includes(c.key));
  const cols = visibleScoreColumns(availableCols, hiddenScoreKeys);
  const [locks, setLocks] = useState<Record<string, Set<string>>>({});
  const locked = locks[scopeKey] ?? new Set<string>();
  const setLocked = (update: (previous: Set<string>) => Set<string>) => setLocks((previous) => ({ ...previous, [scopeKey]: update(previous[scopeKey] ?? new Set()) }));
  const [confirmed, setConfirmed] = useState(false);
  const [tooManyCols, setTooManyCols] = useState(false);
  const shown = useMemo(() => filterAssessmentRows(rows, query, [scope.grade], [scope.klass], [scope.subject]), [rows, query, scope]);
  const invalid = shown.some((r) => availableCols.some((c) => !isValidScore(r.scores[c.key] ?? "")));
  const [transferred, setTransferred] = useState<Record<string, Record<string, string[]>>>({});
  const recordTransfer = (keys: string[]) => {
    const at = new Date().toISOString();
    setTransferred((previous) => ({ ...previous, [scopeKey]: { ...previous[scopeKey], ...Object.fromEntries(keys.map((key) => [key, shown.filter((r) => (r.scores[key] ?? "") !== "").map((r) => r.id)])) } }));
    setSources((previous) => ({ ...previous, [scopeKey]: { ...previous[scopeKey], ...Object.fromEntries(keys.flatMap((key) => {
      const entry = previous[scopeKey]?.[key];
      return entry ? [[key, { ...entry, transfers: appendScoreTransfer(entry.transfers, "Phùng Thúy Hằng - Giáo viên", at) }]] : [];
    })) } }));
  };
  const recordSource = (key: string, source: ScoreSourceExam) => setSources((previous) => ({ ...previous, [scopeKey]: { ...previous[scopeKey], [key]: { source, scoreDate: new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date()) } } }));
  const addExam = (exam: ScoreSourceExam, type: ImportScoreType) => {
    if (replacement) {
      setRows(replaceTeacherScoreSource(rows, replacement.key, exam, scope, locked));
      recordSource(replacement.key, exam);
      setTransferred((previous) => ({ ...previous, [scopeKey]: { ...previous[scopeKey], [replacement.key]: [] } }));
      setConfirmed(false);
      toast.success("Đã đổi nguồn điểm (mô phỏng)."); return;
    }
    const column = importExamColumn(exam, type, importedCols.map((c) => c.examId));
    const next = rows.map((r) => inTeacherScope(r, scope) ? ({ ...r, scores: { ...r.scores, [column.key]: exam.students.find((s) => sameScoreStudent(r, s))?.score ?? "" } }) : r);
    for (const student of exam.students) {
      if (!inTeacherScope(student, scope)) continue;
      if (next.some((r) => sameScoreStudent(r, student))) continue;
      next.push({ id: `${exam.id}-${student.cccd}-${next.length}`, name: student.name, cccd: student.cccd, dob: student.dob, khoi: student.khoi, lop: student.lop, mon: student.mon,
        scores: { ...Object.fromEntries(allCols.map((c) => [c.key, ""])), [column.key]: student.score } });
    }
    recordSource(column.key, exam);
    setRows(next); setImportedCols((previous) => [...previous, column]); setConfirmed(false);
    toast.success(`Đã thêm điểm ${exam.name} (mô phỏng).`);
  };
  const gradeOptions = [...new Set(rows.map((r) => r.khoi))].sort((a, b) => Number(a) - Number(b));
  const classOptions = [...new Set(rows.filter((r) => r.khoi === scope.grade).map((r) => r.lop))].sort((a, b) => a.localeCompare(b, "vi", { numeric: true }));
  const header = ["STT", "Họ và tên học sinh", "CCCD", "Ngày sinh"];
  const unlock = (key: string) => {
    setLocked((previous) => unlockAssessmentColumn(previous, key));
    setConfirmed(false);
    toast.success("Đã mở khóa cột điểm (mô phỏng).");
  };
  const confirm = () => {
    if (invalid || !shown.length) return;
    if (availableCols.length > ASSESSMENT_COLUMNS.length) { setTooManyCols(true); return; }
    const keys = availableCols.filter((c) => shown.some((r) => (r.scores[c.key] ?? "") !== "")).map((c) => c.key);
    setLocked((previous) => new Set([...previous, ...keys]));
    recordTransfer(keys);
    setConfirmed(true);
    toast.success(`Đã xác nhận điểm của ${shown.length} học sinh (mô phỏng).`);
  };
  const th = "border-b px-3 py-2 font-medium whitespace-nowrap";
  return <AppShell role="teacher">
    <Toaster />
    <div className="space-y-4 p-2 sm:p-6 text-[13px]">
      <h1 className="text-lg font-semibold">Chuyển điểm sang CSDL</h1>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-64 max-w-full"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input aria-label="Tìm tên học sinh" placeholder="Tìm tên học sinh" value={query} onChange={(e) => setQuery(e.target.value)} className="h-9 pl-8" />
        </div>
        <SingleFilter label="Khối" value={scope.grade} options={gradeOptions} onChange={(grade) => { const klass = [...new Set(rows.filter((r) => r.khoi === grade).map((r) => r.lop))].sort((a, b) => a.localeCompare(b, "vi", { numeric: true }))[0]; if (klass) setScope({ ...scope, grade, klass }); setConfirmed(false); }} />
        <SingleFilter label="Lớp" value={scope.klass} options={classOptions} onChange={(klass) => { setScope({ ...scope, klass }); setConfirmed(false); }} />
        <SingleFilter label="Môn học" value={scope.subject} options={SCORE_SUBJECTS} onChange={(subject) => { setScope({ ...scope, subject }); setConfirmed(false); }} />
        <ScoreTypeFilter columns={availableCols} hiddenKeys={hiddenScoreKeys} onChange={setHiddenScoreKeys} />
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => downloadCsv("chuyen-diem-dgtx-csdl.csv", [...header, ...cols.map((c) => c.label)], shown.map((r, i) => [i + 1, r.name, r.cccd, r.dob, ...cols.map((c) => r.scores[c.key])]))}><FileSpreadsheet className="h-4 w-4" />Xuất Excel</Button>
          <Button size="sm" className="bg-exam-success text-primary-foreground hover:bg-exam-success/90" disabled={invalid || !shown.length} onClick={confirm}><CheckCircle2 className="h-4 w-4" />Xác nhận</Button>
        </div>
      </div>
      {invalid && <p role="alert" className="text-destructive">Điểm phải từ 0 đến 10, tối đa 1 chữ số thập phân và dùng dấu ".".</p>}
      {confirmed && <p role="status" className="text-exam-success">Đã xác nhận điểm (mô phỏng).</p>}
      <p className="text-foreground">Sau khi nhấn "Xác nhận" các cột điểm sẽ bị khóa. Chọn mở khóa cột điểm để sửa</p>
      <div className="rounded-lg border bg-card overflow-auto max-h-[70vh]">
        <table className="w-full border-separate border-spacing-0">
          <thead className="sticky top-0 z-10 bg-muted">
            <tr><th colSpan={4} className={`${th} border-r text-center`}>Thông tin học sinh</th><th colSpan={Math.max(1, cols.length)} className={`${th} text-center`}>Điểm số<ExamScorePicker addedIds={replacement ? [] : importedCols.map((c) => c.examId)} includeAssessments scope={scope} replacement={replacement} onReplacementClose={() => setReplacement(undefined)} onConfirm={addExam} /></th></tr>
            <tr className="text-left">{header.map((h, i) => <th key={h} className={`${th} ${i === 3 ? "border-r" : ""}`}>{h}</th>)}
              {cols.map((c) => {
                const { moved, withScore } = transferProgress(shown, c.key, transferred[scopeKey]?.[c.key] ?? []);
                return <th key={c.key} className={`${th} text-center`} title={c.examName}><div className="flex flex-col items-center gap-1"><span className="inline-flex items-center">{c.label}{allCols.filter((other) => other.label === c.label).length > 1 ? ` (${allCols.filter((other) => other.label === c.label).findIndex((other) => other.key === c.key) + 1})` : ""}<DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Thao tác ${c.label}`} title={`Thao tác ${c.label}`} className="ml-0.5 h-6 w-4 align-middle"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
                <DropdownMenuItem disabled={!locked.has(c.key) && (invalid || !shown.some((r) => (r.scores[c.key] ?? "") !== ""))} onSelect={() => { if (locked.has(c.key)) unlock(c.key); else if (availableCols.length > ASSESSMENT_COLUMNS.length) setTooManyCols(true); else { setLocked((previous) => new Set([...previous, c.key])); recordTransfer([c.key]); } }}>{locked.has(c.key) ? <Unlock /> : <Lock />}{locked.has(c.key) ? "Mở khóa" : "Chuyển điểm & Khóa"}</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setTrace(c)}><History />Truy nguồn</DropdownMenuItem>
                <DropdownMenuItem disabled={locked.has(c.key)} onSelect={() => { setRemoved((prev) => ({ ...prev, [scopeKey]: [...(prev[scopeKey] ?? []), c.key] })); setConfirmed(false); }}><Trash2 />Gỡ cột</DropdownMenuItem>
                <DropdownMenuItem disabled={locked.has(c.key)} onSelect={() => setReplacement({ key: c.key, label: c.label, scoreType: importedCols.find((col) => col.key === c.key)?.scoreType ?? (c.key === "dgtx4" ? "gk1" : c.key === "dgtx5" ? "ck1" : "dgtx") })}><RefreshCw />Đổi nguồn</DropdownMenuItem>
              </DropdownMenuContent></DropdownMenu></span><ScoreTransferTag moved={moved} withScore={withScore} /></div></th>;
              })}
            </tr>
          </thead>
          <tbody>{shown.map((r, i) => <tr key={r.id}>
            {[i + 1, r.name, r.cccd, r.dob].map((v, index) => <td key={index} className={`px-3 py-1.5 border-b whitespace-nowrap ${index === 1 ? "font-medium" : ""} ${index === 3 ? "border-r" : ""}`}>{v}</td>)}
            {cols.map((c) => <td key={c.key} className="px-3 py-1.5 border-b text-center">
              {locked.has(c.key) || sources[scopeKey]?.[c.key]?.source.kind === "ky-thi" ? <span className="text-muted-foreground" title={!locked.has(c.key) ? "Điểm kỳ thi chỉ xem, muốn sửa cần chấm lại" : undefined}>{r.scores[c.key] || "–"}</span> : <Input inputMode="decimal" aria-label={`${c.label} ${r.name} ${r.lop}`} value={r.scores[c.key] ?? ""} onChange={(e) => {
                const value = e.target.value;
                if (!/^\d{0,2}(\.\d?)?$/.test(value)) return;
                setConfirmed(false);
                setRows((rs) => rs.map((row) => row.id === r.id ? { ...row, scores: { ...row.scores, [c.key]: value } } : row));
              }} className={`h-8 w-20 mx-auto text-center border-exam-warning bg-exam-warning-tint ${!isValidScore(r.scores[c.key] ?? "") ? "border-destructive text-destructive" : ""}`} />}
            </td>)}
          </tr>)}{!shown.length && <tr><td colSpan={4 + cols.length} className="text-center p-6 text-muted-foreground">Không có học sinh phù hợp</td></tr>}</tbody>
        </table>
      </div>
      <Dialog open={tooManyCols} onOpenChange={setTooManyCols}><DialogContent aria-describedby={undefined} className="max-w-md"><DialogHeader><DialogTitle>Không thể chuyển điểm</DialogTitle></DialogHeader><p className="text-foreground">Số cột điểm của bạn nhiều hơn số điểm cho phép bên CSDL. Vui lòng kiểm tra lại!</p><div className="flex justify-end"><Button onClick={() => setTooManyCols(false)}>Đã hiểu</Button></div></DialogContent></Dialog>
      <Dialog open={Boolean(trace)} onOpenChange={(v) => { if (!v) setTrace(null); }}><DialogContent aria-describedby={undefined} className="w-[calc(100%-1rem)] max-w-6xl max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>Truy nguồn điểm – {trace?.label}</DialogTitle></DialogHeader><div className="overflow-auto"><table className="w-full min-w-[880px] text-[13px]"><thead className="bg-muted"><tr>{["Loại", "Tên nội dung", "Ngày diễn ra", "Ngày có điểm", "Thời gian chuyển điểm"].map((label) => <th key={label} className="p-3 text-center font-medium">{label}</th>)}</tr></thead><tbody>{trace && sources[scopeKey]?.[trace.key] ? (() => { const entry = sources[scopeKey][trace.key]; return <tr><td className="p-3">{SCORE_CONTENT_KINDS.find((k) => k.value === entry.source.kind)?.label}</td><td className="p-3">{entry.source.kind === "ky-thi" ? <Link to="/ky-thi/chinh-thuc" search={{ focus: entry.source.name }} className="text-exam-primary underline-offset-2 hover:underline">{entry.source.name}</Link> : <Link to="/giao-bai-tap" search={{ focus: entry.source.name }} className="text-exam-primary underline-offset-2 hover:underline">{entry.source.name}</Link>}</td><td className="p-3 text-center">{entry.source.date}</td><td className="p-3 text-center">{entry.scoreDate}</td><ScoreTransferHistoryCells history={entry.transfers} /></tr>; })() : <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Điểm mẫu chưa có thông tin nguồn. Nguồn sẽ được ghi nhận khi lấy hoặc đổi nguồn điểm.</td></tr>}</tbody></table></div></DialogContent></Dialog>
    </div>
  </AppShell>;
}