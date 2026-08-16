import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, SlidersHorizontal, List, LayoutGrid, PlayCircle } from "lucide-react";
import { toast } from "sonner";

type Phase = "upcoming" | "ongoing" | "done";

export type StudentExam = {
  id: string;
  name: string;
  subject: string;
  /** Tên ca thi – nếu không có ca thi thì hiển thị "Thời gian bắt đầu" */
  shift?: string;
  time: string;
  date: string;
  minutes: number;
  questions: number;
  phase: Phase;
  joined?: number;
  graded?: boolean;
};

const TABS: { key: Phase; label: string }[] = [
  { key: "upcoming", label: "Chưa diễn ra" },
  { key: "ongoing", label: "Đang diễn ra" },
  { key: "done", label: "Đã kết thúc" },
];

export function StudentExamsPage({ title, exams }: { title: string; exams: StudentExam[] }) {
  const [tab, setTab] = useState<Phase>("upcoming");
  const [subject, setSubject] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const subjects = Array.from(new Set(exams.map((e) => e.subject)));
  const list = exams.filter((e) => e.phase === tab && (subject === "all" || e.subject === subject));

  return (
    <AppShell role="student">
      <section className="bg-white rounded-2xl border shadow-sm">
        <div className="px-6 py-4 flex items-start justify-between gap-4">
          <h1 className="text-xl font-bold text-slate-800">{title}</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              Bộ lọc <SlidersHorizontal className="h-4 w-4" />
            </span>
            <Button variant={view === "list" ? "default" : "outline"} size="icon" className="h-8 w-8"
              onClick={() => setView("list")}>
              <List className="h-4 w-4" />
            </Button>
            <Button variant={view === "grid" ? "default" : "outline"} size="icon" className="h-8 w-8"
              onClick={() => setView("grid")}>
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="px-6 pb-3">
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Môn" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Môn</SelectItem>
              {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="px-6 flex gap-5 border-b">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-2 text-sm font-semibold border-b-2 transition ${
                tab === t.key ? "border-indigo-700 text-indigo-700" : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className={`p-6 grid gap-4 ${view === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
          {list.length === 0 && (
            <div className="text-sm text-slate-400 py-8 text-center col-span-full">Chưa có kỳ thi nào.</div>
          )}
          {list.map((e) => (
            <div key={e.id} className="rounded-xl border p-4 flex flex-col gap-3 hover:shadow transition">
              <div className="flex items-start justify-between gap-3">
                <div className="font-semibold text-slate-800">{e.name}</div>
                {e.phase !== "upcoming" && (
                  <div className="text-center shrink-0">
                    <Users className="h-4 w-4 mx-auto text-slate-500" />
                    <div className="text-sm font-semibold text-slate-700">{e.joined ?? 0}</div>
                    <div className="text-[11px] text-slate-500">
                      {e.phase === "ongoing" ? "đang tham gia" : "đã tham gia"}
                    </div>
                  </div>
                )}
              </div>

              <div className="text-sm text-slate-600 space-y-1.5">
                <div className="flex justify-between gap-2">
                  <span>{e.shift ? "Ca thi:" : "Thời gian bắt đầu"}</span>
                  <span className="text-slate-800">
                    {e.shift ? <span className="mr-3 text-slate-500">{e.shift}</span> : null}
                    {e.time} &nbsp; {e.date}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span>Thời gian làm bài:</span>
                  <span className="text-slate-800">{e.minutes} phút</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span>Số câu hỏi:</span>
                  <span className="text-slate-800">{e.questions} câu</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-amber-500 hover:bg-amber-500 text-white rounded-sm">{e.subject}</Badge>
                {e.phase === "done" && (
                  e.graded
                    ? <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white rounded-sm">Đã chấm</Badge>
                    : <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 rounded-sm">Chờ chấm</Badge>
                )}
              </div>

              <div className="pt-1 flex justify-end">
                {e.phase === "upcoming" && (
                  <Button size="sm" className="bg-sky-500 hover:bg-sky-600"
                    onClick={() => toast.info("Kỳ thi chưa bắt đầu.")}>
                    Xem chi tiết
                  </Button>
                )}
                {e.phase === "ongoing" && (
                  <button className="text-teal-600 font-semibold text-sm flex items-center gap-1 hover:underline"
                    onClick={() => toast.success("Đang vào phòng thi…")}>
                    <PlayCircle className="h-4 w-4" /> Vào thi
                  </button>
                )}
                {e.phase === "done" && (
                  <button className="text-teal-600 font-semibold text-sm hover:underline w-full text-center"
                    onClick={() => toast.info("Xem bài làm & điểm.")}>
                    Xem bài làm & Điểm
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
