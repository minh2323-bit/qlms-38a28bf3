import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { FileSpreadsheet, FileDown } from "lucide-react";
import { MaterialReport, QuestionBankReport, LectureReport } from "@/components/DtiContentReports";


export const Route = createFileRoute("/hieu-truong_/bao-cao-dti")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Báo cáo DTI – Giáo viên & Học sinh | QLMS" },
      { name: "description", content: "Báo cáo chuyển đổi số (DTI) của trường: hoạt động giáo viên và kết quả học tập của học sinh, hỗ trợ xuất Excel và PDF." },
      { property: "og:title", content: "Báo cáo DTI – Giáo viên & Học sinh" },
      { property: "og:description", content: "Bảng báo cáo DTI theo giáo viên và học sinh, kèm chức năng xuất Excel và PDF." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DtiReportPage,
});

/* ---------------- Data ---------------- */
function formatLastSeen(lastSeen: string, minsAgo?: number) {
  if (minsAgo === undefined) return lastSeen;
  if (minsAgo < 1) return "Vừa xong";
  if (minsAgo < 60) return `${minsAgo} phút trước`;
  return `${Math.floor(minsAgo / 60)} tiếng trước`;
}

type TRow = {
  name: string; team: string; classes: string;
  lectures: number; shared: number; materials: number;
  questions: number; copyrightUses: number; homework: number; gradedHomework: number;
  tests: number; gradedTests: number; contentRate: number;
  lastSeen: string; minsAgo?: number;
};

const TEACHERS: TRow[] = [
  { name: "Nguyễn Thị Hoa", team: "Tổ Tiểu học 1", classes: "4A, 4B", lectures: 42, shared: 18, materials: 126, questions: 395, copyrightUses: 102, homework: 88, gradedHomework: 72, tests: 34, gradedTests: 30, contentRate: 92, lastSeen: "25/8/2026 08:12", minsAgo: 5 },
  { name: "Phùng Thuý Hằng", team: "Tổ Tiểu học 1", classes: "3A, 3B", lectures: 36, shared: 12, materials: 98, questions: 311, copyrightUses: 58, homework: 74, gradedHomework: 60, tests: 28, gradedTests: 24, contentRate: 85, lastSeen: "24/8/2026 16:40" },
  { name: "Lê Thị Mai", team: "Tổ Tiểu học 1", classes: "4C", lectures: 21, shared: 6, materials: 64, questions: 209, copyrightUses: 121, homework: 52, gradedHomework: 41, tests: 19, gradedTests: 15, contentRate: 78, lastSeen: "25/8/2026 07:55", minsAgo: 62 },
  { name: "Trần Minh Quân", team: "Tổ Tiểu học 1", classes: "3C, 4A", lectures: 29, shared: 9, materials: 81, questions: 260, copyrightUses: 32, homework: 63, gradedHomework: 50, tests: 22, gradedTests: 18, contentRate: 88, lastSeen: "23/8/2026 14:05" },
  { name: "Đỗ Văn Nam", team: "Tổ Tiểu học 2", classes: "5A", lectures: 18, shared: 4, materials: 47, questions: 158, copyrightUses: 38, homework: 41, gradedHomework: 33, tests: 12, gradedTests: 9, contentRate: 71, lastSeen: "22/8/2026 09:30" },
  { name: "Bùi Thị Hạnh", team: "Tổ Tiểu học 2", classes: "5B, 5C", lectures: 33, shared: 15, materials: 92, questions: 293, copyrightUses: 157, homework: 70, gradedHomework: 58, tests: 26, gradedTests: 22, contentRate: 90, lastSeen: "25/8/2026 06:48", minsAgo: 180 },
  { name: "Phạm Quốc Anh", team: "Tổ Tiểu học 2", classes: "2A", lectures: 12, shared: 2, materials: 38, questions: 131, copyrightUses: 44, homework: 25, gradedHomework: 19, tests: 8, gradedTests: 5, contentRate: 64, lastSeen: "18/8/2026 15:20" },
  { name: "Vũ Bích Ngọc", team: "Tổ Năng khiếu", classes: "Khối 1-5", lectures: 9, shared: 3, materials: 44, questions: 149, copyrightUses: 113, homework: 16, gradedHomework: 11, tests: 5, gradedTests: 3, contentRate: 58, lastSeen: "21/8/2026 10:02" },
  { name: "Trần Thanh Thảo", team: "Tổ Năng khiếu", classes: "Khối 1-5", lectures: 7, shared: 1, materials: 31, questions: 110, copyrightUses: 169, homework: 11, gradedHomework: 7, tests: 3, gradedTests: 2, contentRate: 52, lastSeen: "19/8/2026 13:44" },
  { name: "Hoàng Văn Nam", team: "Tổ Toán", classes: "2B, 2C", lectures: 24, shared: 8, materials: 69, questions: 224, copyrightUses: 34, homework: 57, gradedHomework: 45, tests: 17, gradedTests: 14, contentRate: 83, lastSeen: "24/8/2026 11:15" },
];

const TEAMS = Array.from(new Set(TEACHERS.map((t) => t.team)));
const CLASSES = Array.from(
  new Set(TEACHERS.flatMap((t) => t.classes.split(",").map((c) => c.trim()))),
).sort();

type SRow = {
  code: string; name: string; cls: string;
  materials: number; materialsDone: number;
  copyright: number; copyrightDone: number;
  homework: number; homeworkAvg: number; onTime: number;
  tests: number; testAvg: number; enet: number;
};

const STUDENTS: SRow[] = [
  { code: "HS2026001", name: "Nguyễn Minh An", cls: "4A", materials: 128, materialsDone: 112, copyright: 34, copyrightDone: 28, homework: 76, homeworkAvg: 8.6, onTime: 94, tests: 28, testAvg: 8.2 },
  { code: "HS2026002", name: "Trần Bảo Châu", cls: "4A", materials: 116, materialsDone: 98, copyright: 30, copyrightDone: 22, homework: 72, homeworkAvg: 8.1, onTime: 88, tests: 26, testAvg: 7.8 },
  { code: "HS2026003", name: "Lê Gia Huy", cls: "4A", materials: 94, materialsDone: 70, copyright: 22, copyrightDone: 14, homework: 61, homeworkAvg: 7.2, onTime: 76, tests: 24, testAvg: 6.9 },
  { code: "HS2026004", name: "Phạm Khánh Linh", cls: "4B", materials: 132, materialsDone: 121, copyright: 38, copyrightDone: 33, homework: 80, homeworkAvg: 9.1, onTime: 97, tests: 30, testAvg: 8.9 },
  { code: "HS2026005", name: "Đỗ Thành Đạt", cls: "4B", materials: 88, materialsDone: 64, copyright: 19, copyrightDone: 11, homework: 55, homeworkAvg: 6.8, onTime: 68, tests: 21, testAvg: 6.4 },
  { code: "HS2026006", name: "Vũ Ngọc Mai", cls: "4B", materials: 121, materialsDone: 104, copyright: 31, copyrightDone: 25, homework: 74, homeworkAvg: 8.4, onTime: 91, tests: 27, testAvg: 8.0 },
  { code: "HS2026007", name: "Bùi Hải Nam", cls: "4C", materials: 76, materialsDone: 52, copyright: 16, copyrightDone: 9, homework: 48, homeworkAvg: 6.2, onTime: 61, tests: 18, testAvg: 5.9 },
  { code: "HS2026008", name: "Hoàng Thu Trang", cls: "4C", materials: 109, materialsDone: 92, copyright: 27, copyrightDone: 20, homework: 69, homeworkAvg: 7.9, onTime: 85, tests: 25, testAvg: 7.5 },
  { code: "HS2026009", name: "Ngô Anh Khoa", cls: "3A", materials: 102, materialsDone: 86, copyright: 24, copyrightDone: 18, homework: 64, homeworkAvg: 7.6, onTime: 82, tests: 22, testAvg: 7.3 },
  { code: "HS2026010", name: "Đinh Phương Thảo", cls: "3A", materials: 138, materialsDone: 130, copyright: 41, copyrightDone: 36, homework: 82, homeworkAvg: 9.4, onTime: 98, tests: 31, testAvg: 9.2 },
];

const STUDENT_CLASSES = Array.from(new Set(STUDENTS.map((s) => s.cls))).sort();

/* ---------------- Export helpers ---------------- */
function downloadCsv(filename: string, header: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = "\uFEFF" + [header, ...rows].map((r) => r.map(esc).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function printPdf(title: string, header: string[], rows: (string | number)[][]) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(`<html><head><title>${title}</title><style>
    body{font-family:system-ui,sans-serif;padding:24px}
    h1{font-size:18px;margin-bottom:12px}
    table{width:100%;border-collapse:collapse;font-size:11px}
    th,td{border:1px solid #cbd5e1;padding:6px;text-align:center}
    th{background:#eef2ff}
  </style></head><body><h1>${title}</h1><table><thead><tr>${
    header.map((h) => `<th>${h}</th>`).join("")
  }</tr></thead><tbody>${
    rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")
  }</tbody></table></body></html>`);
  w.document.close();
  w.focus();
  w.print();
}

function ExportButtons({ onExcel, onPdf }: { onExcel: () => void; onPdf: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={onExcel}>
        <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Xuất Excel
      </Button>
      <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={onPdf}>
        <FileDown className="h-4 w-4 text-rose-600" /> Xuất PDF
      </Button>
    </div>
  );
}

/* ---------------- Page ---------------- */
const TABS = [
  ["teacher", "Báo cáo Giáo viên"],
  ["student", "Báo cáo Học sinh"],
  ["material", "Báo cáo Học liệu"],
  ["question", "Báo cáo Ngân hàng câu hỏi"],
  ["lecture", "Báo cáo Bài giảng"],
] as const;

type TabKey = (typeof TABS)[number][0];

function DtiReportPage() {
  const { tab: initialTab } = Route.useSearch();
  const [tab, setTab] = useState<TabKey>(
    TABS.some(([k]) => k === initialTab) ? (initialTab as TabKey) : "teacher",
  );

  return (
    <AppShell role="principal">
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Báo cáo DTI</h1>
          <p className="text-sm text-slate-500">
            Báo cáo tổng hợp nội dung số và hoạt động của giáo viên, học sinh trên LMS.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b">
          {TABS.map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`px-4 py-2 text-sm font-semibold -mb-px border-b-2 transition ${
                tab === k ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "teacher" && <TeacherReport />}
        {tab === "student" && <StudentReport />}
        {tab === "material" && <MaterialReport />}
        {tab === "question" && <QuestionBankReport />}
        {tab === "lecture" && <LectureReport />}
      </div>
    </AppShell>
  );
}


function TeacherReport() {
  const [q, setQ] = useState("");
  const [team, setTeam] = useState("all");
  const [cls, setCls] = useState("all");
  const [unit, setUnit] = useState("all");
  const [range, setRange] = useState<DateRange | undefined>();
  const rows = useMemo(
    () => TEACHERS.filter((t) =>
      t.name.toLowerCase().includes(q.trim().toLowerCase()) &&
      (team === "all" || t.team === team) &&
      (cls === "all" || t.classes.split(",").map((c) => c.trim()).includes(cls)),
    ),
    [q, team, cls],
  );

  const sum = (f: (t: TRow) => number) => rows.reduce((s, t) => s + f(t), 0);
  const totals = useMemo(() => ({
    lectures: sum((t) => t.lectures), shared: sum((t) => t.shared),
    materials: sum((t) => t.materials), questions: sum((t) => t.questions),
    copyrightUses: sum((t) => t.copyrightUses),
    homework: sum((t) => t.homework), gradedHomework: sum((t) => t.gradedHomework),
    tests: sum((t) => t.tests), gradedTests: sum((t) => t.gradedTests),
    contentRate: rows.length ? Math.round(sum((t) => t.contentRate) / rows.length) : 0,
  }), [rows]);

  const header = ["STT", "Giáo viên", "Tổ môn", "Lớp phụ trách", "Bài giảng đã tạo", "Đã chia sẻ", "Học liệu tải lên", "Ngân hàng câu hỏi", "Lượt sử dụng HLBQ", "Bài tập đã giao", "Đã chấm (bài tập)", "Bài kiểm tra đã tạo", "Đã chấm (kiểm tra)", "Tỷ lệ tiết có nội dung", "Truy cập gần nhất"];
  const data = rows.map((t, i) => [i + 1, t.name, t.team, t.classes, t.lectures, t.shared, t.materials, t.questions, t.copyrightUses, t.homework, t.gradedHomework, t.tests, t.gradedTests, `${t.contentRate}%`, formatLastSeen(t.lastSeen, t.minsAgo)]);

  return (
    <section className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-indigo-700">Thống kê hoạt động của giáo viên</h2>
        <div className="flex flex-wrap items-center gap-2">
          <UnitFilter value={unit} onChange={setUnit} />
          <DateRangeFilter value={range} onChange={setRange} />
          <Select value={team} onValueChange={setTeam}>

            <SelectTrigger className="h-9 w-44"><SelectValue placeholder="Tổ môn" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả tổ môn</SelectItem>
              {TEAMS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={cls} onValueChange={setCls}>
            <SelectTrigger className="h-9 w-44"><SelectValue placeholder="Lớp phụ trách" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả lớp phụ trách</SelectItem>
              {CLASSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm giáo viên..." className="h-9 w-56" />
          <ExportButtons
            onExcel={() => downloadCsv("bao-cao-dti-giao-vien.csv", header, data)}
            onPdf={() => printPdf("Báo cáo DTI – Giáo viên", header, data)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 border-b bg-slate-50/60">
              <th className="text-center font-semibold py-2.5 px-3 w-14">STT</th>
              <th className="text-left font-semibold py-2.5 px-3">Giáo viên</th>
              <th className="text-left font-semibold py-2.5 px-3">Tổ môn</th>
              <th className="text-left font-semibold py-2.5 px-3">Lớp phụ trách</th>
              <th className="text-center font-semibold py-2.5 px-3">Bài giảng đã tạo</th>
              <th className="text-center font-semibold py-2.5 px-3">Học liệu tải lên</th>
              <th className="text-center font-semibold py-2.5 px-3">Ngân hàng câu hỏi</th>
              <th className="text-center font-semibold py-2.5 px-3">Lượt sử dụng HLBQ</th>

              <th className="text-center font-semibold py-2.5 px-3">Bài tập đã giao</th>
              <th className="text-center font-semibold py-2.5 px-3">Bài kiểm tra đã tạo</th>
              <th className="text-center font-semibold py-2.5 px-3">Tỷ lệ tiết có nội dung</th>
              <th className="text-center font-semibold py-2.5 px-3">Truy cập gần nhất</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t, i) => (
              <tr key={t.name} className="border-b last:border-0 hover:bg-slate-50">
                <td className="text-center py-2.5 px-3 font-semibold text-slate-700">{i + 1}</td>
                <td className="py-2.5 px-3 font-semibold text-slate-800">{t.name}</td>
                <td className="py-2.5 px-3 text-slate-600">{t.team}</td>
                <td className="py-2.5 px-3 text-slate-600">{t.classes}</td>
                <td className="text-center py-2.5 px-3">
                  <div className="text-sky-600">{t.lectures} bài giảng</div>
                  <div className="text-xs text-slate-500">Đã chia sẻ: {t.shared}</div>
                </td>
                <td className="text-center py-2.5 px-3">{t.materials}</td>
                <td className="text-center py-2.5 px-3">{t.questions}</td>
                <td className="text-center py-2.5 px-3 text-violet-600 font-semibold">{t.copyrightUses}</td>

                <td className="text-center py-2.5 px-3">
                  <div className="text-sky-600">{t.homework}</div>
                  <div className="text-xs text-slate-500">Đã chấm: {t.gradedHomework}</div>
                </td>
                <td className="text-center py-2.5 px-3">
                  <div className="text-sky-600">{t.tests}</div>
                  <div className="text-xs text-slate-500">Đã chấm: {t.gradedTests}</div>
                </td>
                <td className="text-center py-2.5 px-3">
                  <span className={`font-bold ${t.contentRate >= 80 ? "text-emerald-600" : t.contentRate >= 60 ? "text-amber-600" : "text-rose-600"}`}>
                    {t.contentRate}%
                  </span>
                </td>
                <td className="text-center py-2.5 px-3 text-slate-600" title={t.lastSeen}>
                  {formatLastSeen(t.lastSeen, t.minsAgo)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={12} className="text-center text-slate-400 py-8">Không tìm thấy giáo viên.</td></tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td className={`${totalCell} text-center`} colSpan={4}>Tổng số ({rows.length} giáo viên)</td>
              <td className={`${totalCell} text-center`}>
                <div>{totals.lectures}</div>
                <div className="text-xs font-semibold text-indigo-600">Đã chia sẻ: {totals.shared}</div>
              </td>
              <td className={`${totalCell} text-center`}>{totals.materials}</td>
              <td className={`${totalCell} text-center`}>{totals.questions}</td>
              <td className={`${totalCell} text-center`}>{totals.copyrightUses}</td>
              <td className={`${totalCell} text-center`}>
                <div>{totals.homework}</div>
                <div className="text-xs font-semibold text-indigo-600">Đã chấm: {totals.gradedHomework}</div>
              </td>
              <td className={`${totalCell} text-center`}>
                <div>{totals.tests}</div>
                <div className="text-xs font-semibold text-indigo-600">Đã chấm: {totals.gradedTests}</div>
              </td>
              <td className={`${totalCell} text-center`}>{totals.contentRate}%</td>
              <td className={`${totalCell} text-center`}>—</td>
            </tr>
          </tfoot>
        </table>
      </div>

    </section>
  );
}

function StudentReport() {
  const [q, setQ] = useState("");
  const [cls, setCls] = useState("all");
  const [unit, setUnit] = useState("all");
  const [range, setRange] = useState<DateRange | undefined>();
  const rows = useMemo(
    () => STUDENTS.filter((s) =>
      (s.name.toLowerCase().includes(q.trim().toLowerCase()) || s.code.toLowerCase().includes(q.trim().toLowerCase())) &&
      (cls === "all" || s.cls === cls),
    ),
    [q, cls],
  );

  const sum = (f: (s: SRow) => number) => rows.reduce((a, s) => a + f(s), 0);
  const totals = useMemo(() => ({
    materials: sum((s) => s.materials), materialsDone: sum((s) => s.materialsDone),
    copyright: sum((s) => s.copyright), copyrightDone: sum((s) => s.copyrightDone),
    homework: sum((s) => s.homework), tests: sum((s) => s.tests),
    enet: sum((s) => s.enet),
    onTime: rows.length ? Math.round(sum((s) => s.onTime) / rows.length) : 0,
  }), [rows]);

  const header = ["STT", "Mã HS", "Họ và tên", "Lớp", "Bài giảng/Học liệu đã học", "Đã hoàn thành (học liệu)", "Học liệu bản quyền đã học", "Đã hoàn thành (bản quyền)", "Bài tập đã nộp", "Tỷ lệ nộp đúng hạn", "Bài kiểm tra đã nộp", "Enetpoint"];
  const data = rows.map((s, i) => [i + 1, s.code, s.name, s.cls, s.materials, s.materialsDone, s.copyright, s.copyrightDone, s.homework, `${s.onTime}%`, s.tests, s.enet]);

  return (
    <section className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-indigo-700">Thống kê hoạt động của học sinh</h2>
        <div className="flex flex-wrap items-center gap-2">
          <UnitFilter value={unit} onChange={setUnit} />
          <DateRangeFilter value={range} onChange={setRange} />
          <Select value={cls} onValueChange={setCls}>

            <SelectTrigger className="h-9 w-40"><SelectValue placeholder="Lớp" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả lớp</SelectItem>
              {STUDENT_CLASSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm học sinh / mã HS..." className="h-9 w-56" />
          <ExportButtons
            onExcel={() => downloadCsv("bao-cao-dti-hoc-sinh.csv", header, data)}
            onPdf={() => printPdf("Báo cáo DTI – Học sinh", header, data)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 border-b bg-slate-50/60">
              <th className="text-center font-semibold py-2.5 px-3 w-14">STT</th>
              <th className="text-left font-semibold py-2.5 px-3">Mã HS</th>
              <th className="text-left font-semibold py-2.5 px-3">Họ và tên</th>
              <th className="text-center font-semibold py-2.5 px-3">Lớp</th>
              <th className="text-center font-semibold py-2.5 px-3">Bài giảng / Học liệu đã học</th>
              <th className="text-center font-semibold py-2.5 px-3">Học liệu bản quyền đã học</th>
              <th className="text-center font-semibold py-2.5 px-3">Bài tập đã nộp</th>
              <th className="text-center font-semibold py-2.5 px-3">Tỷ lệ nộp đúng hạn</th>
              <th className="text-center font-semibold py-2.5 px-3">Bài kiểm tra đã nộp</th>
              <th className="text-center font-semibold py-2.5 px-3">Enetpoint</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s, i) => (
              <tr key={s.code} className="border-b last:border-0 hover:bg-slate-50">
                <td className="text-center py-2.5 px-3 font-semibold text-slate-700">{i + 1}</td>
                <td className="py-2.5 px-3 text-slate-600">{s.code}</td>
                <td className="py-2.5 px-3 font-semibold text-slate-800">{s.name}</td>
                <td className="text-center py-2.5 px-3 text-slate-600">{s.cls}</td>
                <td className="text-center py-2.5 px-3">
                  <div className="text-sky-600">{s.materials}</div>
                  <div className="text-xs text-slate-500">Đã hoàn thành: {s.materialsDone}</div>
                </td>
                <td className="text-center py-2.5 px-3">
                  <div className="text-sky-600">{s.copyright}</div>
                  <div className="text-xs text-slate-500">Đã hoàn thành: {s.copyrightDone}</div>
                </td>
                <td className="text-center py-2.5 px-3 text-sky-600">{s.homework}</td>
                <td className="text-center py-2.5 px-3">
                  <span className={`font-bold ${s.onTime >= 90 ? "text-emerald-600" : s.onTime >= 70 ? "text-amber-600" : "text-rose-600"}`}>
                    {s.onTime}%
                  </span>
                </td>
                <td className="text-center py-2.5 px-3 text-sky-600">{s.tests}</td>
                <td className="text-center py-2.5 px-3"><EnetPoint value={s.enet} /></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={10} className="text-center text-slate-400 py-8">Không tìm thấy học sinh.</td></tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td className={`${totalCell} text-center`} colSpan={4}>Tổng số ({rows.length} học sinh)</td>
              <td className={`${totalCell} text-center`}>
                <div>{totals.materials}</div>
                <div className="text-xs font-semibold text-indigo-600">Đã hoàn thành: {totals.materialsDone}</div>
              </td>
              <td className={`${totalCell} text-center`}>
                <div>{totals.copyright}</div>
                <div className="text-xs font-semibold text-indigo-600">Đã hoàn thành: {totals.copyrightDone}</div>
              </td>
              <td className={`${totalCell} text-center`}>{totals.homework}</td>
              <td className={`${totalCell} text-center`}>{totals.onTime}%</td>
              <td className={`${totalCell} text-center`}>{totals.tests}</td>
              <td className={`${totalCell} text-center`}>{totals.enet.toLocaleString("vi-VN")}</td>
            </tr>
          </tfoot>

        </table>
      </div>
    </section>
  );
}
