import { createFileRoute } from "@tanstack/react-router";
import { Landmark } from "lucide-react";
import { ExamSessionsPage } from "@/components/ExamSessionsPage";
import { OFFICIAL_SESSIONS } from "@/lib/exam-sessions";

export const Route = createFileRoute("/ky-thi/chinh-thuc")({
  head: () => ({
    meta: [
      { title: "Kỳ thi chính thức | Tiểu học Tô Hiệu" },
      { name: "description", content: "Quản lý kỳ thi chính thức cấp Trường, Xã/Phường và Sở: duyệt kỳ thi, giám sát và tra cứu kết quả." },
      { property: "og:title", content: "Kỳ thi chính thức" },
      { property: "og:description", content: "Quản lý kỳ thi chính thức cấp Trường, Xã/Phường và Sở: duyệt kỳ thi, giám sát và tra cứu kết quả." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ExamSessionsPage
      title="Kỳ thi chính thức"
      subtitle="Danh sách các kỳ thi chính thức được tổ chức theo cấp Trường, Xã/Phường và Sở GD&ĐT."
      icon={Landmark}
      data={OFFICIAL_SESSIONS}
    />
  );
}
