import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { TeacherHomeView } from "@/routes/index";
import { Users } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/hieu-truong/lich-bao-giang")({
  head: () => ({
    meta: [
      { title: "Lịch báo giảng – Hiệu trưởng | QLMS" },
      { name: "description", content: "Hiệu trưởng xem lịch báo giảng của bản thân và của từng giáo viên trong trường theo tuần học." },
      { property: "og:title", content: "Lịch báo giảng – Hiệu trưởng" },
      { property: "og:description", content: "Xem lịch báo giảng của bản thân và của từng giáo viên trong trường theo tuần học." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrincipalSchedule,
});

const PRINCIPAL = { id: "self", name: "Tôi (Hiệu trưởng) – Nguyễn Thị Hoa" };

const TEACHERS = [
  { id: "gv-hang", name: "Phùng Thúy Hằng · Tổ Toán" },
  { id: "gv-trang", name: "Nguyễn Thu Trang · Tổ Tiếng Việt" },
  { id: "gv-duc", name: "Lê Minh Đức · Tổ Tiếng Anh" },
  { id: "gv-ngoc", name: "Trần Bích Ngọc · Tổ Toán" },
  { id: "gv-son", name: "Hoàng Văn Sơn · Tổ Năng khiếu" },
  { id: "gv-huyen", name: "Đỗ Thanh Huyền · Tổ Tiếng Việt" },
  { id: "gv-hai", name: "Vũ Quang Hải · Tổ Tiếng Anh" },
];

function PrincipalSchedule() {
  const [teacherId, setTeacherId] = useState(PRINCIPAL.id);
  const seed = teacherId === PRINCIPAL.id ? 0 : TEACHERS.findIndex((t) => t.id === teacherId) + 1;

  return (
    <TeacherHomeView
      role="principal"
      teacherSeed={seed}
      teacherPicker={
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-slate-500 flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> Giáo viên:
          </span>
          <Select value={teacherId} onValueChange={setTeacherId}>
            <SelectTrigger className="h-9 w-72 text-[13px] bg-white">
              <SelectValue placeholder="Chọn giáo viên" />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              <SelectItem value={PRINCIPAL.id}>{PRINCIPAL.name}</SelectItem>
              {TEACHERS.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
    />
  );
}
