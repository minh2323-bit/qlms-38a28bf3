import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { OfficialExamDetail } from "@/components/exams/OfficialExamDetail";

export const Route = createFileRoute("/ky-thi/chinh-thuc/$examId")({
  validateSearch: (search: Record<string, unknown>) => ({ tab: typeof search.tab === "string" && ["info", "papers", "students", "monitor", "grade", "results"].includes(search.tab) ? search.tab : "info" }),
  head: () => ({ meta: [
    { title: "Chi tiết kỳ thi chính thức | Tiểu học Tô Hiệu" },
    { name: "description", content: "Thông tin kỳ thi, ca thi, phân công giám sát, chấm bài và kết quả." },
    { property: "og:title", content: "Chi tiết kỳ thi chính thức | Tiểu học Tô Hiệu" },
    { property: "og:description", content: "Thông tin kỳ thi, ca thi, phân công giám sát, chấm bài và kết quả." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Page,
});
function Page() {
  const { examId } = Route.useParams(), { tab } = Route.useSearch();
  return <AppShell><OfficialExamDetail key={examId} examId={examId} initialTab={tab} /></AppShell>;
}