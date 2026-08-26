import { createFileRoute } from "@tanstack/react-router";
import { TeachingStatsPage } from "@/components/TeachingStatsPage";

export const Route = createFileRoute("/hieu-truong_/hoat-dong-ca-nhan")({
  head: () => ({
    meta: [
      { title: "Hoạt động giảng dạy cá nhân – Hiệu trưởng | QLMS" },
      { name: "description", content: "Thống kê hoạt động giảng dạy cá nhân của Hiệu trưởng với các lớp trực tiếp phụ trách: học liệu, bài giảng, bài kiểm tra và kết quả học sinh." },
      { property: "og:title", content: "Hoạt động giảng dạy cá nhân – Hiệu trưởng" },
      { property: "og:description", content: "Thống kê hoạt động giảng dạy cá nhân với các lớp Hiệu trưởng trực tiếp phụ trách." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <TeachingStatsPage role="principal" />,
});
