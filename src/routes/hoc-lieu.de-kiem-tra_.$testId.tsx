import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pencil, Save, X, LayoutGrid, FileCheck2 } from "lucide-react";
import { toast } from "sonner";
import { getTest, getTestQuestions, updateTest, type ExamQuestion } from "@/lib/exam-store";
import {
  MATRIX_LEVELS, getMatrix, groupLabel, matrixTotal, rowTotal,
} from "@/lib/matrix-store";

export const Route = createFileRoute("/hoc-lieu/de-kiem-tra_/$testId")({
  head: () => ({
    meta: [
      { title: "Chi tiết đề kiểm tra – QLMS" },
      { name: "description", content: "Xem thông tin đề kiểm tra, danh sách câu hỏi và khung ma trận đã dùng để sinh đề." },
      { property: "og:title", content: "Chi tiết đề kiểm tra – QLMS" },
      { property: "og:description", content: "Xem thông tin đề kiểm tra, danh sách câu hỏi và khung ma trận đã dùng để sinh đề." },
    ],
  }),
  component: Page,
});

function Page() {
  const { testId } = useParams({ from: "/hoc-lieu/de-kiem-tra_/$testId" });
  const navigate = useNavigate();
  const test = getTest(testId);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(test?.name ?? "");
  const [duration, setDuration] = useState(String(test?.duration ?? ""));
  const [maxScore, setMaxScore] = useState(String(test?.maxScore ?? ""));
  const [questions, setQuestions] = useState<ExamQuestion[]>(
    test ? getTestQuestions(test) : [],
  );

  const matrix = useMemo(
    () => (test?.kind === "matrix" && test.matrixId ? getMatrix(test.matrixId) : undefined),
    [test],
  );

  if (!test) {
    return (
      <AppShell role="teacher">
        <section className="bg-white rounded-xl border p-8 text-center">
          <p className="text-slate-600">Không tìm thấy đề kiểm tra.</p>
          <Button className="mt-4" onClick={() => navigate({ to: "/hoc-lieu/de-kiem-tra" })}>
            Về danh sách đề
          </Button>
        </section>
      </AppShell>
    );
  }

  const groups = matrix
    ? Array.from(new Set(matrix.rows.flatMap((r) => Object.keys(r.counts))))
    : [];

  return (
    <AppShell role="teacher">
      <section className="bg-white rounded-xl border shadow-sm">
        <div className="px-5 py-4 border-b flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-1"
            onClick={() => navigate({ to: "/hoc-lieu/de-kiem-tra" })}>
            <ArrowLeft className="h-4 w-4" /> Quay lại
          </Button>
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-indigo-700" />
            <div>
              <h1 className="text-lg font-bold text-slate-800">Chi tiết đề kiểm tra</h1>
              <p className="text-[13px] italic text-slate-500">
                {test.kind === "matrix" ? "Đề sinh từ khung ma trận" : "Đề tạo mới thủ công"}
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {editing ? (
              <>
                <Button variant="outline" size="sm" className="gap-1" onClick={() => setEditing(false)}>
                  <X className="h-4 w-4" /> Hủy
                </Button>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-1"
                  onClick={() => {
                    updateTest(test.id, {
                      name,
                      duration: Number(duration) || test.duration,
                      maxScore: Number(maxScore) || test.maxScore,
                    });
                    setEditing(false);
                    toast.success("Đã lưu thay đổi cho đề kiểm tra");
                  }}>
                  <Save className="h-4 w-4" /> Lưu
                </Button>
              </>
            ) : (
              <Button size="sm" className="bg-indigo-700 hover:bg-indigo-800 gap-1" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" /> Sửa
              </Button>
            )}
          </div>
        </div>

        {/* Thông tin đề */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 border-b">
          <div className="md:col-span-3">
            <L>Tên đề</L>
            <Input value={name} onChange={(e) => setName(e.target.value)} readOnly={!editing}
              className={editing ? "" : "bg-slate-50"} />
          </div>
          <div><L>Khối</L><Input value={`Khối ${test.grade}`} readOnly className="bg-slate-50" /></div>
          <div><L>Môn</L><Input value={test.subject} readOnly className="bg-slate-50" /></div>
          <div><L>Số câu</L><Input value={String(questions.length)} readOnly className="bg-slate-50" /></div>
          <div>
            <L>Thời gian (phút)</L>
            <Input value={duration} onChange={(e) => setDuration(e.target.value)} readOnly={!editing}
              className={editing ? "" : "bg-slate-50"} />
          </div>
          <div>
            <L>Thang điểm</L>
            <Input value={maxScore} onChange={(e) => setMaxScore(e.target.value)} readOnly={!editing}
              className={editing ? "" : "bg-slate-50"} />
          </div>
          <div className="flex items-end">
            <div className="flex items-center gap-1.5">
              <Badge variant="outline">{test.kind === "matrix" ? "Ma trận" : "Tạo mới"}</Badge>
              {test.share === "pending" && (
                <Badge className="bg-amber-100 text-amber-700 border border-amber-200">Chờ duyệt</Badge>
              )}
              {test.share === "approved" && (
                <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">Đã duyệt</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Khung ma trận (chỉ với đề sinh từ ma trận) */}
        {matrix && (
          <div className="p-5 border-b">
            <div className="flex items-center gap-2 mb-3">
              <LayoutGrid className="h-4 w-4 text-indigo-700" />
              <h2 className="font-semibold text-slate-800">Khung ma trận đã sử dụng</h2>
              <span className="text-[13px] italic text-slate-500">{matrix.name}</span>
            </div>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-700">
                    <th rowSpan={2} className="px-3 py-2 text-left border-r">Nội dung</th>
                    {groups.map((g) => (
                      <th key={g} colSpan={3} className="px-3 py-2 text-center border-r">{groupLabel(g)}</th>
                    ))}
                    <th rowSpan={2} className="px-3 py-2 text-center">Tổng</th>
                  </tr>
                  <tr className="bg-slate-50 text-slate-600 text-xs">
                    {groups.flatMap((g) =>
                      MATRIX_LEVELS.map((lv) => (
                        <th key={`${g}-${lv}`} className="px-2 py-1.5 text-center border-r font-medium">{lv}</th>
                      )),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {matrix.rows.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="px-3 py-2 border-r">
                        <div className="text-slate-800">{r.lessonTitle}</div>
                        <div className="text-[12px] text-slate-500">{r.chapterTitle}</div>
                      </td>
                      {groups.flatMap((g) =>
                        MATRIX_LEVELS.map((lv, li) => (
                          <td key={`${r.id}-${g}-${lv}`} className="px-2 py-2 text-center border-r text-slate-700">
                            {r.counts[g]?.[li] ?? 0}
                          </td>
                        )),
                      )}
                      <td className="px-3 py-2 text-center font-semibold text-slate-800">{rowTotal(r)}</td>
                    </tr>
                  ))}
                  <tr className="border-t bg-slate-50 font-semibold text-slate-800">
                    <td className="px-3 py-2 border-r">Tổng số câu</td>
                    {groups.flatMap((g) =>
                      MATRIX_LEVELS.map((lv, li) => (
                        <td key={`sum-${g}-${lv}`} className="px-2 py-2 text-center border-r">
                          {matrix.rows.reduce((s, r) => s + (r.counts[g]?.[li] ?? 0), 0)}
                        </td>
                      )),
                    )}
                    <td className="px-3 py-2 text-center">{matrixTotal(matrix.rows)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Danh sách câu hỏi */}
        <div className="p-5 space-y-4">
          <h2 className="font-semibold text-slate-800">Danh sách câu hỏi</h2>
          {questions.map((q, idx) => (
            <div key={q.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="outline" className="font-semibold">Câu {idx + 1}.</Badge>
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">{q.level}</Badge>
                <span className="text-[13px] text-slate-600">{q.type}</span>
                <span className="text-[13px] text-slate-500">{q.lessonTitle}</span>
                <span className="ml-auto text-[13px] text-slate-600">Điểm: <b>{q.score}</b></span>
              </div>
              <Input
                value={q.stem}
                readOnly={!editing}
                className={editing ? "" : "bg-slate-50"}
                onChange={(e) => setQuestions((p) => p.map((x) => x.id === q.id ? { ...x, stem: e.target.value } : x))}
              />
              <div className="mt-2 space-y-1.5">
                {q.opts.map((o, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded border flex items-center justify-center text-xs font-semibold ${
                      i === q.correct ? "border-indigo-500 text-indigo-700 bg-indigo-50" : "text-slate-600"
                    }`}>{"ABCD"[i]}</span>
                    <Input
                      value={o}
                      readOnly={!editing}
                      className={`h-8 ${i === q.correct ? "border-indigo-300" : ""} ${editing ? "" : "bg-slate-50"}`}
                      onChange={(e) => setQuestions((p) => p.map((x) => x.id === q.id
                        ? { ...x, opts: x.opts.map((oo, oi) => oi === i ? e.target.value : oo) }
                        : x))}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function L({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-slate-700 mb-1">{children}</label>;
}
