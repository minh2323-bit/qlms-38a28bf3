import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ChevronDown, ChevronRight, Grid3x3, Trash2, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { getKnowledgeTree } from "@/lib/knowledge-tree";
import {
  MATRIX_GROUPS, MATRIX_LEVELS, emptyCounts, matrixTotal, rowTotal, saveMatrix,
  type MatrixGroup, type MatrixRow,
} from "@/lib/matrix-store";

export const Route = createFileRoute("/hoc-lieu/ma-tran/tao-moi")({
  head: () => ({
    meta: [
      { title: "Thêm khung ma trận đề – QLMS" },
      { name: "description", content: "Tạo khung ma trận đề kiểm tra theo bài học, mức độ nhận thức và phân bổ điểm." },
      { property: "og:title", content: "Thêm khung ma trận đề – QLMS" },
      { property: "og:description", content: "Tạo khung ma trận đề kiểm tra theo bài học, mức độ nhận thức và phân bổ điểm." },
    ],
  }),
  component: Page,
});

const SUBJECTS_BY_GRADE: Record<string, string[]> = {
  "3": ["Toán", "Tiếng Việt", "Đạo đức"],
  "4": ["Toán", "Tiếng Việt", "Khoa học", "Đạo đức"],
  "5": ["Toán", "Tiếng Việt", "Khoa học"],
};

function Page() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("4");
  const [subject, setSubject] = useState("Toán");
  const [count, setCount] = useState("10");
  const [minutes, setMinutes] = useState("35");
  const [maxScore, setMaxScore] = useState("10");
  const [mtype, setMtype] = useState("");
  const [rows, setRows] = useState<MatrixRow[]>([]);
  const [openCh, setOpenCh] = useState<Record<string, boolean>>({});

  const tree = useMemo(() => getKnowledgeTree(grade, subject), [grade, subject]);

  const addLesson = (chapterId: string, chapterTitle: string, lessonId: string, lessonTitle: string) => {
    if (rows.some((r) => r.lessonId === lessonId)) {
      toast.info("Bài học đã có trong ma trận");
      return;
    }
    setRows((prev) => [...prev, {
      id: `r-${lessonId}-${Date.now()}`,
      chapterId, chapterTitle, lessonId, lessonTitle,
      counts: emptyCounts(),
    }]);
  };

  const setCell = (rowId: string, g: MatrixGroup, li: number, v: string) => {
    const n = v === "" ? 0 : Math.max(0, parseInt(v, 10) || 0);
    setRows((prev) => prev.map((r) => {
      if (r.id !== rowId) return r;
      const arr = [...r.counts[g]] as [number, number, number];
      arr[li] = n;
      return { ...r, counts: { ...r.counts, [g]: arr } };
    }));
  };

  const total = matrixTotal(rows);
  const colTotal = (g: MatrixGroup, li: number) =>
    rows.reduce((s, r) => s + (r.counts[g][li] || 0), 0);
  const perQuestionScore = total > 0 ? Number(maxScore) / total : 0;

  const save = (thenGenerate: boolean) => {
    if (!name.trim()) { toast.error("Vui lòng nhập tên ma trận"); return; }
    if (rows.length === 0) { toast.error("Chọn ít nhất 1 bài học từ danh sách bên trái"); return; }
    const m = saveMatrix({
      name: name.trim(), grade, subject,
      count: total || Number(count) || 0,
      minutes: Number(minutes) || 0,
      maxScore: Number(maxScore) || 10,
      type: mtype, rows,
    });
    toast.success("Đã lưu khung ma trận");
    if (thenGenerate) {
      navigate({ to: "/hoc-lieu/ma-tran/$matrixId/sinh-de", params: { matrixId: m.id } });
    }
  };

  return (
    <AppShell role="teacher">
      <section className="bg-white rounded-xl border shadow-sm">
        <div className="px-5 py-4 border-b flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" /> Quay lại
          </Button>
          <div className="flex items-center gap-2">
            <Grid3x3 className="h-5 w-5 text-indigo-700" />
            <h1 className="text-lg font-bold text-indigo-700">Thêm mới - Khung ma trận đề</h1>
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
                {(SUBJECTS_BY_GRADE[grade] ?? []).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Số câu</Label>
            <Input value={total > 0 ? String(total) : count} onChange={(e) => setCount(e.target.value)} readOnly={total > 0} />
          </div>
          <div>
            <Label>Thời gian (phút)</Label>
            <Input value={minutes} onChange={(e) => setMinutes(e.target.value)} />
          </div>
          <div>
            <Label>Thang điểm</Label>
            <Input value={maxScore} onChange={(e) => setMaxScore(e.target.value)} />
          </div>
          <div>
            <Label>Loại khung ma trận</Label>
            <Select value={mtype} onValueChange={setMtype}>
              <SelectTrigger><SelectValue placeholder="Chọn loại" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="15p">Kiểm tra 15 phút</SelectItem>
                <SelectItem value="1tiet">Kiểm tra 1 tiết</SelectItem>
                <SelectItem value="gk">Giữa kỳ</SelectItem>
                <SelectItem value="ck">Cuối kỳ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Body: tree + matrix */}
        <div className="p-5 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
          {/* Left tree */}
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
                  {MATRIX_GROUPS.map((g) => (
                    <th key={g.key} colSpan={3} className="border border-slate-300 bg-indigo-900 text-white px-3 py-2">{g.label}</th>
                  ))}
                  <th rowSpan={2} className="border border-slate-300 bg-indigo-900 text-white px-3 py-2 w-[110px]">Tổng số câu theo bài học</th>
                  <th rowSpan={2} className="border border-slate-300 bg-indigo-900 text-white px-3 py-2 w-[90px]">Tỷ lệ %</th>
                </tr>
                <tr>
                  {MATRIX_GROUPS.flatMap((g) =>
                    MATRIX_LEVELS.map((l) => (
                      <th key={`${g.key}-${l}`} className="border border-slate-300 bg-indigo-800 text-white px-2 py-1 font-medium w-[58px]">{l}</th>
                    )),
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={13} className="border border-slate-300 px-3 py-8 text-center text-slate-500">
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
                      {MATRIX_GROUPS.flatMap((g) =>
                        MATRIX_LEVELS.map((_l, li) => (
                          <td key={`${r.id}-${g.key}-${li}`} className="border border-slate-300 p-0">
                            <input
                              value={r.counts[g.key][li] || ""}
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
                      {MATRIX_GROUPS.flatMap((g) =>
                        MATRIX_LEVELS.map((_l, li) => (
                          <td key={`t-${g.key}-${li}`} className="border border-slate-300 text-center">
                            {colTotal(g.key, li) || ""}
                          </td>
                        )),
                      )}
                      <td className="border border-slate-300 text-center">{total}/{maxScore || 0}</td>
                      <td className="border border-slate-300 text-center">100%</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="border border-slate-300 px-2 py-1.5" colSpan={2}>
                        <div className="font-semibold">Tổng số điểm</div>
                        <div className="text-[11px] italic text-slate-500">*Điểm sẽ được chia đều cho từng câu</div>
                      </td>
                      {MATRIX_GROUPS.flatMap((g) =>
                        MATRIX_LEVELS.map((_l, li) => {
                          const c = colTotal(g.key, li);
                          return (
                            <td key={`s-${g.key}-${li}`} className="border border-slate-300 text-center">
                              {c ? (c * perQuestionScore).toFixed(1).replace(/\.0$/, "") : ""}
                            </td>
                          );
                        }),
                      )}
                      <td className="border border-slate-300 text-center">{maxScore || 0}/<b>{maxScore || 0}</b></td>
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
