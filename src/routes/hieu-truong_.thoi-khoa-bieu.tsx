import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TimetableView } from "@/components/TimetableView";
import { School } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/hieu-truong_/thoi-khoa-bieu")({
  head: () => ({
    meta: [
      { title: "Thời khóa biểu trường | QLMS" },
      { name: "description", content: "Hiệu trưởng xem thời khóa biểu của từng lớp trong trường theo tuần học." },
      { property: "og:title", content: "Thời khóa biểu trường" },
      { property: "og:description", content: "Chọn lớp để xem thời khóa biểu tuần của toàn trường." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SchoolTimetable,
});

const CLASSES = [
  "1A", "1B", "2A", "2B", "3A", "3B", "3C", "3D",
  "4A", "4B", "4C", "5A", "5B", "5C",
];

function SchoolTimetable() {
  const [cls, setCls] = useState("4A");
  return (
    <AppShell role="principal">
      <TimetableView
        key={cls}
        className={`Lớp ${cls}`}
        classId={cls}
        subtitle="Năm học 2025 - 2026 · Tiểu học Tô Hiệu"
        filter={
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-slate-500 flex items-center gap-1">
              <School className="h-3.5 w-3.5" /> Lớp:
            </span>
            <Select value={cls} onValueChange={setCls}>
              <SelectTrigger className="h-9 w-44 text-[13px] bg-white">
                <SelectValue placeholder="Chọn lớp" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {CLASSES.map((c) => (
                  <SelectItem key={c} value={c}>Lớp {c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />
    </AppShell>
  );
}
