import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WEEKS, getCurrentWeekIdx } from "@/lib/school-weeks";

/** Môn học + GV dạy theo phân công chuyên môn (PCCM) */
type Slot = { subject: string; teacher: string };

const PCCM: Record<string, string> = {
  "Toán": "Phùng Thúy Hằng",
  "Tiếng Việt": "Nguyễn Thu Trang",
  "Tiếng Anh": "Lê Minh Đức",
  "Khoa học": "Lê Thị Mai",
  "Lịch sử & Địa lí": "Đỗ Văn Nam",
  "Đạo đức": "Bùi Thị Hạnh",
  "Tin học": "Phạm Quốc Anh",
  "Công nghệ": "Phạm Quốc Anh",
  "Âm nhạc": "Vũ Bích Ngọc",
  "Mĩ thuật": "Trần Thanh Thảo",
  "Giáo dục thể chất": "Hoàng Văn Sơn",
  "HĐ trải nghiệm": "Đỗ Thanh Huyền",
};

const SUBJECTS = Object.keys(PCCM);

const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];

const MORNING = [1, 2, 3, 4, 5];
const AFTERNOON = [6, 7, 8];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function buildTimetable(classId: string): Record<string, Slot | null> {
  const map: Record<string, Slot | null> = {};
  for (let d = 0; d < 7; d++) {
    for (const p of [...MORNING, ...AFTERNOON]) {
      const key = `${d}-${p}`;
      if (d === 6) { map[key] = null; continue; } // Chủ nhật nghỉ
      if (d === 5 && p > 4) { map[key] = null; continue; } // Thứ 7 chỉ học sáng
      const h = hash(`${classId}|${d}|${p}`);
      // Ưu tiên Toán / Tiếng Việt buổi sáng
      const pool = p <= 2 ? ["Toán", "Tiếng Việt", "Tiếng Anh"] : SUBJECTS;
      map[key] = { subject: pool[h % pool.length], teacher: "" };
      map[key]!.teacher = PCCM[map[key]!.subject];
    }
  }
  return map;
}

export function TimetableView({
  className,
  classId,
  subtitle,
  filter,
}: {
  className: string;
  classId: string;
  subtitle?: string;
  filter?: React.ReactNode;
}) {
  const [weekIdx, setWeekIdx] = useState(() => getCurrentWeekIdx());
  const week = WEEKS.find((w) => w.idx === weekIdx) ?? WEEKS[0];
  const table = useMemo(() => buildTimetable(classId), [classId]);

  const dayDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(week.start);
    d.setDate(d.getDate() + i);
    return d;
  });

  const renderRow = (p: number, label: string) => (
    <tr key={p} className="border-t">
      <td className="w-28 px-3 py-2 text-[12px] font-semibold text-slate-500 bg-slate-50/70 align-middle">
        {label}
      </td>
      {dayDates.map((_, d) => {
        const slot = table[`${d}-${p}`];
        return (
          <td key={d} className="border-l px-2 py-2 align-top">
            {slot ? (
              <div className="rounded-lg bg-indigo-50/70 border border-indigo-100 px-2 py-1.5">
                <p className="text-[13px] font-semibold text-indigo-800 leading-tight">{slot.subject}</p>
                <p className="text-[12px] text-slate-600 leading-tight mt-0.5">{slot.teacher}</p>
              </div>
            ) : (
              <div className="h-9" />
            )}
          </td>
        );
      })}
    </tr>
  );

  return (
    <section className="bg-white rounded-2xl border shadow-sm">
      <div className="px-5 py-4 border-b flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Thời khóa biểu {className}</h1>
          {subtitle && <p className="text-[12px] text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {filter}
      </div>

      <div className="px-5 py-3 flex items-center gap-3">
        <button
          onClick={() => setWeekIdx((w) => Math.max(1, w - 1))}
          className="p-1.5 rounded-full hover:bg-slate-100 text-indigo-600"
          aria-label="Tuần trước"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="text-[15px] font-bold text-slate-800">
          {week.label} · {week.range}
        </p>
        <button
          onClick={() => setWeekIdx((w) => Math.min(WEEKS.length, w + 1))}
          className="p-1.5 rounded-full hover:bg-slate-100 text-indigo-600"
          aria-label="Tuần sau"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-t">
          <thead>
            <tr className="bg-slate-50">
              <th className="w-28 px-3 py-2 text-[12px] text-slate-500" />
              {dayDates.map((d, i) => (
                <th key={i} className="border-l px-2 py-2 text-center">
                  <p className={`text-[15px] font-bold ${i === 6 ? "text-indigo-600" : "text-slate-800"}`}>
                    {d.getDate()}
                  </p>
                  <p className="text-[12px] text-slate-500">{DAYS[i]}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="bg-amber-50/60">
              <td colSpan={8} className="px-3 py-1.5 text-[12px] font-semibold text-amber-700">Buổi sáng</td>
            </tr>
            {MORNING.map((p) => renderRow(p, `Tiết ${p}`))}
            <tr className="bg-sky-50/60">
              <td colSpan={8} className="px-3 py-1.5 text-[12px] font-semibold text-sky-700">Buổi chiều</td>
            </tr>
            {AFTERNOON.map((p) => renderRow(p, `Tiết ${p}`))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
