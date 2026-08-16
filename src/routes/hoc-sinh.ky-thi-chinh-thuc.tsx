import { createFileRoute } from "@tanstack/react-router";
import { StudentExamsPage, type StudentExam } from "@/components/StudentExamsPage";

export const Route = createFileRoute("/hoc-sinh/ky-thi-chinh-thuc")({
  head: () => ({
    meta: [
      { title: "Kỳ thi chính thức – Học sinh" },
      { name: "description", content: "Danh sách kỳ thi chính thức: chưa diễn ra, đang diễn ra và đã kết thúc." },
      { property: "og:title", content: "Kỳ thi chính thức – Học sinh" },
      { property: "og:description", content: "Theo dõi ca thi, thời gian làm bài và kết quả các kỳ thi chính thức." },
    ],
  }),
  component: Page,
});

// Kỳ thi chính thức có ca thi -> hiển thị giờ theo ca thi
const EXAMS: StudentExam[] = [
  { id: "e1", name: "Đề kiểm tra giữa học kỳ I", subject: "Toán", shift: "Ca 1", time: "18:00", date: "12/12/2025", minutes: 45, questions: 45, phase: "upcoming" },
  { id: "e2", name: "Đề kiểm tra giữa học kỳ I", subject: "Toán", time: "18:00", date: "12/12/2025", minutes: 45, questions: 45, phase: "upcoming" },
  { id: "e3", name: "Đề kiểm tra giữa học kỳ I", subject: "Toán", shift: "Ca 1", time: "18:00", date: "12/12/2025", minutes: 45, questions: 45, phase: "ongoing", joined: 100 },
  { id: "e4", name: "Đề kiểm tra giữa học kỳ I", subject: "Tiếng Việt", shift: "Ca 2", time: "18:00", date: "12/12/2025", minutes: 45, questions: 45, phase: "ongoing", joined: 100 },
  { id: "e5", name: "Đề kiểm tra giữa học kỳ I", subject: "Toán", time: "18:00", date: "12/12/2025", minutes: 45, questions: 45, phase: "ongoing", joined: 100 },
  { id: "e6", name: "Đề kiểm tra giữa học kỳ I", subject: "Toán", shift: "Ca 1", time: "18:00", date: "12/12/2025", minutes: 45, questions: 45, phase: "done", joined: 100, graded: false },
  { id: "e7", name: "Đề kiểm tra giữa học kỳ I", subject: "Toán", shift: "Ca 2", time: "18:00", date: "12/12/2025", minutes: 45, questions: 45, phase: "done", joined: 100, graded: false },
  { id: "e8", name: "Đề kiểm tra giữa học kỳ I", subject: "Tiếng Việt", time: "18:00", date: "12/12/2025", minutes: 45, questions: 45, phase: "done", joined: 100, graded: true },
];

function Page() {
  return <StudentExamsPage title="Kỳ thi chính thức" exams={EXAMS} />;
}
