import { useState } from "react";
import { CheckCircle2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOfficialExams } from "@/lib/official-exams";
import { filterSourceExams, IMPORT_SCORE_TYPES, SCORE_CONTENT_KINDS, scoreSourceAssessments, scoreSourceExams, type ImportScoreType, type ScoreSourceExam } from "@/lib/exam-score-import";

const LEVELS = [{ value: "so", label: "Kỳ thi cấp Sở" }, { value: "xa", label: "Kỳ thi cấp Xã/phường" }, { value: "truong", label: "Kỳ thi cấp trường" }];

export function ExamScorePicker({ addedIds, includeAssessments = false, onConfirm }: { addedIds: string[]; includeAssessments?: boolean; onConfirm: (exam: ScoreSourceExam, type: ImportScoreType) => void }) {
  const exams = useOfficialExams();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("all");
  const [content, setContent] = useState<string>(SCORE_CONTENT_KINDS[0].value);
  const [selected, setSelected] = useState("");
  const [scoreType, setScoreType] = useState<ImportScoreType | "">("");
  const sources = includeAssessments ? [...scoreSourceAssessments(), ...scoreSourceExams(exams)] : scoreSourceExams(exams);
  const shown = filterSourceExams(sources, addedIds, query, level, includeAssessments ? content : "all");
  const chosen = shown.find((e) => e.id === selected);
  const groups = includeAssessments
    ? [...SCORE_CONTENT_KINDS.filter((k) => k.value === content).flatMap((k) => k.value === "ky-thi"
      ? LEVELS.filter((g) => level === "all" || g.value === level).map((g) => ({ key: `ky-thi-${g.value}`, label: g.label, items: shown.filter((e) => e.kind === "ky-thi" && e.level === g.value) }))
      : [{ key: k.value, label: k.label, items: shown.filter((e) => e.kind === k.value) }])]
    : LEVELS.filter((g) => level === "all" || g.value === level).map((g) => ({ key: g.value, label: g.label, items: shown.filter((e) => e.level === g.value) }));
  const reset = () => { setQuery(""); setLevel("all"); setContent(SCORE_CONTENT_KINDS[0].value); setSelected(""); setScoreType(""); };
  return <>
    <Button variant="outline" size="icon" className="ml-2 h-6 w-6 align-middle" aria-label="Lấy điểm từ kỳ thi khác" title="Lấy điểm từ kỳ thi khác" onClick={() => { reset(); setOpen(true); }}><Plus className="h-4 w-4" /></Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent aria-describedby={undefined} className="w-[calc(100%-1rem)] max-w-4xl max-h-[90dvh] flex flex-col gap-4 p-4 sm:p-6 text-[13px] text-foreground">
        <DialogHeader className="shrink-0"><DialogTitle>{includeAssessments ? "Lấy điểm từ nội dung khác" : "Lấy điểm từ kỳ thi khác"}</DialogTitle></DialogHeader>
        <section className="flex flex-wrap items-center gap-3 shrink-0">
          <h2 className="font-semibold shrink-0">Loại điểm</h2>
          <Select value={scoreType} onValueChange={(v) => setScoreType(v as ImportScoreType)}>
            <SelectTrigger aria-label="Loại điểm" className="w-56"><SelectValue placeholder="Chưa chọn" /></SelectTrigger>
            <SelectContent>{IMPORT_SCORE_TYPES.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}</SelectContent>
          </Select>
        </section>
        <div className="flex flex-wrap gap-2 border-t pt-4 shrink-0">
          <div className="relative flex-1 min-w-44"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input aria-label="Tìm tên kỳ thi" placeholder="Tìm tên kỳ thi" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" /></div>
          {includeAssessments && <Select value={content} onValueChange={setContent}><SelectTrigger aria-label="Nội dung" className="w-44"><SelectValue /></SelectTrigger><SelectContent>{SCORE_CONTENT_KINDS.map((k) => <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>)}</SelectContent></Select>}
          <Select value={level} onValueChange={setLevel}><SelectTrigger aria-label="Loại kỳ thi" className="w-48"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả</SelectItem><SelectItem value="so">Cấp Sở</SelectItem><SelectItem value="xa">Xã/phường</SelectItem><SelectItem value="truong">Cấp trường</SelectItem></SelectContent></Select>
        </div>
        <div className="min-h-0 overflow-auto border rounded">
          <RadioGroup aria-label="Chọn kỳ thi" value={selected} onValueChange={setSelected} className="block">
            <table className="w-full min-w-[580px] text-left"><thead className="sticky top-0 bg-muted"><tr><th className="p-3 font-medium text-center">Tên kỳ thi</th><th className="p-3 font-medium text-center whitespace-nowrap">Ngày diễn ra</th><th className="p-3 font-medium text-center w-40">{includeAssessments ? "Số học sinh nộp" : "Số thí sinh dự thi của trường"}</th>{includeAssessments && <th className="p-3 font-medium text-center w-40">Số học sinh đã chấm</th>}</tr></thead>
              <tbody>{groups.map((group) => <GroupRows key={group.key} label={group.label} exams={group.items} selected={selected} showGraded={includeAssessments} />)}</tbody>
            </table>
          </RadioGroup>
        </div>
        <DialogFooter className="flex-row justify-end gap-2 border-t pt-4 shrink-0"><Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button><Button className="bg-exam-success text-primary-foreground hover:bg-exam-success/90" disabled={!chosen || !scoreType} onClick={() => { if (!chosen || !scoreType) return; try { onConfirm(chosen, scoreType); setOpen(false); } catch (error) { toast.error(error instanceof Error ? error.message : "Không thể lấy điểm kỳ thi."); } }}><CheckCircle2 className="h-4 w-4" />Xác nhận</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </>;
}

function GroupRows({ label, exams, selected, showGraded = false }: { label: string; exams: ScoreSourceExam[]; selected: string; showGraded?: boolean }) {
  const cols = showGraded ? 4 : 3;
  return <><tr><th colSpan={cols} className="px-3 py-2 bg-muted/60 border-y font-semibold text-center">{label}</th></tr>
    {exams.map((exam) => <tr key={exam.id} className={selected === exam.id ? "bg-accent" : "hover:bg-muted/40"}><td className="p-3 border-b"><label className="flex gap-3 items-center cursor-pointer"><RadioGroupItem value={exam.id} aria-label={exam.name} /><span>{exam.name}</span></label></td><td className="p-3 border-b whitespace-nowrap text-center">{exam.date}</td><td className="p-3 border-b text-center">{exam.participantCount}</td>{showGraded && <td className="p-3 border-b text-center">{exam.students.filter((s) => s.score !== "").length}</td>}</tr>)}
    {!exams.length && <tr><td colSpan={cols} className="p-4 text-center text-muted-foreground">Không có kỳ thi phù hợp</td></tr>}
  </>;
}
