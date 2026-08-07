import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Check, ChevronDown, Eye, Plus } from "lucide-react";
import { toast } from "sonner";
import { getKnowledgeTree } from "@/lib/knowledge-tree";

const SUBJECTS_BY_GRADE: Record<string, string[]> = {
  "3": ["Toán", "Tiếng Việt", "Đạo đức"],
  "4": ["Toán", "Tiếng Việt", "Khoa học", "Đạo đức"],
  "5": ["Toán", "Tiếng Việt", "Khoa học"],
};

const QUESTION_TYPES = [
  "Trắc nghiệm 1 đáp án", "Trắc nghiệm nhiều đáp án", "Đúng / Sai", "Trả lời ngắn",
  "Tự luận", "Kéo thả", "Điền khuyết", "Nối các đáp án tương ứng", "Sắp xếp",
];

const STUDENTS = [
  { id: "01", code: "0123456783", name: "Nguyễn An", dob: "15/03/2015" },
  { id: "02", code: "0365427720", name: "Mai Huyền", dob: "02/07/2015" },
  { id: "03", code: "0123456787", name: "Trần Bảo", dob: "21/11/2015" },
  { id: "04", code: "0348844088", name: "Thanh Vân", dob: "08/05/2015" },
  { id: "05", code: "0335773123", name: "Vũ Huy Hoàng", dob: "30/09/2015" },
  { id: "06", code: "0912125548", name: "Phạm Tất Thắng", dob: "12/12/2015" },
];

export type WorksheetContext = {
  grade?: string;      // "4" hoặc "Lớp 4"
  subject?: string;
  chapterId?: string;
  lessonId?: string;
};

type WQ = { id: string; content: string; type: string; level: string; score: string };

/** Phiếu bài tập – flow 3 bước (giống Bài kiểm tra, bỏ Thời gian bắt đầu). */
export function WorksheetWizard({
  onClose, onSaved, context,
}: {
  onClose: () => void;
  onSaved?: (payload: { title: string }) => void;
  context?: WorksheetContext;
}) {
  const lockedGrade = (context?.grade ?? "").replace(/[^0-9]/g, "");
  const locked = !!(lockedGrade && context?.subject);

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [assignedClasses, setAssignedClasses] = useState<Set<string>>(new Set());
  const [grade, setGrade] = useState(lockedGrade);
  const [subject, setSubject] = useState(context?.subject ?? "");
  const [chapter, setChapter] = useState(context?.chapterId ?? "");
  const [lesson, setLesson] = useState(context?.lessonId ?? "");
  const [duration, setDuration] = useState("");
  const [scoreType, setScoreType] = useState("");
  const [showScore, setShowScore] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);
  const [shuffle, setShuffle] = useState(true);
  const [questions, setQuestions] = useState<WQ[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());

  const subjects = grade ? (SUBJECTS_BY_GRADE[grade] ?? []) : [];
  const tree = useMemo(
    () => (grade && subject ? getKnowledgeTree(grade, subject) : []),
    [grade, subject],
  );
  const lessons = useMemo(
    () => tree.find((c) => c.id === chapter)?.units ?? [],
    [tree, chapter],
  );

  const canNext1 = !!name && !!grade && !!subject && !!scoreType;

  return (
    <div>
      {/* Stepper */}
      <div className="flex items-center justify-between px-2 pt-2 pb-6 border-b">
        {[
          { n: 1, label: "Thông tin Phiếu bài tập" },
          { n: 2, label: "Nội dung Phiếu bài tập" },
          { n: 3, label: "Danh sách tham gia" },
        ].map((s, i) => {
          const done = s.n === 2 && questions.length > 0 && step !== 2;
          return (
            <div key={s.n} className="flex-1 flex items-center">
              <button
                type="button"
                disabled={!(s.n === 1 || canNext1)}
                onClick={() => { if (s.n === 1 || canNext1) setStep(s.n); }}
                className="flex flex-col items-center flex-1 cursor-pointer disabled:cursor-default"
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  done ? "bg-emerald-500 text-white"
                    : step >= s.n ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                }`}>
                  {done ? <Check className="h-5 w-5" strokeWidth={3} /> : s.n}
                </div>
                <div className="mt-2 text-xs text-slate-500">BƯỚC {s.n}</div>
                <div className={`text-sm font-semibold mt-0.5 ${step === s.n ? "text-slate-800" : "text-slate-500"}`}>
                  {s.label}
                </div>
              </button>
              {i < 2 && <div className={`h-0.5 flex-1 -mt-10 ${step > s.n ? "bg-indigo-600" : "bg-slate-200"}`} />}
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <div className="space-y-5 pt-4">
          <h3 className="font-semibold text-slate-800">Thông tin Phiếu bài tập</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Tên phiếu bài tập <span className="text-rose-500">*</span></label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Lớp gán</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="mt-1 w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-left">
                    <span className={assignedClasses.size ? "text-slate-800" : "text-slate-400"}>
                      {assignedClasses.size ? Array.from(assignedClasses).join(", ") : "Chọn lớp (nhiều)"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {["4A năm học 2025 - 2026", "4B năm học 2025 - 2026", "4C năm học 2025 - 2026"].map((c) => (
                    <DropdownMenuItem key={c} onSelect={(e) => {
                      e.preventDefault();
                      setAssignedClasses((prev) => {
                        const n = new Set(prev);
                        if (n.has(c)) n.delete(c); else n.add(c);
                        return n;
                      });
                    }}>
                      <Checkbox checked={assignedClasses.has(c)} className="mr-2" /> {c}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Khối <span className="text-rose-500">*</span></label>
              <Select value={grade} onValueChange={(v) => { setGrade(v); setSubject(""); setChapter(""); setLesson(""); }} disabled={locked}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Chọn" /></SelectTrigger>
                <SelectContent>
                  {Object.keys(SUBJECTS_BY_GRADE).map((g) => <SelectItem key={g} value={g}>Khối {g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Môn <span className="text-rose-500">*</span></label>
              <Select value={subject} onValueChange={(v) => { setSubject(v); setChapter(""); setLesson(""); }} disabled={locked || !grade}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Chọn" /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Chương/Chủ đề</label>
              <Select value={chapter} onValueChange={(v) => { setChapter(v); setLesson(""); }} disabled={locked || !subject || tree.length === 0}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Chọn" /></SelectTrigger>
                <SelectContent>
                  {tree.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Bài học</label>
              <Select value={lesson} onValueChange={setLesson} disabled={locked || !chapter}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Chọn" /></SelectTrigger>
                <SelectContent>
                  {lessons.map((u) => <SelectItem key={u.id} value={u.id}>{u.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          {locked && (
            <p className="text-xs italic text-slate-500 -mt-2">
              Khối, Môn, Chương/Chủ đề và Bài học được gán tự động theo thông tin bài giảng.
            </p>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Thời gian làm bài (phút)</label>
              <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="mt-1" placeholder="Không bắt buộc" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Loại điểm <span className="text-rose-500">*</span></label>
              <Select value={scoreType} onValueChange={setScoreType}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Chọn" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không lấy điểm</SelectItem>
                  <SelectItem value="dgtx">Lấy điểm ĐGTX</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-semibold text-slate-800 mb-3">Cấu hình Phiếu bài tập</h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-3 text-sm text-slate-700">
                <Switch checked={showScore} onCheckedChange={setShowScore} /> Cho phép xem điểm sau khi nộp
              </label>
              <label className="flex items-center gap-3 text-sm text-slate-700">
                <Switch checked={showAnswers} onCheckedChange={setShowAnswers} /> Cho phép xem đáp án sau khi nộp
              </label>
              <label className="flex items-center gap-3 text-sm text-slate-700">
                <Switch checked={shuffle} onCheckedChange={setShuffle} /> Xáo trộn thứ tự câu hỏi
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>Đóng</Button>
            <Button className="bg-indigo-700 hover:bg-indigo-800" disabled={!canNext1} onClick={() => setStep(2)}>
              Tiếp theo
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="font-semibold text-slate-800">Nội dung Phiếu bài tập</h3>
            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-500">Thang điểm</div>
              <Input className="w-24" placeholder="10" />
              <Button variant="outline" onClick={() => toast.success("Đã chia đều điểm cho các câu")}>
                Chia đều điểm cho các câu
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-indigo-700 hover:bg-indigo-800 gap-1">
                    <Plus className="h-4 w-4" /> Thêm mới <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  {QUESTION_TYPES.map((t) => (
                    <DropdownMenuItem key={t} onSelect={() => {
                      setQuestions((p) => [...p, {
                        id: `wsq-${Date.now()}-${p.length}`,
                        content: `Câu hỏi mới (${t})`, type: t, level: "Nhận biết", score: "1",
                      }]);
                      toast.success(`Thêm câu hỏi: ${t}`);
                    }}>{t}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-12">STT</TableHead>
                  <TableHead>Câu hỏi</TableHead>
                  <TableHead className="w-20">Điểm</TableHead>
                  <TableHead className="w-28">Mức độ</TableHead>
                  <TableHead className="w-44">Loại câu hỏi</TableHead>
                  <TableHead className="w-28 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Checkbox defaultChecked /><span>Hoán vị đáp án</span>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                      Chưa có câu hỏi. Bấm "Thêm mới" để thêm câu hỏi.
                    </TableCell>
                  </TableRow>
                )}
                {questions.map((q, i) => (
                  <TableRow key={q.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell className="text-slate-800">{q.content}</TableCell>
                    <TableCell>
                      <Input className="w-16" value={q.score}
                        onChange={(e) => setQuestions((p) => p.map((x) => x.id === q.id ? { ...x, score: e.target.value } : x))} />
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-700 border border-amber-200">{q.level}</span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-700">{q.type}</TableCell>
                    <TableCell className="text-center"><Checkbox defaultChecked /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => setStep(1)}>Quay lại</Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>Đóng</Button>
              <Button className="bg-indigo-700 hover:bg-indigo-800" onClick={() => setStep(3)}>Tiếp theo</Button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 pt-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800">Danh sách tham gia</h3>
              <div className="text-sm text-slate-500">Đã chọn: <b className="text-slate-800">{selectedStudents.size}</b> học sinh</div>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-12">STT</TableHead>
                  <TableHead className="w-40">Mã định danh</TableHead>
                  <TableHead>Tên học sinh</TableHead>
                  <TableHead className="w-32">Ngày sinh</TableHead>
                  <TableHead className="w-12 text-center">
                    <Checkbox
                      checked={selectedStudents.size === STUDENTS.length}
                      onCheckedChange={(v) => setSelectedStudents(v ? new Set(STUDENTS.map((s) => s.id)) : new Set())}
                    />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {STUDENTS.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="text-slate-500">{s.id}</TableCell>
                    <TableCell className="text-sm text-slate-700">{s.code}</TableCell>
                    <TableCell className="font-medium text-slate-800">{s.name}</TableCell>
                    <TableCell className="text-sm text-slate-600">{s.dob}</TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={selectedStudents.has(s.id)}
                        onCheckedChange={() => setSelectedStudents((prev) => {
                          const n = new Set(prev);
                          if (n.has(s.id)) n.delete(s.id); else n.add(s.id);
                          return n;
                        })}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => setStep(2)}>Quay lại</Button>
            <div className="flex gap-2">
              <Button variant="outline" className="border-sky-300 text-sky-700 hover:bg-sky-50"
                onClick={() => toast.message("Xem trước phiếu bài tập")}>
                <Eye className="h-4 w-4 mr-1" /> Xem trước
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => {
                  toast.success("Đã tạo phiếu bài tập");
                  onSaved?.({ title: name || "Phiếu bài tập mới" });
                  onClose();
                }}>
                Tạo phiếu bài tập
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
