import { Video, BookOpen, HelpCircle, Crown, FileText, ClipboardList, FileCheck2, Landmark } from "lucide-react";
import { matchesDtiOverview, gradesInLabel, type DtiOverviewFilter } from "@/lib/dti-overview-filter";
/* ---------------- Mock data ---------------- */
type Idx = {
  label: string; value: string; icon: typeof Video; color: string;
  sub?: string; growth?: number;
};

export const INDEXES: Idx[] = [
  { label: "Học liệu đã tải lên", value: "2.418", icon: Video, color: "bg-indigo-50 text-indigo-600", growth: 15 },
  { label: "Bài giảng", value: "864", icon: BookOpen, color: "bg-emerald-50 text-emerald-600", growth: 24 },
  { label: "Ngân hàng câu hỏi", value: "12.507", icon: HelpCircle, color: "bg-sky-50 text-sky-600", growth: 312 },
  {
    label: "Lượt sử dụng học liệu bản quyền", value: "1.236", icon: Crown, color: "bg-amber-50 text-amber-600",
    sub: "Số lượt sử dụng HLBQ để tạo bài tập, bài giảng, đề kiểm tra",
  },
  { label: "Đề kiểm tra", value: "512", icon: FileText, color: "bg-violet-50 text-violet-600", growth: 18 },
  { label: "Bài tập về nhà đã giao", value: "1.874", icon: ClipboardList, color: "bg-orange-50 text-orange-600", growth: 46 },
  { label: "Bài kiểm tra đã tạo", value: "946", icon: FileCheck2, color: "bg-rose-50 text-rose-600", growth: -8 },
  { label: "Kỳ thi đã tạo", value: "38", icon: Landmark, color: "bg-teal-50 text-teal-600" },
];

export const PIES: { title: string; data: { name: string; value: number }[]; unit?: string }[] = [
  {
    title: "Học liệu đóng góp theo tổ môn",
    data: [
      { name: "Tổ Toán", value: 34 }, { name: "Tổ Tiếng Việt", value: 28 },
      { name: "Tổ Tiếng Anh", value: 18 }, { name: "Tổ Năng khiếu", value: 12 },
      { name: "Tổ khác", value: 8 },
    ],
    unit: "%",
  },
  {
    title: "Ngân hàng câu hỏi đóng góp theo tổ môn",
    data: [
      { name: "Tổ Toán", value: 41 }, { name: "Tổ Tiếng Việt", value: 24 },
      { name: "Tổ Tiếng Anh", value: 21 }, { name: "Tổ Năng khiếu", value: 9 },
      { name: "Tổ khác", value: 5 },
    ],
    unit: "%",
  },
  {
    title: "Học liệu theo loại",
    data: [
      { name: "Video", value: 862 }, { name: "Bài giảng", value: 640 },
      { name: "Tài liệu", value: 512 }, { name: "Âm thanh", value: 218 },
      { name: "Scorm / IFrame", value: 186 },
    ],
  },
  {
    title: "Ngân hàng câu hỏi theo loại",
    data: [
      { name: "Trắc nghiệm", value: 5240 }, { name: "Đúng - Sai", value: 2180 },
      { name: "Điền khuyết", value: 1640 }, { name: "Nối / Kéo thả", value: 1520 },
      { name: "Trả lời ngắn", value: 1120 }, { name: "Tự luận", value: 807 },
    ],
  },
  {
    title: "Ngân hàng câu hỏi theo mức độ nhận thức",
    data: [
      { name: "Nhận biết", value: 4820 }, { name: "Thông hiểu", value: 4210 },
      { name: "Vận dụng", value: 2660 }, { name: "Vận dụng cao", value: 817 },
    ],
  },
];

/* ---------------- Học liệu bản quyền ---------------- */
export const HLBQ_PURPOSE = [
  { name: "Tạo bài giảng", value: 486 }, { name: "Tạo bài tập", value: 352 },
  { name: "Tạo đề kiểm tra", value: 264 }, { name: "Tạo kỳ thi", value: 134 },
];

export const HLBQ_FORMAT = [
  { name: "Bộ câu hỏi", value: 512 }, { name: "Video tương tác", value: 348 },
  { name: "Sách giáo viên", value: 376 },
];

export const HLBQ_ROWS = [
  { name: "Bộ câu hỏi Toán 3 - Ôn tập các số đến 1000", grade: "Khối 3", subject: "Toán", provider: "HEID", format: "Bộ câu hỏi", uses: 384 },
  { name: "Video tương tác Toán 3 - Bảng nhân 3, bảng chia 3", grade: "Khối 3", subject: "Toán", provider: "OLM", format: "Video tương tác", uses: 318 },
  { name: "Sách giáo viên Toán 4 - Phân số và phép tính", grade: "Khối 4", subject: "Toán", provider: "HEID", format: "Sách giáo viên", uses: 276 },
  { name: "Bộ câu hỏi Tiếng Anh 5 - My Family", grade: "Khối 5", subject: "Tiếng Anh", provider: "HEID", format: "Bộ câu hỏi", uses: 231 },
  { name: "Video tương tác Tiếng Việt 4 - Luyện từ và câu", grade: "Khối 4", subject: "Tiếng Việt", provider: "OLM", format: "Video tương tác", uses: 198 },
  { name: "Sách giáo viên Tiếng Việt 3 - Đọc hiểu văn bản", grade: "Khối 3", subject: "Tiếng Việt", provider: "HEID", format: "Sách giáo viên", uses: 164 },
  { name: "Bộ câu hỏi Tự nhiên và xã hội 4 - Cây xanh", grade: "Khối 4", subject: "Tự nhiên và xã hội", provider: "OLM", format: "Bộ câu hỏi", uses: 132 },
  { name: "Video tương tác Toán 4 - Tìm thành phần trong phép tính", grade: "Khối 4", subject: "Toán", provider: "HEID", format: "Video tương tác", uses: 96 },
].sort((a, b) => b.uses - a.uses);

export const MONTHLY = [
  { month: "T1", baiGiang: 62, baiTap: 128, kiemTra: 41 },
  { month: "T2", baiGiang: 74, baiTap: 156, kiemTra: 28 },
  { month: "T3", baiGiang: 112, baiTap: 198, kiemTra: 66 },
  { month: "T4", baiGiang: 98, baiTap: 172, kiemTra: 52 },
  { month: "T5", baiGiang: 136, baiTap: 246, kiemTra: 88 },
  { month: "T6", baiGiang: 128, baiTap: 214, kiemTra: 74 },
  { month: "T7", baiGiang: 84, baiTap: 132, kiemTra: 36 },
  { month: "T8", baiGiang: 156, baiTap: 288, kiemTra: 102 },
  { month: "T9", baiGiang: 182, baiTap: 324, kiemTra: 128 },
  { month: "T10", baiGiang: 164, baiTap: 302, kiemTra: 116 },
  { month: "T11", baiGiang: 148, baiTap: 276, kiemTra: 98 },
  { month: "T12", baiGiang: 132, baiTap: 238, kiemTra: 84 },
];

/** Stable mock grade/activity buckets preserve the original school totals. */
export function scopedSchoolValue(key: string, total: number, filter: DtiOverviewFilter) {
  const sign = Math.sign(total);
  const count = Math.abs(total);
  return Array.from({ length: 15 }, (_, i) => {
    const grade = i % 5 + 1;
    const value = Math.floor(count / 15) + (i < count % 15 ? 1 : 0);
    return matchesDtiOverview(`${key} · ${i}`, [grade], filter) ? value * sign : 0;
  }).reduce((sum, value) => sum + value, 0);
}

export function schoolStatisticsForFilter(filter: DtiOverviewFilter) {
  const scopedData = (key: string, data: { name: string; value: number }[]) => data.map(row => ({ ...row, value: scopedSchoolValue(`${key} · ${row.name}`, row.value, filter) }));
  return {
    indexes: INDEXES.map(row => ({ ...row, count: scopedSchoolValue(row.label, Number(row.value.replaceAll(".", "")), filter), change: row.growth === undefined ? 0 : scopedSchoolValue(row.label, row.growth, filter) })),
    pies: PIES.map(pie => {
      const data = scopedData(pie.title, pie.data);
      const total = data.reduce((sum, row) => sum + row.value, 0);
      return { ...pie, data: pie.unit === "%" ? data.map(row => ({ ...row, value: total ? Math.round(row.value / total * 1000) / 10 : 0 })) : data };
    }),
    monthly: MONTHLY.map((row, i) => ({
      month: row.month,
      baiGiang: scopedSchoolValue(`${row.month} · Bài giảng`, row.baiGiang, filter),
      hocLieu: scopedSchoolValue(`${row.month} · Học liệu`, [105, 120, 154, 132, 188, 174, 110, 226, 268, 244, 216, 198][i] ?? 0, filter),
      baiTap: scopedSchoolValue(`${row.month} · Bài tập`, row.baiTap, filter),
      kiemTra: scopedSchoolValue(`${row.month} · Bài kiểm tra`, row.kiemTra, filter),
    })),
    copyrightPurpose: scopedData("Mục đích HLBQ", HLBQ_PURPOSE),
    copyrightFormat: scopedData("Định dạng HLBQ", HLBQ_FORMAT),
    copyrightRows: HLBQ_ROWS.filter(row => matchesDtiOverview(row.name, gradesInLabel(row.grade), filter)),
  };
}

