import { useMemo } from "react";
import { X, Users, BarChart3 } from "lucide-react";
import { getAttendees, formatTimeRange, formatDate, type LiveClass } from "@/lib/live-class-store";

export function LiveClassStatsModal({
  live, onClose,
}: { live: LiveClass; onClose: () => void }) {
  const attendees = useMemo(() => getAttendees(live), [live]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b bg-gradient-to-r from-slate-50 to-indigo-50 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <span className="h-9 w-9 rounded-lg inline-flex items-center justify-center bg-indigo-600 text-white shrink-0">
              <BarChart3 className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-800 truncate">
                Thống kê tham dự
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 truncate">
                {live.name} · {formatDate(live.startAt)} · {formatTimeRange(live.startAt, live.endAt)}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/60 text-slate-500 shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-3 flex items-center gap-2 text-sm text-slate-600 border-b bg-white">
          <Users className="h-4 w-4 text-slate-400" />
          Tổng số học sinh tham dự:&nbsp;
          <span className="font-bold text-slate-800">{attendees.length}</span>
        </div>

        <div className="overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 sticky top-0">
              <tr>
                <th className="px-4 py-2.5 text-left font-semibold w-12">STT</th>
                <th className="px-4 py-2.5 text-left font-semibold">Tên học sinh</th>
                <th className="px-4 py-2.5 text-left font-semibold w-32">Thời gian vào</th>
                <th className="px-4 py-2.5 text-left font-semibold w-32">Thời gian ra</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendees.map((a, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-2 text-slate-500">{String(idx + 1).padStart(2, "0")}</td>
                  <td className="px-4 py-2 text-slate-800 font-medium">{a.name}</td>
                  <td className="px-4 py-2 text-slate-700 font-mono">{a.joinAt}</td>
                  <td className="px-4 py-2 text-slate-700 font-mono">{a.leaveAt}</td>
                </tr>
              ))}
              {attendees.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-400 italic">
                    Không có học sinh tham dự.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
