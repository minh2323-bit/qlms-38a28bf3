import { useRef } from "react";
import { ArrowLeft, ArrowRight, Crown, TrendingDown, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { schoolStatisticsForFilter } from "@/lib/school-statistics";
import type { DtiOverviewFilter } from "@/lib/dti-overview-filter";

type ReportTab = "teacher" | "student" | "class" | "material" | "question" | "lecture";
const colors = ["var(--dti-blue)", "var(--dti-teal)", "var(--dti-blue-soft)", "var(--dti-orange)", "var(--dti-rose)", "var(--dti-violet)"];
const tones = ["dti-blue", "dti-teal", "dti-blue", "dti-orange", "dti-violet", "dti-orange", "dti-rose", "dti-teal"];
/** Report tab (or in-page anchor) opened by each school index tile, in INDEXES order. */
const indexTargets: (ReportTab | "hlbq")[] = ["material", "lecture", "question", "hlbq", "question", "class", "class", "class"];
const donutTab = (title: string): ReportTab => title.startsWith("Ngân hàng") ? "question" : "material";
const monthlyTabs: Record<string, ReportTab> = { baiGiang: "lecture", hocLieu: "material", baiTap: "class", kiemTra: "class" };
const formatNumber = (n: number) => n.toLocaleString("vi-VN");
const monthlySeries = [
  { key: "baiGiang", label: "Bài giảng", color: "var(--dti-blue-strong)" },
  { key: "hocLieu", label: "Học liệu", color: "var(--dti-blue)" },
  { key: "baiTap", label: "Bài tập", color: "var(--dti-blue-soft)" },
  { key: "kiemTra", label: "Bài kiểm tra", color: "var(--dti-slate)" },
];

function Donut({ title, data, unit = "", tab, onOpen }: { title: string; data: { name: string; value: number }[]; unit?: string; tab?: ReportTab; onOpen?: (tab: ReportTab) => void }) {
  const hasData = data.some(row => row.value > 0);
  const clickable = tab !== undefined && onOpen !== undefined;
  return <article
    className={`min-w-0 rounded-lg border border-border bg-card p-4${clickable ? " cursor-pointer transition-colors hover:border-exam-primary/50" : ""}`}
    role={clickable ? "button" : undefined}
    tabIndex={clickable ? 0 : undefined}
    aria-label={clickable ? `Xem báo cáo: ${title}` : undefined}
    onClick={clickable ? () => onOpen(tab) : undefined}
    onKeyDown={clickable ? e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(tab); } } : undefined}
  >
    <div className="flex items-start justify-between gap-2"><h3 className="min-h-10 text-base font-semibold">{title}</h3>{clickable && <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-exam-primary">Xem chi tiết<ArrowRight className="h-3.5 w-3.5" /></span>}</div>
    <div className="h-[200px]" role="img" aria-label={title}>
      {hasData ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={76} paddingAngle={2} stroke="var(--card)" strokeWidth={2} isAnimationActive={false}>{data.map((row, i) => <Cell key={row.name} fill={colors[i % colors.length]} />)}</Pie><Tooltip contentStyle={{ background: "var(--popover)", borderColor: "var(--border)", color: "var(--popover-foreground)", borderRadius: 6, fontSize: 13 }} itemStyle={{ color: "var(--popover-foreground)" }} formatter={(value: number) => `${formatNumber(value)}${unit}`} /></PieChart></ResponsiveContainer> : <div className="flex h-full items-center justify-center text-muted-foreground">Không có dữ liệu</div>}
    </div>
    <div className="flex min-h-10 flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13px]">{data.map((row, i) => <span key={row.name} className="flex items-center gap-1"><svg width="10" height="10" aria-hidden="true"><circle cx="5" cy="5" r="5" fill={colors[i % colors.length]} /></svg>{row.name}</span>)}</div>
  </article>;
}

export function DtiSchoolIndexes({ filter, onOpen }: { filter: DtiOverviewFilter; onOpen: (tab: ReportTab) => void }) {
  const { indexes } = schoolStatisticsForFilter(filter);
  const openTarget = (target: ReportTab | "hlbq") => {
    if (target === "hlbq") document.getElementById("hlbq")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    else onOpen(target);
  };
  return <div className="dti-school-index grid grid-cols-2 gap-3 xl:grid-cols-4">{indexes.map((row, i) => <article key={row.label} className={`dti-school-metric ${tones[i]} min-w-0 cursor-pointer rounded-lg border border-border bg-card p-4 transition-colors hover:border-exam-primary/50`} role="button" tabIndex={0} aria-label={`Xem báo cáo: ${row.label}`} onClick={() => openTarget(indexTargets[i] ?? "teacher")} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openTarget(indexTargets[i] ?? "teacher"); } }}>
    <span className="dti-school-icon mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md"><row.icon className="h-5 w-5" /></span>
    <span className="block text-2xl font-bold tabular-nums text-exam-primary underline decoration-exam-primary/40 underline-offset-4">{formatNumber(row.count)}</span>
    <p className="mt-1 text-[13px] leading-5">{row.label}</p>
    {row.growth !== undefined && <p className={`mt-1.5 flex items-center gap-1 text-[13px] font-semibold ${row.change < 0 ? "text-destructive" : "text-exam-success"}`}>{row.change < 0 ? <TrendingDown className="h-3.5 w-3.5 shrink-0" /> : <TrendingUp className="h-3.5 w-3.5 shrink-0" />}<span>{formatNumber(Math.abs(row.change))} so với tháng trước</span></p>}
  </article>)}</div>;
}

export function DtiSchoolDonuts({ filter, onOpen }: { filter: DtiOverviewFilter; onOpen: (tab: ReportTab) => void }) {
  const { pies } = schoolStatisticsForFilter(filter);
  return <div className="dti-school-donuts space-y-3"><div className="grid gap-3 md:grid-cols-2">{pies.filter(pie => !pie.title.startsWith("Ngân hàng")).map(pie => <Donut key={pie.title} {...pie} tab={donutTab(pie.title)} onOpen={onOpen} />)}</div><div className="grid gap-3 md:grid-cols-3">{pies.filter(pie => pie.title.startsWith("Ngân hàng")).map(pie => <Donut key={pie.title} {...pie} tab={donutTab(pie.title)} onOpen={onOpen} />)}</div></div>;
}

export function DtiSchoolMonthly({ filter, onOpen }: { filter: DtiOverviewFilter; onOpen: (tab: ReportTab) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { monthly } = schoolStatisticsForFilter(filter);
  const move = (direction: number) => {
    const scroll = scrollRef.current;
    if (!scroll) return;
    scroll.scrollBy({ left: direction * scroll.clientWidth * 0.65, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };
  return <section className="min-w-0 space-y-3" aria-label="Nội dung đã tạo theo tháng"><div className="flex items-center justify-between gap-2"><h2 className="text-lg font-semibold">Nội dung đã tạo theo tháng</h2><div className="flex gap-1"><Button variant="outline" size="icon" className="h-8 w-8" title="Cuộn sang trái" aria-label="Cuộn sang trái" onClick={() => move(-1)}><ArrowLeft className="h-4 w-4" /></Button><Button variant="outline" size="icon" className="h-8 w-8" title="Cuộn sang phải" aria-label="Cuộn sang phải" onClick={() => move(1)}><ArrowRight className="h-4 w-4" /></Button></div></div>
    <div className="rounded-lg border border-border bg-card p-3"><div ref={scrollRef} className="dti-month-scroll overflow-x-auto" tabIndex={0} aria-label="Cuộn biểu đồ theo tháng"><div className="h-[300px] min-w-[1600px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthly} barGap={5} barCategoryGap="18%" margin={{ top: 16, right: 20, bottom: 10, left: 0 }}><CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} /><XAxis dataKey="month" tick={{ fill: "var(--muted-foreground)", fontSize: 13 }} tickLine={false} axisLine={{ stroke: "var(--border)" }} /><YAxis allowDecimals={false} tick={{ fill: "var(--muted-foreground)", fontSize: 13 }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={{ background: "var(--popover)", color: "var(--popover-foreground)", borderColor: "var(--border)", borderRadius: 6, fontSize: 13 }} />{monthlySeries.map(s => <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[4, 4, 0, 0]} maxBarSize={22} isAnimationActive={false} cursor="pointer" onClick={() => onOpen(monthlyTabs[s.key] ?? "class")} />)}</BarChart></ResponsiveContainer></div></div><div className="mt-3 flex flex-wrap justify-center gap-4 text-[13px]">{monthlySeries.map(s => <span key={s.key} className="flex items-center gap-1"><svg width="9" height="9" aria-hidden="true"><circle cx="4.5" cy="4.5" r="4.5" fill={s.color} /></svg>{s.label}</span>)}</div></div>
  </section>;
}

export function DtiCopyrightStatistics({ filter }: { filter: DtiOverviewFilter }) {
  const { copyrightPurpose, copyrightFormat, copyrightRows } = schoolStatisticsForFilter(filter);
  return <section id="hlbq" className="min-w-0 space-y-3 scroll-mt-4"><h2 className="flex items-center gap-2 text-lg font-semibold"><Crown className="h-5 w-5 text-exam-warning" />Thống kê Học liệu bản quyền</h2>
    <div className="grid gap-3 md:grid-cols-2"><Donut title="Phân loại theo mục đích sử dụng của Giáo viên" data={copyrightPurpose} /><Donut title="Phân loại theo định dạng" data={copyrightFormat} /></div>
    <div className="overflow-x-auto rounded-lg border border-border bg-card"><table className="w-full min-w-[880px] text-[13px]"><thead className="border-b border-border bg-muted text-muted-foreground"><tr>{["STT", "Tên học liệu", "Lượt sử dụng", "Khối", "Môn", "Nhà cung cấp", "Định dạng"].map(label => <th key={label} className={`px-3 py-3 font-medium ${label === "Tên học liệu" ? "text-left" : "text-center"}`}>{label}</th>)}</tr></thead><tbody>{copyrightRows.map((row, i) => <tr key={row.name} className="border-b border-border last:border-0 hover:bg-muted/50"><td className="px-3 py-3 text-center">{i + 1}</td><td className="px-3 py-3 font-medium text-exam-primary">{row.name}</td><td className="px-3 py-3 text-center font-semibold text-exam-warning">{formatNumber(row.uses)}</td><td className="whitespace-nowrap px-3 py-3 text-center">{row.grade}</td><td className="px-3 py-3 text-center">{row.subject}</td><td className="px-3 py-3 text-center">{row.provider}</td><td className="px-3 py-3 text-center"><span className="inline-block whitespace-nowrap rounded bg-exam-tint px-2 py-1 text-[13px] text-exam-primary">{row.format}</span></td></tr>)}{copyrightRows.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">Không có dữ liệu</td></tr>}</tbody></table></div>
  </section>;
}