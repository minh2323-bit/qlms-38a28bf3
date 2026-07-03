import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft, BellRing, Search, CheckCircle2, XCircle, MessageSquarePlus,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/giao-bai-tap/$taskId")({
  head: () => ({ meta: [{ title: "Chi tiết bài tập" }] }),
  component: Page,
});

/* ---------- Mock data ---------- */
type Student = {
  id: string;
  code: string;
  name: string;
  klass: string;
};

type Submission = {
  studentId: string;
  submittedAt: string;   // ISO
  overdue?: boolean;
  durationMin: number;
  score?: number;        // out of 10
  attempts?: { at: string; overdue?: boolean }[]; // multiple submits
};

const STUDENTS: Student[] = [
  { id: "s1", code: "HS001", name: "Nguyễn An", klass: "4A" },
  { id: "s2", code: "HS002", name: "Trần Bảo", klass: "4A" },
  { id: "s3", code: "HS003", name: "Mai Huyền", klass: "4A" },
  { id: "s4", code: "HS004", name: "Vũ Huy Hoàng", klass: "4B" },
  { id: "s5", code: "HS005", name: "Phạm Tất Thắng", klass: "4B" },
  { id: "s6", code: "HS006", name: "Lê Minh Châu", klass: "4A" },
  { id: "s7", code: "HS007", name: "Hoàng Khánh Linh", klass: "4B" },
  { id: "s8", code: "HS008", name: "Đỗ Quang Huy", klass: "4A" },
  { id: "s9", code: "HS009", name: "Nguyễn Bích Ngọc", klass: "4B" },
  { id: "s10", code: "HS010", name: "Bùi Tiến Dũng", klass: "4A" },
];

const SUBMISSIONS: Submission[] = [
  { studentId: "s1", submittedAt: "2026-04-10T09:12", durationMin: 25, score: 9,
    attempts: [{ at: "2026-04-09T20:15" }, { at: "2026-04-10T09:12" }] },
  { studentId: "s2", submittedAt: "2026-04-11T14:30", durationMin: 32, score: 8 },
  { studentId: "s3", submittedAt: "2026-04-12T22:05", durationMin: 41, overdue: true, score: 7 },
  { studentId: "s4", submittedAt: "2026-04-10T10:00", durationMin: 28 }, // not graded yet
  { studentId: "s5", submittedAt: "2026-04-11T08:45", durationMin: 35,
    attempts: [{ at: "2026-04-10T19:00", overdue: false }, { at: "2026-04-11T08:45" }] },
  { studentId: "s6", submittedAt: "2026-04-12T21:00", durationMin: 30, overdue: true },
];

type Question = {
  id: string;
  type: "mcq" | "essay";
  prompt: string;
  options?: { key: string; text: string }[];
  correct?: string;
};
const QUESTIONS: Question[] = [
  { id: "q1", type: "mcq", prompt: "1 + 1 bằng bao nhiêu?",
    options: [{ key: "A", text: "1" }, { key: "B", text: "2" }, { key: "C", text: "3" }], correct: "B" },
  { id: "q2", type: "mcq", prompt: "5 × 4 = ?",
    options: [{ key: "A", text: "20" }, { key: "B", text: "15" }, { key: "C", text: "25" }], correct: "A" },
  { id: "q3", type: "essay",
    prompt: "Trình bày cách quy đồng mẫu số 1/2 và 2/3." },
];

function fmt(s: string) {
  const d = new Date(s);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())} ${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function Page() {
  const { taskId } = useParams({ from: "/giao-bai-tap/$taskId" });
  const navigate = useNavigate();
  const [tab, setTab] = useState<"pending" | "submitted" | "graded">("pending");
  const [q, setQ] = useState("");
  const [klassFilter, setKlassFilter] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [score, setScore] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [questionFeedback, setQuestionFeedback] = useState<Record<string, string>>({});

  const submittedIds = new Set(SUBMISSIONS.map((s) => s.studentId));
  const gradedIds = new Set(SUBMISSIONS.filter((s) => s.score !== undefined).map((s) => s.studentId));

  const pendingStudents = STUDENTS.filter((s) => !submittedIds.has(s.id));
  const submittedList = SUBMISSIONS.filter((s) => !gradedIds.has(s.studentId));
  const gradedList = SUBMISSIONS.filter((s) => gradedIds.has(s.studentId));

  const filterStudent = (s: Student) =>
    (!q || s.name.toLowerCase().includes(q.toLowerCase()) || s.code.toLowerCase().includes(q.toLowerCase())) &&
    (!klassFilter || s.klass === klassFilter);

  const KLASSES = Array.from(new Set(STUDENTS.map((s) => s.klass)));

  const detailStudent = useMemo(
    () => STUDENTS.find((s) => s.id === selectedStudent) ?? null,
    [selectedStudent]
  );
  const detailSubmission = useMemo(
    () => SUBMISSIONS.find((s) => s.studentId === selectedStudent) ?? null,
    [selectedStudent]
  );

  return (
    <AppShell role="teacher">
      <section className="bg-white rounded-2xl border shadow-sm">
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/giao-bai-tap" })}
            className="p-2 rounded-md hover:bg-slate-100 text-slate-600"
            aria-label="Quay lại"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-slate-500 uppercase tracking-wide">Bài tập</div>
            <h2 className="text-lg font-bold text-slate-800 truncate">Chi tiết bài tập #{taskId}</h2>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 pt-4 flex items-center gap-6 border-b">
          {[
            { key: "pending", label: `${pendingStudents.length} chưa nộp`, color: "text-rose-600", active: "border-rose-500 text-rose-700" },
            { key: "submitted", label: `${submittedList.length} đã nộp`, color: "text-amber-600", active: "border-amber-500 text-amber-700" },
            { key: "graded", label: `${gradedList.length} đã chấm`, color: "text-emerald-600", active: "border-emerald-500 text-emerald-700" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key as typeof tab); setSelectedStudent(null); }}
              className={`pb-3 -mb-px border-b-2 text-sm font-semibold transition ${
                tab === t.key ? t.active : `border-transparent ${t.color} hover:opacity-80`
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body: split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-4 p-5">
          {/* LEFT — table */}
          <div className="rounded-xl border overflow-hidden bg-white">
            <div className="p-3 border-b bg-slate-50/60 flex items-center gap-2 flex-wrap">
              <select
                value={klassFilter}
                onChange={(e) => setKlassFilter(e.target.value)}
                className="h-9 rounded-md border border-slate-200 bg-white text-sm px-2"
              >
                <option value="">Lớp</option>
                {KLASSES.map((k) => <option key={k} value={k}>Lớp {k}</option>)}
              </select>
              <div className="relative flex-1 min-w-[160px]">
                <Search className="h-4 w-4 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} className="pl-8 h-9" placeholder="Tìm theo tên..." />
              </div>
            </div>

            <div className="overflow-x-auto">
              {tab === "pending" && (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs">
                    <tr>
                      <th className="px-3 py-2 text-left w-10">STT</th>
                      <th className="px-3 py-2 text-left">Mã HS</th>
                      <th className="px-3 py-2 text-left">Tên học sinh</th>
                      <th className="px-3 py-2 text-left">Lớp</th>
                      <th className="px-3 py-2 text-right">
                        <button
                          onClick={() => toast.success("Đã gửi nhắc nộp tới tất cả học sinh")}
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                          title="Nhắc tất cả"
                        >
                          <BellRing className="h-4 w-4" /> Nhắc tất cả
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {pendingStudents.filter(filterStudent).map((s, i) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-slate-500">{i + 1}</td>
                        <td className="px-3 py-2 font-mono text-xs">{s.code}</td>
                        <td className="px-3 py-2 font-medium text-slate-800">{s.name}</td>
                        <td className="px-3 py-2">{s.klass}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={() => toast.success(`Đã nhắc ${s.name} nộp bài`)}
                            className="p-1.5 rounded-md hover:bg-indigo-50 text-indigo-600"
                            title="Nhắc nộp"
                          >
                            <BellRing className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {pendingStudents.filter(filterStudent).length === 0 && (
                      <tr><td colSpan={5} className="text-center text-slate-400 py-8 text-sm">Không có dữ liệu.</td></tr>
                    )}
                  </tbody>
                </table>
              )}

              {tab === "submitted" && (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs">
                    <tr>
                      <th className="px-3 py-2 text-left w-10">STT</th>
                      <th className="px-3 py-2 text-left">Mã HS</th>
                      <th className="px-3 py-2 text-left">Tên học sinh</th>
                      <th className="px-3 py-2 text-left">Lớp</th>
                      <th className="px-3 py-2 text-left">Thời gian nộp</th>
                      <th className="px-3 py-2 text-left">Thời gian làm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {submittedList.map((sub, i) => {
                      const st = STUDENTS.find((s) => s.id === sub.studentId);
                      if (!st || !filterStudent(st)) return null;
                      const attempts = sub.attempts ?? [{ at: sub.submittedAt, overdue: sub.overdue }];
                      const isActive = selectedStudent === st.id;
                      return (
                        <tr
                          key={sub.studentId}
                          onClick={() => setSelectedStudent(st.id)}
                          className={`cursor-pointer ${isActive ? "bg-indigo-50" : "hover:bg-slate-50"}`}
                        >
                          <td className="px-3 py-2 text-slate-500 align-top">{i + 1}</td>
                          <td className="px-3 py-2 font-mono text-xs align-top">{st.code}</td>
                          <td className="px-3 py-2 font-medium text-slate-800 align-top">{st.name}</td>
                          <td className="px-3 py-2 align-top">{st.klass}</td>
                          <td className="px-3 py-2 align-top">
                            <div className="space-y-1">
                              {attempts.map((a, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <span className="text-xs">Lần {idx + 1}: {fmt(a.at)}</span>
                                  {a.overdue && (
                                    <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 text-[10px] px-1.5 py-0">
                                      Quá hạn
                                    </Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-3 py-2 align-top text-slate-700">{sub.durationMin} phút</td>
                        </tr>
                      );
                    })}
                    {submittedList.length === 0 && (
                      <tr><td colSpan={6} className="text-center text-slate-400 py-8 text-sm">Không có dữ liệu.</td></tr>
                    )}
                  </tbody>
                </table>
              )}

              {tab === "graded" && (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs">
                    <tr>
                      <th className="px-3 py-2 text-left w-10">STT</th>
                      <th className="px-3 py-2 text-left">Mã HS</th>
                      <th className="px-3 py-2 text-left">Tên học sinh</th>
                      <th className="px-3 py-2 text-left">Lớp</th>
                      <th className="px-3 py-2 text-left">Thời gian nộp</th>
                      <th className="px-3 py-2 text-center">Điểm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {gradedList.map((sub, i) => {
                      const st = STUDENTS.find((s) => s.id === sub.studentId);
                      if (!st || !filterStudent(st)) return null;
                      const isActive = selectedStudent === st.id;
                      return (
                        <tr
                          key={sub.studentId}
                          onClick={() => setSelectedStudent(st.id)}
                          className={`cursor-pointer ${isActive ? "bg-indigo-50" : "hover:bg-slate-50"}`}
                        >
                          <td className="px-3 py-2 text-slate-500">{i + 1}</td>
                          <td className="px-3 py-2 font-mono text-xs">{st.code}</td>
                          <td className="px-3 py-2 font-medium text-slate-800">{st.name}</td>
                          <td className="px-3 py-2">{st.klass}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs">{fmt(sub.submittedAt)}</span>
                              {sub.overdue && (
                                <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 text-[10px] px-1.5 py-0">
                                  Quá hạn
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span className="inline-flex items-center justify-center min-w-[42px] rounded-md bg-emerald-100 text-emerald-700 font-bold text-sm px-2 py-0.5">
                              {sub.score}/10
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {gradedList.length === 0 && (
                      <tr><td colSpan={6} className="text-center text-slate-400 py-8 text-sm">Không có dữ liệu.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* RIGHT — detail panel */}
          <div className="rounded-xl border bg-white min-h-[420px]">
            {tab === "pending" && (
              <div className="h-full flex items-center justify-center text-sm text-slate-400 p-6 text-center">
                Học sinh chưa nộp bài — chưa có nội dung để hiển thị.
              </div>
            )}

            {tab !== "pending" && !detailStudent && (
              <div className="h-full flex items-center justify-center text-sm text-slate-400 p-6 text-center">
                Chọn một học sinh ở bảng bên trái để xem bài làm.
              </div>
            )}

            {tab !== "pending" && detailStudent && detailSubmission && (
              <div className="p-4 space-y-4">
                {/* Student header */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b">
                  <div className="min-w-0">
                    <div className="text-xs text-slate-500">Bài làm của</div>
                    <div className="font-bold text-slate-800 truncate">
                      {detailStudent.name} · Lớp {detailStudent.klass}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Nộp lúc {fmt(detailSubmission.submittedAt)} · {detailSubmission.durationMin} phút làm bài
                    </div>
                  </div>
                </div>

                {/* Score + overall feedback */}
                <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Điểm</label>
                    <Input
                      type="number" min={0} max={10} step={0.5}
                      value={score || (detailSubmission.score?.toString() ?? "")}
                      onChange={(e) => setScore(e.target.value)}
                      placeholder="—/10"
                      className="mt-1 text-center font-bold text-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Nhận xét tổng</label>
                    <Textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Nhập nhận xét cho học sinh..."
                      className="mt-1 min-h-[68px]"
                    />
                  </div>
                </div>

                {/* Answers */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Nội dung bài làm
                  </div>
                  {QUESTIONS.map((qu, idx) => {
                    // mock student answers
                    const mcqAnswer = qu.id === "q1" ? "B" : qu.id === "q2" ? "C" : undefined;
                    const isCorrect = mcqAnswer && qu.correct === mcqAnswer;
                    return (
                      <div key={qu.id} className="rounded-lg border p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-semibold text-sm text-slate-800">
                            Câu {idx + 1}. {qu.prompt}
                          </div>
                          {qu.type === "mcq" && (
                            isCorrect ? (
                              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Đúng
                              </Badge>
                            ) : (
                              <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 gap-1">
                                <XCircle className="h-3 w-3" /> Sai
                              </Badge>
                            )
                          )}
                        </div>

                        {qu.type === "mcq" && qu.options && (
                          <div className="grid grid-cols-1 gap-1 pl-1">
                            {qu.options.map((opt) => {
                              const chosen = mcqAnswer === opt.key;
                              const correct = qu.correct === opt.key;
                              return (
                                <div
                                  key={opt.key}
                                  className={`flex items-center gap-2 text-sm rounded px-2 py-1 ${
                                    correct ? "bg-emerald-50 text-emerald-800"
                                            : chosen ? "bg-rose-50 text-rose-800" : "text-slate-700"
                                  }`}
                                >
                                  <Checkbox checked={chosen} disabled />
                                  <span className="font-semibold">{opt.key}.</span>
                                  <span>{opt.text}</span>
                                  {correct && <span className="ml-auto text-xs">(đáp án đúng)</span>}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {qu.type === "essay" && (
                          <div className="rounded bg-slate-50 border text-sm p-2 text-slate-700 whitespace-pre-wrap">
                            Học sinh trả lời: Quy đồng bằng cách tìm mẫu số chung là 6, sau đó nhân tử và mẫu tương ứng...
                          </div>
                        )}

                        {/* Per-question feedback */}
                        <div className="pt-1">
                          <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                            <MessageSquarePlus className="h-3.5 w-3.5" /> Nhận xét cho câu này
                          </div>
                          <Textarea
                            value={questionFeedback[qu.id] ?? ""}
                            onChange={(e) => setQuestionFeedback((p) => ({ ...p, [qu.id]: e.target.value }))}
                            placeholder="Nhập nhận xét..."
                            className="min-h-[52px] text-sm"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button variant="outline" onClick={() => { setScore(""); setFeedback(""); setQuestionFeedback({}); }}>
                    Hủy
                  </Button>
                  <Button
                    className="bg-indigo-700 hover:bg-indigo-800 text-white"
                    onClick={() => toast.success(`Đã lưu chấm bài cho ${detailStudent.name}`)}
                  >
                    Lưu chấm bài
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
