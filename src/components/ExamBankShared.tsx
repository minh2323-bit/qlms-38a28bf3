import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Clock3, CheckCircle2, XCircle } from "lucide-react";
import type { ApprovalStatus } from "@/lib/shared-exam-bank";

export function FilterSelect({
  label, value, onChange, options, allLabel, disabled,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; allLabel: string; disabled?: boolean;
}) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="mt-1 bg-white"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{allLabel}</SelectItem>
          {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ApprovalTag({ status }: { status: ApprovalStatus }) {
  if (status === "pending") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock3 className="h-3 w-3" /> Chờ duyệt
      </span>
    );
  }
  if (status === "approved") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="h-3 w-3" /> Đã duyệt
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
      <XCircle className="h-3 w-3" /> Từ chối
    </span>
  );
}

/** Popup điền lý do từ chối (không bắt buộc). */
export function RejectReasonModal({
  name, proposer, onClose, onConfirm,
}: { name: string; proposer: string; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-rose-600">Từ chối đề xuất</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-lg border bg-slate-50 p-3 text-sm space-y-1">
            <div>
              <span className="text-slate-500">Tên học liệu: </span>
              <span className="font-semibold text-slate-800">{name}</span>
            </div>
            <div>
              <span className="text-slate-500">Người đề xuất: </span>
              <span className="font-semibold text-slate-800">{proposer}</span>
            </div>
          </div>
          <div>
            <Label className="text-sm">
              Lý do từ chối <span className="text-slate-400 font-normal">(không bắt buộc)</span>
            </Label>
            <Textarea
              className="mt-1 min-h-[110px]"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do từ chối để gửi phản hồi tới người đề xuất..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => onConfirm(reason.trim())}>
            Từ chối
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Tabs trạng thái duyệt dùng chung cho Ngân hàng câu hỏi / Đề thi kỳ thi. */
export function StatusTabs({
  value, onChange, counts,
}: {
  value: ApprovalStatus;
  onChange: (v: ApprovalStatus) => void;
  counts: Record<ApprovalStatus, number>;
}) {
  const tabs: { key: ApprovalStatus; label: string }[] = [
    { key: "pending", label: "Chờ duyệt" },
    { key: "approved", label: "Đã duyệt" },
    { key: "rejected", label: "Đã từ chối" },
  ];
  return (
    <div className="px-4 pt-3 flex items-center gap-1 border-b bg-white">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px cursor-pointer transition ${
            value === t.key
              ? "border-indigo-600 text-indigo-700"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          {t.label}
          <span className={`ml-1.5 text-xs font-bold ${value === t.key ? "text-rose-600" : "text-slate-400"}`}>
            ({counts[t.key]})
          </span>
        </button>
      ))}
    </div>
  );
}

/** Bộ lọc trạng thái duyệt dạng dọc (radio) đặt bên phải bảng. */
export function StatusSideTabs({
  value, onChange, counts,
}: {
  value: ApprovalStatus;
  onChange: (v: ApprovalStatus) => void;
  counts: Record<ApprovalStatus, number>;
}) {
  const tabs: { key: ApprovalStatus; label: string; color: string }[] = [
    { key: "pending", label: "Chờ duyệt", color: "text-amber-600" },
    { key: "approved", label: "Đã duyệt", color: "text-emerald-600" },
    { key: "rejected", label: "Đã từ chối", color: "text-rose-600" },
  ];
  return (
    <aside className="w-[220px] shrink-0 rounded-xl border bg-white p-3 h-fit">
      <div className="text-sm font-bold text-slate-800 mb-2">Lọc theo trạng thái</div>
      <div className="space-y-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm cursor-pointer transition text-left ${
              value === t.key ? "bg-indigo-50" : "hover:bg-slate-50"
            }`}
          >
            <span
              className={`h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center ${
                value === t.key ? "border-indigo-600" : "border-slate-300"
              }`}
            >
              {value === t.key && <span className="h-2 w-2 rounded-full bg-indigo-600" />}
            </span>
            <span className={`font-medium ${value === t.key ? "text-indigo-700" : t.color}`}>
              {t.label} ({counts[t.key]})
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}

/** Popup xác nhận gỡ bỏ khỏi kho chung. */
export function ConfirmRemoveModal({
  message, onClose, onConfirm,
}: { message: string; onClose: () => void; onConfirm: () => void }) {
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="text-rose-600">Xác nhận gỡ bỏ</DialogTitle></DialogHeader>
        <p className="text-sm text-slate-700">{message}</p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button className="bg-rose-600 hover:bg-rose-700" onClick={onConfirm}>Xác nhận</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Popup xem nội dung lý do từ chối do giáo viên nhập (có thể trống). */
export function ViewRejectReasonModal({
  reason, at, onClose,
}: { reason?: string; at?: string; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle className="text-rose-600">Lý do từ chối</DialogTitle></DialogHeader>
        {at && <div className="text-xs text-slate-500">Thời gian từ chối: <b className="text-slate-700">{at}</b></div>}
        <div className="rounded-lg border bg-slate-50 p-3 text-sm min-h-[90px] whitespace-pre-wrap">
          {reason?.trim()
            ? <span className="text-slate-800">{reason}</span>
            : <span className="italic text-slate-400">Người duyệt không nhập lý do từ chối.</span>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Chuỗi thời gian hiện tại dạng dd/MM/yyyy HH:mm. */
export function nowStamp() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
