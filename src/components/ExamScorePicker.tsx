import { useState } from "react";
import { CheckCircle2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useOfficialExams } from "@/lib/official-exams";
import { inTeacherScope, type TeacherScoreScope } from "@/lib/teacher-score-columns";
import { filterSourceExams, IMPORT_SCORE_TYPES, SCORE_CONTENT_KINDS, scoreSourceAssessments, scoreSourceClasses, scoreSourceExams, type ImportScoreType, type ScoreSourceExam } from "@/lib/exam-score-import";

const LEVELS = [{ value: "so", label: "Kỳ thi cấp Sở" }, { value: "xa", label: "Kỳ thi cấp Xã/phường" }, { value: "truong", label: "Kỳ thi cấp trường" }];

function distinctClasses(students: { lop: string }[]) {
  return [...new Set(students.map((s) => s.lop))].sort((a, b) => a.localeCompare(b, "vi", { numeric: true }));
}

export function ExamScorePicker({ addedIds, includeAssessments = false, onConfirm, scope, replacement, onReplacementClose }: { addedIds: string[]; includeAssessments?: boolean; onConfirm: (exam: ScoreSourceExam, type: ImportScoreType) => void; scope?: TeacherScoreScope; replacement?: { key: string; label: string; scoreType: ImportScoreType }; onReplacementClose?: () => void }) {
  const exams = useOfficialExams();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("all");
  const [content, setContent] = useState<string>(SCORE_CONTENT_KINDS[0].value);
  const [selected, setSelected] = useState("");
  const [scoreType, setScoreType] = useState<ImportScoreType | "">("");
  const defaultClasses = () => (scope?.klass ? [scope.klass] : []);
  const [appliedClasses, setAppliedClasses] = useState<string[]>(defaultClasses);
  const allSources = includeAssessments ? [...scoreSourceAssessments(), ...scoreSourceExams(exams)] : scoreSourceExams(exams);
  const sources = scope ? allSources.map((s) => ({ ...s, students: s.students.filter((st) => inTeacherScope(st, scope)) })).filter((s) => s.students.length > 0).map((s) => ({ ...s, participantCount: s.students.length })) : allSources;
  const byClass = includeAssessments && content !== "ky-thi";
  const classes = byClass ? scoreSourceClasses(allSources, content) : [];
  const shown = filterSourceExams(sources, addedIds, query, byClass ? "all" : level, includeAssessments ? content : "all")
    .filter((e) => !byClass || appliedClasses.length === 0 || e.students.some((s) => appliedClasses.includes(s.lop)));
  const chosen = shown.find((e) => e.id === selected);
  const picked = chosen ? (() => {
    let students = chosen.students;
    if (includeAssessments && appliedClasses.length > 0) students = students.filter((s) => appliedClasses.includes(s.lop));
    return { ...chosen, students, participantCount: students.length };
  })() : chosen;
  const groups = includeAssessments
    ? content === "ky-thi"
      ? LEVELS.filter((g) => level === "all" || g.value === level).map((g) => ({ key: `ky-thi-${g.value}`, label: g.label, items: shown.filter((e) => e.level === g.value) }))
      : [{ key: content, label: "", items: shown }]
    : LEVELS.filter((g) => level === "all" || g.value === level).map((g) => ({ key: g.value, label: g.label, items: shown.filter((e) => e.level === g.value) }));
  const reset = () => { setQuery(""); setLevel("all"); setContent(SCORE_CONTENT_KINDS[0].value); setSelected(""); setScoreType(""); setAppliedClasses(defaultClasses()); };
  const label = includeAssessments ? "nội dung" : "kỳ thi";
  const effectiveType = replacement?.scoreType ?? scoreType;
  const scoreTypeOptions = includeAssessments ? IMPORT_SCORE_TYPES.filter((t) => t.value === "dgtx") : IMPORT_SCORE_TYPES;
  const close = () => { setOpen(false); reset(); onReplacementClose?.(); };
  return <>
    <Button variant="outline" size="icon" className="ml-2 h-6 w-6 align-middle" aria-label={`Lấy điểm từ ${label} khác`} title={`Lấy điểm từ ${label} khác`} onClick={() => { reset(); setOpen(true); }}><Plus className="h-4 w-4" /></Button>
    <Dialog open={open || Boolean(replacement)} onOpenChange={(v) => { if (!v) close(); else setOpen(true); }}>
      <DialogContent aria-describedby={undefined} className="w-[calc(100%-1rem)] max-w-4xl max-h-[90dvh] flex flex-col gap-4 p-4 sm:p-6 text-[13px] text-foreground">
        <DialogHeader className="shrink-0"><DialogTitle>{replacement ? `Đổi nguồn – ${replacement.label}` : includeAssessments ? "Lấy điểm từ nội dung khác" : "Lấy điểm từ kỳ thi khác"}</DialogTitle></DialogHeader>
        {!replacement && <section className="flex flex-wrap items-center gap-3 shrink-0">
          <h2 className="font-semibold shrink-0">Loại điểm CSDL</h2>
          <Select value={scoreType} onValueChange={(v) => setScoreType(v as ImportScoreType)}>
            <SelectTrigger aria-label="Loại điểm CSDL" className="w-56"><SelectValue placeholder="Chưa chọn" /></SelectTrigger>
            <SelectContent>{scoreTypeOptions.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}</SelectContent>
          </Select>
        </section>}
        <div className="flex flex-wrap gap-2 border-t pt-4 shrink-0">
          <div className="relative flex-1 min-w-44"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input aria-label={`Tìm tên ${label}`} placeholder={`Tìm tên ${label}`} value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" /></div>
          {includeAssessments && <Select value={content} onValueChange={(v) => { setContent(v); setLevel("all"); setSelected(""); setAppliedClasses(defaultClasses()); }}><SelectTrigger aria-label="Nội dung" className="w-44"><SelectValue /></SelectTrigger><SelectContent>{SCORE_CONTENT_KINDS.map((k) => <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>)}</SelectContent></Select>}
          {byClass
            ? <Popover>
              <PopoverTrigger asChild><Button variant="outline" className="w-48 justify-between font-normal" aria-label="Lớp">{appliedClasses.length ? `${appliedClasses.length} lớp đã chọn` : "Tất cả lớp"}</Button></PopoverTrigger>
              <PopoverContent align="start" className="w-48 p-2">
                <div className="flex flex-col gap-1">
                  {classes.map((c) => <label key={c} className="flex items-center gap-2 rounded px-2 py-1.5 cursor-pointer hover:bg-muted/60"><Checkbox checked={appliedClasses.includes(c)} onCheckedChange={(v) => setAppliedClasses((prev) => v ? [...prev, c] : prev.filter((x) => x !== c))} aria-label={`Lớp ${c}`} />{c}</label>)}
                </div>
              </PopoverContent>
            </Popover>
            : <Select value={level} onValueChange={setLevel}><SelectTrigger aria-label="Loại kỳ thi" className="w-48"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả</SelectItem><SelectItem value="so">Cấp Sở</SelectItem><SelectItem value="xa">Xã/phường</SelectItem><SelectItem value="truong">Cấp trường</SelectItem></SelectContent></Select>}
        </div>
        <div className="min-h-0 overflow-auto border rounded">
          <RadioGroup aria-label={`Chọn ${label}`} value={selected} onValueChange={setSelected} className="block">
            <table className="w-full min-w-[580px] text-left"><thead className="sticky top-0 bg-muted"><tr><th className="p-3 font-medium text-center">Tên {label}</th><th className="p-3 font-medium text-center whitespace-nowrap">Ngày diễn ra</th>{includeAssessments && <th className="p-3 font-medium text-center w-28">Số lớp đã giao</th>}<th className="p-3 font-medium text-center w-40">{includeAssessments ? "Số học sinh nộp" : "Số thí sinh dự thi của trường"}</th>{includeAssessments ? <th className="p-3 font-medium text-center w-40">Số học sinh đã chấm</th> : <th className="p-3 font-medium text-center w-40">Bài đã chấm</th>}</tr></thead>
              <tbody>{groups.map((group) => <GroupRows key={group.key} label={group.label} exams={group.items} selected={selected} showGraded={includeAssessments} />)}</tbody>
            </table>
          </RadioGroup>
        </div>
        <DialogFooter className="flex-row justify-end gap-2 border-t pt-4 shrink-0"><Button variant="outline" onClick={close}>Hủy</Button><Button className="bg-exam-success text-primary-foreground hover:bg-exam-success/90" disabled={!picked || !effectiveType} onClick={() => { if (!picked || !effectiveType) return; try { onConfirm(picked, effectiveType); close(); } catch (error) { toast.error(error instanceof Error ? error.message : `Không thể lấy điểm ${label}.`); } }}><CheckCircle2 className="h-4 w-4" />{replacement ? "Đổi nguồn" : "Xác nhận"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </>;
}

function GroupRows({ label, exams, selected, showGraded = false }: { label: string; exams: ScoreSourceExam[]; selected: string; showGraded?: boolean }) {
  const cols = showGraded ? 5 : 4;
  return <>{label && <tr><th colSpan={cols} className="px-3 py-2 bg-muted/60 border-y font-semibold text-center">{label}</th></tr>}
    {exams.map((exam) => <tr key={exam.id} className={selected === exam.id ? "bg-accent" : "hover:bg-muted/40"}><td className="p-3 border-b"><label className="flex gap-3 items-center cursor-pointer"><RadioGroupItem value={exam.id} aria-label={exam.name} /><span>{exam.name}</span></label></td><td className="p-3 border-b whitespace-nowrap text-center">{exam.date}</td>{showGraded && <td className="p-3 border-b text-center">{distinctClasses(exam.students).length}</td>}<td className="p-3 border-b text-center">{exam.participantCount}</td>{showGraded ? <td className="p-3 border-b text-center">{exam.students.filter((s) => s.score !== "").length}</td> : <td className="p-3 border-b text-center">{exam.students.filter((s) => s.score !== "").length}/{exam.participantCount}</td>}</tr>)}
    {!exams.length && <tr><td colSpan={cols} className="p-4 text-center text-muted-foreground">{showGraded ? "Không có nội dung phù hợp" : "Không có kỳ thi phù hợp"}</td></tr>}
  </>;
}
