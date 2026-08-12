import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { FilterSelect } from "@/components/ExamBankShared";
import { GRADES, SUBJECTS } from "@/lib/shared-exam-bank";
import {
  CHAPTERS, getOriginalPapers, type ExamSession, type ExamEffect, type ExamLevel,
} from "@/lib/exam-sessions";
import {
  Search, SlidersHorizontal, Plus, Trash2, CheckCircle2, XCircle, Pencil,
  CalendarIcon, Landmark, Building2, School, RotateCcw, FileText,
} from "lucide-react";
import { toast } from "sonner";

const TABS: { key: ExamLevel; label: string; icon: typeof School }[] = [
  { key: "truong", label: "Kỳ thi cấp Trường", icon: School },
  { key: "xa", label: "Kỳ thi cấp Xã/Phường", icon: Building2 },
  { key: "so", label: "Kỳ thi cấp Sở", icon: Landmark },
];

const EFFECT_TABS: { key: ExamEffect; label: string }[] = [
  { key: "upcoming", label: "Sắp diễn ra" },
  { key: "ongoing", label: "Đang diễn ra" },
  { key: "done", label: "Đã diễn ra" },
];

function parseDate(d: string) {
  const [dd, mm, yyyy] = d.split("/").map(Number);
  return new Date(yyyy, mm - 1, dd);
}

export function ExamSessionsPage({
  title, subtitle, icon: Icon, data,
}: {
  title: string;
  subtitle: string;
  icon: typeof School;
  data: ExamSession[];
}) {
  const [tab, setTab] = useState<ExamLevel>("truong");
  const [effectTab, setEffectTab] = useState<ExamEffect>("upcoming");
  const [q, setQ] = useState("");
  const [grade, setGrade] = useState("all");
  const [subject, setSubject] = useState("all");
  const [chapter, setChapter] = useState("all");
  const [approval, setApproval] = useState("all");
  const [range, setRange] = useState<DateRange | undefined>();
  const [advOpen, setAdvOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<null | "delete" | "unapprove" | "approve">(null);
  const [papersOf, setPapersOf] = useState<ExamSession | null>(null);

  const counts = useMemo(() => {
    const c: Record<ExamLevel, number> = { truong: 0, xa: 0, so: 0 };
    data.forEach((e) => { c[e.level] += 1; });
    return c;
  }, [data]);

  const rows = useMemo(
    () => data.filter((e) => {
      const d = parseDate(e.date);
      return e.level === tab
        && e.effect === effectTab
        && (q.trim() === "" || e.name.toLowerCase().includes(q.trim().toLowerCase()))
        && (grade === "all" || e.grade === grade)
        && (subject === "all" || e.subject === subject)
        && (chapter === "all" || e.chapter === chapter)
        && (approval === "all" || e.approval === approval)
        && (!range?.from || d >= range.from)
        && (!range?.to || d <= range.to);
    }),
    [data, tab, effectTab, q, grade, subject, chapter, approval, range],
  );

  const reset = () => {
    setQ(""); setGrade("all"); setSubject("all"); setChapter("all");
    setApproval("all"); setRange(undefined);
  };

  const allChecked = rows.length > 0 && rows.every((r) => selected.includes(r.id));
  const toggleAll = () => setSelected(allChecked ? [] : rows.map((r) => r.id));
  const toggleOne = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const runAction = () => {
    const n = selected.length;
    if (confirm === "delete") toast.success(`Đã xóa ${n} kỳ thi.`);
    if (confirm === "unapprove") toast.success(`Đã hủy duyệt ${n} kỳ thi.`);
    if (confirm === "approve") toast.success(`Đã duyệt ${n} kỳ thi.`);
    setSelected([]);
    setConfirm(null);
  };

  const rangeLabel = range?.from
    ? `${format(range.from, "dd/MM/yyyy")}${range.to ? ` – ${format(range.to, "dd/MM/yyyy")}` : ""}`
    : "Chọn khoảng ngày";

  const isUpcoming = effectTab === "upcoming";
  const isDesigned = tab === "truong";

  const papersCell = (e: ExamSession) => (
    <TableCell className="text-center">
      <button
        onClick={() => setPapersOf(e)}
        className="text-indigo-700 font-semibold hover:underline"
      >
        {e.originalCount}
      </button>
    </TableCell>
  );

  const permutedCell = (e: ExamSession) => (
    <TableCell className="text-sm">
      <div>Đề hoán vị: <span className="font-semibold">{e.permutedCodes.length}</span></div>
      <div className="text-xs text-slate-500 mt-0.5">{e.permutedCodes.join("; ")}</div>
    </TableCell>
  );

  return (
    <AppShell>
      <section className="bg-white rounded-2xl border shadow-sm">
        <div className="px-6 py-4 border-b flex items-start gap-3">
          <Icon className="h-6 w-6 text-indigo-700 mt-0.5" />
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800">{title}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
          </div>
          {isDesigned && isUpcoming && (
            <div className="flex flex-wrap gap-2 justify-end">
              <Button variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50"
                disabled={!selected.length} onClick={() => setConfirm("delete")}>
                <Trash2 className="h-4 w-4" /> Xóa
              </Button>
              <Button variant="outline" disabled={!selected.length} onClick={() => setConfirm("unapprove")}>
                <XCircle className="h-4 w-4" /> Hủy duyệt
              </Button>
              <Button variant="outline" className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                disabled={!selected.length} onClick={() => setConfirm("approve")}>
                <CheckCircle2 className="h-4 w-4" /> Duyệt kỳ thi
              </Button>
              <Button className="bg-indigo-700 hover:bg-indigo-800" onClick={() => toast.info("Mở form thêm kỳ thi mới.")}>
                <Plus className="h-4 w-4" /> Thêm mới
              </Button>
            </div>
          )}
        </div>

        <div className="px-6 pt-4 flex gap-2 border-b">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setSelected([]); }}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition flex items-center gap-1.5 ${
                tab === t.key
                  ? "border-indigo-700 text-indigo-700"
                  : "border-transparent text-slate-600 hover:text-indigo-700"
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
              <span className="ml-1 inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-rose-100 px-1.5 text-[11px] font-bold text-rose-600">
                {counts[t.key]}
              </span>
            </button>
          ))}
        </div>

        {!isDesigned ? (
          <div className="p-16 text-center text-slate-400 text-sm">Đang thiết kế</div>
        ) : (
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              {EFFECT_TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => { setEffectTab(t.key); setSelected([]); }}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition ${
                    effectTab === t.key
                      ? "bg-indigo-700 text-white border-indigo-700"
                      : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
              <div className="md:col-span-2">
                <Label className="text-sm">Tìm kiếm</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    className="pl-9 bg-white"
                    placeholder="Tìm theo tên kỳ thi..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
              </div>
              <FilterSelect
                label="Khối" value={grade} onChange={setGrade} allLabel="Tất cả khối"
                options={GRADES.map((g) => ({ value: g, label: `Khối ${g}` }))}
              />
              <FilterSelect
                label="Môn" value={subject} onChange={setSubject} allLabel="Tất cả môn"
                options={SUBJECTS.map((s) => ({ value: s, label: s }))}
              />
              <FilterSelect
                label="Chương bài" value={chapter} onChange={setChapter} allLabel="Tất cả chương bài"
                options={CHAPTERS.map((c) => ({ value: c, label: c }))}
              />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setAdvOpen(true)}>
                  <SlidersHorizontal className="h-4 w-4" /> Tìm kiếm nâng cao
                </Button>
                <Button variant="outline" onClick={reset} title="Đặt lại bộ lọc">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-xl border overflow-x-auto">
              <Table className="min-w-[1180px]">
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-12 text-center">STT</TableHead>
                    {isUpcoming && (
                      <TableHead className="w-12 text-center">
                        <Checkbox checked={allChecked} onCheckedChange={toggleAll} aria-label="Chọn tất cả" />
                      </TableHead>
                    )}
                    <TableHead className="w-16 text-center">Sửa</TableHead>
                    <TableHead className="w-16 text-center">Khối</TableHead>
                    <TableHead className="w-28">Môn</TableHead>
                    <TableHead className="min-w-[240px]">Tên kỳ thi</TableHead>
                    {isUpcoming && <TableHead className="text-center w-32">Trạng thái</TableHead>}
                    <TableHead className="text-center w-40">Thời gian tổ chức</TableHead>
                    <TableHead className="text-center w-32">
                      {isUpcoming ? "Thí sinh ĐK" : "Thí sinh dự thi"}
                    </TableHead>
                    <TableHead className="text-center w-28">Đề thi gốc</TableHead>
                    <TableHead className="w-56">Số lượng &amp; Danh sách đề hoán vị</TableHead>
                    {effectTab === "ongoing" && (
                      <TableHead className="text-center w-28 sticky right-0 bg-slate-50 shadow-[-6px_0_8px_-6px_rgba(0,0,0,0.15)]">
                        Giám sát
                      </TableHead>
                    )}
                    {effectTab === "done" && (
                      <TableHead className="text-center w-36 sticky right-0 bg-slate-50 shadow-[-6px_0_8px_-6px_rgba(0,0,0,0.15)]">
                        Tra cứu kết quả
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((e, i) => (
                    <TableRow key={e.id} className="hover:bg-slate-50 align-top group">
                      <TableCell className="text-center text-slate-500">{i + 1}</TableCell>
                      {isUpcoming && (
                        <TableCell className="text-center">
                          <Checkbox
                            checked={selected.includes(e.id)}
                            onCheckedChange={() => toggleOne(e.id)}
                            aria-label={`Chọn ${e.name}`}
                          />
                        </TableCell>
                      )}
                      <TableCell className="text-center">
                        <button
                          onClick={() => toast.info(`Sửa kỳ thi: ${e.name}`)}
                          aria-label={`Sửa ${e.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border text-indigo-700 hover:bg-indigo-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </TableCell>
                      <TableCell className="text-center">{e.grade}</TableCell>
                      <TableCell>{e.subject}</TableCell>
                      <TableCell>
                        <div className="font-semibold text-slate-800">{e.name}</div>
                        <div className="text-xs text-slate-500">{e.chapter}</div>
                      </TableCell>
                      {isUpcoming && (
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                            e.approval === "approved"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {e.approval === "approved" ? "Đã duyệt" : "Chờ duyệt"}
                          </span>
                        </TableCell>
                      )}
                      <TableCell className="text-center text-sm">
                        <div className="font-medium text-slate-700">{e.date}</div>
                        <div className="text-xs text-slate-500">{e.timeRange} · {e.minutes} phút</div>
                      </TableCell>
                      <TableCell className="text-center text-sm font-semibold text-indigo-700">
                        {isUpcoming ? e.registered : e.attended}
                      </TableCell>
                      {papersCell(e)}
                      {permutedCell(e)}
                      {effectTab === "ongoing" && (
                        <TableCell className="text-center sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-6px_0_8px_-6px_rgba(0,0,0,0.15)]">
                          <Link to="/ky-thi/giam-sat/$examId" params={{ examId: e.id }} className="text-indigo-700 font-semibold hover:underline">
                            Giám sát
                          </Link>
                        </TableCell>
                      )}
                      {effectTab === "done" && (
                        <TableCell className="text-center sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-6px_0_8px_-6px_rgba(0,0,0,0.15)]">
                          <Link to="/ky-thi/tra-cuu/$examId" params={{ examId: e.id }} className="text-indigo-700 font-semibold hover:underline">
                            Tra cứu
                          </Link>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center text-slate-500 py-10">
                        Không có kỳ thi nào phù hợp bộ lọc.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </section>

      <Dialog open={!!papersOf} onOpenChange={(v) => !v && setPapersOf(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Danh sách đề thi gốc</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {papersOf && getOriginalPapers(papersOf).map((p) => (
              <Link
                key={p.id}
                to="/ky-thi/de-thi"
                onClick={() => setPapersOf(null)}
                className="flex items-start gap-3 rounded-xl border p-3 hover:border-indigo-300 hover:bg-indigo-50/50"
              >
                <FileText className="h-5 w-5 text-indigo-700 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800">{p.name}</div>
                  <div className="text-xs text-slate-500">Mã đề gốc: {p.code}</div>
                </div>
              </Link>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Sheet open={advOpen} onOpenChange={setAdvOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-indigo-700" /> Tìm kiếm nâng cao
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto py-4">
            <div className="space-y-4">
              <FilterSelect
                label="Chương / Bài" value={chapter} onChange={setChapter} allLabel="Tất cả chương / bài"
                options={CHAPTERS.map((c) => ({ value: c, label: c }))}
              />
              <FilterSelect
                label="Trạng thái" value={approval} onChange={setApproval} allLabel="Tất cả"
                options={[{ value: "approved", label: "Đã duyệt" }, { value: "pending", label: "Chờ duyệt" }]}
              />
              <div>
                <Label className="text-sm">Thời gian tổ chức</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="mt-1 w-full justify-start font-normal bg-white">
                      <CalendarIcon className="mr-2 h-4 w-4" /> {rangeLabel}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="range" selected={range} onSelect={setRange} numberOfMonths={1} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <div className="border-t pt-4 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={reset}>Đặt lại</Button>
            <Button className="flex-1 bg-indigo-700 hover:bg-indigo-800" onClick={() => setAdvOpen(false)}>
              <Search className="h-4 w-4" /> Áp dụng
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!confirm} onOpenChange={(v) => !v && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm === "delete" ? "Xóa kỳ thi?" : confirm === "unapprove" ? "Hủy duyệt kỳ thi?" : "Duyệt kỳ thi?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác áp dụng cho {selected.length} kỳ thi đang chọn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={runAction}>Xác nhận</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

export type { ExamSession };
