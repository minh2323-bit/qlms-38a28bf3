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
