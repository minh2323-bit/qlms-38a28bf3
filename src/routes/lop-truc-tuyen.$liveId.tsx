import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  getLiveClassById, getAttendees, formatDate, formatTimeRange, useLiveClasses,
} from "@/lib/live-class-store";
import { ArrowLeft, FileSpreadsheet, Database, Search, Users, Video } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/lop-truc-tuyen/$liveId")({
  head: () => ({ meta: [{ title: "Chi tiết lớp học trực tuyến" }] }),
  loader: ({ params }) => {
    const lc = getLiveClassById(params.liveId);
    if (!lc) throw notFound();
    return { liveId: params.liveId };
  },
  notFoundComponent: () => (
    <AppShell role="teacher">
      <div className="bg-white rounded-2xl border p-8 text-center text-slate-500">
        Không tìm thấy lớp học.
      </div>
    </AppShell>
  ),
  component: Page,
});

function Page() {
  const { liveId } = Route.useLoaderData();
  // Subscribe to updates
  useLiveClasses();
  const lc = getLiveClassById(liveId);
  const [qName, setQName] = useState("");
  const [qLop, setQLop] = useState("");

  const attendees = useMemo(() => (lc ? getAttendees(lc) : []), [lc]);
  const total = 40;
  const filtered = attendees.filter((a) =>
    a.name.toLowerCase().includes(qName.toLowerCase())
    && (qLop === "" || (lc?.classRealId ?? "").toLowerCase().includes(qLop.toLowerCase()))
  );

  if (!lc) return null;

  return (
    <AppShell role="teacher">
      <div className="mb-3">
        <Link to="/lop-truc-tuyen"
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-700">
          <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
        </Link>
      </div>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
        <div className="flex items-start gap-3 mb-4">
          <span className="h-10 w-10 rounded-lg bg-indigo-600 text-white inline-flex items-center justify-center shrink-0">
            <Video className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-800 truncate">{lc.name}</h1>
            <p className="text-xs text-slate-500">Chi tiết lớp học trực tuyến</p>
          </div>
        </div>

        {/* Info header */}
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-3 mb-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-1 text-sm">
            <div><span className="font-semibold text-slate-700">Tên lớp:</span> {lc.name}</div>
            <div><span className="font-semibold text-slate-700">Giáo viên:</span> Phùng Thúy Hằng</div>
            <div><span className="font-semibold text-slate-700">Thời gian:</span> {formatTimeRange(lc.startAt, lc.endAt)} ({formatDate(lc.startAt)})</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-1 text-sm">
            <div className="flex items-center gap-1.5"><Users className="h-4 w-4 text-slate-500" /><span className="font-semibold text-slate-700">Tổng danh sách học sinh:</span> {total}</div>
            <div className="flex items-center gap-1.5"><Users className="h-4 w-4 text-emerald-600" /><span className="font-semibold text-slate-700">Tổng số tham gia:</span> {attendees.length}</div>
          </div>
          <div className="flex md:flex-col gap-2">
            <button onClick={() => toast.success("Đã xuất Excel danh sách tham dự")}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
              <FileSpreadsheet className="h-4 w-4" /> Xuất Excel
            </button>
            <button onClick={() => toast.success("Đã đồng bộ sang CSDL")}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
              <Database className="h-4 w-4" /> Đồng bộ sang CSDL
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={qName} onChange={(e) => setQName(e.target.value)} placeholder="Tên học sinh"
              className="w-full h-9 pl-8 pr-3 text-sm rounded-md border border-slate-200 bg-white" />
          </div>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={qLop} onChange={(e) => setQLop(e.target.value)} placeholder="Lớp"
              className="w-full h-9 pl-8 pr-3 text-sm rounded-md border border-slate-200 bg-white" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr className="text-left">
                <th className="px-3 py-2.5 w-12 font-semibold">STT</th>
                <th className="px-3 py-2.5 w-32 font-semibold">Mã học sinh</th>
                <th className="px-3 py-2.5 font-semibold">Họ và tên</th>
                <th className="px-3 py-2.5 w-24 font-semibold">Lớp</th>
                <th className="px-3 py-2.5 w-32 font-semibold">Thời gian vào</th>
                <th className="px-3 py-2.5 w-32 font-semibold">Thời gian ra</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.map((a, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-3 py-2 text-slate-500">{String(i + 1).padStart(2, "0")}</td>
                  <td className="px-3 py-2 font-mono text-slate-700">HS{String(1000 + i + 1)}</td>
                  <td className="px-3 py-2 font-medium text-slate-800">{a.name}</td>
                  <td className="px-3 py-2 text-slate-700">{lc.classRealId}</td>
                  <td className="px-3 py-2 font-mono text-slate-700">{a.joinAt}</td>
                  <td className="px-3 py-2 font-mono text-slate-700">{a.leaveAt}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-8 text-center text-sm text-slate-400 italic">Không có kết quả.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
