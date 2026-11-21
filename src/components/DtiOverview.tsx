import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { MATERIALS, QUESTIONS, LECTURES } from "@/components/DtiContentReports";

type Teacher = { name: string; lectures: number; materials: number; homework: number; contentRate: number };
type Student = { code: string; materials: number; materialsDone: number; onTime: number; homework: number };
type SchoolClass = { name: string; siSo: number; khoi?: number; baiGiang: number; hocLieu: number; baiTap: number; baiKiemTra: number };
type ReportTab = "teacher" | "student" | "class" | "material" | "question" | "lecture";
const number = (v: number) => v.toLocaleString("vi-VN");
const percent = (done: number, total: number) => total ? Math.round(done / total * 1000) / 10 : 0;
const series = [
  { key: "baiGiang", label: "Bài giảng", color: "var(--dti-blue-strong)" },
  { key: "hocLieu", label: "Học liệu", color: "var(--dti-blue)" },
  { key: "baiTap", label: "Bài tập", color: "var(--dti-blue-soft)" },
  { key: "baiKiemTra", label: "Bài kiểm tra", color: "var(--dti-slate)" },
] as const;
const tones = ["dti-blue", "dti-teal", "dti-violet", "dti-orange", "dti-rose", "dti-green"];

function Bar({ value, max = 100, color = "var(--dti-blue)" }: { value: number; max?: number; color?: string }) {
  return <svg className="h-2 w-full" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true"><rect width="100" height="8" rx="4" fill="var(--muted)" /><rect width={Math.min(100, max ? value / max * 100 : 0)} height="8" rx="4" fill={color} /></svg>;
}
function TargetBar({ value, label }: { value: number; label: string }) {
  return <svg className="h-6 w-full" viewBox="0 0 100 24" preserveAspectRatio="none" role="img" aria-label={`${label}: ${value}%, mục tiêu 80%`}><rect y="4" width="50" height="16" fill="var(--dti-unmet)" /><rect x="50" y="4" width="30" height="16" fill="var(--dti-near)" /><rect x="80" y="4" width="20" height="16" fill="var(--dti-met)" /><rect y="9" width={Math.min(value, 100)} height="6" rx="1" fill="var(--dti-blue-strong)" /><path d="M80 1 V23" stroke="var(--foreground)" strokeWidth="0.6" /></svg>;
}
function Panel({ title, subtitle, tab, onOpen, children }: { title: string; subtitle: string; tab: ReportTab; onOpen: (tab: ReportTab) => void; children: ReactNode }) {
  return <section className="dti-panel min-w-0"><div className="mb-3 flex items-start justify-between gap-2"><div><h3 className="font-semibold">{title}</h3><p className="text-[11px] text-muted-foreground">{subtitle}</p></div><Button variant="ghost" className="h-6 shrink-0 px-0 text-[11px] font-normal text-exam-primary" onClick={() => onOpen(tab)}>Xem báo cáo</Button></div>{children}</section>;
}

export function DtiOverview({ teachers, students, classes, onOpen }: { teachers: Teacher[]; students: Student[]; classes: SchoolClass[]; onOpen: (tab: ReportTab) => void }) {
  const activeTeachers = teachers.filter(t => t.lectures + t.materials + t.homework > 0);
  const participating = students.filter(s => s.materials + s.homework > 0);
  const assignedClasses = classes.filter(c => c.baiGiang + c.hocLieu + c.baiTap + c.baiKiemTra > 0);
  const materialLearners = MATERIALS.reduce((s, r) => s + r.learners, 0);
  const materialDone = MATERIALS.reduce((s, r) => s + r.done, 0);
  const lectureLearners = LECTURES.reduce((s, r) => s + r.learners, 0);
  const lectureDone = LECTURES.reduce((s, r) => s + r.done, 0);
  const assignedLectures = LECTURES.filter(r => r.classes.length > 0).length;
  const indicators = [
    { label: "Giáo viên có hoạt động dạy học số", value: percent(activeTeachers.length, teachers.length), detail: `${activeTeachers.length}/${teachers.length} giáo viên` },
    { label: "Tỷ lệ tiết có nội dung số", value: percent(activeTeachers.reduce((s, t) => s + t.contentRate, 0), activeTeachers.length * 100), detail: "trung bình của giáo viên đang hoạt động" },
    { label: "Lớp được giao nội dung số", value: percent(assignedClasses.length, classes.length), detail: `${assignedClasses.length}/${classes.length} lớp` },
    { label: "Học sinh tham gia học trực tuyến", value: percent(participating.length, students.length), detail: `${participating.length}/${students.length} học sinh` },
    { label: "Bài tập nộp đúng hạn", value: percent(students.filter(s => s.homework > 0).reduce((s, r) => s + r.onTime, 0), students.filter(s => s.homework > 0).length * 100), detail: `trung bình trên ${students.filter(s => s.homework > 0).length} học sinh có bài tập` },
    { label: "Hoàn thành học liệu được giao", value: percent(materialDone, materialLearners), detail: `${number(materialDone)}/${number(materialLearners)} lượt học` },
  ];
  const metrics = [
    { label: "Giáo viên", value: teachers.length, detail: `${activeTeachers.length} đang hoạt động`, tab: "teacher" },
    { label: "Học sinh", value: students.length, detail: `${participating.length} đã tham gia học`, tab: "student" },
    { label: "Lớp học", value: classes.length, detail: `${assignedClasses.length} lớp có nội dung`, tab: "class" },
    { label: "Học liệu", value: MATERIALS.length, detail: `${number(materialLearners)} lượt học sinh học`, tab: "material" },
    { label: "Câu hỏi", value: QUESTIONS.length, detail: `${new Set(QUESTIONS.map(q => q.type)).size} dạng câu hỏi`, tab: "question" },
    { label: "Bài giảng", value: LECTURES.length, detail: `${assignedLectures} đã giao cho lớp`, tab: "lecture" },
  ] as const;
  const contributions = (t: Teacher) => t.lectures + t.materials + t.homework;
  const topTeachers = [...teachers].sort((a, b) => contributions(b) - contributions(a)).slice(0, 5);
  const activity = [
    { label: "Tích cực", count: teachers.filter(t => t.contentRate >= 80).length, color: "var(--dti-blue-strong)" },
    { label: "Thường xuyên", count: teachers.filter(t => t.contentRate >= 65 && t.contentRate < 80).length, color: "var(--dti-blue)" },
    { label: "Thỉnh thoảng", count: teachers.filter(t => t.contentRate > 0 && t.contentRate < 65).length, color: "var(--dti-blue-soft)" },
    { label: "Chưa hoạt động", count: teachers.filter(t => t.contentRate === 0).length, color: "var(--border)" },
  ];
  const grades = [1, 2, 3, 4, 5].map(grade => ({ grade, values: series.map(s => classes.filter(c => c.khoi === grade).reduce((total, c) => total + c[s.key], 0)) }));
  const maxGrade = Math.max(1, ...grades.flatMap(g => g.values));
  const kinds = [...new Set(MATERIALS.map(m => m.kind))].map(kind => {
    const rows = MATERIALS.filter(m => m.kind === kind);
    return { kind, count: rows.length, rate: percent(rows.reduce((s, r) => s + r.done, 0), rows.reduce((s, r) => s + r.learners, 0)) };
  }).sort((a, b) => b.count - a.count);
  const levels = ["Nhận biết", "Thông hiểu", "Vận dụng"];
  const topLectures = [...LECTURES].sort((a, b) => b.learners - a.learners).slice(0, 4);

  return <div className="dti-overview space-y-3 text-[13px] text-foreground">
    <section className="dti-panel">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-base font-semibold">Chỉ số chuyển đổi số so với mục tiêu</h2><p className="text-[11px] text-muted-foreground">Năm học 2026–2027 · mục tiêu mỗi chỉ số 80%</p></div><p className="text-[11px] text-muted-foreground"><strong className="text-lg text-foreground">{indicators.filter(i => i.value >= 80).length}</strong>/6 chỉ số đạt mục tiêu</p></div>
      <div className="grid gap-3 md:grid-cols-3">{indicators.map(i => <article key={i.label} className="rounded-md border border-border p-3"><div className="flex items-center justify-between gap-2 text-[11px]"><span>{i.label}</span><span className={`shrink-0 rounded px-2 text-[10px] ${i.value >= 80 ? "bg-dti-met text-exam-success" : i.value >= 50 ? "bg-dti-near text-exam-warning" : "bg-dti-unmet text-destructive"}`}>{i.value >= 80 ? "Đạt" : i.value >= 50 ? "Gần đạt" : "Chưa đạt"}</span></div><div className="my-1 flex items-center gap-3"><strong className="w-16 shrink-0 text-xl tabular-nums">{i.value}<span className="text-[11px] font-normal">%</span></strong><TargetBar value={i.value} label={i.label} /></div><p className="text-[11px] text-muted-foreground">{i.detail}</p></article>)}</div>
      <div className="mt-3 flex flex-wrap gap-4 text-[10px] text-muted-foreground"><span className="flex items-center gap-1"><i className="h-2 w-3 bg-dti-unmet" />Chưa đạt (dưới 50%)</span><span className="flex items-center gap-1"><i className="h-2 w-3 bg-dti-near" />Gần đạt (50–79%)</span><span className="flex items-center gap-1"><i className="h-2 w-3 bg-dti-met" />Đạt (từ 80%)</span><span className="flex items-center gap-1"><i className="h-3 border-l-2 border-foreground" />Mục tiêu</span></div>
    </section>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">{metrics.map((m, i) => <Button key={m.label} variant="outline" className={`dti-summary ${tones[i]} h-auto min-w-0 items-start rounded-md px-3 py-2 text-left font-normal`} onClick={() => onOpen(m.tab)}><span className="flex min-w-0 flex-col"><span className="text-[11px] text-muted-foreground">{m.label}</span><strong className="text-xl leading-6">{number(m.value)}</strong><span className="whitespace-normal text-[10px] text-muted-foreground">{m.detail}</span></span></Button>)}</div>
    <div className="grid gap-3 lg:grid-cols-[0.8fr_1fr]">
      <Panel title="Giáo viên theo mức độ hoạt động" subtitle="Theo số bài giảng, học liệu, bài tập đã tạo" tab="teacher" onOpen={onOpen}>
        <svg className="h-5 w-full overflow-hidden rounded" viewBox="0 0 100 20" preserveAspectRatio="none" aria-label="Mức độ hoạt động giáo viên" role="img">{activity.map((a, i) => <rect key={a.label} x={percent(activity.slice(0, i).reduce((s, r) => s + r.count, 0), teachers.length)} width={percent(a.count, teachers.length)} height="20" fill={a.color} />)}</svg>
        <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-muted-foreground">{activity.map(a => <span key={a.label} className="flex items-center gap-1"><svg width="8" height="8"><rect width="8" height="8" rx="1" fill={a.color} /></svg>{a.label} <strong className="text-foreground">{a.count}</strong></span>)}</div>
        <h4 className="mb-2 mt-4 text-[11px] font-semibold">Giáo viên đóng góp nhiều nhất</h4>
        <div className="space-y-2">{topTeachers.map((t, i) => <div key={t.name} className="grid grid-cols-[16px_minmax(0,1fr)_minmax(60px,1fr)_32px] items-center gap-2 text-[11px]"><span className="text-muted-foreground">{i + 1}</span><span>{t.name}</span><Bar value={contributions(t)} max={Math.max(1, ...topTeachers.map(contributions))} /><strong className="text-right">{contributions(t)}</strong></div>)}</div><p className="mt-3 text-[10px] text-muted-foreground">Số = bài giảng + học liệu + bài tập đã tạo</p>
      </Panel>
      <Panel title="Nội dung đã giao theo khối" subtitle="Tổng số bài giảng, học liệu, bài tập, bài kiểm tra giao cho các lớp" tab="class" onOpen={onOpen}>
        <div className="flex flex-wrap gap-3 text-[10px]">{series.map(s => <span key={s.key} className="flex items-center gap-1"><svg width="8" height="8"><rect width="8" height="8" fill={s.color} /></svg>{s.label}</span>)}</div>
        <svg className="mt-3 h-[200px] w-full" viewBox="0 0 600 200" role="img" aria-label="Biểu đồ nội dung đã giao theo khối">{grades.map((g, i) => <g key={g.grade}><line x1={i * 120 + 5} x2={i * 120 + 115} y1="177" y2="177" stroke="var(--border)" />{g.values.map((v, j) => <g key={j}><rect x={i * 120 + 12 + j * 27} y={177 - v / maxGrade * 148} width="15" height={v / maxGrade * 148} rx="2" fill={series[j]?.color} /><text x={i * 120 + 19.5 + j * 27} y={170 - v / maxGrade * 148} textAnchor="middle" fontSize="8" fill="var(--muted-foreground)">{v}</text></g>)}<text x={i * 120 + 60} y="193" textAnchor="middle" fontSize="10" fill="var(--muted-foreground)">Khối {g.grade}</text></g>)}</svg>
      </Panel>
    </div>
    <div className="grid gap-3 lg:grid-cols-3">
      <Panel title="Học liệu theo thể loại" subtitle={`${MATERIALS.length} học liệu · tỷ lệ hoàn thành theo lượt học`} tab="material" onOpen={onOpen}><div className="space-y-2">{kinds.map((k, i) => <div key={k.kind} className="grid grid-cols-[minmax(0,1fr)_minmax(40px,1fr)_24px_48px] items-center gap-2 text-[11px]"><span className="flex items-center gap-2"><svg width="7" height="7" className="shrink-0"><circle cx="3.5" cy="3.5" r="3" fill={`var(--${tones[i % tones.length]})`} /></svg>{k.kind}</span><Bar value={k.count} max={Math.max(1, ...kinds.map(r => r.count))} color={`var(--${tones[i % tones.length]})`} /><strong className="text-right">{k.count}</strong><span className="text-right text-[9px] text-muted-foreground">{k.rate}% HT</span></div>)}</div></Panel>
      <Panel title="Ngân hàng câu hỏi" subtitle={`Phân bố ${QUESTIONS.length} câu theo khối và mức độ nhận thức`} tab="question" onOpen={onOpen}><table className="w-full border-separate border-spacing-1 text-center text-[11px]"><thead><tr><th /><th className="font-normal text-muted-foreground">Nhận biết</th><th className="font-normal text-muted-foreground">Thông hiểu</th><th className="font-normal text-muted-foreground">Vận dụng</th></tr></thead><tbody>{[1, 2, 3, 4, 5].map(g => <tr key={g}><th className="text-left font-normal text-muted-foreground">Khối {g}</th>{levels.map(level => { const count = QUESTIONS.filter(q => q.grade === `Khối ${g}` && q.level === level).length; return <td key={level} className={`h-8 rounded ${count ? "bg-dti-blue-soft text-foreground" : "bg-muted text-muted-foreground"}`}>{count}</td>; })}</tr>)}</tbody><tfoot><tr><th className="pt-2 text-left font-normal text-muted-foreground">Tổng</th>{levels.map(level => { const count = QUESTIONS.filter(q => q.level === level).length; return <td key={level} className="pt-2"><strong>{count}</strong> <span className="text-[9px] text-muted-foreground">({percent(count, QUESTIONS.length)}%)</span></td>; })}</tr></tfoot></table></Panel>
      <Panel title="Bài giảng" subtitle="Mức độ đưa bài giảng vào lớp học" tab="lecture" onOpen={onOpen}><div className="mb-2 grid grid-cols-3 gap-2">{[{ value: assignedLectures, label: "đã giao lớp" }, { value: LECTURES.length - assignedLectures, label: "chưa giao" }, { value: `${percent(lectureDone, lectureLearners)}%`, label: "học sinh hoàn thành" }].map(m => <div key={m.label} className="rounded bg-muted p-2"><strong className="text-base">{m.value}</strong><p className="text-[9px] text-muted-foreground">{m.label}</p></div>)}</div><Bar value={assignedLectures} max={LECTURES.length} color="var(--dti-green)" /><h4 className="mb-1 mt-3 text-[11px] font-semibold">Nhiều học sinh tham gia nhất</h4>{topLectures.map(l => <div key={l.name} className="flex items-start justify-between gap-2 border-t border-border py-2 text-[11px]"><div className="min-w-0"><p className="line-clamp-1" title={l.name}>{l.name}</p><p className="text-[9px] text-muted-foreground">{l.classes.join(", ") || "Chưa giao lớp"}</p></div><strong className="shrink-0">{l.learners} HS</strong></div>)}</Panel>
    </div>
  </div>;
}
