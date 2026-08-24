import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TimetableView } from "@/components/TimetableView";

export const Route = createFileRoute("/thoi-khoa-bieu")({
  head: () => ({
    meta: [
      { title: "Thời khóa biểu lớp chủ nhiệm | QLMS" },
      { name: "description", content: "Thời khóa biểu tuần của lớp chủ nhiệm với môn học và giáo viên dạy theo phân công chuyên môn." },
      { property: "og:title", content: "Thời khóa biểu lớp chủ nhiệm" },
      { property: "og:description", content: "Xem thời khóa biểu tuần của lớp chủ nhiệm theo từng tiết học." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HomeroomTimetable,
});

function HomeroomTimetable() {
  return (
    <AppShell role="homeroom">
      <TimetableView
        className="Lớp 4A"
        classId="4A"
        subtitle="Lớp chủ nhiệm · Năm học 2025 - 2026 · Tiểu học Tô Hiệu"
      />
    </AppShell>
  );
}
