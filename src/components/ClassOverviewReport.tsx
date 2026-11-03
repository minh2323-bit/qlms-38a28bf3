import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SortTh, useSort, totalCell, tableScrollWrap, stickyHeadRow } from "@/components/ReportFilters";

export type ClassTeacher = { name: string; subject: string };

export type ClassOverviewRow = {
  id: string;
  name: string;
  teachers: ClassTeacher[];
  baiGiang: number;
  hocLieu: number;
  baiTap: number;
  nopBaiTap: number;
  baiKiemTra: number;
  nopBaiKiemTra: number;
};

const COLS: { key: keyof Omit<ClassOverviewRow, "id" | "name" | "teachers">; label: string }[] = [
  { key: "baiGiang", label: "Bài giảng đã giao" },
  { key: "hocLieu", label: "Học liệu đã giao" },
  { key: "baiTap", label: "Bài tập đã giao" },
  { key: "nopBaiTap", label: "Số lượt nộp bài tập" },
  { key: "baiKiemTra", label: "Bài kiểm tra đã giao" },
  { key: "nopBaiKiemTra", label: "Số lượt nộp bài kiểm tra" },
];

export function ClassOverviewTable({
  rows,
  showTeachers = false,
}: {
  rows: ClassOverviewRow[];
  showTeachers?: boolean;
}) {
  const [popup, setPopup] = useState<ClassOverviewRow | null>(null);

  const { sorted, sort, toggle } = useSort(rows, {
    baiGiang: (r) => r.baiGiang,
    hocLieu: (r) => r.hocLieu,
    baiTap: (r) => r.baiTap,
    nopBaiTap: (r) => r.nopBaiTap,
    baiKiemTra: (r) => r.baiKiemTra,
    nopBaiKiemTra: (r) => r.nopBaiKiemTra,
  });

  const totals = useMemo(() => {
    const sum = (f: (r: ClassOverviewRow) => number) => sorted.reduce((s, r) => s + f(r), 0);
    return {
      baiGiang: sum((r) => r.baiGiang), hocLieu: sum((r) => r.hocLieu),
      baiTap: sum((r) => r.baiTap), nopBaiTap: sum((r) => r.nopBaiTap),
      baiKiemTra: sum((r) => r.baiKiemTra), nopBaiKiemTra: sum((r) => r.nopBaiKiemTra),
    };
  }, [sorted]);

  const colSpan = showTeachers ? 3 : 2;

  return (
    <>
      <div className={tableScrollWrap}>
        <table className="w-full text-sm">
          <thead>
            <tr className={`text-slate-500 ${stickyHeadRow}`}>
              <th className="text-center font-semibold py-2.5 px-3 w-14">STT</th>
              <th className="text-left font-semibold py-2.5 px-3">Tên lớp</th>
              {showTeachers && <th className="text-left font-semibold py-2.5 px-3">Giáo viên dạy học</th>}
              {COLS.map((c) => (
                <SortTh key={c.key} label={c.label} sortKey={c.key} sort={sort} toggle={toggle} />
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="text-center py-2.5 px-3 font-semibold text-slate-700">{i + 1}</td>
                <td className="py-2.5 px-3 font-semibold text-slate-800">{r.name}</td>
                {showTeachers && (
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => setPopup(r)}
                      className="font-semibold text-sky-600 underline decoration-sky-300 underline-offset-2 hover:text-sky-800"
                    >
                      {r.teachers.length}
                    </button>
                  </td>
                )}
                {COLS.map((c) => (
                  <td key={c.key} className="text-center py-2.5 px-3">
                    <span className="text-slate-700">{r[c.key]}</span>
                  </td>
                ))}
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr><td colSpan={colSpan + COLS.length} className="text-center text-slate-400 py-8">Không có lớp học nào.</td></tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td className={`${totalCell} text-center`} colSpan={colSpan}>Tổng số ({sorted.length} lớp)</td>
              {COLS.map((c) => (
                <td key={c.key} className={`${totalCell} text-center`}>{totals[c.key]}</td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      <Dialog open={!!popup} onOpenChange={(o) => !o && setPopup(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">
              Giáo viên dạy học – {popup?.name}
            </DialogTitle>
          </DialogHeader>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 bg-slate-50">
                <th className="text-center font-semibold py-2 px-3 w-14">STT</th>
                <th className="text-left font-semibold py-2 px-3">Tên giáo viên</th>
                <th className="text-left font-semibold py-2 px-3">Môn dạy học</th>
              </tr>
            </thead>
            <tbody>
              {popup?.teachers.map((t, i) => (
                <tr key={t.name} className="border-b last:border-0">
                  <td className="text-center py-2 px-3 font-semibold text-slate-700">{i + 1}</td>
                  <td className="py-2 px-3 font-semibold text-slate-800">{t.name}</td>
                  <td className="py-2 px-3 text-slate-600">{t.subject}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DialogContent>
      </Dialog>
    </>
  );
}
