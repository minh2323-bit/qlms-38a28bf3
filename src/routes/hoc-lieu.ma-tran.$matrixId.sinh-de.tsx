import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft, CircleDot, RefreshCw, PenLine, FileCheck2, Library, ChevronDown,
  CheckSquare, FileText, ToggleLeft, Move, TextCursorInput, Link2, ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  MATRIX_GROUPS, MATRIX_LEVELS, getMatrix, matrixTotal, type MatrixGroup,
} from "@/lib/matrix-store";

const QUESTION_TYPES = [
  { key: "single", label: "Trắc nghiệm 1 đáp án", Icon: CircleDot },
  { key: "multiple", label: "Trắc nghiệm nhiều đáp án", Icon: CheckSquare },
  { key: "essay", label: "Tự luận", Icon: FileText },
  { key: "truefalse", label: "Đúng - Sai", Icon: ToggleLeft },
  { key: "drag", label: "Kéo thả", Icon: Move },
  { key: "fill", label: "Điền khuyết", Icon: TextCursorInput },
  { key: "match", label: "Nối", Icon: Link2 },
  { key: "order", label: "Sắp xếp", Icon: ArrowUpDown },
];


export const Route = createFileRoute("/hoc-lieu/ma-tran/$matrixId/sinh-de")({
  head: () => ({
    meta: [
      { title: "Sinh đề từ khung ma trận – QLMS" },
      { name: "description", content: "Đề thi được sinh tự động từ ngân hàng câu hỏi theo khung ma trận đã lưu." },
      { property: "og:title", content: "Sinh đề từ khung ma trận – QLMS" },
      { property: "og:description", content: "Đề thi được sinh tự động từ ngân hàng câu hỏi theo khung ma trận đã lưu." },
    ],
  }),
  component: Page,
});

const GROUP_LABEL: Record<MatrixGroup, string> = {
  tn: "Trắc nghiệm 1 đáp án",
  tnn: "Trắc nghiệm nhiều đáp án",
  tl: "Tự luận",
};

const BANK = [
  {
    stem: "Cho hai tập hợp A và B. Tập hợp A ∩ B là",
    opts: [
      "tập hợp tất cả các phần tử thuộc A hoặc thuộc B.",
      "tập hợp tất cả các phần tử vừa thuộc A vừa thuộc B.",
      "tập hợp các phần tử thuộc A nhưng không thuộc B.",
      "tập hợp tất cả các phần tử thuộc B nhưng không thuộc A.",
    ],
    correct: 1,
    hint: "B đúng vì giao của hai tập hợp gồm các phần tử chung.",
  },
  {
    stem: "Số liền sau của số 99 999 là số nào?",
    opts: ["99 998", "100 000", "99 990", "100 001"],
    correct: 1,
    hint: "Số liền sau hơn số đã cho 1 đơn vị.",
  },
  {
    stem: "Kết quả của phép tính 3 200 + 4 500 là",
    opts: ["7 700", "7 600", "8 700", "6 700"],
    correct: 0,
    hint: "Cộng theo từng hàng từ phải sang trái.",
  },
  {
    stem: "Trong các số sau, số nào là số chẵn?",
    opts: ["1 235", "4 671", "8 904", "7 777"],
    correct: 2,
    hint: "Số chẵn có chữ số tận cùng là 0, 2, 4, 6, 8.",
  },
];

const FALLBACK_LESSONS = [
  "Bài 1: Ôn tập các số đến 100 000",
  "Bài 2: Ôn tập các phép tính",
  "Bài 3: Số chẵn, số lẻ",
  "Bài 4: Biểu thức số",
];

type GenQ = {
  id: string;
  bankIndex: number;
  level: string;
  group: MatrixGroup;
  lessonTitle: string;
  manual?: boolean;
  manualType?: string;

};

function Page() {
  const { matrixId } = useParams({ from: "/hoc-lieu/ma-tran/$matrixId/sinh-de" });
  const navigate = useNavigate();
  const matrix = getMatrix(matrixId);

  const initial = useMemo<GenQ[]>(() => {
    if (!matrix) return [];
    const out: GenQ[] = [];
    let n = 0;
    matrix.rows.forEach((r) => {
      MATRIX_GROUPS.forEach((g) => {
        MATRIX_LEVELS.forEach((lv, li) => {
          const c = r.counts[g.key][li] || 0;
          for (let i = 0; i < c; i++) {
            out.push({
              id: `q-${n}`,
              bankIndex: n % BANK.length,
              level: lv === "VD" ? "Vận dụng" : lv === "Hiểu" ? "Thông hiểu" : "Nhận biết",
              group: g.key,
              lessonTitle: r.lessonTitle,
            });
            n++;
          }
        });
      });
    });
    if (out.length === 0) {
      // Ma trận chưa phân bổ chi tiết -> tự lấy câu hỏi từ ngân hàng theo Số câu
      const total = matrix.count || 10;
      const levels = ["Nhận biết", "Thông hiểu", "Vận dụng"];
      for (let i = 0; i < total; i++) {
        out.push({
          id: `q-${i}`,
          bankIndex: i % BANK.length,
          level: levels[i < total * 0.4 ? 0 : i < total * 0.8 ? 1 : 2],
          group: "tn",
          lessonTitle: FALLBACK_LESSONS[i % FALLBACK_LESSONS.length],
        });
      }
    }
    return out;
  }, [matrix]);

  const [name, setName] = useState(matrix?.name ?? "");
  const [questions, setQuestions] = useState<GenQ[]>(initial);
  const [pickFor, setPickFor] = useState<string | null>(null);


  if (!matrix) {
    return (
      <AppShell role="teacher">
        <section className="bg-white rounded-xl border p-8 text-center">
          <p className="text-slate-600">Không tìm thấy khung ma trận.</p>
          <Button className="mt-4" onClick={() => navigate({ to: "/hoc-lieu/de-kiem-tra" })}>Về danh sách đề</Button>
        </section>
      </AppShell>
    );
  }

  const swap = (id: string) => {
    setQuestions((prev) => prev.map((q) =>
      q.id === id ? { ...q, bankIndex: (q.bankIndex + 1) % BANK.length, manual: false } : q));
    toast.success("Đã đổi sang câu hỏi khác từ ngân hàng câu hỏi");
  };

  return (
    <AppShell role="teacher">
      <section className="bg-white rounded-xl border shadow-sm">
        <div className="px-5 py-4 border-b flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" /> Quay lại
          </Button>
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-indigo-700" />
            <div>
              <h1 className="text-lg font-bold text-slate-800">Sinh đề từ khung ma trận</h1>
              <p className="text-[13px] italic text-slate-500">{matrix.name}</p>
            </div>
          </div>
        </div>

        {/* Auto-filled info */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 border-b">
          <div>
            <L>Tên đề thi</L>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div><L>Khối</L><Input value={`Khối ${matrix.grade}`} readOnly className="bg-slate-50" /></div>
          <div><L>Môn</L><Input value={matrix.subject} readOnly className="bg-slate-50" /></div>
          <div><L>Số câu</L><Input value={String(questions.length || matrixTotal(matrix.rows) || matrix.count)} readOnly className="bg-slate-50" /></div>
          <div><L>Thời gian</L><Input value={String(matrix.minutes)} readOnly className="bg-slate-50" /></div>
          <div><L>Thang điểm</L><Input value={String(matrix.maxScore)} readOnly className="bg-slate-50" /></div>
        </div>

        {/* Questions */}
        <div className="p-5 space-y-4">
          {questions.length === 0 && (
            <p className="text-sm text-slate-500">Ma trận chưa phân bổ câu hỏi nào.</p>
          )}
          {questions.map((q, idx) => {
            const b = BANK[q.bankIndex];
            return (
              <div key={q.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant="outline" className="font-semibold">Câu {idx + 1}.</Badge>
                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">{q.level}</Badge>
                  <span className="flex items-center gap-1 text-[13px] text-slate-600">
                    <CircleDot className="h-3.5 w-3.5 text-indigo-600" /> {GROUP_LABEL[q.group]}
                  </span>
                  <span className="text-[13px] text-slate-500">{q.lessonTitle}</span>
                  {q.manual && <Badge className="bg-slate-200 text-slate-700 hover:bg-slate-200">Nhập thủ công</Badge>}
                  {q.manualType && (
                    <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">{q.manualType}</Badge>
                  )}
                  <div className="ml-auto flex items-center gap-2">
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => swap(q.id)}>
                      <RefreshCw className="h-3.5 w-3.5" /> Đổi câu khác
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => setPickFor(q.id)}>
                      <Library className="h-3.5 w-3.5" /> Chọn từ ngân hàng câu hỏi
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-1">
                          <PenLine className="h-3.5 w-3.5" /> Thay câu hỏi thủ công
                          <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64">
                        {QUESTION_TYPES.map((t) => (
                          <DropdownMenuItem
                            key={t.key}
                            className="gap-2"
                            onClick={() => {
                              setQuestions((prev) => prev.map((x) =>
                                x.id === q.id ? { ...x, manual: true, manualType: t.label } : x));
                              toast.info(`Nhập thủ công câu hỏi dạng: ${t.label}`);
                            }}
                          >
                            <t.Icon className="h-4 w-4 text-indigo-600" /> {t.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                </div>

                <Input defaultValue={b.stem} key={`${q.id}-${q.bankIndex}`} readOnly={!q.manual}
                  className={q.manual ? "" : "bg-slate-50"} />
                <div className="mt-2 space-y-1.5">
                  {b.opts.map((o, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded border flex items-center justify-center text-xs font-semibold ${
                        i === b.correct ? "border-indigo-500 text-indigo-700 bg-indigo-50" : "text-slate-600"
                      }`}>{"ABCD"[i]}</span>
                      <Input defaultValue={o} readOnly={!q.manual}
                        className={`h-8 ${i === b.correct ? "border-indigo-300" : ""} ${q.manual ? "" : "bg-slate-50"}`} />
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-[11px] uppercase tracking-wide text-amber-600 text-right">Hướng dẫn giải</div>
                <p className="text-[13px] text-slate-500">{b.hint}</p>
              </div>
            );
          })}

          <div className="flex justify-end">
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                toast.success("Đã tạo đề thi từ khung ma trận");
                navigate({ to: "/hoc-lieu/de-kiem-tra" });
              }}
            >
              Tạo Đề
            </Button>
          </div>
        </div>
      </section>

      <Dialog open={!!pickFor} onOpenChange={(v) => !v && setPickFor(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-indigo-700 flex items-center gap-2">
              <Library className="h-5 w-5" /> Chọn câu hỏi từ ngân hàng câu hỏi
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {BANK.map((b, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuestions((prev) => prev.map((x) =>
                    x.id === pickFor ? { ...x, bankIndex: i, manual: false, manualType: undefined } : x));
                  setPickFor(null);
                  toast.success("Đã thay thế bằng câu hỏi từ ngân hàng câu hỏi");
                }}
                className="w-full text-left rounded-lg border p-3 hover:border-indigo-400 hover:bg-indigo-50/50 transition"
              >
                <div className="text-[13px] font-semibold text-slate-800">{b.stem}</div>
                <div className="text-[12px] text-slate-500 mt-1">
                  Đáp án đúng: {"ABCD"[b.correct]}. {b.opts[b.correct]}
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>

  );
}

function L({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-slate-700 mb-1">
      {children} <span className="text-rose-500">*</span>
    </label>
  );
}
