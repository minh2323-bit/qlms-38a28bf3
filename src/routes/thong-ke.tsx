import { createFileRoute } from "@tanstack/react-router";
import { TeachingStatsPage } from "@/components/TeachingStatsPage";

export const Route = createFileRoute("/thong-ke")({
  head: () => ({
    meta: [
      { title: "Thống kê hoạt động giảng dạy – QLMS" },
      { name: "description", content: "Tổng hợp hoạt động giảng dạy của bạn và kết quả học tập của học sinh theo từng lớp." },
      { property: "og:title", content: "Thống kê hoạt động giảng dạy – QLMS" },
      { property: "og:description", content: "Tổng hợp hoạt động giảng dạy của bạn và kết quả học tập của học sinh theo từng lớp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <TeachingStatsPage role="teacher" />,
});
