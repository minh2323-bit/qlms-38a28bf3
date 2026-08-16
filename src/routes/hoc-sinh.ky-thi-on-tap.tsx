import { createFileRoute } from "@tanstack/react-router";
import { StudentExamsPage, type StudentExam } from "@/components/StudentExamsPage";

export const Route = createFileRoute("/hoc-sinh/ky-thi-on-tap")({
  head: () => ({
    meta: [
      { title: "Kỳ thi ôn tập – Học sinh" },
      { name: "description", content: "Danh sách kỳ thi ôn tập: chưa diễn ra, đang diễn ra và đã kết thúc." },
      { property: "og:title", content: "Kỳ thi ôn tập – Học sinh" },
      { property: "og:description", content: "Luyện tập với các kỳ thi ôn tập và xem lại bài làm, điểm số." },
    ],
  }),
  component: Page,
});

// Kỳ thi ôn tập không có ca thi -> luôn hiển thị Thời gian bắt đầu
const EXAMS: StudentExam[] = [
  { id: "p1", name: "Đề ôn tập giữa học kỳ I", subject: "Toán", time: "18:00", date: "12/12/2025", minutes: 45, questions: 45, phase: "upcoming" },
  { id: "p2", name: "Đề ôn tập cuối học kỳ I", subject: "Tiếng Việt", time: "08:00", date: "20/12/2025", minutes: 40, questions: 30, phase: "upcoming" },
  { id: "p3", name: "Đề ôn tập giữa học kỳ I", subject: "Toán", time: "18:00", date: "12/12/2025", minutes: 45, questions: 45, phase: "ongoing", joined: 100 },
  { id: "p4", name: "Đề ôn tập chuyên đề Hình học", subject: "Toán", time: "14:00", date: "12/12/2025", minutes: 45, questions: 25, phase: "ongoing", joined: 78 },
  { id: "p5", name: "Đề ôn tập Đọc hiểu", subject: "Tiếng Việt", time: "09:00", date: "12/12/2025", minutes: 40, questions: 20, phase: "ongoing", joined: 64 },
  { id: "p6", name: "Đề ôn tập giữa học kỳ I", subject: "Toán", time: "18:00", date: "12/12/2025", minutes: 45, questions: 45, phase: "done", joined: 100, graded: true },
  { id: "p7", name: "Đề ôn tập đầu năm", subject: "Tiếng Anh", time: "18:00", date: "12/12/2025", minutes: 45, questions: 45, phase: "done", joined: 100, graded: false },
];

function Page() {
  return <StudentExamsPage title="Kỳ thi ôn tập" exams={EXAMS} />;
}
