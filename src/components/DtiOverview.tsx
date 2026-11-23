import { useState, type ReactNode } from "react";
import { ChevronRight, Filter, RotateCcw, Search, ChartNoAxesCombined } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UNITS } from "@/components/ReportFilters";
import { emptyDtiOverviewFilter, matchesDtiOverview, gradesInLabel, homeworkCompletion } from "@/lib/dti-overview-filter";
import { Button } from "@/components/ui/button";
import { DtiSchoolIndexes, DtiSchoolDonuts, DtiSchoolMonthly, DtiCopyrightStatistics } from "@/components/DtiSchoolStatistics";

type Teacher = { name: string; classes: string; lectures: number; materials: number; homework: number; contentRate: number };
type Student = { code: string; cls: string; materials: number; materialsDone: number; onTime: number; homework: number; homeworkAssigned: number };
type SchoolClass = { name: string; siSo: number; khoi?: number; baiGiang: number; hocLieu: number; baiTap: number; baiKiemTra: number };
type ReportTab = "teacher" | "student" | "class" | "material" | "question" | "lecture";
const percent = (done: number, total: number) => total ? Math.round(done / total * 1000) / 10 : 0;
const series = [
  { key: "baiGiang", label: "Bài giảng", color: "var(--dti-blue-strong)" },
  { key: "hocLieu", label: "Học liệu", color: "var(--dti-blue)" },
  { key: "baiTap", label: "Bài tập", color: "var(--dti-blue-soft)" },
  { key: "baiKiemTra", label: "Bài kiểm tra", color: "var(--dti-slate)" },
] as const;

function Bar({ value, max = 100, color = "var(--dti-blue)" }: { value: number; max?: number; color?: string }) {
  return <svg className="h-2 w-full" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true"><rect width="100" height="8" rx="4" fill="var(--muted)" /><rect width={Math.min(100, max ? value / max * 100 : 0)} height="8" rx="4" fill={color} /></svg>;
}
function IndicatorBar({ value, label }: { value: number; label: string }) {
  return <svg className="h-2 w-full" viewBox="0 0 100 8" preserveAspectRatio="none" role="img" aria-label={`${label}: ${value}%`}><rect width="100" height="8" rx="4" fill="var(--muted)" /><rect width={Math.min(value, 100)} height="8" rx="4" fill="var(--dti-blue-strong)" /></svg>;
}
function Panel({ title, subtitle, tab, onOpen, children }: { title: string; subtitle: string; tab: ReportTab; onOpen: (tab: ReportTab) => void; children: ReactNode }) {
  return <section className="dti-panel min-w-0"><div className="mb-3 flex items-start justify-between gap-2"><div><h3 className="text-base font-semibold">{title}</h3><p className="text-[13px] text-muted-foreground">{subtitle}</p></div><Button variant="ghost" className="h-6 shrink-0 px-0 text-[13px] font-normal text-exam-primary" onClick={() => onOpen(tab)}>Xem báo cáo</Button></div>{children}</section>;
}

export function DtiOverview({ teachers: allTeachers, students: allStudents, classes: allClasses, onOpen }: { teachers: Teacher[]; students: Student[]; classes: SchoolClass[]; onOpen: (tab: ReportTab) => void }) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [applied, setApplied] = useState(emptyDtiOverviewFilter);
  const [draft, setDraft] = useState(emptyDtiOverviewFilter);
  const teachers = allTeachers.filter(t => matchesDtiOverview(t.name, gradesInLabel(t.classes), applied));
  const students = allStudents.filter(s => matchesDtiOverview(s.code, gradesInLabel(s.cls), applied));
  const classes = allClasses.filter(c => matchesDtiOverview(c.name, c.khoi ? [c.khoi] : [], applied));
  const activeTeachers = teachers.filter(t => t.lectures + t.materials + t.homework > 0);
  const assignedClasses = classes.filter(c => c.baiGiang + c.hocLieu + c.baiTap + c.baiKiemTra > 0);
  const completion = homeworkCompletion(students);
  const indicators = [
    { label: "Giáo viên có hoạt động dạy học số", value: percent(activeTeachers.length, teachers.length), tab: "teacher" as const, detail: `${activeTeachers.length}/${teachers.length} giáo viên` },
    { label: "Bài tập đã hoàn thành", value: completion.rate, tab: "student" as const, detail: `${completion.completed.toLocaleString("vi-VN")}/${completion.assigned.toLocaleString("vi-VN")} bài tập` },
    { label: "Lớp được giao nội dung số", value: percent(assignedClasses.length, classes.length), tab: "class" as const, detail: `${assignedClasses.length}/${classes.length} lớp` },
  ];
  const contributions = (t: Teacher) => t.lectures + t.materials + t.homework;
  const topTeachers = [...teachers].sort((a, b) => contributions(b) - contributions(a)).slice(0, 5);
  const grades = [1, 2, 3, 4, 5].map(grade => ({ grade, values: series.map(s => classes.filter(c => c.khoi === grade).reduce((total, c) => total + c[s.key], 0)) }));
  const maxGrade = Math.max(1, ...grades.flatMap(g => g.values));

  return <div className="dti-overview space-y-3 text-[13px] text-foreground">
    <section className="dti-panel">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h2 className="flex items-center gap-2 text-lg font-semibold"><ChartNoAxesCombined className="h-5 w-5 shrink-0 text-exam-primary" />Thống kê Tài nguyên &amp; Hoạt động nhà trường</h2><Button variant="outline" className="h-8 gap-2 text-[13px]" onClick={() => { setDraft({ ...applied }); setFilterOpen(true); }}><Filter className="h-4 w-4" />Bộ lọc<ChevronRight className="h-4 w-4" /></Button></div>
      <div className="grid gap-3 md:grid-cols-3">{indicators.map(i => <article key={i.label} className="rounded-md border border-border p-3"><div className="text-[13px]">{i.label}</div><div className="my-2 flex items-center gap-3"><Button variant="link" className="h-auto w-16 shrink-0 justify-start p-0 text-xl font-bold tabular-nums text-exam-primary" aria-label={`Xem báo cáo: ${i.label}`} onClick={() => onOpen(i.tab)}>{i.value}<span className="text-[13px] font-normal">%</span></Button><IndicatorBar value={i.value} label={i.label} /></div><p className="text-[13px] text-muted-foreground">{i.detail}</p></article>)}</div>
    </section>
    <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-md" aria-describedby={undefined}>
        <SheetHeader><SheetTitle>Bộ lọc</SheetTitle></SheetHeader>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={e => { e.preventDefault(); setApplied({ ...draft }); setFilterOpen(false); }}>
          <div className="mt-6 space-y-5 overflow-y-auto">
            <div className="space-y-2"><label className="text-[13px] font-medium" htmlFor="dti-unit">Đơn vị</label><Select value={draft.unit} onValueChange={unit => setDraft(v => ({ ...v, unit }))}><SelectTrigger id="dti-unit" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả đơn vị</SelectItem>{UNITS.map(unit => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><label className="text-[13px] font-medium" htmlFor="dti-grade">Khối</label><Select value={draft.grade} onValueChange={grade => setDraft(v => ({ ...v, grade }))}><SelectTrigger id="dti-grade" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả khối</SelectItem>{[1, 2, 3, 4, 5].map(g => <SelectItem key={g} value={String(g)}>Khối {g}</SelectItem>)}</SelectContent></Select></div>
            <fieldset className="space-y-3"><legend className="text-[13px] font-medium">Khoảng thời gian</legend><div className="space-y-2"><label htmlFor="dti-from" className="text-[13px] text-muted-foreground">Từ ngày</label><Input id="dti-from" type="date" value={draft.from} max={draft.to || undefined} onChange={e => setDraft(v => ({ ...v, from: e.target.value }))} /></div><div className="space-y-2"><label htmlFor="dti-to" className="text-[13px] text-muted-foreground">Đến ngày</label><Input id="dti-to" type="date" value={draft.to} min={draft.from || undefined} onChange={e => setDraft(v => ({ ...v, to: e.target.value }))} /></div></fieldset>
          </div>
          <div className="mt-auto flex gap-3 border-t border-border pt-4"><Button type="button" variant="outline" className="flex-1 gap-2" onClick={() => { setDraft(emptyDtiOverviewFilter()); setApplied(emptyDtiOverviewFilter()); }}><RotateCcw className="h-4 w-4" />Đặt lại</Button><Button type="submit" className="flex-1 gap-2 bg-exam-primary text-primary-foreground hover:bg-exam-primary/90"><Search className="h-4 w-4" />Tìm kiếm</Button></div>
        </form>
      </SheetContent>
    </Sheet>
    <DtiSchoolIndexes filter={applied} onOpen={onOpen} />
    <DtiSchoolDonuts filter={applied} />
    <div className="grid gap-3 lg:grid-cols-[0.8fr_1fr]">
      <Panel title="Giáo viên theo mức độ hoạt động" subtitle="Theo số bài giảng, học liệu, bài tập đã tạo" tab="teacher" onOpen={onOpen}>
        <h4 className="mb-2 mt-4 text-[13px] font-semibold">Giáo viên đóng góp nhiều nhất</h4>
        <div className="space-y-2">{topTeachers.map((t, i) => <div key={t.name} className="grid grid-cols-[16px_minmax(0,1fr)_minmax(60px,1fr)_32px] items-center gap-2 text-[13px]"><span className="text-muted-foreground">{i + 1}</span><span>{t.name}</span><Bar value={contributions(t)} max={Math.max(1, ...topTeachers.map(contributions))} /><Button variant="link" className="h-auto justify-end p-0 font-bold text-exam-primary" aria-label={`Xem đóng góp của ${t.name}`} onClick={() => onOpen("teacher")}>{contributions(t)}</Button></div>)}</div><p className="mt-3 text-[12px] text-muted-foreground">Số = bài giảng + học liệu + bài tập đã tạo</p>
      </Panel>
      <Panel title="Nội dung đã giao theo khối" subtitle="Tổng số bài giảng, học liệu, bài tập, bài kiểm tra giao cho các lớp" tab="class" onOpen={onOpen}>
        <div className="flex flex-wrap gap-3 text-[12px]">{series.map(s => <span key={s.key} className="flex items-center gap-1"><svg width="8" height="8"><rect width="8" height="8" fill={s.color} /></svg>{s.label}</span>)}</div>
        <svg className="mt-3 h-[200px] w-full" viewBox="0 0 600 200" role="img" aria-label="Biểu đồ nội dung đã giao theo khối">{grades.map((g, i) => <g key={g.grade}><line x1={i * 120 + 5} x2={i * 120 + 115} y1="177" y2="177" stroke="var(--border)" />{g.values.map((v, j) => <g key={j}><rect x={i * 120 + 12 + j * 27} y={177 - v / maxGrade * 148} width="15" height={v / maxGrade * 148} rx="2" fill={series[j]?.color} /><text x={i * 120 + 19.5 + j * 27} y={170 - v / maxGrade * 148} textAnchor="middle" fontSize="10" fill="var(--muted-foreground)">{v}</text></g>)}<text x={i * 120 + 60} y="193" textAnchor="middle" fontSize="12" fill="var(--muted-foreground)">Khối {g.grade}</text></g>)}</svg>
      </Panel>
    </div>
    <DtiSchoolMonthly filter={applied} />
    <DtiCopyrightStatistics filter={applied} />
  </div>;
}
