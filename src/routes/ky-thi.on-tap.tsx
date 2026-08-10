import { createFileRoute } from "@tanstack/react-router";
import { BookOpenCheck } from "lucide-react";
import { ExamSessionsPage, type ExamSession } from "@/components/ExamSessionsPage";

export const Route = createFileRoute("/ky-thi/on-tap")({
  head: () => ({
    meta: [
      { title: "Kỳ thi ôn tập | Tiểu học Tô Hiệu" },
      { name: "description", content: "Danh sách kỳ thi ôn tập cấp Trường, Xã/Phường và Sở kèm thống kê kết quả luyện tập." },
      { property: "og:title", content: "Kỳ thi ôn tập" },
      { property: "og:description", content: "Danh sách kỳ thi ôn tập cấp Trường, Xã/Phường và Sở kèm thống kê kết quả luyện tập." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const DATA: ExamSession[] = [
  { id: "o1", name: "Đề ôn cuối kỳ – Trường Tô Hiệu (Toán)", level: "truong", grade: "4", subject: "Toán", date: "02/05/2026", minutes: 45, students: 120, submitted: 104, status: "ongoing", avgScore: 7.2, dist: [12, 26, 40, 26] },
  { id: "o2", name: "Đề ôn cuối kỳ – Trường Tô Hiệu (Tiếng Việt)", level: "truong", grade: "4", subject: "Tiếng Việt", date: "28/04/2026", minutes: 40, students: 120, submitted: 112, status: "done", avgScore: 7.6, dist: [9, 22, 45, 36] },
  { id: "o3", name: "Đề ôn giữa kỳ – Trường Tô Hiệu (Toán 3)", level: "truong", grade: "3", subject: "Toán", date: "18/02/2026", minutes: 35, students: 96, submitted: 88, status: "done", avgScore: 7.0, dist: [12, 24, 32, 20] },
  { id: "o4", name: "Đề ôn cấp Xã – Toán", level: "xa", grade: "4", subject: "Toán", date: "08/05/2026", minutes: 45, students: 64, submitted: 51, status: "ongoing", avgScore: 6.9, dist: [9, 15, 17, 10] },
  { id: "o5", name: "Đề ôn cấp Xã – Tiếng Anh", level: "xa", grade: "5", subject: "Tiếng Anh", date: "10/04/2026", minutes: 40, students: 58, submitted: 55, status: "done", avgScore: 7.5, dist: [5, 13, 22, 15] },
  { id: "o6", name: "Đề ôn cấp Sở số 1 – Toán", level: "so", grade: "5", subject: "Toán", date: "12/05/2026", minutes: 60, students: 150, submitted: 131, status: "ongoing", avgScore: 7.3, dist: [15, 30, 50, 36] },
  { id: "o7", name: "Đề ôn cấp Sở – Tiếng Việt", level: "so", grade: "5", subject: "Tiếng Việt", date: "20/02/2026", minutes: 60, students: 150, submitted: 142, status: "done", avgScore: 7.7, dist: [11, 28, 56, 47] },
];

function Page() {
  return (
    <ExamSessionsPage
      title="Kỳ thi ôn tập"
      subtitle="Danh sách các kỳ thi ôn tập theo cấp Trường, Xã/Phường và Sở GD&ĐT kèm thống kê kết quả luyện tập."
      icon={BookOpenCheck}
      data={DATA}
    />
  );
}
