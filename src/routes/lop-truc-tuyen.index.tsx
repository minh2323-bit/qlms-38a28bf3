import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  useLiveClasses,
  updateLiveClass,
  formatTimeRange,
  formatDate,
  type LiveClass,
} from "@/lib/live-class-store";
import {
  Video, Pencil, Link2, PlayCircle, BarChart3, Search, Filter,
  Trash2, FileSpreadsheet,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/lop-truc-tuyen/")({
  head: () => ({ meta: [{ title: "Lớp học trực tuyến" }] }),
  component: Page,
});

type Status = "sap-dien-ra" | "dang-dien-ra" | "da-ket-thuc";

function getStatus(lc: LiveClass): Status {
  const now = Date.now();
  const s = new Date(lc.startAt).getTime();
  const e = new Date(lc.endAt).getTime();
  if (now < s) return "sap-dien-ra";
  if (now > e) return "da-ket-thuc";
  return "dang-dien-ra";
}

const CREATOR_POOL = ["Phùng Thúy Hằng", "Nguyễn Văn A", "Trần Bảo Ngọc", "Lê Minh Tâm"];
function creatorOf(lc: LiveClass) {
  let s = 0;
  for (const c of lc.id) s = (s * 31 + c.charCodeAt(0)) >>> 0;
  return CREATOR_POOL[s % CREATOR_POOL.length];
}

function fmtDT(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())} · ${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function Page() {
  const lives = useLiveClasses();
  const navigate = useNavigate();

  const [khoi, setKhoi] = useState("all");
  const [lop, setLop] = useState("all");
  const [mon, setMon] = useState("all");
  const [ngay, setNgay] = useState("");
  const [status, setStatus] = useState<Status | "all">("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Two-stage link modal: view first, then edit.
  const [linkView, setLinkView] = useState<LiveClass | null>(null);
  const [linkEdit, setLinkEdit] = useState<LiveClass | null>(null);
  const [linkDraft, setLinkDraft] = useState("");

  const filtered = useMemo(() => {
    return lives.filter((l) => {
      if (lop !== "all" && l.classRealId !== lop) return false;
      if (khoi !== "all" && !l.classRealId.startsWith(khoi)) return false;
      if (mon !== "all" && l.subject !== mon) return false;
      if (ngay && !l.startAt.startsWith(ngay)) return false;
      if (status !== "all" && getStatus(l) !== status) return false;
      if (q && !l.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [lives, khoi, lop, mon, ngay, status, q]);

  const lopOptions = Array.from(new Set(lives.map((l) => l.classRealId))).sort();
  const monOptions = Array.from(new Set(lives.map((l) => l.subject))).sort();
  const khoiOptions = Array.from(new Set(lives.map((l) => l.classRealId[0]))).sort();

  const allChecked = filtered.length > 0 && filtered.every((l) => selected.has(l.id));
  const toggleAll = () => {
    const next = new Set(selected);
    if (allChecked) filtered.forEach((l) => next.delete(l.id));
    else filtered.forEach((l) => next.add(l.id));
    setSelected(next);
  };
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const openLinkView = (lc: LiveClass) => setLinkView(lc);
  const openLinkEdit = (lc: LiveClass) => {
    setLinkView(null);
    setLinkEdit(lc);
    setLinkDraft(lc.link);
  };
  const confirmLink = () => {
    if (!linkEdit) return;
    updateLiveClass(linkEdit.id, { link: linkDraft });
    toast.success("Đã cập nhật link lớp học");
    setLinkEdit(null);
  };

  const onDelete = () => {
    if (selected.size === 0) {
      toast.error("Vui lòng chọn ít nhất một lớp học để xóa");
      return;
    }
    toast.success(`Đã xóa ${selected.size} lớp học`);
    setSelected(new Set());
  };
  const onExport = () => toast.success("Đã xuất Excel danh sách lớp học");

  return (
    <AppShell role="teacher">
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
        <header className="flex items-center gap-2 mb-4">
          <span className="h-9 w-9 rounded-lg bg-indigo-600 text-white inline-flex items-center justify-center">
            <Video className="h-4 w-4" />
          </span>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Lớp học trực tuyến</h1>
            <p className="text-xs text-slate-500">Quản lý các buổi học trực tuyến đã lên lịch</p>
          </div>
        </header>

        {/* Filters — 2 rows */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 mb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-2">
            <Filter className="h-3.5 w-3.5" /> Bộ lọc
          </div>

          {/* Row 1 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
            <Select label="Khối" value={khoi} onChange={setKhoi}
              options={[{ v: "all", t: "Tất cả" }, ...khoiOptions.map((k) => ({ v: k, t: `Khối ${k}` }))]} />
            <Select label="Lớp gán" value={lop} onChange={setLop}
              options={[{ v: "all", t: "Tất cả" }, ...lopOptions.map((k) => ({ v: k, t: `Lớp ${k}` }))]} />
            <Select label="Môn" value={mon} onChange={setMon}
              options={[{ v: "all", t: "Tất cả" }, ...monOptions.map((k) => ({ v: k, t: k }))]} />
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Ngày diễn ra</label>
              <input type="date" value={ngay} onChange={(e) => setNgay(e.target.value)}
                className="w-full h-8 px-2 text-sm rounded-md border border-slate-200 bg-white" />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 items-end">
            <Select label="Trạng thái" value={status} onChange={(v) => setStatus(v as Status | "all")}
              options={[
                { v: "all", t: "Tất cả" },
                { v: "sap-dien-ra", t: "Sắp diễn ra" },
                { v: "dang-dien-ra", t: "Đang diễn ra" },
                { v: "da-ket-thuc", t: "Đã kết thúc" },
              ]} />
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Tên lớp</label>
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm tên lớp..."
                  className="w-full h-8 pl-7 pr-2 text-sm rounded-md border border-slate-200 bg-white" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={onDelete}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-semibold border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100">
                <Trash2 className="h-3.5 w-3.5" /> Xóa
              </button>
              <button onClick={onExport}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-semibold border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                <FileSpreadsheet className="h-3.5 w-3.5" /> Xuất Excel
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr className="text-left">
                <th className="px-3 py-2.5 w-12 font-semibold">STT</th>
                <th className="px-3 py-2.5 w-10">
                  <Checkbox checked={allChecked} onCheckedChange={toggleAll} />
                </th>
                <th className="px-3 py-2.5 w-14 font-semibold">Sửa</th>
                <th className="px-3 py-2.5 font-semibold">Tên lớp học</th>
                <th className="px-3 py-2.5 w-40 font-semibold">Người tạo</th>
                <th className="px-3 py-2.5 w-56 font-semibold">Trạng thái</th>
                <th className="px-3 py-2.5 w-44 font-semibold">Thời gian bắt đầu</th>
                <th className="px-3 py-2.5 w-44 font-semibold">Thời gian kết thúc</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.map((lc, idx) => {
                const st = getStatus(lc);
                return (
                  <tr key={lc.id} className="hover:bg-slate-50 align-top">
                    <td className="px-3 py-3 text-slate-500">{String(idx + 1).padStart(2, "0")}</td>
                    <td className="px-3 py-3">
                      <Checkbox checked={selected.has(lc.id)} onCheckedChange={() => toggleOne(lc.id)} />
                    </td>
                    <td className="px-3 py-3">
                      <button className="p-1.5 rounded-md hover:bg-slate-100 text-emerald-600" title="Sửa">
                        <Pencil className="h-4 w-4" />
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        to="/lop-truc-tuyen/$liveId" params={{ liveId: lc.id }}
                        className="font-semibold text-slate-800 hover:text-indigo-700"
                      >
                        {lc.name}
                      </Link>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {lc.subject} · Lớp {lc.classRealId} · {formatDate(lc.startAt)} {formatTimeRange(lc.startAt, lc.endAt)}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-700">{creatorOf(lc)}</td>
                    <td className="px-3 py-3">
                      {st === "sap-dien-ra" && (
                        <div className="space-y-1.5">
                          <div className="text-sm font-semibold text-orange-600">Sắp diễn ra</div>
                          <button
                            onClick={() => openLinkView(lc)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
                          >
                            <Link2 className="h-3.5 w-3.5" /> Link lớp học
                          </button>
                        </div>
                      )}
                      {st === "dang-dien-ra" && (
                        <div className="space-y-1.5">
                          <div className="text-sm font-semibold text-emerald-600">Đang diễn ra</div>
                          <a href={lc.link} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            <PlayCircle className="h-3.5 w-3.5" /> Vào ngay
                          </a>
                        </div>
                      )}
                      {st === "da-ket-thuc" && (
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-rose-600">Đã kết thúc</div>
                          <button
                            onClick={() => navigate({ to: "/lop-truc-tuyen/$liveId", params: { liveId: lc.id } })}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                          >
                            <BarChart3 className="h-3.5 w-3.5" /> Xem thống kê
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-slate-700 font-mono text-xs">{fmtDT(lc.startAt)}</td>
                    <td className="px-3 py-3 text-slate-700 font-mono text-xs">
                      {st === "da-ket-thuc" ? fmtDT(lc.endAt) : <span className="text-slate-300">—</span>}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-sm text-slate-400 italic">
                    Không có lớp học phù hợp bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Link — view only */}
      <Dialog open={!!linkView} onOpenChange={(o) => !o && setLinkView(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Link lớp học
              {linkView && (
                <button
                  onClick={() => openLinkEdit(linkView)}
                  className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"
                  title="Sửa link"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
            </DialogTitle>
            <DialogDescription>
              Đường dẫn phòng học trực tuyến cho lớp <b>{linkView?.name}</b>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600">Đường link</label>
            <div className="w-full min-h-10 px-3 py-2 text-sm rounded-md border border-slate-200 bg-slate-50 text-slate-700 break-all">
              {linkView?.link}
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setLinkView(null)}
              className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100">
              Đóng
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link — edit */}
      <Dialog open={!!linkEdit} onOpenChange={(o) => !o && setLinkEdit(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Link lớp học</DialogTitle>
            <DialogDescription>
              Cập nhật đường dẫn phòng học trực tuyến cho lớp <b>{linkEdit?.name}</b>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600">Đường link</label>
            <input value={linkDraft} onChange={(e) => setLinkDraft(e.target.value)}
              placeholder="https://meet.google.com/..."
              className="w-full h-10 px-3 text-sm rounded-md border border-slate-200 bg-white" />
          </div>
          <DialogFooter>
            <button onClick={() => setLinkEdit(null)}
              className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100">
              Hủy
            </button>
            <button onClick={confirmLink}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
              Xác nhận
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { v: string; t: string }[];
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-slate-500 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full h-8 px-2 text-sm rounded-md border border-slate-200 bg-white">
        {options.map((o) => <option key={o.v} value={o.v}>{o.t}</option>)}
      </select>
    </div>
  );
}
