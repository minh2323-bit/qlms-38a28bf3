import { createFileRoute } from "@tanstack/react-router";
import { Landmark } from "lucide-react";
import { ExamSessionsPage, type ExamSession } from "@/components/ExamSessionsPage";

export const Route = createFileRoute("/ky-thi/chinh-thuc")({
  head: () => ({
    meta: [
      { title: "Kỳ thi chính thức | Tiểu học Tô Hiệu" },
      { name: "description", content: "Danh sách kỳ thi chính thức cấp Trường, Xã/Phường và Sở kèm thống kê kết quả." },
      { property: "og:title", content: "Kỳ thi chính thức" },
      { property: "og:description", content: "Danh sách kỳ thi chính thức cấp Trường, Xã/Phường và Sở kèm thống kê kết quả." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const DATA: ExamSession[] = [
  { id: "c1", name: "Kiểm tra cuối kỳ II – Trường Tô Hiệu", level: "truong", grade: "4", subject: "Toán", date: "10/05/2026", minutes: 45, students: 120, submitted: 118, status: "upcoming", avgScore: 7.8, dist: [8, 24, 46, 40] },
  { id: "c2", name: "Kiểm tra giữa kỳ II – Trường Tô Hiệu", level: "truong", grade: "4", subject: "Tiếng Việt", date: "05/03/2026", minutes: 40, students: 120, submitted: 120, status: "done", avgScore: 8.2, dist: [4, 18, 44, 54] },
  { id: "c3", name: "Kiểm tra cuối kỳ I – Trường Tô Hiệu", level: "truong", grade: "3", subject: "Toán", date: "22/12/2025", minutes: 40, students: 96, submitted: 95, status: "done", avgScore: 7.4, dist: [9, 22, 38, 26] },
  { id: "c4", name: "Kỳ thi cấp Xã – Môn Toán", level: "xa", grade: "4", subject: "Toán", date: "15/05/2026", minutes: 60, students: 64, submitted: 0, status: "upcoming", avgScore: 0, dist: [0, 0, 0, 0] },
  { id: "c5", name: "Kỳ thi cấp Xã – Môn Tiếng Việt", level: "xa", grade: "5", subject: "Tiếng Việt", date: "18/04/2026", minutes: 60, students: 58, submitted: 57, status: "done", avgScore: 7.1, dist: [7, 16, 20, 14] },
  { id: "c6", name: "Khảo sát chất lượng cuối kỳ – Sở GD&ĐT", level: "so", grade: "5", subject: "Toán", date: "20/05/2026", minutes: 60, students: 150, submitted: 0, status: "ongoing", avgScore: 0, dist: [0, 0, 0, 0] },
  { id: "c7", name: "Khảo sát chất lượng giữa kỳ – Sở GD&ĐT", level: "so", grade: "5", subject: "Tiếng Việt", date: "12/03/2026", minutes: 60, students: 150, submitted: 147, status: "done", avgScore: 7.9, dist: [10, 27, 55, 55] },
];

function Page() {
  return (
    <ExamSessionsPage
      title="Kỳ thi chính thức"
      subtitle="Danh sách các kỳ thi chính thức được tổ chức theo cấp Trường, Xã/Phường và Sở GD&ĐT."
      icon={Landmark}
      data={DATA}
    />
  );
}
