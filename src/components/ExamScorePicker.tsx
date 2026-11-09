import { useState } from "react";
import { CheckCircle2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOfficialExams } from "@/lib/official-exams";
import { filterSourceExams, IMPORT_SCORE_TYPES, scoreSourceExams, type ImportScoreType, type ScoreSourceExam } from "@/lib/exam-score-import";

const LEVELS = [{ value: "so", label: "Kỳ thi cấp Sở" }, { value: "xa", label: "Kỳ thi cấp Xã/phường" }, { value: "truong", label: "Kỳ thi cấp trường" }];

export function ExamScorePicker({ addedIds, onConfirm }: { addedIds: string[]; onConfirm: (exam: ScoreSourceExam, type: ImportScoreType) => void }) {
  const exams = useOfficialExams();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("all");
  const [selected, setSelected] = useState("");
  const [scoreType, setScoreType] = useState<ImportScoreType>("dgtx");
  const shown = filterSourceExams(scoreSourceExams(exams), addedIds, query, level);
  const chosen = shown.find((e) => e.id === selected);
  return <>
    <Button variant="outline" size="icon" className="ml-2 h-6 w-6 align-middle" aria-label="Lấy điểm từ kỳ thi khác" title="Lấy điểm từ kỳ thi khác" onClick={() => { setQuery(""); setLevel("all"); setSelected(""); setScoreType("dgtx"); setOpen(true); }}><Plus className="h-4 w-4" /></Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent aria-describedby={undefined} className="w-[calc(100%-1rem)] max-w-4xl max-h-[90dvh] flex flex-col gap-4 p-4 sm:p-6 text-[13px] text-foreground">
        <DialogHeader className="shrink-0"><DialogTitle>Lấy điểm từ kỳ thi khác</DialogTitle></DialogHeader>
        <section className="space-y-2 shrink-0"><h2 className="font-semibold">Loại điểm</h2>
          <RadioGroup aria-label="Loại điểm lấy từ kỳ thi" value={scoreType} onValueChange={(v) => { const type = IMPORT_SCORE_TYPES.find((t) => t.value === v); if (type) setScoreType(type.value); }} className="flex flex-wrap gap-x-6 gap-y-3">
            {IMPORT_SCORE_TYPES.map((type) => <label key={type.value} className="flex items-center gap-2 cursor-pointer"><RadioGroupItem value={type.value} />{type.label}</label>)}
          </RadioGroup>
        </section>
        <div className="flex flex-wrap gap-2 border-t pt-4 shrink-0">
          <div className="relative flex-1 min-w-44"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input aria-label="Tìm tên kỳ thi" placeholder="Tìm tên kỳ thi" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" /></div>
          <Select value={level} onValueChange={setLevel}><SelectTrigger aria-label="Loại kỳ thi" className="w-48"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả</SelectItem><SelectItem value="so">Cấp Sở</SelectItem><SelectItem value="xa">Xã/phường</SelectItem><SelectItem value="truong">Cấp trường</SelectItem></SelectContent></Select>
        </div>
        <div className="min-h-0 overflow-auto border rounded">
          <RadioGroup aria-label="Chọn kỳ thi" value={selected} onValueChange={setSelected} className="block">
            <table className="w-full min-w-[580px] text-left"><thead className="sticky top-0 bg-muted"><tr><th className="p-3 font-medium">Tên kỳ thi</th><th className="p-3 font-medium whitespace-nowrap">Ngày diễn ra</th><th className="p-3 font-medium w-40">Số thí sinh dự thi của trường</th></tr></thead>
              <tbody>{LEVELS.map((group) => {
                const items = shown.filter((e) => e.level === group.value);
                if (level !== "all" && level !== group.value) return null;
                return <GroupRows key={group.value} label={group.label} exams={items} selected={selected} />;
              })}</tbody>
            </table>
          </RadioGroup>
        </div>
        <DialogFooter className="flex-row justify-end gap-2 border-t pt-4 shrink-0"><Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button><Button className="bg-exam-success text-primary-foreground hover:bg-exam-success/90" disabled={!chosen} onClick={() => { if (!chosen) return; try { onConfirm(chosen, scoreType); setOpen(false); } catch (error) { toast.error(error instanceof Error ? error.message : "Không thể lấy điểm kỳ thi."); } }}><CheckCircle2 className="h-4 w-4" />Xác nhận</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </>;
}

function GroupRows({ label, exams, selected }: { label: string; exams: ScoreSourceExam[]; selected: string }) {
  return <><tr><th colSpan={3} className="px-3 py-2 bg-muted/60 border-y font-semibold">{label}</th></tr>
    {exams.map((exam) => <tr key={exam.id} className={selected === exam.id ? "bg-accent" : "hover:bg-muted/40"}><td className="p-3 border-b"><label className="flex gap-3 items-center cursor-pointer"><RadioGroupItem value={exam.id} aria-label={exam.name} /><span>{exam.name}</span></label></td><td className="p-3 border-b whitespace-nowrap">{exam.date}</td><td className="p-3 border-b text-center">{exam.participantCount}</td></tr>)}
    {!exams.length && <tr><td colSpan={3} className="p-4 text-center text-muted-foreground">Không có kỳ thi phù hợp</td></tr>}
  </>;
}