import { createFileRoute } from "@tanstack/react-router";
import { TeacherHomeView } from "@/routes/index";

export const Route = createFileRoute("/gvcn")({
  head: () => ({
    meta: [
      { title: "Trang chủ Giáo viên chủ nhiệm | QLMS" },
      { name: "description", content: "Trang chủ dành cho giáo viên chủ nhiệm: lịch báo giảng tuần, lớp chủ nhiệm và thời khóa biểu." },
      { property: "og:title", content: "Trang chủ Giáo viên chủ nhiệm" },
      { property: "og:description", content: "Lịch báo giảng tuần và hoạt động lớp chủ nhiệm." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <TeacherHomeView role="homeroom" />,
});
