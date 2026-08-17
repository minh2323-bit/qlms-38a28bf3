import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FilterSelect } from "@/components/ExamBankShared";
import { Search } from "lucide-react";
import { toast } from "sonner";
import type { ExamSession } from "@/lib/exam-sessions";

type Student = { id: string; name: string; cccd: string; grade: string; klass: string; registered: boolean };

const FIRST = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Đỗ", "Vũ", "Bùi"];
const MID = ["Văn", "Thị", "Minh", "Gia", "Khánh", "Hải"];
const LAST = ["An", "Bình", "Chi", "Dũng", "Hà", "Khang", "Linh", "Mai", "Nam", "Phúc"];

function buildStudents(session: ExamSession): Student[] {
  return Array.from({ length: 28 }, (_, i) => {
    const g = ["3", "4", "5"][(i + Number(session.grade)) % 3];
    return {
      id: `${session.id}-s${i + 1}`,
      name: `${FIRST[i % FIRST.length]} ${MID[i % MID.length]} ${LAST[(i * 3) % LAST.length]}`,
      cccd: String(1000000000 + i * 1234567 + session.id.length * 97),
      grade: g,
      klass: `${g}${"ABCD"[i % 4]}`,
      registered: i % 3 === 0,
    };
  });
}

export function ExamRegisterModal({
  session, open, onOpenChange,
}: { session: ExamSession | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const [tab, setTab] = useState<"un" | "done">("un");
  const [q, setQ] = useState("");
  const [cccd, setCccd] = useState("");
  const [grade, setGrade] = useState("all");
  const [klass, setKlass] = useState("all");

  const students = useMemo(() => (session ? buildStudents(session) : []), [session]);
  const classes = useMemo(
    () => Array.from(new Set(students.filter((s) => grade === "all" || s.grade === grade).map((s) => s.klass))).sort(),
    [students, grade],
  );

  const rows = students.filter(
    (s) =>
      s.registered === (tab === "done")
      && (q.trim() === "" || s.name.toLowerCase().includes(q.trim().toLowerCase()))
      && (cccd.trim() === "" || s.cccd.includes(cccd.trim()))
      && (grade === "all" || s.grade === grade)
      && (klass === "all" || s.klass === klass),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Đăng ký thí sinh {session ? `– ${session.name}` : ""}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 border-b">
          {([["un", "Học sinh chưa đăng ký"], ["done", "Học sinh đã đăng ký"]] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
                tab === k ? "border-indigo-700 text-indigo-700" : "border-transparent text-slate-500 hover:text-indigo-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-sm">Tên học sinh</label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="pl-9" placeholder="Tìm theo tên..." value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-sm">Mã CCCD</label>
            <Input className="mt-1" placeholder="Tìm theo CCCD..." value={cccd} onChange={(e) => setCccd(e.target.value)} />
          </div>
          <FilterSelect
            label="Khối" value={grade} onChange={(v) => { setGrade(v); setKlass("all"); }} allLabel="Tất cả khối"
            options={["3", "4", "5"].map((g) => ({ value: g, label: `Khối ${g}` }))}
          />
          <FilterSelect
            label="Lớp" value={klass} onChange={setKlass} allLabel="Tất cả lớp"
            options={classes.map((c) => ({ value: c, label: c }))}
          />
        </div>

        <div className="rounded-xl border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-14 text-center">STT</TableHead>
                <TableHead>Tên học sinh</TableHead>
                <TableHead className="w-40">Mã CCCD</TableHead>
                <TableHead className="w-20 text-center">Khối</TableHead>
                <TableHead className="w-20 text-center">Lớp</TableHead>
                <TableHead className="w-32 text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s, i) => (
                <TableRow key={s.id} className="hover:bg-slate-50">
                  <TableCell className="text-center text-slate-500">{i + 1}</TableCell>
                  <TableCell className="font-medium text-slate-800">{s.name}</TableCell>
                  <TableCell>{s.cccd}</TableCell>
                  <TableCell className="text-center">{s.grade}</TableCell>
                  <TableCell className="text-center">{s.klass}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      variant={tab === "un" ? "default" : "outline"}
                      className={tab === "un" ? "bg-indigo-700 hover:bg-indigo-800" : "text-rose-600 border-rose-200 hover:bg-rose-50"}
                      onClick={() => toast.success(tab === "un" ? `Đã đăng ký ${s.name}` : `Đã hủy đăng ký ${s.name}`)}
                    >
                      {tab === "un" ? "Đăng ký" : "Hủy"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500 py-8">Không có học sinh phù hợp.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
