// Ba bảng báo cáo nội dung số: Học liệu, Ngân hàng câu hỏi, Bài giảng.
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { FileSpreadsheet, FileDown } from "lucide-react";
import { downloadCsv, printPdf } from "@/lib/report-export";

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

function rate(v: number) {
  return v >= 80 ? "text-emerald-600" : v >= 60 ? "text-amber-600" : "text-rose-600";
}

/* ================= Học liệu ================= */
type MRow = {
  name: string; grade: string; subject: string; chapter: string; lesson: string;
  kind: string; created: string; author: string; learners: number; done: number;
};

const MATERIALS: MRow[] = [
  { name: "Âm thanh - Hoàn thành sau time", grade: "Lớp 5", subject: "Toán", chapter: "", lesson: "", kind: "Âm thanh", created: "25/08/2026", author: "Nguyễn Tuấn Thành 01", learners: 128, done: 96 },
  { name: "Video tương tác - ver 1", grade: "Lớp 5", subject: "Toán", chapter: "", lesson: "", kind: "Video tương tác", created: "25/08/2026", author: "Nguyễn Tuấn Thành 01", learners: 142, done: 118 },
  { name: "Iframe - click hoàn thành", grade: "Lớp 5", subject: "Toán", chapter: "", lesson: "", kind: "IFrame", created: "24/08/2026", author: "Phùng Thuý Hằng", learners: 96, done: 61 },
  { name: "Iframe - Trả lời câu hỏi", grade: "Lớp 5", subject: "Toán", chapter: "", lesson: "", kind: "IFrame", created: "24/08/2026", author: "Phùng Thuý Hằng", learners: 88, done: 47 },
  { name: "Scorm - click hoàn thành", grade: "Lớp 5", subject: "Toán", chapter: "", lesson: "", kind: "Scorm", created: "24/08/2026", author: "Lê Thị Mai", learners: 74, done: 52 },
  { name: "Scorm - sau khi trả lời câu hỏi", grade: "Lớp 5", subject: "Toán", chapter: "", lesson: "", kind: "Scorm", created: "24/08/2026", author: "Lê Thị Mai", learners: 69, done: 39 },
  { name: "Âm thanh - click hoàn thành", grade: "Lớp 5", subject: "Toán", chapter: "", lesson: "", kind: "Âm thanh", created: "24/08/2026", author: "Trần Minh Quân", learners: 112, done: 90 },
  { name: "Âm thanh - sau khoảng time", grade: "Lớp 5", subject: "Toán", chapter: "Ôn tập và bổ sung về số tự nhiên, phân số. Số thập phân", lesson: "Bài 1. Ôn tập về số tự nhiên", kind: "Âm thanh", created: "24/08/2026", author: "Trần Minh Quân", learners: 105, done: 83 },
  { name: "Nội dung thuần - click hoàn thành", grade: "Lớp 5", subject: "Toán", chapter: "", lesson: "", kind: "Nội dung thuần", created: "24/08/2026", author: "Bùi Thị Hạnh", learners: 58, done: 30 },
  { name: "Bài trình chiếu - Phân số thập phân", grade: "Lớp 5", subject: "Toán", chapter: "Ôn tập và bổ sung về số tự nhiên, phân số. Số thập phân", lesson: "Bài 3. Phân số thập phân", kind: "Bài giảng", created: "23/08/2026", author: "Nguyễn Thị Hoa", learners: 134, done: 121 },
];

const KINDS = Array.from(new Set(MATERIALS.map((m) => m.kind)));

export function MaterialReport() {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("all");
  const rows = useMemo(
    () => MATERIALS.filter((m) =>
      m.name.toLowerCase().includes(q.trim().toLowerCase()) && (kind === "all" || m.kind === kind)),
    [q, kind],
  );

  const header = ["STT", "Tên học liệu", "Khối - Môn", "Chương - Bài học", "Thể loại", "Ngày tạo", "Tác giả", "Học sinh tham gia học", "Tỷ lệ hoàn thành"];
  const data = rows.map((m, i) => [
    i + 1, m.name, `${m.grade} - ${m.subject}`,
    m.chapter ? `${m.chapter} / ${m.lesson}` : "—",
    m.kind, m.created, m.author, m.learners,
    `${Math.round((m.done / m.learners) * 100)}%`,
  ]);

  return (
    <section className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-indigo-700">Thống kê học liệu</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={kind} onValueChange={setKind}>
            <SelectTrigger className="h-9 w-44"><SelectValue placeholder="Thể loại" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả thể loại</SelectItem>
              {KINDS.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm học liệu..." className="h-9 w-56" />
          <ExportButtons
            onExcel={() => downloadCsv("bao-cao-dti-hoc-lieu.csv", header, data)}
            onPdf={() => printPdf("Báo cáo DTI – Học liệu", header, data)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 border-b bg-slate-50/60">
              <th className="text-center font-semibold py-2.5 px-3 w-14">STT</th>
              <th className="text-left font-semibold py-2.5 px-3">Tên học liệu</th>
              <th className="text-center font-semibold py-2.5 px-3">Khối - Môn</th>
              <th className="text-left font-semibold py-2.5 px-3">Chương - Bài học</th>
              <th className="text-center font-semibold py-2.5 px-3">Thể loại</th>
              <th className="text-center font-semibold py-2.5 px-3">Ngày tạo</th>
              <th className="text-center font-semibold py-2.5 px-3">Tác giả</th>
              <th className="text-center font-semibold py-2.5 px-3">Học sinh tham gia học</th>
              <th className="text-center font-semibold py-2.5 px-3">Tỷ lệ hoàn thành</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m, i) => {
              const pct = Math.round((m.done / m.learners) * 100);
              return (
                <tr key={m.name} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="text-center py-2.5 px-3 font-semibold text-slate-700">{i + 1}</td>
                  <td className="py-2.5 px-3 font-semibold text-indigo-700">{m.name}</td>
                  <td className="text-center py-2.5 px-3 text-slate-600">{m.grade} - {m.subject}</td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {m.chapter ? (
                      <>
                        <div>{m.chapter}</div>
                        <div className="text-xs text-slate-400">{m.lesson}</div>
                      </>
                    ) : "—"}
                  </td>
                  <td className="text-center py-2.5 px-3">
                    <span className="inline-block rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-1">{m.kind}</span>
                  </td>
                  <td className="text-center py-2.5 px-3 text-slate-600">{m.created}</td>
                  <td className="text-center py-2.5 px-3 text-slate-600">{m.author}</td>
                  <td className="text-center py-2.5 px-3">
                    <div className="text-sky-600">{m.learners}</div>
                    <div className="text-xs text-slate-500">Đã hoàn thành: {m.done}</div>
                  </td>
                  <td className={`text-center py-2.5 px-3 font-bold ${rate(pct)}`}>{pct}%</td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={9} className="text-center text-slate-400 py-8">Không tìm thấy học liệu.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ================= Ngân hàng câu hỏi ================= */
type QRow = {
  text: string; grade: string; subject: string; type: string; level: string; author: string;
  usedExamPapers: number; usedTests: number; usedHomework: number; usedLessons: number;
};

const QUESTIONS: QRow[] = [
  { text: "2 + 5 = ?", grade: "Khối 5", subject: "Toán", type: "Trắc nghiệm 1 đáp án", level: "Nhận biết", author: "Nguyễn Tuấn Thành 01", usedExamPapers: 4, usedTests: 6, usedHomework: 9, usedLessons: 3 },
  { text: "Em hãy nối mỗi phép tính ở cột A với kết quả đúng ở cột B.", grade: "Khối 5", subject: "Toán", type: "Nối", level: "Nhận biết", author: "Nguyễn Tuấn Thành 01", usedExamPapers: 2, usedTests: 3, usedHomework: 5, usedLessons: 1 },
  { text: "Đọc và trả lời đúng sai các ý dưới đây", grade: "Khối 5", subject: "Toán", type: "Đúng/Sai", level: "Nhận biết", author: "Phùng Thuý Hằng", usedExamPapers: 1, usedTests: 4, usedHomework: 2, usedLessons: 2 },
  { text: "Số thích hợp điền vào chỗ trống: 25 × [(1)] = 500", grade: "Khối 5", subject: "Toán", type: "Điền khuyết", level: "Nhận biết", author: "Phùng Thuý Hằng", usedExamPapers: 3, usedTests: 2, usedHomework: 7, usedLessons: 0 },
  { text: "Sắp xếp các số sau theo thứ tự từ bé đến lớn.", grade: "Khối 5", subject: "Toán", type: "Sắp xếp", level: "Nhận biết", author: "Lê Thị Mai", usedExamPapers: 2, usedTests: 1, usedHomework: 4, usedLessons: 1 },
  { text: "25 × 4 → [(1)] 144 : 12 → [(2)] 15 × 15 → [(3)] 1000 − 235 → [(4)]", grade: "Khối 5", subject: "Toán", type: "Kéo thả", level: "Nhận biết", author: "Lê Thị Mai", usedExamPapers: 0, usedTests: 2, usedHomework: 3, usedLessons: 2 },
  { text: "Tìm x, biết: x × 5 = 45", grade: "Khối 5", subject: "Toán", type: "Trả lời ngắn", level: "Thông hiểu", author: "Trần Minh Quân", usedExamPapers: 5, usedTests: 5, usedHomework: 8, usedLessons: 4 },
  { text: "Một cửa hàng có 120kg gạo. Buổi sáng bán được 2/5 số gạo đó, buổi chiều bán tiếp 1/3 số gạo còn lại. Hỏi cửa hàng còn lại bao nhiêu kg gạo?", grade: "Khối 5", subject: "Toán", type: "Tự luận", level: "Vận dụng", author: "Trần Minh Quân", usedExamPapers: 6, usedTests: 4, usedHomework: 6, usedLessons: 1 },
  { text: "Trong các phân số dưới đây, phân số nào bằng phân số ?", grade: "Khối 5", subject: "Toán", type: "Trắc nghiệm nhiều đáp án", level: "Thông hiểu", author: "Bùi Thị Hạnh", usedExamPapers: 3, usedTests: 3, usedHomework: 5, usedLessons: 2 },
  { text: "1 + 1 = ?", grade: "Khối 5", subject: "Toán", type: "Trắc nghiệm 1 đáp án", level: "Nhận biết", author: "Nguyễn Thị Hoa", usedExamPapers: 1, usedTests: 1, usedHomework: 2, usedLessons: 1 },
];

const Q_TYPES = Array.from(new Set(QUESTIONS.map((x) => x.type)));

export function QuestionBankReport() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const rows = useMemo(
    () => QUESTIONS.filter((x) =>
      x.text.toLowerCase().includes(q.trim().toLowerCase()) && (type === "all" || x.type === type)),
    [q, type],
  );

  const header = ["STT", "Câu hỏi", "Khối", "Môn", "Loại câu hỏi", "Mức độ nhận thức", "Tác giả", "Đề kiểm tra", "Bài kiểm tra", "Bài tập về nhà", "Bài giảng/Học liệu"];
  const data = rows.map((x, i) => [i + 1, x.text, x.grade, x.subject, x.type, x.level, x.author, x.usedExamPapers, x.usedTests, x.usedHomework, x.usedLessons]);

  return (
    <section className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-indigo-700">Thống kê ngân hàng câu hỏi</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="h-9 w-52"><SelectValue placeholder="Loại câu hỏi" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại câu hỏi</SelectItem>
              {Q_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm câu hỏi..." className="h-9 w-56" />
          <ExportButtons
            onExcel={() => downloadCsv("bao-cao-dti-ngan-hang-cau-hoi.csv", header, data)}
            onPdf={() => printPdf("Báo cáo DTI – Ngân hàng câu hỏi", header, data)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 border-b bg-slate-50/60">
              <th className="text-center font-semibold py-2.5 px-3 w-14">STT</th>
              <th className="text-left font-semibold py-2.5 px-3">Câu hỏi</th>
              <th className="text-center font-semibold py-2.5 px-3">Khối</th>
              <th className="text-center font-semibold py-2.5 px-3">Môn</th>
              <th className="text-center font-semibold py-2.5 px-3">Loại câu hỏi</th>
              <th className="text-center font-semibold py-2.5 px-3">Mức độ nhận thức</th>
              <th className="text-center font-semibold py-2.5 px-3">Tác giả</th>
              <th className="text-left font-semibold py-2.5 px-3">Sử dụng</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((x, i) => (
              <tr key={`${x.text}-${i}`} className="border-b last:border-0 hover:bg-slate-50">
                <td className="text-center py-2.5 px-3 font-semibold text-slate-700">{i + 1}</td>
                <td className="py-2.5 px-3 text-indigo-700 max-w-[360px]">{x.text}</td>
                <td className="text-center py-2.5 px-3 text-slate-600">{x.grade}</td>
                <td className="text-center py-2.5 px-3 text-slate-600">{x.subject}</td>
                <td className="text-center py-2.5 px-3 text-slate-700">{x.type}</td>
                <td className="text-center py-2.5 px-3">
                  <span className="inline-block rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-1">{x.level}</span>
                </td>
                <td className="text-center py-2.5 px-3 text-slate-600">{x.author}</td>
                <td className="py-2.5 px-3 text-xs text-slate-600 whitespace-nowrap">
                  <div>Đề kiểm tra: <span className="font-semibold text-sky-600">{x.usedExamPapers}</span></div>
                  <div>Bài kiểm tra: <span className="font-semibold text-sky-600">{x.usedTests}</span></div>
                  <div>Bài tập về nhà: <span className="font-semibold text-sky-600">{x.usedHomework}</span></div>
                  <div>Bài giảng/Học liệu: <span className="font-semibold text-sky-600">{x.usedLessons}</span></div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={8} className="text-center text-slate-400 py-8">Không tìm thấy câu hỏi.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ================= Bài giảng ================= */
type LRow = {
  name: string; path: string; grade: string; subject: string; author: string;
  published: string; classes: string[]; learners: number; done: number;
};

const LECTURES: LRow[] = [
  { name: "Phép cộng các số tự nhiên (all type bài giảng)", path: "Ôn tập và bổ sung về số tự nhiên, phân số. Số thập phân · Bài 1. Ôn tập...", grade: "Khối 5", subject: "Toán", author: "Nguyễn Tuấn Thành 01", published: "25/08/2026, 15:23", classes: ["5K"], learners: 38, done: 31 },
  { name: "Phép cộng các số tự nhiên - video tương tác", path: "Ôn tập và bổ sung về số tự nhiên, phân số. Số thập phân · Bài 1. Ôn tập...", grade: "Khối 5", subject: "Toán", author: "Nguyễn Tuấn Thành 01", published: "25/08/2026, 08:26", classes: ["Lớp học thêm 5K"], learners: 24, done: 15 },
  { name: "Ôn tập", path: "Chủ đề 1. Ôn tập và bổ sung · Bài 1. Ôn tập các số tự nhiên", grade: "Khối 5", subject: "Toán", author: "Nguyễn Tuấn Thành 01", published: "—", classes: [], learners: 0, done: 0 },
  { name: "Tổng kết bài học Bài giảng (all các loại - ver 2)", path: "Ôn tập và bổ sung về số tự nhiên, phân số. Số thập phân · Bài 1. Ôn tập...", grade: "Khối 5", subject: "Toán", author: "Phùng Thuý Hằng", published: "21/08/2026, 10:12", classes: ["5K", "Lớp học thêm 5K"], learners: 62, done: 44 },
  { name: "Hình học trong thực tế - HS tự đăng ký (không cần...)", path: "Ôn tập và bổ sung về số tự nhiên, phân số. Số thập phân · Bài 1. Ôn tập...", grade: "Khối 5", subject: "Toán", author: "Lê Thị Mai", published: "19/08/2026, 08:44", classes: ["5A"], learners: 41, done: 22 },
  { name: "Bài giảng Ánh sáng và cuộc sống - Cần duyệt", path: "Ôn tập và bổ sung về số tự nhiên, phân số. Số thập phân · Bài 1. Ôn tập...", grade: "Khối 5", subject: "Toán", author: "Trần Minh Quân", published: "19/08/2026, 08:39", classes: [], learners: 0, done: 0 },
  { name: "Bài giảng all nội dung", path: "Ôn tập và bổ sung về số tự nhiên, phân số. Số thập phân · Bài 1. Ôn tập...", grade: "Khối 5", subject: "Toán", author: "Bùi Thị Hạnh", published: "18/08/2026, 22:09", classes: ["5A", "5B", "+4"], learners: 128, done: 103 },
  { name: "Phép cộng và phép trừ số tự nhiên", path: "Ôn tập và bổ sung về số tự nhiên, phân số. Số thập phân · Bài 1. Ôn tập...", grade: "Khối 5", subject: "Toán", author: "Nguyễn Thị Hoa", published: "—", classes: [], learners: 0, done: 0 },
];

const L_AUTHORS = Array.from(new Set(LECTURES.map((l) => l.author)));

export function LectureReport() {
  const [q, setQ] = useState("");
  const [author, setAuthor] = useState("all");
  const rows = useMemo(
    () => LECTURES.filter((l) =>
      l.name.toLowerCase().includes(q.trim().toLowerCase()) && (author === "all" || l.author === author)),
    [q, author],
  );

  const header = ["STT", "Tên bài giảng", "Khối", "Môn", "Tác giả", "Ngày PH", "Lớp đã giao", "Học sinh tham gia học", "Tỷ lệ hoàn thành"];
  const data = rows.map((l, i) => [
    i + 1, l.name, l.grade, l.subject, l.author, l.published,
    l.classes.length ? l.classes.join(", ") : "Chưa giao",
    l.learners, l.learners ? `${Math.round((l.done / l.learners) * 100)}%` : "—",
  ]);

  return (
    <section className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-indigo-700">Thống kê bài giảng</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={author} onValueChange={setAuthor}>
            <SelectTrigger className="h-9 w-52"><SelectValue placeholder="Tác giả" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả tác giả</SelectItem>
              {L_AUTHORS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm bài giảng..." className="h-9 w-56" />
          <ExportButtons
            onExcel={() => downloadCsv("bao-cao-dti-bai-giang.csv", header, data)}
            onPdf={() => printPdf("Báo cáo DTI – Bài giảng", header, data)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 border-b bg-slate-50/60">
              <th className="text-center font-semibold py-2.5 px-3 w-14">STT</th>
              <th className="text-left font-semibold py-2.5 px-3">Tên bài giảng</th>
              <th className="text-center font-semibold py-2.5 px-3">Khối</th>
              <th className="text-center font-semibold py-2.5 px-3">Môn</th>
              <th className="text-center font-semibold py-2.5 px-3">Tác giả</th>
              <th className="text-center font-semibold py-2.5 px-3">Ngày PH</th>
              <th className="text-center font-semibold py-2.5 px-3">Lớp đã giao</th>
              <th className="text-center font-semibold py-2.5 px-3">Học sinh tham gia học</th>
              <th className="text-center font-semibold py-2.5 px-3">Tỷ lệ hoàn thành</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l, i) => {
              const pct = l.learners ? Math.round((l.done / l.learners) * 100) : 0;
              return (
                <tr key={l.name} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="text-center py-2.5 px-3 font-semibold text-slate-700">{i + 1}</td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-indigo-700">{l.name}</div>
                    <div className="text-xs text-slate-400">{l.path}</div>
                  </td>
                  <td className="text-center py-2.5 px-3 text-slate-600">{l.grade}</td>
                  <td className="text-center py-2.5 px-3 text-slate-600">{l.subject}</td>
                  <td className="text-center py-2.5 px-3 text-slate-600">{l.author}</td>
                  <td className="text-center py-2.5 px-3 text-slate-600">{l.published}</td>
                  <td className="text-center py-2.5 px-3">
                    {l.classes.length ? (
                      <div className="flex flex-wrap justify-center gap-1">
                        {l.classes.map((c) => (
                          <span key={c} className="rounded-md bg-sky-50 text-sky-700 text-xs font-semibold px-2 py-0.5">{c}</span>
                        ))}
                      </div>
                    ) : <span className="text-slate-400 text-xs">Chưa giao</span>}
                  </td>
                  <td className="text-center py-2.5 px-3">
                    {l.learners ? (
                      <>
                        <div className="text-sky-600">{l.learners}</div>
                        <div className="text-xs text-slate-500">Đã hoàn thành: {l.done}</div>
                      </>
                    ) : <span className="text-slate-400">—</span>}
                  </td>
                  <td className={`text-center py-2.5 px-3 font-bold ${l.learners ? rate(pct) : "text-slate-400"}`}>
                    {l.learners ? `${pct}%` : "—"}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={9} className="text-center text-slate-400 py-8">Không tìm thấy bài giảng.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
