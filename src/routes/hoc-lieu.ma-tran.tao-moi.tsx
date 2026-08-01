import { createFileRoute } from "@tanstack/react-router";
import { MatrixBuilder } from "@/components/MatrixBuilder";

export const Route = createFileRoute("/hoc-lieu/ma-tran/tao-moi")({
  head: () => ({
    meta: [
      { title: "Thêm khung ma trận đề – QLMS" },
      { name: "description", content: "Tạo khung ma trận đề kiểm tra theo bài học, mức độ nhận thức và phân bổ điểm." },
      { property: "og:title", content: "Thêm khung ma trận đề – QLMS" },
      { property: "og:description", content: "Tạo khung ma trận đề kiểm tra theo bài học, mức độ nhận thức và phân bổ điểm." },
    ],
  }),
  component: Page,
});

function Page() {
  return <MatrixBuilder />;
}
