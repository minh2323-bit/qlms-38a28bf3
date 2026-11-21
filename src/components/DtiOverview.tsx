import { useState } from "react";
import { ArrowUpRight, BookOpen, ClipboardCheck, FileQuestion, GraduationCap, Library, Users } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { DateRangeFilter, UnitFilter, matchUnitRange } from "@/components/ReportFilters";

type Teacher = {
  name: string; team: string; lectures: number; shared: number; materials: number;
  questions: number; homework: number; gradedHomework: number; tests: number;
  gradedTests: number; contentRate: number;
};
type Student = { code: string; materials: number; materialsDone: number; onTime: number };
type SchoolClass = { name: string; siSo: number };
type ReportTab = "teacher" | "student" | "class" | "material" | "question" | "lecture";

const number = (value: number) => value.toLocaleString("vi-VN");
const percentage = (done: number, total: number) => total ? Math.round(done / total * 100) : 0;

export function DtiOverview({ teachers, students, classes, onOpen }: {
  teachers: Teacher[]; students: Student[]; classes: SchoolClass[];
  onOpen: (tab: ReportTab) => void;
}) {
  const [unit, setUnit] = useState("all");
  const [range, setRange] = useState<DateRange | undefined>();
  const teacherRows = teachers.filter((row) => matchUnitRange(row.name, unit, range));
  const studentRows = students.filter((row) => matchUnitRange(row.code, unit, range));
  const classRows = classes.filter((row) => matchUnitRange(row.name, unit, range));
  const sum = (key: "lectures" | "shared" | "materials" | "questions" | "homework" | "gradedHomework" | "tests" | "gradedTests" | "contentRate") =>
    teacherRows.reduce((total, row) => total + row[key], 0);
  const lectureCount = sum("lectures");
  const homeworkCount = sum("homework");
  const testCount = sum("tests");
  const contentRate = percentage(sum("contentRate"), teacherRows.length * 100);
  const studentMaterials = studentRows.reduce((total, row) => total + row.materials, 0);
  const studentDone = studentRows.reduce((total, row) => total + row.materialsDone, 0);
  const topTeachers = [...teacherRows].sort((a, b) => b.contentRate - a.contentRate).slice(0, 5);
  const metrics = [
    { label: "Giáo viên", value: teacherRows.length, detail: "Giáo viên trong báo cáo", icon: Users, tab: "teacher" as const, tone: "bg-exam-tint text-exam-primary" },
    { label: "Lớp học", value: classRows.length, detail: `Sĩ số các lớp: ${number(classRows.reduce((total, row) => total + row.siSo, 0))}`, icon: GraduationCap, tab: "class" as const, tone: "bg-exam-success-tint text-exam-success" },
    { label: "Bài giảng", value: lectureCount, detail: `${number(sum("shared"))} bài giảng đã chia sẻ`, icon: BookOpen, tab: "lecture" as const, tone: "bg-exam-tint text-exam-primary" },
    { label: "Học liệu", value: sum("materials"), detail: "Học liệu giáo viên tải lên", icon: Library, tab: "material" as const, tone: "bg-exam-warning-tint text-exam-warning" },
  ];
  const activities = [
    { label: "Bài tập đã chấm", done: sum("gradedHomework"), total: homeworkCount },
    { label: "Bài kiểm tra đã chấm", done: sum("gradedTests"), total: testCount },
    { label: "Học liệu học sinh hoàn thành", done: studentDone, total: studentMaterials },
  ];
  const indicators = [
    ["Bài giảng đã tạo", lectureCount, "lecture"],
    ["Bài giảng đã chia sẻ", sum("shared"), "lecture"],
    ["Học liệu tải lên", sum("materials"), "material"],
    ["Câu hỏi đã tạo", sum("questions"), "question"],
    ["Bài tập đã giao", homeworkCount, "teacher"],
    ["Bài kiểm tra đã tạo", testCount, "teacher"],
  ] as const;

  return (
    <div className="space-y-5 text-[13px] text-foreground">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-base">Tổng quan chuyển đổi số</h2>
          <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">Dữ liệu mô phỏng</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <UnitFilter value={unit} onChange={setUnit} />
          <DateRangeFilter value={range} onChange={setRange} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, detail, icon: Icon, tab, tone }) => (
          <article key={label} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-muted-foreground">{label}</span>
              <span className={`rounded-md p-2 ${tone}`}><Icon className="size-5" /></span>
            </div>
            <div className="mt-2 text-3xl font-bold tabular-nums">{number(value)}</div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">{detail}</span>
              <Button variant="ghost" size="icon" className="size-7 shrink-0 text-exam-primary" aria-label={`Xem báo cáo ${label}`} title={`Xem báo cáo ${label}`} onClick={() => onOpen(tab)}><ArrowUpRight className="size-4" /></Button>
            </div>
          </article>
        ))}
      </div>

      <div className="grid gap-6 border-y border-border py-5 lg:grid-cols-2">
        <section className="space-y-4">
          <h3 className="flex items-center gap-2 font-semibold"><ClipboardCheck className="size-4 text-exam-success" />Hoạt động dạy và học</h3>
          {activities.map(({ label, done, total }) => (
            <div key={label} className="space-y-2">
              <div className="flex justify-between gap-3"><span>{label}</span><span className="shrink-0 font-semibold tabular-nums">{number(done)} / {number(total)} <span className="ml-2 text-exam-success">{percentage(done, total)}%</span></span></div>
              <meter className="dti-meter w-full" min={0} max={Math.max(total, 1)} value={done} aria-label={label} />
            </div>
          ))}
          <div className="flex flex-wrap justify-between gap-3 border-t border-border pt-3 text-muted-foreground">
            <span>Tỷ lệ tiết có nội dung <strong className="ml-1 text-exam-primary">{contentRate}%</strong></span>
            <span>Nộp bài đúng hạn <strong className="ml-1 text-exam-success">{percentage(studentRows.reduce((total, row) => total + row.onTime, 0), studentRows.length * 100)}%</strong></span>
          </div>
        </section>

        <section className="space-y-3 lg:border-l lg:border-border lg:pl-6">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold">Giáo viên có tỷ lệ tiết có nội dung cao nhất</h3>
            <Button variant="ghost" size="icon" className="size-7 shrink-0 text-exam-primary" aria-label="Xem báo cáo giáo viên" title="Xem báo cáo giáo viên" onClick={() => onOpen("teacher")}><ArrowUpRight className="size-4" /></Button>
          </div>
          {topTeachers.map((teacher, i) => (
            <div key={teacher.name} className="flex items-center gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted font-semibold text-muted-foreground">{i + 1}</span>
              <div className="min-w-0 flex-1"><p className="font-medium">{teacher.name}</p><p className="text-xs text-muted-foreground">{teacher.team}</p></div>
              <span className="font-semibold tabular-nums text-exam-success">{teacher.contentRate}%</span>
            </div>
          ))}
          {topTeachers.length === 0 && <p className="py-8 text-center text-muted-foreground">Không có dữ liệu trong phạm vi đã chọn.</p>}
        </section>
      </div>

      <section className="space-y-3">
        <h3 className="flex items-center gap-2 font-semibold"><FileQuestion className="size-4 text-exam-primary" />Tổng hợp nội dung số</h3>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left">
            <thead className="bg-muted text-muted-foreground"><tr><th className="px-4 py-3 font-medium">Chỉ số</th><th className="px-4 py-3 text-right font-medium">Số lượng</th><th className="w-28 px-4 py-3 text-center font-medium">Chi tiết</th></tr></thead>
            <tbody className="bg-card">
              {indicators.map(([label, value, tab]) => (
                <tr key={label} className="border-t border-border"><td className="px-4 py-2">{label}</td><td className="px-4 py-2 text-right font-semibold tabular-nums">{number(value)}</td><td className="px-4 py-2 text-center"><Button variant="ghost" size="icon" className="size-7 text-exam-primary" title={`Xem ${label.toLowerCase()}`} aria-label={`Xem ${label.toLowerCase()}`} onClick={() => onOpen(tab)}><ArrowUpRight className="size-4" /></Button></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}