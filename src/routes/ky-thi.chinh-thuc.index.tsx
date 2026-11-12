import { createFileRoute } from "@tanstack/react-router";
import { OfficialExamsPage } from "@/components/exams/OfficialExamsPage";

export const Route = createFileRoute("/ky-thi/chinh-thuc/")({
  head: () => ({ meta: [
    { title: "Kỳ thi chính thức của trường | Tiểu học Tô Hiệu" },
    { name: "description", content: "Danh sách kỳ thi chính thức cấp trường và xã/phường, duyệt kỳ thi và phân công giáo viên." },
    { property: "og:title", content: "Kỳ thi chính thức của trường | Tiểu học Tô Hiệu" },
    { property: "og:description", content: "Danh sách kỳ thi chính thức cấp trường và xã/phường, duyệt kỳ thi và phân công giáo viên." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  validateSearch: (s: Record<string, unknown>): { focus?: string } => ({ focus: typeof s.focus === "string" ? s.focus : undefined }),
  component: OfficialExamsPage,
});