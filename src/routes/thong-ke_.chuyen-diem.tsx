import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, FileSpreadsheet, Filter, Lock, Search } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { ScoreTypeFilter } from "@/components/ScoreTypeFilter";
import { SubjectFilter } from "@/components/SubjectFilter";
import { SCORE_SUBJECTS } from "@/lib/score-subjects";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Toaster } from "@/components/ui/sonner";
import { ASSESSMENT_CLASSES, ASSESSMENT_COLUMNS, ASSESSMENT_ROWS, filterAssessmentRows, unlockAssessmentColumn } from "@/lib/assessment-scores";
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

function MultiFilter({ label, values, options, onChange }: { label: string; values: string[]; options: string[]; onChange: (values: string[]) => void }) {
  return <Popover>
    <PopoverTrigger asChild><Button variant="outline" size="sm" className="h-9 font-normal gap-1.5 max-w-full">
      <Filter className="h-4 w-4 shrink-0" /><span className="truncate">{label}: {values.length ? values.join(", ") : "Tất cả"}</span>
    </Button></PopoverTrigger>
    <PopoverContent align="start" className="w-48 p-2">
      {options.map((option) => <label key={option} className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted cursor-pointer">
        <Checkbox checked={values.includes(option)} onCheckedChange={() => onChange(values.includes(option) ? values.filter((v) => v !== option) : [...values, option])} />{label} {option}
      </label>)}
      <div className="border-t mt-2 pt-2 flex justify-end"><Button variant="ghost" size="sm" onClick={() => onChange([])}>Tất cả</Button></div>
    </PopoverContent>
  </Popover>;
}

function AssessmentTransferPage() {
  const [rows, setRows] = useState(ASSESSMENT_ROWS);
  const [importedCols, setImportedCols] = useState<ImportedScoreColumn[]>([]);
  const allCols: { key: string; label: string; examName?: string }[] = [...ASSESSMENT_COLUMNS, ...importedCols];
  const [query, setQuery] = useState("");
  const [grades, setGrades] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([...SCORE_SUBJECTS]);
  const [hiddenScoreKeys, setHiddenScoreKeys] = useState<string[]>([]);
  const cols = visibleScoreColumns(allCols, hiddenScoreKeys);
  const [locked, setLocked] = useState<Set<string>>(new Set());
  const [confirmed, setConfirmed] = useState(false);
  const shown = useMemo(() => filterAssessmentRows(rows, query, grades, classes, subjects), [rows, query, grades, classes, subjects]);
  const invalid = shown.some((r) => allCols.some((c) => !isValidScore(r.scores[c.key] ?? "")));
  const addExam = (exam: ScoreSourceExam, type: ImportScoreType) => {
    const column = importExamColumn(exam, type, importedCols.map((c) => c.examId));
    const next = rows.map((r) => ({ ...r, scores: { ...r.scores, [column.key]: exam.students.find((s) => sameScoreStudent(r, s))?.score ?? "" } }));
    for (const student of exam.students) {
      if (next.some((r) => sameScoreStudent(r, student))) continue;
      next.push({ id: `${exam.id}-${student.cccd}-${next.length}`, name: student.name, cccd: student.cccd, dob: student.dob, khoi: student.khoi, lop: student.lop, mon: student.mon,
        scores: { ...Object.fromEntries(allCols.map((c) => [c.key, ""])), [column.key]: student.score } });
    }
    setRows(next); setImportedCols((previous) => [...previous, column]); setConfirmed(false);
    toast.success(`Đã thêm điểm ${exam.name} (mô phỏng).`);
  };
  const classOptions = ASSESSMENT_CLASSES.filter((c) => !grades.length || grades.includes(c[0]));
  const header = ["STT", "Họ và tên học sinh", "CCCD", "Ngày sinh", "Khối", "Lớp", "Môn"];
  const unlock = (key: string) => {
    setLocked((previous) => unlockAssessmentColumn(previous, key));
    setConfirmed(false);
    toast.success("Đã mở khóa cột điểm (mô phỏng).");
  };
  const confirm = () => {
    if (invalid || !shown.length) return;
    setLocked((previous) => new Set([...previous, ...allCols.filter((c) => shown.some((r) => (r.scores[c.key] ?? "") !== "")).map((c) => c.key)]));
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
        <MultiFilter label="Khối" values={grades} options={["3", "4", "5"]} onChange={(v) => { setGrades(v); setClasses((cs) => cs.filter((c) => !v.length || v.includes(c[0]))); }} />
        <MultiFilter label="Lớp" values={classes} options={classOptions} onChange={setClasses} />
        <SubjectFilter selected={subjects} onChange={setSubjects} />
        <ScoreTypeFilter columns={allCols} hiddenKeys={hiddenScoreKeys} onChange={setHiddenScoreKeys} />
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => downloadCsv("chuyen-diem-dgtx-csdl.csv", [...header, ...cols.map((c) => c.label)], shown.map((r, i) => [i + 1, r.name, r.cccd, r.dob, r.khoi, r.lop, r.mon, ...cols.map((c) => r.scores[c.key])]))}><FileSpreadsheet className="h-4 w-4" />Xuất Excel</Button>
          <Button size="sm" className="bg-exam-success text-primary-foreground hover:bg-exam-success/90" disabled={invalid || !shown.length} onClick={confirm}><CheckCircle2 className="h-4 w-4" />Xác nhận</Button>
        </div>
      </div>
      {invalid && <p role="alert" className="text-destructive">Điểm phải từ 0 đến 10, tối đa 1 chữ số thập phân và dùng dấu ".".</p>}
      {confirmed && <p role="status" className="text-exam-success">Đã xác nhận điểm (mô phỏng).</p>}
      <p className="text-foreground">Sau khi nhấn "Xác nhận" các cột điểm sẽ bị khóa. Chọn mở khóa cột điểm để sửa</p>
      <div className="rounded-lg border bg-card overflow-auto max-h-[70vh]">
        <table className="w-full border-separate border-spacing-0">
          <thead className="sticky top-0 z-10 bg-muted">
            <tr><th colSpan={7} className={`${th} border-r text-center`}>Thông tin học sinh</th><th colSpan={Math.max(1, cols.length)} className={`${th} text-center`}>Điểm số<ExamScorePicker addedIds={importedCols.map((c) => c.examId)} includeAssessments onConfirm={addExam} /></th></tr>
            <tr className="text-left">{header.map((h, i) => <th key={h} className={`${th} ${i === 6 ? "border-r" : ""}`}>{h}</th>)}
              {cols.map((c) => <th key={c.key} className={`${th} text-center`} title={c.examName}>{c.label}{allCols.filter((other) => other.label === c.label).length > 1 ? ` (${allCols.filter((other) => other.label === c.label).findIndex((other) => other.key === c.key) + 1})` : ""}{locked.has(c.key) && <Button type="button" variant="ghost" size="icon" aria-label={`Mở khóa ${c.label}`} title="Đã xác nhận – bấm để mở khóa" onClick={() => unlock(c.key)} className="ml-1 h-6 w-6 align-middle text-exam-warning"><Lock className="h-3.5 w-3.5" /></Button>}</th>)}
            </tr>
          </thead>
          <tbody>{shown.map((r, i) => <tr key={r.id}>
            {[i + 1, r.name, r.cccd, r.dob, r.khoi, r.lop, r.mon].map((v, index) => <td key={index} className={`px-3 py-1.5 border-b whitespace-nowrap ${index === 1 ? "font-medium" : ""} ${index === 6 ? "border-r" : ""}`}>{v}</td>)}
            {cols.map((c) => <td key={c.key} className="px-3 py-1.5 border-b text-center">
              {locked.has(c.key) ? <span className="text-muted-foreground">{r.scores[c.key] || "–"}</span> : <Input inputMode="decimal" aria-label={`${c.label} ${r.name} ${r.lop}`} value={r.scores[c.key] ?? ""} onChange={(e) => {
                const value = e.target.value;
                if (!/^\d{0,2}(\.\d?)?$/.test(value)) return;
                setConfirmed(false);
                setRows((rs) => rs.map((row) => row.id === r.id ? { ...row, scores: { ...row.scores, [c.key]: value } } : row));
              }} className={`h-8 w-20 mx-auto text-center ${!isValidScore(r.scores[c.key] ?? "") ? "border-destructive text-destructive" : ""}`} />}
            </td>)}
          </tr>)}{!shown.length && <tr><td colSpan={7 + cols.length} className="text-center p-6 text-muted-foreground">Không có học sinh phù hợp</td></tr>}</tbody>
        </table>
      </div>
    </div>
  </AppShell>;
}