import { useState } from "react";
import { X, Check } from "lucide-react";

export type ShareState = {
  community: boolean;
  internal: boolean;
  hanoi: "none" | "pending" | "approved" | "rejected";
  sharedAt: { community?: number; internal?: number; hanoi?: number };
};

export const emptyShareState: ShareState = { community: false, internal: false, hanoi: "none", sharedAt: {} };

export function isShared(s: ShareState) {
  return s.community || s.internal || s.hanoi !== "none";
}

export function fmtShared(ts: number) {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())} ${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

const HANOI_LOGIN_URL = "https://study.hanoi.edu.vn";

export function ShareLessonModal({ title, initial, onClose, onSubmit, entityLabel = "bài giảng" }: {
  title: string;
  initial: ShareState;
  onClose: () => void;
  onSubmit: (next: { community: boolean; internal: boolean; hanoi: "none" | "pending" | "approved" }) => void;
  entityLabel?: string;
}) {
  const [community, setCommunity] = useState(initial.community);
  const [internal, setInternal] = useState(initial.internal);
  const [hanoi, setHanoi] = useState(initial.hanoi !== "none");
  const canSubmit = community || internal || hanoi;
  return (
    <div className="fixed inset-0 z-[90] bg-slate-900/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold text-sky-700 uppercase">Chia sẻ {entityLabel}</h2>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-slate-100 text-slate-500"><X className="h-5 w-5" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm font-semibold text-slate-700">Thao tác này sẽ thực hiện các công việc sau:</p>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={community} onChange={(e) => setCommunity(e.target.checked)} className="mt-1 h-4 w-4 accent-sky-600" />
            <div>
              <div className="text-sm font-bold text-slate-800">Chia sẻ cộng đồng:</div>
              <ul className="mt-1 text-sm text-slate-600 list-disc pl-5 space-y-1">
                <li>Chia sẻ {entityLabel} lên trang <span className="text-sky-600 font-semibold">Hệ thống học và thi trực tuyến</span></li>
                <li>Toàn bộ người dùng sẽ thấy và xem được mà không cần đăng nhập</li>
                <li>Các đơn vị trường có thể sao chép về sử dụng tại nội bộ</li>
              </ul>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} className="mt-1 h-4 w-4 accent-sky-600" />
            <div>
              <div className="text-sm font-bold text-slate-800">Chia sẻ nội bộ:</div>
              <ul className="mt-1 text-sm text-slate-600 list-disc pl-5 space-y-1">
                <li>{entityLabel[0].toUpperCase() + entityLabel.slice(1)} được chia sẻ và có thể sao chép về sử dụng tại nội bộ đơn vị</li>
              </ul>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={hanoi} onChange={(e) => setHanoi(e.target.checked)} className="mt-1 h-4 w-4 accent-sky-600" />
            <div>
              <div className="text-sm font-bold text-slate-800">Chia sẻ lên HanoiStudy:</div>
              <ul className="mt-1 text-sm text-slate-600 list-disc pl-5 space-y-1">
                <li>Sẽ được chia sẻ lên hệ thống <a href={HANOI_LOGIN_URL} target="_blank" rel="noreferrer" className="font-bold text-sky-600 hover:underline">Hanoi Study</a> của Sở GD &amp; ĐT Thành phố Hà Nội</li>
                <li>Chờ Sở duyệt trước khi hiển thị cho các trường</li>
              </ul>
            </div>
          </label>
          <p className="text-xs italic text-slate-500 truncate" title={title}>{entityLabel[0].toUpperCase() + entityLabel.slice(1)}: {title}</p>
        </div>
        <div className="px-6 py-4 border-t bg-slate-50 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 text-sm font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100">Đóng</button>
          <button
            disabled={!canSubmit}
            onClick={() => onSubmit({ community, internal, hanoi: hanoi ? "pending" : "none" })}
            className={`px-5 py-2 text-sm font-semibold rounded-lg ${canSubmit ? "bg-sky-600 text-white hover:bg-sky-700" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
          >
            Chia sẻ
          </button>
        </div>
      </div>
    </div>
  );
}

export function ShareStatusModal({ title, state, onShareOne, onClose, entityLabel = "bài giảng" }: {
  title: string;
  state: ShareState;
  onShareOne: (key: "community" | "internal" | "hanoi") => void;
  onClose: () => void;
  entityLabel?: string;
}) {
  type Row = { key: "community" | "internal" | "hanoi"; label: string; enabled: boolean; status: string; tone: string; action?: { label: string; className: string } };
  const rows: Row[] = [
    { key: "community", label: "Chia sẻ cộng đồng", enabled: state.community,
      status: state.community ? "Đã chia sẻ thành công" : "Chưa chia sẻ",
      tone: state.community ? "text-emerald-600" : "text-slate-400",
      action: state.community ? undefined : { label: "Chia sẻ ngay", className: "bg-sky-600 hover:bg-sky-700 text-white" } },
    { key: "internal", label: "Chia sẻ nội bộ", enabled: state.internal,
      status: state.internal ? "Đã chia sẻ thành công" : "Chưa chia sẻ",
      tone: state.internal ? "text-emerald-600" : "text-slate-400",
      action: state.internal ? undefined : { label: "Chia sẻ ngay", className: "bg-sky-600 hover:bg-sky-700 text-white" } },
    { key: "hanoi", label: "Chia sẻ lên HanoiStudy",
      enabled: state.hanoi === "approved" || state.hanoi === "pending",
      status: state.hanoi === "approved" ? "Đã chia sẻ thành công" : state.hanoi === "pending" ? "Chờ sở duyệt" : state.hanoi === "rejected" ? "Sở từ chối duyệt" : "Chưa chia sẻ",
      tone: state.hanoi === "approved" ? "text-emerald-600" : state.hanoi === "pending" ? "text-amber-600" : state.hanoi === "rejected" ? "text-rose-600" : "text-slate-400",
      action: state.hanoi === "none" ? { label: "Chia sẻ ngay", className: "bg-sky-600 hover:bg-sky-700 text-white" } : state.hanoi === "rejected" ? { label: "Chia sẻ lại", className: "bg-rose-600 hover:bg-rose-700 text-white" } : undefined },
  ];
  return (
    <div className="fixed inset-0 z-[90] bg-slate-900/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold text-sky-700 uppercase">Trạng thái chia sẻ</h2>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-slate-100 text-slate-500"><X className="h-5 w-5" /></button>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-slate-500 mb-4 truncate" title={title}>{entityLabel[0].toUpperCase() + entityLabel.slice(1)}: <span className="font-semibold text-slate-700">{title}</span></p>
          <ul className="space-y-3">
            {rows.map((r) => (
              <li key={r.label} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className={`h-6 w-6 rounded-md border flex items-center justify-center ${r.enabled ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-300 text-transparent"}`}>
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                  <span className="text-sm font-semibold text-slate-800">{r.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className={`text-sm font-semibold ${r.tone}`}>{r.status}</span>
                    {r.status === "Đã chia sẻ thành công" && state.sharedAt[r.key] && (
                      <span className="text-[11px] italic text-slate-400 mt-0.5">Chia sẻ lúc {fmtShared(state.sharedAt[r.key]!)}</span>
                    )}
                  </div>
                  {r.action && (
                    <button onClick={() => onShareOne(r.key)} className={`px-3 py-1.5 text-xs font-semibold rounded-md ${r.action.className}`}>{r.action.label}</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="px-6 py-4 border-t bg-slate-50 flex items-center justify-end">
          <button onClick={onClose} className="px-5 py-2 text-sm font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-700">Đóng</button>
        </div>
      </div>
    </div>
  );
}
