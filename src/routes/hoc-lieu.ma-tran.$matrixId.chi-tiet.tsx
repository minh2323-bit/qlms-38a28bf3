import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { MatrixBuilder } from "@/components/MatrixBuilder";
import { getMatrix } from "@/lib/matrix-store";

export const Route = createFileRoute("/hoc-lieu/ma-tran/$matrixId/chi-tiet")({
  head: () => ({
    meta: [
      { title: "Chi tiết khung ma trận đề – QLMS" },
      { name: "description", content: "Xem và chỉnh sửa đầy đủ thông tin khung ma trận đề đã tạo." },
      { property: "og:title", content: "Chi tiết khung ma trận đề – QLMS" },
      { property: "og:description", content: "Xem và chỉnh sửa đầy đủ thông tin khung ma trận đề đã tạo." },
    ],
  }),
  component: Page,
});

function Page() {
  const { matrixId } = useParams({ from: "/hoc-lieu/ma-tran/$matrixId/chi-tiet" });
  const navigate = useNavigate();
  const matrix = getMatrix(matrixId);

  if (!matrix) {
    return (
      <AppShell role="teacher">
        <section className="bg-white rounded-xl border p-8 text-center">
          <p className="text-slate-600">Không tìm thấy khung ma trận.</p>
          <Button className="mt-4" onClick={() => navigate({ to: "/hoc-lieu/de-kiem-tra" })}>
            Về danh sách đề
          </Button>
        </section>
      </AppShell>
    );
  }

  return <MatrixBuilder key={matrix.id} existing={matrix} />;
}
