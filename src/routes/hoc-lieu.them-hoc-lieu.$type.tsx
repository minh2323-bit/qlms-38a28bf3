import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  MaterialForm, MATERIAL_TYPE_LIST, type MaterialTypeKey,
} from "@/components/AddMaterialFlow";

const VALID: MaterialTypeKey[] = MATERIAL_TYPE_LIST.map((t) => t.key);

export const Route = createFileRoute("/hoc-lieu/them-hoc-lieu/$type")({
  head: () => ({
    meta: [
      { title: "Thêm học liệu mới | Tiểu học Tô Hiệu" },
      { name: "description", content: "Tạo học liệu mới cho kho học liệu." },
    ],
  }),
  component: ThemHocLieuPage,
});

function ThemHocLieuPage() {
  const { type } = Route.useParams();
  const navigate = useNavigate();
  const key = (VALID.includes(type as MaterialTypeKey) ? type : "video") as MaterialTypeKey;
  const meta = MATERIAL_TYPE_LIST.find((t) => t.key === key)!;
  const back = () => navigate({ to: "/hoc-lieu/kho-hoc-lieu" });

  return (
    <AppShell>
      <>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={back}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-700"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại Kho học liệu
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-sm font-semibold text-slate-700">
            Thêm học liệu: <span className="text-indigo-700">{meta.label}</span>
          </span>
        </div>
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <MaterialForm
            type={key}
            onClose={back}
            onSaved={() => back()}
          />
        </div>
      </>
    </AppShell>
  );
}
