import { createFileRoute } from "@tanstack/react-router";
import { BookOpenCheck } from "lucide-react";
import { ExamSessionsPage } from "@/components/ExamSessionsPage";
import { PRACTICE_SESSIONS } from "@/lib/exam-sessions";

export const Route = createFileRoute("/ky-thi/on-tap")({
  head: () => ({
    meta: [
      { title: "Kỳ thi ôn tập | Tiểu học Tô Hiệu" },
      { name: "description", content: "Quản lý kỳ thi ôn tập cấp Trường, Xã/Phường và Sở: duyệt kỳ thi, giám sát và tra cứu kết quả luyện tập." },
      { property: "og:title", content: "Kỳ thi ôn tập" },
      { property: "og:description", content: "Quản lý kỳ thi ôn tập cấp Trường, Xã/Phường và Sở: duyệt kỳ thi, giám sát và tra cứu kết quả luyện tập." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ExamSessionsPage
      title="Kỳ thi ôn tập"
      subtitle="Danh sách các kỳ thi ôn tập theo cấp Trường, Xã/Phường và Sở GD&ĐT kèm thống kê kết quả luyện tập."
      icon={BookOpenCheck}
      data={PRACTICE_SESSIONS}
    />
  );
}
