import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Plus, Search, SlidersHorizontal, FileCheck2, LayoutGrid, ChevronDown, ListChecks, Grid3x3,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { FilterSelect, ApprovalTag } from "@/components/ExamBankShared";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { listMatrices } from "@/lib/matrix-store";
import {
  GRADES, SUBJECTS, PROPOSERS, STATUS_LABEL, type ApprovalStatus,
} from "@/lib/shared-exam-bank";
import { toast } from "sonner";

export const Route = createFileRoute("/ky-thi/de-thi")({
  head: () => ({
    meta: [
      { title: "Đề thi kỳ thi | Tiểu học Tô Hiệu" },
      { name: "description", content: "Kho đề thi dùng chung cả trường, đáp ứng chuyên môn để tổ chức các kỳ thi toàn trường." },
      { property: "og:title", content: "Đề thi kỳ thi" },
      { property: "og:description", content: "Kho đề thi dùng chung cả trường, đáp ứng chuyên môn để tổ chức các kỳ thi toàn trường." },
    ],
  }),
  component: Page,
});

/** Tên người dùng hiện tại — đề do chính họ đề xuất sẽ hiển thị "Tôi - ..." */
const ME = "Phùng Thúy Hằng";

type Exam = {
  id: string;
  name: string;
  grade: string;
  subject: string;
  questions: number;
  minutes: number;
  kind: "Tạo mới" | "Ma trận";
  proposer: string;
  status: ApprovalStatus;
  rejectReason?: string;
};

const SEED: Exam[] = [
  { id: "se1", name: "Đề thi cuối kỳ I – Toán 4", grade: "4", subject: "Toán", questions: 25, minutes: 45, kind: "Ma trận", proposer: ME, status: "approved" },
  { id: "se2", name: "Đề thi giữa kỳ – Tiếng Việt 4", grade: "4", subject: "Tiếng Việt", questions: 20, minutes: 40, kind: "Tạo mới", proposer: "Trần Thị Bích", status: "pending" },
  { id: "se3", name: "Đề khảo sát chất lượng đầu năm – Toán 3", grade: "3", subject: "Toán", questions: 18, minutes: 40, kind: "Ma trận", proposer: "Nguyễn Văn A", status: "pending" },
  { id: "se4", name: "Đề thi thử học sinh giỏi – Tiếng Anh 5", grade: "5", subject: "Tiếng Anh", questions: 30, minutes: 60, kind: "Tạo mới", proposer: "Lê Minh Châu", status: "rejected", rejectReason: "Cấu trúc đề chưa bám sát ma trận của tổ chuyên môn." },
];

type Filters = { keyword: string; grade: string; subject: string; status: string; proposer: string; kind: string };
const EMPTY: Filters = { keyword: "", grade: "all", subject: "all", status: "all", proposer: "all", kind: "all" };

function Page() {
  const [items, setItems] = useState<Exam[]>(SEED);
  const [draft, setDraft] = useState<Filters>(EMPTY);
  const [applied, setApplied] = useState<Filters>(EMPTY);
  const [panel, setPanel] = useState(false);
  const [creating, setCreating] = useState(false);
  const [rejecting, setRejecting] = useState<Exam | null>(null);

  const filtered = useMemo(() => items.filter((e) => {
    const f = applied;
    if (f.keyword && !e.name.toLowerCase().includes(f.keyword.toLowerCase())) return false;
    if (f.grade !== "all" && e.grade !== f.grade) return false;
    if (f.subject !== "all" && e.subject !== f.subject) return false;
    if (f.status !== "all" && e.status !== f.status) return false;
    if (f.proposer !== "all" && e.proposer !== f.proposer) return false;
    if (f.kind !== "all" && e.kind !== f.kind) return false;
    return true;
  }), [items, applied]);

  const activeCount = useMemo(
    () => Object.entries(applied).filter(([k, v]) => (k === "keyword" ? v !== "" : v !== "all")).length,
    [applied],
  );

  const approve = (e: Exam) => {
    setItems((p) => p.map((x) => x.id === e.id ? { ...x, status: "approved", rejectReason: undefined } : x));
    toast.success("Đã duyệt đề thi vào kho dùng chung");
  };
  const doReject = (e: Exam, reason: string) => {
    setItems((p) => p.map((x) => x.id === e.id ? { ...x, status: "rejected", rejectReason: reason } : x));
    setRejecting(null);
    toast.success("Đã từ chối đề thi");
  };
  const removeOne = (e: Exam) => {
    setItems((p) => p.filter((x) => x.id !== e.id));
    toast.success("Đã gỡ đề thi khỏi kho dùng chung");
  };

  return (
    <AppShell>
      <div className="bg-white rounded-2xl border shadow-sm">
        <div className="p-4 flex items-center justify-between border-b gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Đề thi kỳ thi</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kho đề thi dùng chung cả trường, đáp ứng chuyên môn để tổ chức các đề thi, kỳ thi toàn trường.
            </p>
          </div>
          {CAN_CREATE ? (
            <Button className="gap-1.5 bg-indigo-600 hover:bg-indigo-700" onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" /> Thêm mới
            </Button>
          ) : (
            <Button disabled className="gap-1.5" title="Chỉ giáo viên được phân quyền mới được thêm mới">
              <Plus className="h-4 w-4" /> Thêm mới
            </Button>
          )}
        </div>

        <div className="px-4 py-3 flex items-center gap-3 border-b bg-slate-50/60">
          <Button variant="outline" className="gap-1.5" onClick={() => { setDraft(applied); setPanel(true); }}>
            <SlidersHorizontal className="h-4 w-4" /> Bộ lọc
            {activeCount > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-indigo-600 text-white text-[11px] font-semibold">
                {activeCount}
              </span>
            )}
          </Button>
          {activeCount > 0 && (
            <button onClick={() => { setApplied(EMPTY); setDraft(EMPTY); }}
              className="text-xs text-slate-500 hover:text-rose-600 cursor-pointer">Xóa bộ lọc</button>
          )}
          <div className="ml-auto text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{filtered.length}</span> đề thi
          </div>
        </div>

        <div className="p-2 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-12 text-center">STT</TableHead>
                <TableHead className="min-w-[280px]">Tên đề thi</TableHead>
                <TableHead className="w-20 text-center">Khối</TableHead>
                <TableHead className="w-28">Môn</TableHead>
                <TableHead className="w-24 text-center">Số câu</TableHead>
                <TableHead className="w-28 text-center">Thời gian</TableHead>
                <TableHead className="w-40">Người đề xuất</TableHead>
                <TableHead className="w-40 text-center">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e, i) => (
                <TableRow key={e.id} className="hover:bg-indigo-50/40 align-top">
                  <TableCell className="text-center text-slate-500">{i + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-start gap-2">
                      <span className="text-slate-800 font-medium">{e.name}</span>
                      <ApprovalTag status={e.status} />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 inline-flex items-center gap-1">
                      {e.kind === "Ma trận" ? <LayoutGrid className="h-3 w-3" /> : <FileCheck2 className="h-3 w-3" />} {e.kind}
                    </div>
                    {e.status === "rejected" && e.rejectReason && (
                      <div className="text-[11px] text-rose-600 mt-1 italic">Lý do: {e.rejectReason}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-sm text-slate-700">Khối {e.grade}</TableCell>
                  <TableCell className="text-sm text-slate-700">{e.subject}</TableCell>
                  <TableCell className="text-center text-sm text-slate-700">{e.questions}</TableCell>
                  <TableCell className="text-center text-sm text-slate-700">{e.minutes} phút</TableCell>
                  <TableCell className="text-sm text-slate-600">{e.proposer}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1.5">
                      {e.status === "approved" ? (
                        <button onClick={() => removeOne(e)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer">
                          <MinusCircle className="h-4 w-4" /> Gỡ bỏ
                        </button>
                      ) : (
                        <>
                          <button onClick={() => approve(e)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-emerald-700 hover:bg-emerald-50 cursor-pointer">
                            <Check className="h-4 w-4" /> Duyệt
                          </button>
                          {e.status !== "rejected" && (
                            <button onClick={() => setRejecting(e)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer">
                              <Ban className="h-4 w-4" /> Từ chối
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-sm text-slate-500 py-10">
                    Không có đề thi phù hợp.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Sheet open={panel} onOpenChange={setPanel}>
        <SheetContent side="left" className="w-[380px] sm:max-w-[380px] flex flex-col p-0">
          <SheetHeader className="px-5 py-4 border-b">
            <SheetTitle className="text-indigo-700">Bộ lọc đề thi</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <div>
              <Label className="text-sm">Từ khóa</Label>
              <div className="relative mt-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input className="pl-8" value={draft.keyword}
                  onChange={(ev) => setDraft({ ...draft, keyword: ev.target.value })}
                  placeholder="Tìm theo tên đề thi..." />
              </div>
            </div>
            <FilterSelect label="Trạng thái" value={draft.status} onChange={(v) => setDraft({ ...draft, status: v })}
              allLabel="Tất cả trạng thái"
              options={(Object.keys(STATUS_LABEL) as ApprovalStatus[]).map((s) => ({ value: s, label: STATUS_LABEL[s] }))} />
            <FilterSelect label="Người đề xuất" value={draft.proposer} onChange={(v) => setDraft({ ...draft, proposer: v })}
              allLabel="Tất cả giáo viên trong tổ" options={PROPOSERS.map((p) => ({ value: p, label: p }))} />
            <FilterSelect label="Khối" value={draft.grade} onChange={(v) => setDraft({ ...draft, grade: v })}
              allLabel="Tất cả khối" options={GRADES.map((g) => ({ value: g, label: `Khối ${g}` }))} />
            <FilterSelect label="Môn" value={draft.subject} onChange={(v) => setDraft({ ...draft, subject: v })}
              allLabel="Tất cả môn" options={SUBJECTS.map((s) => ({ value: s, label: s }))} />
            <FilterSelect label="Hình thức tạo đề" value={draft.kind} onChange={(v) => setDraft({ ...draft, kind: v })}
              allLabel="Tất cả hình thức"
              options={[{ value: "Tạo mới", label: "Tạo mới" }, { value: "Ma trận", label: "Ma trận" }]} />
          </div>
          <SheetFooter className="px-5 py-4 border-t flex-row gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setDraft(EMPTY)}>Đặt lại</Button>
            <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 gap-1.5"
              onClick={() => { setApplied(draft); setPanel(false); }}>
              <Search className="h-4 w-4" /> Tìm kiếm
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {creating && (
        <CreateExamModal
          onClose={() => setCreating(false)}
          onSave={(e) => { setItems((p) => [e, ...p]); setCreating(false); toast.success("Đã thêm đề thi vào kho dùng chung"); }}
        />
      )}

      {rejecting && (
        <RejectReasonModal name={rejecting.name} proposer={rejecting.proposer}
          onClose={() => setRejecting(null)}
          onConfirm={(reason) => doReject(rejecting, reason)} />
      )}
    </AppShell>
  );
}

function CreateExamModal({ onClose, onSave }: { onClose: () => void; onSave: (e: Exam) => void }) {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("4");
  const [subject, setSubject] = useState("Toán");
  const [questions, setQuestions] = useState("20");
  const [minutes, setMinutes] = useState("45");
  const [kind, setKind] = useState<"Tạo mới" | "Ma trận">("Tạo mới");

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle className="text-indigo-700">Thêm mới đề thi kỳ thi</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-sm">Tên đề thi <span className="text-rose-500">*</span></Label>
            <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ví dụ: Đề thi cuối kỳ II – Toán 4" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">Khối</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{GRADES.map((g) => <SelectItem key={g} value={g}>Khối {g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Môn</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Số câu</Label>
              <Input className="mt-1" value={questions} onChange={(e) => setQuestions(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm">Thời gian (phút)</Label>
              <Input className="mt-1" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="text-sm">Hình thức tạo đề</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as "Tạo mới" | "Ma trận")}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Tạo mới">Tạo mới</SelectItem>
                <SelectItem value="Ma trận">Sinh từ khung ma trận</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Đóng</Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => {
              if (!name.trim()) return toast.error("Nhập tên đề thi");
              onSave({
                id: `se_${Date.now()}`, name: name.trim(), grade, subject,
                questions: Number(questions) || 0, minutes: Number(minutes) || 0,
                kind, proposer: "Phùng Thúy Hằng", status: "approved",
              });
            }}>Ghi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
