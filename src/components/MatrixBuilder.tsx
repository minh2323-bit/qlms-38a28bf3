import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, ChevronDown, ChevronRight, Grid3x3, Trash2, Download, Sparkles, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { getKnowledgeTree } from "@/lib/knowledge-tree";
import {
  MATRIX_GROUPS, MATRIX_EXTRA_GROUPS, ALL_MATRIX_GROUPS, MATRIX_LEVELS, emptyCounts,
  matrixTotal, rowTotal, saveMatrix, groupLabel,
  type ExamMatrix, type MatrixGroup, type MatrixRow,
} from "@/lib/matrix-store";

const SUBJECTS_BY_GRADE: Record<string, string[]> = {
  "3": ["Toán", "Tiếng Việt", "Đạo đức"],
  "4": ["Toán", "Tiếng Việt", "Khoa học", "Đạo đức"],
  "5": ["Toán", "Tiếng Việt", "Khoa học"],
};

export function MatrixBuilder({ existing }: { existing?: ExamMatrix }) {
  const navigate = useNavigate();
  const [name, setName] = useState(existing?.name ?? "");
  const [grade, setGrade] = useState(existing?.grade ?? "4");
  const [subject, setSubject] = useState(existing?.subject ?? "Toán");
  const [count, setCount] = useState(String(existing?.count ?? 10));
  const [minutes, setMinutes] = useState(String(existing?.minutes ?? 35));
  const [maxScore, setMaxScore] = useState(String(existing?.maxScore ?? 10));
  const [scoreMode, setScoreMode] = useState(
    existing ? (String(existing.maxScore) === "10" || String(existing.maxScore) === "100" ? String(existing.maxScore) : "custom") : "10",
  );
  const [scoreOverrides, setScoreOverrides] = useState<Record<string, string>>({});

  const [mtype, setMtype] = useState(existing?.type ?? "");
  const [rows, setRows] = useState<MatrixRow[]>(existing?.rows ?? []);
  const [openCh, setOpenCh] = useState<Record<string, boolean>>({});
  const [groupKeys, setGroupKeys] = useState<MatrixGroup[]>(
    existing?.groups ?? MATRIX_GROUPS.map((g) => g.key),
  );

  const groups = useMemo(
    () => groupKeys.map((k) => ALL_MATRIX_GROUPS.find((g) => g.key === k) ?? { key: k, label: groupLabel(k) }),
    [groupKeys],
  );

  const tree = useMemo(() => getKnowledgeTree(grade, subject), [grade, subject]);

  const toggleGroup = (key: MatrixGroup) => {
    setGroupKeys((prev) => {
      const has = prev.includes(key);
      if (has && prev.length === 1) return prev;
      return has ? prev.filter((k) => k !== key) : [...prev, key];
    });
    setRows((prev) => prev.map((r) => (r.counts[key] ? r : { ...r, counts: { ...r.counts, [key]: [0, 0, 0] } })));
  };

  const addLesson = (chapterId: string, chapterTitle: string, lessonId: string, lessonTitle: string) => {
    if (rows.some((r) => r.lessonId === lessonId)) {
      toast.info("Bài học đã có trong ma trận");
      return;
    }
    setRows((prev) => [...prev, {
      id: `r-${lessonId}-${Date.now()}`,
      chapterId, chapterTitle, lessonId, lessonTitle,
      counts: emptyCounts(groupKeys),
    }]);
  };

  const setCell = (rowId: string, g: MatrixGroup, li: number, v: string) => {
    const n = v === "" ? 0 : Math.max(0, parseInt(v, 10) || 0);
    setRows((prev) => prev.map((r) => {
      if (r.id !== rowId) return r;
      const arr = [...(r.counts[g] ?? [0, 0, 0])] as [number, number, number];
      arr[li] = n;
      return { ...r, counts: { ...r.counts, [g]: arr } };
    }));
  };

  const total = matrixTotal(rows);
  const colTotal = (g: MatrixGroup, li: number) =>
    rows.reduce((s, r) => s + (r.counts[g]?.[li] || 0), 0);
  const perQuestionScore = total > 0 ? Number(maxScore) / total : 0;
  const scoreTotal = groups.reduce(
    (s, g) =>
      s +
      MATRIX_LEVELS.reduce((s2, _l, li) => {
        const k = `${g.key}-${li}`;
        const c = colTotal(g.key, li);
        const v = scoreOverrides[k] ?? (c ? String(c * perQuestionScore) : "");
        return s2 + (parseFloat(v) || 0);
      }, 0),
    0,
  );

  const save = (thenGenerate: boolean) => {
    if (!name.trim()) { toast.error("Vui lòng nhập tên ma trận"); return; }
    if (rows.length === 0) { toast.error("Chọn ít nhất 1 bài học từ danh sách bên trái"); return; }
    const m = saveMatrix({
      id: existing?.id,
      name: name.trim(), grade, subject,
      count: total || Number(count) || 0,
      minutes: Number(minutes) || 0,
      maxScore: Number(maxScore) || 10,
      type: mtype, groups: groupKeys, rows,
    });
    toast.success("Đã lưu khung ma trận");
    if (thenGenerate) {
      navigate({ to: "/hoc-lieu/ma-tran/$matrixId/sinh-de", params: { matrixId: m.id } });
    }
  };

  const colCount = 2 + groups.length * 3 + 2;

  return (
    <AppShell role="teacher">
      <section className="bg-white rounded-xl border shadow-sm">
        <div className="px-5 py-4 border-b flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" /> Quay lại
          </Button>
          <div className="flex items-center gap-2">
            <Grid3x3 className="h-5 w-5 text-indigo-700" />
            <h1 className="text-lg font-bold text-indigo-700">
              {existing ? "Chi tiết - Khung ma trận đề" : "Thêm mới - Khung ma trận đề"}
            </h1>
          </div>
        </div>

        {/* Thông tin chung */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4 border-b">
          <div className="md:col-span-2">
            <Label>Tên ma trận</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Ma trận kiểm tra 1 tiết Chủ đề 1" />
          </div>
          <div>
            <Label>Khối</Label>
            <Select value={grade} onValueChange={(v) => { setGrade(v); setSubject(SUBJECTS_BY_GRADE[v][0]); setRows([]); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.keys(SUBJECTS_BY_GRADE).map((g) => <SelectItem key={g} value={g}>Khối {g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Môn</Label>
            <Select value={subject} onValueChange={(v) => { setSubject(v); setRows([]); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(SUBJECTS_BY_GRADE[grade] ?? [subject]).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Số câu</Label>
            <Input value={count} onChange={(e) => setCount(e.target.value)} inputMode="numeric" />
          </div>
          <div>
            <Label>Thời gian (phút)</Label>
            <Input value={minutes} onChange={(e) => setMinutes(e.target.value)} />
          </div>
          <div>
            <Label>Thang điểm</Label>
            <div className="flex items-center gap-2">
              <Select
                value={scoreMode}
                onValueChange={(v) => { setScoreMode(v); if (v !== "custom") setMaxScore(v); }}
              >
                <SelectTrigger className={scoreMode === "custom" ? "w-[140px]" : ""}><SelectValue placeholder="Chọn thang điểm" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="custom">Tùy chỉnh</SelectItem>
                </SelectContent>
              </Select>
              {scoreMode === "custom" && (
                <Input
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value.replace(/[^\d.]/g, ""))}
                  inputMode="numeric"
                  placeholder="Nhập số"
                  className="flex-1"
                />
              )}
            </div>
          </div>
          <div>
            <Label>Loại khung ma trận</Label>
            <Select value={mtype} onValueChange={setMtype}>
              <SelectTrigger><SelectValue placeholder="Chọn loại" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="chuong-bai">Khung ma trận theo Chương - Bài học</SelectItem>
                <SelectItem value="mach-kien-thuc">Khung ma trận theo mạch kiến thức (CT GDPT 2018)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loại câu hỏi đánh giá */}
        <div className="px-5 py-3 border-b flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">Loại câu hỏi đánh giá</span>
          {groups.map((g) => (
            <span key={g.key} className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-[12px] font-medium text-indigo-700">
              {g.label}
              <button
                onClick={() => toggleGroup(g.key)}
                aria-label={`Bỏ cột ${g.label}`}
                className="text-indigo-400 hover:text-rose-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1 h-7 text-[12px] text-indigo-700 border-indigo-300">
                <Plus className="h-3.5 w-3.5" /> Thêm loại câu hỏi
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              {ALL_MATRIX_GROUPS.map((g) => (
                <DropdownMenuCheckboxItem
                  key={g.key}
                  checked={groupKeys.includes(g.key)}
                  onCheckedChange={() => toggleGroup(g.key)}
                  onSelect={(e) => e.preventDefault()}
                >
                  {g.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="text-[12px] italic text-slate-500">
            Điền khai ở dòng "Tổng điểm" cuối lưới ({MATRIX_EXTRA_GROUPS.length} dạng bổ sung)
          </span>
        </div>

        {/* Body: tree + matrix */}
        <div className="p-5 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
          <div className="rounded-lg border bg-sky-50/50 max-h-[520px] overflow-y-auto">
            <div className="px-3 py-2 text-xs font-bold uppercase text-slate-600 border-b bg-sky-100/60 sticky top-0">
              Chủ đề &amp; Bài học
            </div>
            {tree.length === 0 && (
              <p className="p-3 text-sm text-slate-500">Chưa có dữ liệu bài học cho môn này.</p>
            )}
            {tree.map((c) => {
              const open = openCh[c.id] ?? true;
              return (
                <div key={c.id} className="border-b last:border-0">
                  <button
                    onClick={() => setOpenCh((p) => ({ ...p, [c.id]: !open }))}
                    className="w-full flex items-center gap-1 px-3 py-2 text-left text-[12px] font-bold uppercase text-sky-800 hover:bg-sky-100/60"
                  >
                    {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    <span className="flex-1">{c.title}</span>
                  </button>
                  {open && (
                    <div className="pb-1">
                      {c.units.map((u) => {
                        const added = rows.some((r) => r.lessonId === u.id);
                        return (
                          <button
                            key={u.id}
                            onClick={() => addLesson(c.id, c.title, u.id, u.title)}
                            className={`w-full text-left pl-8 pr-3 py-1.5 text-[13px] transition ${
                              added ? "text-slate-400 cursor-default" : "text-slate-700 hover:bg-white hover:text-indigo-700"
                            }`}
                          >
                            {u.title}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Matrix table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  <th rowSpan={2} className="border border-slate-300 bg-indigo-900 text-white px-3 py-2 min-w-[150px]">Chương/Chủ đề</th>
                  <th rowSpan={2} className="border border-slate-300 bg-indigo-900 text-white px-3 py-2 min-w-[170px]">Bài học</th>
                  {groups.map((g) => (
                    <th key={g.key} colSpan={3} className="border border-slate-300 bg-indigo-900 text-white px-3 py-2">{g.label}</th>
                  ))}
                  <th rowSpan={2} className="border border-slate-300 bg-indigo-900 text-white px-3 py-2 w-[110px]">Tổng số câu theo bài học</th>
                  <th rowSpan={2} className="border border-slate-300 bg-indigo-900 text-white px-3 py-2 w-[90px]">Tỷ lệ %</th>
                </tr>
                <tr>
                  {groups.flatMap((g) =>
                    MATRIX_LEVELS.map((l) => (
                      <th key={`${g.key}-${l}`} className="border border-slate-300 bg-indigo-800 text-white px-2 py-1 font-medium w-[58px]">{l}</th>
                    )),
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={colCount} className="border border-slate-300 px-3 py-8 text-center text-slate-500">
                      Chọn một bài học ở danh sách bên trái để thêm dòng vào ma trận.
                    </td>
                  </tr>
                )}
                {rows.map((r) => {
                  const rt = rowTotal(r);
                  return (
                    <tr key={r.id}>
                      <td className="border border-slate-300 px-2 py-1.5 align-middle">{r.chapterTitle}</td>
                      <td className="border border-slate-300 px-2 py-1.5">
                        <div className="flex items-center gap-1">
                          <span className="flex-1">{r.lessonTitle}</span>
                          <button
                            className="text-rose-500 hover:text-rose-600"
                            onClick={() => setRows((p) => p.filter((x) => x.id !== r.id))}
                            aria-label="Xóa bài học khỏi ma trận"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                      {groups.flatMap((g) =>
                        MATRIX_LEVELS.map((_l, li) => (
                          <td key={`${r.id}-${g.key}-${li}`} className="border border-slate-300 p-0">
                            <input
                              value={r.counts[g.key]?.[li] || ""}
                              onChange={(e) => setCell(r.id, g.key, li, e.target.value)}
                              inputMode="numeric"
                              className="w-full h-9 text-center outline-none focus:bg-indigo-50"
                            />
                          </td>
                        )),
                      )}
                      <td className="border border-slate-300 text-center font-semibold">{rt}</td>
                      <td className="border border-slate-300 text-center">
                        {total > 0 ? `${Math.round((rt / total) * 100)}%` : "0%"}
                      </td>
                    </tr>
                  );
                })}
                {rows.length > 0 && (
                  <>
                    <tr className="bg-slate-50 font-semibold">
                      <td className="border border-slate-300 px-2 py-1.5" colSpan={2}>Tổng</td>
                      {groups.flatMap((g) =>
                        MATRIX_LEVELS.map((_l, li) => (
                          <td key={`t-${g.key}-${li}`} className="border border-slate-300 text-center">
                            {colTotal(g.key, li) || ""}
                          </td>
                        )),
                      )}
                      <td className="border border-slate-300 text-center">{total}/{count || 0}</td>
                      <td className="border border-slate-300 text-center">100%</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="border border-slate-300 px-2 py-1.5" colSpan={2}>
                        <div className="font-semibold">Tổng số điểm</div>
                        <div className="text-[11px] italic text-slate-500">*Điểm sẽ được chia đều cho từng câu</div>
                      </td>
                      {groups.flatMap((g) =>
                        MATRIX_LEVELS.map((_l, li) => {
                          const c = colTotal(g.key, li);
                          const k = `${g.key}-${li}`;
                          const auto = c ? (c * perQuestionScore).toFixed(1).replace(/\.0$/, "") : "";
                          return (
                            <td key={`s-${k}`} className="border border-slate-300 p-0">
                              <input
                                value={scoreOverrides[k] ?? auto}
                                onChange={(e) =>
                                  setScoreOverrides((p) => ({ ...p, [k]: e.target.value.replace(/[^\d.]/g, "") }))
                                }
                                inputMode="decimal"
                                className="w-full h-9 text-center bg-transparent outline-none focus:bg-indigo-50"
                              />
                            </td>
                          );
                        }),
                      )}
                      <td className="border border-slate-300 text-center">
                        {scoreTotal.toFixed(1).replace(/\.0$/, "")}/<b>{maxScore || 0}</b>
                      </td>
                      <td className="border border-slate-300" />
                    </tr>
                  </>
                )}
              </tbody>
            </table>

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" className="gap-1" onClick={() => toast.success("Đã xuất file khung ma trận")}>
                <Download className="h-4 w-4" /> Xuất file khung ma trận
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 gap-1" onClick={() => save(true)}>
                <Sparkles className="h-4 w-4" /> Lưu ma trận &amp; Sinh đề
              </Button>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-slate-700 mb-1">
      {children} <span className="text-rose-500">*</span>
    </label>
  );
}
