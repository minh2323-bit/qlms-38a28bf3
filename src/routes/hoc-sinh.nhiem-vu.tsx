import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useMemo, useState } from "react";
import { ClipboardList, ChevronDown, AlertCircle, Eye, Clock, Play } from "lucide-react";

export const Route = createFileRoute("/hoc-sinh/nhiem-vu")({
  head: () => ({ meta: [{ title: "Nhiệm vụ & Bài tập – Học sinh" }] }),
  component: Page,
});

/* ------------ Data ------------ */
type Task = {
  id: string;
  title: string;
  subject: string;      // for filter
  subjectLabel: string; // display (e.g. "Luyện từ và câu (Tiếng việt)")
  teacher: string;
  assignedAt: string;   // "dd/mm/yyyy, HH:MM"
  dueAt: string;        // "dd/mm/yyyy, HH:MM"
  status: "chua-lam" | "da-nop" | "da-cham";
  allowLate?: boolean;  // if overdue: whether teacher still allows late submission
  score?: string;       // when graded, e.g. "8.57/10"
};

const SUBJECTS = ["Tất cả các môn", "Toán", "Tiếng Việt", "Ngoại ngữ", "TH-CN (Công nghệ)", "Nghệ thuật (Mĩ thuật)", "Luyện từ và câu"];

const TASKS: Task[] = [
  // ── Overdue, not allowed ──
  { id: "n1", title: "Hoàn thiện bài tiếng việt - lập bảng số liệu đơn giản", subject: "Tiếng Việt", subjectLabel: "Luyện từ và câu (Tiếng việt)", teacher: "Phùng Thúy Hằng", assignedAt: "15/06/2026, 15:36", dueAt: "24/06/2026, 15:36", status: "chua-lam" },
  { id: "n2", title: "Hoàn thiện bài tiếng việt - ôn từ vựng chủ đề thời tiết", subject: "Tiếng Việt", subjectLabel: "Luyện từ và câu (Tiếng việt)", teacher: "Phùng Thúy Hằng", assignedAt: "06/05/2026, 15:36", dueAt: "24/06/2026, 15:36", status: "chua-lam" },
  { id: "n3", title: "Bài ôn tiếng việt sau giờ học: nhận biết các bộ phận của cây", subject: "Tiếng Việt", subjectLabel: "Luyện từ và câu (Tiếng việt)", teacher: "Phùng Thúy Hằng", assignedAt: "28/04/2026, 15:36", dueAt: "24/06/2026, 15:36", status: "chua-lam" },
  { id: "n4", title: "Tiếng Việt: quan sát cây xanh trong sân trường", subject: "Tiếng Việt", subjectLabel: "Luyện từ và câu (Tiếng việt)", teacher: "Phùng Thúy Hằng", assignedAt: "30/05/2026, 15:36", dueAt: "24/06/2026, 15:36", status: "chua-lam" },
  { id: "n5", title: "Luyện tập tiếng việt tại nhà: viết lời cảm ơn người thân", subject: "Tiếng Việt", subjectLabel: "Luyện từ và câu (Tiếng việt)", teacher: "Phùng Thúy Hằng", assignedAt: "22/05/2026, 15:36", dueAt: "24/06/2026, 15:36", status: "chua-lam" },
  // ── Overdue, teacher allows late submission ──
  { id: "n6", title: "Luyện tập toán tại nhà: viết lời cảm ơn người thân", subject: "Toán", subjectLabel: "Toán", teacher: "Phùng Thúy Hằng", assignedAt: "07/04/2026, 15:36", dueAt: "24/06/2026, 15:36", status: "chua-lam", allowLate: true },
  { id: "n7", title: "Bài ôn toán sau giờ học: cùng cố phép cộng phạm vi 100", subject: "Toán", subjectLabel: "Toán", teacher: "Phùng Thúy Hằng", assignedAt: "01/04/2026, 15:36", dueAt: "24/06/2026, 15:36", status: "chua-lam", allowLate: true },
  // ── Not overdue (assignments still open) ──
  { id: "n8", title: "Làm tròn số đến hàng chục, hàng trăm", subject: "Toán", subjectLabel: "Toán", teacher: "Phùng Thúy Hằng", assignedAt: "01/07/2026, 08:00", dueAt: "31/12/2026, 23:59", status: "chua-lam" },
  { id: "n9", title: "Luyện tập: So sánh phân số", subject: "Toán", subjectLabel: "Toán", teacher: "Nguyễn Thị Trang", assignedAt: "02/07/2026, 08:00", dueAt: "31/12/2026, 17:00", status: "chua-lam" },
  { id: "n10", title: "Đọc hiểu: Cây bàng (bài tập 3)", subject: "Tiếng Việt", subjectLabel: "Luyện từ và câu (Tiếng việt)", teacher: "Nguyễn Thị Trang", assignedAt: "03/07/2026, 08:00", dueAt: "31/12/2026, 22:00", status: "chua-lam" },

  // ── Submitted / Graded ──
  { id: "d1", title: "Phiếu toán cuối tuần: ôn bảng nhân 6 và bảng chia 6", subject: "Toán", subjectLabel: "Toán", teacher: "Phùng Thúy Hằng", assignedAt: "10/03/2026, 15:36", dueAt: "24/06/2026, 15:36", status: "da-cham", score: "6.36/10" },
  { id: "d2", title: "Tiếng Việt: luyện đọc hiểu câu chuyện mùa hè", subject: "Tiếng Việt", subjectLabel: "Luyện từ và câu (Tiếng việt)", teacher: "Phùng Thúy Hằng", assignedAt: "11/03/2026, 15:36", dueAt: "24/06/2026, 15:36", status: "da-cham", score: "7.5/10" },
  { id: "d3", title: "Luyện tập tiếng anh tại nhà: viết đoạn văn kể về một người bạn", subject: "Ngoại ngữ", subjectLabel: "Ngoại ngữ", teacher: "Phùng Thúy Hằng", assignedAt: "13/03/2026, 15:36", dueAt: "24/06/2026, 15:36", status: "da-cham", score: "8.57/10" },
  { id: "d4", title: "Bài ôn đạo đức sau giờ học: cùng cố phép cộng, phép trừ trong phạm vi 1000", subject: "TH-CN (Công nghệ)", subjectLabel: "TH-CN (Công nghệ)", teacher: "Phùng Thúy Hằng", assignedAt: "14/03/2026, 15:36", dueAt: "24/06/2026, 15:36", status: "da-cham", score: "9.33/10" },
  { id: "d5", title: "Mĩ thuật: quan sát cây xanh trong sân trường", subject: "Nghệ thuật (Mĩ thuật)", subjectLabel: "Nghệ thuật (Mĩ thuật)", teacher: "Phùng Thúy Hằng", assignedAt: "16/03/2026, 15:36", dueAt: "24/06/2026, 15:36", status: "da-cham", score: "6.36/10" },
  { id: "d6", title: "Hoàn thiện bài tin học - ôn từ vựng chủ đề thời tiết", subject: "TH-CN (Công nghệ)", subjectLabel: "TH-CN (Công nghệ)", teacher: "Phùng Thúy Hằng", assignedAt: "18/03/2026, 15:36", dueAt: "24/06/2026, 15:36", status: "da-nop" },
  { id: "d7", title: "Bài ôn tiếng việt: chính tả đoạn văn ngắn", subject: "Tiếng Việt", subjectLabel: "Luyện từ và câu (Tiếng việt)", teacher: "Phùng Thúy Hằng", assignedAt: "20/03/2026, 15:36", dueAt: "24/06/2026, 15:36", status: "da-nop" },
];

/* ------------ Helpers ------------ */
function parseDue(dueAt: string): number {
  const [datePart, timePart] = dueAt.split(", ");
  const [dd, mm, yyyy] = datePart.split("/").map(Number);
  const [hh, mi] = (timePart ?? "23:59").split(":").map(Number);
  return new Date(yyyy, mm - 1, dd, hh, mi).getTime();
}
const isOverdue = (t: Task) => parseDue(t.dueAt) < Date.now();

/* ------------ Page ------------ */
type Tab = "chua-lam" | "da-nop";

function Page() {
  const [tab, setTab] = useState<Tab>("chua-lam");
  const [subject, setSubject] = useState<string>("Tất cả các môn");
  const [dueFilter, setDueFilter] = useState<"all" | "not-overdue" | "overdue">("all");
  const [gradedFilter, setGradedFilter] = useState<"all" | "da-cham" | "chua-cham">("all");

  const chuaLam = useMemo(() => TASKS.filter((t) => t.status === "chua-lam"), []);
  const daNop = useMemo(() => TASKS.filter((t) => t.status === "da-nop" || t.status === "da-cham"), []);

  const counts = {
    all: TASKS.length,
    chuaLam: chuaLam.length,
    overdue: chuaLam.filter(isOverdue).length,
    daNop: TASKS.filter((t) => t.status === "da-nop").length,
    daCham: TASKS.filter((t) => t.status === "da-cham").length,
  };

  // Chưa làm — overdue on top, then filter
  const filteredChuaLam = useMemo(() => {
    const bySubject = chuaLam.filter((t) => subject === "Tất cả các môn" ? true : t.subject === subject);
    const withFlag = bySubject.map((t) => ({ ...t, _overdue: isOverdue(t) }));
    const byDue = withFlag.filter((t) =>
      dueFilter === "all" ? true : dueFilter === "overdue" ? t._overdue : !t._overdue,
    );
    return byDue.sort((a, b) => (a._overdue === b._overdue ? 0 : a._overdue ? -1 : 1));
  }, [chuaLam, subject, dueFilter]);

  const filteredDaNop = useMemo(() => {
    const bySubject = daNop.filter((t) => subject === "Tất cả các môn" ? true : t.subject === subject);
    return bySubject.filter((t) =>
      gradedFilter === "all" ? true :
      gradedFilter === "da-cham" ? t.status === "da-cham" : t.status === "da-nop",
    );
  }, [daNop, subject, gradedFilter]);

  return (
    <AppShell role="student">
      <section className="bg-white rounded-2xl border shadow-sm">
        <div className="px-6 py-3 border-b flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-indigo-700" />
          <h2 className="text-xl font-bold text-slate-800">Nhiệm vụ, bài tập</h2>
        </div>

        {/* Summary tabs strip (image 2/3 header) */}
        <div className="px-6 pt-4 flex items-center gap-2 flex-wrap border-b">
          <TopTab active={tab === "chua-lam"} label="Chưa làm" count={counts.chuaLam} onClick={() => setTab("chua-lam")} tone="amber" />
          <TopTab active={tab === "da-nop"}   label="Đã nộp"   count={counts.daNop + counts.daCham} onClick={() => setTab("da-nop")} tone="emerald" />
          <div className="ml-auto">
            <SubjectSelect value={subject} onChange={setSubject} options={SUBJECTS} />
          </div>
        </div>

        <div className="p-6 space-y-4">
          {tab === "chua-lam" ? (
            <>
              <FilterChips
                value={dueFilter}
                onChange={(v) => setDueFilter(v as any)}
                items={[
                  { key: "all", label: `Tất cả (${counts.chuaLam})` },
                  { key: "not-overdue", label: `Chưa quá hạn (${counts.chuaLam - counts.overdue})` },
                  { key: "overdue", label: `Quá hạn nộp (${counts.overdue})` },
                ]}
              />
              {filteredChuaLam.length === 0 ? (
                <p className="text-sm text-slate-500 italic">Không có bài tập phù hợp.</p>
              ) : (
                <ul className="space-y-3">
                  {filteredChuaLam.map((t) => <TodoRow key={t.id} task={t} overdue={t._overdue} />)}
                </ul>
              )}
            </>
          ) : (
            <>
              <FilterChips
                value={gradedFilter}
                onChange={(v) => setGradedFilter(v as any)}
                items={[
                  { key: "all", label: `Tất cả (${counts.daNop + counts.daCham})` },
                  { key: "da-cham", label: `Đã chấm (${counts.daCham})` },
                  { key: "chua-cham", label: `Chưa chấm (${counts.daNop})` },
                ]}
              />
              {filteredDaNop.length === 0 ? (
                <p className="text-sm text-slate-500 italic">Không có bài nộp phù hợp.</p>
              ) : (
                <ul className="space-y-3">
                  {filteredDaNop.map((t) => <SubmittedRow key={t.id} task={t} />)}
                </ul>
              )}
            </>
          )}
        </div>
      </section>
    </AppShell>
  );
}

/* ------------ Rows ------------ */
function TodoRow({ task, overdue }: { task: Task; overdue: boolean }) {
  const canSubmit = !overdue || !!task.allowLate;
  return (
    <li className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex items-center gap-4 hover:shadow-sm transition">
      <div className="min-w-0 flex-1 grid grid-cols-1 md:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)] gap-2 md:gap-4 items-start">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-slate-800 text-[15px] truncate">{task.title}</h4>
            {overdue && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                <AlertCircle className="h-3 w-3" /> Quá hạn
              </span>
            )}
          </div>
          <div className="text-[12px] text-slate-500 mt-1">
            Ngày giao: <span className="text-slate-700 font-medium">{task.assignedAt}</span>
            <span className="mx-2">·</span>
            Hạn nộp: <span className={overdue ? "text-rose-600 font-semibold" : "text-slate-700 font-medium"}>{task.dueAt}</span>
          </div>
        </div>
        <div className="text-[13px] text-slate-700">{task.subjectLabel}</div>
        <div className="text-[13px] text-slate-700">
          <div className="text-slate-500 text-[11px]">Giáo viên:</div>
          <div className="font-semibold">{task.teacher}</div>
        </div>
      </div>
      <div className="shrink-0">
        {canSubmit ? (
          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border-2 border-amber-400 bg-amber-50 text-amber-700 text-sm font-bold hover:bg-amber-100">
            Làm bài <Play className="h-3.5 w-3.5 fill-amber-700" />
          </button>
        ) : (
          <button disabled className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 text-sm font-semibold cursor-not-allowed">
            Hết hạn làm <Clock className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </li>
  );
}

function SubmittedRow({ task }: { task: Task }) {
  const graded = task.status === "da-cham";
  return (
    <li className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex items-center gap-4 hover:shadow-sm transition">
      <div className="min-w-0 flex-1 grid grid-cols-1 md:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1.2fr)_100px] gap-2 md:gap-4 items-center">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-slate-800 text-[15px] truncate">{task.title}</h4>
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
              graded ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-sky-50 text-sky-700 border-sky-200"
            }`}>
              {graded ? "Đã chấm" : "Chưa chấm"}
            </span>
          </div>
          <div className="text-[12px] text-slate-500 mt-1">
            Ngày giao: <span className="text-slate-700 font-medium">{task.assignedAt}</span>
            <span className="mx-2">·</span>
            Hạn nộp: <span className="text-slate-700 font-medium">{task.dueAt}</span>
          </div>
        </div>
        <div className="text-[13px] text-slate-700">{task.subjectLabel}</div>
        <div className="text-[13px] text-slate-700">
          <div className="text-slate-500 text-[11px]">Giáo viên:</div>
          <div className="font-semibold">{task.teacher}</div>
        </div>
        <div className="text-center">
          <div className="text-[11px] text-slate-500">Điểm</div>
          {graded && task.score ? (
            <div className="text-lg font-black text-rose-600 leading-tight">{task.score}</div>
          ) : (
            <div className="text-slate-300 font-bold">—</div>
          )}
        </div>
      </div>
      <div className="shrink-0">
        {graded ? (
          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border-2 border-emerald-400 bg-white text-emerald-700 text-sm font-bold hover:bg-emerald-50">
            Xem bài <Eye className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-sm font-semibold" disabled>
            Chờ chấm <Clock className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </li>
  );
}

/* ------------ UI helpers ------------ */
function TopTab({ active, label, count, onClick, tone }: { active: boolean; label: string; count: number; onClick: () => void; tone: "amber" | "emerald" }) {
  const toneCls = tone === "amber"
    ? "bg-amber-100 text-amber-700 border-amber-200"
    : "bg-emerald-100 text-emerald-700 border-emerald-200";
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 -mb-px border-b-2 flex items-center gap-2 text-sm font-semibold transition ${
        active ? "border-indigo-700 text-indigo-700" : "border-transparent text-slate-600 hover:text-indigo-700"
      }`}
    >
      {label}
      <span className={`inline-flex items-center justify-center min-w-[24px] h-5 px-1.5 rounded-full text-[11px] font-bold border ${toneCls}`}>
        {count}
      </span>
    </button>
  );
}

function FilterChips<T extends string>({
  value, onChange, items,
}: { value: T; onChange: (v: T) => void; items: Array<{ key: T; label: string }> }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {items.map((it) => (
        <button
          key={it.key}
          onClick={() => onChange(it.key)}
          className={`px-3 py-1.5 rounded-full text-[13px] font-semibold border transition ${
            value === it.key
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:text-indigo-700"
          }`}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

function SubjectSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-4 pr-9 py-2 text-sm rounded-full border border-slate-200 bg-white text-slate-700 font-semibold hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}
